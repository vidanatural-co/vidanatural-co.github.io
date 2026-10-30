// Prueba del botón 🎬 Reel y 🔗 Copiar enlace. Uso: node prueba8.js  (sirve la raíz del repositorio)
const {chromium}=require('playwright');const path=require('path');const root=path.resolve(__dirname,'../..');const http=require('http'),fs=require('fs');
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=root+u;
 if(fs.existsSync(f)){r.writeHead(200,{'Content-Type':f.endsWith('.mp4')?'video/mp4':f.endsWith('.html')?'text/html':''});r.end(fs.readFileSync(f))}else{r.writeHead(404);r.end()}}).listen(8095);
(async()=>{const b=await chromium.launch();let fallos=0;const ok=(c,m)=>{console.log((c?'OK   ':'FALLA')+' '+m);if(!c)fallos++};
for(const v of ['jairo','liliana','gladys']){
const ctx=await b.newContext({viewport:{width:390,height:844}});
await ctx.route('**/script.google.com/**',rt=>rt.fulfill({json:{ok:true,asesor:v,whatsapp:'57',desc2:0,desc3:0,productos:[{id:'ajo-perejil',n:'Ajo y Perejil',p:45000,img:'ajo-perejil.jpg',c:['Defensas'],s:'ok',pr:'120 cápsulas',op:[],b:[],w:[]}]}}));
await ctx.addInitScript(()=>{window.__sh=[];navigator.canShare=()=>true;navigator.share=async d=>{window.__sh.push({n:(d.files||[]).length,name:d.files&&d.files[0]&&d.files[0].name,size:d.files&&d.files[0]&&d.files[0].size,type:d.files&&d.files[0]&&d.files[0].type})};
 window.__cb=[];document.execCommand=function(c){if(c==='copy'){const a=document.activeElement;window.__cb.push(a&&a.value)}return true}});
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto(`http://localhost:8095/${v}/`);await pg.waitForSelector('.card .ph',{timeout:8000});
// Producto
await pg.locator('.card .ph').first().click();await pg.waitForTimeout(400);if(!errs.length===false)console.log('ERR',errs);await pg.click('#fin [data-share]')
ok(await pg.isVisible('[data-shmode="reel"]'),`${v}: aparece la opción Reel`);
await pg.click('[data-shmode="reel"]');await pg.waitForSelector('[data-reelgo]',{timeout:8000}).catch(()=>{});
await pg.click('[data-reelgo]');await pg.waitForTimeout(300);
let sh=await pg.evaluate(()=>window.__sh.pop());let cb=await pg.evaluate(()=>window.__cb.pop());
ok(sh&&sh.n===1&&sh.type==='video/mp4'&&sh.size>100000&&sh.name==='ajo-perejil.mp4',`${v}: comparte el video del producto (${sh&&sh.name}, ${sh&&sh.size} bytes)`);
ok(cb&&cb.includes('Comenta QUIERO')&&!cb.includes('http'),`${v}: descripción copiada sin enlace`);console.log(cb);
// Copiar enlace
await pg.click('#fin [data-share]');await pg.click('[data-shmode="link"]');await pg.waitForTimeout(200);cb=await pg.evaluate(()=>window.__cb.pop());
ok(cb===`https://vidanatural-co.github.io/${v}/p/ajo-perejil.html`,`${v}: copia enlace del producto (${cb})`);
await pg.click('#ficha [data-close]');
// Catálogo
await pg.click('#shcat');await pg.click('[data-shmode="reel"]');await pg.waitForSelector('[data-reelgo]',{timeout:8000}).catch(()=>{});await pg.click('[data-reelgo]');await pg.waitForTimeout(300);
sh=await pg.evaluate(()=>window.__sh.pop());cb=await pg.evaluate(()=>window.__cb.pop());
ok(sh&&sh.name===`catalogo-${v}.mp4`&&sh.size>100000,`${v}: comparte el video del catálogo (${sh&&sh.size} bytes)`);
ok(cb&&cb.includes('Comenta QUIERO')&&!cb.includes('http'),`${v}: descripción del catálogo sin enlace`);
await pg.click('#shcat');await pg.click('[data-shmode="link"]');await pg.waitForTimeout(200);cb=await pg.evaluate(()=>window.__cb.pop());
ok(cb===`https://vidanatural-co.github.io/${v}/`,`${v}: copia enlace del catálogo`);
// Feed e Historia siguen funcionando
await pg.locator('.card .ph').first().click();await pg.click('#fin [data-share]');await pg.click('[data-shmode="historia"]');await pg.waitForTimeout(500);sh=await pg.evaluate(()=>window.__sh.pop());
ok(sh&&sh.n===1&&/image/.test(sh.type),`${v}: Historia sigue compartiendo la foto`);
ok(!errs.length,`${v}: sin errores en la página ${errs.join(' | ')}`);
await ctx.close()}
await b.close();srv.close();console.log(fallos?`${fallos} FALLAS`:'TODO BIEN');process.exit(fallos?1:0)})();
