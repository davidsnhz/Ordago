# Órdago — Documento de diseño

Oct 9, 2026 · @david

## Visión y esencia

Órdago es un roguelike de duelos de mus 1 contra 1 donde se gana leyendo al rival y apostando con cabeza, no construyendo combinaciones de cartas. Se juega sin conexión, en móvil y en horizontal.

Lo que la gente disfruta del mus no son las reglas, son cuatro momentos: que te entre una buena mano, envidar y que el otro acepte, tirar un órdago, y que un farol te salga bien. Órdago está diseñado para que esos cuatro momentos pasen a menudo y se sientan grandes.

### Pilares de diseño

1. **El duelo es psicológico.** Las cartas importan, pero la decisión clave es siempre envidar, aceptar o farolear.
2. **Los rivales se leen, no se calculan.** Cada rival tiene personalidad y tics visibles. Ganar es aprender a interpretarlos.
3. **El farol es un recurso.** Farolear tiene coste y recompensa, medidos por tu Cara (temple).
4. **El órdago es el clímax.** Es el momento más tenso y espectacular del juego, con su propia puesta en escena.
5. **Sabor a pueblo.** Tabernas, caciques, curas y herreros. Humor castellano, nada de casino de neón.

### Qué lo diferencia

|  | Balatro | Mus Maestro | Órdago |
| --- | --- | --- | --- |
| Núcleo | Construir manos y multiplicar puntos | Jugar mus reglamentario | Apostar, farolear y leer al rival |
| Rival | No hay rival, solo objetivos de puntos | Parejas de IA o jugadores online | Personajes con personalidad y tics |
| Progresión | Comodines que cambian la puntuación | Ranking y partidas | Compañeros y objetos que dan información o ventajas en el envite |
| Formato | Partidas largas | 2 contra 2 a 40 piedras | Duelos 1 contra 1 a 20 piedras dentro de una gira |

La frase que resume el juego: **«No gana quien lleva mejores cartas, gana quien hace creer que las lleva.»**

## Ambientación y estética

Eres un jugador forastero que recorre los pueblos de Castilla desafiando a sus mejores jugadores de mus, hasta llegar a la gran timba de la capital. Cada pueblo tiene su taberna, sus parroquianos y un cacique que no ha perdido nunca.

### La gira

La gira propuesta recorre comarcas reales, cada una con su identidad visual y sus personajes:

| Etapa | Comarca | Ambiente | Cacique |
| --- | --- | --- | --- |
| 1 | Tierra de Campos | Adobe, palomares, trigo, sol de tarde | El Herrero |
| 2 | Montaña Palentina | Piedra, nieve, chimenea, lana | La Viuda |
| 3 | Ribera del Duero | Bodegas subterráneas, barricas, velas | Don Anselmo, el cura |
| 4 | Feria de ganado | Carpa, paja, mulas, bullicio | Fulgencio, el tratante |
| Final | Casino de la capital | Terciopelo, lámparas, humo | Don Bonifacio, el cacique mayor |

### Arte

> **Esta sección está sustituida por `docs/direccion-arte.md`.** El pixel art se descartó: la interfaz y la baraja usan el estilo de naipe impreso, y el estilo de los personajes está pendiente.

- **La mesa en el centro.** Vista frontal: el rival sentado enfrente, ocupando la mitad superior de la pantalla horizontal. Tus cartas abajo, los amarracos sobre la mesa.
- **El rival es lo más importante de la pantalla** porque es donde están los tics. Necesita animaciones sutiles: parpadeo, respiración, manos, mirada. Cada tic es una animación propia.
- **Cada comarca tiñe el ambiente** (azulado en la montaña, vinoso en la Ribera).
- **Detalles de taberna**: porrón, vasos de chato, un perro durmiendo, parroquianos de fondo que reaccionan a los órdagos.

### Tono

Humor costumbrista y un punto de picaresca. Los rivales hablan con refranes y frases de mesa de mus («Envido», «Más», «Lo veo», «¡Órdago!»). Sin caricatura cruel: son personajes entrañables a los que da gusto ganar.

### Sonido

- Guitarra, dulzaina y acordeón en loops tranquilos de taberna.
- La música baja y queda un latido cuando hay un órdago sobre la mesa.
- Sonidos táctiles: cartas, amarracos chocando, golpe en la mesa al envidar fuerte.
- Voces cortas tipo murmullo (como en Animal Crossing) con frases clave grabadas: «¡Órdago!», «Quiero», «No quiero».

## Estructura de la partida

Una partida es una gira de 5 etapas que dura entre 45 y 60 minutos. Si pierdes la Honra, la gira termina y vuelves a empezar con lo desbloqueado.

### Niveles de juego

| Nivel | Qué es | Duración aproximada |
| --- | --- | --- |
| Gira | La partida completa: 4 comarcas + el casino final | 45–60 min |
| Etapa | Un pueblo: 2 parroquianos y su cacique | 10–12 min |
| Duelo | Un enfrentamiento a 20 piedras contra un rival | 3–5 min |
| Mano | Reparto, mus, los cuatro lances y el recuento | 30–60 s |

### Recursos de la gira

- **Honra (vidas):** empiezas con 3. Perder contra un parroquiano cuesta 1. Perder contra un cacique termina la gira.
- **Reales (moneda):** se ganan en cada duelo y se gastan en la taberna.
- **Cara (temple):** de 0 a 100, se arrastra de un duelo a otro. Ver el apartado de faroles.
- **Libreta:** apuntes que tomas sobre cada rival una vez le hayas ganado. Persiste entre giras.

### Dentro de una etapa

Al llegar a un pueblo eliges el orden en el que te enfrentas a los dos parroquianos. Entre duelo y duelo eliges una parada:

- **La taberna:** tienda de objetos y bebidas.
- **La plaza:** un evento aleatorio (un forastero te propone una apuesta, una fiesta patronal, un timador).
- **La era:** descansas y recuperas Cara.

Después de los dos parroquianos llega el cacique. Ganarle te da un compañero o un objeto raro a elegir y abre la siguiente comarca.

*(Diagrama del bucle: elegir compañero → nueva comarca → duelo parroquiano → parada (taberna, plaza o era) → segundo parroquiano → parada → duelo con el cacique → si ganas: recompensa y siguiente comarca; si pierdes, o te quedas sin Honra: fin de la gira, se guardan Libreta y desbloqueos → nueva gira.)*

Tras el casino final, ganar al cacique completa la gira y desbloquea la dificultad siguiente.

## Reglas del duelo

El duelo usa el mus de verdad, con los cuatro lances, a 8 reyes y a 20 piedras. Se respeta todo lo que hace reconocible al mus y se recorta lo que alarga la partida en un 1 contra 1.

### La baraja

Baraja española de 40 cartas, jugando a 8 reyes: los treses cuentan como reyes y los doses como ases.

| Orden (de mayor a menor) | Valor para el Juego |
| --- | --- |
| Rey (y tres) | 10 |
| Caballo | 10 |
| Sota | 10 |
| 7, 6, 5, 4 | Su número |
| As (y dos) | 1 |

### Secuencia de una mano

1. **Reparto:** 4 cartas a cada jugador. La «mano» alterna en cada reparto y gana los empates.
2. **Mus:** cada jugador dice «mus» o «corto». Si los dos piden mus, ambos descartan de 1 a 4 cartas y roban. Máximo 2 rondas de mus por mano (algunos objetos lo cambian). Si alguien corta, empiezan los lances.
3. **Grande:** gana la mano con las cartas más altas.
4. **Chica:** gana la mano con las cartas más bajas.
5. **Pares:** cada jugador declara si tiene pares («sí» o «no»). Solo se envida si los dos tienen.
6. **Juego:** cada jugador declara si tiene juego (31 o más). Solo se envida si los dos tienen. Si ninguno tiene, se juega al **Punto**.
7. **Recuento:** se enseñan las cartas, se resuelven los envites aceptados y se cobran los tantos.

### Qué gana cada lance

| Lance | Quién gana | Piedras si nadie envida o si se dice «no quiero» al final |
| --- | --- | --- |
| Grande | Cartas más altas | 1 (en paso) |
| Chica | Cartas más bajas | 1 (en paso) |
| Pares | Duples > Medias > Pareja; dentro de cada tipo, las más altas | Pareja 1 · Medias 2 · Duples 3, además de lo envidado |
| Juego | 31 > 32 > 40 > 37 > 36 > 35 > 34 > 33 | 31: 3 · Otro juego: 2, además de lo envidado |
| Punto | El más cercano a 30 sin pasarse | 1 |

Las declaraciones de pares y juego son parte del juego psicológico: decir «sí» ya da información, y ciertos rivales y objetos juegan con eso.

### Fin del duelo

Gana quien llega antes a 20 piedras, o quien gana un órdago. Los tantos se cuentan en el orden de los lances, así que puede ganarse en el recuento antes de cobrar los últimos.

## Sistema de apuestas

En cada lance se apuesta con las reglas del mus: envido, quiero, no quiero y órdago. Las cartas no se enseñan hasta el recuento, así que todo lo que se acepta se decide a ciegas, y ahí vive el farol.

### Acciones en cada lance

Habla primero quien es mano. En su turno, cada jugador elige una acción:

| Acción | Qué hace | Si el rival no la acepta |
| --- | --- | --- |
| Paso | No apuesta. Si los dos pasan, el lance queda «en paso» | — |
| Envido | Apuesta 2 piedras | El que envidó gana 1 piedra |
| Envido X | Apuesta una cantidad mayor (3, 5, 10…) | El que envidó gana 1 piedra |
| Quiero | Acepta la apuesta; se resuelve en el recuento | — |
| Más (subir) | Acepta y sube la apuesta | El que subió gana lo que había antes de subir |
| No quiero | Rechaza la apuesta | — |
| Órdago | Se apuesta el duelo entero | El que lo tiró gana lo que había en juego |

### Piedras y amarracos

Los tantos del duelo se cuentan en **piedras**, como en el mus. Visualmente, cada 5 piedras se convierten en un **amarraco** sobre la mesa. Se gana a 20 piedras: 4 amarracos.

Las piedras son del duelo. Los **reales** son la moneda de la gira y se cobran al terminar cada duelo:

| Fuente de reales | Cantidad |
| --- | --- |
| Ganar un duelo contra un parroquiano | 5 |
| Ganar un duelo contra un cacique | 10 |
| Cada envite aceptado y ganado | +1 |
| Cada farol que el rival no descubre | +1 |
| Ganar un órdago | +5 |
| Perder un duelo | 2 de consolación |

Así el juego premia jugar como en el mus: envidar, aceptar y farolear da más dinero que ganar pasando.

### El órdago

El órdago es el clímax y tiene su propia puesta en escena:

1. Golpe en la mesa, la música se corta y queda un latido.
2. Plano cerrado sobre la cara del rival mientras decide. Su tic, si lo tiene, se ve mejor que nunca.
3. Si lo acepta, las cartas se enseñan una a una, a cámara lenta, solo para ese lance.
4. El ganador se lleva el duelo entero. Los parroquianos del fondo reaccionan.

Un órdago se puede tirar en cualquier lance. Para que no se convierta en un botón de «todo o nada» constante, cada rival tiene una forma distinta de responder a él (ver rivales e IA).

## Faroles, tics y la Cara

Este es el sistema que da a Órdago su identidad: los rivales dejan escapar pistas sobre sus cartas, y tú tienes un temple limitado para mentir.

### Los tics del rival

Cada rival tiene de 2 a 3 tics: animaciones pequeñas que se disparan según lo que lleva en la mano. Ejemplos: rascarse la barba, mirar al techo, tamborilear los dedos, beber del vaso, recolocar las cartas.

Cada tic tiene tres propiedades:

| Propiedad | Qué significa | Ejemplo |
| --- | --- | --- |
| Disparador | Qué situación lo provoca | Lleva duples |
| Fiabilidad | Porcentaje de veces que es verdad | 80 %: a veces lo hace sin motivo |
| Excepción | Cuándo cambia su significado | Si va perdiendo de 8 o más, lo usa para farolear |

Ningún tic es 100 % fiable. Si lo fueran, el juego sería memorizar. Con un 70–85 % hay que decidir con riesgo, que es lo que hace divertido el mus.

### La Libreta

Cada vez que ves un tic y luego se enseñan las cartas, el juego te deja anotarlo en la Libreta del rival. Las notas se rellenan poco a poco («Se rasca la barba… ¿cuando lleva pares?») y se confirman con más observaciones.

La Libreta persiste entre giras. Es tu progresión como jugador: la segunda vez que te enfrentas a la Viuda ya sabes algo de ella. Los caciques tienen tics que cambian (ver rivales), para que la Libreta nunca lo resuelva todo.

### Mirar al rival

Manteniendo pulsado sobre el retrato se hace zoom a la cara del rival durante unos segundos. Mientras miras no puedes actuar, y algunos rivales se dan cuenta y cambian de comportamiento. Mirar es una decisión, no algo gratis.

### La Cara (temple)

Tu Cara es un medidor de 0 a 100 que representa lo creíble que eres en la mesa. Empiezas la gira con 60.

| Situación | Efecto en la Cara |
| --- | --- |
| Farol que el rival no acepta (se retira) | +8 |
| Envite con buena mano que el rival acepta y pierde | +4 |
| Farol descubierto en el recuento | −12 |
| Órdago perdido | −15 |
| Descansar en la era | +20 |

**Qué es un farol para el juego:** un envite, subida u órdago en un lance en el que tus cartas tenían menos de un 35 % de probabilidad de ganar. El juego lo calcula solo; no hay que declararlo.

**Qué hace la Cara:**

- **Cara alta (70+):** los rivales tienden a no aceptar tus envites. Tus faroles funcionan mejor, pero tus buenas manos cobran menos.
- **Cara media (35–70):** comportamiento normal.
- **Cara baja (menos de 35):** los rivales te aceptan casi todo. Los faroles ya no sirven, pero con buenas cartas puedes cobrar mucho.
- **Cara a 0:** se te nota todo. Durante un duelo los rivales ven uno de tus tics, como tú ves los suyos.

Esto crea un ciclo interesante: a veces conviene dejar que te pillen un farol barato para que luego te acepten el envite grande con duples.

## Compañeros

El compañero es el equivalente a los comodines de Balatro, pero con sabor a mus: es tu pareja de mesa, se sienta a tu lado y te ayuda con señas y trucos. No juega cartas; da habilidades.

Llevas un compañero por gira, elegido al principio entre los desbloqueados. Al vencer a un cacique puedes cambiarlo por uno nuevo. Cada compañero tiene una habilidad pasiva y una seña que se usa un número limitado de veces por duelo.

| Compañero | Pasiva | Seña (usos por duelo) | Estilo de juego | Cómo se desbloquea |
| --- | --- | --- | --- | --- |
| El Pastor | La Libreta se rellena el doble de rápido | Te enseña una carta del rival (1) | Lectura y observación | Disponible desde el inicio |
| La Tabernera | +2 reales por duelo ganado | Si ganas el próximo órdago, cobras el triple de reales (1) | Economía y órdagos | Disponible desde el inicio |
| El Tahúr | Una ronda de mus extra por mano | Cambias una carta en secreto; si el rival tiene «Ojo» alto, te pilla y pierdes la mano (2) | Riesgo y manipulación | Ganar 3 faroles en un mismo duelo |
| El Abuelo | Los faroles descubiertos te quitan la mitad de Cara | «Ya me lo sé»: te dice si el rival lleva juego o no (1) | Faroleo seguro | Llegar a la Ribera del Duero |
| La Moza del Molino | Empiezas cada duelo con 2 piedras | Distrae al rival: no hace tics durante una mano, pero tampoco puede leerte a ti (2) | Agresivo y rápido | Ganar un duelo sin perder ningún lance |
| El Sacristán | Ves cuándo el rival va a farolear (el retrato se oscurece un instante), con 60 % de fiabilidad | Repites el reparto de una mano (1) | Defensivo | Vencer a Don Anselmo |
| El Veterano | Tus envites aceptados y ganados dan +1 piedra | «Órdago a la grande»: si llevas los dos reyes más altos, el órdago a la grande no se puede rechazar (1) | Golpes grandes | Ganar 10 órdagos en total |
| El Forastero | La Cara nunca baja de 30 | Cambia el lance en el que se juega el órdago después de que el rival lo acepte (1) | Caos | Completar una gira |

La idea es que cada compañero empuje a un estilo distinto, para que dos giras no se jueguen igual. Combinado con los objetos, salen las sinergias propias de un roguelike: Tahúr con objetos de descarte, Tabernera con objetos de órdago, Pastor con objetos de lectura.

## Objetos de taberna y economía

Los objetos se compran con reales en la taberna y son la segunda capa de construcción de la partida. Hay tres tipos, con límites para que haya que elegir.

| Tipo | Duración | Huecos |
| --- | --- | --- |
| Bebidas | Se consumen al usarlas, durante un duelo | 3 |
| Amuletos | Pasivos, toda la gira | 4 |
| Barajas | Cambian la baraja de toda la gira | 1 |

### Bebidas

| Objeto | Efecto | Precio |
| --- | --- | --- |
| Chato de vino | El rival hace sus tics con más claridad durante 3 manos | 3 reales |
| Orujo | +15 de Cara al momento | 4 reales |
| Café de puchero | Una ronda de mus extra en la mano actual | 3 reales |
| Invitar a una ronda | El rival rechaza tu próximo envite, lleve lo que lleve | 5 reales |
| Gaseosa | Repites tu última decisión de «quiero» o «no quiero» | 6 reales |

### Amuletos

| Objeto | Efecto | Precio |
| --- | --- | --- |
| Boina de la suerte | Ganas los empates aunque no seas mano | 8 reales |
| Navaja de Albacete | Los órdagos que ganas dan +1 de Honra (máximo 3) | 12 reales |
| Medalla de la Virgen | El primer órdago perdido de cada duelo solo cuesta 10 piedras | 10 reales |
| Pañuelo de hierbas | Ves si el rival tiene pares antes de que lo declare | 9 reales |
| Reloj de bolsillo | Los rivales tardan más en decidir y sus tics duran más | 7 reales |
| Gafas de culo de vaso | +1 nota automática en la Libreta por duelo | 6 reales |

### Barajas

| Baraja | Efecto | Precio |
| --- | --- | --- |
| Baraja gastada | Puedes ver el dorso de una carta marcada del mazo en cada mano | 15 reales |
| Baraja de 4 reyes | Se juega a 4 reyes: los treses y los doses valen lo suyo. Más difícil, cobras +50 % de reales | 10 reales |
| Baraja de feria | Una carta comodín por mazo que vale lo que tú elijas al enseñarla | 18 reales |

### Economía de referencia

Con los reales de la tabla de apuestas, un jugador medio gana unos 25–35 reales por etapa. Eso da para 2–3 objetos por pueblo y obliga a decidir entre bebidas baratas y un amuleto caro. Estos números son un punto de partida y se ajustan en las pruebas.

## Los 5 rivales

Cada cacique enseña una lección distinta del juego, en orden de dificultad. Los parroquianos de cada pueblo son versiones más simples de la misma idea (1 tic, parámetros más suaves).

Los parámetros van de 0 a 10 y alimentan la IA del apartado siguiente.

| Rival | Agresividad | Faroleo | Miedo al órdago | Memoria | Ojo |
| --- | --- | --- | --- | --- | --- |
| Ruperto, el Herrero | 8 | 3 | 2 | 2 | 2 |
| Doña Engracia, la Viuda | 3 | 1 | 9 | 6 | 7 |
| Don Anselmo, el Cura | 5 | 5 | 5 | 7 | 5 |
| Fulgencio, el Tratante | 7 | 9 | 4 | 5 | 6 |
| Don Bonifacio, el Cacique | 6 | 6 | 6 | 10 | 9 |

- **Agresividad:** cuánto envida y sube con manos buenas.
- **Faroleo:** con qué frecuencia envida con manos malas.
- **Miedo al órdago:** cuánto le cuesta aceptar un órdago.
- **Memoria:** cuánto ajusta su juego según tus faroles anteriores.
- **Ojo:** lo bien que detecta tus trucos (El Tahúr, mirar demasiado).

### 1. Ruperto, el Herrero (Tierra de Campos)

**Aspecto:** grandote, delantal de cuero, brazos negros de hollín, bigote enorme. Golpea la mesa al envidar.

**Personalidad:** bruto y directo. Cuando lleva cartas, se le ve en todo. Envida fuerte, sube mucho y casi nunca farolea. Acepta los órdagos por orgullo.

**Tics:**

| Tic | Disparador | Fiabilidad |
| --- | --- | --- |
| Se rasca la barba | Lleva pares o mejor | 85 % |
| Se arremanga | Lleva 31 | 80 % |

**Regla especial:** si pierde 3 lances seguidos se enfada y durante 2 manos acepta todo.

**Lección:** aprender que los tics existen y que leerlos funciona.

**Frase:** «Aquí se juega como se forja: a golpes.»

### 2. Doña Engracia, la Viuda (Montaña Palentina)

**Aspecto:** de negro, con mantilla y un rosario entre los dedos. Mirada de rayos X.

**Personalidad:** paciente y desconfiada. Casi nunca farolea, rechaza muchos envites y nunca acepta un órdago antes de la tercera mano. Cuando envida ella, lleva cartas.

**Tics:**

| Tic | Disparador | Fiabilidad |
| --- | --- | --- |
| Pasa las cuentas del rosario más rápido | Lleva una mano fuerte en algún lance | 75 % |
| Te mira fijamente | Sospecha que faroleas (tu Cara está baja) | 90 % |

**Regla especial:** con Ojo 7, si la miras demasiado tiempo se ofende y no hace tics durante una mano.

**Lección:** a veces no se gana engañando, sino cobrando poco a poco y respetando sus envites.

**Frase:** «Treinta años jugando con mi difunto. A mí no me la das.»

### 3. Don Anselmo, el Cura (Ribera del Duero)

**Aspecto:** sotana, gafas redondas, mofletes colorados, un vaso de vino de la Ribera siempre al lado.

**Personalidad:** equilibrado y astuto, con una manía: envida siempre a la Chica, lleve lo que lleve. Es el primer rival con buena memoria: si le faroleas dos veces, deja de creerte.

**Tics:**

| Tic | Disparador | Fiabilidad |
| --- | --- | --- |
| Bebe un sorbo de vino | Lleva juego | 80 % |
| Mira al cielo | Está faroleando | 70 % |
| Junta las manos | Lleva duples | 85 % |

**Regla especial:** «Penitencia». Si descubre un farol tuyo, tu próximo envite le cuesta 1 piedra más al ganarlo.

**Lección:** la memoria del rival existe; hay que dosificar los faroles.

**Frase:** «Dios lo ve todo, hijo. Yo, casi todo.»

### 4. Fulgencio, el Tratante (Feria de ganado)

**Aspecto:** sombrero de ala ancha, blusón de tratante, vara en la mano, sonrisa de diente de oro.

**Personalidad:** mentiroso profesional. Farolea más que nadie y tira órdagos sin nada. Es un espejo del jugador: te enseña lo que se siente al otro lado.

**Tics:**

| Tic | Disparador | Fiabilidad |
| --- | --- | --- |
| Sonríe enseñando el diente de oro | Está faroleando | 75 % |
| Se pone serio y se quita el sombrero | Lleva cartas muy buenas | 70 % |
| Golpea la vara contra el suelo | Ninguno: es un tic falso para despistar | — |

**Regla especial:** «Trato». Una vez por duelo te ofrece un trato antes del recuento: retirar los dos el envite y repartirse las piedras. Aceptar o no es otra apuesta.

**Lección:** no todos los tics significan algo, y hay que atreverse a aceptar.

**Frase:** «Esta mula vale lo que yo diga que vale. Y esta mano, también.»

### 5. Don Bonifacio, el Cacique (Casino de la capital)

**Aspecto:** traje de tres piezas, cadena de reloj de oro, puro, anillo con sello. Sentado en un sillón más alto que el tuyo.

**Personalidad:** lo sabe todo de ti. Lee tu Libreta: conoce los tics de los rivales que has anotado y juega al revés de lo que esperas. Adapta su estilo al tuyo durante el duelo.

**Tics:** empieza con los tics del Herrero. A la mitad del duelo (al llegar a 10 piedras cualquiera de los dos) cambia a los tics del Cura. Si llega a 15, deja de tener tics, pero su puro echa más humo cuando lleva cartas buenas (65 %).

**Reglas especiales:**

- «Casa»: es mano en el primer reparto y en los empates del primer lance.
- «Cartas de la casa»: una vez por duelo cambia una carta suya. Con Ojo alto en tu compañero o un objeto, lo puedes pillar y ganas 5 piedras.

**Lección:** todo lo aprendido junto. Leer, dosificar faroles, cambiar de estilo.

**Frase:** «En este pueblo no se mueve una carta sin que yo lo sepa.»

## IA de los rivales

La IA no necesita ser lista, necesita ser legible y coherente con su personaje. Se construye con cuatro piezas sencillas y no hace trampas: no ve tus cartas (salvo las reglas especiales del cacique, que se anuncian).

### 1. Fuerza de la mano por lance

Para cada lance, el rival calcula la probabilidad F (de 0 a 1) de que su mano gane a una mano cualquiera del jugador. Conoce sus 4 cartas; el jugador puede tener cualquier combinación de 4 de las 36 restantes, que son 58.905 combinaciones. Recorrerlas todas es inmediato incluso en un móvil.

- Grande, Chica, Pares, Juego y Punto se evalúan con la misma función de comparación que usa el recuento.
- Las declaraciones ajustan F: si el jugador dice «sí» a pares, se descartan las combinaciones sin pares.
- Para ahorrar cálculo, F se puede precalcular por lance en una tabla al repartir.

### 2. Decisiones

Cada decisión combina la fuerza con la personalidad y un poco de azar. Con A = Agresividad, B = Faroleo, M = Miedo al órdago, Me = Memoria (todas de 0 a 10):

**Envidar con buena mano:**

```latex
F > 0{,}65 - 0{,}03\,(A - 5)
```

La cantidad sube con la fuerza y la agresividad: 2 piedras de base, más 1 por cada 0,1 que F supere el umbral si A ≥ 6.

**Farolear:** si F < 0,35, envida con probabilidad

```latex
p_{farol} = 0{,}04\,B
```

**Aceptar un envite (quiero):**

```latex
F + \frac{50 - Cara}{200} + \frac{Me}{10}\cdot 0{,}6\,(t_{farol} - 0{,}25) + \varepsilon > 0{,}5
```

- El término de Cara hace que con Cara baja te acepten más y con Cara alta menos.
- t\_farol es la proporción de tus envites de este duelo que fueron faroles. Si faroleas más del 25 %, un rival con memoria te cree menos.
- ε es ruido aleatorio entre −0,05 y +0,05, para que no sea predecible al milímetro.

**Aceptar un órdago:** la misma fórmula, pero el umbral pasa de 0,5 a 0,5 + 0,04·M. Si el rival va perdiendo por 8 piedras o más, el umbral baja 0,1 (desesperación).

**Tirar un órdago:** solo con F > 0,85, o como farol con probabilidad 0,01·B cuando va perdiendo de 8 o más.

### 3. Tics

Cada tic se dispara con una probabilidad cuando se cumple su disparador (por ejemplo 60 %), y a veces sin cumplirse. La frecuencia de los disparos falsos se ajusta para que la fiabilidad real sea la de su tabla. Así la fiabilidad es un número de diseño que se puede equilibrar.

Los tics se disparan en momentos concretos: al recibir las cartas, al declarar pares o juego y al decidir un envite. Si el jugador está mirando al rival (pulsación larga), la animación dura más.

### 4. Memoria del duelo

El rival guarda tres contadores durante el duelo: tus envites, tus faroles descubiertos y tus órdagos. Con ellos calcula t\_farol. Los rivales con Memoria alta lo usan; los de Memoria baja, casi nada.

### Pseudocódigo de una decisión

```
funcion decidir(rival, lance, situacion):
    F = fuerza(rival.cartas, lance, situacion.declaraciones)
    disparar_tics(rival, lance, F)

    si situacion.hay_ordago:
        return aceptar(F, rival, umbral = 0.5 + 0.04 * rival.miedo)
    si situacion.hay_envite:
        return aceptar(F, rival, umbral = 0.5)  # quiero / no quiero / más

    si F > 0.85 y azar() < 0.1 * rival.agresividad: return ORDAGO
    si F > 0.65 - 0.03 * (rival.agresividad - 5): return ENVIDO(cantidad(F, rival))
    si F < 0.35 y azar() < 0.04 * rival.faroleo: return ENVIDO(2)
    return PASO
```

Con esto el rival parece tener carácter: el Herrero envida siempre que lleva algo, la Viuda casi nunca acepta, Fulgencio te sorprende con faroles y el Cura te deja de creer si abusas. Son unos cientos de líneas de código y todo se equilibra cambiando cinco números por rival.

## Progresión, plataforma y prototipo

### Progresión entre giras

- **Libreta:** las notas sobre cada rival se quedan para siempre.
- **Compañeros:** se desbloquean cumpliendo hitos (ver tabla de compañeros).
- **Objetos nuevos en la taberna:** cada cacique derrotado por primera vez añade 2 objetos al catálogo.
- **Grados de dificultad:** al completar la gira se desbloquea «Mus de Feria», con modificadores acumulables (los rivales empiezan con 3 piedras, menos Honra, tics menos fiables…), como las apuestas de Balatro.
- **Modo libre:** duelo suelto contra cualquier rival ya conocido, para practicar.

### Plataforma y controles

- **Plataforma:** de momento, **navegador** (escritorio y móvil, en horizontal) y sin conexión, como PWA. Más adelante se empaquetará para móvil.
- **Tecnología:** TypeScript + React + Vite (ver `CLAUDE.md`).
- **Controles:**
  - Tocar una carta para marcarla en el descarte.
  - Botones grandes en el lateral derecho: Paso, Envido, Más, Quiero, No quiero.
  - El botón de Órdago separado y con confirmación (deslizar hacia arriba), para que nunca se pulse sin querer y para que tirarlo se sienta como un gesto.
  - Mantener pulsado el retrato del rival para mirarle.
  - Partidas guardadas automáticamente al final de cada mano.

### Plan de prototipo

El orden de construcción prioriza comprobar que el núcleo es divertido antes de invertir en arte y contenido:

1. **Motor de mus:** baraja, reparto, mus, los cuatro lances y el recuento. Sin gráficos: TypeScript puro con pruebas. Probar que las reglas son correctas.
2. **Un duelo jugable:** interfaz fea, el Herrero con sus 2 tics como rectángulos que parpadean, envites y órdago. **Esta es la prueba clave:** si un duelo de 5 minutos ya es divertido, hay juego.
3. **IA completa y la Cara:** los 5 parámetros, la memoria y el medidor de Cara. Probar con 3 rivales distintos y ajustar los números.
4. **Estructura de gira:** una comarca completa con 2 parroquianos, cacique, taberna con 5 objetos y 2 compañeros.
5. **Arte y sonido de la primera comarca:** retratos animados, mesa, cartas propias, música. Esto sirve como demo vertical.
6. **Resto del contenido:** las otras 4 etapas, todos los compañeros y objetos, progresión y dificultades.

### Preguntas abiertas

- ¿Habrá un modo 2 contra 2 con un compañero que juegue cartas? Se descarta para la primera versión por complejidad, pero encaja como modo extra.
- ¿Modelo de negocio: pago único o gratis con demo? Un pago único sin anuncios encaja mejor con un roguelike sin conexión.
- ¿El duelo a 20 piedras se siente corto o largo? Ajustar con las pruebas del paso 2.
