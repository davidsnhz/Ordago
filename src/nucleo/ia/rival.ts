import { IA } from '../../datos/ia';
import type { Reglas } from '../../datos/reglas';
import type { PerfilRival } from '../../datos/rivales';
import type { EstadoEnvite } from '../apuestas';
import type { Azar } from '../azar';
import type { Carta } from '../carta';
import { otroLado, type Lado, type PorLado } from '../comun';
import { limitesEnvite, type AccionDuelo, type EstadoDuelo, type Fase } from '../duelo';
import type { Lance } from '../lances';
import { decidirEnvite, type DecisionEnvite } from './decisiones';
import { calcularFuerza, type Fuerza } from './fuerza';
import { proporcionFaroles, type MemoriaRival } from './memoria';
import { decidirMus, elegirDescarte, type DecisionMus } from './mus';

/**
 * Lo que la IA puede ver del duelo: sus cartas y lo que está sobre la mesa. Nunca las
 * cartas del jugador ni el mazo; por eso las decisiones reciben esta vista y no el estado.
 */
export interface VistaRival {
  lado: Lado;
  cartas: readonly Carta[];
  quienEsMano: Lado;
  fase: Fase;
  turno: Lado | null;
  lanceActual: Lance | null;
  envite: EstadoEnvite | null;
  marcador: PorLado<number>;
  reglas: Reglas;
  numeroMano: number;
}

export function vistaDe(estado: EstadoDuelo, lado: Lado): VistaRival {
  return {
    lado,
    cartas: [...estado.cartas[lado]],
    quienEsMano: estado.quienEsMano,
    fase: estado.fase,
    turno: estado.turno,
    lanceActual: estado.lanceActual,
    envite: estado.envite ? structuredClone(estado.envite) : null,
    marcador: { ...estado.marcador },
    reglas: estado.reglas,
    numeroMano: estado.numeroMano,
  };
}

export type DecisionRival =
  | { tipo: 'mus'; accion: AccionDuelo; mus: DecisionMus }
  | { tipo: 'descarte'; accion: AccionDuelo }
  | {
      tipo: 'envite';
      accion: AccionDuelo;
      envite: DecisionEnvite;
      fuerza: Fuerza;
      lance: Lance;
      /** Fuerza con la que ha decidido: la del lance, corregida si te ha visto el tic (Cara a 0). */
      fuerzaUsada: number;
    };

export interface ContextoRival {
  perfil: PerfilRival;
  memoria: MemoriaRival;
  /** Cara del jugador. */
  caraJugador: number;
  /** Ganan los empates del rival (normalmente, si es mano). */
  ganaEmpates?: boolean;
  /** Cara a 0: si al jugador se le ha notado (o no) el tic en este lance. */
  senal?: 'seNota' | 'noSeNota' | null;
}

export function decidirRival(vista: VistaRival, ctx: ContextoRival, azar: Azar): DecisionRival {
  const { lado } = vista;
  if (vista.turno !== lado) throw new Error('No le toca al rival');
  const modo = vista.reglas.modoReyes;

  switch (vista.fase) {
    case 'mus': {
      const mus = decidirMus(ctx.perfil.mus, vista.cartas, modo, azar);
      return { tipo: 'mus', accion: { tipo: mus.corta ? 'corto' : 'mus', lado }, mus };
    }
    case 'descarte':
      return { tipo: 'descarte', accion: { tipo: 'descartar', lado, cartas: elegirDescarte(ctx.perfil.mus, vista.cartas, modo) } };
    case 'envite': {
      const lance = vista.lanceActual;
      if (!lance || !vista.envite) throw new Error('Fase de envites sin lance');
      const fuerza = calcularFuerza(vista.cartas, ctx.ganaEmpates ?? vista.quienEsMano === lado, modo);
      const ajuste =
        ctx.senal === 'seNota' ? IA.exposicion.ajusteSiSeNota : ctx.senal === 'noSeNota' ? IA.exposicion.ajusteSiNo : 0;
      const fuerzaUsada = Math.max(0, Math.min(1, fuerza[lance] + ajuste));
      const envite = decidirEnvite(
        {
          F: fuerzaUsada,
          envite: vista.envite,
          limites: limitesEnvite(vista.reglas),
          diferencia: vista.marcador[lado] - vista.marcador[otroLado(lado)],
          caraJugador: ctx.caraJugador,
          tFarol: proporcionFaroles(ctx.memoria),
          aceptaTodo: ctx.memoria.manosEnfadado > 0,
          numeroMano: vista.numeroMano,
          ordagoDesdeMano: ctx.perfil.ordagoDesdeMano,
          siempreEnvida: ctx.perfil.siempreEnvidaA?.includes(lance) ?? false,
        },
        ctx.perfil.parametros,
        azar,
      );
      return { tipo: 'envite', accion: { ...envite.accion, lado } as AccionDuelo, envite, fuerza, lance, fuerzaUsada };
    }
    default:
      throw new Error(`El rival no actúa en la fase ${vista.fase}`);
  }
}
