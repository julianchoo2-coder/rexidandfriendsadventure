(() => {
'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),L=LEVEL1;
const input={left:false,right:false,up:false,down:false,jump:false};
let jumpPressed=false,player,barrels=[],spawnIn=1.2,elapsed=0,last=performance.now(),won=false;
const yAt=(row,x)=>{const p=L.platforms[row],t=(x-p.left)/(p.right-p.left);return p.yLeft+(p.yRight-p.yLeft)*t};
function resetPlayer(){player={x:L.start.x,y:yAt(L.start.row,L.start.x),row:L.start.row,vy:0,grounded:true,climbing:false,ladder:null,coyote:0,buffer:0,invulnerable:1.2}}
function reset(){barrels=[];spawnIn=1;elapsed=0;won=false;resetPlayer()}
function drawBackground(){let g=ctx.createLinearGradient(0,0,0,L.height);g.addColorStop(0,'#172640');g.addColorStop(1,'#0a1020');ctx.fillStyle=g;ctx.fillRect(0,0,L.width,L.height);ctx.fillStyle='#b8d8ee12';for(let x=10;x<448;x+=24)for(let y=8;y<512;y+=24)ctx.fillRect(x,y,2,2)}
function beam(p){let y1=p.yLeft,y2=p.yRight;ctx.beginPath();ctx.moveTo(p.left,y1);ctx.lineTo(p.right,y2);ctx.lineTo(p.right,y2+10);ctx.lineTo(p.left,y1+10);ctx.closePath();ctx.fillStyle='#e94e8b';ctx.fill();ctx.strokeStyle='#ff9cbd';ctx.lineWidth=2;ctx.stroke();ctx.strokeStyle='#81244f';ctx.lineWidth=2;for(let x=p.left+5;x<p.right;x+=12){let y=y1+(y2-y1)*(x-p.left)/(p.right-p.left);ctx.beginPath();ctx.moveTo(x,y+2);ctx.lineTo(x+5,y+8);ctx.stroke()}}
function ladder(l){let x=l.x,top=yAt(l.upper,x)+8,bottom=yAt(l.upper+1,x);ctx.strokeStyle='#55d9cb';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x-7,top);ctx.lineTo(x-7,bottom);ctx.moveTo(x+7,top);ctx.lineTo(x+7,bottom);ctx.stroke();ctx.lineWidth=2;for(let y=top+7;y<bottom-2;y+=10){ctx.beginPath();ctx.moveTo(x-7,y);ctx.lineTo(x+7,y);ctx.stroke()}}
function draw(){drawBackground();L.platforms.forEach(beam);L.ladders.forEach(ladder);
 ctx.strokeStyle='#ffe59a';ctx.lineWidth=2;ctx.strokeRect(374,42,34,27);ctx.fillStyle='#f5db7b';ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.fillText('META',391,59);
 barrels.forEach(b=>{ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.spin);ctx.fillStyle='#f49b45';ctx.strokeStyle='#ffe0a3';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.strokeStyle='#713b38';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-5,-5);ctx.lineTo(5,5);ctx.moveTo(5,-5);ctx.lineTo(-5,5);ctx.stroke();ctx.restore()});
 if(!(player.invulnerable>0&&Math.floor(elapsed*12)%2)){let y=player.y-22;ctx.fillStyle='#dcefe8';ctx.fillRect(player.x-7,y,14,22);ctx.fillStyle='#58c6a9';ctx.fillRect(player.x-6,y+3,12,8);ctx.fillStyle='#17223a';ctx.fillRect(player.x-3,y+6,2,2);ctx.fillRect(player.x+2,y+6,2,2);ctx.fillStyle='#f3d5ac';ctx.fillRect(player.x-6,y+19,5,3);ctx.fillRect(player.x+2,y+19,5,3)}
 if(won){ctx.fillStyle='#07101acc';ctx.fillRect(0,0,448,512);ctx.textAlign='center';ctx.fillStyle='#a8e6d1';ctx.font='bold 19px monospace';ctx.fillText('¡CIMA ALCANZADA!',224,242);ctx.fillStyle='white';ctx.font='11px monospace';ctx.fillText('TOCA O PRESIONA ENTER PARA REPETIR',224,264)}}
function ladderNear(){return L.ladders.filter(l=>l.upper===player.row-1).sort((a,b)=>Math.abs(a.x-player.x)-Math.abs(b.x-player.x))[0]}
function spawn(){barrels.push({x:38,row:0,y:yAt(0,38),dir:1,spin:0,speed:L.barrelSpeed+Math.min(35,elapsed*.3)});spawnIn=L.barrelInterval}
function tick(dt){if(won){if(jumpPressed)reset();jumpPressed=false;return}
 player.invulnerable=Math.max(0,player.invulnerable-dt);player.buffer=jumpPressed?.14:Math.max(0,player.buffer-dt);jumpPressed=false;
 if(player.climbing){let l=player.ladder;player.x=l.x;let top=yAt(l.upper,l.x),bottom=yAt(l.upper+1,l.x);player.y+=(input.up?-1:input.down?1:0)*102*dt;
  if(player.y<=top){player.y=top;player.row=l.upper;player.climbing=false;player.grounded=true;player.ladder=null}
  else if(player.y>=bottom){player.y=bottom;player.row=l.upper+1;player.climbing=false;player.grounded=true;player.ladder=null}
 }else{
  let dx=(input.right?1:0)-(input.left?1:0);player.x=Math.max(34,Math.min(414,player.x+dx*112*dt));
  if(player.grounded){player.y=yAt(player.row,player.x);player.coyote=.1;if(input.up&&player.row>0){let l=ladderNear();if(l&&Math.abs(l.x-player.x)<19){player.ladder=l;player.climbing=true;player.grounded=false;player.x=l.x}}
   if(player.buffer>0&&player.grounded){player.vy=-238;player.grounded=false;player.coyote=0;player.buffer=0}}
  else{let old=player.y;player.vy+=620*dt;player.y+=player.vy*dt;player.coyote=Math.max(0,player.coyote-dt);let floor=yAt(player.row,player.x);
   if(player.vy>0&&old<=floor&&player.y>=floor){player.y=floor;player.vy=0;player.grounded=true}}
 }
 barrels.forEach(b=>{let p=L.platforms[b.row];b.x+=b.dir*b.speed*dt;b.spin+=b.dir*dt*5;if(b.x>p.right-8){if(b.row<L.platforms.length-1){b.row++;b.dir=-1;b.x=p.right-8}else b.x=p.right+20}else if(b.x<p.left+8){if(b.row<L.platforms.length-1){b.row++;b.dir=1;b.x=p.left+8}else b.x=p.left-20}if(b.row<L.platforms.length)b.y=yAt(b.row,b.x)});
 barrels=barrels.filter(b=>b.x>-20&&b.x<468);
 if(player.invulnerable<=0&&!player.climbing&&barrels.some(b=>Math.abs(b.x-player.x)<15&&Math.abs(b.y-(player.y-8))<16)){barrels=[];spawnIn=1.1;resetPlayer()}
 if(player.grounded&&player.row===0&&player.x>=L.goal.x-14)won=true;
 spawnIn-=dt;if(spawnIn<=0)spawn();
}
function frame(now){let dt=Math.min(.04,(now-last)/1000||0);last=now;elapsed+=dt;tick(dt);draw();requestAnimationFrame(frame)}
const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',Space:'jump',Enter:'jump'};
function set(k,on){if(k==='jump'&&on&&!input.jump)jumpPressed=true;input[k]=on}
addEventListener('keydown',e=>{let k=map[e.code];if(k){e.preventDefault();set(k,true)}});addEventListener('keyup',e=>{let k=map[e.code];if(k)set(k,false)});addEventListener('blur',()=>Object.keys(input).forEach(k=>set(k,false)));
document.querySelectorAll('[data-key]').forEach(b=>{let k=b.dataset.key,release=e=>{e.preventDefault();set(k,false)};b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture?.(e.pointerId);set(k,true)});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>b.addEventListener(ev,release));b.addEventListener('contextmenu',e=>e.preventDefault())});
canvas.addEventListener('pointerdown',()=>{if(won)reset()});reset();requestAnimationFrame(frame);
})();