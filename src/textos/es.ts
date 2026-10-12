import type { IdRival } from '../datos/rivales';
import type { MotivoCara } from '../nucleo/cara';
import type { Carta, Numero, Palo } from '../nucleo/carta';
import type { Lado } from '../nucleo/comun';
import type { Lance } from '../nucleo/lances';
import type { TipoPares } from '../nucleo/mano';
import type { ConceptoCobro } from '../nucleo/recuento';

/** Lo que dice y hace cada rival. */
export interface TextosRival {
  nombre: string;
  etiqueta: string;
  titulo: string;
  comarca: string;
  saludo: { accion: string; frase: string };
  frases: {
    mus: string[];
    corto: string[];
    descarte: string[];
    paso: string[];
    envido: string[];
    mas: string[];
    quiero: string[];
    noQuiero: string[];
    ordago: string[];
    declara: string[];
    gana: string;
    pierde: string;
    /** Reglas especiales. */
    enfado?: string;
    ofendida?: string;
    penitencia?: string;
    trato?: string;
    tratoAceptado?: string;
    tratoRechazado?: string;
  };
  /** Lo que se ve cuando hace cada tic (acotación mientras no haya arte). */
  tics: Record<string, string>;
  /** Qué significa cada tic (solo en modo de depuración). */
  significadoTics: Record<string, string>;
}

const TICS_HERRERO = { rascaBarba: 'se rasca la barba', arremanga: 'se arremanga' };
const SIGNIFICADO_HERRERO = { rascaBarba: 'pares o mejor', arremanga: 'lleva 31' };
const TICS_CURA = { bebeVino: 'bebe un sorbo de vino', miraAlCielo: 'mira al cielo', juntaManos: 'junta las manos' };
const SIGNIFICADO_CURA = { bebeVino: 'lleva juego', miraAlCielo: 'está faroleando', juntaManos: 'lleva duples' };

const RIVALES: Record<IdRival, TextosRival> = {
  ruperto: {
    nombre: 'Ruperto',
    etiqueta: 'RUPERTO',
    titulo: 'Ruperto, el Herrero',
    comarca: 'Tierra de Campos',
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
    tics: TICS_HERRERO,
    significadoTics: SIGNIFICADO_HERRERO,
  },
  engracia: {
    nombre: 'Doña Engracia',
    etiqueta: 'DOÑA ENGRACIA',
    titulo: 'Doña Engracia, la Viuda',
    comarca: 'Montaña Palentina',
    saludo: { accion: 'SIÉNTESE', frase: '«Treinta años jugando con mi difunto. A mí no me la das.»' },
    frases: {
      mus: ['«Mus, si no le importa.»', '«Estas no rezan. Mus.»'],
      corto: ['«Así está bien.»', '«Corto. Y no me mire así.»'],
      descarte: ['«Estas, al cepillo.»', '«Fuera, que no me convencen.»'],
      paso: ['«Hay que tener paciencia.»', '«Ya hablará usted.»'],
      envido: ['«Yo no hablo por hablar.»', '«Cuando yo envido, hijo, es por algo.»'],
      mas: ['«Mi difunto tampoco se arrugaba.»', '«Subo, que hoy tengo el día.»'],
      quiero: ['«Veamos qué esconde.»', '«Lo veo, a ver si es verdad.»'],
      noQuiero: ['«No me fío un pelo.»', '«Para usted. No me la juego.»'],
      ordago: ['«Y que Dios reparta suerte.»', '«A todo o nada, como en el cuarenta y siete.»'],
      declara: ['«Con lo que Dios me ha dado.»'],
      ofendida: '«¡Qué descaro! Así no se juega.»',
      gana: '«Treinta años, se lo dije.»',
      pierde: '«Vaya. Usted sabe más de lo que aparenta.»',
    },
    tics: { rosario: 'pasa las cuentas del rosario más deprisa', miraFijamente: 'te mira fijamente' },
    significadoTics: { rosario: 'mano fuerte en algún lance', miraFijamente: 'cree que faroleas: tu Cara está baja' },
  },
  anselmo: {
    nombre: 'Don Anselmo',
    etiqueta: 'DON ANSELMO',
    titulo: 'Don Anselmo, el Cura',
    comarca: 'Ribera del Duero',
    saludo: { accion: 'PAZ Y BIEN', frase: '«Dios lo ve todo, hijo. Yo, casi todo.»' },
    frases: {
      mus: ['«Dios aprieta pero no ahoga.»', '«Mus, hijo. Hay que tener fe.»'],
      corto: ['«Corto, que hay misa a las ocho.»', '«No hay mus. Amén.»'],
      descarte: ['«Estas, a confesar.»', '«Al purgatorio con ellas.»'],
      paso: ['«La prudencia es virtud, hijo.»', '«Paso y rezo.»'],
      envido: ['«…a la Chica, hijo. Por la gloria de Dios.»', '«Y que sea lo que Dios quiera.»'],
      mas: ['«La Providencia me acompaña.»', '«Ten caridad con este pobre cura.»'],
      quiero: ['«Las penas, con pan, son menos.»', '«Lo quiero, hijo. Lo quiero.»'],
      noQuiero: ['«No tentaré al Señor.»', '«Para ti, hijo. Ve con Dios.»'],
      ordago: ['«Que se haga Su voluntad.»', '«Y que baje un ángel a verlo.»'],
      declara: ['«Ni miento ni me confieso.»'],
      penitencia: '«Te he pillado, hijo. Tu próximo envite lleva penitencia.»',
      gana: '«Dios aprieta, hijo. Y yo también.»',
      pierde: '«Bendito seas. Esta noche rezaré por mis cartas.»',
    },
    tics: TICS_CURA,
    significadoTics: SIGNIFICADO_CURA,
  },
  fulgencio: {
    nombre: 'Fulgencio',
    etiqueta: 'FULGENCIO',
    titulo: 'Fulgencio, el Tratante',
    comarca: 'Feria de ganado',
    saludo: { accion: '¡TRATO HECHO!', frase: '«Esta mula vale lo que yo diga que vale. Y esta mano, también.»' },
    frases: {
      mus: ['«Estas no las quiere ni el matadero.»', '«Mus, y ya veremos.»'],
      corto: ['«Mercancía de primera.»', '«Ni mus ni nada: aquí hay negocio.»'],
      descarte: ['«Estas, a la feria de saldo.»', '«El ganado se cambia.»'],
      paso: ['«El buen tratante no tiene prisa.»', '«Paso… de momento.»'],
      envido: ['«Y no te lo pienses mucho.»', '«Esto vale lo suyo.»'],
      mas: ['«Que el precio sube.»', '«Lo bueno se paga.»'],
      quiero: ['«Ganado visto, ganado comprado.»', '«Me fío de mi vista.»'],
      noQuiero: ['«Ni regalado.»', '«Mal negocio.»'],
      ordago: ['«Me juego la mula.»', '«Y ni pestañeo.»'],
      declara: ['«Eso, al final, se verá.»'],
      trato: '«Retiramos los envites y a medias. Palabra de tratante.»',
      tratoAceptado: '«Trato hecho. Choca esos cinco.»',
      tratoRechazado: '«Tú te lo pierdes.»',
      gana: '«Lo dicho: vale lo que yo diga.»',
      pierde: '«Me has comprado barato. Vuelve por la feria.»',
    },
    tics: {
      dienteDeOro: 'sonríe enseñando el diente de oro',
      quitaSombrero: 'se pone serio y se quita el sombrero',
      golpeaVara: 'golpea la vara contra el suelo',
    },
    significadoTics: { dienteDeOro: 'está faroleando', quitaSombrero: 'lleva cartas muy buenas', golpeaVara: 'nada: es para despistar' },
  },
  bonifacio: {
    nombre: 'Don Bonifacio',
    etiqueta: 'DON BONIFACIO',
    titulo: 'Don Bonifacio, el Cacique',
    comarca: 'Casino de la capital',
    saludo: { accion: 'LA CASA ES MANO', frase: '«En este pueblo no se mueve una carta sin que yo lo sepa.»' },
    frases: {
      mus: ['«Que corra el aire.»', '«Mus, si la casa lo permite.»'],
      corto: ['«Aquí mando yo.»', '«No hay mus en mi casino.»'],
      descarte: ['«Estas no son dignas de esta mesa.»', '«Retire esas, haga el favor.»'],
      paso: ['«Lo veo venir.»', '«Tengo todo el tiempo del mundo.»'],
      envido: ['«Apúntelo en mi cuenta.»', '«Como quien compra un pueblo.»'],
      mas: ['«A mí no se me sube nadie.»', '«La casa siempre sube.»'],
      quiero: ['«Enséñemelo, si se atreve.»', '«Ya sabía yo.»'],
      noQuiero: ['«Hoy le dejo ganar algo.»', '«Quédeselo. Calderilla.»'],
      ordago: ['«Firme aquí.»', '«Y que tome nota el notario.»'],
      declara: ['«La casa no miente. Casi nunca.»'],
      gana: '«La casa siempre gana, forastero.»',
      pierde: '«Vaya… Habrá que hablar con el alcalde.»',
    },
    tics: { ...TICS_HERRERO, ...TICS_CURA, humoPuro: 'su puro echa más humo' },
    significadoTics: { ...SIGNIFICADO_HERRERO, ...SIGNIFICADO_CURA, humoPuro: 'lleva cartas buenas' },
  },
};

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
    trato: 'trato',
    penitencia: 'penitencia',
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
    marcador: 'A 20 piedras',
    esMano: 'mano',
    ayudaMano: 'Es mano: habla primero y gana los empates',
    tu: 'Tú',
    tuCara: 'Tu Cara',
    /** La Cara en la cabecera: qué significa ahora mismo, en pocas palabras. */
    estadoCara: {
      nota: 'se te nota todo',
      pillan: 'te pillan: no cuela nada',
      creen: 'te creen: a veces cuela',
      temen: 'te temen: tus faroles cuelan',
    },
    /** La ficha que sale al tocar «?» junto a la Cara. */
    ayudaCara: {
      boton: 'Qué es la Cara',
      titulo: (n: number) => `TU CARA · ${n}`,
      queEs: 'Lo que te creen en la mesa.',
      mueve: 'Qué la mueve',
      farolCreido: 'Te creen un farol',
      enviteCobrado: 'Ganas un envite con buena mano',
      farolPillado: 'Te pillan un farol',
      ordagoPerdido: 'Pierdes tu órdago',
      hace: 'Qué hace',
      temen: (desde: number) => `Te temen (${desde}+): tus faroles cuelan, pero tus buenas manos cobran poco.`,
      creen: (desde: number, hasta: number) => `Te creen (${desde}–${hasta}): lo normal.`,
      pillan: (hasta: number) => `Te pillan (menos de ${hasta}): te lo quieren todo; farolear no sirve.`,
      nota: 'A 0, se te nota: el rival ve tu tic.',
      entendido: 'ENTENDIDO',
    },
    /** Cabecera del acta: en qué estamos y qué hay en juego. */
    fases: { mus: 'Mus', descarte: 'Descarte', trato: 'Trato', recuento: 'Recuento' },
    enJuego: (n: number) => `${n} ${n === 1 ? 'piedra' : 'piedras'} en juego`,
    leToca: (nombre: string) => `Le toca a ${nombre}`,
    eligeCartas: 'TOCA LAS QUE TIRAS',
    verMano: 'Toda la mano',
    cerrarMano: 'Cerrar',
    botones: {
      mus: 'MUS',
      corto: 'CORTO',
      descartar: (n: number) => `TIRAR ${letras(n).toUpperCase()}`,
      paso: 'PASO',
      envido: (n: number) => `ENVIDO ${letras(n).toUpperCase()}`,
      mas: (n: number) => `${letras(n).toUpperCase()} MÁS`,
      quiero: 'QUIERO',
      noQuiero: 'NO QUIERO',
      ordago: '¡ÓRDAGO!',
      siguienteMano: 'SIGUIENTE MANO',
      revancha: 'REVANCHA',
      aceptarTrato: 'ACEPTO',
      envidoCorto: 'ENVIDO',
      masCorto: 'MÁS',
      rechazarTrato: 'NO HAY TRATO',
    },
    /** Selector de cantidad, al estilo Offsuit: dos, tres o la barra del 4 al 19. */
    envidar: (alLance: string) => `Envidar ${alLance}`,
    subir: (alLance: string) => `Subir ${alLance}`,
    menos: 'Uno menos',
    unoMas: 'Uno más',
    ayudaOrdago: '¡Órdago! Mantén pulsado un segundo para tirarlo',
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
    girar: 'Pon el móvil en vertical para jugar',
    artePendiente: 'ARTE PENDIENTE',
    depurar: 'Depurar',
    ensayarTics: 'Tics',
    rival: 'Rival',
    elegirRival: 'ELIGE RIVAL',
    elegirRivalNota: 'Empieza un duelo nuevo, de cero.',
    cancelar: 'Cancelar',
    contra: 'O juega contra otro',
    tratoExplica: (nombre: string) => `Si aceptas, las piedras queridas se reparten a medias; la impar, para ${nombre}.`,
    /** Etiquetas de estado del rival junto al retrato. */
    enfadado: '¡ENFADADO!',
    ayudaEnfadado: 'Ha perdido tres lances seguidos: dos manos aceptándolo todo',
    estadoOfendida: 'OFENDIDA',
    ayudaOfendida: 'La has mirado demasiado: no hará tics esta mano ni la siguiente',
    /**
     * El acta narrada: lo que hace cada uno, contado. `rival` es el nombre del rival, o null si
     * lo has hecho tú. Lo del rival va en presente y sin punto (se escribe en versalitas, con su
     * frase debajo); lo tuyo, en pasado y con punto.
     */
    narra: {
      saludo: (rival: string) => `${rival} se sienta a la mesa`,
      mus: (rival: string | null, quiereMus: boolean) =>
        rival ? `${rival} ${quiereMus ? 'pide mus' : 'corta'}` : quiereMus ? 'Has pedido mus.' : 'Has cortado.',
      descarte: (rival: string | null, n: number) =>
        rival ? `${rival} pide ${letras(n)} ${n === 1 ? 'carta' : 'cartas'}` : `Has pedido ${letras(n)} ${n === 1 ? 'carta' : 'cartas'}.`,
      declara: (rival: string | null, lance: string, tiene: boolean) =>
        rival
          ? `${rival} ${tiene ? 'lleva' : 'no lleva'} ${lance.toLowerCase()}`
          : `${tiene ? 'Llevas' : 'No llevas'} ${lance.toLowerCase()}.`,
      paso: (rival: string | null) => (rival ? `${rival} pasa` : 'Has pasado.'),
      envido: (rival: string | null, n: number) => (rival ? `${rival} envida ${letras(n)}` : `Has envidado ${letras(n)}.`),
      mas: (rival: string | null, n: number) => (rival ? `${rival} sube ${letras(n)} más` : `Has subido ${letras(n)} más.`),
      quiero: (rival: string | null) => (rival ? `${rival} quiere` : 'Has querido.'),
      noQuiero: (rival: string | null) => (rival ? `${rival} no quiere` : 'No has querido.'),
      ordago: (rival: string | null) => (rival ? `¡${rival} echa un órdago!` : '¡Has echado un órdago!'),
      trato: (rival: string) => `${rival} propone un trato`,
      respuestaTrato: (acepta: boolean) => (acepta ? 'Has aceptado el trato.' : 'No has aceptado el trato.'),
      tratoHecho: (rival: string) => `${rival} cierra el trato`,
      sinTrato: (rival: string) => `${rival} se queda sin trato`,
      enfado: (rival: string) => `¡${rival} se ha enfadado!`,
      penitencia: (rival: string) => `${rival} te impone penitencia`,
      ofendida: (rival: string) => `${rival} se ofende`,
      gana: (rival: string) => `${rival} te gana el duelo`,
      pierde: (rival: string) => `${rival} se rinde`,
    },
    /** Pestaña del acta: el lance con su artículo, como se dice en la mesa. */
    lanceConArticulo: {
      grande: 'La Grande',
      chica: 'La Chica',
      pares: 'Pares',
      juego: 'El Juego',
      punto: 'El Punto',
    } satisfies Record<Lance, string>,
    /** Ficha del acta con lo que hay en juego. */
    ficha: { enJuego: 'en juego', todo: 'TODO', elDuelo: 'el duelo' },
    /** La Cara. */
    motivosCara: {
      farolCreido: 'te han creído el farol',
      enviteCobrado: 'envite con buena mano cobrado',
      farolPillado: 'te han pillado el farol',
      ordagoPerdido: 'órdago perdido',
      descanso: 'descanso',
    } satisfies Record<MotivoCara, string>,
    cambioCara: (delta: number) => `${delta > 0 ? '+' : ''}${delta}`,
    expuesto: 'SE TE NOTA',
    /**
     * Lo que pasa en la mesa, en el acta de la mano. `rival` es el nombre del rival, o null
     * si va por el jugador.
     */
    acta: {
      reparto: (n: number, rival: string | null, explicar: boolean) =>
        `Mano ${n}: ${rival ? `es mano ${rival}` : 'eres mano'}${explicar ? ' (habla primero y gana los empates)' : ''}`,
      soloUno: (rival: string | null, lance: string) =>
        rival ? `Solo ${rival} lleva ${lance.toLowerCase()}: no se envida` : `Solo tú llevas ${lance.toLowerCase()}: no se envida`,
      nadie: (lance: string) => `Nadie lleva ${lance.toLowerCase()}`,
      enPaso: (lance: string) => `${lance} en paso: se cobra en el recuento`,
      querido: (lance: string, n: number) => `${lance}: ${n} ${n === 1 ? 'piedra querida' : 'piedras queridas'}, se ven en el recuento`,
      deje: (rival: string | null, n: number, lance: string) =>
        rival ? `${lance}: ${rival} cobra ${n} por el «no quiero»` : `${lance}: cobras ${n} por el «no quiero»`,
      cara: (delta: number, motivo: string) => `Tu Cara ${delta > 0 ? '+' : ''}${delta}: ${motivo}`,
      enfadado: 'Durante dos manos lo aceptará todo',
      penitencia: 'Si gana él tu próximo envite, cobra una piedra más',
      ofendida: 'No hará tics esta mano ni la siguiente',
      seTeNota: 'Se te ha notado el pulso',
    },
    mano: (n: number) => `Mano ${n}`,
    depuracionTitulo: 'Pruebas',
    depuracionCartas: (nombre: string) => `Cartas de ${nombre}`,
    depuracionUltima: 'Última decisión',
    depuracionMemoria: (envites: number, faroles: number, racha: number, enfado: number) =>
      `Tus envites ${envites} · faroles vistos ${faroles} · racha perdida ${racha} · enfado ${enfado}`,
    depuracionReglas: (penitencia: boolean, trato: boolean, cambio: boolean, ofendida: number) =>
      `Penitencia ${penitencia ? 'sí' : 'no'} · trato ${trato ? 'usado' : 'no'} · cambio ${cambio ? 'hecho' : 'no'} · ofendida hasta mano ${ofendida}`,
    depuracionCara: (cara: number, expuesto: boolean) => `Tu Cara ${cara}${expuesto ? ' · se te nota (Cara a 0)' : ''}`,
    depuracionTic: (verdadero: boolean, significado: string) => `${significado} · ${verdadero ? 'verdad' : 'en falso'}`,
  },

  rivales: RIVALES,
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
