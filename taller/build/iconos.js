const {chromium}=require('playwright');
const S=JSON.parse(require('fs').readFileSync(process.argv[2],'utf8'));
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage();
for(const [v,svg] of Object.entries(S)){for(const s of [192,512]){
 await p.setViewportSize({width:s,height:s});
 await p.setContent(`<body style="margin:0;background:#fff"><svg width="${s}" height="${s}" viewBox="-14 -14 128 128" xmlns="http://www.w3.org/2000/svg"><rect x="-14" y="-14" width="128" height="128" fill="#fff"/>${svg}</svg></body>`);
 await p.screenshot({path:`iconos/${v}-${s}.png`});}}
await b.close();})();
