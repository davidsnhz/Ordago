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

## Dudas para fases posteriores

No afectan al motor. Se resolverán al llegar a su fase, preguntando antes.

- **Cuándo tira órdago la IA.** El texto dice «con F > 0,85, o de farol con probabilidad 0,01·B si va perdiendo de 8». El pseudocódigo exige además un sorteo con la agresividad y no incluye el farol. Tampoco se dice cuándo la IA sube («más») en vez de aceptar.
- **Qué cuenta como farol para la Cara y los reales.** Falta saber si el 35 % de probabilidad de ganar se calcula contra cualquier mano o teniendo en cuenta lo que ha declarado el rival. Y si un farol al que el rival dice «no quiero» cuenta como «farol no descubierto» para cobrar el real.
- **«Envite con buena mano» (+4 de Cara).** Falta el umbral. Propuesta: F > 0,65, el mismo que usa la IA para envidar.
- **Medalla de la Virgen.** «El órdago perdido solo cuesta 10 piedras»: ¿el rival suma 10, o pierdes 10 de las tuyas?
- **El Veterano.** «Los dos reyes más altos» no tiene sentido a 8 reyes, donde todos los reyes son iguales. ¿Basta con llevar dos reyes?
- **El Tahúr.** «Te pilla y pierdes la mano»: ¿cuántas piedras son?
- **El trato de Fulgencio.** ¿Qué envite se retira si hay varios, y cómo se reparte un número impar de piedras?
