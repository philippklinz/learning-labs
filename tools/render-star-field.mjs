import { readFileSync, writeFileSync } from 'node:fs';
import { stars, starTypes, tileSize } from '../hero/star-field.js';

const gradients = starTypes.map(({ color }, index) => `  <radialGradient id="star-${index}">
    <stop stop-color="${color}"/><stop offset=".22" stop-color="${color}" stop-opacity=".83"/>
    <stop offset=".48" stop-color="${color}" stop-opacity=".18"/><stop offset="1" stop-color="${color}" stop-opacity="0"/>
  </radialGradient>`);
const dots = stars.map(({ x, y, type }) =>
  `<circle cx="${x}" cy="${y}" r="${starTypes[type].diameter / 2}" fill="url(#star-${type})"/>`);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tileSize}" height="${tileSize}" viewBox="0 0 ${tileSize} ${tileSize}">
<defs>
${gradients.join('\n')}
</defs>
${dots.join('\n')}
</svg>
`;
const file = new URL('../hero/star-field.svg', import.meta.url);
if (process.argv.includes('--check')) {
  if (readFileSync(file, 'utf8') !== svg) throw new Error('Re-render hero/star-field.svg');
} else {
  writeFileSync(file, svg);
}
