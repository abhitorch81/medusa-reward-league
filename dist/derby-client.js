export class DerbyClient{
 constructor(onUpdate,onError){this.onUpdate=onUpdate;this.onError=onError;this.cursor=0;this.busy=false;this.lastVersion=-1;}
 async request(path,body){const res=await fetch('/api/derby'+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(this.session?{Authorization:'Bearer '+this.session.token}:{})},...(body?{body:JSON.stringify(body)}:{})});const data=await res.json();if(!res.ok)throw new Error(data.error||'Room request failed');return data;}
 async create(name){const s=await this.request('',{name});this.attach(s);return s;}
 async join(code,invite,name){const s=await this.request('/'+code+'/join',{invite,name});this.attach(s);return s;}
 attach(session){this.leave();this.session=session;sessionStorage.setItem('medusa-derby',JSON.stringify(session));this.timer=setInterval(()=>this.poll(),750);this.poll();}
 restore(){try{const session=JSON.parse(sessionStorage.getItem('medusa-derby'));if(session?.expiresAt>Date.now())this.attach(session);}catch{}}
 async poll(){if(this.busy||!this.session)return;this.busy=true;try{const data=await this.request('/'+this.session.code+'?after='+this.cursor);for(const e of data.events)this.cursor=Math.max(this.cursor,e.id);this.lastVersion=data.version;this.onUpdate(data);}catch(e){this.onError(e.message);}finally{this.busy=false;}}
 async publish(state){if(this.session?.role!=='host')return;return this.request('/'+this.session.code+'/state',{state});}
 async event(action){if(this.session?.role!=='guest')return;return this.request('/'+this.session.code+'/event',{action,round:this.round});}
 async viewerKey(user){const value=this.session.token+':'+user;return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
 leave(){clearInterval(this.timer);this.session=null;this.cursor=0;this.lastVersion=-1;sessionStorage.removeItem('medusa-derby');}
}
