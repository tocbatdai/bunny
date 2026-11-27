// Hash router: "#/ve" is the colouring gallery, "#/ve/<id>" one picture, and so on per zone.
// Every screen change goes through history, so the on-screen Home button, Esc and the phone's
// Back button behave the same. A zone is a module loaded the first time it is visited, with
//   show(rest)  draw the screen for the path after the zone name (rest = [] for its start screen)
//   leave()     another zone takes over: stop sounds, hide its screens.
const zones = new Map();      // name -> () => import(...)
const loaded = new Map();     // name -> module
const listeners = [];
let defaultPath = "", active = null, shown = null, renderToken = 0;

export function registerZone(name, load) { zones.set(name, load); }
export function onRoute(fn) { listeners.push(fn); }
export const currentPath = () => location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);

const depth = () => (history.state && history.state.depth) || 0;
export function navigate(path, { replace = false } = {}) {
  const url = "#/" + String(path).replace(/^\/+/, "");
  if (replace) history.replaceState({ depth: depth() }, "", url);
  else history.pushState({ depth: depth() + 1 }, "", url);
  render();
}
// Go back one screen if the app put one there; otherwise (opened straight on a deep link) go to fallback.
export function back(fallback) {
  if (depth() > 0) history.back(); else navigate(fallback, { replace: true });
}

async function render() {
  const seg = currentPath();
  if (!seg.length || !zones.has(seg[0])) { navigate(defaultPath, { replace: true }); return; }
  const key = seg.join("/");
  if (key === shown) return;   // popstate and hashchange can both report the same change
  shown = key;
  const token = ++renderToken;
  let zone = loaded.get(seg[0]);
  if (!zone) {
    try { zone = await zones.get(seg[0])(); } catch (err) { console.error(err); shown = null; return; }
    loaded.set(seg[0], zone);
    if (token !== renderToken) return;
  }
  if (active && active !== zone) active.leave();
  active = zone;
  zone.show(seg.slice(1));
  for (const fn of listeners) fn(seg);
}

export function startRouter(start) {
  defaultPath = start;
  window.addEventListener("popstate", render);
  window.addEventListener("hashchange", render);
  render();
}
