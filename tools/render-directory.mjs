import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const json = path => JSON.parse(read(path));
const template = read('templates/directory.html');
const portrait = read('templates/humboldt.svg').trim();
const projects = new Map([...template.matchAll(/data-project="([\w-]+)" data-tags="([^"]+)"/g)]
  .map(([, id, tags]) => [id, tags.split(' ')]));
const editions = new Map(readdirSync(join(root, 'locales')).filter(file => file.endsWith('.json'))
  .sort().map(file => [file.slice(0, -5), json('locales/' + file)]));
const sourceRevision = createHash('sha256').update(JSON.stringify(editions.get('de'))).digest('hex');

function escape(value) {
  if (typeof value !== 'string') throw new Error('Expected a text field');
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
function editionUrl(tag) {
  return tag === 'de' ? 'index.html' : tag + '.html';
}
function counted(messages, language, n) {
  const category = new Intl.PluralRules(language).select(n);
  return (messages[category] ?? messages.other).replace('{count}', new Intl.NumberFormat(language).format(n));
}
function linkUrl(url) {
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Expected a web link: ' + url);
  return escape(url);
}
function checkIds(items, context) {
  const seen = new Set();
  for (const { id } of items) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || seen.has(id)) throw new Error('Invalid or repeated ID in ' + context);
    seen.add(id);
  }
}

function renderJourneys(language, copy) {
  const journeys = json(`journeys/${language}.json`);
  checkIds(journeys, language);
  return journeys.map((journey, index) => {
    const { id, stops } = journey;
    if (!stops.length) throw new Error('Journey has no stops: ' + id);
    checkIds(stops, id);
    const rows = stops.map((stop, i) => {
      const project = copy.projects[stop.projectId];
      if (!project) throw new Error('Unknown project: ' + stop.projectId);
      const number = new Intl.NumberFormat(language, { minimumIntegerDigits: 2 }).format(i + 1);
      return `<li id="journey-${id}-${stop.id}">
        <a href="${linkUrl(stop.url)}">
          <span class="route-num" aria-hidden="true">${number}</span>
          <span class="route-copy"><span class="route-project">${escape(project.title)}</span><strong>${escape(stop.title)}</strong></span>
          <span class="route-question">${escape(stop.question)}</span>
          <span class="route-arrow" aria-hidden="true">↗</span>
        </a>
      </li>`;
    });
    return `<details class="journey" name="knowledge-journeys" id="journey-${id}"${index === 0 ? ' open' : ''}>
      <summary><span class="journey-title">${escape(journey.title)}</span><span class="journey-count">${escape(counted(copy.guide.stops, language, stops.length))}</span><span class="chevron" aria-hidden="true"></span></summary>
      <ol class="journey-list">${rows.join('\n')}</ol>
    </details>`;
  }).join('\n');
}

function render(language, pack) {
  if (language !== 'de' && pack.sourceRevision !== sourceRevision) {
    throw new Error(language + ' needs review against the German UI. Current source revision: ' + sourceRevision);
  }
  const copy = structuredClone(pack);
  const projectIds = Object.keys(copy.projects);
  if (projects.size !== projectIds.length || !projectIds.every(id => projects.has(id))) throw new Error('Project mismatch in ' + language);
  for (const [id, project] of Object.entries(copy.projects)) {
    const label = projects.get(id).includes('atlas') ? copy.actions.openAtlasLabel : copy.actions.openLabLabel;
    project.openLabel = label.replace('{project}', project.title);
    project.codeLabel = copy.actions.codeLabel.replace('{project}', project.title);
  }
  const links = [];
  const alternates = [];
  for (const [tag, edition] of editions) {
    const current = tag === language ? ' aria-current="page"' : '';
    links.push(`<a lang="${tag}" hreflang="${tag}" href="${editionUrl(tag)}"${current}>${escape(edition.languageName)}</a>`);
    alternates.push(`<link rel="alternate" hreflang="${tag}" href="${editionUrl(tag)}">`);
  }
  const markup = {
    languageLinks: links.join('\n'), alternateLinks: alternates.join('\n'),
    guidePortrait: portrait, journeyList: renderJourneys(language, copy)
  };
  Object.assign(copy, {
    language, editionUrl: editionUrl(language), countMessages: JSON.stringify(copy.catalog.count),
    initialCount: counted(copy.catalog.count, language, projects.size)
  });
  return template.replace(/\{\{([\w.-]+)\}\}/g, (_, key) => {
    if (Object.hasOwn(markup, key)) return markup[key];
    const value = key.split('.').reduce((curr, k) => curr?.[k], copy);
    if (typeof value !== 'string') throw new Error(`Missing ${language} text: ${key}`);
    const escaped = escape(value);
    return key.endsWith('.heading') ? escaped.replaceAll('\n', ' <br>') : escaped;
  });
}

if (process.argv.includes('--source-revision')) {
  console.log(sourceRevision);
} else {
  const check = process.argv.includes('--check');
  for (const [language, pack] of editions) {
    const path = editionUrl(language);
    const html = render(language, pack);
    if (check) {
      if (read(path) !== html) throw new Error('Re-render ' + path);
    } else {
      writeFileSync(join(root, path), html);
    }
    console.log(`${check ? 'Checked' : 'Wrote'} ${path}`);
  }
}
