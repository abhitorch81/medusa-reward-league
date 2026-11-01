import test from 'node:test';import assert from 'node:assert/strict';
import {CoachingWindow,teamRecipe,decideWinner,kickoffCard,roundTimeline} from '../dist/clash.js';
import {LEVELS,RECIPES,newLeaguePolicy,trainLeagueBatch,randomGenerator} from '../dist/league.js';
import {clashDisplayState,clashKickoffPositions} from '../dist/clash-coordinates.js';
test('opposite-goal presentation mirrors Coral without changing scores, timing or source states',()=>{
 for(const level of LEVELS){
  const kickoff=clashKickoffPositions(level,level.spawn);
  assert.equal(kickoff.mint[0]+kickoff.coral[0],level.width-1);
  const source={x:level.goal[0],y:level.goal[1],goals:7,t:120,phase:level.phases-1,reward:42};
  const before=structuredClone(source),mint=clashDisplayState(source,level,'mint'),coral=clashDisplayState(source,level,'coral');
  assert.equal(mint.x,level.width-1);assert.equal(coral.x,0);
  assert.deepEqual(clashDisplayState(coral,level,'coral'),source);
  assert.deepEqual(source,before);assert.equal(coral.goals,mint.goals);assert.equal(coral.phase,mint.phase);assert.equal(coral.t,120);
  for(const [x,y] of [...level.walls,...level.hazards,...level.boosts,...(level.pulsingHazards||[])]){
   const a=clashDisplayState({x,y},level,'coral'),b=clashDisplayState({x:level.goal[0],y:level.goal[1]},level,'coral');
   assert.equal(Math.abs(a.x-b.x)+Math.abs(a.y-b.y),Math.abs(x-level.goal[0])+Math.abs(y-level.goal[1]));
  }
 }
});
test('a viewer must join, has one latest vote, and switching teams removes their previous vote',()=>{const w=new CoachingWindow();assert.equal(w.receive('a','!reward goal 10','coaching').accepted,false);w.receive('a','!team mint','coaching');w.receive('a','!reward goal 10','coaching');w.receive('a','!reward touch 0','coaching');assert.equal(w.votes.mint.size,1);w.receive('a','!team coral','coaching');assert.equal(w.votes.mint.size,0);w.receive('a','!reward goal 15','coaching');assert.equal(w.votes.coral.size,1);assert.deepEqual(w.counts(),{mint:0,coral:1});});
test('predictions close at kickoff and reward votes close before training',()=>{const w=new CoachingWindow();assert.equal(w.receive('a','!predict mint','countdown').accepted,true);assert.equal(w.receive('a','!predict coral','playing').accepted,false);assert.equal(w.predictions.get('a'),'mint');assert.equal(w.receive('a','!team coral','training').accepted,false);});
test('the rematch enforces two actual component changes and prioritizes viewer support',()=>{const base={...RECIPES.chaos},votes=new Map([['a',{rule:'safety',value:5}],['b',{rule:'safety',value:5}]]);const result=teamRecipe(base,RECIPES.balanced,votes,2);assert.equal(result.changes.length,2);assert.equal(result.weights.safety,5);assert.equal(result.weights.goal,10);assert.equal(result.weights.touch,3);assert.equal(result.dropped.length,2);});
test('winners use goals and mistakes, never incomparable reward totals',()=>{assert.equal(decideWinner({goals:2,collisions:0,reward:-100},{goals:1,collisions:0,reward:999}).team,'mint');assert.equal(decideWinner({goals:2,collisions:3},{goals:2,collisions:1}).team,'coral');assert.equal(decideWinner({goals:2,collisions:1},{goals:2,collisions:1}).team,null);});
test('identical policies draw under the same reveal card and receive exactly 120 moves',()=>{for(const level of LEVELS){const q=newLeaguePolicy(level);trainLeagueBatch(q,RECIPES.balanced,level,0,10000,10000,randomGenerator(42));const policy={q,weights:RECIPES.balanced},card=kickoffCard(level,73),round=roundTimeline(policy,policy,level,card);assert.equal(round.winner.team,null);assert.equal(round.moves.length,121);assert.deepEqual(round.runs.mint.stats,round.runs.coral.stats);assert.deepEqual(round.moves[0].mint.state,round.moves[0].coral.state);assert.equal(round.moves[120].mint.state.t,120);}});
