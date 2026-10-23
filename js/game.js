(() => {
'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),L=LEVEL1;
const input={left:false,right:false,up:false,down:false,jump:false};
let jumpPressed=false,player,barrels=[],fireballs=[],spawnIn=1.4,fireSpawn=0,elapsed=0,last=performance.now(),won=false,ignitionFlash=0;
const oil={...L.oilDrum,lit:false};
const yAt=(row,x)=>{const p=L.platforms[row],t=(x-p.left)/(p.right-p.left);return p.yLeft+(p.yRight-p.yLeft)*t};
const downhill=(row,fallback=1)=>{const p=L.platforms[row],d=Math.sign(p.yRight-p.yLeft);return d||fallback};
function resetPlayer(){player={x:L.start.x,y:yAt(L.start.row,L.start.x),row:L.start.row,vx:0,vy:0,grounded:true,climbing:false,ladder:null,buffer:0,coyote:0,jumpTime:0,invulnerable:1.2}}
function reset(){barrels=[];fireballs=[];spawnIn=1.4;fireSpawn=0;elapsed=0;won=false;oil.lit=false;ignitionFlash=0;resetPlayer()}
function background(){const g=ctx.createLinearGradient(0,0,0,L.height);g.addColorStop(0,'#101a2c');g.addColorStop(1,'#050911');ctx.fillStyle=g;ctx.fillRect(0,0,L.width,L.height);ctx.fillStyle='#b8d8ee10';for(let x=9;x<448;x+=24)for(let y=8;y<512;y+=24)ctx.fillRect(x,y,2,2)}
function beam(p){const y1=p.yLeft,y2=p.yRight;ctx.beginPath();ctx.moveTo(p.left,y1);ctx.lineTo(p.right,y2);ctx.lineTo(p.right,y2+10);ctx.lineTo(p.left,y1+10);ctx.closePath();ctx.fillStyle='#e94e8b';ctx.fill();ctx.strokeStyle='#ff9cbd';ctx.lineWidth=2;ctx.stroke();ctx.strokeStyle='#81244f';ctx.lineWidth=2;for(let x=p.left+5;x<p.right;x+=12){const y=y1+(y2-y1)*(x-p.left)/(p.right-p.left);ctx.beginPath();ctx.moveTo(x,y+2);ctx.lineTo(x+5,y+8);ctx.stroke()}}
function drawLadder(l){const x=l.x,top=l.goal?L.goalPlatform.y+5:yAt(l.upper,x)+8,bottom=l.goal?yAt(0,x):yAt(l.upper+1,x);ctx.strokeStyle=l.damaged?'#479b9b':'#55d9cb';ctx.lineWidth=3;
 if(l.damaged){const mid=(top+bottom)/2;for(const [a,b] of [[top,mid-8],[mid+8,bottom]]){ctx.beginPath();ctx.moveTo(x-6,a);ctx.lineTo(x-6,b);ctx.moveTo(x+6,a);ctx.lineTo(x+6,b);ctx.stroke()}ctx.lineWidth=2;for(let y=top+6;y<bottom-3;y+=9){if(Math.abs(y-mid)<11)continue;ctx.beginPath();ctx.moveTo(x-6,y);ctx.lineTo(x+6,y);ctx.stroke()}}
 else{ctx.beginPath();ctx.moveTo(x-6,top);ctx.lineTo(x-6,bottom);ctx.moveTo(x+6,top);ctx.lineTo(x+6,bottom);ctx.stroke();ctx.lineWidth=2;for(let y=top+6;y<bottom-3;y+=9){ctx.beginPath();ctx.moveTo(x-6,y);ctx.lineTo(x+6,y);ctx.stroke()}}
}
function drawOil(){const y=yAt(oil.row,oil.x),top=y-23;ctx.fillStyle='#1777c5';ctx.fillRect(oil.x-12,top,24,23);ctx.fillStyle='#55c9f4';ctx.fillRect(oil.x-12,top+3,24,3);ctx.fillRect(oil.x-12,top+16,24,3);ctx.fillStyle='#101a2c';ctx.fillRect(oil.x-5,top+8,10,5);
 if(oil.lit){ctx.save();ctx.translate(oil.x,top+1);for(let i=0;i<4;i++){const f=.75+Math.sin(elapsed*15+i*2)*.2;ctx.fillStyle=i%2?'#ffb03d':'#ff633d';ctx.beginPath();ctx.ellipse((i-1.5)*5,-5-(i%2)*3,3*f,7*f,Math.sin(elapsed*8+i)*.2,0,Math.PI*2);ctx.fill()}ctx.restore()}
}
function drawBarrel(b){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.spin);ctx.fillStyle=b.blue?'#238ddd':'#ed9a43';ctx.strokeStyle=b.blue?'#8de4ff':'#ffe0a3';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,b.r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.strokeStyle=b.blue?'#123b73':'#703b38';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-5,-5);ctx.lineTo(5,5);ctx.moveTo(5,-5);ctx.lineTo(-5,5);ctx.stroke();ctx.restore()}
function drawFire(f){ctx.save();ctx.translate(f.x,f.y);ctx.fillStyle='#42c9ff33';ctx.beginPath();ctx.arc(0,0,13+Math.sin(elapsed*12+f.phase)*2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#35c8ff';ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d7f7ff';ctx.beginPath();ctx.arc(0,-1,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff8c3f';ctx.fillRect(-2,4,4,3);ctx.restore()}
function drawPlayer(){if(player.invulnerable>0&&Math.floor(elapsed*14)%2)return;const y=player.y-22;ctx.fillStyle='#dcefe8';ctx.fillRect(player.x-7,y,14,22);ctx.fillStyle='#58c6a9';ctx.fillRect(player.x-6,y+3,12,8);ctx.fillStyle='#17223a';ctx.fillRect(player.x-3,y+6,2,2);ctx.fillRect(player.x+2,y+6,2,2);ctx.fillStyle='#f3d5ac';ctx.fillRect(player.x-6,y+19,5,3);ctx.fillRect(player.x+2,y+19,5,3)}
function render(){background();ctx.fillStyle='#d4b956';ctx.fillRect(L.goalPlatform.left,L.goalPlatform.y,L.goalPlatform.right-L.goalPlatform.left,8);L.platforms.forEach(beam);L.ladders.forEach(drawLadder);drawLadder(L.goalLadder);ctx.strokeStyle='#ffe59a';ctx.lineWidth=2;ctx.strokeRect(L.goal.x-13,L.goalPlatform.y-28,26,24);ctx.fillStyle='#f5db7b';ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.fillText('META',L.goal.x,L.goalPlatform.y-13);drawOil();barrels.forEach(drawBarrel);fireballs.forEach(drawFire);drawPlayer();
 if(ignitionFlash>0){ctx.save();ctx.globalAlpha=Math.min(1,ignitionFlash*2);ctx.fillStyle='#ffe977';ctx.beginPath();ctx.arc(oil.x, yAt(oil.row,oil.x)-13,22*(1.2-ignitionFlash),0,Math.PI*2);ctx.fill();ctx.restore()}
 if(won){ctx.fillStyle='#050911cc';ctx.fillRect(0,0,448,512);ctx.textAlign='center';ctx.fillStyle='#a8e6d1';ctx.font='bold 19px monospace';ctx.fillText('¡CIMA ALCANZADA!',224,242);ctx.fillStyle='white';ctx.font='11px monospace';ctx.fillText('TOCA O PRESIONA ENTER PARA REPETIR',224,264)}
}
function spawnBarrel(){barrels.push({x:L.platforms[0].left+100,row:0,y:yAt(0,L.platforms[0].left+100)-8,vx:L.barrelSpeed,vy:0,dir:1,spin:0,r:8,blue:false,falling:false});spawnIn=L.barrelInterval}
function igniteOil(){if(oil.lit)return;oil.lit=true;ignitionFlash=.6;fireSpawn=.8}
function dropBarrel(b,x){if(b.row>=L.platforms.length-1)return false;b.falling=true;b.targetRow=b.row+1;b.x=Math.max(L.platforms[b.targetRow].left+8,Math.min(L.platforms[b.targetRow].right-8,x));b.vy=0;return true}
function updateBarrel(b,dt){
 if(b.falling){b.vy+=L.gravity*dt;b.x+=b.vx*.08*dt;b.y+=b.vy*dt;const p=L.platforms[b.targetRow],land=yAt(b.targetRow,b.x)-b.r;if(b.y>=land){b.row=b.targetRow;b.y=land;b.vy=0;b.falling=false;b.vx=downhill(b.row,b.dir)*Math.max(55,Math.abs(b.vx)*.72);b.dir=Math.sign(b.vx)||b.dir}return}
 const p=L.platforms[b.row],oldX=b.x,slope=(p.yRight-p.yLeft)/(p.right-p.left),gravityAlong=L.gravity*slope/Math.sqrt(1+slope*slope);b.vx+=gravityAlong*dt;if(Math.abs(slope)<.008)b.vx+=b.dir*20*dt;b.vx-=b.vx*.018*dt;b.vx=Math.max(-132,Math.min(132,b.vx));b.x+=b.vx*dt;b.y=yAt(b.row,b.x)-b.r;b.spin+=b.vx*dt/b.r;
 const ladder=L.ladders.find(l=>l.damaged&&l.upper===b.row&&((oldX<=l.x&&b.x>=l.x)||(oldX>=l.x&&b.x<=l.x)));
 if(ladder&&dropBarrel(b,ladder.x))return;
 if(b.x>=p.right-b.r||b.x<=p.left+b.r){b.x=Math.max(p.left+b.r,Math.min(p.right-b.r,b.x));if(!dropBarrel(b,b.x)){b.vx*=-.75;b.dir=Math.sign(b.vx)}}
}
function spawnFire(){if(fireballs.length>=4)return;fireballs.push({x:oil.x+14,y:yAt(oil.row,oil.x+14)-8,row:oil.row,dir:1,speed:48,phase:Math.random()*6.28,climbing:false,ladder:null})}
function updateFire(f,dt){
 if(f.climbing){const l=f.ladder,top=yAt(l.upper,l.x),bottom=yAt(l.upper+1,l.x);f.y-=58*dt;if(f.y<=top-8){f.y=top-8;f.row=l.upper;f.climbing=false;f.ladder=null;f.x=l.x}return}
 const old=f.x;f.x+=f.dir*f.speed*dt;f.y=yAt(f.row,f.x)-8;
 if(f.row>0){const ladder=L.ladders.find(l=>l.upper===f.row-1&&((old<=l.x&&f.x>=l.x)||(old>=l.x&&f.x<=l.x)));if(ladder&&Math.random()<.35){f.x=ladder.x;f.ladder=ladder;f.climbing=true;return}}
 const p=L.platforms[f.row];if(f.x<=p.left+8||f.x>=p.right-8)f.dir*=-1;
}
function startJump(){player.vy=-250;player.grounded=false;player.coyote=0;player.jumpTime=0;player.buffer=0}
function movePlayer(dt){
 player.invulnerable=Math.max(0,player.invulnerable-dt);player.buffer=jumpPressed?.14:Math.max(0,player.buffer-dt);jumpPressed=false;
 if(player.climbing){const l=player.ladder;player.x=l.x;
  if(l.goal){const top=L.goalPlatform.y+8,bottom=yAt(0,l.x);player.y+=(input.up?-1:input.down?1:0)*100*dt;if(player.y<=top){player.y=top;player.climbing=false;player.grounded=true;won=true}else if(player.y>=bottom){player.y=bottom;player.row=0;player.climbing=false;player.grounded=true;player.ladder=null}}
  else{const top=yAt(l.upper,l.x),bottom=yAt(l.upper+1,l.x);player.y+=(input.up?-1:input.down?1:0)*100*dt;if(player.y<=top){player.y=top;player.row=l.upper;player.climbing=false;player.grounded=true;player.ladder=null}else if(player.y>=bottom){player.y=bottom;player.row=l.upper+1;player.climbing=false;player.grounded=true;player.ladder=null}}
  return
 }
 const axis=(input.right?1:0)-(input.left?1:0),target=axis*122,accel=player.grounded?820:480;
 if(axis)player.vx+=Math.sign(target-player.vx)*Math.min(Math.abs(target-player.vx),accel*dt);else{const drag=(player.grounded?1050:180)*dt;player.vx=Math.abs(player.vx)<=drag?0:player.vx-Math.sign(player.vx)*drag}
 const oldX=player.x;player.x+=player.vx*dt;
 if(player.grounded){const p=L.platforms[player.row];player.x=Math.max(p.left+8,Math.min(p.right-8,player.x));if(player.x===p.left+8||player.x===p.right-8)player.vx=0;player.y=yAt(player.row,player.x);player.coyote=.11}
 if(input.up&&player.grounded){
  if(player.row===0&&Math.abs(L.goalLadder.x-player.x)<18){player.climbing=true;player.grounded=false;player.ladder=L.goalLadder;player.x=L.goalLadder.x;return}
  const l=L.ladders.filter(x=>x.upper===player.row-1&&!x.damaged).sort((a,b)=>Math.abs(a.x-player.x)-Math.abs(b.x-player.x))[0];
  if(l&&Math.abs(l.x-player.x)<19){player.climbing=true;player.grounded=false;player.ladder=l;player.x=l.x;return}
 }
 if(player.buffer>0&&(player.grounded||player.coyote>0))startJump();
 if(!player.grounded){const oldY=player.y;if(input.jump&&player.vy<0&&player.jumpTime<.16)player.vy+=L.gravity*.68*dt;else player.vy+=L.gravity*dt;if(!input.jump&&player.vy< -100)player.vy=-100;player.jumpTime+=dt;player.y+=player.vy*dt;player.coyote=Math.max(0,player.coyote-dt);const floor=yAt(player.row,player.x);if(player.vy>0&&oldY<=floor&&player.y>=floor){player.y=floor;player.vy=0;player.grounded=true;player.vx*=.55}}
}
function collide(){if(player.invulnerable>0||player.climbing)return;const hitBarrel=barrels.some(b=>Math.abs(b.x-player.x)<14&&Math.abs(b.y-(player.y-8))<15);const hitFire=fireballs.some(f=>Math.abs(f.x-player.x)<16&&Math.abs(f.y-(player.y-8))<17);if(hitBarrel||hitFire){resetPlayer()}}
function tick(dt){if(won){if(jumpPressed)reset();jumpPressed=false;return}movePlayer(dt);barrels.forEach(b=>updateBarrel(b,dt));barrels=barrels.filter(b=>b.x>-24&&b.x<472);
 for(const b of barrels){if(b.row===oil.row&&Math.abs(b.x-oil.x)<13){igniteOil();b.x=oil.x+16;b.vx=Math.abs(b.vx)||55}}
 ignitionFlash=Math.max(0,ignitionFlash-dt);
 if(oil.lit){fireSpawn-=dt;if(fireSpawn<=0){spawnFire();fireSpawn=4.8}}
 fireballs.forEach(f=>updateFire(f,dt));collide();if(player.climbing===false&&player.row===0&&Math.abs(player.x-L.goal.x)<16&&player.y<L.goalPlatform.y+20)won=true;
 spawnIn-=dt;if(spawnIn<=0)spawnBarrel()
}
function frame(now){const dt=Math.min(.035,(now-last)/1000||0);last=now;elapsed+=dt;tick(dt);render();requestAnimationFrame(frame)}
const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',Space:'jump',Enter:'jump'};
function set(k,on){if(k==='jump'&&on&&!input.jump)jumpPressed=true;input[k]=on}
addEventListener('keydown',e=>{const k=map[e.code];if(k){e.preventDefault();set(k,true)}});addEventListener('keyup',e=>{const k=map[e.code];if(k)set(k,false)});addEventListener('blur',()=>Object.keys(input).forEach(k=>set(k,false)));
document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key,release=e=>{e.preventDefault();set(k,false)};b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture?.(e.pointerId);set(k,true)});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>b.addEventListener(ev,release));b.addEventListener('contextmenu',e=>e.preventDefault())});
canvas.addEventListener('pointerdown',()=>{if(won)reset()});reset();requestAnimationFrame(frame);
})();