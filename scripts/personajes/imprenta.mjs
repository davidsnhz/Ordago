/**
 * Recorte de la figura y «imprenta»: tonos planos, tinta y papel, grano, contorno de tinta y
 * sombra dura. Todo trabaja sobre lienzos { d: Buffer RGBA, w, h }.
 */
import sharp from 'sharp';

export const TINTA = [35, 25, 21];
export const PAPEL = [242, 232, 210];

export const suave = (a, b, t) => {
  const u = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return u * u * (3 - 2 * u);
};

// ——— Color: sRGB ⇄ Lab (D65) ———

const LINEAL = new Float64Array(256).map((_, i) => {
  const c = i / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
});
const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
const fInv = (t) => (t ** 3 > 0.008856 ? t ** 3 : (t - 16 / 116) / 7.787);
const gamma = (c) => {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(v * 255)));
};

export function aLab(r, g, b) {
  const R = LINEAL[r], G = LINEAL[g], B = LINEAL[b];
  const x = f((0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / 0.95047);
  const y = f(0.2126729 * R + 0.7151522 * G + 0.072175 * B);
  const z = f((0.0193339 * R + 0.119192 * G + 0.9503041 * B) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

export function aRgb(L, a, b) {
  const fy = (L + 16) / 116;
  const X = 0.95047 * fInv(fy + a / 500);
  const Y = fInv(fy);
  const Z = 1.08883 * fInv(fy - b / 200);
  return [
    gamma(3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z),
    gamma(-0.969266 * X + 1.8760108 * Y + 0.041556 * Z),
    gamma(0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z),
  ];
}

const LAB_TINTA = aLab(...TINTA);
const LAB_PAPEL = aLab(...PAPEL);

// ——— Recorte ———

const PASO = 11; // diferencia máxima entre dos píxeles vecinos del fondo
const DERIVA = 30; // diferencia máxima con el fondo que se trae desde el borde
const vecinos4 = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
const distancia = (d, i, r, g, b) => Math.hypot(d[i] - r, d[i + 1] - g, d[i + 2] - b);

/**
 * Quita el fondo gris de estudio de un recorte RGB. `k` es la ampliación de la hoja (los tamaños
 * mínimos crecen con ella). Devuelve RGBA del tamaño del recorte con solo la figura más grande.
 */
export function quitarFondo(rgb, w, h, borrar = [], k = 1) {
  const n = w * h;
  const fondo = new Uint8Array(n);
  const ref = new Float32Array(n * 3);
  const cola = new Int32Array(n);
  let ini = 0;
  let fin = 0;

  const borde = [];
  for (let x = 0; x < w; x++) borde.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) borde.push(y * w, y * w + w - 1);
  const mediana = [0, 1, 2].map((c) => {
    const v = borde.map((p) => rgb[p * 3 + c]).sort((a, b) => a - b);
    return v[v.length >> 1];
  });
  for (const p of borde) {
    if (fondo[p] || distancia(rgb, p * 3, ...mediana) > 45) continue;
    fondo[p] = 1;
    for (let c = 0; c < 3; c++) ref[p * 3 + c] = rgb[p * 3 + c];
    cola[fin++] = p;
  }
  while (ini < fin) {
    const p = cola[ini++];
    const px = p % w;
    const py = (p - px) / w;
    for (const [dx, dy] of vecinos4) {
      const qx = px + dx;
      const qy = py + dy;
      if (qx < 0 || qy < 0 || qx >= w || qy >= h) continue;
      const q = qy * w + qx;
      if (fondo[q]) continue;
      if (distancia(rgb, q * 3, rgb[p * 3], rgb[p * 3 + 1], rgb[p * 3 + 2]) >= PASO) continue;
      if (distancia(rgb, q * 3, ref[p * 3], ref[p * 3 + 1], ref[p * 3 + 2]) >= DERIVA) continue;
      fondo[q] = 1;
      for (let c = 0; c < 3; c++) ref[q * 3 + c] = ref[p * 3 + c] * 0.97 + rgb[q * 3 + c] * 0.03;
      cola[fin++] = q;
    }
  }

  // Color del fondo en cada punto: media por celdas, rellenando las celdas tapadas por la figura.
  const CELDA = 16 * k;
  const cw = Math.ceil(w / CELDA);
  const ch = Math.ceil(h / CELDA);
  const suma = new Float64Array(cw * ch * 3);
  const cuenta = new Float64Array(cw * ch);
  for (let p = 0; p < n; p++) {
    if (!fondo[p]) continue;
    const kk = Math.floor(p / w / CELDA) * cw + Math.floor((p % w) / CELDA);
    for (let c = 0; c < 3; c++) suma[kk * 3 + c] += rgb[p * 3 + c];
    cuenta[kk]++;
  }
  const celda = new Float64Array(cw * ch * 3);
  const llena = new Uint8Array(cw * ch);
  for (let kk = 0; kk < cw * ch; kk++)
    if (cuenta[kk] > 8) {
      for (let c = 0; c < 3; c++) celda[kk * 3 + c] = suma[kk * 3 + c] / cuenta[kk];
      llena[kk] = 1;
    }
  for (let vuelta = 0; vuelta < cw + ch && llena.includes(0); vuelta++) {
    const antes = llena.slice();
    for (let kk = 0; kk < cw * ch; kk++) {
      if (antes[kk]) continue;
      const kx = kk % cw;
      const ky = (kk - kx) / cw;
      let s0 = 0, s1 = 0, s2 = 0, m = 0;
      for (const [dx, dy] of vecinos4) {
        const jx = kx + dx;
        const jy = ky + dy;
        if (jx < 0 || jy < 0 || jx >= cw || jy >= ch || !antes[jy * cw + jx]) continue;
        const j = jy * cw + jx;
        s0 += celda[j * 3];
        s1 += celda[j * 3 + 1];
        s2 += celda[j * 3 + 2];
        m++;
      }
      if (!m) continue;
      celda[kk * 3] = s0 / m;
      celda[kk * 3 + 1] = s1 / m;
      celda[kk * 3 + 2] = s2 / m;
      llena[kk] = 1;
    }
  }
  const colorFondo = (x, y) => {
    const kk = Math.min(ch - 1, Math.floor(y / CELDA)) * cw + Math.min(cw - 1, Math.floor(x / CELDA));
    return [celda[kk * 3], celda[kk * 3 + 1], celda[kk * 3 + 2]];
  };

  // Huecos cerrados (entre el brazo y el cuerpo): zonas grises, más oscuras por la sombra de la
  // figura, que se parecen al fondo de alrededor.
  const esHueco = (q, qx, qy) => {
    const r = rgb[q * 3], g = rgb[q * 3 + 1], b = rgb[q * 3 + 2];
    return Math.max(r, g, b) - Math.min(r, g, b) < 14 && distancia(rgb, q * 3, ...colorFondo(qx, qy)) < 18;
  };
  const visto = new Uint8Array(n);
  const minimoHueco = 40 * k * k;
  for (let p = 0; p < n; p++) {
    if (fondo[p] || visto[p]) continue;
    const px = p % w;
    if (!esHueco(p, px, (p - px) / w)) continue;
    const zona = [p];
    visto[p] = 1;
    for (let i = 0; i < zona.length; i++) {
      const z = zona[i];
      const zx = z % w;
      const zy = (z - zx) / w;
      for (const [dx, dy] of vecinos4) {
        const qx = zx + dx;
        const qy = zy + dy;
        if (qx < 0 || qy < 0 || qx >= w || qy >= h) continue;
        const q = qy * w + qx;
        if (fondo[q] || visto[q] || !esHueco(q, qx, qy)) continue;
        visto[q] = 1;
        zona.push(q);
      }
    }
    if (zona.length >= minimoHueco) for (const z of zona) fondo[z] = 1;
  }

  for (const [bx, by, bw, bh] of borrar)
    for (let y = Math.max(0, by); y < Math.min(h, by + bh); y++) for (let x = Math.max(0, bx); x < Math.min(w, bx + bw); x++) fondo[y * w + x] = 1;

  // Se queda la figura más grande (fuera rótulos y trozos de las vecinas).
  const etiqueta = new Int32Array(n).fill(-1);
  let mayor = -1;
  let tamMayor = 0;
  for (let p = 0, id = 0; p < n; p++) {
    if (fondo[p] || etiqueta[p] >= 0) continue;
    const pila = [p];
    etiqueta[p] = id;
    let tam = 0;
    while (pila.length) {
      const z = pila.pop();
      tam++;
      const zx = z % w;
      const zy = (z - zx) / w;
      for (const [dx, dy] of vecinos4) {
        const qx = zx + dx;
        const qy = zy + dy;
        if (qx < 0 || qy < 0 || qx >= w || qy >= h) continue;
        const q = qy * w + qx;
        if (fondo[q] || etiqueta[q] >= 0) continue;
        etiqueta[q] = id;
        pila.push(q);
      }
    }
    if (tam > tamMayor) {
      tamMayor = tam;
      mayor = id;
    }
    id++;
  }

  // Borde suave y sin el gris del fondo mezclado.
  const rgba = Buffer.alloc(n * 4);
  for (let p = 0; p < n; p++) {
    if (etiqueta[p] !== mayor) continue;
    const px = p % w;
    const py = (p - px) / w;
    let alfa = 1;
    const enBorde = vecinos4.some(([dx, dy]) => {
      const qx = px + dx;
      const qy = py + dy;
      return qx < 0 || qy < 0 || qx >= w || qy >= h || etiqueta[qy * w + qx] !== mayor;
    });
    const bg = colorFondo(px, py);
    if (enBorde) alfa = Math.max(0.2, Math.min(1, distancia(rgb, p * 3, ...bg) / 34));
    for (let c = 0; c < 3; c++) {
      const v = (rgb[p * 3 + c] - (1 - alfa) * bg[c]) / alfa;
      rgba[p * 4 + c] = Math.max(0, Math.min(255, Math.round(v)));
    }
    rgba[p * 4 + 3] = Math.round(alfa * 255);
  }
  return rgba;
}

/** Arriba de la cabeza y pies de la figura recortada. */
export function medir(rgba, w, h, cabezaX, banda) {
  let arriba = -1;
  for (let y = 0; y < h && arriba < 0; y++)
    for (let x = Math.max(0, cabezaX - banda); x <= Math.min(w - 1, cabezaX + banda); x++)
      if (rgba[(y * w + x) * 4 + 3] > 128) {
        arriba = y;
        break;
      }
  let pies = 0;
  for (let p = 0; p < w * h; p++) if (rgba[p * 4 + 3] > 128) pies = Math.floor(p / w);
  return { arriba, pies, alto: pies - arriba, cortada: pies >= h - 2 };
}

// ——— Imprenta ———

/** Desenfoque con alfa premultiplicado, para no arrastrar el transparente hacia dentro. */
export async function suavizar(l, sigma) {
  const n = l.w * l.h;
  const pre = Buffer.alloc(n * 3);
  const alfa = Buffer.alloc(n);
  for (let p = 0; p < n; p++) {
    const a = l.d[p * 4 + 3];
    alfa[p] = a;
    for (let c = 0; c < 3; c++) pre[p * 3 + c] = Math.round((l.d[p * 4 + c] * a) / 255);
  }
  const preS = await sharp(pre, { raw: { width: l.w, height: l.h, channels: 3 } }).blur(sigma).raw().toBuffer();
  // sharp devuelve tres canales al desenfocar uno solo: se vuelve a sacar el primero.
  const alfaS = await sharp(alfa, { raw: { width: l.w, height: l.h, channels: 1 } }).blur(sigma).extractChannel(0).raw().toBuffer();
  for (let p = 0; p < n; p++) {
    if (!l.d[p * 4 + 3] || !alfaS[p]) continue;
    for (let c = 0; c < 3; c++) l.d[p * 4 + c] = Math.min(255, Math.round((preS[p * 3 + c] * 255) / alfaS[p]));
  }
}

/** Redondea el borde de la silueta y lo deja nítido. */
export async function alisarSilueta(l, sigma) {
  const n = l.w * l.h;
  const alfa = Buffer.alloc(n);
  for (let p = 0; p < n; p++) alfa[p] = l.d[p * 4 + 3];
  const s = await sharp(alfa, { raw: { width: l.w, height: l.h, channels: 1 } }).blur(sigma).extractChannel(0).raw().toBuffer();
  for (let p = 0; p < n; p++) l.d[p * 4 + 3] = Math.round(255 * suave(0.42, 0.58, s[p] / 255));
}

/** Quita las motas sueltas (restos de un retoque) que, si no, saldrían con su propio contorno. */
export function limpiarMotas(l, minimo) {
  const n = l.w * l.h;
  const visto = new Uint8Array(n);
  for (let p = 0; p < n; p++) {
    if (visto[p] || l.d[p * 4 + 3] <= 128) continue;
    const zona = [p];
    visto[p] = 1;
    for (let i = 0; i < zona.length && zona.length < minimo; i++) {
      const z = zona[i];
      const zx = z % l.w;
      const zy = (z - zx) / l.w;
      for (const [dx, dy] of vecinos4) {
        const qx = zx + dx;
        const qy = zy + dy;
        if (qx < 0 || qy < 0 || qx >= l.w || qy >= l.h) continue;
        const q = qy * l.w + qx;
        if (visto[q] || l.d[q * 4 + 3] <= 128) continue;
        visto[q] = 1;
        zona.push(q);
      }
    }
    if (zona.length < minimo) for (const z of zona) l.d[z * 4 + 3] = 0;
  }
}

const ruido = (x, y) => {
  const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return v - Math.floor(v) - 0.5;
};

/** Tonos planos (si `pasoTono` no es 0), rango de tinta a papel, color templado y grano. */
export function entintar(l, { pasoTono: paso, suavidadTono, color, calidez, grano }) {
  for (let p = 0; p < l.w * l.h; p++) {
    const i = p * 4;
    if (l.d[i + 3] === 0) continue;
    const [L, a, b] = aLab(l.d[i], l.d[i + 1], l.d[i + 2]);
    const t = paso ? L / paso : 0;
    const base = Math.floor(t);
    const Lq = paso ? Math.min(100, (base + suave(1 - suavidadTono, 1, t - base)) * paso) : L;
    const k = Lq / 100;
    const x = p % l.w;
    const y = (p - x) / l.w;
    const Lo = LAB_TINTA[0] + (LAB_PAPEL[0] - LAB_TINTA[0]) * k + ruido(x, y) * 2 * grano;
    const tA = LAB_TINTA[1] + (LAB_PAPEL[1] - LAB_TINTA[1]) * k;
    const tB = LAB_TINTA[2] + (LAB_PAPEL[2] - LAB_TINTA[2]) * k;
    const [r, g, bb] = aRgb(Lo, a * color + tA * calidez, b * color + tB * calidez);
    l.d[i] = r;
    l.d[i + 1] = g;
    l.d[i + 2] = bb;
  }
}

/**
 * Contorno de tinta y sombra dura debajo de la figura. Devuelve un lienzo de `lado` × `alto`
 * (el sobrante de abajo se recorta: así el corte de la figura no lleva contorno; por debajo del
 * lienzo, la figura se da por seguida).
 */
export function contornear(l, lado, contorno, sombra, alto = lado) {
  const { w: W, h: H } = l;
  const r = contorno;
  const R = r + 1;
  const dentro = new Uint8Array(W * H);
  for (let p = 0; p < W * H; p++) dentro[p] = l.d[p * 4 + 3] > 128 ? 1 : 0;
  const desplazamientos = [];
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) if (Math.hypot(dx, dy) <= R) desplazamientos.push([dx, dy, Math.hypot(dx, dy)]);
  desplazamientos.sort((a, b) => a[2] - b[2]);

  const silueta = new Float32Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const p = y * W + x;
      if (dentro[p]) {
        silueta[p] = 1;
        continue;
      }
      for (const [dx, dy, d] of desplazamientos) {
        const qx = x + dx;
        const qy = y + dy;
        const hay = qy >= H ? qx >= 0 && qx < W && dentro[(H - 1) * W + qx] : qx >= 0 && qy >= 0 && qx < W && dentro[qy * W + qx];
        if (hay) {
          silueta[p] = Math.max(0, Math.min(1, r + 0.5 - d));
          break;
        }
      }
    }

  const s = sombra;
  const salida = Buffer.alloc(lado * alto * 4);
  for (let y = 0; y < alto; y++)
    for (let x = 0; x < lado; x++) {
      const p = y * W + x;
      const o = (y * lado + x) * 4;
      const sombraAqui = x >= s && y >= s ? silueta[(y - s) * W + (x - s)] : 0;
      const tinta = Math.max(silueta[p], sombraAqui);
      const af = l.d[p * 4 + 3] / 255;
      const a = af + tinta * (1 - af);
      if (a <= 0) continue;
      for (let c = 0; c < 3; c++) salida[o + c] = Math.round((l.d[p * 4 + c] * af + TINTA[c] * tinta * (1 - af)) / a);
      salida[o + 3] = Math.round(a * 255);
    }
  return { d: salida, w: lado, h: alto };
}
