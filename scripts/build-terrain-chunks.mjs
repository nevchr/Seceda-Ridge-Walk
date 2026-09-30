import fs from 'node:fs/promises';
const root='assets/terrain-v14',m=JSON.parse(await fs.readFile(root+'/manifest.json'));
const map=new Map();for(const t of m.tiles){const l=t.levels[0],b=await fs.readFile(root+'/'+l.file);map.set(t.e+','+t.n,{...t,width:l.width,data:new Float32Array(b.buffer,b.byteOffset,b.length/4)});}
function height(e,n){e=Math.max(m.bbox[0],Math.min(m.bbox[2],e));n=Math.max(m.bbox[1],Math.min(m.bbox[3],n));const te=Math.min(m.bbox[2]-2000,Math.floor((e-m.bbox[0])/2000)*2000+m.bbox[0]),tn=Math.min(m.bbox[3]-2000,Math.floor((n-m.bbox[1])/2000)*2000+m.bbox[1]),t=map.get(te+','+tn);return t.data[Math.round((tn+2000-n)/2.5)*t.width+Math.round((e-te)/2.5)];}
const nodes=[],span=320,baseX=m.bbox[0],baseN=m.bbox[3];
for(let n=baseN;n>m.bbox[1];n-=span)for(let e=baseX;e<m.bbox[2];e+=span){
 const width=Math.min(span,m.bbox[2]-e),depth=Math.min(span,n-m.bbox[1]),cols=width/2.5+1,rows=depth/2.5+1,data=new Float32Array(cols*rows);let min=Infinity,max=-Infinity;
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const v=height(e+i*2.5,n-j*2.5);data[j*cols+i]=v;min=Math.min(min,v);max=Math.max(max,v);}
 const errors=[0];for(const spacing of [5,10,20,40]){const stride=spacing/2.5;let error=0;for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
  const ix=Math.min(Math.floor(i/stride)*stride,cols-1-stride),iz=Math.min(Math.floor(j/stride)*stride,rows-1-stride),u=(i-ix)/stride,v=(j-iz)/stride;
  const a=data[iz*cols+ix],b=data[iz*cols+ix+stride],c=data[(iz+stride)*cols+ix],d=data[(iz+stride)*cols+ix+stride],approx=(a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v;error=Math.max(error,Math.abs(data[j*cols+i]-approx));
 }errors.push(error);}
 nodes.push({id:`${e}-${n}`,x:e-708700,z:5164300-n,width,depth,min:min-2500,max:max-2500,errors});
}
const report={span,spacings:[2.5,5,10,20,40],errorUnits:'metres, maximum absolute deviation from native 2.5 m node heights using bilinear coarse cells',sourceManifest:'manifest.json',nodes};await fs.writeFile(root+'/chunks.json',JSON.stringify(report));console.log({chunks:nodes.length,maxErrors:report.spacings.map((_,i)=>Math.max(...nodes.map(n=>n.errors[i])))});
