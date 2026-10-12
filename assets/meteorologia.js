/* Pronóstico técnico de referencia para Balneario Thompson, Paraná.
 * MET Norway Locationforecast 2.0; datos de modelo, no mediciones in situ.
 * Sin credenciales en el navegador. Consultas sujetas a caché del proveedor. */
(() => {
  "use strict";
  const lat = -31.716, lon = -60.504; // coordenadas de referencia aproximadas
  const url = "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=" + lat + "&lon=" + lon;
  const cacheKey = "aula_met_thompson_v1";
  const cacheMs = 30 * 60 * 1000;
  let busy = false, initialized = false;
  const $ = (id) => document.getElementById(id);
  const fmt = (v, digits = 0) => Number.isFinite(Number(v)) && v !== null && v !== undefined
    ? Number(v).toLocaleString("es-AR", {maximumFractionDigits:digits,minimumFractionDigits:digits}) : "—";
  const kmh = (v) => v == null ? null : v * 3.6;
  const direction = (deg) => deg == null ? "—" : ["N","NE","E","SE","S","SO","O","NO"][Math.round((deg % 360) / 45) % 8];
  const localDate = (date, options) => new Intl.DateTimeFormat("es-AR", {timeZone:"America/Argentina/Cordoba", ...options}).format(date);
  const val = (id, value) => {const node=$(id); if(node) node.textContent=value;};
  const item = (p) => p.data?.instant?.details ?? {};
  const oneHour = (p) => p.data?.next_1_hours?.details ?? {};
  const twoHours = (p) => p.data?.next_6_hours?.details ?? {};
  function render(timeseries, fetchedAt) {
    const valid = timeseries.filter(p => new Date(p.time).getTime() >= Date.now() - 45*60000);
    const points = (valid.length ? valid : timeseries).slice(0,24);
    if (!points.length) throw new Error("El proveedor no devolvió horas válidas.");
    const now=points[0], d=item(now), h=oneHour(now);
    val("wxWind", fmt(kmh(d.wind_speed),1));
    val("wxDirection", d.wind_from_direction == null ? "Dirección no disponible" : direction(d.wind_from_direction) + " · desde " + fmt(d.wind_from_direction) + "°");
    val("wxGust", fmt(kmh(d.wind_speed_of_gust),1));
    val("wxTemp",fmt(d.air_temperature,1)+" °C");
    val("wxFeels",fmt(d.air_temperature,1)+" °C"); // no se presenta como sensación térmica; ver etiqueta de la tarjeta
    val("wxHumidity",fmt(d.relative_humidity)+" %");
    val("wxPressure",fmt(d.air_pressure_at_sea_level)+" hPa");
    val("wxCloud",fmt(d.cloud_area_fraction)+" %");
    val("wxRain",h.precipitation_amount == null ? "—" : fmt(h.precipitation_amount,1)+" mm");
    val("wxRainNote", h.precipitation_amount == null ? "Acumulado 1 h no disponible" : "Precipitación prevista en la próxima hora");
    val("wxUpdate", "Modelo: " + localDate(new Date(now.time),{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}) + " · consulta: " + localDate(new Date(fetchedAt),{hour:"2-digit",minute:"2-digit"}));
    const arrow=$("wxPointer");if(arrow && d.wind_from_direction != null)arrow.style.transform="rotate("+d.wind_from_direction+"deg)";
    const graph=points.filter((_, i)=> i%2===0).slice(0,12);
    const ceiling=Math.max(5,...graph.flatMap(p=>[kmh(item(p).wind_speed)||0, kmh(item(p).wind_speed_of_gust)||0]));
    $("wxBars").replaceChildren(...graph.map(p=>{
      const d=item(p), wrap=document.createElement("div");wrap.className="wx-bar-hour";
      const group=document.createElement("div");group.className="wx-bar-group";
      for(const [v,type] of [[kmh(d.wind_speed),"normal"],[kmh(d.wind_speed_of_gust),"gust"]]){
        const bar=document.createElement("div");bar.className="wx-bar "+type;
        bar.style.height=Math.max(2,Math.min(100,(v||0)/ceiling*100))+"%";
        bar.title=type==="gust"?"Ráfaga "+fmt(v,1)+" km/h":"Viento "+fmt(v,1)+" km/h";
        group.append(bar);
      }
      const label=document.createElement("div");label.className="wx-bar-time";
      label.textContent=localDate(new Date(p.time),{hour:"2-digit"})+" h";
      wrap.append(group,label);return wrap;
    }));
    const tbody=$("wxHourlyBody");tbody.replaceChildren(...points.slice(0,12).map(p=>{
      const d=item(p),h=oneHour(p),tr=document.createElement("tr");
      const arr=[
        localDate(new Date(p.time),{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}),
        fmt(kmh(d.wind_speed),1),fmt(kmh(d.wind_speed_of_gust),1),
        direction(d.wind_from_direction),fmt(d.air_temperature,1),
        h.precipitation_amount == null ? "—" : fmt(h.precipitation_amount,1)
      ];
      for(const value of arr){const td=document.createElement("td");td.textContent=value;tr.append(td);}return tr;
    }));
    $("wxStatus").hidden=true;$("wxContent").hidden=false;
  }
  async function load(force=false) {
    if(busy)return;busy=true;
    const btn=$("wxRefresh");btn.disabled=true;
    $("wxStatus").hidden=false;$("wxStatus").textContent="Actualizando pronóstico…";
    try{
      let cached=null;try{cached=JSON.parse(sessionStorage.getItem(cacheKey)||"null");}catch{}
      if(cached && Array.isArray(cached.series) && (Date.now()-cached.savedAt<cacheMs) && !force){
        render(cached.series,cached.savedAt);return;
      }
      const response=await fetch(url,{headers:{"Accept":"application/json"},signal:AbortSignal.timeout(18000)});
      if(!response.ok)throw new Error("HTTP "+response.status);
      const payload=await response.json();
      if(!Array.isArray(payload.properties?.timeseries))throw new Error("Respuesta incompleta");
      const savedAt=Date.now();
      try{sessionStorage.setItem(cacheKey,JSON.stringify({savedAt,series:payload.properties.timeseries}));}catch{}
      render(payload.properties.timeseries,savedAt);
    }catch(err){
      let cached=null;try{cached=JSON.parse(sessionStorage.getItem(cacheKey)||"null");}catch{}
      if(cached && Array.isArray(cached.series)){
        try{render(cached.series,cached.savedAt);val("wxUpdate","Datos en caché · última consulta: "+localDate(new Date(cached.savedAt),{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}));}
        catch{}
      }else{
        $("wxContent").hidden=true;
      }
      $("wxStatus").hidden=false;
      $("wxStatus").textContent="No se pudo actualizar el pronóstico meteorológico. Verificá la conexión e intentá nuevamente.";
      console.warn("Meteorología:",err);
    }finally{busy=false;btn.disabled=false;}
  }
  const init=()=>{if(initialized)return;initialized=true;$("wxRefresh")?.addEventListener("click",()=>load(true));load();};
  document.querySelectorAll('[data-view="meteorologia"]').forEach(button=>button.addEventListener("click",init));
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{}); 
  // El panel es información general y no requiere autenticación distinta de la de Aula.
})();
