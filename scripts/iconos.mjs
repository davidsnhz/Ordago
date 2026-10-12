// Iconos de la aplicación (pantalla de inicio del móvil y pestaña): la moneda de oros sobre el
// color de la taberna. `npm run iconos` los escribe en public/iconos/.
//   - icono-180.png: iPhone (apple-touch-icon). iOS redondea las esquinas solo.
//   - icono-192.png e icono-512.png: Android y el manifiesto.
//   - icono-512-mascara.png: Android adaptable; la moneda más pequeña para que ningún recorte la corte.
//   - icono-32.png: la pestaña del navegador.
import sharp from 'sharp';
import fs from 'fs';

const MONEDA = 'public/arte/palos/oros.webp';
const SALIDA = 'public/iconos';
const FONDO = '#2A1F18'; // --taberna

const iconos = [
  { archivo: 'icono-180.png', lado: 180, moneda: 0.8 },
  { archivo: 'icono-192.png', lado: 192, moneda: 0.8 },
  { archivo: 'icono-512.png', lado: 512, moneda: 0.8 },
  // En los iconos adaptables solo es seguro el círculo central del 80 %.
  { archivo: 'icono-512-mascara.png', lado: 512, moneda: 0.62 },
  { archivo: 'icono-32.png', lado: 32, moneda: 0.94, transparente: true },
];

fs.mkdirSync(SALIDA, { recursive: true });
for (const { archivo, lado, moneda, transparente } of iconos) {
  const diametro = Math.round(lado * moneda);
  const imagen = await sharp(MONEDA).resize(diametro, diametro, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await sharp({
    create: { width: lado, height: lado, channels: 4, background: transparente ? { r: 0, g: 0, b: 0, alpha: 0 } : FONDO },
  })
    .composite([{ input: imagen, gravity: 'center' }])
    // Con paleta pesan una quinta parte y no se nota.
    .png({ palette: true, quality: 92, compressionLevel: 9, effort: 10 })
    .toFile(`${SALIDA}/${archivo}`);
  console.log(`${SALIDA}/${archivo}`);
}
