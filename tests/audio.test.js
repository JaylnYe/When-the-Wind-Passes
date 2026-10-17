import test from 'node:test';
import assert from 'node:assert/strict';
import {WindAudio} from '../dist/audio.js';

function context(){
 const parameters=[];
 const parameter=()=>{const p={value:0,events:[],cancelAndHoldAtTime(t){this.events.push(['hold',t])},setTargetAtTime(v,t,c){this.events.push(['target',v,t,c])}};parameters.push(p);return p};
 const node=()=>({connect(next){return next},start(){},frequency:{value:0},Q:{value:0},gain:parameter()});
 const buffers=[];
 return {sampleRate:1000,currentTime:0,state:'suspended',destination:{},parameters,buffers,
  createBuffer(channels,length){const data=new Float32Array(length);buffers.push(data);return{getChannelData(){return data}}},
  createBufferSource:node,createBiquadFilter:node,createGain:node,
  resume(){this.state='running';return Promise.resolve()},suspend(){this.state='suspended';return Promise.resolve()}};
}

test('wind and soft leaves share a smooth procedural loop',async()=>{
 const oldWindow=globalThis.window;
 const ctx=context();globalThis.window={AudioContext:class{constructor(){return ctx}}};
 try{
  const audio=new WindAudio();await audio.activate();
  assert.equal(ctx.buffers.length,1);
  assert.ok(ctx.buffers.every(buffer=>{
   let steps=0;for(let i=1;i<buffer.length;i++)steps+=(buffer[i]-buffer[i-1])**2;
   return Math.abs(buffer[0]-buffer.at(-1))<3*Math.sqrt(steps/(buffer.length-1));
  }));
  const samples=ctx.buffers[0];
  assert.ok(samples.length>=ctx.sampleRate*30);
  assert.ok(samples.some(value=>Math.abs(value)>.1));
  assert.equal(typeof audio.gust,'undefined');
  assert.ok(audio.ambientWind.gain.events.some(event=>event[0]==='target'&&event[1]>0));
  assert.ok(audio.ambientLeaves.gain.events.some(event=>event[0]==='target'&&event[1]>0));
  assert.equal(ctx.state,'running');
 }finally{globalThis.window=oldWindow}
});

test('a canopy gesture briefly lifts the existing wind and leaf bands',async()=>{
 const oldWindow=globalThis.window;
 const ctx=context();globalThis.window={AudioContext:class{constructor(){return ctx}}};
 try{
  const audio=new WindAudio();await audio.activate();
  ctx.currentTime=1;
  audio.stir(.8);
  for(const param of [audio.ambientWind.gain,audio.ambientLeaves.gain]){
   const targets=param.events.filter(event=>event[0]==='target');
   assert.ok(targets[1][1]>targets[0][1]);
   assert.equal(targets[2][1],param.baseLevel);
   assert.ok(targets[2][2]>targets[1][2]);
  }
  assert.equal(ctx.buffers.length,1);
 }finally{globalThis.window=oldWindow}
});

test('mute suspends ambience and unmute resumes it',async()=>{
 const oldWindow=globalThis.window;
 const ctx=context();globalThis.window={AudioContext:class{constructor(){return ctx}}};
 try{
  const audio=new WindAudio();await audio.activate();
  audio.setEnabled(false);assert.equal(ctx.state,'suspended');
  audio.setEnabled(true);await Promise.resolve();assert.equal(ctx.state,'running');
 }finally{globalThis.window=oldWindow}
});
