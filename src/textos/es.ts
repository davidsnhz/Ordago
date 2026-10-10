import type { Carta, Numero, Palo } from '../nucleo/carta';
import type { Lado } from '../nucleo/comun';
import type { Lance } from '../nucleo/lances';
import type { TipoPares } from '../nucleo/mano';
import type { ConceptoCobro } from '../nucleo/recuento';

/** Textos visibles del juego en español de España. */
export const ES = {
  lados: { jugador: 'Tú', rival: 'Rival' } satisfies Record<Lado, string>,
  lances: {
    grande: 'Grande',
    chica: 'Chica',
    pares: 'Pares',
    juego: 'Juego',
    punto: 'Punto',
  } satisfies Record<Lance, string>,
  numeros: {
    1: 'As', 2: 'Dos', 3: 'Tres', 4: 'Cuatro', 5: 'Cinco', 6: 'Seis', 7: 'Siete',
    10: 'Sota', 11: 'Caballo', 12: 'Rey',
  } satisfies Record<Numero, string>,
  palos: { oros: 'Oros', copas: 'Copas', espadas: 'Espadas', bastos: 'Bastos' } satisfies Record<Palo, string>,
  pares: { ninguno: 'sin pares', pareja: 'pareja', medias: 'medias', duples: 'duples' } satisfies Record<TipoPares, string>,
  acciones: {
    mus: 'Mus',
    corto: 'Corto',
    descartar: 'Descartar',
    paso: 'Paso',
    envido: 'Envido',
    mas: 'Más',
    quiero: 'Quiero',
    noQuiero: 'No quiero',
    ordago: '¡Órdago!',
    siguienteMano: 'Siguiente mano',
  },
  conceptos: {
    enPaso: 'en paso',
    envite: 'envite',
    pares: 'pares',
    juego: 'juego',
    punto: 'punto',
  } satisfies Record<ConceptoCobro, string>,
  /** «En juego a la Chica», «al Juego»… */
  alLance: {
    grande: 'a la Grande',
    chica: 'a la Chica',
    pares: 'a Pares',
    juego: 'al Juego',
    punto: 'al Punto',
  } satisfies Record<Lance, string>,

  mesa: {
    tituloDuelo: 'Tierra de Campos · duelo de prueba',
    marcador: 'Marcador · a 20',
    eresMano: 'eres mano',
    esMano: 'él es mano',
    tu: 'Tú',
    tuCara: 'Tu Cara',
    zonasCara: { pillan: 'te pillan', creen: 'te creen', temen: 'te temen' },
    caraProvisional: 'fija hasta la fase 3',
    enJuego: (alLance: string) => `En juego ${alLance}`,
    sinEnvite: 'sin envite',
    piedras: (n: number) => `${n} ${n === 1 ? 'piedra' : 'piedras'}`,
    dueloEntero: 'el duelo entero',
    musOCorto: '¿Mus o corto?',
    pideMus: (nombre: string) => `${nombre} pide mus`,
    tocaDescartar: 'Toca las cartas que tiras',
    piensa: (nombre: string) => `${nombre} se lo piensa…`,
    botones: {
      mus: 'MUS',
      corto: 'CORTO',
      descartar: (n: number) => (n > 0 ? `TIRAR ${letras(n).toUpperCase()}` : 'TIRAR'),
      paso: 'PASO',
      envido: (n: number) => `ENVIDO ${letras(n).toUpperCase()}`,
      mas: (n: number) => `${letras(n).toUpperCase()} MÁS`,
      quiero: 'QUIERO',
      noQuiero: 'NO QUIERO',
      ordago: '¡ÓRDAGO!',
      siguienteMano: 'SIGUIENTE MANO',
      otroDuelo: 'OTRO DUELO',
    },
    cantidad: 'Cuánto',
    deslizaOrdago: 'desliza hacia arriba para tirarlo',
    ayudaOrdago: '¡Órdago! Desliza hacia arriba, o pulsa la flecha arriba, para tirarlo',
    recuento: 'RECUENTO',
    susCartas: (nombre: string) => `Las cartas de ${nombre}`,
    nadaQueCobrar: 'Nada que cobrar.',
    sinCobrar: 'ya no hace falta',
    cobro: (lance: string, concepto: string) => `${lance} · ${concepto}`,
    ordagoA: (alLance: string) => `¡ÓRDAGO ${alLance.toUpperCase()}!`,
    tiraOrdago: (rival: string | null) => (rival ? `Lo tira ${rival}` : 'Lo tiras tú'),
    hasGanado: '¡HAS GANADO EL DUELO!',
    teGana: (nombre: string) => `${nombre.toUpperCase()} TE GANA`,
    porOrdago: 'por órdago',
    aPiedras: 'a piedras',
    enfadado: '¡ENFADADO!',
    girar: 'Gira el móvil para jugar en horizontal',
    artePendiente: 'ARTE PENDIENTE',
    depurar: 'Depurar',
    /** Líneas de la crónica. `rival` es el nombre del rival, o null si lo hizo el jugador. */
    cronica: {
      declara: (rival: string | null, lance: string, tiene: boolean) =>
        `${rival ?? 'Tú'}: ${lance.toLowerCase()} ${tiene ? 'sí' : 'no'}`,
      soloUno: (rival: string | null, lance: string) =>
        rival ? `Solo ${rival} lleva ${lance.toLowerCase()}` : `Solo tú llevas ${lance.toLowerCase()}`,
      nadie: (lance: string) => `Nadie lleva ${lance.toLowerCase()}`,
      deje: (rival: string | null, n: number) =>
        rival ? `${rival} cobra ${n} por el «no quiero»` : `Cobras ${n} por el «no quiero»`,
      descarta: (rival: string | null, n: number) => (rival ? `${rival} cambia ${letras(n)}` : `Cambias ${letras(n)}`),
      mus: (rival: string | null, mus: boolean) => `${rival ?? 'Tú'}: ${mus ? 'mus' : 'corto'}`,
      envite: (rival: string | null, texto: string) => `${rival ?? 'Tú'}: ${texto.toLowerCase()}`,
    },
    /** Lo que dice el jugador, en su etiqueta junto a la mano. */
    cambio: (n: number) => `CAMBIO ${letras(n).toUpperCase()}`,
    cartasRival: (n: number) => `${letras(n).toUpperCase()} ${n === 1 ? 'CARTA' : 'CARTAS'}`,
    declaracion: (lance: string, tiene: boolean) => `${lance.toUpperCase()}: ${tiene ? 'SÍ' : 'NO'}`,
    ganoYo: '¡GANO YO!',
    meHasGanado: 'ME HAS GANADO',
    mano: (n: number) => `Mano ${n}`,
    depuracionTitulo: 'Depuración',
    depuracionCartas: (nombre: string) => `Cartas de ${nombre}`,
    depuracionUltima: 'Última decisión',
    depuracionMemoria: (envites: number, faroles: number, racha: number, enfado: number) =>
      `Tus envites ${envites} · faroles vistos ${faroles} · racha perdida ${racha} · enfado ${enfado}`,
    depuracionTic: (verdadero: boolean, significado: string) => `${significado} · ${verdadero ? 'verdad' : 'en falso'}`,
  },

  rivales: {
    ruperto: {
      nombre: 'Ruperto',
      etiqueta: 'RUPERTO',
      titulo: 'Ruperto, el Herrero',
      saludo: { accion: 'A GOLPES', frase: '«Aquí se juega como se forja: a golpes.»' },
      frases: {
        mus: ['«Estas no valen ni para clavos.»', '«Mus, que esto está frío.»'],
        corto: ['«Aquí hay hierro.»', '«No hay mus. A forjar.»'],
        descarte: ['«Fuera chatarra.»', '«Esto, a la fragua.»'],
        paso: ['«El hierro aún no está al rojo.»', '«De momento, paso.»'],
        envido: ['«¡A golpe de martillo!»', '«Aquí se envida como se forja.»'],
        mas: ['«¡Más leña al fuego!»', '«Y no me tiembla el pulso.»'],
        quiero: ['«A mí no me asustas.»', '«Para eso he venido.»'],
        noQuiero: ['«Esta te la dejo. Ya caerá otra.»', '«Hoy no, forastero.»'],
        ordago: ['«¡Que suene el yunque!»', '«Aquí se juega como se forja: a golpes.»'],
        declara: ['«Lo que hay es lo que hay.»'],
        enfado: '«¡Tres seguidos! ¡Ahora va en serio!»',
        gana: '«Al yunque contigo, forastero.»',
        pierde: '«Bien jugado. Mañana te hago una herradura.»',
      },
      /** Lo que se ve cuando hace cada tic (acotación mientras no haya arte). */
      tics: { rascaBarba: 'se rasca la barba', arremanga: 'se arremanga' } as Record<string, string>,
      /** Qué significa cada tic (solo en modo de depuración). */
      significadoTics: { rascaBarba: 'pares o mejor', arremanga: 'lleva 31' } as Record<string, string>,
    },
  },
} as const;

const LETRAS = [
  'cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
  'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte',
];

/** Número en letras para lo que se dice en la mesa: «envido dos», «cinco más». */
export function letras(n: number): string {
  return LETRAS[n] ?? String(n);
}

export function nombreCarta(carta: Carta): string {
  return `${ES.numeros[carta.numero]} de ${ES.palos[carta.palo]}`;
}

/** Forma corta para registros: «Ro» es el rey de oros y «3e» el tres de espadas. */
export function cartaCorta(carta: Carta): string {
  const figura: Partial<Record<Numero, string>> = { 1: 'A', 10: 'S', 11: 'C', 12: 'R' };
  const palo: Record<Palo, string> = { oros: 'o', copas: 'c', espadas: 'e', bastos: 'b' };
  return `${figura[carta.numero] ?? carta.numero}${palo[carta.palo]}`;
}
