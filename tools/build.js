// Asset builder — run in a browser through tools/dev_server.py (open /tools/build.html).
// For every picture it writes:
//   assets/pages/<id>.png   line art (SVG pictures only; PNG pictures are used as they are)
//   assets/pages/<id>.bin   colouring areas, see src/pages.js
//   assets/thumbs/<id>.webp gallery thumbnail
// and the app icons in assets/icons.
import { drawings } from "../data/drawings.js";
import { encodeAreas, decodeAreas, pagePaths } from "../src/pages.js";

const WHITE = 205;          // brightness from which a pixel is "paper" (can be coloured)
const GREY = 100;           // light-grey specks between GREY and WHITE may join one area
const MAX_SPECK = 4000;     // largest speck (px) that is absorbed
const MIN_AREA = 8;         // white blobs smaller than this are treated as line
const RING = 2;             // anti-aliased line edge (px) painted together with the area
const SVG_SIZE = 800;
const THUMB_WIDTH = 320;
const TARGET_SHARE = 0.0015; // areas smaller than this share of the page are not needed to "finish"

const log = (msg) => { const el = document.querySelector("#log"); el.textContent += msg + "\n"; el.scrollTop = el.scrollHeight; };
const put = (path, blob) => fetch(`/__write/${path}`, { method: "PUT", body: blob }).then((r) => { if (!r.ok) throw new Error(`write ${path}: ${r.status}`); });
const canvasBlob = (c, type, q) => new Promise((res) => c.toBlob(res, type, q));

async function loadImage(url) { const img = new Image(); img.src = url; await img.decode(); return img; }

function drawToCanvas(img, w, h, background) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (background) { ctx.fillStyle = background; ctx.fillRect(0, 0, w, h); }
  ctx.drawImage(img, 0, 0, w, h);
  return c;
}

async function svgImage(svg) {
  svg.setAttribute("width", SVG_SIZE); svg.setAttribute("height", SVG_SIZE);
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" }));
  try { return await loadImage(url); } finally { URL.revokeObjectURL(url); }
}

// SVG pictures: rasterise the art, plus a flat "shape map" (each [data-region] shape in its own
// colour) so an area never leaks out of its shape where the drawing's outline has a gap.
async function rasteriseSvg(d) {
  const text = await fetch("/" + d.src).then((r) => r.text());
  const parse = () => new DOMParser().parseFromString(text, "image/svg+xml").documentElement;
  const map = parse();
  map.setAttribute("shape-rendering", "crispEdges");
  map.querySelectorAll("style").forEach((s) => s.remove());
  let id = 0;
  [...map.children].forEach((el) => {
    if (el.hasAttribute("data-region")) { id++; el.setAttribute("style", `fill:rgb(${id & 255},${id >> 8},0);stroke:none`); }
    else el.setAttribute("display", "none");
  });
  const [art, shapes] = await Promise.all([svgImage(parse()), svgImage(map)]);
  const artCanvas = drawToCanvas(art, SVG_SIZE, SVG_SIZE, "#fff");
  const m = drawToCanvas(shapes, SVG_SIZE, SVG_SIZE, "#000").getContext("2d").getImageData(0, 0, SVG_SIZE, SVG_SIZE).data;
  const shapeIds = new Uint16Array(SVG_SIZE * SVG_SIZE);
  for (let i = 0, k = 0; i < shapeIds.length; i++, k += 4) shapeIds[i] = m[k] | (m[k + 1] << 8);
  return { artCanvas, shapeIds };
}

function computeAreas(lum, shapeIds, w, h) {
  const N = w * h, labels = new Int32Array(N), stack = new Int32Array(N), visited = new Uint8Array(N);
  const sizes = [0], edge = [false];
  const nbrs4 = (i, out) => { const x = i % w; out[0] = x > 0 ? i - 1 : -1; out[1] = x < w - 1 ? i + 1 : -1; out[2] = i >= w ? i - w : -1; out[3] = i < N - w ? i + w : -1; return out; };
  const nb = [0, 0, 0, 0];
  let next = 0;

  // 1. connected white areas (inside the same SVG shape)
  for (let s = 0; s < N; s++) {
    if (visited[s] || lum[s] < WHITE) continue;
    const sid = shapeIds ? shapeIds[s] : 0, comp = [];
    let top = 0, touches = false; visited[s] = 1; stack[top++] = s;
    while (top) {
      const i = stack[--top]; comp.push(i);
      const x = i % w, y = (i / w) | 0;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) touches = true;
      for (const j of nbrs4(i, nb)) if (j >= 0 && !visited[j] && lum[j] >= WHITE && (!shapeIds || shapeIds[j] === sid)) { visited[j] = 1; stack[top++] = j; }
    }
    if (comp.length < MIN_AREA) continue;
    const id = ++next; for (const i of comp) labels[i] = id;
    sizes.push(comp.length); edge.push(touches);
  }

  // 2. light-grey specks that touch exactly one area join it (a grey run touching two areas is a faint line)
  for (let s = 0; s < N; s++) {
    if (visited[s] || labels[s] || lum[s] < GREY || lum[s] >= WHITE) continue;
    const comp = [], owners = new Set();
    let top = 0; visited[s] = 2; stack[top++] = s;
    while (top) {
      const i = stack[--top]; comp.push(i);
      for (const j of nbrs4(i, nb)) {
        if (j < 0) continue;
        if (labels[j]) owners.add(labels[j]);
        else if (!visited[j] && lum[j] >= GREY && lum[j] < WHITE) { visited[j] = 2; stack[top++] = j; }
      }
    }
    if (owners.size === 1 && comp.length <= MAX_SPECK) { const id = [...owners][0]; for (const i of comp) labels[i] = id; sizes[id] += comp.length; }
  }

  // 3. anti-aliased edge ring: grow each area RING px into the line so no white halo remains
  for (let step = 1; step <= RING; step++) {
    const grow = [];
    for (let i = 0; i < N; i++) {
      if (labels[i]) continue;
      const x = i % w, y = (i / w) | 0;
      search: for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if ((dx || dy) && xx >= 0 && yy >= 0 && xx < w && yy < h && labels[yy * w + xx] > 0) { grow.push(i, labels[yy * w + xx]); break search; }
      }
    }
    for (let k = 0; k < grow.length; k += 2) labels[grow[k]] = grow[k + 1];
  }

  if (next > 65535) throw new Error(`too many areas (${next})`);
  const big = [];
  for (let id = 1; id <= next; id++) if (sizes[id] >= N * TARGET_SHARE) big.push(id);
  const inner = big.filter((id) => !edge[id]);
  return { labels: Uint16Array.from(labels), areaCount: next, targets: inner.length ? inner : big };
}

async function buildOne(d) {
  let artCanvas, shapeIds = null;
  if (d.src.endsWith(".svg")) ({ artCanvas, shapeIds } = await rasteriseSvg(d));
  else { const img = await loadImage("/" + d.src); artCanvas = drawToCanvas(img, img.naturalWidth, img.naturalHeight, "#fff"); }
  const w = artCanvas.width, h = artCanvas.height, px = artCanvas.getContext("2d").getImageData(0, 0, w, h).data;
  const lum = new Uint8Array(w * h);
  for (let i = 0, k = 0; i < lum.length; i++, k += 4) lum[i] = (px[k] * 299 + px[k + 1] * 587 + px[k + 2] * 114) / 1000;

  const { labels, areaCount, targets } = computeAreas(lum, shapeIds, w, h);
  const bin = encodeAreas(w, h, labels, areaCount, targets);
  const check = decodeAreas(bin.buffer);
  if (check.labels.some((v, i) => v !== labels[i])) throw new Error("round-trip mismatch");

  const paths = pagePaths(d);
  const writes = [put(paths.areas, new Blob([bin]))];
  if (shapeIds) writes.push(put(paths.art, await canvasBlob(artCanvas, "image/png")));
  const tw = THUMB_WIDTH, th = Math.round(h * tw / w), t = document.createElement("canvas");
  t.width = tw; t.height = th;
  const tx = t.getContext("2d"); tx.imageSmoothingQuality = "high"; tx.fillStyle = "#fff"; tx.fillRect(0, 0, tw, th); tx.drawImage(artCanvas, 0, 0, tw, th);
  writes.push(put(paths.thumb, await canvasBlob(t, "image/webp", 0.82)));
  await Promise.all(writes);
  return { areaCount, targets: targets.length, kb: (bin.length / 1024).toFixed(0) };
}

// App icon: an original bunny face drawn with plain shapes (no emoji font, so it looks the
// same on every machine). Drawn in a 0..1 box; `zoom` < 1 keeps it inside the maskable safe zone.
function drawBunny(x, size, zoom) {
  const INK = "#4a3f55", WHITE = "#ffffff", PINK = "#ffb3c8";
  const g = x.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, "#ffd6e2"); g.addColorStop(1, "#d6ccff");
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  x.save();
  x.translate(size / 2, size / 2); x.scale(size * zoom, size * zoom); x.translate(-0.5, -0.47);
  x.lineJoin = "round"; x.lineCap = "round"; x.strokeStyle = INK;
  const ellipse = (cx, cy, rx, ry, rot, fill, stroke) => {
    x.beginPath(); x.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
    if (fill) { x.fillStyle = fill; x.fill(); }
    if (stroke) { x.lineWidth = stroke; x.stroke(); }
  };
  // ears (outer white, inner pink), drawn first so the head covers their base
  for (const side of [-1, 1]) {
    const cx = 0.5 + side * 0.125, rot = side * 0.2;
    ellipse(cx, 0.3, 0.09, 0.21, rot, WHITE, 0.028);
    ellipse(cx + side * 0.004, 0.31, 0.045, 0.15, rot, PINK);
  }
  ellipse(0.5, 0.63, 0.29, 0.245, 0, WHITE, 0.028);          // head
  for (const side of [-1, 1]) {
    ellipse(0.5 + side * 0.15, 0.7, 0.055, 0.035, 0, "rgba(255,140,170,.55)"); // cheek
    ellipse(0.5 + side * 0.095, 0.6, 0.03, 0.036, 0, INK);                     // eye
    ellipse(0.5 + side * 0.095 + 0.01, 0.588, 0.01, 0.011, 0, WHITE);          // eye shine
  }
  x.beginPath(); x.moveTo(0.47, 0.655); x.quadraticCurveTo(0.5, 0.64, 0.53, 0.655); x.quadraticCurveTo(0.5, 0.695, 0.47, 0.655);
  x.fillStyle = "#ff7fa3"; x.fill(); x.lineWidth = 0.012; x.stroke();      // nose
  x.beginPath(); x.lineWidth = 0.018;                                          // mouth
  x.moveTo(0.5, 0.68); x.quadraticCurveTo(0.49, 0.715, 0.46, 0.71);
  x.moveTo(0.5, 0.68); x.quadraticCurveTo(0.51, 0.715, 0.54, 0.71);
  x.stroke();
  x.restore();
}

async function buildIcons() {
  const make = async (size, zoom, file) => {
    const c = document.createElement("canvas"); c.width = c.height = size;
    drawBunny(c.getContext("2d"), size, zoom);
    await put(`assets/icons/${file}`, await canvasBlob(c, "image/png"));
    return c;
  };
  const preview = await make(512, 0.92, "icon-512.png");
  await make(192, 0.92, "icon-192.png");
  await make(512, 0.72, "icon-maskable-512.png");   // Android crops to a circle: keep the bunny inside 80%
  await make(180, 0.92, "apple-touch-icon.png");
  await make(64, 0.95, "favicon-64.png");
  preview.style.cssText = "width:160px;border-radius:32px;display:block;margin:10px 0";
  document.querySelector("#log").before(preview);
}

document.querySelector("#build").addEventListener("click", async (e) => {
  e.target.disabled = true;
  const only = new URLSearchParams(location.search).get("only");
  const iconsOnly = new URLSearchParams(location.search).has("icons");   // ?icons = only redraw the app icons
  const list = iconsOnly ? [] : only ? drawings.filter((d) => only.split(",").includes(d.id)) : drawings;
  const t0 = performance.now(), summary = [];
  try {
    await buildIcons(); log("icons ok");
    for (const [n, d] of list.entries()) {
      const r = await buildOne(d);
      summary.push({ id: d.id, ...r });
      log(`${n + 1}/${list.length} ${d.id}: ${r.areaCount} areas, ${r.targets} targets, ${r.kb} KB`);
    }
    log(`DONE ${list.length} pictures in ${((performance.now() - t0) / 1000).toFixed(1)}s`);
  } catch (err) { log("ERROR " + err.message); console.error(err); }
  window.buildSummary = summary;
  document.body.dataset.done = "1";
});
