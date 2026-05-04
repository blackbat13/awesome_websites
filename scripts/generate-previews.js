/**
 * Generate website preview screenshots for awesome_websites.
 *
 * Usage:
 *   npm install          (first time only)
 *   node scripts/generate-previews.js
 *
 * Options (env vars):
 *   FORCE=1              Re-generate screenshots that already exist.
 *   CONCURRENCY=3        How many browser tabs to run in parallel (default: 3).
 *   TIMEOUT=15000        Navigation timeout in ms (default: 15000).
 *
 * Screenshots are saved to assets/previews/ and should be committed to the repo.
 */

import puppeteer from "puppeteer";
import { readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_FILE = join(ROOT, "data", "websites.json");
const OUT_DIR = join(ROOT, "assets", "previews");

const FORCE = process.env.FORCE === "1";
const CONCURRENCY = parseInt(process.env.CONCURRENCY ?? "3", 10);
const TIMEOUT = parseInt(process.env.TIMEOUT ?? "15000", 10);

const VIEWPORT = { width: 1280, height: 720 };
const CLIP = { x: 0, y: 0, width: 1280, height: 720 };

// Must match the function in assets/app.js
function previewSlug(url) {
  return url
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/\/+$/, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

function previewPath(url) {
  return join(OUT_DIR, `${previewSlug(url)}.jpg`);
}

function readJsonFile(filePath) {
  const raw = readFileSync(filePath, "utf8");
  // PowerShell can write UTF-8 with BOM; strip it before parsing JSON.
  const withoutBom = raw.replace(/^\uFEFF/, "");
  return JSON.parse(withoutBom);
}

async function screenshot(page, entry) {
  const dest = previewPath(entry.url);
  if (!FORCE && existsSync(dest)) {
    console.log(`  skip  ${entry.name} (already exists)`);
    return;
  }

  try {
    await page.goto(entry.url, {
      waitUntil: "domcontentloaded",
      timeout: TIMEOUT,
    });
    // Brief pause to let fonts / above-fold images settle
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({
      path: dest,
      type: "jpeg",
      quality: 82,
      clip: CLIP,
    });
    console.log(`  saved ${entry.name}`);
  } catch (err) {
    console.warn(`  error ${entry.name}: ${err.message}`);
  }
}

async function processQueue(browser, entries) {
  const queue = [...entries];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) {
      const entry = queue.shift();
      const page = await browser.newPage();
      await page.setViewport(VIEWPORT);
      // Block heavy third-party resources to speed things up
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const type = req.resourceType();
        if (["media", "font"].includes(type)) {
          req.abort();
        } else {
          req.continue();
        }
      });
      try {
        await screenshot(page, entry);
      } finally {
        await page.close();
      }
    }
  });
  await Promise.all(workers);
}

async function main() {
  const websites = readJsonFile(DATA_FILE);
  mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Generating previews for ${websites.length} websites…`);
  console.log(`Output: ${OUT_DIR}`);
  console.log(`Concurrency: ${CONCURRENCY}, Timeout: ${TIMEOUT}ms, Force: ${FORCE}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    await processQueue(browser, websites);
  } finally {
    await browser.close();
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
