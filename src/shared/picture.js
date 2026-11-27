// A coloured version of a colouring picture, made in the browser from its line art and area
// map: areas the child coloured keep the child's colours; every other inner area gets a cheerful
// colour picked per picture (always the same for that picture). The background (areas touching
// the page border) stays white unless the child coloured it.
import { pagePaths, decodeAreas, COLORS } from "../pages.js";
import { store, loadImage } from "./dom.js";

const AUTO = [0, 1, 2, 3, 4, 5, 6, 7, 9];   // palette indexes used for automatic colouring (no white, black, brown)

export async function colouredPicture(d) {
  const paths = pagePaths(d);
  const [img, buf] = await Promise.all([
    loadImage(paths.art),
    fetch(paths.areas).then((r) => { if (!r.ok) throw new Error("areas " + r.status); return r.arrayBuffer(); }),
  ]);
  const { w, h, areaCount, labels } = decodeAreas(buf);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const g = canvas.getContext("2d");
  g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.drawImage(img, 0, 0, w, h);

  // Areas on the page border are background.
  const edge = new Uint8Array(areaCount + 1);
  for (let x = 0; x < w; x++) { edge[labels[x]] = 1; edge[labels[(h - 1) * w + x]] = 1; }
  for (let y = 0; y < h; y++) { edge[labels[y * w]] = 1; edge[labels[y * w + w - 1]] = 1; }

  const saved = store.get("page:" + d.id, null) || {};
  let seed = 0; for (const ch of d.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rgb = new Int16Array((areaCount + 1) * 3).fill(-1);
  for (let id = 1; id <= areaCount; id++) {
    let ci = saved[id];
    if (!COLORS[ci]) ci = edge[id] ? null : AUTO[(id * 7 + seed) % AUTO.length];
    if (ci === null) continue;
    const hex = COLORS[ci][0];
    rgb[id * 3] = parseInt(hex.slice(1, 3), 16); rgb[id * 3 + 1] = parseInt(hex.slice(3, 5), 16); rgb[id * 3 + 2] = parseInt(hex.slice(5, 7), 16);
  }

  // Paint like the colouring screen: the colour multiplied by the paper brightness, so lines stay crisp.
  const data = g.getImageData(0, 0, w, h), p = data.data;
  for (let i = 0, k = 0; i < labels.length; i++, k += 4) {
    const id = labels[i]; if (!id || rgb[id * 3] < 0) continue;
    const s = Math.min(1, (p[k] * 299 + p[k + 1] * 587 + p[k + 2] * 114) / 1000 / 235);
    p[k] = rgb[id * 3] * s; p[k + 1] = rgb[id * 3 + 1] * s; p[k + 2] = rgb[id * 3 + 2] * s;
  }
  g.putImageData(data, 0, 0);
  return canvas;
}
