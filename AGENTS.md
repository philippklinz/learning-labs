# AGENTS.md — Learning Labs directory

## Your task

Maintain the central public index for independent learning laboratories, interactive atlases and future educational experiments. This repository does **not** contain those projects and must not become a shared runtime, framework, monorepo or mandatory navigation service for them.

The aim is personal learning and occasional public sharing, not a commercial product or SaaS.

## Current projects

- Early Earth: https://github.com/philippklinz/lab-early-earth
- Abiogenesis: https://github.com/philippklinz/lab-abiogenesis
- Molecular Biology (DNA/RNA): https://github.com/philippklinz/lab-molecular-biology
- Evolution: https://github.com/philippklinz/lab-evolution
- Human Origins: https://github.com/philippklinz/lab-human-origins
- Anthropology Atlas engine: https://github.com/philippklinz/anthropology-atlas-engine
- Anthropology Atlas research content: https://github.com/philippklinz/anthropology-atlas-content
- People Atlas engine: https://github.com/philippklinz/people-atlas-engine
- People Atlas biographical content: https://github.com/philippklinz/people-atlas-content
- Modern Objectivity design language: https://github.com/philippklinz/modern-objectivity-style

This list is a starting point, **not** an exhaustive list of permitted lab types.

## Architecture and conventions

- One static, standalone index.html in the repository root. The local `modern-objectivity.css` contains the imported reference style kit; project-specific CSS and filtering scripts are inline in `index.html` for ease of editing. No network assets are required.
- GitHub Pages serves main / (root); no backend, framework, bundler, accounts or build tools.
- Lab content belongs exclusively in each lab's own repository.
- Descriptive cross-links are optional. The numbered "Wissensreise" is an editorial path, not a required syllabus or technical dependency.
- Search and category filters enhance the index; keep every card and destination present in ordinary HTML so the directory works without JavaScript.
- Cards use data-tags and data-search attributes for filters. Existing categories are nature, human and atlas. Add more only when necessary.
- Avoid tracking, analytics, user accounts, third-party requests and auto-discovery APIs.

## Multilingual access planning

The authoritative requirement is [Modern Objectivity MO-13](https://github.com/philippklinz/modern-objectivity-style/blob/main/docs/10-multilingual-access.md), with a [central programming pattern](https://github.com/philippklinz/modern-objectivity-style/blob/main/guides/multilingual-pattern.md). It requires complete user-facing journeys in all 24 official EU languages. Keep only the application-specific inventory and adoption plan in [docs/MULTILINGUALISM.md](docs/MULTILINGUALISM.md); do not maintain a competing central specification here. The independent labs' migration is still planned, not automatically authorized by work on this directory. Distinguish target coverage, implemented editions, source freshness and review. Each lab keeps its own local runtime and translations, without a translation service, accounts or tracking.

## Visual style and accessibility

- Use the locally pinned Modern Objectivity stylesheet, its light and dark Signal colours, and the LiberationFontsWeb subsets in `fonts/liberation/`. Cards and controls have square corners. Buttons, search and card actions align on the shared control-height token.
- Maintain semantic HTML landmarks, descriptive links, keyboard-focus indications, correct aria-pressed states, readable contrast, responsive layout and reduced-motion support.
- Keep the scientific-exploration diagram explicitly schematic.
- The footer links to the live [Modern Objectivity style kit](https://philippklinz.github.io/modern-objectivity-style/). The locally copied `modern-objectivity.css` is the v0.1 draft reference implementation, not a global style mandate. Preserve stage-specific contrast and usage.

## Editing project entries

1. Verify repository existence and published Pages URL using available tools or browsing.
2. Check real status; use Concept for a landing-only project, In Entwicklung for one with active exhibits. Do not invent features.
3. Add or update the static card in index.html with title, summary, optional sequence number, status, category, data-tags, data-search, public URL and source URL.
4. Ensure atlases and projects beyond the five existing labs are also welcome.
5. Update readme and count-related copy when the directory grows.
6. Update optional journeys when useful, but never imply a linear scientific or historical inevitability.

## Checks before claiming completion

- Validate HTML structure, local anchors, project cards and external destination links.
- Check the in-page JS syntax and search, all category filters, empty-state reset and accessible button state.
- Check a mobile viewport and keyboard interaction when a browser is available.
- Distinguish GitHub Pages setting "enabled" from verified public page load. State any limitations honestly.
- Keep [LICENSE](LICENSE) unchanged (GNU GPL v2.0) and separately respect external project licenses.
- Do not edit or delete the independent labs as a side effect of editing this index.

Favor comprehensibility over abstraction and elaborate tooling.
