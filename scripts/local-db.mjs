import {DatabaseSync} from 'node:sqlite';
import {readFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
export function localDatabase(file=':memory:'){
 if(file!==':memory:')mkdirSync(path.dirname(path.resolve(file)),{recursive:true});const db=new DatabaseSync(file);db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
 const found=db.prepare("SELECT name FROM sqlite_master WHERE name='derby_rooms'").get();if(!found)db.exec(readFileSync(new URL('../drizzle/0000_derby_rooms.sql',import.meta.url),'utf8'));
 return {prepare(sql){return {bind(...args){return {async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){const r=db.prepare(sql).run(...args);return {meta:{changes:Number(r.changes)}};}};}};},close(){db.close();}};
}
