import {makeTree} from './tree-model.js';
export const STEP=1/120;
const TAU=Math.PI*2;
export function bezier(c,t){const u=1-t;return {x:u*u*u*c[0][0]+3*u*u*t*c[1][0]+3*u*t*t*c[2][0]+t*t*t*c[3][0],y:u*u*u*c[0][1]+3*u*u*t*c[1][1]+3*u*t*t*c[2][1]+t*t*t*c[3][1]};}
export function tangent(c,t){const u=1-t;return Math.atan2(3*u*u*(c[1][1]-c[0][1])+6*u*t*(c[2][1]-c[1][1])+3*t*t*(c[3][1]-c[2][1]),3*u*u*(c[1][0]-c[0][0])+6*u*t*(c[2][0]-c[1][0])+3*t*t*(c[3][0]-c[2][0]));}
function rotate(p,a){return{x:p.x*Math.cos(a)-p.y*Math.sin(a),y:p.x*Math.sin(a)+p.y*Math.cos(a)}}
export class Study{
 constructor(kind='maple'){this.kind=kind;this.reduced=false;this.reset()}
 reset(){this.time=0;this.wind=[];this.petals=[];this.tokens=3;this.gestureCount=0;this.trails=[];this.regrowing=false;this.growthClock=0;this.ambientTick=0;const model=makeTree(this.kind);this.branches=model.branches;this.leaves=model.leaves;
 this.transform();for(const l of this.leaves){const p=this.anchor(l);Object.assign(l,p,{prev:{...p}})}

 }
 transform(){for(const b of this.branches){if(b.parent<0){b.origin={x:450,y:745};b.angle=b.theta}else{const p=this.branches[b.parent],o=rotate(bezier(p.c,b.t),p.angle);b.origin={x:p.origin.x+o.x,y:p.origin.y+o.y};b.angle=p.angle+b.theta}}}
 point(b,t){const p=rotate(bezier(b.c,t),b.angle);return{x:p.x+b.origin.x,y:p.y+b.origin.y}}
 anchor(l){const b=this.branches[l.branch],p=this.point(b,l.t),a=b.angle+tangent(b.c,l.t),q=a+l.side*Math.PI/2;return{x:p.x+Math.cos(q)*l.offset,y:p.y+Math.sin(q)*l.offset,angle:this.kind==='willow'?l.rest*.8:a+l.rest}}
 emit(a,b,v){if(Math.hypot(v.x,v.y)<20)return;this.wind.push({a:{...a},b:{...b},v:{...v},time:this.time});if(this.wind.length>56)this.wind.shift()}
 field(p){let x=0,y=0;for(const w of this.wind){const dx=w.b.x-w.a.x,dy=w.b.y-w.a.y,t=Math.max(0,Math.min(1,((p.x-w.a.x)*dx+(p.y-w.a.y)*dy)/(dx*dx+dy*dy||1))),r2=(p.x-w.a.x-t*dx)**2+(p.y-w.a.y-t*dy)**2,k=Math.max(0,1-r2/(140*140))**2*Math.exp(-(this.time-w.time)/.16)*STEP/.16*.95;x+=w.v.x*k;y+=w.v.y*k}const s=Math.min(1,750/(Math.hypot(x,y)||1));return{x:x*s,y:y*s}}
 beginGesture(){this.gestureCount=0}
 scatter(l){if(this.kind!=='cherry'||this.reduced)return;l.petal=l.id%47!==0;if(!l.petal)return;for(let i=0;i<2&&this.petals.length<180;i++){const sign=i?1:-1;this.petals.push({x:l.x+sign*4,y:l.y-3*i,vx:l.vx+sign*(18+l.id%17),vy:l.vy-14-i*9,angle:l.angle+i*1.7,spin:sign*(1.1+l.id%5*.18),size:l.size*(.42+i*.06),age:0,alpha:1,id:l.id*3+i})}}
 shedAmbient(){if(this.reduced||this.remaining<=this.leaves.length*.96)return false;this.ambientTick++;for(let i=0;i<this.leaves.length;i++){const l=this.leaves[(this.ambientTick*97+i)%this.leaves.length];if(l.state!=='attached'||l.age<3||l.y>430)continue;l.state='falling';l.age=0;l.vx=(l.id%2?1:-1)*(12+l.id%23);l.vy=-8;l.spin=(l.id%2?1:-1)*(this.kind==='ginkgo'?.7+l.id%5*.16:.18+l.id%5*.08);l.detach={x:l.x,y:l.y,angle:l.angle};this.scatter(l);this.regrowing=true;return true}return false}
 setReduced(v){this.reduced=v;if(v){this.petals=[];for(const b of this.branches){b.theta=b.omega=0}this.transform();for(const l of this.leaves)if(l.state==='falling'){l.state='fading';l.age=0}}}
 step(h=STEP){this.time+=h;this.tokens=Math.min(3,this.tokens+12*h);this.wind=this.wind.filter(w=>this.time-w.time<.45);
 for(const b of this.branches){if(this.reduced)continue;const p=this.point(b,.7),w=this.field(p),a=b.angle+tangent(b.c,.7),target=Math.max(this.kind==='willow'&&b.depth>1?-.28:-.12,Math.min(this.kind==='willow'&&b.depth>1?.28:.12,(-Math.sin(a)*w.x+Math.cos(a)*w.y)*(b.parent<0?0:this.kind==='willow'&&b.depth>1?.00048:.00022))),wn=TAU*(this.kind==='willow'&&b.depth>1?1.05:1.5);b.omega+=(wn*wn*(target-b.theta)-2*.76*wn*b.omega)*h;b.theta+=b.omega*h}this.transform();
 let attached=this.remaining;const branchCounts=new Array(this.branches.length).fill(0);for(const l of this.leaves)if(l.state==='attached'||l.state==='loosening')branchCounts[l.branch]++;
 for(const l of this.leaves){l.age+=h;if(l.state==='growing'){const p=this.anchor(l);Object.assign(l,p);l.growth=Math.min(1,l.age/2.4);l.alpha=this.reduced?l.growth:1;if(l.growth===1){l.state='attached';l.stress=0;l.age=0}continue}if(l.state==='attached'||l.state==='loosening'){const p=this.anchor(l),av={x:(p.x-l.x)/h,y:(p.y-l.y)/h},w=this.field(p);l.x=p.x;l.y=p.y;l.angle=p.angle;l.stress=Math.max(0,l.stress*Math.exp(-h/.38)+Math.max(0,Math.hypot(w.x-av.x,w.y-av.y)-75)/260*h);
 if(l.state==='attached'&&l.stress>l.threshold&&l.age>3){l.state='loosening';l.releaseAge=0;l.releaseDelay=(l.id*37%13)*.035}
 if(l.state==='loosening'){l.releaseAge+=h;if(l.releaseAge>=l.releaseDelay&&this.tokens>=1&&attached>Math.ceil(this.leaves.length*.4)&&branchCounts[l.branch]>3&&(!this.reduced||this.gestureCount<3)){attached--;branchCounts[l.branch]--;this.tokens-=1;this.gestureCount++;l.state=this.reduced?'fading':'falling';l.age=0;l.vx=av.x+w.x*.3;l.vy=av.y+w.y*.3;l.spin=(l.id%2?1:-1)*(this.kind==='ginkgo'?.65+(l.id%5)*.18:l.id%5===0?1.1:.22+(l.id%4)*.11);l.detach={x:l.x,y:l.y,angle:l.angle};this.scatter(l)}else if(l.releaseAge>1.2){l.state='attached';l.stress=0}}
 }else if(l.state==='falling'){const w=this.field(l),drag=1.05+(l.id%4)*.13,gravity=120+(l.id%5)*13,flutter=(this.kind==='ginkgo'?48:25)+(l.id%7)*8,phase=l.id*2.399;l.vx+=(drag*(w.x-l.vx)+flutter*Math.sin(this.time*(3.5+(l.id%5)*.35)+phase))*h;l.vy+=(gravity+drag*(w.y-l.vy))*h;l.x+=l.vx*h;l.y+=l.vy*h;const heightAboveGround=Math.max(0,751-l.y);l.angle+=(l.spin+.35*Math.sin(this.time*3+phase))*Math.min(1,heightAboveGround/95)*h;if(l.y+l.size*(l.petal?.38:.65)>=751){l.y=751-l.size*(l.petal?.38:.65);l.state='grounded';l.age=0;l.vx=l.vy=0}if(l.x<-100||l.x>1000||l.age>15){l.state='fading';l.age=0}}
 else if(l.state==='grounded'&&l.age>3.8+(l.id%4)*.55){l.state='fading';l.age=0}
 else if(l.state==='fading'){const t=Math.min(1,l.age/(this.reduced?.15:1.6));l.alpha=1-t*t*(3-2*t);if(t>=1){l.state='gone';l.age=0}}
 }
 for(const p of this.petals){p.age+=h;const w=this.field(p),phase=p.id*2.399;p.vx+=(1.4*(w.x-p.vx)+45*Math.sin(this.time*3.9+phase))*h;p.vy+=(88+1.4*(w.y-p.vy))*h;p.x+=p.vx*h;p.y+=p.vy*h;p.angle+=(p.spin+.4*Math.sin(this.time*2.8+phase))*h;if(p.y>=749){p.y=749;p.vx*=.86;p.vy=0;p.spin=0}p.alpha=Math.max(0,Math.min(1,(5.5-p.age)/1.4))}this.petals=this.petals.filter(p=>p.alpha>0&&p.x>-100&&p.x<1000);
 const crown=this.leaves.filter(l=>['attached','loosening','growing'].includes(l.state)).length;
 if(crown<this.leaves.length*.75)this.regrowing=true;
 if(this.regrowing){this.growthClock+=h;if(this.growthClock>=.16){const ready=this.leaves.filter(l=>l.state==='gone'&&l.age>.6);ready.sort((a,b)=>branchCounts[a.branch]-branchCounts[b.branch]||a.id-b.id);const l=ready[0];if(l){Object.assign(l,this.anchor(l),{state:'growing',age:0,growth:0,alpha:this.reduced?0:1,stress:0,vx:0,vy:0,spin:0,petal:false});this.growthClock=0}}
 if(crown===this.leaves.length){this.regrowing=false;this.growthClock=0}}
 }
 get remaining(){return this.leaves.filter(l=>l.state==='attached'||l.state==='loosening').length}
 get active(){return this.regrowing||this.wind.length>0||this.petals.length>0||this.branches.some(b=>Math.abs(b.theta)>.00005||Math.abs(b.omega)>.0001)||this.leaves.some(l=>!['attached','gone'].includes(l.state))}
}
