// Usage: node scripts/build-map.js <dir containing cshapes/cshapes.geojson>
// Writes <dir>/cshapes/prepared.geojson; then simplify it into maps/world.json with mapshaper (see README).
const fs=require('fs'),d3=require('d3-geo');const S=process.argv[2];const {T,CAPS}=require('./history.js');
const raw=JSON.parse(fs.readFileSync(S+'/cshapes/cshapes.geojson'));
const dec=(y,m,d)=>y+(m-1)/12+(d-1)/365;
const pick=(spans,y)=>{if(!spans)return undefined;for(const s of spans)if(y>=s[0]&&y<s[1])return s;return undefined};
const out=[];const warn=new Set();let outside=0;
for(const f of raw.features){const p=f.properties;if(p.gweyear<1900||!f.geometry)continue;
 const g=f.geometry;const P=g.type==='Polygon'?[g.coordinates]:g.coordinates;for(const q of P)if(d3.geoArea({type:'Polygon',coordinates:q})>2*Math.PI)q.forEach(r=>r.reverse());
 const s=dec(p.gwsyear,p.gwsmonth,p.gwsday),e=dec(p.gweyear,p.gwemonth,p.gweday);
 const t=T[p.cntry_name]||{};if(!T[p.cntry_name]&&/\(/.test(p.cntry_name))warn.add(p.cntry_name);
 const capOk=d3.geoContains(f,[p.caplong,p.caplat])||[[.3,0],[-.3,0],[0,.3],[0,-.3]].some(([a,b])=>d3.geoContains(f,[p.caplong+a,p.caplat+b]));
 if(!capOk)outside++;
 // split lifetime at every boundary in the tables
 const cuts=new Set([Math.max(1900,Math.floor(s)),Math.ceil(e)+1]);
 for(const k of ['n','r','c'])(t[k]||[]).forEach(x=>{cuts.add(x[0]);cuts.add(x[1])});
 (CAPS[p.capname]||[]).forEach(x=>{cuts.add(x[0]);cuts.add(x[1])});
 const cs=[...cuts].filter(y=>y>=Math.max(1900,Math.floor(s))&&y<=Math.ceil(e)+1).sort((a,b)=>a-b);
 const periods=[];
 for(let i=0;i<cs.length-1;i++){const y=cs[i];
  const n=pick(t.n,y)?.[2]??p.cntry_name.replace(/\s*\(.*?\)\s*/g,' ').trim();
  const r=pick(t.r,y)?.[2]??'';
  const co=pick(t.c,y);let cap;
  if(co){cap=co[2]?[co[2],co[3],co[4]]:null}else{cap=capOk?[pick(CAPS[p.capname],y)?.[2]??p.capname,+p.caplong.toFixed(3),+p.caplat.toFixed(3)]:null}
  const row=[cs[i],cs[i+1],n,r,cap?cap[0]:'',cap?cap[1]:0,cap?cap[2]:0];
  const last=periods[periods.length-1];
  if(last&&JSON.stringify(last.slice(2))===JSON.stringify(row.slice(2)))last[1]=row[1];else periods.push(row)}
 out.push({type:'Feature',geometry:f.geometry,properties:{s:+s.toFixed(3),e:+e.toFixed(3),p:JSON.stringify(periods)}})}
console.error('records',out.length,'capitals outside their territory',outside,'unmapped parenthetical names',[...warn]);
fs.writeFileSync(S+'/cshapes/prepared.geojson',JSON.stringify({type:'FeatureCollection',features:out}));
