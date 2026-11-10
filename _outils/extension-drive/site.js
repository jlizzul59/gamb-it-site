// Côté Semainier : signale la présence de l'extension et reçoit la liste de courses à envoyer au drive.
(() => {
  "use strict";
  document.documentElement.setAttribute("data-semainier-ext", "1");
  window.addEventListener("message", (e) => {
    if (e.source !== window || e.origin !== location.origin) return;
    const d = e.data;
    if (!d || d.source !== "semainier" || d.type !== "drive-list" || !Array.isArray(d.items)) return;
    const s = (v, n) => String(v == null ? "" : v).slice(0, n);
    const items = d.items.slice(0, 200)
      .map((x) => ({ key: s(x.key, 80), q: s(x.q, 80), label: s(x.label, 120), need: s(x.need, 60), amt: +x.amt || 0, u: s(x.u, 10) }))
      .filter((x) => x.key && x.q);
    chrome.storage.local.set({ semainierRun: { items, i: 0, active: true, t: Date.now() } }, () =>
      window.postMessage({ source: "semainier-ext", type: "drive-ok", n: items.length }, location.origin));
  });
})();
