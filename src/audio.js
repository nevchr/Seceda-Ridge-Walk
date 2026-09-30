export class Ambience{
 constructor(){this.enabled=true;this.lastStep=0;}
 start(){if(this.ctx){this.ctx.resume();return;}const c=this.ctx=new AudioContext();this.master=c.createGain();this.master.gain.value=this.enabled?.22:0;this.master.connect(c.destination);const b=c.createBuffer(1,c.sampleRate*4,c.sampleRate),a=b.getChannelData(0);let prev=0;for(let i=0;i<a.length;i++){prev=(prev+(Math.random()*2-1)*.02)/1.02;a[i]=prev*3.5;}const source=c.createBufferSource();source.buffer=b;source.loop=true;const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=380;const gain=c.createGain();gain.gain.value=.32;source.connect(filter).connect(gain).connect(this.master);source.start();this.wind=gain;}
 setEnabled(v){this.enabled=v;if(this.master)this.master.gain.setTargetAtTime(v?.22:0,this.ctx.currentTime,.2);}
 pause(){this.ctx?.suspend();}
 update(distance,time){if(!this.ctx)return;this.wind.gain.value=.29+Math.sin(time*.13)*.08+Math.sin(time*.31)*.025;if(distance-this.lastStep<.79)return;this.lastStep=distance;const c=this.ctx,b=c.createBuffer(1,c.sampleRate*.1,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*Math.exp(-i/a.length*6)*.12;const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=850;s.connect(f).connect(this.master);s.start();}
}
