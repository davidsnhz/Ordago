# Órdago — instrucciones del proyecto

Órdago es un roguelike de duelos de mus 1 contra 1 para móvil en vertical, sin conexión. El jugador recorre los pueblos de Castilla desafiando a rivales con personalidad. Se gana leyendo sus tics, envidando, aceptando y faroleando.

## Documentos (léelos antes de escribir código)

- `docs/diseno-juego.md` — **reglas y sistemas**: mus a 8 reyes y a 20 piedras, apuestas, la Cara, tics, Libreta, compañeros, objetos, los 5 rivales, la IA y el plan de prototipo. Es la fuente de verdad del diseño de juego y **el documento que explica el proyecto**. Su versión en PDF es `docs/Órdago — Documento de diseño.pdf`.
- `docs/gira.md` — **el contenido de la gira**: las 5 arenas con sus 4 niveles (tres secuaces y su jefe), la taberna, la plaza, los objetos (también los que van contra el rival) y los compañeros. Es el catálogo de ideas que David va cambiando; las reglas de fondo siguen en `diseno-juego.md`. Su PDF es `docs/Órdago — La gira.pdf`.
- **Regla fija:** cada cambio del proyecto (reglas, números, interfaz, fases) se refleja en `docs/diseno-juego.md` (o en `docs/gira.md`, si es contenido de la gira) en la misma tarea, marcado con [nuevo] o [cambiado], y se regeneran los PDF con `npm run documento`.
- `docs/personajes.md` — **cómo hacer los personajes** con IA (ficha, estilo, bocetos, diseño final y poses), para David. Su PDF es `docs/Órdago — Cómo hacer los personajes.pdf`.
- `docs/direccion-arte.md` — **aspecto visual**: tintas, tipografías, piezas de mesa y pantallas. Manda sobre cualquier mención al arte en el otro documento.
- `referencias/pantallas/*.png` y `*.html` — estilo de cada pantalla (tintas, letra, piezas). Se hicieron en horizontal (1280 × 590); desde el 10 de octubre de 2026 el juego es **vertical** y la maquetación se adapta (ver `docs/decisiones.md`, «Cambio a vertical»).
- `assets/` — baraja definitiva, palos, logotipo y fuentes.

Si algo de los documentos es ambiguo o contradictorio, no lo inventes en silencio: elige la opción más fiel al mus tradicional, anótala en `docs/decisiones.md` y avísame.

## Tecnología

- **Plataforma: navegador.** Debe funcionar en Chrome, Safari y Firefox de escritorio y de móvil, con orientación vertical. Más adelante se empaquetará para móvil (por ejemplo con Capacitor), así que nada debe depender de APIs exclusivas de escritorio.
- **TypeScript estricto + Vite + React.** La interfaz se hace con componentes React y CSS, reproduciendo los HTML de `referencias/pantallas/`.
- **Animación:** CSS y Framer Motion para la interfaz. Los retratos y tics de los personajes van con hojas de sprites o secuencias WebP en un componente propio. No hace falta canvas ni motor de juego salvo que haya un motivo claro; si lo hay, propónlo antes.
- **Escalado:** el escenario es vertical, de 390 × 844, y se escala entero para encajar en la ventana, con bandas si sobra espacio (en ordenador se ve centrado, como un móvil). Si el móvil está en horizontal, se muestra un aviso para girarlo. Zonas táctiles de al menos 44 px y márgenes seguros para el notch.
- **Sin conexión:** PWA con service worker que precachea todo. Sin servidor, sin anuncios y sin cuentas.
- **Guardado:** `localStorage` o IndexedDB, en JSON versionado, al final de cada mano. Si falla el almacenamiento, el juego sigue funcionando.
- **Pruebas** con **Vitest**. Toda la lógica de reglas e IA es TypeScript puro y se prueba sin interfaz.
- **Despliegue:** build estática (`npm run build`) publicable en GitHub Pages, Netlify o Vercel.

## Arquitectura

Separa la lógica del juego de la presentación:

```
src/
  nucleo/            # TypeScript puro, sin React ni DOM
    baraja.ts, carta.ts, mano.ts
    lances.ts        # Grande, Chica, Pares, Juego, Punto: evaluar y comparar
    apuestas.ts      # envido, quiero, no quiero, más, órdago, en paso
    duelo.ts         # máquina de estados de un duelo a 20 piedras
    recuento.ts
    azar.ts          # generador con semilla: partidas reproducibles en pruebas
    ia/              # fuerza de mano, decisiones, memoria, tics
  datos/             # rivales, compañeros, objetos y equilibrio en JSON o TS de solo datos
  ui/
    componentes/     # panel, botones, órdago de pulsación larga, lances, Cara, acta, carta
    pantallas/       # portada, mesa (con la bolsa), Libreta; gira/: mapa, taberna, plaza, resultado…
    estilos/         # tokens de la guía de estilo como variables CSS
  estado/            # la partida (un duelo), la gira (gira.ts: arenas, paradas, Honra, reales, bolsa),
                     # la Libreta (libreta.ts), el guardado y los hooks que las conectan con la interfaz
public/
  arte/              # cartas, palos, marca, fuentes y personajes (estos los genera npm run personajes)
pruebas/
```

- Los números de equilibrio (umbrales, precios, parámetros de rivales, fiabilidad de tics) van en `datos/`, no en el código.
- Los efectos de compañeros y objetos se implementan como modificadores que se enganchan a eventos del duelo (reparto, declaración, envite, recuento, fin de duelo). Así se añaden sin tocar el núcleo.
- La IA no ve las cartas del jugador, salvo las reglas especiales anunciadas en el documento.
- El azar siempre pasa por `azar.ts`, con semilla, para poder repetir una partida exacta.

## Arte

- La **baraja** está terminada en `assets/cartas/`, con el nombre `NN_palo.webp` (WebP sin pérdida): 01–07, 10 = sota, 11 = caballo y 12 = rey, más `reverso_almagre` y `reverso_anil`. Úsala tal cual.
- La interfaz debe reproducir `docs/direccion-arte.md`: paneles de papel con contorno de tinta y sombra dura, sin degradados. Construye primero los componentes reutilizables: panel, botón de apuesta, botón de órdago (se mantiene pulsado), marcador, fila de lances, barra de la Cara y acta de la mano.
- **Personajes desde cero (14 de octubre de 2026).** David borró los dibujos de antes y los hace de nuevo con la guía `docs/personajes.md`. **Chema ya está** (15 de octubre): marca el estilo, el encuadre (apaisado, de codos sobre la mesa) y la lista de poses (reposo, tics, crecido, arrugado, sorprendido, riendo, enfadado; sin parpadeo). Los demás salen con el marcador. Las imágenes van en `assets/personajes/<id>/` (una por pose) y `npm run personajes` las pasa por la imprenta a `public/arte/personajes/`; qué imagen es cada animación, por dónde se cortan y de dónde sale la cara del mapa va en `assets/personajes/personajes.json`. Ver «Personajes» en la dirección de arte.
- **Compañeros, tabernera e iconos de objetos también siguen pendientes:** usa marcadores. El arte de un personaje sale siempre de las imágenes de David: se puede ampliar, recortar y retocar (párpados, miradas, objetos que pide su ficha), pero no inventar un personaje.

## Orden de trabajo

Sigue el plan de prototipo del documento y no avances de fase sin que la anterior funcione y tenga pruebas:

1. **Motor de mus** con pruebas exhaustivas: orden de cartas a 8 reyes, pares, juego (31 > 32 > 40 > 37 > … > 33), punto, empates para el que es mano, piedras en paso, «no quiero» y recuento en orden de lances, con victoria a 20 a mitad de recuento.
2. **Un duelo jugable** contra Agustín (antes, Ruperto), con interfaz de la guía, tics como efectos de marcador, envites y órdago.
3. **IA completa y la Cara**, con los cinco rivales. Añade un modo de depuración que muestre la fuerza F y la decisión de la IA.
4. **Estructura de gira** (hecha): la primera arena completa (3 secuaces y su jefe) con taberna, 5 objetos y 2 compañeros.
5. **Pantallas** de título, mapa, órdago y taberna, más sonido provisional.
6. **Resto del contenido** y progresión.

Los botones Rival y Depurar son herramientas del modo de pruebas (`npm run dev` o `?pruebas` en la dirección); el juego normal no los enseña.

Al acabar cada fase, deja el juego funcionando con `npm run dev` en el navegador y resume qué funciona, qué falta y qué decisiones tomaste.

## Idioma

- La interfaz y los textos del juego van en español de España.
- En el código, los términos del mus van en español (`lance`, `envite`, `ordago`, `piedras`, `mano`) para que coincidan con los documentos. Lo técnico genérico puede ir en inglés.
- Los textos visibles van en un archivo de textos (`src/textos/es.ts`) para poder añadir otros idiomas.
