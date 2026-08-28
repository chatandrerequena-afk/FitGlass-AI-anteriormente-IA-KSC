/* FitGlass AI — preventive nutrition screening rules. Educational only. */
(function(){
  "use strict";
  const rules=[];
  rules.push({key:"fatigue",label:"Cansancio frecuente",advice:"Pregunta por sueño, alimentación y hemoglobina medida; no diagnosticar."});
  rules.push({key:"dizziness",label:"Mareo",advice:"Recomendar valoración si es recurrente o intenso; revisar hidratación y alimentación."});
  rules.push({key:"pallor",label:"Palidez",advice:"Puede tener múltiples causas; no inferir anemia solo por apariencia."});
  rules.push({key:"brittle_nails",label:"Uñas frágiles",advice:"No es una prueba de hierro. Considerar alimentación variada y evaluación profesional."});
  rules.push({key:"heavy_exercise",label:"Ejercicio intenso",advice:"Ajustar hidratación y alimentación; evitar recomendaciones clínicas específicas sin datos."});
  rules.push({key:"low_appetite",label:"Poco apetito",advice:"Explorar frecuencia de comidas y variedad; consultar si persiste."});
  rules.push({key:"high_sugar_drinks",label:"Bebidas azucaradas frecuentes",advice:"Sugerir agua y reducir frecuencia, sin demonizar alimentos."});
  rules.push({key:"low_vegetable",label:"Pocas verduras",advice:"Sugerir aumentar variedad y añadir una porción a comidas principales."});
  rules.push({key:"low_fruit",label:"Poca fruta",advice:"Sugerir fruta entera como parte de una alimentación variada."});
  rules.push({key:"low_protein",label:"Poca proteína",advice:"Sugerir distribuir fuentes de proteína durante el día."});
  rules.push({key:"low_water",label:"Poca agua",advice:"Aumentar gradualmente y ajustar por clima y ejercicio."});
  const questions=[];
  questions.push({id:'q01',rule:"fatigue",text:"¿Te sientes cansado con frecuencia?",answerType:'boolean'});
  questions.push({id:'q02',rule:"dizziness",text:"¿Has tenido mareos frecuentes?",answerType:'boolean'});
  questions.push({id:'q03',rule:"pallor",text:"¿Has notado palidez inusual?",answerType:'boolean'});
  questions.push({id:'q04',rule:"brittle_nails",text:"¿Tienes uñas frágiles con frecuencia?",answerType:'boolean'});
  questions.push({id:'q05',rule:"high_sugar_drinks",text:"¿Consumes bebidas azucaradas casi todos los días?",answerType:'boolean'});
  questions.push({id:'q06',rule:"low_vegetable",text:"¿Comes verduras menos de una vez al día?",answerType:'boolean'});
  questions.push({id:'q07',rule:"low_fruit",text:"¿Comes fruta menos de una vez al día?",answerType:'boolean'});
  questions.push({id:'q08',rule:"low_protein",text:"¿Sueles omitir fuentes de proteína en comidas principales?",answerType:'boolean'});
  questions.push({id:'q09',rule:"low_water",text:"¿Tomas poca agua durante el día?",answerType:'boolean'});
  function score(answers){let s=0;for(const q of questions){if(answers?.[q.id]===true)s+=q.rule==="fatigue"||q.rule==="dizziness"||q.rule==="pallor"?2:1;}return Math.min(10,s);}
  function level(value){return value<=2?"Bajo":value<=5?"Moderado":"Alto";}
  function buildResult(answers,hb,sex,region){const s=score(answers);const result={score:s,level:level(s),hemoglobin:null,region};if(Number(hb)>0){const threshold=sex==="female"?12:13;result.hemoglobin={value:Number(hb),threshold,below:Number(hb)<threshold};}return result;}
  function disclaimer(){return "Este módulo es educativo y no diagnostica anemia ni ninguna enfermedad.";}
  function actionFor(rule){return rules.find(x=>x.key===rule)?.advice||"Mantén una alimentación variada y consulta a un profesional ante dudas persistentes.";}
  window.FG_HEALTH_SCREEN={rules,questions,score,level,buildResult,disclaimer,actionFor};
})();
