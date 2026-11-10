// Exporte les ingrédients du catalogue dans I.json (lancer depuis la racine : node _outils/recettes/ingredients.js)
const fs=require('fs');
const s=fs.readFileSync('menus/recettes.html','utf8');
const L=s.split('\n');
let I;
const a=s.indexOf('const I={'),b=s.indexOf('\n};',a);
I=eval('('+s.slice(a+8,b+2)+')');
// each Object.assign(I,{ ... });
let idx=0;while((idx=s.indexOf('Object.assign(I,{',idx))>=0){let d=0,j=idx+16;for(;j<s.length;j++){if(s[j]==='{')d++;else if(s[j]==='}'){d--;if(d===0)break}}Object.assign(I,eval('('+s.slice(idx+16,j+1)+')'));idx=j}
global.window={};eval(fs.readFileSync('menus/recettes-plus.js','utf8'));
Object.assign(I,window.MENUS_PLUS.I);
if(window.MENUS_PLUS.IREN)for(const k in window.MENUS_PLUS.IREN)if(I[k])Object.assign(I[k],window.MENUS_PLUS.IREN[k]);
fs.writeFileSync(require('path').join(__dirname,'I.json'),JSON.stringify(I));
