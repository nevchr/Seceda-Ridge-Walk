import * as THREE from 'three';
export const ORIGIN={east:708700,north:5164300,alt:2500};
export class Terrain{
 async load(){this.meta=await(await fetch('./assets/terrain/manifest.json')).json();this.layers=await Promise.all(this.meta.layers.map(async l=>({...l,data:new Float32Array(await(await fetch(`./assets/terrain/${l.name}.f32`)).arrayBuffer())})));return this;}
 layerAt(x,z){const e=x+ORIGIN.east,n=ORIGIN.north-z;return this.layers.find(l=>e>=l.bbox[0]+l.step&&e<=l.bbox[2]-l.step&&n>=l.bbox[1]+l.step&&n<=l.bbox[3]-l.step)||this.layers[2];}
 sampleLayer(l,x,z){const fx=Math.max(0,Math.min(l.width-1.001,(x+ORIGIN.east-l.origin[0])/l.step-.5));const fz=Math.max(0,Math.min(l.height-1.001,(l.origin[1]-ORIGIN.north+z)/l.step-.5));const i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j;const a=l.data[j*l.width+i],b=l.data[j*l.width+i+1],c=l.data[(j+1)*l.width+i],d=l.data[(j+1)*l.width+i+1];return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a,b,u),THREE.MathUtils.lerp(c,d,u),v)-ORIGIN.alt;}
 height(x,z){return this.sampleLayer(this.layerAt(x,z),x,z);}
 slope(x,z){const dx=(this.height(x+1,z)-this.height(x-1,z))/2,dz=(this.height(x,z+1)-this.height(x,z-1))/2;return Math.hypot(dx,dz);}
 geometry(l,inner){
 const positions=[],indices=[],step=l.step,w=l.width+1,h=l.height+1,x0=l.bbox[0]-ORIGIN.east,z0=ORIGIN.north-l.bbox[3];
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){let x=x0+i*step,z=z0+j*step;positions.push(x,this.height(x,z),z);}
 for(let j=0;j<h-1;j++)for(let i=0;i<w-1;i++){let x=x0+(i+.5)*step,z=z0+(j+.5)*step;if(inner&&x>inner.bbox[0]-ORIGIN.east&&x<inner.bbox[2]-ORIGIN.east&&z>ORIGIN.north-inner.bbox[3]&&z<ORIGIN.north-inner.bbox[1])continue;let a=j*w+i,b=a+1,c=a+w,d=c+1;indices.push(a,c,b,b,c,d);}
 // Vertical skirts close T junctions between native 2.5 m, 5 m and 40 m grids.
 const edge=[];for(let i=0;i<w;i++)edge.push(i);for(let j=1;j<h;j++)edge.push(j*w+w-1);for(let i=w-2;i>=0;i--)edge.push((h-1)*w+i);for(let j=h-2;j>0;j--)edge.push(j*w);
 for(let k=0;k<edge.length;k++){const a=edge[k],b=edge[(k+1)%edge.length],c=positions.length/3;positions.push(positions[a*3],positions[a*3+1]-80,positions[a*3+2],positions[b*3],positions[b*3+1]-80,positions[b*3+2]);indices.push(a,b,c,b,c+1,c);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
 }
}
export const routePoints=[[15,165],[16,125],[30,88],[57,54],[74,15],[91,-25],[113,-61],[150,-120]];
export function createRoute(terrain){const curve=new THREE.CatmullRomCurve3(routePoints.map(([x,z])=>new THREE.Vector3(x,0,z)),false,'centripetal');const points=curve.getPoints(420).map(p=>{p.y=terrain.height(p.x,p.z);return p;});let length=0;for(let i=1;i<points.length;i++)length+=points[i].distanceTo(points[i-1]);return{points,length,curve};}
export function routeDistance(route,x,z){let min=Infinity,index=0;for(let i=0;i<route.points.length;i++){const p=route.points[i],d=(x-p.x)**2+(z-p.z)**2;if(d<min){min=d;index=i;}}return{distance:Math.sqrt(min),index};}
