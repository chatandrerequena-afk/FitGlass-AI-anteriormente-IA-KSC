/* FitGlass AI — External API clients (optional)
 * Safe-by-default: expects serverless proxy endpoints.
 */
(function(){
  'use strict';
  const cfg=window.FG_CONFIG||{};
  const jsonHeaders={'Content-Type':'application/json','Accept':'application/json'};
  async function fetchJSON(url,options={}){const r=await fetch(url,{...options,headers:{...jsonHeaders,...(options.headers||{})}});if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json();}
  function hasProxy(){return Boolean(cfg.GROQ_PROXY_URL||cfg.USDA_PROXY_URL);}
  async function groqChat(messages,options={}){
    if(!cfg.GROQ_PROXY_URL)throw new Error('GROQ_PROXY_URL no configurado');
    return fetchJSON(cfg.GROQ_PROXY_URL,{method:'POST',body:JSON.stringify({model:options.model||cfg.GROQ_MODEL||'openai/gpt-oss-120b',messages,temperature:options.temperature??.25,max_tokens:options.max_tokens??900})});
  }
  async function groqVision(imageData,options={}){
    if(!cfg.GROQ_PROXY_URL)throw new Error('GROQ_PROXY_URL no configurado');
    const content=[{type:'text',text:options.prompt||'Analiza esta comida exclusivamente desde nutrición. Devuelve JSON.'},{type:'image_url',image_url:{url:imageData}}];
    return fetchJSON(cfg.GROQ_PROXY_URL,{method:'POST',body:JSON.stringify({model:options.model||cfg.GROQ_VISION_MODEL||'meta-llama/llama-4-scout-17b-16e-instruct',messages:[{role:'user',content}],temperature:.1,max_tokens:options.max_tokens||1200})});
  }
  async function usdaSearch(query,pageSize=8){
    const url=cfg.USDA_PROXY_URL||'https://api.nal.usda.gov/fdc/v1/foods/search';
    if(!cfg.USDA_PROXY_URL && !cfg.USDA_API_KEY)throw new Error('Configura USDA_API_KEY o USDA_PROXY_URL');
    const final=cfg.USDA_PROXY_URL?url:`${url}?api_key=${encodeURIComponent(cfg.USDA_API_KEY)}&query=${encodeURIComponent(query)}&pageSize=${pageSize}`;
    return fetchJSON(final,{method:'GET'});
  }
  async function usdaFood(id){
    const url=cfg.USDA_PROXY_URL?`${cfg.USDA_PROXY_URL.replace(/\/$/,'')}/${encodeURIComponent(id)}`:`https://api.nal.usda.gov/fdc/v1/food/${encodeURIComponent(id)}?api_key=${encodeURIComponent(cfg.USDA_API_KEY||'')}`;
    return fetchJSON(url,{method:'GET'});
  }
  async function openFoodFacts(barcode){
    const r=await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`);if(!r.ok)throw new Error('OFF error');return r.json();
  }
  async function openMeteo(lat,lon){const url=`https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,relative_humidity_2m`;return fetchJSON(url,{method:'GET'});}
  function extractGroqText(result){return result?.choices?.[0]?.message?.content||'';}
  function cleanJsonText(text){let t=String(text||'').trim();const match=t.match(/```(?:json)?\s*([\s\S]*?)```/i);if(match)t=match[1].trim();const a=t.indexOf('{'),b=t.lastIndexOf('}');return a>=0&&b>a?t.slice(a,b+1):t;}
  function parseJsonText(text,fallback=null){try{return JSON.parse(cleanJsonText(text));}catch{return fallback;}}
  const imagePolicy={maxWidth:1600,maxHeight:1600,jpegQuality:.84,maxBytes:900000};
  function resizeImage(file,policy=imagePolicy){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{let w=img.naturalWidth,h=img.naturalHeight,s=Math.min(1,policy.maxWidth/w,policy.maxHeight/h);w=Math.round(w*s);h=Math.round(h*s);const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);resolve(c.toDataURL('image/jpeg',policy.jpegQuality));};img.onerror=reject;img.src=reader.result;};reader.onerror=reject;reader.readAsDataURL(file);});}
  const nutritionPrompts={
    vision:`Analiza la fotografía como estimación nutricional educativa. Devuelve SOLO JSON con name, confidence, items[]. Cada item debe incluir name, grams, kcal, protein, carbs, fats. No diagnostiques salud.`,
    mealPlan:`Propón una comida equilibrada usando los ingredientes disponibles. Incluye porciones aproximadas y macros orientativos.`,
    anemia:`Explica nutrición relacionada con hierro, vitamina C y anemia de forma educativa. No diagnostiques.`
  };
  function buildCoachMessages(system,user,history=[]){return [{role:'system',content:system},...history.slice(-12).map(m=>({role:m.role,content:m.text||m.content})),{role:'user',content:user}];}
  const offlineAnswers={
    protein:(ctx)=>`Tu objetivo estimado es ${ctx.protein} g de proteína al día. Reparte alimentos fuente de proteína entre tus comidas.`,
    water:(ctx)=>`Tu referencia de hidratación es ${ctx.water} L/día. Ajusta según temperatura, ejercicio y sudoración.`,
    calories:(ctx)=>`Tu objetivo estimado es ${ctx.calories} kcal/día. Es una referencia orientativa, no una prescripción clínica.`,
    anemia:()=>`Puedo explicar hierro y alimentación, pero no diagnosticar anemia. Si tienes un resultado de hemoglobina, consúltalo con un profesional y usa la app solo como apoyo educativo.`
  };
  window.FG_API={cfg,fetchJSON,hasProxy,groqChat,groqVision,usdaSearch,usdaFood,openFoodFacts,openMeteo,extractGroqText,cleanJsonText,parseJsonText,imagePolicy,resizeImage,nutritionPrompts,buildCoachMessages,offlineAnswers};
})();
