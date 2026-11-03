/**
 * CATÁLOGO WEB – Script "cartero"
 * Lee la hoja maestra, los archivos de precios y (solo lectura) el inventario de Distry.
 * Nunca escribe en Distry. Nunca envía costos. Los datos de clientes (pestaña Clientes) solo se entregan
 * al asesor dueño de esos clientes, después de verificar su clave.
 */
var MAESTRA = '1Mgp6y6wbyS-ExoxDHy3buRgf-s7ir33V7DeQEwTN4lk';
var DISTRY  = '1gDg2MgnJqCSYEhU9F9nWRpeof1gi4QeDfV9vVI4Nz_k';
var POCAS = 3;        // "Últimas unidades" cuando quedan 3 o menos
var CACHE_SEG = 300;  // los datos se guardan 5 minutos para que la página cargue rápido

/* ---------- Entradas ---------- */
function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    if (p.accion === 'catalogo') return salida(catalogo(String(p.v || '').toLowerCase()));
    return salida({ ok: true, mensaje: 'Cartero del catálogo funcionando' });
  } catch (err) { return salida({ ok: false, error: String(err.message || err) }); }
}

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents || '{}');
    if (d.accion === 'pedido') return salida(guardarPedido(d));
    if (d.accion === 'entrar') return salida(entrar(d));
    if (d.accion === 'panel') return salida(panel(d));
    if (d.accion === 'guardarPrecios') return salida(guardarPrecios(d));
    if (d.accion === 'revision') return salida(revision(d));
    if (d.accion === 'venta') return salida(guardarVenta(d));
    if (d.accion === 'estadoVenta') return salida(estadoVenta(d));
    return salida({ ok: false, error: 'Acción desconocida' });
  } catch (err) { return salida({ ok: false, error: String(err.message || err) }); }
}

function salida(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- Utilidades ---------- */
function limpiar(t) {
  return String(t || '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{FE0F}\u{2600}-\u{27BF}]/gu, '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]/g, '');
}
function vendedores() {
  var f = SpreadsheetApp.openById(MAESTRA).getSheetByName('Vendedores').getDataRange().getValues();
  var out = {};
  for (var i = 1; i < f.length; i++) {
    var cod = String(f[i][1] || '').toLowerCase().trim();
    if (!cod) continue;
    out[cod] = { fila: i + 1, nombre: f[i][0], whatsapp: String(f[i][2]).replace(/\D/g, ''),
                 codigo: String(f[i][3] || '').trim(), clave: String(f[i][4] || ''), archivo: String(f[i][5] || '').trim() };
  }
  return out;
}
function hash(t) {
  var b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'catalogo-sal::' + t);
  return b.map(function (x) { return ('0' + (x & 255).toString(16)).slice(-2); }).join('');
}
/* Código fijo de cada producto = nombre del archivo de la foto (columna L), sin ".jpg".
   Desde el 3-nov-2026 el precio se busca por este código (columna C de cada hoja de precios),
   no por la posición de la fila. Así mover o insertar filas ya no cambia ningún precio. */
function codigo(f) { return String(f[11] || '').trim().toLowerCase().replace(/\.[a-z]+$/, ''); }
function precios(archivo, filas) {
  filas = filas || productosMaestra();
  var h = SpreadsheetApp.openById(archivo).getSheets()[0];
  var desc2 = Number(h.getRange('B1').getValue()) || 0;
  var desc3 = Number(h.getRange('B2').getValue()) || 0;
  var ult = Math.max(h.getLastRow(), 5);
  var datos = h.getRange(5, 1, ult - 4, 3).getValues();
  var hayCod = datos.some(function (r) { return String(r[2]).trim(); });
  if (!hayCod) {
    // Migración (una sola vez): fila r de la maestra = fila r+3 de precios -> se anota el código al lado
    h.getRange('C4').setValue('Código (no tocar)');
    var cods = filas.map(function (f) { return [codigo(f)]; });
    if (cods.length) h.getRange(5, 3, cods.length, 1).setValues(cods);
    ult = Math.max(h.getLastRow(), 5);
    datos = h.getRange(5, 1, ult - 4, 3).getValues();
  }
  var mapa = {}, filaDe = {};
  datos.forEach(function (r, j) {
    var c = String(r[2]).trim().toLowerCase();
    if (c) { mapa[c] = Number(r[1]) || 0; filaDe[c] = j + 5; }
  });
  return { desc2: desc2, desc3: desc3, hoja: h, ult: ult, datos: datos, filaDe: filaDe,
           lista: filas.map(function (f) { var c = codigo(f); return c ? (mapa[c] || 0) : 0; }) };
}
function existencias() {
  // Lee el inventario de Leal (solo lectura). Devuelve { q: unidades por producto, b: productos dados de baja }.
  // La columna "baja" se busca por su título (no por posición). Si dice SI, Leal ya no maneja el producto.
  var c = CacheService.getScriptCache();
  var g = c.get('stock2');
  if (g) return JSON.parse(g);
  var f = SpreadsheetApp.openById(DISTRY).getSheetByName('Inventario').getDataRange().getValues();
  var cb = (f[0] || []).map(function (x) { return String(x).toLowerCase().trim(); }).indexOf('baja');
  var m = { q: {}, b: {} };
  for (var i = 1; i < f.length; i++) {
    if (f[i][0] === '') continue;
    var k = limpiar(f[i][0]);
    m.q[k] = Number(f[i][3]) || 0;
    if (cb >= 0 && ['SÍ', 'SI'].indexOf(String(f[i][cb]).toUpperCase().trim()) >= 0) m.b[k] = true;
  }
  c.put('stock2', JSON.stringify(m), CACHE_SEG);
  return m;
}
function fechaNum(v) {
  if (v instanceof Date) return v.getTime();
  var t = Date.parse(String(v || '').trim());
  return isNaN(t) ? 0 : t;
}
function productosMaestra() {
  var h = SpreadsheetApp.openById(MAESTRA).getSheetByName('Productos');
  return h.getRange(2, 1, Math.max(h.getLastRow() - 1, 1), 16).getValues(); // A:P (P = Fecha)
}

/* Etiquetas de las hojas de precios: la columna A (nombre) se reescribe desde la hoja maestra
   buscando cada producto por su código (columna C). Producto nuevo = fila nueva al final, sin precio.
   El precio (columna B) no se toca. */
function sincronizarNombres(pr, filas) {
  var h = pr.hoja, n = pr.ult - 4, col = pr.datos.map(function (r) { return [r[0]]; });
  var cambio = false, nuevos = [];
  filas.forEach(function (f) {
    var c = codigo(f), nom = String(f[0]).trim();
    if (!c || !nom) return;
    var fila = pr.filaDe[c];
    if (fila) { if (String(col[fila - 5][0]) !== nom) { col[fila - 5][0] = nom; cambio = true; } }
    else { nuevos.push([nom, '', c]); pr.filaDe[c] = pr.ult + nuevos.length; }
  });
  if (cambio) h.getRange(5, 1, n, 1).setValues(col);
  if (nuevos.length) h.getRange(pr.ult + 1, 1, nuevos.length, 3).setValues(nuevos);
}

/* ---------- Catálogo para clientes ---------- */
function catalogo(v) {
  var cache = CacheService.getScriptCache();
  var g = cache.get('cat_' + v);
  if (g) return JSON.parse(g);
  var vs = vendedores(), ven = vs[v];
  if (!ven) return { ok: false, error: 'Vendedor no encontrado' };
  var filas = productosMaestra(), pr = precios(ven.archivo, filas), stock = existencias();
  var avisos = [], lista = [];
  filas.forEach(function (f, i) {
    var nombre = String(f[0]).trim();
    var aviso = '';
    var estado = 'disponible';
    var dist = String(f[12] || '').trim();
    var deBaja = '';
    if (dist) {
      var minimo = null;
      // "+" = combo (cuenta el componente con menos unidades)
      // "/" = mismo producto de varios proveedores (se suman las unidades)
      // Si un combo repite el mismo producto (ej. 2 frascos iguales), las unidades se dividen entre las veces que aparece
      // Dado de baja en Leal: un proveedor de baja no cuenta; si todos los de una parte están de baja, el producto no se muestra
      var veces = {};
      dist.split('+').forEach(function (parte) { var kp = limpiar(parte); veces[kp] = (veces[kp] || 0) + 1; });
      dist.split('+').forEach(function (parte) {
        var suma = null, vivos = 0, bajas = [];
        parte.split('/').forEach(function (n) {
          var k = limpiar(n);
          if (!k) return;
          if (!(k in stock.q)) { aviso = 'No encontrado en Distry: ' + n.trim(); return; }
          if (stock.b[k]) { bajas.push(n.trim()); return; }
          vivos++;
          suma = (suma || 0) + stock.q[k];
        });
        if (bajas.length && !vivos && !deBaja) deBaja = bajas.join(' / ');
        if (suma === null) return;
        suma = Math.floor(suma / (veces[limpiar(parte)] || 1));
        minimo = (minimo === null) ? suma : Math.min(minimo, suma);
      });
      if (minimo !== null && !aviso) estado = minimo <= 0 ? 'agotado' : (minimo <= POCAS ? 'ultimas' : 'disponible');
      if (deBaja && !aviso) aviso = 'Dado de baja en Leal: ' + deBaja;
    } else if (nombre) { aviso = 'Sin nombre en Distry'; }
    avisos.push([aviso]);
    var precio = pr.lista[i] || 0;
    var visible = ['SÍ', 'SI'].indexOf(String(f[13]).toUpperCase().trim()) >= 0;
    if (!nombre || !visible || !precio || deBaja) return;
    lista.push({
      _f: fechaNum(f[15]), _i: i,
      id: String(f[11]).replace(/\.[a-z]+$/i, ''), n: nombre,
      c: String(f[1]).split(',').map(function (x) { return x.trim(); }).filter(String),
      g: f[2], ip: f[3], d: f[4],
      b: String(f[5]).split('\n').filter(function (x) { return x.trim(); }),
      pr: f[6], u: f[7], r: f[8],
      op: String(f[9] || '').split('\n').filter(function (x) { return x.trim(); }),
      w: String(f[10] || '').split('+').map(function (x) { return x.trim(); }).filter(String),
      img: String(f[11]), p: precio, s: estado
    });
  });
  // Escribe los avisos rojos en la hoja maestra (solo si cambiaron)
  try {
    var h = SpreadsheetApp.openById(MAESTRA).getSheetByName('Productos');
    var rango = h.getRange(2, 15, avisos.length, 1);
    if (JSON.stringify(rango.getValues()) !== JSON.stringify(avisos)) rango.setValues(avisos);
  } catch (e) {}
  // Orden: la tienda muestra la lista al revés, así que aquí va de la fecha más vieja a la más nueva.
  // Sin fecha = más viejos. Misma fecha: por fila. Resultado en la tienda: fecha más reciente de primero.
  lista.sort(function (a, b) { return (a._f - b._f) || (a._i - b._i); });
  lista.forEach(function (x) { delete x._f; delete x._i; });
  var res = { ok: true, asesor: ven.nombre, whatsapp: ven.whatsapp, desc2: pr.desc2, desc3: pr.desc3, productos: lista };
  cache.put('cat_' + v, JSON.stringify(res), CACHE_SEG);
  return res;
}

/* ---------- Pedidos ---------- */
function guardarPedido(d) {
  var v = String(d.v || '').toLowerCase();
  var cat = catalogo(v);
  if (!cat.ok) return cat;
  var porId = {};
  cat.productos.forEach(function (p) { porId[p.id] = p; });
  var unidades = 0, subtotal = 0, detalle = [];
  (d.items || []).forEach(function (it) {
    var p = porId[it.id], k = Math.max(0, Math.min(99, Math.floor(Number(it.k) || 0)));
    if (!p || !k) return;
    unidades += k; subtotal += k * p.p;
    detalle.push(k + ' × ' + p.n + ' × $' + p.p);
  });
  if (!unidades) return { ok: false, error: 'Pedido vacío' };
  var desc = unidades >= 3 ? cat.desc3 : (unidades === 2 ? cat.desc2 : 0);
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var h = SpreadsheetApp.openById(MAESTRA).getSheetByName('Pedidos');
    var ult = h.getLastRow();
    var num = ult < 2 ? 1001 : (Number(h.getRange(ult, 1).getValue()) || 1000) + 1;
    h.appendRow([num, new Date(), cat.asesor, detalle.join('\n'), subtotal, desc, subtotal - desc]);
    return { ok: true, numero: num, subtotal: subtotal, descuento: desc, total: subtotal - desc };
  } finally { lock.releaseLock(); }
}

/* ---------- Panel de asesores ---------- */
function verificar(d) {
  var vs = vendedores(), ven = vs[String(d.v || '').toLowerCase()];
  if (!ven) throw new Error('Asesor no encontrado');
  if (!ven.clave) throw new Error('Primero crea tu clave');
  if (hash(String(d.clave || '')) !== ven.clave) throw new Error('Clave incorrecta');
  return ven;
}
function entrar(d) {
  var vs = vendedores(), ven = vs[String(d.v || '').toLowerCase()];
  if (!ven) return { ok: false, error: 'Asesor no encontrado' };
  if (d.codigo) { // primer ingreso: crear clave
    if (!ven.codigo || String(d.codigo).trim() !== ven.codigo) return { ok: false, error: 'Código de primer ingreso incorrecto' };
    if (String(d.clave || '').length < 4) return { ok: false, error: 'La clave debe tener mínimo 4 caracteres' };
    var h = SpreadsheetApp.openById(MAESTRA).getSheetByName('Vendedores');
    h.getRange(ven.fila, 5).setValue(hash(String(d.clave)));
    h.getRange(ven.fila, 4).setValue(''); // el código ya no sirve
    return { ok: true };
  }
  verificar(d);
  return { ok: true };
}
function panel(d) {
  var ven = verificar(d);
  var filas = productosMaestra(), pr = precios(ven.archivo, filas);
  sincronizarNombres(pr, filas);
  var prods = [];
  filas.forEach(function (f, i) {
    if (!String(f[0]).trim() || !codigo(f) || ['SÍ', 'SI'].indexOf(String(f[13]).toUpperCase().trim()) < 0) return;
    prods.push({ c: codigo(f), n: String(f[0]), p: pr.lista[i] || 0 });
  });
  var ped = SpreadsheetApp.openById(MAESTRA).getSheetByName('Pedidos').getDataRange().getValues();
  var mios = [];
  for (var j = ped.length - 1; j >= 1 && mios.length < 50; j--) {
    if (String(ped[j][2]) === String(ven.nombre)) mios.push({ num: ped[j][0], fecha: ped[j][1], det: ped[j][3], total: ped[j][6], desc: ped[j][5] });
  }
  return { ok: true, asesor: ven.nombre, desc2: pr.desc2, desc3: pr.desc3, productos: prods, pedidos: mios, ventas: ventasDe(ven) };
}
function guardarPrecios(d) {
  var ven = verificar(d);
  var filas = productosMaestra(), pr = precios(ven.archivo, filas);
  sincronizarNombres(pr, filas);
  var h = pr.hoja;
  if (d.desc2 !== undefined) h.getRange('B1').setValue(Math.max(0, Number(d.desc2) || 0));
  if (d.desc3 !== undefined) h.getRange('B2').setValue(Math.max(0, Number(d.desc3) || 0));
  (d.cambios || []).forEach(function (c) {
    var fila = pr.filaDe[String(c.c || '').toLowerCase()];
    if (!fila) return;
    var val = c.p === '' || c.p === null ? '' : Math.max(0, Math.round(Number(c.p) || 0));
    h.getRange(fila, 2).setValue(val);
  });
  CacheService.getScriptCache().remove('cat_' + String(d.v).toLowerCase());
  return { ok: true };
}

/* ---------- Revisión con fotos (solo lectura del inventario de Leal) ---------- */
function revision(d) {
  var ven = verificar(d);
  if (String(ven.nombre).toLowerCase() !== 'jairo') return { ok: false, error: 'Solo disponible para Jairo' };
  var inv = SpreadsheetApp.openById(DISTRY).getSheetByName('Inventario').getDataRange().getValues();
  var leal = [];
  for (var i = 1; i < inv.length; i++) {
    if (inv[i][0] === '') continue;
    leal.push({ n: String(inv[i][0]).replace(/[\u{1F300}-\u{1FAFF}\u{FE0F}\u{2600}-\u{27BF}]/gu, '').trim(),
                k: limpiar(inv[i][0]), q: Number(inv[i][3]) || 0, f: String(inv[i][4] || '') });
  }
  var cat = productosMaestra().filter(function (f) { return String(f[0]).trim(); }).map(function (f) {
    return { n: String(f[0]).trim(), img: String(f[11]), vis: ['SÍ', 'SI'].indexOf(String(f[13]).toUpperCase().trim()) >= 0,
             k: String(f[12] || '').split(/[+\/]/).map(limpiar).filter(String),
             alt: String(f[12] || '').indexOf('/') >= 0 };
  });
  var ss = SpreadsheetApp.openById(MAESTRA), noVan = [], cambio = [];
  var hn = ss.getSheetByName('No van en catálogo');
  if (hn && hn.getLastRow() > 1) hn.getRange(2, 1, hn.getLastRow() - 1, 1).getValues().forEach(function (r) { if (r[0] !== '') noVan.push(limpiar(r[0])); });
  var hf = ss.getSheetByName('Fotos de Leal');
  if (hf && hf.getLastRow() > 1) hf.getRange(2, 1, hf.getLastRow() - 1, 4).getValues().forEach(function (r) { if (String(r[3]).indexOf('Cambi') >= 0) cambio.push(limpiar(r[0])); });
  return { ok: true, leal: leal, cat: cat, noVan: noVan, cambio: cambio };
}

/* ---------- Clientes y recordatorios (desde 3-nov-2026) ----------
   Pestaña "Clientes" de la hoja maestra (se crea sola). Cada asesor anota sus ventas en su panel;
   unos 5 días antes de que se acabe el producto, el cliente sale en "Para escribir hoy". */
var CLIENTES = 'Clientes';
var CAB = ['Id', 'Fecha', 'Asesor', 'Cliente', 'WhatsApp', 'Producto', 'Código', 'Cantidad', 'Días que dura', 'Avisar desde', 'De dónde llegó', 'Estado', 'Último contacto'];
var ESTADOS = ['Pendiente', 'Le escribí', 'No quiere más', 'Volvió a comprar'];
function hojaClientes() {
  var ss = SpreadsheetApp.openById(MAESTRA), h = ss.getSheetByName(CLIENTES);
  if (!h) { h = ss.insertSheet(CLIENTES); h.appendRow(CAB); h.setFrozenRows(1); h.getRange('E:E').setNumberFormat('@'); }
  return h;
}
function ventasDe(ven) {
  var f = hojaClientes().getDataRange().getValues(), out = [];
  for (var i = f.length - 1; i >= 1 && out.length < 1000; i--) {
    if (String(f[i][2]) !== String(ven.nombre)) continue;
    out.push({ id: f[i][0], f: fechaNum(f[i][1]), c: String(f[i][3]), w: String(f[i][4]), n: String(f[i][5]),
               k: Number(f[i][7]) || 1, d: Number(f[i][8]) || 30, a: fechaNum(f[i][9]), o: String(f[i][10]),
               e: String(f[i][11] || 'Pendiente'), u: fechaNum(f[i][12]) });
  }
  return out;
}
function guardarVenta(d) {
  var ven = verificar(d);
  var w = String(d.w || '').replace(/\D/g, '');
  if (w.length === 10 && w.charAt(0) === '3') w = '57' + w;
  if (w.length < 11 || w.length > 15) return { ok: false, error: 'Revisa el número de WhatsApp (10 dígitos)' };
  var nom = String(d.c || '').trim().slice(0, 60), prod = String(d.n || '').trim().slice(0, 120);
  if (!nom) return { ok: false, error: 'Escribe el nombre del cliente' };
  if (!prod) return { ok: false, error: 'Escoge el producto' };
  var k = Math.max(1, Math.min(20, Math.floor(Number(d.k) || 1)));
  var dias = Math.max(5, Math.min(365, Math.floor(Number(d.d) || 30)));
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var h = hojaClientes(), f = h.getDataRange().getValues(), id = 0;
    for (var i = 1; i < f.length; i++) {
      id = Math.max(id, Number(f[i][0]) || 0);
      // Si el mismo cliente vuelve a comprar el mismo producto, el aviso anterior se cierra solo
      if (String(f[i][2]) === String(ven.nombre) && String(f[i][4]) === w && limpiar(f[i][5]) === limpiar(prod) &&
          ['Pendiente', 'Le escribí', ''].indexOf(String(f[i][11])) >= 0) h.getRange(i + 1, 12).setValue('Volvió a comprar');
    }
    var hoy = new Date(), av = new Date(hoy.getTime() + Math.max(1, dias * k - 5) * 864e5);
    h.appendRow([id + 1, hoy, ven.nombre, nom, w, prod, String(d.cod || ''), k, dias, av, String(d.o || '').slice(0, 40), 'Pendiente', '']);
    return { ok: true, ventas: ventasDe(ven) };
  } finally { lock.releaseLock(); }
}
function estadoVenta(d) {
  var ven = verificar(d), e = String(d.e || '');
  if (ESTADOS.indexOf(e) < 0) return { ok: false, error: 'Estado no válido' };
  var h = hojaClientes(), f = h.getDataRange().getValues();
  for (var i = 1; i < f.length; i++) {
    if (String(f[i][0]) === String(d.id) && String(f[i][2]) === String(ven.nombre)) {
      h.getRange(i + 1, 12, 1, 2).setValues([[e, new Date()]]);
      return { ok: true };
    }
  }
  return { ok: false, error: 'No encontré ese cliente' };
}

/* Ejecuta esta función una vez desde el editor para dar los permisos */
function probar() {
  Logger.log(JSON.stringify(catalogo('jairo')).slice(0, 500));
}
