/* Aula: MET Norway vía Datalisting. La maqueta independiente conserva su fuente anterior. */
(() => {
"use strict";
const $ = id => document.getElementById(id);
const endpoint = "https://api.open-meteo.com/v1/forecast?latitude=-31.716&longitude=-60.504&hourly=temperature_2m,relative_humidity_2m,pressure_msl,cloud_cover,precipitation,wind_speed_10m,wind_gusts_10m,wind_direction_10m&wind_speed_unit=kmh&timezone=GMT&forecast_days=3";
const cacheKey="aula_wx_v3_"+(window.aulaOrganization||"maqueta"),TTL=30*60*1000,ns="http://www.w3.org/2000/svg";
let started=false,loading=false,points=[],period=24,selected=0;
const valid = x => typeof x==="number" && Number.isFinite(x);
const num=(x,dec=0)=>valid(x)?x.toLocaleString("es-AR",{minimumFractionDigits:dec,maximumFractionDigits:dec}):"—";
const set=(id,s)=>{const e=$(id);if(e)e.textContent=s;};
const hour=date=>new Intl.DateTimeFormat("es-AR",{timeZone:"America/Argentina/Cordoba",hour:"2-digit",minute:"2-digit"}).format(date);
const full=date=>new Intl.DateTimeFormat("es-AR",{timeZone:"America/Argentina/Cordoba",weekday:"short",day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}).format(date);
const compass=d=>valid(d)?["N","NE","E","SE","S","SO","O","NO"][Math.round(((d%360)+360)%360/45)%8]:"—";
function svg(tag,attr,text){const e=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attr||{}))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;return e;}
function lineChart(id,series,opts={}) {
 const root=$(id);if(!root)return;root.replaceChildren();const width=600,height=210,pad={l:39,r:10,t:18,b:31};
 root.setAttribute("viewBox", "0 0 600 210");root.setAttribute("preserveAspectRatio","xMidYMid meet");
 const n=series[0]?.data?.length||0;if(!n)return;
 const values=series.flatMap(s=>s.data.map(p=>p.value).filter(valid));if(!values.length)return;const mn=opts.zero?0:Math.min(...values)-2,mx=Math.max(...values,opts.zero?1:Math.max(...values)+2),extent=Math.max(1,mx-mn);
 const x=i=>pad.l+(width-pad.l-pad.r)*i/Math.max(1,n-1);
 const y=v=>height-pad.b-((v-mn)/extent)*(height-pad.t-pad.b);
 for(let i=0;i<=3;i++){const v=mn+extent*i/3;root.append(svg("line",{x1:pad.l,x2:width-pad.r,y1:y(v),y2:y(v),stroke:"#d9e6ec","stroke-width":1}));root.append(svg("text",{x:pad.l-7,y:y(v)+4,"text-anchor":"end",fill:"#8094a0","font-size":11},num(v,0)));}
 for(const i of [0,Math.floor((n-1)/2),n-1])root.append(svg("text",{x:x(i),y:height-9,"text-anchor":"middle",fill:"#6e8190","font-size":11},hour(points[i].time)));
 if(opts.bars){const values=series[0].data;values.forEach((p,i)=>{const bw=Math.min(20,(width-pad.l-pad.r)/n*.7);root.append(svg("rect",{x:x(i)-bw/2,y:y(p.value||0),width:bw,height:Math.max(0,y(0)-y(p.value||0)),rx:3,fill:"#44b2bd"}));});}
 else for(const s of series){
 const mapped=s.data.map((p,i)=>valid(p.value)?{i,v:p.value}:null).filter(Boolean);
 if(mapped.length>1){const d=mapped.map((p,j)=>(j?"L":"M")+x(p.i).toFixed(1)+","+y(p.v).toFixed(1)).join(" ");
 root.append(svg("path",{d,fill:"none",stroke:s.color,"stroke-width":3,"stroke-linecap":"round","stroke-linejoin":"round"}));}
 }
 const sel=selected<n?selected:n-1;root.append(svg("line",{x1:x(sel),x2:x(sel),y1:pad.t,y2:height-pad.b,stroke:"#203e54","stroke-width":1.5,"stroke-dasharray":"4 4"}));
 for(const s of series){const value=s.data[sel]?.value;if(valid(value))root.append(svg("circle",{cx:x(sel),cy:y(value),r:5,fill:s.color,stroke:"#fff","stroke-width":2}));}
}
function redraw(){
 const shown=points.slice(0,period);if(!shown.length)return;selected=Math.min(selected,shown.length-1);
 const wind=shown.map(p=>({value:p.wind})),gust=shown.map(p=>({value:p.gust})),temp=shown.map(p=>({value:p.temp})),rain=shown.map(p=>({value:p.rain}));
 lineChart("wxWindChart",[{data:wind,color:"#0791aa"},{data:gust,color:"#ef9943"}],{zero:true});
 lineChart("wxTempChart",[{data:temp,color:"#ef9943"}]);
 lineChart("wxRainChart",[{data:rain,color:"#36aab7"}],{zero:true,bars:true});
 const s=shown[selected];set("wxSelectedTime",full(s.time));set("wxSelectedWind",num(s.wind,1));set("wxSelectedGust",num(s.gust,1));set("wxSelectedTemp",num(s.temp,1));set("wxSelectedRain",num(s.rain,1));
 const gusts=shown.map(p=>p.gust).filter(valid),rains=shown.map(p=>p.rain).filter(valid);
 set("wxMaxGust",gusts.length?num(Math.max(...gusts),1)+" km/h":"—");set("wxTotalRain",rains.length?num(rains.reduce((a,b)=>a+b,0),1)+" mm":"—");
 const slider=$("wxHourSlider");slider.max=String(shown.length-1);slider.value=String(selected);
 const tbody=$("wxHourlyBody");tbody.replaceChildren(...shown.map((p,i)=>{
   const tr=document.createElement("tr");if(i===selected)tr.className="wx-selected-row";
   for(const value of [full(p.time),num(p.wind,1),num(p.gust,1),compass(p.direction),num(p.temp,1),num(p.rain,1)]){const td=document.createElement("td");td.textContent=value;tr.append(td);}
   tr.addEventListener("click",()=>{selected=i;redraw();});return tr;
 }));
}
function render(raw,at,isCache=false){
 const h=raw.hourly;if(!Array.isArray(h?.time))throw new Error("Datos horarios incompletos");
 const now=Date.now();const p=h.time.map((time,i)=>({
  time:new Date(time+"Z"),wind:h.wind_speed_10m?.[i],gust:h.wind_gusts_10m?.[i],direction:h.wind_direction_10m?.[i],
  temp:h.temperature_2m?.[i],humidity:h.relative_humidity_2m?.[i],pressure:h.pressure_msl?.[i],
  cloud:h.cloud_cover?.[i],rain:h.precipitation?.[i]
 })).filter(p=>Number.isFinite(p.time.getTime())&&p.time.getTime()>=now-45*60000);
 if(!p.length)throw new Error("No hay horas disponibles");points=p;selected=0;
 const first=p[0];
 for(const [id,x] of [["wxWind",first.wind],["wxGust",first.gust],["wxTemp",first.temp],["wxHumidity",first.humidity],["wxPressure",first.pressure],["wxCloud",first.cloud],["wxRain",first.rain]])set(id,num(x,(id==="wxWind"||id==="wxGust"||id==="wxTemp"||id==="wxRain")?1:0));
 set("wxDirection",valid(first.direction)?"Origen "+compass(first.direction)+" · "+num(first.direction)+"°":"Dirección no disponible");
 if(valid(first.direction))$("wxPointer").style.transform="rotate("+first.direction+"deg)";
 set("wxUpdate",(isCache?"Datos guardados":"Consultado")+" "+hour(new Date(at)));
 for(const b of document.querySelectorAll("[data-wx-hours]")){const active=+b.dataset.wxHours===period;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));}
 redraw();$("wxContent").hidden=false;$("wxStatus").hidden=true;
}
async function load(force=false){
 if(loading)return;loading=true;const btn=$("wxRefresh");btn.disabled=true;$("wxStatus").hidden=false;set("wxStatus","Actualizando datos…");
 let cached=null;try{cached=JSON.parse(sessionStorage.getItem(cacheKey)||"null");}catch{}
 try{
   if(!force&&cached?.at&&Date.now()-cached.at<TTL){render(cached.payload,cached.at,true);return;}
   const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),15000);
   let resp;try{resp=window.aulaApiFetch?await window.aulaApiFetch(`/education/${encodeURIComponent(window.aulaOrganization)}/nautical/forecast`,{signal:ctrl.signal}):await fetch(endpoint,{signal:ctrl.signal,headers:{Accept:"application/json"}});}finally{clearTimeout(timeout);}
   if(!resp.ok)throw new Error("Respuesta "+resp.status);
   const payload=await resp.json();if(!payload.hourly?.time)throw new Error("Pronóstico incompleto");
   const at=Date.now();try{sessionStorage.setItem(cacheKey,JSON.stringify({payload,at}));}catch{}
   render(payload,at);if(payload.location_name){const label=document.querySelector(".wx-location span");if(label)label.textContent=payload.location_name;}
 }catch(e){
   let fallback=false;if(cached?.payload){try{render(cached.payload,cached.at,true);fallback=true;}catch{}}
   $("wxStatus").hidden=false;set("wxStatus",fallback?"Sin conexión con la API. Se muestran los últimos datos almacenados, que pueden estar desactualizados.":"No pudimos consultar la API meteorológica. Comprobá la conexión y actualizá.");console.warn("Weather API",e);
 }finally{loading=false;btn.disabled=false;}
}
function init(){
 if(started)return;started=true;
 $("wxRefresh")?.addEventListener("click",()=>load(true));
 $("wxHourSlider")?.addEventListener("input",e=>{selected=Number(e.target.value);redraw();});
 document.querySelectorAll("[data-wx-hours]").forEach(b=>b.addEventListener("click",()=>{period=Number(b.dataset.wxHours);selected=0;document.querySelectorAll("[data-wx-hours]").forEach(x=>{const a=x===b;x.classList.toggle("active",a);x.setAttribute("aria-pressed",String(a));});redraw();}));
 load();
}
document.querySelectorAll('[data-view="meteorologia"]').forEach(button=>button.addEventListener("click",init));
})();

