// One plate of the star atlas. Both the WebGL points and the static SVG use this catalogue.
export const tileSize = 1536;
export const starTypes = [
  { color: '#829ca7', diameter: 3.4 },
  { color: '#c0d8dc', diameter: 5.4 },
  { color: '#e9d9b6', diameter: 7.8 },
  { color: '#c1f3eb', diameter: 11.6 }
];

let seed = 20180321;
function random() {
  seed = Math.imul(seed, 1664525) + 1013904223 | 0;
  return (seed >>> 0) / 4294967296;
}

export const stars = Array.from({ length: 450 }, () => {
  const weight = random();
  return {
    x: 8 + Math.floor(random() * (tileSize - 16)),
    y: 8 + Math.floor(random() * (tileSize - 16)),
    depth: -4.6 + 8.0 * random(),
    birth: .84 * random(),
    type: weight < .60 ? 0 : weight < .90 ? 1 : weight < .975 ? 2 : 3
  };
});
