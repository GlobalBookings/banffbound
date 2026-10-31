import { mapCategories, type MapMarker } from "../data/map";
import { leafletCss, leafletJs } from "./vendor/leaflet";

export const MAP_BASE_URL = "https://banffbound.com/app/";
export const MAP_USER_AGENT = "BanffBound/1.0 (+https://banffbound.com/app/support/)";
export const MAP_MAX_POINTS = 2000;
export const MAP_MESSAGE_LIMIT = 2048;
export const MAP_ATTRIBUTION_URLS = [
  "https://www.openstreetmap.org/copyright",
  "https://www.openstreetmap.org/fixthemap",
] as const;
const categoryIds = new Set(mapCategories.map((c) => c.id));
const validCoordinate = (latitude: unknown, longitude: unknown) =>
  typeof latitude === "number" && Number.isFinite(latitude) && Math.abs(latitude) <= 85.05112878 &&
  typeof longitude === "number" && Number.isFinite(longitude) && Math.abs(longitude) <= 180;
export function normaliseMapPoints(points: readonly MapMarker[]): MapMarker[] {
  if (!Array.isArray(points)) return [];
  const seen = new Set<string>();
  return points.slice(0, MAP_MAX_POINTS).filter((p) => {
    if (!p || typeof p.id !== "string" || !/^[a-z0-9][a-z0-9:_-]{0,119}$/i.test(p.id) || seen.has(p.id) ||
      typeof p.name !== "string" || !p.name.trim() || p.name.length > 180 || !categoryIds.has(p.category) ||
      !validCoordinate(p.latitude, p.longitude)) return false;
    seen.add(p.id); return true;
  }).map(({ id, name, category, latitude, longitude }) => ({ id, name, category, latitude, longitude }));
}
export type MapViewState = { points: MapMarker[]; selectedId: string | null; position: { latitude: number; longitude: number } | null };
export function mapViewState(points: readonly MapMarker[], selectedId?: string | null, position?: MapViewState["position"]): MapViewState {
  const clean = normaliseMapPoints(points);
  return { points: clean, selectedId: clean.some((p) => p.id === selectedId) ? selectedId! : null,
    position: position && validCoordinate(position.latitude, position.longitude) ? { latitude: position.latitude, longitude: position.longitude } : null };
}
export function safeScriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
export function mapUpdateMessage(channel: string, state: MapViewState): string {
  return JSON.stringify({ source: "banffbound-host", type: "update", channel, state });
}
export type MapBridgeMessage = { type: "select"; id: string } | { type: "status"; status: "ready" | "unavailable" } | { type: "loaded" } | { type: "external"; url: string };
export function isAllowedMapAttributionUrl(url: unknown): url is string {
  return typeof url === "string" && (MAP_ATTRIBUTION_URLS as readonly string[]).includes(url);
}
export function decodeMapMessage(raw: unknown, channel: string, knownIds: ReadonlySet<string>): MapBridgeMessage | null {
  if (typeof raw !== "string" || raw.length > MAP_MESSAGE_LIMIT) return null;
  let bytes = 0;
  for (const char of raw) { const code = char.codePointAt(0)!; bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4; }
  if (bytes > MAP_MESSAGE_LIMIT) return null;
  try {
    const data = JSON.parse(raw);
    if (!data || data.source !== "banffbound-map" || data.channel !== channel) return null;
    if (data.type === "select" && typeof data.id === "string" && knownIds.has(data.id)) return { type: "select", id: data.id };
    if (data.type === "status" && ["ready", "unavailable"].includes(data.status)) return { type: "status", status: data.status };
    if (data.type === "loaded") return { type: "loaded" };
    if (data.type === "external" && isAllowedMapAttributionUrl(data.url)) return { type: "external", url: data.url };
  } catch { /* A malformed frame message is not an app action. */ }
  return null;
}

// Literal source avoids depending on function.toString() after a native/web minifier transforms closures.
// Tests execute these exact functions from the shipped document.
const engineFunctions = String.raw`
function viewportPoints(points,size,overscan){
 var margin=overscan===undefined?46:overscan;
 if(!size||!Number.isFinite(size.x)||!Number.isFinite(size.y)||size.x<=0||size.y<=0)return [];
 return points.filter(function(point){return Number.isFinite(point.x)&&Number.isFinite(point.y)&&point.x>=-margin&&point.y>=-margin&&point.x<=size.x+margin&&point.y<=size.y+margin;});
}
function clusterPoints(points,radius){
 radius=radius===undefined?44:radius;var groups=[];
 points.forEach(function(point){var group=groups.find(function(g){return Math.pow(g.x-point.x,2)+Math.pow(g.y-point.y,2)<radius*radius;});if(group)group.ids.push(point.id);else groups.push({x:point.x,y:point.y,ids:[point.id]});});
 return groups.map(function(g){return g.ids;});
}
function shouldFocusSelection(previousId,selectedId,zoom,visible){return selectedId!==null&&selectedId!==previousId&&(zoom<14||!visible);}
`;

const runtime = String.raw`
(function () {
 'use strict';
 var config = window.BANFF_MAP_CONFIG, L = window.L;
 function emit(message) { message.source = 'banffbound-map'; message.channel = config.channel; var raw = JSON.stringify(message); if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(raw); else window.parent.postMessage(raw, '*'); }
 if (!L) { emit({type:'status',status:'unavailable'}); return; }
 var map = L.map('map', {zoomControl:false, attributionControl:false, minZoom:4, maxZoom:19, keyboard:true, scrollWheelZoom:false}).setView([51.1778,-115.5712],14);
 L.control.zoom({position:'topleft'}).addTo(map);
 var state={points:[],selectedId:null,position:null,area:null}, byId=new Map(), markers=L.layerGroup().addTo(map), locationLayer=null, initialFit=false, panel=document.getElementById('overlap'), banner=document.getElementById('map-state'), successfulTiles=0;
 function status(value) { banner.hidden=value==='ready'; banner.textContent='Basemap unavailable. You can still choose places from the list.'; emit({type:'status',status:value}); }
 var tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,keepBuffer:0,updateWhenIdle:true,referrerPolicy:'origin',detectRetina:false});
 tiles.on('loading',function(){successfulTiles=0;});
 tiles.on('tileload',function(){successfulTiles++;status('ready');});
 tiles.on('load',function(){if(!successfulTiles)status('unavailable');});
 tiles.addTo(map);
 setTimeout(function(){if(!successfulTiles)status('unavailable');},12000);
 function hidePanel(){panel.hidden=true;panel.replaceChildren();}
 function choose(id){if(byId.has(id)){hidePanel();emit({type:'select',id:id});}}
 function showGroup(ids){
   hidePanel();panel.hidden=false;var heading=document.createElement('strong');heading.textContent=ids.length+' places at this location';panel.appendChild(heading);
   var close=document.createElement('button');close.type='button';close.textContent='Close places';close.onclick=hidePanel;panel.appendChild(close);
   ids.forEach(function(id){var point=byId.get(id);if(!point)return;var button=document.createElement('button');button.type='button';button.textContent=point.name+' · '+config.categories[point.category].label;button.onclick=function(){choose(id);};panel.appendChild(button);});
 }
 function groupIcon(ids){
   var first=byId.get(ids[0]), selected=ids.indexOf(state.selectedId)>=0, category=config.categories[first.category], node=document.createElement('span');node.className='pin-body'+(ids.length>1?' cluster':'')+(selected?' selected':'');node.style.backgroundColor=ids.length>1?'#163b31':category.color;node.textContent=ids.length>1?String(ids.length):category.symbol;
   return L.divIcon({html:node,className:'map-pin',iconSize:[44,44],iconAnchor:[22,22]});
 }
 function render(){
   markers.clearLayers();var projected=viewportPoints(state.points.map(function(p){var xy=map.latLngToContainerPoint([p.latitude,p.longitude]);return {id:p.id,x:xy.x,y:xy.y};}),map.getSize(),46);
   clusterPoints(projected,46).forEach(function(ids){
     var points=ids.map(function(id){return byId.get(id);}), lat=points.reduce(function(s,p){return s+p.latitude;},0)/points.length, lon=points.reduce(function(s,p){return s+p.longitude;},0)/points.length;
     var title=ids.length===1?points[0].name+' · '+config.categories[points[0].category].label:ids.length+' places. Zoom in or choose a place';
     var marker=L.marker([lat,lon],{icon:groupIcon(ids),title:title,alt:title,keyboard:true,riseOnHover:true,zIndexOffset:ids.indexOf(state.selectedId)>=0?1000:0});
     marker.on('click',function(){if(ids.length===1){choose(ids[0]);return;}var bounds=L.latLngBounds(points.map(function(p){return [p.latitude,p.longitude];}));if(map.getZoom()>=18||bounds.getNorthEast().equals(bounds.getSouthWest(),0.00002)){showGroup(ids);}else{map.fitBounds(bounds,{padding:[48,48],maxZoom:Math.min(map.getZoom()+3,19),animate:false});}});
     marker.addTo(markers);var element=marker.getElement();if(element){element.setAttribute('role','button');element.setAttribute('tabindex','0');element.setAttribute('aria-label',title+(ids.indexOf(state.selectedId)>=0?' · selected':''));if(ids.indexOf(state.selectedId)>=0)element.setAttribute('aria-current','location');element.addEventListener('keydown',function(event){if(event.key===' '){event.preventDefault();marker.fire('click');}});}
   });
   document.getElementById('result-count').textContent=state.points.length+(state.points.length===1?' mapped place':' mapped places');
 }
 function fit(){hidePanel();if(state.points.length===1){map.setView([state.points[0].latitude,state.points[0].longitude],15,{animate:false});}else if(state.points.length){map.fitBounds(state.points.map(function(p){return [p.latitude,p.longitude];}),{padding:[38,38],maxZoom:15,animate:false});}render();}
 document.getElementById('fit').onclick=fit;
 function update(next){
   if(!next||!Array.isArray(next.points)||next.points.length>2000)return;
   var seen=new Set();var clean=next.points.filter(function(p){if(!p||typeof p.id!=='string'||seen.has(p.id)||typeof p.name!=='string'||p.name.length>180||!config.categories[p.category]||!Number.isFinite(p.latitude)||!Number.isFinite(p.longitude)||Math.abs(p.latitude)>85.05112878||Math.abs(p.longitude)>180)return false;seen.add(p.id);return true;});
   var previousSelection=state.selectedId,previousArea=state.area,area=['all','banff','louise','canmore','regional'].indexOf(next.area)>=0?next.area:'all';state={points:clean,selectedId:seen.has(next.selectedId)?next.selectedId:null,position:next.position,area:area};byId=new Map(clean.map(function(p){return [p.id,p];}));hidePanel();
   if(locationLayer){locationLayer.remove();locationLayer=null;}var p=next.position;if(p&&Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)&&Math.abs(p.latitude)<=85.05112878&&Math.abs(p.longitude)<=180){locationLayer=L.circleMarker([p.latitude,p.longitude],{radius:7,color:'#fff',weight:3,fillColor:'#2377bd',fillOpacity:1,interactive:false}).addTo(map);}
   var selected=byId.get(state.selectedId),visible=selected?map.getBounds().contains([selected.latitude,selected.longitude]):false;
   if(selected&&shouldFocusSelection(previousSelection,state.selectedId,map.getZoom(),visible)){initialFit=true;map.setView([selected.latitude,selected.longitude],15,{animate:false});render();}
   else if(previousArea!==area){initialFit=true;if(area==='regional'){fit();}else{var centres={all:[51.1778,-115.5712,14],banff:[51.1778,-115.5712,14],louise:[51.425,-116.179,13],canmore:[51.089,-115.357,14]},c=centres[area];map.setView([c[0],c[1]],c[2],{animate:false});render();}}
   else if(!initialFit&&clean.length){initialFit=true;render();}else render();
 }
 window.BanffBoundMap={update:function(message){if(message&&message.source==='banffbound-host'&&message.channel===config.channel&&message.type==='update')update(message.state);}};
 window.addEventListener('message',function(event){if(event.source!==window.parent||typeof event.data!=='string'||event.data.length>600000)return;try{window.BanffBoundMap.update(JSON.parse(event.data));}catch(error){}});
 map.on('moveend zoomend',render);map.on('click',hidePanel);
 document.querySelectorAll('[data-external]').forEach(function(link){link.addEventListener('click',function(event){event.preventDefault();emit({type:'external',url:link.getAttribute('href')});});});
 if(window.ResizeObserver)new ResizeObserver(function(){map.invalidateSize();}).observe(document.getElementById('map'));
 emit({type:'loaded'});
})();`;

/** All executable library code is bundled. Only the currently viewed OSM tile images use the network. */
export function createMapDocument(channel: string): string {
  if (!/^[a-z0-9-]{8,100}$/i.test(channel)) throw new Error("Invalid map channel");
  const categories = Object.fromEntries(mapCategories.map(({ id, label, symbol, color }) => [id, { label, symbol, color }]));
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=4"><meta name="referrer" content="origin"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src https://tile.openstreetmap.org data:; connect-src 'none'; base-uri https://banffbound.com; form-action 'none'"><base href="${MAP_BASE_URL}"><style>${leafletCss}\nhtml,body,#map{height:100%;width:100%;margin:0}body{font-family:system-ui,sans-serif;color:#20342d}#map{background:#e5ebe1}.leaflet-control-zoom a{width:44px;height:44px;line-height:44px}.map-pin{background:transparent;border:0}.pin-body{display:flex;align-items:center;justify-content:center;width:34px;height:34px;margin:3px;border:2px solid white;border-radius:50%;box-shadow:0 2px 7px #0006;color:white;font-size:13px;font-weight:800}.pin-body.selected{outline:4px solid #e3b654;transform:scale(1.12)}.map-pin:focus-visible{outline:3px solid #163b31;outline-offset:2px;border-radius:50%}.cluster{font-size:15px}.toolbar{position:absolute;z-index:800;top:12px;right:12px;display:flex;align-items:center;gap:8px}.toolbar span{background:#fff;padding:7px;border-radius:8px;font-size:11px}.toolbar button,#overlap button{min-height:44px;border:1px solid #d7ded5;border-radius:9px;background:#fff;color:#163b31;padding:8px 12px;font-weight:650}#attribution{position:absolute;z-index:800;bottom:0;right:0;background:#fffffff2;padding:5px 7px;font-size:10px;line-height:15px;max-width:100%;box-sizing:border-box}#attribution a{color:#163b31}#map-state{position:absolute;z-index:801;bottom:35px;left:12px;right:12px;background:#fff;padding:10px;border-radius:8px;font-size:12px;pointer-events:none}#overlap{position:absolute;z-index:900;left:16px;right:16px;top:72px;bottom:45px;overflow:auto;padding:14px;background:#fff;border-radius:14px;box-shadow:0 3px 14px #0004}#overlap button{display:block;width:100%;text-align:left;margin-top:8px}#overlap[hidden],#map-state[hidden]{display:none}</style></head><body><div id="map" aria-label="Interactive map of Banff and surrounding places"></div><div class="toolbar"><span id="result-count" aria-live="polite">Loading map</span><button type="button" id="fit">Fit results</button></div><div id="map-state" role="status" hidden></div><div id="overlap" role="region" aria-label="Choose an overlapping place" hidden></div><div id="attribution">© <a data-external href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors · ODbL</a> · <a data-external href="https://www.openstreetmap.org/fixthemap">Fix the map</a></div><script>${leafletJs.replace(/<\/script/gi, "<\\/script")}</script><script>window.BANFF_MAP_CONFIG=${safeScriptJson({ channel, categories })};${engineFunctions}${runtime}</script></body></html>`;
}
