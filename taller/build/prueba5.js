const {chromium}=require('playwright');const root='/home/claude/catalogo/gh';const http=require('http'),fs=require('fs'),path=require('path');
const T={'.html':'text/html','.js':'text/javascript','.webmanifest':'application/manifest+json','.png':'image/png','.jpg':'image/jpeg'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=root+u;
 if(fs.existsSync(f)){r.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f))}else{r.writeHead(404);r.end()}}).listen(8096);
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const ctx=await b.newContext({viewport:{width:390,height:844}});
await ctx.route('**/script.google.com/**',rt=>rt.fulfill({json:{ok:true,asesor:'Jairo',whatsapp:'57',desc2:10000,desc3:25000,productos:[{id:'maca',n:'Maca',c:['X'],g:'',ip:'',d:'',b:[],pr:'',u:'',r:'',op:[],w:[],img:'maca.jpg',p:70000,s:'disponible'}]}}));
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:8096/jairo/');await pg.waitForSelector('.card');
await pg.evaluate(()=>navigator.serviceWorker.ready);await pg.reload();await pg.waitForSelector('.card');
const cdp=await ctx.newCDPSession(pg);const inst=await cdp.send('Page.getInstallabilityErrors');
const ctrl=await pg.evaluate(()=>!!navigator.serviceWorker.controller);
const cached=await pg.evaluate(async()=>{const k=await caches.keys();const c=await caches.open(k[0]);return (await c.keys()).map(r=>r.url.replace(location.origin,''))});
srv.close();await new Promise(r=>setTimeout(r,300));
let offline='';try{await pg.reload();offline=await pg.title()}catch(e){offline='FAIL '+e.message.slice(0,60)}
console.log(JSON.stringify({inst,ctrl,cached,offline,errs}));await b.close();})();
