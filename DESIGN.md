---
name: Reclutamiento Inteligente
description: Página de producto blanca y precisa, tinta azul noche, un solo azul de acción y Manrope en todo; las capturas del producto son el argumento.
colors:
  azul: "#2563eb"
  azul-hondo: "#1d4ed8"
  azul-texto: "#1d4ed8"
  azul-claro: "#eff6ff"
  verde: "#15803d"
  verde-claro: "#f0fdf4"
  ambar: "#b45309"
  ambar-claro: "#fffbeb"
  fondo: "#ffffff"
  fondo-2: "#f8fafc"
  superficie: "#ffffff"
  tinta: "#0f172a"
  texto: "#475569"
  apoyo: "#556274"
  borde: "#e2e8f0"
  borde-fuerte: "#cbd5e1"
  noche: "#0f172a"
  noche-borde: "#334155"
  noche-texto: "#cbd5e1"
  noche-apoyo: "#94a3b8"
typography:
  display:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 4.4vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  titulo-pagina:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 3.6vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.06
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 3vw, 2.6rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  bajada:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  dato:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.4
rounded:
  chip: "6px"
  sm: "8px"
  md: "10px"
  lg: "12px"
  tarjeta: "14px"
  marco: "16px"
  pildora: "999px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "18px"
  tarjeta: "22px"
  lg: "32px"
  xl: "48px"
  margen: "24px"
  seccion: "104px"
  seccion-movil: "68px"
components:
  button-primary:
    backgroundColor: "{colors.azul}"
    textColor: "{colors.fondo}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.azul-hondo}"
  button-secondary:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-small:
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "38px"
  input:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "46px"
  chip-sugerida:
    backgroundColor: "{colors.azul-claro}"
    textColor: "{colors.azul-texto}"
    rounded: "{rounded.chip}"
    padding: "5px 10px"
    typography: "{typography.label}"
  chip-confirmada:
    backgroundColor: "{colors.verde-claro}"
    textColor: "{colors.verde}"
    rounded: "{rounded.chip}"
    padding: "5px 10px"
    typography: "{typography.label}"
  chip-pendiente:
    backgroundColor: "{colors.fondo-2}"
    textColor: "{colors.apoyo}"
    rounded: "{rounded.chip}"
    padding: "5px 10px"
    typography: "{typography.label}"
  estado-revision:
    backgroundColor: "{colors.ambar-claro}"
    textColor: "{colors.ambar}"
    rounded: "{rounded.pildora}"
    padding: "4px 10px"
    typography: "{typography.label}"
  etiqueta-requisito:
    backgroundColor: "{colors.azul-claro}"
    textColor: "{colors.azul-texto}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  tarjeta-vacante:
    backgroundColor: "{colors.superficie}"
    rounded: "{rounded.tarjeta}"
    padding: "{spacing.tarjeta}"
  captura:
    backgroundColor: "{colors.superficie}"
    rounded: "{rounded.marco}"
  pestana-filtro:
    textColor: "{colors.texto}"
    padding: "0 16px"
    height: "44px"
  pestana-filtro-activa:
    textColor: "{colors.azul-texto}"
---

# Design System: Reclutamiento Inteligente

## Overview

**Creative North Star: "La ficha de evidencia"**

Una página de producto blanca, precisa y legible, en el estándar de la categoría (la vara es Ashby y Stripe). El sistema no decora: muestra el producto. Las capturas son interfaz real construida en HTML, a tamaño legible, con datos de ejemplo rotulados como tales, y el argumento visual es siempre el mismo: un requisito, su evidencia y su origen, con una persona que decide.

La densidad es media y ordenada: columnas de 1200px, filetes de 1px en lugar de sombras, una sola familia tipográfica jerarquizada por peso (800) y tracking negativo. El color es casi monocromo (blanco, gris pizarra, tinta azul noche); el único color con intención es un azul de acción, y verde y ámbar existen solo como estados. Una banda oscura de pizarra noche marca el momento del control humano.

Hay tema claro y oscuro con los mismos roles: el tema oscuro reasigna los valores de los tokens en `html[data-tema="oscuro"]`, nunca crea componentes propios. El movimiento es breve y con una sola curva de salida; con movimiento reducido todo aparece en su estado final.

**Key Characteristics:**
- Blanco y gris pizarra por secciones alternas, con filete de 1px entre ellas.
- Un solo azul de acción; verde y ámbar solo comunican estado.
- Manrope en todo, titulares en 800 con tracking negativo.
- Capturas de producto en HTML real, marco de 16px y sombra con desplazamiento.
- Tarjetas planas con borde que se tiñe de azul al pasar el cursor.
- Tema claro y oscuro sobre los mismos tokens.

## Colors

Paleta pizarra casi monocroma con un único azul de acción y dos colores de estado.

### Primary
- **Azul acción** (`azul`): fondo del botón primario, la línea bajo el enlace activo, la pestaña de filtro activa, la barra de progreso de etapa, el contador activo, el anillo de foco y la selección de texto. En oscuro conserva el mismo valor.
- **Azul hondo** (`azul-hondo`): el botón primario bajo el cursor.
- **Azul texto** (`azul-texto`): enlaces escritos en azul ("Ver y postular"), etiqueta activa, iniciales del avatar, texto de chips sugeridos. En oscuro sube a un azul claro legible (#93c5fd).
- **Azul claro** (`azul-claro`): fondo de etiquetas de requisito, chip "Sugerida", relación encendida y halo de foco de los campos.

### Secondary
- **Verde confirmación** (`verde`, `verde-claro`): solo "Confirmada", "Publicada" y barras de requisitos cumplidos.
- **Ámbar revisión** (`ambar`, `ambar-claro`): solo "En revisión", "Borrador" y cierres próximos ("Cierra mañana").

### Neutral
- **Blanco** (`fondo`, `superficie`): fondo de página y de tarjetas, paneles y formularios.
- **Gris pizarra** (`fondo-2`): secciones alternas, fondo de /vacantes y del acceso, barras y pies de las capturas.
- **Tinta azul noche** (`tinta`): titulares y texto fuerte.
- **Texto pizarra** (`texto`): párrafos.
- **Apoyo** (`apoyo`): datos secundarios, rutas, fechas, placeholders; elegido para cumplir AA sobre blanco y azul claro.
- **Filete** (`borde`) y **filete fuerte** (`borde-fuerte`): divisiones, bordes de tarjeta; el fuerte delimita botones secundarios, campos y los estados punteados de "pendiente".
- **Banda noche** (`noche`, `noche-borde`, `noche-texto`, `noche-apoyo`): la banda de control humano; titulares en blanco puro dentro de ella.

### Named Rules
**The One Blue Rule.** El azul es el único color de acción. Ningún botón, enlace ni selección usa otro tono.

**The State-Only Rule.** Verde significa confirmado; ámbar significa por revisar o por vencer; el borde punteado significa que falta evidencia. Nunca se usan como decoración ni como acento de sección.

**The Same Roles Rule.** El tema oscuro cambia valores, no roles: todo componente pinta con tokens, de modo que funcione en ambos temas sin reglas propias.

## Typography

**Display Font:** Manrope (con system-ui, sans-serif)
**Body Font:** Manrope
**Label/Mono Font:** Manrope; las cifras de conteos y fechas usan `font-variant-numeric: tabular-nums`.

**Character:** Una sola grotesca geométrica que hace todo el trabajo: 800 compacto y con tracking negativo para titulares, 400 a 700 para lectura y datos. La jerarquía sale del peso y del tamaño, no de una segunda familia.

### Hierarchy
- **Display** (800, clamp(2.4rem, 4.4vw, 3.75rem), 1.04, -0.035em): el titular de la portada, con `text-wrap: balance`.
- **Título de página** (800, clamp(2.1rem, 3.6vw, 3rem), 1.06, -0.035em): /vacantes y el acceso.
- **Headline** (800, clamp(1.9rem, 3vw, 2.6rem), 1.1, -0.03em): títulos de sección y de la banda.
- **Title** (800, 19px, 1.25, -0.01em): título de tarjeta de vacante; 20px para cabeceras de grupo y avisos; 24px para el título del panel de acceso.
- **Bajada** (400, 18px; 19px en la portada): párrafo de entrada, 34 a 60ch, `text-wrap: pretty`.
- **Body** (400, 16px, 1.55): texto corriente.
- **Dato** (400 a 700, 13 a 15px): filas de tablas, nombres de campos, pies de tarjeta; nunca bajo 12.5px.
- **Label** (700, 12px): chips de estado, contadores y cabeceras de tabla, siempre en minúscula de oración.

### Named Rules
**The One Family Rule.** Manrope en todo el sitio. Sin serif, sin monoespaciada, sin segunda familia de display.

**The Sentence-Case Rule.** Etiquetas, chips y cabeceras van en minúscula de oración con peso 700; no hay versalitas, mayúsculas espaciadas ni antetítulos sobre los títulos.

## Layout

Columna común de `min(1200px, 100% - 48px)` (32px de margen total bajo 720px); el acceso usa 1080px. Las secciones respiran con 104px verticales (68px en móvil) y alternan blanco y gris pizarra con filete superior e inferior. La portada es una rejilla de dos columnas (texto 1fr, captura 1.08fr, separación 64px) que se apila bajo 1024px; el texto llega primero.

El panel de etapas es una lista de 300px junto a una vista; bajo 1024px la lista pasa a cuatro columnas sobre la vista, y bajo 720px a dos. Las tablas de las capturas se reorganizan en móvil: cada requisito ocupa una fila y la evidencia y el estado quedan debajo, lado a lado.

En /vacantes la cuadrícula es `auto-fit, minmax(320px, 1fr)` con 18px de separación (dos columnas bajo 1100px, una bajo 720px). Las pestañas de modalidad se desplazan de lado en móvil con un borde difuminado que avisa que hay más.

Ritmo de espaciado: 6, 12, 18, 22, 32, 48px; el encabezado mide 68px (60px bajo 900px) y `scroll-padding-top` es 84px.

### Named Rules
**The Card-Becomes-Row Rule.** La tarjeta de vacante es un contenedor (`container-type: inline-size`): cuando un grupo tiene pocas vacantes y la tarjeta supera 720px, se convierte en una fila de tres zonas (título y lugar, requisitos, pie con filete vertical). La tarjeta decide por su ancho, no por el de la ventana.

## Elevation & Depth

El sistema es plano y estructurado por filetes de 1px. La sombra existe en dos niveles y tiene un trabajo concreto: levantar lo que es "el producto" (capturas, panel de acceso) del papel de la página, o indicar un estado (etapa activa, tarjeta bajo el cursor). En tema oscuro las mismas sombras se oscurecen y la separación la dan los filetes.

### Shadow Vocabulary
- **Marco de producto** (`box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 18px 40px -22px rgba(15, 23, 42, 0.35)`): capturas del producto y el panel del formulario de acceso.
- **Contacto** (`box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06)`): etapa activa y tarjeta de vacante bajo el cursor.
- **Captura sobre noche** (`box-shadow: 0 24px 60px -30px rgba(0, 0, 0, 0.7)`): el redactor de correo dentro de la banda oscura.
- **Menú desplegado** (`box-shadow: 0 16px 30px -24px rgba(15, 23, 42, 0.45)`): el menú móvil bajo el encabezado.

### Named Rules
**The Frame-Not-Float Rule.** Las tarjetas están planas en reposo, con borde. Solo las capturas del producto y el panel del formulario llevan la sombra de marco; nada flota sin ser producto.

## Shapes

Esquinas suaves y escalonadas por tamaño: 6px para chips de evidencia, 8px para etiquetas, botones chicos y controles del encabezado, 10px para botones y campos, 12px para las etapas, 14px para tarjetas y avisos, 16px para capturas y el panel de acceso. Las píldoras de 999px se reservan para estados de flujo, modalidades, contadores y la etiqueta "Datos de ejemplo". El avatar y los números de requisito son círculos. Todo borde es de 1px; el punteado de 1px está reservado al estado "falta / pendiente".

## Components

### Buttons
Firmes y sobrios: peso 700, sin sombra, con un leve hundimiento al presionar.
- **Shape:** esquinas de 10px (8px en el tamaño chico).
- **Primary:** azul acción con texto blanco, 44px de alto, 0 20px, 15px; flecha de 16px a la derecha cuando lleva a otra página.
- **Hover / Focus:** pasa a azul hondo en 0.18s; `:active` escala a 0.98 (desactivado con movimiento reducido); foco global con contorno azul de 2px y separación de 3px.
- **Secondary:** superficie con borde fuerte y texto tinta; el borde se vuelve tinta bajo el cursor.
- **Chico:** 38px de alto, 0 16px, 14px; para acciones dentro de capturas y del encabezado.

### Chips
- **Chip de evidencia:** un solo chip que cambia de estado en el mismo lugar (6px, 12px/700). Analizando: gris pizarra con borde y un barrido de luz; Sugerida: azul claro; Confirmada: verde claro; Pendiente: gris con borde punteado. El texto entrante sube 5px y aparece.
- **Estado de flujo:** píldora ámbar ("En revisión", "Borrador") que pasa a verde ("Publicada").
- **Modalidad y "Datos de ejemplo":** píldora neutra con filete, texto de apoyo.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** superficie blanca sobre gris pizarra.
- **Shadow Strategy:** plana; al pasar el cursor el borde se vuelve azul y aparece la sombra de contacto.
- **Border:** filete de 1px; el pie se separa con filete superior (o lateral en modo fila).
- **Internal Padding:** 22px (18px en móvil). Toda la tarjeta es un solo enlace.
- **Requisitos:** hasta tres; los cortos son etiquetas azul claro (8px, 13px), los de más de 40 caracteres son texto llano a 14px, y "+N más" es una etiqueta punteada. Todos se cortan a dos líneas.
- **Cierre:** en texto pizarra; si está próximo, ámbar en 600.

### Inputs / Fields
- **Style:** 46px de alto, borde fuerte de 1px, 10px, superficie; etiqueta encima en 14px/700.
- **Hover:** el borde pasa a apoyo.
- **Focus:** borde azul más halo de 3px en azul claro.
- **Error:** bloque de 10px con fondo, borde y texto rojos suaves sobre el formulario.

### Navigation
- **Encabezado:** fijo arriba, 68px, fondo translúcido con desenfoque de 10px y filete inferior; rejilla marca · enlaces · acciones.
- **Marca:** cuadro azul de 28px con radio 8px y un trazo de verificación blanco, más el nombre en 800.
- **Enlaces:** 15px/500 en texto pizarra; bajo el cursor y activos pasan a tinta; el activo lleva una línea azul de 2px debajo.
- **Acciones:** botón de tema de 38px con filete; "Iniciar sesión" como botón secundario chico.
- **Móvil (≤900px):** botón de menú de tres líneas que se cruzan en X; el menú cae bajo el encabezado como lista de filas de 48px separadas por filetes. Bajo 480px la marca muestra solo el cuadro.
- **Pestañas de filtro:** sobre un filete común, 44px, 15px/600; la activa en azul texto con línea inferior de 2px y su contador se vuelve píldora azul sólida.

### Captura de producto (signature)
Interfaz real enmarcada: barra superior gris pizarra con la ruta en 13px a la izquierda y la etiqueta "Datos de ejemplo" a la derecha, cuerpo en superficie, pie gris con una nota y una acción chica. Marco de 16px con la sombra de marco. Dentro: tabla requisito / evidencia / estado donde cada evidencia se descubre de izquierda a derecha al resolverse.

### Panel de etapas (signature)
Lista de cuatro etapas (Publicar, Recibir, Relacionar, Decidir) junto a una captura. La etapa activa toma superficie, filete, sombra de contacto y título azul; una barra de 3px bajo ella marca el tiempo hasta la siguiente y se pausa al interactuar.

### Banda de control humano (signature)
Sección en noche con titulares blancos, redactor de correo en superficie clara y un registro vertical cuya línea se dibuja y cuyos pasos entran en orden; el último hito es un punto azul con halo que late dos veces. Cierra con cuatro principios en columnas sobre filete noche.

### Motion
Una sola curva, `cubic-bezier(0.16, 1, 0.3, 1)`: entradas de 0.6s que suben 12px, escalonadas de 0.08s en 0.08s; la captura se asienta 0.18s después con 18px y escala 0.985. Cambios de color en 0.18s. Con `prefers-reduced-motion` no hay desplazamientos ni bucles: cada elemento se muestra en su estado final.

## Do's and Don'ts

### Do:
- **Do** pintar todo con los tokens de `index.css`, para que el componente funcione en tema claro y oscuro sin reglas propias.
- **Do** usar el azul solo para actuar o marcar lo activo, y verde, ámbar y punteado solo para estados.
- **Do** construir las capturas del producto en HTML real, con texto legible (12px como mínimo) y la etiqueta "Datos de ejemplo" cuando los datos sean inventados.
- **Do** separar con filetes de 1px y reservar la sombra de marco a capturas y al panel del formulario.
- **Do** reutilizar `.boton` con sus variantes (primario, secundario, chico) y la columna `.envoltura`.
- **Do** mostrar los requisitos largos como frase llana y los cortos como etiqueta.
- **Do** definir el estado final de cada animación para movimiento reducido.

### Don't:
- **Don't** introducir una segunda familia tipográfica, serif de display ni mayúsculas espaciadas.
- **Don't** poner antetítulos o etiquetas encima de los titulares de sección.
- **Don't** añadir un segundo color de acento, degradados de fondo ni brillos decorativos.
- **Don't** usar capturas rasterizadas ni miniaturas con texto ilegible como argumento del producto.
- **Don't** escribir colores fijos en un componente (salvo el blanco sobre azul y sobre noche); si falta un rol, como el error, se agrega como token en ambos temas.
- **Don't** dar sombra a las tarjetas en reposo.
