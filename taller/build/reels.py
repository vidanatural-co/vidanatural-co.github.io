#!/usr/bin/env python3
"""Hace los videos para Reels (acercamiento suave, 7 s, vertical 1080x1920, sin voz ni música).

Uso (desde la raíz del repositorio):  python3 taller/build/reels.py
  - Producto: img/<foto>.jpg            -> img/reel/<foto>.mp4
  - Catálogo: <asesor>/historia.jpg     -> <asesor>/reel.mp4
Solo rehace los videos cuya foto cambió (guarda una "huella" de cada foto en img/reel/huellas.json).
Para forzar todo: python3 taller/build/reels.py --todo

Etapa 2 (voces): si existe taller/voces/<foto>.mp3 (o <asesor>.mp3 para el catálogo),
el video se alarga al largo de la voz (+1 s) y la lleva como sonido. Sin voz: 7 s en silencio.
"""
import hashlib, json, os, subprocess, sys, tempfile

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
VOCES = os.path.join(RAIZ, 'taller', 'voces')
SALIDA = os.path.join(RAIZ, 'img', 'reel')
HUELLAS = os.path.join(SALIDA, 'huellas.json')
ASESORES = ['jairo', 'liliana', 'gladys']
FPS, SEG, ZOOM = 30, 7.0, 0.05   # acercamiento total: 5 % (las fotos traen textos cerca del borde)


def huella(*rutas):
    h = hashlib.sha1(b'v1')  # cambiar 'v1' si se cambia el estilo del video (rehace todo)
    for r in rutas:
        if r and os.path.exists(r):
            h.update(open(r, 'rb').read())
    return h.hexdigest()


def duracion(audio):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', audio],
                         capture_output=True, text=True).stdout.strip()
    return float(out)


def sirve(video):
    try:
        return duracion(video) >= SEG - 0.1
    except Exception:
        return False


def hacer(foto, destino, voz=None):
    seg = max(SEG, duracion(voz) + 1.0) if voz else SEG
    n = int(round(seg * FPS))
    # Se agranda la foto 2 veces antes del acercamiento para que el movimiento sea suave (sin temblor).
    # Acercamiento con arranque y final suaves (curva "smoothstep").
    t = f'(on/{n - 1})'
    z = f'1+{ZOOM}*({t}*{t}*(3-2*{t}))'
    grande = tempfile.mktemp(suffix='.png')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', foto, '-vf',
                    'scale=2160:3840:force_original_aspect_ratio=increase:flags=lanczos,crop=2160:3840,setsar=1',
                    grande], check=True)
    vf = (f"zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps={FPS},"
          f'unsharp=5:5:0.4,format=yuv420p')
    cmd = ['ffmpeg', '-y', '-v', 'error', '-loop', '1', '-framerate', str(FPS), '-i', grande]
    cmd += ['-i', voz] if voz else ['-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo']
    cmd += ['-vf', vf, '-frames:v', str(n), '-map', '0:v', '-map', '1:a',
            '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-profile:v', 'high', '-level', '4.1',
            '-pix_fmt', 'yuv420p', '-r', str(FPS),
            '-c:a', 'aac', '-b:a', '128k', '-ar', '44100', '-t', f'{n / FPS:.3f}',
            '-movflags', '+faststart', destino]
    try:
        subprocess.run(cmd, check=True)
    finally:
        os.remove(grande)


def main():
    todo = '--todo' in sys.argv
    os.makedirs(SALIDA, exist_ok=True)
    viejas = json.load(open(HUELLAS)) if os.path.exists(HUELLAS) else {}
    nuevas, trabajos = {}, []
    for f in sorted(os.listdir(os.path.join(RAIZ, 'img'))):
        if f.endswith('.jpg') and f != 'historia.jpg':
            base = f[:-4]
            voz = os.path.join(VOCES, base + '.mp3')
            trabajos.append((f'img/{f}', os.path.join(RAIZ, 'img', f), os.path.join(SALIDA, base + '.mp4'),
                             voz if os.path.exists(voz) else None))
    for a in ASESORES:
        voz = os.path.join(VOCES, a + '.mp3')
        trabajos.append((f'{a}/historia.jpg', os.path.join(RAIZ, a, 'historia.jpg'), os.path.join(RAIZ, a, 'reel.mp4'),
                         voz if os.path.exists(voz) else None))
    hechos = 0
    for clave, foto, destino, voz in trabajos:
        hu = huella(foto, voz)
        nuevas[clave] = hu
        if not todo and os.path.exists(destino) and (viejas.get(clave) == hu or (clave not in viejas and sirve(destino))):
            continue  # sin cambios (o video ya hecho antes de existir la huella)
        print('Haciendo', clave, '(con voz)' if voz else '', flush=True)
        hacer(foto, destino + '.tmp.mp4', voz)
        os.replace(destino + '.tmp.mp4', destino)  # si se corta a la mitad, no queda un video dañado
        hechos += 1
        viejas[clave] = hu
        json.dump(viejas, open(HUELLAS, 'w'), indent=0, sort_keys=True)  # guarda el avance después de cada video
    # Borra videos de fotos que ya no existen
    vivos = {os.path.basename(d) for _, _, d, _ in trabajos}
    for f in os.listdir(SALIDA):
        if f.endswith('.mp4') and f not in vivos and not f.endswith('.tmp.mp4'):
            os.remove(os.path.join(SALIDA, f))
            print('Borrado (ya no hay foto):', f)
    json.dump(nuevas, open(HUELLAS, 'w'), indent=0, sort_keys=True)
    print(f'Listo: {hechos} video(s) nuevos o cambiados; {len(trabajos) - hechos} sin cambios.')


if __name__ == '__main__':
    main()
