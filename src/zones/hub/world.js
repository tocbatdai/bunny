// The world scene on the home screen: an original flat drawing built as inline SVG, so every
// house is a real, tappable element. Two layouts: landscape (1600x900) and portrait (900x1600).
// The scene is drawn with preserveAspectRatio "slice", so it always fills the screen; houses
// stay inside a safe area that remains visible from 4:3 tablets to 21:9 phones.

// Zones: `route` is where a tap goes; houses without one are asleep ("coming soon").
export const HOUSES = [
  { id: "ve", label: "Vẽ Vui", say: "Bé Vẽ Vui", route: "ve" },
  { id: "ghep-hinh", label: "Ghép Hình", say: "Bé Ghép Hình", route: "ghep-hinh" },
  { id: "nhan-biet", label: "Vườn Thú", say: "Vườn thú", route: "nhan-biet" },
  { id: "am-nhac", label: "Âm Nhạc", say: "Nhà âm nhạc", route: "am-nhac" },
  { id: "ke-chuyen", label: "Kể Chuyện", say: "Thư viện kể chuyện. Sắp có rồi!", route: null },
];

// Bottom-centre position and scale of each house (house art is 300 wide, 320 tall, ground at y=320).
const LAYOUTS = {
  landscape: {
    w: 1600, h: 900, plaza: [800, 660],
    houses: { ve: [380, 565, 1], "ghep-hinh": [800, 470, 0.9], "nhan-biet": [1220, 565, 1], "am-nhac": [600, 772, 0.78], "ke-chuyen": [1000, 772, 0.78] },
    trees: [[585, 470, 1], [1015, 470, 1], [110, 560, 1.2], [1490, 560, 1.2], [1430, 830, 0.9], [210, 860, 0.8]],
    pines: [[640, 300, 0.75], [960, 300, 0.75], [520, 330, 0.7], [1080, 330, 0.7]],
    pond: [300, 790, 150, 46], sun: [1330, 165], rainbow: [800, 400, 330],
    clouds: [[250, 150, 1], [820, 90, 0.8], [1180, 200, 0.7]],
    flowers: [[180, 620], [560, 600], [760, 590], [1060, 610], [1300, 640], [470, 870], [1150, 880], [1380, 700], [860, 860]],
  },
  portrait: {
    w: 900, h: 1600, plaza: [450, 840],
    houses: { ve: [245, 650, 0.95], "ghep-hinh": [655, 650, 0.95], "nhan-biet": [245, 1060, 0.95], "am-nhac": [655, 1060, 0.95], "ke-chuyen": [450, 1420, 0.95] },
    trees: [[450, 600, 0.75], [110, 1300, 1], [800, 1300, 0.9], [80, 830, 0.8], [830, 830, 0.8]],
    pines: [[150, 410, 0.7], [750, 410, 0.7], [450, 400, 0.8]],
    pond: [450, 1545, 160, 40], sun: [740, 250], rainbow: [450, 520, 260],
    clouds: [[150, 210, 0.8], [520, 150, 0.7], [380, 300, 0.6]],
    flowers: [[90, 700], [810, 700], [450, 760], [130, 1140], [780, 1140], [450, 1180], [250, 1500], [650, 1480]],
  },
};

const INK = "#4a3f55";
const K = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
const r1 = (v) => Math.round(v * 10) / 10;

/* ------------------------------------------------------------- houses */
// Each returns SVG in local coordinates: 300 wide, ground line at y=320.
const ART = {
  // Nhà hội họa: pink house, crayon chimney, palette sign, purple door.
  ve: () => `
    <rect x="198" y="58" width="26" height="70" fill="#42a5f5" ${K}/><path d="M198 58L211 34L224 58Z" fill="#42a5f5" ${K}/>
    <rect x="198" y="80" width="26" height="12" fill="#fff" ${K}/>
    <rect x="50" y="150" width="200" height="166" rx="10" fill="#ffe3ec" ${K}/>
    <path d="M26 164L150 50L274 164Z" fill="#ef5350" ${K}/>
    <path d="M60 140L150 60L240 140" fill="none" stroke="#ffd54f" stroke-width="7" stroke-linecap="round"/>
    <circle cx="150" cy="118" r="23" fill="#fff7c2" ${K}/><path d="M150 96V140M128 118H172" fill="none" ${K}/>
    <path d="M118 316V258Q150 220 182 258V316Z" fill="#8d7cf6" ${K}/><circle cx="170" cy="282" r="5" fill="${INK}"/>
    <path d="M60 205C60 182 116 178 118 202C120 216 104 214 100 224C96 236 60 232 60 205Z" fill="#fff8e8" ${K}/>
    <circle cx="76" cy="200" r="6" fill="#ef5350"/><circle cx="92" cy="193" r="6" fill="#ffd54f"/><circle cx="106" cy="203" r="6" fill="#42a5f5"/><circle cx="78" cy="217" r="6" fill="#8bc34a"/>
    <rect x="198" y="190" width="38" height="38" rx="6" fill="#bfe7ff" ${K}/><path d="M217 190V228M198 209H236" fill="none" ${K}/>`,

  // Nhà ghép hình: walls of four puzzle blocks, a puzzle piece on the roof.
  "ghep-hinh": () => `
    <rect x="55" y="142" width="95" height="88" fill="#ffd54f" ${K}/><rect x="150" y="142" width="95" height="88" fill="#8bc34a" ${K}/>
    <rect x="55" y="230" width="95" height="86" fill="#42a5f5" ${K}/><rect x="150" y="230" width="95" height="86" fill="#f48fb1" ${K}/>
    <circle cx="150" cy="186" r="13" fill="#ffd54f" ${K}/><circle cx="102" cy="230" r="13" fill="#ffd54f" ${K}/>
    <circle cx="198" cy="230" r="13" fill="#8bc34a" ${K}/><circle cx="150" cy="273" r="13" fill="#42a5f5" ${K}/>
    <path d="M30 150L150 46L270 150Z" fill="#26a69a" ${K}/>
    <path d="M128 92H142A9 9 0 1 1 158 92H172V130H128Z" fill="#ff9f43" ${K}/>
    <rect x="125" y="250" width="50" height="66" rx="8" fill="#a1887f" ${K}/><circle cx="165" cy="285" r="4.5" fill="${INK}"/>`,

  // Vườn thú: wooden gate with a green arch and a giraffe peeking over the fence.
  "nhan-biet": () => `
    <rect x="176" y="150" width="30" height="160" fill="#ffd54f" ${K}/>
    <circle cx="186" cy="182" r="6" fill="#c98b3a"/><circle cx="197" cy="214" r="7" fill="#c98b3a"/><circle cx="184" cy="246" r="6" fill="#c98b3a"/>
    <path d="M178 120L174 100M198 120L202 100" fill="none" ${K}/><circle cx="174" cy="98" r="6" fill="#c98b3a" ${K}/><circle cx="202" cy="98" r="6" fill="#c98b3a" ${K}/>
    <ellipse cx="166" cy="126" rx="13" ry="7" fill="#ffd54f" ${K}/><ellipse cx="214" cy="126" rx="13" ry="7" fill="#ffd54f" ${K}/>
    <ellipse cx="190" cy="140" rx="30" ry="26" fill="#ffd54f" ${K}/><ellipse cx="190" cy="156" rx="18" ry="11" fill="#ffe9a8" ${K}/>
    <circle cx="180" cy="134" r="4.5" fill="${INK}"/><circle cx="200" cy="134" r="4.5" fill="${INK}"/>
    <rect x="40" y="128" width="40" height="190" rx="6" fill="#a1887f" ${K}/><rect x="220" y="128" width="40" height="190" rx="6" fill="#a1887f" ${K}/>
    <rect x="32" y="114" width="56" height="20" rx="8" fill="#d7b49e" ${K}/><rect x="212" y="114" width="56" height="20" rx="8" fill="#d7b49e" ${K}/>
    <path d="M28 132Q150 20 272 132L252 140Q150 58 48 140Z" fill="#8bc34a" ${K}/>
    <circle cx="96" cy="84" r="7" fill="#ffd54f"/><circle cx="150" cy="66" r="7" fill="#ef5350"/><circle cx="204" cy="84" r="7" fill="#42a5f5"/>
    <rect x="80" y="236" width="140" height="16" fill="#ffe0b2" ${K}/><rect x="80" y="282" width="140" height="16" fill="#ffe0b2" ${K}/>
    ${[92, 122, 152, 182, 208].map((x) => `<path d="M${x} 318V230L${x + 8} 218L${x + 16} 230V318Z" fill="#fff3e0" ${K}/>`).join("")}`,

  // Nhà âm nhạc: purple dome house with piano keys and a music note.
  "am-nhac": () => `
    <rect x="60" y="160" width="180" height="156" rx="10" fill="#efe6ff" ${K}/>
    <path d="M38 170Q150 30 262 170Z" fill="#ab82d6" ${K}/>
    <path d="M140 132V86L172 78V96L150 101V132" fill="${INK}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><ellipse cx="132" cy="134" rx="13" ry="10" fill="${INK}"/>
    <rect x="60" y="270" width="180" height="46" fill="#fff" ${K}/>
    ${[78, 96, 114, 186, 204, 222].map((x) => `<path d="M${x} 270V316" stroke="${INK}" stroke-width="3"/>`).join("")}
    ${[87, 105, 195, 213].map((x) => `<rect x="${x - 5}" y="270" width="10" height="26" fill="${INK}"/>`).join("")}
    <path d="M124 316V236Q150 210 176 236V316Z" fill="#ff9f43" ${K}/>
    <circle cx="94" cy="214" r="17" fill="#bfe7ff" ${K}/><circle cx="206" cy="214" r="17" fill="#bfe7ff" ${K}/>`,

  // Thư viện kể chuyện: house with an open book for a roof and book shelves in the windows.
  "ke-chuyen": () => `
    <rect x="55" y="168" width="190" height="148" rx="10" fill="#fff3d6" ${K}/>
    <path d="M150 112Q92 80 24 100V176Q92 160 150 190Q208 160 276 176V100Q208 80 150 112Z" fill="#42a5f5" ${K}/>
    <path d="M150 100Q96 66 36 86V160Q96 146 150 176Z" fill="#fff" ${K}/><path d="M150 100Q204 66 264 86V160Q204 146 150 176Z" fill="#fff" ${K}/>
    <path d="M58 104Q100 96 132 112M58 124Q100 116 132 132M168 112Q200 96 242 104M168 132Q200 116 242 124" fill="none" stroke="#c9bfd3" stroke-width="4" stroke-linecap="round"/>
    <path d="M126 316V250Q150 226 174 250V316Z" fill="#ef5350" ${K}/>
    ${[[72, 208], [180, 208]].map(([x, y]) => `<rect x="${x}" y="${y}" width="48" height="44" rx="5" fill="#fff" ${K}/>
      <rect x="${x + 7}" y="${y + 12}" width="8" height="28" fill="#ef5350"/><rect x="${x + 17}" y="${y + 8}" width="8" height="32" fill="#8bc34a"/><rect x="${x + 27}" y="${y + 14}" width="8" height="26" fill="#ffd54f"/><rect x="${x + 37}" y="${y + 10}" width="6" height="30" fill="#ab82d6"/>`).join("")}`,
};

/* --------------------------------------------------------- scenery parts */
const tree = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-10" y="-60" width="20" height="62" rx="6" fill="#a1887f" ${K}/>
  <path d="M-48 -70C-70 -100 -40 -150 0 -146C40 -150 70 -100 48 -70C40 -50 -40 -50 -48 -70Z" fill="#7cc35b" ${K}/>
  <circle cx="-20" cy="-100" r="7" fill="#ef5350"/><circle cx="18" cy="-86" r="7" fill="#ef5350"/><circle cx="10" cy="-120" r="7" fill="#ef5350"/></g>`;
const pine = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-8" y="-24" width="16" height="26" fill="#a1887f" ${K}/>
  <path d="M0 -150L44 -24H-44Z" fill="#43a26b" ${K}/><path d="M-26 -70L0 -60L26 -70M-34 -44L0 -34L34 -44" fill="none" stroke="#2f7d50" stroke-width="4" stroke-linecap="round"/></g>`;
const flower = (x, y, c) => `<g transform="translate(${x} ${y})"><path d="M0 0V18" stroke="#43a26b" stroke-width="4"/>
  ${[0, 72, 144, 216, 288].map((a) => `<circle cx="${r1(9 * Math.cos(a * Math.PI / 180))}" cy="${r1(9 * Math.sin(a * Math.PI / 180))}" r="7" fill="${c}"/>`).join("")}<circle r="5" fill="#ffd54f"/></g>`;
const cloud = (x, y, s, i) => `<g transform="translate(${x} ${y}) scale(${s})"><g class="w-cloud" style="--d:${-i * 23}s">
  <path d="M-90 30C-120 30 -120 -10 -86 -12C-84 -50 -30 -56 -14 -30C0 -64 64 -60 66 -18C100 -22 110 30 80 30Z" fill="#fff" stroke="#d9eefb" stroke-width="5"/></g></g>`;
const duck = (x, y) => `<g transform="translate(${x} ${y})"><g class="w-duck">
  <path d="M-34 0C-38 -24 -10 -26 4 -18C10 -36 40 -40 40 -14C40 -6 30 0 22 2C10 14 -26 14 -34 0Z" fill="#ffd54f" ${K}/>
  <path d="M38 -20L56 -16L38 -10Z" fill="#ff9f43" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="28" cy="-22" r="3.5" fill="${INK}"/>
  <path d="M-16 -6Q-4 2 8 -6" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/></g></g>`;

function house(h, [x, y, s]) {
  const lw = h.label.length * 15 + 36;
  const asleep = !h.route;
  return `<g transform="translate(${x - 150 * s} ${y - 320 * s}) scale(${s})">
    <g class="house${asleep ? " asleep" : ""}" data-house="${h.id}" role="button" tabindex="0" aria-label="${h.say}">
      <rect x="-10" y="20" width="320" height="345" fill="transparent"/>
      <g class="house-body">${ART[h.id]()}</g>
      ${asleep ? `<g class="zzz" aria-hidden="true"><text x="236" y="70">z</text><text x="258" y="46">z</text><text x="280" y="22">z</text></g>` : ""}
      <rect x="${150 - lw / 2}" y="326" width="${lw}" height="38" rx="19" fill="#fff" ${K}/>
      <text class="house-label" x="150" y="353">${h.label}</text>
    </g></g>`;
}

export function worldSvg(portrait) {
  const L = LAYOUTS[portrait ? "portrait" : "landscape"], { w, h } = L, [px, py] = L.plaza;
  const ground = portrait ? 470 : 380;
  const colours = ["#ef5350", "#f48fb1", "#ab82d6", "#ff9f43", "#ffffff"];
  const [rx, ry, rr] = L.rainbow;
  const bands = ["#ef5350", "#ff9f43", "#ffd54f", "#8bc34a", "#42a5f5", "#ab82d6"];
  const [qx, qy, qrx, qry] = L.pond;
  const [sx, sy] = L.sun;
  const roads = Object.values(L.houses).map(([x, y]) => `<path d="M${px} ${py}Q${r1((px + x) / 2)} ${py} ${x} ${y - 4}" fill="none" stroke="#f3d9a4" stroke-width="44" stroke-linecap="round"/>`).join("");
  return `<svg class="world-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Thế Giới Của Bé">
  <defs><linearGradient id="w-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fdcff"/><stop offset="1" stop-color="#e6f7ff"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#w-sky)"/>
  <g transform="translate(${sx} ${sy})"><g class="w-sun">${Array.from({ length: 10 }, (_, i) => `<path d="M0 -62V-84" transform="rotate(${i * 36})" stroke="#ffc94a" stroke-width="9" stroke-linecap="round"/>`).join("")}</g>
    <circle r="48" fill="#ffd54f" stroke="#ffc94a" stroke-width="6"/><circle cx="-16" cy="-6" r="5" fill="${INK}"/><circle cx="16" cy="-6" r="5" fill="${INK}"/>
    <path d="M-16 12Q0 26 16 12" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/></g>
  ${L.clouds.map(([x, y, s], i) => cloud(x, y, s, i)).join("")}
  <g opacity=".55">${bands.map((c, i) => `<path d="M${rx - rr + i * 16} ${ry}A${rr - i * 16} ${rr - i * 16} 0 0 1 ${rx + rr - i * 16} ${ry}" fill="none" stroke="${c}" stroke-width="16"/>`).join("")}</g>
  <path d="M0 ${ground + 20}Q${w * 0.2} ${ground - 70} ${w * 0.42} ${ground + 10}T${w} ${ground - 10}V${h}H0Z" fill="#b9e48c"/>
  ${L.pines.map(([x, y, s]) => pine(x, y + ground - 340, s)).join("")}
  <path d="M0 ${ground + 70}Q${w * 0.3} ${ground + 10} ${w * 0.55} ${ground + 60}T${w} ${ground + 50}V${h}H0Z" fill="#9fd36a"/>
  ${roads}<ellipse cx="${px}" cy="${py}" rx="${portrait ? 120 : 150}" ry="${portrait ? 46 : 56}" fill="#f3d9a4"/>
  <circle cx="${px}" cy="${py - 6}" r="22" fill="#bfe7ff" stroke="#fff" stroke-width="8"/>
  <ellipse cx="${qx}" cy="${qy}" rx="${qrx}" ry="${qry}" fill="#6cc7f0" stroke="#4aa8d8" stroke-width="6"/>
  <ellipse cx="${qx - qrx * 0.55}" cy="${qy + 6}" rx="26" ry="10" fill="#7cc35b"/>${duck(qx + qrx * 0.2, qy)}
  ${L.trees.map(([x, y, s]) => tree(x, y, s)).join("")}
  ${L.flowers.map(([x, y], i) => flower(x, y, colours[i % colours.length])).join("")}
  ${HOUSES.map((hh) => house(hh, L.houses[hh.id])).join("")}
</svg>`;
}
