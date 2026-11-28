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
| Maths Atlas | [Atlas](https://philipp-klinz.net/maths-atlas-engine/) | [Engine](https://github.com/philippklinz/maths-atlas-engine) / [Content](https://github.com/philippklinz/maths-atlas-content) | Step-by-step proofs in German and a mind map connecting mathematical concepts and theorems |

**Concept** means a public landing page exists but the interactive exhibits have not been built yet. Status descriptions are maintained manually, not computed from GitHub.

## Run and publish

Open `index.html` (Deutsch) or `en.html` (English) directly in a browser. GitHub Pages serves these committed files from the root of main. Both editions include the complete directory, language menu and journeys in ordinary HTML. Publication requires no build step.

Public directory: https://philipp-klinz.net/learning-labs/

To activate Pages if needed: Settings > Pages > Deploy from a branch > main > /(root).

## Add a new lab or atlas

1. Confirm the source repository and public website exist. Do not invent URLs or describe unfinished features as working.
2. Add the card to `templates/directory.html`. Give it a stable `data-project` ID, an illustration, its public and source links, and the appropriate `data-tags` from `nature`, `human` and `atlas`.
3. Add the title, category, description and search vocabulary under that ID in each file in `locales/`. The directory counts and filters the cards in the current edition.
4. Refresh the published HTML using the editing instructions below. Keep this directory list current.

## Edit a journey or language edition

Each edition has an independent ordered list in `journeys/<language>.json`. Each journey has an English ID, a displayed title and an ordered list of stops. Each stop has its own ID, `projectId`, title, question and a complete destination URL, including any chapter or fragment. The first journey is expanded on arrival. Additional journeys appear as disclosures in file order. Reuse a journey ID across editions when it represents the same route.

German and English currently offer *From early Earth to humans*. The first five stops open German lab activities. The sixth opens the Anthropology Atlas chapter *The Cradle of Humankind* in the selected language. Replace individual English stop URLs as those activities become available.

The two pages share `templates/directory.html`, `directory.css`, the interaction scripts and the Humboldt drawing. UI text is maintained in `locales/<language>.json`. For a new edition, add a UI catalogue with the language's native name, translated search and plural forms, and its own journey file. The language menu and alternate links are generated from the available editions. Direct links such as `en.html#journey-early-earth-to-humans` work on Pages and in a downloaded copy.

After an editorial change, run `node tools/render-directory.mjs` and commit the rendered HTML with its sources. The maintenance script uses only Node's standard library. Run `node tools/render-directory.mjs --check` to check for drift. When German UI copy changes, review affected translations and update their `sourceRevision` with the value printed by `node tools/render-directory.mjs --source-revision`. Each editor curates the journeys independently of this UI fingerprint.

The portal is a **human-readable index**. It should never download the labs' contents or become a technical requirement for their operation.

## Design

The directory follows the [Modern Objectivity style kit](https://philipp-klinz.net/modern-objectivity-style/). The local `modern-objectivity.css` and its `fonts/liberation/` folder come from [style kit revision 18a78bc](https://github.com/philippklinz/modern-objectivity-style/tree/18a78bc5509bf8407600e87c19b5825fbc6cbf63/starter). LiberationFontsWeb supplies local WOFF2 subsets for interface text, editorial headings and figures.

Cards have square corners. Buttons, search and project actions share a 2.75 rem outer height at the default text size. The directory uses the Signal accent in both themes. It follows the device theme until a reader chooses one with the header toggle. The browser stores that choice locally. Search and category controls enhance the static directory. All project links, journeys and the star atlas are available with JavaScript disabled.

Each project card contains an inline SVG illustration. Hovering over the card or focusing one of its links with the keyboard starts a short repeating study. The drawing eases back to its original pose when the interaction ends. Reduced motion, forced colours and browsing with JavaScript disabled show the complete still illustrations.

The 1.8-second hero opens in darkness. A pulse at the XYZ origin reveals three coordinate planes. Stars move apart and two spiral galaxies emerge at different depths. Each galaxy has a procedural disk of gas and dust, a stellar bulge and a three-dimensional population of stars. The arms turn in their own inclined planes at one degree per second for the near galaxy and half a degree per second for the far one.

After the opening, drag the sky or swipe sideways to turn the whole atlas around the origin. Vertical swipes scroll the page. With the atlas focused, the arrow keys turn it and Home restores the initial view. The player pauses outside the viewport and in background tabs. Reduced motion, forced colours, local files and unavailable WebGL use the static atlas with its original galaxy illustrations. Both views draw on the same star catalogue. After changing `hero/star-field.js`, regenerate the static stars with `node tools/render-star-field.mjs`.

The original [crystal study](hero/crystal.html) can be opened on its own. Serve it over HTTP to see the crystals grow from their shared foot at the origin, or open the file directly for the finished still. Its renderer, growth controller, geometry, seed and full-grown still remain in `hero/`, alongside the Chladni plate and dye vortex studies. The two vendored ES modules come from the [Three.js r180 distribution](https://github.com/mrdoob/three.js/tree/r180/build) and include its [MIT license](vendor/three/LICENSE).

## Multilingual access

German and English cover the directory, search, filters, access labels and first curated journey. The five independent lab activities currently teach in German. The Anthropology Atlas and People Atlas offer both languages. The remaining directory editions are planned under [MO-13](https://github.com/philippklinz/modern-objectivity-style/blob/main/docs/10-multilingual-access.md). See the [adoption plan](docs/MULTILINGUALISM.md) for coverage and review.

## Working instructions

See [AGENTS.md](AGENTS.md).

## License

Portal source is distributed under the [GNU General Public License v2.0](LICENSE). Each independent project retains its own licensing and third-party obligations.

Liberation Sans Web, Serif Web and Mono Web use the [SIL Open Font License](fonts/liberation/LICENSE). Liberation Sans Narrow Web includes its [font exception](fonts/liberation/LICENSE-Sans-Narrow.txt) and [GPL terms](fonts/liberation/COPYING-Sans-Narrow). Upstream file hashes and credits are included in `fonts/liberation/`.
