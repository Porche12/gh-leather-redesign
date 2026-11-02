/* Core content and navigation remain available without JavaScript. */
const materialData = {
 leather: {note:'Одежда · сумки · обувь · мебель',tailor:'Пошив одежды и аксессуаров по вашей идее.',restore:'Ремонт и восстановление кожи и аксессуаров.',alter:'Новый фасон и посадка по фигуре.',finish:'Обновление цвета кожи и аксессуаров.',title:'Покраска и уход'},
 fur: {note:'Шубы · дублёнки · меховые жилеты',tailor:'Пошив меховой одежды на заказ.',restore:'Ремонт и восстановление меховых изделий.',alter:'Изменение фасона и посадки меховой одежды.',finish:'Покраска и чистка меха. Детали уточните у мастера.',title:'Покраска и чистка'},
 textile: {note:'Одежда · платья · домашний текстиль',tailor:'Пошив одежды по вашим меркам и идее.',restore:'Ремонт одежды, трикотажа и замена молний.',alter:'Подгонка, изменение фасона и перекрой.',finish:'Чистка подушек и ремонт швейных машин.',title:'Дополнительные услуги'}
};
const materialButtons = [...document.querySelectorAll('[data-material]')];
materialButtons.forEach(button => button.addEventListener('click', () => {
 const data = materialData[button.dataset.material];
 materialButtons.forEach(item => {const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});
 document.querySelector('#material-note').textContent=data.note;
 ['tailor','restore','alter','finish'].forEach(key => document.querySelector('#copy-'+key).textContent=data[key]);
 document.querySelector('#finish-title').textContent=data.title;
}));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
function animateService(service){
 const body=service.querySelector('.service-body');
 if(!body || reducedMotion || !Element.prototype.animate)return;
 body.animate([{opacity:0,transform:'translateY(-8px)',clipPath:'inset(0 0 100% 0)'},{opacity:1,transform:'translateY(0)',clipPath:'inset(0 0 0 0)'}],{duration:420,easing:'cubic-bezier(.2,.7,.2,1)'});
}
document.querySelectorAll('.service').forEach(service=>service.addEventListener('toggle',()=>{if(service.open)animateService(service);}));
document.querySelectorAll('.service-shortcuts a').forEach(link=>link.addEventListener('click',event=>{
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
const gallery=document.querySelector('.lightbox');
const photos=[...document.querySelectorAll('.gallery-link')];
const titles=['Кожаный портфель','Сумка с контрастной отделкой','Фактурная кожаная сумка'];
let photoIndex=0;let galleryOpener=null;
function showPhoto(index){
 photoIndex=(index+photos.length)%photos.length;
 const image=document.querySelector('#gallery-image');
 image.src=photos[photoIndex].getAttribute('href');image.alt=photos[photoIndex].querySelector('img').alt;
 document.querySelector('#gallery-caption').textContent=titles[photoIndex];
 document.querySelector('#gallery-counter').textContent='Галерея ателье';
}
photos.forEach((link,index)=>link.addEventListener('click',event=>{
 if(typeof gallery.showModal!=='function')return;
 event.preventDefault();galleryOpener=link;showPhoto(index);gallery.showModal();document.querySelector('.close-gallery').focus();
}));
document.querySelector('.close-gallery').addEventListener('click',()=>gallery.close());
document.querySelector('.prev-photo').addEventListener('click',()=>showPhoto(photoIndex-1));
document.querySelector('.next-photo').addEventListener('click',()=>showPhoto(photoIndex+1));
gallery.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();showPhoto(photoIndex+1);}if(event.key==='ArrowLeft'){event.preventDefault();showPhoto(photoIndex-1);}});
gallery.addEventListener('click',event=>{if(event.target===gallery){const r=gallery.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)gallery.close();}});
gallery.addEventListener('close',()=>galleryOpener?.focus());
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
  return ()=>document.removeEventListener('atelier:intro-finished',revealHero);
 });
}
