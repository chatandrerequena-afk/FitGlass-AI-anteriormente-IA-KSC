/* ============================================================
   FitGlass AI — Eureka Plus Enhancements
   Adds: notifications, streak engine, calendar, focus timer,
   barcode database, MINSA/INS sources, profile intelligence,
   local product editor, smart reminders and presentation mode.
   ============================================================ */
(() => {
  'use strict';
  const CFG = window.FG_CONFIG || {};
  const KEY = 'fitglass_state_v1';
  const ENH_KEY = 'fitglass_plus_state_v1';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const dayKey = d => new Date(d.getFullYear(),d.getMonth(),d.getDate()).toISOString().slice(0,10);
  const today = () => dayKey(new Date());
  const moneyless = n => Math.round(Number(n)||0).toLocaleString('es-PE');

  const plus = {
    timer:{seconds:600,total:600,running:false,mode:'Focus',sound:false,id:null},
    notifications:false,
    products:[],
    calendarView:new Date(),
    presentation:false,
    dailyChecks:{},
    reminders:{water:true,meal:true,weight:true}
  };

  function loadBase(){ try{return JSON.parse(localStorage.getItem(KEY))||{};}catch{return {};}};
  function loadPlus(){ try{Object.assign(plus,JSON.parse(localStorage.getItem(ENH_KEY))||{});}catch{} }
  function savePlus(){localStorage.setItem(ENH_KEY,JSON.stringify({notifications:plus.notifications,products:plus.products,reminders:plus.reminders,dailyChecks:plus.dailyChecks}));}
  function base(){const s=loadBase();return s;}
  function profile(){return base().profile||null;}
  function meals(){return base().meals||[];}
  function water(){return Number(base().water||0);}
  function history(){return base().history||[];}
  function metrics(){return profile()?.metrics||{};}

  function toast(msg){
    const t=$('#toast');
    if(t){t.textContent=msg;t.classList.add('show');clearTimeout(window.__fgpt);window.__fgpt=setTimeout(()=>t.classList.remove('show'),2600);return;}
    let box=$('#fg-plus-toast');
    if(!box){box=document.createElement('div');box.id='fg-plus-toast';document.body.appendChild(box)}
    box.textContent=msg;box.classList.add('show');clearTimeout(window.__fgpt2);window.__fgpt2=setTimeout(()=>box.classList.remove('show'),2600);
  }

  function injectNavigation(){
    const nav=$('.sidebar-nav'); if(!nav || $('#plus-nav-anchor')) return;
    const divider=document.createElement('div');divider.className='nav-divider';divider.id='plus-nav-anchor';
    const title=document.createElement('div');title.className='nav-section-title';title.textContent='EUREKA LAB';
    const items=[
      ['plus','Panel Eureka','◇'],['plus-health','MINSA / INS','H'],['plus-barcode','Laboratorio de códigos','B'],['plus-timer','Temporizador','T'],['plus-calendar','Rachas y calendario','R'],['plus-present','Modo presentación','P']
    ];
    nav.append(divider,title);
    items.forEach(([view,label,mark])=>{const b=document.createElement('button');b.className='nav-item plus-nav-item';b.dataset.plusView=view;b.type='button';b.innerHTML=`<span class="plus-nav-mark">${mark}</span><span>${label}</span>`;nav.appendChild(b)});
    $$('.plus-nav-item').forEach(b=>b.addEventListener('click',()=>showPlusView(b.dataset.plusView)));
  }

  function ensureMainContainer(){
    const main=$('.main-content')||document.body;
    if(!main)return;
    const views=[
      ['view-plus','Panel Eureka'],['view-plus-health','MINSA / INS'],['view-plus-barcode','Códigos'],['view-plus-timer','Temporizador'],['view-plus-calendar','Rachas'],['view-plus-present','Presentación']
    ];
    views.forEach(([id])=>{if(document.getElementById(id))return;const section=document.createElement('section');section.id=id;section.className='view fg-plus-view';section.innerHTML=plusMarkup(id);main.appendChild(section)});
  }

  function plusMarkup(id){
    if(id==='view-plus') return `
      <header class="page-heading"><div><span class="eyebrow">EUREKA 2026 · LAB</span><h1>Panel <span>inteligente</span></h1><p>Una vista de demostración que une perfil, datos, rachas, salud pública y controles.</p></div><button class="button-glass" data-plus-action="refresh">Actualizar</button></header>
      <div class="plus-hero glass-card"><div><span class="section-kicker">MOTOR DE PERFIL</span><h2 id="plus-profile-title">Analizando tu perfil…</h2><p id="plus-profile-copy">La app sincroniza objetivos, región, comidas y preferencias.</p><div class="plus-chip-row" id="plus-profile-chips"></div></div><div class="plus-orbit"><div class="plus-orbit-core">FG</div><i></i><i></i></div></div>
      <div class="plus-stat-grid"><article class="glass-card plus-stat"><span>Racha diaria</span><strong id="plus-daily-streak">0</strong><small>días consecutivos</small></article><article class="glass-card plus-stat"><span>Racha perfecta</span><strong id="plus-perfect-streak">0</strong><small>objetivos cumplidos</small></article><article class="glass-card plus-stat"><span>Fitness Score</span><strong id="plus-score">0</strong><small>/100</small></article><article class="glass-card plus-stat"><span>IA disponible</span><strong id="plus-ai">DEMO</strong><small>modo de exposición</small></article></div>
      <div class="plus-grid-2"><article class="glass-card"><header class="card-heading"><div><span class="section-kicker">RECOMENDACIÓN</span><h3>Qué haría ahora tu Coach</h3></div></header><div id="plus-smart-reco" class="plus-reco"></div></article><article class="glass-card"><header class="card-heading"><div><span class="section-kicker">PERMISOS</span><h3>Control del dispositivo</h3></div></header><div class="plus-permission-actions"><button data-plus-action="notifications" class="button-glass">Notificaciones</button><button data-plus-action="camera" class="button-glass">Cámara</button><button data-plus-action="location" class="button-glass">Ubicación</button></div><small>Los permisos se solicitan solo cuando activas la función.</small></article></div>
      <div class="plus-callout glass-card"><div class="plus-callout-icon">MINSA</div><div><strong>Modo fuente oficial</strong><p>Abre referencias de MINSA / INS integradas en el proyecto y demuestra que la interfaz separa datos oficiales de estimaciones de IA.</p></div><button data-plus-view="plus-health" class="primary-button">Abrir fuentes</button></div>`;
    if(id==='view-plus-health') return `
      <header class="page-heading"><div><span class="eyebrow">SALUD PÚBLICA</span><h1>MINSA <span>/ INS</span></h1><p>Tarjetas educativas con enlaces directos a fuentes oficiales.</p></div><button data-plus-action="sources" class="button-glass">Fuentes oficiales</button></header>
      <div id="plus-official-grid" class="official-grid"></div>
      <div class="public-data-grid"><article class="glass-card public-data"><span>Indicador nacional</span><strong>62.2%</strong><small>Exceso de peso citado por MINSA a partir de ENDES 2024.</small></article><article class="glass-card public-data"><span>Obesidad 15+</span><strong>25.7%</strong><small>Dato nacional 2024 citado por MINSA desde INEI.</small></article><article class="glass-card public-data"><span>Proyecto regional</span><strong id="public-region-value">Piura</strong><small id="public-region-copy">Contexto educativo, no tasa regional inventada.</small></article></div>
      <div class="glass-card scientific-note"><span class="section-kicker">REGLA CIENTÍFICA</span><h3>No inventar una prevalencia regional.</h3><p>Cuando no haya una cifra regional verificable, la app dice que no fue posible darla y mantiene separado el indicador nacional del contexto regional.</p></div>`;
    if(id==='view-plus-barcode') return `
      <header class="page-heading"><div><span class="eyebrow">LABORATORIO DE PRODUCTOS</span><h1>Código <span>+ ficha</span></h1><p>Busca un producto, muestra su tabla nutricional y conviértelo en un registro local editable.</p></div><button data-plus-action="barcode-camera" class="primary-button">Activar cámara</button></header>
      <div class="plus-barcode-layout"><article class="glass-card barcode-box"><div class="barcode-animation"><span></span><span></span><span></span><span></span></div><label class="field"><span>Código EAN / UPC</span><input id="plus-barcode-input" inputmode="numeric" placeholder="Ej. 7751234567890"></label><div class="barcode-actions"><button id="plus-barcode-lookup" class="primary-button">Consultar</button><button id="plus-barcode-demo" class="button-glass">Usar demo</button></div><small>Si el proveedor no devuelve información, aparecerá el editor local.</small></article><article class="glass-card"><header class="card-heading"><div><span class="section-kicker">TABLA NUTRICIONAL</span><h3>Resultado</h3></div><span id="plus-product-status" class="confidence-pill">Sin consulta</span></header><div id="plus-product-result" class="product-result"></div><button id="plus-save-product" class="button-glass wide" disabled>Guardar en base local</button></article></div>
      <article class="glass-card local-products"><header class="card-heading"><div><span class="section-kicker">BASE EDITABLE</span><h3>Productos guardados</h3></div><button id="plus-export-products" class="text-button">Exportar JSON</button></header><div id="plus-product-grid"></div></article>`;
    if(id==='view-plus-timer') return `
      <header class="page-heading"><div><span class="eyebrow">CONTROL</span><h1>Focus <span>Timer</span></h1><p>Temporizador para preparación, exposición o una sesión de movimiento.</p></div></header>
      <div class="timer-layout"><article class="glass-panel premium-timer"><div class="timer-ring"><svg viewBox="0 0 250 250"><defs><linearGradient id="plus-timer-grad" x1="0" x2="1"><stop stop-color="#75e6ff"/><stop offset="1" stop-color="#9b89ff"/></linearGradient></defs><circle class="timer-track" cx="125" cy="125" r="95"></circle><circle id="plus-timer-ring" class="timer-value" cx="125" cy="125" r="95"></circle></svg><div><strong id="plus-timer-text">10:00</strong><small id="plus-timer-status">Preparado</small></div></div><div class="timer-presets-plus"><button data-plus-min="5">5 min</button><button class="active" data-plus-min="10">10 min</button><button data-plus-min="15">15 min</button><button data-plus-min="25">25 min</button></div><div class="timer-buttons-plus"><button id="plus-timer-toggle" class="primary-button">Iniciar</button><button id="plus-timer-reset" class="button-glass">Reiniciar</button><button id="plus-timer-sound" class="button-glass">Sonido: no</button></div></article><article class="glass-card timer-ideas"><header class="card-heading"><div><span class="section-kicker">USOS</span><h3>Ideas para la expo</h3></div></header><div class="idea-card"><strong>1 · Medición</strong><small>Usa el timer para mostrar una actividad cronometrada.</small></div><div class="idea-card"><strong>2 · Preparación</strong><small>Simula un intervalo de hidratación o descanso.</small></div><div class="idea-card"><strong>3 · Presentación</strong><small>Usa 5 minutos como reloj de una estación de evaluación.</small></div></article></div>`;
    if(id==='view-plus-calendar') return `
      <header class="page-heading"><div><span class="eyebrow">ADHERENCIA</span><h1>Rachas <span>& calendario</span></h1><p>La racha diaria mide constancia; la racha perfecta exige completar metas.</p></div></header>
      <div class="streak-hero-grid"><article class="glass-card streak-big"><span>RACHA DIARIA</span><strong id="calendar-daily-streak">0</strong><small>días consecutivos</small></article><article class="glass-card streak-big perfect"><span>RACHA PERFECTA</span><strong id="calendar-perfect-streak">0</strong><small>kcal ±10% · proteína ≥90% · agua ≥90%</small></article></div>
      <article class="glass-card full-calendar-card"><header class="card-heading"><div><span class="section-kicker">CALENDARIO</span><h3 id="calendar-month-title">Mes actual</h3></div><div class="calendar-nav"><button id="calendar-prev">‹</button><button id="calendar-today">Hoy</button><button id="calendar-next">›</button></div></header><div class="week-head"><span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span></div><div id="full-calendar-grid" class="full-calendar-grid"></div></article>`;
    if(id==='view-plus-present') return `
      <header class="page-heading"><div><span class="eyebrow">EUREKA 2026</span><h1>Modo <span>presentación</span></h1><p>Vista limpia para proyectar durante la exposición.</p></div><button id="presentation-toggle" class="primary-button">Pantalla completa</button></header>
      <div class="presentation-board glass-panel"><div class="presentation-brand">FG</div><span class="section-kicker">FITGLASS AI · ANTERIORMENTE IA KSC</span><h2 id="presentation-title">Nutrición con contexto.</h2><p id="presentation-copy">Una plataforma educativa que une perfil, IA, alimentos, fuentes oficiales y hábitos.</p><div class="presentation-rings"><div><strong id="presentation-calories">0</strong><small>kcal</small></div><div><strong id="presentation-protein">0</strong><small>g proteína</small></div><div><strong id="presentation-water">0</strong><small>L agua</small></div></div><div class="presentation-bottom"><span>Andre y Sebastian</span><span>IEP El Triunfo Castilla</span><span>4.º secundaria</span></div></div>`;
    return '';
  }

  function showPlusView(view){
    $$('.view').forEach(v=>v.classList.remove('active'));
    const target=$(`#view-${view}`);if(target)target.classList.add('active');
    $$('.nav-item').forEach(b=>b.classList.remove('active'));
    $$('.plus-nav-item').forEach(b=>b.classList.toggle('active',b.dataset.plusView===view));
    if(view==='plus')renderPlusDashboard();
    if(view==='plus-health')renderOfficialSources();
    if(view==='plus-barcode')renderProducts();
    if(view==='plus-timer')updateTimerUI();
    if(view==='plus-calendar')renderCalendar();
    if(view==='plus-present')renderPresentation();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function bindPlusViewLinks(){
    $$('[data-plus-view]').forEach(b=>b.addEventListener('click',()=>showPlusView(b.dataset.plusView)));
  }

  function renderPlusDashboard(){
    const p=profile(); if(!p)return;
    const m=metrics(), ms=meals(), d=today();
    const todays=ms.filter(x=>x.date===d); const kcal=todays.reduce((a,x)=>a+Number(x.calories||0),0);const protein=todays.reduce((a,x)=>a+Number(x.protein||0),0);
    $('#plus-profile-title').textContent=`${p.name}, perfil sincronizado`;
    $('#plus-profile-copy').textContent=`${p.region} · ${goalText(p.goal)} · ${Math.round(m.calories||0)} kcal/día · ${Math.round(m.protein||0)} g proteína`;
    $('#plus-profile-chips').innerHTML=[`Edad ${p.age}`,`Peso ${p.weight} kg`,`IMC ${m.bmi}`,`Favoritos: ${(p.likes||'').split(',')[0]||'—'}`].map(x=>`<span>${esc(x)}</span>`).join('');
    const ds=dailyStreak(), ps=perfectStreak();$('#plus-daily-streak').textContent=ds;$('#plus-perfect-streak').textContent=ps;
    const score=Math.round(Math.min(100,Math.max(0,(1-Math.abs(kcal-(m.calories||0))/Math.max(m.calories||1,400))*45+(Math.min(1,protein/Math.max(m.protein||1,1))*35)+(Math.min(1,water()/Math.max(m.water||1,1))*20))));
    $('#plus-score').textContent=score;$('#plus-ai').textContent=FG_API?.hasProxy?.()?'PROXY':'DIRECT/DEMO';
    $('#plus-smart-reco').innerHTML=recommendation(p,m,kcal,protein);
  }

  function goalText(g){return g==='cut'?'reducir grasa':g==='gain'?'ganar masa':'mantener';}

  function recommendation(p,m,kcal,protein){
    const lines=[];if((m.calories||0)-kcal>500)lines.push(`<strong>Te faltan ${moneyless((m.calories||0)-kcal)} kcal</strong><span>Considera una comida completa con una fuente de proteína y verduras.</span>`);else lines.push(`<strong>Tu energía está cerca de la meta</strong><span>Revisa la proteína restante y el agua antes de terminar el día.</span>`);
    if(protein<(m.protein||0)*.9)lines.push(`<strong>Proteína: ${moneyless((m.protein||0)-protein)} g aprox.</strong><span>Usa tus ingredientes favoritos para completar el objetivo.</span>`);
    return lines.join('<div class="reco-line"></div>');
  }

  function dailyStreak(){
    const s=base(), ms=Array.isArray(s.meals)?s.meals:[], waterMap=s.waterByDay||{};
    let count=0,d=new Date();
    for(let i=0;i<90;i++){const k=dayKey(d);if(ms.some(x=>x.date===k)||Number(waterMap[k]||0)>0||s.history?.some(x=>x.date===k)){count++;d.setDate(d.getDate()-1)}else break;}
    return count;
  }

  function perfectStreak(){
    const p=profile(),m=p?.metrics||{};if(!p)return 0;
    let count=0,d=new Date();
    for(let i=0;i<90;i++){
      const k=dayKey(d),day=(meals().filter(x=>x.date===k));
      const cal=day.reduce((a,x)=>a+Number(x.calories||0),0),pro=day.reduce((a,x)=>a+Number(x.protein||0),0);
      const wb=(base().waterByDay||{}),wat=Number(wb[k]||0);
      const perfect=Math.abs(cal-(m.calories||0))<=(m.calories||0)*.10&&pro>=(m.protein||0)*.9&&wat>=(m.water||0)*.9;
      if(!perfect)break;count++;d.setDate(d.getDate()-1);
    }
    return count;
  }

  function ensureWaterByDay(){
    const s=base();if(!s.waterByDay)s.waterByDay={};
    if(typeof s.water==='number'){s.waterByDay[today()]=s.water;delete s.water;}
    localStorage.setItem(KEY,JSON.stringify(s));return s;
  }

  async function requestNotifications(){
    if(!('Notification' in window)){toast('Este navegador no admite notificaciones');return}
    const p=await Notification.requestPermission();
    if(p==='granted'){plus.notifications=true;savePlus();new Notification('FitGlass AI',{body:'Recordatorios activados. Sigue tu racha.'});toast('Notificaciones activadas');}
    else toast('No fue posible activar notificaciones');
  }

  async function requestLocation(){
    if(!navigator.geolocation){toast('Ubicación no disponible');return}
    navigator.geolocation.getCurrentPosition(pos=>toast(`Ubicación permitida · ${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`),()=>toast('No fue posible obtener tu ubicación'),{enableHighAccuracy:false,timeout:6000});
  }

  function cameraPermission(){
    if(!navigator.mediaDevices?.getUserMedia){toast('Cámara no disponible en este navegador');return}
    navigator.mediaDevices.getUserMedia({video:true,audio:false}).then(stream=>{stream.getTracks().forEach(t=>t.stop());toast('Permiso de cámara concedido');}).catch(()=>toast('No fue posible obtener permiso de cámara'));
  }

  function officialSources(){return (window.FG_REGION_DATA?.sourceRegistry||[]).map(s=>({name:s.name,title:s.kind,source:'#'})).concat([
    {name:'MINSA',title:'Alimentación saludable',source:'https://www.gob.pe/institucion/minsa/noticias/1357287-comer-saludable-previene-el-sobrepeso-y-la-obesidad'},
    {name:'MINSA',title:'Guías alimentarias',source:'https://www.gob.pe/institucion/minsa/informes-publicaciones/314037-guias-alimentarias-para-la-poblacion-peruana'},
    {name:'MINSA / INS',title:'NTS 213 anemia',source:'https://www.gob.pe/institucion/minsa/normas-legales/5440166-251-2024-minsa'},
    {name:'MINSA',title:'Prevención de anemia',source:'https://www.gob.pe/institucion/minsa/noticias/1190287-juntos-contra-la-anemia-minsa-recuerda-la-importancia-de-una-alimentacion-saludable-para-prevenir-la-anemia'},
    {name:'MINSA',title:'Obesidad',source:'https://www.gob.pe/institucion/minsa/noticias/1262466'}
  ]);}

  function renderOfficialSources(){
    const root=$('#plus-official-grid');if(!root)return;
    root.innerHTML=officialSources().filter(x=>x.source!=='#').map(x=>`<article class="official-item"><span>${esc(x.name)}</span><strong>${esc(x.title)}</strong><a href="${esc(x.source)}" target="_blank" rel="noopener">Abrir fuente oficial →</a></article>`).join('');
    const p=profile()||{region:'Piura'};$('#public-region-value').textContent=p.region;$('#public-region-copy').textContent=p.region==='Cusco'?'Contexto de altitud e interpretación educativa de hemoglobina.':'Contexto de hidratación y alimentación en la costa norte.';
  }

  async function lookupProduct(code){
    $('#plus-product-status').textContent='Consultando…';
    try{
      const result=await FG_API.openFoodFacts(code);if(result?.status===1&&result.product){
        const p=result.product,n=p.nutriments||{};
        plus.product={barcode:code,name:p.product_name_es||p.product_name||`Producto ${code}`,serving:p.serving_size||'100 g',image:p.image_front_small_url||'',kcal:Number(n['energy-kcal_100g'])||0,protein:Number(n.proteins_100g)||0,carbs:Number(n.carbohydrates_100g)||0,fats:Number(n.fat_100g)||0,fiber:Number(n.fiber_100g)||0,sodium:Number(n.sodium_100g)||0,source:'Open Food Facts'};
        renderProduct();return;
      }
    }catch{}
    const local=plus.products.find(p=>p.barcode===code)||DATA.sampleProducts?.find(p=>p.barcode===code);
    if(local){plus.product={...local,source:'Base local'};renderProduct();return;}
    plus.product={barcode:code,name:'',serving:'100 g',kcal:0,protein:0,carbs:0,fats:0,fiber:0,sodium:0,manual:true};
    $('#plus-product-status').textContent='No fue posible darte datos';
    showProductEditor();
  }

  function renderProduct(){
    const p=plus.product;$('#plus-product-status').textContent=p.source||'Disponible';
    $('#plus-product-result').innerHTML=`<div class="product-head-plus">${p.image?`<img src="${esc(p.image)}" alt="">`:'<div class="product-placeholder">P</div>'}<div><strong>${esc(p.name)}</strong><small>${esc(p.serving||'100 g')} · ${esc(p.source||'Base local')}</small></div></div><table class="nutrition-table-plus"><tr><td>Energía</td><td>${moneyless(p.kcal)} kcal</td></tr><tr><td>Proteína</td><td>${Number(p.protein).toFixed(1)} g</td></tr><tr><td>Carbohidratos</td><td>${Number(p.carbs).toFixed(1)} g</td></tr><tr><td>Grasas</td><td>${Number(p.fats).toFixed(1)} g</td></tr><tr><td>Fibra</td><td>${Number(p.fiber||0).toFixed(1)} g</td></tr><tr><td>Sodio</td><td>${Number(p.sodium||0).toFixed(1)} mg</td></tr></table>`;
    $('#plus-save-product').disabled=false;
  }

  function showProductEditor(){
    $('#plus-product-result').innerHTML=`<div class="form-stack">
      <label class="field"><span>Nombre del producto</span><input id="manual-prod-name" placeholder="Ej. Producto creado por el equipo"></label>
      <div class="field-grid-2"><label class="field"><span>Porción</span><input id="manual-prod-serving" value="100 g"></label><label class="field"><span>kcal</span><input id="manual-prod-kcal" type="number"></label></div>
      <div class="field-grid-2"><label class="field"><span>Proteína (g)</span><input id="manual-prod-p" type="number"></label><label class="field"><span>Carbohidratos (g)</span><input id="manual-prod-c" type="number"></label></div>
      <label class="field"><span>Grasas (g)</span><input id="manual-prod-g" type="number"></label>
      <label class="field"><span>Pega aquí la tabla nutricional o texto de la etiqueta</span><textarea id="manual-prod-label" rows="5" placeholder="Energía 350 kcal; proteínas 10 g; carbohidratos 65 g; grasas 7 g; fibra 5 g; sodio 120 mg..."></textarea></label>
      <button id="manual-prod-ai" class="button-glass wide" type="button">Mejorar ficha con IA</button>
      <small id="manual-prod-ai-status" style="color:var(--muted);font-size:8px">La IA solo normaliza los datos que proporciones y no debe inventar valores faltantes.</small>
    </div>`;
    $('#plus-save-product').disabled=false;
    $('#manual-prod-ai')?.addEventListener('click',assistManualProductWithAI);
  }

  async function assistManualProductWithAI(){
    const label=$('#manual-prod-label')?.value.trim()||'';
    const name=$('#manual-prod-name')?.value.trim()||'';
    const status=$('#manual-prod-ai-status');
    if(!label && !name){ toast('Escribe el nombre o pega la tabla nutricional'); return; }
    if(!window.FG_API?.groqChat){ toast('IA no disponible'); return; }
    try{
      status.textContent='Analizando la ficha…';
      const prompt=`Eres un asistente de normalización nutricional. Usa EXCLUSIVAMENTE la información entregada por el usuario. NO inventes valores ausentes. Devuelve SOLO JSON válido con: name, serving, kcal, protein, carbs, fats, fiber, sodium, confidence, missing. Si un valor no está disponible, usa null. Puedes normalizar unidades y nombres, pero no crear datos no proporcionados. Nombre: ${name||'(sin nombre)'}. Etiqueta: ${label||'(sin etiqueta)'}`;
      const response=await FG_API.groqChat([{role:'system',content:'Normaliza datos nutricionales sin inventar.'},{role:'user',content:prompt}],{max_tokens:600,temperature:.1});
      const raw=FG_API.extractGroqText(response)||'';
      const data=FG_API.parseJsonText(raw,null);
      if(!data){throw new Error('JSON IA inválido')}
      if(data.name)$('#manual-prod-name').value=data.name;
      if(data.serving)$('#manual-prod-serving').value=data.serving;
      if(data.kcal!=null)$('#manual-prod-kcal').value=data.kcal;
      if(data.protein!=null)$('#manual-prod-p').value=data.protein;
      if(data.carbs!=null)$('#manual-prod-c').value=data.carbs;
      if(data.fats!=null)$('#manual-prod-g').value=data.fats;
      status.textContent=data.missing?.length?`IA completó lo disponible. Falta: ${data.missing.join(', ')}`:'Ficha normalizada con IA.';
      plus.product.source='Creado + revisado con IA';
      toast('IA ayudó a ordenar la ficha','Revisa los valores antes de guardar.');
    }catch(error){
      status.textContent='No fue posible ayudarte con IA ahora; revisa o completa la ficha manualmente.';
      toast('No fue posible usar IA','Los datos manuales siguen disponibles.');
    }
  }

  async function saveProduct(){
    if(!plus.product)return;
    if(plus.product.manual){plus.product.name=$('#manual-prod-name')?.value.trim()||'Producto local';plus.product.serving=$('#manual-prod-serving')?.value.trim()||'100 g';plus.product.kcal=Number($('#manual-prod-kcal')?.value)||0;plus.product.protein=Number($('#manual-prod-p')?.value)||0;plus.product.carbs=Number($('#manual-prod-c')?.value)||0;plus.product.fats=Number($('#manual-prod-g')?.value)||0;plus.product.source=plus.product.source||'Creado por el usuario';delete plus.product.manual;}
    plus.products.unshift({...plus.product,id:Date.now().toString(36)});plus.products=plus.products.slice(0,100);savePlus();renderProducts();
    try{
      const cloud=window.FG_FIREBASE?.ready?await window.FG_FIREBASE.ready:null;
      if(cloud?.upsertProduct) await cloud.upsertProduct(plus.product);
      toast('Producto guardado','Quedó en la base local y Firebase.');
    }catch{toast('Producto guardado localmente','No fue posible sincronizar con Firebase ahora.')}
  }

  function renderProducts(){
    const root=$('#plus-product-grid');if(!root)return;
    if(!plus.products.length){root.innerHTML='<div class="empty-plus">Aún no hay productos guardados. Consulta uno o crea una ficha local.</div>';return}
    root.innerHTML=plus.products.map(p=>`<article class="local-product-plus"><strong>${esc(p.name)}</strong><small>${esc(p.barcode||'sin código')} · ${moneyless(p.kcal)} kcal · P ${Number(p.protein||0).toFixed(1)} g · C ${Number(p.carbs||0).toFixed(1)} g · G ${Number(p.fats||0).toFixed(1)} g</small></article>`).join('');
  }

  function renderCalendar(){
    const d=plus.calendarView;const y=d.getFullYear(),m=d.getMonth();const first=new Date(y,m,1);const days=new Date(y,m+1,0).getDate();const start=(first.getDay()+6)%7;const grid=$('#full-calendar-grid');if(!grid)return;$('#calendar-month-title').textContent=new Intl.DateTimeFormat('es-PE',{month:'long',year:'numeric'}).format(first);
    const s=base();if(!s.waterByDay)s.waterByDay={};
    const met=profile()?.metrics||{};let html='';for(let i=0;i<start;i++)html+='<span class="calendar-blank"></span>';for(let day=1;day<=days;day++){const key=dayKey(new Date(y,m,day));const active=meals().some(x=>x.date===key)||Number(s.waterByDay[key]||0)>0||history().some(x=>x.date===key);const dayMeals=meals().filter(x=>x.date===key);const kcal=dayMeals.reduce((a,x)=>a+Number(x.calories||0),0),pro=dayMeals.reduce((a,x)=>a+Number(x.protein||0),0),wat=Number(s.waterByDay[key]||0);const perfect=Math.abs(kcal-(met.calories||0))<=(met.calories||0)*.1&&pro>=(met.protein||0)*.9&&wat>=(met.water||0)*.9;html+=`<span class="calendar-cell-plus ${active?'done':''} ${perfect?'perfect':''} ${key===today()?'today':''}" title="${key}">${day}</span>`}grid.innerHTML=html;$('#calendar-daily-streak').textContent=dailyStreak();$('#calendar-perfect-streak').textContent=perfectStreak();
  }

  function renderPresentation(){const p=profile()||{};const m=metrics();const ms=meals().filter(x=>x.date===today());const kcal=ms.reduce((a,x)=>a+Number(x.calories||0),0);const pr=ms.reduce((a,x)=>a+Number(x.protein||0),0);$('#presentation-calories').textContent=moneyless(kcal);$('#presentation-protein').textContent=moneyless(pr);$('#presentation-water').textContent=Number(water()).toFixed(2);$('#presentation-title').textContent=`${p.region||'Tu región'} · nutrición con contexto`;$('#presentation-copy').textContent=`Objetivo ${goalText(p.goal)} · ${moneyless(m.calories||0)} kcal/día · racha perfecta ${perfectStreak()} día(s).`}

  function timerSet(min){plus.timer.seconds=min*60;plus.timer.total=min*60;plus.timer.running=false;clearInterval(plus.timer.id);plus.timer.id=null;updateTimerUI()}
  function timerToggle(){if(plus.timer.running){clearInterval(plus.timer.id);plus.timer.running=false;updateTimerUI();return}plus.timer.running=true;plus.timer.id=setInterval(()=>{plus.timer.seconds--;if(plus.timer.seconds<=0){clearInterval(plus.timer.id);plus.timer.running=false;plus.timer.seconds=0;toast('Temporizador terminado');if(plus.timer.sound)beepPlus()}updateTimerUI()},1000);updateTimerUI()}
  function timerReset(){timerSet(Math.max(1,Math.round(plus.timer.total/60)))}
  function updateTimerUI(){const s=Math.max(0,plus.timer.seconds),total=Math.max(1,plus.timer.total);$('#plus-timer-text').textContent=`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;$('#plus-timer-status').textContent=plus.timer.running?'En curso':'Preparado';const ring=$('#plus-timer-ring');if(ring)ring.style.strokeDashoffset=String(596.9-596.9*(s/total));const btn=$('#plus-timer-toggle');if(btn)btn.textContent=plus.timer.running?'Pausar':'Iniciar'}
  function beepPlus(){try{const c=new(window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.frequency.value=880;g.gain.value=.03;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.25)}catch{}}

  function bindPlusEvents(){
    document.addEventListener('click',e=>{
      const a=e.target.closest('[data-plus-action]');if(a){const action=a.dataset.plusAction;if(action==='notifications')requestNotifications();if(action==='camera'||action==='camera-permission')cameraPermission();if(action==='location')requestLocation();if(action==='sources')renderOfficialSources();if(action==='refresh')renderPlusDashboard();if(action==='barcode-camera')cameraPermission();}
      const v=e.target.closest('[data-plus-view]');if(v)showPlusView(v.dataset.plusView);
    });
    $('#plus-barcode-lookup')?.addEventListener('click',()=>lookupProduct($('#plus-barcode-input').value.trim()));
    $('#plus-barcode-demo')?.addEventListener('click',()=>{plus.product={...((DATA?.sampleProducts||[])[0]||{barcode:'DEMO',name:'Producto demo',serving:'100 g',kcal:380,protein:12,carbs:68,fats:7,fiber:10,sodium:4}),source:'Demo'};renderProduct()});
    $('#plus-save-product')?.addEventListener('click',saveProduct);$('#plus-export-products')?.addEventListener('click',()=>downloadJSON(plus.products,`fitglass-products-${today()}.json`));
    $('#calendar-prev')?.addEventListener('click',()=>{plus.calendarView.setMonth(plus.calendarView.getMonth()-1);renderCalendar()});$('#calendar-next')?.addEventListener('click',()=>{plus.calendarView.setMonth(plus.calendarView.getMonth()+1);renderCalendar()});$('#calendar-today')?.addEventListener('click',()=>{plus.calendarView=new Date();renderCalendar()});
    $('#plus-timer-toggle')?.addEventListener('click',timerToggle);$('#plus-timer-reset')?.addEventListener('click',timerReset);$('#plus-timer-sound')?.addEventListener('click',()=>{plus.timer.sound=!plus.timer.sound;$('#plus-timer-sound').textContent=`Sonido: ${plus.timer.sound?'sí':'no'}`});
    $$('.timer-presets-plus button').forEach(b=>b.addEventListener('click',()=>{$$('.timer-presets-plus button').forEach(x=>x.classList.remove('active'));b.classList.add('active');timerSet(Number(b.dataset.plusMin))}));
    $('#presentation-toggle')?.addEventListener('click',async()=>{try{await document.documentElement.requestFullscreen();}catch{}document.body.classList.toggle('presentation-mode');plus.presentation=!plus.presentation});
  }

  function downloadJSON(data,filename){const a=document.createElement('a');const u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),800)}

  function improveBackground(){
    const bg=document.body.querySelector('.ambient') || document.body.querySelector('#ambient');
    if(!bg)return;
    bg.classList.add('fg-plus-background');
    const image=CFG.APP_IMAGE_URL||CFG.HERO_IMAGE_URL;
    if(image && !image.includes('REEMPLAZA')) bg.style.setProperty('--fg-image',`url("${image}")`);
  }

  function patchExistingCoach(){
    // Replaces the generic local Coach response when possible by showing a visible profile context strip.
    const host=$('#coachProfile');
    if(host && profile()){
      const p=profile(),m=metrics();
      host.insertAdjacentHTML('afterbegin',`<div class="coach-plus-banner"><b>Perfil detectado</b><span>${esc(p.name)} · ${esc(p.region)} · ${esc(goalText(p.goal))} · ${moneyless(m.calories)} kcal · ${moneyless(m.protein)} g proteína</span></div>`);
    }
  }

  async function init(){
    try { if(window.FG_FIREBASE?.ready) await window.FG_FIREBASE.ready; } catch {}
    loadPlus();
    ensureWaterByDay();
    // Pull shared product records into the local editable cache when available.
    try {
      if(window.FG_FIREBASE?.ready) {
        const cloud = await window.FG_FIREBASE.ready;
        if(cloud?.listProducts) {
          const products = await cloud.listProducts(80);
          if(Array.isArray(products) && products.length){
            const merged = new Map(plus.products.map(p=>[String(p.barcode||p.id),p]));
            products.forEach(p=>{ const key=String(p.barcode||p.id); if(!merged.has(key)) merged.set(key,p); });
            plus.products=[...merged.values()].slice(0,100);
            savePlus();
          }
        }
      }
    } catch {}
    injectNavigation();ensureMainContainer();bindPlusViewLinks();bindPlusEvents();improveBackground();
    setTimeout(()=>{renderPlusDashboard();renderOfficialSources();renderProducts();renderCalendar();updateTimerUI();patchExistingCoach();},900);
    setInterval(()=>{if(document.visibilityState==='visible'){renderPlusDashboard();updateTimerUI()}},15000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
