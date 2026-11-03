// Prueba del panel (Clientes, Resumen, Precios) y del origen ?de= en las 3 tiendas. Uso: node prueba9.js
const {chromium}=require('playwright');const path=require('path');const root=path.resolve(__dirname,'../..');const http=require('http'),fs=require('fs');
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=root+u;
 if(fs.existsSync(f)){r.writeHead(200,{'Content-Type':f.endsWith('.html')?'text/html':''});r.end(fs.readFileSync(f))}else{r.writeHead(404);r.end()}}).listen(8096);
const D=864e5,now=Date.now();
const prods=[{id:'maca',n:'Maca Negra',c:['Energía'],g:'',ip:'',d:'',b:[],pr:'60 cápsulas',u:'',r:'',op:[],w:[],img:'maca.jpg',p:50000,s:'disponible'}];
const V0=[{id:1,f:now-28*D,c:'María Pérez',w:'573001112233',n:'Maca Negra',k:1,d:30,a:now-D,o:'Facebook',e:'Pendiente',u:0},
 {id:2,f:now-3*D,c:'Juan',w:'573004445566',n:'Maca Negra',k:2,d:30,a:now+50*D,o:'Instagram',e:'Pendiente',u:0}];
(async()=>{const b=await chromium.launch();let fallos=0;const ok=(c,m)=>{console.log((c?'OK   ':'FALLA')+' '+m);if(!c)fallos++};
for(const v of ['jairo','liliana','gladys']){let ventas=JSON.parse(JSON.stringify(V0));
 const ctx=await b.newContext({viewport:{width:390,height:844}});const enviados=[];
 await ctx.route('**/script.google.com/**',async rt=>{const q=rt.request();if(q.method()==='GET')return rt.fulfill({json:{ok:true,asesor:v,whatsapp:'573124193061',desc2:0,desc3:0,productos:prods}});
  const d=JSON.parse(q.postData());enviados.push(d);
  if(d.accion==='panel')return rt.fulfill({json:{ok:true,asesor:v,desc2:1,desc3:2,productos:[{c:'maca',n:'Maca Negra',p:50000}],pedidos:[],ventas}});
  if(d.accion==='venta'){ventas=[{id:3,f:now,c:d.c,w:'57'+d.w.replace(/\D/g,''),n:d.n,k:+d.k,d:+d.d,a:now+25*D,o:d.o,e:'Pendiente',u:0},...ventas];return rt.fulfill({json:{ok:true,ventas}})}
  return rt.fulfill({json:{ok:true}})});
 const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(`http://localhost:8096/${v}/p/maca.html?de=fb`);await pg.waitForSelector('#fin .share',{timeout:8000});
 ok((await pg.evaluate(()=>localStorage.getItem('de')||'')).includes('fb'),v+': la página de enlace conserva ?de=fb');
 const href=decodeURIComponent(await pg.getAttribute('#waf','href'));ok(href.includes('vi Maca Negra en Facebook'),v+': botón WhatsApp dice "en Facebook"');
 await pg.evaluate(()=>closeF());await pg.click('#soy');await pg.fill('#kClave','1234');await pg.click('#kGo');
 await pg.waitForSelector('[data-pt]');ok(await pg.locator('#pv .ped').count()===2,v+': Clientes muestra 1 para hoy y 1 próximo');
 ok(decodeURIComponent(await pg.getAttribute('[data-vwa="1"]','href')).includes('Hola María'),v+': mensaje listo con el nombre');
 await pg.click('#vNew');await pg.fill('#vW','312 000 1122');await pg.fill('#vC','Ana');await pg.fill('#vN','maca negra');await pg.selectOption('#vO','Historia');await pg.click('#vSave');
 await pg.waitForTimeout(300);const vt=enviados.find(x=>x.accion==='venta');ok(vt&&vt.cod==='maca'&&vt.o==='Historia',v+': guarda la venta con código y origen');
 await pg.screenshot({path:'/tmp/cli-'+v+'.png'});await pg.click('[data-pt="res"]');ok((await pg.textContent('#pv')).includes('De dónde llegan'),v+': Resumen se ve');
 await pg.click('[data-pt="pre"]');await pg.fill('[data-c="maca"]','55000');await pg.click('#pSave');await pg.waitForTimeout(300);
 const gp=enviados.find(x=>x.accion==='guardarPrecios');ok(gp&&gp.cambios[0].c==='maca'&&gp.cambios[0].p==='55000',v+': precios se guardan por código');
 await pg.screenshot({path:`/tmp/panel-${v}.png`});
 ok(!errs.length,v+': sin errores '+errs.join(' | '));await ctx.close()}
await b.close();srv.close();console.log(fallos?`${fallos} FALLAS`:'TODO BIEN');process.exit(fallos?1:0)})();
