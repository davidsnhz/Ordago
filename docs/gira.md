# Órdago — La gira

13 de octubre de 2026 · @david · *versión 2: las arenas nuevas (facultad, bar, familia, fiestas y casino), la Honra sin fin de gira por el jefe, dos huecos de cada tipo y los objetos retocados*

> **Para qué sirve este documento.** Es el catálogo de ideas de la gira: las arenas, quién juega en cada nivel, las paradas, los objetos y los compañeros. Está hecho para cambiarlo: quita, añade o retoca lo que quieras. Las reglas de fondo (las apuestas, los tics, la Cara, la IA) están en el [documento de diseño](diseno-juego.md); aquí va el contenido.
>
> **Las marcas son de esta versión:** **[cambiado]** es lo que me pediste cambiar, y **[nuevo]**, lo que he añadido yo para que encaje (nombres, aspecto, reglas…). Revisa sobre todo lo [nuevo], que es propuesta mía. Los números (precios, reales, parámetros) son un punto de partida: se ajustan jugando.

## 1. Cómo es una gira

- **La gira es la partida entera:** 5 arenas, una detrás de otra, de la cafetería de la facultad al casino de la capital. Son 20 duelos, más los que repitas, y dura algo más de una hora.
- **Cada duelo es una partida corta:** a 20 piedras, entre 2 y 4 minutos, como una partida de Clash Royale.
- **Cada arena tiene 4 niveles**, como las ciegas de Balatro: tres secuaces y su jefe. Se juegan en orden, de menos a más:

| Nivel | Quién | Cómo es |
| --- | --- | --- |
| 1 | Primer secuaz | El más flojo. Pocos tics y claros. Sirve para calentar |
| 2 | Segundo secuaz | Más tics y alguna manía |
| 3 | La mano derecha del jefe | Juega parecido a su jefe; a menudo su manía anuncia la regla del jefe |
| 4 | El jefe | El mejor de la arena, con su regla especial completa |

- **Al entrar en una arena ya ves al jefe y su regla**, como en Balatro, que te enseña la ciega jefe desde el principio. Así preparas la taberna. *Ejemplo: sabes que el tío Paulino casi no hace tics, así que te guardas un Chato de vino para su duelo.*
- **Entre duelo y duelo eliges una parada:** la taberna (comprar), la plaza (pasa algo) o la era (recuperas Cara). Ver el apartado 3.
- **[cambiado] Honra: 3 vidas, y la gira solo se acaba cuando te quedas sin ninguna.**
  - Perder contra un secuaz te quita 1 de Honra y no cobras ese duelo, pero sigues al siguiente nivel.
  - Perder contra el jefe te quita 1 de Honra y **vuelves a jugar contra él** hasta que le ganes o te quedes sin Honra. **[nuevo]** Antes de repetir puedes pasar por una parada, por ejemplo la taberna, para prepararte mejor.
  - Al quedarte sin Honra vuelves al principio, desde cero. Solo te llevas la Libreta (lo que has aprendido de cada rival) y lo que hayas desbloqueado.
- **Reales por duelo ganado:** 4 el primer secuaz, 5 el segundo, 6 la mano derecha y 10 el jefe. Se suman los de siempre: +1 por envite aceptado y ganado, +1 por farol que cuela y +5 por órdago ganado. Perder un duelo da 2 de consolación.
- **Ganar al jefe:** eliges un premio entre tres (un compañero, el objeto raro de ese jefe, o +1 de Honra si te falta) y se abre la siguiente arena.
- **[cambiado] Fuera la idea de «pasar de largo»:** si te pudieras saltar a los secuaces, no compensaría jugar contra ellos.

### El mapa

Como las arenas de Clash Royale: un camino en vertical que se va subiendo con el dedo. Cada arena es un tramo con su paisaje y cuatro paradas en el camino, una por nivel. El jefe está arriba del todo, con su retrato. Los niveles ganados quedan marcados y, si pierdes contra el jefe, su parada se queda abierta hasta que le ganes. La arena siguiente está tapada por la niebla hasta entonces.

## 2. Las arenas

| Arena | Dónde | Jefe | Lo que enseña |
| --- | --- | --- | --- |
| 1. La facultad | La cafetería de una universidad pública | Chema, el Repetidor | Los tics existen, y cómo va el marcador cambia cómo juega el rival |
| 2. El bar | El bar de toda la vida | Manolo, el Rey de la barra | Los adultos farolean: atrévete a querer |
| 3. La Montaña Palentina | La casa de una familia de pueblo | El abuelo Teodoro | Tus faroles se saben, y las señas se aprenden… y mienten |
| 4. Las fiestas del pueblo | El concurso de mus de las fiestas | El tío Paulino, el Campeón | Cuando no se dejan leer, juega con tus cartas y cuida tu Cara |
| 5. El casino de la capital | Terciopelo, lámparas y humo | Don Bonifacio, el Cacique | Todo lo aprendido junto |

**[cambiado]** Las arenas son las que propusiste. **[nuevo]** Los cinco rivales que ya tienen dibujo los he colocado donde encajan por edad y oficio:
- **Ruperto y Fulgencio, en el bar:** son adultos de unos cuarenta años, y el bar es donde se cierran los tratos.
- **Doña Engracia y Don Anselmo, en las fiestas:** la viuda que juega el concurso todos los años y el cura que lo organiza.
- **Don Bonifacio, de jefe del casino.**

Si prefieres que la gira sea toda nueva, ellos se quedan para los duelos sueltos (el modo libre).

**Cómo leer las fichas.** Los números son los cinco parámetros de la IA, de 0 a 10, como en el documento de diseño: **A** agresividad (cuánto envida con buenas cartas), **F** faroleo, **M** miedo al órdago, **Me** memoria (cuánto se acuerda de tus faroles) y **O** ojo (cuánto te pilla). Cada tic dice qué lo provoca y cuántas veces de cada 10 acierta.

Los personajes nuevos necesitan su hoja de personaje; mientras no la tengan, salen con un marcador. De los cinco que ya están en el juego pongo un resumen: su ficha completa está en el documento de diseño.

---

### Arena 1 · La facultad [cambiado]

La cafetería de una universidad pública en una ciudad castellana (Salamanca, por ejemplo): piedra dorada, mesas de formica, la máquina de café y el tablón lleno de carteles. Aquí es donde casi todos los chavales aprenden a jugar al mus, entre clase y clase o en vez de ir a clase. Son novatos y se les ve todo: es la arena para aprender que los tics existen.

#### Nivel 1 · Lucía, la de primero [nuevo]

- **Aspecto:** sudadera de la facultad, mochila, apuntes subrayados con fosforito y un boli en la mano.
- **Cómo juega:** aprendió ayer. Envida cuando lleva algo, no farolea nunca y quiere poco. · A 4 · F 0 · M 3 · Me 1 · O 1
- **Tic:** mordisquea el boli → lleva pares o mejor (9 de cada 10).
- **Manía:** ninguna.
- **Frase:** «¿Los treses eran reyes? Vale, vale, ya me acuerdo.»

#### Nivel 2 · Dani, el Tuno [nuevo]

- **Aspecto:** la capa negra de la tuna llena de cintas de colores y la bandurria apoyada en la silla.
- **Cómo juega:** alegre y despistado. Le encanta cambiar cartas. · A 4 · F 2 · M 4 · Me 2 · O 2
- **Tics:**
  - Rasguea la bandurria → lleva 31 (8 de cada 10).
  - Se coloca las cintas de la capa → lleva duples (8 de cada 10).
- **Manía:** pide mus siempre la primera vez de cada mano. Cortar o no, lo decides tú.
- **Frase:** «Si gano, os canto una ronda. Si pierdo, también.»

#### Nivel 3 · Rubén, el colega de la cafetería (mano derecha de Chema) [nuevo]

- **Aspecto:** gorra hacia atrás, chándal y un bocadillo de tortilla a medio comer.
- **Cómo juega:** lleva un año sin pisar clase, aprendiendo de Chema. Envida fuerte y se crece. · A 6 · F 3 · M 3 · Me 2 · O 2
- **Tics:**
  - Le da un mordisco al bocadillo → lleva pares o mejor (8 de cada 10).
  - Se ajusta la gorra → lleva 31 (8 de cada 10).
- **Manía: «Se crece».** Cuando va ganando por 5 o más, farolea el doble. Es lo de Chema en pequeño.
- **Frase:** «¿Clase? ¿Qué clase?»

#### Nivel 4 · Chema, el Repetidor (jefe) [cambiado]

- **Aspecto [nuevo]:** barba de tres días, sudadera gastada, gafas de sol en la cabeza y un café con leche que no se acaba nunca. Lleva ocho años matriculado y no ha pisado un aula.
- **Cómo juega:** el rey de la cafetería. Envida mucho, farolea a menudo y quiere los órdagos por chulería. · A 7 · F 5 · M 3 · Me 3 · O 3
- **Tics:**
  - Se baja las gafas de sol → lleva una mano fuerte (8 de cada 10).
  - Remueve el café sin parar → está faroleando (7 de cada 10).
- **Regla [nuevo], «Se viene arriba»:**
  - Cuando va ganando por 5 o más, se crece (sale *¡CRECIDO!*): farolea el doble y te lo quiere todo.
  - Cuando va perdiendo por 5 o más, se arruga (*ARRUGADO*): no farolea y casi no quiere.
  - *Ejemplo: va 12 a 6 y te envida cinco: puede ser un farol, así que quiérelo si llevas algo. Va 4 a 11 y te envida: lleva cartas.*
- **En la gira [nuevo], «Rubén le avisa»:** si le ganaste a Rubén por 10 piedras o más, Chema empieza el duelo arrugado.
- **Premio, su objeto raro:** los Apuntes de Chema.
- **Frase:** «Yo aquí he aprendido más que en clase. Bueno, en clase no he estado.»

---

### Arena 2 · El bar [cambiado]

El bar de toda la vida: barra de zinc, servilletas por el suelo, raciones en la vitrina, la tele con el fútbol y la tragaperras en la esquina. Ahora juegas contra adultos, que mienten mejor que los estudiantes. Aquí se farolea mucho y se ríen del que se raja: se aprende a atreverse a querer.

#### Nivel 1 · Toño, el Camarero [nuevo]

- **Aspecto:** camisa blanca, chaleco negro, el paño al hombro y la bandeja bajo el brazo.
- **Cómo juega:** echa la partida entre ronda y ronda. Farolea poco. · A 5 · F 2 · M 4 · Me 2 · O 3
- **Tic:** se echa el paño al hombro → lleva una mano fuerte (8 de cada 10).
- **Manía: «Que tengo la barra llena».** Corta siempre el mus, para acabar antes.
- **Frase:** «Echo una mano y vuelvo, que se me acumulan las cañas.»

#### Nivel 2 · Ruperto, el Herrero (ya está en el juego)

- **En el bar:** viene al salir de la fragua.
- **Cómo juega:** bruto y directo. Envida fuerte, sube mucho y casi nunca farolea. · A 8 · F 3 · M 2 · Me 2 · O 2
- **Tics:** se rasca la barba (lleva pares o mejor) y se arremanga (lleva 31).
- **Regla:** si pierde 3 lances seguidos se enfada y durante 2 manos te lo quiere todo.
- **Frase:** «Aquí se juega como se forja: a golpes.»

#### Nivel 3 · Fulgencio, el Tratante (ya está en el juego; mano derecha de Manolo)

- **En el bar:** aquí es donde cierra los tratos de la feria, y es el compinche de Manolo.
- **Cómo juega:** mentiroso profesional. Farolea más que nadie y tira órdagos sin nada. · A 7 · F 9 · M 4 · Me 5 · O 6
- **Tics:** sonríe enseñando el diente de oro (está faroleando), se pone serio y se quita el sombrero (lleva cartas muy buenas) y golpea la vara (falso: no significa nada).
- **Regla, «Trato»:** una vez por duelo, antes del recuento, te propone retirar los envites queridos y repartiros las piedras. La impar es para él.
- **Frase:** «Esta mula vale lo que yo diga que vale. Y esta mano, también.»

#### Nivel 4 · Manolo, el Rey de la barra (jefe) [cambiado]

- **Aspecto:** cuarenta y tantos, medio calvo con cuatro pelos peinados de lado y barriga cervecera. **[nuevo]** Polo del equipo del pueblo, cadena de oro, un palillo en la boca y la caña en la mano.
- **Cómo juega [nuevo]:** fanfarrón. Habla alto, farolea mucho y no soporta que te rajes. · A 7 · F 7 · M 4 · Me 4 · O 5
- **Tics [nuevo]:**
  - Se rasca la barriga → lleva una mano fuerte (7 de cada 10).
  - Se repeina los cuatro pelos → está faroleando (7 de cada 10).
  - Da un trago a la caña → lleva juego (7 de cada 10).
- **Regla [nuevo], «¡Se ha rajado!»:** cada vez que le dices «no quiero», todo el bar se ríe y él cobra 1 piedra más. *Ejemplo: te envida dos y no quieres: cobra 2 en vez de 1.* Rajarse sale caro, así que hay que atreverse a querer.
- **En la gira [nuevo], «Ya le han contado»:** si le dijiste «no quiero» a Fulgencio 3 veces o más, Manolo empieza sabiendo que te rajas y farolea todavía más.
- **Premio, su objeto raro:** la Jarra de Manolo.
- **Frase:** «Aquí, el que no quiere, paga la ronda.»

---

### Arena 3 · La Montaña Palentina: la familia [cambiado]

Una casa de piedra en un pueblo de montaña: nieve en la ventana, la chimenea encendida y la mesa camilla con el brasero. Juegas contra una familia entera, uno detrás de otro: **la niña pequeña, la madre, el padre y el abuelo.**

**[nuevo] Regla de la arena, «En esta casa todo se cuenta»:** los faroles que te pillan pasan de un duelo al siguiente. Si la niña te pilla dos, la madre empieza el duelo sabiéndolo, y así hasta el abuelo. Aquí se aprende a dosificar los faroles.

**[nuevo] Las señas.** En el mus de parejas, los compañeros se hacen señas para decirse lo que llevan. Esta familia lleva tanto tiempo jugando que las señas se les escapan solas: son sus tics. Cambian algo de un sitio a otro; estas son de las más comunes:

| Seña | Qué quiere decir |
| --- | --- |
| Morderse el labio de abajo | Dos reyes o más |
| Sacar la punta de la lengua | Dos ases o más (los doses cuentan como ases) |
| Torcer la boca | Medias |
| Levantar las cejas | Duples |
| Guiñar un ojo | 31 |

Quien conozca el mus de verdad las reconocerá. Quien no, las irá aprendiendo en la Libreta: primero con la niña, que las hace fatal, y al final con el abuelo, que también las usa para mentir.

#### Nivel 1 · Martina, la niña [nuevo]

- **Aspecto:** unos ocho años, coletas, jersey de lana y las piernas colgando de la silla.
- **Cómo juega:** aprendió viendo al abuelo. Juega con lo que lleva y no sabe farolear. · A 4 · F 0 · M 3 · Me 3 · O 2
- **Tic:** intenta guiñar un ojo, como el abuelo, y cierra los dos → lleva 31 (9 de cada 10).
- **Manía:** ninguna, aparte de la regla de la casa: todo lo que ve se lo cuenta a su madre.
- **Frase:** «¡El abuelo me ha enseñado las señas! Ay, que eso no se dice.»

#### Nivel 2 · Pilar, la madre [nuevo]

- **Aspecto:** delantal, moño hecho a prisas, jersey de punto y un trapo de cocina al hombro.
- **Cómo juega:** paciente y desconfiada. Farolea poco y quiere poco. · A 4 · F 2 · M 6 · Me 5 · O 5
- **Tics:**
  - Se muerde el labio (la seña de dos reyes) → lleva dos reyes o más (8 de cada 10).
  - Mira de reojo a la niña → sospecha que faroleas, porque tu Cara está baja (8 de cada 10).
- **Manía: «Aquí no se juega la casa».** No acepta un órdago en la primera mano.
- **Frase:** «En esta casa se juega limpio. Casi siempre.»

#### Nivel 3 · Tomás, el padre (mano derecha del abuelo) [nuevo]

- **Aspecto:** boina, chaleco de lana, manos enormes de ganadero y cara de no haber dicho tres palabras seguidas.
- **Cómo juega:** callado y sólido, como su padre. · A 5 · F 4 · M 5 · Me 6 · O 6
- **Tics (señas):**
  - Levanta las cejas → lleva duples (8 de cada 10).
  - Saca la punta de la lengua → lleva dos ases o más (7 de cada 10).
- **Manía: «Señas de mentira».** Una de cada cuatro señas que hace es falsa, para despistarte. Anuncia lo que hace el abuelo.
- **Frase:** «Mi padre me enseñó dos cosas: a callar y a envidar.»

#### Nivel 4 · El abuelo Teodoro (jefe) [cambiado]

- **Aspecto [nuevo]:** más de ochenta años, boina calada, chaqueta de pana, garrota y un palillo; sentado junto a la chimenea, en su silla de siempre.
- **Cómo juega [nuevo]:** setenta años de mus a la espalda. Se acuerda de todo. · A 6 · F 5 · M 6 · Me 9 · O 7
- **Tics [nuevo]:** las cinco señas de la tabla. Lleva tanto tiempo haciéndoselas a su pareja que se le escapan solas (8 de cada 10 cada una).
- **Regla [nuevo], «Señas de toda la vida»:** desde que alguno de los dos llega a 10 piedras, también hace señas falsas para engañarte: la mitad de sus señas pasan a ser mentira. Y, por la regla de la casa, sabe todos los faroles que te ha pillado la familia.
- **Premio, su objeto raro:** la Garrota del abuelo.
- **Frase:** «Llevo setenta años haciendo señas. Algunas hasta son verdad.»

---

### Arena 4 · Las fiestas del pueblo [cambiado]

Las fiestas del pueblo: farolillos, casetas, la orquesta al fondo, olor a churros y, bajo la carpa, el concurso de mus de las fiestas. Aquí juegas contra los que llevan toda la vida jugándolo: casi no se dejan leer y a ti te leen enseguida. Se aprende a cobrar poco a poco y a cuidar la Cara.

#### Nivel 1 · Doña Engracia, la Viuda (ya está en el juego)

- **En las fiestas:** juega el concurso todos los años desde que enviudó.
- **Cómo juega:** paciente y desconfiada. Casi nunca farolea; cuando envida, lleva cartas. · A 3 · F 1 · M 9 · Me 6 · O 7
- **Tics:** pasa las cuentas del rosario más deprisa (lleva una mano fuerte) y te mira fijamente (sospecha que faroleas).
- **Reglas:** no acepta un órdago antes de la tercera mano. Si la miras más de 2 segundos, se da cuenta 7 de cada 10 veces, se ofende y deja de hacer tics en lo que queda de mano y en la siguiente.
- **Frase:** «Treinta años jugando con mi difunto. A mí no me la das.»

#### Nivel 2 · Don Anselmo, el Cura (ya está en el juego)

- **En las fiestas:** es quien organiza el concurso.
- **Cómo juega:** equilibrado y con buena memoria: si le faroleas dos veces, deja de creerte. · A 5 · F 5 · M 5 · Me 7 · O 5
- **Tics:** bebe un sorbo de vino (lleva juego), mira al cielo (está faroleando) y junta las manos (lleva duples).
- **Manía:** envida siempre a la Chica, lleve lo que lleve.
- **Regla, «Penitencia»:** si te pilla un farol, tu próximo envite le paga 1 piedra más si lo gana él.
- **Frase:** «Dios lo ve todo, hijo. Yo, casi todo.»

#### Nivel 3 · Don Severiano, el Maestro jubilado (mano derecha del tío Paulino) [nuevo]

- **Aspecto:** chaqueta de punto, corbata, gafas en la punta de la nariz y un bigote blanco bien recortado.
- **Cómo juega:** metódico y observador. Lleva cuarenta años perdiendo la final contra el tío Paulino y ha aprendido de él a leer a la gente. · A 5 · F 4 · M 6 · Me 7 · O 8
- **Tics:**
  - Se sube las gafas → lleva juego (7 de cada 10).
  - Se atusa el bigote → está faroleando (7 de cada 10).
- **Manía: «Te lee».** Con él se te nota antes: te tiembla el pulso con la Cara por debajo de 10, no solo a 0. Anuncia lo del tío Paulino.
- **Frase:** «Cuarenta años de maestro. Sé cuándo alguien no ha hecho los deberes.»

#### Nivel 4 · El tío Paulino, el Campeón de las fiestas (jefe) [cambiado]

- **Aspecto [nuevo]:** noventa años, chiquito y arrugado, boina, chaqueta de pana, la medalla del concurso colgada al cuello y un vaso de anís.
- **Cómo juega [nuevo]:** lleva toda la vida ganando este concurso. Casi no se le ve nada y él lo ve todo. · A 6 · F 6 · M 7 · Me 8 · O 9
- **Tic [nuevo]:** solo uno: se le escapa media sonrisa → lleva duples o 31 (9 de cada 10).
- **Regla [nuevo], «Cara de piedra»:** casi no hace tics (solo ese, y solo con lo mejor), y te lee a ti: con él se te nota con la Cara por debajo de 20.
- **En la gira [nuevo], «Se conocen de toda la vida»:** Don Severiano le cuenta lo que ha visto. Si con él se te notó, empiezas el duelo con 10 menos de Cara.
- **Premio, su objeto raro:** la Baraja del concurso.
- **Frase:** «Siéntate, chaval, que no muerdo. Pero te voy a ganar.»

---

### Arena 5 · El casino de la capital

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
- **Manía: «Cambia de copla».** Desde que alguno de los dos llega a 10 piedras, sus tics significan lo contrario. Anuncia lo de Don Bonifacio, que cambia de tics a mitad del duelo.
- **Frase:** «Ay, caballero, que me va usted a sacar los colores.»

#### Nivel 3 · Don Ceferino, el Secretario (mano derecha de Don Bonifacio)

- **Aspecto:** traje gris, gafas redondas, manguitos negros, un libro de cuentas y una pluma.
- **Cómo juega:** como su jefe, sabe mucho de ti. · A 6 · F 5 · M 6 · Me 9 · O 8
- **Tics:**
  - Moja la pluma en el tintero → lleva juego (7 de cada 10).
  - Se coloca las gafas → está faroleando (7 de cada 10).
- **Manía: «Lleva las cuentas».** Empieza el duelo acordándose de tus faroles de toda la gira, no solo de ese duelo. Anuncia que Don Bonifacio lee tu Libreta.
- **Frase:** «Don Bonifacio quiere saber cuánto lleva usted ganado. Por curiosidad.»

#### Nivel 4 · Don Bonifacio, el Cacique (jefe final; ya está en el juego)

- **Cómo juega:** lo sabe todo de ti y adapta su estilo al tuyo. · A 6 · F 6 · M 6 · Me 10 · O 9
- **Tics:** empieza con los del Herrero; a las 10 piedras cambia a los del Cura; a las 15 ya no tiene tics, pero su puro echa más humo cuando lleva cartas buenas.
- **Reglas:**
  - «Casa»: es mano en el primer reparto y gana los empates a la Grande.
  - «Cartas de la casa»: una vez por duelo cambia en secreto su carta más baja por la más alta del mazo. Si le pillas (con el Alguacil, o con mucho Ojo), te llevas 5 piedras.
  - Lee tu Libreta: conoce los tics que has apuntado y juega al revés de lo que esperas.
- **Premio:** ganarle completa la gira y desbloquea la dificultad siguiente y al Forastero.
- **Frase:** «En este pueblo no se mueve una carta sin que yo lo sepa.»

---

### Ideas para más arenas

Para más adelante, si se quiere una gira más larga o un modo infinito como el de Balatro:

- **La Mancha:** molinos, llanura y viento. Jefe: *el Hidalgo*, que juega a lo grande y tira órdagos imposibles.
- **Tierra de Pinares (Soria):** pinos, resina y serrerías. Jefa: *la Resinera*, que te deja pegado: no puedes pedir mus más de una vez.
- **La Maragatería (León):** arrieros, cecina y caminos de piedra. Jefe: *el Arriero*, que va de pueblo en pueblo y ya sabe lo que has hecho en las otras arenas.
- **Más secuaces por arena**, de los que salen 3 al azar, para que dos giras no se jueguen igual.

## 3. Las paradas

Entre duelo y duelo eliges una de las tres.

### La taberna

Funciona como la tienda de Balatro:

- En cada visita hay **4 cosas a la venta**: 2 de un uso (bebidas o jugarretas), 1 amuleto o baraja y, una de cada tres veces, un compañero.
- **«Otra ronda»:** cambia lo que hay a la venta. La primera vez cuesta 2 reales y cada vez, 1 más.
- **Vender:** cualquier objeto se vende por la mitad de lo que costó, redondeando hacia abajo.
- **[cambiado] Huecos:**
  - **2** para bebidas y jugarretas.
  - **2** para amuletos y objetos raros.
  - **1** para la baraja.
  - **1** para el compañero.

  Si están llenos, hay que vender algo para comprar. Con tan pocos huecos, cada compra es una decisión.
- La tabernera atiende con su frase («¿Qué va a ser?»). Su arte está pendiente.

### La plaza

Sale una cosa al azar:

- **Un forastero apuesta contigo:** te juegas 5 reales a que ganas el próximo duelo sin perder ni un lance de Grande. Si lo consigues, cobras 15.
- **Fiesta patronal:** en el próximo duelo, los dos empezáis con 5 piedras. Duelo más corto y más loco.
- **[cambiado] Un timador** te vende un amuleto a mitad de precio. Uno de cada tres es falso: en cuanto te lo da, se rompe y desaparece (y los reales, con él).
- **[cambiado] Una monja te da su bendición:** +1 de Honra, aunque ya tengas las tres (puedes llegar a 4). Sale la mitad de veces que las demás, y si te sale una vez, ya no vuelve a salir en esa gira; solo cuando empiezas otra.
- **Una partida en la calle:** una mano suelta contra un vecino. Si la ganas, 3 reales; si la pierdes, nada.

*(Quito la idea del cura que te bendecía: ahora hace lo mismo la Medalla de la Virgen.)*

### La era

Descansas: **+20 de Cara.** Si tu Cara está a 0, además se te quita el «se te nota».

## 4. Objetos

| Tipo | Qué son | Duración | Huecos |
| --- | --- | --- | --- |
| Bebidas | Te ayudan a ti | Un uso, durante un duelo | **[cambiado]** 2, compartidos con las jugarretas |
| Jugarretas | Fastidian al rival | Un uso, durante un duelo | Los mismos 2 |
| Amuletos | Pasivos; unos te ayudan y otros van contra el rival | Toda la gira | **[cambiado]** 2, compartidos con los objetos raros |
| Objetos raros | El premio de cada jefe | Toda la gira | Los mismos 2 (salvo la Baraja del concurso, que va en el de baraja) |
| Barajas | Cambian la baraja | Toda la gira | 1 |

### Bebidas (a tu favor)

| Objeto | Qué hace | Precio |
| --- | --- | --- |
| **[cambiado]** Chato de vino | El rival se va de la lengua: nada más bebérselo, dice en voz alta qué mano lleva (*«¡Llevo dos reyes, un caballo y un cinco!»*). Vale para la mano en que lo usas | 4 |
| Orujo | +15 de Cara al momento | 4 |
| Café de puchero | Una ronda de mus extra en la mano actual | 3 |
| **[cambiado]** Gaseosa | La que rebaja el vino… y lo que pierdes. Después de ver las cartas en el recuento, si has perdido un envite que tú quisiste, haces como si hubieras dicho «no quiero»: pagas lo del «no quiero» en vez de todo lo apostado. No vale para órdagos. *Ejemplo: quisiste un envite de ocho a la Grande y en el recuento ves que el rival lleva tres reyes: con la gaseosa pagas 1 en vez de 8* | 6 |
| Copa de anís | En esta mano ganas los empates, aunque no seas mano | 3 |
| Agua del botijo | Se te quita el «se te nota» durante 3 manos | 2 |
| **[cambiado]** Caldo de la abuela | Si el rival llega a 20, el duelo no se acaba: se juega hasta 30, así que todavía puedes remontar (o no). No vale si pierdes por un órdago | 8 |

### Jugarretas (contra el rival)

| Objeto | Qué hace | Precio |
| --- | --- | --- |
| Invitar a una ronda | El rival rechaza tu próximo envite, lleve lo que lleve | 5 |
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
| **[cambiado]** Reloj de bolsillo | Puedes mirar al rival el doble de tiempo sin que se dé cuenta, y sus tics duran más. *Con Doña Engracia aguantas 4 segundos mirándola antes de que se ofenda, en vez de 2* | 7 |
| Gafas de culo de vaso | +1 nota automática en la Libreta por duelo | 6 |
| **[cambiado]** Medalla de la Virgen | La primera vez en cada duelo que te pillan un farol, tu Cara no baja | 9 |
| Hucha de barro | Al acabar cada arena, +1 real por cada 5 que tengas ahorrados (máximo +5). *Ejemplo: llegas al final de la arena con 23 reales y cobras 4* | 8 |
| Yesquero | Cuando tiras un órdago y el rival no lo quiere, cobras 2 piedras más | 9 |

### Amuletos contra el rival

| Objeto | Qué hace | Precio |
| --- | --- | --- |
| **[cambiado]** Ristra de ajos | Los rivales no hacen tics falsos: Fulgencio deja de golpear la vara, y en la familia nadie hace señas de mentira (ni Tomás ni el abuelo) | 7 |
| **[cambiado]** Gorra calada | No se te ve la cara: los rivales tienen 3 menos de Ojo (te pillan menos cuando les miras y cuando haces trampas con el Tahúr) | 7 |
| Carta del gobernador | Los jefes pierden su regla especial: Chema ni se crece ni se arruga, Manolo no cobra de más por tus «no quiero», el abuelo no hace señas falsas, el tío Paulino hace sus tics como cualquiera y no te lee antes de tiempo, y Don Bonifacio ni tiene casa ni cambia cartas. Es el más caro de la taberna | 15 |

### Barajas

| Baraja | Qué hace | Precio |
| --- | --- | --- |
| Baraja gastada | Puedes ver el dorso de una carta marcada del mazo en cada mano | 15 |
| Baraja de 4 reyes | Se juega a 4 reyes: los treses y los doses valen lo suyo. Más difícil, pero cobras un 50 % más de reales | 10 |
| Baraja de feria | Una carta comodín por mazo que vale lo que tú elijas al enseñarla | 18 |

### Objetos raros (el premio de cada jefe) [cambiado]

No se venden en la taberna: solo los da el jefe al ganarle, y solo si lo eliges como premio. **[nuevo]** Son nuevos, porque los jefes son otros.

| Objeto | De quién | Qué hace |
| --- | --- | --- |
| Los Apuntes de Chema | Chema | Están en blanco, pero detrás tiene apuntados los tics de media cafetería: una vez por duelo, cuando el rival hace un tic, te dice al momento qué significa |
| La Jarra de Manolo | Manolo | Su regla, a tu favor: cuando el rival te dice «no quiero», cobras 1 piedra más |
| La Garrota del abuelo | El abuelo Teodoro | Una vez por duelo das un golpe con ella y el rival, del susto, hace la seña de lo mejor que lleva. Esa no miente |
| La Baraja del concurso | El tío Paulino | Una baraja que él conoce de memoria (va en el hueco de baraja): una vez por mano, al descartarte, ves dos cartas del mazo y eliges cuál te quedas |

## 5. Compañeros

**Cómo funcionan:**

- **Solo uno a la vez.** Se sienta a tu lado y te ayuda con señas y trucos. No juega cartas.
- **Empiezas la gira eligiendo uno** de entre los que tienes desbloqueados.
- **En la taberna se compran y se cambian.** A veces hay uno a la venta. Si lo compras, el tuyo se despide y te deja la mitad de lo que costó. Ganar a un jefe también puede darte uno nuevo, si eliges ese premio.
- **Cada uno tiene una pasiva** (siempre activa) **y una seña** (una habilidad que se usa pocas veces por duelo).

| Compañero | Pasiva | Seña (usos por duelo) | Estilo | Cómo se desbloquea | Precio |
| --- | --- | --- | --- | --- | --- |
| El Pastor | La Libreta se rellena el doble de rápido | Te enseña una carta del rival (1) | Lectura | Desde el principio | 8 |
| La Tabernera | +2 reales por duelo ganado | Si ganas el próximo órdago, cobras el triple de reales (1) | Economía y órdagos | Desde el principio | 8 |
| El Tahúr | Una ronda de mus extra por mano | Cambias en secreto la carta que quieras por un rey del mazo. Si el rival tiene mucho Ojo y te pilla, la mano se acaba, nadie cobra nada de ella y el rival se lleva 5 piedras (2) | Riesgo y trampas | Ganar 3 faroles en un mismo duelo | 12 |
| **[cambiado]** El Jubilado (antes, el Abuelo) | Los faroles pillados te quitan la mitad de Cara | «Ya me lo sé»: te dice si el rival lleva juego o no (1) | Farolear sin miedo | Llegar a la Montaña Palentina | 10 |
| La Moza del Molino | Empiezas cada duelo con 2 piedras | Distrae al rival: no hace tics durante una mano, pero tampoco te lee a ti (2) | Agresivo y rápido | Ganar un duelo sin perder ningún lance | 10 |
| El Sacristán | Ves cuándo el rival va a farolear (el retrato se oscurece un instante), con un 60 % de acierto | Repites el reparto de una mano (1) | Defensivo | Ganar a Don Anselmo | 12 |
| El Veterano | Tus envites aceptados y ganados dan +1 piedra | «Órdago a la grande»: si llevas dos reyes (cualesquiera: los treses son reyes), tu órdago a la Grande no se puede rechazar (1) | Golpes grandes | Ganar 10 órdagos en total | 14 |
| El Forastero | La Cara nunca baja de 30 | Cambia el lance en el que se juega el órdago después de que el rival lo acepte (1) | Caos | Completar una gira | 15 |
| La Cotilla | Al empezar cada duelo te cuenta un tic del rival y te lo apunta en la Libreta | «¿Te has enterado?»: le cuenta al rival un chisme falso sobre ti y se olvida de tus faroles de este duelo (1) | Lectura y faroleo | Apuntar 10 tics en la Libreta | 10 |
| El Alguacil | Delante de él no hay trampas: si Don Bonifacio cambia una carta, le pillas siempre (+5 piedras) | «¡Alto ahí!»: en esta mano el rival no puede subir ni tirar órdago (1) | Control del rival | Ganar a Fulgencio sin aceptarle ningún trato | 12 |
| El Dulzainero | Tus órdagos van con redoble: el rival les tiene más miedo (Miedo al órdago +2) | «Una jota»: en esta mano, los tics del rival salen siempre que tienen motivo (2) | Presión y órdagos | Ganar 3 órdagos en una misma gira | 11 |

**[cambiado] Lo que he cambiado en los compañeros** por las arenas nuevas:
- **El Abuelo pasa a llamarse el Jubilado**, para que no se confunda con el abuelo Teodoro, el jefe de la familia. Hace lo mismo.
- **Se desbloquea al llegar a la Montaña Palentina**, porque la Ribera del Duero ya no está en la gira.
- **El resto se queda igual.** Como ahora solo hay dos huecos de amuleto, el compañero pesa más en cada gira, y por eso no he tocado sus precios.

**Los que más fastidian al rival:** la Moza del Molino, el Alguacil, el Dulzainero y la Cotilla.

**Sinergias**, que es lo que hace que cada gira sea distinta:

- **El Tahúr + la Gorra calada:** te pillan menos las trampas.
- **La Tabernera + la Navaja de Albacete o el Yesquero:** todo a los órdagos.
- **El Pastor o la Cotilla + las Gafas de culo de vaso:** la Libreta se llena enseguida.
- **El Dulzainero + el Yesquero:** tus órdagos asustan más y, cuando no te los quieren, cobras 2 piedras más.
- **El Jubilado + la Medalla de la Virgen:** casi no pierdes Cara por farolear.
- **[nuevo] La Cotilla en la familia:** su «¿Te has enterado?» borra los faroles que la familia se ha ido contando.
- **[nuevo] La Ristra de ajos en la familia:** el padre y el abuelo dejan de hacer señas de mentira.
- **[nuevo] El Agua del botijo contra Don Severiano y el tío Paulino**, que te leen antes que nadie.

## 6. Lo que habría que dibujar

Para que lo vayas planeando. Todo sale de tus hojas de personaje; mientras falten, el juego usa marcadores.

| Qué | Cuántos | Para cuándo |
| --- | --- | --- |
| La facultad: Lucía, Dani, Rubén y Chema | 4 | Fase 4: la primera arena |
| El bar: Toño y Manolo (Ruperto y Fulgencio ya están) | 2 | Más adelante |
| La familia: Martina, Pilar, Tomás y el abuelo Teodoro | 4 | Más adelante |
| Las fiestas: Don Severiano y el tío Paulino (Doña Engracia y Don Anselmo ya están) | 2 | Más adelante |
| El casino: Leandro, Doña Leonor y Don Ceferino (Don Bonifacio ya está) | 3 | Más adelante |
| Compañeros | 11 (2 en la fase 4: el Pastor y la Tabernera) | Fase 4 y después |
| La tabernera de la taberna y la monja de la plaza | 2 | Fase 4 la tabernera |
| Iconos de objetos | Unos 30 | Fase 4 los primeros 5 |
| Poses que faltan: Don Anselmo (el vino, las manos) y Don Bonifacio (las manos) | 3 | Cuando se pueda |
| Fondos de cada arena para el mapa | 5 | Fase 5 (pulido) |

## Historial de versiones

- **Versión 1 (12 de octubre de 2026).** El catálogo de la gira: 5 arenas de 4 niveles (tres secuaces y su jefe), con 15 secuaces nuevos; cómo se conecta cada jefe con sus secuaces; la taberna al estilo de Balatro; ideas para la plaza; objetos nuevos, entre ellos las jugarretas y los amuletos contra el rival; los objetos raros de los jefes; tres compañeros nuevos y su precio en la taberna; y la lista de lo que hay que dibujar.
- **Versión 2 (13 de octubre de 2026).** Cambios de David:
  - **Arenas nuevas:** la facultad, el bar, una familia de la Montaña Palentina, las fiestas del pueblo con sus veteranos y el casino. Los personajes nuevos llevan nombre, aspecto, tics y reglas propuestos por mí, y los cinco que ya tenían dibujo están recolocados.
  - **Honra:** la gira solo se acaba sin Honra; si pierdes contra el jefe, repites contra él.
  - **Fuera** la idea de pasar de largo.
  - **Huecos:** dos de bebidas y jugarretas, y dos de amuletos y objetos raros.
  - **Objetos:** el Chato de vino hace que el rival cante su mano (4 reales); la Gaseosa, explicada de nuevo; el Caldo de la abuela alarga el duelo hasta 30; el Reloj de bolsillo, rehecho; la Medalla de la Virgen, aprobada a 9 reales; la Ristra de ajos quita los tics falsos; la Gorra calada, a 7 reales.
  - **La plaza:** el timador engaña una de cada tres veces y está la monja que da Honra.
  - **Compañeros:** el Abuelo pasa a ser el Jubilado.
  - **Objetos raros nuevos** para los jefes nuevos.
