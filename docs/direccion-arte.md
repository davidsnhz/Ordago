# Órdago — Dirección de arte

Este documento manda sobre cualquier mención al arte en `diseno-juego.md`. Las capturas de `referencias/pantallas/` muestran cómo debe verse cada pantalla. Sus HTML son la especificación exacta de medidas, colores y tipos.

## Qué está cerrado y qué no

| Parte | Estado | Fuente |
| --- | --- | --- |
| Baraja (40 cartas + 2 reversos) | **Cerrada** | `assets/cartas/` |
| Palos sueltos y logotipo | **Cerrado** | `assets/palos/`, `assets/marca/` |
| Tintas (paleta) | **Cerrada** | esta guía |
| Tipografías | **Cerradas** (**[cambiado]** 22 de octubre de 2026: Alegreya en lugar de IM Fell) | `assets/fuentes/` |
| Piezas de mesa: botones, piedras, lances, Cara, paneles | **Cerradas** | esta guía + `00_guia_estilo` |
| Maquetación de pantallas | **Cerrada como referencia** | `referencias/pantallas/01–05` |
| Personajes: rivales, compañeros, tabernera y sucesos de la plaza | **En marcha: todos se diseñan desde cero.** Los dibujos de antes se borraron el 14 de octubre de 2026. **Chema, hecho** (15 de octubre): marca el estilo | guía: `docs/personajes.md`; mientras, marcador (recuadro de puntos almagre con el nombre) |
| Iconos de objetos de taberna | **PENDIENTE** | usar marcadores |
| Movimiento y sonido de la mesa | **Prototipo** (22 de octubre de 2026): la mesa viva, para comparar con la de antes | «La mesa viva», abajo |
| Distribución de la mesa | **Prototipo** (22 de octubre de 2026): la mesa nueva, sin acta a la vista | «La mesa nueva», abajo |
| Mapa ilustrado | Provisional: la facultad con formas planas (el edificio, la arena, el bar en niebla) | `src/ui/pantallas/gira/Mapa.tsx` |

Todo lo pendiente se dibuja con **marcadores** (rectángulo de trazo discontinuo en almagre, fondo nogal translúcido y el texto «ARTE PENDIENTE»), detrás de una interfaz que permita cambiar el arte sin tocar código.

## Las tintas

| Nombre | Hex | Uso |
| --- | --- | --- |
| Almagre | `#B02A23` | órdago, envites, peligro, «te pillan» |
| Gualda | `#E2A527` | oro, amarracos, títulos sobre fondo oscuro, botón Envido |
| Añil | `#2C54A0` | información, señas, «eres mano», el río |
| Verde botella | `#3E7A36` | tapete, ganancias, «te temen» |
| Nogal | `#8C5629` | madera, cuero, piedras pequeñas |
| Negro de humo | `#231915` | tinta: textos y todos los contornos |
| Papel | `#F2E8D2` | cartas, paneles, rótulos |
| Papel de fondo | `#EADFC4` | fondo de pantallas claras (título, mapa, guía) |
| Taberna | `#2A1F18` | fondo de pantallas oscuras (mesa, taberna) |
| Gris tachado | `#8C7F6A` | lance ya jugado |

Colores secundarios que ya existen en las referencias: gualda oscuro `#A3640A` (texto «te creen»), zona clara de la Cara `#F1E2B8` / `#D6E3C6`.

Textura: los fondos de papel llevan un punteado muy suave (puntos de 1 px de `rgba(35,25,21,0.07)` cada 6 px). El tapete lleva el mismo punteado más oscuro.

## La letra

**[cambiado] 22 de octubre de 2026.** A David no le convencía IM Fell: es una letra de imprenta del siglo XVII, de bordes irregulares, que en el móvil y a tamaño pequeño se ve borrosa y le da a todo aire de documento viejo. Vio cuatro propuestas aplicadas a piezas de la mesa y eligió Alfa Slab One para lo que se grita, Alegreya Sans SC para los rótulos y Alegreya para el texto, con los nombres en Spectral SC.

| Fuente | Archivo | Uso |
| --- | --- | --- |
| Alfa Slab One | `AlfaSlabOne-Regular.ttf` | lo que se grita en la mesa: títulos, cifras, sellos, «¡ÓRDAGO!» y su botón (siempre en mayúsculas). **[cambiado]** Ya no los demás botones |
| **[nuevo]** Bitter Black | `Bitter-Black.woff2` | los botones (PASO, ENVIDO, QUIERO, SIGUIENTE MANO…, los de la portada y la gira, la bolsa y el «−/+» del selector); un poco de interletraje. Gorda y con carácter, pero no cansa al pulsarla una y otra vez. Es de Huerta Tipográfica, los mismos de Alegreya |
| **[cambiado]** Alegreya Sans SC (negrita) | `AlegreyaSansSC-Bold.woff2` | rótulos, lances, menús, marcadores, etiquetas (versalitas, interletraje amplio). Solo hay un grueso: vale para cualquier peso |
| **[cambiado]** Alegreya (cursiva) | `Alegreya-Italic.woff2` | la voz de los rivales, refranes, descripciones |
| **[cambiado]** Alegreya | `Alegreya-Regular.woff2` y `Alegreya-Bold.woff2` | texto corrido |
| **[nuevo]** Spectral SC (seminegrita) | `SpectralSC-SemiBold.woff2` | los nombres de quien juega: en la cabecera (*Chema*, *Tú*) y en los sellos |

En las variables de estilo son `--letra-grito`, `--letra-boton`, `--letra-rotulo`, `--letra-texto` y `--letra-nombre`. Alegreya es de Huerta Tipográfica (Argentina), pensada para leer mucho y bien en español. Las tres nuevas, solo con el alfabeto latino (acentos, eñe, ¡ ¿ « »), en WOFF2: unos 23–29 KB cada una. **Donde esta guía dice IM Fell English SC, léase Alegreya Sans SC; donde dice IM Fell English, Alegreya.** IM Fell sigue en `assets/fuentes/`, pero ya no se publica.

Todas tienen licencia OFL (incluida en la carpeta).

## Piezas de mesa

Las medidas están en píxeles del escenario de referencia (1280 × 590). Pasa estos valores a variables CSS en `src/ui/estilos/`.

> **Desde el 10 de octubre de 2026 el juego es vertical (390 × 844).** Tintas, letra y piezas siguen igual; la maquetación de las pantallas cambia y las medidas se reducen en proporción. El marcador muestra solo los números (sin amarracos) y el órdago se tira manteniéndolo pulsado. Ver `docs/decisiones.md`, «Cambio a vertical».

**Paneles.** Fondo papel, borde de 3 px negro de humo, radio de 6–8 px. Los paneles importantes llevan una sombra dura desplazada (3–4 px abajo a la derecha, negro de humo, sin difuminar). Nunca degradados ni sombras suaves en la interfaz.

**Botones de apuesta.** **[cambiado]** Bitter Black (antes Alfa Slab One) de 20–24 px, borde de 3 px, radio de 10 px y sombra dura de 3 px.
- PASO y QUIERO: fondo papel.
- ENVIDO / ENVIDO MÁS: fondo gualda.
- NO QUIERO: fondo papel con borde **discontinuo** y sin sombra, porque es rendirse.
- ¡ÓRDAGO!: fondo almagre, texto papel, contorno doble (borde de tinta más un anillo almagre separado 3 px). Es más grande y está separado del resto. Se activa **deslizando hacia arriba**, con el texto «desliza hacia arriba para tirarlo» debajo.
- Al pulsar, el botón baja 3 px y la sombra desaparece.

**Piedras y amarracos.** El amarraco es un círculo gualda de unos 22–34 px con borde de tinta y vale 5 piedras. La piedra suelta es un óvalo nogal pequeño. *(En la mesa vertical el marcador va solo con números; los amarracos quedan para el recuento y otras pantallas.)*

**Cabecera (12 de octubre de 2026).** Un panel papel, bajito, arriba de la mesa. Nombres en IM Fell English SC de 13 px; números en Alfa Slab One de 28 px; la insignia MANO en añil (tuya) o gris (del rival).

**Lances como pasos.** Píldoras en IM Fell English SC de 12–13 px unidas por una raya fina: las jugadas con ✓, en gris sobre papel oscuro; la que se juega, almagre con texto papel y sombra dura; las que faltan, con borde discontinuo gris.

**La Cara (temple).** Una barra fina de 12 px con borde de tinta y tres zonas: almagre («te pillan», menos de 35), gualda («te creen», de 35 a 69) y verde («te temen», 70 o más). Lo que pasa de la marca se apaga con un velo de papel. La marca es una raya de tinta de 4 px que sobresale de la barra.
- A la izquierda, el **careto**: una cara redonda gualda clara con contorno de tinta. Serio si te creen, con media sonrisa y una ceja levantada si te temen, con boca torcida y una gota de sudor añil si te pillan (dos gotas a 0).
- Encima de la barra, *Tu Cara* en IM Fell English SC, lo que significa ahora en cursiva (*te creen: a veces cuela*) y el número en Alfa Slab One.
- A la derecha, «?» en un círculo de tinta: abre la ficha que explica la Cara.
- Cuando cambia, la cifra sube sobre la marca en una etiqueta verde (sube) o almagre (baja) con contorno de tinta, y se va.

**Acta de la mano (sustituye al bocadillo del rival, 12 de octubre de 2026).** Panel papel de radio 10 px con contorno de tinta, sombra dura de 4 px y una cola triangular de tinta hacia el retrato. Encima, una **pestaña** negra con el lance en IM Fell English SC papel, en mayúsculas y con interletraje amplio; en la esquina de arriba a la derecha, una **ficha** redonda almagre con lo que hay en juego (cifra en Alfa Slab One papel). Dentro, la partida contada: lo del rival en **IM Fell English SC almagre** de 23 px con su frase debajo en **cursiva** de 18 px; lo del jugador en **cursiva añil** de 17 px; lo que pasa en la mesa en IM Fell English de 15 px. Dentro del acta no se usa Alfa Slab.

**Etiqueta de estado del rival.** *¡ENFADADO!*, *OFENDIDA*: Alfa Slab One papel sobre almagre, girada −4° y con sombra dura, junto al retrato y solo mientras dura. (Sustituye a la etiqueta con el nombre, que se quitó el 11 de octubre de 2026.)

**Cartas.** Son las de `assets/cartas/`, con relación de aspecto 512 × 925.
- En la mano se abren en abanico con rotaciones de −9°, −3°, 3° y 9°, y sombra dura de 3–4 px.
- Las del rival van boca abajo, pequeñas y también en abanico.
- Al seleccionarlas para el descarte suben unos 20 px.

## La mesa viva (prototipo, 22 de octubre de 2026)

Lo que hace que Balatro parezca profesional no es su dibujo sino que **todo se mueve y todo suena**. La mesa viva aplica eso a Órdago sin cambiar su estilo de naipe impreso: mismas tintas, misma letra, mismos contornos y sombras duras. Se elige en la portada (*Mesa: nueva / viva / de antes*). El código está en `src/ui/componentes/MesaViva.tsx`, `FondoVivo.tsx` y `mesaViva.css`; el sonido, en `src/ui/sonido.ts`.

**Cartas.** Mazo (tres reversos apilados) a la izquierda del tapete y descartes (tres reversos revueltos) a la derecha, de 28 × 50. Cada carta sale del mazo con un muelle hasta su hueco del abanico; el reparto alterna rival y tú cada 0,12 s, y las tuyas se dan la vuelta al llegar. Mientras esperan flotan 3 px (cada una a su ritmo). Se inclinan hasta unos 12° hacia el puntero, suben 6 px y las cruza una franja de barniz de borde duro, recortada con la propia carta. Las elegidas para tirar suben 20 px y tiemblan ±1,3°. Las que se van vuelan girando a los descartes.

**Sellos.** Lo que se dice cae sobre el tapete, encima de las cartas del rival: panel con contorno de tinta de 3 px y sombra dura de 4 px; arriba, quién lo dice en IM Fell English SC (almagre el rival, añil tú); debajo, lo dicho en Alfa Slab One (21 px *MUS* y *PASO*, 28 px *QUIERO* y *ENVIDO*, 34 px los envites de 5 o más y las subidas). *ENVIDO* y *MÁS* en gualda, *QUIERO* en verde con letra papel, *CORTO* en tinta, *NO QUIERO* discontinuo y sin sombra. Entra desde 2,4 veces su tamaño, ladeado (−6° el rival, 5° tú), con una onda de tinta que se abre al caer.

**¡Órdago!** Fondo almagre al 90 % con los rayos de `04_ordago` girando despacio; «¡ÓRDAGO!» en Alfa Slab One de 56 px, papel con contorno y sombra dura de tinta, que cae desde tres veces su tamaño; debajo, en una cinta de tinta, quién lo tira. La mesa tiembla. Es el primer paso hacia la pantalla de órdago de las referencias.

**Piedras.** Amarracos de 18 px (gualda, contorno de tinta, sombra dura de 2 px) que vuelan en arco desde el centro del tapete hasta el número de quien cobra; el número salta (de 1,6 veces a su tamaño, en gualda oscuro) al llegar cada uno.

**La taberna.** La luz del quinqué tiembla. Un lienzo pinta motas de polvo que suben y brillan cerca de la luz, y un humo de papel muy suave; otro, unas pocas motas más gordas por delante del rival. Las esquinas, en sombra. Por encima de todo, un grano de imprenta al 10 %. Estos degradados son de ambiente, no de interfaz: paneles, botones y cartas siguen sin degradados ni sombras suaves.

**Rebotes.** Los botones nuevos, el selector de envite, cada línea nueva del acta y el panel del recuento entran con un pequeño rebote; en el recuento, las cartas se dan la vuelta de una en una y los cobros entran uno tras otro. El botón de órdago late cuando se puede tirar.

## La mesa nueva (prototipo, 22 de octubre de 2026)

La mesa viva con otra distribución: sin el acta a la vista. Lo que pasa lo cuentan los sellos, junto a quien habla, y las casillas de los lances. Código: `src/ui/componentes/MesaNueva.tsx` y `mesaNueva.css`; lo que enseña cada casilla sale de `src/estado/casillas.ts` (pura, con pruebas).

**De arriba abajo** (escenario de 390 × 844): la cabecera (sin los lances, que pasan al tapete); el rival, escalado 1,15 desde abajo y con la figura apoyada en el borde del tapete, que la tapa por la cintura; el tapete, un óvalo de 840 × 700 que empieza en y = 392, más ancho para que su borde sea casi recto bajo el rival; sus cartas en y = 414, entre el mazo y los descartes; las cuatro casillas en y = 478; tu mano en y = 616, y la barra de abajo.

**Casillas.** Cuatro de 88 × 72 con 6 px entre ellas. Por jugar: hueco de puntos de papel al 50 % sobre el tapete. La que se juega: papel, borde almagre de 3 px, sombra dura de 3 px, sube 4 px y late. Jugadas: papel de fondo con borde de tinta de 2 px. Dentro, el nombre del lance en IM Fell English SC de 13 px y lo que pasó en cursiva; lo envidado, un montoncito de amarracos (15 px) con la cifra en Alfa Slab One de 22 px. Quién lleva pares o juego: un círculo de 19 px en la esquina de arriba a la derecha (el rival, almagre si lo lleva) y otro en la de abajo (tú, añil); gris con ✗ si no. En el recuento, cada cobro cuelga del borde de abajo como un sello pequeño (Alfa Slab One de 15 px, papel sobre añil o almagre, contorno y sombra dura), uno cada 0,55 s desde los 0,7 s; lo que ya no se llegó a cobrar, en gris tachado.

**Sellos junto a quien habla.** El del rival a la izquierda, bajo su retrato (y = 342); el tuyo a la derecha, encima de tus cartas (y = 568). Más pequeños que en la mesa viva (17, 22 y 26 px). Al acabar el lance se quedan 1,2 s y vuelan, encogiéndose, a su casilla.

**Golpe de sello** (las dos mesas). Baja 34 px desde 1,3 veces su tamaño, ya entero; a los 0,15 s toca la mesa: se aplasta al 93 %, la sombra pasa de 10 × 12 px clara a pegada y vuelve a 4 px, se abre una onda de tinta, suena y, si es fuerte, tiembla la mesa. Sin rebotes. Lleva el doble marco de un sello de goma.

**Bocadillo.** Papel, contorno de 3 px, radio de 14 px, sombra dura y cola hacia la cara; IM Fell English en cursiva de 15 px. Arriba a la derecha del rival, 150 px de ancho. «…» en Alfa Slab One mientras piensa.

**Avisos.** Tira de gualda claro con contorno de 2 px y sombra dura, bajo el marcador, entre la bolsa y SALIR para no taparlos; IM Fell English de 13 px.

**≡.** Botón redondo de papel de 44 px a la izquierda, entre las casillas y tu mano; abre el acta entera en un panel.

## Icono de la aplicación (12 de octubre de 2026)

La moneda de oros (`public/arte/palos/oros.webp`) sobre el color de la taberna (`#2A1F18`), en un cuadrado. `npm run iconos` (`scripts/iconos.mjs`) escribe en `public/iconos/`:

- `icono-180.png` para el iPhone (iOS le redondea las esquinas) y `icono-192.png` e `icono-512.png` para Android, con la moneda ocupando el 80 %;
- `icono-512-mascara.png`, el adaptable de Android, con la moneda al 62 % para que ningún recorte (círculo, gota, cuadrado) la corte;
- `icono-32.png`, la pestaña del navegador, sin fondo.

## Pantallas (ver `referencias/pantallas/`)

1. **Título** (`01_titulo`): papel, doble marco de tinta, logotipo grande y los cuatro reyes en abanico. Botones: NUEVA GIRA (gualda), Continuar, Libreta y Ajustes.
2. **La gira** (`02_mapa_gira`): mapa ilustrado con un medallón por etapa. Las vencidas van en gris y tachadas, la actual con anillo gualda y la etiqueta «AQUÍ ESTÁS», y las futuras con «?». El casino final va en negro y oro. Arriba a la derecha, el estado de la gira: Honra, Reales, Cara y compañero.
3. **La mesa** (`03_mesa`):
   - Fondo de taberna con un tapete ovalado verde rodeado de madera.
   - El rival va arriba en el centro: es lo más importante de la pantalla.
   - A la izquierda: lances, marcador, Cara y compañero.
   - A la derecha: lo que está en juego y los botones de apuesta.
   - Abajo: tu mano.
4. **¡Órdago!** (`04_ordago`): pantalla almagre con rayos, el texto «¡ÓRDAGO!» gigante con sombra dura, el rival en el centro, tu jugada a la izquierda, lo que está en juego a la derecha y una barra de tensión debajo.
5. **La taberna** (`05_taberna`): tabernera a la izquierda, dos baldas de madera (bebidas y amuletos) con etiquetas de papel ladeadas, y la bolsa del jugador a la derecha.

**En vertical (13 de octubre de 2026).** David eligió entre prototipos (`referencias/prototipos-gira/`) y así están en el juego:

- **La portada:** en papel, el letrero grande y el lema en cursiva; debajo, los botones (el principal en gualda).
- **Elegir compañero (C):** cartas de papel con su marcador, el nombre en letra gruesa y, en versalitas almagre, *Siempre* y *Su seña*; la elegida, con anillo gualda. Abajo, los que faltan, con «?» en círculos de puntos.
- **El mapa (A1):** como las arenas de Clash Royale. La arena en curso de arriba abajo en su color (la facultad, ocre de piedra de Salamanca con su edificio de arcos); los niveles, discos sobre un camino punteado de tinta; la siguiente arena arriba, en madera con niebla de papel y cinta negra. Cintas en almagre con el nombre de la arena. La barra de la gira (Honra en bolitas almagre, reales con la moneda de oros, Cara y compañero) es la de las referencias.
- **La bolsa en la mesa (M3):** botón redondo gualda, arriba a la izquierda, con una cuenta en almagre; al abrirla, un panel de papel que sube desde abajo. *SALIR* va enfrente, discreto, con borde de puntos.
- **Después del duelo (R):** el resultado en letra gruesa (verde si ganas, almagre si pierdes), la cuenta de reales en un panel, tres cajitas con reales, Honra y Cara, la Libreta como hoja de cuaderno con renglones azules y las tres paradas como botones de papel.
- **La taberna (T1):** la de las referencias, en vertical: las baldas arriba, la ficha de lo que tocas en medio y tu bolsa abajo.
- **La plaza, la era, el premio y el final:** una ficha de papel en el centro, con el lugar en versalitas almagre.

## Personajes

**Desde cero (14 de octubre de 2026).** David ha decidido no reutilizar los dibujos de antes (las hojas en 3D de los cinco primeros rivales): se han borrado del proyecto y, hasta que estén los nuevos, todos los personajes salen con el marcador. Cómo se hacen los nuevos, paso a paso y con las peticiones para la IA, está en **[Cómo hacer los personajes](personajes.md)** (también en PDF). Los de antes siguen en el historial de git (el último commit que los tiene es d36d39c). Las carpetas usan el id del código: `lucia`, `chema`, `ruperto` para Agustín, `fulgencio` para Aurelio…

**Estilo: el de Chema (15 de octubre de 2026).** David hizo a Chema y es el primero en el juego: ilustración 2D de cómic, con línea de tinta negra, colores planos con un sombreado suave y caricatura cálida (mofletes y nariz sonrosados). Su reposo (`assets/personajes/chema/reposo.webp`) es la imagen de referencia de estilo para los demás. Todo personaje pasa por la imprenta antes de entrar en el juego para que case con el naipe y los paneles.

**Chema en el juego.** Ocho imágenes: reposo, sus dos tics (se baja las gafas, bebe el refresco), crecido, arrugado, sorprendido, riendo y enfadado. Sin parpadeo (a David no le hace falta). En el mapa, su cara va en el disco del jefe.

**Lo que llega de cada personaje** (detalle en la guía):

- una imagen por pose, en PNG o WebP, **apaisada como las de Chema** (1448 × 1086 o más);
- el mismo encuadre en todas: de codos sobre la mesa, de frente, con la cabeza a la misma altura y del mismo tamaño;
- fondo transparente;
- reposo, una por tic, las caras (sorprendido, riendo, enfadado) y, en Rubén y Chema, crecido y arrugado. El parpadeo, no hace falta. Un tic con movimiento puede llegar en dos imágenes.

### La imprenta (`scripts/personajes.mjs`)

`npm run personajes` lee las imágenes de `assets/personajes/` y `assets/personajes/personajes.json` (de dónde sale cada animación) y escribe `public/arte/personajes/`: los fotogramas, el `manifiesto.json` de cada uno y el `indice.json`, que dice quién tiene dibujo y quién, cara para el mapa.

**Una imagen por pose (15 de octubre de 2026).** En `personajes.json`, cada personaje dice qué archivo es cada animación (`imagenes`), por qué fila se corta (`corte`: lo de debajo lo tapa el acta) y de qué cuadro sale la cara del mapa (`medallon`). Cada imagen se ajusta al ancho del **fotograma de 310 × 236 px de pantalla** (×3: 930 × 708), se centra y se apoya abajo, y pasa por la **imprenta ligera**: tinta en lugar de negro, papel en lugar de blanco, color templado, grano suave, contorno de tinta de 3 px y sombra dura de 4 px, sin tonos planos. Con `--crudo carpeta` saca cada fotograma sin imprenta y con una regla.

*Las hojas de antes* (todas las poses en una imagen) seguían los pasos de abajo, que el script todavía sabe hacer. Si una imagen llega pequeña, se amplía ×4 con **Real-ESRGAN** (modelo `realesrgan-x4plus-anime`, pensado para ilustración: deja las líneas limpias y el sombreado plano):

`realesrgan-ncnn-vulkan -i imagen.png -o imagen_x4.png -n realesrgan-x4plus-anime`

Para cada fotograma:

1. **Recorte:** se quita el fondo y se limpian los huecos entre brazo y cuerpo. (Con las hojas ampliadas, la silueta se sacaba de la original para que no se colara el halo claro que deja la ampliación.)
2. **Encuadre:** de cintura para arriba, en un cuadrado de 660 px (220 px de pantalla ×3). La cabeza va siempre en el mismo sitio: centrada y a 40 px del borde de arriba.
3. **Retoques** pintados, si los hay (ver abajo).
4. **Tonos planos:** la luminosidad se reparte en escalones de 12 (de 0 a 100), con una transición corta para que no queden bordes dentados.
5. **Tinta y papel:** el negro más oscuro pasa a negro de humo y el blanco más claro a papel; el color se apaga un 10 % y se tiñe un poco hacia la tinta en las sombras y hacia el papel en las luces.
6. **Grano de impresión** suave, el mismo en todos los fotogramas para que no «hierva» al cambiar de pose.
7. **Contorno de tinta de 3 px y sombra dura de 4 px** abajo a la derecha (en px de pantalla), como los paneles. El corte de abajo no lleva contorno: lo tapa el acta. Antes se quitan las motas sueltas para que no salgan con su propio contorno.

Los pasos 4 a 6 se pensaron para quitarle a un 3D el aspecto de 3D; con los dibujos de ahora, que ya traen su línea de tinta, sobran los tonos planos (es la imprenta ligera de arriba). Los números están al principio del script (`IMPRENTA`) y en `personajes.json`. Con `--crudo carpeta` saca cada fotograma sin imprenta y con una regla, para medir dónde va un retoque.

### Retoques: animaciones pintadas sobre el dibujo

Lo que no está en las imágenes se puede pintar sobre el reposo, antes de la imprenta, para que salga con los mismos tonos, grano y contorno (`scripts/personajes/retoques.mjs`, coordenadas en píxeles del fotograma). Con una imagen por pose hecha por la IA, deberían quedar para lo pequeño:

- **párpado:** baja el párpado de arriba (medio o del todo). Sirve para el parpadeo si no llega la imagen con los ojos cerrados.
- **mirada:** repinta el blanco del ojo y mueve el iris.
- **girar:** inclina la cabeza deformando suavemente alrededor, sin cortes.
- **mover:** recorta una zona, la mueve y la gira, y pinta lo que queda al descubierto.
- **dibujo:** formas SVG encima o debajo de la figura, con una zona que queda por delante.
- **acercar:** agranda la figura alrededor de un punto: el rival se inclina hacia ti.
- **arrastrar:** lleva una parte de un sitio a otro deformando lo de alrededor. Solo para movimientos pequeños: en los brazos se nota.
- **desplazar:** mueve la figura entera (un bote, por ejemplo).
- **plantilla:** una lista de retoques con nombre, que se reutiliza en varios fotogramas.

### En la mesa

- El rival va **suelto**, sin marco, de cintura para arriba sobre la pared de la taberna, con la luz del quinqué detrás. El acta tapa el corte de la figura y su cola le apunta.
- **Respira:** se ensancha un pelo desde abajo y vuelve, cada 3,8 s (se quita con «reducir movimiento»).
- **Parpadea** cada 2,6–6,2 s, nunca durante un tic.
- **Tic dibujado:** cambio de pose con un fundido de 0,18 s, sin texto; si tiene varios fotogramas, se reproducen y se queda en el último. Al acabar, vuelve al reposo con otro fundido.
- **Efectos** encima del personaje, solos o con un tic dibujado: el **humo** (bocanadas de papel con contorno de tinta que suben) y el **destello** (una estrella de papel con contorno de tinta que gira y se apaga dos veces). Se hicieron para el puro de Don Rodrigo y el diente de oro de Aurelio, y siguen en el código.
- **Tic sin dibujo:** la figura (o el marcador) se sacude y sale la acotación con el gesto.
- **Postura y cara** (15 de octubre de 2026): por debajo del tic, se ve la cara que acaba de poner (sorprendido, riendo, enfadado, unos 2,4 s; al acabar el duelo, se queda) o, si no, su postura (crecido, arrugado, enfadado) o, si no, el reposo. Todas las imágenes están puestas a la vez y cambian con un fundido de 0,18 s: la que entra aparece encima y la que se va se queda debajo hasta que acaba, para que la figura no se transparente.
- **El recuadro** mide 310 × 236 (antes 220 × 220) y se apoya en el acta.
- Si un rival no está en `indice.json`, se usa el marcador (ARTE PENDIENTE), más estrecho para no llegar a la bolsa ni a SALIR.

### El manifiesto

Cada personaje tiene `public/arte/personajes/<id>/manifiesto.json` con sus animaciones: `reposo` (obligatoria), `parpadeo` (opcional) y una por tic (`tic_<id del tic>`). Cada animación es una hoja de sprites horizontal o una secuencia de WebP (con fotogramas por segundo y si va en bucle), y puede llevar un `efecto` encima; o es solo un efecto (`{ "tipo": "efecto", "efecto": "humo", "x", "y" }`, con la posición en fracciones del fotograma). Lo genera la imprenta. `pruebas/personajes.test.ts` comprueba que los archivos existen y que cada tic es un tic del rival. Los de antes pesaban entre 220 y 600 KB por rival, y solo se carga el del duelo.

Las caras también servirán para la pantalla de ¡Órdago! cuando se haga.
