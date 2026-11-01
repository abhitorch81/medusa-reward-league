import {captainForce} from './showtime-rules.js';
export const MATCH_STEPS=120,DISCOUNT=.95;
export const LEVELS=[
 {id:'lagoon',name:'First Contact',world:'THE LAGOON',tag:'Learn to score',description:'An open arena. One ball. Teach Medusa what winning means.',width:9,height:7,spawn:[1,3],goal:[8,3],walls:[],hazards:[],boosts:[],phases:1,target:8,color:'#66f6d6',number:'01'},
 {id:'reef',name:'Coral Run',world:'THE REEF',tag:'Find another way',description:'A coral wall blocks the obvious route. Reward progress, not busywork.',width:9,height:7,spawn:[1,3],goal:[8,3],walls:[[4,1],[4,2],[4,3],[4,4]],hazards:[[3,5]],boosts:[],phases:1,target:5,color:'#ffb98a',number:'02'},
 {id:'current',name:'Against the Tide',world:'THE CURRENT',tag:'Read the current',description:'Slipstreams carry the ball east. Pink vents reset possession.',width:11,height:7,spawn:[1,3],goal:[10,3],walls:[[5,2],[5,3],[5,4]],hazards:[[3,4],[7,2],[8,4]],boosts:[[3,1],[4,1],[6,5],[7,5]],phases:1,target:5,color:'#9d9cff',number:'03'},
 {id:'abyss',name:'The Last Light',world:'THE ABYSS',tag:'Time your finish',description:'A moving sentinel guards the final lane. Sometimes patience wins.',width:9,height:7,spawn:[1,3],goal:[8,3],walls:[[4,1],[4,5]],hazards:[[3,0],[5,6]],boosts:[],keeper:true,phases:6,target:7,color:'#ff8ed8',number:'04'},
 {id:'gravity',name:'Gravshift Station',world:'ORBITAL STATION',tag:'Gravity changes direction',description:'Artificial gravity rotates every two moves. The station pulls your ball on alternating beats. Watch the phase, then countersteer.',width:9,height:7,spawn:[1,3],goal:[8,3],walls:[[4,1],[4,5]],hazards:[[5,0],[5,6]],boosts:[],phases:8,target:5,color:'#bca4ff',number:'05',theme:'station',mechanic:'gravity'},
 {id:'orbit',name:'Solar Sail',world:'DEEP SPACE',tag:'Ride the solar wind',description:'Cross a starship flight deck. Solar wind changes from eastbound to westbound; coast with it or spend a move correcting your course.',width:11,height:7,spawn:[1,3],goal:[10,3],walls:[[5,2],[5,4]],hazards:[[7,0],[7,6]],boosts:[[3,1],[7,5]],phases:8,target:5,color:'#ffcb7d',number:'06',theme:'space',mechanic:'wind'},
 {id:'rift',name:'Through the Rift',world:'INTERSTELLAR VOYAGE',tag:'Catch a wormhole window',description:'Wormholes open for half of each cycle. Thread an asteroid lane, or ride an active rift across the board. Timing is part of the observation.',width:11,height:7,spawn:[1,3],goal:[10,3],walls:[[5,2],[5,3],[5,4]],hazards:[[7,0],[7,6]],boosts:[],portals:[{from:[3,1],to:[8,5]},{from:[3,5],to:[8,1]}],orbitingHazard:{x:7,rows:[1,2,3,4,5,4,3,2]},phases:8,target:4,color:'#eaa1ff',number:'07',theme:'interstellar',mechanic:'wormhole'},
 {id:'seabed',name:'Hadal Garden',world:'THE OCEAN FLOOR',tag:'Survive the turning tide',description:'A living seabed, swaying kelp and pulsing thermal vents. The tide reverses mid-cycle, and vents are dangerous only while lit.',width:11,height:7,spawn:[1,3],goal:[10,3],walls:[[5,1],[5,5]],hazards:[],pulsingHazards:[[4,2],[4,4],[7,2],[7,4]],boosts:[[2,1],[6,5]],phases:8,target:4,color:'#72e9e2',number:'08',theme:'seabed',mechanic:'tide'}
];
export const RECIPES={balanced:{goal:10,touch:0,progress:.5,safety:2},chaos:{goal:1,touch:3,progress:0,safety:0}};
export function randomGenerator(seed=42){let n=seed>>>0;return()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296;};}
export const includes=(list,x,y)=>list.some(p=>p[0]===x&&p[1]===y);
export const stateKey=(s,level)=>(s.y*level.width+s.x)*level.phases+s.phase;
export function stateCount(level){return level.width*level.height*level.phases;}
export function newLeaguePolicy(level){return Array.from({length:stateCount(level)},()=>Array(5).fill(0));}
export function startState(level,position=level.spawn){return {x:position[0],y:position[1],phase:0,t:0,goals:0,touches:0,collisions:0,reward:0};}
export function keeperRow(phase){return [1,2,3,4,3,2][phase%6];}
function naturalEnvironmentState(level,phase){
 const p=phase%level.phases,first=p<level.phases/2;
 if(level.mechanic==='gravity'){const index=Math.floor(p/2);return {label:['GRAVITY ↓','GRAVITY →','GRAVITY ↑','GRAVITY ←'][index],force:p%2===0?[[0,1],[1,0],[0,-1],[-1,0]][index]:[0,0],arrow:['↓','→','↑','←'][index],energy:p%2===0,portal:false};}
 if(level.mechanic==='wind')return {label:first?'SOLAR WIND →':'SOLAR WIND ←',force:p%2===0?[first?1:-1,0]:[0,0],arrow:first?'→':'←',energy:p%2===0,portal:false};
 if(level.mechanic==='wormhole')return {label:first?'RIFTS OPEN · TRANSIT READY':'RIFTS CLOSED · RECHARGING',force:[0,0],arrow:'◎',energy:first,portal:first};
 if(level.mechanic==='tide')return {label:first?'NORTH TIDE ↑ · VENTS ACTIVE':'SOUTH TIDE ↓ · VENTS QUIET',force:p===2||p===6?[0,first?-1:1]:[0,0],arrow:first?'↑':'↓',energy:first,portal:false};
 return {label:level.keeper?'SENTINEL PATROL':'STABLE CONDITIONS',force:[0,0],arrow:'·',energy:false,portal:false};
}
export function environmentState(level,phase){const env=naturalEnvironmentState(level,phase);if(level.captainRule==='calm')return {...env,force:[0,0],label:'EYE OF THE STORM · CALM',energy:false};if(level.captainRule==='surge'){const index=Math.floor((phase%8)/2),arrow=['↑','→','↓','←'][index];return {...env,force:captainForce(level,phase),arrow,label:'CAPTAIN SURGE '+arrow};}return env;}
export function stepLeague(state,action,weights,level){
 const s={...state,t:state.t+1,phase:(state.phase+1)%level.phases};
 const [dx,dy]=[[0,-1],[1,0],[0,1],[-1,0],[0,0]][action];let nx=s.x+dx,ny=s.y+dy,reward=-.08,event='Holding position',kind='wait',terminal=false;
 const oldDistance=Math.abs(state.x-level.goal[0])+Math.abs(state.y-level.goal[1]);
 if(action<4){
  if(nx<0||ny<0||nx>=level.width||ny>=level.height||includes(level.walls,nx,ny)){s.collisions++;reward-=weights.safety*.4;event='Coral blocked the ball';kind='blocked';}
  else{
   if(includes(level.boosts,nx,ny)&&nx+1<level.width&&!includes(level.walls,nx+1,ny)){nx++;event='Caught the slipstream';kind='boost';}else{event='Dribbling toward the light';kind='move';}
   s.x=nx;s.y=ny;s.touches++;reward+=weights.touch;
   const hazard=includes(level.hazards,nx,ny),keeper=level.keeper&&nx===level.goal[0]-1&&ny===keeperRow(s.phase);
   if(hazard||keeper){s.collisions++;reward-=weights.safety+1;terminal=true;kind='lost';event=keeper?'Saved by the sentinel!':'The vent stole possession';}
   else if(nx===level.goal[0]&&ny===level.goal[1]){s.goals++;reward+=weights.goal;terminal=true;kind='goal';event='GOAL! The reward found its purpose.';}
  }
 }
 // Environment phase is observable. Forces and portal windows are deterministic.
 if(!terminal&&(level.mechanic||level.captainRule==='surge')){const env=environmentState(level,s.phase),[fx,fy]=env.force;if(fx||fy){const tx=s.x+fx,ty=s.y+fy;if(tx>=0&&ty>=0&&tx<level.width&&ty<level.height&&!includes(level.walls,tx,ty)){s.x=tx;s.y=ty;kind='drift';event=level.mechanic==='tide'?'The tide carried the ball':level.mechanic==='wind'?'Solar wind changed your course':'Gravity shifted your course';}else{reward-=weights.safety*.2;s.collisions++;event='The environment pushed into an obstacle';}}
  if(env.portal){const portal=level.portals?.find(p=>p.from[0]===s.x&&p.from[1]===s.y);if(portal){[s.x,s.y]=portal.to;kind='warp';event='Wormhole transit complete';}}
  const meteor=level.orbitingHazard&&s.x===level.orbitingHazard.x&&s.y===level.orbitingHazard.rows[s.phase],vent=env.energy&&includes(level.pulsingHazards||[],s.x,s.y);
  if(includes(level.hazards,s.x,s.y)||meteor||vent){s.collisions++;reward-=weights.safety+1;terminal=true;kind='lost';event=meteor?'An asteroid intercepted the ball':vent?'An active thermal vent stole possession':'Possession lost in the hazard field';}
  else if(s.x===level.goal[0]&&s.y===level.goal[1]){s.goals++;reward+=weights.goal;terminal=true;kind='goal';event='Destination reached. GOAL!';}
 }
 // Potential-based shaping: terminal states have zero potential.
 const nextDistance=terminal?0:Math.abs(s.x-level.goal[0])+Math.abs(s.y-level.goal[1]);
 reward+=weights.progress*(oldDistance-DISCOUNT*nextDistance);
 s.reward+=reward;return {state:s,reward,event,kind,terminal};
}
export function bestAction(q,s,level){const row=q[stateKey(s,level)];let a=0;for(let i=1;i<5;i++)if(row[i]>row[a])a=i;return a;}
export function trainLeagueBatch(q,weights,level,start,count,total,random){
 for(let e=start;e<start+count;e++){
  let position=level.spawn;if(random()<.3){do{position=[Math.floor(random()*level.width),Math.floor(random()*level.height)];}while(includes(level.walls,...position)||includes(level.hazards,...position)||position[0]===level.goal[0]);}
  let s=startState(level,position);s.phase=Math.floor(random()*level.phases);const epsilon=Math.max(.045,.95*(1-e/total));
  for(let t=0;t<70;t++){const a=random()<epsilon?Math.floor(random()*5):bestAction(q,s,level);const next=stepLeague(s,a,weights,level);const target=next.reward+(next.terminal?0:DISCOUNT*Math.max(...q[stateKey(next.state,level)]));q[stateKey(s,level)][a]+=.2*(target-q[stateKey(s,level)][a]);s=next.state;if(next.terminal)break;}
 }
 return q;
}
export function leagueRollout(q,weights,level,{seed=99,position=level.spawn,phase=0,randomPolicy=false}={}){
 const random=randomGenerator(seed);let s={...startState(level,position),phase:phase%level.phases};const frames=[{state:{...s},event:'Kickoff. Your incentives are in charge.',kind:'start'}];
 for(let i=0;i<MATCH_STEPS;i++){
  const action=randomPolicy?Math.floor(random()*5):bestAction(q,s,level);const result=stepLeague(s,action,weights,level);s=result.state;frames.push({...result,state:{...s}});
  if(result.terminal){const spawn=startState(level,position);s={...s,x:spawn.x,y:spawn.y};frames.push({state:{...s},event:'New possession',kind:'reset'});}
 }
 return {frames,stats:{...s},seed};
}
export function leagueEvaluation(q,weights,level,{randomPolicy=false}={}){const seeds=[17,42,93,123,321];const rows=seeds.map(seed=>leagueRollout(q,weights,level,{seed,randomPolicy}).stats);return {goals:rows.reduce((n,s)=>n+s.goals,0)/rows.length,touches:rows.reduce((n,s)=>n+s.touches,0)/rows.length,collisions:rows.reduce((n,s)=>n+s.collisions,0)/rows.length,reward:rows.reduce((n,s)=>n+s.reward,0)/rows.length};}
export function parseLeagueVote(text){const match=/^!reward\s+(goal|touch|progress|safety)\s+(\d+(?:\.\d+)?)\s*$/i.exec(text.trim());if(!match)return null;const rule=match[1].toLowerCase(),value=Number(match[2]),max={goal:15,touch:4,progress:2,safety:5}[rule],increment={goal:1,touch:.5,progress:.1,safety:.5}[rule];if(!Number.isFinite(value)||value>max||Math.abs(value/increment-Math.round(value/increment))>1e-7)return null;return {rule,value};}
export function validateLeaguePolicy(policy,level){return policy?.q?.length===stateCount(level)&&policy.q.every(row=>row.length===5&&row.every(Number.isFinite))&&Object.keys(RECIPES.balanced).every(k=>Number.isFinite(policy.weights?.[k]));}
