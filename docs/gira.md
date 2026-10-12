# Órdago — La gira

12 de octubre de 2026 · @david · *versión 1: arenas, jefes, secuaces, taberna, objetos y compañeros*

> **Para qué sirve este documento.** Es el catálogo de ideas de la gira: las arenas, quién juega en cada nivel, la taberna, los objetos y los compañeros. Está hecho para cambiarlo: quita, añade o retoca lo que quieras. Las reglas de fondo (las apuestas, los tics, la Cara, la IA) están en el [documento de diseño](diseno-juego.md); aquí va el contenido.
>
> Lo que ya estaba en el documento de diseño va tal cual. Lo que es idea nueva lleva **[nuevo]** y lo que cambia algo de antes, **[cambiado]**. Los números (precios, reales, parámetros) son un punto de partida: se ajustan jugando.

## 1. Cómo es una gira

- **La gira es la partida entera:** 5 arenas, una detrás de otra, de Tierra de Campos al casino de la capital. Son 20 duelos y dura algo más de una hora.
- **Cada duelo es una partida corta:** a 20 piedras, entre 2 y 4 minutos, como una partida de Clash Royale.
- **[nuevo] Cada arena tiene 4 niveles**, como las ciegas de Balatro: tres secuaces y su jefe. Se juegan en orden, de menos a más:

| Nivel | Quién | Cómo es |
| --- | --- | --- |
| 1 | Primer secuaz | El más flojo. Un solo tic de verdad y, como mucho, una manía sencilla. Sirve para calentar |
| 2 | Segundo secuaz | Dos tics y una manía pequeña |
| 3 | La mano derecha del jefe | Juega parecido a su jefe y tiene una manía que anuncia la regla del jefe. Si le ganas, ya sabes lo que te espera |
| 4 | El jefe | Uno de los cinco rivales que ya están en el juego, con su regla especial completa |

- **[nuevo] Al entrar en una arena ya ves al jefe y su regla**, como en Balatro, que te enseña la ciega jefe desde el principio. Así preparas la taberna. *Ejemplo: sabes que Doña Engracia no acepta órdagos antes de la tercera mano, así que no gastas reales en la Navaja de Albacete (que premia los órdagos).*
- **Entre duelo y duelo eliges una parada:** la taberna (comprar), la plaza (pasa algo) o la era (recuperas Cara). Ver el apartado 3.
- **Honra: 3 vidas.**
  - Perder contra un secuaz te quita 1 de Honra y no cobras ese duelo, pero sigues al siguiente nivel.
  - Perder contra el jefe, o quedarte sin Honra, acaba la gira.
  - Al acabar la gira vuelves al principio, desde cero. Solo te llevas la Libreta (lo que has aprendido de cada rival) y lo que hayas desbloqueado.
- **[cambiado] Reales por duelo ganado:** 4 el primer secuaz, 5 el segundo, 6 la mano derecha y 10 el jefe. Se suman los de siempre: +1 por envite aceptado y ganado, +1 por farol que cuela y +5 por órdago ganado. Perder un duelo da 2 de consolación.
- **[cambiado] Ganar al jefe:** eliges un premio entre tres (un compañero, el objeto raro de ese jefe, o +1 de Honra si te falta) y se abre la siguiente arena.
- **[nuevo] Idea: pasar de largo.** Antes de los niveles 1 y 2 puedes saltarte al secuaz: no juegas, no cobras y no arriesgas Honra, pero te llevas un favor (un objeto de un uso, gratis y al azar). Es lo de saltarse una ciega en Balatro: ganas tiempo y un regalo, pero pierdes los reales.

### El mapa

Como las arenas de Clash Royale: un camino en vertical que se va subiendo con el dedo. Cada arena es un tramo con su paisaje y cuatro paradas en el camino, una por nivel. El jefe está arriba del todo, con su retrato. Los niveles ganados quedan marcados y los perdidos, con la Honra rota. La arena siguiente está tapada por la niebla hasta que ganas al jefe.

## 2. Las arenas

| Arena | Paisaje | Jefe | Lo que enseña |
| --- | --- | --- | --- |
| 1. Tierra de Campos | Adobe, palomares, trigo, sol de tarde | Ruperto, el Herrero | Los tics existen y leerlos funciona |
| 2. Montaña Palentina | Piedra, nieve, chimenea, lana | Doña Engracia, la Viuda | No siempre se gana engañando: cobra poco a poco y respeta sus envites |
| 3. Ribera del Duero | Bodegas bajo tierra, barricas, velas | Don Anselmo, el Cura | El rival se acuerda de tus faroles: dosifícalos |
| 4. Feria de ganado | Carpa, paja, mulas, bullicio | Fulgencio, el Tratante | No todos los tics significan algo: atrévete a querer |
| 5. Casino de la capital | Terciopelo, lámparas, humo | Don Bonifacio, el Cacique | Todo lo aprendido junto |

**Cómo leer las fichas.** Los números son los cinco parámetros de la IA, de 0 a 10, como en el documento de diseño: **A** agresividad (cuánto envida con buenas cartas), **F** faroleo, **M** miedo al órdago, **Me** memoria (cuánto se acuerda de tus faroles) y **O** ojo (cuánto te pilla). Cada tic dice qué lo provoca y cuántas veces de cada 10 acierta.

Los secuaces son todos **[nuevo]**. Cada uno necesita su hoja de personaje; mientras no la tenga, sale con un marcador.

---

### Arena 1 · Tierra de Campos

Llanura de trigo, palomares de adobe y sol de tarde. Aquí todos juegan claro: lo que llevan se les ve en la cara. Es la arena para aprender que los tics existen.

#### Nivel 1 · Paco, el Mozo de la era

- **Aspecto:** chaval, sombrero de paja, camisa remangada y una espiga en la boca.
- **Cómo juega:** envida cuando lleva algo y casi nunca farolea. Quiere poco. · A 5 · F 1 · M 3 · Me 1 · O 1
- **Tic:** mordisquea la espiga más deprisa → lleva pares o mejor (9 de cada 10).
- **Manía:** ninguna.
- **Frase:** «Yo no sé mentir, que me lo dice mi madre.»

#### Nivel 2 · Tomasa, la Palomera

- **Aspecto:** pañuelo a la cabeza, delantal de cuadros y una paloma en el hombro.
- **Cómo juega:** tranquila. Le encanta cambiar cartas. · A 4 · F 2 · M 4 · Me 2 · O 2
- **Tics:**
  - La paloma se esponja y arrulla → lleva 31 (8 de cada 10).
  - Se le escapa la risa → lleva duples (8 de cada 10).
- **Manía:** pide mus siempre la primera vez de cada mano. Cortar o no, lo decides tú.
- **Frase:** «Las palomas siempre vuelven. Las piedras, también.»

#### Nivel 3 · Nicasio, el Aprendiz (mano derecha de Ruperto)

- **Aspecto:** joven y fornido, tizne en la cara, mandil de cuero pequeño y las tenazas al cinto.
- **Cómo juega:** imita a su maestro: envida fuerte y quiere los órdagos por orgullo. · A 7 · F 2 · M 3 · Me 1 · O 2
- **Tics:**
  - Se seca el sudor de la frente → lleva pares o mejor (8 de cada 10).
  - Aprieta el puño → lleva 31 (8 de cada 10).
- **Manía: «Se pica».** Si pierde 2 lances seguidos, en la mano siguiente te lo quiere todo. Es el enfado de Ruperto en pequeño.
- **Frase:** «El maestro dice que el mus se gana a martillazos.»

#### Nivel 4 · Ruperto, el Herrero (jefe)

- **Cómo juega:** bruto y directo. Envida fuerte, sube mucho y casi nunca farolea. · A 8 · F 3 · M 2 · Me 2 · O 2
- **Tics:** se rasca la barba (lleva pares o mejor) y se arremanga (lleva 31).
- **Regla:** si pierde 3 lances seguidos se enfada y durante 2 manos te lo quiere todo.
- **[nuevo] En la gira, «viene avisado»:** si le ganaste a Nicasio por 10 piedras o más, Ruperto empieza el duelo picado y la primera mano te lo quiere todo.
- **Premio, su objeto raro:** el Martillo de Ruperto (ver objetos raros).
- **Frase:** «Aquí se juega como se forja: a golpes.»

---

### Arena 2 · Montaña Palentina

Piedra, nieve y chimeneas encendidas. Gente paciente y desconfiada que farolea poco y te mira mucho. Aquí se aprende a cobrar poco a poco y a no mirar demasiado.

#### Nivel 1 · Celedonio, el Leñador

- **Aspecto:** gorro de lana, barba con escarcha, chaquetón de borrego y el hacha al hombro.
- **Cómo juega:** prudente. Casi no farolea y le cuesta querer los envites grandes. · A 3 · F 1 · M 7 · Me 2 · O 3
- **Tic:** se sopla las manos → lleva una mano fuerte en algún lance (8 de cada 10).
- **Manía:** ninguna.
- **Frase:** «Aquí arriba, el que se precipita se despeña.»

#### Nivel 2 · Doña Pura, la Maestra

- **Aspecto:** moño, rebeca, gafas en la punta de la nariz y una regla de madera.
- **Cómo juega:** se fija en todo lo que haces. · A 4 · F 2 · M 6 · Me 4 · O 5
- **Tics:**
  - Se sube las gafas → lleva juego (8 de cada 10).
  - Da golpecitos con la regla → sospecha que faroleas, porque tu Cara está baja (8 de cada 10).
- **Manía: «Te corrige».** Si la miras más de 3 segundos, te pilla y deja de hacer tics en lo que queda de mano.
- **Frase:** «A ver, ¿qué se dice? Paso, por favor.»

#### Nivel 3 · Fermina, la Cuñada (mano derecha de Doña Engracia)

- **Aspecto:** de negro como su cuñada, chal de lana, un ovillo y las agujas de punto.
- **Cómo juega:** como Doña Engracia, pero menos fina: no farolea y quiere poco. · A 3 · F 1 · M 8 · Me 5 · O 6
- **Tics:**
  - Tira del hilo del ovillo → lleva una mano fuerte (8 de cada 10).
  - Cuenta los puntos en voz baja → lleva 31 (7 de cada 10).
- **Manía:** no acepta un órdago en la primera mano. Doña Engracia aguanta hasta la tercera.
- **Frase:** «Mi cuñada ya me ha contado cómo juegas.»

#### Nivel 4 · Doña Engracia, la Viuda (jefa)

- **Cómo juega:** paciente y desconfiada. Casi nunca farolea; cuando envida, lleva cartas. · A 3 · F 1 · M 9 · Me 6 · O 7
- **Tics:** pasa las cuentas del rosario más deprisa (lleva una mano fuerte) y te mira fijamente (sospecha que faroleas).
- **Reglas:** no acepta un órdago antes de la tercera mano. Si la miras más de 2 segundos, se da cuenta 7 de cada 10 veces, se ofende y deja de hacer tics en lo que queda de mano y en la siguiente.
- **[nuevo] En la gira, «lo sabe por su cuñada»:** si Fermina te pilló mirándola, Doña Engracia empieza el duelo ofendida.
- **Premio, su objeto raro:** el Rosario de Doña Engracia.
- **Frase:** «Treinta años jugando con mi difunto. A mí no me la das.»

---

### Arena 3 · Ribera del Duero

Bodegas bajo tierra, barricas y velas. Aquí se acuerdan de todo: si faroleas mucho, dejan de creerte. Se aprende a dosificar los faroles.

#### Nivel 1 · Eusebio, el Monaguillo

- **Aspecto:** chaval con sotana corta, roquete blanco y una campanilla.
- **Cómo juega:** nervioso. Farolea poco y quiere bastante. · A 4 · F 2 · M 4 · Me 4 · O 3
- **Tic:** se le escapa la campanilla → lleva duples (8 de cada 10).
- **Manía: «Se chiva».** Si te pilla un farol, se lo cuenta al cura, y empiezas el duelo con Don Anselmo con la penitencia puesta.
- **Frase:** «No se lo diga al padre, que me castiga.»

#### Nivel 2 · Cosme, el Bodeguero

- **Aspecto:** boina, mandil manchado de vino, nariz colorada y un porrón.
- **Cómo juega:** alegre, y cada vez más farolero. · A 5 · F 5 · M 4 · Me 5 · O 4
- **Tics:**
  - Huele el corcho → lleva juego (8 de cada 10). En la Ribera, el vino es el juego: Don Anselmo también bebe cuando lo lleva.
  - Se le ponen los mofletes colorados → está faroleando (7 de cada 10).
- **Manía: «Cuanto más bebe, peor juega».** Echa un trago en cada mano: su Ojo baja 1 y su Faroleo sube 1. Al principio cuesta ganarle; al final, se le ve todo.
- **Frase:** «Un vino de la Ribera y una buena mano. Lo demás, sobra.»

#### Nivel 3 · Doña Rosario, el ama del cura (mano derecha de Don Anselmo)

- **Aspecto:** delantal blanco, moño, mangas remangadas y un cucharón.
- **Cómo juega:** lleva la cuenta de todo. Como Don Anselmo, deja de creerte si le faroleas. · A 5 · F 4 · M 5 · Me 7 · O 5
- **Tics:**
  - Se seca las manos en el delantal → lleva duples (8 de cada 10).
  - Suspira → está faroleando (7 de cada 10).
- **Manía:** envida siempre a la Grande cuando habla sin envite delante. Es como Don Anselmo con la Chica, pero al revés.
- **Frase:** «En esta casa se reza, se guisa y se juega al mus. Por ese orden.»

#### Nivel 4 · Don Anselmo, el Cura (jefe)

- **Cómo juega:** equilibrado y con buena memoria: si le faroleas dos veces, deja de creerte. · A 5 · F 5 · M 5 · Me 7 · O 5
- **Tics:** bebe un sorbo de vino (lleva juego), mira al cielo (está faroleando) y junta las manos (lleva duples).
- **Manía:** envida siempre a la Chica, lleve lo que lleve.
- **Regla, «Penitencia»:** si te pilla un farol, tu próximo envite le paga 1 piedra más si lo gana él.
- **En la gira:** si Eusebio se chivó, empiezas con la penitencia puesta (ver Eusebio).
- **Premio, su objeto raro:** la Bula de Don Anselmo.
- **Frase:** «Dios lo ve todo, hijo. Yo, casi todo.»

---

### Arena 4 · Feria de ganado

Carpa, paja, mulas y mucho ruido. Aquí todos mienten, y algunos tics no quieren decir nada. Se aprende a atreverse a querer.

#### Nivel 1 · Melquíades, el Charlatán

- **Aspecto:** bombín, bigote engominado, chaleco de cuadros y un frasco de elixir.
- **Cómo juega:** farolea mucho y envida fuerte. · A 6 · F 7 · M 4 · Me 3 · O 3
- **Tics:**
  - Se atusa el bigote → está faroleando (8 de cada 10).
  - Agita el frasco → nada: es un tic falso, sale 1 de cada 7 veces sin motivo. Es el primer tic falso de la gira.
- **Manía:** ninguna.
- **Frase:** «¡Un elixir que cura el reuma, la calvicie y las malas manos!»

#### Nivel 2 · Doña Fausta, la Churrera

- **Aspecto:** cofia y delantal blancos, brazos fuertes y el perol de churros detrás.
- **Cómo juega:** lista y regateadora. · A 5 · F 6 · M 5 · Me 4 · O 5
- **Tics:**
  - Se limpia el aceite de las manos → lleva una mano fuerte (7 de cada 10).
  - Se ríe a carcajadas → está faroleando (6 de cada 10).
- **Manía: «Regatea».** Una vez por duelo, cuando le envidas 4 o más, te propone dejarlo en la mitad. Si aceptas, queda querido a la mitad; si no, decide como siempre. *Ejemplo: le envidas seis a la Grande y te dice «¿lo dejamos en tres?».* Es el trato de Fulgencio en pequeño.
- **Frase:** «A dos reales la docena, y a ti te los dejo en uno y medio.»

#### Nivel 3 · Tiburcio, el Gancho (mano derecha de Fulgencio)

- **Aspecto:** gorra de visera, chaqueta de pana y un palillo en la boca.
- **Cómo juega:** el compinche de Fulgencio. Farolea casi tanto como él. · A 7 · F 8 · M 4 · Me 5 · O 6
- **Tics:**
  - Se rasca la oreja → lleva una mano fuerte (7 de cada 10).
  - Mira de reojo hacia la carpa → nada, es un tic falso (sale 1 de cada 5 veces).
- **Manía: «Habla por los codos».** A veces dice en voz alta lo que lleva («¡Menudos pares llevo!») y la mitad de las veces es mentira.
- **Frase:** «Yo a ese señor del sombrero no le conozco de nada.»

#### Nivel 4 · Fulgencio, el Tratante (jefe)

- **Cómo juega:** mentiroso profesional. Farolea más que nadie y tira órdagos sin nada. · A 7 · F 9 · M 4 · Me 5 · O 6
- **Tics:** sonríe enseñando el diente de oro (está faroleando), se pone serio y se quita el sombrero (lleva cartas muy buenas) y golpea la vara (falso).
- **Regla, «Trato»:** una vez por duelo, antes del recuento, te propone retirar los envites queridos y repartiros las piedras. La impar es para él.
- **[nuevo] En la gira, «el gancho le ha contado»:** si aceptaste el regateo de Doña Fausta, Fulgencio te propone el trato dos veces en vez de una.
- **Premio, su objeto raro:** la Vara de Fulgencio.
- **Frase:** «Esta mula vale lo que yo diga que vale. Y esta mano, también.»

---

### Arena 5 · Casino de la capital

Terciopelo, lámparas y humo de puro. Aquí juegan los que lo saben todo de ti. Es el examen final: hay que usar todo lo aprendido.

#### Nivel 1 · Leandro, el Crupier

- **Aspecto:** chaleco, pajarita, visera verde y manguitos.
- **Cómo juega:** frío y equilibrado. Se le ve poco. · A 5 · F 5 · M 5 · Me 6 · O 6
- **Tic:** se ajusta la pajarita → lleva una mano fuerte (7 de cada 10).
- **Manía: «La casa gana los empates».** Gana los empates a la Grande aunque no sea mano, como Don Bonifacio.
- **Frase:** «Hagan juego, señores. Bueno, señor.»

#### Nivel 2 · Doña Leonor, la Cupletista

- **Aspecto:** vestido de lentejuelas, boa de plumas, abanico y un lunar pintado.
- **Cómo juega:** alegre y lista. A mitad del duelo cambia de estilo. · A 5 · F 6 · M 5 · Me 7 · O 7
- **Tics:**
  - Se abanica deprisa → lleva una mano fuerte (7 de cada 10).
  - Cierra el abanico de golpe → está faroleando (7 de cada 10).
- **Manía: «Cambia de copla».** Desde que alguno de los dos llega a 10 piedras, sus tics significan lo contrario: abanicarse deprisa pasa a ser farol, y cerrar el abanico, mano fuerte. Anuncia lo que hace Don Bonifacio, que cambia de tics a mitad del duelo.
- **Frase:** «Ay, caballero, que me va usted a sacar los colores.»

#### Nivel 3 · Don Ceferino, el Secretario (mano derecha de Don Bonifacio)

- **Aspecto:** traje gris, gafas redondas, manguitos negros, un libro de cuentas y una pluma.
- **Cómo juega:** como su jefe, sabe mucho de ti. · A 6 · F 5 · M 6 · Me 9 · O 8
- **Tics:**
  - Moja la pluma en el tintero → lleva juego (7 de cada 10).
  - Se coloca las gafas → está faroleando (7 de cada 10).
- **Manía: «Lleva las cuentas».** Empieza el duelo acordándose de tus faroles de toda la gira, no solo de ese duelo. Si has faroleado mucho, no te cree desde la primera mano. Anuncia que Don Bonifacio lee tu Libreta.
- **Frase:** «Don Bonifacio quiere saber cuánto lleva usted ganado. Por curiosidad.»

#### Nivel 4 · Don Bonifacio, el Cacique (jefe final)

- **Cómo juega:** lo sabe todo de ti y adapta su estilo al tuyo. · A 6 · F 6 · M 6 · Me 10 · O 9
- **Tics:** empieza con los del Herrero; a las 10 piedras cambia a los del Cura; a las 15 ya no tiene tics, pero su puro echa más humo cuando lleva cartas buenas.
- **Reglas:**
  - «Casa»: es mano en el primer reparto y gana los empates a la Grande.
  - «Cartas de la casa»: una vez por duelo cambia en secreto su carta más baja por la más alta del mazo. Si le pillas (con el Alguacil, o con mucho Ojo), te llevas 5 piedras.
  - Lee tu Libreta: conoce los tics que has apuntado y juega al revés de lo que esperas.
- **Premio:** ganarle completa la gira y desbloquea la dificultad siguiente y al Forastero.
- **Frase:** «En este pueblo no se mueve una carta sin que yo lo sepa.»

---

### [nuevo] Ideas para más arenas

Para más adelante, si se quiere una gira más larga o un modo infinito como el de Balatro:

- **La Mancha:** molinos, llanura y viento. Jefe: *el Hidalgo*, que juega a lo grande y tira órdagos imposibles.
- **Tierra de Pinares (Soria):** pinos, resina y serrerías. Jefa: *la Resinera*, que te deja pegado: no puedes pedir mus más de una vez.
- **La Maragatería (León):** arrieros, cecina y caminos de piedra. Jefe: *el Arriero*, que va de pueblo en pueblo y ya sabe lo que has hecho en las otras arenas.
- **Más secuaces por arena**, de los que salen 3 al azar, para que dos giras no se jueguen igual.

## 3. Las paradas

Entre duelo y duelo eliges una de las tres.

### La taberna

**[nuevo] Cómo funciona,** al estilo de la tienda de Balatro:

- En cada visita hay **4 cosas a la venta**: 2 de un uso (bebidas o jugarretas), 1 amuleto o baraja y, una de cada tres veces, un compañero.
- **«Otra ronda»:** cambia lo que hay a la venta. La primera vez cuesta 2 reales y cada vez, 1 más.
- **Vender:** cualquier objeto se vende por la mitad de lo que costó, redondeando hacia abajo.
- **Huecos:** 3 para objetos de un uso, 4 para amuletos, 1 para la baraja y 1 para el compañero. Si están llenos, hay que vender algo para comprar.
- La tabernera atiende con su frase («¿Qué va a ser?»). Su arte está pendiente.

### La plaza

**[nuevo] Ideas de cosas que pasan** (sale una al azar):

- **Un forastero apuesta contigo:** te juegas 5 reales a que ganas el próximo duelo sin perder ni un lance de Grande. Si lo consigues, cobras 15.
- **Fiesta patronal:** en el próximo duelo, los dos empezáis con 5 piedras. Duelo más corto y más loco.
- **Un timador** te vende un amuleto a mitad de precio. La mitad de las veces es falso y no hace nada.
- **El cura de paso** te bendice: tu próximo farol pillado no te baja la Cara.
- **Una partida en la calle:** una mano suelta contra un vecino. Si la ganas, 3 reales; si la pierdes, nada.

### La era

Descansas: **+20 de Cara.** Si tu Cara está a 0, además se te quita el «se te nota».

## 4. Objetos

| Tipo | Qué son | Duración | Huecos |
| --- | --- | --- | --- |
| Bebidas | Te ayudan a ti | Un uso, durante un duelo | 3, compartidos con las jugarretas |
| **[nuevo]** Jugarretas | Fastidian al rival | Un uso, durante un duelo | Los mismos 3 |
| Amuletos | Pasivos; unos te ayudan y otros van contra el rival | Toda la gira | 4 |
| Barajas | Cambian la baraja | Toda la gira | 1 |
| **[nuevo]** Objetos raros | El premio de cada jefe | Toda la gira | Ocupan un hueco de amuleto |

### Bebidas (a tu favor)

| Objeto | Qué hace | Precio |
| --- | --- | --- |
| Chato de vino | El rival hace sus tics con más claridad durante 3 manos | 3 |
| Orujo | +15 de Cara al momento | 4 |
| Café de puchero | Una ronda de mus extra en la mano actual | 3 |
| Gaseosa | Repites tu última decisión de «quiero» o «no quiero» (la deshaces y decides otra vez, antes de que se vean las cartas) | 6 |
| **[nuevo]** Copa de anís | En esta mano ganas los empates, aunque no seas mano | 3 |
| **[nuevo]** Agua del botijo | Se te quita el «se te nota» durante 3 manos | 2 |
| **[nuevo]** Caldo de la abuela | Si pierdes este duelo, no pierdes Honra. No vale contra el jefe | 8 |

### [nuevo] Jugarretas (contra el rival)

| Objeto | Qué hace | Precio |
| --- | --- | --- |
| Invitar a una ronda | El rival rechaza tu próximo envite, lleve lo que lleve (estaba en las bebidas) | 5 |
| Darle conversación | El rival se distrae: en esta mano no puede tirar órdago | 4 |
| Pisotón por debajo de la mesa | En esta mano el rival no puede subir: solo quiere o no quiere | 4 |
| Silla coja | En la mano siguiente, el rival pierde la mano: la mano eres tú | 3 |
| Echarle orujo al café | El rival se achispa: durante 3 manos farolea el doble y no te pilla nada (Ojo 0) | 6 |
| Hacerle la pelota | El rival se confía: durante 2 manos te quiere más los envites, como si tu Cara estuviera 30 puntos más baja. *Ideal cuando llevas duples y quieres cobrar* | 4 |

### Amuletos a tu favor

| Objeto | Qué hace | Precio |
| --- | --- | --- |
| Boina de la suerte | Ganas los empates aunque no seas mano | 8 |
| Navaja de Albacete | Los órdagos que ganas dan +1 de Honra (máximo 3) | 12 |
| Pañuelo de hierbas | Ves si el rival tiene pares antes de que lo declare | 9 |
| Reloj de bolsillo | Los rivales tardan más en decidir y sus tics duran más | 7 |
| Gafas de culo de vaso | +1 nota automática en la Libreta por duelo | 6 |
| Medalla de la Virgen | **Pendiente.** Descartada tal como estaba. Propuesta: la primera vez en cada duelo que te pillan un farol, tu Cara no baja | 10 |
| **[nuevo]** Hucha de barro | Al acabar cada arena, +1 real por cada 5 que tengas ahorrados (máximo +5). *Ejemplo: llegas al final de la arena con 23 reales y cobras 4* | 8 |
| **[nuevo]** Yesquero | Cuando tiras un órdago y el rival no lo quiere, cobras 2 piedras más | 9 |

### [nuevo] Amuletos contra el rival

| Objeto | Qué hace | Precio |
| --- | --- | --- |
| Ristra de ajos | Ahuyenta los tics falsos: los rivales que los tienen (Melquíades, Tiburcio, Fulgencio) los hacen la mitad de veces | 7 |
| Gorra calada | No se te ve la cara: los rivales tienen 3 menos de Ojo (te pillan menos cuando les miras y cuando haces trampas con el Tahúr) | 8 |
| Carta del gobernador | Los jefes pierden su regla especial: Ruperto no se enfada, Doña Engracia acepta órdagos desde la primera mano, Don Anselmo no pone penitencia, Fulgencio no propone tratos y Don Bonifacio ni tiene casa ni cambia cartas. Es el más caro de la taberna | 15 |

### Barajas

| Baraja | Qué hace | Precio |
| --- | --- | --- |
| Baraja gastada | Puedes ver el dorso de una carta marcada del mazo en cada mano | 15 |
| Baraja de 4 reyes | Se juega a 4 reyes: los treses y los doses valen lo suyo. Más difícil, pero cobras un 50 % más de reales | 10 |
| Baraja de feria | Una carta comodín por mazo que vale lo que tú elijas al enseñarla | 18 |

### [nuevo] Objetos raros (el premio de cada jefe)

No se venden en la taberna: solo los da el jefe al ganarle, y solo si lo eliges como premio.

| Objeto | De quién | Qué hace |
| --- | --- | --- |
| El Martillo de Ruperto | Ruperto | Una vez por duelo, das un golpe en la mesa al envidar: si la mano del rival no gana al menos 6 de cada 10 veces, no lo quiere |
| El Rosario de Doña Engracia | Doña Engracia | Una vez por duelo, al empezar un lance, sabes si el rival lleva una mano fuerte en él |
| La Bula de Don Anselmo | Don Anselmo | Tienes bula: tus faroles pillados no cuentan para la memoria del rival, así que los que se acuerdan te siguen creyendo. *Podría sustituir a la Medalla de la Virgen* |
| La Vara de Fulgencio | Fulgencio | Una vez por duelo propones tú el trato antes del recuento, y la impar es para ti |

## 5. Compañeros

**[cambiado] Cómo funcionan:**

- **Solo uno a la vez.** Se sienta a tu lado y te ayuda con señas y trucos. No juega cartas.
- **Empiezas la gira eligiendo uno** de entre los que tienes desbloqueados.
- **En la taberna se compran y se cambian.** A veces hay uno a la venta. Si lo compras, el tuyo se despide y te deja la mitad de lo que costó. Ganar a un jefe también puede darte uno nuevo, si eliges ese premio.
- **Cada uno tiene una pasiva** (siempre activa) **y una seña** (una habilidad que se usa pocas veces por duelo).

| Compañero | Pasiva | Seña (usos por duelo) | Estilo | Cómo se desbloquea | Precio |
| --- | --- | --- | --- | --- | --- |
| El Pastor | La Libreta se rellena el doble de rápido | Te enseña una carta del rival (1) | Lectura | Desde el principio | 8 |
| La Tabernera | +2 reales por duelo ganado | Si ganas el próximo órdago, cobras el triple de reales (1) | Economía y órdagos | Desde el principio | 8 |
| El Tahúr | Una ronda de mus extra por mano | Cambias en secreto la carta que quieras por un rey del mazo. Si el rival tiene mucho Ojo y te pilla, la mano se acaba, nadie cobra nada de ella y el rival se lleva 5 piedras (2) | Riesgo y trampas | Ganar 3 faroles en un mismo duelo | 12 |
| El Abuelo | Los faroles pillados te quitan la mitad de Cara | «Ya me lo sé»: te dice si el rival lleva juego o no (1) | Farolear sin miedo | Llegar a la Ribera del Duero | 10 |
| La Moza del Molino | Empiezas cada duelo con 2 piedras | Distrae al rival: no hace tics durante una mano, pero tampoco te lee a ti (2) | Agresivo y rápido | Ganar un duelo sin perder ningún lance | 10 |
| El Sacristán | Ves cuándo el rival va a farolear (el retrato se oscurece un instante), con un 60 % de acierto | Repites el reparto de una mano (1) | Defensivo | Ganar a Don Anselmo | 12 |
| El Veterano | Tus envites aceptados y ganados dan +1 piedra | «Órdago a la grande»: si llevas dos reyes (cualesquiera: los treses son reyes), tu órdago a la Grande no se puede rechazar (1) | Golpes grandes | Ganar 10 órdagos en total | 14 |
| El Forastero | La Cara nunca baja de 30 | Cambia el lance en el que se juega el órdago después de que el rival lo acepte (1) | Caos | Completar una gira | 15 |
| **[nuevo]** La Cotilla | Al empezar cada duelo te cuenta un tic del rival y te lo apunta en la Libreta | «¿Te has enterado?»: le cuenta al rival un chisme falso sobre ti y se olvida de tus faroles de este duelo (1) | Lectura y faroleo | Apuntar 10 tics en la Libreta | 10 |
| **[nuevo]** El Alguacil | Delante de él no hay trampas: si Don Bonifacio cambia una carta, le pillas siempre (+5 piedras) | «¡Alto ahí!»: en esta mano el rival no puede subir ni tirar órdago (1) | Control del rival | Ganar a Fulgencio sin aceptarle ningún trato | 12 |
| **[nuevo]** El Dulzainero | Tus órdagos van con redoble: el rival les tiene más miedo (Miedo al órdago +2) | «Una jota»: en esta mano, los tics del rival salen siempre que tienen motivo (2) | Presión y órdagos | Ganar 3 órdagos en una misma gira | 11 |

**Los que más fastidian al rival:** la Moza del Molino, el Alguacil, el Dulzainero y la Cotilla.

**Sinergias**, que es lo que hace que cada gira sea distinta:

- **El Tahúr + la Gorra calada:** te pillan menos las trampas.
- **La Tabernera + la Navaja de Albacete o el Yesquero:** todo a los órdagos.
- **El Pastor o la Cotilla + las Gafas de culo de vaso:** la Libreta se llena enseguida.
- **El Dulzainero + el Yesquero:** tus órdagos asustan más y, cuando no te los quieren, cobras 2 piedras más.
- **El Abuelo + Hacerle la pelota:** faroleas sin miedo y, cuando llevas cartas, te lo quieren todo.

## 6. Lo que habría que dibujar

Para que lo vayas planeando. Todo sale de tus hojas de personaje; mientras falten, el juego usa marcadores.

| Qué | Cuántos | Para cuándo |
| --- | --- | --- |
| Secuaces de Tierra de Campos (Paco, Tomasa y Nicasio) | 3 | Fase 4: la primera arena |
| Secuaces del resto de arenas | 12 | Más adelante |
| Compañeros | 11 (2 en la fase 4: el Pastor y la Tabernera) | Fase 4 y después |
| La tabernera de la taberna | 1 | Fase 4 |
| Iconos de objetos | Unos 30 | Fase 4 los primeros 5 |
| Poses que faltan de los jefes: Don Anselmo (el vino, las manos) y Don Bonifacio (las manos) | 3 | Cuando se pueda |
| Fondos de cada arena para el mapa | 5 | Fase 5 (pulido) |

## Historial de versiones

- **Versión 1 (12 de octubre de 2026).** El catálogo de la gira: 5 arenas de 4 niveles (tres secuaces y su jefe), con 15 secuaces nuevos; cómo se conecta cada jefe con sus secuaces; la taberna al estilo de Balatro; ideas para la plaza; objetos nuevos, entre ellos las jugarretas y los amuletos contra el rival; los objetos raros de los jefes; tres compañeros nuevos y su precio en la taberna; y la lista de lo que hay que dibujar.
