import test from 'node:test';import assert from 'node:assert/strict';
import {playerAvoidance} from '../dist/player-avoidance.js';import {LEVELS} from '../dist/league.js';
test('head-on creatures sidestep with personal space in every arena, including edge lanes',()=>{
 for(const level of LEVELS)for(const z of [-3,0,3]){let offsets={mint:0,coral:0};for(let tick=0;tick<=100;tick++){const a={x:-4+tick*.08,z},b={x:4-tick*.08,z};offsets=playerAvoidance(a,b,level.height,offsets);const az=a.z+offsets.mint,bz=b.z+offsets.coral;assert.ok(Math.hypot(a.x-b.x,az-bz)>=1.35-1e-9,level.id);assert.ok(Math.abs(az)<=(level.height-1)/2+.15);assert.ok(Math.abs(bz)<=(level.height-1)/2+.15);}}
});
test('steering releases after passing and guards a sudden shared position',()=>{
 let offsets=playerAvoidance({x:0,z:0},{x:0,z:0},7);assert.ok(Math.abs(offsets.mint-offsets.coral)>=1.35);
 for(let i=0;i<120;i++)offsets=playerAvoidance({x:-5,z:0},{x:5,z:0},7,offsets);assert.ok(Math.abs(offsets.mint)<.001);assert.ok(Math.abs(offsets.coral)<.001);
});
