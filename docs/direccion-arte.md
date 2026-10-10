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
| Personajes (rivales, compañeros, tabernera) | **PENDIENTE** | usar marcadores |
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

**Paneles.** Fondo papel, borde de 3 px negro de humo, radio de 6–8 px. Los paneles importantes llevan una sombra dura desplazada (3–4 px abajo a la derecha, negro de humo, sin difuminar). Nunca degradados ni sombras suaves en la interfaz.

**Botones de apuesta.** Alfa Slab One de 20–24 px, borde de 3 px, radio de 10 px y sombra dura de 3 px.
- PASO y QUIERO: fondo papel.
- ENVIDO / ENVIDO MÁS: fondo gualda.
- NO QUIERO: fondo papel con borde **discontinuo** y sin sombra, porque es rendirse.
- ¡ÓRDAGO!: fondo almagre, texto papel, contorno doble (borde de tinta más un anillo almagre separado 3 px). Es más grande y está separado del resto. Se activa **deslizando hacia arriba**, con el texto «desliza hacia arriba para tirarlo» debajo.
- Al pulsar, el botón baja 3 px y la sombra desaparece.

**Piedras y amarracos.** El amarraco es un círculo gualda de unos 22–34 px con borde de tinta y vale 5 piedras. La piedra suelta es un óvalo nogal pequeño. El marcador muestra amarracos más piedras y el número a la derecha.

**Lances.** Fila con «Grande · Chica · Pares · Juego» en IM Fell English SC. El lance actual va subrayado con una barra almagre de 4 px. Los ya jugados van en gris y tachados.

**La Cara (temple).** Es una barra de 20 segmentos con borde de tinta, radio de 7–10 px y sombra dura.
- Zonas: segmentos 1–7 almagre («te pillan», menos de 35), 8–14 gualda («te creen», de 35 a 70) y 15–20 verde claro («te temen», más de 70).
- Los segmentos por encima del valor actual se pintan en versión clara.
- Encima va un marcador: una etiqueta con el número en Alfa Slab One y un triángulo de tinta que apunta a la posición.
- Debajo van las tres etiquetas de zona, en IM Fell English SC con el color de su zona.

**Bocadillo del rival.** Panel papel de radio 14 px con sombra dura y una cola triangular de tinta hacia el retrato. Lleva la acción en Alfa Slab One almagre («ENVIDO DOS») y la frase en cursiva.

**Etiqueta de nombre del rival.** Alfa Slab One sobre gualda, girada −4° y con sombra dura.

**Cartas.** Son las de `assets/cartas/`, con relación de aspecto 512 × 925.
- En la mano se abren en abanico con rotaciones de −9°, −3°, 3° y 9°, y sombra dura de 3–4 px.
- Las del rival van boca abajo, pequeñas y también en abanico.
- Al seleccionarlas para el descarte suben unos 20 px.

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

## Personajes (pendiente)

El estilo de los personajes **no está decidido**. Implementa un sistema que acepte cualquier arte:

- Cada personaje está en `public/arte/personajes/<id>/`, con un `manifiesto.json` que declara sus animaciones (hoja de sprites o secuencia de WebP, fotogramas por segundo y si es en bucle). Debe tener al menos `reposo`, `parpadeo` y una por tic (`tic_<nombre>`).
- Si no hay arte, se usa el marcador y el tic se señala con un efecto genérico (sacudida, destello y el nombre del tic en pantalla en modo depuración).
- Los rivales van **sueltos**, sin marco de carta, recortados sobre el fondo.
