// EPSG:25832 local metres (east=708700+x, north=5164300-z).
// A connected pasture envelope inside the native 2.5 m survey. This is a
// development boundary, not a claim that every slope inside it is safe.
export const walkingEnvelope=[[-45,-130],[320,-130],[360,-70],[650,-50],[950,80],[980,520],[0,550],[-45,430]];
export function inWalkingArea(x,z,margin=0){
 let inside=false,min=Infinity;
 for(let i=0,j=walkingEnvelope.length-1;i<walkingEnvelope.length;j=i++){
  const [ax,az]=walkingEnvelope[j],[bx,bz]=walkingEnvelope[i],dx=bx-ax,dz=bz-az;
  if((az>z)!==(bz>z)&&x<(bx-ax)*(z-az)/(bz-az)+ax)inside=!inside;
  const t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)));
  min=Math.min(min,Math.hypot(x-ax-t*dx,z-az-t*dz));
 }
 return inside||min<margin;
}
export const explorationInfo={survey:'near2.5m',envelope:walkingEnvelope,coordinateOrigin:[708700,5164300,2500],maxSlope:.98,scenic:'Northern cliff faces, western escarpment, and terrain outside the pasture envelope remain scenic. Steep local banks and props are also blocked.'};
