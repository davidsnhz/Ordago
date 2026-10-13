import type { IdCompanero } from '../datos/companeros';
import type { IdArena } from '../datos/gira';
import type { IdObjeto, TipoObjeto } from '../datos/objetos';
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
    /** Rubén y Chema, cuando se vienen arriba o se arrugan. */
    crecido?: string;
    arrugado?: string;
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
  // ——— La facultad ———
  lucia: {
    nombre: 'Lucía',
    etiqueta: 'LUCÍA',
    titulo: 'Lucía, la de primero',
    comarca: 'La facultad',
    saludo: { accion: 'HOLA', frase: '«¿Los treses eran reyes? Vale, vale, ya me acuerdo.»' },
    frases: {
      mus: ['«Mus, ¿no? Así se dice, ¿no?»', '«Mus, a ver si me tocan mejores.»'],
      corto: ['«¡Corto! Creo que estas son buenas.»', '«No, no, me quedo con estas.»'],
      descarte: ['«Fuera las feas.»', '«Estas fuera, que no sé ni qué son.»'],
      paso: ['«Paso, paso. Por si acaso.»', '«Yo de momento paso.»'],
      envido: ['«Envido. ¡Ay, que lo he dicho!»', '«Envido… ¿se hace así?»'],
      mas: ['«¿Y si subo? Subo.»', '«Más. Me lo ha dicho mi compañera de piso.»'],
      quiero: ['«Vale, lo quiero.»', '«Quiero. Creo.»'],
      noQuiero: ['«Uy, no, no quiero.»', '«Mejor que no.»'],
      ordago: ['«¡Órdago! Eso era todo o nada, ¿verdad?»'],
      declara: ['«Esto es lo que me ha tocado.»'],
      gana: '«¡He ganado! Se lo voy a contar a todo el grupo.»',
      pierde: '«Vale, me tengo que leer las reglas otra vez.»',
    },
    tics: { mordisqueaBoli: 'mordisquea el boli' },
    significadoTics: { mordisqueaBoli: 'pares o mejor' },
  },
  dani: {
    nombre: 'Dani',
    etiqueta: 'DANI',
    titulo: 'Dani, el Tuno',
    comarca: 'La facultad',
    saludo: { accion: 'CLAVELITOS', frase: '«Si gano, os canto una ronda. Si pierdo, también.»' },
    frases: {
      mus: ['«¡Mus! Que corra la música.»', '«Mus, que estas no suenan.»'],
      corto: ['«¡Corto! Esta copla me gusta.»', '«No hay mus: que siga la ronda.»'],
      descarte: ['«Estas, a desafinar a otra parte.»', '«Cambio de tono.»'],
      paso: ['«Paso, que me estoy afinando.»', '«De momento, paso.»'],
      envido: ['«¡Envido, y que suene la bandurria!»', '«Envido a ritmo de pasacalles.»'],
      mas: ['«¡Más! Otra estrofa.»', '«Subo, que esto se anima.»'],
      quiero: ['«Quiero, ¡y olé!»', '«Lo quiero, compañero.»'],
      noQuiero: ['«Esta no me la sé.»', '«No quiero, que desafino.»'],
      ordago: ['«¡Órdago, y que lo oiga toda la facultad!»'],
      declara: ['«Lo que diga la partitura.»'],
      gana: '«¡Esto se merece una serenata!»',
      pierde: '«Bien jugado. Te dedico la próxima canción.»',
    },
    tics: { rasgueaBandurria: 'rasguea la bandurria', colocaCintas: 'se coloca las cintas de la capa' },
    significadoTics: { rasgueaBandurria: 'lleva 31', colocaCintas: 'lleva duples' },
  },
  ruben: {
    nombre: 'Rubén',
    etiqueta: 'RUBÉN',
    titulo: 'Rubén, el colega de la cafetería',
    comarca: 'La facultad',
    saludo: { accion: '¿CLASE?', frase: '«¿Clase? ¿Qué clase?»' },
    frases: {
      mus: ['«Mus, tío.»', '«Mus, que estas no las quiere ni mi abuela.»'],
      corto: ['«Corto, corto.»', '«Ni mus ni nada, vamos.»'],
      descarte: ['«Fuera, fuera.»', '«Estas, a la papelera.»'],
      paso: ['«Paso, de momento.»', '«Paso, a ver qué haces.»'],
      envido: ['«Envido, y no me mires así.»', '«Envido. Como hace Chema.»'],
      mas: ['«Más. Venga, va.»', '«Subo, que hoy estoy fino.»'],
      quiero: ['«Lo quiero, sin miedo.»', '«Venga, quiero.»'],
      noQuiero: ['«Paso de eso.»', '«No quiero, no.»'],
      ordago: ['«¡Órdago! Se lo he visto hacer a Chema.»'],
      declara: ['«Lo que hay, tío.»'],
      gana: '«¡Toma! Esto se lo cuento a Chema.»',
      pierde: '«Bueno, me voy a por otro bocata.»',
      crecido: '«¡Hoy estoy que me salgo!»',
    },
    tics: { muerdeBocadillo: 'le da un mordisco al bocadillo', ajustaGorra: 'se ajusta la gorra' },
    significadoTics: { muerdeBocadillo: 'pares o mejor', ajustaGorra: 'lleva 31' },
  },
  chema: {
    nombre: 'Chema',
    etiqueta: 'CHEMA',
    titulo: 'Chema, el Repetidor',
    comarca: 'La facultad',
    saludo: { accion: 'LA CAFETA ES MÍA', frase: '«Yo aquí he aprendido más que en clase. Bueno, en clase no he estado.»' },
    frases: {
      mus: ['«Mus. Sin prisa, que no tengo examen.»', '«Mus, que estas no aprueban.»'],
      corto: ['«Corto. Esta la tengo estudiada.»', '«No hay mus. Matrícula de honor.»'],
      descarte: ['«Estas, a septiembre.»', '«Fuera, que estas suspenden.»'],
      paso: ['«Paso, como de clase.»', '«Paso. Tengo todo el curso.»'],
      envido: ['«Envido. Ocho años de cafetería, chaval.»', '«Envido, y pido otro café.»'],
      mas: ['«¿Más? Más.»', '«Subo, que esto es mi carrera.»'],
      quiero: ['«Lo quiero. A ver qué traes.»', '«Quiero, novato.»'],
      noQuiero: ['«Esta te la dejo, que eres de primero.»', '«No quiero. Por esta vez.»'],
      ordago: ['«¡Órdago! Aquí se viene a jugar, no a estudiar.»', '«¡Órdago, y que lo cuelguen en el tablón!»'],
      declara: ['«Lo tengo todo controlado.»'],
      gana: '«Ocho años en la cafetería no se tiran por la ventana.»',
      pierde: '«Vaya… A lo mejor tengo que ir a clase.»',
      crecido: '«¡Esto está hecho, novato!»',
      arrugado: '«Bueno, bueno… Con calma.»',
    },
    tics: { bajaGafas: 'se baja las gafas de sol', remueveCafe: 'remueve el café sin parar' },
    significadoTics: { bajaGafas: 'lleva una mano fuerte', remueveCafe: 'está faroleando' },
  },

  // ——— Los cinco que ya estaban ———
  ruperto: {
    nombre: 'Agustín',
    etiqueta: 'AGUSTÍN',
    titulo: 'Agustín, el Herrero',
    comarca: 'El bar',
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
    nombre: 'Doña Ignacia',
    etiqueta: 'DOÑA IGNACIA',
    titulo: 'Doña Ignacia, la Viuda',
    comarca: 'Las fiestas del pueblo',
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
    nombre: 'Don Francisco',
    etiqueta: 'DON FRANCISCO',
    titulo: 'Don Francisco, el Cura',
    comarca: 'Las fiestas del pueblo',
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
    nombre: 'Aurelio',
    etiqueta: 'AURELIO',
    titulo: 'Aurelio, el Tratante',
    comarca: 'El bar',
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
    nombre: 'Don Rodrigo',
    etiqueta: 'DON RODRIGO',
    titulo: 'Don Rodrigo, el Cacique',
    comarca: 'El casino de la capital',
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
    crecido: '¡CRECIDO!',
    ayudaCrecido: (quiereTodo: boolean) => `Va ganando de 5 o más: farolea el doble${quiereTodo ? ' y te lo quiere todo' : ''}`,
    arrugado: 'ARRUGADO',
    ayudaArrugado: 'Va perdiendo de 5 o más: no farolea y casi no quiere',
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
      crecido: (rival: string) => `${rival} se viene arriba`,
      arrugado: (rival: string) => `${rival} se arruga`,
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
      orujo: 'un orujo',
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
      crecido: (quiereTodo: boolean) => `Va ganando: farolea el doble${quiereTodo ? ' y te lo quiere todo' : ''}`,
      arrugado: 'Va perdiendo: no farolea y casi no quiere',
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

  /** La portada: empezar o seguir la gira, el duelo suelto y la Libreta. */
  portada: {
    lema: 'No gana quien lleva mejores cartas, gana quien hace creer que las lleva.',
    continuar: 'SEGUIR LA GIRA',
    vasPor: (arena: string, nivel: number) => `Vas por ${arena}, nivel ${nivel} de 4`,
    nueva: 'EMPEZAR LA GIRA',
    otraGira: 'Empezar otra gira',
    confirmar: '¿Empezar otra? La gira que llevas se pierde.',
    siEmpezar: 'SÍ, OTRA',
    no: 'NO',
    dueloSuelto: 'DUELO SUELTO',
    sueltoNota: 'Contra quien quieras, sin gira: ni Honra ni reales. Lo que veas va a la Libreta.',
    volver: 'VOLVER',
    libreta: 'LIBRETA',
  },

  arenas: {
    facultad: { nombre: 'La facultad', donde: 'La cafetería de la universidad' },
    bar: { nombre: 'El bar', donde: 'El bar de toda la vida' },
    montana: { nombre: 'La Montaña Palentina', donde: 'Una casa de pueblo' },
    fiestas: { nombre: 'Las fiestas del pueblo', donde: 'El concurso de mus' },
    casino: { nombre: 'El casino de la capital', donde: 'Terciopelo y humo' },
  } satisfies Record<IdArena, { nombre: string; donde: string }>,

  objetos: {
    orujo: { nombre: 'Orujo', efecto: '+15 de Cara al momento.', corto: '+15 de Cara' },
    chato: { nombre: 'Chato de vino', efecto: 'El rival se va de la lengua: canta su mano. Vale para esa mano.', corto: 'el rival canta su mano' },
    conversacion: { nombre: 'Darle conversación', efecto: 'El rival se distrae: en esta mano no puede tirar órdago.', corto: 'no puede tirar órdago' },
    medalla: { nombre: 'Medalla de la Virgen', efecto: 'La primera vez en cada duelo que te pillan un farol, tu Cara no baja.', corto: 'un farol pillado, gratis' },
    boina: { nombre: 'Boina de la suerte', efecto: 'Ganas los empates aunque no seas mano.', corto: 'empates a tu favor' },
    apuntesChema: {
      nombre: 'Los Apuntes de Chema',
      efecto: 'Una vez por duelo, te explican el próximo tic del rival.',
      corto: 'te explican un tic',
    },
  } satisfies Record<IdObjeto, { nombre: string; efecto: string; corto: string }>,
  tiposObjeto: { bebida: 'BEBIDA', jugarreta: 'JUGARRETA', amuleto: 'AMULETO', raro: 'OBJETO RARO' } satisfies Record<TipoObjeto, string>,

  companeros: {
    lazarillo: {
      nombre: 'El Lazarillo',
      pasiva: 'La Libreta se rellena el doble de rápido.',
      sena: 'Te enseña una carta del rival.',
      corto: 'te enseña una carta',
    },
    recaudadora: {
      nombre: 'La Recaudadora',
      pasiva: '+2 reales por cada duelo que ganes.',
      sena: 'Si ganas el próximo órdago, cobras el triple de reales.',
      corto: 'órdago al triple',
    },
  } satisfies Record<IdCompanero, { nombre: string; pasiva: string; sena: string; corto: string }>,

  libreta: {
    titulo: 'LA LIBRETA',
    nota: 'Lo que has visto de cada rival. Se queda de una gira a otra.',
    vacia: 'Todavía no has apuntado nada. Fíjate en sus gestos y espera a ver sus cartas en el recuento.',
    nivel1: (gesto: string) => `${gesto}… ¿qué querrá decir?`,
    nivel2: (gesto: string, significado: string) => `${gesto}… ¿${significado}?`,
    nivel3: (gesto: string, significado: string, deCadaDiez: number) => `${gesto}: ${significado} (acierta ${deCadaDiez} de cada 10)`,
    cerrar: 'CERRAR',
  },

  gira: {
    hud: { honra: 'Honra', reales: 'Reales', cara: 'Cara' },
    reales: (n: number) => `${n} r.`,

    elegir: {
      titulo: '¿Con quién vas?',
      nota: 'Te acompaña en la gira. En la taberna se puede cambiar.',
      siempre: 'Siempre',
      sena: (n: number) => `Su seña · ${n} por duelo`,
      porDesbloquear: (n: number) => `Por desbloquear · ${n}`,
      pista: 'El Tahúr: gana 3 faroles en un mismo duelo.',
      empezar: 'EMPEZAR LA GIRA',
    },

    mapa: {
      arena: (n: number, nombre: string) => `ARENA ${n} · ${nombre.toUpperCase()}`,
      cerrada: (jefe: string) => `Gana a ${jefe} para entrar`,
      aquiEstas: 'AQUÍ ESTÁS',
      jefe: 'JEFE',
      nivel: (n: number) => `Nivel ${n} de 4`,
      gana: (reales: number) => `ganarle da ${reales} reales`,
      otraVez: 'otra vez',
      aLaMesa: '¡A LA MESA!',
      libreta: 'Libreta',
      salir: 'Salir',
      reglas: { chema: 'Se viene arriba' } as Partial<Record<IdRival, string>>,
      ayudaRegla: { chema: 'Si va ganando de 5 se crece y farolea; si va perdiendo, se arruga.' } as Partial<Record<IdRival, string>>,
    },

    mesa: {
      salir: 'SALIR',
      salirAyuda: 'Salir a la portada. Se guarda al final de cada mano.',
      portada: 'PORTADA',
    },

    bolsa: {
      boton: 'BOLSA',
      titulo: 'Tu bolsa',
      cerrar: 'Cerrar',
      sena: 'SEÑA',
      usar: 'USAR',
      senaDe: (nombre: string, quedan: number, total: number) => `${nombre} · seña ${quedan} de ${total}`,
      vacia: 'No llevas nada que usar. En la taberna venden bebidas y jugarretas.',
      puesto: 'siempre puesto',
    },

    /** Lo que se cuenta en el acta al usar algo de la bolsa. */
    narra: {
      orujo: 'Te has tomado un orujo.',
      chato: (rival: string) => `${rival} se va de la lengua: canta su mano`,
      conversacion: (rival: string) => `Le das conversación a ${rival}: esta mano no tirará órdago`,
      apuntes: 'Abres los Apuntes de Chema: el próximo tic te lo explican.',
      lazarillo: (rival: string, carta: string) => `El Lazarillo te enseña una carta de ${rival}: ${carta}.`,
      recaudadora: 'La Recaudadora apunta: si ganas el próximo órdago, cobras el triple.',
      medalla: 'La Medalla de la Virgen te salva: este farol no te baja la Cara.',
      explicado: (significado: string) => `Los Apuntes dicen: ${significado}`,
    },

    finDuelo: 'SEGUIR',

    resultado: {
      gana: (rival: string) => `¡HAS GANADO A ${rival.toUpperCase()}!`,
      pierde: (rival: string) => `${rival.toUpperCase()} TE HA GANADO`,
      tanteo: (tu: number, el: number) => `${tu} a ${el}`,
      cobras: 'Lo que cobras',
      lineas: {
        duelo: (nivel: number) => `Duelo ganado (nivel ${nivel})`,
        consolacion: 'Duelo perdido: consolación',
        envites: (n: number) => `Envites aceptados y ganados · ${n}`,
        faroles: (n: number) => (n === 1 ? 'Un farol que coló' : `Faroles que colaron · ${n}`),
        ordagos: (n: number) => (n === 1 ? 'Órdago ganado' : `Órdagos ganados · ${n}`),
        triple: 'Órdago al triple (la Recaudadora)',
        recaudadora: 'La Recaudadora',
        forastero: (ganada: boolean) => (ganada ? 'Apuesta del forastero: ganada' : 'Apuesta del forastero: perdida'),
      },
      total: 'Total',
      totalReales: (n: number) => `+${n} ${n === 1 ? 'real' : 'reales'}`,
      reales: 'Reales',
      honra: 'Honra',
      cara: 'Tu Cara',
      pierdeHonra: 'Pierdes 1 de Honra',
      libreta: 'Apuntado en la Libreta',
      ahora: '¿Y ahora, adónde?',
      paradas: {
        taberna: { nombre: 'La taberna', texto: 'Comprar bebidas, jugarretas, amuletos o un compañero' },
        plaza: { nombre: 'La plaza', texto: 'Algo pasa: una apuesta, un timador… o una monja' },
        era: { nombre: 'La era', texto: 'Descansas: +20 de Cara' },
      },
      despues: (rival: string, nivel: number) => `Después: ${rival} · nivel ${nivel} de 4`,
      otraVez: (rival: string) => `Después: otra vez ${rival}`,
      premio: 'ELEGIR PREMIO',
      sinHonra: 'VER CÓMO HA IDO',
    },

    taberna: {
      titulo: 'LA TABERNA',
      frase: '«¿Qué va a ser, forastero? Aquí se fía… pero poco.»',
      tabernera: 'TABERNERA',
      deUnUso: 'De un uso · bebidas y jugarretas',
      gira: 'Para toda la gira · amuletos y compañeros',
      comprar: (precio: number) => `COMPRAR · ${precio} r.`,
      vender: (precio: number) => `VENDER · ${precio} r.`,
      otraRonda: (precio: number) => `OTRA RONDA · ${precio} r.`,
      salir: 'SALIR',
      bolsa: 'Tu bolsa',
      huecos: { unUso: 'De un uso', amuletos: 'Amuletos', baraja: 'Baraja', companero: 'Compañero' },
      vendida: 'VENDIDO',
      sinDinero: 'No te llega',
      sinHueco: 'No te cabe: vende algo antes',
      toca: 'Toca algo de las baldas para ver qué hace, o algo de tu bolsa para venderlo.',
      companero: 'COMPAÑERO',
      cambiaCompanero: (viejo: string, devuelve: number) => `${viejo} se despide y te deja ${devuelve} r.`,
      tuyo: 'Lo llevas tú',
    },

    plaza: {
      titulo: 'LA PLAZA',
      seguir: 'SEGUIR',
      no: 'NO, GRACIAS',
      /** Lo que pone en el dibujo provisional de cada suceso. */
      marca: { forastero: 'FORASTERO', fiesta: 'FIESTA', timador: 'TIMADOR', monja: 'MONJA' },
      forastero: {
        titulo: 'Un forastero apuesta contigo',
        texto: (apuesta: number, premio: number) =>
          `Se juega ${apuesta} reales a que no ganas el próximo duelo sin perder ni un lance de Grande. Si lo consigues, cobras ${premio}.`,
        aceptar: (apuesta: number) => `APUESTO · ${apuesta} r.`,
        sinDinero: 'No llevas reales para apostar.',
        aceptada: 'Hecho. Se verá en el próximo duelo.',
        rechazada: 'El forastero se encoge de hombros y se va.',
      },
      fiesta: {
        titulo: '¡Fiesta patronal!',
        texto: (piedras: number) => `En el próximo duelo los dos empezáis con ${piedras} piedras. Duelo más corto y más loco.`,
        aceptar: 'A LA FIESTA',
        hecho: 'Que suene la charanga.',
      },
      timador: {
        titulo: 'Un timador',
        texto: (objeto: string, precio: number) => `Te ofrece ${objeto} a mitad de precio: ${precio} reales. Jura que es auténtico.`,
        aceptar: (precio: number) => `COMPRAR · ${precio} r.`,
        no: 'NO ME FÍO',
        falso: (objeto: string) => `¡Era falso! ${objeto} se rompe en cuanto te lo da.`,
        bueno: (objeto: string) => `Pues era de verdad: ${objeto} a tu bolsa.`,
        rechazado: 'El timador busca a otro.',
        sinHueco: 'No te cabe: llevas los dos huecos de amuletos llenos.',
        sinDinero: 'No te llega.',
      },
      monja: {
        titulo: 'Una monja te bendice',
        texto: 'Te para en la plaza, te bendice y te desea suerte.',
        aceptar: 'AMÉN',
        hecho: 'Ganas 1 de Honra.',
      },
    },

    era: {
      titulo: 'LA ERA',
      texto: 'Te tumbas en la paja un rato y se te pasan los nervios.',
      cara: (antes: number, despues: number) => `Tu Cara: ${antes} → ${despues}`,
      seguir: 'SEGUIR',
    },

    premio: {
      titulo: (jefe: string) => `¡HAS GANADO A ${jefe.toUpperCase()}!`,
      elige: 'Elige tu premio',
      companero: 'Un compañero nuevo',
      cambia: (viejo: string, devuelve: number) => `${viejo} se despide y te deja ${devuelve} r.`,
      raro: 'Su objeto raro',
      honra: '+1 de Honra',
      honraTexto: 'Recuperas una vida.',
      honraLlena: 'Ya tienes toda la Honra.',
      sinHueco: 'No te cabe: llevas los dos huecos de amuletos llenos.',
      yaLoTienes: 'Ya lo llevas.',
      elegir: 'ELEGIR',
    },

    fin: {
      victoria: '¡HAS SUPERADO LA FACULTAD!',
      victoriaTexto: 'El bar abre en la próxima versión. De momento, la gira acaba aquí.',
      derrota: 'TE HAS QUEDADO SIN HONRA',
      derrotaTexto: 'La gira se acaba. Vuelves al principio desde cero; lo que has apuntado en la Libreta se queda.',
      duelos: (ganados: number, jugados: number) => `Duelos ganados: ${ganados} de ${jugados}`,
      reales: (n: number) => `Reales ganados: ${n}`,
      otra: 'OTRA GIRA',
      portada: 'PORTADA',
    },
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
