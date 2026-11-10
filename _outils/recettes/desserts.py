#!/usr/bin/env python3
"""Génère menus/desserts.js : les desserts du catalogue (ingrédients, saisons, recettes).

Quantités par portion. Les desserts ne sont jamais proposés comme plat par le semainier :
ils vivent dans le rayon « Desserts » du catalogue et peuvent aller dans la liste de courses.
Lancer depuis la racine du dépôt : python3 _outils/recettes/desserts.py
(I.json = ingrédients existants, exportés par _outils/recettes/ingredients.js)
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
EXIST = json.load(open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "I.json")))

# Nouveaux ingrédients : n nom, r rayon, u unité, k kcal par unité, c groupe, w/wl poids d'un article
NEWI = {
    "fraises": {"n": "Fraises", "r": "fl", "u": "g", "k": 0.33, "c": "Fruits", "w": 250, "wl": "barquette"},
    "framboises": {"n": "Framboises", "r": "fl", "u": "g", "k": 0.5, "c": "Fruits", "w": 125, "wl": "barquette"},
    "myrtilles": {"n": "Myrtilles", "r": "fl", "u": "g", "k": 0.57, "c": "Fruits", "w": 125, "wl": "barquette"},
    "fruitsrouges": {"n": "Fruits rouges surgelés", "r": "co", "u": "g", "k": 0.45, "c": "Fruits"},
    "cerises": {"n": "Cerises", "r": "fl", "u": "g", "k": 0.63, "c": "Fruits"},
    "poire": {"n": "Poires", "r": "fl", "u": "pc", "k": 95, "c": "Fruits"},
    "banane": {"n": "Bananes", "r": "fl", "u": "pc", "k": 105, "c": "Fruits"},
    "peche": {"n": "Pêches ou nectarines", "r": "fl", "u": "pc", "k": 60, "c": "Fruits"},
    "abricotf": {"n": "Abricots frais", "r": "fl", "u": "pc", "k": 17, "c": "Fruits"},
    "prunes": {"n": "Prunes ou quetsches", "r": "fl", "u": "g", "k": 0.46, "c": "Fruits"},
    "kiwi": {"n": "Kiwis", "r": "fl", "u": "pc", "k": 45, "c": "Fruits"},
    "clementine": {"n": "Clémentines", "r": "fl", "u": "pc", "k": 35, "c": "Fruits"},
    "raisin": {"n": "Raisin", "r": "fl", "u": "g", "k": 0.7, "c": "Fruits"},
    "figues": {"n": "Figues fraîches", "r": "fl", "u": "pc", "k": 35, "c": "Fruits"},
    "rhubarbe": {"n": "Rhubarbe", "r": "fl", "u": "g", "k": 0.21, "c": "Fruits"},
    "melon": {"n": "Melon", "r": "fl", "u": "g", "k": 0.34, "c": "Fruits", "w": 700, "wl": "melon"},
    "ananasf": {"n": "Ananas frais", "r": "fl", "u": "g", "k": 0.5, "c": "Fruits", "w": 900, "wl": "ananas"},
    "chocolat": {"n": "Chocolat noir pâtissier", "r": "co", "u": "g", "k": 5.4, "w": 200, "wl": "tablette"},
    "cacao": {"n": "Cacao en poudre non sucré", "r": "co", "u": "g", "k": 3.5},
    "sucrevanille": {"n": "Sucre vanillé", "r": "pl", "u": "pc", "k": 30},
    "cremeliquide": {"n": "Crème liquide entière 30 %", "r": "cr", "u": "ml", "k": 3.0, "c": "Fromages & crème"},
    "poudreamande": {"n": "Poudre d'amande", "r": "co", "u": "g", "k": 6.0, "c": "Fruits secs"},
    "cocorapee": {"n": "Noix de coco râpée", "r": "co", "u": "g", "k": 6.6, "c": "Fruits secs"},
    "flocons": {"n": "Flocons d'avoine", "r": "co", "u": "g", "k": 3.7},
    "petitbeurre": {"n": "Petits-beurre", "r": "co", "u": "pc", "k": 22},
    "speculoos": {"n": "Spéculoos", "r": "co", "u": "pc", "k": 40},
    "boudoirs": {"n": "Biscuits à la cuillère", "r": "co", "u": "pc", "k": 22},
    "patebrisee": {"n": "Pâte brisée (rouleau)", "r": "cr", "u": "g", "k": 4.2, "w": 230, "wl": "rouleau"},
    "patefeuilletee": {"n": "Pâte feuilletée (rouleau)", "r": "cr", "u": "g", "k": 4.0, "w": 230, "wl": "rouleau"},
    "confiture": {"n": "Confiture", "r": "co", "u": "cs", "k": 40},
    "rizrond": {"n": "Riz rond (dessert)", "r": "co", "u": "g", "k": 3.5},
    "semoulefine": {"n": "Semoule fine", "r": "co", "u": "g", "k": 3.5},
    "brioche": {"n": "Brioche (tranches)", "r": "pa", "u": "pc", "k": 90},
    "gelatine": {"n": "Gélatine (feuilles)", "r": "co", "u": "pc", "k": 6},
    "cafe": {"n": "Café fort", "r": "pl", "u": "ml", "k": 0.02},
}
# Mois de saison (début, fin), comme SEASON du catalogue
SAISON = {"fraises": [5, 7], "framboises": [6, 9], "myrtilles": [7, 9], "cerises": [5, 7], "abricotf": [6, 8], "peche": [6, 9],
          "prunes": [8, 9], "figues": [8, 10], "raisin": [9, 10], "poire": [8, 3], "kiwi": [11, 4], "clementine": [11, 2],
          "rhubarbe": [4, 6], "melon": [6, 9]}

# Types de dessert (même ordre que le rayon)
TYPES = [["fruit", "Fruits"], ["creme", "Crèmes & mousses"], ["gateau", "Gâteaux, tartes & crumbles"],
         ["biscuit", "Biscuits, crêpes & goûters"], ["glace", "Glacés"]]

# id | nom | type | minutes | sans cuisson | repos | ingrédients | étapes (>>)
D = """
saladeoranges|Salade d'oranges à la cannelle|fruit|10|1||orange 1.5, miel 0.25, cannelle 0.1, menthe 0.05|Peler les oranges à vif et les couper en rondelles >> Les disposer dans un plat, arroser de miel et saupoudrer de cannelle >> Parsemer de menthe ciselée et servir frais
fraisescitron|Fraises au citron et à la menthe|fruit|10|1||fraises 150, citron 0.1, sucre 0.25, menthe 0.05|Laver, équeuter et couper les fraises en deux >> Mélanger avec le jus de citron, le sucre et la menthe ciselée >> Laisser reposer 10 min au frais avant de servir
saladeete|Salade de fruits d'été|fruit|15|1||fraises 60, peche 0.5, melon 80, myrtilles 30, citron 0.1, menthe 0.05|Couper les fraises, la pêche et le melon en morceaux >> Ajouter les myrtilles, le jus de citron et la menthe ciselée >> Mélanger délicatement et servir bien frais
saladeautomne|Salade de fruits d'automne|fruit|15|1||pomme 0.5, poire 0.5, raisin 60, clementine 1, citron 0.1, miel 0.25|Couper la pomme et la poire en dés, arroser aussitôt de jus de citron >> Ajouter le raisin coupé en deux et les quartiers de clémentine >> Arroser de miel, mélanger et servir
pommesfour|Pommes au four, miel et cannelle|fruit|35|||pomme 1, beurre 5, miel 0.5, cannelle 0.25, raisins 10|Préchauffer le four à 180 °C. Évider les pommes sans les percer au fond >> Garnir le centre de raisins secs, de beurre, de miel et de cannelle >> Cuire 25 à 30 min, jusqu'à ce que les pommes soient fondantes, et servir tiède
poirespochees|Poires pochées à la vanille|fruit|30|||poire 1, sucre 0.75, sucrevanille 0.25, citron 0.1|Peler les poires en gardant la queue >> Porter à frémissement 1 L d'eau avec le sucre, le sucre vanillé et le jus de citron >> Pocher les poires 20 min à feu doux, puis les laisser refroidir dans le sirop
bananespoelees|Bananes poêlées au miel et à l'orange|fruit|10|||banane 1, beurre 5, miel 0.5, orange 0.25|Couper les bananes en deux dans la longueur >> Les dorer 2 min de chaque côté dans le beurre chaud >> Ajouter le miel et le jus d'orange, laisser caraméliser 1 min et servir chaud
brochettes|Brochettes de fruits, sauce chocolat|fruit|15|||fraises 60, banane 0.5, kiwi 0.5, chocolat 15, lait 15|Couper les fruits en morceaux et les piquer sur des brochettes >> Faire fondre le chocolat avec le lait à feu très doux en remuant >> Servir les brochettes avec la sauce chocolat tiède pour tremper
ananascoco|Carpaccio d'ananas, citron vert et coco|fruit|15|1||ananasf 150, citronvert 0.25, cocorapee 4, sucre 0.25|Peler l'ananas et le couper en tranches très fines >> Les étaler sur une assiette, arroser de jus de citron vert et saupoudrer de sucre >> Parsemer de noix de coco râpée et servir frais
soupemelon|Soupe de melon à la menthe|fruit|10|1||melon 200, citron 0.1, menthe 0.05, sucre 0.25|Couper le melon en morceaux en retirant la peau et les graines >> Mixer avec le jus de citron, le sucre et la menthe >> Servir bien frais dans des verres
figuesroties|Figues rôties au miel et aux noix|fruit|20|||figues 3, miel 0.5, noix 10, yaourt 50|Préchauffer le four à 200 °C. Inciser les figues en croix >> Les arroser de miel, parsemer de noix concassées et cuire 12 min >> Servir tiède avec une cuillerée de yaourt
pechesroties|Pêches rôties aux amandes|fruit|25|||peche 1.5, miel 0.5, amandes 8, beurre 4|Préchauffer le four à 190 °C. Couper les pêches en deux et retirer le noyau >> Les poser dans un plat, ajouter le beurre et le miel, parsemer d'amandes >> Cuire 15 à 20 min et servir tiède
compotepommes|Compote pommes-poires maison|fruit|25|||pomme 1, poire 0.5, cannelle 0.1, sucre 0.25|Peler les fruits et les couper en morceaux >> Les cuire à couvert avec un fond d'eau, le sucre et la cannelle pendant 15 à 20 min >> Écraser à la fourchette ou mixer, servir tiède ou froid
compoterhubarbe|Compote rhubarbe-fraises|fruit|25|||rhubarbe 100, fraises 80, sucre 1|Éplucher la rhubarbe et la couper en tronçons >> La cuire 10 min avec le sucre et un fond d'eau >> Ajouter les fraises coupées, cuire encore 5 min et laisser refroidir
mangueverte|Mangue au citron vert et au yaourt|fruit|10|1||mangue 120, citronvert 0.25, yaourt 60, miel 0.25|Couper la mangue en dés >> Arroser de jus de citron vert >> Servir sur le yaourt, avec un filet de miel
mousschoc|Mousse au chocolat|creme|20||3 h au frais|chocolat 40, oeuf 1, sucre 0.25|Faire fondre le chocolat au bain-marie et le laisser tiédir >> Séparer les blancs des jaunes, incorporer les jaunes au chocolat >> Monter les blancs en neige ferme avec le sucre >> Incorporer délicatement les blancs au chocolat, répartir en ramequins et laisser prendre au frais
cremechoc|Crème dessert au chocolat|creme|15||2 h au frais|lait 125, chocolat 20, maizena 6, sucre 0.5|Délayer la Maïzena dans un peu de lait froid >> Chauffer le reste du lait avec le sucre et le chocolat en morceaux >> Ajouter la Maïzena et remuer sans arrêt jusqu'à épaississement >> Verser dans des pots et laisser refroidir au frais
cremevanille|Crème vanille maison|creme|15||2 h au frais|lait 125, maizena 8, sucre 0.5, sucrevanille 0.25, oeuf 0.25|Délayer la Maïzena dans un peu de lait froid avec l'œuf battu >> Chauffer le reste du lait avec le sucre et le sucre vanillé >> Ajouter le mélange et remuer sans arrêt jusqu'à épaississement >> Verser dans des pots et laisser refroidir au frais
rizlait|Riz au lait à la vanille|creme|40|||rizrond 25, lait 150, sucre 0.75, sucrevanille 0.25|Rincer le riz et le blanchir 2 min dans l'eau bouillante, égoutter >> Le cuire à feu très doux dans le lait 30 min en remuant souvent >> Ajouter le sucre et le sucre vanillé en fin de cuisson, servir tiède ou froid
ilesflottantes|Îles flottantes|creme|30||1 h au frais|oeuf 1, lait 125, sucre 1, sucrevanille 0.25|Chauffer le lait avec le sucre vanillé. Fouetter les jaunes avec la moitié du sucre >> Verser le lait chaud sur les jaunes, remettre sur feu doux et remuer jusqu'à ce que la crème nappe la cuillère >> Monter les blancs en neige avec le reste du sucre et les pocher 1 min de chaque côté dans de l'eau frémissante >> Servir les blancs sur la crème anglaise froide
petitspots|Petits pots de crème aux œufs|creme|45||2 h au frais|lait 120, oeuf 1, sucre 0.75, sucrevanille 0.25|Préchauffer le four à 150 °C. Chauffer le lait avec le sucre vanillé >> Fouetter les œufs avec le sucre, verser le lait chaud dessus >> Répartir dans des ramequins et cuire 35 min au bain-marie >> Laisser refroidir puis réserver au frais
pannacotta|Panna cotta aux fruits rouges|creme|20||4 h au frais|cremeliquide 60, lait 40, sucre 0.75, gelatine 0.5, fruitsrouges 50|Faire ramollir la gélatine dans l'eau froide >> Chauffer la crème, le lait et la moitié du sucre sans bouillir, puis y dissoudre la gélatine essorée >> Verser dans des verrines et laisser prendre au frais >> Cuire les fruits rouges 5 min avec le reste du sucre et napper les panna cotta au moment de servir
tiramisu|Tiramisu|creme|30|1|4 h au frais|mascarpone 50, oeuf 1, sucre 0.75, boudoirs 3, cafe 40, cacao 2|Fouetter les jaunes avec le sucre, puis ajouter le mascarpone >> Monter les blancs en neige et les incorporer délicatement >> Tremper rapidement les biscuits dans le café et les disposer dans un plat >> Alterner biscuits et crème, saupoudrer de cacao et laisser reposer au frais
fromageblancmiel|Fromage blanc, miel et noix|creme|5|1||fromageblanc 120, miel 0.5, noix 10|Répartir le fromage blanc dans des bols >> Arroser de miel et parsemer de noix concassées >> Servir aussitôt
verrinesyaourt|Verrines yaourt, fruits rouges et spéculoos|creme|10|1||yaourt 125, fruitsrouges 60, speculoos 1, miel 0.25|Faire décongeler les fruits rouges >> Émietter les spéculoos >> Alterner dans des verres yaourt sucré au miel, fruits rouges et biscuits émiettés
moussecitron|Mousse légère au citron|creme|20|1|1 h au frais|fromageblanc 80, oeuf 0.5, citron 0.25, sucre 0.5|Mélanger le fromage blanc avec le zeste et le jus de citron et la moitié du sucre >> Monter le blanc d'œuf en neige avec le reste du sucre >> L'incorporer délicatement, répartir en verrines et réserver au frais
cheesecakeverrine|Cheesecake en verrine aux fraises|creme|15|1|1 h au frais|fromagefrais 60, fromageblanc 50, sucre 0.5, petitbeurre 1.5, beurre 5, fraises 60|Écraser les petits-beurre et les mélanger au beurre fondu, tasser au fond des verres >> Fouetter le fromage frais, le fromage blanc et le sucre >> Répartir sur les biscuits et réserver au frais >> Couvrir de fraises coupées au moment de servir
moussemangue|Mousse mangue-coco|creme|15|1|1 h au frais|mangue 100, coco 40, yaourt 50, citronvert 0.1|Mixer la mangue avec le lait de coco, le yaourt et le jus de citron vert >> Verser dans des verrines >> Réserver au frais avant de servir
gateauyaourt|Gâteau au yaourt|gateau|45|||yaourt 30, sucre 1, farine 35, oeuf 0.75, beurre 12, levure 0.25, sucrevanille 0.13|Préchauffer le four à 180 °C. Mélanger le yaourt, le sucre et les œufs >> Ajouter la farine, la levure, le sucre vanillé puis le beurre fondu >> Verser dans un moule beurré et cuire 30 à 35 min
fondantchoc|Fondant au chocolat|gateau|35|||chocolat 25, beurre 15, sucre 0.5, oeuf 0.5, farine 6|Préchauffer le four à 180 °C. Faire fondre le chocolat avec le beurre >> Ajouter le sucre, les œufs un à un puis la farine >> Verser dans un moule beurré et cuire 20 min : le cœur doit rester fondant
brownie|Brownie aux noix|gateau|40|||chocolat 25, beurre 15, sucre 0.75, oeuf 0.5, farine 10, noix 10|Préchauffer le four à 180 °C. Faire fondre le chocolat avec le beurre >> Ajouter le sucre, les œufs, la farine puis les noix concassées >> Étaler dans un moule carré et cuire 20 à 25 min, laisser tiédir avant de couper
clafoutis|Clafoutis aux cerises|gateau|45|||cerises 100, oeuf 0.75, lait 60, farine 15, sucre 0.75, beurre 3|Préchauffer le four à 180 °C. Laver et équeuter les cerises, les répartir dans un plat beurré >> Fouetter les œufs avec le sucre, ajouter la farine puis le lait >> Verser sur les cerises et cuire 35 min, servir tiède
crumblepommes|Crumble aux pommes|gateau|45|||pomme 1, farine 20, beurre 12, sucre 0.75, flocons 10, cannelle 0.1|Préchauffer le four à 180 °C. Couper les pommes en dés dans un plat, saupoudrer de cannelle >> Sabler du bout des doigts la farine, les flocons, le sucre et le beurre froid >> Couvrir les fruits de ce mélange et cuire 30 min, jusqu'à ce que ce soit doré
crumblepoires|Crumble poires-chocolat|gateau|45|||poire 1, chocolat 10, farine 20, beurre 12, sucre 0.75, poudreamande 8|Préchauffer le four à 180 °C. Couper les poires en dés dans un plat, ajouter le chocolat en morceaux >> Sabler la farine, la poudre d'amande, le sucre et le beurre froid >> Couvrir les fruits de ce mélange et cuire 30 min
crumbleprunes|Crumble aux quetsches|gateau|45|||prunes 150, farine 20, beurre 12, sucre 1, cannelle 0.1|Préchauffer le four à 180 °C. Couper les quetsches en deux, retirer les noyaux et les disposer dans un plat >> Sabler la farine, le sucre, la cannelle et le beurre froid >> Couvrir les fruits et cuire 30 à 35 min
tartepommes|Tarte fine aux pommes|gateau|40|||patefeuilletee 30, pomme 0.75, sucre 0.5, beurre 4|Préchauffer le four à 200 °C. Dérouler la pâte et la piquer >> Couvrir de pommes en fines lamelles, saupoudrer de sucre et parsemer de beurre >> Cuire 25 à 30 min, jusqu'à ce que les bords soient dorés
tartefraises|Tarte aux fraises|gateau|50||1 h au frais|patebrisee 30, fraises 100, lait 60, oeuf 0.5, sucre 0.75, maizena 5|Préchauffer le four à 180 °C. Cuire la pâte à blanc 20 min, couverte de papier et de légumes secs >> Chauffer le lait ; fouetter l'œuf, le sucre et la Maïzena, verser le lait chaud et épaissir sur feu doux >> Étaler la crème refroidie sur le fond de tarte >> Disposer les fraises coupées en deux et réserver au frais
tarteabricots|Tarte aux abricots|gateau|45|||patebrisee 30, abricotf 3, sucre 0.5, poudreamande 8|Préchauffer le four à 190 °C. Foncer un moule avec la pâte et la piquer >> Parsemer de poudre d'amande, puis disposer les abricots coupés en deux, face bombée vers le bas >> Saupoudrer de sucre et cuire 30 à 35 min
quatrequarts|Quatre-quarts|gateau|55|||oeuf 0.5, farine 25, sucre 2, beurre 25|Préchauffer le four à 170 °C. Faire fondre le beurre >> Fouetter les œufs avec le sucre, ajouter la farine puis le beurre fondu >> Verser dans un moule à cake beurré et cuire 40 min
gateaupommes|Gâteau moelleux aux pommes|gateau|50|||pomme 0.5, oeuf 0.5, farine 25, sucre 1, beurre 12, lait 15, levure 0.25|Préchauffer le four à 180 °C. Fouetter les œufs et le sucre, ajouter le lait, la farine, la levure puis le beurre fondu >> Incorporer les pommes coupées en dés >> Verser dans un moule beurré et cuire 35 à 40 min
bananabread|Banana bread|gateau|60|||banane 0.5, farine 30, sucre 0.5, oeuf 0.25, beurre 10, levure 0.25, noix 5|Préchauffer le four à 175 °C. Écraser les bananes bien mûres >> Mélanger avec le sucre, l'œuf, le beurre fondu, puis la farine, la levure et les noix >> Verser dans un moule à cake et cuire 45 à 50 min
semoulegateau|Gâteau de semoule aux raisins|gateau|35||1 h au frais|semoulefine 25, lait 150, sucre 0.75, oeuf 0.5, raisins 10|Porter le lait à ébullition avec le sucre, verser la semoule en pluie et cuire 5 min en remuant >> Hors du feu, ajouter les raisins puis les œufs battus >> Verser dans un moule et cuire 20 min au four à 180 °C, laisser refroidir
financiers|Financiers aux amandes|biscuit|30|||poudreamande 15, sucre 1, beurre 15, oeuf 0.5, farine 6|Préchauffer le four à 200 °C. Faire fondre le beurre jusqu'à ce qu'il soit noisette >> Mélanger la poudre d'amande, le sucre et la farine, ajouter les blancs puis le beurre >> Remplir des petits moules et cuire 12 à 15 min
madeleines|Madeleines au citron|biscuit|30||30 min au frais|farine 20, sucre 0.75, beurre 12, oeuf 0.5, levure 0.1, citron 0.05|Fouetter les œufs et le sucre, ajouter la farine, la levure, le zeste de citron puis le beurre fondu >> Laisser reposer la pâte au frais >> Remplir des moules à madeleines et cuire 10 min à 210 °C
cookies|Cookies aux pépites de chocolat|biscuit|25|||farine 25, beurre 12, sucre 1, oeuf 0.25, chocolat 15, levure 0.1|Préchauffer le four à 180 °C. Mélanger le beurre mou et le sucre, ajouter l'œuf >> Incorporer la farine, la levure et le chocolat haché >> Former des boules sur une plaque et cuire 10 à 12 min : ils durcissent en refroidissant
cookiesavoine|Cookies flocons d'avoine et banane|biscuit|25|||flocons 30, banane 0.5, chocolat 8, raisins 8|Préchauffer le four à 180 °C. Écraser la banane et la mélanger aux flocons >> Ajouter le chocolat haché et les raisins >> Former des petits tas sur une plaque et cuire 15 min
crepes|Crêpes|biscuit|30||1 h de repos|farine 30, lait 70, oeuf 0.5, sucre 0.25, beurre 4, confiture 0.5|Mélanger la farine et le sucre, ajouter les œufs puis le lait petit à petit en fouettant >> Ajouter le beurre fondu et laisser reposer la pâte >> Cuire les crêpes dans une poêle chaude légèrement beurrée >> Servir avec la confiture
painperdu|Pain perdu|biscuit|15|||brioche 1.5, lait 60, oeuf 0.5, sucre 0.5, beurre 5|Battre l'œuf avec le lait et le sucre >> Tremper les tranches de brioche des deux côtés >> Les dorer 2 min de chaque côté dans le beurre chaud et servir aussitôt
gaufres|Gaufres|biscuit|30|||farine 30, lait 50, oeuf 0.5, beurre 8, sucre 0.5, levure 0.1|Mélanger la farine, le sucre et la levure, ajouter les œufs puis le lait >> Ajouter le beurre fondu >> Cuire dans le gaufrier bien chaud 3 à 4 min
rochercoco|Rochers à la noix de coco|biscuit|25|||cocorapee 20, sucre 0.75, oeuf 0.25|Préchauffer le four à 180 °C. Mélanger la noix de coco, le sucre et le blanc d'œuf >> Former des petits rochers sur une plaque >> Cuire 12 à 15 min, jusqu'à ce que les pointes soient dorées
nicecream|Glace minute banane-cacao|glace|10|1|bananes congelées la veille|banane 1, cacao 3, lait 15|Mixer les bananes congelées en rondelles avec le cacao et le lait >> Racler les parois et mixer jusqu'à obtenir une texture de glace >> Servir aussitôt
sorbetrouge|Sorbet minute aux fruits rouges|glace|10|1||fruitsrouges 120, miel 0.5, yaourt 30, citron 0.1|Mixer les fruits rouges encore surgelés avec le miel, le yaourt et le jus de citron >> Mixer jusqu'à obtenir un sorbet lisse >> Servir aussitôt
yaourtglace|Yaourt glacé à la mangue|glace|10|1|2 h au congélateur|mangue 100, yaourt 80, miel 0.5|Mixer la mangue avec le yaourt et le miel >> Verser dans une boîte et mettre au congélateur en remuant toutes les 30 min >> Laisser 5 min à température ambiante avant de servir
granitecitron|Granité au citron|glace|15|1|3 h au congélateur|citron 0.5, sucre 1, menthe 0.05|Dissoudre le sucre dans 100 ml d'eau chaude par personne, ajouter le jus et le zeste de citron >> Verser dans un plat et mettre au congélateur >> Gratter à la fourchette toutes les 30 min pour former des cristaux, servir avec la menthe
batonnets|Bâtonnets glacés fraise-yaourt|glace|10|1|4 h au congélateur|fraises 80, yaourt 60, miel 0.5|Mixer les fraises avec le miel >> Remplir des moules à glace en alternant yaourt et purée de fraises >> Planter un bâtonnet et laisser prendre au congélateur
"""

errs, R = [], []
ALL = dict(EXIST); ALL.update(NEWI)
for ln in [x.strip() for x in D.strip().split("\n") if x.strip()]:
    p = ln.split("|")
    if len(p) != 8: errs.append(f"{ln[:40]} : {len(p)} champs"); continue
    rid, n, dt, t, nc, wait, ing, st = p
    if dt not in dict(TYPES): errs.append(f"{rid} : type {dt}")
    ings = []
    for it in [x.strip() for x in ing.split(",") if x.strip()]:
        k, q = it.rsplit(" ", 1)
        if k not in ALL: errs.append(f"{rid} : ingrédient inconnu {k}"); continue
        q = float(q); ings.append([k, int(q) if q == int(q) else q])
    steps = [s.strip().rstrip(".") + "." for s in st.split(">>") if s.strip()]
    r = {"id": "d_" + rid, "n": n, "dt": dt, "t": int(t), "ing": ings, "st": steps, "dessert": 1}
    if nc: r["nc"] = 1
    if wait: r["w"] = wait
    R.append(r)
if errs: print("\n".join(errs)); sys.exit(1)
if len({r["id"] for r in R}) != len(R): print("id en double"); sys.exit(1)

out = os.path.join(ROOT, "menus", "desserts.js")
js = ("// Desserts du catalogue (généré par _outils/recettes/desserts.py, ne pas éditer à la main).\n"
      "window.MENUS_DESSERTS=" + json.dumps({"I": NEWI, "S": SAISON, "T": TYPES, "R": R}, ensure_ascii=False, separators=(",", ":")) + ";\n")
open(out, "w", encoding="utf-8").write(js)
kc = lambda r: round(sum(q * ALL[k]["k"] for k, q in r["ing"]))
from collections import Counter
print(len(R), "desserts ;", len(js) // 1024, "Ko")
print("types :", dict(Counter(r["dt"] for r in R)))
lv = lambda c: "léger" if c <= 180 else "moyen" if c <= 320 else "gourmand"
print("niveaux :", dict(Counter(lv(kc(r)) for r in R)))
for r in sorted(R, key=kc): print(f"  {kc(r):4d} kcal  {r['n']}")
