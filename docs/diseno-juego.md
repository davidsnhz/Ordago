# Órdago — Documento de diseño

13 de octubre de 2026 · @david · *versión 11: los rivales ya tienen cara (v4), ajustes de equilibrio y de la mesa (v5), el acta narrada (v6), la visión del juego con la gira en arenas de cuatro niveles (v7), las arenas nuevas con la Honra (v8), los nombres nuevos (v9), la fase 4, con la primera arena ya en el juego (v10), y las conexiones entre secuaces y jefes, para más adelante (v11)*

> **Estado del proyecto.** Las fases 1 (motor de mus), 2 (duelo contra Agustín), 3 (IA completa, la Cara y los cinco rivales) y **[nuevo] 4 (la gira, con la primera arena entera)** están hechas, el juego es **vertical** y se ha hecho una ronda de retoques y depuración a fondo antes de la gira. **Los cinco rivales del principio tienen su arte** en la mesa; los de la facultad salen con marcador hasta que estén sus dibujos. Se puede jugar en **https://ordago-game.vercel.app**. Lo siguiente es jugarla, ajustar números y, después, la fase 5: el pulido. **[nuevo]** El contenido de la gira (las arenas con sus secuaces y su jefe, la taberna, los objetos y los compañeros) está en un documento aparte para ir cambiándolo: **[La gira](gira.md)** (también en PDF, *Órdago — La gira.pdf*). Primero se comprueba que es divertido y luego se pone bonito: el pulido a fondo (animaciones, arte, sonido) va después de la gira. Los cambios de las versiones 4 a 11 van marcados con **[nuevo]** o **[cambiado]**; lo que cambió en cada versión está al final, en «Historial de versiones».

## Visión y esencia

**[cambiado]** La visión del juego, contada por David y ordenada:

- **Qué es.** Un roguelike inspirado en el mus, el juego de cartas español. Eres **un forastero que se adentra en Castilla** jugándose el mus con la gente de cada sitio: estudiantes, los del bar, una familia de pueblo, los veteranos de las fiestas y los caciques.
- **Uno contra uno.** No es el mus de siempre, dos contra dos: juegas **tú solo contra un rival, a 20 piedras**.
- **Partidas cortas.** Cada duelo a 20 piedras dura lo que una partida de Clash Royale: unos pocos minutos. La gira entera, que encadena muchos duelos, dura algo más de una hora.
- **El camino.** El mapa se inspira en las arenas de Clash Royale, pero cada arena es **un sitio de España**: la cafetería de la facultad, el bar de toda la vida, una casa de la Montaña Palentina, las fiestas del pueblo y el casino de la capital. Cada arena tiene **cuatro niveles**, como en Balatro: tres secuaces y su jefe. Los rivales son gente típica de Castilla, cada uno con su forma de jugar.
- **Leer al rival.** Cada rival tiene **tics**: gestos que se le escapan y que te ayudan a saber si está mintiendo o si lleva buena mano en ese lance. Ninguno acierta siempre.
- **Mentir.** Como en el mus de verdad, tú también puedes **farolear**: envidar sin nada y que el rival se lo crea, o no. Lo que te creen se mide con **la Cara**, el medidor que está debajo del marcador. Con la Cara alta te tienen miedo y se retiran; con la Cara baja te lo quieren todo.
- **Lo que llevas contigo.** Un **compañero**, que tiene su habilidad y te hace jugar de otra manera. Solo puedes llevar uno a la vez, pero en la taberna se compran y se cambian a medida que avanzas. Y **objetos** de la taberna: unos te ayudan a ti, otros fastidian al rival y otros te dejan hacer cosas distintas.
- **Si pierdes, vuelves a empezar.** Como en Balatro: cuando se acaba la gira, vuelves al principio desde cero. Tienes tres vidas, **la Honra**, porque en el mus el reparto pesa mucho y una mala racha de cartas no debería tirarte la gira entera. **[cambiado]** La gira solo se acaba cuando te quedas sin Honra: si pierdes contra un jefe, te cuesta una y vuelves a jugar contra él hasta ganarle. De una gira a otra solo te llevas lo aprendido (la Libreta) y lo desbloqueado.

En resumen: un roguelike de duelos de mus 1 contra 1 donde se gana leyendo al rival y apostando con cabeza, no construyendo combinaciones de cartas. Se juega sin conexión, en móvil y **en vertical**, con una mano.

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
| Progresión | Comodines que cambian la puntuación | Ranking y partidas | Compañeros y objetos que dan información, ventajas en el envite o fastidian al rival |
| Formato | Partidas largas | 2 contra 2 a 40 piedras | Duelos 1 contra 1 a 20 piedras dentro de una gira |

La frase que resume el juego: **«No gana quien lleva mejores cartas, gana quien hace creer que las lleva.»**

## Ambientación y estética

Eres un jugador forastero que recorre Castilla desafiando a sus mejores jugadores de mus, hasta llegar a la gran timba de la capital. **[cambiado]** Empiezas donde aprenden casi todos, en la cafetería de la facultad, y vas subiendo: el bar, una familia de pueblo, los veteranos de las fiestas y el casino. Cada arena tiene tres secuaces y un jefe que no ha perdido nunca.

### La gira

La gira recorre sitios reconocibles de España, cada uno con su identidad visual y sus personajes. Se muestra como las **arenas de Clash Royale**: un camino vertical de arenas que se va subiendo, con la siguiente bloqueada hasta vencer al jefe de la anterior. **[cambiado]** Cada arena tiene cuatro niveles: tres secuaces y su jefe (ver «Estructura de la partida»). Quién es cada secuaz está en [La gira](gira.md).

**[cambiado]** Las arenas, elegidas por David el 13 de octubre de 2026:

| Arena | Dónde | Ambiente | Contra quién | Jefe |
| --- | --- | --- | --- | --- |
| 1 | La facultad | La cafetería de una universidad pública: mesas de formica, máquina de café, apuntes | Estudiantes, que es donde casi todos aprenden a jugar | Chema, el Repetidor, que no entra en clase y vive en la cafetería |
| 2 | El bar | Barra de zinc, raciones, la tele con el fútbol, la tragaperras | Adultos, no ancianos (Agustín y Aurelio juegan aquí) | Manolo, el Rey de la barra: cuarenta y tantos, medio calvo y con barriga cervecera |
| 3 | La Montaña Palentina | Casa de piedra, nieve, chimenea, mesa camilla con brasero | Una familia de pueblo: la niña, la madre y el padre | El abuelo Pepe |
| 4 | Las fiestas del pueblo | Farolillos, casetas, orquesta y la carpa del concurso de mus | Ancianos que han jugado al mus toda su vida (Doña Ignacia y Don Francisco juegan aquí) | El tío Arturo, el Campeón de las fiestas |
| 5 (final) | El casino de la capital | Terciopelo, lámparas, humo | Los de la casa | Don Rodrigo, el Cacique |

### Arte

> **Esta sección está sustituida por `docs/direccion-arte.md`.** El pixel art se descartó: la interfaz y la baraja usan el estilo de naipe impreso. **[cambiado]** Los personajes son ilustraciones en 3D de estilo de animación (las hojas de personaje de David) **pasadas por la imprenta** para que casen con la mesa: tonos planos, tinta en lugar de negro, papel en lugar de blanco, grano de impresión, contorno de tinta y sombra dura, como los paneles. **[cambiado]** David ha decidido diseñar de nuevo desde cero a todos los personajes, también a estos cinco; hasta que estén, el juego usa los dibujos de ahora.

- **La mesa en el centro.** Vista frontal: el rival sentado enfrente, ocupando el centro de la pantalla vertical. Tus cartas abajo y los botones al pie, al alcance del pulgar.
- **Maquetación vertical:** escenario de 390 × 844, como un móvil. En ordenador se ve centrado con bandas, y si giras el móvil sale un aviso para ponerlo en vertical. De arriba abajo:
  1. **La cabecera [cambiado]**, en un solo panel bajito (opción «H3 · Tu careto», en versión compacta, elegida por David entre prototipos que están en `referencias/prototipos-cabecera/`):
     - **Arriba**, los nombres (el rival a la izquierda, tú a la derecha) y en medio *a 20 piedras*.
     - **En medio**, los dos números grandes, la insignia **MANO** junto al de quien lo es y **los lances como pasos**: los jugados con ✓ y apagados, el que se juega relleno de rojo y los que faltan con borde de puntos (*✓ Grande · Chica · Pares · Juego*). Si nadie tiene juego, el último paso es *Punto*.
     - **Abajo, tu Cara:** tu **careto** de tinta (sudando si te pillan, serio si te creen, con media sonrisa si te temen), qué significa ahora en pocas palabras (*te creen: a veces cuela*), su número, una barra fina de tres zonas con la marca y el botón **«?»**. Arriba ya no sale el nombre de la comarca.
     - **Cuando la Cara cambia**, la cifra (*+8*, *−12*) sube un momento sobre la marca y se va; el motivo queda apuntado en el acta. Antes salía un aviso debajo de la barra que tapaba la cara del rival, justo donde están sus tics. Cuando se te nota el pulso, la etiqueta *SE TE NOTA* parpadea.
     - **«?»** abre una ficha corta: qué es la Cara (*lo que te creen en la mesa*), qué la mueve (+8, +4, −12, −15) y qué hace cada zona, con la tuya resaltada. Mientras está abierta, el rival espera.
  2. **El rival**, grande y centrado, con sus tics. **[cambiado]** Ya no lleva al lado el cartel con su nombre, que sobraba (su nombre está en el marcador); en ese sitio solo sale, mientras dura, una etiqueta con su estado: *¡ENFADADO!* (Agustín) u *OFENDIDA* (Doña Ignacia). Se ve de cintura para arriba, recortado sobre la pared de la taberna, con la luz del quinqué detrás; el acta tapa el corte de la figura y su cola le apunta.
  3. **El acta de la mano [cambiado]:** un solo panel bajo el retrato, con la cola apuntando al rival, donde está todo lo que se dice y pasa. **Cuenta la partida con frases normales** (opción «D3 · Narrado», elegida por David entre varios prototipos que están en `referencias/prototipos-acta/`).
     - **La pestaña** de arriba dice en qué estamos: *LA GRANDE*, *LA CHICA*, *PARES*, *EL JUEGO*, *EL PUNTO*, o *MUS · MANO 2*, *DESCARTE*, *TRATO*.
     - **La ficha roja** de la esquina dice lo que hay en juego cuando hay envite: *6 en juego*, o *TODO · el duelo* si es un órdago.
     - **Dentro, las tres últimas cosas, contadas:** lo tuyo en cursiva azul y en pasado (*Has envidado dos.*); lo del rival en versalitas rojas y en presente, con su frase debajo (*Agustín sube cuatro más* · *«¡Más leña al fuego!»*); y lo que pasa en la mesa en letra corriente (*Grande en paso: se cobra en el recuento*). Ya no se usa la letra gruesa dentro del acta.
     - Lo último va bien marcado y lo anterior, algo apagado. Si una frase larga no deja sitio, lo más antiguo se esconde entero (nunca se corta a medias).
     - Cada mano empieza diciendo quién es mano; en la primera, además, qué significa: *Mano 1: eres mano (habla primero y gana los empates)*. Al empezar el duelo, *Agustín se sienta a la mesa* con su saludo.
     - **«Toda la mano»**, debajo del panel, la abre entera para repasar lo que ha pasado.
  4. **El tapete [cambiado]** ocupa algo más del tercio de abajo de la pantalla (de 529 a 844 px), con margen por encima de las cartas del rival, que van boca abajo arriba del tapete, con aire entre ellas y tu mano.
  5. **Tu mano**, en abanico. **[cambiado]** Cartas más grandes (80 × 145 px en vez de 70 × 126, un 15 % más), sin llegar a la barra de botones.
  6. **La barra de acciones** (ver controles). Cuando le toca al rival dice *Le toca a Agustín…* en vez de quedarse vacía.
- **[nuevo] Las pantallas de la gira** (elegidas por David entre prototipos, en `referencias/prototipos-gira/`):
  - **La portada:** el letrero de Órdago y su lema, *SEGUIR LA GIRA* (si hay una guardada, con por dónde vas), *EMPEZAR LA GIRA*, *DUELO SUELTO* (contra quien quieras, agrupados por arena, sin Honra ni reales) y *LIBRETA*.
  - **Elegir compañero (C):** los que tienes, con su pasiva y su seña, y abajo los que faltan por desbloquear.
  - **El mapa (A1, como las arenas de Clash Royale):** la arena en curso ocupa la pantalla, con sus cuatro paradas en un camino punteado de abajo arriba hasta el jefe (*AQUÍ ESTÁS* en la de ahora, ✓ las ganadas, ✕ las perdidas, candado las que faltan); la siguiente arena asoma arriba tapada por la niebla (*Gana a Chema para entrar*). Arriba, la Honra, los reales, la Cara y el compañero; abajo, quién viene, lo que da ganarle y *¡A LA MESA!*.
  - **En la mesa, la bolsa (M3):** un botón redondo arriba a la izquierda, con cuántas cosas se pueden usar ahora. Al tocarlo se abre un panel con la seña del compañero y cada objeto explicado, con su botón; mientras está abierto, el rival espera. Arriba a la derecha, *SALIR* a la portada (se guarda al final de cada mano).
  - **Después del duelo (R):** lo que cobras y por qué, cómo vas de reales, Honra y Cara, lo apuntado en la Libreta y adónde vas: la taberna, la plaza o la era.
  - **La taberna (T1):** dos baldas con lo que hay a la venta, la ficha de lo que tocas (comprar o vender) con *OTRA RONDA*, y tu bolsa abajo con los huecos.
  - **La plaza, la era, el premio del jefe y el final:** una ficha en el centro.
  - **La Libreta:** una hoja de cuaderno con lo apuntado de cada rival.
- **Herramientas de pruebas:** los botones Rival, Depurar y **Tics [nuevo]** son solo para probar el juego mientras se hace. Tics enseña seguidos todos los tics del rival, para revisar su arte sin esperar a que salgan jugando. Salen en desarrollo o con `?pruebas` en la dirección (*ordago-game.vercel.app/?pruebas*); en el juego normal no están.
- **El rival es lo más importante de la pantalla** porque es donde están los tics. Necesita animaciones sutiles: parpadeo, respiración, manos, mirada. Cada tic es una animación propia.
  - **Lo que ya hay [nuevo]:** el rival **respira** (se ensancha un pelo y vuelve, cada 4 segundos) y **parpadea** cada pocos segundos. Cada tic dibujado es un **cambio de pose con un fundido**: *Agustín se lleva la mano a la barba* y, pasado el tic, vuelve a su postura. Algunos se mueven en varios fotogramas (*Aurelio levanta el sombrero*, *golpea dos veces con la vara*) y otros llevan un efecto encima (*le brilla el diente de oro*, *el puro de Don Rodrigo echa humo*). Los gestos de ojos van pintados sobre el retrato: *Doña Ignacia entorna los ojos y se inclina hacia ti*, *Don Rodrigo pone los ojos en blanco hacia arriba*.
- **Cada arena tiñe el ambiente** (fluorescente en la facultad, azulado en la montaña, con farolillos en las fiestas).
- **Detalles de taberna**: porrón, vasos de chato, un perro durmiendo, parroquianos de fondo que reaccionan a los órdagos.

### Tono

Humor costumbrista y un punto de picaresca. Los rivales hablan con refranes y frases de mesa de mus («Envido», «Más», «Lo veo», «¡Órdago!»). Sin caricatura cruel: son personajes entrañables a los que da gusto ganar.

### Sonido

- Guitarra, dulzaina y acordeón en loops tranquilos de taberna.
- La música baja y queda un latido cuando hay un órdago sobre la mesa.
- Sonidos táctiles: cartas, amarracos chocando, golpe en la mesa al envidar fuerte.
- Voces cortas tipo murmullo (como en Animal Crossing) con frases clave grabadas: «¡Órdago!», «Quiero», «No quiero».

## Estructura de la partida

**[cambiado]** Una partida es una gira de 5 arenas de 4 niveles cada una: 20 duelos, algo más de una hora. **[cambiado]** La gira solo termina cuando te quedas sin Honra; entonces vuelves a empezar desde cero, con lo desbloqueado.

### Niveles de juego

| Nivel | Qué es | Duración aproximada |
| --- | --- | --- |
| Gira | La partida completa: 4 arenas + el casino final | 60–80 min (más si repites contra algún jefe) |
| **[cambiado]** Arena | Un paisaje: 3 secuaces y su jefe | 12–16 min |
| Duelo | Un enfrentamiento a 20 piedras contra un rival: **la partida corta** del juego, como una de Clash Royale | 2–4 min |
| Mano | Reparto, mus, los cuatro lances y el recuento | 30–60 s |

### Recursos de la gira

- **Honra (vidas) [cambiado]:** empiezas con 3 (confirmado por David: el reparto pesa mucho y una mala racha no debe tirar la gira). Perder contra un secuaz cuesta 1 y no cobras ese duelo, pero sigues al siguiente nivel. **[cambiado]** Perder contra un jefe también cuesta 1, y vuelves a jugar contra él hasta que le ganes o te quedes sin Honra (decidido por David). Antes de repetir puedes pasar por una parada. La gira solo se acaba sin Honra. Una monja en la plaza puede darte una de más (ver [La gira](gira.md)).
- **Reales (moneda):** se ganan en cada duelo y se gastan en la taberna.
- **Cara (temple):** de 0 a 100, se arrastra de un duelo a otro. Ver el apartado de faroles.
- **Libreta:** apuntes que tomas sobre cada rival una vez le hayas ganado. Persiste entre giras.

### Dentro de una arena

**[cambiado]** Cada arena tiene cuatro niveles, como las ciegas de Balatro, y se juegan en orden, de menos a más:

1. **Primer secuaz:** el más flojo, con un solo tic de verdad.
2. **Segundo secuaz:** dos tics y una manía pequeña.
3. **La mano derecha del jefe:** juega parecido a él y tiene una manía que anuncia su regla.
4. **El jefe:** el mejor de la arena, con su regla especial completa.

Los secuaces son versiones más sencillas de la idea de su jefe. Quién es cada uno, cómo juega y sus tics están en [La gira](gira.md). Al entrar en una arena ya ves al jefe y su regla, para preparar la taberna.

Entre duelo y duelo eliges una parada:

- **La taberna:** tienda de objetos y compañeros.
- **La plaza:** un evento aleatorio (un forastero te propone una apuesta, una fiesta patronal, un timador).
- **La era:** descansas y recuperas Cara.

Ganar al jefe te da un premio a elegir entre tres (un compañero, su objeto raro o +1 de Honra si te falta) y abre la siguiente arena.

*(Diagrama del bucle: elegir compañero → nueva arena → secuaz 1 → parada (taberna, plaza o era) → secuaz 2 → parada → mano derecha del jefe → parada → jefe → si ganas: premio y siguiente arena; si pierdes: −1 de Honra, parada y otra vez el jefe; si te quedas sin Honra: fin de la gira, se guardan Libreta y desbloqueos → nueva gira.)*

Tras el casino final, ganar a Don Rodrigo completa la gira y desbloquea la dificultad siguiente.

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

### Aclaraciones de reglas

Lo que el reglamento no dejaba claro se ha resuelto con la opción más fiel al mus tradicional:

- **Juego pasa a Punto.** Si ninguno tiene juego, el último lance se juega y se rotula como Punto. Vale 1 piedra; si se envida y se quiere, lo envidado más 1. *Ejemplo: envidas 4 al Punto, te lo quieren y ganas con 30: cobras 5.*
- **Tras un «no quiero».** En la Grande y la Chica solo se cobra el «no quiero» (1 piedra, o lo que se hubiera aceptado antes de la última subida). En Pares, Juego y Punto quien envidó se lleva además el lance: cobra en el recuento sus pares, su juego o el punto, aunque el rival tuviera mejores cartas. *Ejemplo: envidas a Pares con pareja de ases, el rival lleva duples y no quiere: cobras 1 ahora y 1 por tu pareja; sus duples no cobran nada.*
- **Los «no quiero» se cobran en el momento.** Si con eso alguien llega a 20, el duelo acaba ahí.
- **Órdago rechazado:** quien lo tiró cobra 1 piedra si no había nada envidado, o lo que hubiera en juego antes del órdago. *Ejemplo: envido 2, órdago, no quiero: 2 piedras.*
- **Pares o Juego cuando solo uno tiene:** no hay envites y quien los tiene cobra su valor en el recuento.
- **Pares a 8 reyes:** un tres y un rey son pareja de reyes; un dos y un as, pareja de ases. Sota y caballo no son pareja. Cuatro reyes (R R 3 3) son duples. Los duples se comparan por su pareja más alta y luego por la más baja. Con la misma jugada, las cartas sueltas no desempatan: gana la mano.
- **El mus:** como mucho 2 rondas de descarte; se descartan de 1 a 4 cartas y la mano descarta primero. Si se acabara el mazo, se barajan los descartes anteriores (nunca vuelven las cartas que acabas de tirar).
- **Quién es mano:** cambia en cada mano, no en cada descarte. En el primer reparto se sortea (salvo con Don Rodrigo).
- **Cantidades:** el envite mínimo es 2 y la subida mínima, 2. No hay tope.
- **Declaraciones:** las de pares y juego son automáticas y siempre verdaderas; declara primero la mano. El farol está en el envite, no en la declaración.
- **Reparto:** de una en una, empezando por la mano, con la baraja completa y barajada en cada mano.

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
| **[cambiado]** Ganar un duelo contra un secuaz | 4 el primero, 5 el segundo y 6 la mano derecha del jefe |
| Ganar un duelo contra un jefe | 10 |
| Cada envite aceptado y ganado | +1 |
| Cada farol que el rival no descubre (**[cambiado]** cuenta el farol al que el rival dice «no quiero») | +1 |
| Ganar un órdago | +5 |
| Perder un duelo | 2 de consolación |

Así el juego premia jugar como en el mus: envidar, aceptar y farolear da más dinero que ganar pasando.

### El órdago

El órdago es el clímax y tiene su propia puesta en escena:

1. Golpe en la mesa, la música se corta y queda un latido.
2. Plano cerrado sobre la cara del rival mientras decide. Su tic, si lo tiene, se ve mejor que nunca.
3. Si lo acepta, las cartas se enseñan una a una, a cámara lenta, solo para ese lance.
4. El ganador se lleva el duelo entero. Los parroquianos del fondo reaccionan.

**Cómo se tira:** el botón de órdago es pequeño y está aparte, en la esquina de la barra de acciones. Hay que **mantenerlo pulsado un segundo** mientras se llena; si lo sueltas antes, no se tira.

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

**Cómo salen:** si se cumple su disparador, el tic sale el 60 % de las veces; en falso sale lo justo para que, de todas las veces que lo ves, acierte su fiabilidad (comprobado con 150.000 manos). Salen al recibir cartas (reparto y tras descartar), al declarar su lance y al decidir un envite de su lance. **[cambiado]** Si el tic tiene dibujo, se ve sin texto: el rival cambia de pose. Si todavía no lo tiene, el rival se sacude y aparece una acotación con el gesto («se rasca la barba»). Lo que significa cada tic solo se ve en el modo de pruebas.

**Tics con dibujo [nuevo]** (los demás esperan a que haya arte):

| Rival | Con dibujo | Sin dibujo todavía |
| --- | --- | --- |
| Agustín | Se rasca la barba, se arremanga | — |
| Doña Ignacia | El rosario, te mira fijamente | — |
| Don Francisco | Mira al cielo | Bebe vino (no lleva vaso), junta las manos |
| Aurelio | El diente de oro, se quita el sombrero, golpea la vara | — |
| Don Rodrigo | Se rasca la barba, se arremanga, bebe vino, mira al cielo, el humo del puro | Junta las manos |

Ningún tic es 100 % fiable. Si lo fueran, el juego sería memorizar. Con un 70–85 % hay que decidir con riesgo, que es lo que hace divertido el mus.

### La Libreta

Cada vez que ves un tic y luego se enseñan las cartas, el juego te deja anotarlo en la Libreta del rival. Las notas se rellenan poco a poco («Se rasca la barba… ¿cuando lleva pares?») y se confirman con más observaciones.

**[nuevo] Cómo funciona en el juego:** se apunta solo, al acabar cada duelo (de la gira o suelto). Cada tic que viste en una mano que llegó a enseñar las cartas (recuento u órdago) cuenta una vez; con el Lazarillo, dos. La nota tiene tres niveles: con 1 vez, el gesto (*Mordisquea el boli… ¿qué querrá decir?*); con 4, lo que puede querer decir (*Mordisquea el boli… ¿pares o mejor?*); y con 10, lo que significa y cuánto acierta según lo que has visto (*Mordisquea el boli: pares o mejor (acierta 9 de cada 10)*). Después de cada duelo sale lo que ha subido, y se puede leer entera desde la portada o el mapa.

La Libreta persiste entre giras. Es tu progresión como jugador: la segunda vez que te enfrentas a la Viuda ya sabes algo de ella. Algunos rivales tienen tics que cambian (Don Rodrigo; en la gira, también Doña Isabel y el abuelo Pepe, que a mitad del duelo hace señas falsas), para que la Libreta nunca lo resuelva todo.

### Mirar al rival

Manteniendo pulsado sobre el retrato se hace zoom a la cara del rival durante unos segundos. Mientras miras no puedes actuar, y algunos rivales se dan cuenta y cambian de comportamiento. Mirar es una decisión, no algo gratis. Mientras miras, el rival espera, el resto de la mesa se oscurece y sus tics duran 1,6 veces más.

### La Cara (temple)

Tu Cara es un medidor de 0 a 100 que representa lo creíble que eres en la mesa. Empiezas la gira con 60.

| Situación | Efecto en la Cara |
| --- | --- |
| Farol que el rival no acepta (se retira) | +8 |
| Envite con buena mano que el rival acepta y pierde | +4 |
| Farol descubierto (el rival lo quiere y se ven las cartas), aunque al final ganes el lance | −12 |
| Órdago **tuyo** perdido (si además era de farol, −12 más) | −15 |
| Aceptar un envite del rival | 0: el farol es de quien envida |
| Descansar en la era | +20 |

**Qué es un farol para el juego:** un envite, subida u órdago en un lance en el que tus cartas tenían menos de un 35 % de probabilidad de ganar. El juego lo calcula solo; no hay que declararlo. «Buena mano» es un 65 % o más. A Pares solo cuentan las manos rivales con pares, al Juego las que tienen juego y al Punto las que no. *Ejemplo: envidas cinco a la Grande con C 6 C 6: sin reyes, esa Grande gana menos del 35 % de las veces, así que cuenta como farol.*

Mientras no haya gira, **cada duelo empieza de cero, con la Cara en 60**: al acabar un duelo, la revancha o el duelo contra otro rival no arrastran la Cara del anterior. Con la gira (fase 4), la Cara pasará de un duelo al siguiente dentro de la misma gira. En el modo de pruebas se puede subir o bajar a mano.

**Qué hace la Cara:**

- **Cara alta (70+):** los rivales tienden a no aceptar tus envites. Tus faroles funcionan mejor, pero tus buenas manos cobran menos.
- **Cara media (35–70):** comportamiento normal.
- **Cara baja (menos de 35):** los rivales te aceptan casi todo. Los faroles ya no sirven, pero con buenas cartas puedes cobrar mucho.
- **Cara a 0:** se te nota todo. Durante ese duelo, aunque luego vuelvas a subir, los rivales ven tu tic: **te tiembla el pulso** cuando llevas buena mano en el lance que se juega (acierta el 80 %). Si te lo ven, te creen fuerte (su fuerza baja 0,2); si no, sube 0,1. Tú ves cuándo se te ha notado: aparece «Se te nota: te tiembla el pulso» junto a tu mano.

Esto crea un ciclo interesante: a veces conviene dejar que te pillen un farol barato para que luego te acepten el envite grande con duples.

## Compañeros

El compañero es el equivalente a los comodines de Balatro, pero con sabor a mus: es tu pareja de mesa, se sienta a tu lado y te ayuda con señas y trucos. No juega cartas; da habilidades.

**[cambiado]** Cómo se llevan (decidido por David):

- **Solo uno a la vez.** Empiezas la gira eligiendo uno entre los desbloqueados.
- **En la taberna se compran y se cambian** a medida que avanzas por las arenas. Si compras uno, el tuyo se despide y te deja la mitad de lo que costó. Ganar a un jefe también puede darte uno nuevo, si eliges ese premio.
- Cada compañero tiene una **habilidad pasiva** y una **seña** que se usa un número limitado de veces por duelo.
- **[nuevo] En el juego** están los dos del principio: **el Lazarillo** (la Libreta cuenta doble; su seña te enseña una carta del rival, que se ve boca arriba en la mesa) y **la Recaudadora**, de Hacienda (+2 reales por duelo ganado; su seña hace que el próximo órdago que ganes cobre el triple). **[cambiado]** Nombres puestos por David el 13 de octubre de 2026: el Pastor pasa a ser el Lazarillo; la Tabernera, la Recaudadora; la Cotilla, la Maruja; el Sacristán, el Monaguillo; la Moza del Molino, la Moza; el Alguacil, el Militar; y el Forastero, el Afilador.

**[cambiado] La lista de compañeros está en [La gira](gira.md)**, con su pasiva, su seña, cómo se desbloquea y su precio, para ir cambiándola sin tocar este documento. Son once: el Lazarillo y la Recaudadora (desde el principio), el Tahúr, el Jubilado (antes, el Abuelo: cambia de nombre para no confundirlo con el abuelo de la familia), la Moza, el Monaguillo, el Veterano, el Afilador y tres nuevos (la Maruja, el Militar y el Dulzainero). Lo decidido sobre el Tahúr y el Veterano está allí y en «Preguntas abiertas».

La idea es que cada compañero empuje a un estilo distinto, para que dos giras no se jueguen igual. Combinado con los objetos, salen las sinergias propias de un roguelike: Tahúr con objetos de descarte, Recaudadora con objetos de órdago, Lazarillo con objetos de lectura.

## Objetos de taberna y economía

Los objetos se compran con reales en la taberna y son la segunda capa de construcción de la partida. **[cambiado]** Hay cuatro tipos, más los objetos raros que da cada jefe, con límites para que haya que elegir. Unos te ayudan a ti y otros **van contra el rival** (lo pidió David):

| Tipo | Qué son | Duración | Huecos |
| --- | --- | --- | --- |
| Bebidas | Te ayudan a ti | Se consumen al usarlas, durante un duelo | **[cambiado]** 2, compartidos con las jugarretas |
| **[nuevo]** Jugarretas | Fastidian al rival. *Ejemplo: «Darle conversación»: en esta mano el rival no puede tirar órdago* | Se consumen al usarlas, durante un duelo | Los mismos 2 |
| Amuletos | Pasivos; unos te ayudan y otros van contra el rival. *Ejemplo: la «Carta del gobernador» quita a los jefes su regla especial* | Toda la gira | **[cambiado]** 2, compartidos con los objetos raros |
| Barajas | Cambian la baraja | Toda la gira | 1 |
| **[nuevo]** Objetos raros | El premio de cada jefe (los Apuntes de Chema, la Jarra de Manolo…) | Toda la gira | Los mismos 2 que los amuletos |

**[nuevo] En el juego** están los cinco de la primera taberna: el Orujo (+15 de Cara), el Chato de vino (el rival canta su mano: sus cartas se ven boca arriba esa mano), Darle conversación (esa mano no puede tirar órdago), la Medalla de la Virgen y la Boina de la suerte; y los Apuntes de Chema como premio. Las bebidas y jugarretas se usan desde la bolsa, en cualquier momento de una mano (el Orujo, también entre manos).

**[cambiado] El catálogo de objetos, con su efecto y su precio, está en [La gira](gira.md)**, junto con cómo funciona la taberna (cuatro cosas a la venta, «otra ronda» para cambiarlas y vender por la mitad). **[cambiado]** Decididos por David: la Medalla de la Virgen (la primera vez en cada duelo que te pillan un farol, tu Cara no baja; 9 reales), el Chato de vino (el rival canta su mano; 4 reales), el Caldo de la abuela (si el rival llega a 20, se juega hasta 30), la Ristra de ajos (los rivales no hacen tics falsos) y la Gorra calada (7 reales). La Gaseosa y el Reloj de bolsillo, rehechos para que sirvan de algo.

### Economía de referencia

**[cambiado]** Con los reales de la tabla de apuestas, un jugador medio gana unos 30–40 reales por arena (25 por ganar los cuatro duelos, más los envites, faroles y órdagos). Eso da para 2–3 objetos por arena y obliga a decidir entre bebidas baratas y un amuleto caro. Estos números son un punto de partida y se ajustan en las pruebas.

## Los 5 rivales que ya están en el juego

**[cambiado]** Son los cinco que se pueden jugar ya en duelos sueltos. **[cambiado]** El 13 de octubre de 2026 David les cambió el nombre (se quedan el «don» y el «doña»): Ruperto pasa a ser **Agustín**; Doña Engracia, **Doña Ignacia**; Don Anselmo, **Don Francisco**; Fulgencio, **Aurelio**; y Don Bonifacio, **Don Rodrigo**. En el juego ya salen así. Con las arenas nuevas, cada uno tiene su sitio en la gira: **Agustín y Aurelio juegan en el bar** (niveles 2 y 3), **Doña Ignacia y Don Francisco, en las fiestas del pueblo** (niveles 1 y 2), y **Don Rodrigo es el jefe final del casino**. Cada uno enseña una lección distinta del juego. El resto de rivales (los secuaces y los jefes nuevos) está en [La gira](gira.md).

Los parámetros van de 0 a 10 y alimentan la IA del apartado siguiente.

| Rival | Agresividad | Faroleo | Miedo al órdago | Memoria | Ojo |
| --- | --- | --- | --- | --- | --- |
| Agustín, el Herrero | 8 | 3 | 2 | 2 | 2 |
| Doña Ignacia, la Viuda | 3 | 1 | 9 | 6 | 7 |
| Don Francisco, el Cura | 5 | 5 | 5 | 7 | 5 |
| Aurelio, el Tratante | 7 | 9 | 4 | 5 | 6 |
| Don Rodrigo, el Cacique | 6 | 6 | 6 | 10 | 9 |

- **Agresividad:** cuánto envida y sube con manos buenas.
- **Faroleo:** con qué frecuencia envida con manos malas.
- **Miedo al órdago:** cuánto le cuesta aceptar un órdago.
- **Memoria:** cuánto ajusta su juego según tus faroles anteriores.
- **Ojo:** lo bien que detecta tus trucos (El Tahúr, mirar demasiado).

### 1. Agustín, el Herrero (el bar, nivel 2)

**Aspecto [cambiado]:** *por rediseñar desde cero; de momento, el dibujo actual:* grandote, barba enorme y rizada, pañuelo rojo al cuello, delantal de cuero con tirantes y muñequeras. Golpea la mesa al envidar.

**Personalidad:** bruto y directo. Cuando lleva cartas, se le ve en todo. Envida fuerte, sube mucho y casi nunca farolea. Acepta los órdagos por orgullo.

**Tics:**

| Tic | Disparador | Fiabilidad |
| --- | --- | --- |
| Se rasca la barba | Lleva pares o mejor | 85 % |
| Se arremanga | Lleva 31 | 80 % |

**Regla especial:** si pierde 3 lances seguidos se enfada y durante 2 manos acepta todo. Cuentan los lances que se juegan, en orden y de una mano a otra (los que no se juegan, como Pares cuando nadie lleva, no cuentan). Enfadado acepta cualquier envite y cualquier órdago, aunque si va fuerte puede seguir subiendo.

**Cuándo corta el mus:** corta con cualquier pareja de reyes y, al descartar, guarda reyes y parejas. *Ejemplo: con R 5 A 6 tira el 5, el as y el 6; Don Francisco, con la misma mano, se quedaría el as para la Chica.* Todos los rivales cortan además con tres o cuatro reyes, 31, duples con reyes, o dos reyes con caballo o sota.

**Lección:** aprender que los tics existen y que leerlos funciona.

**Frase:** «Aquí se juega como se forja: a golpes.»

### 2. Doña Ignacia, la Viuda (las fiestas del pueblo, nivel 1)

**Aspecto [cambiado]:** *por rediseñar desde cero; de momento, el dibujo actual:* de negro, con mantón morado de flecos, moño gris, pendientes de oro, bastón y un rosario entre los dedos. Mirada de rayos X.

**Personalidad:** paciente y desconfiada. Casi nunca farolea, rechaza muchos envites y nunca acepta un órdago antes de la tercera mano. Cuando envida ella, lleva cartas. **[cambiado]** Con el ajuste de equilibrio (ver «El farolero»), los envites pequeños los quiere más que antes: acepta casi la mitad de tus envites, frente al 30 % de antes. Sigue sin farolear y sin aceptar órdagos pronto.

**Tics:**

| Tic | Disparador | Fiabilidad |
| --- | --- | --- |
| Pasa las cuentas del rosario más rápido | Lleva una mano fuerte en algún lance | 75 % |
| Te mira fijamente | Sospecha que faroleas (tu Cara está baja) | 90 % |

**Regla especial:** con Ojo 7, si la miras más de 2 segundos se da cuenta 7 de cada 10 veces, se ofende y no hace tics en lo que queda de mano ni en la siguiente. No acepta un órdago antes de la tercera mano; después, con su miedo de 9, solo con una mano casi perfecta. «Te mira fijamente» sale cuando responde a un envite tuyo y tu Cara está por debajo de 35.

**Lección:** a veces no se gana engañando, sino cobrando poco a poco y respetando sus envites.

**Frase:** «Treinta años jugando con mi difunto. A mí no me la das.»

### 3. Don Francisco, el Cura (las fiestas del pueblo, nivel 2)

**Aspecto [cambiado]:** *por rediseñar desde cero; de momento, el dibujo actual:* sotana, solideo, estola morada, cruz de oro y mofletes colorados. Falta dibujarle el vaso de vino, que necesita su tic.

**Personalidad:** equilibrado y astuto, con una manía: envida siempre a la Chica, lleve lo que lleve. Es el primer rival con buena memoria: si le faroleas dos veces, deja de creerte.

**Tics:**

| Tic | Disparador | Fiabilidad |
| --- | --- | --- |
| Bebe un sorbo de vino | Lleva juego | 80 % |
| Mira al cielo | Está faroleando | 70 % |
| Junta las manos | Lleva duples | 85 % |

**Manía:** envida siempre a la Chica cuando habla sin envite delante, lleve lo que lleve: 2 piedras, o más si va fuerte.

**Regla especial:** «Penitencia». Si descubre un farol tuyo, tu próximo envite la paga: en el primer lance de las manos siguientes en que envides, si gana él, cobra 1 piedra más. Se gasta con ese envite, lo gane quien lo gane.

**Lección:** la memoria del rival existe; hay que dosificar los faroles.

**Frase:** «Dios lo ve todo, hijo. Yo, casi todo.»

### 4. Aurelio, el Tratante (el bar, nivel 3)

**Aspecto [cambiado]:** *por rediseñar desde cero; de momento, el dibujo actual:* sombrero de ala ancha con pluma roja, chaleco bordado, manta al hombro, aro de oro en la oreja, diente de oro y vara de tratante en la mano (estos dos, pintados sobre su dibujo porque los usan sus tics).

**Personalidad:** mentiroso profesional. Farolea más que nadie y tira órdagos sin nada. Es un espejo del jugador: te enseña lo que se siente al otro lado.

**Tics:**

| Tic | Disparador | Fiabilidad |
| --- | --- | --- |
| Sonríe enseñando el diente de oro | Está faroleando | 75 % |
| Se pone serio y se quita el sombrero | Lleva cartas muy buenas | 70 % |
| Golpea la vara contra el suelo | Ninguno: es un tic falso para despistar. Sale el 15 % de las veces en cualquier momento (con el 25 % tapaba sus tics de verdad) | — |

**Regla especial:** «Trato». Una vez por duelo te ofrece un trato antes del recuento: retirar los dos el envite y repartirse las piedras. Aceptar o no es otra apuesta.

- Solo si hay envites queridos en la mano.
- Se retiran **todos** los envites queridos y sus piedras se reparten a medias; **la impar se la queda él**, que para eso es tratante. Lo que vale cada lance por sí mismo (pares, juego, punto, el paso) se cobra igual.
- Lo propone si con sus cartas espera perder esos envites, y además de farol 3 de cada 10 veces.
- *Ejemplo: hay cinco piedras queridas al Punto y aceptas: tú cobras 2 y él 3.*

«Mano fuerte» (su sombrero, el rosario de Doña Ignacia, el puro de Don Rodrigo) quiere decir duples, medias, 31, tres reyes o tres pitos. Los tics de farol (el diente de oro, Don Francisco mirando al cielo) salen cuando decide envidar sin nada delante.

**Lección:** no todos los tics significan algo, y hay que atreverse a aceptar.

**Frase:** «Esta mula vale lo que yo diga que vale. Y esta mano, también.»

### 5. Don Rodrigo, el Cacique (el casino de la capital, jefe final)

**Aspecto [cambiado]:** *por rediseñar desde cero; de momento, el dibujo actual:* levita granate bordada en oro, chaleco de brocado, cadena de reloj, puro, anillos y bastón de puño dorado. Sentado en un sillón más alto que el tuyo.

**Personalidad:** lo sabe todo de ti. Lee tu Libreta: conoce los tics de los rivales que has anotado y juega al revés de lo que esperas. Adapta su estilo al tuyo durante el duelo.

**Tics:** empieza con los tics del Herrero. A la mitad del duelo (al llegar a 10 piedras cualquiera de los dos) cambia a los tics del Cura. Si llega a 15, deja de tener tics, pero su puro echa más humo cuando lleva cartas buenas (65 %).

**Reglas especiales:**

- «Casa»: es mano en el primer reparto y gana los empates a la Grande en todas las manos. (Así se interpreta «los empates del primer lance».)
- «Cartas de la casa»: una vez por duelo, al empezar la Grande, si ninguna de sus jugadas llega al 60 % de ganar, cambia en secreto su carta más baja por la más alta del mazo. Con Ojo alto en tu compañero o un objeto lo podrás pillar y ganar 5 piedras (llega en la fase 4, igual que la lectura de tu Libreta).

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

<p class="formula">F &gt; 0,65 − 0,03 · (A − 5)</p>

La cantidad sube con la fuerza y la agresividad: 2 piedras de base, más 1 por cada 0,1 que F supere el umbral si A ≥ 6.

**Farolear:** si F < 0,35, envida con probabilidad

<p class="formula">p<sub>farol</sub> = 0,04 · B</p>

**Aceptar un envite (quiero):**

<p class="formula">F + (50 − Cara) / 200 + (Me / 10) · 0,6 · (t<sub>farol</sub> − 0,25) + ε &gt; 0,5</p>

- El término de Cara hace que con Cara baja te acepten más y con Cara alta menos.
- t\_farol es la proporción de tus envites de este duelo que fueron faroles. Si faroleas más del 25 %, un rival con memoria te cree menos.
- ε es ruido aleatorio entre −0,05 y +0,05, para que no sea predecible al milímetro.

**Aceptar un órdago:** la misma fórmula, pero el umbral pasa de 0,5 a 0,5 + 0,04·M. Si el rival va perdiendo por 8 piedras o más, el umbral baja 0,1 (desesperación).

**Tirar un órdago:** con F > 0,85 y probabilidad **0,03·A** (antes 0,1·A), o como farol con probabilidad 0,01·B cuando va perdiendo de 8 o más. Con 0,1·A Agustín tiraba órdago en la mitad de las manos y el 64 % de los duelos acababan así; con 0,03·A lo tira en 1 de cada 6 manos y acaban así el 22 %.

**Subir («más»):** sube si su fuerza pasa en 0,2 su umbral de envidar, con probabilidad 0,1·A y nunca por encima de 10 piedras. No responde a un envite con órdago. *Ejemplo: le envidas dos a la Grande y Agustín lleva F 0,8 (su umbral es 0,56): ocho de cada diez veces sube cuatro más.*

### 3. Tics

Cada tic se dispara con un 60 % de probabilidad cuando se cumple su disparador, y a veces sin cumplirse. La frecuencia de los disparos falsos se ajusta para que la fiabilidad real sea la de su tabla. Así la fiabilidad es un número de diseño que se puede equilibrar.

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

    si F > 0.85 y azar() < 0.03 * rival.agresividad: return ORDAGO
    si F > 0.65 - 0.03 * (rival.agresividad - 5): return ENVIDO(cantidad(F, rival))
    si F < 0.35 y azar() < 0.04 * rival.faroleo: return ENVIDO(2)
    return PASO
```

Con esto el rival parece tener carácter: el Herrero envida siempre que lleva algo, la Viuda casi nunca acepta, Aurelio te sorprende con faroles y el Cura te deja de creer si abusas. Son unos cientos de líneas de código y todo se equilibra cambiando cinco números por rival.

### Equilibrio medido

**[cambiado]** 300 duelos de cada rival contra un jugador sensato (la misma IA con personalidad neutra, que no lee tics), ya con la cuota activada (`pesoCuota` 0,75):

| Rival | Gana | Manos por duelo | Órdago suyo | Acepta tus envites (antes) |
| --- | --- | --- | --- | --- |
| Agustín | 52 % | 3,3 | 18 % de manos | 51 % (32 %) |
| Doña Ignacia | 43 % | 4,2 | 6 % | 47 % (30 %) |
| Don Francisco | 44 % | 4,2 | 13 % | 34 % (21 %) |
| Aurelio | 55 % | 3,7 | 12 % | 41 % (21 %) |
| Don Rodrigo | 56 % | 3,5 | 16 % | 29 % (15 %) |

- Contra un bot que no lee tics no se nota tanto el orden de dificultad; hay que comprobarlo jugando.

**El farolero** (medido de nuevo, 300 duelos por rival; `pruebas/farolero.sim.ts`). Es un jugador que abre con «envido dos» en todos los lances, lleve lo que lleve, y responde con sentido a los envites del rival. Farolea en el 27 % de sus envites; el sensato, en el 6 %.

| Rival | Gana el sensato | Gana el farolero |
| --- | --- | --- |
| Agustín | 45 % | 44 % |
| Doña Ignacia | 55 % | 64 % |
| Don Francisco | 60 % | 69 % |
| Aurelio | 44 % | 57 % |
| Don Rodrigo | 47 % | 53 % |

- **Por qué pasa:** el rival acepta solo si su mano gana más de la mitad de las veces, sin mirar lo que arriesga. Pero aceptar un «envido dos» y perderlo cuesta 2 piedras, y no quererlo regala 1. *Ejemplo: Doña Ignacia lleva una Grande que gana 4 de cada 10 veces. Si quiere, de media gana algo (4 veces gana 2, 6 veces pierde 2: pierde 0,4 piedras por vez); si no quiere, pierde 1 seguro. Le conviene querer, y no quiere.*
- **Subir la memoria no lo arregla.** Se probó: el farolero farolea en una proporción parecida a la que la fórmula da por normal (25 %), así que la memoria apenas le castiga, y en cambio al jugador honrado le cree todavía más.
- **Lo que sí lo arregla:** que el rival mire lo que arriesga (`IA.aceptar.pesoCuota`). A cambio, todos aceptan más envites pequeños: Doña Ignacia pasa de aceptar el 30 % de tus envites al 47 %.
- **[cambiado] Activado, con 0,75** (decidido por David). La fórmula para aceptar un envite queda así, con X lo que hay en juego y d lo que se cobra por el «no quiero»:

<p class="formula">F + (50 − Cara) / 200 + (Me / 10) · 0,6 · (t<sub>farol</sub> − 0,25) + 0,75 · (0,5 − (X − d) / 2X) + ε &gt; 0,5</p>

  *Ejemplo: a un «envido dos» (X = 2, d = 1) el término nuevo suma 0,75 · (0,5 − 0,25) ≈ 0,19: con tu Cara en 50, Doña Ignacia ya lo quiere con una mano que gane algo más de 3 de cada 10 veces (antes necesitaba más de 5). A un envite de diez sobre dos ya queridos (X = 10, d = 2) suma solo 0,075: los envites grandes se siguen respetando.* Al órdago no se le aplica.

| Rival | Gana el sensato | Gana el farolero |
| --- | --- | --- |
| Agustín | 38 % | 37 % |
| Doña Ignacia | 53 % | 51 % |
| Don Francisco | 62 % | 67 % |
| Aurelio | 43 % | 44 % |
| Don Rodrigo | 47 % | 45 % |

  Con la cuota, envidar dos en todos los lances ya no compensa: el farolero gana lo mismo o menos que el sensato, salvo un poco contra Don Francisco (5 puntos, que con 300 duelos está cerca del ruido de la medida).

**[nuevo] Los cuatro de la facultad** (300 duelos de cada uno contra el jugador sensato, 13 de octubre de 2026). La dificultad sube nivel a nivel, como se buscaba:

| Rival | Gana | Manos por duelo | Órdago suyo | Acepta tus envites | Tics por mano |
| --- | --- | --- | --- | --- | --- |
| Lucía | 52 % | 4,3 | 8 % de manos | 54 % | 1,7 |
| Dani | 55 % | 4,0 | 8 % | 56 % | 0,5 |
| Rubén | 58 % | 3,5 | 16 % | 46 % | 2,0 |
| Chema | 60 % | 3,4 | 17 % | 41 % | 1,8 |

- **Contra el farolero** que envida dos en todos los lances, ninguno de los cuatro se deja: el farolero gana lo mismo que el sensato (50 % contra Lucía, 47 % contra Dani, 48 % contra Rubén y 46 % contra Chema).
- **Hay que comprobarlo jugando.** El sensato no lee tics, y los de la facultad hacen muchos y muy claros (Lucía y Chema, casi dos por mano), así que a una persona que se fije le costarán menos. Dani hace pocos porque solo los dispara el 31 y los duples.

## Progresión, plataforma y prototipo

### Progresión entre giras

- **Libreta:** las notas sobre cada rival se quedan para siempre.
- **Compañeros:** se desbloquean cumpliendo hitos (ver la tabla de compañeros en [La gira](gira.md)).
- **Objetos nuevos en la taberna:** cada jefe derrotado por primera vez añade 2 objetos al catálogo.
- **Grados de dificultad:** al completar la gira se desbloquea «Mus de Feria», con modificadores acumulables (los rivales empiezan con 3 piedras, menos Honra, tics menos fiables…), como las apuestas de Balatro.
- **Modo libre:** duelo suelto contra cualquier rival ya conocido, para practicar.

### Plataforma y controles

- **Plataforma:** de momento, **navegador** (móvil en vertical; en escritorio se ve centrado) y sin conexión, como PWA. Publicado en https://ordago-game.vercel.app. Más adelante se empaquetará para móvil.
- **Icono de la aplicación [nuevo]:** la moneda de oros sobre el marrón de la taberna. Al añadir la web a la pantalla de inicio del móvil (en Safari, *Compartir → Añadir a pantalla de inicio*; en Chrome, *Instalar aplicación*) sale con ese icono, con el nombre *Órdago*, a pantalla completa y en vertical. Los iconos se generan con `npm run iconos`. Falta que funcione sin conexión (el *service worker*).
- **Tecnología:** TypeScript + React + Vite, con un motor puro y reproducible (cada partida sale de una semilla) y **[cambiado]** 345 pruebas automáticas. Sustituye a Godot.
- **Controles:**
  - Tocar una carta para marcarla en el descarte.
  - **Barra de acciones abajo, al estilo Offsuit:** en una fila, solo los botones que tocan en cada momento (MUS · CORTO, PASO · ENVIDO, NO QUIERO · QUIERO · MÁS). Cada botón ocupa lo que pide su texto.
  - **Cuánto envidar, al estilo Offsuit:** al pulsar ENVIDO o MÁS se abre, sobre el tapete y sin tapar tu mano, un selector con dos botones rápidos (*ENVIDO DOS* y *ENVIDO TRES*, o *DOS MÁS* y *TRES MÁS*) y una barra para elegir **cualquier cantidad del 4 al 19**, con − y + para afinar y el número encima del tirador. El botón de abajo confirma (*ENVIDO SIETE*). Al subir, el selector recuerda lo que ya hay en juego. Sustituye a las cuatro fichas de 2, 3, 5 y 10.
  - **El botón de Órdago, pequeño y aparte en la esquina:** se tira manteniéndolo pulsado un segundo mientras se llena (con teclado, manteniendo Intro o Espacio), para que nunca se pulse sin querer y tirarlo se sienta como un gesto. Sustituye al deslizar hacia arriba.
  - **Al acabar el duelo:** en el duelo suelto sale el resultado con **REVANCHA** (el mismo rival, de cero), los otros rivales y *PORTADA*; **[nuevo]** en la gira, *SEGUIR*, que lleva a lo que se cobra. El botón «Rival» de arriba es solo del modo de pruebas (y no sale en la gira).
  - Mantener pulsado el retrato del rival para mirarle.
  - Partidas guardadas automáticamente al final de cada mano, cuando aparece el recuento con las cartas de los dos. **[nuevo]** La gira se guarda además en cada paso (mapa, taberna, plaza…), y la Libreta, aparte, para siempre. *?rival=chema* en la dirección lleva directo a un duelo suelto.

### Plan de prototipo

El orden de construcción prioriza comprobar que el núcleo es divertido antes de invertir en arte y contenido:

1. ✅ **Hecho. Motor de mus:** baraja, reparto, mus, los cuatro lances y el recuento. Sin gráficos: TypeScript puro con pruebas. Probar que las reglas son correctas.
2. ✅ **Hecho. Un duelo jugable:** interfaz fea, el Herrero con sus 2 tics como rectángulos que parpadean, envites y órdago. **Esta es la prueba clave:** si un duelo de 5 minutos ya es divertido, hay juego.
3. ✅ **Hecho. IA completa y la Cara:** los 5 parámetros, la memoria y el medidor de Cara, con los cinco rivales y sus reglas. Además, la mesa se ha pasado a vertical.
4. ✅ **[cambiado] Hecho. Estructura de gira:** la primera arena completa, **[cambiado]** la facultad, con sus 3 secuaces (Lucía, Dani y Rubén) y su jefe (Chema); la taberna con 5 objetos (al menos uno contra el rival) y 2 compañeros (el Lazarillo y la Recaudadora); el mapa en vertical como las arenas; la Libreta, los reales y la Honra. Los cuatro son nuevos, así que salen con marcador hasta que estén sus dibujos. **[nuevo]** Hecho el 13 de octubre de 2026, con la portada, el duelo suelto, la plaza (sin la partida en la calle), la era, el premio de Chema y el final; lo que pasa «En la gira» entre secuaces y jefes queda para más adelante (**[cambiado]** decidido por David: se añadirá si la gira resulta demasiado fácil). Mientras no esté el bar, ganar a Chema acaba la gira con victoria.
5. ⏭️ **Siguiente, después de jugar la gira y ajustar sus números. Arte y sonido de la primera arena:** retratos animados, mesa, cartas propias, música. Esto sirve como demo vertical. **[cambiado]** Adelantado: los cinco rivales ya tienen retrato y parte de sus tics (ver «Los tics del rival»). **[cambiado]** Aquí va el pulido a fondo (animaciones, arte de los rivales como en un juego profesional, la escena del órdago): David decidió el 12 de octubre de 2026 comprobar primero que la gira es divertida y luego ponerla bonita.
6. **Resto del contenido:** las otras 4 arenas, todos los compañeros y objetos, progresión y dificultades.

### Preguntas abiertas

- ¿Habrá un modo 2 contra 2 con un compañero que juegue cartas? Se descarta para la primera versión por complejidad, pero encaja como modo extra.
- ¿Modelo de negocio: pago único o gratis con demo? Un pago único sin anuncios encaja mejor con un roguelike sin conexión.
- **[cambiado] El duelo a 20 piedras es la partida corta del juego** (decidido por David): cuando habla de «partidas cortas como Clash Royale» se refiere a cada duelo, no a la gira. En las simulaciones dura unas 3–4 manos, unos 2–3 minutos. Falta comprobarlo jugando.

**Decididas por David el 12 de octubre de 2026 [nuevo]:**

- **Honra: tres vidas.** Se queda como estaba, porque el reparto pesa mucho en el mus. **[cambiado]** El 13 de octubre: perder contra un jefe no acaba la gira; cuesta 1 de Honra y se repite.
- **Un solo compañero a la vez**, que se compra y se cambia en la taberna a medida que avanzas.
- **Cada arena tiene cuatro niveles:** tres secuaces y su jefe, como las ciegas de Balatro.
- **Objetos contra el rival:** las jugarretas y los amuletos contra el rival (en [La gira](gira.md)).

**Decididas por David el 13 de octubre de 2026 [nuevo]:**

- **Las arenas:** la facultad, el bar, una familia de la Montaña Palentina (la niña, la madre, el padre y el abuelo), las fiestas del pueblo con ancianos que llevan toda la vida jugando y el casino de la capital.
- **Sin «pasar de largo»:** si te pudieras saltar a los secuaces, no compensaría jugar contra ellos.
- **Huecos:** dos para bebidas y jugarretas, y dos para amuletos y objetos raros.
- **La plaza:** el timador engaña una de cada tres veces (el amuleto falso se rompe nada más dártelo), y una monja puede darte +1 de Honra. Sale menos que el resto, y solo una vez por gira.
- **Objetos:** los precios y efectos que están en «Objetos de taberna y economía».

**[nuevo] Decidido por David el 13 de octubre de 2026, después de la fase 4:** las conexiones entre secuaces y jefes («Rubén le avisa» y demás) no se programan de momento. Si la gira resulta demasiado fácil, o David lo ve bien, se añadirán.

**Decididas por David el 13 de octubre de 2026, al revisar la versión 2 de la gira [nuevo]:**

- **Nombres nuevos** para los cinco rivales del juego y para varios personajes de la gira (la lista está en [La gira](gira.md)). Se quedan los «don» y «doña».
- **Todos los personajes se diseñan de nuevo desde cero**, también los cinco que ya tienen dibujo.
- **Manolo, el jefe del bar,** juega con mucha calma las dos primeras manos y después, por culpa de la bebida, a lo loco.
- **El Reloj de bolsillo, baratillo:** 3 reales.
- **Confirmados:** las señas de la familia y que se cuenten los faroles pillados, la regla de Chema, la del tío Arturo, la Gaseosa, el Chato de vino, la monja, el Caldo de la abuela, la parada antes de repetir contra un jefe y el orden de las arenas (la facultad, el bar, la Montaña Palentina, las fiestas del pueblo y el casino).

**Para la fase 4 [cambiado]** (decididas por David el 11 de octubre de 2026):

- **El real por farol: sí.** El farol al que el rival dice «no quiero» cuenta como «no descubierto» y da +1 real, aunque en el recuento acabe viendo tus cartas. *Ejemplo: envidas a la Grande con A 4 5 6 y Agustín no quiere: +1 real.*
- **El Veterano: dos reyes cualesquiera.** Todos los reyes valen igual y los treses son reyes. *Ejemplo: con R 3 5 6, el rival tiene que aceptar tu órdago a la Grande.*
- **El Tahúr: cambias la carta que quieras por un rey.** Si el rival tiene mucho Ojo y te pilla, la mano se acaba, nadie cobra nada de ella y el rival se lleva 5 piedras (lo mismo que ganas tú si pillas a Don Rodrigo). El rey sale del mazo; si no queda ninguno, la seña no se puede usar en esa mano.
- **La Medalla de la Virgen [cambiado]: decidida el 13 de octubre.** La primera vez en cada duelo que te pillan un farol, tu Cara no baja. Así uno se puede atrever a un farol arriesgado sin hundir su temple. Cuesta 9 reales.

## Historial de versiones

- **Versión 1 (9 de octubre de 2026).** El documento original: móvil en horizontal, Godot, órdago deslizando hacia arriba.
- **Versión 2 (11 de octubre de 2026).** Lo decidido en las fases 1–3 (aclaraciones de reglas, cómo salen los tics, qué mueve la Cara, las reglas de cada rival, el órdago de la IA a 0,03·A, la subida y el equilibrio medido) y el cambio a vertical: maquetación de arriba abajo, marcador con números, barra de acciones al estilo Offsuit, órdago con pulsación larga, gira como las arenas de Clash Royale y la web en vez de Godot.
- **Versión 3 (11 de octubre de 2026).** Retoques y depuración antes de la fase 4: el acta de la mano en lugar de bocadillo, «En juego», crónica y etiqueta; Rival y Depurar solo en el modo de pruebas; fuera el nombre de la comarca; selector de envite con dos, tres y la barra del 4 al 19; revancha al acabar y cada duelo de cero con la Cara en 60; la insignia MANO y su explicación; medido a fondo el problema del farolero, con una solución preparada y pendiente de decidir; y los fallos encontrados con un recorrido automático por los cinco rivales. Las cuatro dudas de la fase 4 quedan explicadas con ejemplos y una propuesta cada una.
- **Versión 4 (11 de octubre de 2026).** Los cinco rivales tienen arte: las hojas de personaje de David, en 3D, ampliadas ×4 con IA para que se vean nítidas en el móvil y pasadas por la imprenta (tonos planos, tinta y papel, grano, contorno y sombra dura) para que casen con la mesa. El rival respira y parpadea; sus tics son un cambio de pose con fundido, a veces en varios fotogramas o con un efecto (el humo del puro, el brillo del diente de oro). Pintados sobre sus dibujos: los parpadeos, las miradas de Doña Engracia y Don Bonifacio, el sombrero, la vara y el diente de oro de Fulgencio. Los tres gestos de brazos que no hay en las hojas siguen con sacudida y acotación. Botón Tics en el modo de pruebas. El aspecto de cada rival se ajusta a su dibujo.
- **Versión 5 (11 de octubre de 2026).** Fuera el cartel con el nombre del rival junto al retrato (en su lugar, solo su estado cuando toca: ¡ENFADADO! u OFENDIDA). Activado el ajuste de equilibrio contra el farolero: el rival mira lo que arriesga al aceptar (`pesoCuota` 0,75). Decididas las dudas del real por farol, el Veterano y el Tahúr (que cambia la carta que quieras por un rey); la Medalla de la Virgen, descartada tal como estaba, con una propuesta de sustituta.
- **Versión 6 (12 de octubre de 2026).** El acta narrada: David vio cuatro prototipos del panel central (etiquetas y bote, bocadillos, pizarra y acta ligera) y luego cuatro letras para el acta ligera, y eligió la narrada (pestaña con el lance, ficha con lo que hay en juego y la partida contada con frases). La cifra de la Cara sube junto a su marca en lugar de un aviso que tapaba la cara del rival. La cabecera, en un solo panel compacto (elegida entre cuatro prototipos: carrera a 20, reloj, careto y tira): números, MANO, los lances como pasos y la Cara con careto, una frase con lo que significa y «?», que abre una ficha corta que la explica. El tapete ocupa algo más del tercio de abajo de la pantalla, con aire entre las cartas del rival y las tuyas, y tus cartas son un 15 % más grandes. La moneda de oros es el icono de la aplicación en el móvil.
- **Versión 7 (12 de octubre de 2026).** La visión del juego contada por David, ordenada al principio del documento. La gira pasa a **5 arenas de 4 niveles** (tres secuaces y su jefe, como las ciegas de Balatro), y los cinco rivales son los jefes. Confirmadas las tres vidas de Honra, un solo compañero a la vez que se compra y se cambia en la taberna, y que la «partida corta» es cada duelo a 20 piedras. Objetos que van contra el rival (las jugarretas y algunos amuletos) y objetos raros como premio de cada jefe. Nuevos reales por duelo según el nivel. El catálogo de la gira (arenas, 15 secuaces, taberna, plaza, objetos y compañeros, con tres compañeros nuevos) pasa a un documento propio, [La gira](gira.md), para ir cambiándolo. Decidido el orden: primero la gira y comprobar que es divertida; el pulido a fondo, en la fase 5.
- **Versión 8 (13 de octubre de 2026).** Las arenas que propuso David: la facultad (el jefe es el que no entra en clase y vive en la cafetería), el bar (adultos; el jefe, de cuarenta y tantos, medio calvo y con barriga cervecera), una familia de la Montaña Palentina (la niña, la madre, el padre y el abuelo), las fiestas del pueblo con ancianos que llevan toda la vida jugando y el casino de la capital. Los cinco rivales que ya tenían dibujo se recolocan: Ruperto y Fulgencio en el bar, Doña Engracia y Don Anselmo en las fiestas y Don Bonifacio de jefe final. Perder contra un jefe ya no acaba la gira: cuesta Honra y se repite, y la gira solo termina sin Honra. Fuera la idea de saltarse secuaces. Dos huecos para bebidas y jugarretas y dos para amuletos y objetos raros. Decididos la Medalla de la Virgen (9 reales), el Chato de vino, el Caldo de la abuela, la Ristra de ajos y la Gorra calada; rehechos la Gaseosa y el Reloj de bolsillo; el timador y la monja en la plaza; el Abuelo pasa a llamarse el Jubilado. El detalle, en [La gira](gira.md), versión 2.
- **Versión 9 (13 de octubre de 2026).** Nombres nuevos: Ruperto pasa a ser Agustín; Doña Engracia, Doña Ignacia; Don Anselmo, Don Francisco; Fulgencio, Aurelio, y Don Bonifacio, Don Rodrigo (también en el juego). En la gira cambian también Tomás, Pilar, el abuelo Teodoro, Don Severiano, el tío Paulino, Leandro, Doña Leonor y Don Ceferino. Todos los personajes se diseñarán de nuevo desde cero. Manolo juega con calma las dos primeras manos y luego a lo loco por la bebida. El Reloj de bolsillo cuesta 3 reales. David confirma las reglas de Chema, de la familia y del tío Arturo, y los objetos y paradas que se le preguntaron. El detalle, en [La gira](gira.md), versión 3.
- **Versión 10 (13 de octubre de 2026).** Fase 4 hecha: la primera arena, la facultad, se juega entera. Lucía, Dani, Rubén y Chema con sus tics y sus reglas (Dani pide mus siempre; Rubén se crece; Chema se viene arriba o se arruga); la portada, elegir compañero, el mapa como las arenas, la mesa con la bolsa arriba a la izquierda, lo que se cobra después de cada duelo, la taberna, la plaza (forastero, fiesta, timador y monja), la era, el premio de Chema y el final de la gira; el Lazarillo y la Recaudadora, los cinco objetos de la primera taberna y los Apuntes de Chema; la Libreta, que se apunta sola; y el duelo suelto contra cualquiera de los nueve rivales. Nombres nuevos para siete compañeros (el Lazarillo, la Recaudadora, la Maruja, el Monaguillo, la Moza, el Militar y el Afilador).
- **Versión 11 (13 de octubre de 2026).** Las conexiones «En la gira» entre secuaces y jefes, para más adelante.
