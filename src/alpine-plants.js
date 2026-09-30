import * as THREE from 'three';

// Original mesh studies: folded lanceolate leaves, curved stems and four
// flower habits. All measurements are metres; no reference-image pixels.
export function alpinePlant(type,low=false,variant=0,atlas=false){
 const p=[],c=[],ix=[],uv=[];let seed=1193+type*91+variant*823;
 const rnd=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 function vertex(v,col,tex=[.10,.42]){p.push(...v);c.push(...(atlas?[1,1,1]:col));uv.push(...tex);return p.length/3-1;}
 function tri(a,b,d){ix.push(a,b,d);}
 function stem(a,b,r,col){
  const n=low?3:4,base=p.length/3;
  for(const v of [a,b])for(let k=0;k<n;k++){const t=k/n*Math.PI*2;vertex([v[0]+Math.cos(t)*r,v[1],v[2]+Math.sin(t)*r],col);}
  for(let k=0;k<n;k++){let j=(k+1)%n;tri(base+k,base+j,base+n+k);tri(base+j,base+n+j,base+n+k);}
 }
 function leaf(root,a,len,width,lift,col){
  const rows=low?3:5,base=p.length/3;
  for(let j=0;j<rows;j++){
   const t=j/(rows-1),w=Math.pow(Math.sin(t*Math.PI),.72)*width;
   for(let k=-1;k<=1;k++){
    const d=t*len,side=w*k;
    vertex([root[0]+Math.sin(a)*d+Math.cos(a)*side,root[1]+lift*t+Math.sin(t*Math.PI)*len*.2-Math.abs(k)*w*.22,root[2]+Math.cos(a)*d-Math.sin(a)*side],col.map((v,i)=>v*(k===0?1.23:k<0?.88:1.05)));
   }
  }
  for(let j=0;j<rows-1;j++)for(let k=0;k<2;k++){let b=base+j*3+k;tri(b,b+3,b+1);tri(b+1,b+3,b+4);}
 }
 function flowerHead(pos,r,type){
  if(atlas&&type===0){
   // A gently cupped mesh using only the licensed dandelion atlas flower.
   const n=low?9:16,center=vertex([pos[0],pos[1]+.005,pos[2]],[1,1,1],[.672,.151]);
   const rim=[];for(let j=0;j<n;j++){const a=j/n*Math.PI*2;rim.push(vertex([pos[0]+Math.cos(a)*r,pos[1]+.011+Math.sin(a*3)*.002,pos[2]+Math.sin(a)*r],[1,1,1],[.672+Math.cos(a)*.145,.151+Math.sin(a)*.147]));}
   for(let j=0;j<n;j++)tri(center,rim[j],rim[(j+1)%n]);return;
  }
  if(type===1){ // Clover: an oval head with individual cream-tipped florets.
   const n=low?9:26;
   for(let k=0;k<n;k++){
    const a=k*2.399,t=(k+.5)/n,y=(t-.5)*r*1.85,rr=Math.sqrt(1-(t*2-1)**2)*r;
    const center=[pos[0]+Math.cos(a)*rr,pos[1]+y,pos[2]+Math.sin(a)*rr];
    const b=vertex([center[0],center[1]-.009,center[2]],[.36,.075,.17]);
    const b1=vertex([center[0]-.005,center[1]+.007,center[2]],[.78,.38,.52]);
    const b2=vertex([center[0]+.005,center[1]+.009,center[2]+.004],[.94,.64,.72]);tri(b,b1,b2);
   }return;
  }
  const n=low?(type===3?5:9):(type===0?22:type===3?5:16);
  const center=vertex(pos,type===3?[.21,.09,.35]:[.56,.31,.008]);
  for(let k=0;k<n;k++){
   const a=k/n*Math.PI*2+(type===0?(k%2)*.09:0),length=r*(.84+(Math.sin(k*13.17)*.5+.5)*.26),w=type===0?.004:type===3?.014:.0055;
   const color=type===0?[.98,.69,.012]:type===3?[.40,.25,.69]:[.91,.91,.78];
   const base=p.length/3;
   for(const [d,side,y] of [[r*.18,-w*.45,0],[length*.76,-w,.003],[length,w*.55,type===3?.024:.007],[length*.62,w,.001]]){
    vertex([pos[0]+Math.cos(a)*d-Math.sin(a)*side,pos[1]+y,pos[2]+Math.sin(a)*d+Math.cos(a)*side],color);
   }
   tri(center,base,base+1);tri(center,base+1,base+2);tri(center,base+2,base+3);
  }
 }
 function head(pos,r,type){
  const first=p.length/3;flowerHead(pos,r,type);
  // Heads lean with their stems; a field of identical horizontal disks reads
  // as artificial even from ordinary eye height.
  const angle=(rnd()-.5)*.78,heading=rnd()*Math.PI*2,axis=new THREE.Vector3(Math.cos(heading),0,Math.sin(heading));
  const q=new THREE.Quaternion().setFromAxisAngle(axis,angle),v=new THREE.Vector3();
  for(let i=first;i<p.length/3;i++){v.set(p[i*3]-pos[0],p[i*3+1]-pos[1],p[i*3+2]-pos[2]).applyQuaternion(q);p[i*3]=pos[0]+v.x;p[i*3+1]=pos[1]+v.y;p[i*3+2]=pos[2]+v.z;}
 }
 const green=[.058,.143,.020],pale=[.12,.21,.04];
 if(type===4){ // Mixed leafy rosette, not a repeated radial grass tuft.
  const n=low?4:8;
  for(let j=0;j<n;j++)leaf([(rnd()-.5)*.11,rnd()*.025,(rnd()-.5)*.11],j*2.399+variant,.12+rnd()*.16,.016+rnd()*.018,.035+rnd()*.13,j%3?green:pale);
 }else{
  const heads=type===1?2:3;
  for(let j=0;j<heads;j++){
   const a=j*2.39+variant,height=(type===1?.24:type===3?.32:.39)*(.8+rnd()*.43),x=Math.sin(a)*(.03+rnd()*.08),z=Math.cos(a)*(.03+rnd()*.08);
   const root=[x*.2,0,z*.2],bend=[x*.7,height*.54,z*.7],top=[x,height,z];
   stem(root,bend,.0014,green);stem(bend,top,.0011,pale);
   if(!low||j===0){
    if(type===1){for(const h of [.23,.46])for(let k=0;k<3;k++)leaf([x*h,height*h,z*h],a+k*2.094,.033,.013,.009,green);}
    else{leaf([x*.3,height*.12,z*.3],a+.7,.11,.013,.045,green);leaf([x*.6,height*.38,z*.6],a+3.2,.08,.010,.018,green);}
   }
   head(top,type===1?.022:type===0?.029:type===3?.024:.026,type);
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));if(atlas)g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;
}
