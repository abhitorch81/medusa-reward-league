const ROOM_TTL=4*60*60*1000,ROOM_PHASES=['idle','coaching','training','countdown','playing','paused','result','error'];
const response=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const secret=()=>crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
async function digest(value){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(v=>v.toString(16).padStart(2,'0')).join('');}
async function body(request,max=80000){const text=await request.text();if(text.length>max)throw new Error('Request too large');return JSON.parse(text);}
function displayName(value){return String(value||'Streamer').replace(/[<>\x00-\x1f]/g,'').slice(0,35).trim()||'Streamer';}
function cleanAction(action){
 if(!action||typeof action!=='object')throw new Error('Invalid action');
 const user=String(action.user||'captain');if(!/^[a-zA-Z0-9:_-]{1,100}$/.test(user))throw new Error('Invalid viewer key');
 if(action.type==='chat'&&typeof action.text==='string'&&/^!(reward|predict|team|tempt|learn)\s+[a-z0-9. ]{1,65}$/i.test(action.text))return {type:'chat',user,text:action.text,rehearsal:action.rehearsal===true};
 if(action.type==='recipe'&&['balanced','chaos','sprint','careful'].includes(action.value))return {type:'recipe',value:action.value};
 if(action.type==='captain'&&['native','surge','calm'].includes(action.value))return {type:'captain',value:action.value};
 if(action.type==='channel'&&/^[a-z0-9_]{1,25}$/.test(action.value))return {type:'channel',value:action.value};
 throw new Error('Unsupported action');
}
export async function roomsAPI(request,db){
 const url=new URL(request.url),path=url.pathname;if(!path.startsWith('/api/derby'))return null;
 try{
  if(!db)return response({error:'Shared rooms are unavailable. Solo showdown still works.'},503);
  if(request.method==='POST'&&request.headers.get('Origin')&&request.headers.get('Origin')!==url.origin&&request.headers.get('Origin')!=='https://chat-you-raised-this.abhisantu81.chatgpt.site')return response({error:'Cross-origin writes are not allowed'},403);
  if(path==='/api/derby'&&request.method==='POST'){
   const input=await body(request,1000),code=crypto.randomUUID().replaceAll('-','').slice(0,12).toUpperCase(),token=secret(),invite=secret(),now=Date.now();
   await db.prepare('DELETE FROM derby_events WHERE room_code IN (SELECT code FROM derby_rooms WHERE expires_at < ?)').bind(now).run();
   await db.prepare('DELETE FROM derby_rooms WHERE expires_at < ?').bind(now).run();
   await db.prepare('INSERT INTO derby_rooms (code,host_hash,invite_hash,host_name,expires_at,state_json) VALUES (?,?,?,?,?,?)').bind(code,await digest(token),await digest(invite),displayName(input.name),now+ROOM_TTL,JSON.stringify({phase:'idle',levelId:'lagoon'})).run();
   return response({code,token,invite,role:'host',expiresAt:now+ROOM_TTL},201);
  }
  const match=/^\/api\/derby\/([A-F0-9]{12})(?:\/(join|state|event))?$/.exec(path);if(!match)return response({error:'Unknown room endpoint'},404);
  const [,code,action]=match,row=await db.prepare('SELECT * FROM derby_rooms WHERE code=? AND expires_at>?').bind(code,Date.now()).first();if(!row)return response({error:'Room not found or expired'},404);
  if(action==='join'&&request.method==='POST'){
   const input=await body(request,1000);if(typeof input.invite!=='string'||await digest(input.invite)!==row.invite_hash)return response({error:'Invalid invitation'},403);
   const token=secret(),result=await db.prepare('UPDATE derby_rooms SET guest_hash=?,guest_name=? WHERE code=? AND guest_hash IS NULL').bind(await digest(token),displayName(input.name),code).run();
   if(!result.meta.changes)return response({error:'This invitation has already been claimed'},409);
   return response({code,token,role:'guest',expiresAt:row.expires_at});
  }
  const token=request.headers.get('Authorization')?.replace(/^Bearer /,'');if(!token||token.length>150)return response({error:'Room credential required'},401);const hash=await digest(token),role=hash===row.host_hash?'host':hash===row.guest_hash?'guest':null;if(!role)return response({error:'Room access denied'},403);
  if(request.method==='GET'&&!action){
   const after=Math.max(0,Math.min(1e9,Number(url.searchParams.get('after'))||0));const events=role==='host'?(await db.prepare('SELECT id,action_json FROM derby_events WHERE room_code=? AND id>? ORDER BY id LIMIT 150').bind(code,after).all()).results:[];
   return response({code,role,hostName:row.host_name,guestName:row.guest_name,guestJoined:!!row.guest_hash,state:JSON.parse(row.state_json),version:row.version,events:events.map(e=>({id:e.id,action:JSON.parse(e.action_json)})),expiresAt:row.expires_at});
  }
  if(action==='state'&&request.method==='POST'){
   if(role!=='host')return response({error:'Only the host can advance the match'},403);const input=await body(request);
   if(!input.state||!ROOM_PHASES.includes(input.state.phase)||!['lagoon','reef','current','abyss','gravity','orbit','rift','seabed'].includes(input.state.levelId))throw new Error('Invalid match snapshot');
   if(input.state.rule&&!['native','surge','calm'].includes(input.state.rule))throw new Error('Invalid captain rule');
   const packet=input.state.packet;if(packet){if(packet.levelId!==input.state.levelId||!ROOM_PHASES.includes(packet.phase)||!Number.isInteger(packet.move)||packet.move<0||packet.move>120)throw new Error('Invalid match frame');const width=['current','orbit','rift','seabed'].includes(packet.levelId)?11:9;for(const team of ['mint','coral']){const state=packet[team]?.state;if(!state||![state.x,state.y,state.phase,state.t,state.goals].every(Number.isInteger)||state.x<0||state.x>=width||state.y<0||state.y>=7||state.phase<0||state.phase>=24||state.t<0||state.t>120||state.goals<0||state.goals>120)throw new Error('Invalid match frame');}}
   await db.prepare('UPDATE derby_rooms SET state_json=?,version=version+1 WHERE code=?').bind(JSON.stringify(input.state),code).run();return response({ok:true});
  }
  if(action==='event'&&request.method==='POST'){
   if(role!=='guest')return response({error:'Guest events only'},403);const input=await body(request,1500),event=cleanAction(input.action),state=JSON.parse(row.state_json);if(event.type!=='channel'&&input.round!==state.round)return response({error:'Round changed; wait for synchronization'},409);event.round=state.round;
   if(event.type!=='channel'&&(!['coaching','training','countdown'].includes(state.phase)||state.phase!=='coaching'&&event.type!=='chat'))return response({error:'Coaching is closed'},409);
   if(state.phase==='coaching'&&state.deadline&&Date.now()>state.deadline)return response({error:'Coaching window ended'},409);
   const recent=await db.prepare('SELECT COUNT(*) AS n FROM derby_events WHERE room_code=? AND created_at>?').bind(code,Date.now()-60000).first();if(recent.n>=600)return response({error:'Room input limit reached; try again shortly'},429);
   await db.prepare('INSERT INTO derby_events (room_code,action_json,created_at) VALUES (?,?,?)').bind(code,JSON.stringify(event),Date.now()).run();return response({ok:true});
  }
  return response({error:'Method not allowed'},405);
 }catch(error){return response({error:error instanceof SyntaxError?'Invalid JSON':error.message==='Request too large'?'Request too large':error.message?.startsWith('D1_')?'Room storage unavailable':error.message},400);}
}
