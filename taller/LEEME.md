# Taller del catálogo (archivos fuente)

Aquí están las "recetas" con las que se arman las tiendas publicadas (jairo/, liliana/, gladys/, revision/, img/).
La tienda publicada es el resultado; si se edita a mano un index.html publicado, hay que llevar ese mismo cambio a `build/plantilla.html`, o se perderá en la próxima publicación.

## Qué hay
- `build/plantilla.html`: la página de la tienda (una sola para los 3 asesores).
- `build/build.py`: arma las 3 tiendas. Uso: `python3 build.py "<URL del cartero>"` desde la carpeta build. Salida en `../gh/` (copiar a la raíz del repo).
- `build/datos.py`: lista de nombres/fotos para crear las páginas de vista previa `p/<foto>.html`. OJO: está desactualizada respecto a la hoja (faltan los productos agregados el 23-oct). Lo ideal es que build.py lea la hoja.
- `build/revision.html`: página privada de revisión con fotos (Leal vs catálogo).
- `build/sw-plantilla.js`: ayudante para que la app sea instalable y abra rápido (nunca guarda datos de Google).
- `build/iconos/`: símbolos de cada asesor (192, 512, maskable), portadas (horizontal) e historias (vertical 9:16).
- `build/portada.py`, `build/historia.py`, `build/iconos.js`: generan portadas, historias e íconos.
- `build/prueba*.js`: pruebas automáticas con Playwright.
- `build/reels.py`: hace los videos para Reels (7 s, vertical 1080x1920, acercamiento suave del 5 %, sin voz ni música). Uso desde la raíz del repositorio: `python3 taller/build/reels.py` (solo rehace los videos cuya foto cambió; `--todo` rehace todos). Producto: `img/<foto>.jpg` → `img/reel/<foto>.mp4`. Catálogo: `<asesor>/historia.jpg` → `<asesor>/reel.mp4`. Voces (etapa 2): poner `taller/voces/<foto>.mp3` (o `<asesor>.mp3`) y correrlo otra vez; el video se alarga al largo de la voz. Correrlo SIEMPRE después de agregar o cambiar fotos, y antes del git push. Tarda unos 17 s por video.
- `build/reels-texto.js` + `build/reels-texto.json` + `build/fuentes/`: Reels con texto animado. ESTILO ELEGIDO por Jairo (29-oct-2026): `2n` (foto completa nítida + gancho + 3 beneficios + "Comenta QUIERO"). Publicados con texto (29-oct-2026): los 92 productos visibles en las tiendas. Las 16 fotos que no están en las tiendas conservan su video sin texto. OJO: si cambia la foto de un producto con texto, rehacerlo con `node reels-texto.js 2n ../../img/reel <foto>` (reels.py haría la versión sin texto). `node reels-texto.js <1|2> <carpeta> [fotos]`. Estilo 1: gancho animado → foto con acercamiento → "Comenta QUIERO". Estilo 2: frasco nítido con fondo desenfocado + gancho + 3 beneficios + "Comenta QUIERO". Sin precios (el video es igual para los 3 asesores). Textos sin promesas médicas. ~55 s por video.
- `build/prueba8.js`: prueba de los botones 🎬 Reel y 🔗 Copiar enlace en las 3 tiendas (`node prueba8.js`).
- `script/Codigo.gs`: el "cartero" (Google Apps Script). Lo que está implementado en Google debe coincidir con este archivo.
- `base-datos-productos.md`: base de datos de productos para contestar clientes (la única copia; desde el 29-oct-2026 ya no está en el proyecto de Claude). Leerla solo cuando se pregunte por un producto.

## Datos clave
- Hoja maestra: 1Mgp6y6wbyS-ExoxDHy3buRgf-s7ir33V7DeQEwTN4lk (pestañas Productos, Vendedores, Pedidos, Faltan en catálogo, No van en catálogo, Fotos de Leal).
- Precios: Jairo 1LGJlVNzBq0L-GBu_bOeIq7oWVzleK-jd1SjWzG36Mw8 · Liliana 1WC53lGpQ6dNMtyPSWEOtKlLBTydOVwsCR4NKTJNYPkk · Gladys 1V5mMZHrfAGV-Y7P23EawCLxcZYqEmbNYn1Ljg-ggwTc. Fila de precio = fila de la hoja maestra + 3.
- Inventario de Leal (solo lectura): 1gDg2MgnJqCSYEhU9F9nWRpeof1gi4QeDfV9vVI4Nz_k.
- REGLA DE ORO: nunca borrar ni mover filas de la pestaña Productos. Si cambia un producto, se edita su misma fila; para quitarlo, Mostrar = NO. Mover filas desalinea los precios de los 3 asesores.
- En "Nombre en Distry": "+" = combo (cuenta el que tenga menos), "/" = mismo producto de varios proveedores (se suman).

## Hojas de precios (regla, oct-2026)
- Fila r de la hoja maestra = fila r+3 en cada hoja de precios. El cartero lee el precio SOLO por posición (columna B); la columna A es solo una etiqueta.
- NUNCA insertar, mover ni borrar filas en las hojas de precios. Producto nuevo: va al final de la pestaña Productos y su precio en la fila +3 de cada asesor (al final).
- "Nuevo de primero" se logra con el orden del catálogo, no moviendo filas.
- Después de cualquier cambio de precios: leer la columna A y B de las tres hojas y comparar nombre por nombre con la maestra antes de dar por terminado.
- El cartero reescribe la columna A desde la maestra cada vez que un asesor abre o guarda su panel (función sincronizarNombres).

## Cartero: enlace del editor
- https://script.google.com/home/projects/191VKbLmgA9hvaAN2O0cjARx37ZB2X4sHYk9NwiZJch5ccqb3cB8mehuR/edit
- Regla: cada vez que se le pida a Jairo pegar o actualizar el cartero, darle este enlace dentro de los pasos.

## Compartir (desde 29-oct-2026)
Menú de compartir: 📝 Publicación (feed), 📱 Historia, 🎬 Reel y 🔗 Copiar enlace.
- Reel: descarga el video y muestra 2 botones (segundo toque, para que el celular lo permita): "Compartir en Instagram" copia la descripción SIN enlace con "Comenta QUIERO y te envío el enlace" (en Instagram los enlaces no se pueden tocar); "Compartir en Facebook" copia la descripción CON el enlace (en Facebook sí se puede tocar).
- Cierre de los videos: los 92 hechos el 29-oct dicen "Comenta QUIERO" (Jairo decidió dejarlos así). Los NUEVOS cierran con "PÍDELO HOY" + cinta "🚚 Pagas cuando lo recibes" (sirve en las dos redes).
- Copiar enlace: para pegarlo en un comentario fijado en Facebook.
- El ayudante sw.js no guarda los videos .mp4 en el celular (para que siempre salga el video más nuevo).

- Instagram Lite y Facebook Lite NO reciben videos para Reels (comprobado 29-oct-2026). Al compartir, escoger Instagram o Facebook normales.
