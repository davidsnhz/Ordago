/**
 * Retoques pintados sobre un fotograma ya encuadrado, antes de la imprenta (así lo pintado sale
 * con los mismos tonos planos, grano y contorno que el resto). Coordenadas en píxeles del
 * fotograma. Cada retoque es un objeto con `tipo`:
 *
 *  - parpado   { ojo: [cx, cy, rx, ry, giro], cierre: 0–1, piel?: [x, y] }
 *                Baja el párpado de arriba: 0 abierto, 0,5 a medias, 1 cerrado (con la línea de
 *                las pestañas curvada hacia abajo).
 *  - mirada    { ojo: [cx, cy, rx, ry, giro], iris: [x, y, radio], hacia: [dx, dy] }
 *                Repinta el blanco del ojo y mueve el iris.
 *  - girar     { pivote: [x, y], zona: [x, y, radio], angulo }
 *                Gira la cabeza (o lo que haya en la zona) alrededor del cuello, deformando
 *                suavemente hacia fuera para que no se vea el corte.
 *  - arrastrar { desde: [x, y], hasta: [x, y], radio }
 *                Lleva una parte (una mano) de un sitio a otro deformando lo de alrededor.
 *  - mover     { zona: [[x, y], …], d: [dx, dy], giro?, centro?, relleno?: svg }
 *                Recorta una zona (el sombrero), la mueve y la gira; `relleno` se pinta debajo
 *                de lo que queda al descubierto (el pelo de debajo del sombrero).
 *  - dibujo    { svg, debajo?, excepto?: [[x, y], …], d?: [dx, dy] }
 *                Pinta formas SVG encima (o debajo) de la figura: la vara, el diente de oro.
 *                `excepto` es una zona que queda por encima de lo dibujado (los dedos que
 *                agarran la vara); `d` mueve el dibujo.
 *  - desplazar { d: [dx, dy] }
 *                Mueve la figura entera.
 *  - acercar   { centro: [x, y], factor }
 *                Agranda la figura alrededor de un punto: el rival se inclina hacia ti.
 *  - plantilla { nombre, d? }
 *                Aplica una lista de retoques guardada en `plantillas` del personaje (con `d`,
 *                sus dibujos se mueven).
 */
import sharp from 'sharp';

const copia = (l) => ({ d: Buffer.from(l.d), w: l.w, h: l.h });

/** Muestra bilineal RGBA (fuera del lienzo, transparente). */
function muestra(l, x, y, sal, o) {
  const x0 = Math.floor(x - 0.5);
  const y0 = Math.floor(y - 0.5);
  const fx = x - 0.5 - x0;
  const fy = y - 0.5 - y0;
  let r = 0, g = 0, b = 0, a = 0;
  for (const [dx, dy, peso] of [
    [0, 0, (1 - fx) * (1 - fy)],
    [1, 0, fx * (1 - fy)],
    [0, 1, (1 - fx) * fy],
    [1, 1, fx * fy],
  ]) {
    const px = x0 + dx;
    const py = y0 + dy;
    if (px < 0 || py < 0 || px >= l.w || py >= l.h || peso === 0) continue;
    const i = (py * l.w + px) * 4;
    const pa = (l.d[i + 3] / 255) * peso;
    r += l.d[i] * pa;
    g += l.d[i + 1] * pa;
    b += l.d[i + 2] * pa;
    a += pa;
  }
  if (a > 0) {
    sal[o] = Math.round(r / a);
    sal[o + 1] = Math.round(g / a);
    sal[o + 2] = Math.round(b / a);
  }
  sal[o + 3] = Math.round(a * 255);
}

/** Color medio de los píxeles opacos de un cuadrado. */
function media(l, x, y, radio) {
  let r = 0, g = 0, b = 0, n = 0;
  for (let py = Math.round(y - radio); py <= Math.round(y + radio); py++)
    for (let px = Math.round(x - radio); px <= Math.round(x + radio); px++) {
      if (px < 0 || py < 0 || px >= l.w || py >= l.h) continue;
      const i = (py * l.w + px) * 4;
      if (l.d[i + 3] < 200) continue;
      r += l.d[i];
      g += l.d[i + 1];
      b += l.d[i + 2];
      n++;
    }
  return n ? [r / n, g / n, b / n] : [0, 0, 0];
}

function mezclar(l, i, color, cobertura) {
  if (cobertura <= 0) return;
  for (let c = 0; c < 3; c++) l.d[i + c] = Math.round(l.d[i + c] * (1 - cobertura) + color[c] * cobertura);
}

/** Recorre el ojo en coordenadas propias: u, v de −1 a 1 dentro de la elipse. */
function recorrerOjo([cx, cy, rx, ry, giro = 0], margen, fn) {
  const cos = Math.cos((giro * Math.PI) / 180);
  const sin = Math.sin((giro * Math.PI) / 180);
  const m = Math.max(rx, ry) + margen;
  for (let y = Math.floor(cy - m); y <= Math.ceil(cy + m); y++)
    for (let x = Math.floor(cx - m); x <= Math.ceil(cx + m); x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const lx = dx * cos + dy * sin;
      const ly = -dx * sin + dy * cos;
      fn(x, y, lx / rx, ly / ry);
    }
  return { cos, sin };
}

/**
 * Párpado de arriba. La piel se rellena con la de alrededor del ojo (media ponderada de un anillo
 * de muestras, sin las oscuras de cejas y contornos), de modo que el parche no se nota; la elipse
 * se agranda un poco para tapar también el contorno original del ojo.
 */
function parpado(l, { ojo, cierre, pestana = 3.6, colorPestana = [48, 31, 26], agrandar = 1.2 }) {
  const [cx, cy, rx0, ry0, giro = 0] = ojo;
  const rx = rx0 * agrandar;
  const ry = ry0 * agrandar;
  const cos = Math.cos((giro * Math.PI) / 180);
  const sin = Math.sin((giro * Math.PI) / 180);
  const aGlobal = (u, v) => [cx + u * rx * cos - v * ry * sin, cy + u * rx * sin + v * ry * cos];
  // Anillo de piel alrededor del ojo.
  let anillo = [];
  for (let k = 0; k < 48; k++) {
    const a = (k / 48) * 2 * Math.PI;
    const [x, y] = aGlobal(1.25 * Math.cos(a), 1.35 * Math.sin(a));
    const c = media(l, x, y, 1.5);
    anillo.push({ x, y, c, luz: c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11 });
  }
  const luces = anillo.map((m) => m.luz).sort((a, b) => a - b);
  const mediana = luces[luces.length >> 1];
  anillo = anillo.filter((m) => m.luz >= mediana - 12 && m.luz > 40);
  const pielEn = (x, y) => {
    let r = 0, g = 0, b = 0, peso = 0;
    for (const m of anillo) {
      const w = 1 / ((m.x - x) ** 2 + (m.y - y) ** 2 + 4) ** 1.5;
      r += m.c[0] * w;
      g += m.c[1] * w;
      b += m.c[2] * w;
      peso += w;
    }
    return [r / peso, g / peso, b / peso];
  };
  const menor = Math.min(rx, ry);
  recorrerOjo([cx, cy, rx, ry, giro], pestana + 3, (x, y, u, v) => {
    if (x < 0 || y < 0 || x >= l.w || y >= l.h || Math.abs(u) > 1.15) return;
    const i = (y * l.w + x) * 4;
    const s2 = Math.sqrt(Math.max(0, 1 - u * u));
    const borde = s2 * (2 * cierre - 1);
    // 1 dentro de la elipse, 0 fuera, con un borde suave de 3 px para que el parche se funda.
    const dentro = suaveInv(-1.5, 1.5, (1 - Math.hypot(u, v)) * menor);
    const arriba = Math.max(0, Math.min(1, (borde - v) * ry + 0.5));
    // El párpado se oscurece un poco hacia las pestañas, como un pliegue.
    const t = Math.max(0, Math.min(1, (borde - v) * ry / 6));
    const sombra = 0.9 + 0.1 * t;
    mezclar(l, i, pielEn(x, y).map((c) => c * sombra), dentro * arriba);
    // Pestañas: una línea a lo largo del borde del párpado, algo más fina en las puntas.
    const grosor = pestana * (0.55 + 0.45 * s2);
    const linea = Math.max(0, Math.min(1, grosor / 2 - Math.abs(v - borde) * ry + 0.5));
    const extremos = Math.max(0, Math.min(1, (1.02 - Math.abs(u)) * rx * 0.5 + 0.5));
    mezclar(l, i, colorPestana, linea * extremos);
  });
}

function mirada(l, { ojo, iris: [ix, iy, ir], hacia: [hx, hy], blanco }) {
  const original = copia(l);
  // El blanco del ojo: lo más claro de dentro de la elipse.
  let colorBlanco = blanco;
  if (!colorBlanco) {
    const claros = [];
    recorrerOjo(ojo, 0, (x, y, u, v) => {
      if (u * u + v * v > 0.8 || x < 0 || y < 0 || x >= l.w || y >= l.h) return;
      const i = (y * l.w + x) * 4;
      claros.push([l.d[i], l.d[i + 1], l.d[i + 2], l.d[i] + l.d[i + 1] + l.d[i + 2]]);
    });
    claros.sort((a, b) => b[3] - a[3]);
    const top = claros.slice(0, Math.max(1, Math.floor(claros.length * 0.15)));
    colorBlanco = [0, 1, 2].map((c) => top.reduce((s, p) => s + p[c], 0) / top.length);
  }
  const [, , rx, ry] = ojo;
  const menor = Math.min(rx, ry);
  recorrerOjo(ojo, 1, (x, y, u, v) => {
    if (x < 0 || y < 0 || x >= l.w || y >= l.h) return;
    const i = (y * l.w + x) * 4;
    const dentro = Math.max(0, Math.min(1, (1 - Math.hypot(u, v)) * menor + 0.5));
    if (!dentro) return;
    // El párpado de arriba sombrea el blanco.
    const sombra = 0.8 + 0.2 * Math.max(0, Math.min(1, (v + 1) / 0.9));
    mezclar(l, i, colorBlanco.map((c) => c * sombra), dentro);
    // El iris, traído de su sitio original.
    const ox = x + 0.5 - hx;
    const oy = y + 0.5 - hy;
    const enIris = Math.max(0, Math.min(1, ir - Math.hypot(ox - ix, oy - iy) + 0.5));
    if (!enIris) return;
    const tmp = Buffer.alloc(4);
    muestra(original, ox, oy, tmp, 0);
    mezclar(l, i, [tmp[0], tmp[1], tmp[2]], enIris * dentro);
  });
}

function girar(l, { pivote: [px, py], zona: [zx, zy, radio], angulo }) {
  const original = copia(l);
  const m = radio * 1.05;
  for (let y = Math.max(0, Math.floor(zy - m)); y < Math.min(l.h, Math.ceil(zy + m)); y++)
    for (let x = Math.max(0, Math.floor(zx - m)); x < Math.min(l.w, Math.ceil(zx + m)); x++) {
      const peso = suaveInv(radio, radio * 0.55, Math.hypot(x + 0.5 - zx, y + 0.5 - zy));
      if (peso <= 0) continue;
      const a = (-angulo * peso * Math.PI) / 180;
      const dx = x + 0.5 - px;
      const dy = y + 0.5 - py;
      muestra(original, px + dx * Math.cos(a) - dy * Math.sin(a), py + dx * Math.sin(a) + dy * Math.cos(a), l.d, (y * l.w + x) * 4);
    }
}

/** 1 a distancia ≤ `dentro`, 0 a distancia ≥ `fuera`, suave entre medias. */
function suaveInv(fuera, dentro, d) {
  const u = Math.max(0, Math.min(1, (fuera - d) / (fuera - dentro)));
  return u * u * (3 - 2 * u);
}

function arrastrar(l, { desde: [ax, ay], hasta: [bx, by], radio }) {
  const original = copia(l);
  const dx = bx - ax;
  const dy = by - ay;
  const largo2 = dx * dx + dy * dy || 1;
  const x0 = Math.max(0, Math.floor(Math.min(ax, bx) - radio));
  const x1 = Math.min(l.w, Math.ceil(Math.max(ax, bx) + radio));
  const y0 = Math.max(0, Math.floor(Math.min(ay, by) - radio));
  const y1 = Math.min(l.h, Math.ceil(Math.max(ay, by) + radio));
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      // Distancia al tramo que recorre la parte: todo lo que está cerca se mueve con ella.
      const t = Math.max(0, Math.min(1, ((x + 0.5 - ax) * dx + (y + 0.5 - ay) * dy) / largo2));
      const d = Math.hypot(x + 0.5 - (ax + t * dx), y + 0.5 - (ay + t * dy));
      const peso = suaveInv(radio, radio * 0.35, d);
      if (peso <= 0) continue;
      muestra(original, x + 0.5 - dx * peso, y + 0.5 - dy * peso, l.d, (y * l.w + x) * 4);
    }
}

function dentroPoligono(x, y, puntos) {
  let dentro = false;
  for (let i = 0, j = puntos.length - 1; i < puntos.length; j = i++) {
    const [xi, yi] = puntos[i];
    const [xj, yj] = puntos[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}

async function mover(l, { zona, d: [mx, my], giro = 0, centro, relleno }) {
  const original = copia(l);
  // Máscara de la zona, con el borde suavizado.
  const mascara = mascaraPoligono(l.w, l.h, zona);
  const xs = zona.map((p) => p[0]);
  const ys = zona.map((p) => p[1]);
  const bx0 = Math.max(0, Math.floor(Math.min(...xs)));
  const bx1 = Math.min(l.w, Math.ceil(Math.max(...xs)));
  const by0 = Math.max(0, Math.floor(Math.min(...ys)));
  const by1 = Math.min(l.h, Math.ceil(Math.max(...ys)));
  // Se quita la zona de su sitio…
  for (let p = 0; p < l.w * l.h; p++) if (mascara[p]) l.d[p * 4 + 3] = Math.round(l.d[p * 4 + 3] * (1 - mascara[p]));
  // …se pinta lo que había debajo…
  if (relleno) await dibujo(l, { svg: relleno, debajo: true });
  // …y se vuelve a poner movida y girada.
  const [cx, cy] = centro ?? [(bx0 + bx1) / 2, (by0 + by1) / 2];
  const a = (-giro * Math.PI) / 180;
  const pieza = Buffer.alloc(4);
  const margen = Math.hypot(bx1 - bx0, by1 - by0);
  for (let y = Math.max(0, Math.floor(by0 + my - margen / 2)); y < Math.min(l.h, Math.ceil(by1 + my + margen / 2)); y++)
    for (let x = Math.max(0, Math.floor(bx0 + mx - margen / 2)); x < Math.min(l.w, Math.ceil(bx1 + mx + margen / 2)); x++) {
      // Del punto de destino al de origen: se deshace el giro y el desplazamiento.
      const dx = x + 0.5 - mx - cx;
      const dy = y + 0.5 - my - cy;
      const ox = cx + dx * Math.cos(a) - dy * Math.sin(a);
      const oy = cy + dx * Math.sin(a) + dy * Math.cos(a);
      const oxi = Math.floor(ox);
      const oyi = Math.floor(oy);
      if (oxi < 0 || oyi < 0 || oxi >= l.w || oyi >= l.h) continue;
      const m = mascara[oyi * l.w + oxi];
      if (!m) continue;
      muestra(original, ox, oy, pieza, 0);
      const af = (pieza[3] / 255) * m;
      const i = (y * l.w + x) * 4;
      const ab = l.d[i + 3] / 255;
      const a2 = af + ab * (1 - af);
      if (a2 <= 0) continue;
      for (let c = 0; c < 3; c++) l.d[i + c] = Math.round((pieza[c] * af + l.d[i + c] * ab * (1 - af)) / a2);
      l.d[i + 3] = Math.round(a2 * 255);
    }
}

function mascaraPoligono(w, h, zona) {
  const mascara = new Float32Array(w * h);
  const xs = zona.map((p) => p[0]);
  const ys = zona.map((p) => p[1]);
  for (let y = Math.max(0, Math.floor(Math.min(...ys))); y < Math.min(h, Math.ceil(Math.max(...ys))); y++)
    for (let x = Math.max(0, Math.floor(Math.min(...xs))); x < Math.min(w, Math.ceil(Math.max(...xs))); x++) {
      let n = 0;
      for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) if (dentroPoligono(x + (sx + 0.5) / 4, y + (sy + 0.5) / 4, zona)) n++;
      mascara[y * w + x] = n / 16;
    }
  return mascara;
}

async function dibujo(l, { svg, debajo = false, excepto, d }) {
  const contenido = d ? `<g transform="translate(${d[0]},${d[1]})">${svg}</g>` : svg;
  let capa = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${l.w}" height="${l.h}">${contenido}</svg>`)).ensureAlpha().raw().toBuffer();
  if (excepto) {
    const mascara = mascaraPoligono(l.w, l.h, excepto);
    for (let p = 0; p < l.w * l.h; p++) if (mascara[p]) capa[p * 4 + 3] = Math.round(capa[p * 4 + 3] * (1 - mascara[p]));
  }
  const salida = await sharp(l.d, { raw: { width: l.w, height: l.h, channels: 4 } })
    .composite([{ input: capa, raw: { width: l.w, height: l.h, channels: 4 }, blend: debajo ? 'dest-over' : 'over' }])
    .raw()
    .toBuffer();
  salida.copy(l.d);
}

function acercar(l, { centro: [cx, cy], factor }) {
  const original = copia(l);
  for (let y = 0; y < l.h; y++)
    for (let x = 0; x < l.w; x++) muestra(original, cx + (x + 0.5 - cx) / factor, cy + (y + 0.5 - cy) / factor, l.d, (y * l.w + x) * 4);
}

function desplazar(l, { d: [dx, dy] }) {
  const original = copia(l);
  l.d.fill(0);
  for (let y = 0; y < l.h; y++)
    for (let x = 0; x < l.w; x++) {
      const ox = x - dx;
      const oy = y - dy;
      if (ox < 0 || oy < 0 || ox >= l.w || oy >= l.h) continue;
      original.d.copy(l.d, (y * l.w + x) * 4, (oy * l.w + ox) * 4, (oy * l.w + ox) * 4 + 4);
    }
}

const RETOQUES = { parpado, mirada, girar, arrastrar, mover, dibujo, desplazar, acercar };

export async function retocar(l, retoques = [], plantillas = {}) {
  for (const r of retoques) {
    if (r.tipo === 'plantilla') {
      const lista = plantillas[r.nombre];
      if (!lista) throw new Error(`Plantilla desconocida: ${r.nombre}`);
      await retocar(l, r.d ? lista.map((x) => (x.tipo === 'dibujo' ? { ...x, d: r.d } : x)) : lista, plantillas);
      continue;
    }
    const fn = RETOQUES[r.tipo];
    if (!fn) throw new Error(`Retoque desconocido: ${r.tipo}`);
    await fn(l, r);
  }
}
