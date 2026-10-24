/**
 * Prepara el arte de los rivales para el juego: lo «pasa por la imprenta».
 *
 * Lee los dibujos de assets/personajes/<id>/ y las indicaciones de assets/personajes/personajes.json,
 * y escribe en public/arte/personajes/<id>/ los fotogramas, su manifiesto.json y el indice.json que
 * lee el retrato (src/ui/componentes/Retrato.tsx).
 *
 * Los personajes de ahora llegan con **una imagen por pose** (`imagenes`: nombre de la animación →
 * archivo), con el fondo transparente y todas con el mismo encuadre. Cada una se corta por la fila
 * `corte` (lo de debajo lo tapa el acta), se ajusta al ancho del fotograma (`fotograma`, en px de
 * pantalla; si llega más apaisada, solo el tramo `encuadre`), se apoya abajo y pasa por una
 * imprenta ligera: tinta en lugar de negro y papel en lugar de blanco, color templado, grano
 * suave, contorno de tinta de 3 px y sombra dura de 4 px.
 *
 * Los de antes venían en hojas con todas las poses (hoja.webp, y hoja_x4.webp ampliada), y cada
 * fotograma salía de una de dos maneras:
 *  - `recorte`: se recorta una figura de la hoja (quitando el fondo gris de estudio) y se
 *    encuadra de cintura para arriba, con la cabeza siempre en el mismo sitio. Los tics se
 *    escalan por la altura de la figura (cabeza a pies) para que encajen con el reposo.
 *  - `base: "reposo"`: se parte del reposo y se le aplican retoques pintados (párpados, mirada,
 *    giro de cabeza, mover el sombrero, dibujar la vara…; ver personajes/retoques.mjs).
 * Una animación puede tener varios `fotogramas` (cada uno con sus retoques) y sus `fps`.
 * Después, la imprenta (personajes/imprenta.mjs): tonos planos, tinta en lugar de negro y papel
 * en lugar de blanco, color templado, grano, contorno de tinta de 3 px y sombra dura de 4 px.
 *
 * Uso: npm run personajes
 *      npm run personajes -- --solo fulgencio --crudo carpeta   (fotogramas sin imprenta, con regla)
 *      npm run personajes -- --muestra hoja.png                  (todo junto, para revisar)
 *
 * hoja_x4.webp es la hoja ampliada ×4 con Real-ESRGAN (modelo realesrgan-x4plus-anime):
 *   realesrgan-ncnn-vulkan -i hoja.png -o hoja_x4.png -n realesrgan-x4plus-anime
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { alisarSilueta, contornear, entintar, limpiarMotas, medir, quitarFondo, suavizar, suave } from './personajes/imprenta.mjs';
import { retocar } from './personajes/retoques.mjs';

const ORIGEN = 'assets/personajes';
const DESTINO = 'public/arte/personajes';

const config = JSON.parse(fs.readFileSync(path.join(ORIGEN, 'personajes.json'), 'utf8'));
const MARCO = config.marco;
const LADO = MARCO.lado;
const PPP = MARCO.pixelesPorPunto;
/** Se pinta más alto de lo que se ve para que el corte de abajo no lleve contorno. */
const ALTO = LADO + 20 * PPP;

const IMPRENTA = {
  contorno: 3 * PPP,
  sombra: 4 * PPP,
  /** Salto entre tonos planos, en luminosidad (0–100). */
  pasoTono: 12,
  /** Anchura de la transición entre dos tonos (fracción del salto): evita bordes dentados. */
  suavidadTono: 0.35,
  /** Cuánto se conserva del color (1 = igual). */
  color: 0.9,
  /** Cuánto se tiñe hacia la tinta en las sombras y hacia el papel en las luces. */
  calidez: 0.5,
  /** Suavizado antes de los tonos planos cuando se amplía, en píxeles de la hoja. */
  suavizado: 0.35,
  /** Redondeo del borde de la silueta, en píxeles de la hoja (mínimo, en píxeles del fotograma). */
  alisado: { porPixel: 0.5, minimo: 0.8 },
  /** Grano de impresión, en luminosidad. */
  grano: 2.4,
};

/** Imprenta de los dibujos que ya llegan planos y con contorno: sin tonos planos y con poco grano. */
const IMPRENTA_IMAGENES = {
  ...IMPRENTA,
  pasoTono: 0,
  color: 0.95,
  calidez: 0.3,
  grano: 1.2,
  /** Opacidad con la que llega la figura (las WebP con pérdida la dejan en 252–253): pasa a 255. */
  alfaPleno: 250,
};

const args = process.argv.slice(2);
const opcion = (nombre) => (args.includes(nombre) ? args[args.indexOf(nombre) + 1] : null);
const soloId = opcion('--solo');
const carpetaCruda = opcion('--crudo');
const archivoMuestra = opcion('--muestra');

const nuevoLienzo = () => ({ d: Buffer.alloc(LADO * ALTO * 4), w: LADO, h: ALTO });
const copiar = (l) => ({ d: Buffer.from(l.d), w: l.w, h: l.h });

/** La hoja de un personaje y cuántas veces es más grande la ampliada (las coordenadas van en la original). */
async function abrirHoja(id) {
  const original = path.join(ORIGEN, id, 'hoja.webp');
  const ampliada = path.join(ORIGEN, id, 'hoja_x4.webp');
  if (!fs.existsSync(ampliada)) return { original, hoja: original, k: 1 };
  const [a, b] = await Promise.all([sharp(original).metadata(), sharp(ampliada).metadata()]);
  return { original, hoja: ampliada, k: Math.round(b.width / a.width) };
}

/**
 * Recorta una figura. La silueta se saca de la hoja original (la ampliada tiene halos claros
 * alrededor de los bordes que se confundirían con la figura) y se amplía para recortar la nítida.
 */
async function recortar({ original, hoja, k }, fuente) {
  const [x, y, w, h] = fuente.recorte;
  const rgb = await sharp(original).extract({ left: x, top: y, width: w, height: h }).removeAlpha().raw().toBuffer();
  const borrar = (fuente.borrar ?? []).map(([bx, by, bw, bh]) => [bx - x, by - y, bw, bh]);
  const rgba = quitarFondo(rgb, w, h, borrar);
  const medida = medir(rgba, w, h, fuente.cabeza - x, 10);
  if (k === 1) return { rgba, w, h, x, y, k, medida };

  const alfa = Buffer.alloc(w * h);
  for (let p = 0; p < w * h; p++) alfa[p] = rgba[p * 4 + 3];
  // Ampliada y encogida medio píxel de la original: el halo claro del borde queda fuera y lo tapa el contorno.
  const alfaK = await sharp(alfa, { raw: { width: w, height: h, channels: 1 } })
    .resize(w * k, h * k, { kernel: 'lanczos3', fit: 'fill' })
    .blur(k * 0.6)
    .extractChannel(0)
    .raw()
    .toBuffer();
  for (let p = 0; p < alfaK.length; p++) alfaK[p] = Math.round(255 * suave(0.72, 0.92, alfaK[p] / 255));
  const rgbK = await sharp(hoja).extract({ left: x * k, top: y * k, width: w * k, height: h * k }).removeAlpha().raw().toBuffer();
  const rgbaK = Buffer.alloc(w * k * h * k * 4);
  for (let p = 0; p < w * k * h * k; p++) {
    rgbaK[p * 4] = rgbK[p * 3];
    rgbaK[p * 4 + 1] = rgbK[p * 3 + 1];
    rgbaK[p * 4 + 2] = rgbK[p * 3 + 2];
    rgbaK[p * 4 + 3] = alfaK[p];
  }
  const enK = { arriba: medida.arriba * k, pies: medida.pies * k, alto: medida.alto * k, cortada: medida.cortada };
  return { rgba: rgbaK, w: w * k, h: h * k, x: x * k, y: y * k, k, medida: enK };
}

/** Coloca la figura en el fotograma: la cabeza en MARCO.cabeza, a la escala pedida. */
async function encuadrar(fig, fuente, escala) {
  const [ajX, ajY] = fuente.ajuste ?? [0, 0];
  const s = (escala * (fuente.escala ?? 1)) / fig.k;
  const ancho = Math.max(1, Math.round(fig.w * s));
  const alto = Math.max(1, Math.round(fig.h * s));
  const escalada = await sharp(fig.rgba, { raw: { width: fig.w, height: fig.h, channels: 4 } })
    .resize(ancho, alto, { kernel: 'lanczos3', fit: 'fill' })
    .raw()
    .toBuffer();
  const izq = Math.round(MARCO.cabeza[0] - (fuente.cabeza * fig.k - fig.x) * s + ajX);
  const arr = Math.round(MARCO.cabeza[1] - fig.medida.arriba * s + ajY);
  const l = nuevoLienzo();
  for (let y = 0; y < alto; y++) {
    const ly = arr + y;
    if (ly < 0 || ly >= ALTO) continue;
    for (let x = 0; x < ancho; x++) {
      const lx = izq + x;
      if (lx < 0 || lx >= LADO) continue;
      escalada.copy(l.d, (ly * LADO + lx) * 4, (y * ancho + x) * 4, (y * ancho + x) * 4 + 4);
    }
  }
  return { lienzo: l, ampliacion: s };
}

async function imprimir(crudo, ampliacion) {
  const l = copiar(crudo);
  if (IMPRENTA.suavizado * ampliacion > 0.45) await suavizar(l, IMPRENTA.suavizado * ampliacion);
  await alisarSilueta(l, Math.max(IMPRENTA.alisado.minimo, IMPRENTA.alisado.porPixel * ampliacion));
  limpiarMotas(l, 150);
  entintar(l, IMPRENTA);
  return contornear(l, LADO, IMPRENTA.contorno, IMPRENTA.sombra);
}

const aWebp = (l) => sharp(l.d, { raw: { width: l.w, height: l.h, channels: 4 } }).webp({ quality: 82, alphaQuality: 90, effort: 6 });

/** El fotograma sin imprenta, sobre gris y con una regla cada 20 px, para medir retoques. */
async function guardarCrudo(l, archivo) {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${l.w}" height="${l.h}">`;
  for (let v = 0; v < Math.max(l.w, l.h); v += 20) {
    const fuerte = v % 100 === 0;
    svg += `<line x1="${v}" y1="0" x2="${v}" y2="${l.h}" stroke="#0f0" stroke-opacity="${fuerte ? 0.45 : 0.12}"/>`;
    svg += `<line x1="0" y1="${v}" x2="${l.w}" y2="${v}" stroke="#0f0" stroke-opacity="${fuerte ? 0.45 : 0.12}"/>`;
    if (fuerte) svg += `<text x="${v + 2}" y="12" fill="#0f0" font-size="12">${v}</text><text x="2" y="${v - 2}" fill="#0f0" font-size="12">${v}</text>`;
  }
  svg += '</svg>';
  await sharp(l.d, { raw: { width: l.w, height: l.h, channels: 4 } })
    .flatten({ background: '#6b6b6b' })
    .composite([{ input: Buffer.from(svg) }])
    .png()
    .toFile(archivo);
}

async function prepararPersonaje(id, def) {
  const carpeta = path.join(DESTINO, id);
  fs.rmSync(carpeta, { recursive: true, force: true });
  fs.mkdirSync(carpeta, { recursive: true });
  const hoja = await abrirHoja(id);

  const figReposo = await recortar(hoja, def.reposo);
  const { lienzo: figura, ampliacion: ampReposo } = await encuadrar(figReposo, def.reposo, MARCO.escala);
  const plantillas = def.plantillas ?? {};
  const reposo = copiar(figura);
  await retocar(reposo, def.reposo.retoques, plantillas);

  const fotogramas = {};
  const animaciones = {};
  const escribir = async (nombre, crudo, amp) => {
    if (carpetaCruda) await guardarCrudo(crudo, path.join(carpetaCruda, `${id}_${nombre}.png`));
    const impreso = await imprimir(crudo, amp);
    fotogramas[nombre] = impreso;
    await aWebp(impreso).toFile(path.join(carpeta, `${nombre}.webp`));
    return `${nombre}.webp`;
  };

  await escribir('reposo', reposo, ampReposo);
  animaciones.reposo = { tipo: 'secuencia', archivos: ['reposo.webp'], fps: 1, bucle: true };

  for (const [nombre, anim] of Object.entries(def.animaciones ?? {})) {
    const efecto = anim.efecto ? { efecto: anim.efecto, x: +(anim.punto[0] / LADO).toFixed(3), y: +(anim.punto[1] / LADO).toFixed(3) } : null;
    if (efecto && !anim.base && !anim.recorte) {
      animaciones[nombre] = { tipo: 'efecto', ...efecto };
      continue;
    }
    let base;
    let amp = ampReposo;
    if (anim.recorte) {
      const fig = await recortar(hoja, anim);
      if (fig.medida.cortada) console.warn(`  ${id}/${nombre}: el recorte corta los pies; la escala puede salir mal.`);
      const r = await encuadrar(fig, anim, MARCO.escala * (figReposo.medida.alto / fig.medida.alto));
      base = r.lienzo;
      amp = r.ampliacion;
    } else base = anim.base === 'figura' ? figura : reposo;
    const listas = anim.fotogramas ?? [anim.retoques ?? []];
    const archivos = [];
    for (const [i, retoques] of listas.entries()) {
      const crudo = copiar(base);
      await retocar(crudo, retoques, plantillas);
      archivos.push(await escribir(listas.length > 1 ? `${nombre}_${i + 1}` : nombre, crudo, amp));
    }
    animaciones[nombre] = { tipo: 'secuencia', archivos, fps: anim.fps ?? 1, bucle: false, ...(efecto ? { efecto } : {}) };
    console.log(`  ${id}/${nombre} · ${archivos.length} fotograma${archivos.length > 1 ? 's' : ''} · ampliación ${amp.toFixed(2)}`);
  }

  const manifiesto = { ancho: LADO, alto: LADO, animaciones };
  fs.writeFileSync(path.join(carpeta, 'manifiesto.json'), JSON.stringify(manifiesto, null, 2) + '\n');
  const kb = fs.readdirSync(carpeta).reduce((s, f) => s + fs.statSync(path.join(carpeta, f)).size, 0) / 1024;
  console.log(`  ${id}: ${Object.keys(fotogramas).length} fotogramas, ${kb.toFixed(0)} KB`);
  return fotogramas;
}

/** Personaje con una imagen por pose: cada una, cortada, ajustada al fotograma e impresa. */
async function prepararConImagenes(id, def) {
  const carpeta = path.join(DESTINO, id);
  fs.rmSync(carpeta, { recursive: true, force: true });
  fs.mkdirSync(carpeta, { recursive: true });
  const F = config.fotograma;
  const [W, H, margen] = [F.ancho * PPP, F.alto * PPP, F.margen * PPP];
  const fotogramas = {};
  const animaciones = {};
  for (const [nombre, archivo] of Object.entries(def.imagenes)) {
    const fuente = path.join(ORIGEN, id, archivo);
    const { width, height } = await sharp(fuente).metadata();
    const corte = Math.min(height, def.corte ?? height);
    // A lo ancho se aprovecha toda la imagen o solo el tramo `encuadre` ([x, ancho]): así se acerca
    // al personaje que llega en una imagen más apaisada, para que la cabeza salga como la de los demás.
    const [x, anchoUtil] = def.encuadre ?? [0, width];
    const escala = (W - 2 * margen) / anchoUtil;
    const [ancho, alto] = [Math.round(anchoUtil * escala), Math.round(corte * escala)];
    const imagen = await sharp(fuente)
      .ensureAlpha()
      .extract({ left: x, top: 0, width: anchoUtil, height: corte })
      .resize(ancho, alto, { kernel: 'lanczos3', fit: 'fill' })
      .raw()
      .toBuffer();
    // Centrada y apoyada abajo: el corte queda en el borde de abajo, sin contorno, bajo el acta.
    const l = { d: Buffer.alloc(W * H * 4), w: W, h: H };
    const [izq, arr] = [Math.round((W - ancho) / 2), H - alto];
    for (let y = Math.max(0, -arr); y < alto; y++) imagen.copy(l.d, ((arr + y) * W + izq) * 4, y * ancho * 4, (y + 1) * ancho * 4);
    for (let p = 0; p < W * H; p++) l.d[p * 4 + 3] = Math.min(255, Math.round((l.d[p * 4 + 3] * 255) / IMPRENTA_IMAGENES.alfaPleno));
    if (carpetaCruda) await guardarCrudo(l, path.join(carpetaCruda, `${id}_${nombre}.png`));
    entintar(l, IMPRENTA_IMAGENES);
    const impreso = contornear(l, W, IMPRENTA_IMAGENES.contorno, IMPRENTA_IMAGENES.sombra, H);
    fotogramas[nombre] = impreso;
    await aWebp(impreso).toFile(path.join(carpeta, `${nombre}.webp`));
    animaciones[nombre] = { tipo: 'secuencia', archivos: [`${nombre}.webp`], fps: 1, bucle: nombre === 'reposo' };
  }
  if (!animaciones.reposo) throw new Error(`${id}: falta la imagen del reposo`);
  if (def.medallon) await medallon(id, def.medallon, path.join(carpeta, 'medallon.webp'));
  const manifiesto = { ancho: W, alto: H, animaciones };
  fs.writeFileSync(path.join(carpeta, 'manifiesto.json'), JSON.stringify(manifiesto, null, 2) + '\n');
  const kb = fs.readdirSync(carpeta).reduce((s, f) => s + fs.statSync(path.join(carpeta, f)).size, 0) / 1024;
  console.log(`  ${id}: ${Object.keys(fotogramas).length} fotogramas de ${W} × ${H}, ${kb.toFixed(0)} KB`);
  return fotogramas;
}

/**
 * La cara del personaje para el mapa: un cuadrado de su imagen (`cuadro`: x, y, lado, en px de
 * la imagen) con la misma tinta y papel. El disco del mapa la recorta en círculo y le pone el borde.
 */
async function medallon(id, { imagen, cuadro }, destino) {
  const [x, y, lado] = cuadro;
  const LADO_MEDALLON = 100 * PPP;
  const d = await sharp(path.join(ORIGEN, id, imagen))
    .extract({ left: x, top: y, width: lado, height: lado })
    .resize(LADO_MEDALLON, LADO_MEDALLON, { kernel: 'lanczos3' })
    .flatten({ background: '#F2E8D2' })
    .ensureAlpha()
    .raw()
    .toBuffer();
  const l = { d, w: LADO_MEDALLON, h: LADO_MEDALLON };
  entintar(l, IMPRENTA_IMAGENES);
  await aWebp(l).toFile(destino);
}

async function hojaDeMuestra(destino, todos) {
  const t = LADO / 2;
  const filas = Object.entries(todos);
  const columnas = Math.max(...filas.map(([, f]) => Object.keys(f).length));
  const piezas = [];
  for (const [fila, [, fotogramas]] of filas.entries())
    for (const [col, l] of Object.values(fotogramas).entries())
      piezas.push({
        input: await sharp(l.d, { raw: { width: l.w, height: l.h, channels: 4 } })
          .resize(t, t, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer(),
        left: col * t,
        top: fila * t,
      });
  const fondo = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${columnas * t}" height="${filas.length * t}"><defs><radialGradient id="l"><stop offset="0" stop-color="#E2A527" stop-opacity=".35"/><stop offset=".68" stop-color="#E2A527" stop-opacity="0"/></radialGradient><pattern id="p" width="${t}" height="${t}" patternUnits="userSpaceOnUse"><circle cx="${t / 2}" cy="${t / 2}" r="${t * 0.6}" fill="url(#l)"/></pattern></defs><rect width="100%" height="100%" fill="#2A1F18"/><rect width="100%" height="100%" fill="url(#p)"/></svg>`,
  );
  await sharp(fondo).composite(piezas).png().toFile(destino);
  console.log('Muestra:', destino);
}

if (carpetaCruda) fs.mkdirSync(carpetaCruda, { recursive: true });
const todos = {};
for (const [id, def] of Object.entries(config.personajes)) {
  if (soloId && id !== soloId) continue;
  console.log(id);
  todos[id] = def.imagenes ? await prepararConImagenes(id, def) : await prepararPersonaje(id, def);
}
if (!soloId) {
  const indice = {
    _nota: 'Personajes con arte: cada id tiene una carpeta con su manifiesto.json, y algunos, su cara para el mapa (medallones). Lo genera npm run personajes; los que no están usan el marcador.',
    personajes: Object.keys(todos),
    medallones: Object.fromEntries(
      Object.entries(config.personajes)
        .filter(([id, def]) => todos[id] && def.medallon)
        .map(([id]) => [id, `${id}/medallon.webp`]),
    ),
  };
  fs.writeFileSync(path.join(DESTINO, 'indice.json'), JSON.stringify(indice, null, 2) + '\n');
}
if (archivoMuestra) await hojaDeMuestra(archivoMuestra, todos);
