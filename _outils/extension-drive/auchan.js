// Côté auchan.fr : remplit le panier à partir de la liste envoyée par le Semainier, sans changer de page.
// - Article déjà connu : ajouté directement au panier, en arrière-plan.
// - Article nouveau : les résultats de recherche s'affichent dans le panneau ; vous choisissez le produit,
//   il est ajouté et mémorisé pour les fois suivantes.
// L'extension ne fait qu'ajouter au panier : elle ne retire rien, ne commande et ne paie jamais.
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
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();

  // ---------- Accès au site Auchan (mêmes requêtes que le site lui-même) ----------
  const cookie = (n) => { const x = document.cookie.split(/;\s*/).find((c) => c.startsWith(n + "=")); return x ? decodeURIComponent(x.slice(n.length + 1)) : null; };
  const H = { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" };
  async function getCart() {
    const r = await fetch("/cart?" + new URLSearchParams({ consentId: cookie("lark-consentId") || "" }), { headers: H, credentials: "include" });
    if (!r.ok) throw new Error("panier illisible (" + r.status + ")");
    const j = await r.json(); const c = (j.cart && j.cart.cart) || j.cart;
    if (!c || !c.id) throw new Error("panier introuvable : êtes-vous connecté et un drive est-il choisi ?");
    return c;
  }
  const qtyIn = (cart, pid) => { const i = (cart.items || []).find((x) => x.productId === pid); return i ? +i.desiredQuantity || 0 : 0; };
  async function setQty(o, q) {
    const cart = await getCart();
    const r = await fetch("/cart/update", {
      method: "POST", credentials: "include", headers: Object.assign({ "Content-Type": "application/json" }, H),
      body: JSON.stringify({ cartId: cart.id, items: [{ productId: o.productId, offerId: o.offerId, sellerType: o.sellerType || "GROCERY", desiredQuantity: q, desiredType: "DEFAULT", sellerId: o.sellerId }],
        consentId: cookie("lark-consentId"), reservationId: cookie("lark-slot") || null, mbaAvailabilityNeeded: true }),
    });
    if (!r.ok) throw new Error("ajout refusé par Auchan (" + r.status + ")");
    const after = await getCart();
    return qtyIn(after, o.productId);
  }
  const html = async (path) => { const r = await fetch(path, { credentials: "include", headers: { Accept: "text/html" } }); if (!r.ok) throw new Error("page " + r.status); return new DOMParser().parseFromString(await r.text(), "text/html"); };
  const offerOf = (qs) => qs && qs.dataset.productId && qs.dataset.offerId ? {
    productId: qs.dataset.productId, offerId: qs.dataset.offerId, sellerId: qs.dataset.sellerId, sellerType: qs.dataset.sellerType || "GROCERY",
    stock: qs.dataset.stock != null && qs.dataset.stock !== "" ? +qs.dataset.stock : null, off: qs.dataset.disableButton === "true",
  } : null;
  // Offre actuelle d'un produit mémorisé (l'identifiant d'offre peut changer d'un drive à l'autre)
  async function currentOffer(p) {
    const d = await html(p.path);
    const qs = [...d.querySelectorAll(".quantity-selector")].find((x) => x.dataset.productId === p.id);
    return offerOf(qs);
  }
  const imgOf = (a) => {
    const all = [...a.querySelectorAll("img")].map((i) => i.getAttribute("data-src") || i.getAttribute("src") || "").filter((s) => /cdn\.auchan\.fr\/media\//.test(s) && !/PICTO/i.test(s));
    return all[0] || "";
  };
  async function search(q) {
    const d = await html("/recherche?text=" + encodeURIComponent(q));
    return [...d.querySelectorAll("article.product-thumbnail")].map((a) => {
      const o = offerOf(a.querySelector(".quantity-selector")), l = a.querySelector('a[href*="/pr-"]');
      if (!o || o.off || o.stock === 0 || !l) return null;
      return Object.assign(o, { path: new URL(l.getAttribute("href"), location.origin).pathname, name: clean((a.querySelector(".product-thumbnail__description") || {}).textContent),
        attr: clean((a.querySelector(".product-attribute") || {}).textContent), price: clean((a.querySelector(".product-price") || {}).textContent), img: imgOf(a) });
    }).filter(Boolean).slice(0, 16);
  }

  // ---------- Quantités ----------
  // « 1 kg », « 500 g », « 6 x 125 g », « 75 cl », « 6 pièces », « la pièce » → contenance
  function packOf(t) {
    t = String(t || "").toLowerCase().replace(/,/g, ".");
    let m = t.match(/(\d+)\s*x\s*(\d+(?:\.\d+)?)\s*(kg|g|cl|ml|l)\b/), k = 1, v, u;
    if (m) { k = +m[1]; v = +m[2]; u = m[3]; }
    else if ((m = t.match(/(\d+(?:\.\d+)?)\s*(kg|g|cl|ml|l)\b/))) { v = +m[1]; u = m[2]; }
    else if ((m = t.match(/(\d+)\s*(?:pi[eè]ces?|unit[ée]s?|pcs?)\b/) || t.match(/\bx\s*(\d+)\b/))) return { v: +m[1], dim: "pc" };
    else if (/pi[eè]ce|unit[ée]/.test(t)) return { v: 1, dim: "pc" };
    else return null;
    const f = { kg: 1000, g: 1, l: 1000, cl: 10, ml: 1 }[u];
    return { v: k * v * f, dim: u === "kg" || u === "g" ? "g" : "ml" };
  }
  // Nombre d'articles pour couvrir la quantité de la liste (1 si on ne sait pas, 10 au plus)
  function unitsFor(it, pack) {
    if (!pack || !(it.amt > 0) || !(pack.v > 0)) return 1;
    const dim = it.u === "pc" ? "pc" : it.u;
    if (dim !== pack.dim) return 1;
    return Math.max(1, Math.min(10, Math.ceil(it.amt / pack.v - 0.05)));
  }
  // Quantité visée dans le panier : on complète jusqu'au besoin, sans doubler si le produit y est déjà
  // (relancer le remplissage n'ajoute donc rien de plus).
  async function addFor(it, offer, pack) {
    run.base = run.base || {}; run.want = run.want || {};
    const cart = await getCart();
    if (!(offer.productId in run.base)) run.base[offer.productId] = qtyIn(cart, offer.productId);
    run.want[offer.productId] = (run.want[offer.productId] || 0) + unitsFor(it, pack);
    let target = Math.max(run.base[offer.productId], run.want[offer.productId]);
    if (offer.stock != null && offer.stock > 0) target = Math.min(target, offer.stock);
    const now = qtyIn(cart, offer.productId);
    if (now >= target) return { n: now, added: 0 };
    const got = await setQty(offer, target);
    if (got < target && got <= now) throw new Error("Auchan n'a pas pris l'ajout");
    return { n: got, added: got - now };
  }

  // ---------- Déroulé ----------
  let run = null, prods = {}, busy = false, adding = false, host = null, root = null, choice = null, msg = "";

  async function load() { run = await get(RUN); prods = (await get(PROD)) || {}; }
  async function save() { await set(RUN, run); }

  async function tick() {
    if (busy) return; busy = true;
    try {
      await load();
      if (!run || !Array.isArray(run.items)) { hide(); return; }
      if (!run.active) { render(); return; }
      // 1. tous les articles déjà connus, d'un coup
      for (let i = 0; i < run.items.length; i++) {
        const it = run.items[i], p = prods[it.key];
        if (it.status || !p || it.auto === false) continue;
        msg = "Ajout de « " + (p.label || it.label) + " »…"; render();
        try {
          const o = await currentOffer(p);
          if (!o || o.off || o.stock === 0) { it.auto = false; it.note = "Votre produit habituel (" + p.label + ") n'est pas disponible : choisissez-en un autre."; }
          else { const r = await addFor(it, o, p.pack); it.status = "ok"; it.n = r.n; it.prod = p.label; }
        } catch (e) { it.auto = false; it.note = "Ajout automatique impossible (" + e.message + ") : choisissez le produit."; }
        await save(); await sleep(350);
        await load(); if (!run || !run.active) { render(); return; }
      }
      // 2. le premier article à choisir à la main
      const i = run.items.findIndex((x) => !x.status);
      if (i < 0) { run.active = false; run.finished = true; await save(); msg = ""; render(); return; }
      await openChoice(i);
    } catch (e) { msg = "Un imprévu : " + e.message; render(); }
    finally { busy = false; }
  }

  async function openChoice(i, q) {
    const it = run.items[i]; q = q || it.q;
    choice = { i, q, list: null }; msg = ""; render();
    try { choice.list = await search(q); } catch (e) { choice.list = []; msg = "Recherche impossible : " + e.message; }
    if (choice && choice.i === i) render();
  }

  async function pick(k) {
    if (!choice || !choice.list || adding) return;
    const it = run.items[choice.i], o = choice.list[k]; if (!it || !o) return;
    adding = true; msg = "Ajout de « " + o.name + " »…"; render();
    try {
      const pack = packOf(o.attr), label = clean(o.name + " " + o.attr);
      const r = await addFor(it, o, pack);
      prods = (await get(PROD)) || {}; prods[it.key] = { id: o.productId, path: o.path, label, pack }; await set(PROD, prods);
      it.status = "ok"; it.n = r.n; it.prod = label; delete it.note; choice = null; await save();
    } catch (e) { msg = "L'ajout n'a pas marché : " + e.message; adding = false; render(); return; }
    adding = false; tick();
  }

  // ---------- Panneau ----------
  function hide() { if (host) { host.remove(); host = null; root = null; } }
  function mount() {
    if (host && document.documentElement.contains(host)) return;
    host = document.createElement("div"); host.id = "semainier-drive";
    host.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:2147483647;width:380px;max-width:calc(100vw - 32px)";
    root = host.attachShadow({ mode: "open" });
    root.addEventListener("click", onClick);
    root.addEventListener("submit", onSubmit);
    document.documentElement.appendChild(host);
  }
  const CSS = `:host{all:initial}*{box-sizing:border-box}
  .p{font:14px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;color:#1d2a1f;background:#fff;border:1px solid #cfd8cf;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.22);overflow:hidden;display:flex;flex-direction:column;max-height:calc(100vh - 32px)}
  .h{display:flex;justify-content:space-between;align-items:center;gap:8px;background:#2f6b3a;color:#fff;padding:9px 12px;font-weight:600}
  .h small{font-weight:400;opacity:.9;font-variant-numeric:tabular-nums}
  .bar{height:4px;background:#dfe7df;flex:none}.bar i{display:block;height:100%;background:#2f6b3a}
  .b{padding:12px;display:flex;flex-direction:column;gap:8px;min-height:0;overflow:auto}
  .n{font-size:16px;font-weight:700}.q{color:#55635a;font-size:13px}.m{font-size:13.5px}.note{color:#8a5a00;font-size:13px}
  .a{display:flex;flex-wrap:wrap;gap:6px}
  button{font:inherit;font-size:13px;font-weight:600;border:1px solid #cfd8cf;background:#f3f6f3;color:#1d2a1f;border-radius:999px;padding:5px 12px;cursor:pointer}
  button.pri{background:#2f6b3a;border-color:#2f6b3a;color:#fff}button.link{border:0;background:none;padding:0 2px;color:#2f6b3a;text-decoration:underline;font-weight:400}
  button[disabled]{opacity:.5;cursor:default}
  form{display:flex;gap:6px}input{flex:1;min-width:0;font:inherit;font-size:13px;border:1px solid #cfd8cf;border-radius:8px;padding:5px 8px}
  .res{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;max-height:46vh;overflow:auto}
  .res li{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:8px;align-items:center;border:1px solid #e3e9e3;border-radius:10px;padding:5px 6px}
  .res img{width:44px;height:44px;object-fit:contain;background:#f6f8f6;border-radius:6px}.res .ph{width:44px;height:44px;background:#f0f3f0;border-radius:6px}
  .res b{display:block;font-size:13px;line-height:1.25}.res small{color:#55635a;font-size:12px}
  .sum{list-style:none;margin:0;padding:0;border-top:1px solid #e3e9e3}
  .sum li{display:flex;justify-content:space-between;gap:8px;padding:5px 0;border-bottom:1px solid #eef2ee;font-size:13px}.sum li>span:first-child{min-width:0}
  .ok{color:#2f6b3a;white-space:nowrap}.sk{color:#8a5a00;white-space:nowrap}`;

  function render() {
    if (!run) return; mount();
    const n = run.items.length, done = run.items.filter((x) => x.status).length;
    const okN = run.items.filter((x) => x.status === "ok").length, skN = run.items.filter((x) => x.status === "skip").length;
    let body;
    if (run.finished) {
      body = `<div class="n">Panier rempli 🎉</div><div class="m">${okN} article${okN > 1 ? "s" : ""} ajouté${okN > 1 ? "s" : ""}${skN ? `, ${skN} passé${skN > 1 ? "s" : ""}` : ""}. Vérifiez votre panier avant de commander.</div>
        <ul class="sum">${run.items.map((x) => `<li><span>${esc(x.label)}${x.prod ? `<br><small class="q">${esc(x.prod)}</small>` : ""}</span><span class="${x.status === "ok" ? "ok" : "sk"}">${x.status === "ok" ? "✓ " + (x.n > 1 ? "× " + x.n : "") : "passé"}${prods[x.key] ? ` <button class="link" data-forget="${esc(x.key)}" title="Oublier ce produit : il vous sera redemandé la prochaine fois">changer</button>` : ""}</span></li>`).join("")}</ul>
        <div class="a"><button class="pri" data-act="cart">Voir mon panier</button><button data-act="stop">Fermer</button></div>`;
    } else if (!run.active) {
      body = `<div class="n">En pause</div><div class="m">${done} article${done > 1 ? "s" : ""} traité${done > 1 ? "s" : ""} sur ${n}.</div><div class="a"><button class="pri" data-act="resume">Reprendre</button><button data-act="stop">Arrêter</button></div>`;
    } else if (choice) {
      const it = run.items[choice.i];
      const list = choice.list == null ? `<div class="m">Recherche de « ${esc(choice.q)} »…</div>`
        : choice.list.length ? `<ul class="res">${choice.list.map((o, k) => `<li>${o.img ? `<img src="${esc(o.img)}" alt="">` : `<span class="ph"></span>`}<span><b>${esc(o.name)}</b><small>${esc(o.attr)}${o.price ? " · " + esc(o.price) : ""}</small></span><button class="pri" data-pick="${k}" ${adding ? "disabled" : ""}>Ajouter</button></li>`).join("")}</ul>`
        : `<div class="m">Aucun produit trouvé. Essayez d'autres mots.</div>`;
      body = `<div class="n">${esc(it.label)}</div>${it.need ? `<div class="q">Il en faut : ${esc(it.need)}</div>` : ""}${it.note ? `<div class="note">${esc(it.note)}</div>` : ""}
        <div class="m">Choisissez le produit : il sera ajouté et retenu pour les prochaines fois.</div>
        <form><input name="q" value="${esc(choice.q)}" aria-label="Chercher un autre produit"><button type="submit">Chercher</button></form>
        ${msg ? `<div class="note">${esc(msg)}</div>` : ""}${list}
        <div class="a"><button data-act="skip">Passer (j'en ai déjà)</button><button data-act="pause">Pause</button><button data-act="stop">Arrêter</button></div>`;
    } else {
      body = `<div class="m">${esc(msg || "Remplissage du panier…")}</div><div class="a"><button data-act="pause">Pause</button><button data-act="stop">Arrêter</button></div>`;
    }
    root.innerHTML = `<style>${CSS}</style><div class="p"><div class="h"><span>🍽️ Semainier → Auchan</span><small>${done} / ${n}</small></div><div class="bar"><i style="width:${n ? Math.round(done / n * 100) : 0}%"></i></div><div class="b">${body}</div></div>`;
  }

  async function onClick(e) {
    const pk = e.target.closest("[data-pick]"); if (pk) { pick(+pk.dataset.pick); return; }
    const f = e.target.closest("[data-forget]");
    if (f) { prods = (await get(PROD)) || {}; delete prods[f.dataset.forget]; await set(PROD, prods); render(); return; }
    const b = e.target.closest("[data-act]"); if (!b || !run) return;
    const a = b.dataset.act;
    if (a === "stop") { choice = null; await set(RUN, null); run = null; hide(); return; }
    if (a === "cart") { await set(RUN, null); run = null; hide(); location.reload(); return; }
    if (a === "pause") { choice = null; run.active = false; await save(); render(); return; }
    if (a === "resume") { run.active = true; await save(); tick(); return; }
    if (a === "skip" && choice) { const it = run.items[choice.i]; if (it) it.status = "skip"; choice = null; await save(); tick(); }
  }
  function onSubmit(e) {
    e.preventDefault(); if (!choice) return;
    const q = clean(new FormData(e.target).get("q")); if (q) openChoice(choice.i, q);
  }

  // Lancement à l'ouverture d'une page auchan.fr, et à l'arrivée d'une nouvelle liste
  tick();
  if (ext && chrome.storage.onChanged) chrome.storage.onChanged.addListener((ch, area) => {
    if (area === "local" && ch[RUN] && ch[RUN].newValue && ch[RUN].newValue.t !== (run && run.t)) { choice = null; tick(); }
  });
})();
