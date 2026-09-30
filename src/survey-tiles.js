import {ORIGIN} from './terrain.js';

// Visual survey only. The original Terrain instance remains the controller's
// authority. Tile metadata uses EPSG:25832 and can accept adjoining cores.
export class SurveyTiles {
 constructor(collision){this.collision=collision;this.cache=new Map();this.pending=new Map();this.clock=0;this.info={nativeTiles:0,baseBytes:0,fineBytes:0,peakFineBytes:0,loads:0,evictions:0};}
 async load(){
  this.meta=await(await fetch('./assets/terrain-v14/manifest.json')).json();this.nodes=await(await fetch('./assets/terrain-v14/chunks.json')).json();this.byKey=new Map();
  await Promise.all(this.meta.tiles.map(async t=>{const l=t.levels.find(l=>l.spacing===5),data=new Float32Array(await(await fetch('./assets/terrain-v14/'+l.file)).arrayBuffer());this.byKey.set(t.e+','+t.n,{...t,base:{width:l.width,spacing:5,data}});this.info.baseBytes+=data.byteLength;}));
  this.info.nativeTiles=this.meta.tiles.length;return this;
 }
 tileAt(x,z){const e=x+ORIGIN.east,n=ORIGIN.north-z,b=this.meta.bbox,s=this.meta.tileSpan;if(e<b[0]||e>b[2]||n<b[1]||n>b[3])return null;return this.byKey.get(Math.min(b[2]-s,Math.floor((e-b[0])/s)*s+b[0])+','+Math.min(b[3]-s,Math.floor((n-b[1])/s)*s+b[1]));}
 sample(t,l,x,z){const size=l.width,u=Math.max(0,Math.min(size-1,(x+ORIGIN.east-t.e)/l.spacing)),v=Math.max(0,Math.min(size-1,(t.n+this.meta.tileSpan-ORIGIN.north+z)/l.spacing)),i=Math.min(size-2,Math.floor(u)),j=Math.min(size-2,Math.floor(v)),fx=u-i,fz=v-j,a=l.data[j*size+i],b=l.data[j*size+i+1],c=l.data[(j+1)*size+i],d=l.data[(j+1)*size+i+1];return (a+(b-a)*fx)*(1-fz)+(c+(d-c)*fx)*fz-ORIGIN.alt;}

 heightAt(x,z,spacing=5){
  // Preserve every traversable point and surrounding props, with a smooth
  // transition wholly inside the previously retained native near survey.
  const dx=Math.max(-85-x,0,x-1020),dz=Math.max(-175-z,0,z-585),distance=Math.hypot(dx,dz);
  if(distance===0)return this.collision.height(x,z);
  const t=this.tileAt(x,z);if(!t)return this.collision.height(x,z);const l=spacing<5?(this.cache.get(t.id)?.level||t.base):t.base;
  const h=this.sample(t,l,x,z);if(distance>=45)return h;const u=distance/45,w=u*u*(3-2*u);return this.collision.height(x,z)*(1-w)+h*w;
 }
 height(x,z){return this.heightAt(x,z,5);}
 slope(x,z){const d=2.5;return Math.hypot(this.height(x+d,z)-this.height(x-d,z),this.height(x,z+d)-this.height(x,z-d))/(2*d);}
 async ensureArea(x,z,width,depth,spacing){if(spacing>=5)return;const tasks=[];for(const t of this.byKey.values()){
  const tx=t.e-ORIGIN.east,tz=ORIGIN.north-t.n-2000;if(tx>x+width+5||tx+2000<x-5||tz>z+depth+5||tz+2000<z-5)continue;
  if(this.cache.has(t.id)){this.cache.get(t.id).used=this.clock;continue;}
  if(!this.pending.has(t.id)){const l=t.levels[0];const task=fetch('./assets/terrain-v14/'+l.file).then(r=>{if(!r.ok)throw Error('Survey tile '+r.status);return r.arrayBuffer();}).then(b=>{const level={width:l.width,spacing:2.5,data:new Float32Array(b)};this.cache.set(t.id,{level,used:this.clock});this.info.loads++;this.info.fineBytes+=b.byteLength;this.info.peakFineBytes=Math.max(this.info.peakFineBytes,this.info.fineBytes);}).finally(()=>this.pending.delete(t.id));this.pending.set(t.id,task);}
  tasks.push(this.pending.get(t.id));
 }await Promise.all(tasks);}
 retain(areas){this.clock++;const needed=new Set();for(const a of areas)if(a.spacing<5)for(const t of this.byKey.values()){const x=t.e-ORIGIN.east,z=ORIGIN.north-t.n-2000;if(x<=a.x+a.width+5&&x+2000>=a.x-5&&z<=a.z+a.depth+5&&z+2000>=a.z-5)needed.add(t.id);}
  for(const [id,c]of this.cache){if(needed.has(id))c.used=this.clock;else if(this.clock-c.used>6){this.info.fineBytes-=c.level.data.byteLength;this.cache.delete(id);this.info.evictions++;}}
 }
}
