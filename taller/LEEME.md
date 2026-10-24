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
- `script/Codigo.gs`: el "cartero" (Google Apps Script). Lo que está implementado en Google debe coincidir con este archivo.
- `base-datos-productos.md`: copia de la base de datos de productos (la oficial está en el proyecto de Claude).

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
