// Colouring "pages": the line art plus a pre-computed map that says which colouring area
// every pixel belongs to. The map is built once by tools/build.html, so a phone never has to
// flood-fill or analyse the picture: a tap just looks up the area and paints its pixel list.
//
// .bin format (little endian):
//   "BVV1" | u16 width | u16 height | u16 areaCount | target bitmap (areaCount+1 bits)
//   then run-length pairs (varint runLength, varint areaId) covering width*height pixels.
//   areaId 0 = solid line pixels that never take colour.

export const PAGE_MAGIC = "BVV1";

export const pagePaths = (d) => ({
  art: d.src.endsWith(".png") ? d.src : `assets/pages/${d.id}.png`,
  areas: `assets/pages/${d.id}.bin`,
  thumb: `assets/thumbs/${d.id}.webp`,
});

export function encodeAreas(w, h, labels, areaCount, targets) {
  const bytes = [];
  const varint = (v) => { while (v > 127) { bytes.push((v & 127) | 128); v >>>= 7; } bytes.push(v); };
  for (const ch of PAGE_MAGIC) bytes.push(ch.charCodeAt(0));
  for (const v of [w, h, areaCount]) bytes.push(v & 255, v >> 8);
  const bits = new Uint8Array(Math.ceil((areaCount + 1) / 8));
  targets.forEach((id) => { bits[id >> 3] |= 1 << (id & 7); });
  bytes.push(...bits);
  for (let i = 0; i < labels.length;) {
    const id = labels[i];
    let j = i + 1;
    while (j < labels.length && labels[j] === id) j++;
    varint(j - i);
    varint(id);
    i = j;
  }
  return new Uint8Array(bytes);
}

export function decodeAreas(buffer) {
  const b = new Uint8Array(buffer);
  if (String.fromCharCode(b[0], b[1], b[2], b[3]) !== PAGE_MAGIC) throw new Error("bad page file");
  const w = b[4] | (b[5] << 8), h = b[6] | (b[7] << 8), areaCount = b[8] | (b[9] << 8);
  let p = 10;
  const bitBytes = Math.ceil((areaCount + 1) / 8), targets = [];
  for (let id = 1; id <= areaCount; id++) if (b[p + (id >> 3)] & (1 << (id & 7))) targets.push(id);
  p += bitBytes;
  const labels = new Uint16Array(w * h);
  const varint = () => { let v = 0, s = 0, c; do { c = b[p++]; v |= (c & 127) << s; s += 7; } while (c & 128); return v; };
  for (let i = 0; i < labels.length;) {
    const run = varint(), id = varint();
    labels.fill(id, i, i + run);
    i += run;
  }
  return { w, h, areaCount, targets, labels };
}

// Group pixel indices by area (counting sort) and record each area's bounding box, so painting
// an area touches only its own pixels and redraws only its own rectangle.
export function indexAreas({ w, h, areaCount, labels }) {
  const counts = new Uint32Array(areaCount + 2);
  for (let i = 0; i < labels.length; i++) counts[labels[i] + 1]++;
  const offsets = new Uint32Array(areaCount + 2);
  for (let id = 0; id <= areaCount; id++) offsets[id + 1] = offsets[id] + counts[id + 1];
  const fill = offsets.slice(0, areaCount + 1), pixels = new Uint32Array(labels.length);
  const box = new Int32Array((areaCount + 1) * 4);
  for (let id = 0; id <= areaCount; id++) { box[id * 4] = w; box[id * 4 + 1] = h; box[id * 4 + 2] = -1; box[id * 4 + 3] = -1; }
  for (let y = 0, i = 0; y < h; y++) {
    for (let x = 0; x < w; x++, i++) {
      const id = labels[i], k = id * 4;
      pixels[fill[id]++] = i;
      if (x < box[k]) box[k] = x;
      if (y < box[k + 1]) box[k + 1] = y;
      if (x > box[k + 2]) box[k + 2] = x;
      if (y > box[k + 3]) box[k + 3] = y;
    }
  }
  return { offsets, pixels, box };
}
