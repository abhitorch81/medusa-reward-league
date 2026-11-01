import test from 'node:test';
import assert from 'node:assert/strict';
import {BAD,GOOD,rng,newPolicy,trainBatch,rollout,evaluate,initial,transition} from '../dist/rl.js';
test('pickup rewards can be exploited without serving a customer',()=>{let s=initial(1,1);s=transition(s,4,BAD).state;s=transition(s,4,BAD).state;assert.equal(s.pickups,1);assert.equal(s.drops,1);assert.equal(s.delivered,0);assert.ok(s.reward>0);});
test('actual Q-learning discovers the loophole and repaired incentives produce deliveries',()=>{
 for(const seed of [7,42,123]){const bad=newPolicy(),good=newPolicy();trainBatch(bad,BAD,0,6000,6000,rng(seed));trainBatch(good,GOOD,0,6000,6000,rng(seed));const b=evaluate(bad,BAD),g=evaluate(good,GOOD);assert.ok(b.pickups>25,JSON.stringify(b));assert.equal(b.deliveries,0);assert.ok(g.deliveries>=5,JSON.stringify(g));assert.ok(g.deliveries>b.deliveries);}
});
test('frozen replays are deterministic and do not mutate the policy',()=>{const q=newPolicy();trainBatch(q,GOOD,0,6000,6000,rng(42));const saved=JSON.stringify(q);assert.deepEqual(rollout(q,GOOD),rollout(q,GOOD));assert.equal(JSON.stringify(q),saved);});
