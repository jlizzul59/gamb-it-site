# Corrections de cohérence des recettes (titre / ingrédients / étapes).
# Appliqué par build.py : directement sur les recettes « x… », via MENUS_PLUS.FIX pour les recettes d'origine.

NEWI2 = {
    "vermicelles": {"n": "Vermicelles", "r": "co", "u": "g", "k": 3.5, "s": 1, "c": "Féculents"},
    "conchiglioni": {"n": "Conchiglioni (grosses coquilles)", "r": "co", "u": "g", "k": 4.5, "s": 1, "c": "Féculents"},
    "sauge": {"n": "Sauge fraîche", "r": "fl", "u": "bouquet", "k": 5},
    "estragon": {"n": "Estragon frais", "r": "fl", "u": "bouquet", "k": 5},
    "romarin": {"n": "Romarin", "r": "pl", "u": "cc", "k": 2},
    "pruneaux": {"n": "Pruneaux dénoyautés", "r": "co", "u": "g", "k": 1.4, "c": "Fruits secs"},
    "cidre": {"n": "Cidre brut", "r": "co", "u": "ml", "k": 0.4},
    "harissa": {"n": "Harissa", "r": "co", "u": "cc", "k": 10},
    "maroilles": {"n": "Maroilles", "r": "cr", "u": "g", "k": 2.6, "c": "Fromages & crème"},
}

# Noms affichés élargis (le même produit sert sous ses deux formes)
IREN = {
    "macaroni": {"n": "Coquillettes ou macaronis"},
    "spaghetti": {"n": "Spaghetti ou linguine"},
    "penne": {"n": "Penne ou rigatoni"},
}

SAUGE = {"sub": {"thym": ["sauge", 0.1]}, "soft": [["le thym", "la sauge"], ["thym", "sauge"]]}
ROMARIN = {"sub": {"thym": ["romarin", 0.25]}, "soft": [["thym (ou romarin)", "romarin"], ["thym", "romarin"]]}
CIDRE = {"sub": {"vinblanc": ["cidre", None]}, "soft": [["vin blanc (ou au cidre brut)", "cidre"], ["vin blanc (ou cidre brut)", "cidre"], ["vin blanc (ou au cidre)", "cidre"], ["vin blanc (ou cidre)", "cidre"]]}

FIX = {
    # --- pâtes : le bon format au rayon ---
    "kpoulettsoupe": {"sub": {"pates": ["vermicelles", None]}},
    "ssoupevermicelle": {"sub": {"pates": ["vermicelles", None]}},
    "fasolia": {"sub": {"pates": ["vermicelles", None]}},
    "harira": {"sub": {"pates": ["vermicelles", None]}},
    "xsoupelegumesvermicelle": {"sub": {"macaroni": ["vermicelles", None]}, "rep": [["Ajouter les pâtes, 6 min. Emmental.", "Ajouter les vermicelles, 5 min. Servir avec l'emmental."]]},
    "xpouletsoupevermicelle": {"rep": [["Cuire les pâtes dans le bouillon", "Cuire les coquillettes dans le bouillon"]]},
    "xpatesepinardsricotta": {"sub": {"pates": ["conchiglioni", None]}, "rep": [["Cuire les grosses pâtes", "Cuire les conchiglioni"]]},
    "japchae": {"n": "Japchae, nouilles sautées au bœuf et légumes", "rep": [["Cuire les nouilles (idéalement de patate douce, sinon de riz)", "Cuire les nouilles de riz (ou de patate douce, si vous en trouvez)"]]},
    "xthonmiso": {"n": "Thon poêlé au miso, nouilles et légumes", "sub": {"thon": ["toncru", None]}},
    "ravioliepinards": {"n": "Raviolis frais, sauce tomate aux épinards"},

    # --- protéines : titre = ce qu'on achète ---
    "xthonmagret": {"sub": {"thon": ["toncru", None]}},
    "smorrebrod": {"n": "Smørrebrød saumon fumé et œuf, sur pain de campagne", "sub": {"saumon": ["saumonfume", 60]},
                   "st": {2: "Détailler le saumon fumé en lanières."}},
    "saltimbocca": {"n": "Saltimbocca de dinde, polenta crémeuse"},
    "schnitzel": {"n": "Schnitzel de dinde, salade de pommes de terre"},
    "piccata": {"n": "Piccata de dinde au citron et câpres, pâtes"},
    "axoa": {"n": "Axoa de veau, pommes vapeur"},
    "woeuf": {"n": "Wraps œuf, lardons et salade", "rep": [["œufs au bacon", "œufs aux lardons"]]},
    "ssteakhvpdt": {"n": "Tranches de gigot d'agneau, haricots verts et pommes sautées", "rep": [["Cuire les côtelettes", "Cuire les tranches d'agneau"]]},
    "xagneausteakfeves": {"n": "Tranches de gigot d'agneau, purée de fèves à la menthe", "rep": [["Griller l'agneau", "Griller les tranches d'agneau"]]},
    "foul": {"n": "Foul medames, fèves au cumin, œuf", "sub": {"haricotsblancs": ["feves", None]},
             "st": {0: "Cuire les fèves 10 min dans un peu d'eau salée."}},
    "xflamiche": {"sub": {"reblochon": ["maroilles", None]}, "rep": [["ajouter le fromage en tranches", "ajouter le maroilles en tranches"]]},

    # --- fruits à coque ---
    "kpanais": {"sub": {"noix": ["noisettes", None]}, "rep": [["les noisettes (ou noix)", "les noisettes"]]},
    "kchoufleursoupe": {"sub": {"noix": ["noisettes", None]}, "rep": [["noix concassées", "noisettes concassées"]]},

    # --- herbes, cidre, pruneaux, harissa annoncés dans le titre ---
    "kcotesporc": dict(SAUGE),
    "xgnocchisauge": dict(SAUGE),
    "xrisottocourge": dict(SAUGE),
    "xbutternutpates": dict(SAUGE),
    "xgratinbutternut": {"sub": {"thym": ["sauge", 0.1]}, "rep": [["sel, poivre et thym", "sel, poivre et sauge ciselée"]]},
    "xharicotsblancstoscane": dict(SAUGE),
    "xraviolisbeurre": {"sub": {"thym": ["sauge", 0.1]}, "rep": [["avec le thym", "avec les feuilles de sauge"]]},
    "xporcrotiprunes": {"sub": {"herbes": ["sauge", 0.1]}, "rep": [["les herbes", "la sauge"]]},
    "agneaunz": dict(ROMARIN),
    "xsoupeharicotsblancs": dict(ROMARIN),
    "xpatespoischiches": dict(ROMARIN),
    "xpouletestragon": {"sub": {"herbes": ["estragon", 0.2]}, "rep": [["les herbes", "l'estragon ciselé"]]},
    "xcotesporcsauge": dict(CIDRE),
    "xpouletvalleedauge": dict(CIDRE),
    "normande": dict(CIDRE),
    "xdindepaupiette": {"sub": {"abricots": ["pruneaux", None]}, "rep": [["fruits secs", "pruneaux"]]},
    "xpoulecouscousmagrebin": {"sub": {"abricots": ["pruneaux", None]}, "rep": [["fruits secs", "pruneaux"]]},
    "xpouletharissa": {"sub": {"piment": ["harissa", 0.75]}, "rep": [["miel, piment et cumin", "miel, harissa et cumin"]]},

    # --- titres qui promettaient autre chose ---
    "xpouletcrumble": {"n": "Poulet aux légumes sous croûte feuilletée, façon pot pie"},
    "xboeufnachos": {"n": "Boulettes de bœuf à la suédoise, sauce crème, purée et cornichons"},
    "xpouletgnocchi": {"n": "Gnocchis au poulet, crème, tomates cerises et épinards"},
    "xsaladebulgoghi": {"n": "Salade de riz façon poké végétarienne",
                        "st": {1: "Disposer sur le riz les edamame, l'avocat, la mangue et le concombre en dés, et le chou rouge émincé."}},
    "xyemensaltah": {"n": "Poulet au zhoug, riz et salade de tomates", "rep": [["avec le riz et la tomate", "avec le riz et les tomates en salade"]]},
    "xpitafalafelfrites": {"n": "Assiette de poulet shawarma, riz et crudités"},
    "kpizza4": {"rep": [["la napper de crème (pizza blanche) ou de sauce tomate selon le goût", "la napper de crème (c'est une pizza blanche)"]]},

    # --- ingrédients achetés mais jamais utilisés dans les étapes ---
    "margherita": {"del": ["parmesan"]},
    "klasagnesbolo": {"st": {0: "Préparer une bolognaise : faire revenir la pancetta, puis l'oignon, la carotte, le céleri hachés finement et l'ail ; ajouter le bœuf, le vin, le concentré et les tomates, mijoter 1 h."}},
    "cari": {"rep": [["les grains et la coriandre", "les grains (haricots rouges réchauffés) et la coriandre"]]},
    "xpouletbuttermilk": {"rep": [["yaourt salé et paprika", "yaourt salé avec l'ail râpé et le paprika"]]},
    "xboeufbrocoliesauce": {"rep": [["Sauter poivron et oignon 4 min", "Sauter poivron, oignon et ail 4 min"]]},
    "xcotesporcmiel": {"rep": [["Mariner les côtes 15 min.", "Mariner les côtes 15 min avec le miel, le soja, l'ail et le gingembre râpés."]]},
    "xwrapfalafel": {"add": [["citron", 0.15]], "rep": [["un peu de citron si besoin", "un trait de citron"]]},
    "xegyptehawawshi": {"rep": [["Servir avec salade et yaourt.", "Servir avec une salade de tomates et concombre, et le yaourt."]]},
    "xchakchoukamerguez": {"app": "Servir avec la pita chaude."},
    "xlasagneslegumes": {"rep": [["légumes et ricotta.", "légumes, ricotta et basilic."]]},
    "xorzolegumes": {"rep": [["Rôtir les légumes en dés", "Rôtir courgette, poivron et oignon rouge en dés et les tomates cerises entières"]]},
    "xsingapourhainan": {"rep": [["Sauter légumes et crevettes", "Sauter poivron, carotte, pousses de soja et crevettes"]]},
    "xcroqueomelette": {"st": {0: "Monter les croques : pain de mie beurré, jambon, emmental. Les dorer 3 min par face."}},
    "xpotatoesfour": {"rep": [["Paner le poulet,", "Paner le poulet (œuf battu puis chapelure),"]]},
    "xburritorapide": {"rep": [["Garnir les tortillas, rouler, dorer.", "Garnir les tortillas de riz, poulet, salade et cheddar, rouler et dorer."]]},
    "xwrapthai": {"rep": [["Garnir de crudités, poulet et sauce, rouler.", "Garnir les tortillas de carotte et chou rouge râpés, coriandre, poulet et sauce, rouler."]]},
    "xhachiscanard": {"rep": [["Purée de carottes et pommes de terre.", "Purée de carottes et pommes de terre au beurre."], ["Monter en plat, gratiner 15 min.", "Monter en plat, parsemer d'emmental, gratiner 15 min."]]},
    "xsoupecrevettesthai": {"rep": [["Ajouter champignons, tomates et crevettes, 4 min.", "Ajouter champignons, tomates, crevettes et les nouilles de riz trempées, 4 min."]]},
    "xperouaji": {"rep": [["servir avec le riz.", "servir avec le riz et la coriandre."]]},
    "xpouletrotiegratin": {"rep": [["Disposer légumes en morceaux", "Disposer carottes, panais, pommes de terre et oignon rouge en morceaux"]]},
    "xsaucissesfour": {"rep": [["Disposer légumes en morceaux", "Disposer pommes de terre, carottes et oignon rouge en morceaux"]]},
    "xlieupesto": {"rep": [["Rôtir les légumes 15 min.", "Rôtir courgette, poivron et oignon rouge en morceaux 15 min avec l'huile."]]},
    "xcolombiearepas": {"rep": [["garnir de haricots, avocat et tomate.", "garnir de haricots, d'avocat écrasé au citron vert et de tomate."]]},
}

# Garnitures oubliées dans les étapes : phrase ajoutée à la dernière étape (appliquée après l'audit automatique)
GARN = {
    "salade": "Servir avec la salade.", "persil": "Parsemer de persil.", "coriandre": "Parsemer de coriandre.",
    "ciboulette": "Parsemer de ciboulette.", "aneth": "Parsemer d'aneth.", "basilic": "Parsemer de basilic.", "menthe": "Parsemer de menthe.",
    "oignonnouveau": "Parsemer d'oignon nouveau émincé.", "citron": "Servir avec un quartier de citron.", "citronvert": "Servir avec un quartier de citron vert.",
    "painscampagne": "Servir avec du pain grillé.", "baguette": "Servir avec de la baguette.", "nori": "Parsemer de nori en lanières.",
    "sesame": "Parsemer de sésame.",
}


def apply(r, f, I):
    """Applique une correction à une recette (dict) ; renvoie la recette modifiée."""
    r = dict(r); r["ing"] = [list(x) for x in r["ing"]]; r["st"] = list(r["st"])
    for old, (new, q) in f.get("sub", {}).items():
        hit = [x for x in r["ing"] if x[0] == old]
        assert hit, (r["id"], "sub", old)
        hit[0][0] = new
        if q is not None: hit[0][1] = q
    for d in f.get("del", []):
        assert any(x[0] == d for x in r["ing"]), (r["id"], "del", d)
        r["ing"] = [x for x in r["ing"] if x[0] != d]
    for a in f.get("add", []):
        r["ing"].append(list(a))
    for k, v in f.get("st", {}).items():
        r["st"][k] = v
    for a, b, soft in [x + [0] for x in f.get("rep", [])] + [x + [1] for x in f.get("soft", [])]:
        done = False
        for i, s in enumerate(r["st"]):
            if a in s: r["st"][i] = s.replace(a, b); done = True
        if not done and not soft:
            raise AssertionError((r["id"], "rep introuvable", a))
    if f.get("app"):
        r["st"][-1] = r["st"][-1].rstrip() + " " + f["app"]
    if f.get("n"): r["n"] = f["n"]
    for i, _ in r["ing"]:
        assert i in I, (r["id"], "ingrédient inconnu", i)
    return r
