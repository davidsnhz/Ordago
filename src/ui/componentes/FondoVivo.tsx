import { useEffect, useRef } from 'react';

/** La pared de la taberna, en píxeles del escenario. */
const ANCHO = 390;
const ALTO = 530;
/** El quinqué, detrás del rival: el polvo brilla más cerca de su luz. */
const LUZ = { x: 195, y: 262 };
/**
 * Detrás del rival, humo y mucho polvo fino; delante, unas pocas motas gordas que le pasan por
 * delante y dan profundidad (la luz queda casi toda tapada por el rival).
 */
const CAPAS = {
  fondo: { motas: 48, humos: 6, radio: [0.5, 1.6], sube: [3, 9], alcance: 175, base: 0.08 },
  delante: { motas: 14, humos: 0, radio: [1.3, 2.6], sube: [5, 12], alcance: 260, base: 0.1 },
} as const;
type Capa = keyof typeof CAPAS;
/** Resolución del lienzo: el polvo es blando, no hace falta más. */
const RESOLUCION = 2;

interface Mota {
  x: number;
  y: number;
  radio: number;
  sube: number;
  vaiven: number;
  ritmo: number;
  fase: number;
  brillo: number;
}

interface Humo {
  x: number;
  y: number;
  radio: number;
  vx: number;
  vy: number;
}

const azar = (desde: number, hasta: number) => desde + Math.random() * (hasta - desde);

function mota(capa: Capa, enCualquierSitio: boolean): Mota {
  const { radio, sube } = CAPAS[capa];
  return {
    x: azar(0, ANCHO),
    y: enCualquierSitio ? azar(0, ALTO) : ALTO + azar(0, 20),
    radio: azar(radio[0], radio[1]),
    sube: azar(sube[0], sube[1]),
    vaiven: azar(4, 12),
    ritmo: azar(0.2, 0.6),
    fase: azar(0, Math.PI * 2),
    brillo: azar(0.5, 1),
  };
}

/**
 * La mesa viva: la pared de la taberna no está quieta. Motas de polvo que suben despacio y
 * brillan al pasar por la luz del quinqué, y un humo muy suave que va subiendo. Es un lienzo
 * (canvas) solo para el fondo; con «reducir movimiento», se pinta una vez y se queda.
 */
export function FondoVivo({ capa = 'fondo' }: { capa?: Capa }) {
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = lienzo.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx) return;
    el.width = ANCHO * RESOLUCION;
    el.height = ALTO * RESOLUCION;
    ctx.scale(RESOLUCION, RESOLUCION);
    const quieto = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
    const { alcance, base } = CAPAS[capa];

    const motas = Array.from({ length: CAPAS[capa].motas }, () => mota(capa, true));
    const humos: Humo[] = Array.from({ length: CAPAS[capa].humos }, () => ({
      x: azar(0, ANCHO),
      y: azar(0, ALTO),
      radio: azar(70, 130),
      vx: azar(-4, 4),
      vy: azar(-8, -3),
    }));

    let cuadro = 0;
    let antes = performance.now();
    const pintar = (ahora: number) => {
      const dt = Math.min(0.05, (ahora - antes) / 1000);
      antes = ahora;
      const t = ahora / 1000;
      ctx.clearRect(0, 0, ANCHO, ALTO);

      for (const h of humos) {
        h.x += h.vx * dt;
        h.y += h.vy * dt;
        if (h.y < -h.radio) Object.assign(h, { y: ALTO + h.radio, x: azar(0, ANCHO) });
        if (h.x < -h.radio) h.x = ANCHO + h.radio;
        if (h.x > ANCHO + h.radio) h.x = -h.radio;
        const g = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.radio);
        g.addColorStop(0, 'rgba(242, 232, 210, 0.05)');
        g.addColorStop(1, 'rgba(242, 232, 210, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(h.x - h.radio, h.y - h.radio, h.radio * 2, h.radio * 2);
      }

      for (let i = 0; i < motas.length; i++) {
        const m = motas[i]!;
        m.y -= m.sube * dt;
        m.x += Math.sin(t * m.ritmo + m.fase) * m.vaiven * dt;
        if (m.y < -4) motas[i] = mota(capa, false);
        const lejos = Math.hypot(m.x - LUZ.x, m.y - LUZ.y) / alcance;
        const luz = Math.max(0, 1 - lejos);
        const titila = 0.65 + 0.35 * Math.sin(t * 1.7 * m.ritmo * 3 + m.fase);
        const alfa = (base + 0.8 * luz * luz) * m.brillo * titila;
        if (alfa < 0.02) continue;
        ctx.fillStyle = `rgba(255, 216, 150, ${alfa.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radio * (0.8 + luz * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }

      if (!quieto) cuadro = requestAnimationFrame(pintar);
    };
    cuadro = requestAnimationFrame(pintar);
    return () => cancelAnimationFrame(cuadro);
  }, [capa]);

  return <canvas ref={lienzo} className="mesa__fondo-vivo" aria-hidden="true" />;
}
