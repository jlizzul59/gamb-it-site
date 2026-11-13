// Think’n’Cook — fiches techniques et recettes « avec ou sans batch cooking ».
// Partagé par le planning (index.html) et le catalogue (recettes.html). Utilise esc, fmt, I et BC des pages.
(()=>{
const gE=()=>typeof esc==="function"?esc:(s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])));
const gI=()=>typeof I!=="undefined"?I:{};
const gB=()=>typeof BC!=="undefined"?BC:{};
// Chaque fiche : t = titre, rx = mots qui la déclenchent dans une étape, mat = matériel, st = pas à pas,
// ok = comment savoir que c'est réussi, oups = si ça rate, av = se prépare à l'avance ?
const F={
bechamel:{b:"Faire fondre le beurre, ajouter la farine et cuire 1 min en fouettant, puis verser le lait froid petit à petit et laisser épaissir 5 min. Saler, poivrer, muscade.",t:"Faire une béchamel",rx:/b[ée]chamel/i,
 mat:"Une casserole, un fouet, une cuillère en bois.",
 q:"Repère : autant de beurre que de farine (par exemple 40 g + 40 g) pour 50 cl de lait. Plus de lait = plus liquide.",
 st:["Faire fondre le beurre dans la casserole, à feu moyen. Il doit mousser, pas brunir.",
  "Verser toute la farine d'un coup et mélanger au fouet : ça forme une pâte (le « roux »). Laisser cuire 1 minute en remuant, sans laisser colorer.",
  "Retirer la casserole du feu. Verser un premier tiers du lait froid en fouettant fort : la pâte se détend sans grumeaux.",
  "Remettre sur le feu et verser le reste du lait petit à petit, sans arrêter de fouetter, surtout dans les coins de la casserole.",
  "Laisser épaissir 5 à 8 minutes à feu doux en remuant tout le temps : dès que ça frémit, la sauce devient crémeuse.",
  "Saler, poivrer, râper un peu de muscade."],
 ok:"Elle nappe la cuillère : quand on passe le doigt dessus, la trace reste nette.",
 oups:"Des grumeaux ? Fouetter très fort hors du feu, ou un coup de mixeur plongeant. Trop épaisse ? Un peu de lait. Trop liquide ? Encore 2-3 minutes de cuisson.",
 av:"Se garde 2 jours au frigo, avec un film posé directement sur la sauce pour éviter la peau. Réchauffer doucement en fouettant."},
saucetomate:{b:"Faire revenir l'oignon et/ou l'ail dans l'huile, ajouter les tomates et les herbes, saler et laisser réduire 15 à 20 min à découvert.",t:"Faire une sauce tomate maison",rx:/sauce tomate|coulis de tomate|tomates? concass[ée]es?.*(r[ée]duire|mijoter)|(r[ée]duire|mijoter).*tomates? concass/i,
 mat:"Une casserole ou une sauteuse, une cuillère en bois.",
 q:"Repère : 400 g de tomates concassées (1 boîte) pour 4, avec 1 oignon ou 1 gousse d'ail et 1 cuillère à soupe d'huile d'olive.",
 st:["Éplucher et émincer finement l'oignon et/ou l'ail.",
  "Chauffer l'huile d'olive à feu moyen, ajouter l'oignon et le laisser devenir transparent 5 minutes en remuant (l'ail seulement 30 secondes, il brûle vite).",
  "Verser les tomates concassées, ajouter les herbes de la recette (origan, thym, basilic…), une pincée de sel et une pincée de sucre pour enlever l'acidité.",
  "Laisser mijoter à petit feu, sans couvercle, 15 à 20 minutes en remuant de temps en temps : l'eau s'évapore et la sauce épaissit.",
  "Goûter, saler et poivrer. Mixer si on la veut lisse."],
 ok:"La sauce ne coule plus comme de l'eau : une cuillère tirée au fond laisse un sillon qui se referme lentement.",
 oups:"Trop acide ? Une pincée de sucre. Trop épaisse ? Un peu d'eau. Elle accroche ? Baisser le feu et remuer plus souvent.",
 av:"3 jours au frigo dans une boîte fermée, ou 3 mois au congélateur. Réchauffer à la casserole."},
roux:{b:"Délayer la Maïzena dans un peu de liquide froid avant de la verser dans la sauce chaude.",t:"Lier une sauce avec de la Maïzena",rx:/ma[ïi]zena|f[ée]cule/i,
 mat:"Un verre, une cuillère.",
 st:["Délayer la Maïzena dans un peu d'eau ou de lait FROID (2 à 3 cuillères à soupe), jusqu'à ce qu'il n'y ait plus de grumeaux.",
  "Verser ce mélange dans la sauce chaude en remuant.",
  "Laisser frémir 1 à 2 minutes : la sauce épaissit d'un coup."],
 ok:"La sauce nappe la cuillère.",oups:"Ne jamais verser la poudre directement dans le chaud : ça fait des grumeaux."},
vinaigrette:{b:"Mélanger moutarde, vinaigre, sel et poivre, puis l'huile, dans un pot fermé.",t:"Faire une vinaigrette",rx:/vinaigrette/i,
 mat:"Un bol et une fourchette, ou un pot de confiture avec son couvercle.",
 q:"Repère : 1 cuillère de vinaigre pour 3 cuillères d'huile, 1 cuillère à café de moutarde, sel, poivre.",
 st:["Dans le bol, mettre la moutarde, le vinaigre, le sel et le poivre. Mélanger pour dissoudre le sel.",
  "Verser l'huile petit à petit en fouettant à la fourchette (ou fermer le pot et secouer fort 10 secondes).",
  "Goûter sur une feuille de salade et rectifier."],
 ok:"Elle est légèrement épaisse et ne se sépare pas tout de suite.",
 av:"Une semaine au frigo dans un pot fermé. Secouer avant de servir. Assaisonner la salade au dernier moment, sinon elle ramollit."},
mayo:{b:"Jaune d'œuf, moutarde, sel, puis l'huile en filet en fouettant. Pas plus de 24 h au frigo.",t:"Monter une mayonnaise",rx:/monter (la |une )?mayonnaise|mayonnaise maison|a[ïi]oli/i,
 mat:"Un bol, un fouet (ou un batteur électrique). Tous les ingrédients à température ambiante.",
 st:["Dans le bol, mettre 1 jaune d'œuf, 1 cuillère à café de moutarde, du sel et du poivre.",
  "Verser l'huile (environ 20 cl) en tout petit filet, presque goutte à goutte au début, en fouettant sans arrêt.",
  "Quand la sauce épaissit, on peut verser un peu plus vite.",
  "Finir par quelques gouttes de vinaigre ou de citron."],
 ok:"Elle tient toute seule sur le fouet.",
 oups:"Elle a « tourné » (liquide avec des gouttes) ? Dans un autre bol, un nouveau jaune d'œuf, et y verser la mayonnaise ratée petit à petit en fouettant.",
 av:"24 heures au frigo maximum (œuf cru)."},
puree:{b:"Cuire les pommes de terre épluchées 20 min à l'eau salée, écraser avec le lait chaud et le beurre.",t:"Faire une purée maison",rx:/\bpur[ée]e\b(?!\s+de\s+(tomates?|piment|s[ée]same|cacahu))/i,
 mat:"Une grande casserole, un presse-purée ou une fourchette solide (pas de mixeur : la purée deviendrait collante).",
 q:"Repère : 200 g de pommes de terre par personne, 5 cl de lait et 10 g de beurre.",
 st:["Éplucher les pommes de terre, les couper en morceaux de même taille (comme un gros œuf).",
  "Les mettre dans la casserole, couvrir d'eau FROIDE salée, porter à ébullition.",
  "Cuire 20 minutes environ : un couteau doit s'enfoncer sans résistance.",
  "Égoutter, remettre dans la casserole sur feu doux 1 minute pour sécher.",
  "Écraser, puis ajouter le lait chaud petit à petit et le beurre en mélangeant. Saler, poivrer, un peu de muscade."],
 ok:"Elle est lisse et se tient dans la cuillère.",oups:"Trop épaisse ? Encore un peu de lait chaud.",
 av:"2 jours au frigo. Réchauffer à la casserole avec un peu de lait, en remuant."},
riz:{b:"Cuire le riz à l'eau salée selon le paquet, égoutter et étaler pour refroidir vite.",t:"Cuire le riz",rx:/cuire (le |du )?riz|riz (basmati |jasmin )?cuit|le riz.*(cuire|cuisson)/i,
 mat:"Une casserole avec couvercle, une passoire.",
 q:"Repère : 60 à 75 g de riz cru par personne.",
 st:["Rincer le riz dans une passoire sous l'eau froide jusqu'à ce que l'eau soit presque claire : il collera moins.",
  "Méthode simple : le verser dans une grande casserole d'eau bouillante salée, comme des pâtes.",
  "Cuire le temps indiqué sur le paquet (10 à 12 minutes pour le basmati), en goûtant un grain à la fin.",
  "Égoutter et remettre dans la casserole avec un couvercle 2 minutes : il finit de gonfler."],
 ok:"Le grain est tendre mais pas en bouillie.",
 av:"Refroidir rapidement (étalé dans un plat), puis 2 jours au frigo maximum dans une boîte fermée. Réchauffer bien chaud."},
pates:{b:"Cuire les pâtes 2 min de moins que le paquet, égoutter et mélanger avec un filet d'huile pour qu'elles ne collent pas.",t:"Cuire des pâtes",rx:/cuire les p[âa]tes|al dente|p[âa]tes .*(eau|bouillante)|(eau|bouillante).* p[âa]tes/i,
 mat:"Une grande casserole, une passoire.",
 q:"Repère : 1 litre d'eau et 10 g de gros sel pour 100 g de pâtes ; 80 à 100 g de pâtes par adulte.",
 st:["Porter l'eau à gros bouillons AVANT de mettre les pâtes, puis saler.",
  "Verser les pâtes et remuer tout de suite pour qu'elles ne collent pas.",
  "Compter le temps indiqué sur le paquet à partir de la reprise de l'ébullition. Goûter 1 minute avant : elles doivent être tendres avec un petit cœur ferme (« al dente »).",
  "Garder une louche d'eau de cuisson (elle aide à lier la sauce), puis égoutter. Ne pas rincer."],
 ok:"Tendres mais encore un peu fermes sous la dent.",oups:"Elles collent ? Pas assez d'eau, ou pas remuées au début."},
quinoa:{b:"Rincer le quinoa (ou le boulgour), le cuire 12 min dans 2 fois son volume d'eau salée, égoutter et laisser refroidir.",t:"Cuire le quinoa ou le boulgour",rx:/cuire (le )?(quinoa|boulgour)/i,
 st:["Rincer le quinoa dans une passoire fine (il perd son amertume).","Le cuire dans 2 fois son volume d'eau salée, 12 minutes à petit feu : les grains s'ouvrent et montrent un petit filament.","Égoutter et égrainer à la fourchette."],
 ok:"Les grains sont tendres et légèrement croquants."},
semoule:{b:"Verser le même volume d'eau bouillante salée sur la semoule, couvrir 5 min, égrainer.",t:"Préparer la semoule",rx:/semoule/i,
 mat:"Un saladier, une fourchette, une assiette pour couvrir.",
 q:"Repère : le même volume d'eau bouillante que de semoule (un verre pour un verre).",
 st:["Mettre la semoule dans le saladier avec une pincée de sel et un filet d'huile ou une noisette de beurre.",
  "Verser dessus le même volume d'eau bouillante (ou de bouillon).",
  "Couvrir et laisser gonfler 5 minutes sans toucher.",
  "Égrainer à la fourchette en soulevant pour séparer les grains."],
 ok:"Les grains sont tendres et ne collent pas."},
lentilles:{b:"Cuire les lentilles dans 3 fois leur volume d'eau non salée (vertes 20-25 min, corail 12-15 min), saler à la fin.",t:"Cuire des lentilles",rx:/cuire les lentilles|lentilles.*(\d+\s*min|cuire|eau)/i,
 mat:"Une casserole, une passoire.",
 st:["Rincer les lentilles et retirer les petits cailloux éventuels.",
  "Les couvrir de 3 fois leur volume d'eau froide NON salée (le sel les durcit), avec une feuille de laurier si on en a.",
  "Porter à ébullition puis cuire à petits frémissements : 20 à 25 minutes pour les vertes, 12 à 15 minutes pour les corail (qui s'écrasent).",
  "Saler à la fin seulement, puis égoutter."],
 ok:"Elles sont tendres mais gardent leur forme (sauf les corail).",
 av:"3 jours au frigo dans une boîte fermée."},
oeufsdurs:{b:"Cuire les œufs 9 min à l'eau bouillante, les refroidir à l'eau froide ; les garder dans leur coquille.",t:"Cuire des œufs durs",rx:/[œo]eufs? durs?|durs? (les )?[œo]eufs/i,
 mat:"Une casserole, une écumoire ou une cuillère, un bol d'eau froide.",
 st:["Porter l'eau à ébullition.","Y déposer doucement les œufs avec une cuillère (sinon ils se fêlent).",
  "Cuire 9 minutes (6 minutes pour un jaune encore moelleux).","Les plonger aussitôt dans l'eau froide, puis les écaler sous un filet d'eau."],
 ok:"Le jaune est pris et bien jaune, sans cerne vert.",av:"3 jours au frigo, dans leur coquille."},
oeufpoche:{t:"Pocher un œuf",rx:/[œo]eufs? poch[ée]s?|pocher (les |un |l')?[œo]euf/i,
 mat:"Une casserole, une écumoire, une tasse.",
 st:["Faire frémir de l'eau (petites bulles, pas gros bouillons) avec un trait de vinaigre, SANS sel.",
  "Casser l'œuf dans une tasse.","Faire tourner l'eau avec une cuillère pour créer un tourbillon, et verser l'œuf au centre.",
  "Cuire 3 minutes, puis le sortir avec l'écumoire et le poser sur du papier absorbant."],
 ok:"Le blanc est pris, le jaune coule encore."},
blancs:{t:"Monter des blancs en neige",rx:/blancs? en neige|monter les blancs/i,
 mat:"Un saladier très propre et sec, un batteur électrique ou un fouet.",
 st:["Séparer les blancs des jaunes : il ne doit pas y avoir une trace de jaune dans les blancs.",
  "Ajouter une pincée de sel et battre d'abord doucement, puis de plus en plus vite.",
  "Continuer jusqu'à ce que les blancs soient blancs, brillants et fermes."],
 ok:"On peut retourner le saladier : les blancs ne bougent pas.",
 oups:"Ils ne montent pas ? Il y avait du jaune ou du gras dans le saladier. Les incorporer ensuite délicatement, en soulevant avec une spatule."},
emincer:{t:"Émincer un oignon (sans pleurer)",rx:/(émincer|[ée]mincez|ciseler|hacher|couper) (finement )?(l'|les |un |deux |1 |2 )?(oignons?|[ée]chalotes?)|oignons? (émincés?|hachés?|ciselés?)/i,
 mat:"Une planche, un couteau bien aiguisé.",
 st:["Couper les deux bouts de l'oignon, puis le couper en deux de haut en bas et retirer la peau.",
  "Poser chaque moitié à plat sur la planche (côté coupé en dessous : ça ne roule plus).",
  "Pour émincer : couper des tranches fines dans la longueur. Pour hacher : faire des tranches, puis recouper en travers en petits dés.",
  "Garder les doigts repliés, le couteau glisse contre les phalanges."],
 ok:"Les morceaux sont fins et de même taille : ils cuiront tous en même temps.",
 oups:"Ça pique les yeux ? Mettre l'oignon 10 minutes au frigo avant, et utiliser un couteau bien aiguisé."},
revenir:{t:"Faire revenir, faire suer",rx:/faire revenir|faites revenir|faire suer|faire fondre (l'oignon|les oignons|les poireaux|l'[ée]chalote)/i,
 mat:"Une poêle, une sauteuse ou une cocotte, une cuillère en bois.",
 st:["Chauffer la matière grasse (huile ou beurre) à feu moyen : elle doit frémir, pas fumer.",
  "Ajouter les légumes ou la viande en une seule couche, sans trop remplir (sinon ça bout au lieu de dorer).",
  "« Faire suer » = feu doux, les oignons deviennent transparents et tendres sans brunir (5 minutes).",
  "« Faire revenir » ou « dorer » = feu moyen-vif, on remue de temps en temps pour que ça prenne une jolie couleur."],
 ok:"Une bonne odeur, une couleur dorée, rien de noir.",oups:"Ça brûle ? Baisser le feu et ajouter une cuillère d'eau."},
deglacer:{t:"Déglacer",rx:/d[ée]glacer|d[ée]glacez/i,
 st:["Quand la viande ou les oignons ont doré, il reste des sucs collés au fond de la poêle : c'est plein de goût.",
  "Verser un peu de liquide (eau, vin, bouillon) dans la poêle chaude : ça grésille.",
  "Gratter le fond avec la cuillère en bois pour décoller les sucs, ils se mélangent à la sauce."],
 ok:"Le fond de la poêle est propre et la sauce a pris une belle couleur."},
reduire:{t:"Laisser réduire",rx:/(laisser|faire|laissez) r[ée]duire/i,
 st:["Laisser cuire SANS couvercle, à feu moyen : l'eau s'évapore.",
  "Remuer de temps en temps pour que ça n'accroche pas.",
  "Arrêter quand la sauce a la bonne épaisseur."],
 ok:"Elle nappe la cuillère et a plus de goût."},
mariner:{b:"Mélanger les ingrédients de la marinade, y enrober la viande ou le poisson, filmer et garder au frigo jusqu'à la cuisson.",t:"Faire mariner",rx:/marin(er|ez|ade)|faire mariner/i,
 mat:"Un plat creux ou une boîte, du film alimentaire.",
 st:["Mélanger les ingrédients de la marinade (huile, épices, sauce, jus de citron…) dans le plat.",
  "Ajouter la viande ou le poisson et bien les enrober, avec les mains propres ou une cuillère.",
  "Couvrir et mettre au frigo : 30 minutes minimum, jusqu'à une nuit pour la viande (30 minutes maximum pour le poisson avec du citron, sinon il « cuit »).",
  "Sortir 15 minutes avant la cuisson. Égoutter un peu avant de mettre dans la poêle chaude."],
 ok:"Plus c'est long (pour la viande), plus c'est parfumé et tendre.",
 av:"Idéal à faire la veille ou pendant la session de batch : le jour J, il n'y a plus qu'à cuire."},
rotir:{b:"Rôtir à 200 °C, en une seule couche sur la plaque, 25 à 40 min en retournant à mi-cuisson.",t:"Rôtir des légumes au four",rx:/r[ôo]tir|r[ôo]ti(s|es)? au four|au four.*(l[ée]gumes|patates?|carottes|courges?)/i,
 mat:"Une plaque ou un grand plat, du papier cuisson.",
 st:["Préchauffer le four à 200 °C (chaleur tournante si possible).",
  "Couper les légumes en morceaux de même taille.",
  "Les étaler sur la plaque en UNE seule couche, sans les entasser, avec un filet d'huile, du sel et les épices. Mélanger avec les mains.",
  "Enfourner 25 à 40 minutes selon les légumes, en les retournant à mi-cuisson.",
  "Toujours prendre des maniques : la plaque est brûlante."],
 ok:"Ils sont dorés sur les bords et tendres au couteau.",oups:"Ils sont mous et pâles ? Trop serrés sur la plaque : utiliser deux plaques."},
gratiner:{t:"Gratiner",rx:/gratiner|sous le gril|position gril/i,
 st:["Allumer le four en position « gril » (la résistance du haut).",
  "Mettre le plat en haut du four.",
  "Surveiller sans s'éloigner : ça dore en 3 à 5 minutes, et ça brûle très vite après."],
 ok:"Le dessus est doré et fait des bulles."},
paner:{b:"Passer dans la farine, l'œuf battu puis la chapelure ; ranger à plat sur du papier cuisson.",t:"Paner (à l'anglaise)",rx:/\bpaner\b|panure|pan[ée]s? [àa] l'anglaise/i,
 mat:"Trois assiettes creuses.",
 st:["Assiette 1 : la farine. Assiette 2 : l'œuf battu avec une pincée de sel. Assiette 3 : la chapelure.",
  "Passer chaque morceau dans la farine (tapoter pour enlever le surplus), puis dans l'œuf, puis dans la chapelure en appuyant bien.",
  "Une main pour le sec, une main pour le mouillé : on évite d'avoir des doigts panés !",
  "Cuire dans une poêle avec un fond d'huile chaude, 3 à 4 minutes de chaque côté."],
 ok:"Une croûte dorée et croustillante, qui ne se détache pas."},
papillote:{b:"Monter les papillotes (légumes, puis poisson, assaisonnement) et bien fermer ; garder au frigo, cuisson 20 min à 200 °C le jour J.",t:"Faire une papillote",rx:/papillote/i,
 mat:"Du papier cuisson (ou d'aluminium), une plaque.",
 st:["Préchauffer le four à 200 °C.","Découper une grande feuille de papier cuisson par portion.",
  "Poser au centre les légumes, puis le poisson ou la viande, l'assaisonnement et un filet d'huile ou de citron.",
  "Rabattre les bords et les replier plusieurs fois pour bien fermer : la vapeur doit rester dedans.",
  "Cuire 15 à 20 minutes. Ouvrir avec précaution : la vapeur brûle."],
 ok:"Le poisson s'effeuille facilement à la fourchette."},
foncer:{b:"Étaler la pâte dans le moule, piquer le fond, et cuire 10 min à blanc à 180 °C si la garniture est liquide.",t:"Préparer une pâte à tarte (foncer, cuire à blanc)",rx:/foncer|cuire à blanc|p[âa]te bris[ée]e/i,
 mat:"Un moule à tarte, une fourchette, du papier cuisson, des haricots secs ou des billes de cuisson.",
 st:["Dérouler la pâte dans le moule avec son papier, appuyer le long des bords.",
  "Piquer le fond avec une fourchette (pour qu'il ne gonfle pas).",
  "Pour une garniture liquide (quiche) : « cuire à blanc » 10 minutes à 180 °C avec une feuille de papier et des haricots secs dessus, pour que le fond reste croustillant.",
  "Verser ensuite la garniture."],
 ok:"Le fond est sec et légèrement doré."},
mixer:{t:"Mixer une soupe chaude sans danger",rx:/mixer|velout[ée]/i,
 mat:"Un mixeur plongeant (ou un blender).",
 st:["Retirer la casserole du feu.","Plonger le mixeur AVANT de l'allumer, en le gardant bien au fond : sinon ça éclabousse et ça brûle.",
  "Mixer en faisant de petits cercles, jusqu'à ce que ce soit lisse.",
  "Au blender : ne jamais le remplir à plus de la moitié avec du chaud, et tenir le couvercle avec un torchon.",
  "Ajouter un peu d'eau ou de lait si c'est trop épais. Goûter et saler."],
 ok:"C'est lisse et crémeux.",
 av:"3 jours au frigo, 3 mois au congélateur. Réchauffer à la casserole en remuant."},
blanchir:{b:"Plonger 2 à 4 min dans l'eau bouillante salée, puis aussitôt dans l'eau froide, égoutter.",t:"Blanchir des légumes",rx:/blanchir|blanchis/i,
 mat:"Une casserole d'eau bouillante salée, un saladier d'eau très froide (avec des glaçons si possible).",
 st:["Plonger les légumes dans l'eau bouillante salée 2 à 4 minutes.","Les sortir et les plonger aussitôt dans l'eau froide : ils arrêtent de cuire et restent bien verts.","Égoutter."],
 ok:"Encore croquants, couleur vive."},
caramel:{b:"Faire fondre les oignons émincés à feu doux 20 à 30 min avec un peu de beurre et une pincée de sucre.",t:"Faire caraméliser des oignons",rx:/caram[ée]lis/i,
 st:["Émincer finement les oignons.","Les faire fondre à feu DOUX avec un peu de beurre ou d'huile, 20 à 30 minutes, en remuant de temps en temps.",
  "Ajouter une pincée de sucre et de sel à mi-cuisson.","Si ça attache, une cuillère d'eau et on gratte le fond."],
 ok:"Ils sont fondants et brun doré, presque confits.",oups:"Ils noircissent ? Le feu est trop fort : il faut de la patience."},
saisir:{t:"Saisir une viande",rx:/saisir|saisissez|poêle (bien |très )?chaude/i,
 st:["Sortir la viande du frigo 15 minutes avant.","Chauffer la poêle avec un filet d'huile jusqu'à ce qu'elle soit très chaude (une goutte d'eau grésille).",
  "Poser la viande et NE PAS la bouger pendant 2 à 3 minutes : c'est comme ça qu'elle dore.",
  "La retourner une seule fois. Saler à la fin.","Laisser reposer 2 minutes sur une assiette avant de couper."],
 ok:"Une croûte dorée dehors, juteuse dedans."},
vapeur:{t:"Cuire à la vapeur",rx:/(à|a) la vapeur|cuit-vapeur|cuiseur vapeur/i,
 mat:"Une casserole avec un panier vapeur et un couvercle (ou un cuit-vapeur).",
 st:["Mettre 3 cm d'eau au fond de la casserole et porter à ébullition.","Poser les aliments dans le panier, au-dessus de l'eau (ils ne doivent pas tremper).",
  "Couvrir et cuire : 6-8 minutes pour le brocoli, 15-20 minutes pour les pommes de terre en morceaux, 8-10 minutes pour un poisson.","Attention à la vapeur en ouvrant le couvercle : l'ouvrir vers soi en se protégeant."],
 ok:"Un couteau s'enfonce facilement."},
decoupe:{t:"Couper les légumes à l'avance",rx:/$^/,
 mat:"Une grande planche, un couteau bien aiguisé, des boîtes hermétiques.",
 st:["Laver et sécher les légumes avant de les couper.",
  "Couper chaque ingrédient comme indiqué ci-dessus. Repères : rondelles = tranches rondes (0,5 cm si rien n'est précisé) ; fines rondelles = 2-3 mm ; dés ou cubes = 1 à 1,5 cm de côté (gros cubes : 3 cm) ; brunoise = tout petits dés de 3 mm ; lamelles = tranches fines de 2-3 mm ; bâtonnets ou frites = 1 cm d'épaisseur ; julienne = fins bâtonnets comme des allumettes ; lanières = bandes de 1 cm de large ; quartiers = le légume coupé en 4 (ou 8) dans la longueur ; émincer = tranches très fines ; ciseler ou hacher = tout petits morceaux.",
  "Garder des morceaux de même taille : ils cuiront tous en même temps.",
  "Ranger chaque légume dans une boîte fermée au frigo, avec un papier absorbant au fond pour les légumes humides (concombre, tomate).",
  "Le bœuf ou le poulet émincé se garde à part, dans sa propre boîte, sur l'étagère du bas du frigo."],
 ok:"Tout est rangé et étiqueté avec le jour du repas.",
 av:"Les légumes coupés se gardent 2 à 3 jours au frigo. Exceptions : l'avocat, la pomme et la pomme de terre crue noircissent (les couper le jour J, ou les garder dans l'eau citronnée pour la pomme de terre)."},
pocher:{t:"Pocher (viande, poisson)",rx:/pocher|poch[ée](e|s|es)? (dans|au)/i,
 st:["Faire chauffer un liquide (eau, bouillon, lait) jusqu'à de petits frémissements : il ne doit pas bouillir fort.",
  "Y plonger la viande ou le poisson, qui doit être recouvert.","Cuire doucement le temps indiqué : la chair reste moelleuse."],
 ok:"Le poulet est blanc à cœur (plus rose du tout), le poisson s'effeuille."},
};
window.FICHES=F;
const ORDER=Object.keys(F);
// Fiches repérées dans un texte (au plus 2 par étape, sans répéter celles déjà montrées)
// une étape qui détaille déjà la technique n'a pas besoin de fiche ; seules les étapes brèves (« napper de béchamel ») en reçoivent une
// fiches proposées sous les étapes : seulement les vraies techniques (pas « mixer » ou « faire revenir »)
const STEPF=new Set(["bechamel","saucetomate","roux","vinaigrette","mayo","puree","lentilles","quinoa","oeufpoche","blancs","paner","papillote","foncer","blanchir","caramel","pocher","riz"]);
window.fichesIn=(txt,seen,force)=>{const out=[];if(!force&&String(txt).length>120)return out;for(const k of ORDER){if(out.length>=2)break;if(seen&&seen.has(k))continue;if(!force&&!STEPF.has(k))continue;if(F[k].rx.test(txt)){out.push(k);seen&&seen.add(k)}}
  // pas de fiche générale (revenir, réduire, déglacer, saisir) à côté d'une fiche plus précise
  const GEN=new Set(["revenir","reduire","deglacer","saisir"]);
  if(out.some(k=>!GEN.has(k))){out.filter(k=>GEN.has(k)).forEach(k=>seen&&seen.delete(k));return out.filter(k=>!GEN.has(k))}
  return out};
window.ficheHTML=k=>{const f=F[k];if(!f)return "";const e=gE();
  return `<details class="fiche"><summary>📘 ${e(f.t)}</summary><div class="fiche-b">${f.mat?`<p><b>Il faut :</b> ${e(f.mat)}</p>`:""}${f.q?`<p class="fq">${e(f.q)}</p>`:""}<ol>${f.st.map(s=>`<li>${e(s)}</li>`).join("")}</ol>${f.ok?`<p class="fok">✅ <b>C'est prêt quand :</b> ${e(f.ok)}</p>`:""}${f.oups?`<p class="foups">🛟 <b>Si ça rate :</b> ${e(f.oups)}</p>`:""}${f.av?`<p class="fav">📦 <b>À l'avance :</b> ${e(f.av)}</p>`:""}</div></details>`};
// Étapes d'une recette avec leurs fiches techniques (chaque fiche une seule fois)
window.stepsWithFiches=st=>{const seen=new Set(),e=gE();return st.map(s=>{const ks=fichesIn(s,seen);return `<li>${e(s)}${ks.map(ficheHTML).join("")}</li>`}).join("")};

// ---------- Avec ou sans batch cooking ----------
const STOP=new Set("cuire préparer preparer faire couper laver éplucher eplucher tailler mettre mixer monter former griller rôtir rotir pocher paner mariner émincer emincer râper raper hacher dorer cuisson avance pour avec dans les des une sur sans plus puis tout toute tous elle ils bien".split(" "));
const norm=s=>s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
const toks=s=>norm(s).split(/[^a-z]+/).filter(w=>w.length>2&&!STOP.has(w)).map(w=>w.slice(0,5));
// Une tâche qui prépare tout le plat (soupe, curry, gratin…) : la recette entière se fait à l'avance
const WHOLE=/^(cuire|pr[ée]parer|monter|faire)( et mixer)?( (la|le|l'|les))?\s*(soupe|plat|rago[ûu]t|curry|velout[ée]|gratin|quiche|tarte|tajine|chili|pot[ée]e|piperade|saut[ée]|dahl|dal|blanquette|bourguignon|daube|couscous|lasagnes?|hachis|moussaka|parmentier|poulet en sauce|cassoulet|potage|bouillon|mijot|colombo|maf[ée]|goulash|carbonade|navarin|osso|choucroute|dhal|cake|clafoutis|terrine|flan|tian|ratatouille)|^cuire et mixer|^cuire le plat|^cuire la soupe/i;
// Ingrédients d'une recette concernés par une tâche (leur nom apparaît dans la tâche)
const ingsFor=(r,task)=>{const T=new Set(toks(task));return r.ing.filter(([id])=>{const II=gI();if(!II[id])return false;return toks(II[id].n).some(w=>T.has(w))})};
// Étapes de la recette concernées par une tâche
const stepsFor=(r,task)=>{const T=new Set(toks(task));if(!T.size)return [];return r.st.map((s,i)=>[i,toks(s).filter(w=>T.has(w)).length]).filter(x=>x[1]>0).map(x=>x[0])};
// Comment couper un ingrédient, d'après les étapes de la recette (« en fines rondelles de 3 mm », « en cubes »…)
const CUTRX=/\ben\s+((?:(?:tr[èe]s\s+)?fines?|grosses?|petites?|gros|petits|fins|demi-|minces?|[ée]paisses?)\s+)*(rondelles|demi-rondelles|d[ée]s|cubes|lamelles|b[âa]tonnets|julienne|lani[èe]res|tranches|quartiers|morceaux|brunoise|frites|bouquets|copeaux|tron[çc]ons|m[ée]daillons|allumettes|tagliatelles|spaghettis|deux|quatre|huit|lamelles|fines\s+tranches)(\s+(?:de|d'environ|d'|[ée]paisses?\s+de)\s*[\d,.\s–-]*\d\s?(?:mm|cm))?(\s+d'[ée]paisseur)?/i;
const VERBRX=[[/tranch/i,"en tranches fines"],[/r[âa]p[ée]?(r|s|es|e)?\b/i,"râpé"],[/[ée]minc/i,"émincé (tranches très fines)"],[/hach/i,"haché finement"],[/cisel/i,"ciselé (tout petits morceaux)"],[/[ée]cras/i,"écrasé"],[/entier|entières|entiers/i,"entier"]];
const LEAF=/^(salade|roquette|epinards|pousses|cresson|mache)$/;
const DEFCUT={pdt:"épluchées, en morceaux de 4 cm",haricotsverts:"équeutés (retirer les deux bouts)",champignons:"en lamelles",oignon:"épluché, émincé",oignonrouge:"épluché, émincé",echalote:"épluchée, ciselée",oignonnouveau:"en fines rondelles (blanc et vert)",carotte:"épluchées, en rondelles de 0,5 cm",courgette:"en rondelles de 0,5 cm",poireau:"lavés, en rondelles de 1 cm",poivron:"épépinés, en lanières",tomate:"en dés",concombre:"en dés",brocoli:"en petits bouquets",choufleur:"en petits bouquets",aubergine:"en cubes de 2 cm",potiron:"épluché, en cubes de 3 cm",patatedouce:"épluchées, en cubes de 2 cm",gingembref:"épluché et râpé",celeri:"en petits tronçons",chou:"émincé finement",chourouge:"émincé finement",navet:"épluchés, en cubes",panais:"épluchés, en rondelles",betterave:"en dés",fenouil:"en lamelles",radis:"en fines rondelles"};
function cutOf(r,id){const I_=gI();if(!I_[id])return "";if(LEAF.test(id))return "lavée, essorée";const T=toks(I_[id].n).slice(0,2);if(!T.length)return "";
  for(const s of r.st){for(const sent of s.split(/[.;:]\s+/)){const ns=norm(sent);const at=Math.min(...T.map(w=>{const i=ns.indexOf(w);return i<0?1e9:i}));if(at===1e9)continue;
    // d'abord juste après le nom de l'ingrédient (« l'oignon émincé », « les pommes de terre et les trancher finement (3 mm) »)
    const win=sent.slice(at,at+90),size=(win.match(/(\d+(?:[,.]\d+)?\s?(?:mm|cm))/)||[])[1];
    const m=win.match(CUTRX);const v=VERBRX.find(([rx])=>rx.test(win));
    if(m&&(!v||win.search(CUTRX)<=win.search(v[0])))return m[0].replace(/\s+/g," ").trim();
    if(v)return v[1]+(size&&!/\d/.test(v[1])?" ("+size+")":"");
    // sinon dans toute la phrase (« Couper les aubergines, courgettes et poivrons en cubes de 2 cm »)
    const m2=sent.slice(Math.max(0,at-40)).match(CUTRX);if(m2&&!/^en (deux|quatre|huit)$/i.test(m2[0].trim()))return m2[0].replace(/\s+/g," ").trim()}}
  // phrase générale (« Couper tous les légumes en cubes de 2 cm ») pour les fruits et légumes
  if(I_[id].r==="fl")for(const s of r.st)for(const sent of s.split(/[.;:]\s+/)){if(/\bl[ée]gumes\b/i.test(sent)){const m=sent.match(CUTRX);if(m)return m[0].replace(/\s+/g," ").trim()}}
  return DEFCUT[id]||""}
const CUTTABLE=id=>{const x=gI()[id];if(!x)return false;if(x.r==="fl"||x.r==="bo")return !/bouquet/.test(x.u)||/persil|coriandre|basilic|menthe|aneth|ciboulette/i.test(x.n);return x.r==="cr"&&x.u==="g"&&!/cr[èe]me|yaourt|lait|fromage (blanc|frais)|ricotta|mascarpone|beurre/i.test(x.n)};
const SYN=[[/potatoes?|frites?/i,"pdt"],[/patates? douces?/i,"patatedouce"]];
const CUTTASK=/^(couper|tailler|trancher|[ée]mincer|r[âa]per|laver|[ée]plucher|hacher|ciseler|d[ée]tailler|[ée]queuter|pr[ée]parer (les|toutes les) (l[ée]gumes|crudit[ée]s|garnitures))/i;
function cutsHTML(r,task,qf){const I_=gI(),e=gE();let L=ingsFor(r,task).filter(([id])=>CUTTABLE(id));
  SYN.forEach(([rx,id])=>{if(rx.test(task)&&!L.some(x=>x[0]===id)){const x=r.ing.find(y=>y[0]===id);if(x)L.push(x)}});
  if(!L.length){const tt=new Set(toks(task));L=r.ing.filter(([id])=>CUTTABLE(id)&&toks(cutOf(r,id)).some(w=>tt.has(w)))}
  if(/l[ée]gumes|crudit[ée]s|garnitures/i.test(task)||!L.length){const all=r.ing.filter(([id])=>I_[id]&&I_[id].r==="fl"&&I_[id].c!=="Fruits"&&!/bouquet/.test(I_[id].u)&&!/^(citron|citronvert|ail|gingembref)$/.test(id)&&(!LEAF.test(id)||/salade|crudit|laver/i.test(task)));const seen=new Set(L.map(x=>x[0]));all.forEach(x=>{if(!seen.has(x[0]))L.push(x)})}
  if(!L.length)return "";
  // la tâche dit déjà comment couper ce qu'elle nomme (« Râper les carottes », « Tailler les frites », « … en lanières »)
  const named=new Set(ingsFor(r,task).map(x=>x[0]));SYN.forEach(([rx,id])=>{if(rx.test(task))named.add(id)});
  const tm=task.match(CUTRX),tv=VERBRX.find(([rx])=>rx.test(task.split(/\s/)[0])),taskCut=/frites?/i.test(task)?"en frites (bâtonnets de 1 cm)":tm?tm[0].trim():tv?tv[1]:"";
  return `<ul class="cuts">${L.map(([id,q])=>{const c=((named.has(id)||(/l[ée]gumes|crudit/i.test(task)&&!LEAF.test(id)))&&taskCut&&!/^(laver|[ée]plucher)/i.test(task))?taskCut:cutOf(r,id);return `<li><b>${e(I_[id].n.replace(/\s*\(.*\)/,""))}</b>${qf?` <span class="muted">(${e(qf(id,q))})</span>`:""} : ${e(c||"en morceaux de 3 cm")}</li>`}).join("")}</ul>`}
window.batchTaskHTML=(r,task,qf,after)=>{const e=gE(),I=gI();
  const nameT=new Set(toks(r.n.split(",")[0]));
  const whole=WHOLE.test(task)||/complet|enti[èe]re?\b|monter (le|la|les) /i.test(task)||(/^(cuire|pr[ée]parer|monter)\b/i.test(task)&&toks(task).some(w=>nameT.has(w)));
  const q=(id,v)=>qf?qf(id,v)+" ":"",nmI=id=>I[id].n.replace(/\s*\(.*\)/,"").toLowerCase();
  let body="";
  if(whole){// les dernières étapes qui se font le jour J (gratiner, servir…) restent pour le jour J
    const J=new Set(toks(((gB()[r.id]||{}).j)||""));let st=r.st.slice();
    while(st.length>1){const last=toks(st[st.length-1]);if(last.filter(w=>J.has(w)).length>=2||/^(servir|parsemer|d[ée]corer)/i.test(st[st.length-1]))st.pop();else break}
    body=`<ol class="btsteps">${st.map(s=>`<li>${e(s)}</li>`).join("")}</ol><p class="btend">Laisser tiédir, puis en boîte fermée au frigo.</p>`}
  else if(CUTTASK.test(task))body=cutsHTML(r,task,qf);
  else{const ks=fichesIn(task,new Set(),true).filter(k=>F[k].b),ings=ingsFor(r,task);
    const avec=ings.length?`<span class="muted"> Avec ${e(ings.map(([id,v])=>q(id,v)+nmI(id)).join(", "))}.</span>`:"";
    if(ks.length)body=`<p class="bti">${e(ks.map(k=>F[k].b).join(" "))}${avec}</p>`;
    else{const ix=stepsFor(r,task);body=ix.length?`<ol class="btsteps">${ix.map(i=>`<li value="${i+1}">${e(r.st[i])}</li>`).join("")}</ol>`:(avec?`<p class="bti">${avec}</p>`:"")}}
  return `<li><span class="btt">${e(task)}</span>${after||""}${body}</li>`};
// Le jour J, en étapes (pour le mode cuisine)
window.batchDaySteps=r=>{const B=gB()[r.id];if(!B)return null;const out=[];
  if(B.t&&B.t.length)out.push("Sortir du frigo ce qui a été préparé pendant la session de batch : "+B.t.map(t=>t[1].charAt(0).toLowerCase()+t[1].slice(1)).join(", ")+".");
  String(B.j||"").split(/(?<=\.)\s+(?=[A-ZÀÂÉÈÊÎÔÛÇ])/).map(s=>s.trim()).filter(Boolean).forEach(s=>out.push(s));
  return out};
// Bloc complet « Avec le batch cooking » d'une recette
window.batchBlockHTML=(r,qf,label)=>{const B=gB()[r.id],e=gE();if(!B)return "";
  const t=B.t||[];
  return `<div class="bblock">${t.length?`<h5>À l'avance${label?" — "+e(label):""}</h5><ul class="btasks">${t.map(x=>batchTaskHTML(r,x[1],qf)).join("")}</ul>`:`<p class="muted">Rien à préparer à l'avance pour ce plat : tout se fait le jour J.</p>`}
    <h5>Le jour J</h5><p class="bj">${e(B.j||"Réchauffer et servir.")}</p></div>`};
window.BMODEK="menus.bmode";
window.bmode=()=>{try{return localStorage.getItem(BMODEK)==="batch"?"batch":"jourj"}catch(e){return "jourj"}};
// Bascule « Tout le jour J / Avec le batch cooking » (le choix est mémorisé sur l'appareil)
window.bmodeHTML=()=>{const m=bmode();return `<div class="bmode" role="group" aria-label="Façon de cuisiner"><button type="button" data-bmode="jourj" aria-pressed="${m==="jourj"}">Tout le jour J</button><button type="button" data-bmode="batch" aria-pressed="${m==="batch"}">Avec le batch cooking</button></div>`};
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-bmode]");if(!b)return;const m=b.dataset.bmode;try{localStorage.setItem(BMODEK,m)}catch(_){}
  document.querySelectorAll(".bmode [data-bmode]").forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.bmode===m)));
  document.querySelectorAll(".bmwrap").forEach(w=>w.classList.toggle("bm-batch",m==="batch"))});
})();

