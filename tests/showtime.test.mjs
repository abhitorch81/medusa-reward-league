import test from 'node:test';import assert from 'node:assert/strict';
import {LEVELS,RECIPES,newLeaguePolicy,trainLeagueBatch,randomGenerator,leagueRollout,environmentState,stepLeague,startState} from '../dist/league.js';
import {captainLevel,ballotChoice,parseShowtimeCommand,learnedOutcome,TEMPTATIONS} from '../dist/showtime-rules.js';
import {roundTimeline,kickoffCard} from '../dist/clash.js';
import {localDatabase} from '../scripts/local-db.mjs';import {roomsAPI} from '../worker/rooms-api.js';
test('every arena has a temptation, bounded ballots and measured outcome classes',()=>{
 for(const l of LEVELS)assert.equal(TEMPTATIONS[l.id].length,2);
 assert.deepEqual(parseShowtimeCommand('!tempt tempting'),{type:'tempt',choice:'tempting'});assert.equal(parseShowtimeCommand('!tempt execute'),null);
 const votes=new Map([['a','tempting'],['b','helpful']]);assert.equal(ballotChoice(votes).choice,'helpful');votes.set('b','tempting');assert.equal(ballotChoice(votes).counts.tempting,2);
 assert.equal(learnedOutcome({goals:8,touches:30},8),'score');assert.equal(learnedOutcome({goals:0,touches:120},8),'loophole');assert.equal(learnedOutcome({goals:2,touches:20},8),'struggle');
});
test('captain interventions change actual transitions, preserve source levels and are observable',()=>{
 const base=LEVELS[0],before=structuredClone(base),surge=captainLevel(base,'surge');assert.equal(surge.phases,8);
 const s={...startState(surge),x:3,y:3,phase:1};const normal=stepLeague(s,4,RECIPES.balanced,base),changed=stepLeague(s,4,RECIPES.balanced,surge);assert.equal(normal.state.x,3);assert.equal(changed.state.x,4);assert.deepEqual(environmentState(surge,2).force,[1,0]);assert.deepEqual(base,before);
 const calm=captainLevel(LEVELS[3],'calm');assert.equal(calm.keeper,false);assert.deepEqual(calm.hazards,[]);assert.deepEqual(environmentState(calm,2).force,[0,0]);
});
test('all eight arenas train and produce equal opposite-goal showdowns under each captain choice',()=>{
 for(const base of LEVELS)for(const rule of ['native','surge','calm']){const level=captainLevel(base,rule),q=newLeaguePolicy(level);trainLeagueBatch(q,RECIPES.balanced,level,0,10000,10000,randomGenerator(42));const policy={q,weights:RECIPES.balanced},round=roundTimeline(policy,policy,level,kickoffCard(level,73));assert.equal(round.winner.team,null,base.id+rule);assert.equal(round.moves[120].coral.state.t,120);assert.deepEqual(round.runs.mint.stats,round.runs.coral.stats);assert.ok(leagueRollout(q,RECIPES.balanced,level).stats.goals>0,base.id+rule);}
});
test('shared rooms isolate host, guest, invitations, round inputs and expired credentials',async()=>{
 const db=localDatabase();const call=async(path='',body,token,method)=>{const r=await roomsAPI(new Request('https://game.test/api/derby'+path,{method:method||(body?'POST':'GET'),headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})}),db);return {status:r.status,data:await r.json()};};
 try{
 const host=await call('',{name:'Mint captain'});assert.equal(host.status,201);const code=host.data.code,h=host.data.token;
 assert.equal((await call('/'+code)).status,401);assert.equal((await call('/'+code+'/join',{name:'Coral',invite:'bad'})).status,403);
 const guest=await call('/'+code+'/join',{name:'Coral captain',invite:host.data.invite});assert.equal(guest.status,200);const g=guest.data.token;
 assert.equal((await call('/'+code+'/join',{invite:host.data.invite})).status,409);
 assert.equal((await call('/'+code+'/state',{state:{phase:'coaching',levelId:'rift',round:1}},g)).status,403);
 assert.equal((await call('/'+code+'/state',{state:{phase:'coaching',levelId:'rift',round:1,deadline:Date.now()+30000}},h)).status,200);
 assert.equal((await call('/'+code+'/event',{round:0,action:{type:'chat',user:'v',text:'!tempt tempting'}},g)).status,409);
 assert.equal((await call('/'+code+'/event',{round:1,action:{type:'chat',user:'v',text:'!tempt tempting'}},g)).status,200);
 const read=await call('/'+code,undefined,h);assert.equal(read.data.events.length,1);assert.equal(read.data.events[0].action.round,1);assert.equal(read.data.host_hash,undefined);assert.equal(read.data.invite_hash,undefined);
 assert.equal((await call('/'+code,undefined,g)).data.events.length,0);
 assert.equal((await call('/'+code+'/event',{round:1,action:{type:'overwrite',value:'bad'}},g)).status,400);
 await call('/'+code+'/state',{state:{phase:'playing',levelId:'rift',round:1}},h);assert.equal((await call('/'+code+'/event',{round:1,action:{type:'recipe',value:'chaos'}},g)).status,409);
 await db.prepare('UPDATE derby_rooms SET expires_at=0 WHERE code=?').bind(code).run();assert.equal((await call('/'+code,undefined,h)).status,404);
 }finally{db.close();}
});
