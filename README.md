# Learning Labs

Independent, interactive knowledge labs and atlases. This repository is a **static directory**, not a shared runtime, monorepo, learning-management system, or dependency of any lab.

Learning paths are optional editorial suggestions. Every lab and atlas remains a standalone project with its own GitHub repository, GitHub Pages publication, sources and development schedule.

## Current directory

| Project | Public site | Code | Current state |
| --- | --- | --- | --- |
| 01 · Die frühe Erde | [Site](https://philippklinz.github.io/lab-early-earth/) | [Repository](https://github.com/philippklinz/lab-early-earth) | Concept |
| 02 · Abiogenese | [Site](https://philippklinz.github.io/lab-abiogenesis/) | [Repository](https://github.com/philippklinz/lab-abiogenesis) | Concept |
| 03 · DNA & RNA | [Site](https://philippklinz.github.io/lab-molecular-biology/) | [Repository](https://github.com/philippklinz/lab-molecular-biology) | Working prototype |
| 04 · Evolution | [Site](https://philippklinz.github.io/lab-evolution/) | [Repository](https://github.com/philippklinz/lab-evolution) | Concept |
| 05 · Entstehung des Menschen | [Site](https://philippklinz.github.io/lab-human-origins/) | [Repository](https://github.com/philippklinz/lab-human-origins) | Concept |
| Anthropology Atlas | [Atlas](https://philippklinz.github.io/anthropology-atlas-engine/) | [Engine](https://github.com/philippklinz/anthropology-atlas-engine) / [Content](https://github.com/philippklinz/anthropology-atlas-content) | Working development version |

**Concept** means a public landing page exists but the interactive exhibits have not been built yet. Status descriptions are maintained manually, not computed from GitHub.

## Run and publish

Open index.html directly in a browser or publish the root of main as a static GitHub Pages site. No npm, build step, backend, external fonts, accounts, analytics or service dependencies are required.

Expected Pages address: https://philippklinz.github.io/learning-labs/

To activate Pages if needed: Settings > Pages > Deploy from a branch > main > /(root).

## Add a new lab or atlas

1. Confirm the source repository and public website exist. Do not invent URLs or describe unfinished features as working.
2. In index.html, copy an article with class "card" in the "#project-cards" section and update name, description, public link, GitHub link and honest status.
3. Set data-tags to one or more of "nature", "human", "atlas". Set data-search for additional search terms.
4. The existing in-page JavaScript automatically handles filtering and counting; no JSON service or build is needed.
5. Add a new optional knowledge journey stop only if there is a meaningful relationship, not just because a project exists.
6. Keep this README and any static marketing copy up to date.

The portal is a **human-readable index**. It should never download the labs' contents or become a technical requirement for their operation.

## Design

Modern Objectivity: graphite, warm near-white, signal turquoise (#009E98), calm typography and semantic scientific visuals. The dedicated design repository is [modern-objectivity-style](https://github.com/philippklinz/modern-objectivity-style). The portal footer links to that repository **while its own website is still in development**. Switch to its published GitHub Pages address only after verification.

The landing page uses a single self-contained index.html. Search and filters are progressive enhancement; project cards and links remain readable without JavaScript. The numbered diagram is schematic, not empirical research data.

## Working instructions

See [AGENTS.md](AGENTS.md).

## License

Portal source is distributed under the [GNU General Public License v2.0](LICENSE). Each independent project retains its own licensing and third-party obligations.
