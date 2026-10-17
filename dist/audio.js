// A single procedural woodland soundscape, shaped by Web Audio filters and gain.
function texture(context){
 const rate=context.sampleRate,seconds=36,overlap=Math.round(rate*1.8);
 const length=Math.round(rate*seconds),raw=new Float32Array(length+overlap);
 const buffer=context.createBuffer(1,length,rate),data=buffer.getChannelData(0);
 const knots=[{at:0,level:.84}];
 for(let at=rate*5;at<raw.length+rate*7;at+=rate*(5+Math.random()*4))knots.push({at,level:.72+Math.random()*.26});
 let colored=0,knot=0;
 for(let i=0;i<raw.length;i++){
  while(knots[knot+1]&&i>knots[knot+1].at)knot++;
  const a=knots[knot],b=knots[knot+1]||a;
  const t=b===a?0:Math.max(0,Math.min(1,(i-a.at)/(b.at-a.at)));
  const smooth=t*t*(3-2*t),level=a.level+(b.level-a.level)*smooth;
  colored=colored*.55+(Math.random()*2-1)*.45;
  raw[i]=colored*level;
 }
 // Crossfade the stream after its end into its beginning without a volume dip.
 for(let i=0;i<length;i++){
  if(i<overlap){const t=i/overlap;data[i]=raw[length+i]*(1-t)+raw[i]*t}
  else data[i]=raw[i];
 }
 return buffer;
}

function retarget(param,value,now,attack,hold,release){
 if(param.cancelAndHoldAtTime)param.cancelAndHoldAtTime(now);
 else if(param.cancelScheduledValues)param.cancelScheduledValues(now);
 param.setTargetAtTime(value,now,attack);
 param.setTargetAtTime(param.baseLevel,now+hold,release);
}

export class WindAudio {
 constructor(){
  try{this.enabled=localStorage.getItem('tree-sound-off')!=='1'}catch{this.enabled=true}
  this.context=null;this.lastStir=-Infinity;
 }
 setup(context){
  this.context=context;
  const air=context.createBufferSource();air.buffer=texture(context);air.loop=true;
  const lowCut=context.createBiquadFilter();lowCut.type='highpass';lowCut.frequency.value=90;
  const windFilter=context.createBiquadFilter();windFilter.type='lowpass';windFilter.frequency.value=620;windFilter.Q.value=.5;
  const leafCut=context.createBiquadFilter();leafCut.type='highpass';leafCut.frequency.value=620;
  const leafFilter=context.createBiquadFilter();leafFilter.type='lowpass';leafFilter.frequency.value=2400;leafFilter.Q.value=.45;
  this.ambientWind=context.createGain();this.ambientWind.gain.value=0;this.ambientWind.gain.baseLevel=.027;
  this.ambientLeaves=context.createGain();this.ambientLeaves.gain.value=0;this.ambientLeaves.gain.baseLevel=.0035;
  air.connect(lowCut).connect(windFilter).connect(this.ambientWind).connect(context.destination);
  air.connect(leafCut).connect(leafFilter).connect(this.ambientLeaves).connect(context.destination);
  air.start();
  this.ambientWind.gain.setTargetAtTime(this.ambientWind.gain.baseLevel,context.currentTime,.8);
  this.ambientLeaves.gain.setTargetAtTime(this.ambientLeaves.gain.baseLevel,context.currentTime,.8);
 }
 activate(){
  if(!this.enabled)return;
  const AudioContext=window.AudioContext||window.webkitAudioContext;
  if(!AudioContext)return;
  if(!this.context)this.setup(new AudioContext());
  if(this.context.state==='suspended')this.context.resume().catch(()=>{});
 }
 stir(strength){
  if(!this.enabled||!this.context||this.context.state!=='running')return;
  const now=this.context.currentTime;
 if(now-this.lastStir<.05)return;
  this.lastStir=now;
  const amount=Math.max(0,Math.min(1,strength));
  if(amount<.12)return;
 retarget(this.ambientWind.gain,.027+amount*.018,now,.035,.1,.5);
 retarget(this.ambientLeaves.gain,.0035+amount*.016,now,.025,.1,.38);
 }
 setEnabled(on){
  this.enabled=on;
  try{localStorage.setItem('tree-sound-off',on?'0':'1')}catch{}
  if(on)this.activate();
  else if(this.context)this.context.suspend().catch(()=>{});
  return this.enabled;
 }
 visibility(hidden){if(!this.context||!this.enabled)return;if(hidden)this.context.suspend().catch(()=>{});else this.context.resume().catch(()=>{})}
}
