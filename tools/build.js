// Asset builder — run in a browser through tools/dev_server.py (open /tools/build.html).
// For every picture it writes:
//   assets/pages/<id>.png   line art (SVG rasterised; PNG cleaned up, see cleanPng)
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
// PNG clean-up (pictures cut out of generated sheets)
const PAPER = 225, INK = 90;   // brightness mapped to pure white / pure line, a soft ramp in between
const CLOSE = 3;               // line gaps up to 2*CLOSE px are closed before areas are found
const FRAME_BAND = 0.07;       // old card borders are looked for this close to an edge
const FRAME_RUN = 0.45;        // ... as dark runs at least this share of the side long
const FRAME_MARGIN = 22;       // white margin (px) around a picture that gets a new frame
const FRAME_WIDTH = 7;         // new frame line width (px)

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

// PNG pictures come from generated sheets: grey, soft, sometimes with part of the sheet's card
// border, and often cut off at the edge. Clean them into crisp line art:
//  1. crop inside any old card border found along an edge (and blank its rounded corners);
//  2. map greys to a crisp black-on-white ramp (also drops colour tints and JPEG noise);
//  3. if the drawing still runs off the edge, shrink it inside a clean rounded frame, so every
//     part that was cut off becomes a closed area instead of merging with the page background.
function cleanPng(img) {
  const W = img.naturalWidth, H = img.naturalHeight;
  const src = drawToCanvas(img, W, H, "#fff"), sp = src.getContext("2d").getImageData(0, 0, W, H).data;
  const lum = new Uint8Array(W * H);
  for (let i = 0, k = 0; i < lum.length; i++, k += 4) lum[i] = (sp[k] * 299 + sp[k + 1] * 587 + sp[k + 2] * 114) / 1000;
  const longestRun = (get, n) => { let run = 0, best = 0; for (let i = 0; i < n; i++) { run = get(i) < 160 ? run + 1 : 0; if (run > best) best = run; } return best; };
  // innermost row/column of an old border along each side (-1 = none)
  const side = (count, len, get) => {
    let inner = -1;
    for (let o = 0; o < Math.round(count * FRAME_BAND); o++) if (longestRun((i) => get(o, i), len) > len * FRAME_RUN) inner = o;
    return inner;
  };
  const top = side(H, W, (o, i) => lum[o * W + i]), bottom = side(H, W, (o, i) => lum[(H - 1 - o) * W + i]);
  const left = side(W, H, (o, i) => lum[i * W + o]), right = side(W, H, (o, i) => lum[i * W + (W - 1 - o)]);
  const pad = 3;   // step past the border line's anti-aliased edge
  const x0 = left < 0 ? 0 : left + pad, x1 = right < 0 ? W : W - 1 - right - pad;
  const y0 = top < 0 ? 0 : top + pad, y1 = bottom < 0 ? H : H - 1 - bottom - pad;
  const cw = x1 - x0, ch = y1 - y0;

  // crisp line art of the cropped part
  const crop = document.createElement("canvas"); crop.width = cw; crop.height = ch;
  const cx = crop.getContext("2d", { willReadFrequently: true }), out = cx.createImageData(cw, ch), o = out.data;
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    const l = lum[(y + y0) * W + x + x0], v = l >= PAPER ? 255 : l <= INK ? 0 : Math.round((l - INK) * 255 / (PAPER - INK));
    const k = (y * cw + x) * 4; o[k] = o[k + 1] = o[k + 2] = v; o[k + 3] = 255;
  }
  // rounded corners of an old border stay behind inside the crop: blank them
  const R = Math.round(Math.min(W, H) * 0.045);
  const blank = (bx, by) => { for (let y = by; y < by + R; y++) for (let x = bx; x < bx + R; x++) { const k = (y * cw + x) * 4; o[k] = o[k + 1] = o[k + 2] = 255; } };
  if (top >= 0 && left >= 0) blank(0, 0);
  if (top >= 0 && right >= 0) blank(cw - R, 0);
  if (bottom >= 0 && left >= 0) blank(0, ch - R);
  if (bottom >= 0 && right >= 0) blank(cw - R, ch - R);
  cx.putImageData(out, 0, 0);

  // does the drawing still run off an edge?
  let touching = 0;
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) if ((x < 3 || y < 3 || x >= cw - 3 || y >= ch - 3) && o[(y * cw + x) * 4] < 128) touching++;
  const framed = touching > 40, cropped = cw !== W || ch !== H;

  const art = document.createElement("canvas"); art.width = W; art.height = H;
  const ax = art.getContext("2d", { willReadFrequently: true });
  ax.fillStyle = "#fff"; ax.fillRect(0, 0, W, H);
  ax.imageSmoothingQuality = "high";
  if (!framed && !cropped) ax.drawImage(crop, 0, 0);
  else {
    const m = framed ? FRAME_MARGIN : 0, s = Math.min((W - 2 * m) / cw, (H - 2 * m) / ch);
    const dw = cw * s, dh = ch * s, dx = (W - dw) / 2, dy = (H - dh) / 2;
    ax.drawImage(crop, dx, dy, dw, dh);
    if (framed) {
      ax.strokeStyle = "#000"; ax.lineWidth = FRAME_WIDTH; ax.lineJoin = "round";
      ax.beginPath(); ax.roundRect(dx, dy, dw, dh, 26); ax.stroke();
    }
  }
  return { artCanvas: art, framed, cropped };
}

// Dilate the line pixels by `r` (square), so small gaps in a soft outline are closed.
function closedPaper(lum, w, h, r) {
  const ink = new Uint8Array(w * h), tmp = new Uint8Array(w * h);
  for (let i = 0; i < ink.length; i++) ink[i] = lum[i] < WHITE ? 1 : 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = 0; for (let d = -r; d <= r && !v; d++) { const xx = x + d; if (xx >= 0 && xx < w) v = ink[y * w + xx]; }
    tmp[y * w + x] = v;
  }
  const paper = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = 0; for (let d = -r; d <= r && !v; d++) { const yy = y + d; if (yy >= 0 && yy < h) v = tmp[yy * w + x]; }
    paper[y * w + x] = v ? 0 : 1;
  }
  return paper;
}

function computeAreas(lum, shapeIds, w, h, close = 0) {
  const N = w * h, labels = new Int32Array(N), stack = new Int32Array(N), visited = new Uint8Array(N);
  const sizes = [0], edge = [false];
  const nbrs4 = (i, out) => { const x = i % w; out[0] = x > 0 ? i - 1 : -1; out[1] = x < w - 1 ? i + 1 : -1; out[2] = i >= w ? i - w : -1; out[3] = i < N - w ? i + w : -1; return out; };
  const nb = [0, 0, 0, 0];
  const paper = close ? closedPaper(lum, w, h, close) : null;
  const isPaper = paper ? (i) => paper[i] === 1 : (i) => lum[i] >= WHITE;
  let next = 0;

  // 1. connected white areas (inside the same SVG shape)
  for (let s = 0; s < N; s++) {
    if (visited[s] || !isPaper(s)) continue;
    const sid = shapeIds ? shapeIds[s] : 0, comp = [];
    let top = 0, touches = false; visited[s] = 1; stack[top++] = s;
    while (top) {
      const i = stack[--top]; comp.push(i);
      const x = i % w, y = (i / w) | 0;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) touches = true;
      for (const j of nbrs4(i, nb)) if (j >= 0 && !visited[j] && isPaper(j) && (!shapeIds || shapeIds[j] === sid)) { visited[j] = 1; stack[top++] = j; }
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
  for (let step = 1; step <= RING + close; step++) {   // + close: refill the band the gap closing took
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
  let artCanvas, shapeIds = null, framed = false;
  if (d.src.endsWith(".svg")) ({ artCanvas, shapeIds } = await rasteriseSvg(d));
  else ({ artCanvas, framed } = cleanPng(await loadImage("/" + d.src)));
  const w = artCanvas.width, h = artCanvas.height, px = artCanvas.getContext("2d").getImageData(0, 0, w, h).data;
  const lum = new Uint8Array(w * h);
  for (let i = 0, k = 0; i < lum.length; i++, k += 4) lum[i] = (px[k] * 299 + px[k + 1] * 587 + px[k + 2] * 114) / 1000;

  const { labels, areaCount, targets } = computeAreas(lum, shapeIds, w, h, shapeIds ? 0 : CLOSE);
  const bin = encodeAreas(w, h, labels, areaCount, targets);
  const check = decodeAreas(bin.buffer);
  if (check.labels.some((v, i) => v !== labels[i])) throw new Error("round-trip mismatch");

  const paths = pagePaths(d);
  const writes = [put(paths.areas, new Blob([bin])), put(paths.art, await canvasBlob(artCanvas, "image/png"))];
  const tw = THUMB_WIDTH, th = Math.round(h * tw / w), t = document.createElement("canvas");
  t.width = tw; t.height = th;
  const tx = t.getContext("2d"); tx.imageSmoothingQuality = "high"; tx.fillStyle = "#fff"; tx.fillRect(0, 0, tw, th); tx.drawImage(artCanvas, 0, 0, tw, th);
  writes.push(put(paths.thumb, await canvasBlob(t, "image/webp", 0.82)));
  await Promise.all(writes);
  return { areaCount, targets: targets.length, kb: (bin.length / 1024).toFixed(0), framed };
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
      log(`${n + 1}/${list.length} ${d.id}: ${r.areaCount} areas, ${r.targets} targets, ${r.kb} KB${r.framed ? ", framed" : ""}`);
    }
    log(`DONE ${list.length} pictures in ${((performance.now() - t0) / 1000).toFixed(1)}s`);
  } catch (err) { log("ERROR " + err.message); console.error(err); }
  window.buildSummary = summary;
  document.body.dataset.done = "1";
});
