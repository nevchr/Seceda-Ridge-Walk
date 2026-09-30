import {noise2} from './landscape.js';

const smooth=(x,a,b)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
// Original small surface erosion of the new native survey. No replacement
// mountain volumes: crests, shallow ground, the walking area and the entire
// principal authored ridge are pinned. Metres, stable projected coordinates.
export function scenicRelief(x,y,z,n){
 const protectedWalk=x>-135&&x<1070&&z>-225&&z<635;
 if(protectedWalk)return 0;
 const principal=smooth(x,160,260)*(1-smooth(x,2850,2960))*smooth(z,-1470,-1370)*(1-smooth(z,160,260));
 const exposure=smooth(1-Math.abs(n[1]),.24,.53)*(1-principal);
 if(exposure<.001)return 0;
 // Regional bedding rotates gradually with the surveyed structural mass.
 const rotation=(noise2(x*.0007+51,z*.0007)-.5)*.65;
 const along=x*Math.cos(.62+rotation)+z*Math.sin(.62+rotation);
 const warp=(noise2(along*.009,y*.007)-.5)*18;
 const bed=y+along*(.18+noise2(x*.001,z*.001)*.24)+warp;
 const strata=noise2(bed*.105,along*.011);
 const plane=Math.abs(noise2(along*.045+y*.016,y*.021)*2-1);
 const joint=Math.pow(1-Math.abs(noise2(along*.067-y*.026,y*.031)*2-1),13);
 const cross=Math.pow(1-Math.abs(noise2(along*.029+y*.05,y*.058)*2-1),17);
 // Unequal projecting sheets broken by two intersecting recessed joints.
 return (strata*1.7+plane*3.2-joint*2.6-cross*1.4-.65)*exposure;
}
