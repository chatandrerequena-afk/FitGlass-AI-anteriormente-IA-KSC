/* FitGlass AI — Regional intelligence dataset and utilities.
 * Educational scaffolding for Eureka 2026.
 * Values marked as examples must be replaced with verified official sources.
 */
(function(){
  'use strict';
  const regions={
    piura:{
      id:'piura', name:'Piura', label:'Costa norte', climate:'Cálido / seco',
      priorities:['Hidratación','Frutas y verduras','Porciones','Bebidas sin azúcar'],
      foods:['mango','limón','plátano','pescado','pollo','frejol','arroz','camote','yuca','palta'],
      educational:['Adaptar líquidos a calor y actividad física.','Preferir agua frente a bebidas azucaradas.','Combinar proteína con verduras y fruta entera.'],
      disclaimer:'Los indicadores regionales deben mostrarse con año y fuente oficial en una versión de investigación.'
    },
    cusco:{
      id:'cusco', name:'Cusco', label:'Altitud andina', climate:'Frío / gran altitud',
      priorities:['Hierro','Vitamina C','Proteína','Contexto de hemoglobina'],
      foods:['quinua','tarwi','haba','lenteja','carne de res','pescado','naranja','mandarina','papaya','espinaca'],
      educational:['Combinar fuentes de hierro con vitamina C.','Considerar altitud al interpretar hemoglobina.','Mantener proteína suficiente y variedad alimentaria.'],
      disclaimer:'La app no diagnostica anemia y no corrige clínicamente hemoglobina por altitud.'
    }
  };
  const metrics={
    piura:{obesity:'Indicador educativo pendiente de cifra oficial',anemia:'Indicador educativo pendiente de cifra oficial'},
    cusco:{obesity:'Indicador educativo pendiente de cifra oficial',anemia:'Indicador educativo pendiente de cifra oficial'}
  };
  function getRegion(id){return regions[id]||regions.piura;}
  function regionTitle(id){return getRegion(id).name;}
  function regionFocus(id){return getRegion(id).priorities.join(' · ');}
  function regionalPrompt(id){
    const r=getRegion(id);
    return `Región del usuario: ${r.name}. Contexto: ${r.label}. Clima: ${r.climate}. Prioridades educativas: ${r.priorities.join(', ')}.`;
  }
  function getFoods(id){return getRegion(id).foods.slice();}
  function getEducationalTips(id){return getRegion(id).educational.slice();}
  function formatRegionalCard(id){
    const r=getRegion(id);
    return {title:r.name,subtitle:r.label,focus:r.priorities[0],foods:r.foods.slice(0,6),tips:r.educational.slice(0,3)};
  }
  const sourceRegistry=[
    {name:'MINSA',kind:'salud pública',note:'Usar para indicadores nacionales y regionales verificados.'},
    {name:'INS',kind:'nutrición',note:'Usar para documentos técnicos de anemia y alimentación.'},
    {name:'INEI',kind:'estadística',note:'Usar para prevalencias por departamento cuando estén disponibles.'},
    {name:'ENDES',kind:'encuesta',note:'Usar cifras de salud materno-infantil y nutrición con año.'}
  ];
  const anemiaEducation=[
    {key:'iron_heme',label:'Hierro hemo',examples:['carne','pollo','pescado'],tip:'Su biodisponibilidad suele ser mayor que la de fuentes vegetales.'},
    {key:'iron_nonheme',label:'Hierro no hemo',examples:['lenteja','frejol','garbanzo','quinua'],tip:'Combínalo con una fuente de vitamina C.'},
    {key:'vit_c',label:'Vitamina C',examples:['naranja','mandarina','limón','papaya','guayaba'],tip:'Puede acompañar comidas con hierro vegetal.'},
    {key:'tea_coffee',label:'Interacciones',examples:['té','café'],tip:'Evita presentarlos como tratamiento; pueden reducir absorción de hierro no hemo cuando se consumen junto a la comida.'}
  ];
  function anemiaAdvice(){return anemiaEducation.map(x=>({...x,examples:x.examples.slice()}));}
  function buildRegionalDataset(){
    return {regions:JSON.parse(JSON.stringify(regions)),metrics:JSON.parse(JSON.stringify(metrics)),sources:sourceRegistry.slice(),anemia:anemiaAdvice()};
  }
  window.FG_REGION_DATA={regions,metrics,getRegion,regionTitle,regionFocus,regionalPrompt,getFoods,getEducationalTips,formatRegionalCard,sourceRegistry,anemiaEducation,anemiaAdvice,buildRegionalDataset};
})();
