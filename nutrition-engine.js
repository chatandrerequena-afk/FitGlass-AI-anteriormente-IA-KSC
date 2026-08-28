/* FitGlass AI — Nutrition engine
 * Client-side calculations kept deterministic for the exhibition.
 */
(function(){
  'use strict';
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  const round=(v,d=0)=>Number(Number(v||0).toFixed(d));
  const factors={sedentary:1.2,light:1.375,moderate:1.55,high:1.725,active:1.725};
  const goals={cut:.82,maintain:1,gain:1.08};
  const formulas={
    mifflinMale:(w,h,a)=>10*w+6.25*h-5*a+5,
    mifflinFemale:(w,h,a)=>10*w+6.25*h-5*a-161,
    bmi:(w,h)=>w/Math.pow(h/100,2),
    water:(w,region)=>w*(region==='piura'?.035:.033)
  };
  function normalize(p){return {name:String(p.name||'Usuario'),age:Number(p.age)||18,sex:p.sex==='female'?'female':'male',weight:Number(p.weight)||70,height:Number(p.height)||170,waist:Number(p.waist)||0,activity:p.activity||'moderate',goal:p.goal||'maintain',region:p.region||'piura'};}
  function calculate(p){
    const n=normalize(p);
    const bmr=n.sex==='female'?formulas.mifflinFemale(n.weight,n.height,n.age):formulas.mifflinMale(n.weight,n.height,n.age);
    const tdee=bmr*(factors[n.activity]||factors.moderate);
    const calories=tdee*(goals[n.goal]||1);
    const protein=n.weight*(n.goal==='gain'?1.8:n.goal==='cut'?1.8:1.5);
    const fat=n.weight*.8;
    const carbs=Math.max(0,(calories-protein*4-fat*9)/4);
    const bmi=formulas.bmi(n.weight,n.height);
    const whtr=n.waist? n.waist/n.height:0;
    const water=clamp(formulas.water(n.weight,n.region),1.5,4.5);
    const target=n.goal==='cut'?n.weight*.9:n.goal==='gain'?n.weight*1.05:n.weight;
    return {bmr:round(bmr),tdee:round(tdee),calories:round(calories),protein:round(protein),fat:round(fat),carbs:round(carbs),bmi:round(bmi,1),whtr:round(whtr,2),water:round(water,1),target:round(target,1)};
  }
  function caloriesFromMacros(p,c,f){return p*4+c*4+f*9;}
  function macroPercent(p,c,f){const total=Math.max(1,caloriesFromMacros(p,c,f));return {protein:p*4/total,carbs:c*4/total,fat:f*9/total};}
  function bmiCategory(b){if(b<18.5)return'Bajo';if(b<25)return'Referencia';if(b<30)return'Elevado';return'Alto';}
  function waistHeightCategory(v){if(!v)return'Sin dato';if(v<.5)return'Referencia';if(v<.6)return'Elevado';return'Muy elevado';}
  function hydrationProgress(current,target){return clamp(current/Math.max(target,.1),0,1);}
  function macroProgress(current,target){return clamp(current/Math.max(target,.1),0,1);}
  function energyProgress(current,target){return clamp(current/Math.max(target,.1),0,1);}
  function mealTotals(meals){return meals.reduce((a,m)=>({calories:a.calories+(+m.calories||0),protein:a.protein+(+m.protein||0),carbs:a.carbs+(+m.carbs||0),fat:a.fat+(+m.fat||0)}),{calories:0,protein:0,carbs:0,fat:0});}
  function dailySummary(profile,meals,water){const m=calculate(profile);const t=mealTotals(meals);return {...m,...t,remainingCalories:Math.max(0,m.calories-t.calories),remainingProtein:Math.max(0,m.protein-t.protein),waterProgress:hydrationProgress(water,m.water)};}
  function fitnessScore(profile,meals,water){const s=dailySummary(profile,meals,water);const energy=clamp(1-Math.abs(s.calories-s.calories)/Math.max(1,s.calories),0,1);const p=macroProgress(s.protein,s.protein);const w=hydrationProgress(water,s.water);return Math.round((.45*Math.min(1,(s.calories+1)/Math.max(1,s.calories))+0)+(p*35)+(w*20));}
  function mealQuality(item){let score=50;if((item.protein||0)>=20)score+=15;if((item.fat||0)<=25)score+=10;if((item.calbs||item.carbs||0)>=10)score+=5;if((item.fiber||0)>=5)score+=10;return clamp(score,0,100);}
  function estimateBodyFat(profile){
    const p=normalize(profile);
    if(!p.waist||!p.height)return null;
    let x;
    if(p.sex==='female')x=495/(1.29579-.35004*Math.log10(Math.max(1,p.waist))+.22100*Math.log10(Math.max(1,p.height)))-450;
    else x=495/(1.0324-.19077*Math.log10(Math.max(1,p.waist))+.15456*Math.log10(Math.max(1,p.height)))-450;
    return round(clamp(x,2,55),1);
  }
  function hemoglobinThreshold(sex){return sex==='female'?12:13;}
  function assessHemoglobin(hb,sex,region){const v=Number(hb);if(!v)return{status:'unknown',message:'Sin hemoglobina registrada.'};const threshold=hemoglobinThreshold(sex);return {status:v<threshold?'attention':'within_reference',value:round(v,1),threshold,region,needsProfessional:v<threshold};}
  function nutrientFlag(value,target){if(!target)return'unknown';const r=value/target;if(r<.5)return'low';if(r<.8)return'progress';if(r<1)return'near';return'complete';}
  function splitComma(text){return String(text||'').split(',').map(s=>s.trim()).filter(Boolean);} 
  function includesFood(text,name){return splitComma(text).some(x=>x.toLowerCase().includes(name.toLowerCase()));}
  function recommendation(profile,today){const p=normalize(profile),m=calculate(p),t=mealTotals(today);const out=[];if(t.protein<m.protein*.55)out.push('prioriza una fuente de proteína en tu siguiente comida');if(t.calories<m.calories*.4)out.push('evita saltarte comidas si eso te dificulta cubrir tus necesidades');if(t.carbs>m.carbs*1.15)out.push('equilibra la siguiente comida con verduras y proteína');if((stateWaterFallback(profile)||0)<m.water*.5)out.push('revisa tu hidratación');return out;}
  function stateWaterFallback(){return 0;}
  const foodGroups={protein:['pollo','pescado','huevo','carne','yogur','queso','lenteja','frejol','tarwi','garbanzo'],fruit:['mango','naranja','mandarina','papaya','plátano','manzana','pera'],veg:['espinaca','tomate','zanahoria','brócoli','lechuga','pepino'],carb:['arroz','avena','quinua','camote','yuca','papa','pan'],fat:['palta','aceite','maní','nuez','almendra']};
  function classifyFood(name){const x=String(name||'').toLowerCase();for(const [g,list] of Object.entries(foodGroups))if(list.some(v=>x.includes(v)))return g;return'other';}
  function balancePlate(items){const counts={protein:0,fruit:0,veg:0,carb:0,fat:0,other:0};items.forEach(i=>counts[classifyFood(i.name)]++);const present=['protein','veg','carb'].filter(k=>counts[k]>0).length;return {counts,present,score:Math.round(present/3*100)};}
  const validators={
    age:v=>Number(v)>=10&&Number(v)<=100,
    weight:v=>Number(v)>=25&&Number(v)<=300,
    height:v=>Number(v)>=100&&Number(v)<=230,
    waist:v=>!v||(Number(v)>=40&&Number(v)<=200),
    hb:v=>!v||(Number(v)>=5&&Number(v)<=25)
  };
  function validateProfile(p){const errs=[];if(!validators.age(p.age))errs.push('Edad fuera de rango');if(!validators.weight(p.weight))errs.push('Peso fuera de rango');if(!validators.height(p.height))errs.push('Altura fuera de rango');if(!validators.waist(p.waist))errs.push('Cintura fuera de rango');if(!validators.hb(p.hb))errs.push('Hemoglobina fuera de rango');return errs;}
  function normalizeMeal(m){return {id:m.id||crypto.randomUUID?.()||String(Date.now()),date:m.date||new Date().toISOString().slice(0,10),name:String(m.name||'Comida'),calories:Math.max(0,Number(m.calories)||0),protein:Math.max(0,Number(m.protein)||0),carbs:Math.max(0,Number(m.carbs)||0),fat:Math.max(0,Number(m.fat)||0)};}
  window.FG_NUTRITION={clamp,round,factors,goals,normalize,calculate,caloriesFromMacros,macroPercent,bmiCategory,waistHeightCategory,hydrationProgress,macroProgress,energyProgress,mealTotals,dailySummary,fitnessScore,mealQuality,estimateBodyFat,hemoglobinThreshold,assessHemoglobin,nutrientFlag,splitComma,includesFood,recommendation,classifyFood,balancePlate,validators,validateProfile,normalizeMeal,foodGroups};
})();
