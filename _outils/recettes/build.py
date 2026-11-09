#!/usr/bin/env python3
"""Assemble les recettes écrites en format compact (/tmp/rx/b*.txt) dans menus/recettes-plus.js.

Format d'une recette (une ligne, champs séparés par |) :
  id|Nom|for|p|t|pays|ingrédients|étapes|batch|jour J|drapeaux
  for : f (famille), l (midi), lf (les deux)
  ingrédients : "poulet 140, oignon 60, ail 1"  (quantités par portion)
  étapes : séparées par " >> "
  batch : "c:texte ; o:texte" (c cru, o four, f feu, g congélation) ou vide
  drapeaux : s (tout simple), g (gourmand)
"""
import glob, json, re, sys

I = json.load(open('/tmp/t/I.json'))
OLD = json.load(open('/tmp/t/R.json'))
PAYS = json.load(open('/tmp/rx/pays.json'))
PAYS.update({
    "Irlande": "Europe", "Écosse": "Europe", "Pays-Bas": "Europe", "Autriche": "Europe", "Croatie": "Europe", "Malte": "Europe",
    "Sicile": "Europe", "Sardaigne": "Europe", "Corse": "France", "Ardèche": "France", "Dauphiné": "France", "Franche-Comté": "France",
    "Champagne": "France", "Vendée": "France", "Languedoc": "France", "Gascogne": "France", "Périgord": "France", "Landes": "France",
    "Limousin": "France", "Berry": "France", "Touraine": "France", "Anjou": "France", "Charente": "France", "Ardennes": "France",
    "Taïwan": "Asie", "Singapour": "Asie", "Sri Lanka": "Asie", "Cambodge": "Asie", "Birmanie": "Asie", "Pakistan": "Asie", "Mongolie": "Asie",
    "Bangladesh": "Asie", "Tibet": "Asie", "Kazakhstan": "Asie", "Hong Kong": "Asie",
    "Syrie": "Moyen-Orient", "Irak": "Moyen-Orient", "Yémen": "Moyen-Orient", "Arménie": "Moyen-Orient", "Azerbaïdjan": "Moyen-Orient", "Chypre": "Europe",
    "Mali": "Afrique", "Ghana": "Afrique", "Bénin": "Afrique", "Congo": "Afrique", "Madagascar": "Afrique", "Tanzanie": "Afrique", "Mozambique": "Afrique",
    "Togo": "Afrique", "Guinée": "Afrique", "Libye": "Afrique", "Maurice": "Afrique", "Cap-Vert": "Afrique", "Somalie": "Afrique", "Rwanda": "Afrique",
    "Canada": "Amériques", "Texas": "Amériques", "Californie": "Amériques", "Guatemala": "Amériques", "Salvador": "Amériques", "Costa Rica": "Amériques",
    "Panama": "Amériques", "Équateur": "Amériques", "Bolivie": "Amériques", "Uruguay": "Amériques", "Paraguay": "Amériques", "Porto Rico": "Amériques",
    "République dominicaine": "Amériques", "Trinité-et-Tobago": "Amériques", "Guyane": "Amériques", "Martinique": "Amériques", "Guadeloupe": "Amériques",
    "Nouvelle-Calédonie": "Océanie", "Fidji": "Océanie", "Vanuatu": "Océanie",
})

NEWI = {
    "sardines": {"n": "Sardines (fraîches ou en boîte)", "r": "bo", "u": "g", "k": 2.1, "c": "Poissons & crevettes"},
    "maquereau": {"n": "Filets de maquereau", "r": "bo", "u": "g", "k": 2.0, "c": "Poissons & crevettes"},
    "calamars": {"n": "Calamars (anneaux)", "r": "bo", "u": "g", "k": 0.9, "c": "Poissons & crevettes"},
    "stjacques": {"n": "Noix de Saint-Jacques", "r": "bo", "u": "g", "k": 0.9, "c": "Poissons & crevettes"},
    "haddock": {"n": "Haddock fumé", "r": "bo", "u": "g", "k": 1.0, "c": "Poissons & crevettes"},
    "merlu": {"n": "Filets de merlu", "r": "bo", "u": "g", "k": 0.9, "c": "Poissons & crevettes"},
    "porchache": {"n": "Chair à saucisse (porc haché)", "r": "bo", "u": "g", "k": 2.6, "c": "Viandes"},
    "boudin": {"n": "Boudin noir", "r": "bo", "u": "g", "k": 3.0, "c": "Viandes"},
    "lapin": {"n": "Cuisses de lapin", "r": "bo", "u": "g", "k": 1.4, "c": "Viandes"},
    "asperges": {"n": "Asperges vertes", "r": "fl", "u": "g", "k": 0.2, "c": "Légumes", "w": 500, "wl": "botte"},
    "feves": {"n": "Fèves (surgelées)", "r": "co", "u": "g", "k": 0.8, "c": "Légumes"},
    "celerirave": {"n": "Céleri-rave", "r": "fl", "u": "g", "k": 0.4, "c": "Légumes", "w": 800, "wl": "céleri"},
    "topinambour": {"n": "Topinambours", "r": "fl", "u": "g", "k": 0.7, "c": "Légumes"},
    "blettes": {"n": "Blettes", "r": "fl", "u": "g", "k": 0.2, "c": "Légumes", "w": 600, "wl": "botte"},
    "choubxl": {"n": "Choux de Bruxelles", "r": "fl", "u": "g", "k": 0.43, "c": "Légumes"},
    "bleu": {"n": "Bleu d'Auvergne ou gorgonzola", "r": "cr", "u": "g", "k": 3.5, "c": "Fromages & crème"},
    "raclette": {"n": "Fromage à raclette", "r": "cr", "u": "g", "k": 3.5, "c": "Fromages & crème"},
    "mascarpone": {"n": "Mascarpone", "r": "cr", "u": "g", "k": 4.2, "c": "Fromages & crème"},
    "orzo": {"n": "Orzo (pâtes en grains de riz)", "r": "co", "u": "g", "k": 3.6, "s": 1, "c": "Féculents"},
    "naan": {"n": "Pains naan", "r": "pa", "u": "pc", "k": 260, "s": 1, "c": "Féculents"},
    "pignons": {"n": "Pignons de pin", "r": "co", "u": "g", "k": 6.7, "c": "Fruits secs"},
    "noisettes": {"n": "Noisettes", "r": "co", "u": "g", "k": 6.3, "c": "Fruits secs"},
}
import sys as _s; _s.path.insert(0, '/tmp/rx'); import fixes as FX
NEWI.update(FX.NEWI2)
ALLI = dict(I); ALLI.update(NEWI)
PROT = {"poulet", "jambon", "saumon", "cabillaud", "boeuf", "porc", "oeuf", "poischiches", "thon", "lentilles", "dinde", "crevettes", "vege", "colin",
        "lardons", "tofu", "saucisse", "paleron", "rumsteck", "cuisse", "agneau", "daurade", "moules", "canard", "truite", "chorizo", "veau", "roti",
        "cotesporc", "lieu", "sardines", "maquereau", "calamars", "stjacques", "haddock", "merlu", "lapin", "boudin", "haricots", "porchache", "echine"}
PO = {"c": "cru", "o": "four", "f": "feu", "g": "gel"}

old_ids = {r["id"] for r in OLD}
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower().replace("œ", "oe"))
old_names = {norm(r["n"]) for r in OLD}
errs, out, bc, seen_ids, seen_names = [], [], {}, set(), set()
files = sorted(glob.glob('/tmp/rx/b*.txt'))
for f in files:
    for ln, line in enumerate(open(f, encoding='utf-8'), 1):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        parts = line.split('|')
        where = f"{f.split('/')[-1]}:{ln}"
        if len(parts) != 11:
            errs.append(f"{where} : {len(parts)} champs"); continue
        rid, n, fr, p, t, pays, ing, st, b, j, fl = [x.strip() for x in parts]
        rid = "x" + rid
        if rid in old_ids or rid in seen_ids: errs.append(f"{where} : id en double {rid}")
        nn = norm(n)
        if nn in old_names or nn in seen_names: errs.append(f"{where} : nom déjà pris « {n} »")
        seen_ids.add(rid); seen_names.add(nn)
        if p not in PROT: errs.append(f"{where} : protéine inconnue {p}")
        if pays not in PAYS: errs.append(f"{where} : pays sans région {pays}")
        ings = []
        for it in [x.strip() for x in ing.split(',') if x.strip()]:
            m = re.match(r"^([a-z0-9]+)\s+([0-9.]+)$", it)
            if not m: errs.append(f"{where} : ingrédient mal écrit « {it} »"); continue
            if m.group(1) not in ALLI: errs.append(f"{where} : ingrédient inconnu {m.group(1)}"); continue
            q = float(m.group(2)); ings.append([m.group(1), int(q) if q == int(q) else q])
        steps = [s.strip() for s in st.split('>>') if s.strip()]
        if len(steps) < 2: errs.append(f"{where} : moins de 2 étapes")
        forv = {"f": ["fam"], "l": ["l2"], "lf": ["l2", "fam"]}.get(fr)
        if not forv: errs.append(f"{where} : for inconnu {fr}")
        r = {"id": rid, "n": n, "for": forv, "p": p, "t": int(t), "ing": ings, "st": steps, "pays": pays, "reg": PAYS.get(pays, "France")}
        if 's' in fl: r["simple"] = 1
        if 'g' in fl: r["tag"] = "plaisir"
        out.append(r)
        tasks = []
        for x in [y.strip() for y in b.split(';') if y.strip()]:
            if len(x) > 2 and x[1] == ':' and x[0] in PO: tasks.append([PO[x[0]], x[2:].strip()])
            else: errs.append(f"{where} : tâche batch mal écrite « {x} »")
        bc[rid] = {"t": tasks, "j": j or "Réchauffer doucement avant de servir."}

if errs:
    print("\n".join(errs[:80])); print(len(errs), "erreurs"); sys.exit(1)

# --- corrections de cohérence ---
GW = {"salade": r"salade|roquette|crudit|verdure", "persil": r"persil", "coriandre": r"coriandre", "ciboulette": r"ciboulette",
      "aneth": r"aneth", "basilic": r"basilic|pesto", "menthe": r"menthe", "oignonnouveau": r"oignons? nouveaux?|c[ée]bette",
      "citron": r"citron(?! vert)", "citronvert": r"citron vert|citrons verts", "painscampagne": r"pain|tartine|cro[ûu]ton|mouillette",
      "baguette": r"baguette|pain|cro[ûu]ton", "nori": r"nori|algue", "sesame": r"s[ée]same", "oignonrouge": r"oignon"}
HERB = {"persil": "persil", "coriandre": "coriandre", "ciboulette": "ciboulette", "aneth": "aneth", "basilic": "basilic", "menthe": "menthe",
        "oignonnouveau": "oignon nouveau émincé", "sesame": "sésame", "nori": "nori en lanières"}
def garn(r):
    txt = " ".join(r["st"]).lower(); add, herbs = [], []
    for i, _ in r["ing"]:
        if i in FX.GARN and not re.search(GW[i], txt):
            if i in HERB:
                if i in ("persil", "coriandre", "ciboulette", "aneth", "basilic", "menthe") and re.search(r"herbe", txt): continue
                herbs.append(HERB[i])
            elif FX.GARN[i] not in add: add.append(FX.GARN[i])
    if herbs:
        de = ["d'" + h if h[0] in "aeiouéo" else "de " + h for h in herbs]
        add.insert(0, "Parsemer " + (", ".join(de[:-1]) + " et " + de[-1] if len(de) > 1 else de[0]) + ".")
    sv = [a[len("Servir avec "):-1] for a in add if a.startswith("Servir avec ")]
    if len(sv) > 1:
        add = [a for a in add if not a.startswith("Servir avec ")] + ["Servir avec " + ", ".join(sv[:-1]) + " et " + sv[-1] + "."]
    if add:
        r = dict(r); r["st"] = list(r["st"]); r["st"][-1] = r["st"][-1].rstrip() + " " + " ".join(add)
    return r, add
out = [garn(FX.apply(r, FX.FIX[r["id"]], ALLI) if r["id"] in FX.FIX else r)[0] for r in out]
FIXOUT, nadd = {}, 0
BASE = [r for r in json.load(open('/tmp/t/full.json'))["R"] if r["id"] in old_ids]
for r in BASE:
    if r["id"].startswith("mix:"): continue
    r2 = FX.apply(r, FX.FIX[r["id"]], ALLI) if r["id"] in FX.FIX else r
    r2, add = garn(r2)
    if r2 is not r or add:
        FIXOUT[r["id"]] = {k: r2[k] for k in ("n", "ing", "st") if r2[k] != r[k]}
missing = set(FX.FIX) - {r["id"] for r in out} - set(FIXOUT)
if missing: print("corrections sans recette :", missing); sys.exit(1)
print(len(FIXOUT), "recettes d'origine corrigées")
js = ("// Recettes ajoutées au catalogue (généré, ne pas éditer à la main).\n"
      "window.MENUS_PLUS=" + json.dumps({"I": NEWI, "IREN": FX.IREN, "FIX": FIXOUT, "R": out, "BC": bc}, ensure_ascii=False, separators=(",", ":")) + ";\n")
open('/home/claude/gamb-it-site/menus/recettes-plus.js', 'w', encoding='utf-8').write(js)
from collections import Counter
print(len(out), "nouvelles recettes ;", len(js) // 1024, "Ko ; total ≈", len(OLD) + len(out))
print("par protéine :", dict(Counter(r["p"] for r in out).most_common()))
print("par région :", dict(Counter(r["reg"] for r in out).most_common()))
print("simples :", sum(1 for r in out if r.get("simple")), "· midi :", sum(1 for r in out if "l2" in r["for"]))
