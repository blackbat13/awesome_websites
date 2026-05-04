const state = {
  websites: [],
  query: "",
  category: "all",
  selectedTags: new Set(),
};

const elements = {
  searchInput: document.getElementById("searchInput"),
  categorySelect: document.getElementById("categorySelect"),
  tagList: document.getElementById("tagList"),
  cards: document.getElementById("cards"),
  resultCount: document.getElementById("resultCount"),
  cardTemplate: document.getElementById("cardTemplate"),
};

function normalizeEntry(entry) {
  const normalizedTags = Array.isArray(entry.tags)
    ? entry.tags
    : typeof entry.tags === "string" && entry.tags.length > 0
      ? [entry.tags]
      : [];

  return {
    name: entry.name || getDomain(entry.url),
    url: entry.url,
    category: entry.category || "Other",
    tags: normalizedTags,
    description: entry.description || "No description yet.",
  };
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function previewImageUrl(url) {
  return `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=900&h=500`;
}

function faviconUrl(url) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(getDomain(url))}&sz=128`;
}

function createCard(entry) {
  const fragment = elements.cardTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".card");
  const image = fragment.querySelector(".card-preview");
  const category = fragment.querySelector(".card-category");
  const title = fragment.querySelector(".card-title");
  const description = fragment.querySelector(".card-description");
  const tags = fragment.querySelector(".card-tags");
  const link = fragment.querySelector(".card-link");

  image.src = previewImageUrl(entry.url);
  image.alt = `${entry.name} website preview`;
  image.addEventListener(
    "error",
    () => {
      image.src = faviconUrl(entry.url);
      image.style.objectFit = "contain";
      image.style.padding = "22px";
      image.style.background = "#f8f4ea";
    },
    { once: true }
  );

  category.textContent = entry.category;
  title.textContent = entry.name;
  description.textContent = entry.description;
  link.href = entry.url;

  entry.tags.slice(0, 6).forEach((tag) => {
    const chip = document.createElement("span");
    chip.className = "card-tag";
    chip.textContent = `#${tag}`;
    tags.appendChild(chip);
  });

  card.dataset.category = entry.category;
  return fragment;
}

function renderTagFilters() {
  const allTags = [...new Set(state.websites.flatMap((item) => item.tags))].sort((a, b) =>
    a.localeCompare(b)
  );

  elements.tagList.innerHTML = "";
  allTags.forEach((tag) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tag-btn";
    btn.textContent = `#${tag}`;
    btn.dataset.tag = tag;
    btn.setAttribute("role", "listitem");

    btn.addEventListener("click", () => {
      if (state.selectedTags.has(tag)) {
        state.selectedTags.delete(tag);
      } else {
        state.selectedTags.add(tag);
      }
      btn.classList.toggle("active", state.selectedTags.has(tag));
      renderCards();
    });

    elements.tagList.appendChild(btn);
  });
}

function renderCategoryOptions() {
  const categories = [...new Set(state.websites.map((item) => item.category))].sort((a, b) =>
    a.localeCompare(b)
  );

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    elements.categorySelect.appendChild(option);
  });
}

function matchesFilters(entry) {
  const query = state.query.trim().toLowerCase();
  const inQuery =
    query.length === 0 ||
    `${entry.name} ${entry.url} ${entry.category} ${entry.description} ${entry.tags.join(" ")}`
      .toLowerCase()
      .includes(query);

  const inCategory = state.category === "all" || entry.category === state.category;
  const inTags = [...state.selectedTags].every((tag) =>
    entry.tags.map((item) => item.toLowerCase()).includes(tag.toLowerCase())
  );

  return inQuery && inCategory && inTags;
}

function renderCards() {
  const matched = state.websites.filter(matchesFilters);
  elements.cards.innerHTML = "";

  if (matched.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No websites matched your filters. Try clearing one or two tags.";
    elements.cards.appendChild(empty);
  } else {
    matched.forEach((entry) => {
      elements.cards.appendChild(createCard(entry));
    });
  }

  elements.resultCount.textContent = `${matched.length} of ${state.websites.length} websites shown`;
}

async function initialize() {
  try {
    const response = await fetch("data/websites.json");
    if (!response.ok) {
      throw new Error(`Unable to load data: ${response.status}`);
    }

    const data = await response.json();
    state.websites = data.map(normalizeEntry).sort((a, b) => a.name.localeCompare(b.name));

    renderCategoryOptions();
    renderTagFilters();
    renderCards();
  } catch (error) {
    elements.resultCount.textContent = "Failed to load websites data.";
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "The dataset could not be loaded. Check that data/websites.json exists and is valid JSON.";
    elements.cards.replaceChildren(empty);
    console.error(error);
  }
}

elements.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderCards();
});

elements.categorySelect.addEventListener("change", (event) => {
  state.category = event.target.value;
  renderCards();
});

initialize();
