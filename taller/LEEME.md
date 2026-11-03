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
- `build/reels-texto.js` + `build/reels-texto.json` + `build/fuentes/`: Reels con texto animado, ESTILO `2n` (foto completa nítida + gancho + 3 beneficios + cierre). Desde el 31-oct-2026 los 92 videos cierran con una de 6 frases que se turnan (PÍDELO HOY, ESCRÍBEME, ¿LO QUIERES? ESCRÍBEME, HAZ TU PEDIDO HOY, ASEGURA EL TUYO, PREGUNTA POR EL TUYO), sin cinta, sin "Comenta QUIERO" y sin "Pagas cuando lo recibes" (sirven para todos los vendedores y todas las redes; ver pautas en el proyecto de Claude, claude/pautas-videos.md). Producto nuevo o foto cambiada: `node reels-texto.js 2n ../../img/reel <foto>` desde build (reels.py haría la versión sin texto). Revisar el cierre sin hacer el video: `CUADRO=9.6 node reels-texto.js 2n /tmp/x <foto>`. Las 16 fotos que no están en las tiendas conservan su video sin texto. ~55 s por video.
- `build/prueba8.js`: prueba de los botones 🎬 Reel y 🔗 Copiar enlace en las 3 tiendas (`node prueba8.js`).
- `script/Codigo.gs`: el "cartero" (Google Apps Script). Lo que está implementado en Google debe coincidir con este archivo.
- `base-datos-productos.md`: base de datos de productos para contestar clientes (la única copia; desde el 29-oct-2026 ya no está en el proyecto de Claude). Leerla solo cuando se pregunte por un producto.

## Datos clave
- Hoja maestra: 1Mgp6y6wbyS-ExoxDHy3buRgf-s7ir33V7DeQEwTN4lk (pestañas Productos, Vendedores, Pedidos, Faltan en catálogo, No van en catálogo, Fotos de Leal).
- Precios: Jairo 1LGJlVNzBq0L-GBu_bOeIq7oWVzleK-jd1SjWzG36Mw8 · Liliana 1WC53lGpQ6dNMtyPSWEOtKlLBTydOVwsCR4NKTJNYPkk · Gladys 1V5mMZHrfAGV-Y7P23EawCLxcZYqEmbNYn1Ljg-ggwTc. Desde el 3-nov-2026 el precio se busca por CÓDIGO (columna C de cada hoja de precios = nombre de la foto sin .jpg), no por posición.
- Inventario de Leal (solo lectura): 1gDg2MgnJqCSYEhU9F9nWRpeof1gi4QeDfV9vVI4Nz_k.
- REGLA DE ORO: nunca borrar ni mover filas de la pestaña Productos. Si cambia un producto, se edita su misma fila; para quitarlo, Mostrar = NO. Mover filas desalinea los precios de los 3 asesores.
- En "Nombre en Distry": "+" = combo (cuenta el que tenga menos), "/" = mismo producto de varios proveedores (se suman).

## Hojas de precios (desde 3-nov-2026: por código)
- El cartero busca cada precio por el código del producto (columna C, "Código (no tocar)") = nombre del archivo de la foto sin .jpg. Mover filas ya no cambia precios. Producto nuevo: el cartero agrega su fila sola al final (sin precio) cuando el asesor abre su panel.
- Si se cambia la foto de un producto, conservar el MISMO nombre de archivo; si el nombre cambia, el producto queda sin precio hasta ponérselo.
- Las reglas de abajo (posición +3) eran las de antes; se dejan como historia.

## Hojas de precios (regla vieja, oct-2026)
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
- Cierre de los videos (desde 31-oct-2026): 6 frases que se turnan, sin "Comenta QUIERO" ni cinta (ver arriba).
- Copiar enlace: para pegarlo en un comentario fijado en Facebook.
- El ayudante sw.js no guarda los videos .mp4 en el celular (para que siempre salga el video más nuevo).

- Instagram Lite y Facebook Lite NO reciben videos para Reels (comprobado 29-oct-2026). Al compartir, escoger Instagram o Facebook normales.
- Hashtags (desde 29-oct-2026): máximo 5 (límite de Instagram). Producto: hasta 2 de su categoría + uno con el nombre del producto (función htn, sale del nombre en la hoja) + #VidaNaturalCo #ContraentregaColombia. Catálogo: #VidaNaturalCo #SuplementosNaturales #ContraentregaColombia.
- Estado de WhatsApp (desde 30-oct-2026): tercer botón en la ventana del Reel. Mismo video; copia texto corto SIN hashtags: nombre – precio / "👉 Mira más información aquí: <enlace>" / "🚚 Pagas cuando lo recibes." (en los estados el enlace sí se toca). La música la pone Jairo en WhatsApp.

## Página de material (desde 31-oct-2026)
- `material/` = **Vitrina de Productos Naturales** (https://vidanatural-co.github.io/material/): videos con texto y fotos de cada producto para compartir. Para Liliana, Gladys, Pineda y Adriana (no usan la tienda). Pública, sin clave, sin precios.
- Es una página aparte, NO sale de plantilla.html ni de build.py: se edita directamente `material/index.html`.
- Lee la misma lista que la tienda de Jairo (cartero, `v=jairo`) y muestra también los agotados (desde 3-nov-2026, al final y con aviso "Agotado por ahora"), para tener los mismos productos que las tiendas. Video: `img/reel/<foto>.mp4`; foto: `img/<foto>`. Se actualiza sola al cambiar la hoja o los videos.
- Botones: Compartir video (grande), Compartir foto, Descargar (pregunta video o foto), Copiar texto (nombre + gancho + 3 beneficios + "Escríbeme y pídelo 🌿"). Compartir también copia el texto.
- Botón Instalar (corregido 31-oct, Pineda vio pasos equivocados): si Chrome ofrece instalar, sale "Instalar ahora"; si no, espera 3 s y muestra pasos según el celular: iPhone (Safari), Samsung (☰ → Agregar página a), Android Chrome (⋮ → Instalar app); si está abierta dentro de WhatsApp/Facebook u otro navegador, primero dice "Abrir en Chrome".

## Nombres (31-oct-2026)
- Solo la tienda de Jairo es "Vida Natural" (Tienda Vida Natural · Jairo, hashtag #VidaNaturalCo). Liliana, Gladys, Pineda, Adriana y Leal son independientes: sus tiendas se llaman "Tienda de <nombre> · Productos naturales" (hashtag #ProductosNaturales) y la Vitrina es "Vitrina de Productos Naturales" (ícono de hoja, sin el sol de Jairo). build.py arma título y hashtag según el asesor.
- La página principal (raíz) es solo de Vida Natural: un botón a la tienda de Jairo; ya no lista a Liliana y Gladys.
- La dirección web (vidanatural-co.github.io) NO se cambia (decisión de Jairo).

## Ayudante sw.js (desde 31-oct-2026)
- Fotos y archivos: primero busca la versión nueva en internet y, si no hay conexión, usa la copia guardada. Así una foto cambiada con el mismo nombre se ve en las apps ya instaladas (antes se quedaba la vieja). Los videos .mp4 nunca se guardan.

## Texto pegado al compartir (31-oct-2026)
- Al compartir video o foto (Vitrina: "Compartir ahora"; tiendas: ventana del Reel), el texto va junto con el archivo (`navigator.share({files, text})`), para que WhatsApp lo ponga solo como descripción. También se sigue copiando al portapapeles por si la app (Instagram, Facebook, estados) no lo recibe.

## Tarjeta de contacto de Jairo (1-nov-2026)
- `contacto/index.html` (https://vidanatural-co.github.io/contacto/): página con "📇 Guardar mi número" (abre `contacto/jairo.vcf`: "Jairo productos naturistas", +57 312 419 3061), "💬 Pedir catálogo por WhatsApp" y "🛒 Ver la tienda". La abre el QR impreso pegado detrás del celular de Jairo y el enlace de su mensaje de bienvenida de WhatsApp Business.
- Está en la raíz y no dentro de /jairo/ a propósito: el ayudante (sw.js) de la tienda guarda como copia de la tienda cualquier página que se abra dentro de /jairo/.
- Liliana y Gladys tienen lo mismo (sin QR impreso): `contacto/liliana/` (liliana.vcf, "Liliana productos naturistas", 313 632 5474) y `contacto/gladys/` (gladys.vcf, "Gladys productos naturistas", 300 416 3243), con sus colores y su dibujo. Sus tarjetas no dicen "pagas cuando lo recibes" (ellas no envían).
- Las 3 tiendas: botón "👉 Toca aquí y guarda este contacto" + renglón pequeño "Así ves mis novedades en mis estados" (Jairo lo eligió; no usar "agéndame" ni "mi número") (id `guardar`, en plantilla.html); el enlace se arma con CFG.v (jairo → contacto/jairo.vcf; otros → contacto/<v>/<v>.vcf). Asesor nuevo: crear su carpeta en contacto/.
- Android (1-nov-2026): los botones de guardar contacto (mini páginas y tiendas) abren "Nuevo contacto" con nombre y número llenos (enlace intent: ... action INSERT). Si el celular no lo permite, Chrome usa la tarjeta .vcf (browser_fallback_url). iPhone sigue con la .vcf. Pendiente que Jairo confirme en su celular que funciona.

- 1-nov-2026 (más tarde): Jairo QUITÓ el botón de guardar contacto de las 3 tiendas: en Android son 4 toques (descargar .vcf → Abrir → Importar → elegir cuenta) y el atajo intent no funcionó en su Samsung. Lo que se usa ahora: Jairo manda su contacto dentro del chat (📎 → Contacto). Tampoco quiere Canal de WhatsApp. Las páginas contacto/ siguen publicadas pero sin uso; no volver a proponer el botón.

## Clientes y recordatorios (desde 3-nov-2026)
- Panel de cada asesor con 3 pestañas: 👥 Clientes, 📊 Resumen, 💰 Precios.
- Clientes: "Anotar venta" (WhatsApp, nombre, producto de la lista, cantidad, días que dura, de dónde llegó). Se guarda en la pestaña "Clientes" de la hoja maestra (la crea el cartero). 5 días antes de que se acabe, sale en "Para escribir hoy" con botón que abre WhatsApp con mensaje listo (al tocarlo queda "Le escribí"). Si el mismo cliente compra el mismo producto, el aviso viejo queda "Volvió a comprar".
- Resumen: frascos, clientes, lo más vendido, de dónde llegan y productos sin ventas (7/30/90 días). Sale solo de lo anotado.
- Cada asesor ve solo sus clientes (con su clave). Los números de clientes nunca salen en páginas públicas.
- Origen: los enlaces que se comparten desde la tienda llevan ?de=fb|wa|hist|pub (las páginas p/ lo conservan). El botón de WhatsApp y el pedido dicen "vi tu catálogo en Facebook" etc. (vale 30 días en ese celular).
- Prueba: `node taller/build/prueba9.js`.
