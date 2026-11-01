import {WIDTH,HEIGHT,COUNTER,CUSTOMER} from './rl.js';
const rounded=(c,x,y,w,h,r,color)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
export function drawCafe(canvas,frames,index,baselineFrames,compare){
 const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);
 if(compare&&baselineFrames){drawScene(c,0,0,500,580,baselineFrames[Math.min(index,baselineFrames.length-1)].state,'ORIGINAL POLICY');drawScene(c,500,0,500,580,frames[index].state,'CURRENT POLICY');c.fillStyle='#71806b';c.fillRect(499,0,2,580);}else drawScene(c,0,0,1000,580,frames[index].state,'THE DAILY GRIND · CAFÉ 01');
}
function drawScene(c,ox,oy,w,h,s,label){
 c.save();c.translate(ox,oy);c.fillStyle='#b9c0a6';c.fillRect(0,0,w,h);const unit=Math.min((w-60)/WIDTH,76),gx=(w-WIDTH*unit)/2,gy=140;
 c.font='600 12px monospace';c.textAlign='center';c.fillStyle='#43513a';c.fillText(label,w/2,39);
 rounded(c,w/2-95,65,190,39,6,'#e8e9cb');c.fillStyle='#4b573d';c.font='bold 18px sans-serif';c.fillText('☕  THE DAILY GRIND',w/2,90);
 // Floor and back-wall shadows.
 rounded(c,gx-12,gy-20,WIDTH*unit+24,HEIGHT*unit+32,8,'#7c8d70');
 for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){c.fillStyle=(x+y)%2?'#d9dcc3':'#d0d5b9';c.fillRect(gx+x*unit,gy+y*unit,unit-1,unit-1);}
 const pos=(p)=>({x:gx+(p.x+.5)*unit,y:gy+(p.y+.5)*unit});
 const counter=pos(COUNTER),customer=pos(CUSTOMER);
 // Espresso counter, machine, and cup supply.
 rounded(c,counter.x-unit*.44,counter.y-unit*.38+5,unit*.88,unit*.76,5,'#7e6045');rounded(c,counter.x-unit*.44,counter.y-unit*.38,unit*.88,unit*.65,5,'#c7a17b');rounded(c,counter.x-19,counter.y-23,38,26,4,'#5b665d');rounded(c,counter.x-13,counter.y-19,26,11,2,'#9fac9b');c.fillStyle='#dae6cf';c.fillRect(counter.x-9,counter.y-5,4,11);c.fillRect(counter.x+6,counter.y-5,4,11);cup(c,counter.x+19,counter.y+10,10);
 // Customer table and an increasingly disappointed customer.
 rounded(c,customer.x-29,customer.y-17,58,39,9,'#957751');rounded(c,customer.x-29,customer.y-21,58,36,9,'#d1ad7d');
 c.fillStyle='#7b648d';c.beginPath();c.ellipse(customer.x+unit*.34,customer.y-unit*.32,17,15,0,0,Math.PI*2);c.fill();c.fillStyle='#f0c8a0';c.beginPath();c.arc(customer.x+unit*.34,customer.y-unit*.45,12,0,Math.PI*2);c.fill();c.fillStyle='#443943';c.fillRect(customer.x+unit*.34-5,customer.y-unit*.45-2,3,3);c.fillRect(customer.x+unit*.34+3,customer.y-unit*.45-2,3,3);
 if(s.delivered)cup(c,customer.x-4,customer.y-7,13);
 c.fillStyle='#647456';c.font='600 9px monospace';c.textAlign='center';c.fillText('PICKUP',counter.x,counter.y+unit*.65);c.fillText('DELIVERY',customer.x,customer.y+unit*.65);
 // Plants at the café edges.
 for(const [px,py] of [[gx+unit*.25,gy-29],[gx+WIDTH*unit-unit*.25,gy-29]]){rounded(c,px-9,py,18,16,3,'#ab8060');c.fillStyle='#617c50';c.beginPath();c.ellipse(px-5,py-7,8,13,-.6,0,Math.PI*2);c.ellipse(px+5,py-10,8,14,.5,0,Math.PI*2);c.fill();}
 const bot=pos(s);robot(c,bot.x,bot.y,unit/76,s.holding);
 c.fillStyle='#536346';c.font='500 11px monospace';c.fillText(s.holding?'CARRYING: ONE CUP':'CARRYING: BIG AMBITIONS',w/2,h-27);
 c.restore();
}
function cup(c,x,y,size){rounded(c,x-size*.5,y-size*.4,size,size,2,'#fff5d9');c.strokeStyle='#fff5d9';c.lineWidth=2;c.beginPath();c.arc(x+size*.6,y+size*.1,size*.3,-Math.PI/2,Math.PI/2);c.stroke();c.fillStyle='#806248';c.fillRect(x-size*.35,y-size*.35,size*.7,3);}
function robot(c,x,y,scale,holding){c.save();c.translate(x,y);c.scale(scale,scale);c.fillStyle='#46544433';c.beginPath();c.ellipse(0,24,26,9,0,0,Math.PI*2);c.fill();rounded(c,-18,14,12,12,4,'#3d4b3c');rounded(c,6,14,12,12,4,'#3d4b3c');rounded(c,-23,-8,46,29,9,'#b8ce67');rounded(c,-18,-31,36,31,10,'#e9efc5');rounded(c,-13,-25,26,15,5,'#36493a');rounded(c,-8,-21,4,6,2,'#d4ff8c');rounded(c,5,-21,4,6,2,'#d4ff8c');c.strokeStyle='#5d704d';c.lineWidth=3;c.beginPath();c.moveTo(0,-31);c.lineTo(0,-40);c.stroke();c.fillStyle='#d3f687';c.beginPath();c.arc(0,-42,4,0,Math.PI*2);c.fill();rounded(c,-29,-3,8,18,4,'#d2dc9d');rounded(c,21,-3,8,18,4,'#d2dc9d');rounded(c,-10,3,20,11,3,'#8aa34a');if(holding)cup(c,26,1,17);c.restore();}
