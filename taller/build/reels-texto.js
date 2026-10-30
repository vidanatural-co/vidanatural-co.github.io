// Reels con texto animado (tipografía cinética). Sin voz ni música. 10 s, 1080x1920, 30 cuadros/s.
// Uso: node reels-texto.js <estilo 1|2> <carpeta de salida> [foto1 foto2 ...]
//   Estilo 1: gancho animado (2,4 s) -> foto con acercamiento -> cierre "Comenta QUIERO".
//   Estilo 2: foto con el frasco nítido y el resto desenfocado + gancho arriba + 3 beneficios + cierre.
// Textos: reels-texto.json (gancho, palabra resaltada, 3 beneficios). Sin precios: el video es igual para los 3 asesores.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),os=require('os'),{execFileSync}=require('child_process');
const AQUI=__dirname,RAIZ=path.resolve(AQUI,'../..');const FPS=30,SEG=10,N=FPS*SEG;
const [estilo,salida,...fotos]=process.argv.slice(2);const T=JSON.parse(fs.readFileSync(path.join(AQUI,'reels-texto.json'),'utf8'));
const lista=fotos.length?fotos:Object.keys(T);fs.mkdirSync(salida,{recursive:true});
const F=n=>'file://'+path.join(AQUI,'fuentes',n);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function palabras(txt,resalta){const r=(resalta||'').toLowerCase();const out=[];let i=0;
 // agrupa la frase resaltada como una sola "palabra" con caja amarilla
 const low=txt.toLowerCase(),k=r?low.indexOf(r):-1;
 let fin=k>=0?k+r.length:0;while(k>=0&&/[?!.,:;]/.test(txt[fin]||''))fin++;  // el signo pegado queda con la palabra resaltada
 const partes=k>=0?[[txt.slice(0,k),0],[txt.slice(k,fin),1],[txt.slice(fin),0]]:[[txt,0]];
 for(const [p,h] of partes){if(h){const m=p.trim().match(/^(.*?)([?!.,:;]*)$/);out.push(`<span style="white-space:nowrap"><span class="w hl" data-i="${i++}"><i class="box"></i><b>${esc(m[1])}</b></span>${m[2]?`<b class="pu">${esc(m[2])}</b>`:''}</span>`);continue}
  for(const w of p.split(/\s+/).filter(Boolean))out.push(`<span class="w" data-i="${i++}"><b>${esc(w)}</b></span>`)}
 return out.join(' ')}
function html(foto,d){return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Anton;src:url(${F('anton-latin-400-normal.woff2')})}
@font-face{font-family:M;font-weight:800;src:url(${F('montserrat-latin-800-normal.woff2')})}
@font-face{font-family:M;font-weight:600;src:url(${F('montserrat-latin-600-normal.woff2')})}
*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden;background:#0b2614}
.lay{position:absolute;inset:0}.lay img{width:100%;height:100%;display:block}
#bg{filter:blur(34px) brightness(.42) saturate(1.2);transform:scale(1.25)}
#sh{-webkit-mask-image:radial-gradient(ellipse 37% 31% at 50% 52%,#000 62%,transparent 100%)}
.txt{position:absolute;left:70px;right:70px;text-align:center;color:#fff}
.hook{font-family:Anton;text-transform:uppercase;line-height:1.08;letter-spacing:1px;text-shadow:0 6px 24px rgba(0,0,0,.45)}
.w{display:inline-block;position:relative;opacity:0;margin:0 6px}.w b{position:relative;font-weight:400}
.pu{display:inline-block;font-weight:400;margin-left:-4px}.hl b{color:#13361c;text-shadow:none;padding:0 14px}.box{position:absolute;inset:4px -2px;background:#ffd23f;border-radius:14px;transform-origin:0 50%;transform:scaleX(0)}
.pill{display:inline-flex;align-items:center;gap:22px;background:#fff;color:#13361c;font-family:M;font-weight:800;border-radius:999px;padding:24px 46px 24px 26px;box-shadow:0 14px 40px rgba(0,0,0,.35)}
.ck{width:66px;height:66px;border-radius:50%;background:#2f8f3a;color:#fff;display:grid;place-items:center;font-size:40px}
.q{display:inline-block;background:#ffd23f;color:#13361c;border-radius:22px;padding:0 34px}
.sub{font-family:M;font-weight:600}
</style></head><body>
<div class="lay" id="bg"><img src="${foto}"></div>
<div class="lay" id="ph"><img src="${foto}"></div>
<div class="lay" id="sh"><img src="${foto}"></div>
<div class="txt hook" id="hook">${palabras(d.gancho,d.resalta)}</div>
${(d.b||[]).map((b,i)=>`<div class="txt" id="b${i}"><span class="pill" style="font-size:${b.length>20?50:56}px"><span class="ck">✓</span>${esc(b)}</span></div>`).join('')}
<div class="txt" id="end"><div class="sub" id="e0" style="font-size:66px;font-family:M;font-weight:800">¿LO QUIERES?</div>
<div class="hook" id="e1" style="font-size:120px;margin-top:26px">COMENTA</div>
<div class="hook" id="e2" style="font-size:210px;margin-top:6px"><span class="q">QUIERO</span></div>
<div class="sub" id="e3" style="font-size:54px;margin-top:34px">y te envío el enlace 👇</div></div>
<script>
const ES=${estilo==='2'?2:1};const $=s=>document.querySelector(s);
const cl=x=>Math.max(0,Math.min(1,x)),sm=x=>{x=cl(x);return x*x*(3-2*x)},oc=x=>{x=cl(x);return 1-Math.pow(1-x,3)},
 back=x=>{x=cl(x);const c=1.7;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
const W=[...document.querySelectorAll('#hook .w')];
let FIT=0;function fit(el,base,lines){if(FIT)return;let z=base;el.style.fontSize=z+'px';while(el.getBoundingClientRect().height>lines*z*1.08+20&&z>60){z-=4;el.style.fontSize=z+'px'}FIT=1}
function puAt(){document.querySelectorAll('#hook .pu').forEach(u=>{const w=u.previousElementSibling;u.style.opacity=w.style.opacity;u.style.transform=w.style.transform})}
function hookAt(t,t0,out){W.forEach((w,i)=>{const p=(t-(t0+i*.13))/.38;const o=cl(p*2.2)*(1-sm((t-out)/.35));
  w.style.opacity=o;w.style.transform=\`translateY(\${(1-back(p))*70-sm((t-out)/.35)*60}px) scale(\${.75+.25*back(p)})\`;
  const bx=w.querySelector('.box');if(bx)bx.style.transform=\`scaleX(\${oc((t-(t0+W.length*.13+.15))/.35)})\`})}
function endAt(t,t0){['#e0','#e1','#e2','#e3'].forEach((s,i)=>{const p=(t-(t0+i*.16))/.4;const e=$(s);e.style.opacity=cl(p*2);
  e.style.transform=\`translateY(\${(1-back(p))*80}px) scale(\${.8+.2*back(p)})\`});
 const q=$('#e2 .q');const k=t-(t0+.9);q.style.transform=\`scale(\${k>0?1+.045*Math.sin(k*7):1})\`}
function render(t){
 const hook=$('#hook'),ph=$('#ph'),sh=$('#sh'),bg=$('#bg'),end=$('#end');
 if(ES===1){
  sh.style.display='none';fit(hook,160,3);
  const L=hook.getBoundingClientRect().height;hook.style.top=(860-L/2)+'px';hookAt(t,-.2,2.15);puAt();
  const a=sm((t-2.15)/.45),b=1-sm((t-7.75)/.45);ph.style.opacity=a*b;
  ph.style.transform=\`scale(\${1+.05*sm((t-2.15)/5.8)+.1*(1-oc((t-2.15)/.6))})\`;
  for(let i=0;i<3;i++){const e=$('#b'+i);if(e)e.style.display='none'}
  end.style.top='560px';endAt(t,8.05);
 }else{
  ph.style.display='none';const z=1+.05*sm(t/SEG_);const tr=\`translateY(-90px) scale(\${.76*z})\`;sh.style.transform=tr;bg.style.transform=\`scale(\${1.25*z})\`;
  fit(hook,124,2);hook.style.top='235px';hookAt(t,-.2,7.6);puAt();
  for(let i=0;i<3;i++){const e=$('#b'+i);if(!e)continue;const s=2.3+i*1.75,p=(t-s)/.45,o=cl(p*2)*(1-sm((t-(s+1.6))/.3));
   e.style.top='1290px';e.style.opacity=i===2?cl(p*2)*(1-sm((t-7.6)/.3)):o;e.style.transform=\`translateX(\${(1-back(p))*-260}px) scale(\${.85+.15*back(p)})\`}
  end.style.top='215px';['#e0','#e3'].forEach(s=>$(s).style.display='none');
  $('#e1').style.fontSize='104px';$('#e2').style.fontSize='190px';endAt(t,7.85);
  // "y te envío el enlace" abajo, donde estaban los beneficios
  const e3=$('#e3');e3.style.display='block';e3.style.position='fixed';e3.style.left='70px';e3.style.right='70px';e3.style.top='1320px';e3.style.marginTop='0';
  const p=(t-8.4)/.4;e3.style.opacity=cl(p*2);e3.style.transform=\`translateY(\${(1-back(p))*60}px)\`}
}
const SEG_=${SEG};
</script></body></html>`}
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
for(const id of lista){const d=T[id];if(!d){console.log('Sin textos:',id);continue}
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'kt-'));const foto=path.join(tmp,'foto.png');
 execFileSync('ffmpeg',['-v','error','-y','-i',path.join(RAIZ,'img',id+'.jpg'),'-vf','scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,unsharp=5:5:0.4',foto]);
 fs.writeFileSync(path.join(tmp,'p.html'),html('foto.png',d));await pg.goto('file://'+path.join(tmp,'p.html'));
 await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(150);
 for(let f=0;f<N;f++){await pg.evaluate(t=>render(t),f/FPS);await pg.screenshot({path:path.join(tmp,String(f).padStart(4,'0')+'.jpg'),type:'jpeg',quality:92})}
 const out=path.join(salida,id+'.mp4');
 execFileSync('ffmpeg',['-v','error','-y','-framerate',String(FPS),'-i',path.join(tmp,'%04d.jpg'),'-f','lavfi','-i','anullsrc=r=44100:cl=stereo',
  '-map','0:v','-map','1:a','-c:v','libx264','-preset','medium','-crf','20','-profile:v','high','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-t',String(SEG),'-movflags','+faststart',out]);
 fs.rmSync(tmp,{recursive:true,force:true});console.log('Listo',out)}
await b.close()})();
