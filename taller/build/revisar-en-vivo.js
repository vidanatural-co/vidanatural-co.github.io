// Abre las páginas publicadas y revisa que muestren productos. Lo usa .github/workflows/revisar.yml
const {chromium}=require('playwright');
const S='https://vidanatural-co.github.io';
const PAG=[['Tienda Jairo',S+'/jairo/','.card'],['Tienda Liliana',S+'/liliana/','.card'],['Tienda Gladys',S+'/gladys/','.card'],['Vitrina',S+'/material/','article.card']];
(async()=>{const b=await chromium.launch();let fallos=0;
 for(const [n,u,sel] of PAG){const pg=await b.newPage({viewport:{width:390,height:844}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  let k=0;try{await pg.goto(u+'?revision='+Date.now(),{waitUntil:'domcontentloaded',timeout:60000});await pg.waitForSelector(sel,{timeout:60000});k=await pg.locator(sel).count()}catch(e){}
  const bien=k>=10&&!errs.length;if(!bien)fallos++;
  console.log(`${bien?'OK   ':'FALLA'} ${n}: ${k} productos${errs.length?' · errores: '+errs.join(' | '):''}`);await pg.close()}
 await b.close();if(fallos){console.log(`\n${fallos} página(s) con problemas. Revisar el último cambio publicado o el cartero.`);process.exit(1)}console.log('Todo bien');})();
