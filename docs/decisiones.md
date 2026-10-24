# Órdago — Decisiones de reglas

Aquí queda lo que el documento de diseño no dejaba claro y cómo se ha resuelto. El criterio es siempre el mismo: la opción más fiel al mus tradicional. Cualquiera se puede cambiar; casi todas son un número en `src/datos/reglas.ts` o unas pocas líneas del núcleo.

## Fase 1 · Motor de mus (10 de octubre de 2026)

1. **«Juego» pasa a «Punto».** Cuando ninguno de los dos tiene juego, el último lance se juega y se rotula como Punto. *Confirmado por David.*

2. **El Punto vale 1 piedra, igual que el Juego vale 2 o 3.**
   - Nadie envida: quien gana el Punto cobra 1.
   - Se envida y se quiere: cobra lo envidado más 1. *Ejemplo: envidas 4 al Punto, te lo quieren y ganas con 30: cobras 5.*
   - Se envida y no se quiere: quien envidó cobra 1 en el momento y otra en el recuento.

3. **Lo que se cobra tras un «no quiero».**
   - En la Grande y la Chica, solo el «no quiero»: 1 piedra, o lo que hubiera aceptado antes de la última subida. No hay piedra extra en el recuento.
   - En Pares, Juego y Punto, quien envidó se lleva el lance: cobra el «no quiero» y, en el recuento, lo que valgan sus pares, su juego o el punto, aunque el rival tuviera mejores cartas. *Ejemplo: envidas a Pares con pareja de ases, el rival lleva duples y no quiere. Cobras 1 ahora y 1 por tu pareja en el recuento; sus duples no cobran nada.*

4. **Los «no quiero» se cobran en el momento.** Si con eso alguien llega a 20, el duelo acaba ahí. *Ejemplo: tienes 19, envidas a la Grande y el rival no quiere: ganas el duelo sin jugar el resto de la mano.* Algunos reglamentos los apuntan al final de la mano, pero en la mesa la piedra se coge al momento.

5. **Órdago rechazado.** Quien lo tiró cobra 1 piedra si no había nada envidado, o lo que hubiera en juego antes del órdago. *Ejemplo: envido 2, órdago, no quiero: 2 piedras.*

6. **Pares o Juego cuando solo uno tiene.** No hay envites y quien los tiene cobra su valor en el recuento.

7. **Los pares a 8 reyes.**
   - Un tres y un rey son pareja de reyes; un dos y un as, pareja de ases.
   - Sota y caballo no son pareja aunque los dos valgan 10.
   - Cuatro reyes (por ejemplo R R 3 3) son duples y ganan a reyes con caballos.
   - Los duples se comparan por la pareja más alta y, si empatan, por la más baja.
   - Con la misma pareja o las mismas medias, las cartas sueltas no desempatan: gana la mano.

8. **El mus.**
   - Como mucho 2 rondas de descarte por mano. Tras la segunda se juega sin volver a preguntar.
   - Hay que descartar de 1 a 4 cartas. La mano descarta y roba primero.
   - Si se acaba el mazo (solo puede pasar con rondas extra del Tahúr o del café de puchero), se barajan los descartes de las rondas anteriores. Nunca te vuelven las cartas que acabas de tirar.

9. **Quién es mano.** Cambia en cada mano, no en cada descarte. En el primer reparto se sortea con la semilla de la partida. Don Bonifacio tendrá su propia regla («Casa»).

10. **Cantidades.** El envite mínimo es 2 («envido») y la subida mínima es 2 («dos más»). No hay tope.

11. **Declaraciones.** Las de pares y juego son automáticas y siempre verdaderas, y declara primero la mano. El farol está en el envite, no en la declaración.

12. **Reparto.** Las cartas se dan de una en una, empezando por la mano. Cada mano se juega con la baraja completa y barajada de nuevo.

## Fase 2 · Duelo contra Ruperto (10 de octubre de 2026)

1. **Cuándo corta el mus cada rival y qué tira.** *Aprobado por David.* Hay una lista común de manos con las que corta cualquiera: tres o cuatro reyes, 31 de juego, duples con reyes, y dos reyes con un caballo o una sota. Cada rival añade sus gustos (`src/datos/rivales.ts`):
   - Ruperto corta también con cualquier pareja de reyes y, al descartar, guarda reyes y parejas.
   - *Ejemplo: con R 5 A 6, Ruperto tira el 5, el as y el 6 para buscar reyes; Don Anselmo, con la misma mano, se queda el as para la Chica.*

2. **Menos órdagos de los que da la fórmula.** El documento dice que la IA tira órdago con F > 0,85 y probabilidad 0,1 · Agresividad, que para Ruperto es un 80 %. Probado contra un rival que juega con sentido, salía un órdago suyo en **la mitad de las manos**, y el 64 % de los duelos acababan en órdago. Eso choca con lo que pide el propio documento: que el órdago no sea un «todo o nada» constante. Se ha bajado a 0,03 · Agresividad: Ruperto tira órdago en 1 de cada 6 manos y el 22 % de los duelos acaban así. Es un número en `src/datos/ia.ts`.
   - Se juntan las dos versiones del documento: la del pseudocódigo (F > 0,85 y un sorteo con la agresividad) y el órdago de farol del texto (0,01 · Faroleo si va perdiendo de 8 o más).

3. **Cuándo sube la IA («más»).** El documento no lo dice. Sube si su fuerza pasa en 0,2 su umbral de envidar, con probabilidad 0,1 · Agresividad, y nunca por encima de 10 piedras. No responde a un envite con órdago.
   - *Ejemplo: le envidas dos a la Grande y Ruperto lleva F 0,8 (su umbral es 0,56): ocho de cada diez veces sube cuatro más.*

4. **Qué es un farol para la memoria del rival.** Un envite, subida u órdago del jugador con menos de un 35 % de ganar ese lance contra una mano cualquiera. Igual que la fuerza de la IA, a Pares solo cuentan las manos con pares, al Juego las que tienen juego y al Punto las que no. El rival lo juzga en el recuento, cuando ve las cartas.
   - *Ejemplo: envidas cinco a la Grande con C 6 C 6: sin reyes, esa Grande gana menos del 35 % de las veces, así que cuenta como farol.*

5. **Cuándo salen los tics.** Al recibir cartas (en el reparto y tras descartar), al declarar su lance y al decidir un envite de su lance. Si se cumple el disparador, el tic sale el 60 % de las veces. En falso sale lo justo para que, de todas las veces que lo ves, acierte su fiabilidad: 85 % la barba y 80 % el arremangarse, comprobado con 150.000 manos.
   - Como Ruperto guarda reyes y parejas al descartar, tras el mus lleva pares más a menudo, y la barba acierta algo más del 85 %.

6. **Los tics sin arte.** Hasta que haya dibujos, el retrato se sacude, destella y aparece una acotación con el gesto: «se rasca la barba». Sin la acotación, los dos tics de Ruperto se verían iguales y no se podrían aprender. Lo que significa cada tic («pares o mejor») solo se ve en el modo de depuración.

7. **El enfado de Ruperto.** Cuenta los lances que se juegan, en orden y de una mano a otra. Los que no se juegan, como Pares cuando nadie lleva, no cuentan. Se enfada al perder el tercero seguido y las dos manos siguientes acepta cualquier envite y cualquier órdago, aunque si va fuerte puede seguir subiendo.

8. **La Cara.** Está fija en 60 hasta la fase 3, que es cuando se implementa. La IA ya la usa en su fórmula para aceptar envites.

9. **La mesa.**
   - Para envidar o subir se elige la cantidad con cuatro fichas: 2, 3, 5 o 10.
   - Al acabar cada mano aparece el recuento con las cartas de los dos. En ese momento se guarda la partida.
   - El órdago se tira deslizando hacia arriba o, con teclado, con la flecha arriba.
   - Cuando la mano es Ruperto, el marcador dice «él es mano».
   - El almagre claro de la barra de la Cara (#E8CCB8) no está en la guía: es la misma mezcla con papel que el gualda claro.

10. **Tamaño de los botones en el móvil.** Los 44 px mínimos se cumplen en píxeles del escenario. En un móvil pequeño en horizontal todo se escala a la mitad, y los botones quedan en unos 30 px reales. Si en las pruebas con el móvil cuesta pulsar, se agrandan.

## Fase 3 · IA completa y la Cara (10 de octubre de 2026)

1. **Qué mueve la Cara.** El juego decide solo qué fue un farol, con la misma regla que la memoria del rival (punto 4 de la fase 2): un envite, subida u órdago tuyo en un lance que tus cartas tenían menos de un 35 % de ganar.
   - Farol al que el rival dice «no quiero»: **+8**. *Ejemplo: envidas a la Grande con A 4 5 6 y Ruperto no quiere.*
   - Envite con buena mano que el rival quiere y pierde: **+4**. «Buena mano» es un 65 % o más de ganar ese lance; el documento no lo fijaba.
   - Farol que el rival quiere: **−12**, porque en el recuento se ven las cartas. Cuenta aunque al final ganes el lance: te han visto.
   - Órdago **tuyo** que pierdes: **−15**. Si además era de farol, −12 más. Perder un órdago que tiró el rival no te quita Cara.
   - Aceptar un envite del rival nunca mueve tu Cara: el farol es de quien envida.

2. **La Cara pasa de un duelo al siguiente.** Se guarda aunque cierres el navegador. Mientras no exista la era (fase 4), se puede subir o bajar a mano en el modo de depuración.

3. **Cara a 0: «se te nota todo».** Durante ese duelo, aunque luego vuelvas a subir, el rival ve tu tic: te tiembla el pulso cuando llevas buena mano en el lance que se juega (acierta el 80 %).
   - Si te lo ve, su fuerza baja 0,2: te cree fuerte. Si no te lo ve, sube 0,1.
   - Tú también ves cuándo se te ha notado: aparece «Se te nota: te tiembla el pulso» junto a tu mano.

4. **Tics de los cinco.** Todos salen el 60 % de las veces que se cumple su motivo, y en falso lo justo para acertar su fiabilidad.
   - Los que dependen de las cartas salen al recibirlas, al declarar su lance y al envidar en su lance.
   - «Mano fuerte» (el rosario de Doña Engracia, el sombrero de Fulgencio, el puro de Don Bonifacio) quiere decir duples, medias, 31, tres reyes o tres pitos.
   - Los tics de farol (Don Anselmo mira al cielo, Fulgencio enseña el diente de oro) salen cuando decide envidar sin nada delante.
   - «Te mira fijamente» (Doña Engracia) sale cuando responde a un envite tuyo y tu Cara está por debajo de 35.
   - La vara de Fulgencio no significa nada. Sale el 15 % de las veces en cualquier momento; con el 25 % había tanto ruido que tapaba sus tics de verdad.

5. **Doña Engracia.**
   - No acepta un órdago antes de la tercera mano. Después, con su miedo (9 de 10), solo lo acepta con una mano casi perfecta.
   - Si la miras más de 2 segundos, se da cuenta 7 de cada 10 veces (su Ojo es 7). Entonces se ofende y no hace tics en lo que queda de mano ni en la siguiente.

6. **Don Anselmo.**
   - Envida siempre a la Chica cuando habla sin envite delante, lleve lo que lleve: 2 piedras, o más si va fuerte.
   - **Penitencia.** Si te pilla un farol, tu siguiente envite la paga: en el primer lance de las manos siguientes en que envides, si gana él, cobra 1 piedra más. Se gasta con ese envite, lo gane quien lo gane.

7. **El trato de Fulgencio.**
   - Una vez por duelo, antes del recuento y solo si hay envites queridos.
   - Se retiran **todos** los envites queridos de la mano y sus piedras se reparten a medias. **La impar se la queda él**, que para eso es tratante.
   - Lo que vale cada lance por sí mismo (pares, juego, punto, el paso) se cobra igual.
   - Lo propone si, con sus cartas, espera perder esos envites, y además de farol 3 de cada 10 veces. Aceptar es otra apuesta: hay que leerle.
   - *Ejemplo: hay cinco piedras queridas al Punto y aceptas: tú cobras 2 y él 3.*

8. **Don Bonifacio.**
   - **La Casa.** Es mano en el primer reparto y gana los empates a la Grande en todas las manos. El documento dice «en los empates del primer lance»; lo leo como la Grande de cada mano.
   - **Cartas de la casa.** Una vez por duelo, al empezar la Grande, si ninguna de sus jugadas llega al 60 % de ganar, cambia en secreto su carta más baja por la más alta del mazo.
   - De momento no se le puede pillar: hace falta el compañero o el objeto con Ojo de la fase 4.
   - Tampoco lee aún tu Libreta, que llega en la fase 4.

9. **Mirar al rival.** Se mantiene pulsado su retrato. Mientras miras, el rival espera, el resto de la mesa se oscurece y sus tics duran 1,6 veces más.

10. **Elegir rival.** Con el botón «Rival» de arriba, o al acabar cada duelo. También con `?rival=engracia` en la dirección.

11. **Equilibrio.** 300 duelos de cada rival contra un jugador sensato (la misma IA con una personalidad neutra, que no lee tics):

    | Rival | Gana | Manos por duelo | Órdago suyo | Acepta tus envites |
    | --- | --- | --- | --- | --- |
    | Ruperto | 49 % | 3,4 | 17 % de manos | 32 % |
    | Doña Engracia | 42 % | 4,4 | 6 % | 30 % |
    | Don Anselmo | 41 % | 4,4 | 13 % | 21 % |
    | Fulgencio | 60 % | 3,9 | 14 % | 21 % |
    | Don Bonifacio | 57 % | 3,7 | 16 % | 15 % |

    - Un jugador que envida en todos los lances, lleve lo que lleve, gana entre el 48 % y el 62 %, y la Cara le acaba en torno a 70. No rompe el juego, pero contra Doña Engracia y Don Anselmo funciona demasiado bien.
    - El documento ordena a los rivales de menos a más difíciles. Contra un bot que no lee tics no se nota tanto; hay que comprobarlo jugando.

## Cambio a vertical (10 de octubre de 2026)

*Decidido por David.* El juego pasa a jugarse con el móvil en vertical, al estilo de Clash Royale. La gira se hará más adelante como sus arenas: un camino vertical de comarcas.

- **Escenario de 390 × 844** (un móvil). En ordenador se ve centrado, con bandas. Si giras el móvil en horizontal, sale un aviso para ponerlo en vertical.
- **De arriba abajo:**
  - la comarca y los botones Rival y Depurar;
  - el marcador;
  - la Cara en una barra fina;
  - el rival grande, con su nombre y sus tics;
  - su bocadillo;
  - el tapete con sus cartas, lo que está en juego y las dos últimas líneas de la crónica;
  - tu mano;
  - la barra de acciones.
- **Marcador solo con los números** (opción A): el rival a la izquierda, tú a la derecha y en medio la fila de lances. Los amarracos desaparecen del marcador.
- **Barra de acciones al estilo Offsuit.** Abajo, en una fila, solo los botones que tocan en cada momento: PASO · ENVIDO, NO QUIERO · QUIERO · MÁS, CORTO · MUS… Al pulsar ENVIDO o MÁS se abre encima un selector con las cantidades (2, 3, 5 y 10).
- **El órdago, pequeño y aparte** en la esquina de la barra. Se tira **manteniéndolo pulsado un segundo** mientras se llena; si lo sueltas antes, no pasa nada. Con teclado, manteniendo Intro o Espacio.
- Las referencias de `referencias/pantallas/` siguen valiendo para el estilo (tintas, letra, piezas), pero no para la maquetación.

## Retoques y depuración antes de la fase 4 (11 de octubre de 2026)

*Pedidos por David tras probarlo en el móvil.* La regla desde ahora: todo cambio se apunta también en `docs/diseno-juego.md` y se regenera el PDF (`npm run documento`).

1. **Rival y Depurar solo en el modo de pruebas.** Salen con `npm run dev` o con `?pruebas` en la dirección. La tecla D y `?depuracion` solo funcionan en ese modo.
2. **Fuera el nombre de la comarca** de arriba de la mesa. Volverá, si hace falta, en la pantalla de la gira.
3. **El acta de la mano.** El bocadillo, el panel «En juego», la crónica y la etiqueta «Tú: …» decían lo mismo en cuatro sitios. Ahora hay un solo panel bajo el retrato:
   - arriba, el lance y lo que hay en juego;
   - debajo, las tres últimas líneas: lo que dice el rival (almagre, con su frase), lo que dices tú (añil) y lo que pasa en la mesa (cursiva);
   - lo último marcado y lo anterior apagado;
   - «Toda la mano» la abre entera.
   - Cerrada nunca pisa las cartas del rival: si no cabe, se corta lo más antiguo.
   - Lo que pasa en la mesa lleva el lance delante (*Pares: cobras 1 por el «no quiero»*), porque cuando aparece ya se está jugando el lance siguiente.
4. **La mano.** Funcionaba bien (cambia en cada mano; lo cubren las pruebas). Para que se entienda: la insignia MANO va bajo el marcador de quien lo es y cada mano empieza en el acta con *Mano 2: eres mano*; en la primera, con la explicación.
5. **Cuánto envidar, al estilo Offsuit.** Dos botones rápidos (dos y tres) y una barra del 4 al 19, con − y +. El selector sale sobre el tapete para no tapar tu mano. Al subir, recuerda lo que ya hay en juego.
6. **Al acabar el duelo.** REVANCHA contra el mismo rival y, debajo, los otros cuatro. **Cada duelo empieza de cero, con la Cara en 60.** Antes la Cara pasaba de un duelo al siguiente; eso es de la gira, y todavía no hay gira.
7. **Mientras piensa el rival**, la barra de acciones dice *Le toca a Ruperto…* en vez de quedarse vacía.
8. **Fallos encontrados y corregidos** (con un recorrido automático que juega duelos enteros contra los cinco rivales en un navegador a tamaño de móvil, más las pruebas de los momentos raros: trato, ofensa, tics y «se te nota»):
   - la mesa podía desplazarse hacia abajo al abrir el selector (el tapete se sale por abajo); ahora no se puede desplazar;
   - si tocabas ENVIDO justo cuando te llegaba el turno, el selector se cerraba solo;
   - con la Cara baja, el número tapaba el rótulo «Tu Cara» y chocaba con «SE TE NOTA»;
   - con tres respuestas (NO QUIERO · QUIERO · MÁS), «NO QUIERO» se partía en dos líneas;
   - faltaba el icono de la pestaña y el navegador daba un error 404.
9. **El farolero** (el jugador que abre con «envido dos» en todos los lances). Medido otra vez con `pruebas/farolero.sim.ts`: gana 9 puntos más que el sensato contra Doña Engracia y Don Anselmo, 13 contra Fulgencio y 6 contra Don Bonifacio.
   - Subir el peso de la memoria (`pesoMemoria` 1,5, 2,5 y 4, y bajar el 25 % esperado a 10–15 %) no lo arregla: el farolero farolea en el 27 % de sus envites, cerca de lo que la fórmula da por normal.
   - Lo que lo arregla es que el rival mire lo que arriesga al aceptar: con apuesta X y deje d, aceptar compensa si F > (X − d)/2X (un «envido dos» se debería querer con F > 0,25). Queda en `IA.aceptar.pesoCuota`: con 0,75 el farolero ya no gana más que el sensato y al sensato le va igual; con 1, igual pero algo más fuerte.
   - El precio: todos aceptan más envites pequeños (Doña Engracia, del 30 % al 47 %). **David lo aprobó: activado con 0,75.** Medido con la cuota: el farolero gana lo mismo o menos que el sensato contra todos, salvo 5 puntos contra Don Anselmo (cerca del ruido con 300 duelos).
10. **Fuera el cartel con el nombre del rival** junto al retrato (*David: «siento que sobra»*). Su nombre ya está en el marcador. En ese sitio solo sale, mientras dura, una etiqueta de estado: *¡ENFADADO!* (antes iba dentro del cartel) y, nueva, *OFENDIDA* para Doña Engracia.

## Personajes (11 de octubre de 2026)

David mandó las hojas de personaje de los cinco rivales (3D de estilo de animación: cinco vistas, seis expresiones y cinco poses cada una) y pidió **conservar su estilo** y «pasarlos por la imprenta» para que casen con la mesa, sin redibujarlos en estilo naipe.

1. **La imprenta.** Script `npm run personajes`: recorte, encuadre, tonos planos, tinta y papel, grano, contorno de 3 px y sombra dura de 4 px. Detalle en `direccion-arte.md`, «Personajes». Las hojas originales quedan en `assets/personajes/` (no se suben a la web).
2. **Encuadre.** De cintura para arriba y sacado de la **vista de frente**, que es la de más resolución: las caras de las expresiones van recortadas al borde de su casilla y no tienen brazos, y los tics son de manos. Cuadro de 220 × 220 px en la mesa, con el borde de abajo detrás del acta.
3. **Tics provisionales.** Salen de las miniaturas de «poses». Correspondencias:
   - Ruperto: *Beard scratch* → se rasca la barba; *Rolled sleeves* → se arremanga.
   - Doña Engracia: *Rosary quickens* → el rosario. (*Piercing gaze* se usó al principio para «te mira fijamente», pero también lleva las cartas en la mano y se confundía con el rosario: ahora va pintado, ver el punto 9.)
   - Don Anselmo: su *Beard scratch* (la mano en la barbilla y **los ojos hacia arriba**) → mira al cielo. Su *Victory* también señala al cielo, pero es demasiado aparatosa para un tic que debe ser discreto.
   - Don Bonifacio: *Beard scratch* y *Rolled sleeves* (los tics del Herrero); *Victory*, que levanta una copa de vino, → bebe vino; el humo del puro es un efecto dibujado encima.
   - Las demás poses (*Table slam*, *Victory*…) no corresponden a ningún tic y no se usan.
4. **Tics sin dibujo:** beber vino y juntar las manos de Don Anselmo, y juntar las manos de Don Bonifacio. Siguen como antes, con sacudida y acotación. Con arte, la acotación solo sale si el tic no tiene dibujo.
5. **Parpadeo** para los cinco, pintado sobre el reposo (ver el punto 9).
6. **El aspecto de cada rival** en el documento de diseño se ajusta a su dibujo (barba de Ruperto, mantón de Doña Engracia, sin gafas en Don Anselmo, pluma y chaleco en Fulgencio, levita en Don Bonifacio). Lo que necesitan sus tics y no está dibujado (el vaso de Don Anselmo, la vara y el diente de oro de Fulgencio) queda anotado como pendiente de arte.
7. **Botón Tics** en el modo de pruebas, para ver todos los tics de un rival seguidos.
8. **Más resolución.** David pidió acabado profesional: las hojas (1983 px de ancho) se han ampliado ×4 con Real-ESRGAN (modelo para ilustración). Los tics de las miniaturas pasan de borrosos a nítidos. La silueta se sigue sacando de la hoja original, porque la ampliada deja un halo claro en los bordes. Fotogramas de 660 px (220 de pantalla ×3).
9. **Animaciones pintadas sobre el dibujo** (no hay generador de imágenes, así que se pinta y se deforma sobre el reposo): parpadeos de los cinco; Doña Engracia entorna los ojos y se inclina para «te mira fijamente»; Don Bonifacio pone los ojos en blanco y ladea la cabeza para «mira al cielo»; Fulgencio lleva diente de oro y vara (su ficha los pedía), le brilla el diente, levanta el sombrero y golpea la vara.
10. **Juntar las manos deformando el dibujo, descartado:** se probó a llevar las manos de Don Anselmo al centro y la cruz se derretía y la estola se doblaba. Mejor la acotación que una imagen rota; queda pedida una pose.

## El acta narrada (12 de octubre de 2026)

*Elegida por David entre prototipos.* Primero vio cuatro maneras de enseñar la conversación (etiquetas y bote al estilo Offsuit, bocadillos de cómic, pizarra de taberna y acta ligera) y se quedó con el acta ligera; después, cuatro letras para ella, y eligió la **narrada**. Las imágenes están en `referencias/prototipos-acta/`.

1. **Pestaña y ficha.** El lance va en una pestaña negra encima del panel (*LA CHICA*, *MUS · MANO 2*…) y lo que hay en juego en una ficha roja en la esquina (*6 en juego*; *TODO · el duelo* con un órdago). Sin envite no hay ficha.
2. **La partida contada.** Lo tuyo en pasado y en cursiva azul (*Has envidado dos.*, *Llevas pares.*, *Has pedido una carta.*); lo del rival en presente, en versalitas rojas y con su frase debajo (*Ruperto sube cuatro más*); lo de la mesa en letra corriente. Dentro del acta ya no se usa la letra gruesa (Alfa Slab): queda para botones, cifras y gritos.
3. **Tres líneas como mucho**, y si una frase larga no deja sitio se esconde entera la más antigua, nunca a medias. Todo sigue en «Toda la mano», que sale siempre que haya algo escondido (al principio no salía si el acta tenía pocas líneas, y con el saludo largo de Doña Engracia se perdía la de quién es mano). El panel admite unos 140 px de líneas sin pisar las cartas del rival.
4. **El aviso de la Cara tapaba la cara del rival** (salía debajo de la barra, encima del retrato, donde están los tics). Ahora la cifra sube un momento junto a la marca de la barra y el motivo se lee en el acta. «Se te nota» hace parpadear la etiqueta SE TE NOTA en vez de sacar otro aviso.

## La cabecera y la ayuda de la Cara (12 de octubre de 2026)

*Elegida por David entre prototipos* (`referencias/prototipos-cabecera/`): carrera a 20, reloj de aguja, careto y tira compacta. Se quedó con el **careto, en versión compacta como la tira**, y con la ficha de «?», pidiendo el texto más corto y directo.

1. **Un solo panel** en lugar de dos (marcador y Cara): ocupa unos 112 px en vez de 150.
2. **Los lances como pasos** (✓ jugados, el actual en rojo, los que faltan a puntos) en vez de la fila tachada y subrayada.
3. **La Cara se explica sola:** careto según la zona y una frase corta (*te pillan: no cuela nada*, *te creen: a veces cuela*, *te temen: tus faroles cuelan*, *se te nota todo* a 0). Las zonas salen de `CARA.zonas` (35 y 70).
4. **«?»** abre una ficha corta con lo que la mueve y lo que hace cada zona (la tuya resaltada). Los números salen de `datos/cara.ts`, así que no se desajustan si se cambian. **Mientras está abierta, el rival espera** (como cuando le miras).
5. **Limpieza:** fuera las piezas que ya no se usaban (bocadillo, marcador de piedras, Cara de 20 segmentos, fila de lances y etiqueta de nombre) y sus estilos.

## El tapete, un tercio (12 de octubre de 2026)

*Pedido por David:* «aumenta un poco el tamaño de tus cartas para que la parte del tapete ocupe un tercio de la pantalla».

- El tapete empieza en 563 px (844 − 281), así que ocupa justo el tercio de abajo, con la barra de botones dentro.
- Tus cartas pasan de 70 × 126 a 80 × 145 px (un 15 % más), con el abanico algo más abierto. Las del rival, de 32 × 58 a 30 × 54, para que quepan en la parte de arriba del tapete.
- El selector de cantidad sube con la mano para no taparla, y el acta gana algo de sitio por abajo.
- *Después, a petición de David:* las cartas del rival quedaban pegadas a las tuyas, así que suben 18 px con el tapete (empieza en 545 px). Quedan unos 15 px de aire entre unas y otras, y el acta sigue sin pisarlas.

## Icono de la aplicación (12 de octubre de 2026)

*Pedido por David:* la moneda de oros como icono de la aplicación en el móvil.

- El icono necesita fondo opaco (en el iPhone lo transparente sale negro), así que va sobre el marrón de la taberna.
- Hay un manifiesto (`public/manifest.webmanifest`): al añadir la web a la pantalla de inicio se abre a pantalla completa, en vertical y con el nombre *Órdago*. Todavía no funciona sin conexión: falta el *service worker*, que va con el resto del modo sin conexión.
- Además, el tapete sube otros 16 px (empieza en 529) para dejar margen por encima de las cartas del rival.

## La visión y la gira en arenas (12 de octubre de 2026)

*Decidido por David* después de escribir su visión del juego:

- **El orden:** primero la gira y comprobar que es divertida; luego el pulido a fondo (animaciones, arte de los rivales como en un juego profesional), en la fase 5. No tiene que enseñárselo a nadie todavía.
- **Cada arena tiene cuatro niveles, como en Balatro:** tres secuaces y su jefe, que es el cuarto. Los cinco rivales que ya hay son los jefes.
- **Honra: tres vidas.** Se queda como estaba, porque el reparto pesa mucho.
- **Un solo compañero a la vez**, que se compra y se cambia en la taberna a medida que avanzas.
- **Objetos que van contra el rival**, además de los que te ayudan.
- **La «partida corta» es cada duelo a 20 piedras**, no la gira.
- Su texto de visión va ordenado al principio del documento de diseño.

*Propuesto por mí,* en el documento nuevo `docs/gira.md` (con su PDF, que se genera con `npm run documento` junto al de diseño), para que David lo cambie a su gusto:

- **15 secuaces**, tres por arena. El tercero de cada arena es la mano derecha del jefe y su manía anuncia la regla del jefe (*Nicasio se pica como Ruperto; Fermina no acepta órdagos en la primera mano*). Algunos secuaces conectan con su jefe: *si Eusebio, el monaguillo, te pilla un farol, se chiva y empiezas el duelo con Don Anselmo con la penitencia puesta*.
- **El orden de los niveles es fijo** (de menos a más), en lugar de elegir el orden de los dos parroquianos, para que la dificultad suba como en las ciegas de Balatro.
- **Perder contra un secuaz:** −1 de Honra y no cobras, pero sigues al siguiente nivel.
- **Reales por duelo según el nivel:** 4, 5, 6 y 10 el jefe (antes, 5 cualquier parroquiano y 10 el cacique).
- **Premio del jefe:** a elegir entre un compañero, su objeto raro o +1 de Honra.
- **La taberna, al estilo de Balatro:** cuatro cosas a la venta, «otra ronda» para cambiarlas y vender por la mitad.
- **Objetos nuevos:** jugarretas (de un uso, contra el rival), amuletos contra el rival, bebidas nuevas y los objetos raros de los jefes. *Invitar a una ronda* pasa de las bebidas a las jugarretas.
- **Tres compañeros nuevos:** la Cotilla, el Alguacil y el Dulzainero.
- La plaza y la era se quedan como paradas, y la plaza tiene ya ideas de eventos.

## Las arenas nuevas y los retoques de la gira (13 de octubre de 2026)

*Decidido por David* al revisar la versión 1 de `docs/gira.md`:

- **Honra:** la gira solo se acaba cuando te quedas sin Honra. Si pierdes contra un jefe, te cuesta 1 y vuelves a jugar contra él hasta ganarle.
- **Fuera «pasar de largo»:** si te pudieras saltar a los secuaces, no compensaría jugar contra ellos.
- **Las arenas:**
  1. La facultad: el jefe es el que no entra en clase y vive en la cafetería.
  2. El bar: adultos, no ancianos; el jefe tiene cuarenta y tantos, es medio calvo y tiene barriga cervecera.
  3. Una familia de la Montaña Palentina: la niña, la madre, el padre y el abuelo.
  4. Las fiestas del pueblo: ancianos que han jugado al mus toda su vida.
  5. El casino de la capital.
- **La plaza:**
  - El amuleto del timador es falso una de cada tres veces; si es falso, se rompe en cuanto te lo da.
  - La monja da +1 de Honra. Sale menos que el resto y solo una vez por gira.
- **Huecos:** 2 para amuletos y objetos raros, y 2 para bebidas y jugarretas.
- **Objetos:**
  - El Chato de vino hace que el rival diga su mano (4 reales).
  - Con el Caldo de la abuela, si el rival llega a 20, se juega hasta 30.
  - La Medalla de la Virgen se queda (9 reales).
  - Con la Ristra de ajos, los rivales no hacen tics falsos.
  - La Gorra calada cuesta 7 reales.
- **Los compañeros:** que los ajuste yo con todo lo anterior.

*Lo que he interpretado o propuesto yo* (marcado con [nuevo] en `docs/gira.md`, para que David lo revise):

- **Los personajes nuevos:** sus nombres, aspecto, tics y reglas. Destacan:
  - las señas de mus de toda la vida como tics de la familia, con el abuelo, que a partir de 10 piedras también las usa para mentir;
  - «Se viene arriba» de Chema: se crece cuando va ganando y se arruga cuando va perdiendo;
  - «¡Se ha rajado!» de Manolo: cada «no quiero» le da 1 piedra más;
  - «Cara de piedra» del tío Paulino: casi no hace tics y a ti se te nota antes.
- **Los cinco que ya tienen dibujo, colocados por edad y oficio:**
  - Ruperto y Fulgencio, en el bar: tienen unos cuarenta años.
  - Doña Engracia y Don Anselmo, en las fiestas.
  - Don Bonifacio, de jefe final.

  Si David prefiere la gira toda nueva, quedan para los duelos sueltos.
- **Antes de repetir contra un jefe** puedes pasar por una parada.
- **El Chato de vino:** lo he entendido como que el rival canta sus cuatro cartas en esa mano.
- **El Caldo de la abuela:** no vale si pierdes por un órdago, porque el órdago se juega el duelo entero.
- **La monja:** su +1 de Honra puede pasar de 3.
- **La Gaseosa, rehecha:** David no entendía la de antes. Tal como estaba (repetir un «quiero» antes de ver las cartas) no servía, porque decides a ciegas igual. Ahora vale después de ver las cartas: si perdiste un envite que quisiste, pagas como si no lo hubieras querido.
- **El Reloj de bolsillo, rehecho:** que el rival tarde más no servía de nada. Ahora puedes mirar al rival el doble de tiempo sin que se dé cuenta, y sus tics duran más.
- **Objetos raros nuevos** para los jefes nuevos.
- **Fuera el evento del cura:** hacía lo mismo que la Medalla.
- **El Abuelo (compañero) pasa a llamarse el Jubilado**, para no confundirlo con el abuelo de la familia. Se desbloquea al llegar a la Montaña Palentina.

## Nombres nuevos y diseños desde cero (13 de octubre de 2026)

*Decidido por David* al revisar la versión 2 de `docs/gira.md`:

- **Nombres nuevos.** Se quedan los «don» y «doña».

  | Antes | Ahora | Antes | Ahora |
  | --- | --- | --- | --- |
  | Ruperto | Agustín | Don Severiano | Don Agapito |
  | Fulgencio | Aurelio | El tío Paulino | El tío Arturo |
  | Tomás | Fernando | Leandro | Sergio |
  | Pilar | María | Doña Leonor | Doña Isabel |
  | El abuelo Teodoro | El abuelo Pepe | Don Ceferino | Don Pelayo |
  | Doña Engracia | Doña Ignacia | Don Bonifacio | Don Rodrigo |
  | Don Anselmo | Don Francisco | | |

  En las entradas anteriores de este documento salen con el nombre que tenían entonces.
- **Todos los personajes se diseñarán de nuevo desde cero**, también los cinco que ya tienen dibujo.
- **Manolo** juega con mucha calma las dos primeras manos y después, por la bebida, a lo loco.
- **El Reloj de bolsillo, baratillo:** 3 reales.
- **Confirmados:**
  - las señas de la familia y que se cuenten los faroles pillados;
  - «Se viene arriba» de Chema;
  - «Cara de piedra» del tío Arturo;
  - la Gaseosa, el Chato de vino, la monja y el Caldo de la abuela;
  - la parada antes de repetir contra un jefe;
  - el orden de las arenas: la facultad, el bar, la Montaña Palentina, las fiestas del pueblo y el casino. Ya estaban en ese orden.

*Lo que he hecho o propuesto yo:*

- **En el juego,** los cinco rivales ya salen con su nombre nuevo. Por dentro siguen con su id de antes (`ruperto`, `engracia`, `anselmo`, `fulgencio`, `bonifacio`), porque los usan el guardado y las carpetas del arte. Cambiarlos rompería las partidas guardadas y no se ve.
- **La regla de Manolo, «Una caña más»:**
  - las dos primeras manos casi no farolea y envida solo con buenas cartas;
  - desde la tercera farolea muchísimo, sube más y tira órdagos sin nada, con la etiqueta *¡ACHISPADO!*;
  - además, achispado se le notan más los tics, para que se le pueda leer.
- **Lo que le pasa en la gira:** si le ganaste a Aurelio, Aurelio le paga una ronda y Manolo se suelta una mano antes. Sustituye a «¡Se ha rajado!», que ya no encajaba.
- **Los diseños:** en `gira.md`, el «Aspecto» de los personajes nuevos pasa a ser «Idea de aspecto», solo como punto de partida. Los cinco del juego llevan en el documento de diseño la nota de que se rediseñan.

## Fase 4 · La gira, con la primera arena (13 de octubre de 2026)

*Decidido por David:*

- **Las pantallas:**
  - el mapa A1 (como las arenas de Clash Royale);
  - la taberna T1 (la estantería);
  - la bolsa del prototipo M3, pero con el botón arriba a la izquierda, donde el M1 tenía la seña;
  - las pantallas de elegir compañero (C) y de después del duelo (R), tal como estaban.

  Los prototipos están en `referencias/prototipos-gira/`.
- **Nombres de los compañeros:**
  - el Pastor pasa a ser el Lazarillo;
  - la Tabernera, la Recaudadora (de Hacienda);
  - la Cotilla, la Maruja;
  - el Sacristán, el Monaguillo;
  - la Moza del Molino, la Moza;
  - el Alguacil, el Militar;
  - el Forastero, el Afilador.
- «Hazlo»: con lo que había propuesto para la primera taberna (cinco objetos) y los dos compañeros del principio.

*Decidido por mí al programarla* (todo se puede cambiar):

- **Dónde va el código:**
  - la gira es pura y está en `src/estado/gira.ts`, porque junta duelos, reales y guardado;
  - la Libreta está en `src/estado/libreta.ts`;
  - los datos están en `src/datos/gira.ts`, `objetos.ts` y `companeros.ts`.

  CLAUDE.md la ponía en `nucleo/gira/`; lo he dejado anotado allí.
- **La portada es nueva y hacía falta:**
  - antes la web entraba directa al duelo;
  - ahora se elige entre seguir o empezar la gira, un duelo suelto (contra cualquiera de los nueve, agrupados por arena) o la Libreta;
  - `?rival=chema` sigue llevando directo a un duelo suelto.
- **Rubén y Chema:**
  - «se crece» (Rubén) y «se viene arriba» (Chema) se miran con el marcador: 5 piedras o más de ventaja;
  - crecidos farolean el doble;
  - Chema crecido, además, quiere más tus envites: +0,3 al valor para aceptar, sin contar los órdagos;
  - Chema arrugado no farolea y quiere menos: −0,2;
  - se avisa en el acta y junto al retrato: *¡CRECIDO!* o *ARRUGADO*.
- **Dani pide mus siempre** la primera vez de cada mano, lleve lo que lleve. Después ya decide normal.
- **Cuándo se usa cada cosa de la bolsa:**
  - las bebidas, jugarretas y señas, durante una mano;
  - el Orujo, en cualquier momento del duelo;
  - mientras la bolsa está abierta, el rival espera.
- **El Chato de vino** pone las cartas del rival boca arriba en la mesa durante esa mano. También las que robe al descartarse.
- **La seña del Lazarillo** pone boca arriba una de sus cartas, elegida al azar, mientras la lleve en la mano.
- **Los Apuntes de Chema:** se abren desde la bolsa y explican el siguiente tic. Sale su significado junto al retrato y en el acta. Una vez por duelo.
- **La Boina** gana los empates de todos los lances. La casa de Don Rodrigo va después, así que en su Grande manda él.
- **La Medalla** quita el primer «farol pillado» de cada duelo, también el de un órdago tuyo de farol. Si el órdago se pierde, ese −15 sigue.
- **Los reales:**
  - de un envite ganado se cobran solo los que se quisieron y se ganaron en el recuento, no los retirados con trato;
  - de un farol que cuela se cobra cuando el rival dice «no quiero» a un envite tuyo de farol (lo mismo que sube la Cara);
  - el órdago al triple de la Recaudadora suma 10 más a los 5 del órdago.
- **La apuesta del forastero** se pierde si el rival se lleva algún lance de Grande en un recuento, o si pierdes el duelo.
- **La plaza:**
  - el timador decide al salir si su amuleto es falso;
  - solo ofrece amuletos que no llevas, y si no te cabe no se puede comprar;
  - la partida en la calle queda para más adelante.
- **El premio del jefe:**
  - el compañero que te ofrece es el otro de los dos del principio;
  - el tuyo te deja la mitad, como en la taberna;
  - el objeto raro solo se puede elegir si te cabe;
  - la Honra, si te falta;
  - mientras no esté el bar, después del premio la gira acaba con victoria.
- **La Libreta** sube de nivel con 1, 4 y 10 veces vistas. Con 1, 3 y 6 se llenaba en un solo duelo contra Lucía, que tiene un único tic muy claro.
- **El guardado:**
  - la gira se guarda en cada paso fuera de la mesa;
  - dentro, al final de cada mano, como el duelo suelto;
  - si sales a mitad de mano, vuelves al final de la mano anterior, con lo de la bolsa tal como estaba entonces.
- **Sin dibujo:** los personajes, los objetos y los compañeros que no tienen dibujo salen con un marcador (recuadro rojo de puntos con el nombre), como pide CLAUDE.md.
- **Lo que pasa «En la gira» entre secuaces y jefes** no está programado. Por ejemplo, «Rubén le avisa». *Decidido por David después:* de momento no se hará; si la gira resulta demasiado fácil, o él lo ve bien, se añadirá.

## Los dibujos de antes, borrados (14 de octubre de 2026)

David decidió olvidar los diseños que había («no me acababan de gustar») y hacerlos todos de nuevo, con IA.

- **Borrado:** las hojas de los cinco primeros rivales (`assets/personajes/<id>/hoja.webp` y `hoja_x4.webp`), lo que la imprenta sacaba de ellas (`public/arte/personajes/<id>/`) y sus recortes y retoques en `personajes.json`. Siguen en el historial de git (el último commit que los tiene es d36d39c), por si algún día hicieran falta.
- **Se queda** la maquinaria: la imprenta (`npm run personajes`), los retoques, el retrato que respira, parpadea y cambia de pose, y los efectos de humo y destello. Con `personajes` vacío, la imprenta escribe un `indice.json` sin nadie y todos los rivales salen con el marcador. Las pruebas de arte se quedan para cuando lleguen los nuevos (330 pruebas: las 15 de los dibujos de antes ya no se generan).
- **La guía** para hacerlos, en `docs/personajes.md` (y en PDF): ficha, estilo, bocetos, diseño final y poses, con las peticiones para la IA de los cuatro de la facultad. Dos cosas aprendidas de las hojas de antes: **una imagen por pose y grande** (las poses en miniatura salían borrosas al ampliarlas) y **el mismo encuadre en todas** (para que el rival no «salte» al hacer el tic).
- **El estilo se vuelve a elegir:** se prueba a Chema en cuatro estilos y se montan en la mesa para que David elija viéndolos, como con las pantallas. Mi propuesta es el «naipe ilustrado» (contorno de tinta y colores planos), que casa con la baraja sin tener que disimularlo con la imprenta.
- **Cuando lleguen las imágenes nuevas** (una por pose), la imprenta se adapta para leer un archivo por pose en lugar de recortar una hoja.

## Chema, el primero con dibujo nuevo (15 de octubre de 2026)

David mandó ocho imágenes de Chema (fondo transparente, 1448 × 1086, el mismo encuadre: de codos sobre la mesa) y pidió meterlas «de la mejor manera posible» sin romper la armonía del juego. También cambió su tic del café por un trago de refresco, y dijo que el parpadeo no hace falta.

- **Qué es cada imagen:** la barbilla en el puño, el **reposo**; bajándose las gafas, su tic de mano fuerte; bebiendo la lata, el de farol; los brazos abiertos con sonrisa de chulo, **crecido**; los brazos cruzados mirando de reojo, **arrugado**; la boca abierta, **sorprendido**; la carcajada, **riendo**; el ceño con los brazos cruzados, **enfadado**.
- **Cuándo pone cada cara** (pura, en `estado/mesa.ts`, con pruebas): sorprendido cuando le echas un órdago; riendo si te pilla un farol; enfadado si le pillas el suyo; al acabar el duelo, riendo si gana y enfadado si pierde, y así se queda. Duran 2,4 s. Su postura (crecido, arrugado) dura lo que dura su ánimo. Un tic siempre va por encima: es lo que hay que leer.
- **El recuadro del retrato** pasa de 220 × 220 a **310 × 236**, apaisado como los dibujos, apoyado en el acta (que tapa el corte de abajo). El marcador de los que no tienen dibujo se queda más estrecho para no llegar a la bolsa ni a SALIR.
- **Imprenta ligera**: con un dibujo que ya trae su línea de tinta, sin tonos planos; solo tinta en lugar de negro, papel en lugar de blanco, color templado, grano suave, contorno de 3 px y sombra dura de 4 px. Se corta por la fila 1056 (lo de debajo lo tapa el acta). Las ocho, 320 KB.
- **Sin parpadeo**, como pidió David. El retrato lo sigue sabiendo hacer si algún personaje lo trae.
- **En el mapa**, el disco del jefe lleva su cara (un medallón que saca la imprenta del reposo), con el candado en una chapa al borde en vez de taparle la cara.
- **El tic renombrado** (`remueveCafe` → `bebeRefresco`): lo que ya estuviera apuntado en la Libreta con el nombre de antes pasa al nuevo.
- **Modo de pruebas:** el botón *Poses* va pasando por las posturas y las caras, para revisar el arte.

## La mesa viva, prototipo (22 de octubre de 2026)

David veía el juego «muy cutre» y quería un aspecto profesional como el de Balatro. Se le explicó que lo que falta no es arte sino movimiento y sonido, y pidió un prototipo de la mesa para compararla con la de ahora.

- **Se enciende y se apaga en la portada** (*Mesa viva: sí/no*, y *Sonido: sí/no*), se recuerda en el navegador y viene encendida. `?viva=0` o `?viva=1` en la dirección la cambia sin guardarlo; en el modo de pruebas, el botón *Viva*. Apagada, la mesa es exactamente la de antes.
- **Librería de animación:** Motion (antes Framer Motion, la que pedían las instrucciones), versión 13.5.1: la 14 había salido tres semanas antes y cambiaba casi a diario.
- **Un lienzo (canvas) solo para el fondo** (el polvo y el humo): las instrucciones piden proponerlo antes, y se propuso y se aceptó. Todo lo demás es CSS y Motion.
- **Degradados solo en el ambiente** (la luz del quinqué, el humo, las esquinas en sombra): la regla de «sin degradados ni sombras suaves» sigue valiendo para paneles, botones y cartas. El brillo de las cartas es una franja de borde duro.
- **Sonido fabricado en el momento** con el audio del navegador, sin archivos: así se prueba dónde va cada sonido sin descargar nada. Los definitivos serán grabaciones.
- **Lo que se dice cae como un sello sobre el tapete** (también el mus y el paso, más pequeños). Hace temblar la mesa una subida o un envite de 5 o más. El órdago no es un sello: tiene su propia pantalla de un segundo y medio.
- **Lo que se ve sale de los eventos del duelo**, en una función pura (`estado/efectos.ts`) con pruebas; la mesa la anima.
- **Durante el recuento, el marcador queda por encima del velo**, para ver llegar las piedras; el panel baja un poco para no quedar debajo.

## La mesa nueva, prototipo (22 de octubre de 2026)

David vio la mesa viva y le gustaron las cartas, las piedras y el órdago. Los sellos le encantaron como idea, pero su animación no estaba pulida, y propuso que, si los sellos cuentan lo que pasa, sobra el acta. Pidió analizar cómo lo resuelven otros juegos y montar la mejor distribución para compararla.

- **Lo que se copia de cada uno:** del póker en el móvil, la última palabra de cada jugador junto a él y lo que hay en juego en el centro; de Marvel Snap, las zonas que se ganan por separado y se resuelven al final (los lances); de Clash Royale, el rival hablando en bocadillos; de Hearthstone, el historial escondido; de Balatro, la resolución paso a paso.
- **Tres mesas** para comparar, en la portada: la nueva (por defecto), la viva y la de antes. `?mesa=nueva|viva|antes` en la dirección.
- **Lo que hacía el acta, y dónde va ahora:** lo que dice cada uno, a los sellos; su frase, al bocadillo; en paso, querido, no quiero, quién lleva pares o juego y el recuento, a las casillas; los cambios de Cara, a la barra (ya estaba); lo que significa un tic, junto al retrato (ya estaba); las reglas especiales del rival, los objetos y quién es mano, a los avisos (las líneas del acta llevan ahora la marca `aviso`); el trato, encima de los botones mientras se contesta. Todo lo demás, detrás de ≡.
- **Quién lleva pares o juego** se calcula de las cartas, pero solo se enseña cuando ya se ha declarado (al llegar a ese lance).
- **Por qué los sellos no estaban pulidos:** el muelle rebotaba dos veces (amortiguación de 0,45), aparecían creciendo desde transparentes, caían todos en el centro tapando las cartas del rival y se iban flotando. Ahora: un golpe seco a los 0,15 s, ya enteros, junto a quien habla, y se guardan en su casilla.
- **Recuento sobre la mesa:** sin el panel; las piedras salen de la casilla de cada cobro, en el mismo orden y al mismo ritmo que sus sellos. El panel del final del duelo espera a que se vea (1,5 s si fue por órdago).
- **El rival, sentado a la mesa:** el tapete le tapa el corte de la figura (lo que antes hacía el acta).

## Fuera mirar al rival (22 de octubre de 2026)

David pidió quitar la opción de ampliar al rival (mantener pulsado el retrato): no le veía sentido.

- **Quitado de la mesa:** la zona que se mantenía pulsada, la penumbra y el zoom. Los tics duran siempre lo mismo (antes, 1,6 veces más mientras mirabas) y el rival ya no espera mientras le miras.
- **Lo que dependía de ello:** la regla de Doña Ignacia (si la miras más de 2 s, se ofende y deja de hacer tics) ya no puede pasar. El motor sigue sabiendo ofenderla (`mirarAlRival` y `alSerMirado`, con su prueba), sin que nada lo llame, hasta que David decida otro motivo. En el catálogo de la gira, el Reloj de bolsillo queda por rehacer y la Gorra calada ya no habla de mirar.

## La letra nueva (22 de octubre de 2026)

A David no le acababa de convencer la letra. Se le enseñaron cuatro propuestas aplicadas a las mismas piezas de la mesa (Naipe limpio, Cómic de bar, Taberna y Cartel de verbena) y eligió una mezcla: **Alfa Slab One** para lo que se grita (como antes), **Alegreya Sans SC** para los rótulos y **Alegreya** para el texto, de la opción Taberna, y para el nombre **Spectral SC**, de la opción Naipe limpio.

- **Dónde va el nombre:** en los sellos (quién lo dice) y en la cabecera (*Chema*, *Tú*), que es el mismo nombre. Las frases que llevan el nombre dentro («Chema pide mus», en el acta) siguen en la letra de los rótulos.
- **Un solo grueso por letra de rótulo y de nombre:** Alegreya Sans SC en negrita y Spectral SC en seminegrita, como en las muestras que vio David. El cargador las declara para cualquier peso, así que no hay que tocar cada estilo.
- **Archivos:** WOFF2 con el alfabeto latino, sacados de los paquetes de Fontsource (licencia OFL, incluida). Están en `assets/fuentes/` y en `public/arte/fuentes/`. IM Fell se queda en `assets/fuentes/`, pero ya no se publica.

## Los botones, en Bitter Black (22 de octubre de 2026)

A David Alfa Slab One le gusta para los títulos, pero no para los botones. Buscaba una letra gorda y con estilo, «una mezcla entre Alfa Slab One y Alegreya Black»: vio letras gordas de varios tipos y luego seis egipcias humanistas, y eligió **Bitter Black**.

- **Dónde va:** los botones de apuesta y todos los de `BotonApuesta` (portada, gira, taberna, ayudas), el botón de la bolsa, el «−/+» del selector de envite y las paradas después del duelo. Con 0,5 px de interletraje.
- **Dónde no:** el botón de ¡ÓRDAGO! sigue en Alfa Slab One, para que sea el único botón que grita; también los títulos, las cifras y los sellos. ≡ también, porque es un signo.
- **El archivo:** `Bitter-Black.woff2` (alfabeto latino, de Fontsource, licencia OFL incluida), declarado para cualquier peso como las otras de un solo grueso.
- **De paso:** en la mesa nueva, tu sello quedaba por encima del selector de envite y tapaba parte de un botón; ahora los sellos van por debajo de la barra de botones.

## Doña Ignacia se ofende con un órdago temprano (22 de octubre de 2026)

Sin mirar al rival, su regla de ofenderse se había quedado sin motivo. David aprobó la propuesta: **si le tiras un órdago antes de la tercera mano, se ofende** y no hace tics en lo que queda de mano ni en la siguiente. Le pega: ya tenía la regla de no aceptar órdagos hasta la tercera mano.

- **Siempre**, sin tirar dados: un órdago se ve, no hay que pillarlo (mirarla dependía de su Ojo).
- **En el código**, `ofendeOrdagoTemprano` en su perfil (antes `alSerMirado`), aplicado al jugar tú (`jugarJugador`). Se quita `mirarAlRival`, que ya no usaba nadie. Sale en la mesa como antes: OFENDIDA junto al retrato, su frase («¡Qué descaro! Así no se juega.») y el aviso.

## Lo que vale cada objeto de la taberna (22 de octubre de 2026)

David vio jugando que el Chato de vino era muy barato para lo útil que es y pidió duplicar su precio (de 4 a 8, hecho) y analizar el resto.

**Cómo se ha medido** (`pruebas/objetos.sim.ts`, va con `npm run equilibrio`): el jugador sensato de las simulaciones de equilibrio contra los cuatro rivales de la facultad, 250 duelos contra cada uno (1.000 en total), primero sin nada y luego con cada objeto, **con los mismos repartos** para que la diferencia sea solo el objeto. Con el Chato, el jugador usa lo que ve: si sabe que gana el lance, tira órdago o quiere; si sabe que lo pierde, se retira. Se repite con un jugador farolero (faroleo 8), para quien deberían contar más el Orujo y la Medalla. Diferencias de un punto o menos son ruido.

| Objeto | Precio | Duelos ganados de más (de cada 100) |
| --- | --- | --- |
| Chato de vino, en una mano | 8 (antes 4) | **+9** (+8,8 el sensato, +9,6 el farolero) en ese duelo |
| Boina de la suerte | 8 | **+2,5** en cada duelo, durante toda la gira |
| Darle conversación, en la 1.ª mano / al ir ganando | 4 | +1 / −0,6: nada |
| Orujo, al empezar / cuando te pillan | 4 | −1,7 / 0: nada (con la Cara bien, subirla no ayuda; y el farolero casi nunca baja de 35) |
| Medalla de la Virgen | 9 | 0 (sensato y farolero) |

**Lo que se saca:** el Chato vale lo que cuesta ahora; la Boina, que suma en cada duelo, se queda barata; el Orujo, la Medalla y Darle conversación casi no cambian nada contra la facultad. Se le propusieron cuatro cambios y **David decidió**: Boina a 12; Orujo a 2; la Medalla se queda en 9, pero libra todos los faroles pillados del duelo; Darle conversación se queda en 4, pero el rival tampoco puede subir (en la IA, `distraido`; la Medalla ya no necesita `medallaUsada`).

**Medido otra vez con los efectos nuevos** (mismos 1.000 duelos): la Medalla que libra todos los faroles pillados, −0,2 (sensato) y −0,1 (farolero); Darle conversación sin órdago ni subir, +0,4 en la primera mano y 0 al ir ganando. Siguen sin notarse. No es el efecto: la Cara apenas cambia cómo juega el rival, y los de la facultad casi nunca suben ni tiran órdago. Lo que de verdad les daría valor es que la Cara pese más en la IA (propuesto a David el 23 de octubre). De paso: la Cara cambia poco los duelos con la IA de ahora, y eso es lo que deja flojos al Orujo y a la Medalla.

## Bitter Black en lugar de Alfa Slab One (23 de octubre de 2026)

A David no le gustaba Alfa Slab One en algunos sitios. Se le enseñó el catálogo numerado de los 38 sitios donde sale (`referencias/alfa-slab-donde-*.png`) y pidió ver los 38 en Bitter Black. Se ha hecho cambiando solo la variable `--letra-grito`: para volver atrás basta con devolverle `'Alfa Slab One'`. Bitter Black es más estrecha, así que todo cabe igual o con más aire (el «¡ÓRDAGO!» de la escena ya no se sale de la pantalla). Comparaciones, sitio a sitio y por pantallas, en `referencias/alfa-a-bitter-*.png`.

**Decidido por David:** se queda Bitter Black en los 38 sitios. Solo el 24, el «¡ÓRDAGO!» de la escena, se veía como dañado: llevaba un contorno de tinta hecho con `-webkit-text-stroke`, que en Bitter marca las uniones internas de cada letra. Ahora el contorno se hace con sombras alrededor y se ve limpio; quieto ocupa 272 de los 390 px de ancho. Alfa Slab One deja de cargarse y de publicarse (sigue en `assets/fuentes/`).

## Prueba: la Cara con el doble de peso (23 de octubre de 2026), deshecha

Para que la Medalla y el Orujo valieran algo, se probó a que la Cara pesara el doble al aceptar un envite: (50 − Cara) / 100 en lugar de / 200. Medido con las simulaciones de equilibrio (300 duelos por rival) y de objetos (1.000 por objeto):

- **Los rivales siguen equilibrados** contra el jugador sensato: Lucía 52 %, Dani 54 %, Rubén 61 %, Chema 64 %, Agustín 55 %, Aurelio 53 %, Doña Ignacia 45 %, Don Francisco 40 %, Don Rodrigo 56 %.
- **Pero los objetos de la Cara siguen igual**: la Medalla −0,2 y −0,3; el Orujo al empezar −2,9 (con la Cara alta, el rival rechaza más tus manos buenas); el Orujo «cuando te pillan» nunca llega a usarse.
- **Por qué:** quien farolea ve su Cara subir sola (cada farol creído +8, cada envite cobrado +4; en la simulación, Cara media de 60 a 66) y casi nunca baja de 35, así que protegerla o subirla no cambia nada. Darle más peso solo cambia el reparto, no eso.

Como no sirve para lo que se buscaba, **se deshace** (vuelve a / 200). Lo que de verdad daría valor a esos objetos es cambiar cómo se mueve la Cara (que suba menos o que baje más), una decisión de diseño para más adelante. Mientras, la Medalla (9) y Darle conversación (4) quedan flojas para lo que cuestan.

## Una sola mesa (23 de octubre de 2026)

David prefiere la mesa nueva. Se quitan la mesa viva con acta y la de antes: el botón *Mesa* de la portada, `?mesa=` y `?viva=` en la dirección, el acta a la vista, la mano y las cartas del rival sin animar, el sello del centro y sus estilos. Se queda el acta entera detrás de ≡ (sus líneas usan los mismos estilos). El panel del final del duelo solo sale al acabar el duelo, cuando ya se ha visto el recuento. La preferencia guardada `mesa` de quien la tuviera se ignora.

## El fondo de la portada (24 de octubre de 2026)

David mandó una ilustración para el fondo del menú principal (941 × 1670) y preguntó qué medidas debía tener. **Ideal: 1170 × 2532** (el escenario de 390 × 844 a 3 píxeles por punto, como lo pintan los móviles de ahora; proporción 9 : 19,5); como mínimo, 780 × 1688. Mientras llega, la de ahora ya está puesta: llena la pantalla recortando unos 85 px por lado. El letrero y el lema van en un cartel de papel, porque su tinta no se lee sobre la foto. Se le avisó del paquete de Marlboro: una marca real, y de tabaco, mejor fuera.

**[cambiado] Rehecha el mismo día.** David pidió que el menú se viera como una sola composición y que no se recortara la ilustración; lo vio en dos bocetos y eligió el segundo. La ilustración va entera de ancho y, para llenar lo que falta abajo, **la mesa sigue con su canto** (con los marrones de la propia mesa), en lugar de ampliarla o de poner una copia borrosa detrás. Con eso, la medida buena pasa a ser la de ahora en grande: **1170 × 2077**. Ajustes aún no tiene nada dentro (el sonido ya tiene su botón): por ahora avisa de que vendrán más, como pidió David.

## Miguel, el novato, en lugar de Lucía (24 de octubre de 2026)

David cambió el primer rival de la facultad: Lucía, la de primero, pasa a ser **Miguel, el novato**, y mandó su boceto y cinco imágenes (reposo, el tic del pañuelo, sorprendido, riendo y enfadado).

- **El id sigue siendo `lucia`**, como Agustín sigue siendo `ruperto`: así no se pierde la gira guardada de quien esté jugando contra él. El nombre que se ve está en `textos/es.ts`, y su arte va en `assets/personajes/lucia/`.
- **Juega igual que Lucía:** el mismo nivel, los mismos parámetros y un solo tic con el mismo significado (pares o mejor, 9 de cada 10). Cambia el gesto, que ahora sale del dibujo de David: se limpia los mocos con un pañuelo, sonriendo.
- **La Libreta no pasa lo de Lucía a Miguel.** Es otro personaje y su tic se aprende de nuevo; lo apuntado del boli se queda guardado, pero ya no se ve.
- **Sin crecido ni arrugado:** Miguel no cambia de ánimo con el marcador, como no cambiaba Lucía.

## Rubén con dibujo: la gorra pasa a ser el pulgar (24 de octubre de 2026)

David mandó ocho imágenes de Rubén sin decir cuál era cuál. Las repartí así:

- **Reposo:** la sonrisa chula con la barbilla en el puño. Venía dos veces, casi igual, y se usa la primera.
- **Tic de pares:** el mordisco al bocadillo.
- **Tic del 31:** el pulgar arriba. No llegó la de ajustarse la gorra, así que el tic pasa a ser levantar el pulgar. Significa lo mismo (lleva 31, 8 de cada 10), y lo apuntado de la gorra en la Libreta pasa al pulgar.
- **Crecido:** echado hacia atrás con la barbilla levantada, que es lo que pedía su pose en la guía.
- **Las tres caras:** sorprendido, riendo y enfadado.
- **Sin arrugado,** porque Rubén solo se crece.

Las imágenes son de 1536 × 1024, más apaisadas que las de Chema. Si se ajustaran enteras al fotograma, Rubén saldría más pequeño, así que se aprovecha solo el tramo de 1330 px con la figura (`encuadre`). Si David prefiere otro reparto, se cambia en `assets/personajes/personajes.json`.

## Dani con dibujo: la facultad, completa (24 de octubre de 2026)

David mandó siete imágenes de Dani y pidió subirlo todo a GitHub y a Vercel. Una de ellas (un PNG de 1184 × 1184) llegó vacía: solo una mancha blanca sobre fondo transparente, sin dibujo. Con las otras seis se cubre todo lo que necesita Dani:

- **Reposo:** el pulgar arriba con su vaso. Es alegre y despistado, y de las seis es la que más pega para estar así casi todo el duelo.
- **Tics:** rasguea la bandurria (lleva 31) y se coloca las cintas de la capa (lleva duples), los de siempre.
- **Las caras:** sorprendido (manos arriba y «!!»), riendo (señalando con el vaso) y enfadado (de morros, con el puño en la mejilla).
- **Sin crecido ni arrugado,** porque Dani no cambia de ánimo con el marcador.

Si la imagen vacía era otra pose (por ejemplo, otro reposo), basta con volver a mandarla.

## Dudas para fases posteriores

No afectan a lo hecho. Se resolverán al llegar a su fase, preguntando antes. Cada una lleva una propuesta, explicada con un ejemplo en el documento de diseño («Preguntas abiertas»).

- **¿Un duelo a 20 piedras es corto? Decidido:** es la «partida corta» del juego. En las simulaciones dura unas 3–4 manos, unos 2–3 minutos; falta comprobarlo jugando.
- **El real por «farol no descubierto»: decidido.** Cuenta el farol al que el rival dice «no quiero», como ya hace la Cara.
- **El Veterano: decidido.** Basta con llevar dos reyes cualesquiera; los treses son reyes.
- **El Tahúr: decidido.** Su seña cambia en secreto la carta que quieras por un rey del mazo (si no queda ninguno, no se puede usar). Si te pillan, la mano se acaba, nadie cobra nada de ella y el rival se lleva 5 piedras.
- **Medalla de la Virgen: decidida.** La de antes, descartada (David no le veía sentido). La nueva, aprobada el 13 de octubre: «la primera vez en cada duelo que te pillan un farol, tu Cara no baja», a 9 reales.
