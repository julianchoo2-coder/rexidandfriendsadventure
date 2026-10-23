(() => {
'use strict';
const canvas=document.querySelector('#scene'),ctx=canvas.getContext('2d'),overlay=document.querySelector('#overlay'),status=document.querySelector('#status');
const keys={left:false,right:false,up:false,down:false,action:false};let playing=false,t=0,last=0;
function draw(time=0){
 const w=canvas.width,h=canvas.height,g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#263653');g.addColorStop(1,'#18243a');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 ctx.fillStyle='#c9d9f00a';for(let x=32;x<w;x+=48)for(let y=28;y<h;y+=48){ctx.beginPath();ctx.arc(x,y,1.4,0,7);ctx.fill()}
 ctx.fillStyle='#9ce8c2';ctx.globalAlpha=.75+Math.sin(time/700)*.12;ctx.beginPath();ctx.arc(w/2,h*.48,5,0,7);ctx.fill();ctx.globalAlpha=1;
 ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='500 15px "DM Mono",monospace';ctx.fillText('ESCENARIO DE JUEGO',w/2,h*.59);ctx.fillStyle='#aab6c8';ctx.font='12px "DM Mono",monospace';ctx.fillText('Aquí conectaremos el mundo y las mecánicas de Rexid',w/2,h*.64);
}
function loop(now){if(!playing)return;t+=Math.min(now-last,50);last=now;draw(t);requestAnimationFrame(loop)}
function setKey(key,on){if(key in keys)keys[key]=on;canvas.dispatchEvent(new CustomEvent('gameinput',{detail:{...keys}}))}
const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',Space:'action',Enter:'action'};
addEventListener('keydown',e=>{if(map[e.code]){e.preventDefault();setKey(map[e.code],true)}});addEventListener('keyup',e=>{if(map[e.code])setKey(map[e.code],false)});addEventListener('blur',()=>Object.keys(keys).forEach(k=>setKey(k,false)));
document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key,up=e=>{e.preventDefault();setKey(k,false)};b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture?.(e.pointerId);setKey(k,true)});['pointerup','pointercancel','lostpointercapture'].forEach(evt=>b.addEventListener(evt,up));b.addEventListener('contextmenu',e=>e.preventDefault())});
document.querySelector('#start').onclick=()=>{if(playing)return;playing=true;last=performance.now();status.textContent='AVENTURA EN PREPARACIÓN';overlay.classList.add('hide');requestAnimationFrame(loop)};
document.querySelector('#fullscreen').onclick=async()=>{try{if(!document.fullscreenElement)await document.querySelector('.game').requestFullscreen?.();else await document.exitFullscreen?.()}catch(e){console.info('Pantalla completa no disponible',e)}};
document.querySelector('#sound').onclick=e=>{const on=e.currentTarget.getAttribute('aria-pressed')!=='true';e.currentTarget.setAttribute('aria-pressed',String(on));document.querySelector('#soundState').textContent=on?'ON':'OFF'};
addEventListener('resize',()=>draw(t));draw();
})();