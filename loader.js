/* A tear in woven cloth is stitched shut in under two seconds. */
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let active=false;
 function playIntro(force=false){
  if(active||reduced.matches)return;
  try{if(!force&&sessionStorage.getItem('gh-sewn-intro-v2'))return;}catch{}
  active=true;
  const opener=force?document.activeElement:null;
  const intro=document.createElement('div');intro.className='sewing-intro';
  intro.setAttribute('role','dialog');intro.setAttribute('aria-modal','true');
  intro.setAttribute('aria-label','Игла быстро зашивает разрыв в ткани и открывает сайт');
  intro.innerHTML=`<div class="cloth-grain" aria-hidden="true"></div>
   <div class="sewing-brand" aria-hidden="true"><span>gh</span>GH-LEATHER<small>АТЕЛЬЕ БЕРЕЖНЫХ ПЕРЕМЕН</small></div>
   <svg class="sewing-scene" viewBox="0 0 1000 600" aria-hidden="true">
    <defs>
     <linearGradient id="tear-depth" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#15120e"/><stop offset=".55" stop-color="#2b241b"/><stop offset="1" stop-color="#443a2b"/></linearGradient>
     <linearGradient id="needle-steel" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#433e35"/><stop offset=".35" stop-color="#faf7ee"/><stop offset=".65" stop-color="#a39d8e"/><stop offset="1" stop-color="#3e3b34"/></linearGradient>
     <filter id="thread-shadow" x="-30%" y="-50%" width="160%" height="200%"><feDropShadow dx="0" dy="1.5" stdDeviation="1" flood-color="#302116" flood-opacity=".45"/></filter>
    </defs>
    <g class="cloth-wrinkles" fill="none" stroke-linecap="round">
     <path d="M100 170Q290 207 370 285M900 170Q710 207 630 285M130 440Q300 379 375 320M870 440Q700 379 625 320" stroke="#5b4c3910" stroke-width="15"/>
     <path d="M100 160Q290 197 370 280M900 160Q710 197 630 280M130 432Q300 372 375 315M870 432Q700 372 625 315" stroke="#fff8e522" stroke-width="6"/>
    </g>
    <path id="cloth-hole-shadow" fill="#3d2e1c" opacity=".15"/>
    <path id="cloth-hole" fill="url(#tear-depth)"/>
    <path id="cloth-upper-edge" fill="none" stroke="#e0d3bb" stroke-width="3"/>
    <path id="cloth-lower-edge" fill="none" stroke="#66563f" stroke-width="2" opacity=".55"/>
    <g id="cloth-frays" stroke="#d4c5a8" fill="none" stroke-width="1"/>
    <g id="cloth-stitches" fill="none" stroke="#713e3b" stroke-width="2.5" stroke-linecap="round" filter="url(#thread-shadow)"/>
    <path id="working-thread" fill="none" stroke="#713e3b" stroke-width="1.8" stroke-linecap="round"/>
    <g id="sewing-needle"><path d="M-66 -3Q-77 0-66 3L45 2L66 0L45-2Z" fill="url(#needle-steel)" stroke="#625d50" stroke-width=".5"/><ellipse cx="-62" cy="0" rx="5" ry="1.1" fill="#8c7c62"/></g>
   </svg>
   <div class="sewing-caption"><span>Любимым вещам — новая история.</span><small>СОХРАНЯЕМ ТО, ЧТО ВЫ ЛЮБИТЕ</small></div>
   <button class="intro-skip" type="button">Пропустить <span aria-hidden="true">↗</span></button>`;
  document.body.appendChild(intro);document.body.classList.add('intro-active');
  const svgNS='http://www.w3.org/2000/svg';
  const hole=intro.querySelector('#cloth-hole'),shadow=intro.querySelector('#cloth-hole-shadow');
  const upper=intro.querySelector('#cloth-upper-edge'),lower=intro.querySelector('#cloth-lower-edge');
  const needle=intro.querySelector('#sewing-needle'),workingThread=intro.querySelector('#working-thread');
  const stitches=Array.from({length:22},(_,i)=>{const path=document.createElementNS(svgNS,'path');intro.querySelector('#cloth-stitches').append(path);return{path,x:235+i*25};});
  const frays=Array.from({length:54},(_,i)=>{const path=document.createElementNS(svgNS,'path');intro.querySelector('#cloth-frays').append(path);return{path,x:233+(i%27)*20,side:i<27?-1:1,index:i};});
  const baseline=x=>300+Math.sin((x-225)*.017)*5+Math.sin(x*.055)*1.4;
  const span=x=>Math.pow(Math.max(0,Math.sin((x-225)/550*Math.PI)),.65);
  function halfGap(x,sewnX){const closing=Math.max(0,Math.min(1,(x-sewnX+16)/45));return span(x)*(1.5+closing*(37+Math.sin(x*.091)*5+Math.sin(x*.21)*2));}
  let frame=0,finished=false;const blocked=[];
  function blockPage(){if(finished)return;document.querySelectorAll('body > header, body > main, body > footer, body > .skip').forEach(el=>{el.inert=true;blocked.push(el);});intro.querySelector('button').focus({preventScroll:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',blockPage,{once:true});else blockPage();
  function finish(){
   if(finished)return;finished=true;active=false;cancelAnimationFrame(frame);clearTimeout(safety);
   const hadFocus=intro.contains(document.activeElement);
   intro.remove();document.body.classList.remove('intro-active');blocked.forEach(el=>{el.inert=false;});
   document.removeEventListener('keydown',onKey);reduced.removeEventListener('change',onPreference);
   try{sessionStorage.setItem('gh-sewn-intro-v2','1');}catch{}
   if(hadFocus)(opener||document.querySelector('.brand'))?.focus({preventScroll:true});
   document.dispatchEvent(new CustomEvent('atelier:intro-finished'));
  }
  function onKey(e){if(e.key==='Escape')finish();if(e.key==='Tab'){e.preventDefault();intro.querySelector('button').focus();}}
  function onPreference(){if(reduced.matches)finish();}
  const safety=setTimeout(finish,3500);
  document.addEventListener('keydown',onKey);reduced.addEventListener('change',onPreference);
  intro.querySelector('button').addEventListener('click',finish);
  const began=performance.now();
  function tick(now){
   const time=now-began,progress=Math.max(0,Math.min(1,(time-180)/1160)),sewnX=215+progress*590;
   const top=[],bottom=[];
   for(let i=0;i<=70;i++){const x=225+i/70*550,y=baseline(x),gap=halfGap(x,sewnX);top.push(`${x.toFixed(1)} ${(y-gap).toFixed(1)}`);bottom.push(`${x.toFixed(1)} ${(y+gap).toFixed(1)}`);}
   const d=`M${top.join('L')}L${bottom.slice().reverse().join('L')}Z`;
   hole.setAttribute('d',d);shadow.setAttribute('d',d);shadow.setAttribute('transform','translate(0 4)');
   upper.setAttribute('d',`M${top.join('L')}`);lower.setAttribute('d',`M${bottom.join('L')}`);
   frays.forEach(({path,x,side,index})=>{const y=baseline(x)+side*halfGap(x,sewnX),length=5+(index%5)*1.6;path.setAttribute('d',`M${x} ${y}q${index%2?5:-5} ${side*-3} ${index%2?3:-3} ${-side*length}`);path.style.opacity=String(Math.max(.12,Math.min(.8,(x-sewnX)/60)));});
   stitches.forEach(({path,x})=>{const completion=Math.max(0,Math.min(1,(sewnX-x)/25)),y=baseline(x),height=6+(1-completion)*11;path.setAttribute('d',`M${x-5} ${y-height}Q${x+4} ${y-1} ${x+7} ${y+height}`);path.style.opacity=String(completion);});
   const phase=progress*22*Math.PI*2,nx=Math.max(225,Math.min(775,sewnX+12)),ny=baseline(nx)+Math.sin(phase)*14;
   needle.setAttribute('transform',`translate(${nx} ${ny}) rotate(${-25+Math.cos(phase)*35})`);needle.style.opacity=String(Math.min(1,(1-progress)*8));
   const lastX=Math.max(225,nx-36),lastY=baseline(lastX);
   workingThread.setAttribute('d',`M${lastX} ${lastY-6}Q${nx-70} ${ny-48} ${nx-54} ${ny+20}`);workingThread.style.opacity=needle.style.opacity;
   const exit=Math.max(0,Math.min(1,(time-1510)/360));intro.style.opacity=String(1-exit*exit);
   intro.querySelector('.sewing-scene').style.transform=`translate(-50%,-50%) scale(${1+exit*.06})`;
   if(time>=1870)finish();else frame=requestAnimationFrame(tick);
  }
  frame=requestAnimationFrame(tick);
 }
 window.playAtelierIntro=()=>playIntro(true);
 playIntro();
})();
