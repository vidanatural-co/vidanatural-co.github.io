const {chromium}=require('playwright');const path='/home/claude/catalogo/sitios/liliana';
const http=require('http'),fs=require('fs');
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const f=path+u;
 if(fs.existsSync(f)){r.writeHead(200,{'Content-Type':f.endsWith('.html')?'text/html':f.endsWith('.png')?'image/png':f.endsWith('.js')?'text/javascript':'image/jpeg'});r.end(fs.readFileSync(f))}else{r.writeHead(404);r.end()}}).listen(8099);
const P=[{id:'growxure',n:'Growxure Proteína',c:['Músculo y rendimiento'],g:'Proteína de doble acción',ip:'Personas que entrenan',d:'Mezcla de proteínas',b:['Músculo: crece','Energía: más'],pr:'900 g',u:'1 porción',r:'INVIMA RSA-1',op:[],w:['Calostro Bovino Sanaf'],img:'growxure.jpg',p:60000,s:'disponible'},
{id:'calostro',n:'Calostro Bovino Sanaf',c:['Defensas y nutrición','Músculo y rendimiento'],g:'Defensas',ip:'Adultos',d:'Calostro',b:['Defensas: sí'],pr:'900 g',u:'1 al día',r:'INVIMA X',op:['Me encantó'],w:['Growxure Proteína'],img:'calostro.jpg',p:60000,s:'ultimas'},
{id:'magnesio',n:'Magnesium Complex',c:['Estrés y descanso'],g:'Descansa',ip:'x',d:'x',b:['a: b'],pr:'90',u:'2',r:'USA',op:[],w:[],img:'magnesio.jpg',p:70000,s:'agotado'}];
let pedidos=0,log=[];
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
await ctx.route('**/__API__**',async rt=>{const req=rt.request();
 if(req.method()==='GET')return rt.fulfill({json:{ok:true,asesor:'Liliana',whatsapp:'573136325474',desc2:10000,desc3:25000,productos:P}});
 const d=JSON.parse(req.postData());log.push(d.accion);
 if(d.accion==='pedido'){pedidos++;return rt.fulfill({json:{ok:true,numero:1001}})}
 if(d.accion==='entrar')return rt.fulfill({json:d.codigo==='964907'?{ok:true}:{ok:false,error:'Código de primer ingreso incorrecto'}});
 if(d.accion==='panel')return rt.fulfill({json:{ok:true,asesor:'Liliana',desc2:10000,desc3:25000,productos:[{fila:0,n:'Growxure Proteína',p:60000}],pedidos:[{num:1001,fecha:new Date().toISOString(),det:'2 × Growxure × $60000',total:110000,desc:10000}]}});
 if(d.accion==='guardarPrecios')return rt.fulfill({json:{ok:true}});
});
const errs=[];const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));
let popupUrl=null;await ctx.route('https://wa.me/**',rt=>{popupUrl=rt.request().url();rt.fulfill({body:'ok'})});
await pg.goto('http://localhost:8099/');await pg.waitForSelector('.card');
const n=await pg.$$eval('.card',x=>x.length);
await pg.click('[data-p="growxure"]');await pg.click('[data-p="growxure"]');
const nudge=await pg.textContent('#nudge');const tot=await pg.textContent('#tot');
await pg.screenshot({path:'s1.png'});
await pg.click('[data-f="calostro"]');await pg.waitForSelector('#ficha:not([hidden])');await pg.screenshot({path:'s2.png',fullPage:false});
const hasCombo=await pg.$$eval('.combo',x=>x.length);const url2=pg.url();
await pg.click('#ficha .close');await pg.click('#go');await pg.click('#send');await pg.waitForTimeout(1500);
const rep=await pg.isVisible('#rep');
await pg.click('#soy');await pg.click('#tNew');await pg.fill('#kCod','964907');await pg.fill('#kNueva','1234');await pg.click('#kGo');await pg.waitForSelector('#pSave');
await pg.fill('[data-fila="0"]','65000');await pg.click('#pSave');await pg.waitForTimeout(500);
const pg2=await ctx.newPage();await pg2.goto('http://localhost:8099/?p=magnesio');await pg2.waitForSelector('#ficha:not([hidden])');const dis=await pg2.isDisabled('#fin .add');
console.log(JSON.stringify({cards:n,nudge,tot,hasCombo,url2,pedidos,popupUrl:popupUrl&&decodeURIComponent(popupUrl).slice(0,160),rep,log,deepAgotadoDisabled:dis,errs}));
await b.close();srv.close();})();
