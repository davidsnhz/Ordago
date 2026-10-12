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

## Dudas para fases posteriores

No afectan a lo hecho. Se resolverán al llegar a su fase, preguntando antes. Cada una lleva una propuesta, explicada con un ejemplo en el documento de diseño («Preguntas abiertas»).

- **¿Un duelo a 20 piedras es corto? Decidido:** es la «partida corta» del juego. En las simulaciones dura unas 3–4 manos, unos 2–3 minutos; falta comprobarlo jugando.
- **El real por «farol no descubierto»: decidido.** Cuenta el farol al que el rival dice «no quiero», como ya hace la Cara.
- **El Veterano: decidido.** Basta con llevar dos reyes cualesquiera; los treses son reyes.
- **El Tahúr: decidido.** Su seña cambia en secreto la carta que quieras por un rey del mazo (si no queda ninguno, no se puede usar). Si te pillan, la mano se acaba, nadie cobra nada de ella y el rival se lleva 5 piedras.
- **Medalla de la Virgen: descartada tal como estaba** (David no le ve sentido). Propuesta de sustituta, pendiente: «la primera vez en cada duelo que te pillan un farol, tu Cara no baja».
