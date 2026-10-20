/* Aula compartida. Contenido y permisos siempre se resuelven en Datalisting. */
const config=window.DATALISTING_AULA_CONFIG||{};
const apiBaseUrl=String(config.apiBaseUrl||'').replace(/\/$/,'');
const selectedPortal=new URLSearchParams(location.search).get('portal');
const organizationSlug=String(selectedPortal&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(selectedPortal)?selectedPortal:(config.portalSlug||config.organizationSlug||'aula-generica'));
const prospect=!!config.portalSlug; 
const base=`/${prospect?'portales':'education'}/${encodeURIComponent(organizationSlug)}`;window.aulaApiPath=base;
const tokenKey=`datalisting_aula_token_${organizationSlug}`;
let currentUser=null,currentCourse=null,courseList=[],management=null,brand={name:config.brandName||'Datalisting Aula',nautical:!!config.publicLanding,public_preview:!!config.publicLanding};
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const token=()=>sessionStorage.getItem(tokenKey);
async function apiFetch(path,options={}){const headers=new Headers(options.headers||{});headers.set('Accept','application/json');if(token())headers.set('Authorization','Bearer '+token());return fetch(apiBaseUrl+path,{...options,headers,cache:'no-store'});}
window.aulaApiFetch=apiFetch;window.aulaOrganization=organizationSlug;
async function request(path,options={}){if(window.aulaStudentPreview&&!['GET','HEAD'].includes(String(options.method||'GET').toUpperCase()))throw Error('La vista previa es de solo lectura. Volvé a administración para guardar cambios.');if(options.body&&!(options.body instanceof FormData)){options.headers={...options.headers,'Content-Type':'application/json'};options.body=JSON.stringify(options.body);}const r=await apiFetch(path,options);const d=await r.json().catch(()=>({}));if(!r.ok){
 if(r.status===429){
  const retryHeader=Number(r.headers.get('Retry-After')),retryJson=Number(d.retry_after);
  const seconds=Math.min(600,Math.max(1,Math.ceil(retryHeader>0?retryHeader:retryJson>0?retryJson:60)));
  const error=new Error('Hay un bloqueo temporal de seguridad. Esperá '+seconds+' segundos antes de intentar de nuevo.');
  error.status=429;error.retryAfter=seconds;throw error;
 }
 if(r.status===401){sessionStorage.removeItem(tokenKey);setAccountUI(null);openAuth();}
 const error=new Error(Object.values(d.errors||{}).flat()[0]||d.message||`No se pudo completar la operación (${r.status}).`);
 error.status=r.status;throw error;
}return d;}
function message(text,error=false){const box=$('portalMessage');box.textContent=text;box.className=error?'portal-message error':'portal-message';box.hidden=false;}
function run(fn){return async e=>{if(e?.type==='submit')e.preventDefault();const button=e?.submitter;if(button)button.disabled=true;const event=e?{currentTarget:e.currentTarget,target:e.target,submitter:e.submitter,type:e.type,preventDefault:()=>e.preventDefault()}:undefined;try{await fn(event);}catch(error){message(error.message,true);}finally{if(button)button.disabled=Boolean(button.closest('#loginForm')&&Date.now()<loginCooldownUntil);}};}
function show(view){if(config.publicLanding&&!currentUser&&['curso','cuenta'].includes(view)){openAuth();return;}if(view==='administracion'&&!currentUser?.can_manage)return;if(view==='meteorologia'&&!brand.nautical)return;document.body.dataset.aulaPrivate=['curso','administracion','cuenta'].includes(view)?'yes':'';document.querySelectorAll('.view').forEach(e=>e.classList.toggle('hidden',e.dataset.section!==view));document.querySelectorAll('.nav').forEach(e=>e.classList.toggle('active',e.dataset.view===view));window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
function setAccountUI(user){currentUser=user;document.body.classList.toggle('auth-locked',!user&&!brand.public_preview&&!config.publicLanding);document.querySelectorAll('[data-private-stats]').forEach(e=>e.hidden=!user);$('profileName').textContent=user?.name||'Ingresar';$('profileAvatar').textContent=user?.name?.slice(0,1)||'?';$('profileRole').textContent=user?.can_manage?'Administrador del aula':'Alumno';for(const id of ['accountProfile','accountCourses','accountLogout'])$(id)?.classList.toggle('hidden',!user);document.querySelectorAll('[data-manager-only]').forEach(e=>e.hidden=!user?.can_manage);$('privacyWatermark').textContent=user?`${brand.name} · ${user.name} · ${user.email}`:'';}
function openAuth(){$('authBackdrop').classList.remove('hidden');$('loginEmail').focus();}
function closeAuth(){$('authBackdrop').classList.add('hidden');$('authError').classList.add('hidden');}
async function loadBrand(){try{const d=await request(base+'/brand');brand={...brand,...d};if(config.publicLanding){brand.public_preview=true;brand.nautical=true;}window.dispatchEvent(new CustomEvent('aula-brand',{detail:brand}));if(d.hosted_url&&location.hostname.endsWith('github.io')){location.replace(d.hosted_url);return;}}catch{message('No se pudo cargar la identidad desde Datalisting. Se conserva la presentación local.',true);}document.title=brand.name+' · Aula';document.querySelectorAll('[data-brand-name]').forEach(e=>e.textContent=brand.name);if(/^#[\da-f]{6}$/i.test(brand.color||''))document.documentElement.style.setProperty('--tenant-color',brand.color);if(brand.logo_url&&/^https:\/\//.test(brand.logo_url)){$('tenantLogo').src=brand.logo_url;$('tenantLogo').hidden=false;}document.querySelectorAll('[data-nautical-only]').forEach(e=>e.hidden=!brand.nautical);if(brand.instagram&&/^https:\/\/www\.instagram\.com\//.test(brand.instagram))document.querySelectorAll('[data-instagram]').forEach(e=>e.href=brand.instagram);}
function renderCourses(list){courseList=list;const card=(c,i)=>`<button type="button" class="course ${['warm','blue','green'][i%3]}" data-course="${esc(c.slug)}"><span class="course-icon">${['⌨','≈','▣'][i%3]}</span><span class="tag">${c.progress_percent===100?'COMPLETADO':'DISPONIBLE'}</span><h3>${esc(c.name)}</h3><p>${esc(c.description||'Abrí el curso para ver sus clases y materiales.')}</p><progress value="${Number(c.progress_percent)||0}" max="100">${Number(c.progress_percent)||0}%</progress><small>${c.lessons_count} ${c.lessons_count===1?'clase':'clases'} · ${Number(c.progress_percent)||0}% completado</small></button>`;
 if(config.publicLanding&&!currentUser){const publicCard=c=>`<button class="course blue" type="button" data-course="${esc(c.slug)}"><span class="tag">FORMACIÓN · ACCESO CON CUENTA</span><h3>${esc(c.name)}</h3><p>${esc(c.description||'Conocé la propuesta con la escuela.')}</p><strong>Ingresar al aula →</strong></button>`;$('homeCourses').innerHTML=list.map(publicCard).join('')||'<article class="portal-card"><h3>Tu aprendizaje, acompañado</h3><p>Consultá las próximas propuestas de formación con la escuela. Las clases y los materiales se habilitan con tu inscripción.</p><button class="primary" onclick="openAuth()">Ya tengo cuenta · Ingresar</button></article>';$('allCourses').replaceChildren();return;}
 $('homeCourses').innerHTML=list.slice(0,3).map(card).join('')||'<p>Todavía no tenés cursos habilitados. Consultá al administrador del aula.</p>';$('allCourses').innerHTML=list.map(card).join('')||'<p>No hay cursos disponibles para tu cuenta.</p>';
 const stats=document.querySelectorAll('.hero-meta strong');if(stats[0])stats[0].textContent=list.length;if(stats[1])stats[1].textContent=list.reduce((s,c)=>s+(Number(c.completed_lessons)||0),0);if(stats[2])stats[2].textContent=list.reduce((s,c)=>s+Math.max(0,c.lessons_count-(c.completed_lessons||0)),0);
 const next=list.find(c=>c.progress_percent<100)||list[0];$('nextCourseTitle').textContent=next?.name||'Tu próxima clase comienza acá';$('nextCourseDescription').textContent=next?'Abrí las clases y materiales habilitados para tu cuenta.':'Tus cursos aparecerán al confirmar tu inscripción.';$('continueCourse').disabled=!next;$('continueCourse').onclick=next?run(()=>openCourse(next.slug)):null;
}
async function loadCourses(){const d=await request(base+'/learning/courses');renderCourses(d.courses||[]);}
async function openCourse(slug){if(config.publicLanding&&!currentUser){openAuth();return;}const d=await request(base+'/learning/courses/'+encodeURIComponent(slug));currentCourse=d.course;if(window.aulaStudentPreview)currentCourse={...currentCourse,lessons:currentCourse.lessons.filter(l=>l.active!==false)};$('courseDetailName').textContent=currentCourse.name;$('courseDetailDescription').textContent=currentCourse.description||'';$('courseDetailCount').textContent=currentCourse.lessons.length+' clases';$('courseLessons').innerHTML=currentCourse.lessons.map((l,i)=>`<article class="lesson-row" data-lesson="${l.id}"><div class="lesson-number">${String(i+1).padStart(2,'0')}</div><div class="lesson-row-copy"><h3>${esc(l.title)}</h3><p>${esc(l.description||'')}</p><small>${l.completed?'✓ Completada':'Pendiente'}${l.duration_minutes?' · '+l.duration_minutes+' min':''}</small></div><button class="lesson-open" data-open-lesson="${l.id}">Abrir →</button></article>`).join('')||'<p>Todavía no hay clases cargadas.</p>';$('lessonViewer').hidden=true;$('assessmentBox').hidden=true;$('assessmentButton').hidden=!!currentUser?.can_manage;show('curso');}
function openLesson(id){const l=currentCourse.lessons.find(l=>l.id===id);if(!l)return;$('lessonViewer').innerHTML=`<h2>${esc(l.title)}</h2><div class="lesson-text">${esc(l.content||'El docente todavía no agregó contenido a esta clase.')}</div><h3>Materiales</h3><div class="material-links">${l.materials.map(m=>`<button type="button" class="secondary" data-material="${m.id}">${esc(m.title)} ↗</button>`).join('')||'<p>No hay adjuntos.</p>'}</div>${currentUser&&!currentUser.can_manage?`<button class="primary" data-complete-lesson="${id}" ${l.completed?'disabled':''}>${l.completed?'✓ Clase completada':'Marcar clase completada'}</button>`:''}`;$('lessonViewer').hidden=false;$('lessonViewer').scrollIntoView({block:'start',behavior:'smooth'});}
async function material(id){const r=await apiFetch(base+'/learning/courses/'+encodeURIComponent(currentCourse.slug)+'/materials/'+id);if(!r.ok)throw Error('No tenés acceso al material o ya no está disponible.');if((r.headers.get('content-type')||'').includes('application/json')){const d=await r.json();if(!/^https:\/\//.test(d.external_url||''))throw Error('Enlace no válido.');const a=document.createElement('a');a.href=d.external_url;a.target='_blank';a.rel='noopener noreferrer';a.click();}else{const url=URL.createObjectURL(await r.blob());const a=document.createElement('a');a.href=url;a.download=currentCourse.lessons.flatMap(l=>l.materials).find(m=>m.id===id)?.title||'material';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}}
async function assessment(){const d=await request(base+'/learning/courses/'+encodeURIComponent(currentCourse.slug)+'/assessment');$('assessmentBox').hidden=false;$('assessmentBox').innerHTML='<h2>Evaluación y resultados</h2>'+d.attempts.map(a=>`<p>Resultado: ${Number(a.score)}% · ${a.passed?'Aprobado':'No aprobado'}</p>`).join('');if(d.exam&&!d.attempts.some(a=>a.passed)&&d.attempts.length<d.exam.max_attempts){$('assessmentBox').innerHTML+=`<form id="assessmentForm">${d.exam.questions.map((q,i)=>`<fieldset><legend>${esc(q.title)}</legend>${q.options.map((o,j)=>`<label><input type="radio" required name="answer${i}" value="${j}"> ${esc(o)}</label>`).join('')}</fieldset>`).join('')}<button class="primary">Enviar evaluación</button></form>`;$('assessmentForm').onsubmit=run(async e=>{const f=new FormData(e.currentTarget);await request(base+'/learning/courses/'+encodeURIComponent(currentCourse.slug)+'/assessment',{method:'POST',body:{answers:d.exam.questions.map((_,i)=>Number(f.get('answer'+i)))}});await assessment();});}else if(!d.exam)$('assessmentBox').innerHTML+='<p>Este curso no tiene evaluación publicada.</p>';if(d.complete)$('assessmentBox').innerHTML+='<button class="primary" id="certificateButton">Ver certificado</button>';}
async function loadManagement(){management=await request(base+'/manage');if(prospect){const f=$('identityForm');f.elements.name.value=management.name;for(const k of ['tagline','primary_color','logo_url'])f.elements[k].value=management.settings?.[k]||'';if(f.elements.instagram_posts)f.elements.instagram_posts.value=(management.settings?.instagram_posts||[]).join('\n');}$('manageCourse').innerHTML='<option value="">Nuevo curso</option>'+management.courses.map(c=>`<option value="${esc(c.slug)}">${esc(c.name)}${c.active?'':' · Inactivo'}</option>`).join('');$('studentSelect').innerHTML=management.students.map(u=>`<option value="${u.id}">${esc(u.name)} · ${esc(u.email)}</option>`).join('');for(const name of ['location_name','latitude','longitude'])$('nauticalForm').elements[name].value=management.nautical[name]??({location_name:'Thompson · Paraná',latitude:-31.716,longitude:-60.504}[name]);show('administracion');}
function resetCourseForm(){const f=$('courseForm');f.reset();f.elements.active.checked=true;$('lessonForm').reset();$('manageLesson').innerHTML='<option value="">Nueva clase</option>';currentCourse=null;}
async function selectManageCourse(){const slug=$('manageCourse').value;resetCourseForm();if(!slug)return;const c=management.courses.find(c=>c.slug===slug);for(const k of ['name','slug','description'])$('courseForm').elements[k].value=c[k]||'';$('courseForm').elements.active.checked=c.active;$('courseForm').elements.preview.checked=!!c.preview;await openCourse(slug);show('administracion');$('manageLesson').innerHTML='<option value="">Nueva clase</option>'+currentCourse.lessons.map(l=>`<option value="${l.id}">${esc(l.title)}</option>`).join('');}
function formObject(f){return Object.fromEntries(new FormData(f));}
document.addEventListener('click',run(async e=>{const target=e.target.closest('button,a');if(!target)return;if(target.dataset.course)await openCourse(target.dataset.course);if(target.dataset.openLesson)openLesson(Number(target.dataset.openLesson));if(target.dataset.material)await material(Number(target.dataset.material));if(target.dataset.completeLesson){await request(base+'/learning/courses/'+encodeURIComponent(currentCourse.slug)+'/lessons/'+target.dataset.completeLesson+'/complete',{method:'POST'});await openCourse(currentCourse.slug);await loadCourses();message('Clase completada.');}if(target.id==='certificateButton'){const r=await apiFetch(base+'/learning/courses/'+encodeURIComponent(currentCourse.slug)+'/certificate');if(!r.ok)throw Error('Certificado no disponible.');const u=URL.createObjectURL(await r.blob());window.open(u,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(u),60000);}}));
document.querySelectorAll('[data-view]').forEach(el=>el.addEventListener('click',run(async e=>{e.preventDefault();if(el.dataset.view==='administracion')await loadManagement();else if(config.publicLanding&&el.dataset.view==='cursos'&&!currentUser)openAuth();else show(el.dataset.view);})));$('courseBack').onclick=()=>show('cursos');$('assessmentButton').onclick=run(assessment);
$('profileButton').onclick=()=>{if(!currentUser)return openAuth();$('accountMenu').classList.toggle('hidden');$('profileButton').setAttribute('aria-expanded',String(!$('accountMenu').classList.contains('hidden')));};$('accountCourses').onclick=()=>{show('cursos');$('accountMenu').classList.add('hidden');};$('accountProfile').onclick=()=>{if(prospect&&!currentUser.is_matrix){$('passwordCard').hidden=false;show('cuenta');}else message(currentUser.name+' · '+currentUser.email);$('accountMenu').classList.add('hidden');};$('accountLogout').onclick=run(async()=>{try{await request(base+'/auth/logout',{method:'POST'});}finally{sessionStorage.removeItem(tokenKey);setAccountUI(null);renderCourses([]);$('courseLessons').replaceChildren();$('lessonViewer').replaceChildren();$('accountMenu').classList.add('hidden');if(brand.public_preview){closeAuth();await loadCourses();show('inicio');}else openAuth();}});
$('authClose').onclick=closeAuth;/* Una respuesta 429 nunca dispara nuevos intentos: respetamos Retry-After. */
let loginCooldownUntil=0,loginCooldownTimer=null;
function waitLogin(seconds){
 const button=$('loginForm').querySelector('[type="submit"]');
 const label=button.dataset.originalLabel||button.textContent;
 button.dataset.originalLabel=label;
 loginCooldownUntil=Date.now()+seconds*1000;
 if(loginCooldownTimer)clearInterval(loginCooldownTimer);
 function update(){
  const remaining=Math.max(0,Math.ceil((loginCooldownUntil-Date.now())/1000));
  if(remaining){button.disabled=true;button.textContent='Reintentar en '+remaining+' s';}
  else{clearInterval(loginCooldownTimer);loginCooldownTimer=null;button.disabled=false;button.textContent=label;}
 }
 update();loginCooldownTimer=setInterval(update,1000);
}
$('loginForm').onsubmit=run(async e=>{
 if(Date.now()<loginCooldownUntil)return;
 try{
  const d=await request(base+'/auth/login',{method:'POST',body:{email:$('loginEmail').value.trim(),password:$('loginPassword').value}});
  sessionStorage.setItem(tokenKey,d.token);setAccountUI(d.user);e.currentTarget.reset();closeAuth();
  if(d.user.must_change_password&&prospect){$('passwordCard').hidden=false;show('cuenta');message('Elegí una contraseña propia para continuar.');return;}
  await loadCourses();show('cursos');
 }catch(error){
  $('authError').textContent=error.message;
  $('authError').classList.remove('hidden');
  if(error.retryAfter)waitLogin(error.retryAfter);
 }
});
$('manageCourse').onchange=run(selectManageCourse);$('manageLesson').onchange=()=>{const l=currentCourse?.lessons.find(l=>l.id===Number($('manageLesson').value));$('lessonForm').reset();if(l)for(const k of ['title','description','content','sort_order','duration_minutes'])$('lessonForm').elements[k].value=l[k]??'';$('lessonForm').elements.active.checked=l?l.active:true;};
$('courseForm').onsubmit=run(async e=>{const d=formObject(e.currentTarget);d.active=e.currentTarget.elements.active.checked;d.preview=e.currentTarget.elements.preview?.checked||false;const slug=$('manageCourse').value;const response=await request(base+'/manage/courses'+(slug?'/'+encodeURIComponent(slug):''),{method:slug?'PUT':'POST',body:d});await loadManagement();$('manageCourse').value=response.course.slug;await selectManageCourse();message('Curso guardado.');});
$('lessonForm').onsubmit=run(async e=>{if(!currentCourse)throw Error('Guardá o elegí un curso primero.');const d=formObject(e.currentTarget);d.active=e.currentTarget.elements.active.checked;d.duration_minutes=d.duration_minutes||null;const id=$('manageLesson').value;await request(base+'/manage/courses/'+encodeURIComponent(currentCourse.slug)+'/lessons'+(id?'/'+id:''),{method:id?'PUT':'POST',body:d});await selectManageCourse();message('Clase guardada.');});
$('materialForm').onsubmit=run(async e=>{if(!currentCourse||!$('manageLesson').value)throw Error('Elegí una clase guardada para adjuntar material.');const form=new FormData(e.currentTarget);if(!form.get('file')?.size)form.delete('file');await request(base+'/manage/courses/'+encodeURIComponent(currentCourse.slug)+'/lessons/'+$('manageLesson').value+'/materials',{method:'POST',body:form});e.currentTarget.reset();message('Material privado guardado.');});
$('enrollForm').onsubmit=run(async()=>{if(!currentCourse)throw Error('Elegí un curso primero.');await request(base+'/manage/courses/'+encodeURIComponent(currentCourse.slug)+'/enroll',{method:'POST',body:{user_id:Number($('studentSelect').value)}});message('Alumno inscripto.');});
$('studentForm').onsubmit=run(async e=>{await request(base+'/manage/students',{method:'POST',body:formObject(e.currentTarget)});e.currentTarget.reset();await loadManagement();message('Cuenta creada. Cambiará su contraseña desde Mi cuenta en esta misma aula.');});
$('nauticalForm').onsubmit=run(async e=>{await request(base+'/manage/nautical',{method:'PUT',body:formObject(e.currentTarget)});message('Ubicación guardada.');});
// Local deterrents complement server authorization; screenshots cannot be prohibited by a browser.
const privacyHidden=hidden=>{if(config.publicLanding&&!document.body.dataset.aulaPrivate)hidden=false;document.body.classList.toggle('privacy-hidden',hidden);$('privacyShield').setAttribute('aria-hidden',String(!hidden));};window.addEventListener('blur',()=>privacyHidden(true));window.addEventListener('focus',()=>privacyHidden(false));document.addEventListener('visibilitychange',()=>privacyHidden(document.hidden));window.addEventListener('pageshow',()=>privacyHidden(false));
document.querySelectorAll('.help aside button').forEach((button,i)=>button.onclick=()=>message(['Entrá en Mis cursos, elegí una tarjeta y tocá Abrir en una clase.','Dentro de una clase, la sección Materiales permite abrir enlaces o descargar los documentos habilitados.','Usá la cuenta de esta escuela. Si la clave es temporal, el aula te pedirá cambiarla aquí; si la olvidaste, contactá al administrador.','Pedí ayuda al responsable de tu escuela por sus canales habituales.'][i]));
(async()=>{await loadBrand();setAccountUI(null);if(!token()){if(brand.public_preview||config.publicLanding){await loadCourses();if(!config.publicLanding)message('Recorrido de muestra. Ingresá para administrar o guardar tu avance.');return;}return openAuth();}try{const d=await request(base+'/auth/me');setAccountUI(d.user);if(d.user.must_change_password&&prospect){$('passwordCard').hidden=false;return show('cuenta');}await loadCourses();}catch(error){sessionStorage.removeItem(tokenKey);openAuth();if(error.status===401)$('authError').textContent='Tu sesión venció. Volvé a ingresar con tu cuenta.';else if(error.status===429)$('authError').textContent=error.message;else $('authError').textContent='No se pudo recuperar la sesión. Volvé a ingresar.';$('authError').classList.remove('hidden');if(error.retryAfter)waitLogin(error.retryAfter);}})();

$('passwordForm').onsubmit=run(async e=>{await request(base+'/auth/password',{method:'POST',body:formObject(e.currentTarget)});e.currentTarget.reset();const d=await request(base+'/auth/me');setAccountUI(d.user);await loadCourses();show('inicio');message('Contraseña actualizada.');});

$('identityForm').onsubmit=run(async e=>{await request(base+'/manage/settings',{method:'PUT',body:formObject(e.currentTarget)});await loadBrand();message('Identidad guardada.');});


/* Opciones de lectura disponibles en todas las aulas. */
(()=>{
 const trigger=document.querySelector('.accessibility');if(!trigger)return;
 const style=document.createElement('style');style.textContent=`
 .reading-panel{position:fixed;right:16px;top:110px;z-index:120;width:min(340px,calc(100vw - 32px));max-height:70vh;overflow:auto;padding:22px;background:#fff;color:#201d22;border:2px solid var(--tenant-color,#665cf6);border-radius:20px;box-shadow:0 12px 50px #201d2230;font:16px/1.5 Arial,sans-serif}
 .reading-panel h2{font-size:20px;margin:0 0 14px}.reading-panel button{padding:10px 14px;margin:4px;border:1px solid #bcaabc;border-radius:10px;background:#fff;color:#201d22;cursor:pointer;min-height:44px}.reading-panel button[aria-pressed=true]{background:#201d22;color:#fff}.reading-panel p{margin:10px 0}
 html[data-reading-size="large"] body{font-size:21px}html[data-reading-size="large"] main p,html[data-reading-size="large"] .lesson-text,html[data-reading-size="large"] .course p{font-size:21px!important}
 html[data-reading-size="largest"] body{font-size:24px}html[data-reading-size="largest"] main p,html[data-reading-size="largest"] .lesson-text,html[data-reading-size="largest"] .course p{font-size:24px!important}
 html[data-reading-contrast="yes"] body,html[data-reading-contrast="yes"] main,html[data-reading-contrast="yes"] .portal-card,html[data-reading-contrast="yes"] .course{background:#fff!important;color:#111!important}
 html[data-reading-contrast="yes"] main p,html[data-reading-contrast="yes"] main h1,html[data-reading-contrast="yes"] main h2,html[data-reading-contrast="yes"] main h3,html[data-reading-contrast="yes"] main small,html[data-reading-contrast="yes"] main span{color:#111!important}
 html[data-reading-contrast="yes"] .hero-shell,html[data-reading-contrast="yes"] .river-visual,html[data-reading-contrast="yes"] .wx-header{background:#fff!important;color:#111!important;border:2px solid #111}
 html[data-reading-motion="reduced"] *,html[data-reading-motion="reduced"] *::before,html[data-reading-motion="reduced"] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
 `;document.head.append(style);
 const panel=document.createElement('section');panel.className='reading-panel';panel.id='readingOptions';panel.hidden=true;panel.setAttribute('aria-label','Opciones de lectura');
 panel.innerHTML='<h2>Opciones de lectura</h2><p>Tamaño del texto</p><div role="group" aria-label="Tamaño del texto"><button data-size="normal">Normal</button><button data-size="large">Grande</button><button data-size="largest">Muy grande</button></div><p><button data-contrast>Contraste reforzado</button></p><p><button data-motion>Reducir movimientos</button></p><button data-reset>Restablecer</button><button data-close>Cerrar</button><p role="status" id="readingStatus"></p>';
 document.body.append(panel);let prefs={size:'normal',contrast:false,motion:false};try{Object.assign(prefs,JSON.parse(localStorage.getItem('aula-reading')||'{}'));}catch{}
 function apply(){if(!['normal','large','largest'].includes(prefs.size))prefs.size='normal';document.documentElement.dataset.readingSize=prefs.size;document.documentElement.dataset.readingContrast=prefs.contrast?'yes':'no';document.documentElement.dataset.readingMotion=prefs.motion?'reduced':'normal';panel.querySelectorAll('[data-size]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.size===prefs.size)));panel.querySelector('[data-contrast]').setAttribute('aria-pressed',String(!!prefs.contrast));panel.querySelector('[data-motion]').setAttribute('aria-pressed',String(!!prefs.motion));try{localStorage.setItem('aula-reading',JSON.stringify(prefs));}catch{}}
 function close(){panel.hidden=true;trigger.setAttribute('aria-expanded','false');trigger.focus();}
 trigger.setAttribute('aria-controls',panel.id);trigger.setAttribute('aria-expanded','false');trigger.onclick=()=>{panel.hidden=!panel.hidden;trigger.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)panel.querySelector('button').focus();};
 panel.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-close'))return close();if(b.dataset.size)prefs.size=b.dataset.size;if(b.hasAttribute('data-contrast'))prefs.contrast=!prefs.contrast;if(b.hasAttribute('data-motion'))prefs.motion=!prefs.motion;if(b.hasAttribute('data-reset'))prefs={size:'normal',contrast:false,motion:false};apply();panel.querySelector('[role=status]').textContent='Preferencias de lectura aplicadas.';};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)close();});document.addEventListener('click',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!trigger.contains(e.target)){panel.hidden=true;trigger.setAttribute('aria-expanded','false');}});
 apply();
})();

/* Recorrido de lectura para docente y Matriz, sin suplantar cuentas. */
(()=>{
 window.aulaStudentPreview=false;
 const style=document.createElement('style');style.textContent='.student-preview-banner{padding:14px 20px;background:#fff5d9;color:#493511;border-bottom:1px solid #d7bd77;display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap}.student-preview-banner button,.student-preview-start{padding:10px 15px;border:1px solid currentColor;border-radius:12px;background:white;color:inherit;cursor:pointer;font:inherit;min-height:44px}body.student-preview [data-manager-only],body.student-preview [data-section=administracion]{display:none!important}';document.head.append(style);
 const banner=document.createElement('aside');banner.className='student-preview-banner';banner.hidden=true;banner.innerHTML='<span><strong>Vista previa como alumno</strong><br>Recorrido de solo lectura. No representa inscripciones, pagos ni avances de un alumno real.</span><button type="button">Volver a administración</button>';document.querySelector('.topbar').after(banner);
 const start=document.createElement('button');start.type='button';start.className='student-preview-start';start.textContent='Vista previa como alumno';start.hidden=true;document.querySelector('[data-section=administracion] .page-head')?.append(start);
 const originalSet=setAccountUI;setAccountUI=function(user){originalSet(user);start.hidden=!user?.can_manage;if(!user){window.aulaStudentPreview=false;document.body.classList.remove('student-preview');banner.hidden=true;}};
 start.onclick=()=>{if(!currentUser?.can_manage)return;window.aulaStudentPreview=true;document.body.classList.add('student-preview');banner.hidden=false;$('profileRole').textContent='Vista previa · Alumno';renderCourses(courseList.filter(c=>c.active!==false));show('cursos');};
 banner.querySelector('button').onclick=()=>{window.aulaStudentPreview=false;document.body.classList.remove('student-preview');banner.hidden=true;setAccountUI(currentUser);show('administracion');};
 if(currentUser?.can_manage)start.hidden=false;
})();

/* Requisitos de contraseña en tiempo real. No lee ni envía contraseñas fuera del formulario. */
(()=>{
 if(window.dlPasswordFeedback)return;window.dlPasswordFeedback=true;
 const upper=v=>/\p{Lu}/u.test(v),symbol=v=>/[\p{P}\p{S}]/u.test(v);
 let counter=0;const registered=new WeakSet();
 function setup(input){
  if(registered.has(input)||input.autocomplete==='current-password')return;
  if(input.type!=='password'||(!input.matches('[autocomplete="new-password"],[minlength]')))return;
  registered.add(input);const confirmation=/confirmation/.test(input.name);
  const list=document.createElement('ul');list.id='passwordChecks'+(++counter);list.className='password-checks';list.style.cssText='list-style:none;padding:6px 0;margin:0;font-size:13px;line-height:1.7;font-weight:400';
  input.after(list);input.setAttribute('aria-describedby',((input.getAttribute('aria-describedby')||'')+' '+list.id).trim());
  const rules=confirmation?['Las contraseñas coinciden']:['Al menos 6 caracteres','Una letra mayúscula','Un símbolo (por ejemplo !, # o %)'];
  const rows=rules.map(text=>{const li=document.createElement('li');list.append(li);return {li,text,last:null};});
  function render(){const v=input.value;const original=input.form?.querySelector('input[name="password"]');const values=confirmation?[!!v&&!!original&&v===original.value]:[Array.from(v).length>=6,upper(v),symbol(v)];
   rows.forEach((row,i)=>{const state=v?(values[i]?'ok':'pending'):'empty';if(row.last===state)return;row.last=state;row.li.textContent=(state==='ok'?'✓ ':state==='pending'?'○ ':'○ ')+row.text+(state==='ok'?' · Cumplido':'');row.li.style.color=state==='ok'?'#167044':'#62516a';});
   input.setCustomValidity(!v?'':values.every(Boolean)?'':confirmation?'Las contraseñas no coinciden.':'Usá al menos 6 caracteres, una mayúscula y un símbolo.');
  }
  input.addEventListener('input',render);input.form?.addEventListener('input',render);render();
 }
 function scan(root){if(root.matches?.('input'))setup(root);root.querySelectorAll?.('input[type="password"]').forEach(setup);}
 scan(document);new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType===1)scan(n);}))).observe(document.body,{childList:true,subtree:true});
})();

/* Mostrar y ocultar contraseña sin modificar su valor. */
(()=>{
 const style=document.createElement('style');
 style.textContent=[
  '.dl-password-field{position:relative;display:block;min-width:0}',
  '.dl-password-field>input{box-sizing:border-box;padding-right:54px!important}',
  '.dl-password-toggle{position:absolute;right:5px;top:50%;transform:translateY(-50%);width:44px;height:44px;min-height:0!important;max-height:calc(100% - 4px);display:grid;place-items:center;border:0!important;border-radius:10px;background:transparent!important;color:#334155!important;cursor:pointer;padding:0!important;touch-action:manipulation}',
  '.dl-password-toggle:hover{background:rgba(46,57,82,.08)!important}',
  '.dl-password-toggle:focus-visible{outline:2px solid #5144a0;outline-offset:1px}',
  '.dl-password-toggle svg{display:block;width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}'
 ].join('\n');
 document.head.append(style);
 const processed=new WeakSet();
 const eye='<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>';
 const eyeOff='<path d="M10.58 10.587a2 2 0 0 0 2.83 2.83"/><path d="M9.88 5.09A10.93 10.93 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 13.19"/><path d="M6.61 6.61A13.15 13.15 0 0 0 2 12s3 7 10 7a9.7 9.7 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>';
 function enhance(input){
  if(processed.has(input)||input.type!=='password'||!input.parentNode)return;
  processed.add(input);
  const wrap=document.createElement('span');wrap.className='dl-password-field';
  input.parentNode.insertBefore(wrap,input);wrap.append(input);
  const button=document.createElement('button');button.type='button';button.className='dl-password-toggle';
  const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');
  icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');
  function setLabel(shown){
   button.setAttribute('aria-label',shown?'Ocultar contraseña':'Mostrar contraseña');
   button.setAttribute('title',shown?'Ocultar contraseña':'Mostrar contraseña');
   button.setAttribute('aria-pressed',String(shown));
   icon.innerHTML=shown?eyeOff:eye;
  }
  setLabel(false);
  button.append(icon);wrap.append(button);
  button.addEventListener('click',()=>{
   const shown=input.type==='password';
   input.type=shown?'text':'password';
   setLabel(shown);
   input.focus({preventScroll:true});
  });
 }
 function scan(root){
  if(root.matches?.('input[type="password"]'))enhance(root);
  root.querySelectorAll?.('input[type="password"]').forEach(enhance);
 }
 scan(document);
 new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{
  if(node.nodeType===1)scan(node);
 }))).observe(document.body,{childList:true,subtree:true});
})();

