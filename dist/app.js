import {Study,STEP} from './simulation.js?v=20261015h';
import {WindAudio} from './audio.js?v=20261015h';
const canvas=document.querySelector('#scene'),ctx=canvas.getContext('2d');let species='maple',sim=new Study(species);const audio=new WindAudio();document.querySelector('main').dataset.species=species;
const sprites=await Promise.all([1,4,7,11,18].map(i=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=`assets/leaf-${String(i).padStart(2,'0')}.png`})));
// Pre-tinted leaf variants preserve texture and alpha without per-frame filters.
const leafTones=sprites.map(im=>{if(!im)return[];return ['rgba(118,133,66,.40)','rgba(236,194,72,.48)','rgba(231,150,52,.57)','rgba(210,104,40,.67)','rgba(172,65,44,.73)'].map(color=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);g.globalCompositeOperation='source-atop';g.fillStyle=color;g.fillRect(0,0,c.width,c.height);return c})});
function tinted(im,color){if(!im)return null;const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);g.globalCompositeOperation='source-atop';g.fillStyle=color;g.fillRect(0,0,c.width,c.height);return c}
const mapleSun=sprites.map(im=>tinted(im,'rgba(255,239,164,.38)'));
const loadImage=src=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=src});
const ginkgoImages=await Promise.all(['ginkgo-leaf.png','ginkgo-deep.png','ginkgo-folded.png'].map(name=>loadImage('assets/'+name)));const ginkgoImage=ginkgoImages[0];
const ginkgoTones=ginkgoImages.map(im=>['rgba(210,148,43,.35)','rgba(243,175,48,.28)','rgba(255,214,89,.22)'].map(color=>tinted(im,color)));
const ginkgoSun=ginkgoImages.map(im=>tinted(im,'rgba(255,235,143,.4)'));
const jacarandaCluster=await loadImage('assets/jacaranda-cluster-muted-stems.png'),jacarandaFlower=await loadImage('assets/jacaranda-flower-light.png');
const jacarandaTones=[jacarandaCluster,tinted(jacarandaCluster,'rgba(134,111,178,.12)'),tinted(jacarandaCluster,'rgba(109,94,153,.2)')];
const jacarandaSun=tinted(jacarandaCluster,'rgba(255,253,246,.36)');
const willowImage=await loadImage('assets/willow-leaf.png');
const willowVariants=await Promise.all([0,1,2,3].map(i=>loadImage(`assets/willow-tone-${i}.png`)));
const willowTones=willowVariants.slice(0,3),willowSun=willowVariants[3];
const cherryImages=await Promise.all(['cherry-blossom.png','cherry-side.png','cherry-bud.png'].map(name=>loadImage('assets/'+name)));const cherryImage=cherryImages[0];
const cherryTones=cherryImages.map(im=>['rgba(255,255,255,.58)','rgba(255,249,251,.50)','rgba(255,237,244,.44)'].map(color=>tinted(im,color)));
const cherrySun=cherryImages.map(im=>tinted(im,'rgba(255,255,255,.65)'));
const petalImage=await new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src='assets/cherry-petal.png'});
const petalVisible=tinted(petalImage,'rgba(246,213,224,.16)');
let scale=1,leafScale=1,ox=0,oy=0,width=0,height=0,raf=0,last=null,acc=0,pointer=null,pending=[],previous=null,velocity={x:0,y:0},pulse=0,trail=[];
const media=matchMedia('(prefers-reduced-motion: reduce)'),FRAME_STEP=1/60;sim.setReduced(media.matches);
function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(devicePixelRatio||1,width<=600?1.5:2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);const portrait=width<=600&&height>width,frameHeight=portrait?height:height-110;scale=Math.min(width/(portrait?700:760),frameHeight/(portrait?760:850));leafScale=portrait?1.18:1;ox=(width-900*scale)/2;oy=(frameHeight-(portrait?800:715)*scale)/2-(portrait?12:0);previous=null;pending=[];wake()}
function world(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left-ox)/scale,y:(e.clientY-r.top-oy)/scale,t:e.timeStamp}}
function wake(){if(!raf&&!document.hidden)raf=requestAnimationFrame(frame)}
function finish(){if(pointer!==null&&canvas.hasPointerCapture(pointer))canvas.releasePointerCapture(pointer);pointer=null;previous=null;pending=[];velocity={x:0,y:0};wake()}
canvas.addEventListener('pointerdown',e=>{if(pointer!==null||(e.pointerType==='mouse'&&e.button!==0))return;pointer=e.pointerId;canvas.setPointerCapture(pointer);previous=world(e);pending=[];velocity={x:0,y:0};sim.beginGesture();wake()});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==pointer)return;const p=world(e);pending.push(p);if(pending.length>8)pending.shift();if(previous&&p.x>90&&p.x<810&&p.y<550)audio.stir(Math.min(1,Math.hypot(p.x-previous.x,p.y-previous.y)/45));wake()});
for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>{if(e.pointerId===pointer)finish()});window.addEventListener('blur',finish);
function input(){if(!pending.length)return;const batch=pending.splice(0),a=previous;for(const p of batch){if(previous){const dt=(p.t-previous.t)/1000;if(dt>0){const span=Math.min(.08,Math.max(.008,dt));let vx=(p.x-previous.x)/span,vy=(p.y-previous.y)/span,s=Math.min(1,1800/(Math.hypot(vx,vy)||1)),k=1-Math.exp(-span/.028);velocity.x+=(vx*s-velocity.x)*k;velocity.y+=(vy*s-velocity.y)*k}else velocity={x:0,y:0}}previous=p}if(a&&previous){const distance=Math.hypot(previous.x-a.x,previous.y-a.y),count=Math.max(1,Math.min(3,Math.ceil(distance/65)));for(let i=0;i<count;i++){const from={x:a.x+(previous.x-a.x)*i/count,y:a.y+(previous.y-a.y)*i/count},to={x:a.x+(previous.x-a.x)*(i+1)/count,y:a.y+(previous.y-a.y)*(i+1)/count};sim.emit(from,to,{x:velocity.x*2.2*Math.min(.05,(previous.t-a.t)/1000)/FRAME_STEP/count,y:velocity.y*2.2*Math.min(.05,(previous.t-a.t)/1000)/FRAME_STEP/count})}if(previous.x>90&&previous.x<810&&previous.y<550)audio.stir(Math.hypot(velocity.x,velocity.y)/1300);if(!sim.reduced){trail.push({x:previous.x,y:previous.y,age:0});if(trail.length>12)trail.shift()}}}
function frame(t){raf=0;const dt=last===null?FRAME_STEP:Math.min(.05,(t-last)/1000);last=t;acc+=dt;input();let n=0;while(acc>=FRAME_STEP&&n++<3){if(pulse>0){pulse-=FRAME_STEP;const p=sim.point(sim.branches[3],.6);sim.emit({x:p.x-45,y:p.y+50},{x:p.x+25,y:p.y-40},{x:1150,y:-650})}sim.step(FRAME_STEP);for(const p of trail)p.age+=FRAME_STEP;trail=trail.filter(p=>p.age<.45);acc-=FRAME_STEP}render();if(pointer!==null||pulse>0||sim.active||trail.length)wake();else{last=null;acc=0;for(const b of sim.branches){b.theta=b.omega=0;if(b.restCurve){b.bend=b.bendVelocity=b.renderedBend=0;b.c=b.restCurve.map(p=>[...p]);b.renderOutline=null}}sim.transform();for(const l of sim.leaves)if(l.state==='attached')Object.assign(l,sim.anchor(l));render();}}
function render(){
 ctx.clearRect(0,0,width,height);ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);
 const light=ctx.createRadialGradient(245,145,25,245,145,410);light.addColorStop(0,'rgba(255,253,244,.07)');light.addColorStop(1,'rgba(255,253,244,0)');ctx.fillStyle=light;ctx.fillRect(-2000,-2000,5000,5000);
 ctx.save();ctx.translate(454,747);ctx.scale(1,.16);const shadow=ctx.createRadialGradient(0,0,2,0,0,95);shadow.addColorStop(0,'rgba(86,105,78,.15)');shadow.addColorStop(1,'rgba(105,106,74,0)');ctx.fillStyle=shadow;ctx.fillRect(-95,-95,190,190);ctx.restore();
 // Back leaves remain independently removable, including while growing.
 for(const l of sim.leaves)if(species!=='willow'&&['attached','loosening','growing'].includes(l.state)&&l.layer==='back')leaf(l);
 for(const b of sim.branches)drawBranch(b);
 for(const l of sim.leaves){if(!['attached','loosening','growing'].includes(l.state)||(species!=='willow'&&l.layer==='back'))continue;const b=sim.branches[l.branch],p=sim.point(b,l.t);if(species!=='cherry'&&species!=='willow'&&species!=='jacaranda'){ctx.strokeStyle='rgba(111,121,76,.28)';ctx.lineWidth=.35;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(l.x,l.y);ctx.stroke()}leaf(l)}
 for(const l of sim.leaves)if(!['attached','loosening','growing','gone'].includes(l.state))leaf(l);
 for(const p of sim.petals)petal(p);
 if(trail.length>1){ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);for(const p of trail)ctx.lineTo(p.x,p.y);ctx.strokeStyle=`rgba(135,151,113,${Math.max(0,.14*(1-trail[0].age/.45))})`;ctx.lineWidth=1;ctx.stroke()}ctx.restore();
}
function point(c,t){const u=1-t;return{x:u*u*u*c[0][0]+3*u*u*t*c[1][0]+3*u*t*t*c[2][0]+t*t*t*c[3][0],y:u*u*u*c[0][1]+3*u*u*t*c[1][1]+3*u*t*t*c[2][1]+t*t*t*c[3][1]}}
function drawBranch(b){
 if(b.hidden)return;
 ctx.save();if(species==='willow'&&b.parent>=0)ctx.globalAlpha=b.depth===1?.55:.7;if(species==='jacaranda'&&b.parent>=0)ctx.globalAlpha=b.depth===1?.88:.78;ctx.translate(b.origin.x,b.origin.y);ctx.rotate(b.angle);
 if(!b.renderOutline){const sides=[[],[]];for(let i=0;i<=32;i++){const t=i/32,p=point(b.c,t),q=point(b.c,Math.min(1,t+.001)),r=point(b.c,Math.max(0,t-.001)),a=Math.atan2(q.y-r.y,q.x-r.x)+Math.PI/2;const radius=b.width*.5*Math.pow(1-t,.8)+.3;for(let side=0;side<2;side++){const sign=side?1:-1;sides[side].push({x:p.x+Math.cos(a)*radius*sign,y:p.y+Math.sin(a)*radius*sign})}}
 const outline=new Path2D();outline.moveTo(sides[0][0].x,sides[0][0].y);for(const p of [...sides[0].slice(1),...sides[1].reverse()])outline.lineTo(p.x,p.y);outline.closePath();b.renderOutline=outline;}const outline=b.renderOutline;
 const tone=ctx.createLinearGradient(-b.width,0,b.width,0);const bark=species==='willow'?(b.width<2?['#82934c','#b7c86d','#9dae59','#82934c']:['#686d59','#9c9e7a','#777d61','#686d59']):species==='ginkgo'?['#5c503c','#968368','#745f46','#64533f']:species==='jacaranda'?['#484541','#766b61','#5b544e','#443f3b']:species==='cherry'?['#715e5c','#a38e86','#8e7771','#705d59']:['#716e58','#a19a7f','#8d876e','#77735f'];tone.addColorStop(0,bark[0]);tone.addColorStop(.45,bark[1]);tone.addColorStop(.75,bark[2]);tone.addColorStop(1,bark[3]);ctx.fillStyle=tone;ctx.fill(outline);
 if(b.width>5){ctx.clip(outline);for(let i=0;i<9;i++){ctx.strokeStyle=i%2?'rgba(222,212,172,.3)':'rgba(78,77,61,.20)';ctx.lineWidth=.5+(i%3)*.4;ctx.beginPath();for(let j=0;j<16;j++){const t=j/15,p=point(b.c,t),x=p.x+Math.sin(j*.7+i)*2+(i-4)*b.width/10;j?ctx.lineTo(x,p.y):ctx.moveTo(x,p.y)}ctx.stroke()}}ctx.restore();
}
function fallingTransform(l){
 if(species==='ginkgo'){const face=Math.cos(l.age*5.2+l.id*.37);ctx.scale(Math.sign(face)*Math.max(.12,Math.abs(face)),.78+.22*Math.abs(Math.sin(l.age*5.2+l.id*.37)));return}
 if(species==='jacaranda'){const face=Math.cos(l.age*6.3+l.id*.91);ctx.scale(Math.sign(face)*Math.max(.16,Math.abs(face)),.7+.22*Math.abs(Math.sin(l.age*4.1+l.id)));return}
 if(species==='willow'){ctx.scale(.2+.8*Math.abs(Math.cos(l.age*5.1+l.id*.37)),1);return}
 if(species==='cherry'){ctx.scale(.3+.7*Math.abs(Math.cos(l.age*4.2)),1);return}
 const phase=l.age*(2.1+(l.id%5)*.23)+l.id*.61,face=Math.cos(phase);
 ctx.transform(1,Math.sin(phase*.7)*.08,Math.sin(phase)*.12,1,0,0);
 ctx.scale((face>=0?1:-1)*Math.max(.18,Math.abs(face)),.78+.18*Math.abs(Math.sin(phase*.53)));
}
function leaf(l){ctx.save();ctx.globalAlpha=l.alpha*(l.layer==='back'?(species==='ginkgo'?.82:species==='willow'?.88:species==='jacaranda'?.8:species==='cherry'?.88:.7):1);ctx.translate(l.x,l.y);ctx.rotate(l.angle);ctx.scale(leafScale*(l.layer==='back'?.92:1),leafScale*(l.layer==='back'?.92:1));if(l.state==='growing'&&!sim.reduced){const g=l.growth*l.growth*(3-2*l.growth);ctx.scale(g,g)}if(l.state==='falling'&&!sim.reduced)fallingTransform(l);const sun=l.id%7===0&&l.x<650&&l.y<530&&(species!=='maple'||l.tone!==4);const im=species==='jacaranda'?(['falling','grounded','fading'].includes(l.state)?jacarandaFlower:(l.id%9<3&&l.x<660&&l.y<620?jacarandaSun:jacarandaTones[l.tone]||jacarandaCluster)):species==='ginkgo'?(sun?ginkgoSun[l.sprite]:ginkgoTones[l.sprite]?.[l.tone])||ginkgoImage:species==='willow'?(sun?willowSun:willowTones[l.tone]||willowImage):species==='cherry'?(l.petal&&l.state!=='attached'&&l.state!=='loosening'&&l.state!=='growing'?(petalVisible||petalImage||cherryImage):sun?cherrySun[l.state==='falling'?1:l.sprite]:(cherryTones[l.state==='falling'?1:l.sprite]?.[l.tone]||cherryImage)):(sun?mapleSun[l.sprite]:leafTones[l.sprite][l.tone]||sprites[l.sprite]);if(im){const w=l.size*(species==='jacaranda'&&['falling','grounded','fading'].includes(l.state)?.27+(l.id%5)*.025:l.petal?.8:species==='cherry'?(l.state==='falling'?.72:l.sprite===2?.75:1):species==='ginkgo'?(l.state==='falling'||l.state==='grounded'||l.state==='fading'?.7:1)*(l.sprite===1?.78:l.sprite===2?.68:1):1),h=w*im.height/im.width;ctx.drawImage(im,-w*(species==='willow'?.34:.5),species==='willow'?-h*.1:species==='jacaranda'?-h*.5:-h*.85,species==='willow'?w*.68:w,h)}else{ctx.fillStyle=l.id%3?'#a5ad73':'#cfba72';ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-12,-8,-8,-18,0,-24);ctx.fill()}ctx.restore()}
function petal(p){if(!petalVisible&&!petalImage)return;ctx.save();ctx.globalAlpha=p.alpha;ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.scale(leafScale,leafScale);const im=petalVisible||petalImage,w=p.size,h=w*im.height/im.width;ctx.drawImage(im,-w*.5,-h*.5,w,h);ctx.restore()}
for(const button of document.querySelectorAll('.species-picker button'))button.addEventListener('click',()=>{if(button.dataset.species===species)return;finish();species=button.dataset.species;document.querySelector('main').dataset.species=species;sim=new Study(species);sim.setReduced(media.matches);for(const b of document.querySelectorAll('.species-picker button'))b.setAttribute('aria-pressed',String(b===button));pulse=0;trail=[];last=null;acc=0;resize()});
document.querySelector('#breeze').addEventListener('click',()=>{sim.beginGesture();pulse=1;audio.stir(.55);wake()});
const soundButton=document.querySelector('#sound');soundButton.setAttribute('aria-pressed',String(audio.enabled));soundButton.setAttribute('aria-label',audio.enabled?'关闭声音':'开启声音');soundButton.addEventListener('click',()=>{const on=audio.setEnabled(!audio.enabled);soundButton.setAttribute('aria-pressed',String(on));soundButton.setAttribute('aria-label',on?'关闭声音':'开启声音')});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#sound'))audio.activate()},{capture:true});document.addEventListener('keydown',()=>audio.activate(),{capture:true});audio.activate();
 document.querySelector('#reset').addEventListener('click',()=>{finish();sim.reset();sim.setReduced(media.matches);pulse=0;trail=[];last=null;acc=0;wake()});
 media.addEventListener('change',e=>{sim.setReduced(e.matches);trail=[];wake()});
 function drift(){if(document.hidden)return;let shed=false;for(let i=0;i<(species==='cherry'?2:1);i++)shed=sim.shedAmbient()||shed;if(shed)wake()}
 setInterval(drift,2200);
 function flurry(){if(document.hidden||sim.reduced)return;for(let i=0;i<(species==='willow'?3:9);i++)setTimeout(drift,i*170)}
 setTimeout(()=>{flurry();setInterval(flurry,20000)},4800);
 document.addEventListener('visibilitychange',()=>{audio.visibility(document.hidden);if(document.hidden){finish();cancelAnimationFrame(raf);raf=0;last=null;acc=0;sim.wind=[];pulse=0;trail=[]}else wake()});new ResizeObserver(resize).observe(canvas);resize();
