/* Original procedural leather studies, not representations of actual orders. */
const stage = document.querySelector('#model-stage');
const hint = document.querySelector('#model-hint');
document.querySelector('.replay-intro').addEventListener('click', () => window.playAtelierIntro?.());
let started = false;
async function startStudio() {
  if (started) return;
  started = true;
  try {
    const THREE = await import('./assets/lib/three.module.js');
    buildStudio(THREE);
  } catch (error) {
    stage.setAttribute('aria-busy', 'false');
    hint.textContent = 'Объёмный эскиз недоступен в этом браузере. Иллюстрация сохранена.';
    document.querySelectorAll('.studio-controls button:not(.replay-intro), .model-zoom input').forEach(el => {el.disabled=true;});
    console.info('GH-Leather: static illustration enabled.', error.message);
  }
}
new IntersectionObserver((entries, observer) => {
  if (entries.some(entry => entry.isIntersecting)) {startStudio();observer.disconnect();}
}, {rootMargin:'400px'}).observe(stage);

function buildStudio(T) {
  const renderer = new T.WebGLRenderer({antialias:true, alpha:true, powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth<600?1.25:1.75));
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.15;
  stage.append(renderer.domElement);
  const canvas=renderer.domElement;
  canvas.tabIndex=0;
  canvas.setAttribute('role','img');
  canvas.setAttribute('aria-label','Интерактивная кожаная сумка. Стрелки вращают модель, плюс и минус меняют масштаб.');
  canvas.setAttribute('aria-describedby','model-hint');
  const scene=new T.Scene();
  const camera=new T.PerspectiveCamera(33,1,.1,100);
  camera.position.set(0,.25,5.7);
  camera.lookAt(0,.02,0);
  scene.add(new T.HemisphereLight(0xfff4e2,0x6d5a49,2.1));
  function light(color,intensity,x,y,z){const l=new T.DirectionalLight(color,intensity);l.position.set(x,y,z);scene.add(l);}
  light(0xffecd4,3,-3,4,4);
  light(0xffffff,2,3,1,-2);
  light(0xe5edf3,.8,0,0,4);

  // A deterministic, neutral leather-grain texture: no external texture requests.
  const leatherCanvas=document.createElement('canvas');leatherCanvas.width=leatherCanvas.height=512;
  const ctx=leatherCanvas.getContext('2d');const pixels=ctx.createImageData(512,512);
  let seed=1937;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<pixels.data.length;i+=4){const v=168+Math.floor(random()*48);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;pixels.data[i+3]=255;}
  ctx.putImageData(pixels,0,0);ctx.strokeStyle='#716b642a';ctx.lineWidth=.7;
  for(let i=0;i<1800;i++){const x=random()*512,y=random()*512;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+random()*8-4,y+4,x+random()*12-6,y+10);ctx.stroke();}
  const grain=new T.CanvasTexture(leatherCanvas);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(3,3);
  const leatherMaterials=[];
  function leather(){const material=new T.MeshPhysicalMaterial({color:0x382820,roughness:.48,metalness:.02,clearcoat:.22,clearcoatRoughness:.48,bumpMap:grain,bumpScale:.018,roughnessMap:grain});leatherMaterials.push(material);return material;}
  const skin=leather();
  const metal=new T.MeshStandardMaterial({color:0xc7b18b,metalness:.86,roughness:.27});
  const thread=new T.LineDashedMaterial({color:0xb49a77,dashSize:.014,gapSize:.009,transparent:true,opacity:.68});
  function seam(group,points,closed=false){
    const p=points.map(v=>new T.Vector3(...v));if(closed)p.push(p[0]);
    const line=new T.Line(new T.BufferGeometry().setFromPoints(p),thread);line.computeLineDistances();group.add(line);return line;
  }
  function mesh(group,geometry,material,x=0,y=0,z=0){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);group.add(m);return m;}
  function box(group,w,h,d,mat,x,y,z){return mesh(group,new T.BoxGeometry(w,h,d),mat,x,y,z);}
  function roundedShape(x,y,w,h,r){
    const s=new T.Shape();s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
  }
  function extrude(group,shape,depth,mat,z=0,bevel=.04){
    const g=new T.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelSegments:8,bevelSize:bevel,bevelThickness:bevel,curveSegments:24});
    // Extruded bevels share positions but not vertices. Average their normals to
    // give leather a soft rolled edge rather than a machined, faceted profile.
    const positions=g.getAttribute('position'),normals=g.getAttribute('normal'),sums=new Map();
    const key=i=>[positions.getX(i),positions.getY(i),positions.getZ(i)].map(v=>Math.round(v*10000)).join(',');
    for(let i=0;i<positions.count;i++){const k=key(i),v=sums.get(k)||new T.Vector3();v.add(new T.Vector3(normals.getX(i),normals.getY(i),normals.getZ(i)));sums.set(k,v);}
    sums.forEach(v=>v.normalize());
    for(let i=0;i<positions.count;i++){const v=sums.get(key(i));normals.setXYZ(i,v.x,v.y,v.z);}
    return mesh(group,g,mat,0,0,z);
  }
  function pathShape(points){const s=new T.Shape();s.moveTo(...points[0]);points.slice(1).forEach(p=>s.lineTo(...p));s.closePath();return s;}
  function tube(group,points,r,mat){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(group,new T.TubeGeometry(curve,40,r,10,false),mat);}
  function ring(group,x,y,z,w,h){
    const outer=roundedShape(-w/2,-h/2,w,h,.025);
    const hole=new T.Path();const hw=w/2-.018,hh=h/2-.018;hole.moveTo(-hw,-hh);hole.lineTo(-hw,hh);hole.lineTo(hw,hh);hole.lineTo(hw,-hh);hole.closePath();outer.holes.push(hole);
    const m=extrude(group,outer,.018,metal,z,.008);m.position.x=x;m.position.y=y;return m;
  }

  function bag() {
    const g=new T.Group();
    extrude(g,roundedShape(-.76,-.66,1.52,1.14,.16),.53,skin,-.27,.085);
    const flap=pathShape([[-.72,.47],[.72,.47],[.69,-.02],[.54,-.19],[-.54,-.19],[-.69,-.02]]);
    extrude(g,flap,.045,skin,.36,.035);
    // Rounded side gussets and piping.
    for(const sign of [-1,1]){
      tube(g,[[sign*.66,-.60,.30],[sign*.74,-.48,.30],[sign*.76,.15,.30],[sign*.65,.43,.30]],.014,skin);
      tube(g,[[sign*.65,-.59,-.31],[sign*.74,-.48,-.31],[sign*.76,.15,-.31],[sign*.65,.43,-.31]],.014,skin);
      const strap=extrude(g,roundedShape(sign*.40-.05,-.48,.10,.83,.025),.025,skin,.43,.012);
      ring(g,sign*.40,-.28,.48,.16,.17);
      seam(g,[[sign*.40-.025,-.42,.48],[sign*.40-.025,.26,.48]]);
      seam(g,[[sign*.40+.025,-.42,.48],[sign*.40+.025,.26,.48]]);
      box(g,.11,.15,.025,metal,sign*.45,.40,.35);
      box(g,.11,.15,.025,metal,sign*.45,.40,-.35);
    }
    for(const z of [-.32,.35]){
      tube(g,[[-.45,.46,z],[-.40,.86,z],[-.27,1.06,z],[.27,1.06,z],[.40,.86,z],[.45,.46,z]],.043,skin);
      tube(g,[[-.44,.49,z+.038],[-.39,.86,z+.038],[-.26,1.035,z+.038],[.26,1.035,z+.038],[.39,.86,z+.038],[.44,.49,z+.038]],.004,metal);
    }
    seam(g,[[-.68,.39,.42],[.68,.39,.42],[.65,.00,.42],[.51,-.14,.42],[-.51,-.14,.42],[-.65,.00,.42]],true);
    seam(g,[[-.62,-.56,.36],[.62,-.56,.36]]);
    // Small maker's plaque is a material detail, not an invented product brand.
    box(g,.20,.07,.016,metal,0,.20,.425);
    g.position.y=-.18;
    return g;
  }

  const display=new T.Group();scene.add(display);
  display.add(bag());
  // A soft, procedural contact shadow, independent of expensive shadow maps.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;
  const sc=shadowCanvas.getContext('2d');const gradient=sc.createRadialGradient(64,64,3,64,64,64);gradient.addColorStop(0,'rgba(40,25,12,.25)');gradient.addColorStop(1,'rgba(40,25,12,0)');sc.fillStyle=gradient;sc.fillRect(0,0,128,128);
  const shadow=mesh(scene,new T.PlaneGeometry(3.1,1.4),new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}),0,-1.10,0);shadow.rotation.x=-Math.PI/2;
  let yaw=-.28,pitch=.035,scale=1,visible=true,frame=0;
  function draw(){frame=0;if(document.hidden||!visible)return;display.rotation.set(pitch,yaw,0);display.scale.setScalar(scale);renderer.render(scene,camera);}
  function requestDraw(){if(!frame&&!document.hidden&&visible)frame=requestAnimationFrame(draw);}
  function resize(){const r=stage.getBoundingClientRect();if(r.width<1)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.position.z=camera.aspect<.85?7:5.7;camera.updateProjectionMatrix();requestDraw();}
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)requestDraw();else{cancelAnimationFrame(frame);frame=0;}},{threshold:0}).observe(stage);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else requestDraw();});
  let pointer=null;
  canvas.addEventListener('pointerdown',e=>{pointer={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(e.pointerType==='mouse'||Math.abs(dx)>Math.abs(dy)){yaw+=dx*.009;pitch=Math.max(-.4,Math.min(.4,pitch+dy*.004));requestDraw();}pointer.x=e.clientX;pointer.y=e.clientY;});
  function release(){pointer=null;}canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
  canvas.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','=','Home'].includes(e.key))return;
    e.preventDefault();
    if(e.key==='ArrowLeft')yaw-=.18;if(e.key==='ArrowRight')yaw+=.18;
    if(e.key==='ArrowUp')pitch=Math.max(-.4,pitch-.08);if(e.key==='ArrowDown')pitch=Math.min(.4,pitch+.08);
    if(e.key==='+'||e.key==='=')scale=Math.min(1.35,scale+.05);if(e.key==='-')scale=Math.max(.8,scale-.05);
    if(e.key==='Home'){yaw=-.28;pitch=.035;scale=1;}
    document.querySelector('#model-scale').value=String(Math.round(scale*100));requestDraw();
  });
  document.querySelectorAll('[data-color]').forEach(button=>button.addEventListener('click',()=>{
    leatherMaterials.forEach(material=>material.color.set(button.dataset.color));
    document.querySelectorAll('[data-color]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
    document.querySelector('#color-name').textContent=button.getAttribute('aria-label');requestDraw();
  }));
  document.querySelectorAll('[data-turn]').forEach(button=>button.addEventListener('click',()=>{yaw+=Number(button.dataset.turn)*.35;requestDraw();}));
  document.querySelector('#model-scale').addEventListener('input',e=>{scale=Number(e.target.value)/100;requestDraw();});
  document.querySelector('#model-reset').addEventListener('click',()=>{yaw=-.28;pitch=.035;scale=1;document.querySelector('#model-scale').value='100';requestDraw();});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stage.classList.remove('is-ready');hint.textContent='3D приостановлено. Обновите страницу для восстановления.';});
  stage.classList.add('is-ready');stage.setAttribute('aria-busy','false');
  hint.textContent='Вращайте мышью или пальцем · Стрелки на клавиатуре меняют ракурс';
  resize();requestDraw();
}
