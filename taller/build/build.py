import os, sys, json, shutil, html
sys.path.insert(0, os.path.dirname(__file__))
from datos import names, fotos, oculto
from PIL import Image
API = sys.argv[1] if len(sys.argv) > 1 else "__API__"
SYM = {
 'jairo': '<circle cx="50" cy="50" r="26" fill="#f4b400"/><g stroke="#f4b400" stroke-width="6" stroke-linecap="round"><line x1="50" y1="8" x2="50" y2="16"/><line x1="50" y1="84" x2="50" y2="92"/><line x1="8" y1="50" x2="16" y2="50"/><line x1="84" y1="50" x2="92" y2="50"/><line x1="20" y1="20" x2="26" y2="26"/><line x1="74" y1="74" x2="80" y2="80"/><line x1="80" y1="20" x2="74" y2="26"/><line x1="20" y1="80" x2="26" y2="74"/></g><path d="M50 66c-10-6-12-16-6-24 6 2 10 10 6 24z" fill="#5fae2e"/><path d="M50 66c10-6 12-16 6-24-6 2-10 10-6 24z" fill="#4a9322"/>',
 'liliana': '<path d="M50 92V60" stroke="#3f9b4f" stroke-width="5" stroke-linecap="round"/><path d="M50 82c-12 0-20-8-22-16 10 0 20 6 22 16z" fill="#3f9b4f"/><path d="M50 62C36 56 28 40 34 22c10 8 16 22 16 40z" fill="#d63384"/><path d="M50 62c14-6 22-22 16-40-10 8-16 22-16 40z" fill="#d63384"/><path d="M50 62c-6-14-6-32 0-48 6 16 6 34 0 48z" fill="#e85a9c"/><circle cx="50" cy="58" r="4" fill="#f4b400"/>',
 'gladys': '<path d="M50 94V14" stroke="#3f9b4f" stroke-width="5" stroke-linecap="round"/><path d="M50 88c-14-2-22-12-22-22 12 2 20 10 22 22z" fill="#3f9b4f"/><g fill="#f06d1f"><ellipse cx="50" cy="20" rx="7" ry="9"/><ellipse cx="40" cy="34" rx="10" ry="8"/><ellipse cx="60" cy="44" rx="10" ry="8"/><ellipse cx="40" cy="56" rx="11" ry="9"/><ellipse cx="60" cy="68" rx="11" ry="9"/></g><g fill="#f4b400"><circle cx="42" cy="34" r="2.5"/><circle cx="58" cy="44" r="2.5"/><circle cx="42" cy="56" r="2.5"/><circle cx="58" cy="68" r="2.5"/></g>'}
V = {'jairo': ('Jairo', 'asesor', '#3f8f1f', '#5fae2e'),
     'liliana': ('Liliana', 'asesora', '#c2246f', '#d63384'),
     'gladys': ('Gladys', 'asesora', '#d9530a', '#f06d1f')}
tpl = open('plantilla.html', encoding='utf-8').read()
# imágenes comprimidas (una vez)
os.makedirs('img', exist_ok=True)
for f in fotos:
    dst = f'img/{f}.jpg'
    if not os.path.exists(dst):
        im = Image.open(f'/home/claude/demo/img/{f}.jpg').convert('RGB'); im.thumbnail((540, 960))
        im.save(dst, quality=74, optimize=True, progressive=True)
for v, (nom, trato, col, col2) in V.items():
    out = f'/home/claude/catalogo/gh/{v}'
    shutil.rmtree(out, ignore_errors=True); os.makedirs(out + '/p')
    sitio = f'https://vidanatural-co.github.io/{v}'
    h = (tpl.replace('__NOMBRE__', nom).replace('__TRATO__', trato).replace('__COLOR2__', col2).replace('__COLOR__', col)
         .replace('__SITIO__', sitio).replace('__V__', v).replace('__API__', API).replace('__SIMBOLO__', SYM[v])).replace('img/','../img/')
    open(out + '/index.html', 'w', encoding='utf-8').write(h)
    
    shutil.copy(f'iconos/portada-{v}.jpg', f'{out}/portada.jpg')
    shutil.copy(f'iconos/historia-{v}.jpg', f'{out}/historia.jpg')
    shutil.copy(f'iconos/{v}-maskable.png', f'{out}/icono-maskable.png')
    for s in ('192', '512'):
        shutil.copy(f'iconos/{v}-{s}.png', f'{out}/icono-{s}.png')
    json.dump({"name": f"{nom} · Bienestar natural", "short_name": nom, "start_url": "./", "scope": "./", "display": "standalone",
               "background_color": "#fbf7f2", "theme_color": col,
               "icons": [{"src": "icono-192.png", "sizes": "192x192", "type": "image/png"},
                         {"src": "icono-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
                         {"src": "icono-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]},
              open(out + '/manifest.webmanifest', 'w', encoding='utf-8'), ensure_ascii=False)
    open(out + '/sw.js', 'w').write(open('sw-plantilla.js').read().replace('__VER__', str(int(__import__('time').time()))))
    for i, (n, f) in enumerate(zip(names, fotos)):
        if i in oculto: continue
        t = html.escape(n)
        open(f'{out}/p/{f}.html', 'w', encoding='utf-8').write(f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><title>{t}</title>
<meta property="og:title" content="{t}"><meta property="og:description" content="Mira los beneficios y el precio. Pide por WhatsApp con {nom} y paga al recibir.">
<meta property="og:image" content="https://vidanatural-co.github.io/img/{f}.jpg"><meta property="og:type" content="product"><meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0;url=../?p={f}"><script>location.replace('../?p={f}')</script></head><body><a href="../?p={f}">{t}</a></body></html>''')
shutil.rmtree('/home/claude/catalogo/gh/img',ignore_errors=True);shutil.copytree('img','/home/claude/catalogo/gh/img')
print('ok')

import os as _os
_os.makedirs('../gh/revision', exist_ok=True)
open('../gh/revision/index.html','w',encoding='utf-8').write(open('revision.html',encoding='utf-8').read().replace('__API__', API))
