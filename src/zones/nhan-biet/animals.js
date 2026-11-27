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
  // ---- generated: sea animals, dragon, tiger (gen_sea_animals.py) ----
  {
    id: "ca-chep", name: "Con cá chép", say: "Con cá chép. Cá chép vẫy đuôi tung tăng!",
    svg: () => svg(`
      <path d="M296 200C330 160 370 140 384 150C372 180 372 230 384 262C370 272 330 252 296 214Z" fill="#ef5350" ${K}/>
      <path d="M150 140C180 94 250 98 280 150Z" fill="#ef5350" ${K}/>
      <path d="M150 262Q170 312 214 278Z" fill="#ef5350" ${K}/>
      <ellipse cx="200" cy="206" rx="120" ry="70" fill="#fff3e0" ${K}/>
      <ellipse cx="222" cy="180" rx="40" ry="25" fill="#ff7043"/>
      <ellipse cx="270" cy="226" rx="24" ry="17" fill="#ff7043"/>
      <ellipse cx="122" cy="178" rx="24" ry="18" fill="#ff7043"/>
      <path d="M176 222Q186 234 196 222M206 232Q216 244 226 232M232 196Q242 208 252 196" fill="none" stroke="#e3b98c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="108" cy="200" rx="11" ry="13" fill="${INK}"/>
      <circle cx="111.8" cy="194.8" r="4.2" fill="#fff"/>
      <ellipse cx="136" cy="230" rx="12" ry="8" fill="#f8a5c2"/>
      <path d="M82 216Q88 222 94 216" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M86 224Q70 238 74 256" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`),
  },
  {
    id: "ca-he", name: "Con cá hề", say: "Con cá hề. Cá hề có sọc trắng thật xinh!",
    svg: () => svg(`
      <path d="M296 206L356 160Q372 206 356 252Z" fill="#ff8a3d" ${K}/>
      <path d="M150 142Q200 98 260 148Z" fill="#ff8a3d" ${K}/>
      <path d="M170 272Q200 312 236 274Z" fill="#ff8a3d" ${K}/>
      <ellipse cx="200" cy="208" rx="116" ry="72" fill="#ff8a3d" ${K}/>
      <path d="M128 152Q146 208 128 264Q146 272 160 268Q176 208 158 146Q142 144 128 152Z" fill="#fff" ${K}/>
      <path d="M210 138Q228 208 210 278Q226 282 240 276Q256 208 238 140Q224 134 210 138Z" fill="#fff" ${K}/>
      <path d="M290 174Q300 208 290 242Q300 246 307 240Q312 208 306 176Q298 170 290 174Z" fill="#fff" ${K}/>
      <ellipse cx="108" cy="196" rx="11" ry="14" fill="${INK}"/>
      <circle cx="111.8" cy="190.4" r="4.2" fill="#fff"/>
      <ellipse cx="106" cy="230" rx="10" ry="7" fill="#f8a5c2"/>
      <path d="M86 222Q93 230 101 222" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`),
  },
  {
    id: "ca-noc", name: "Con cá nóc", say: "Con cá nóc. Cá nóc phồng tròn như quả bóng!",
    svg: () => svg(`
      <path d="M272 264L287.6 297.6L254 282Z" fill="#ffd54f" ${K}/>
      <path d="M241.2 290.5L242.8 327.5L217.8 300.2Z" fill="#ffd54f" ${K}/>
      <path d="M202.7 303.2L190 338L177.3 303.2Z" fill="#ffd54f" ${K}/>
      <path d="M162.2 300.2L137.2 327.5L138.8 290.5Z" fill="#ffd54f" ${K}/>
      <path d="M126 282L92.4 297.6L108 264Z" fill="#ffd54f" ${K}/>
      <path d="M108 136L92.4 102.4L126 118Z" fill="#ffd54f" ${K}/>
      <path d="M138.8 109.5L137.2 72.5L162.2 99.8Z" fill="#ffd54f" ${K}/>
      <path d="M177.3 96.8L190 62L202.7 96.8Z" fill="#ffd54f" ${K}/>
      <path d="M217.8 99.8L242.8 72.5L241.2 109.5Z" fill="#ffd54f" ${K}/>
      <path d="M254 118L287.6 102.4L272 136Z" fill="#ffd54f" ${K}/>
      <path d="M290 200L346 164Q360 200 346 236Z" fill="#ffca28" ${K}/>
      <circle cx="190" cy="200" r="110" fill="#ffe082" ${K}/>
      <ellipse cx="190" cy="262" rx="70" ry="32" fill="#fff8e1"/>
      <circle cx="160" cy="140" r="8" fill="#f2b134"/>
      <circle cx="212" cy="128" r="7" fill="#f2b134"/>
      <circle cx="246" cy="160" r="8" fill="#f2b134"/>
      <circle cx="142" cy="176" r="6" fill="#f2b134"/>
      <circle cx="260" cy="200" r="6" fill="#f2b134"/>
      <ellipse cx="236" cy="222" rx="26" ry="15" transform="rotate(-20 236 222)" fill="#ffca28" ${K}/>
      <ellipse cx="128" cy="186" rx="13" ry="15" fill="${INK}"/>
      <circle cx="132.6" cy="180" r="4.9" fill="#fff"/>
      <ellipse cx="150" cy="228" rx="13" ry="8" fill="#f8a5c2"/>
      <ellipse cx="90" cy="214" rx="10" ry="12" fill="#ff8a80" ${K}/>`),
  },
  {
    id: "ca-vang", name: "Con cá vàng", say: "Con cá vàng. Cá vàng bơi trong bể nước!",
    svg: () => svg(`
      <path d="M276 200C320 150 372 140 380 170C370 196 344 206 330 210C344 214 370 224 380 250C372 280 320 270 276 220Z" fill="#ffa726" ${K}/>
      <path d="M168 128C188 72 250 82 262 144Z" fill="#ffa726" ${K}/>
      <path d="M180 272Q190 322 230 282Z" fill="#ffa726" ${K}/>
      <ellipse cx="190" cy="206" rx="100" ry="82" fill="#ffb300" ${K}/>
      <path d="M300 200Q340 180 362 174M300 220Q340 236 362 244" fill="none" stroke="#e08a00" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="130" cy="190" rx="13" ry="15" fill="${INK}"/>
      <circle cx="134.6" cy="184" r="4.9" fill="#fff"/>
      <ellipse cx="152" cy="228" rx="13" ry="8" fill="#f8a5c2"/>
      <path d="M98 214Q104 222 112 214" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="60" cy="120" r="12" fill="#e1f5fe" ${K}/>
      <circle cx="84" cy="84" r="8" fill="#e1f5fe" ${K}/>`),
  },
  {
    id: "sao-bien", name: "Con sao biển", say: "Con sao biển. Sao biển có năm cánh!",
    svg: () => svg(`
      <path d="M155.3 152.5L189.4 75.8Q200 52 210.6 75.8L244.7 152.5L328.2 161.2Q354.1 163.9 334.7 181.3L272.3 237.5L289.8 319.6Q295.2 345.1 272.7 332L200 290L127.3 332Q104.8 345.1 110.2 319.6L127.7 237.5L65.3 181.3Q45.9 163.9 71.8 161.2L155.3 152.5Z" fill="#ff8a65" ${K}/>
      <circle cx="200" cy="102" r="10" fill="#ffccbc"/>
      <circle cx="306.5" cy="179.4" r="10" fill="#ffccbc"/>
      <circle cx="265.8" cy="304.6" r="10" fill="#ffccbc"/>
      <circle cx="134.2" cy="304.6" r="10" fill="#ffccbc"/>
      <circle cx="93.5" cy="179.4" r="10" fill="#ffccbc"/>
      <ellipse cx="176" cy="198" rx="10" ry="13" fill="${INK}"/>
      <circle cx="179.5" cy="192.8" r="3.8" fill="#fff"/>
      <ellipse cx="224" cy="198" rx="10" ry="13" fill="${INK}"/>
      <circle cx="227.5" cy="192.8" r="3.8" fill="#fff"/>
      <ellipse cx="158" cy="226" rx="11" ry="7" fill="#f8a5c2"/>
      <ellipse cx="242" cy="226" rx="11" ry="7" fill="#f8a5c2"/>
      <path d="M182 228Q200 246 218 228" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`),
  },
  {
    id: "rong", name: "Con rồng", say: "Con rồng. Rồng bay lên trời cao!",
    svg: () => svg(`
      <path d="M270 330C340 340 370 300 360 262C356 246 346 248 344 260C344 290 316 310 270 306Z" fill="#66bb6a" ${K}/>
      <path d="M342 262L336 228L370 246Z" fill="#ffca28" ${K}/>
      <path d="M130 230C90 200 70 150 92 132C104 160 120 170 140 176C130 150 140 130 156 124C160 160 166 196 160 236Z" fill="#a5d6a7" ${K}/>
      <path d="M270 230C310 200 330 150 308 132C296 160 280 170 260 176C270 150 260 130 244 124C240 160 234 196 240 236Z" fill="#a5d6a7" ${K}/>
      <ellipse cx="200" cy="296" rx="82" ry="76" fill="#66bb6a" ${K}/>
      <ellipse cx="200" cy="312" rx="46" ry="52" fill="#fff59d" ${K}/>
      <path d="M164 296H236M160 320H240M168 344H232" fill="none" stroke="#e0c24a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="166" cy="366" rx="28" ry="16" fill="#66bb6a" ${K}/>
      <ellipse cx="234" cy="366" rx="28" ry="16" fill="#66bb6a" ${K}/>
      <path d="M168 92L180 64L194 88Z" fill="#ffca28" ${K}/>
      <path d="M196 86L210 56L224 86Z" fill="#ffca28" ${K}/>
      <path d="M226 92L240 66L250 96Z" fill="#ffca28" ${K}/>
      <path d="M138 114L122 76Q136 72 154 102Z" fill="#fff3d6" ${K}/>
      <path d="M262 114L278 76Q264 72 246 102Z" fill="#fff3d6" ${K}/>
      <ellipse cx="200" cy="172" rx="96" ry="80" fill="#66bb6a" ${K}/>
      <ellipse cx="200" cy="208" rx="50" ry="32" fill="#81c784" ${K}/>
      <ellipse cx="186" cy="202" rx="5" ry="6" fill="${INK}"/>
      <ellipse cx="214" cy="202" rx="5" ry="6" fill="${INK}"/>
      <ellipse cx="158" cy="158" rx="13" ry="16" fill="${INK}"/>
      <circle cx="162.6" cy="151.6" r="4.9" fill="#fff"/>
      <ellipse cx="242" cy="158" rx="13" ry="16" fill="${INK}"/>
      <circle cx="246.6" cy="151.6" r="4.9" fill="#fff"/>
      <ellipse cx="124" cy="198" rx="14" ry="9" fill="#f8a5c2"/>
      <ellipse cx="276" cy="198" rx="14" ry="9" fill="#f8a5c2"/>
      <path d="M180 222Q200 236 220 222" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`),
  },
  {
    id: "ho", name: "Con hổ", say: "Con hổ. Hổ kêu gừm gừm!",
    svg: () => svg(`
      <path d="M262 340C336 340 356 272 326 236C314 222 296 232 304 248C322 280 306 314 262 314Z" fill="#ffa726" ${K}/>
      <path d="M318 256L338 250M324 282L344 284M306 306L318 322" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="200" cy="292" rx="84" ry="80" fill="#ffa726" ${K}/>
      <ellipse cx="200" cy="310" rx="46" ry="52" fill="#fff3e0" ${K}/>
      <path d="M126 268Q140 274 144 288M274 268Q260 274 256 288M122 300Q136 304 140 316M278 300Q264 304 260 316" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="166" cy="366" rx="28" ry="16" fill="#ffa726" ${K}/>
      <ellipse cx="234" cy="366" rx="28" ry="16" fill="#ffa726" ${K}/>
      <circle cx="126" cy="104" r="28" fill="#ffa726" ${K}/>
      <circle cx="126" cy="104" r="13" fill="#fff3e0"/>
      <circle cx="274" cy="104" r="28" fill="#ffa726" ${K}/>
      <circle cx="274" cy="104" r="13" fill="#fff3e0"/>
      <ellipse cx="200" cy="172" rx="100" ry="84" fill="#ffa726" ${K}/>
      <path d="M184 96L190 118M200 92V120M216 96L210 118" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M104 164L128 172M102 186L126 186M296 164L272 172M298 186L274 186" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="200" cy="212" rx="52" ry="34" fill="#fff3e0" ${K}/>
      <path d="M188 196Q200 189 212 196Q206 208 200 208Q194 208 188 196Z" fill="#ef7a9a" ${K}/>
      <path d="M182 224Q191 234 200 222Q209 234 218 224" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="160" cy="162" rx="12" ry="15" fill="${INK}"/>
      <circle cx="164.2" cy="156" r="4.6" fill="#fff"/>
      <ellipse cx="240" cy="162" rx="12" ry="15" fill="${INK}"/>
      <circle cx="244.2" cy="156" r="4.6" fill="#fff"/>
      <ellipse cx="140" cy="216" rx="12" ry="8" fill="#f8a5c2"/>
      <ellipse cx="260" cy="216" rx="12" ry="8" fill="#f8a5c2"/>`),
  },
  {
    id: "ca-duoi", name: "Con cá đuối", say: "Con cá đuối. Cá đuối bơi như đang bay!",
    svg: () => svg(`
      <path d="M194 286Q208 336 190 380L200 384Q220 336 206 286Z" fill="#90caf9" ${K}/>
      <path d="M200 110C240 110 300 160 370 200C320 222 260 262 200 292C140 262 80 222 30 200C100 160 160 110 200 110Z" fill="#90caf9" ${K}/>
      <circle cx="116" cy="198" r="10" fill="#e3f2fd"/>
      <circle cx="284" cy="198" r="10" fill="#e3f2fd"/>
      <circle cx="148" cy="228" r="8" fill="#e3f2fd"/>
      <circle cx="252" cy="228" r="8" fill="#e3f2fd"/>
      <circle cx="200" cy="254" r="8" fill="#e3f2fd"/>
      <ellipse cx="176" cy="170" rx="11" ry="14" fill="${INK}"/>
      <circle cx="179.8" cy="164.4" r="4.2" fill="#fff"/>
      <ellipse cx="224" cy="170" rx="11" ry="14" fill="${INK}"/>
      <circle cx="227.8" cy="164.4" r="4.2" fill="#fff"/>
      <ellipse cx="158" cy="196" rx="12" ry="7" fill="#f8a5c2"/>
      <ellipse cx="242" cy="196" rx="12" ry="7" fill="#f8a5c2"/>
      <path d="M184 202Q200 216 216 202" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="326" cy="98" r="12" fill="#e1f5fe" ${K}/>
      <circle cx="350" cy="66" r="8" fill="#e1f5fe" ${K}/>`),
  },
  // ---- end generated ----
];
