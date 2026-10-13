# Órdago — Dirección de arte

Este documento manda sobre cualquier mención al arte en `diseno-juego.md`. Las capturas de `referencias/pantallas/` muestran cómo debe verse cada pantalla. Sus HTML son la especificación exacta de medidas, colores y tipos.

## Qué está cerrado y qué no

| Parte | Estado | Fuente |
| --- | --- | --- |
| Baraja (40 cartas + 2 reversos) | **Cerrada** | `assets/cartas/` |
| Palos sueltos y logotipo | **Cerrado** | `assets/palos/`, `assets/marca/` |
| Tintas (paleta) | **Cerrada** | esta guía |
| Tipografías | **Cerradas** | `assets/fuentes/` |
| Piezas de mesa: botones, piedras, lances, Cara, paneles | **Cerradas** | esta guía + `00_guia_estilo` |
| Maquetación de pantallas | **Cerrada como referencia** | `referencias/pantallas/01–05` |
| Rivales (los cinco del juego) | **Cerrado el estilo**. **Diseños por rehacer desde cero** (13 de octubre de 2026); hasta entonces, los dibujos de ahora | `assets/personajes/` → `npm run personajes` |
| Compañeros, secuaces y tabernera | **PENDIENTE** | usar marcadores |
| Iconos de objetos de taberna | **PENDIENTE** | usar marcadores |
| Mapa ilustrado | Provisional | `referencias/pantallas/img/mapa.webp` |

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

| Fuente | Archivo | Uso |
| --- | --- | --- |
| Alfa Slab One | `AlfaSlabOne-Regular.ttf` | lo que se grita en la mesa: títulos, botones, cifras, «¡ÓRDAGO!» (siempre en mayúsculas) |
| IM Fell English SC | `IMFellEnglishSC-Regular.ttf` | rótulos, lances, menús, marcadores, etiquetas (versalitas, interletraje amplio) |
| IM Fell English (cursiva) | `IMFellEnglish-Italic.ttf` | la voz de los rivales, refranes, descripciones |
| IM Fell English | `IMFellEnglish-Regular.ttf` | texto corrido |

Todas tienen licencia OFL (incluida en la carpeta).

## Piezas de mesa

Las medidas están en píxeles del escenario de referencia (1280 × 590). Pasa estos valores a variables CSS en `src/ui/estilos/`.

> **Desde el 10 de octubre de 2026 el juego es vertical (390 × 844).** Tintas, letra y piezas siguen igual; la maquetación de las pantallas cambia y las medidas se reducen en proporción. El marcador muestra solo los números (sin amarracos) y el órdago se tira manteniéndolo pulsado. Ver `docs/decisiones.md`, «Cambio a vertical».

**Paneles.** Fondo papel, borde de 3 px negro de humo, radio de 6–8 px. Los paneles importantes llevan una sombra dura desplazada (3–4 px abajo a la derecha, negro de humo, sin difuminar). Nunca degradados ni sombras suaves en la interfaz.

**Botones de apuesta.** Alfa Slab One de 20–24 px, borde de 3 px, radio de 10 px y sombra dura de 3 px.
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

## Personajes

**Diseños desde cero (13 de octubre de 2026):** David va a diseñar de nuevo a todos los personajes, también a los cinco que ya están en el juego. Además, les ha cambiado el nombre: Ruperto pasa a ser Agustín; Doña Engracia, Doña Ignacia; Don Anselmo, Don Francisco; Fulgencio, Aurelio, y Don Bonifacio, Don Rodrigo. Lo que se cuenta abajo (la imprenta, los retoques, el manifiesto) vale igual para los dibujos nuevos. Lo que se dice de cada personaje es de los dibujos de ahora, que se usan hasta que estén los nuevos. Las carpetas siguen con los nombres antiguos (`ruperto/`, `engracia/`…), que son sus ids en el código.

**Estilo (decidido el 11 de octubre de 2026):** ilustración en 3D de estilo de animación, la de las hojas de personaje de David (`assets/personajes/<id>/hoja.webp`). Para que no choque con el naipe impreso, **todo personaje pasa por la imprenta** antes de entrar en el juego. No se redibuja: se conserva su aspecto y se le aplica lo mismo que llevan las demás piezas.

### La imprenta (`scripts/personajes.mjs`)

`npm run personajes` lee las hojas y `assets/personajes/personajes.json` (qué zona de la hoja es cada pose y qué retoques lleva cada animación) y escribe `public/arte/personajes/`.

**Las hojas ampliadas.** Las hojas originales miden 1983 × 793 px: la figura de frente apenas tiene 300 px y las poses, 110. Por eso cada hoja se ha ampliado ×4 con **Real-ESRGAN** (modelo `realesrgan-x4plus-anime`, pensado para ilustración: deja líneas limpias y sombreado plano) y se guarda al lado como `hoja_x4.webp`. Si no está, se usa la original. Para rehacerla:

`realesrgan-ncnn-vulkan -i hoja.png -o hoja_x4.png -n realesrgan-x4plus-anime` (y pasarla a WebP).

Para cada fotograma:

1. **Recorte:** la silueta se saca de la hoja **original** (quita el fondo gris de estudio creciendo desde los bordes y limpia los huecos entre brazo y cuerpo); luego se amplía y se encoge medio píxel para recortar la hoja ampliada. Así no se cuela el halo claro que deja la ampliación alrededor de los bordes.
2. **Encuadre:** de cintura para arriba, en un cuadrado de 660 px (220 px de pantalla ×3). La cabeza va siempre en el mismo sitio: centrada y a 40 px del borde de arriba. Los tics se escalan por la altura de la figura (cabeza a pies) para que encajen con el reposo.
3. **Retoques** pintados, si los hay (ver abajo).
4. **Tonos planos:** la luminosidad se reparte en escalones de 12 (de 0 a 100), con una transición corta para que no queden bordes dentados.
5. **Tinta y papel:** el negro más oscuro pasa a negro de humo y el blanco más claro a papel; el color se apaga un 10 % y se tiñe un poco hacia la tinta en las sombras y hacia el papel en las luces.
6. **Grano de impresión** suave, el mismo en todos los fotogramas para que no «hierva» al cambiar de pose.
7. **Contorno de tinta de 3 px y sombra dura de 4 px** abajo a la derecha (en px de pantalla), como los paneles. El corte de abajo no lleva contorno: lo tapa el acta. Antes se quitan las motas sueltas para que no salgan con su propio contorno.

Los números están al principio del script (`IMPRENTA`) y en `personajes.json`; para retocar un personaje se cambia ahí y se vuelve a lanzar. Con `--crudo carpeta` saca cada fotograma sin imprenta y con una regla, para medir dónde va un retoque.

### Retoques: animaciones pintadas sobre el dibujo

Lo que no está en las hojas se pinta sobre el reposo, antes de la imprenta, para que salga con los mismos tonos, grano y contorno (`scripts/personajes/retoques.mjs`, coordenadas en píxeles del fotograma):

- **párpado:** baja el párpado de arriba (medio o del todo), con la piel de alrededor del ojo y una línea de pestañas curvada. Con él se hacen los **parpadeos** de los cinco (medio, cerrado, medio, a 18 fotogramas por segundo) y los ojos entornados.
- **mirada:** repinta el blanco del ojo y mueve el iris.
- **girar:** inclina la cabeza deformando suavemente alrededor, sin cortes.
- **mover:** recorta una zona, la mueve y la gira, y pinta lo que queda al descubierto (el pelo bajo el sombrero de Aurelio).
- **dibujo:** formas SVG encima o debajo de la figura, con una zona que queda por delante (los dedos que agarran la vara).
- **acercar:** agranda la figura alrededor de un punto: el rival se inclina hacia ti.
- **arrastrar:** lleva una parte de un sitio a otro deformando lo de alrededor. Sirve para movimientos pequeños; para juntar las manos de Don Francisco deformaba la cruz y la estola, y se descartó.
- **desplazar:** mueve la figura entera (el bote al golpear con la vara).
- **plantilla:** una lista de retoques con nombre, que se reutiliza (la vara y el diente de Aurelio salen en todos sus fotogramas).

Hechos así:

| Rival | Pintado sobre su dibujo |
| --- | --- |
| Los cinco | Parpadeo |
| Doña Ignacia | *Te mira fijamente:* entorna los ojos y se inclina hacia ti (antes era la pose con las cartas, que se confundía con la del rosario) |
| Aurelio | El diente de oro y la vara, en todos sus fotogramas. *Diente de oro:* entorna los ojos y le brilla el diente. *Se quita el sombrero:* lo levanta y lo ladea, con el pelo debajo. *Golpea la vara:* dos golpes con un bote |
| Don Rodrigo | *Mira al cielo:* pone los ojos en blanco hacia arriba y ladea la cabeza |

### En la mesa

- El rival va **suelto**, sin marco, de cintura para arriba sobre la pared de la taberna, con la luz del quinqué detrás. El acta tapa el corte de la figura y su cola le apunta.
- **Respira:** se ensancha un pelo desde abajo y vuelve, cada 3,8 s (se quita con «reducir movimiento»).
- **Parpadea** cada 2,6–6,2 s, nunca durante un tic.
- **Tic dibujado:** cambio de pose con un fundido de 0,18 s, sin texto; si tiene varios fotogramas, se reproducen y se queda en el último. Al acabar, vuelve al reposo con otro fundido.
- **Efectos** encima del personaje, solos o con un tic dibujado: el **humo** (bocanadas de papel con contorno de tinta que suben, para el puro de Don Rodrigo) y el **destello** (una estrella de papel con contorno de tinta que gira y se apaga dos veces, para el diente de oro de Aurelio).
- **Tic sin dibujo:** la figura se sacude y sale la acotación con el gesto, como con el marcador.
- Si un rival no está en `indice.json`, se usa el marcador (ARTE PENDIENTE).

### El manifiesto

Cada personaje tiene `public/arte/personajes/<id>/manifiesto.json` con sus animaciones: `reposo` (obligatoria), `parpadeo` (opcional) y una por tic (`tic_<id del tic>`). Cada animación es una hoja de sprites horizontal o una secuencia de WebP (con fotogramas por segundo y si va en bucle), y puede llevar un `efecto` encima; o es solo un efecto (`{ "tipo": "efecto", "efecto": "humo", "x", "y" }`, con la posición en fracciones del fotograma). Lo genera la imprenta. `pruebas/personajes.test.ts` comprueba que los archivos existen y que cada tic es un tic del rival. Pesan entre 220 y 600 KB por rival, y solo se carga el del duelo.

### Lo que falta

Quedan **tres gestos de brazos** que no están en ninguna hoja y no se pueden sacar deformando el dibujo sin que se note. Siguen con sacudida y acotación hasta que haya una pose dibujada:

| Rival | Pose que falta |
| --- | --- |
| Don Francisco | **Bebe un sorbo de vino** (no lleva vaso) y **junta las manos** (en el reposo las tiene separadas, para que el gesto se note) |
| Don Rodrigo | **Junta las manos** |

Para que encajen: la misma figura que la vista de frente, de cintura para arriba, misma luz y fondo gris liso, cambiando solo los brazos; si se saca retocando la vista de frente, mejor, para que no cambien el pelo ni los bordados.

También mejorarían con poses nuevas: los tics que salen de las miniaturas (la ampliación inventa algún detalle, como un brillo en la mejilla de Doña Ignacia al pasar el rosario) y Aurelio al quitarse el sombrero, que debería además «ponerse serio» y hoy sigue sonriendo.

Las seis expresiones de cada hoja (neutral, contento, enfadado…) no se usan todavía: servirán para la pantalla de ¡Órdago! y el final del duelo.
