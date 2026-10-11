// Art-directed scaffold, deterministic smaller branches and leaf buds.
export function randomSource(seed=3917){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
export function curvePoint(c,t){const u=1-t;return{x:u*u*u*c[0][0]+3*u*u*t*c[1][0]+3*u*t*t*c[2][0]+t*t*t*c[3][0],y:u*u*u*c[0][1]+3*u*u*t*c[1][1]+3*u*t*t*c[2][1]+t*t*t*c[3][1]}}
export function makeTree(kind='maple'){
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
 [3,.58,[146,258],3,-8],[4,.62,[744,246],3,9]
 ]:ginkgo?[
 [0,.36,[245,415],7,-18],[0,.43,[650,382],8,20],
 [0,.48,[300,320],6,-10],[0,.53,[595,300],7,10],
 [0,.60,[275,230],5,-12],[0,.64,[627,205],6,15],
 [0,.72,[355,155],4,-10],[0,.78,[558,110],5,9],
 [0,.82,[425,88],3,-6],[0,.88,[480,48],3,5],
 [2,.64,[690,335],3,8],[1,.60,[190,350],3,-8]
 ]:[
 [0,.40,[206,430],8,-31],[0,.48,[682,415],10,29],
 [0,.50,[236,330],10,-35],[0,.59,[627,280],8,25],
 [0,.68,[342,186],10,-30],[0,.80,[497,102],8,-16],
 [0,.55,[443,244],6,-25],[2,.62,[723,360],4,16],
 [3,.57,[188,270],4,-13],[4,.64,[680,216],3,17],
 [5,.65,[300,147],4,-12],[6,.66,[561,139],3,15]
 ];
 const leaders=specs.map(args=>add(...args));const buds=[];
 for(const [k,id] of leaders.entries()){
  const main=branches[id],end=main.c[3],length=Math.hypot(...end),direction=Math.atan2(end[1],end[0]);
  const count=ginkgo?7+(k%2):cherry?7+(k%3):5+(k%3);
  for(let j=0;j<count;j++){
   const t=(ginkgo?.28:.18)+(j/(count-1))*(ginkgo?.7:.78)+(random()-.5)*.08,p=curvePoint(main.c,t),angle=direction+(j%2?1:-1)*(.32+random()*.8),len=(ginkgo?24:28)+random()*(ginkgo?49:58);
   const x=main.restOrigin.x+p.x+Math.cos(angle)*len,y=main.restOrigin.y+p.y+Math.sin(angle)*len;
   const twig=add(id,t,[x,y],1.3+random()*.8,(random()-.5)*18);buds.push(twig);
  }
 }
 const leaves=[];
 for(let i=0;i<1125;i++){
  const branch=buds[i%buds.length],side=random()<.5?-1:1;
  leaves.push({id:i,branch,t:.16+Math.pow(random(),.7)*.84,side,offset:5+random()*(ginkgo?24:31),rest:side*(.3+random()*1.5),size:ginkgo?17+random()*11:cherry?17+random()*9:16+random()*14,sprite:Math.floor(random()*5),layer:random()<.36?'back':'front',tone:Math.floor(random()*3),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 // Short petioles on the outer half of large limbs fill gaps between twig clusters.
 for(let i=0;i<225;i++){
  const id=leaves.length,branch=leaders[i%leaders.length],side=random()<.5?-1:1;
  leaves.push({id,branch,t:.46+random()*.48,side,offset:12+random()*(ginkgo?31:42),rest:side*(.25+random()*1.3),size:ginkgo?16+random()*10:cherry?16+random()*9:15+random()*12,sprite:Math.floor(random()*5),layer:random()<.48?'back':'front',tone:Math.floor(random()*3),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 // Fill the inside of each crown as separate leaves, preserving natural gaps at its edge.
 for(let i=0;i<(ginkgo?650:300);i++){
  const id=leaves.length,branch=leaders[i%leaders.length],side=random()<.5?-1:1;
  leaves.push({id,branch,t:(ginkgo?.18:.24)+random()*(ginkgo?.7:.58),side,offset:7+random()*(ginkgo?34:24),rest:side*(.25+random()*1.3),size:ginkgo?18+random()*8:cherry?15+random()*8:14+random()*10,sprite:Math.floor(random()*5),layer:random()<(ginkgo?.46:.72)?'back':'front',tone:Math.floor(random()*3),growth:1,state:'attached',stress:0,threshold:.14+random()*.13,x:0,y:0,vx:0,vy:0,angle:0,spin:0,age:4,alpha:1});
 }
 // Shape the whole scaffold around its rooted base: a deeper, narrower crown
 // reads as a taller tree without pushing the canopy out of the mobile frame.
 for(const b of ginkgo?[]:branches){
  b.restOrigin={x:450+(b.restOrigin.x-450)*.88,y:745+(b.restOrigin.y-745)*1.16};
  b.origin={...b.restOrigin};
  b.c=b.c.map(([x,y])=>[x*.88,y*1.16]);
 }
 return{branches,leaves};
}
