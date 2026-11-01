import test from 'node:test';import assert from 'node:assert/strict';
import {createGameServer} from '../server.mjs';
test('Render server serves health, assets and shared rooms with the public origin',async()=>{
 const server=createGameServer({dbPath:':memory:',publicOrigin:'https://medusa.example'});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 try{
  const health=await fetch(base+'/healthz');assert.equal(health.status,200);assert.equal((await health.json()).ok,true);
  const game=await fetch(base+'/');assert.equal(game.status,200);assert.match(await game.text(),/MEDUSA/);
  assert.equal((await fetch(base+'/.openai/hosting.json')).status,404);assert.equal((await fetch(base+'/server/index.js')).status,404);
  const created=await fetch(base+'/api/derby',{method:'POST',headers:{Origin:'https://medusa.example','Content-Type':'application/json'},body:JSON.stringify({name:'Render captain'})});assert.equal(created.status,201);const room=await created.json();
  const state=await fetch(base+'/api/derby/'+room.code,{headers:{Authorization:'Bearer '+room.token}});assert.equal(state.status,200);assert.equal((await state.json()).hostName,'Render captain');
  const bad=await fetch(base+'/api/derby',{method:'POST',headers:{Origin:'https://other.example','Content-Type':'application/json'},body:'{}'});assert.equal(bad.status,403);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
