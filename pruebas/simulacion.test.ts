import { describe, expect, it } from 'vitest';
import { accionAleatoria } from '../src/depuracion/jugadorAleatorio';
import { simularDuelo } from '../src/depuracion/simular';
import { Azar, type EstadoAzar } from '../src/nucleo/azar';
import { idCarta } from '../src/nucleo/carta';
import { LADOS } from '../src/nucleo/comun';
import { aplicarAccion, crearDuelo, type EstadoDuelo } from '../src/nucleo/duelo';
import type { EventoDuelo } from '../src/nucleo/eventos';
import { todasLasCartas } from './ayudas';

const DUELOS = 2000;

function comprobar(antes: EstadoDuelo, despues: EstadoDuelo): void {
  const todas = todasLasCartas(despues).map(idCarta);
  if (todas.length !== 40 || new Set(todas).size !== 40) throw new Error('No hay 40 cartas distintas');
  for (const lado of LADOS) {
    if (despues.cartas[lado].length !== 4) throw new Error(`${lado} no tiene 4 cartas`);
    if (despues.marcador[lado] < antes.marcador[lado]) throw new Error('Las piedras han bajado');
  }
  const meta = despues.reglas.piedrasParaGanar;
  if (despues.fase === 'finDuelo') {
    if (!despues.ganador || !despues.motivoFin) throw new Error('Duelo terminado sin ganador');
    if (despues.motivoFin === 'piedras' && despues.marcador[despues.ganador] < meta) {
      throw new Error('Ganó a piedras sin llegar a la meta');
    }
  } else if (LADOS.some((lado) => despues.marcador[lado] >= meta)) {
    throw new Error('Alguien llegó a la meta y el duelo sigue');
  }
  if (despues.numeroMano === antes.numeroMano + 1 && despues.quienEsMano === antes.quienEsMano) {
    throw new Error('La mano no ha cambiado de jugador');
  }
}

describe(`simulación de ${DUELOS} duelos entre jugadores aleatorios`, () => {
  it('todos terminan sin errores y cumplen las reglas en cada paso', () => {
    const vistos = { ordago: 0, piedras: 0, dejeFinal: 0, cortesEnRecuento: 0, punto: 0, manos: 0, rebarajados: 0 };

    for (let semilla = 1; semilla <= DUELOS; semilla++) {
      const inicio = crearDuelo({ semilla });
      const azar = Azar.conSemilla(`jugadores/${semilla}`);
      let estado = inicio.estado;
      let acciones = 0;
      while (estado.fase !== 'finDuelo') {
        if (++acciones > 20_000) throw new Error(`El duelo ${semilla} no termina`);
        const { estado: siguiente, eventos } = aplicarAccion(estado, accionAleatoria(estado, azar));
        try {
          comprobar(estado, siguiente);
        } catch (error) {
          throw new Error(`Semilla ${semilla}, acción ${acciones}: ${(error as Error).message}`);
        }
        for (const evento of eventos) {
          if (evento.tipo === 'inicioLance' && evento.lance === 'punto') vistos.punto++;
          if (evento.tipo === 'recuento' && evento.aplicados < evento.cobros.length) vistos.cortesEnRecuento++;
          if (evento.tipo === 'rebarajado') vistos.rebarajados++;
        }
        if (siguiente.fase === 'finDuelo' && eventos.some((e) => e.tipo === 'deje')) vistos.dejeFinal++;
        estado = siguiente;
      }
      vistos[estado.motivoFin!]++;
      vistos.manos += estado.numeroMano;
    }

    // Que la simulación haya pasado de verdad por todos los casos.
    expect(vistos.ordago + vistos.piedras).toBe(DUELOS);
    expect(vistos.ordago).toBeGreaterThan(0);
    expect(vistos.piedras).toBeGreaterThan(0);
    expect(vistos.dejeFinal).toBeGreaterThan(0);
    expect(vistos.cortesEnRecuento).toBeGreaterThan(0);
    expect(vistos.punto).toBeGreaterThan(0);
  }, 120_000);

  it('la misma semilla repite exactamente el mismo duelo', () => {
    for (const semilla of [1, 2, 'Agustín', 12345]) {
      expect(simularDuelo(semilla)).toEqual(simularDuelo(semilla));
    }
    expect(simularDuelo(1).eventos).not.toEqual(simularDuelo(2).eventos);
  });

  it('guardar a mitad (JSON) y reanudar termina igual que sin interrumpir', () => {
    for (let semilla = 1; semilla <= 50; semilla++) {
      const completo = jugarHastaElFinal(crearDuelo({ semilla }).estado, Azar.conSemilla(`j${semilla}`).estado());

      // Mismo duelo, pero se guarda y se recarga en mitad.
      const mitad = Math.floor(completo.acciones / 2);
      const parcial = jugarHastaElFinal(crearDuelo({ semilla }).estado, Azar.conSemilla(`j${semilla}`).estado(), mitad);
      const guardado = JSON.parse(JSON.stringify({ estado: parcial.estado, azar: parcial.azar }));
      const reanudado = jugarHastaElFinal(guardado.estado, guardado.azar);

      expect([...parcial.eventos, ...reanudado.eventos]).toEqual(completo.eventos);
      expect(reanudado.estado).toEqual(completo.estado);
    }
  });
});

function jugarHastaElFinal(estado: EstadoDuelo, estadoAzar: EstadoAzar, maximo = Infinity) {
  const azar = new Azar(estadoAzar);
  const eventos: EventoDuelo[] = [];
  let acciones = 0;
  while (estado.fase !== 'finDuelo' && acciones < maximo) {
    const resultado = aplicarAccion(estado, accionAleatoria(estado, azar));
    estado = resultado.estado;
    eventos.push(...resultado.eventos);
    acciones++;
  }
  return { estado, eventos, acciones, azar: azar.estado() };
}
