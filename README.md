# Órdago

Órdago es un juego de mus uno contra uno para el móvil. La idea es sencilla: **no gana quien lleva mejores cartas, gana quien hace creer que las lleva.**

Lo que más me gusta del mus no son las reglas, son cuatro momentos: que te entre una buena mano, envidar y que el otro te lo quiera, tirar un órdago y que te cuele un farol. El juego está pensado para que esos momentos pasen a menudo y se sientan grandes.

Es un roguelike. Eres un forastero que se va jugando el mus por Castilla: empiezas en la cafetería de la facultad, que es donde aprende casi todo el mundo, y de ahí vas al bar, a una casa de pueblo en la Montaña Palentina contra una familia entera, a las fiestas contra los viejos del concurso de mus y, al final, al casino de la capital. Cada rival juega a su manera y tiene sus tics, y la gracia está en aprender a leerlos. Las cartas importan, pero lo que decide es cuándo envidar, cuándo querer y cuándo farolear.

**Se juega aquí: https://ordago-game.vercel.app**

Para tenerlo como una app en el móvil:
- **iPhone (Safari):** Compartir → *Añadir a pantalla de inicio*.
- **Android (Chrome):** menú ⋮ → *Instalar aplicación*.

Sale con la moneda de oros, a pantalla completa y en vertical.

## Cómo está ahora mismo

Ahora se pueden jugar **duelos sueltos contra los cinco rivales**, cada uno con su arte, sus tics y sus manías. Lo siguiente es la gira: cinco arenas, cada una con cuatro niveles (tres secuaces y su jefe), la taberna con sus objetos, los compañeros, la Libreta y la Honra. Todo eso está ya pensado en el [documento de diseño](docs/diseno-juego.md) (también en [PDF](<docs/Órdago — Documento de diseño.pdf>)), pero todavía no está en el juego.

## Cómo se juega

### Lo básico

- Es un duelo **a 20 piedras**. Gana el primero que llega, o el que gana un órdago.
- Se juega con la **baraja española de 40 cartas, a 8 reyes**: los treses cuentan como reyes y los doses como ases. Las figuras y los reyes valen 10 para el juego; el resto, lo que marcan; los ases, 1.
- Cada mano se reparten 4 cartas y luego va así: **mus → Grande → Chica → Pares → Juego (o Punto) → recuento.**
- **Ser mano** significa que hablas primero y ganas los empates. Cambia en cada mano, y quien lo es lleva la etiqueta MANO arriba.

### El mus

Al empezar cada uno dice **mus** (quiere cambiar cartas) o **corto** (se juega con lo que hay). Si los dos pedís mus, cada uno tira de 1 a 4 cartas y roba otras. Como mucho se hace dos veces por mano. En cuanto alguien corta, empiezan los lances.

### Los lances

| Lance | Quién gana | Ejemplo |
| --- | --- | --- |
| **Grande** | Las cartas más altas | R R C 5 le gana a R C C 7 |
| **Chica** | Las cartas más bajas | A A 4 5 le gana a A 4 5 6 |
| **Pares** | Duples > medias > pareja; dentro de cada tipo, las más altas | R R 5 5 (duples) le gana a 7 7 7 4 (medias) |
| **Juego** | 31 es el mejor, luego 32, 40, 37, 36, 35, 34 y 33 | R C 7 4 (31) le gana a R C S 5 (35) |
| **Punto** | Si nadie tiene juego: el que más se acerque a 30 | R C 5 4 (29) le gana a R 7 6 4 (27) |

A Pares y a Juego **solo se envida si los dos tenéis**. Lo de si llevas o no se dice solo, y es verdad siempre (el farol va en el envite, no en lo que declaras). Si solo lo lleva uno, cobra lo suyo en el recuento y ya.

### Apostar

En cada lance, cuando te toca:

- **PASO:** no apuestas. Si los dos pasáis, el lance se cobra en el recuento.
- **ENVIDO:** apuestas. Salen dos botones rápidos (*envido dos* y *envido tres*) y una barra para elegir cualquier cantidad del 4 al 19.
- **QUIERO:** aceptas lo que te han envidado. Se resuelve en el recuento, cuando se ven las cartas.
- **NO QUIERO:** te retiras. El otro se lleva 1 piedra (o lo que ya estaba aceptado antes de su última subida).
- **MÁS:** aceptas y subes. Igual que el envido: dos, tres o la barra.
- **¡ÓRDAGO!:** te juegas el duelo entero en ese lance. Hay que **mantenerlo pulsado un segundo** para que no se tire sin querer. Si te lo quieren, se enseñan las cartas y el que gana ese lance gana el duelo.

Las cartas no se ven hasta el recuento, así que todo lo que quieres o no quieres lo decides a ciegas. Ahí es donde vive el farol.

**Lo que vale cada lance** aunque nadie envide: la Grande y la Chica, 1 piedra al que gana; Pares, 1 la pareja, 2 las medias y 3 los duples; Juego, 3 el 31 y 2 cualquier otro; Punto, 1. Si hubo envite querido, se suma.

### Los tics y mirar al rival

Los rivales tienen tics: se rascan la barba, se arremangan, pasan el rosario más deprisa… Cada tic quiere decir algo de sus cartas, pero **ninguno acierta siempre** (más o menos 7 u 8 de cada 10 veces), así que hay que arriesgar. Qué significa cada uno no te lo digo, eso es lo que tienes que aprender jugando.

**Manteniendo pulsado el retrato** le miras de cerca y sus tics duran más, pero mientras miras no juegas, y a alguno no le gusta nada que le mires mucho.

### Tu Cara

La Cara es lo que te creen en la mesa, tu cara de póquer. Va de 0 a 100 y empiezas cada duelo en 60. Arriba sale con una carita y una frase que te dice cómo vas, y el botón **?** lo explica.

Lo que la mueve:
- **+8** si te creen un farol (envidas sin cartas y el otro no quiere).
- **+4** si ganas un envite con buena mano.
- **−12** si te pillan un farol (te lo quieren y en el recuento se ve que no llevabas nada).
- **−15** si pierdes un órdago que has tirado tú.

Lo que hace:
- **Te temen (70 o más):** se retiran más. Tus faroles cuelan, pero tus buenas manos cobran poco.
- **Te creen (35 a 69):** lo normal.
- **Te pillan (menos de 35):** te lo quieren todo. Farolear ya no sirve, pero con buenas cartas cobras mucho.
- **A 0 se te nota:** el rival te ve el tic a ti, igual que tú se lo ves a él.

O sea que a veces compensa dejarte pillar un farol barato para que luego te quieran el envite gordo cuando llevas duples.

### Los rivales

- **Agustín, el Herrero.** Bruto y directo: cuando lleva cartas se le nota en todo, envida fuerte y casi nunca farolea. Si pierde tres lances seguidos se enfada y durante dos manos te lo quiere todo.
- **Doña Ignacia, la Viuda.** Paciente y desconfiada. Casi nunca farolea y cuando envida es que lleva algo. No acepta un órdago antes de la tercera mano, y si la miras demasiado se ofende y deja de hacer tics.
- **Don Francisco, el Cura.** Equilibrado y con buena memoria: si le faroleas mucho, deja de creerte. Envida siempre a la Chica, lleve lo que lleve. Si te pilla un farol te pone penitencia: tu siguiente envite le paga una piedra más si lo gana él.
- **Aurelio, el Tratante.** El que más farolea y el que tira órdagos sin nada. Una vez por duelo te propone un trato antes del recuento: retirar los envites queridos y repartiros las piedras (la impar, para él). Y no todos sus tics significan algo.
- **Don Rodrigo, el Cacique.** El mejor de todos y el más difícil. Su casa, sus reglas: es mano en la primera mano, gana los empates a la Grande y una vez por duelo cambia una carta en secreto. A mitad del duelo cambia de tics.

### La pantalla

De arriba abajo: el marcador con los lances y tu Cara; el rival; el acta, donde se va contando la mano («Has envidado dos.», «Agustín sube cuatro más» y su frase), con lo que hay en juego en la ficha roja y *Toda la mano* para ver lo anterior; el tapete con sus cartas y las tuyas; y abajo los botones, que solo salen cuando te toca.

## Para tocar el código

Está hecho para el navegador con **TypeScript, React y Vite**, y las pruebas con **Vitest**. Toda la lógica del mus y de la IA va aparte de la interfaz y se prueba sin ella.

```bash
npm install
npm run dev
```

Otros comandos:

- `npm test`: las pruebas (reglas, IA, la mesa…).
- `npm run equilibrio`: simulaciones de cientos de duelos contra cada rival para ajustar números. Tardan unos minutos.
- `npm run build`: la versión para publicar.
- `npm run documento`: vuelve a generar el PDF del documento de diseño.
- `npm run personajes`: pasa mis hojas de personaje (`assets/personajes/`) por la «imprenta» para que casen con el estilo de la mesa.
- `npm run iconos`: genera los iconos de la app.

Con `?pruebas` en la dirección salen unos botones para probar: elegir rival, ver lo que piensa la IA y ver todos los tics de un rival seguidos.

Dónde está cada cosa:

- `src/nucleo/`: el mus en sí (baraja, lances, apuestas, recuento, el duelo) y la IA de los rivales.
- `src/datos/`: los números (reglas, parámetros de cada rival, la Cara, el equilibrio).
- `src/estado/`: la partida y el guardado.
- `src/ui/`: la mesa y sus piezas.
- `src/textos/es.ts`: todos los textos del juego.
- `docs/`: el [documento de diseño](docs/diseno-juego.md), [la gira](docs/gira.md) (las arenas, los rivales, los objetos y los compañeros, con todas las ideas), la [dirección de arte](docs/direccion-arte.md) y las [decisiones](docs/decisiones.md) que he ido tomando por el camino.

Las fuentes (Alfa Slab One e IM Fell) tienen licencia OFL; las licencias están en `public/arte/fuentes/`.
