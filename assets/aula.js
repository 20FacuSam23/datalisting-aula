const courses=[
{tone:"warm",icon:"⌨",tag:"EN CURSO",title:"Primeros pasos con la computadora",desc:"Mouse, teclado, ventanas y archivos sin apuro.",progress:68,lessons:"8 de 12 clases"},
{tone:"blue",icon:"◎",tag:"EN CURSO",title:"Internet con confianza",desc:"Navegación, búsquedas y seguridad en línea.",progress:42,lessons:"5 de 12 clases"},
{tone:"green",icon:"▣",tag:"NUEVO",title:"Tu celular, más fácil",desc:"WhatsApp, fotos, contactos y funciones útiles.",progress:8,lessons:"1 de 10 clases"},
{tone:"warm",icon:"✉",tag:"PRÓXIMAMENTE",title:"Correo electrónico",desc:"Enviar, recibir y organizar mensajes con seguridad.",progress:0,lessons:"8 clases"},
{tone:"blue",icon:"☁",tag:"PRÓXIMAMENTE",title:"Fotos y archivos",desc:"Guardar, encontrar y compartir tus recuerdos.",progress:0,lessons:"9 clases"},
{tone:"green",icon:"✓",tag:"PRÓXIMAMENTE",title:"Trámites digitales",desc:"Claves, turnos y gestiones cotidianas.",progress:0,lessons:"10 clases"}];
const card=c=>`<article class="course ${c.tone}"><span class="course-icon">${c.icon}</span><span class="tag">${c.tag}</span><h3>${c.title}</h3><p>${c.desc}</p><div class="progress"><i style="width:${c.progress}%"></i></div><small>${c.lessons}</small></article>`;
document.querySelector("#homeCourses").innerHTML=courses.slice(0,3).map(card).join("");
document.querySelector("#allCourses").innerHTML=courses.map(card).join("");
function show(view){document.querySelectorAll(".view").forEach(x=>x.classList.toggle("hidden",x.dataset.section!==view));document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.view===view));window.scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll("[data-view]").forEach(x=>x.addEventListener("click",e=>{e.preventDefault();show(x.dataset.view)}));
document.querySelector(".lesson").addEventListener("click",()=>alert("Esta pantalla se conectará con las clases reales del backend protegido."));
document.querySelectorAll(".help aside button").forEach(x=>x.addEventListener("click",()=>alert("Esta opción se conectará con la ayuda guiada y el contacto con el docente.")));