# Órdago — instrucciones del proyecto

Órdago es un roguelike de duelos de mus 1 contra 1 para móvil en horizontal, sin conexión. El jugador recorre los pueblos de Castilla desafiando a rivales con personalidad. Se gana leyendo sus tics, envidando, aceptando y faroleando.

## Documentos (léelos antes de escribir código)

- `docs/diseno-juego.md` — **reglas y sistemas**: mus a 8 reyes y a 20 piedras, apuestas, la Cara, tics, Libreta, compañeros, objetos, los 5 rivales, la IA y el plan de prototipo. Es la fuente de verdad del diseño de juego.
- `docs/direccion-arte.md` — **aspecto visual**: tintas, tipografías, piezas de mesa y pantallas. Manda sobre cualquier mención al arte en el otro documento.
- `referencias/pantallas/*.png` y `*.html` — cómo debe verse cada pantalla. Los HTML son la especificación exacta de medidas y colores, a 1280 × 590.
- `assets/` — baraja definitiva, palos, logotipo y fuentes.

Si algo de los documentos es ambiguo o contradictorio, no lo inventes en silencio: elige la opción más fiel al mus tradicional, anótala en `docs/decisiones.md` y avísame.

## Tecnología

- **Plataforma: navegador.** Debe funcionar en Chrome, Safari y Firefox de escritorio y de móvil, con orientación horizontal. Más adelante se empaquetará para móvil (por ejemplo con Capacitor), así que nada debe depender de APIs exclusivas de escritorio.
- **TypeScript estricto + Vite + React.** La interfaz se hace con componentes React y CSS, reproduciendo los HTML de `referencias/pantallas/`.
- **Animación:** CSS y Framer Motion para la interfaz. Los retratos y tics de los personajes van con hojas de sprites o secuencias WebP en un componente propio. No hace falta canvas ni motor de juego salvo que haya un motivo claro; si lo hay, propónlo antes.
- **Escalado:** el escenario mide 1280 × 590 y se escala entero para encajar en la ventana, con bandas si sobra espacio. Si el móvil está en vertical, se muestra un aviso para girarlo. Zonas táctiles de al menos 44 px y márgenes seguros para el notch.
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
    gira/            # etapas, paradas, Honra, reales, Cara, Libreta
  datos/             # rivales, compañeros, objetos y equilibrio en JSON o TS de solo datos
  ui/
    componentes/     # panel, botones, órdago deslizable, piedras, lances, Cara, bocadillo, carta
    pantallas/       # título, mapa, mesa, órdago, taberna
    estilos/         # tokens de la guía de estilo como variables CSS
  estado/            # estado global de la partida y conexión núcleo ↔ interfaz
public/
  arte/              # cartas, palos, marca, fuentes, personajes (marcadores por ahora)
pruebas/
```

- Los números de equilibrio (umbrales, precios, parámetros de rivales, fiabilidad de tics) van en `datos/`, no en el código.
- Los efectos de compañeros y objetos se implementan como modificadores que se enganchan a eventos del duelo (reparto, declaración, envite, recuento, fin de duelo). Así se añaden sin tocar el núcleo.
- La IA no ve las cartas del jugador, salvo las reglas especiales anunciadas en el documento.
- El azar siempre pasa por `azar.ts`, con semilla, para poder repetir una partida exacta.

## Arte

- La **baraja** está terminada en `assets/cartas/`, con el nombre `NN_palo.webp` (WebP sin pérdida): 01–07, 10 = sota, 11 = caballo y 12 = rey, más `reverso_almagre` y `reverso_anil`. Úsala tal cual.
- La interfaz debe reproducir `docs/direccion-arte.md`: paneles de papel con contorno de tinta y sombra dura, sin degradados. Construye primero los componentes reutilizables: panel, botón de apuesta, botón de órdago deslizable, marcador de piedras, fila de lances, barra de la Cara y bocadillo.
- **Los personajes y los iconos de objetos están pendientes.** Usa marcadores y deja el sistema de retratos y tics preparado para recibir arte después (ver el final de la dirección de arte). No generes ni copies arte de personajes.

## Orden de trabajo

Sigue el plan de prototipo del documento y no avances de fase sin que la anterior funcione y tenga pruebas:

1. **Motor de mus** con pruebas exhaustivas: orden de cartas a 8 reyes, pares, juego (31 > 32 > 40 > 37 > … > 33), punto, empates para el que es mano, piedras en paso, «no quiero» y recuento en orden de lances, con victoria a 20 a mitad de recuento.
2. **Un duelo jugable** contra Ruperto, con interfaz de la guía, tics como efectos de marcador, envites y órdago.
3. **IA completa y la Cara**, con los cinco rivales. Añade un modo de depuración que muestre la fuerza F y la decisión de la IA.
4. **Estructura de gira**: una comarca completa con taberna, 5 objetos y 2 compañeros.
5. **Pantallas** de título, mapa, órdago y taberna, más sonido provisional.
6. **Resto del contenido** y progresión.

Al acabar cada fase, deja el juego funcionando con `npm run dev` en el navegador y resume qué funciona, qué falta y qué decisiones tomaste.

## Idioma

- La interfaz y los textos del juego van en español de España.
- En el código, los términos del mus van en español (`lance`, `envite`, `ordago`, `piedras`, `mano`) para que coincidan con los documentos. Lo técnico genérico puede ir en inglés.
- Los textos visibles van en un archivo de textos (`src/textos/es.ts`) para poder añadir otros idiomas.
