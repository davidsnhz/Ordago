import type { Azar } from '../nucleo/azar';
import { accionesValidas, type AccionDuelo, type EstadoDuelo, type OpcionDuelo } from '../nucleo/duelo';

/**
 * Jugador de pruebas: elige al azar entre las jugadas legales. El órdago es raro para que
 * la mayoría de los duelos se jueguen a piedras y se ejercite el recuento.
 */
const PESOS: Record<OpcionDuelo['tipo'], number> = {
  mus: 1,
  corto: 1,
  descartar: 1,
  paso: 1,
  envido: 1,
  mas: 0.4,
  quiero: 1,
  noQuiero: 1,
  ordago: 0.04,
  trato: 1,
  siguienteMano: 1,
};

export function accionAleatoria(estado: EstadoDuelo, azar: Azar): AccionDuelo {
  const { lado, opciones } = accionesValidas(estado);
  if (opciones.length === 0) throw new Error('No hay acciones posibles: el duelo ha terminado');
  const opcion = elegirConPesos(opciones, azar);
  if (opcion.tipo === 'siguienteMano') return { tipo: 'siguienteMano' };
  if (!lado) throw new Error(`Falta quién actúa para «${opcion.tipo}»`);

  switch (opcion.tipo) {
    case 'descartar': {
      const cuantas = azar.entero(opcion.minimo, opcion.maximo);
      return { tipo: 'descartar', lado, cartas: azar.barajar(estado.cartas[lado]).slice(0, cuantas) };
    }
    case 'trato':
      return { tipo: 'trato', lado, acepta: azar.probabilidad(0.5) };
    case 'envido':
    case 'mas': {
      const piedras = opcion.minimo + (azar.probabilidad(0.7) ? 0 : azar.entero(1, 8));
      return { tipo: opcion.tipo, lado, piedras };
    }
    default:
      return { tipo: opcion.tipo, lado };
  }
}

function elegirConPesos(opciones: readonly OpcionDuelo[], azar: Azar): OpcionDuelo {
  const total = opciones.reduce((suma, o) => suma + PESOS[o.tipo], 0);
  let resto = azar.siguiente() * total;
  for (const opcion of opciones) {
    resto -= PESOS[opcion.tipo];
    if (resto < 0) return opcion;
  }
  return opciones[opciones.length - 1]!;
}
