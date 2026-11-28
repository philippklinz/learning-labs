# Multilingual Learning Labs — Adoption Plan

Directory delivery updated 28 November 2026. The independent labs' inventory below records the 24 November snapshot.

## Directory editions

German (`index.html`) and English (`en.html`) include the complete directory, metadata, accessible names, search vocabulary, result counts, Humboldt guide and first six-stop route. These static files share a template and local catalogues. The edition URLs work with JavaScript disabled and with local files. The source revision in each translated UI catalogue records which German copy it follows. The English copy is AI-assisted and awaits independent language review.

Editors maintain journeys separately for each language in `journeys/`. In both editions, the first five stops open German lab activities. The sixth stop opens the Anthropology Atlas chapter in the reader's language. Additional EU editions and translated lab activities are future work. See the [editing instructions](../README.md#edit-a-journey-or-language-edition).

## Central requirement and implementation reference

Multilingual access belongs to the **Modern Objectivity design language**. Its authoritative requirement is [MO-13: Multilingual Access](https://github.com/philippklinz/modern-objectivity-style/blob/main/docs/10-multilingual-access.md): complete user-facing journeys in all 24 official EU languages. The language list, quality rules, coverage definitions and shared implementation contract are maintained there.

Use the [central programming pattern](https://github.com/philippklinz/modern-objectivity-style/blob/main/guides/multilingual-pattern.md) and [working 24-language sample](https://philippklinz.github.io/modern-objectivity-style/patterns/i18n/). The sample provides local catalogues, shared model state, plural/number formatting, explicit source fallback and source-freshness checks. Its small example translations are AI-assisted and await independent language review; they are not translations of these labs.

This document records only the labs' inventory, adoption work and rollout. Do not maintain a competing language policy here. Central ownership of the convention does not create a central runtime: every lab keeps the code and translations it needs in its own repository.

**STATIC BY DESIGN · OPEN ACCESS · OPEN SOURCE · NO ACCOUNTS · NO TRACKING**

## Scope

The first migration covers the five independent labs and this directory. The Anthropology Atlas already has German and English; extend its existing engine/content localization separately after inspecting those contracts. Do not replace it with the sample helper merely to make implementations look alike.

The central requirement and reference pattern are now in place. Translation of the existing labs remains a separately planned implementation task.

People Atlas joined the directory on 27 November 2026 with German and English UI and biographies. Like Anthropology Atlas, it maintains independent engine/content repositories and translation contracts; it is not included in the earlier page-count snapshot below. Independent historical and language review of its AI-assisted text remains pending.

## Current inventory

Snapshot of repository `main` trees inspected on 24 November 2026. Counts include each repository's start page and exclude the Atlas.

| Repository | HTML pages | Translation work beyond ordinary HTML |
| --- | ---: | --- |
| [learning-labs](https://github.com/philippklinz/learning-labs) | 1 | Search terms, filters, counts, project cards and the star atlas illustration’s accessible name |
| [lab-early-earth](https://github.com/philippklinz/lab-early-earth) | 6 | Timeline data labels, 36 geological portraits, trainer feedback, 3D explanations, SVGs and numerical output |
| [lab-abiogenesis](https://github.com/philippklinz/lab-abiogenesis) | 7 | Chemistry controls, molecular diagrams, RNA exercises, hypotheses and evidence feedback |
| [lab-molecular-biology](https://github.com/philippklinz/lab-molecular-biology) | 9 | Glossary/search, inline scripts, DNA/RNA views, sequence exercises and shared navigation |
| [lab-evolution](https://github.com/philippklinz/lab-evolution) | 7 | Population charts, trees, transition narratives and evidence exercises |
| [lab-human-origins](https://github.com/philippklinz/lab-human-origins) | 7 | Fossil/specimen data, diagrams, map labels, quizzes and generated descriptions |
| **Total** | **37** | **36 lab pages plus the directory** |

The five labs currently use German as their teaching language. Some headings and technical terms are already English; that does not constitute an English edition. Text is distributed across HTML, JavaScript and data objects. Recheck each repository before editing: the labs continue to develop independently, especially the Early Earth exhibits.

## Adapting the pattern to these labs

- Keep German as the existing teaching source while adding English and the remaining languages. The reference example uses English as its source; configure the source catalogue, HTML fallback and default URL consistently when copying it.
- Inventory text in HTML, inline scripts and data objects. Assign stable semantic keys and migrate complete modules, including shared navigation, all exercise outcomes, source caveats and accessible descriptions.
- Keep calculations, dates, scientific identifiers, coordinates, model state and answer logic shared. Do not duplicate an experiment's implementation for each language.
- Render changed-language labels from the current simulation state. Preserve entered sequences, slider positions and selections. Existing Early Earth notes and trainer progress keep their current storage contracts; other labs must not acquire new persistence just for language choice.
- Use the central catalogue validation and source-revision convention. Check the source diff and update affected messages; do not retranslate every unchanged lesson when one sentence changes. Keep subject terminology and semantic review alongside the translated content.
- The sample implements one small module. For a lab, separate common controls and module text, check both catalogues and load only what the current module needs. Integrate long-form content, search and SVG/Canvas/Three.js labels explicitly; they are not automatic features of the helper.
- Preserve existing deep links and chapter links. The proposed query parameter is `?lang=<tag>`; retain other parameters and hashes. Adapt Atlas handoffs to its actual URL convention.
- Recheck current branches and instructions before editing. The Early Earth 3D viewer and geological-time material are also being developed independently.

## Proposed rollout

The following steps describe the migration; the five labs are not claimed to have been translated.

| Step | Deliverable | Completion condition |
| --- | --- | --- |
| 0. Central foundation | Modern Objectivity requirement, programming guide and working sample | Central source exists; reference coverage and review limits are explicit |
| 1. Lab pilot | Abiogenesis module 01 in German and English, including shared navigation | Concentration exercise, feedback, generated labels and accessible descriptions work in both languages; switching preserves values |
| 2. Validate integration | Representative long, Greek, Cyrillic and plural-sensitive messages in the real lab layout | Rendering and behavior remain correct; partial test text is not advertised as a complete translation |
| 3. First complete lab | All six Abiogenesis modules and its start page in English | Every included learning journey is current and checked; existing German behavior is preserved |
| 4. Remaining labs and portal | Full English editions, one repository at a time | Each repository has independent local catalogues and honest coverage; concurrent exhibit work is preserved |
| 5. Further languages | Complete module/lab editions until all 24 languages are covered | Apply the central content, freshness and review checks; no empty language options implying completion |
| 6. Atlas expansion | Extend the existing Atlas localization | Engine UI and research content follow their existing contracts, with current sources and maps |

The Abiogenesis pilot is small but includes prose, controls, a generated diagram, a calculation and feedback. Other labs and additional languages can be ordered later according to learning needs. No fixed three-year deadline is attached to this plan.

## Lab-specific completion checks

Use the [central requirements](https://github.com/philippklinz/modern-objectivity-style/blob/main/docs/10-multilingual-access.md) and each repository's existing checks. In addition:

1. Include all 36 geological portraits, trainer outcomes and state-dependent 3D explanations in the Early Earth inventory.
2. Cover molecule components, sequence exercises and terminology consistently across Abiogenesis and Molecular Biology; distinguish biological translation from language translation.
3. Preserve deterministic evolution models, fossil age qualifications, uncertain ancestry and evidence-answer correctness when translating Evolution and Human Origins.
4. Verify the portal's translated search terms, filters and journey links without making it a dependency for the labs.
5. Check numerical equality before/after language switches, local links, keyboard use, mobile layouts and every relevant feedback path. Run each lab's existing interaction/layout checks.
6. Report availability per complete module and language. A whole lab is available only when its entry page, modules and common controls are current; report the Atlas separately until its expansion is included and verified.

The independent labs retain their own release schedules. The directory's static editions can be opened locally. Following a link to a published lab or atlas requires access to that site.
