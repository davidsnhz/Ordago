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

## Dudas para fases posteriores

No afectan a lo hecho. Se resolverán al llegar a su fase, preguntando antes.

- **¿Un duelo a 20 piedras es corto?** En las simulaciones dura unas 3 manos, unos 2–3 minutos. El documento ya lo dejaba como pregunta abierta para estas pruebas.
- **El real por «farol no descubierto».** La Cara ya usa la definición de farol del punto 1 de la fase 3. Falta decidir si un farol al que el rival dice «no quiero» cuenta como «no descubierto» para cobrar el real (fase 4).
- **Medalla de la Virgen.** «El órdago perdido solo cuesta 10 piedras»: ¿el rival suma 10, o pierdes 10 de las tuyas?
- **El Veterano.** «Los dos reyes más altos» no tiene sentido a 8 reyes, donde todos los reyes son iguales. ¿Basta con llevar dos reyes?
- **El Tahúr.** «Te pilla y pierdes la mano»: ¿cuántas piedras son?
