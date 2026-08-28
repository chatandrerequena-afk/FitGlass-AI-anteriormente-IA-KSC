/* FitGlass AI — visual effects and interaction layer */
(function(){
  'use strict';
  const state={pointerX:.5,pointerY:.5,raf:0,visible:true};
  const q=s=>document.querySelector(s);
  function pointer(){document.addEventListener('pointermove',e=>{state.pointerX=e.clientX/Math.max(1,innerWidth);state.pointerY=e.clientY/Math.max(1,innerHeight);if(!state.raf)state.raf=requestAnimationFrame(applyPointer)} ,{passive:true});}
  function applyPointer(){state.raf=0;document.documentElement.style.setProperty('--mx',`${state.pointerX*100}%`);document.documentElement.style.setProperty('--my',`${state.pointerY*100}%`);const cards=document.querySelectorAll('.glass-card,.glass-panel');if(innerWidth>900)cards.forEach((el,i)=>{if(i>30)return;const dx=(state.pointerX-.5)*6,dy=(state.pointerY-.5)*5;el.style.setProperty('--px',`${dx}px`);el.style.setProperty('--py',`${dy}px`);});}
  function reveal(){const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('revealed')}),{threshold:.08});document.querySelectorAll('.reveal-on-scroll').forEach(x=>obs.observe(x));}
  function glassTilt(selector='.glass-card'){document.addEventListener('pointermove',e=>{const target=e.target.closest(selector);if(!target||innerWidth<1000)return;const r=target.getBoundingClientRect();const px=(e.clientX-r.left)/Math.max(1,r.width)-.5;const py=(e.clientY-r.top)/Math.max(1,r.height)-.5;target.style.transform=`translate3d(${px*1.6}px,${py*1.6}px,0)`;},{passive:true});document.addEventListener('pointerout',e=>{const target=e.target.closest(selector);if(target)target.style.transform='';},{passive:true});}
  function installButtonRipple(){document.addEventListener('click',e=>{const btn=e.target.closest('button,.glass-button,.primary-button,.secondary-button');if(!btn)return;const r=btn.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;const node=document.createElement('span');node.className='fg-ripple';node.style.left=x+'px';node.style.top=y+'px';btn.appendChild(node);setTimeout(()=>node.remove(),650)},{passive:true});}
  function visibility(){document.addEventListener('visibilitychange',()=>{state.visible=!document.hidden;document.documentElement.classList.toggle('reduced-motion',!state.visible);});}
  function ambientClock(){let t=0;const loop=()=>{if(state.visible){t+=.0015;document.documentElement.style.setProperty('--ambient-shift',`${Math.sin(t)*10}px`);}requestAnimationFrame(loop)};loop();}
  function install(){pointer();reveal();glassTilt();installButtonRipple();visibility();ambientClock();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  window.FG_EFFECTS={state,applyPointer,install};
})();
