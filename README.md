# Awesome Websites Explorer

<p align="center">
  <a href="https://awesome.re">
    <img src="https://awesome.re/badge.svg" alt="Awesome" />
  </a>
  <img src="https://img.shields.io/badge/Static%20Site-GitHub%20Pages-0f766e" alt="Static site" />
  <img src="https://img.shields.io/badge/Data-JSON-c97f3d" alt="JSON data" />
</p>

A curated collection of websites that deserve more attention.

The goal of this project is to showcase hidden gems from the Internet in a clean, searchable, and easy-to-contribute format.

Live website: [https://blackbat13.github.io/awesome_websites/](https://blackbat13.github.io/awesome_websites/)

The project is fully static (no backend) and stores entries in JSON so updates stay simple.

## Features

- Search by name, URL, category, description, and tags
- Category filter
- Multi-tag filtering
- Rich card layout with website preview image (with favicon fallback)
- Data-driven content from JSON

## Project Structure

- index.html: page markup
- assets/styles.css: styling and responsive layout
- assets/app.js: filtering logic and rendering
- data/websites.json: editable website entries

## Contributing

Contributions are welcome.

### Add A New Website

1. Open `data/websites.json`.
2. Add a new object to the top-level array.
3. Follow the existing schema:

```json
{
  "name": "Example",
  "url": "https://example.com",
  "category": "Tools",
  "tags": ["productivity", "online"],
  "description": "Short summary shown on the card"
}
```

4. Keep descriptions concise and useful.
5. Use lowercase tags where possible and avoid duplicates.
6. Reuse an existing category when it fits to keep filtering consistent.
7. Make sure `url` is a valid `https://` link.

### Data Guidelines

- `name`: clear, human-readable website name
- `url`: full website link
- `category`: high-level group used by category filter
- `tags`: searchable keywords
- `description`: short preview text shown on cards

### Suggested Contribution Workflow

1. Fork the repository.
2. Create a feature branch for your changes.
3. Update `data/websites.json`.
4. Preview locally (optional) and verify search/filter behavior.
5. Open a pull request with a short summary of what you added.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
