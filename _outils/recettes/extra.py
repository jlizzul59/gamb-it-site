# Crêpes, gaufres, croques… -> menus/extra.js (plats du planning + desserts). Quantités pour 1 portion.
import json
I={
 "farinesarrasin":{"n":"Farine de sarrasin","r":"pl","u":"g","k":3.4},
 "pateatartiner":{"n":"Pâte à tartiner chocolat-noisette","r":"co","u":"cs","k":80},
 "vergeoise":{"n":"Vergeoise brune","r":"pl","u":"cs","k":48},
 "sirop":{"n":"Sirop d'érable","r":"co","u":"cs","k":52},
 "cheddarbloc":{"n":"Cheddar (bloc, à râper)","r":"cr","u":"g","k":4},
 "bacon":{"n":"Bacon en tranches","r":"bo","u":"g","k":3},
 "sucreperle":{"n":"Sucre perlé (ou sucre en morceaux concassé)","r":"pl","u":"g","k":4},
 "orange":{"n":"Oranges","r":"fl","u":"pc","k":60},
}
R=[];D=[];BC={}
def plat(id,n,p,t,ing,st,bt,bj,forr=("fam","l2"),w=None,pays="France",tag=None,simple=False):
    r={"id":"e_"+id,"n":n,"for":list(forr),"p":p,"t":t,"ing":ing,"st":st,"pays":pays,"reg":"France","temp":"chaud"}
    if w:r["w"]=w
    if tag:r["tag"]=tag
    if simple:r["simple"]=1
    R.append(r);BC[r["id"]]={"t":bt,"j":bj}
def des(id,n,t,ing,st,w=None):
    r={"id":"d_"+id,"n":n,"dt":"biscuit","t":t,"ing":ing,"st":st,"dessert":1,"pays":"Biscuits, crêpes & goûters","reg":"Dessert","for":[]}
    if w:r["w"]=w
    D.append(r)
# ---------- Plats ----------
plat("soireecrepes","Soirée crêpes : complètes jambon-fromage-œuf, puis crêpes sucrées","jambon",50,
 [["farine",60],["lait",140],["oeuf",1.5],["beurre",12],["jambon",45],["emmental",30],["sucre",0.5],["pateatartiner",1],["confiture",0.5],["citron",0.15],["salade",40]],
 ["Pâte : dans un saladier, mettre la farine et une pincée de sel, creuser un puits, y casser les œufs de la pâte (2 pour 4 personnes). Fouetter en versant le lait petit à petit, jusqu'à une pâte lisse et fluide comme de la crème liquide. Ajouter la moitié du beurre fondu. Laisser reposer 1 h (ou la nuit au frigo).",
  "Chauffer une poêle à crêpes à feu moyen-vif et la graisser avec un papier essuie-tout trempé dans le beurre fondu. Verser une petite louche de pâte en tournant la poêle pour l'étaler finement.",
  "Quand les bords se décollent et dorent (1 min), retourner la crêpe à la spatule et cuire 30 s de l'autre côté. Empiler les crêpes sur une assiette, sous un torchon.",
  "Complètes : remettre une crêpe dans la poêle, y casser un œuf au centre, étaler le blanc à la spatule, ajouter le jambon et le fromage râpé. Couvrir 2 min, jusqu'à ce que le blanc soit cuit et le fromage fondu, puis replier les bords en carré. Servir avec la salade.",
  "Dessert : garnir les crêpes restantes de sucre et d'un filet de citron, de pâte à tartiner ou de confiture, et les plier en quatre."],
 [["cru","Préparer la pâte à crêpes (elle se garde 24 h au frigo, bien couverte)"]],"Bien mélanger la pâte, cuire les crêpes, garnir les complètes, puis les sucrées au dessert.",forr=("fam",),w="1 h de repos de la pâte",tag="plaisir")
plat("galettesaucisse","Galette-saucisse et salade verte","saucisse",25,
 [["galette",1.5],["toulouse",120],["beurre",5],["moutarde",0.25],["oignon",30],["salade",50],["vinaigre",0.25],["huile",0.5]],
 ["Piquer les saucisses à la fourchette et les cuire 15 min à la poêle à feu moyen avec un filet d'huile, en les retournant pour qu'elles dorent de tous les côtés.",
  "Pendant ce temps, émincer l'oignon et le faire fondre 5 min dans la poêle à côté des saucisses.",
  "Réchauffer les galettes 30 s de chaque côté dans une autre poêle avec une noisette de beurre.",
  "Tartiner chaque galette d'un peu de moutarde, poser une saucisse et des oignons, et l'enrouler bien serrée, comme sur les marchés bretons.",
  "Servir avec la salade à la vinaigrette."],
 [["cru","Laver la salade, émincer l'oignon"]],"Cuire les saucisses 15 min, réchauffer les galettes, rouler.",simple=True)
plat("gaufressalees","Gaufres salées jambon-comté, salade","jambon",35,
 [["farine",60],["lait",90],["oeuf",0.75],["beurre",12],["levure",0.25],["jambon",40],["comte",30],["ciboulette",0.1],["salade",40],["vinaigre",0.25],["huile",0.25]],
 ["Faire chauffer le gaufrier.","Couper le jambon en petits dés, râper le comté, ciseler la ciboulette.",
  "Dans un saladier, mélanger la farine, la levure et une pincée de sel. Ajouter les œufs, puis le lait petit à petit en fouettant, et le beurre fondu.",
  "Ajouter le jambon, le comté et la ciboulette dans la pâte.",
  "Huiler légèrement le gaufrier, verser une louche de pâte et cuire 4 à 5 min, jusqu'à ce que les gaufres soient bien dorées et se décollent toutes seules.",
  "Servir aussitôt avec la salade à la vinaigrette."],
 [["cru","Couper le jambon en dés, râper le comté, laver la salade"]],"Préparer la pâte (10 min), cuire les gaufres au gaufrier.",tag="plaisir")
plat("croquebechamel","Croque-monsieur à la béchamel, façon bistrot, salade verte","jambon",30,
 [["painmie",4],["jambon",50],["emmental",40],["beurre",15],["farine",6],["lait",60],["muscade",0.03],["salade",50],["vinaigre",0.25],["huile",0.5]],
 ["Préchauffer le four à 200 °C, position gril en fin de cuisson.",
  "Béchamel épaisse : faire fondre la moitié du beurre dans une petite casserole, ajouter la farine et mélanger 1 min au fouet. Verser le lait froid en fouettant et laisser épaissir 3 min. Saler, poivrer, muscade.",
  "Beurrer légèrement l'extérieur des tranches de pain avec le reste du beurre.",
  "Sur l'intérieur de la moitié des tranches : une fine couche de béchamel, le jambon plié et un peu d'emmental. Refermer.",
  "Étaler le reste de béchamel sur le dessus des croques et couvrir du reste d'emmental.",
  "Cuire 10 min sur une plaque, puis 2 à 3 min sous le gril jusqu'à ce que le dessus soit bien gratiné.",
  "Servir avec la salade."],
 [["feu","Préparer la béchamel (2 jours au frigo, film au contact)"],["cru","Laver la salade"]],"Monter les croques avec la béchamel, 10 min au four puis gril.",tag="plaisir")
plat("welsh","Welsh au cheddar et à la bière, frites","jambon",30,
 [["painscampagne",80],["jambon",40],["cheddarbloc",120],["biere",50],["moutarde",0.5],["oeuf",0.5],["frites",150],["salade",30]],
 ["Préchauffer le four à 220 °C. Mettre les frites au four selon le paquet.",
  "Dans chaque plat individuel allant au four, poser une tranche de pain de campagne, l'arroser d'un peu de bière et poser le jambon dessus.",
  "Râper le cheddar. Le faire fondre dans une casserole à feu doux avec le reste de bière et la moutarde, en remuant sans arrêt avec une cuillère en bois, jusqu'à une crème lisse (ne pas faire bouillir).",
  "Verser le cheddar fondu sur le pain pour bien le recouvrir. Facultatif : un œuf au plat posé dessus à la sortie du four.",
  "Cuire 10 min, jusqu'à ce que le dessus gratine. Servir bien chaud avec les frites et un peu de salade. La bière s'évapore à la cuisson."],
 [["cru","Râper le cheddar"]],"Fondre le cheddar à la bière, monter les welshs, 10 min au four avec les frites.",forr=("fam",),tag="plaisir")
plat("ficellepicarde","Ficelles picardes, crêpes jambon-champignons gratinées","jambon",50,
 [["farine",40],["lait",90],["oeuf",0.5],["beurre",15],["jambon",45],["champignons",80],["echalote",10],["creme",50],["emmental",25],["salade",40]],
 ["Pâte : mélanger la farine et une pincée de sel, ajouter les œufs puis le lait petit à petit en fouettant, et 1 cuillère de beurre fondu. Laisser reposer 30 min. Cuire des crêpes fines (2 par personne) dans une poêle beurrée, 1 min de chaque côté.",
  "Émincer l'échalote et les champignons. Les faire revenir 8 min dans le reste du beurre, jusqu'à ce que l'eau des champignons s'évapore. Hors du feu, ajouter la moitié de la crème, saler et poivrer.",
  "Préchauffer le four à 200 °C. Sur chaque crêpe, poser une tranche de jambon et une cuillère de champignons. Rouler et ranger dans un plat beurré.",
  "Napper du reste de crème, parsemer d'emmental et gratiner 15 min.",
  "Servir avec la salade."],
 [["feu","Cuire les crêpes (elles se gardent 2 jours au frigo, empilées et filmées)"],["feu","Faire revenir les champignons à l'échalote"]],"Rouler les crêpes garnies, napper de crème et gratiner 15 min.",forr=("fam",))
plat("pancakesbrunch","Pancakes, œufs brouillés et bacon","oeuf",35,
 [["farine",50],["lait",60],["oeuf",1.5],["beurre",8],["levure",0.3],["sucre",0.25],["bacon",40],["sirop",1],["ciboulette",0.05]],
 ["Pâte : mélanger la farine, la levure, le sucre et une pincée de sel. Ajouter un œuf par 2 personnes, le lait et le beurre fondu, et fouetter juste assez pour qu'il n'y ait plus de gros grumeaux (une pâte épaisse).",
  "Chauffer une poêle à feu moyen, la graisser légèrement. Verser des petites louches de pâte (10 cm). Quand des bulles apparaissent à la surface (2 min), retourner et cuire 1 min. Garder au chaud sous un torchon.",
  "Cuire le bacon à la poêle 2 min de chaque côté, jusqu'à ce qu'il soit croustillant.",
  "Œufs brouillés : battre les œufs restants avec du sel et du poivre, les verser dans une casserole à feu doux avec une noisette de beurre et remuer sans arrêt à la spatule 3 à 4 min. Les retirer encore crémeux. Parsemer de ciboulette.",
  "Servir les pancakes avec le bacon, les œufs et un filet de sirop d'érable."],
 [],"Tout se fait le jour J (35 min).",forr=("fam",))
# ---------- Desserts ----------
des("pancakes","Pancakes au sirop d'érable",25,[["farine",40],["lait",50],["oeuf",0.5],["beurre",6],["levure",0.25],["sucre",0.5],["sirop",1]],
 ["Mélanger la farine, la levure, le sucre et une pincée de sel. Ajouter les œufs, le lait et le beurre fondu, et fouetter juste assez pour une pâte épaisse sans gros grumeaux.",
  "Cuire de petites louches de pâte dans une poêle légèrement graissée à feu moyen : retourner quand des bulles apparaissent (2 min), puis 1 min de l'autre côté.",
  "Servir en pile avec le sirop d'érable (ou du miel, des fruits rouges)."])
des("crepesvergeoise","Crêpes à la vergeoise et au beurre (comme dans le Nord)",30,[["farine",30],["lait",70],["oeuf",0.5],["beurre",8],["vergeoise",1]],
 ["Préparer la pâte : farine, pincée de sel, œufs, puis le lait petit à petit en fouettant, et un peu de beurre fondu. Laisser reposer 1 h si possible.",
  "Cuire les crêpes fines dans une poêle beurrée, 1 min de chaque côté.",
  "Dès la sortie de la poêle, étaler une noisette de beurre et saupoudrer de vergeoise : elle fond et caramélise légèrement. Plier en quatre."],w="1 h de repos")
des("crepesbanane","Crêpes banane-chocolat",30,[["farine",30],["lait",70],["oeuf",0.5],["beurre",5],["banane",0.5],["pateatartiner",1]],
 ["Préparer la pâte et cuire les crêpes (voir les crêpes classiques).",
  "Couper les bananes en rondelles.","Tartiner chaque crêpe chaude de pâte à tartiner, ajouter les rondelles de banane et plier en quatre."],w="1 h de repos")
des("crepessuzette","Crêpes Suzette",40,[["farine",30],["lait",70],["oeuf",0.5],["beurre",20],["sucre",1],["orange",0.75]],
 ["Préparer la pâte et cuire les crêpes fines (voir les crêpes classiques).",
  "Râper le zeste d'une orange et presser le jus de toutes.",
  "Dans une grande poêle, faire fondre le beurre avec le sucre jusqu'à un caramel blond, verser le jus et le zeste (attention aux éclaboussures) et laisser réduire 3 min en sirop.",
  "Plier les crêpes en quatre, les passer dans le sirop chaud des deux côtés, servir aussitôt. Version adulte : on peut ajouter un trait de liqueur d'orange au sirop."],w="1 h de repos")
des("gaufresliege","Gaufres de Liège",40,[["farine",50],["lait",15],["oeuf",0.25],["beurre",25],["levureb",0.1],["sucreperle",30],["sucrevanille",0.15]],
 ["Délayer la levure de boulanger dans le lait tiède.",
  "Mélanger la farine, le sucre vanillé, une pincée de sel, l'œuf et le lait à la levure. Pétrir 5 min, puis incorporer le beurre mou petit à petit jusqu'à une pâte souple.",
  "Laisser lever 1 h dans un endroit tiède : la pâte gonfle.",
  "Incorporer le sucre perlé, former des boules de 80 g et les laisser reposer 15 min.",
  "Cuire chaque boule 3 à 4 min dans le gaufrier bien chaud, jusqu'à ce que le sucre caramélise. Attention, le caramel est brûlant : laisser tiédir avant de croquer."],w="1 h 15 de pousse")
out="// Crêpes, gaufres, croques… : plats du planning (R) et desserts (D). Généré par _outils/recettes/extra.py.\nwindow.MENUS_EXTRA="+json.dumps({"I":I,"R":R,"D":D,"BC":BC},ensure_ascii=False,separators=(",",":"))+";\n"
out+="// Les desserts rejoignent la liste des desserts avant son chargement\n(()=>{const X=window.MENUS_EXTRA,DS=window.MENUS_DESSERTS;if(!X||!DS)return;Object.assign(DS.I=DS.I||{},X.I);X.D.forEach(d=>{if(!DS.R.some(r=>r.id===d.id))DS.R.push(d)})})();\n"
open("menus/extra.js","w",encoding="utf-8").write(out)
print(len(R),"plats,",len(D),"desserts")
