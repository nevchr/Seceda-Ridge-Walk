import {inWalkingArea} from './exploration.js';
import * as THREE from 'three';
export class Walker{
 constructor(terrain,colliders,start){this.terrain=terrain;this.colliders=colliders;this.start=start;this.position=new THREE.Vector3();this.velocity=new THREE.Vector2();this.yaw=0;this.pitch=.07;this.height=1.72;this.distance=0;this.reset();}
 reset(){this.position.copy(this.start);this.position.y=this.terrain.height(this.position.x,this.position.z)+this.height;this.velocity.set(0,0);this.yaw=-.65;this.pitch=.025;}
 allowed(x,z,from){const h=this.terrain.height(x,z),prev=this.terrain.height(from.x,from.z);if(!inWalkingArea(x,z))return false;const slope=this.terrain.slope(x,z);if(slope>.98)return false;if(x>320||z>245){if(slope>.85)return false;for(const [dx,dz]of [[3,0],[-3,0],[0,3],[0,-3]])if(this.terrain.slope(x+dx,z+dz)>.90)return false;}if(Math.abs(h-prev)>Math.hypot(x-from.x,z-from.z)*1.0+.035)return false;for(const c of this.colliders)if(Math.hypot(x-c.x,z-c.z)<c.r+.32)return false;for(const[a,b]of[[.32,0],[-.32,0],[0,.32],[0,-.32]])if(h-this.terrain.height(x+a,z+b)>.48)return false;return true;}
 step(dt,keys){dt=Math.min(dt,1/30);let forward=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0),side=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0);if(keys.has('ArrowLeft'))this.yaw+=dt;if(keys.has('ArrowRight'))this.yaw-=dt;
 const l=Math.hypot(forward,side)||1,speed=keys.has('ShiftLeft')||keys.has('ShiftRight')?2.8:1.75;forward/=l;side/=l;
 const vx=(-Math.sin(this.yaw)*forward+Math.cos(this.yaw)*side)*speed,vz=(-Math.cos(this.yaw)*forward-Math.sin(this.yaw)*side)*speed;const blend=1-Math.exp(-dt*12);this.velocity.x=THREE.MathUtils.lerp(this.velocity.x,vx,blend);this.velocity.y=THREE.MathUtils.lerp(this.velocity.y,vz,blend);
 const before=this.position.clone(),slope=this.terrain.slope(before.x,before.z),factor=1/Math.sqrt(1+slope*slope*.65),dx=this.velocity.x*dt*factor,dz=this.velocity.y*dt*factor;let blocked=false;
 if(this.allowed(before.x+dx,before.z+dz,before)){this.position.x+=dx;this.position.z+=dz;}else{blocked=Math.hypot(dx,dz)>.003;if(this.allowed(this.position.x+dx,this.position.z,this.position))this.position.x+=dx;if(this.allowed(this.position.x,this.position.z+dz,this.position))this.position.z+=dz;}
 const ground=this.terrain.height(this.position.x,this.position.z)+this.height;this.position.y=THREE.MathUtils.lerp(this.position.y,ground,1-Math.exp(-dt*22));const traveled=Math.hypot(this.position.x-before.x,this.position.z-before.z);this.distance+=traveled;return{traveled,blocked};}
}
