import {roomsAPI} from './worker/rooms-api.js';
import {localDatabase} from './scripts/local-db.mjs';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(fileURLToPath(new URL('./dist/',import.meta.url)));
const types={'.html':'text/html;charset=utf-8','.css':'text/css;charset=utf-8','.js':'text/javascript;charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.txt':'text/plain;charset=utf-8'};
export function createGameServer({dbPath=process.env.DB_PATH||'.openai/local/derby.sqlite',publicOrigin=process.env.PUBLIC_ORIGIN||process.env.RENDER_EXTERNAL_URL||''}={}){
 const db=localDatabase(dbPath);
 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-cache');
  try{
   const origin=publicOrigin?new URL(publicOrigin).origin:'http://'+(req.headers.host||'localhost:4173'),url=new URL(req.url,origin);
   if(url.pathname==='/healthz'&&['GET','HEAD'].includes(req.method)){await db.prepare('SELECT 1 AS ok').bind().first();res.writeHead(200,{'Content-Type':'application/json'}).end(req.method==='HEAD'?undefined:JSON.stringify({ok:true,service:'medusa-reward-league'}));return;}
   if(url.pathname.startsWith('/api/derby')){
    const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>128*1024){res.writeHead(413,{'Content-Type':'application/json','Connection':'close'}).end(JSON.stringify({error:'Request too large'}));return;}chunks.push(chunk);}
    const request=new Request(origin+url.pathname+url.search,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})});
    const response=await roomsAPI(request,db);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
   }
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end('Method not allowed');return;}
   const pathname=decodeURIComponent(url.pathname);if(pathname.split('/').some(p=>p.startsWith('.'))||pathname.startsWith('/server/')){res.writeHead(404).end('Not found');return;}
   const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end('Forbidden');return;}
   const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'}).end(req.method==='HEAD'?undefined:bytes);
  }catch(error){if(!res.headersSent){const missing=['ENOENT','EISDIR'].includes(error.code);res.writeHead(missing?404:500,{'Content-Type':'application/json'}).end(JSON.stringify({error:missing?'Not found':'Request failed'}));}else res.end();}
 });
 server.on('close',()=>db.close());return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||4173),host=process.env.HOST||(process.env.RENDER?'0.0.0.0':'127.0.0.1');
 const server=createGameServer();server.listen(port,host,()=>console.log(`MEDUSA listening on http://${host}:${port}`));
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{server.close(()=>process.exit(0));setTimeout(()=>process.exit(1),5000).unref();});
}
