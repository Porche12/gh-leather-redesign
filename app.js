/* Core content and navigation remain available without JavaScript. */
const materialData = {
 leather: {note:'Одежда · сумки · обувь · мебель',tailor:'Пошив одежды и аксессуаров по вашей идее.',restore:'Ремонт и восстановление кожи и аксессуаров.',alter:'Новый фасон и посадка по фигуре.',finish:'Обновление цвета кожи и аксессуаров.',title:'Покраска и уход',image:'assets/banner-leather.webp',alt:'Модель в чёрной кожаной куртке',kicker:'КОЖА · ИНДИВИДУАЛЬНЫЙ ПОШИВ',bannerTitle:'Силуэт с характером.',service:'#service-tailor',cta:'Индивидуальный пошив'},
 fur: {note:'Шубы · дублёнки · меховые жилеты',tailor:'Пошив меховой одежды на заказ.',restore:'Ремонт и восстановление меховых изделий.',alter:'Изменение фасона и посадки меховой одежды.',finish:'Покраска и чистка меха. Детали уточните у мастера.',title:'Покраска и чистка',image:'assets/banner-coat.webp',alt:'Фактурные пальто и куртки на вешалках',kicker:'МЕХ · ВЕРХНЯЯ ОДЕЖДА',bannerTitle:'Любимый силуэт надолго.',service:'#service-repair',cta:'Ремонт и реставрация'},
 textile: {note:'Одежда · платья · домашний текстиль',tailor:'Пошив одежды по вашим меркам и идее.',restore:'Ремонт одежды, трикотажа и замена молний.',alter:'Подгонка, изменение фасона и перекрой.',finish:'Чистка подушек и ремонт швейных машин.',title:'Дополнительные услуги',image:'assets/banner-workshop.webp',alt:'Портниха работает за швейной машиной в светлой мастерской',kicker:'ТЕКСТИЛЬ · ТОЧНАЯ ПОСАДКА',bannerTitle:'Вещь по вашим меркам.',service:'#service-alter',cta:'Перекрой и посадка'}
};
const materialButtons = [...document.querySelectorAll('[data-material]')];
materialButtons.forEach(button => button.addEventListener('click', () => {
 const data = materialData[button.dataset.material];
 materialButtons.forEach(item => {const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});
 document.querySelector('#material-note').textContent=data.note;
 ['tailor','restore','alter','finish'].forEach(key => document.querySelector('#copy-'+key).textContent=data[key]);
 document.querySelector('#finish-title').textContent=data.title;
 const hero=document.querySelector('#hero-materials'),image=document.querySelector('#hero-material-image'),copy=document.querySelector('.hero-material-copy');
 if(hero && image){
  hero.dataset.activeMaterial=button.dataset.material;
  document.querySelector('#hero-material-kicker').textContent=data.kicker;
  document.querySelector('#hero-material-title').textContent=data.bannerTitle;
  const link=document.querySelector('#hero-material-link');link.href=data.service;link.firstChild.textContent=data.cta+' ';
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){image.src=data.image;image.alt=data.alt;}
  else{
   image.classList.add('is-changing');copy.classList.add('is-changing');
   setTimeout(()=>{image.src=data.image;image.alt=data.alt;image.onload=()=>image.classList.remove('is-changing');if(image.complete)image.classList.remove('is-changing');copy.classList.remove('is-changing');},140);
  }
 }
}));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
function animateService(service){
 const body=service.querySelector('.service-body');
 if(!body || reducedMotion || !Element.prototype.animate)return;
 body.animate([{opacity:0,transform:'translateY(-8px)',clipPath:'inset(0 0 100% 0)'},{opacity:1,transform:'translateY(0)',clipPath:'inset(0 0 0 0)'}],{duration:420,easing:'cubic-bezier(.2,.7,.2,1)'});
}
document.querySelectorAll('.service').forEach(service=>service.addEventListener('toggle',()=>{if(service.open)animateService(service);}));
document.querySelectorAll('.service-shortcuts a, .service-jump').forEach(link=>link.addEventListener('click',event=>{
 const service=document.querySelector(link.getAttribute('href'));
 if(!service)return;
 event.preventDefault();
 document.querySelectorAll('.service').forEach(item=>{if(item!==service)item.open=false;});
 service.open=true;
 history.pushState(null,'',link.getAttribute('href'));
 service.scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'center'});
 service.querySelector('summary').focus({preventScroll:true});
}));
const menu=document.querySelector('.mobile-menu');
menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menu.open=false;}));
document.addEventListener('keydown',event=>{if(event.key==='Escape' && menu.open){menu.open=false;menu.querySelector('summary').focus();}});
// Local GSAP from the toolkit. Never require animation for access to content.
if(window.gsap && window.ScrollTrigger){
 gsap.registerPlugin(ScrollTrigger);
 const motion=gsap.matchMedia();
 motion.add('(prefers-reduced-motion: no-preference)',()=>{
  const revealHero=()=>{
   gsap.from('.hero-copy > .eyebrow, .hero h1, .hero-desc, .service-shortcuts a',{y:18,opacity:0,duration:.75,stagger:.08,ease:'power2.out',clearProps:'all'});
   gsap.from('.hero-visual',{opacity:0,y:22,duration:1,ease:'power2.out',clearProps:'all'});
  };
  if(document.querySelector('.sewing-intro'))document.addEventListener('atelier:intro-finished',revealHero,{once:true});
  else revealHero();
  document.querySelectorAll('.section-heading, .works-heading, .approach h2, .faq-section h2, .contact-top').forEach(element=>{
   gsap.from(element,{y:24,duration:.75,ease:'power2.out',clearProps:'all',scrollTrigger:{trigger:element,start:'top 92%',once:true}});
  });
  gsap.from('.service summary',{x:22,opacity:0,duration:.65,stagger:.09,ease:'power2.out',clearProps:'all',scrollTrigger:{trigger:'.service-list',start:'top 88%',once:true}});
  gsap.from('.style-banner',{y:34,opacity:0,duration:.8,stagger:.12,ease:'power2.out',clearProps:'all',scrollTrigger:{trigger:'.mood-banners',start:'top 88%',once:true}});
  gsap.from('.style-banner img',{scale:1.13,duration:1.2,stagger:.12,ease:'power2.out',clearProps:'all',scrollTrigger:{trigger:'.mood-banners',start:'top 88%',once:true}});
  return ()=>document.removeEventListener('atelier:intro-finished',revealHero);
 });
}
