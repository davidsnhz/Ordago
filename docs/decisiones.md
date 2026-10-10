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

## Dudas para fases posteriores

No afectan a lo hecho. Se resolverán al llegar a su fase, preguntando antes.

- **¿Un duelo a 20 piedras es corto?** En las simulaciones dura unas 3 manos, unos 2–3 minutos. El documento ya lo dejaba como pregunta abierta para estas pruebas.
- **Qué cuenta como farol para la Cara y los reales.** La memoria del rival usa la definición del punto 4 de la fase 2. Falta decidir si un farol al que el rival dice «no quiero» cuenta como «farol no descubierto» para cobrar el real.
- **«Envite con buena mano» (+4 de Cara).** Falta el umbral. Propuesta: F > 0,65, el mismo que usa la IA para envidar.
- **Medalla de la Virgen.** «El órdago perdido solo cuesta 10 piedras»: ¿el rival suma 10, o pierdes 10 de las tuyas?
- **El Veterano.** «Los dos reyes más altos» no tiene sentido a 8 reyes, donde todos los reyes son iguales. ¿Basta con llevar dos reyes?
- **El Tahúr.** «Te pilla y pierdes la mano»: ¿cuántas piedras son?
- **El trato de Fulgencio.** ¿Qué envite se retira si hay varios, y cómo se reparte un número impar de piedras?
