// Corrections de cohérence du catalogue (intitulé ↔ ingrédients ↔ étapes), appliquées après le chargement de toutes les recettes.
// n : nouvel intitulé · st : remplacements dans les étapes · bt : remplacements dans les étapes de batch cooking [avant, après]
window.MENUS_CORR={
 rougail:{n:"Rougail saucisses, riz et haricots rouges"},
 cari:{st:[["les grains (haricots rouges réchauffés)","les haricots rouges réchauffés"]]},
 larb:{n:"Larb de poulet aux herbes, riz jasmin et crudités"},
 xsoupecourgefeta:{n:"Velouté de courge rôtie, feta et pignons"},
 kcrevettespates:{n:"Spaghetti aux crevettes, ail et tomates cerises"},
 xmoulesprovencale:{n:"Moules à la provençale et spaghetti"},
 xpatesaubergine:{n:"Penne aux aubergines, tomate et mozzarella au four"},
 tortellini:{n:"Raviolis en bouillon aux légumes",st:[["Ajouter les tortellini (ou raviolis)","Ajouter les raviolis"]]},
 pouletcoreen:{bt:[["Paner les morceaux de poulet et les congeler","Enrober le poulet de maïzena et le congeler"]]},
 bobun:{st:[["salade, nouilles, crudités, bœuf chaud","salade, nouilles, crudités, pousses de soja, bœuf chaud"]]}
};
