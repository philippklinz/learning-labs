# Multilingual Learning Labs

Status: requirements and implementation proposal, 24 November 2026. This document records the agreed goal; the rollout below is a recommendation for a subsequent implementation task. Publishing this plan does not add language support to the live sites.

## Goal and scope

Make the learning labs understandable and usable in all **24 official EU languages**. Language access covers the learning experience, including explanations, experiments and feedback.

**STATIC BY DESIGN · OPEN ACCESS · OPEN SOURCE · NO ACCOUNTS · NO TRACKING**

Translations ship with each independent repository under its existing licensing arrangements. Each lab remains usable without the portal or another lab. Reading, using and downloading a translation requires no account, subscription or translation service. The 24 languages are the initial coverage target; additional languages remain welcome.

The current scope is the five labs and their directory. The Anthropology Atlas already offers German and English according to the project brief. It shares the wider language-access goal, but its existing engine/content localization needs a separate assessment before adding languages; this plan does not prescribe replacing it.

### Current inventory

Snapshot of repository `main` trees inspected on 24 November 2026. Counts include each repository's start page and exclude the Atlas.

| Repository | HTML pages | Translation work beyond ordinary HTML |
| --- | ---: | --- |
| [learning-labs](https://github.com/philippklinz/learning-labs) | 1 | Search terms, filters, counts, project cards and overview SVG |
| [lab-early-earth](https://github.com/philippklinz/lab-early-earth) | 6 | Timeline data labels, 36 geological portraits, trainer feedback, 3D explanations, SVGs and numerical output |
| [lab-abiogenesis](https://github.com/philippklinz/lab-abiogenesis) | 7 | Chemistry controls, molecular diagrams, RNA exercises, hypotheses and evidence feedback |
| [lab-molecular-biology](https://github.com/philippklinz/lab-molecular-biology) | 9 | Glossary/search, inline scripts, DNA/RNA views, sequence exercises and shared navigation |
| [lab-evolution](https://github.com/philippklinz/lab-evolution) | 7 | Population charts, trees, transition narratives and evidence exercises |
| [lab-human-origins](https://github.com/philippklinz/lab-human-origins) | 7 | Fossil/specimen data, diagrams, map labels, quizzes and generated descriptions |
| **Total** | **37** | **36 lab pages plus the directory** |

The five labs currently use German as their teaching language. Some headings and technical terms are already English; that does not constitute an English edition. Text is distributed across HTML, JavaScript and data objects. Recheck each repository before editing: the labs continue to develop independently, especially the Early Earth exhibits.

### Target languages

Use language tags rather than country flags. Show names in their own language in the selector. These tags identify the language; regional variants can be added when there is a concrete need.

| Language | Selector name | Tag |
| --- | --- | --- |
| Bulgarian | Български | `bg` |
| Croatian | Hrvatski | `hr` |
| Czech | Čeština | `cs` |
| Danish | Dansk | `da` |
| Dutch | Nederlands | `nl` |
| English | English | `en` |
| Estonian | Eesti | `et` |
| Finnish | Suomi | `fi` |
| French | Français | `fr` |
| German | Deutsch | `de` |
| Greek | Ελληνικά | `el` |
| Hungarian | Magyar | `hu` |
| Irish | Gaeilge | `ga` |
| Italian | Italiano | `it` |
| Latvian | Latviešu | `lv` |
| Lithuanian | Lietuvių | `lt` |
| Maltese | Malti | `mt` |
| Polish | Polski | `pl` |
| Portuguese | Português | `pt` |
| Romanian | Română | `ro` |
| Slovak | Slovenčina | `sk` |
| Slovenian | Slovenščina | `sl` |
| Spanish | Español | `es` |
| Swedish | Svenska | `sv` |

## What a translated module includes

- Navigation, page title, metadata, introductions, teaching passages, glossary definitions and contextual help.
- Every control, option, tooltip, validation message, empty state, quiz answer, explanation and feedback path.
- Diagram labels, legends, axes, SVG descriptions, Canvas/3D annotations and equivalent accessible descriptions. Text embedded in images needs a replaceable label layer or a localized asset.
- Screen-reader labels, alternative text, live announcements, keyboard instructions and the actual document language.
- Search terms and glossary aliases, so learners can find concepts in the selected language.
- Number/date formatting and complete plural-aware messages. Calculations retain their original numeric values, units, precision and scientific meaning.

Formulae, nucleotide sequences, stable IDs, taxonomic names and citation identifiers remain scientifically intact. Translate the explanation around them. Keep source titles and quotations in their original language unless a translation is explicitly identified. External research papers need not be translated for a module to be available; indicate their language where useful. User-authored notes are preserved as written.

Keep the same concepts, uncertainty, level of detail and learning tasks in each language. An easier or shorter explanation is a separate editorial choice, not an implicit side effect of translation.

## Recommended implementation

### Small, local language packs

Use a small plain-JavaScript helper and locally stored, module-sized language packs in each repository. The helper and conventions may be copied between labs; there is no shared remote runtime, CDN or mandatory framework. A lab loads only its common messages and the current module's selected language.

For the initial migration, German remains the source language. Keep readable German HTML as the baseline. Give static text and translatable attributes stable semantic keys, such as `chemistry.prediction.feedback.correct`. Move dynamically produced text behind the same keyed lookup with its German source wording. Language packs contain translations and plural variants; models, datasets, coordinates, answer IDs and arithmetic remain shared.

Avoid maintaining 24 copies of each experiment's implementation. Also avoid translating by matching arbitrary rendered German strings: identical words can have different meanings, and dynamically generated states need explicit coverage.

Suggested local files are `i18n.js`, `locales/manifest.js`, `locales/<tag>/common.js` and `locales/<tag>/<module>.js`. These are proposed names, to be confirmed in the pilot. Classic local script packs containing data allow direct-file use without relying on `fetch()` of JSON over `file://`. Language files must not contain independent application logic. Local checking/extraction tools may help authors; serving the checked-in site must require no build step or service.

Translate complete messages with named placeholders, rather than concatenating sentence fragments. Use `Intl.PluralRules` for grammatical number and locale-aware number formatting. Insert ordinary text as text; handle links and emphasis through explicit safe content slots. Never interpolate learner input into translated HTML. A source-inventory check should catch missing keys, changed defaults and placeholder mismatches.

### Selection, navigation and state

- Provide a keyboard-accessible language selector on every page, using native names and an accessible label.
- Use a shareable query parameter, for example `01_praebiotische_chemie.html?lang=en`. Existing filenames, other parameters and section hashes remain valid. A URL without a language keeps the current German default during migration.
- Retain the selected language in chapter and return links. Cross-lab links can carry the same preference once the destination supports it; the Atlas needs an adapter to its actual existing routing convention.
- Use an explicit allowlist for language codes and local pack paths. An unsupported code must produce a usable page and a clear fallback notice.
- Change the displayed language without resetting slider values, selections, entered sequences, notes, trainer progress or simulation results. Re-render labels from the current state; do not rerun randomness merely to translate an output.
- No account, cookie, new local-storage preference or location lookup is needed. The URL carries the choice. Existing lab-specific progress/notes storage stays governed by that lab's current rules.
- Set `html lang` to the language actually displayed. Mark foreign-language passages where needed. Update accessible text together with visible text.

Keep packs local and compatible with downloaded copies. This change must not introduce online translation calls. Existing offline limitations, if any, should be documented separately rather than hidden by a claim that localization makes the whole lab offline-capable.

### Missing or unavailable translations

Release translations by **whole module**, including the shared controls it uses. A lab may therefore have some modules available in a language before the entire lab is complete. Its overview should show that coverage honestly.

On a direct request for an unavailable module language, show the German source module with a short, localized notice and links to available languages. Set the document language to German. Never present an untranslated module under a false language label. A pack that fails to load must leave a usable source page; a failed language switch should preserve the current state and report the problem accessibly.

Without JavaScript, the existing German HTML remains readable and correctly labelled. The proposed first version does **not** provide translated no-JavaScript HTML or independently indexed static pages for each language. If either becomes a requirement, generate checked-in localized HTML from the same messages as a separate extension; do not promise it for the query-parameter approach.

## Translation quality and maintenance

Maintain a compact status record per module and language: `planned`, `draft` or `available`, plus the source revision and an independent review note. `Available` means the complete learning experience has passed content and functional checks; it does not imply professional or native-speaker certification. Draft files may be contributed through GitHub, but are not offered as finished language editions.

AI-assisted translation is appropriate. Record it honestly and check meaning, terminology and scientific qualifications. A second review is useful evidence, not a guarantee. Record human or specialist review only when it actually happened; no requirement for paid translators is introduced.

Use a small subject glossary to keep concepts consistent across modules and labs. Include context and known ambiguities, for example biological “translation” versus language translation, evidence versus proof, or ancestry versus direct parentage. Keep the relevant glossary with each lab; a central reference document may coordinate wording without becoming a runtime dependency.

When source content changes, identify affected keys/modules using source-text fingerprints and a recorded commit. Mark affected translations as needing an update and stop counting them as current until reconciled. Styling-only edits should not invalidate translations. Changes to model assumptions require an explicit translation check even if the visible wording was overlooked. Never silently combine a revised scientific claim with an outdated explanation in another language.

For each translation, preserve caveats, dates, signs, decimal values, units, answer correctness and source links. Review the rendering as well as the wording: long text, Greek/Cyrillic characters and language-specific plurals can expose problems that English alone misses. Preserve existing licenses and third-party notices.

## Proposed rollout

The user chose planning first. The following order is recommended, not an instruction to begin implementation automatically.

| Step | Deliverable | Completion condition |
| --- | --- | --- |
| 1. Pilot | Abiogenesis module 01 in German and English, with its shared navigation, source keys, local packs and coverage record | The concentration exercise, feedback, SVG labels and accessible descriptions work in both languages; switching preserves values |
| 2. Validate the pattern | Sample Greek, Bulgarian and Polish messages in the pilot's development checks | Character coverage, text expansion and plural handling work; samples are not advertised as complete translations |
| 3. Complete the first lab | All six Abiogenesis modules and its start page in English | Whole-lab coverage is current and checked; German behavior is preserved |
| 4. Apply to the remaining labs and portal | Full English editions, one repository at a time | Each repository has its own working language packs and documented coverage; concurrent exhibit work is preserved |
| 5. Extend language coverage | Additional complete module/lab editions until all 24 languages are covered | Use the same content, terminology and checks; never add empty language options to imply completion |
| 6. Atlas expansion | Assessment and extension of the existing Atlas localization | Engine UI and research content follow their current contracts; sources and maps remain intact |

The pilot is deliberately small but includes prose, controls, a generated diagram, a computed result and feedback. It can reveal integration problems before they are repeated across 37 pages. The order among the remaining labs and additional languages can be chosen later; no three-year deadline or fixed language-priority ranking is attached to this plan.

For new modules, give teaching text stable keys from the beginning and keep model data separate. Each new source addition must update translation coverage rather than silently appearing in German inside another language. Translate complete lessons progressively; the architecture should support all target languages from the start without requiring all translations before the next useful release.

## Completion checks for implementation

1. Inventory static and dynamic text, including all exercise outcomes, accessible attributes, graphics and search content. Account explicitly for intentionally untranslated scientific names and source titles.
2. Check required keys, placeholders, plural variants, source freshness and usable fallback behavior for each published module/language. A count of translated keys alone is insufficient evidence of quality.
3. Verify language switching, deep links, back/forward navigation, cross-chapter links and preservation of simulation state. Test unavailable language codes and a missing pack.
4. Run each repository's existing interaction and layout checks. Add checks that a language change preserves the same numerical results and answer logic. Inspect representative screens at mobile and desktop sizes, with keyboard use and long/Greek/Cyrillic text.
5. Verify that localization adds no remote services, telemetry, accounts or new persistence. Test the static deployment and the previously supported local-file path; state any existing limitations accurately.
6. Mark a **lab** complete in a language only when its start page, every included module and shared controls are current and available. The 24-language goal is complete only when this holds for every in-scope lab and the portal; report the Atlas separately until its expansion is included and verified.

## References

- European Union, [Languages](https://european-union.europa.eu/principles-countries-history/languages_en): official list of 24 EU languages, checked 24 November 2026.
- W3C Internationalization, [Declaring language in HTML](https://www.w3.org/International/questions/qa-html-language-declarations): document and passage language tags.
- MDN, [Intl.PluralRules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules): locale-specific plural categories.
- Implementation inventory: the six linked repositories, their root HTML/JavaScript files and `AGENTS.md` instructions inspected for this plan. It is a planning snapshot, not a claim of completed localization or browser validation.
