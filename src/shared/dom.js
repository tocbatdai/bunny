// Small helpers shared by every zone.

export const $ = (s) => document.querySelector(s);

// Saved settings and progress. The "bvv:" prefix is kept from Bé Vẽ Vui so nothing saved is lost.
export const store = {
  get(k, fallback) { try { const v = localStorage.getItem("bvv:" + k); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } },
  set(k, v) { try { localStorage.setItem("bvv:" + k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem("bvv:" + k); } catch {} },
};

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(() => resolve(img));
    img.onerror = () => reject(new Error("image " + src));
    img.src = src;
  });
}

// Optional real full screen for browsers (the installed app is already full screen).
export function bindFullscreenButton(btn) {
  const root = document.documentElement;
  const can = !!(root.requestFullscreen || root.webkitRequestFullscreen) && !matchMedia("(display-mode: fullscreen), (display-mode: standalone)").matches;
  if (!can) return;
  btn.hidden = false;
  btn.addEventListener("click", () => {
    const active = document.fullscreenElement || document.webkitFullscreenElement;
    try {
      const p = active ? (document.exitFullscreen || document.webkitExitFullscreen).call(document) : (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
      if (p && p.catch) p.catch(() => {});
    } catch {}
  });
}
