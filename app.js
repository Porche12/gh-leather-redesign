/* Core content and navigation remain available without JavaScript. */
const materialData = {
 leather: {note:'Одежда, сумки, обувь и аксессуары. А ещё — кожаная мебель и салоны автомобилей.',tailor:'Куртка, сумка, обувь или комплект аксессуаров — по вашей идее, из натуральной кожи. Возможен пошив из вашего материала.',restore:'Ремонт и восстановление кожаных изделий: одежды, сумок, обуви, мебели и автомобильных салонов. Покажите вещь мастеру, чтобы обсудить возможности.',alter:'Перекрой кожаной одежды, переделка сумок и аксессуаров. Обсудим новую форму и детали, сохранив характер материала.',finish:'Покраска кожаной одежды, обуви, сумок, мебели и автомобильных салонов. Подбор цвета и объём работ обсуждаются индивидуально.',title:'Покраска и уход'},
 fur: {note:'Шубы, дублёнки и меховые жилеты. Пошив, восстановление и новый взгляд на привычный силуэт.',tailor:'Индивидуальный пошив шуб, меховых жилетов и дублёнок. Идею, материал и особенности будущего изделия обсудите с мастером.',restore:'Ремонт и реставрация меховых изделий. Возможность восстановления зависит от состояния вещи — сначала покажите её мастеру.',alter:'Перекрой и переделка меховой одежды. Изменение фасона и посадки обсуждается после знакомства с изделием.',finish:'Покраска и чистка меховых изделий. Возможность обработки и подходящий способ уточняются индивидуально.',title:'Покраска и чистка'},
 textile: {note:'Одежда для повседневности и особых случаев. Пошив, подгонка по фигуре и ремонт.',tailor:'Индивидуальный пошив мужской, женской и детской одежды, платьев, костюмов и верхней одежды. Можно прийти со своим материалом.',restore:'Ремонт одежды и трикотажа, художественная штопка, замена молний. Расскажите о повреждении, чтобы уточнить возможный способ ремонта.',alter:'Подгонка по фигуре, изменение фасона и полный перекрой, в том числе свадебных, вечерних и выпускных платьев.',finish:'В ателье также можно обратиться за чисткой подушек и ремонтом швейных машин. Подробности и условия уточните у мастера.',title:'Дополнительные услуги'}
};
const materialButtons = [...document.querySelectorAll('[data-material]')];
materialButtons.forEach(button => button.addEventListener('click', () => {
 const data = materialData[button.dataset.material];
 materialButtons.forEach(item => {const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});
 document.querySelector('#material-note').textContent=data.note;
 ['tailor','restore','alter','finish'].forEach(key => document.querySelector('#copy-'+key).textContent=data[key]);
 document.querySelector('#finish-title').textContent=data.title;
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
   gsap.from('.hero-copy > .eyebrow, .hero h1, .hero-desc, .hero-copy > .button',{y:18,opacity:0,duration:.8,stagger:.1,ease:'power2.out',clearProps:'all'});
   gsap.from('.hero-visual',{opacity:0,y:22,duration:1,ease:'power2.out',clearProps:'all'});
  };
  if(document.querySelector('.sewing-intro'))document.addEventListener('atelier:intro-finished',revealHero,{once:true});
  else revealHero();
  document.querySelectorAll('.section-heading, .works-heading, .approach h2, .faq-section h2, .contact-top').forEach(element=>{
   gsap.from(element,{y:24,duration:.75,ease:'power2.out',clearProps:'all',scrollTrigger:{trigger:element,start:'top 92%',once:true}});
  });
  return ()=>document.removeEventListener('atelier:intro-finished',revealHero);
 });
}
