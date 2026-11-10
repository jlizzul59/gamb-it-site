// Côté auchan.fr : parcourt la liste envoyée par le Semainier et ajoute les articles au panier.
// - Article déjà connu : sa fiche produit s'ouvre et il est ajouté tout seul.
// - Article nouveau : la recherche s'ouvre, vous cliquez « Ajouter au panier » sur le produit voulu,
//   et ce choix est mémorisé pour les fois suivantes.
// Rien n'est jamais commandé ni payé : l'extension ne fait que remplir le panier.
(() => {
  "use strict";
  if (window.__semainierDrive) return;
  window.__semainierDrive = 1;

  const RUN = "semainierRun", PROD = "semainierProducts";
  const ext = typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;
  const get = (k) => ext ? new Promise((r) => chrome.storage.local.get(k, (o) => r(o[k])))
    : Promise.resolve(JSON.parse(localStorage.getItem("__" + k) || "null"));
  const set = (k, v) => ext ? new Promise((r) => chrome.storage.local.set({ [k]: v }, r))
    : Promise.resolve(localStorage.setItem("__" + k, JSON.stringify(v)));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const ADD = 'button[data-action="INCREASE"]';
  const visible = (el) => !!el && el.getBoundingClientRect().width > 0;
  const findAdd = (id) => [...document.querySelectorAll(ADD)].find((b) => b.dataset.productId === id && visible(b));
  const qtyOf = (btn) => { const w = btn && btn.closest(".quantity-selector"), i = w && w.querySelector("input.qa2c-quantity"); return i ? parseInt(i.value, 10) || 0 : 0; };
  const waitFor = async (fn, ms) => { const t = Date.now(); for (;;) { const v = fn(); if (v) return v; if (Date.now() - t > ms) return null; await sleep(300); } };
  const txt = (root, sel) => { const e = root.querySelector(sel); return e ? e.textContent.replace(/\s+/g, " ").trim() : ""; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // « 1 kg », « 500 g », « 6 x 125 g », « 75 cl » → contenance en g ou en ml
  function packOf(t) {
    t = String(t || "").toLowerCase().replace(/,/g, ".");
    let k = 1, v, u, m = t.match(/(\d+)\s*x\s*(\d+(?:\.\d+)?)\s*(kg|g|cl|ml|l)\b/);
    if (m) { k = +m[1]; v = +m[2]; u = m[3]; }
    else { m = t.match(/(\d+(?:\.\d+)?)\s*(kg|g|cl|ml|l)\b/); if (!m) return null; v = +m[1]; u = m[2]; }
    const f = { kg: 1000, g: 1, l: 1000, cl: 10, ml: 1 }[u];
    return { v: k * v * f, dim: u === "kg" || u === "g" ? "g" : "ml" };
  }
  // Nombre de paquets à mettre au panier pour couvrir la quantité de la liste (1 si on ne sait pas, 6 au plus)
  function unitsFor(it, p) {
    if (!p || !p.pack || !(it.amt > 0) || it.u !== p.pack.dim || !(p.pack.v > 0)) return 1;
    return Math.max(1, Math.min(6, Math.ceil(it.amt / p.pack.v - 0.05)));
  }

  let run = null, prods = {}, waiting = false, busy = false, host = null, root = null;

  async function tick() { if (busy) return; busy = true; try { await step(); } catch (e) { render("Un imprévu est survenu : " + e.message); } finally { busy = false; } }

  async function step() {
    for (;;) {
      run = await get(RUN); prods = (await get(PROD)) || {};
      if (!run || !Array.isArray(run.items)) { hide(); return; }
      if (!run.active) { render(); return; }
      const it = run.items[run.i];
      if (!it) { run.active = false; run.finished = true; await set(RUN, run); render(); return; }
      const p = prods[it.key];
      if (p && !it.search) {
        if (location.pathname !== p.path) {
          if (it.tried) { it.search = true; it.note = "Produit habituel introuvable : choisissez-en un autre."; await set(RUN, run); continue; }
          it.tried = true; await set(RUN, run); render("Ouverture de « " + p.label + " »…"); location.href = p.path; return;
        }
        render("Ajout de « " + p.label + " »…");
        const b = await waitFor(() => findAdd(p.id), 9000);
        if (!b) { it.search = true; it.note = "Produit habituel indisponible : choisissez-en un autre."; await set(RUN, run); continue; }
        const want = unitsFor(it, p); let have = qtyOf(b);
        for (let n = have; n < want; n++) {
          (findAdd(p.id) || b).click();
          await waitFor(() => qtyOf(findAdd(p.id) || b) > n, 7000);
          await sleep(700);
        }
        have = qtyOf(findAdd(p.id) || b);
        if (have < 1) { it.search = true; it.note = "L'ajout automatique n'a pas fonctionné : ajoutez-le à la main."; await set(RUN, run); continue; }
        it.status = "ok"; it.n = have; run.i++; await set(RUN, run);
        render("✓ " + p.label + " × " + have); await sleep(1500); continue;
      }
      // article sans produit mémorisé : recherche, puis choix à la main
      if (!it.searched) {
        it.searched = true; await set(RUN, run);
        if (!(location.pathname === "/recherche" && new URLSearchParams(location.search).get("text") === it.q)) {
          render("Recherche de « " + it.q + " »…"); location.href = "/recherche?text=" + encodeURIComponent(it.q); return;
        }
      }
      waiting = true; render(); return;
    }
  }

  // Choix à la main : le premier « Ajouter au panier » cliqué devient le produit habituel de cet article.
  document.addEventListener("click", async (e) => {
    if (!waiting || !run || !run.active) return;
    const b = e.target && e.target.closest ? e.target.closest(ADD) : null;
    if (!b || (host && host.contains(e.target))) return;
    const it = run.items[run.i]; if (!it) return;
    waiting = false;
    const id = b.dataset.productId, art = b.closest("article.product-thumbnail");
    let path = "", label = "", attr = "";
    if (art) { const a = art.querySelector('a[href*="/pr-"]'); path = a ? new URL(a.getAttribute("href"), location.origin).pathname : ""; label = txt(art, ".product-thumbnail__description"); attr = txt(art, ".product-attribute"); }
    else if (/\/pr-/.test(location.pathname)) { path = location.pathname; label = txt(document, "h1"); attr = txt(document, ".product-attribute") || document.title; }
    if (id && path) { prods = (await get(PROD)) || {}; prods[it.key] = { id, path, label: (label + " " + attr).trim() || it.label, pack: packOf(attr) }; await set(PROD, prods); }
    it.status = "ok"; it.n = 1; run.i++; await set(RUN, run);
    render("✓ " + (label || it.label) + (id && path ? " : mémorisé pour les prochaines fois." : " ajouté."));
    await sleep(2500); tick();
  }, true);

  // ---------- Panneau ----------
  function hide() { if (host) { host.remove(); host = null; root = null; } }
  function mount() {
    if (host && document.documentElement.contains(host)) return;
    host = document.createElement("div"); host.id = "semainier-drive";
    host.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:2147483647;width:330px;max-width:calc(100vw - 32px)";
    root = host.attachShadow({ mode: "open" });
    root.addEventListener("click", onPanelClick);
    document.documentElement.appendChild(host);
  }
  const CSS = `:host{all:initial}*{box-sizing:border-box}
  .p{font:14px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;color:#1d2a1f;background:#fff;border:1px solid #cfd8cf;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.22);overflow:hidden}
  .h{display:flex;justify-content:space-between;align-items:center;gap:8px;background:#2f6b3a;color:#fff;padding:9px 12px;font-weight:600}
  .h small{font-weight:400;opacity:.9;font-variant-numeric:tabular-nums}
  .bar{height:4px;background:#dfe7df}.bar i{display:block;height:100%;background:#2f6b3a}
  .b{padding:12px;display:flex;flex-direction:column;gap:8px}
  .n{font-size:16px;font-weight:700}.q{color:#55635a;font-size:13px}.m{font-size:13.5px}.note{color:#8a5a00;font-size:13px}
  .a{display:flex;flex-wrap:wrap;gap:6px}
  button{font:inherit;font-size:13px;font-weight:600;border:1px solid #cfd8cf;background:#f3f6f3;color:#1d2a1f;border-radius:999px;padding:5px 12px;cursor:pointer}
  button.pri{background:#2f6b3a;border-color:#2f6b3a;color:#fff}button.link{border:0;background:none;padding:0 2px;color:#2f6b3a;text-decoration:underline;font-weight:400}
  ul{list-style:none;margin:0;padding:0;max-height:220px;overflow:auto;border-top:1px solid #e3e9e3}
  li{display:flex;justify-content:space-between;gap:8px;padding:5px 0;border-bottom:1px solid #eef2ee;font-size:13px}li span:first-child{min-width:0}
  .ok{color:#2f6b3a}.sk{color:#8a5a00}`;
  function render(msg) {
    if (!run) return; mount();
    const n = run.items.length, i = Math.min(run.i, n), it = run.items[run.i];
    const okN = run.items.filter((x) => x.status === "ok").length, skN = run.items.filter((x) => x.status === "skip").length;
    let body;
    if (run.finished || !it) {
      body = `<div class="n">Terminé 🎉</div><div class="m">${okN} article${okN > 1 ? "s" : ""} au panier${skN ? `, ${skN} passé${skN > 1 ? "s" : ""}` : ""}. Vérifiez les quantités dans votre panier avant de commander.</div>
        <ul>${run.items.map((x) => `<li><span>${esc(x.label)} <span class="q">${esc(x.need)}</span></span><span class="${x.status === "ok" ? "ok" : "sk"}">${x.status === "ok" ? "✓" + (x.n > 1 ? " × " + x.n : "") : "passé"}${prods[x.key] ? ` <button class="link" data-forget="${esc(x.key)}" title="Oublier le produit mémorisé : il vous sera redemandé la prochaine fois">changer</button>` : ""}</span></li>`).join("")}</ul>
        <div class="a"><button class="pri" data-act="stop">Fermer</button></div>`;
    } else if (!run.active) {
      body = `<div class="n">En pause</div><div class="m">Prochain article : ${esc(it.label)}</div><div class="a"><button class="pri" data-act="resume">Reprendre</button><button data-act="stop">Arrêter</button></div>`;
    } else {
      const m = msg || (waiting ? "Cliquez sur « Ajouter au panier » du produit qui vous convient. Votre choix sera mémorisé pour les prochaines fois." : "…");
      body = `<div class="n">${esc(it.label)}</div>${it.need ? `<div class="q">Quantité de la liste : ${esc(it.need)}</div>` : ""}${it.note && waiting ? `<div class="note">${esc(it.note)}</div>` : ""}<div class="m">${esc(m)}</div>
        <div class="a"><button data-act="skip">Passer</button><button data-act="pause">Pause</button><button data-act="stop">Arrêter</button></div>`;
    }
    root.innerHTML = `<style>${CSS}</style><div class="p"><div class="h"><span>🍽️ Semainier → Auchan</span><small>${i} / ${n}</small></div><div class="bar"><i style="width:${n ? Math.round(i / n * 100) : 0}%"></i></div><div class="b">${body}</div></div>`;
  }
  async function onPanelClick(e) {
    const f = e.target.closest("[data-forget]");
    if (f) { prods = (await get(PROD)) || {}; delete prods[f.dataset.forget]; await set(PROD, prods); render(); return; }
    const b = e.target.closest("[data-act]"); if (!b || !run) return;
    const a = b.dataset.act;
    if (a === "stop") { waiting = false; await set(RUN, null); run = null; hide(); return; }
    if (a === "pause") { waiting = false; run.active = false; await set(RUN, run); render(); return; }
    if (a === "resume") { run.active = true; await set(RUN, run); tick(); return; }
    if (a === "skip") { const it = run.items[run.i]; if (it) { it.status = "skip"; run.i++; } waiting = false; await set(RUN, run); tick(); }
  }

  tick();
})();
