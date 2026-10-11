export const STEP=1/120;
const TAU=Math.PI*2;
export function bezier(c,t){const u=1-t;return {x:u*u*u*c[0][0]+3*u*u*t*c[1][0]+3*u*t*t*c[2][0]+t*t*t*c[3][0],y:u*u*u*c[0][1]+3*u*u*t*c[1][1]+3*u*t*t*c[2][1]+t*t*t*c[3][1]};}
export function tangent(c,t){const u=1-t;return Math.atan2(3*u*u*(c[1][1]-c[0][1])+6*u*t*(c[2][1]-c[1][1])+3*t*t*(c[3][1]-c[2][1]),3*u*u*(c[1][0]-c[0][0])+6*u*t*(c[2][0]-c[1][0])+3*t*t*(c[3][0]-c[2][0]));}
function rotate(p,a){return{x:p.x*Math.cos(a)-p.y*Math.sin(a),y:p.x*Math.sin(a)+p.y*Math.cos(a)}}
export class Study{
 constructor(){this.reduced=false;this.reset()}
 reset(){this.time=0;this.wind=[];this.tokens=3;this.gestureCount=0;this.trails=[];this.branches=[
 {parent:-1,t:0,c:[[0,0],[130,-62],[310,-178],[520,-410]],width:9},
 {parent:0,t:.23,c:[[0,0],[-35,-40],[-40,-115],[-16,-191]],width:3.4},
 {parent:0,t:.40,c:[[0,0],[56,8],[142,-8],[202,-48]],width:3.1},
 {parent:0,t:.55,c:[[0,0],[-28,-44],[-25,-103],[-1,-159]],width:2.8},
 {parent:0,t:.74,c:[[0,0],[50,3],[113,-15],[163,-69]],width:2.1},
 {parent:0,t:.88,c:[[0,0],[-22,-35],[-22,-84],[-13,-120]],width:1.7}].map(b=>({...b,theta:0,omega:0,angle:0,origin:{x:0,y:0}}));
 this.transform();this.leaves=[];
 for(let i=0;i<54;i++){const branch=1+(i%5),j=Math.floor(i/5),t=.18+j*.074+((i*7%9)-4)*.005,sign=j%2?1:-1;const l={id:i,branch,t:Math.min(.96,t),side:sign,offset:13+(i*13%15),rest:sign*(.62+(i%4)*.15),size:25+(i*7%18),sprite:(i*3+Math.floor(i/5))%5,state:'attached',stress:0,threshold:.14+(i*17%11)*.012,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:0,alpha:1};const p=this.anchor(l);Object.assign(l,p,{prev:{...p}});this.leaves.push(l)}
 }
 transform(){for(const b of this.branches){if(b.parent<0){b.origin={x:148,y:680};b.angle=b.theta}else{const p=this.branches[b.parent],o=rotate(bezier(p.c,b.t),p.angle);b.origin={x:p.origin.x+o.x,y:p.origin.y+o.y};b.angle=p.angle+b.theta}}}
 point(b,t){const p=rotate(bezier(b.c,t),b.angle);return{x:p.x+b.origin.x,y:p.y+b.origin.y}}
 anchor(l){const b=this.branches[l.branch],p=this.point(b,l.t),a=b.angle+tangent(b.c,l.t),q=a+l.side*Math.PI/2;return{x:p.x+Math.cos(q)*l.offset,y:p.y+Math.sin(q)*l.offset,angle:a+l.rest}}
 emit(a,b,v){if(Math.hypot(v.x,v.y)<20)return;this.wind.push({a:{...a},b:{...b},v:{...v},time:this.time});if(this.wind.length>56)this.wind.shift()}
 field(p){let x=0,y=0;for(const w of this.wind){const dx=w.b.x-w.a.x,dy=w.b.y-w.a.y,t=Math.max(0,Math.min(1,((p.x-w.a.x)*dx+(p.y-w.a.y)*dy)/(dx*dx+dy*dy||1))),r2=(p.x-w.a.x-t*dx)**2+(p.y-w.a.y-t*dy)**2,k=Math.max(0,1-r2/(140*140))**2*Math.exp(-(this.time-w.time)/.16)*STEP/.16*.95;x+=w.v.x*k;y+=w.v.y*k}const s=Math.min(1,750/(Math.hypot(x,y)||1));return{x:x*s,y:y*s}}
 beginGesture(){this.gestureCount=0}
 setReduced(v){this.reduced=v;if(v){for(const b of this.branches){b.theta=b.omega=0}this.transform();for(const l of this.leaves)if(l.state==='falling'){l.state='fading';l.age=0}}}
 step(h=STEP){this.time+=h;this.tokens=Math.min(3,this.tokens+12*h);this.wind=this.wind.filter(w=>this.time-w.time<.45);
 for(const b of this.branches){if(this.reduced)continue;const p=this.point(b,.7),w=this.field(p),a=b.angle+tangent(b.c,.7),target=Math.max(-.12,Math.min(.12,(-Math.sin(a)*w.x+Math.cos(a)*w.y)*(b.parent<0?.00010:.00030))),wn=TAU*1.5;b.omega+=(wn*wn*(target-b.theta)-2*.76*wn*b.omega)*h;b.theta+=b.omega*h}this.transform();
 for(const l of this.leaves){l.age+=h;if(l.state==='attached'){const p=this.anchor(l),av={x:(p.x-l.x)/h,y:(p.y-l.y)/h},w=this.field(p);l.x=p.x;l.y=p.y;l.angle=p.angle;l.stress=Math.max(0,l.stress*Math.exp(-h/.38)+Math.max(0,Math.hypot(w.x-av.x,w.y-av.y)-75)/260*h);
 if(l.stress>l.threshold&&this.tokens>=1&&(!this.reduced||this.gestureCount<3)){this.tokens-=1;this.gestureCount++;l.state=this.reduced?'fading':'falling';l.age=0;l.vx=av.x+w.x*.3;l.vy=av.y+w.y*.3;l.spin=(l.id%2?1:-1)*(.5+(l.id%5)*.18);l.detach={x:l.x,y:l.y,angle:l.angle};}
 }else if(l.state==='falling'){const w=this.field(l);l.vx+=(1.4*(w.x-l.vx)+32*Math.sin(this.time*5+l.id))*h;l.vy+=(155+1.4*(w.y-l.vy))*h;l.x+=l.vx*h;l.y+=l.vy*h;l.angle+=l.spin*h;if(l.y+l.size*.65>=727){l.y=727-l.size*.65;l.state='grounded';l.age=0;l.vx=l.vy=0}if(l.x<-100||l.x>1000||l.age>15){l.state='fading';l.age=0}}
 else if(l.state==='grounded'&&l.age>.9){l.state='fading';l.age=0}
 else if(l.state==='fading'){const t=Math.min(1,l.age/(this.reduced?.15:1.2));l.alpha=1-t*t*(3-2*t);if(t>=1)l.state='gone'}
 }
 }
 get remaining(){return this.leaves.filter(l=>l.state==='attached').length}
 get active(){return this.wind.length>0||this.branches.some(b=>Math.abs(b.theta)>.00005||Math.abs(b.omega)>.0001)||this.leaves.some(l=>!['attached','gone'].includes(l.state))}
}
