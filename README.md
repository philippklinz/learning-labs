# Learning Labs

Independent, interactive knowledge labs and atlases. This repository is a **static directory**, not a shared runtime, monorepo, learning-management system, or dependency of any lab.

Learning paths are optional editorial suggestions. Every lab and atlas remains a standalone project with its own GitHub repository, GitHub Pages publication, sources and development schedule.

## Current directory

| Project | Public site | Code | Current state |
| --- | --- | --- | --- |
| 01 · Die frühe Erde | [Site](https://philippklinz.github.io/lab-early-earth/) | [Repository](https://github.com/philippklinz/lab-early-earth) | In development — Proto-Erde 3D, Time Explorer and Trainer |
| 02 · Abiogenese | [Site](https://philippklinz.github.io/lab-abiogenesis/) | [Repository](https://github.com/philippklinz/lab-abiogenesis) | Six interactive labs — chemistry, molecules, protocells, RNA, hypotheses, evidence |
| 03 · DNA & RNA | [Site](https://philippklinz.github.io/lab-molecular-biology/) | [Repository](https://github.com/philippklinz/lab-molecular-biology) | Working prototype |
| 04 · Evolution | [Site](https://philippklinz.github.io/lab-evolution/) | [Repository](https://github.com/philippklinz/lab-evolution) | Six interactive sublabs, population models and evolutionary evidence |
| 05 · Entstehung des Menschen | [Site](https://philippklinz.github.io/lab-human-origins/) | [Repository](https://github.com/philippklinz/lab-human-origins) | Six interactive sublabs: fossils, bipedalism, tools, kinship, dispersal, evidence |
| Anthropology Atlas | [Atlas](https://philippklinz.github.io/anthropology-atlas-engine/) | [Engine](https://github.com/philippklinz/anthropology-atlas-engine) / [Content](https://github.com/philippklinz/anthropology-atlas-content) | Working development version |
| People Atlas | [Atlas](https://philipp-klinz.net/people-atlas-engine/) | [Engine](https://github.com/philippklinz/people-atlas-engine) / [Content](https://github.com/philippklinz/people-atlas-content) | Interactive timeline, combined categories and biographies in German and English |

**Concept** means a public landing page exists but the interactive exhibits have not been built yet. Status descriptions are maintained manually, not computed from GitHub.

## Run and publish

Open index.html directly in a browser or publish the root of main as a static GitHub Pages site. No npm, build step, backend, external fonts, accounts, analytics or service dependencies are required.

Public directory: https://philipp-klinz.net/learning-labs/

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

The directory follows the [Modern Objectivity style kit](https://philipp-klinz.net/modern-objectivity-style/). The local `modern-objectivity.css` and its `fonts/liberation/` folder come from [style kit revision 18a78bc](https://github.com/philippklinz/modern-objectivity-style/tree/18a78bc5509bf8407600e87c19b5825fbc6cbf63/starter). LiberationFontsWeb supplies local WOFF2 subsets for interface text, editorial headings and figures.

Cards have square corners. Buttons, search and project actions share a 2.75 rem outer height at the default text size. The directory uses the Signal accent in both themes. It follows the device theme until a reader chooses one with the header toggle. The browser stores that choice locally. Search and category controls enhance the static directory. All project links, journeys and the schematic diagram are available with JavaScript disabled.

## Multilingual access (planned)

Multilingual access is a central [Modern Objectivity requirement (MO-13)](https://github.com/philippklinz/modern-objectivity-style/blob/main/docs/10-multilingual-access.md): complete user-facing journeys in all 24 official EU languages. Its [programming pattern](https://github.com/philippklinz/modern-objectivity-style/blob/main/guides/multilingual-pattern.md) provides a local implementation reference. This repository keeps the [lab adoption plan](docs/MULTILINGUALISM.md), inventory and proposed rollout. The five existing labs still teach in German; Anthropology Atlas and People Atlas offer German and English.

## Working instructions

See [AGENTS.md](AGENTS.md).

## License

Portal source is distributed under the [GNU General Public License v2.0](LICENSE). Each independent project retains its own licensing and third-party obligations.

Liberation Sans Web, Serif Web and Mono Web use the [SIL Open Font License](fonts/liberation/LICENSE). Liberation Sans Narrow Web includes its [font exception](fonts/liberation/LICENSE-Sans-Narrow.txt) and [GPL terms](fonts/liberation/COPYING-Sans-Narrow). Upstream file hashes and credits are included in `fonts/liberation/`.
