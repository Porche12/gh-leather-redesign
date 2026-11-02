/* A short, skippable jacket opening. No dependency on images, WebGL or GSAP. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false;
  function openJacket(force = false) {
    if (active || reduced.matches) return;
    try { if (!force && sessionStorage.getItem('gh-jacket-opened')) return; } catch {}
    active = true;
    const opener = force ? document.activeElement : null;
    const intro = document.createElement('div');
    intro.className = 'jacket-intro';
    intro.setAttribute('role', 'dialog');
    intro.setAttribute('aria-modal', 'true');
    intro.setAttribute('aria-label', 'Кожаная куртка расстёгивается и открывает сайт');
    intro.innerHTML = `<svg class="jacket-scene" viewBox="0 0 1600 1000" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="jacket-tone" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="#211b18"/><stop offset=".28" stop-color="#3b3029"/><stop offset=".5" stop-color="#1b1715"/><stop offset=".75" stop-color="#49392e"/><stop offset="1" stop-color="#221c18"/></linearGradient>
        <linearGradient id="lapel-tone" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#695345"/><stop offset=".3" stop-color="#362a23"/><stop offset=".8" stop-color="#201915"/><stop offset="1" stop-color="#44362c"/></linearGradient>
        <linearGradient id="zip-metal"><stop stop-color="#7e6c4c"/><stop offset=".35" stop-color="#e7d3a5"/><stop offset=".65" stop-color="#baa477"/><stop offset="1" stop-color="#6a5a41"/></linearGradient>
        <filter id="leather-grain"><feTurbulence type="fractalNoise" baseFrequency=".62" numOctaves="3" seed="8" result="noise"/><feColorMatrix in="noise" type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".23"/></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light"/></filter>
        <clipPath id="left-jacket-clip"><path id="left-cut" d="M0 0H800V1000H0Z"/></clipPath>
        <clipPath id="right-jacket-clip"><path id="right-cut" d="M800 0H1600V1000H800Z"/></clipPath>
      </defs>
      <g class="jacket-left" clip-path="url(#left-jacket-clip)">
        <rect width="1600" height="1000" fill="url(#jacket-tone)" filter="url(#leather-grain)"/>
        <path d="M520 -20L800 155 653 421 462 235Z" fill="url(#lapel-tone)" stroke="#77614b" stroke-width="2"/>
        <path d="M531 0L779 160 650 399 481 231Z" fill="none" stroke="#9d866c" opacity=".55" stroke-dasharray="3 6"/>
        <path d="M0 220L288 150 388 1000M170 515L448 660" fill="none" stroke="#0e0c0b" stroke-width="13"/>
        <path d="M0 213L280 147 379 1000M169 505L456 655M174 529L440 673" fill="none" stroke="#9a7e61" stroke-width="1.2" stroke-dasharray="3 6" opacity=".6"/>
        <path d="M175 515L447 660" stroke="url(#zip-metal)" stroke-width="5" stroke-dasharray="3 4"/>
        <circle cx="650" cy="350" r="10" fill="url(#zip-metal)"/><circle cx="650" cy="350" r="5" fill="#43352a"/>
      </g>
      <g class="jacket-right" clip-path="url(#right-jacket-clip)">
        <rect width="1600" height="1000" fill="url(#jacket-tone)" filter="url(#leather-grain)"/>
        <path d="M1080 -20L800 155 947 421 1138 235Z" fill="url(#lapel-tone)" stroke="#77614b" stroke-width="2"/>
        <path d="M1069 0L821 160 950 399 1119 231Z" fill="none" stroke="#9d866c" opacity=".55" stroke-dasharray="3 6"/>
        <path d="M1600 220L1312 150 1212 1000M1152 660L1430 515" fill="none" stroke="#0e0c0b" stroke-width="13"/>
        <path d="M1600 213L1320 147 1221 1000M1144 655L1431 505M1160 673L1426 529" fill="none" stroke="#9a7e61" stroke-width="1.2" stroke-dasharray="3 6" opacity=".6"/>
        <path d="M1153 660L1425 515" stroke="url(#zip-metal)" stroke-width="5" stroke-dasharray="3 4"/>
        <circle cx="950" cy="350" r="10" fill="url(#zip-metal)"/><circle cx="950" cy="350" r="5" fill="#43352a"/>
      </g>
      <g id="zip-teeth" fill="url(#zip-metal)"></g>
      <g id="zip-pull"><rect x="781" y="-18" width="38" height="50" rx="8" fill="url(#zip-metal)" stroke="#352a20" stroke-width="2"/><path d="M787 19H813L819 85Q800 100 781 85Z" fill="url(#zip-metal)" stroke="#5c4a31" stroke-width="2"/><rect x="790" y="35" width="20" height="42" rx="7" fill="#201914"/></g>
    </svg><div class="intro-label"><span>GH-LEATHER</span><small>ОТКРЫВАЕМ НОВУЮ ИСТОРИЮ</small></div><button class="intro-skip" type="button">Пропустить <span aria-hidden="true">↗</span></button>`;
    document.body.appendChild(intro);
    document.body.classList.add('intro-active');
    const left = intro.querySelector('#left-cut');
    const right = intro.querySelector('#right-cut');
    const teeth = intro.querySelector('#zip-teeth');
    const pull = intro.querySelector('#zip-pull');
    const rows = Array.from({length: 73}, (_, i) => {
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const r = l.cloneNode();
      [l,r].forEach(n=>{n.setAttribute('width','10');n.setAttribute('height','7');n.setAttribute('rx','1');teeth.append(n);});
      return {l,r,y:i*14};
    });
    let frame = 0, finished = false;
    const blocked = [];
    function blockPage() {
      if (finished) return;
      document.querySelectorAll('body > header, body > main, body > footer').forEach(el=>{el.inert=true;blocked.push(el);});
      intro.querySelector('button').focus({preventScroll:true});
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', blockPage, {once:true});
    else blockPage();
    function finish() {
      if (finished) return;
      finished = true;active=false;cancelAnimationFrame(frame);clearTimeout(safety);
      const hadFocus=intro.contains(document.activeElement);
      intro.remove();document.body.classList.remove('intro-active');blocked.forEach(el=>{el.inert=false;});
      document.removeEventListener('keydown', onKey);
      reduced.removeEventListener('change',onPreference);
      try{sessionStorage.setItem('gh-jacket-opened','1');}catch{}
      if(hadFocus)(opener || document.querySelector('.brand'))?.focus({preventScroll:true});
      document.dispatchEvent(new CustomEvent('atelier:intro-finished'));
    }
    function onKey(e){if(e.key==='Escape')finish();if(e.key==='Tab'){e.preventDefault();intro.querySelector('button').focus();}}
    function onPreference(){if(reduced.matches)finish();}
    const safety=setTimeout(finish,4500);
    document.addEventListener('keydown',onKey);reduced.addEventListener('change',onPreference);
    intro.querySelector('button').addEventListener('click',finish);
    const began=performance.now();
    function tick(now) {
      const time=now-began;
      const p=Math.min(1,Math.max(0,(time-250)/1650));
      const eased=p*p*(3-2*p);
      const zipY=35+eased*1000;
      const gap=12+Math.pow(eased,.8)*660;
      const exit=Math.min(1,Math.max(0,(time-1750)/700));
      left.setAttribute('d',`M0 0H${800-gap}L800 ${zipY}V1000H0Z`);
      right.setAttribute('d',`M${800+gap} 0H1600V1000H800V${zipY}Z`);
      rows.forEach(({l,r,y})=>{
        const spread=y<zipY?gap*(1-y/zipY):0;
        l.setAttribute('x',790-spread);l.setAttribute('y',y);
        r.setAttribute('x',800+spread);r.setAttribute('y',y+5);
      });
      pull.setAttribute('transform',`translate(0 ${zipY-15})`);
      intro.querySelector('.jacket-scene').style.transform=`scale(${1+exit*.12})`;
      intro.style.opacity=String(1-Math.pow(exit,2));
      intro.querySelector('.intro-label').style.opacity=String(Math.max(0,1-p*3));
      if(time>=2450)finish();else frame=requestAnimationFrame(tick);
    }
    frame=requestAnimationFrame(tick);
  }
  window.openAtelierJacket=()=>openJacket(true);
  openJacket();
})();
