export const WIDTH=7, HEIGHT=5, HORIZON=90;
export const COUNTER={x:1,y:1}, CUSTOMER={x:5,y:3};
export const BAD={pickup:3,delivery:1,movement:0};
export const GOOD={pickup:0,delivery:8,movement:0};
export function rng(seed=42){let n=seed>>>0;return()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296;};}
export function initial(x=3,y=2){return {x,y,holding:0,t:0,pickups:0,drops:0,delivered:0,reward:0};}
export function key(s){return (s.y*WIDTH+s.x)*2+s.holding;}
export function transition(state,action,weights){
 const s={...state,t:state.t+1};let reward=-0.06,event='Waiting';
 const moves=[[0,-1],[1,0],[0,1],[-1,0]];
 if(action<4){const [dx,dy]=moves[action];s.x=Math.max(0,Math.min(WIDTH-1,s.x+dx));s.y=Math.max(0,Math.min(HEIGHT-1,s.y+dy));if(s.x!==state.x||s.y!==state.y){reward+=weights.movement;event='Moving';}else event='At the wall';}
 if(action===4){if(s.x===COUNTER.x&&s.y===COUNTER.y){if(s.holding){s.holding=0;s.drops++;event='Put cup back';}else{s.holding=1;s.pickups++;reward+=weights.pickup;event='Picked up a cup';}}else if(s.x===CUSTOMER.x&&s.y===CUSTOMER.y&&s.holding){s.holding=0;s.delivered++;reward+=weights.delivery;event='Customer served!';}else event='Nothing to interact with';}
 s.reward+=reward;return {state:s,reward,event,done:s.t>=HORIZON};
}
export function greedy(q,s){const values=q[key(s)];let best=0;for(let a=1;a<6;a++)if(values[a]>values[best])best=a;return best;}
export function newPolicy(){return Array.from({length:WIDTH*HEIGHT*2},()=>Array(6).fill(0));}
export function trainBatch(q,weights,start,count,total,random){
 for(let episode=start;episode<start+count;episode++){
  let s=initial(Math.floor(random()*WIDTH),Math.floor(random()*HEIGHT));
  const epsilon=Math.max(0.07,0.9*(1-episode/total));
  for(let t=0;t<HORIZON;t++){
   const a=random()<epsilon?Math.floor(random()*6):greedy(q,s);
   // The shift limit truncates a continuing task; it is not an absorbing terminal state.
   const result=transition(s,a,weights);const bootstrap=Math.max(...q[key(result.state)]);
   q[key(s)][a]+=0.18*(result.reward+0.94*bootstrap-q[key(s)][a]);s=result.state;
  }
 }
 return q;
}
export function rollout(q,weights,start=initial()){
 const frames=[{state:start,event:'Shift begins'}];let s=start;
 while(s.t<HORIZON){const next=transition(s,greedy(q,s),weights);frames.push(next);s=next.state;}
 return {frames,stats:s};
}
export function evaluate(q,weights){const starts=[[3,2],[0,4],[6,0],[0,0],[6,4]];const results=starts.map(([x,y])=>rollout(q,weights,initial(x,y)).stats);return {deliveries:results.reduce((n,s)=>n+s.delivered,0)/results.length,pickups:results.reduce((n,s)=>n+s.pickups,0)/results.length,reward:results.reduce((n,s)=>n+s.reward,0)/results.length};}
