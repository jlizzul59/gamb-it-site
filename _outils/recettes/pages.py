#!/usr/bin/env python3
"""Génère une page HTML statique par recette (lisible par Google) + index par pays + sitemap.

Usage : python3 pages.py donnees.json
donnees.json = {"R": [...], "I": {...}} tel que chargé dans la page (voir dump.py).
"""
import json, re, sys, unicodedata, html, os, datetime, collections

SITE = "https://gamb-it-apps.fr"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "menus", "r")
PORTIONS = 4

D = json.load(open(sys.argv[1], encoding="utf-8"))
I = D["I"]
R = [r for r in D["R"] if not r["id"].startswith("mix:")]
e = lambda s: html.escape(str(s), quote=True)


def slug(s):
    s = unicodedata.normalize("NFD", s.lower().replace("œ", "oe").replace("æ", "ae"))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:80].rstrip("-")


def frac(v):
    w, f = int(v), v - int(v)
    if abs(f - .5) < .01: return "½" if w == 0 else f"{w} ½"
    return str(int(v)) if f < .01 else str(v).replace(".", ",")


def fmt(q, u):
    if u in ("g", "ml"):
        v = max(5, round(q / 5) * 5)
        if v >= 1000: return f"{round(v / 100) / 10:g}".replace(".", ",") + (" kg" if u == "g" else " L")
        return f"{v} {u}"
    v = max(.5, round(q * 2) / 2)
    if u == "cs": return frac(v) + " c. à s."
    if u == "cc": return frac(v) + " c. à c."
    if u == "gousse": return frac(v) + (" gousses" if v > 1 else " gousse")
    if u == "bouquet": return frac(v) + (" bouquets" if v > 1 else " bouquet")
    return frac(v)


# slugs uniques
seen, SL = set(), {}
for r in sorted(R, key=lambda r: r["id"]):
    s = slug(r["n"]) or r["id"]
    if s in seen: s = s + "-" + slug(r["id"])
    seen.add(s); SL[r["id"]] = s

CSS = """
:root{--bg:#F2F6F5;--surface:#fff;--ink:#16292B;--muted:#56696A;--line:#D2DEDC;--accent:#1E5B5E;--accent-ink:#fff;--accent-soft:#DFEDEB;--warm:#B85A14}
@media(prefers-color-scheme:dark){:root{--bg:#101819;--surface:#182425;--ink:#E2ECEB;--muted:#98ABA9;--line:#2A3B3C;--accent:#86C9BF;--accent-ink:#0C1A1B;--accent-soft:#1B3436;--warm:#E39A5C}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 Figtree,system-ui,-apple-system,"Segoe UI",sans-serif}
a{color:var(--accent)}header,main,footer{max-width:860px;margin:auto;padding:0 20px}
header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:18px;padding-bottom:18px}
.brand{font-weight:800;text-decoration:none;color:var(--ink)}.brand span{color:#E8761A}
.cta{display:inline-block;background:var(--accent);color:var(--accent-ink);padding:10px 18px;border-radius:999px;font-weight:700;text-decoration:none}
.cta.ghost{background:none;color:var(--accent);border:1px solid var(--line)}
.crumbs{font-size:14px;color:var(--muted)}.crumbs a{color:var(--muted)}
h1{font-family:"Young Serif",Georgia,serif;font-weight:400;font-size:clamp(30px,5vw,44px);line-height:1.15;margin:8px 0 12px}
.meta{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 22px;padding:0;list-style:none}.meta li{background:var(--surface);border:1px solid var(--line);border-radius:999px;padding:4px 12px;font-size:14px}
.grid{display:grid;grid-template-columns:280px 1fr;gap:28px;align-items:start}
.card{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:18px 20px}
h2{font-size:18px;margin:0 0 10px}.ing{list-style:none;margin:0;padding:0}.ing li{display:flex;gap:10px;padding:6px 0;border-top:1px solid var(--line)}.ing li:first-child{border-top:0}
.ing b{min-width:84px;color:var(--accent);font-variant-numeric:tabular-nums}
ol.steps{margin:0;padding-left:22px}ol.steps li{margin:0 0 12px}
.actions{display:flex;flex-wrap:wrap;gap:10px;margin:22px 0}
.rel{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;list-style:none;padding:0}.rel a{display:block;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:12px 14px;text-decoration:none;color:var(--ink)}.rel small{display:block;color:var(--muted)}
.list{columns:2 280px;padding-left:18px}.list li{break-inside:avoid;margin:0 0 4px}
footer{margin-top:50px;padding-top:20px;padding-bottom:40px;border-top:1px solid var(--line);color:var(--muted);font-size:14px;display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between}footer a{color:var(--muted)}
@media(max-width:700px){.grid{grid-template-columns:1fr}}
"""


def page(title, desc, path, body, ld=None):
    url = f"{SITE}/menus/r/{path}"
    return f"""<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title><meta name="description" content="{e(desc)}"><link rel="canonical" href="{url}">
<meta property="og:type" content="article"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}"><meta property="og:url" content="{url}"><meta property="og:site_name" content="Think’n’Cook">
<meta property="og:image" content="{SITE}/menus/icon-512.png"><link rel="icon" href="../icon-192.png"><meta name="theme-color" content="#1E5B5E">
{f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>' if ld else ''}
<style>{CSS}</style></head><body>
<header><a class="brand" href="index.html"><img src="../icon-192.png" alt="" width="28" height="28" style="vertical-align:-8px;border-radius:7px;margin-right:6px">Think<span>’n’</span>Cook</a><a class="cta" href="../index.html?ref=recette">Planifier ma semaine</a></header>
<main>{body}</main>
<footer><span>© GAMB-IT · <a href="https://gamb-it-apps.fr/">gamb-it-apps.fr</a></span><span><a href="index.html">Toutes les recettes</a> · <a href="../conditions.html">Conditions</a> · <a href="https://gamb-it-apps.fr/confidentialite.html">Confidentialité</a> · <a href="https://gamb-it-apps.fr/mentions-legales.html">Mentions légales</a></span></footer>
</body></html>
"""


PAYS = collections.defaultdict(list)
for r in R: PAYS[r.get("pays") or "Autres"].append(r)
psl = {p: "pays-" + slug(p) + ".html" for p in PAYS}
prot = collections.defaultdict(list)
for r in R: prot[r.get("p")].append(r)

os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    if f.endswith(".html"): os.remove(os.path.join(OUT, f))

for r in R:
    s = SL[r["id"]]
    ings = [(fmt(q * PORTIONS, I[i]["u"]), I[i]["n"], I[i].get("r") == "pl") for i, q in r["ing"] if i in I]
    pays = r.get("pays") or "Autres"
    t = r.get("t") or 0
    desc = f"{r['n']} : recette pour {PORTIONS} personnes, prête en {t} min. " + ", ".join(n for _, n, _ in ings[:6]) + "."
    ld = {"@context": "https://schema.org", "@type": "Recipe", "name": r["n"], "description": desc,
          "author": {"@type": "Organization", "name": "GAMB-IT"}, "recipeYield": f"{PORTIONS} portions",
          "recipeCuisine": pays, "recipeCategory": "Plat principal", "inLanguage": "fr",
          "recipeIngredient": [f"{q} {n}" if q else n for q, n, _ in ings],
          "recipeInstructions": [{"@type": "HowToStep", "text": x} for x in r["st"]],
          "image": [f"{SITE}/menus/icon-512.png"], "url": f"{SITE}/menus/r/{s}.html"}
    if t: ld["totalTime"] = f"PT{t}M"
    rel = [x for x in prot[r.get("p")] if x["id"] != r["id"]]
    rel = sorted(rel, key=lambda x: (x.get("pays") != pays, x["n"]))[:6]
    body = f"""<p class="crumbs"><a href="index.html">Recettes</a> › <a href="{psl[pays]}">{e(pays)}</a></p>
<h1>{e(r['n'])}</h1>
<ul class="meta"><li>⏱ {t} min</li><li>👥 {PORTIONS} personnes</li><li>🌍 {e(pays)}</li></ul>
<div class="grid"><section class="card"><h2>Ingrédients</h2><ul class="ing">{''.join(f'<li><b>{e(q)}</b><span>{e(n)}</span></li>' for q, n, _ in ings)}</ul></section>
<section class="card"><h2>Préparation</h2><ol class="steps">{''.join(f'<li>{e(x)}</li>' for x in r['st'])}</ol></section></div>
<div class="actions"><a class="cta" href="../recettes.html?ref=recette#r={e(r['id'])}">Ajouter à mon planning</a><a class="cta ghost" href="../recettes.html?ref=recette#c={e(r["id"])}">Cuisiner pas à pas</a></div>
<p>Think’n’Cook prépare vos menus de la semaine, la liste de courses au gramme près et le pas-à-pas en cuisine. Gratuit, à partager avec toute la famille.</p>
{f'<h2>Dans le même esprit</h2><ul class="rel">' + ''.join(f'<li><a href="{SL[x["id"]]}.html">{e(x["n"])}<small>{e(x.get("pays") or "")} · {x.get("t") or 0} min</small></a></li>' for x in rel) + '</ul>' if rel else ''}"""
    open(os.path.join(OUT, s + ".html"), "w", encoding="utf-8").write(page(f"{r['n']} – recette | Think’n’Cook", desc, s + ".html", body, ld))

for p, lst in PAYS.items():
    lst = sorted(lst, key=lambda x: x["n"])
    body = f"""<p class="crumbs"><a href="index.html">Recettes</a> › {e(p)}</p><h1>Recettes : {e(p)}</h1><p>{len(lst)} recettes pour {PORTIONS} personnes.</p>
<ul class="list">{''.join(f'<li><a href="{SL[x["id"]]}.html">{e(x["n"])}</a></li>' for x in lst)}</ul>"""
    open(os.path.join(OUT, psl[p]), "w", encoding="utf-8").write(page(f"Recettes {p} | Think’n’Cook", f"{len(lst)} recettes ({p}) avec ingrédients et étapes, pour vos menus de la semaine.", psl[p], body))

pays_sorted = sorted(PAYS, key=lambda p: (-len(PAYS[p]), p))
body = f"""<h1>{len(R)} recettes pour les menus de la semaine</h1>
<p>Des plats du quotidien et du monde entier, avec les quantités pour {PORTIONS} et les étapes détaillées. Ajoutez-les à votre planning pour obtenir la liste de courses automatiquement.</p>
<h2>Par pays</h2><ul class="list">{''.join(f'<li><a href="{psl[p]}">{e(p)}</a> ({len(PAYS[p])})</li>' for p in pays_sorted)}</ul>
<h2>Toutes les recettes</h2><ul class="list">{''.join(f'<li><a href="{SL[x["id"]]}.html">{e(x["n"])}</a></li>' for x in sorted(R, key=lambda x: x["n"]))}</ul>"""
open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(page("Toutes les recettes | Think’n’Cook", f"{len(R)} recettes faciles avec ingrédients et étapes pour planifier les menus de la semaine en famille.", "index.html", body))

today = datetime.date.today().isoformat()
urls = [f"{SITE}/", f"{SITE}/menus/", f"{SITE}/menus/recettes.html", f"{SITE}/menus/r/index.html", f"{SITE}/thermomot/"]
urls += [f"{SITE}/menus/r/{psl[p]}" for p in pays_sorted] + [f"{SITE}/menus/r/{SL[r['id']]}.html" for r in R]
open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "".join(f"<url><loc>{u}</loc><lastmod>{today}</lastmod></url>\n" for u in urls) + "</urlset>\n")
json.dump(SL, open(os.path.join(OUT, "slugs.json"), "w"), ensure_ascii=False)
print(len(R), "recettes,", len(PAYS), "pays,", len(urls), "URL dans le sitemap")
