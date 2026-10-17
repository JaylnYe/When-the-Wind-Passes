// Art-directed scaffold, deterministic smaller branches and leaf buds.
export function randomSource(seed=3917){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
export function curvePoint(c,t){const u=1-t;return{x:u*u*u*c[0][0]+3*u*u*t*c[1][0]+3*u*t*t*c[2][0]+t*t*t*c[3][0],y:u*u*u*c[0][1]+3*u*u*t*c[1][1]+3*u*t*t*c[2][1]+t*t*t*c[3][1]}}
export function makeTree(kind='maple'){
 if(kind==='willow')return makeWillow();
 if(kind==='jacaranda')return makeJacaranda();
 const ginkgo=kind==='ginkgo',cherry=kind==='cherry',random=randomSource(ginkgo?9163:cherry?5237:3917),branches=[],origin={x:450,y:745};
 function add(parent,t,end,width,bend=0){const p=parent<0?origin:(()=>{const b=branches[parent],q=curvePoint(b.c,t);return{x:b.restOrigin.x+q.x,y:b.restOrigin.y+q.y}})();const dx=end[0]-p.x,dy=end[1]-p.y;branches.push({parent,t,c:[[0,0],[dx*.24+bend,dy*.36],[dx*.8+bend*.35,dy*.78],[dx,dy]],width,theta:0,omega:0,angle:0,origin:{...p},restOrigin:p,depth:parent<0?0:branches[parent].depth+1});return branches.length-1}
 add(-1,0,ginkgo?[462,120]:cherry?[465,280]:[474,285],ginkgo?23:cherry?24:25,ginkgo?-15:-27);
 // Unequal forks and open spaces establish the silhouette before foliage.
 const specs=cherry?[
 [0,.38,[202,433],9,-28],[0,.45,[686,412],9,27],
 [0,.51,[180,337],8,-33],[0,.57,[710,314],8,28],
 [0,.66,[309,205],7,-18],[0,.72,[598,187],7,19],
 [0,.78,[419,139],5,-8],[0,.82,[520,130],5,11],
 [1,.65,[124,362],3,-10],[2,.66,[757,340],3,10],
 [3,.58,[146,258],3,-8],[4,.62,[744,246],3,9],
 [1,.54,[363,270],3,-11],[2,.54,[548,258],3,11],
 [0,.63,[388,231],4,-10],[0,.69,[538,222],4,10],
 [0,.57,[330,328],3,-9],[0,.62,[570,320],3,11],
 [0,.48,[428,405],2.5,-4]
 ]:ginkgo?[
 [0,.36,[245,415],7,-18],[0,.43,[650,382],8,20],
 [0,.48,[300,320],6,-10],[0,.53,[595,300],7,10],
 [0,.60,[275,230],5,-12],[0,.64,[627,205],6,15],
 [0,.72,[355,155],4,-10],[0,.78,[558,110],5,9],
 [0,.82,[425,88],3,-6],[0,.88,[480,48],3,5],
 [2,.64,[690,335],3,8],[1,.60,[190,350],3,-8],
 [0,.58,[373,151],5,-12],[0,.65,[538,139],5,12],
 [0,.76,[415,128],4,-7],[0,.83,[508,120],4,7]
 ,[0,.26,[310,486],6,-11],[0,.31,[589,474],6,13]
 ]:[
 [0,.40,[206,430],8,-31],[0,.48,[682,415],10,29],
 [0,.50,[236,330],10,-35],[0,.59,[627,280],8,25],
 [0,.68,[342,186],10,-30],[0,.80,[497,102],8,-16],
 [0,.55,[443,244],6,-25],[2,.62,[723,360],4,16],
 [3,.57,[188,270],4,-13],[4,.64,[680,216],3,17],
 [5,.65,[300,147],4,-12],[6,.66,[561,139],3,15],
 [0,.57,[315,280],3,-16],[0,.63,[568,263],3,15],[0,.43,[433,397],3,-5]
 ];
 const leaders=specs.map(args=>add(...args));const buds=[],bridgeBuds=[];
 for(const [k,id] of leaders.entries()){
  const main=branches[id],end=main.c[3],length=Math.hypot(...end),direction=Math.atan2(end[1],end[0]);
  const count=ginkgo?7+(k%2):cherry?8+(k%3):6+(k%3);
  for(let j=0;j<count;j++){
   const t=(ginkgo?.28:.18)+(j/(count-1))*(ginkgo?.7:.78)+(random()-.5)*.08,p=curvePoint(main.c,t),angle=direction+(j%2?1:-1)*(.32+random()*.8),len=(ginkgo?24:28)+random()*(ginkgo?49:58);
   const x=main.restOrigin.x+p.x+Math.cos(angle)*len,y=main.restOrigin.y+p.y+Math.sin(angle)*len;
   const twig=add(id,t,[x,y],1.3+random()*.8,(random()-.5)*18);buds.push(twig);if(cherry&&k>=leaders.length-4)bridgeBuds.push(twig);
  }
 }
 const leaves=[];
 const pickSprite=()=>!ginkgo&&!cherry?Math.floor(random()*5):[0,0,0,1,1,2][Math.floor(random()*6)];
 const pickTone=()=>{if(ginkgo||cherry)return Math.floor(random()*3);const n=random();return n<.12?0:n<.44?1:n<.72?2:n<.92?3:4};
 for(let i=0;i<(ginkgo?1125:cherry?1450:1490);i++){
  const branch=buds[i%buds.length],side=random()<.5?-1:1;
  leaves.push({id:i,branch,t:cherry?.18+Math.floor(random()*4)*.22+(random()-.5)*.085:.16+Math.pow(random(),.7)*.84,side,offset:5+random()*(ginkgo?24:31),rest:side*(.3+random()*1.5),size:ginkgo?18+random()*16:cherry?14+random()*8:16+random()*14,sprite:pickSprite(),layer:random()<.36?'back':'front',tone:pickTone(),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 // Short petioles on the outer half of large limbs fill gaps between twig clusters.
 for(let i=0;i<225;i++){
  const id=leaves.length,branch=leaders[i%leaders.length],side=random()<.5?-1:1;
  leaves.push({id,branch,t:.46+random()*.48,side,offset:12+random()*(ginkgo?31:42),rest:side*(.25+random()*1.3),size:ginkgo?17+random()*16:cherry?13+random()*8:15+random()*12,sprite:pickSprite(),layer:random()<.48?'back':'front',tone:pickTone(),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 // Fill the inside of each crown as separate leaves, preserving natural gaps at its edge.
 for(let i=0;i<(ginkgo?650:cherry?470:600);i++){
  const id=leaves.length,branch=leaders[i%leaders.length],side=random()<.5?-1:1;
  leaves.push({id,branch,t:(ginkgo?.18:.24)+random()*(ginkgo?.7:.58),side,offset:7+random()*(ginkgo?34:24),rest:side*(.25+random()*1.3),size:ginkgo?17+random()*17:cherry?12+random()*8:14+random()*10,sprite:pickSprite(),layer:random()<(ginkgo?.46:.72)?'back':'front',tone:pickTone(),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 // A few clusters on inward-pointing twigs close the two large gaps beside the crown centre.
 if(cherry)for(let i=0;i<680;i++){
  const id=leaves.length,branch=bridgeBuds[i%bridgeBuds.length],side=random()<.5?-1:1;
  leaves.push({id,branch,t:.22+Math.floor(random()*3)*.27+(random()-.5)*.07,side,offset:5+random()*24,rest:side*(.3+random()*1.4),size:13+random()*8,sprite:pickSprite(),layer:random()<.56?'back':'front',tone:pickTone(),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 // Let small foreground clusters interrupt the exposed upper limbs without hiding the trunk.
 if(!ginkgo)for(let i=0;i<(cherry?350:330);i++){
  const id=leaves.length,branch=leaders[i%8],side=random()<.5?-1:1;
  leaves.push({id,branch,t:.43+random()*.5,side,offset:3+random()*(cherry?20:23),rest:side*(.2+random()*1.25),size:cherry?14+random()*7:17+random()*10,sprite:pickSprite(),layer:random()<.18?'back':'front',tone:pickTone(),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 // Smaller leaves and blossoms bridge the inner forks while the trunk stays legible.
 if(!ginkgo)for(let i=0;i<(cherry?430:330);i++){
  const id=leaves.length,branch=leaders[[0,1,2,3,4,5,6,7][i%8]],side=random()<.5?-1:1;
  leaves.push({id,branch,t:.26+random()*.48,side,offset:6+random()*(cherry?36:42),rest:side*(.2+random()*1.25),size:cherry?14+random()*7:17+random()*10,sprite:pickSprite(),layer:random()<.16?'back':'front',tone:pickTone(),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 if(!ginkgo&&!cherry){
  const gapBranches=leaders.slice(-3);
  for(let i=0;i<330;i++){
   const leaf=leaves[leaves.length-330+i];
   leaf.branch=gapBranches[i%gapBranches.length];leaf.t=.24+random()*.64;
   leaf.offset=8+random()*32;leaf.size=15+random()*10;
  }
 }
 if(cherry)for(const branch of buds)for(let j=0;j<2;j++){
  const id=leaves.length,side=j?1:-1;
  leaves.push({id,branch,t:.78+j*.17,side,offset:3+random()*13,rest:side*(.2+random()),size:12+random()*6,sprite:pickSprite(),layer:'front',tone:pickTone(),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 // Shape the whole scaffold around its rooted base: a deeper, narrower crown
 // reads as a taller tree without pushing the canopy out of the mobile frame.
 for(const b of branches){
  const sx=ginkgo?.89:.88,sy=ginkgo?1.17:1.16;
  b.restOrigin={x:450+(b.restOrigin.x-450)*sx,y:745+(b.restOrigin.y-745)*sy};
  b.origin={...b.restOrigin};
  b.c=b.c.map(([x,y])=>[x*sx,y*sy]);
 }
 return{branches,leaves};
}

// Blue jacaranda: arching limbs remain visible beneath separate terminal flower clouds.
function makeJacaranda(){
 const random=randomSource(6729),branches=[],origin={x:450,y:745};
 function add(parent,t,end,width,bend=0){
  const p=parent<0?origin:(()=>{const b=branches[parent],q=curvePoint(b.c,t);return{x:b.restOrigin.x+q.x,y:b.restOrigin.y+q.y}})();
  const dx=end[0]-p.x,dy=end[1]-p.y;
  const depth=parent<0?0:branches[parent].depth+1,jitter=Math.sin(branches.length*2.71)*12;
  const c=depth===0?[[0,0],[dx*.24+bend,dy*.32],[dx*.79+bend*.4,dy*.75],[dx,dy]]:width>=3?[[0,0],[dx*.2+bend*1.8+jitter*1.2,dy*.08-(depth===1?48:24)],[dx*.83+bend*.65-jitter*.9,dy*.72-(depth===1?42:32)],[dx,dy]]:[[0,0],[dx*.13+bend*1.2,dy*.1-8],[dx*.91+bend*.4,dy*.72+6],[dx,dy]];
  branches.push({parent,t,c,width,theta:0,omega:0,angle:0,origin:{...p},restOrigin:p,depth});
  return branches.length-1;
 }
 add(-1,0,[459,403],25,-13);
 const specs=[
  [0,.42,[195,395],10,-48],[0,.55,[699,441],9,28],
  [0,.69,[185,338],8,-39],[0,.76,[755,315],7,32],
  [3,.56,[234,230],8,-28],[4,.52,[676,220],8,27],
  [5,.63,[316,143],6,-18],[6,.67,[603,158],6,18],
  [7,.71,[380,103],5,-26],[8,.68,[543,119],5,27],
  [1,.56,[294,294],4,-16],[2,.58,[603,282],4,16],
  [0,.91,[441,306],5,18],[5,.68,[416,174],4,22],[6,.66,[491,150],4,-20],
  [0,.63,[365,344],3.5,-12],[0,.78,[530,323],3.5,14],
  [0,.89,[465,205],3,8],
  [1,.61,[335,365],3,13],[1,.43,[365,463],3.2,18]
 ];
 const leaders=specs.map(args=>add(...args)),twigs=[],centralTwigs=[],lowerTwigs=[],midTwigs=[],gapTwigs=[];
 for(const [k,id] of leaders.entries()){
  const main=branches[id],a=Math.atan2(main.c[3][1],main.c[3][0]);
  for(let j=0;j<7;j++){
   const t=.48+j*.075+(random()-.5)*.055,p=curvePoint(main.c,t),side=j%2?-1:1;
   const length=k===0?20+random()*47:28+random()*58,angle=a+side*(.35+random()*.73);
   const x=main.restOrigin.x+p.x+Math.cos(angle)*length;
   const y=main.restOrigin.y+p.y+Math.sin(angle)*length+random()*10;
   const twig=add(id,t,[x,y],1+random()*.8,(random()-.5)*22);twigs.push(twig);if(k>=12&&k<15)centralTwigs.push(twig);if(k>=15&&k<17)lowerTwigs.push(twig);if(k===17)midTwigs.push(twig);if(k>=18)gapTwigs.push(twig);
  }
 }
 const leaves=[];
 function bloom(branch,inside=false,lower=false){
  const id=leaves.length,side=random()<.5?-1:1;
  leaves.push({id,branch,t:lower?.32+random()*.46:inside?.76+random()*.22:.56+random()*.42,side,offset:lower?8+random()*18:inside?4+random()*13:5+random()*19,rest:side*(.2+random()*1.4),size:lower?25+random()*10:inside?27+random()*10:33+random()*15,sprite:0,layer:random()<(inside?.5:.32)?'back':'front',tone:(()=>{const n=random();return n<.58?0:n<.88?1:2})(),growth:1,state:'attached',stress:0,threshold:.17+random()*.15,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 for(let i=0;i<440;i++)bloom(twigs[i%twigs.length]);
 for(let i=0;i<110;i++)bloom(centralTwigs[i%centralTwigs.length]);
 for(let i=0;i<80;i++)bloom(lowerTwigs[i%lowerTwigs.length]);
 for(let i=0;i<70;i++)bloom(leaders[i%leaders.length],true);
 for(let i=0;i<110;i++)bloom(leaders[[1,2,3,4,15,16][i%6]],false,true);
 for(let i=0;i<190;i++){
  const leader=[0,0,1,2,3][i%5];
  bloom(leaders[leader],false,true);
 }
 for(let i=0;i<110;i++){
  bloom(leaders[i%2],false,true);
  const flower=leaves[leaves.length-1];flower.t=.12+random()*.43;flower.size=32+random()*11;flower.offset=5+random()*18;
 }
 for(let i=0;i<85;i++)bloom(midTwigs[i%midTwigs.length]);
 for(let i=0;i<145;i++)bloom(gapTwigs[i%gapTwigs.length]);
 // A loose veil along the inner right limb softens its empty wedge without hiding the bark.
 for(let i=0;i<54;i++){
  bloom(leaders[1],false,true);
  const flower=leaves[leaves.length-1];
  flower.t=.27+random()*.37;flower.size=24+random()*8;flower.offset=6+random()*12;
 }
 for(let i=0;i<46;i++){
  bloom(leaders[16],false,true);
  const flower=leaves[leaves.length-1];
  flower.t=.18+random()*.43;flower.size=23+random()*9;flower.offset=6+random()*13;
 }
 // Fill the two exposed outer branch tips with small, airy flower clouds.
 for(let i=0;i<32;i++){bloom(twigs[[3,5][i%2]],true);const flower=leaves[leaves.length-1];flower.size*=.85;flower.edgeFill=true}
 // Bridge the right shoulder while keeping the lower edge tucked into the crown.
 const rightShoulder=add(leaders[3],.84,[724,402],1.35,6);
 for(let i=0;i<22;i++){bloom(rightShoulder,true);leaves[leaves.length-1].size*=.85}
 for(const flower of leaves)if(flower.branch===twigs[11]||flower.branch===twigs[13]){
  flower.t=Math.min(flower.t,.7);
  flower.size*=.86;
 }
 for(const b of branches){b.restOrigin={x:450+(b.restOrigin.x-450)*.9,y:745+(b.restOrigin.y-745)*1.13};b.origin={...b.restOrigin};b.c=b.c.map(([x,y])=>[x*.9,y*1.13])}
 // Thin the lower-left hanging cluster, preserving the branch and its soft outline.
 for(let i=leaves.length-1;i>=0;i--){
  const l=leaves[i],b=branches[l.branch],p=curvePoint(b.c,l.t);
  const x=b.restOrigin.x+p.x,y=b.restOrigin.y+p.y;
  const distance=Math.hypot((x-305)/165,(y-505)/125);
  if((!l.edgeFill&&x<215&&y>300&&y<470)||(distance<1&&((l.id*73)%101)/101<.58*(1-distance*.65)))leaves.splice(i,1);
 }
 const flowered=new Set(leaves.map(l=>l.branch));
 for(const twig of twigs.slice(0,7))if(!flowered.has(twig))branches[twig].hidden=true;
 // Prune the lone far-right sprig that breaks the crown's rounded outline.
 const farRightTip=twigs[27];
 for(let i=leaves.length-1;i>=0;i--)if(leaves[i].branch===farRightTip)leaves.splice(i,1);
 branches[farRightTip].hidden=true;
 leaves.forEach((l,i)=>l.id=i);
 return{branches,leaves};
}

// Willow uses its own scaffold: flexible hanging branchlets carry narrow leaves.
function makeWillow(){
 const random=randomSource(7403),branches=[],origin={x:450,y:745};
 function add(parent,t,end,width,bend=0){const p=parent<0?origin:(()=>{const b=branches[parent],q=curvePoint(b.c,t);return{x:b.restOrigin.x+q.x,y:b.restOrigin.y+q.y}})();const dx=end[0]-p.x,dy=end[1]-p.y;branches.push({parent,t,c:[[0,0],[dx*.24+bend,dy*.36],[dx*.8+bend*.35,dy*.78],[dx,dy]],width,theta:0,omega:0,angle:0,origin:{...p},restOrigin:p,depth:parent<0?0:branches[parent].depth+1});return branches.length-1}
 add(-1,0,[454,150],27,-12);
 const specs=[
  [0,.43,[235,305],9,-34],[0,.48,[665,290],8,28],
  [0,.55,[218,210],8,-31],[0,.60,[682,215],8,30],
  [0,.66,[278,137],7,-23],[0,.68,[620,132],7,22],
  [0,.74,[344,103],6,-14],[0,.78,[405,76],6,-8],
  [0,.82,[467,68],6,4],[0,.78,[528,86],6,11],
  [0,.73,[575,112],5,17],[0,.58,[333,181],5,-14],
  [0,.64,[554,169],5,14],[0,.70,[451,119],4,2]
 ];
 const leaders=specs.map(([parent,t,end,width,bend])=>add(parent,t,[end[0]+(random()-.5)*24,end[1]+(random()-.5)*26],width,bend)),twigs=[],crownTwigs=[];
 for(const [k,id] of leaders.entries()){
  const main=branches[id];
  const dx=main.c[3][0],dy=main.c[3][1];
  main.c=[[0,0],[dx*(.21+random()*.2),dy*(.52+random()*.25)],[dx*(.67+random()*.2),dy-(20+random()*65)],[dx,dy]];
  main.width*=.7;
  const groups=3+Math.floor(random()*3);
  for(let group=0;group<groups;group++){
   const centre=.17+(group+.35+random()*.35)*.77/groups;
   const lean=(dx<0?-1:1)*(random()<.2?-1:1);
   const reach=130+random()*245;
   const strands=3+Math.floor(random()*4);
   for(let strand=0;strand<strands;strand++){
    const t=centre+(strand-(strands-1)/2)*(.011+random()*.013)+(random()-.5)*.016,q=curvePoint(main.c,t),x=main.restOrigin.x+q.x,y=main.restOrigin.y+q.y;
    const drift=lean*(13+random()*44)+(strand-(strands-1)/2)*(7+random()*6);
    const end=[x+drift,Math.min(695,y+reach+(random()-.5)*120)];
    const twig=add(id,t,end,.5+random()*.35),b=branches[twig],tx=b.c[3][0],ty=b.c[3][1];
    b.c=[[0,0],[lean*(15+random()*42),ty*(.04+random()*.14)],[tx+lean*(random()*28-8),ty*(.56+random()*.23)],[tx,ty]];twigs.push(twig);
   }
  }
  for(let j=0,n=6+Math.floor(random()*5);j<n;j++){
   const t=.36+(j+random()*.7)*.59/n,q=curvePoint(main.c,t),x=main.restOrigin.x+q.x,y=main.restOrigin.y+q.y;
   const drift=(j%2?1:-1)*(9+random()*25),end=[x+drift,y+38+random()*72];
   const twig=add(id,t,end,.42+random()*.25),b=branches[twig],dx=b.c[3][0],dy=b.c[3][1];
   b.c=[[0,0],[dx*(.35+random()*.4),dy*.12],[dx*(.2+random()*.45),dy*(.67+random()*.18)],[dx,dy]];crownTwigs.push(twig);
  }
 }
 const leaves=[];
 for(let i=0;i<3500;i++){
  const branch=twigs[i%twigs.length],side=i%2?-1:1;
  leaves.push({id:i,branch,t:.09+random()*.87,side,offset:2+random()*5,rest:side*(.17+random()*.45),size:4+random()*2.5,sprite:0,layer:random()<.44?'back':'front',tone:(()=>{const n=random();return n<.58?0:n<.88?1:2})(),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 for(let i=0;i<1050;i++){
  const id=leaves.length,branch=crownTwigs[i%crownTwigs.length],side=i%2?-1:1;
  leaves.push({id,branch,t:.12+random()*.84,side,offset:2+random()*5,rest:side*(.17+random()*.45),size:4+random()*2.5,sprite:0,layer:random()<.48?'back':'front',tone:(()=>{const n=random();return n<.58?0:n<.88?1:2})(),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 // Leaf-bearing shoots cross the large limbs, breaking up their continuous outlines.
 for(let i=0;i<520;i++){
  const id=leaves.length,branch=leaders[i%leaders.length],side=random()<.5?-1:1;
  leaves.push({id,branch,t:.32+random()*.65,side,offset:3+random()*18,rest:side*(.12+random()*.7),size:4+random()*2.5,sprite:0,layer:'front',tone:(()=>{const n=random();return n<.58?0:n<.88?1:2})(),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 // Keep the shared mobile camera while matching the other trees' world-space height.
 for(const b of branches){
  b.restOrigin={x:450+(b.restOrigin.x-450)*1.25,y:745+(b.restOrigin.y-745)*1.2};
  b.origin={...b.restOrigin};
  b.c=b.c.map(([x,y])=>[x*1.25,y*1.2]);
  if(b.depth>1)b.restCurve=b.c.map(p=>[...p]);
 }
 return{branches,leaves};
}
