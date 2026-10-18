/* Mensajes de validación propios en castellano, independientes del idioma del navegador. */
(()=>{
if(window.dlSpanishValidation)return;window.dlSpanishValidation=true;
document.addEventListener('invalid',e=>{
 const t=e.target;if(!t.validity||t.validity.customError)return;
 let message='Revisá este campo.';
 if(t.validity.valueMissing)message=t.type==='checkbox'?'Marcá esta opción para continuar.':'Completá este campo para continuar.';
 else if(t.validity.typeMismatch)message=t.type==='email'?'Ingresá un correo electrónico válido.':'Ingresá una dirección válida.';
 else if(t.validity.tooShort)message='Escribí al menos '+t.minLength+' caracteres.';
 else if(t.validity.tooLong)message='Este campo admite hasta '+t.maxLength+' caracteres.';
 else if(t.validity.patternMismatch)message=t.type==='password'?'Usá al menos 6 caracteres, una mayúscula y un símbolo.':'Revisá el formato de este campo.';
 else if(t.validity.rangeUnderflow)message='El valor mínimo es '+t.min+'.';
 else if(t.validity.rangeOverflow)message='El valor máximo es '+t.max+'.';
 else if(t.validity.badInput||t.validity.stepMismatch)message='Ingresá un número válido.';
 t.setCustomValidity(message);t.dataset.dlSpanishError='yes';
},true);
function clear(e){const t=e.target;if(t.dataset?.dlSpanishError){t.setCustomValidity('');delete t.dataset.dlSpanishError;}}
document.addEventListener('input',clear,true);document.addEventListener('change',clear,true);
})();

/* Guía del profesor. Los permisos y los materiales privados se validan en el servidor. */
(()=>{
if(!prospect)return;
const section=document.querySelector('[data-section="administracion"]');if(!section)return;
const legacy=section.querySelector('.portal-admin-grid');legacy.hidden=true;
section.querySelector('.page-head h1').textContent='Tu escuela, paso a paso';
section.querySelector('.page-head>p').textContent='Elegí una tarea. Te acompañamos en dos pasos.';
const host=document.createElement('div');host.className='teacher-workspace';legacy.before(host);
let task=null,busy=false;
const btn=(label,fn,primary=false)=>{const b=document.createElement('button');b.type='button';b.className=primary?'primary':'secondary';b.textContent=label;b.onclick=()=>act(fn);return b;};
async function act(fn){if(busy)return;busy=true;host.setAttribute('aria-busy','true');try{await fn();}catch(e){let box=host.querySelector('.teacher-error');if(!box){box=document.createElement('p');box.className='teacher-error';box.setAttribute('role','alert');host.prepend(box);}box.textContent=e.message;box.scrollIntoView({block:'nearest'});}finally{busy=false;host.removeAttribute('aria-busy');}}
function field(label,name,value='',type='text',required=false){return '<label>'+esc(label)+'<input name="'+name+'" type="'+type+'" value="'+esc(value)+'" '+(required?'required':'')+'></label>';}
function area(label,name,value='',rows=4){return '<label>'+esc(label)+'<textarea name="'+name+'" rows="'+rows+'">'+esc(value)+'</textarea></label>';}
const f=()=>host.querySelector('form');
const val=()=>Object.fromEntries(new FormData(f()));
const courseOptions=slug=>management.courses.map(c=>'<option value="'+esc(c.slug)+'" '+(c.slug===slug?'selected':'')+'>'+esc(c.name)+(c.active?'':' · Borrador')+'</option>').join('');
function frame(title,step,text){host.innerHTML='<h2>'+esc(title)+'</h2><ol class="teacher-steps" aria-label="Progreso"><li '+(step===1?'aria-current="step"':'')+'>1 · Preparar</li><li '+(step===2?'aria-current="step"':'')+'>2 · Revisar y confirmar</li></ol><p>'+esc(text)+'</p><p class="teacher-error" role="alert"></p><div class="teacher-body"></div><div class="teacher-buttons"></div>';host.prepend(btn('← Volver a mis tareas',dashboard));}
function body(html){host.querySelector('.teacher-body').innerHTML=html;if(f())f().onsubmit=e=>e.preventDefault();}
function controls(back,next,label='Continuar →'){const box=host.querySelector('.teacher-buttons');if(back)box.append(btn('← Atrás',back));if(next)box.append(btn(label,async()=>{if(f()&&!f().reportValidity())return;await next();},true));}
async function refresh(){management=await request(base+'/manage');}
async function dashboard(){
 task=null;if(!currentUser?.can_manage){host.replaceChildren();return;}await refresh();
 host.innerHTML='<div class="teacher-actions"></div><div class="teacher-list"><h2>Preparaciones guardadas</h2><p>El paso 1 guarda una preparación privada para retomarla después.</p><div id="teacherDrafts"></div></div>';
 const actions=host.querySelector('.teacher-actions');
 for(const [label,fn] of [['Crear clase',()=>classStep1()],['Mis cursos',myCourses],['Alumnos',()=>studentStep1()],['Mi escuela',()=>schoolStep1()]])actions.append(btn(label,fn,label==='Crear clase'));
 const list=host.querySelector('#teacherDrafts');
 try{const d=await request(base+'/manage/guided/drafts');if(!d.drafts.length)list.textContent='No hay preparaciones pendientes.';for(const x of d.drafts){const row=document.createElement('article');row.className='teacher-row';const title=document.createElement('strong');title.textContent=x.title;row.append(title,btn('Retomar →',async()=>{const r=await request(base+'/manage/guided/drafts/'+x.id);task={kind:'class',course:r.draft.course_slug,draft:r.draft,lesson:r.draft.lesson_id?{id:r.draft.lesson_id}:null};classStep2();}));list.append(row);}}
 catch{list.textContent='Para usar la guía de documentos, instalá la actualización del aula en el servidor.';}
}
async function myCourses(){
 await refresh();frame('Mis cursos',1,'Elegí un curso para organizar sus clases.');body('<div id="teacherCourseList"></div>');host.querySelector('.teacher-buttons').append(btn('+ Crear curso',()=>courseStep1(null),true));
 for(const c of management.courses){const row=document.createElement('article');row.className='teacher-row';const title=document.createElement('strong');title.textContent=c.name+(c.active?'':' · Borrador');row.append(title,btn('Clases',()=>classList(c.slug)),btn('Editar curso',()=>courseStep1(c)));host.querySelector('#teacherCourseList').append(row);}
}
async function classList(slug){
 const d=await request(base+'/learning/courses/'+encodeURIComponent(slug));currentCourse=d.course;
 frame(currentCourse.name,1,'Clases separadas en teoría y práctica, cada una con su material.');body('<div id="teacherClasses"></div>');
 host.querySelector('.teacher-buttons').append(btn('+ Crear clase',()=>classStep1(slug),true),btn('Inscribir alumno',()=>studentStep1(slug)));
 for(const [type,label] of [['theory','Teoría'],['practice','Práctica']]){
  const block=document.createElement('div'),h=document.createElement('h3');h.textContent=label;block.append(h);
  const lessons=currentCourse.lessons.filter(l=>(l.lesson_type||'theory')===type);if(!lessons.length)block.append(document.createTextNode('Todavía no hay clases.'));
  for(const l of lessons){const row=document.createElement('article');row.className='teacher-row';const title=document.createElement('strong');title.textContent=l.title+(l.active?' · Publicada':' · Borrador');row.append(title,btn('Editar',()=>classStep1(slug,l)),btn('Ver clase',async()=>{await openCourse(slug);openLesson(l.id);}),btn('Ver respuestas',()=>responses(slug,l.id)));block.append(row);}
  host.querySelector('#teacherClasses').append(block);
 }
}
async function responses(slug,id){
 const d=await request(base+'/manage/guided/courses/'+encodeURIComponent(slug)+'/lessons/'+id+'/responses');frame('Respuestas de repaso',2,'Estas respuestas no otorgan nota ni certificado.');body('<div id="teacherResponses"></div>');
 const list=host.querySelector('#teacherResponses');if(!d.responses.length)list.textContent='Todavía no hay respuestas.';
 for(const r of d.responses){const a=document.createElement('article');a.className='portal-card';a.innerHTML='<h3>'+esc(r.student?.name||'Alumno')+'</h3>'+r.questions.map((q,i)=>'<h4>'+esc(q)+'</h4><p>'+esc(r.answers[i]||'')+'</p>').join('');list.append(a);}controls(()=>classList(slug));
}
function courseStep1(c,state){
 task={kind:'course',course:c,state:state||{name:c?.name||'',description:c?.description||''}};
 frame(c?'Editar curso':'Crear curso',1,'Solo necesitamos el nombre y una presentación breve.');
 body('<form>'+field('Nombre del curso','name',task.state.name,'text',true)+area('¿De qué se trata?','description',task.state.description)+'</form>');
 controls(myCourses,()=>{task.state=val();courseStep2();});
}
function courseStep2(){
 frame('Revisar curso',2,'La presentación permite conocer el curso. Sus clases requieren acceso.');
 body('<article class="portal-card"><h3>'+esc(task.state.name)+'</h3><p>'+esc(task.state.description)+'</p></article><form><label><input type="checkbox" name="active" '+(task.course?.active===false?'':'checked')+'> Mostrar la presentación del curso</label></form>');
 controls(()=>courseStep1(task.course,task.state),async()=>{
  const old=task.course;let slug=old?.slug;
  if(!slug){slug=task.state.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,75)||'curso';slug+='-'+Math.random().toString(36).slice(2,6);}
  await request(base+'/manage/courses'+(old?'/'+encodeURIComponent(old.slug):''),{method:old?'PUT':'POST',body:{...task.state,slug,active:f().elements.active.checked,preview:false}});
  await refresh();await classList(slug);message('Curso guardado. Ya podés crear su primera clase.');
 },'Guardar curso');
}
function classStep1(slug,lesson){
 if(!management.courses.length){courseStep1(null);message('Primero creá un curso.');return;}
 task={kind:'class',course:slug||management.courses[0].slug,lesson};
 frame(lesson?'Editar clase':'Crear clase',1,'Subí un documento o escribí el contenido. Al continuar se guarda una preparación privada.');
 body('<form><label>Curso<select name="course" '+(lesson?'disabled':'')+'>'+courseOptions(task.course)+'</select></label><label>Tipo de clase<select name="lesson_type"><option value="theory" '+(lesson?.lesson_type!=='practice'?'selected':'')+'>Teórica</option><option value="practice" '+(lesson?.lesson_type==='practice'?'selected':'')+'>Práctica</option></select></label><label>Subir documento (hasta 5 MB)<input name="file" type="file" accept=".pdf,.docx,.txt,.md"></label><p>PDF con texto, DOCX o TXT. Se extraen texto y enlaces; las imágenes y el diseño original no se reconstruyen. Los escaneos necesitan reconocimiento de texto.</p>'+area('O escribí el contenido de la clase','content',lesson?.content||'',8)+'</form>');
 controls(null,async()=>{
  const fd=new FormData(f());task.course=lesson?slug:f().elements.course.value;if(!fd.get('file')?.size)fd.delete('file');fd.delete('course');if(lesson)fd.set('lesson_id',String(lesson.id));
  const d=await request(base+'/manage/guided/courses/'+encodeURIComponent(task.course)+'/prepare',{method:'POST',body:fd});task.draft=d.draft;
  if(lesson){task.draft.title=lesson.title;task.draft.description=lesson.description;task.draft.links=lesson.links||task.draft.links;task.draft.reflection_questions=lesson.reflection_questions||task.draft.reflection_questions;}
  classStep2();
 });
}
function classStep2(){
 const d=task.draft;frame('Revisar y publicar clase',2,'Preparación guardada. Revisá el texto y las preguntas; tus cambios se guardan al confirmar.');
 body((d.warning?'<p class="teacher-warning">'+esc(d.warning)+'</p>':'')+'<form>'+field('Título de la tarjeta','title',d.title,'text',true)+area('Descripción breve','description',d.description)+'<label>Tipo de clase<select name="lesson_type"><option value="theory" '+(d.lesson_type!=='practice'?'selected':'')+'>Teórica</option><option value="practice" '+(d.lesson_type==='practice'?'selected':'')+'>Práctica</option></select></label>'+area('Contenido que leerá el alumno','content',d.content,12)+area('Enlaces HTTPS (uno por línea)','links',(d.links||[]).join('\n'),3)+'<details><summary>Preguntas de repaso · sin nota</summary><p>Son propuestas generales editables, no un examen generado por IA.</p><label><input name="include_questions" type="checkbox" '+((d.reflection_questions||[]).length?'checked':'')+'> Incluir preguntas al terminar la clase</label>'+area('Primera pregunta','question1',d.reflection_questions?.[0]||'',2)+area('Segunda pregunta','question2',d.reflection_questions?.[1]||'',2)+'</details><details><summary>Más opciones</summary><label><input name="show_original" type="checkbox"> Permitir al alumno descargar el documento original</label><p>Por defecto, el original queda reservado al profesor. El contenido completo requiere una inscripción habilitada.</p></details><label><input type="checkbox" name="reviewed"> Revisé el contenido y está listo para mis alumnos</label></form><details><summary>Vista previa del contenido</summary><article id="teacherLessonPreview" class="portal-card"></article></details>');
 const preview=()=>{host.querySelector('#teacherLessonPreview').innerHTML='<h3>'+esc(f().elements.title.value)+'</h3><p>'+esc(f().elements.description.value)+'</p><div class="lesson-text">'+esc(f().elements.content.value)+'</div>';};f().addEventListener('input',preview);preview();
 host.querySelector('.teacher-buttons').append(btn('Guardar borrador',()=>saveClass(false)),btn('Publicar clase',()=>saveClass(true),true));
}
async function saveClass(active){
 if(!f().reportValidity())return;const v=val();if(active&&!f().elements.reviewed.checked)throw Error('Marcá que revisaste el contenido antes de publicar.');
 const d={draft_id:task.draft.id,lesson_id:task.lesson?.id||null,title:v.title,description:v.description,content:v.content,lesson_type:v.lesson_type,active,reviewed:f().elements.reviewed.checked,show_original:f().elements.show_original.checked,links:v.links.split('\n').map(x=>x.trim()).filter(Boolean),reflection_questions:f().elements.include_questions.checked?[v.question1,v.question2].map(x=>x.trim()).filter(Boolean):[]};
 const r=await request(base+'/manage/guided/courses/'+encodeURIComponent(task.course)+'/lessons',{method:'POST',body:d});await classList(task.course);message(r.message);
}
function studentStep1(slug,state){
 task={kind:'student',course:slug||management.courses[0]?.slug,state:state||{}};if(!task.course){courseStep1(null);message('Creá un curso antes de inscribir alumnos.');return;}
 frame('Inscribir alumno',1,'Buscá una cuenta existente o creá una nueva.');
 const options=management.students.map(u=>'<option value="'+u.id+'" '+(state?.student===String(u.id)?'selected':'')+'>'+esc(u.name)+' · '+esc(u.email)+'</option>').join('');
 body('<form><label>Alumno<select name="student"><option value="">Crear cuenta nueva</option>'+options+'</select></label><div id="teacherNewStudent">'+field('Nombre','name',state?.name||'')+field('Correo','email',state?.email||'','email')+'<label>Contraseña temporal<input name="password" type="password" autocomplete="new-password" minlength="6" pattern="(?=.*\\p{Lu})(?=.*[\\p{P}\\p{S}]).{6,}"></label><label>Repetir contraseña<input name="password_confirmation" type="password" autocomplete="new-password" minlength="6"></label><p>Mínimo seis caracteres, una mayúscula y un símbolo. El alumno la cambiará al ingresar.</p></div></form>');
 const toggle=()=>{const fresh=!f().elements.student.value;host.querySelector('#teacherNewStudent').hidden=!fresh;for(const k of ['name','email','password','password_confirmation']){f().elements[k].required=fresh;f().elements[k].disabled=!fresh;}};f().elements.student.onchange=toggle;toggle();
 controls(null,()=>{task.state=val();studentStep2();});
}
function studentStep2(){
 const v=task.state,u=management.students.find(u=>String(u.id)===v.student);
 frame('Confirmar inscripción',2,'La inscripción manual habilita el acceso. Confirmá el cobro por tu vía habitual si corresponde.');
 body('<p><strong>'+esc(u?.name||v.name)+'</strong> · '+esc(u?.email||v.email)+'</p><form><label>Curso<select name="course">'+courseOptions(task.course)+'</select></label></form>');
 controls(()=>studentStep1(task.course,v),async()=>{const slug=f().elements.course.value;let id=task.state.student||v.student;if(!id){const r=await request(base+'/manage/students',{method:'POST',body:{name:v.name,email:v.email,password:v.password,password_confirmation:v.password_confirmation}});id=r.id;task.state={student:String(id)};}await request(base+'/manage/courses/'+encodeURIComponent(slug)+'/enroll',{method:'POST',body:{user_id:Number(id)}});task=null;await dashboard();message('Alumno inscripto. Ya puede ingresar con su cuenta.');},'Confirmar inscripción');
}
function schoolStep1(state){
 task={kind:'school',state:state||{name:management.name,tagline:management.settings?.tagline||'',logo_url:management.settings?.logo_url||'',primary_color:management.settings?.primary_color||'#a33f91',instagram_posts:(management.settings?.instagram_posts||[]).join('\n')}};
 frame('Mi escuela',1,'Completá los datos con los que se presenta tu escuela.');
 body('<form>'+field('Nombre','name',task.state.name,'text',true)+area('Presentación','tagline',task.state.tagline)+'<details><summary>Logo y color</summary>'+field('Enlace HTTPS del logo','logo_url',task.state.logo_url,'url')+field('Color principal','primary_color',task.state.primary_color,'color')+area('Publicaciones de Instagram (una dirección por línea)','instagram_posts',task.state.instagram_posts||'',3)+'</details></form>');
 controls(null,()=>{task.state=val();schoolStep2();});
}
function schoolStep2(){
 frame('Revisar mi escuela',2,'Así se identificará tu escuela.');body('<article class="portal-card"><h3>'+esc(task.state.name)+'</h3><p>'+esc(task.state.tagline)+'</p></article>');
 controls(()=>schoolStep1(task.state),async()=>{await request(base+'/manage/settings',{method:'PUT',body:task.state});await loadBrand();await dashboard();message('Identidad guardada.');},'Guardar identidad');
}
const originalManagement=loadManagement;loadManagement=async function(){await originalManagement();await dashboard();};
const originalAccount=setAccountUI;setAccountUI=function(user){originalAccount(user);if(!user){task=null;host.replaceChildren();}};
const originalLesson=openLesson;openLesson=function(id){
 originalLesson(id);const l=currentCourse?.lessons.find(x=>x.id===id);if(!l)return;const viewer=$('lessonViewer'),badge=document.createElement('p');badge.className='eyebrow';badge.textContent=l.lesson_type==='practice'?'CLASE PRÁCTICA':'CLASE TEÓRICA';viewer.prepend(badge);
 const links=(l.links||[]).filter(u=>{try{return new URL(u).protocol==='https:';}catch{return false;}});
 if(links.length){const box=document.createElement('div');box.className='material-links';for(const u of links){const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener';a.textContent=u;box.append(a);}viewer.append(box);}
 if(currentUser&&!currentUser.can_manage&&!window.aulaStudentPreview&&(l.reflection_questions||[]).length){
  const form=document.createElement('form');form.className='teacher-reflection';form.innerHTML='<h3>Para repasar lo aprendido</h3><p>Esta actividad no otorga nota ni certificado.</p>'+l.reflection_questions.map((q,i)=>area(q,'answer'+i,'',3)).join('')+'<button class="primary" type="submit">Guardar respuestas</button><p role="status"></p>';
  form.onsubmit=async e=>{e.preventDefault();if(!form.reportValidity())return;const b=form.querySelector('button');b.disabled=true;try{const r=await request(base+'/learning/courses/'+encodeURIComponent(currentCourse.slug)+'/lessons/'+id+'/reflection',{method:'POST',body:{answers:l.reflection_questions.map((q,i)=>form.elements['answer'+i].value)}});form.querySelector('[role=status]').textContent=r.message;}catch(err){form.querySelector('[role=status]').textContent=err.message;}finally{b.disabled=false;}};
  form.querySelectorAll('textarea').forEach(t=>{t.required=true;t.maxLength=3000;});viewer.append(form);
 }
};
function applySchoolBrand(data){if(!config.publicLanding)return;if(/^https:\/\//.test(data?.logo_url||''))document.querySelectorAll('.school-logo').forEach(img=>{img.src=data.logo_url;});if(/^#[0-9a-fA-F]{6}$/.test(data?.primary_color||''))document.documentElement.style.setProperty('--tenant-color',data.primary_color,'important');}
window.addEventListener('aula-brand',e=>applySchoolBrand(e.detail));applySchoolBrand(brand);
if(currentUser?.can_manage&&management)act(dashboard);
})();
