// Vườn thú animals: original flat drawings (inline SVG, 400x400, standing on y≈380), each with
// its Vietnamese name and what the voice says when it is tapped.
const INK = "#4a3f55";
const K = `stroke="${INK}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"`;
const eye = (x, y, rx = 12, ry = 15) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${INK}"/><circle cx="${x + rx * 0.35}" cy="${y - ry * 0.4}" r="${rx * 0.38}" fill="#fff"/>`;
const cheek = (x, y, rx = 15, ry = 9) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#f8a5c2" opacity=".75"/>`;
const svg = (body) => `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;

export const ANIMALS = [
  {
    id: "meo", name: "Con mèo", say: "Con mèo. Meo meo!",
    svg: () => svg(`
      <path d="M262 340C336 340 356 272 326 236C314 222 296 232 304 248C322 280 306 314 262 314Z" fill="#ffb74d" ${K}/>
      <ellipse cx="200" cy="292" rx="84" ry="80" fill="#ffb74d" ${K}/>
      <ellipse cx="200" cy="310" rx="46" ry="52" fill="#fff3e0" ${K}/>
      <ellipse cx="166" cy="366" rx="28" ry="16" fill="#ffb74d" ${K}/><ellipse cx="234" cy="366" rx="28" ry="16" fill="#ffb74d" ${K}/>
      <path d="M116 136L120 56Q124 44 138 50L182 96Z" fill="#ffb74d" ${K}/><path d="M284 136L280 56Q276 44 262 50L218 96Z" fill="#ffb74d" ${K}/>
      <path d="M132 112L134 72L162 98Z" fill="#f8bbd0"/><path d="M268 112L266 72L238 98Z" fill="#f8bbd0"/>
      <ellipse cx="200" cy="172" rx="100" ry="84" fill="#ffb74d" ${K}/>
      <path d="M184 98L188 120M200 94V120M216 98L212 120" fill="none" stroke="#e0872b" stroke-width="7" stroke-linecap="round"/>
      ${eye(160, 170)}${eye(240, 170)}${cheek(128, 204)}${cheek(272, 204)}
      <path d="M190 194Q200 188 210 194Q205 204 200 204Q195 204 190 194Z" fill="#ef7a9a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M180 214Q190 228 200 214Q210 228 220 214" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <path d="M108 190L70 182M108 206L72 214M292 190L330 182M292 206L328 214" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`),
  },
  {
    id: "cho", name: "Con chó", say: "Con chó. Gâu gâu!",
    svg: () => svg(`
      <path d="M268 304C322 296 344 252 334 220C328 206 312 212 316 228C320 252 302 278 266 282Z" fill="#e8bf87" ${K}/>
      <ellipse cx="200" cy="296" rx="82" ry="76" fill="#e8bf87" ${K}/>
      <ellipse cx="200" cy="314" rx="44" ry="50" fill="#fff6e8" ${K}/>
      <ellipse cx="166" cy="366" rx="28" ry="16" fill="#e8bf87" ${K}/><ellipse cx="234" cy="366" rx="28" ry="16" fill="#e8bf87" ${K}/>
      <ellipse cx="200" cy="170" rx="92" ry="82" fill="#e8bf87" ${K}/>
      <ellipse cx="238" cy="160" rx="27" ry="25" fill="#c98f5a"/>
      <path d="M120 116C88 116 70 180 84 230C92 252 120 242 124 220C128 190 134 150 142 124Z" fill="#a1704a" ${K}/>
      <path d="M280 116C312 116 330 180 316 230C308 252 280 242 276 220C272 190 266 150 258 124Z" fill="#a1704a" ${K}/>
      <ellipse cx="200" cy="208" rx="46" ry="34" fill="#fff6e8" ${K}/>
      ${eye(164, 160)}${eye(238, 160)}${cheek(140, 204)}${cheek(260, 204)}
      <ellipse cx="200" cy="193" rx="16" ry="11" fill="${INK}"/>
      <path d="M193 228Q200 246 207 228Z" fill="#ef7a9a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M200 204V216M184 218Q192 228 200 216Q208 228 216 218" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`),
  },
  {
    id: "vit", name: "Con vịt", say: "Con vịt. Cạp cạp!",
    svg: () => svg(`
      <path d="M186 336L180 374M180 374H160M180 374L172 362M228 336L234 374M234 374H254M234 374L242 362" fill="none" stroke="#ff9f43" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M108 252C84 236 66 210 70 196C92 198 116 216 128 236Z" fill="#ffd54f" ${K}/>
      <ellipse cx="200" cy="274" rx="110" ry="74" fill="#ffd54f" ${K}/>
      <path d="M146 264C168 232 228 234 250 264C228 298 168 298 146 264Z" fill="#ffc107" ${K}/>
      <path d="M264 112Q270 90 284 98M276 110Q290 94 300 106" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="270" cy="168" r="58" fill="#ffd54f" ${K}/>
      <path d="M318 162Q352 156 364 172Q352 190 318 186Z" fill="#ff9f43" ${K}/><path d="M322 174H350" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      ${eye(284, 154, 10, 13)}${cheek(262, 190, 13, 8)}`),
  },
  {
    id: "bo", name: "Con bò", say: "Con bò. Ụm bò!",
    svg: () => svg(`
      ${[132, 172, 216, 256].map((x) => `<rect x="${x - 2}" y="320" width="34" height="58" rx="10" fill="#fff" ${K}/><path d="M${x + 1} 364H${x + 29}" stroke="#6d5a4b" stroke-width="9"/>`).join("")}
      <ellipse cx="200" cy="292" rx="98" ry="72" fill="#fff" ${K}/>
      <ellipse cx="158" cy="286" rx="26" ry="18" fill="${INK}"/><ellipse cx="252" cy="306" rx="22" ry="16" fill="${INK}"/><ellipse cx="214" cy="330" rx="14" ry="9" fill="${INK}"/>
      <path d="M150 112Q126 90 134 66Q150 80 164 104Z" fill="#fff3d6" ${K}/><path d="M250 112Q274 90 266 66Q250 80 236 104Z" fill="#fff3d6" ${K}/>
      <ellipse cx="110" cy="146" rx="32" ry="15" transform="rotate(-18 110 146)" fill="#fff" ${K}/><ellipse cx="290" cy="146" rx="32" ry="15" transform="rotate(18 290 146)" fill="#fff" ${K}/>
      <ellipse cx="200" cy="172" rx="80" ry="74" fill="#fff" ${K}/>
      <ellipse cx="236" cy="134" rx="20" ry="16" fill="${INK}"/>
      <path d="M152 244Q200 262 248 244" fill="none" stroke="#ef5350" stroke-width="10" stroke-linecap="round"/>
      <circle cx="200" cy="262" r="14" fill="#ffd54f" ${K}/>
      <ellipse cx="200" cy="214" rx="58" ry="34" fill="#f8bbd0" ${K}/>
      <ellipse cx="182" cy="212" rx="6" ry="9" fill="${INK}"/><ellipse cx="218" cy="212" rx="6" ry="9" fill="${INK}"/>
      ${eye(166, 162)}${eye(234, 162)}`),
  },
  {
    id: "lon", name: "Con lợn", say: "Con lợn. Ụt ịt!",
    svg: () => svg(`
      <path d="M296 286C322 274 336 296 322 304C310 310 306 292 320 290" fill="none" ${K}/>
      ${[132, 172, 216, 256].map((x) => `<rect x="${x - 2}" y="320" width="34" height="58" rx="12" fill="#f8bbd0" ${K}/>`).join("")}
      <ellipse cx="200" cy="294" rx="100" ry="72" fill="#f8bbd0" ${K}/>
      <path d="M132 130L114 76Q150 76 168 110Z" fill="#f48fb1" ${K}/><path d="M268 130L286 76Q250 76 232 110Z" fill="#f48fb1" ${K}/>
      <ellipse cx="200" cy="180" rx="88" ry="76" fill="#f8bbd0" ${K}/>
      ${eye(162, 160)}${eye(238, 160)}
      <ellipse cx="134" cy="206" rx="15" ry="9" fill="#f06292" opacity=".45"/><ellipse cx="266" cy="206" rx="15" ry="9" fill="#f06292" opacity=".45"/>
      <ellipse cx="200" cy="206" rx="38" ry="27" fill="#f48fb1" ${K}/>
      <ellipse cx="186" cy="206" rx="7" ry="10" fill="${INK}"/><ellipse cx="214" cy="206" rx="7" ry="10" fill="${INK}"/>
      <path d="M182 240Q200 252 218 240" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`),
  },
  {
    id: "voi", name: "Con voi", say: "Con voi. Voi có cái vòi thật dài!",
    svg: () => svg(`
      <path d="M346 246Q372 250 370 282" fill="none" ${K}/><path d="M362 278L370 296L378 280Z" fill="${INK}"/>
      <rect x="148" y="286" width="48" height="88" rx="16" fill="#a9bdd0" ${K}/><rect x="268" y="286" width="48" height="88" rx="16" fill="#a9bdd0" ${K}/>
      <ellipse cx="240" cy="262" rx="122" ry="86" fill="#a9bdd0" ${K}/>
      <rect x="182" y="300" width="46" height="80" rx="16" fill="#a9bdd0" ${K}/><rect x="300" y="300" width="46" height="80" rx="16" fill="#a9bdd0" ${K}/>
      <path d="M190 370H220M308 370H338" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="206" cy="168" rx="66" ry="78" fill="#a9bdd0" ${K}/><ellipse cx="212" cy="170" rx="42" ry="54" fill="#f8bbd0"/>
      <circle cx="136" cy="176" r="78" fill="#a9bdd0" ${K}/>
      <path d="M96 222C70 260 64 304 90 330C102 342 124 334 116 318C100 294 108 262 132 240Z" fill="#a9bdd0" ${K}/>
      <path d="M104 290Q114 292 118 300M100 270Q110 272 114 280" fill="none" stroke="#7f96ad" stroke-width="4" stroke-linecap="round"/>
      ${eye(124, 160)}${cheek(162, 204)}
      <path d="M148 222Q160 236 176 230" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`),
  },
  {
    id: "khi", name: "Con khỉ", say: "Con khỉ. Khẹc khẹc!",
    svg: () => svg(`
      <path d="M262 338C330 348 362 304 352 262C346 238 318 240 322 262" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round"/>
      <path d="M262 338C330 348 362 304 352 262C346 238 318 240 322 262" fill="none" stroke="#a1704a" stroke-width="10" stroke-linecap="round"/>
      <ellipse cx="200" cy="298" rx="72" ry="72" fill="#a1704a" ${K}/>
      <ellipse cx="200" cy="312" rx="40" ry="46" fill="#ffe0c2" ${K}/>
      <ellipse cx="166" cy="366" rx="26" ry="15" fill="#ffe0c2" ${K}/><ellipse cx="234" cy="366" rx="26" ry="15" fill="#ffe0c2" ${K}/>
      <circle cx="108" cy="172" r="32" fill="#a1704a" ${K}/><circle cx="108" cy="172" r="17" fill="#ffe0c2"/>
      <circle cx="292" cy="172" r="32" fill="#a1704a" ${K}/><circle cx="292" cy="172" r="17" fill="#ffe0c2"/>
      <circle cx="200" cy="168" r="86" fill="#a1704a" ${K}/>
      <path d="M190 86Q198 66 214 78" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <path d="M200 126C226 102 272 112 268 150C266 168 258 176 262 192C266 232 236 252 200 252C164 252 134 232 138 192C142 176 134 168 132 150C128 112 174 102 200 126Z" fill="#ffe0c2" ${K}/>
      ${eye(172, 162)}${eye(228, 162)}${cheek(152, 208, 13, 8)}${cheek(248, 208, 13, 8)}
      <circle cx="192" cy="198" r="4" fill="${INK}"/><circle cx="208" cy="198" r="4" fill="${INK}"/>
      <path d="M172 216Q200 242 228 216" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`),
  },
  {
    id: "ech", name: "Con ếch", say: "Con ếch. Ộp ộp!",
    svg: () => svg(`
      <ellipse cx="114" cy="324" rx="46" ry="34" fill="#7cb342" ${K}/><ellipse cx="286" cy="324" rx="46" ry="34" fill="#7cb342" ${K}/>
      <ellipse cx="200" cy="300" rx="94" ry="70" fill="#8bc34a" ${K}/>
      <ellipse cx="200" cy="314" rx="54" ry="42" fill="#dcedc8" ${K}/>
      <ellipse cx="158" cy="366" rx="32" ry="14" fill="#8bc34a" ${K}/><ellipse cx="242" cy="366" rx="32" ry="14" fill="#8bc34a" ${K}/>
      <ellipse cx="200" cy="200" rx="122" ry="76" fill="#8bc34a" ${K}/>
      <circle cx="136" cy="128" r="46" fill="#8bc34a" ${K}/><circle cx="264" cy="128" r="46" fill="#8bc34a" ${K}/>
      <circle cx="136" cy="128" r="30" fill="#fff" ${K}/><circle cx="264" cy="128" r="30" fill="#fff" ${K}/>
      ${eye(140, 130, 14, 17)}${eye(260, 130, 14, 17)}
      ${cheek(112, 226, 17, 10)}${cheek(288, 226, 17, 10)}
      <path d="M128 216Q200 272 272 216" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`),
  },
  {
    id: "ca", name: "Con cá", say: "Con cá. Cá bơi tung tăng!",
    svg: () => svg(`
      <path d="M300 210L372 156Q386 210 372 264Z" fill="#ffd54f" ${K}/>
      <path d="M140 140Q196 76 264 144Z" fill="#ffd54f" ${K}/><path d="M168 284Q196 330 240 286Z" fill="#ffd54f" ${K}/>
      <ellipse cx="200" cy="212" rx="122" ry="86" fill="#4fc3f7" ${K}/>
      <circle cx="226" cy="180" r="14" fill="#b3e5fc"/><circle cx="264" cy="214" r="12" fill="#b3e5fc"/><circle cx="222" cy="244" r="16" fill="#b3e5fc"/><circle cx="182" cy="158" r="9" fill="#b3e5fc"/>
      <path d="M200 280Q186 212 200 144" fill="none" stroke="#29a8e0" stroke-width="5" stroke-linecap="round"/>
      ${eye(132, 196, 15, 18)}${cheek(150, 236, 15, 9)}
      <path d="M90 228Q100 238 112 228" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="64" cy="128" r="12" fill="#e1f5fe" stroke="#6cc7f0" stroke-width="4"/><circle cx="88" cy="92" r="8" fill="#e1f5fe" stroke="#6cc7f0" stroke-width="4"/>
      <path d="M40 346Q70 326 100 346T160 346T220 346T280 346T340 346" fill="none" stroke="#6cc7f0" stroke-width="7" stroke-linecap="round"/>`),
  },
  {
    id: "rua", name: "Con rùa", say: "Con rùa. Rùa bò chậm chậm!",
    svg: () => svg(`
      <path d="M318 304L356 294L330 324Z" fill="#9ccc65" ${K}/>
      <ellipse cx="140" cy="340" rx="30" ry="28" fill="#9ccc65" ${K}/><ellipse cx="270" cy="340" rx="30" ry="28" fill="#9ccc65" ${K}/>
      <path d="M110 316C110 162 300 162 318 316Z" fill="#66bb6a" ${K}/>
      <ellipse cx="212" cy="230" rx="36" ry="26" fill="#a5d6a7" ${K}/>
      <ellipse cx="152" cy="280" rx="22" ry="20" fill="#a5d6a7" ${K}/><ellipse cx="274" cy="280" rx="22" ry="20" fill="#a5d6a7" ${K}/>
      <ellipse cx="212" cy="290" rx="26" ry="14" fill="#a5d6a7" ${K}/>
      <path d="M96 312Q212 294 332 312Q338 328 326 338Q212 322 104 338Q90 326 96 312Z" fill="#c5e1a5" ${K}/>
      <circle cx="90" cy="252" r="48" fill="#9ccc65" ${K}/>
      ${eye(98, 240, 10, 13)}${cheek(120, 266, 12, 8)}
      <path d="M72 270Q86 282 102 272" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`),
  },
  {
    id: "chim-canh-cut", name: "Chim cánh cụt", say: "Chim cánh cụt. Lạch bạch, lạch bạch!",
    svg: () => svg(`
      <ellipse cx="168" cy="372" rx="28" ry="12" fill="#ff9f43" ${K}/><ellipse cx="232" cy="372" rx="28" ry="12" fill="#ff9f43" ${K}/>
      <path d="M116 206C86 246 76 300 92 332C118 318 134 282 142 238Z" fill="#37474f" ${K}/>
      <path d="M284 206C314 246 324 300 308 332C282 318 266 282 258 238Z" fill="#37474f" ${K}/>
      <path d="M200 66C282 66 302 160 298 230C302 302 272 366 200 366C128 366 98 302 102 230C98 160 118 66 200 66Z" fill="#455a64" ${K}/>
      <path d="M200 128C170 102 126 118 134 168C138 200 150 220 146 260C146 318 170 350 200 350C230 350 254 318 254 260C250 220 262 200 266 168C274 118 230 102 200 128Z" fill="#fff" ${K}/>
      ${eye(174, 162)}${eye(226, 162)}${cheek(156, 200, 13, 8)}${cheek(244, 200, 13, 8)}
      <path d="M182 186H218L200 210Z" fill="#ff9f43" ${K}/>`),
  },
  {
    id: "ga", name: "Con gà", say: "Con gà. Ò ó o!",
    svg: () => svg(`
      <path d="M150 212C100 170 70 120 92 96C112 104 120 150 158 190Z" fill="#ef5350" ${K}/>
      <path d="M140 220C80 196 50 150 64 120C86 124 102 170 150 204Z" fill="#ff9f43" ${K}/>
      <path d="M134 236C78 230 44 196 48 164C70 162 92 204 142 222Z" fill="#ffd54f" ${K}/>
      <path d="M180 340L172 380M174 380H156M174 380L166 368M232 340L240 380M240 380H258M240 380L248 368" fill="none" stroke="#ff9f43" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="206" cy="262" rx="104" ry="90" fill="#fff" ${K}/>
      <path d="M150 246C170 300 230 300 250 258C220 268 180 262 150 246Z" fill="#fff3e0" ${K}/>
      <path d="M240 112A16 16 0 0 1 268 102A16 16 0 0 1 296 108A15 15 0 0 1 310 132L244 136Z" fill="#ef5350" ${K}/>
      <circle cx="270" cy="168" r="58" fill="#fff" ${K}/>
      <path d="M322 156L356 170L322 184Z" fill="#ffd54f" ${K}/>
      <path d="M318 188C330 196 330 220 316 222C304 222 304 200 312 190Z" fill="#ef5350" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      ${eye(286, 156, 10, 13)}${cheek(258, 188, 12, 8)}`),
  },
];
