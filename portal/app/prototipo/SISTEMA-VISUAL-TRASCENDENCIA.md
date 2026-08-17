# Sistema visual del portal de Trascendencia
> Extraido del codigo real por el workflow del Consejo. Es la referencia para
> alinear el workspace de PersonaLab. No inventar tokens nuevos.


## Lectura 1

El lado del participante es una app móvil oscura de una sola columna: fondo #0C0C0C, texto crema #F5F0E8, un único acento dorado #C9A96E y una barra de navegación fija abajo, todo encerrado en max-w-lg (portal/app/(participant)/layout.tsx:35-40). Conviven dos sistemas de tarjeta que nunca se unificaron: uno editorial y calmado (superficie #1A1A1A, bordes white/10, esquinas rounded-2xl, titulares en Cormorant Garamond light, eyebrows dorados en versalitas con tracking abierto) que domina Mi Retiro y los bloques de contenido, y otro utilitario y denso (superficie #181818, borde #2A2A2A, rounded-xl, titulares en DM Sans bold) que domina Programa, Acuerdos, Info y Avisos. El texto largo se presenta siempre igual y sin sofisticación: párrafo único con text-sm leading-relaxed whitespace-pre-wrap dentro de una tarjeta con eyebrow dorado, sobre string plano, sin markdown, sin encabezados internos y sin ninguna imagen (info/page.tsx:152, programa/page.tsx:252, avisos/page.tsx:80). El gesto más fuerte de todo el portal es el documento legal: una hoja blanca con tipografía slate sobre el fondo negro, ensanchada a max-w-2xl, que funciona como cambio de modo hacia lectura formal (acuerdos/[id]/page.tsx:36-47, firmar/[token]/page.tsx:115-123). El contenido progresivo existe pero es tímido: se filtra por un booleano activo y se sella con un "Disponible desde" en text-white/20, casi invisible (programa/page.tsx:105-110 y 256-257).

### Colores
- #0C0C0C: fondo base de toda la superficie del participante y del layout público, y a la vez color de texto sobre los botones dorados. portal/app/(participant)/layout.tsx:35, portal/app/(public)/layout.tsx:4, portal/app/(participant)/acuerdos/[id]/page.tsx:36. También se usa como borde de 2px en los puntos del timeline para recortar la línea vertical, programa/page.tsx:196
- #F5F0E8: texto principal crema, heredado desde el layout. Titulares, nombres, valores. 85 apariciones en el conjunto participante + nav + público
- #C9A96E: dorado de acento, el único color de marca. Eyebrows, iconos activos del nav, bordes de tarjeta accionable, botones primarios, enlaces de contacto, punto de progreso. 114 apariciones, el token más usado del sistema. ParticipantNav.tsx:70-76, mi-retiro/page.tsx:131-132, info/page.tsx:107
- #A09A8F: texto secundario cálido, cuerpo de lectura en el sistema utilitario y descripciones del timeline. programa/page.tsx:208, avisos/page.tsx:80, equipo/page.tsx:78
- #B0A898: texto secundario del sistema editorial, ligeramente más claro que #A09A8F. Cuerpo de los bloques de contenido del retiro y respuestas del FAQ. programa/page.tsx:252, components/HelpButton.tsx (respuesta del acordeón), firmar/[token]/page.tsx:72
- #6B7280: texto terciario y metadatos, iconos y etiquetas inactivas del nav inferior. mi-retiro/page.tsx:112, ParticipantNav.tsx:72 y 75, programa/page.tsx:191
- #4B5563: el gris más apagado, reservado para flechas decorativas y el enlace de cerrar sesión. mi-retiro/page.tsx:92 y 434
- #181818: superficie de tarjeta del sistema utilitario. info/page.tsx:106, acuerdos/page.tsx:87, avisos/page.tsx:70, equipo/page.tsx:57
- #1A1A1A: superficie de tarjeta del sistema editorial. mi-retiro/page.tsx:175 y 323, programa/page.tsx:245, compromisos/page.tsx:84
- #111111: barra de navegación inferior y theme-color del manifest. ParticipantNav.tsx:55, app/layout.tsx meta theme-color. Su versión corta #111 aparece en el bottom sheet de ayuda y en el panel de firma pública, HelpButton.tsx y firmar/[token]/page.tsx:190
- #2A2A2A: borde estándar del sistema utilitario y pista de la barra de progreso. info/page.tsx:106, acuerdos/page.tsx:92, línea vertical del timeline en programa/page.tsx:185
- #3A3A3A: único borde de hover del sistema utilitario. programa/page.tsx:148, mi-retiro/page.tsx:118
- white/10: borde estándar del sistema editorial, sustituye a #2A2A2A. white/5 para separadores muy sutiles y border-y de bloques de estado. white/[0.02] como fondo casi imperceptible del bloque de cuenta regresiva. mi-retiro/page.tsx:175, 256 y 422
- white/20: color del sello de disponibilidad del contenido progresivo, extremadamente bajo contraste. programa/page.tsx:256
- #4A4540 y #4A4541: gris de estado vacío y de placeholder de input. programa/page.tsx:236, firmar/[token]/PublicSignButton.tsx (placeholder-[#4A4541])
- #0A2A1A con opacidad 60: verde casi negro para la tarjeta de confirmación final Todo listo, con borde emerald-400/20. mi-retiro/page.tsx:385
- emerald-400 y #4ADE80: éxito, checks y barra de progreso al 100 por ciento. mi-retiro/page.tsx:338 y 386, acuerdos/page.tsx:97 y 148
- amber-400 sobre amber-900/30: estado en proceso y badge Pendiente firma. mi-retiro/page.tsx:194, acuerdos/page.tsx:24
- red-950/30 con borde red-700/30 para el aviso urgente en Mi Retiro; red-500/20 con red-300 para el badge urgente en Avisos; red-400 para mensajes de error de formulario. mi-retiro/page.tsx:296, avisos/page.tsx:6, PublicSignButton.tsx
- Paleta de puntos del timeline por tipo de actividad: violet-400 sesión, #C9A96E comida, sky-400 actividad, #A09A8F libre, slate-400 traslado, emerald-400 bienvenida, rose-400 cierre. programa/page.tsx:32-40
- Paleta del documento legal, totalmente aparte: fondo #fff, título slate-900, cuerpo slate-700 (acuerdos/[id]:72) o slate-600 (firmar:159), metadatos slate-500 y slate-400, cajas slate-50, bordes slate-100 y slate-200, líneas de firma slate-300 o slate-400. acuerdos/[id]/page.tsx:47-101, firmar/[token]/page.tsx:123-179
- #B8935D y #D4B07A: dorados de hover del botón primario, uno más oscuro y otro más claro según el archivo. PublicSignButton.tsx (hover:bg-[#B8935D]) y FirstTimeWelcome.tsx (hover:bg-[#D4B07A])
- #e5e7eb, #9ca3af, #6b7280 y #fff en minúsculas: paleta ajena de Tailwind por defecto, solo presente en documentos/page.tsx:33, 50, 57 y 68, escrita a mano en estilos inline

### Tipografia
- Dos familias cargadas en app/layout.tsx:6-20. Cormorant Garamond como var(--font-cormorant), pesos 300, 400, 600, 700, con itálicas. DM Sans como var(--font-sans), pesos 300 a 600, con itálicas. El body usa var(--font-sans) desde app/globals.css:8
- Se aplican con la sintaxis arbitraria font-[family-name:var(--font-cormorant)], no hay alias en tailwind.config.ts (el config solo extiende background y foreground, no hay familias ni escala propia)
- Display serif: text-5xl font-light leading-tight en Cormorant para el nombre de la familia, es la pieza tipográfica de bienvenida. mi-retiro/page.tsx:138. Variante text-4xl font-light en compromisos/page.tsx:80
- Cifra heroica: text-[96px] sm:text-[120px] font-light leading-none en Cormorant para la cuenta regresiva de días. mi-retiro/page.tsx:257
- Serif medio: text-2xl font-light en Cormorant para frases de estado emocional (Estás en el retiro, El retiro ha concluido, Tu cuenta está lista). mi-retiro/page.tsx:109, 165, 249
- Serif itálico: text-lg italic en Cormorant para el pie poético bajo la cifra y para agradecimientos. mi-retiro/page.tsx:168 y 260. Único uso de itálica en toda la interfaz oscura
- Serif de tarjeta: text-xl font-light en Cormorant para el título de cada tarjeta accionable, y text-lg font-light para tarjetas ya completadas. mi-retiro/page.tsx:327 y 342
- H1 utilitario: text-xl font-bold en sans, siempre a la izquierda, sin serif. programa/page.tsx:128, acuerdos/page.tsx:76, info/page.tsx:85, avisos/page.tsx:42. Convive con el H1 serif de Mi Retiro sin regla que los separe
- Eyebrow dorado, el patrón más repetido del sistema: text-[10px] uppercase tracking-[0.15em] text-[#C9A96E]. Variantes: tracking-[0.2em] para el nombre del evento (mi-retiro:132), tracking-[0.25em] para la marca Trascendencia (firmar:119), tracking-[0.12em] para tipos de aviso (mi-retiro:303), y la versión utilitaria text-xs font-semibold uppercase tracking-widest (info:107)
- Encabezado de sección: text-base font-semibold (programa:232) o bien text-xs font-semibold uppercase tracking-wider text-[#A09A8F] (acuerdos:108 y 133). Dos convenciones distintas para la misma jerarquía
- Título de tarjeta de contenido: text-lg font-semibold text-[#F5F0E8] mb-2. programa/page.tsx:250
- Cuerpo de lectura, el patrón único de texto largo: text-sm leading-relaxed whitespace-pre-wrap. Color #F5F0E8 en Info (152, 164, 176, 188), #B0A898 en los bloques del Programa (252), #A09A8F en Avisos (80). No hay tamaño de lectura mayor a text-sm en ninguna vista
- Metadatos: text-xs para hora, ubicación, fechas y estados. text-[10px] para eyebrows y sellos. text-[11px] font-semibold tracking-[0.15em] uppercase en el eyebrow de Compromisos (80)
- Fechas de sistema en text-xs uppercase tracking-widest text-[#6B7280]. mi-retiro/page.tsx:263 y 278
- Tipografía del documento legal, todo en sans y en tamaño pequeño: eyebrow text-xs uppercase tracking-widest slate-400 o text-[10px] tracking-[0.2em], título text-xl font-bold slate-900, intro y cuerpo text-sm leading-relaxed, encabezado de artículo text-sm font-semibold, cierre text-xs italic. acuerdos/[id]/page.tsx:50-72, firmar/[token]/page.tsx:127-169
- Etiquetas del nav inferior: text-[10px] tracking-wide. ParticipantNav.tsx:75

### Espaciado
- Contenedor de la app: max-w-lg mx-auto pb-24. El pb-24 (96px) reserva sitio para la nav fija de h-16 más el safe area. portal/app/(participant)/layout.tsx:36
- Contenedor de lectura de documento: max-w-2xl mx-auto, más ancho que el resto de la app. acuerdos/[id]/page.tsx:37 y firmar/[token]/page.tsx:115. Es el único momento en que el portal se ensancha
- Padding horizontal sin unificar: px-6 en Mi Retiro, px-5 en Programa, Acuerdos, Info, Avisos, Equipo y Compromisos, px-4 en el detalle de acuerdo y en la firma pública, y padding inline de 24px en Documentos
- Padding superior de página: pt-6 en las vistas utilitarias, pt-12 en el hero de Mi Retiro (128), pt-10 en la firma pública (115)
- Padding de tarjeta: p-5 en la tarjeta editorial y en las secciones de Info, p-4 en filas de lista compactas (acuerdos:116, avisos:70), p-6 en estados vacíos centrados y en el panel de firma, p-8 en el documento blanco y en el modal de bienvenida
- Ritmo vertical: space-y-1 para listas de enlaces de texto (mi-retiro:422), space-y-2 para filas de lista, space-y-3 para tarjetas de paso, space-y-4 para bloques de equipo, space-y-5 para eventos del timeline. Separación entre secciones mb-6 y mb-8, y mt-10 antes del bloque de contenido del retiro (programa:231)
- Timeline: contenedor relative pl-16, línea vertical en left-[52px], hora en absolute -left-16 con ancho w-12 y alineación derecha, punto en absolute -left-[7px] top-1.5. programa/page.tsx:183-196
- Bloque de cuenta regresiva: mx-6 py-8 text-center, es decir margen lateral en vez de padding para que el borde superior e inferior queden separados del borde de la pantalla. mi-retiro/page.tsx:256
- Nav inferior: h-16 con justify-around, cada enlace con px-4 py-2 y gap-1 entre icono y etiqueta, más paddingBottom env(safe-area-inset-bottom). ParticipantNav.tsx:56-67
- Botón flotante de ayuda a bottom-20 right-4 (80px), justo por encima de la nav de 64px. HelpButton.tsx. El botón de notificaciones va a fixed top-4 right-4 z-40, mi-retiro/page.tsx:100
- Bottom sheet de ayuda con max-h-[80vh] overflow-y-auto, px-5 pt-5 pb-10. El pb-10 evita que el último acordeón quede pegado al borde inferior

### Bordes
- Radios por sistema: rounded-2xl (16px) para todo el sistema editorial de tarjetas y para el modal de bienvenida; rounded-xl (12px) para el sistema utilitario, inputs, acordeones y avisos; rounded-lg (8px) para las píldoras de día y cajas de metadatos; rounded-t-2xl para el bottom sheet; rounded-full para puntos, badges, avatares y la barra de progreso
- Grosor: todo es de 1px salvo tres excepciones deliberadas. border-2 en el punto del timeline con color #0C0C0C para que la línea vertical parezca cortada (programa:196), border-l-4 en la tarjeta de aviso coloreada por tipo (avisos:70), y border-t-2 border-slate-300 en las líneas de firma del documento público (firmar:179)
- Bordes del sistema editorial: border-white/10 en reposo, border-white/5 para separadores y para el border-y de bloques de estado, border-t border-white/10 antes de la lista de enlaces secundarios (mi-retiro:422)
- Bordes del sistema utilitario: border-[#2A2A2A] en reposo, hover a border-[#3A3A3A]
- Borde de llamada a la acción: border-[#C9A96E]/30 en reposo con hover:border-[#C9A96E]/60 (mi-retiro:323). Variante más suave /20 con hover /50 para la tarjeta de La Nube (mi-retiro:405). Variante /20 sobre fondo #C9A96E/5 para bloques informativos y de emergencia (info:184, acuerdos:80)
- Bordes del documento blanco: border-slate-200 en el marco (acuerdos/[id]:47) o ningún borde y shadow-xl en su lugar (firmar:123). Separadores internos border-slate-100
- Foco de input: focus:outline-none focus:border-[#C9A96E]/60 o /50. No hay anillo de foco visible más allá del cambio de borde
- El indicador de pestaña activa del nav no es un borde sino una barra absoluta: w-6 h-0.5 bg-[#C9A96E] rounded-full pegada al top. ParticipantNav.tsx:70

### Patrones de componente

**Shell del participante** · `portal/app/(participant)/layout.tsx:35-40`
```
contenedor: bg-[#0C0C0C] min-h-screen text-[#F5F0E8] font-[family-name:var(--font-sans)] ; main: max-w-lg mx-auto pb-24 ; luego <ParticipantNav />
```
Todo el lado del participante vive dentro de esto. El color de texto crema se hereda, por eso cualquier tarjeta clara que no fije su propio color hereda texto ilegible. Copiar tal cual para el lector de PersonaLab, cambiando solo max-w si el curso necesita más medida de línea.

**Barra de navegación inferior fija** · `portal/components/ParticipantNav.tsx:54-82`
```
nav: fixed bottom-0 left-0 right-0 z-50 bg-[#111111] border-t border-white/10 con style paddingBottom: env(safe-area-inset-bottom) ; interior: max-w-lg mx-auto flex items-center justify-around h-16 ; item: flex flex-col items-center gap-1 relative px-4 py-2 ; indicador activo: absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#C9A96E] rounded-full ; icono y etiqueta: text-[#C9A96E] si activo, text-[#6B7280] si no ; etiqueta: text-[10px] tracking-wide
```
Cinco destinos máximo, iconos SVG stroke 1.5 de 20px dibujados a mano en el mismo archivo, sin librería. La detección de activo es pathname exacto para la home y startsWith para el resto (líneas 60-62). El fondo #111111 es más claro que el lienzo #0C0C0C, así la barra flota sin sombra.

**Tarjeta editorial (contenido)** · `portal/app/(participant)/programa/page.tsx:243-259 y mi-retiro/page.tsx:175`
```
bg-[#1A1A1A] border border-white/10 rounded-2xl p-5 mb-4
```
Es la tarjeta canónica para presentar una pieza de contenido. Dentro va: eyebrow dorado, título, cuerpo largo y sello de disponibilidad. El molde exacto que debería heredar una lección de PersonaLab.

**Tarjeta utilitaria (lista y datos)** · `portal/app/(participant)/info/page.tsx:106 y acuerdos/page.tsx:87`
```
bg-[#181818] border border-[#2A2A2A] rounded-xl p-5
```
El otro sistema. Más denso, más cuadrado, titulares en sans bold. Usarlo solo para datos y listas, no para lectura, si se quiere evitar la ambigüedad que hoy tiene el portal.

**Eyebrow dorado** · `portal/app/(participant)/programa/page.tsx:247`
```
text-[10px] uppercase tracking-[0.15em] text-[#C9A96E] mb-2
```
Marca la categoría del bloque antes del título. Es el elemento que más identifica visualmente al portal. En el sistema utilitario su equivalente es text-xs font-semibold text-[#C9A96E] uppercase tracking-widest mb-3 (info:107).

**Bloque de lectura larga** · `portal/app/(participant)/info/page.tsx:147-156 y programa/page.tsx:251-255`
```
contenedor: bg-[#181818] border border-[#2A2A2A] rounded-xl p-5 mb-4 ; eyebrow: text-xs font-semibold text-[#C9A96E] uppercase tracking-widest mb-3 ; texto: text-sm text-[#F5F0E8] leading-relaxed whitespace-pre-wrap (variante editorial: text-sm text-[#B0A898] leading-relaxed whitespace-pre-wrap)
```
Este es literalmente todo el tratamiento de texto largo que existe en el portal. Es un párrafo único, sin encabezados internos, sin listas, sin énfasis, sin imágenes. whitespace-pre-wrap es lo único que respeta los saltos de línea que escribió el admin. PersonaLab necesitará extenderlo, no copiarlo, si el curso lleva estructura.

**Sello de contenido progresivo** · `portal/app/(participant)/programa/page.tsx:256-258`
```
text-[10px] text-white/20 mt-3 con el texto Disponible desde + fecha en formato weekday, day, month, hour, minute (formatActivadoAt en la línea 21)
```
Cierra la tarjeta de contenido activado. El gating real ocurre en la consulta: .eq('activo', true) y .order('orden') en las líneas 105-110. El color white/20 es demasiado tenue, subirlo a #4A4540 o #6B7280 si se reutiliza.

**Estado vacío de contenido por llegar** · `portal/app/(participant)/programa/page.tsx:234-239`
```
bg-[#181818] border border-white/5 rounded-2xl p-5 text-center ; texto: text-sm text-[#4A4540]
```
Patrón repetido en todo el portal: en vez de ocultar la sección, se muestra una caja que explica cuándo aparecerá el contenido. Ver también acuerdos:156, equipo:50, avisos:52-60. Es el gesto que hace legible el contenido progresivo.

**Documento en hoja blanca sobre lienzo oscuro** · `portal/app/(participant)/acuerdos/[id]/page.tsx:36-108 y portal/app/(public)/firmar/[token]/page.tsx:115-187`
```
página: min-h-screen bg-[#0C0C0C] px-4 py-8 con interior max-w-2xl mx-auto ; hoja: bg-white rounded-xl border border-slate-200 p-8 mb-6 (versión pública: bg-white rounded-2xl shadow-xl overflow-hidden, header px-8 pt-10 pb-7 border-b border-slate-100 text-center, cuerpo px-8 py-7) ; encabezado: eyebrow text-xs text-slate-400 uppercase tracking-widest, h1 text-xl font-bold text-slate-900, subtítulo text-sm text-slate-500 ; intro: text-sm leading-relaxed text-slate-700 mb-6 ; artículo: h3 text-sm font-semibold text-slate-900 mb-1.5 + p text-sm leading-relaxed text-slate-700 ; caja de meta: bg-slate-50 rounded-lg px-4 py-3 mt-6 mb-6 ; líneas de firma: border-t border-slate-400 pt-2 text-xs text-slate-400 text-center
```
El único patrón de lectura inmersiva del portal. Cambia el modo de color, ensancha el contenedor a max-w-2xl, elimina el nav visual con un enlace de volver arriba y estructura el texto en intro, artículos numerados y cierre. La versión pública numera los artículos con {i + 1}. (firmar:157) y pone el cierre en itálica text-xs slate-500 con border-t (firmar:169). Es el modelo obvio para un curso que quiera sentirse a documento, aunque obliga a decidir si PersonaLab lee en claro o en oscuro.

**Enlace de retorno de la vista de lectura** · `portal/app/(participant)/acuerdos/[id]/page.tsx:39-44`
```
inline-block text-[#F5F0E8]/50 text-sm mb-6 no-underline hover:text-[#F5F0E8]/80 transition-colors con el texto de flecha izquierda + Volver a acuerdos
```
Único mecanismo de salida de la vista inmersiva. No hay barra superior, ni progreso, ni siguiente y anterior.

**Tarjeta accionable de paso** · `portal/app/(participant)/mi-retiro/page.tsx:321-335`
```
flex items-start justify-between p-5 bg-[#1A1A1A] border border-[#C9A96E]/30 rounded-2xl hover:border-[#C9A96E]/60 transition-colors ; dentro: eyebrow text-[10px] uppercase tracking-[0.15em] text-[#C9A96E] mb-1 con la palabra Paso N, título font-[family-name:var(--font-cormorant)] text-xl font-light text-[#F5F0E8], apoyo text-sm text-[#6B7280] mt-1, flecha SVG 16px stroke 1.5 en #C9A96E
```
La unidad de avance secuencial. El dorado en el borde es lo que dice qué toca hacer ahora.

**Paso completado y paso bloqueado** · `portal/app/(participant)/mi-retiro/page.tsx:337-345 (completado) y 363 (bloqueado)`
```
completado: flex items-center gap-3 p-5 bg-[#1A1A1A] border border-white/10 rounded-2xl opacity-50 + check SVG text-emerald-400 ; bloqueado: bg-[#1A1A1A] border border-white/10 opacity-60 pointer-events-none con el eyebrow en text-[#6B7280] en vez de dorado
```
El desbloqueo secuencial se comunica solo con opacidad, color del eyebrow y pointer-events-none. Ni candado ni mensaje. Muy transferible a lecciones bloqueadas de un curso, aunque conviene añadir la razón del bloqueo.

**Timeline de día** · `portal/app/(participant)/programa/page.tsx:183-212`
```
contenedor: relative pl-16 ; línea: absolute left-[52px] top-0 bottom-0 w-px bg-[#2A2A2A] ; lista: space-y-5 ; hora: absolute -left-16 top-0 text-xs text-[#6B7280] text-right w-12 pt-0.5 leading-tight ; punto: absolute -left-[7px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#0C0C0C] z-10 + color por tipo del mapa tipoDot (líneas 32-40) ; tarjeta: bg-[#181818] border rounded-xl p-4 con border-[#C9A96E]/20 si es hoy
```
Estructura de secuencia temporal. El borde de 2px del punto en color del fondo es el truco que hace que el punto pise la línea.

**Píldoras selectoras de día con ancla** · `portal/app/(participant)/programa/page.tsx:137-155`
```
fila: flex items-center gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide ; píldora: px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ; activa: bg-[#C9A96E] text-[#0C0C0C] ; inactiva: bg-[#181818] text-[#A09A8F] border border-[#2A2A2A] hover:border-[#3A3A3A]
```
Navegación por anclas href=#dia-N sobre secciones con id. Sirve como modelo de índice de capítulos para un curso. Ojo: scrollbar-hide no está definido en el proyecto.

**Encabezado de día con marca HOY** · `portal/app/(participant)/programa/page.tsx:166-180`
```
contenedor: flex items-center justify-between px-3 py-2 rounded-lg mb-4 ; hoy: bg-[#C9A96E]/10 border border-[#C9A96E]/20 con título text-[#C9A96E] ; normal: bg-[#181818] border border-[#2A2A2A] ; badge: text-[10px] font-bold text-[#C9A96E] bg-[#C9A96E]/10 border border-[#C9A96E]/30 px-2 py-0.5 rounded-full uppercase tracking-wide
```
El patrón de resaltar el segmento vigente con dorado al 10 por ciento de fondo, 20 a 30 por ciento de borde. Traducible a lección en curso.

**Barra de progreso** · `portal/app/(participant)/acuerdos/page.tsx:86-103`
```
marco: bg-[#181818] border border-[#2A2A2A] rounded-xl p-4 ; encabezado: flex items-center justify-between mb-3 text-sm con etiqueta text-[#F5F0E8] font-medium y conteo text-[#A09A8F] ; pista: bg-[#2A2A2A] rounded-full h-2 overflow-hidden ; relleno: h-full rounded-full transition-all duration-500 con style width porcentaje y background '#4ADE80' al 100 por ciento o '#C9A96E' antes ; porcentaje: text-right text-xs text-[#6B7280] mt-1
```
El único indicador de avance del portal, y es de trámites firmados, no de lectura. Reutilizable tal cual para progreso de curso.

**Badge de estado** · `portal/app/(participant)/acuerdos/page.tsx:11-37`
```
base: inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ; firmado: bg-emerald-900/40 text-emerald-400 border border-emerald-400/20 con check SVG de 10px ; pendiente: bg-amber-900/30 text-amber-400 border border-amber-400/20 ; borrador: bg-[#2A2A2A] text-[#6B7280] border border-white/10
```
Fórmula consistente: fondo del color al 30 a 40 por ciento en tono 900, texto en tono 400, borde del tono 400 al 20 por ciento.

**Fila de lista navegable** · `portal/app/(participant)/acuerdos/page.tsx:113-124`
```
flex items-center justify-between p-4 bg-[#181818] border border-[#2A2A2A] rounded-xl hover:border-[#C9A96E]/40 transition-colors ; título: font-medium text-[#F5F0E8] text-sm ; tipo: text-xs text-[#6B7280] mt-0.5 uppercase ; afijo: flecha text-[#C9A96E] text-lg. Variante completada: opacity-70 hover:opacity-100 transition-opacity con check text-[#4ADE80]
```
El índice de un curso puede ser exactamente esto: fila con título, meta en versalitas y estado a la derecha.

**Lista editorial de enlaces secundarios** · `portal/app/(participant)/mi-retiro/page.tsx:422-437`
```
contenedor: border-t border-white/10 pt-6 space-y-1 ; enlace: flex items-center justify-between py-3 text-sm text-[#A09A8F] hover:text-[#F5F0E8] transition-colors con flecha text-[#4B5563]
```
Navegación de segundo nivel sin tarjeta. Baja el peso visual de lo secundario sin esconderlo.

**Bloque de estado emocional con borde superior e inferior** · `portal/app/(participant)/mi-retiro/page.tsx:256-266`
```
mx-6 py-8 text-center border-y border-white/5 rounded-2xl bg-white/[0.02] ; cifra: font-[family-name:var(--font-cormorant)] text-[96px] sm:text-[120px] font-light leading-none ; pie: font-[family-name:var(--font-cormorant)] text-lg italic text-[#A09A8F] mt-2 ; fechas: text-xs text-[#6B7280] mt-3 uppercase tracking-widest
```
El momento más expresivo de todo el portal: número enorme en serif light sobre casi nada. Modelo de portada emocional para un curso.

**Tarjeta de aviso con barra lateral por tipo** · `portal/app/(participant)/avisos/page.tsx:69-84`
```
bg-[#181818] border-l-4 + color de tipo + border border-[#2A2A2A] rounded-xl p-4 ; badge: text-xs font-semibold px-2 py-0.5 rounded-full con bg-blue-500/20 text-blue-300, bg-red-500/20 text-red-300 o bg-[#C9A96E]/20 text-[#C9A96E] ; título: font-semibold text-[#F5F0E8] text-sm leading-snug ; cuerpo: mt-2 text-sm text-[#A09A8F] leading-relaxed whitespace-pre-wrap
```
Única codificación por color de categoría en texto largo. Sirve para callouts dentro de una lección.

**Botón primario dorado** · `portal/app/(public)/firmar/[token]/PublicSignButton.tsx (botón final) y portal/app/(participant)/acuerdos/[id]/SignAgreementButton.tsx`
```
grande: w-full py-4 bg-[#C9A96E] text-[#0C0C0C] font-semibold rounded-xl hover:bg-[#B8935D] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm ; compacto: w-full py-2.5 px-6 bg-[#C9A96E] text-[#0C0C0C] font-semibold text-sm rounded-lg transition-opacity disabled:opacity-40 hover:opacity-90
```
Dorado sólido con texto del color del fondo. Deshabilitado siempre a opacity-40. Dos variantes de radio y de hover conviviendo, elegir una para PersonaLab.

**Input oscuro** · `portal/app/(participant)/acuerdos/[id]/SignAgreementButton.tsx y PublicSignButton.tsx`
```
variante oscura: bg-[#0C0C0C] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-[#F5F0E8] text-sm placeholder:text-[#F5F0E8]/30 focus:outline-none focus:border-[#C9A96E]/60 ; variante translúcida: w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-[#F5F0E8] placeholder-[#4A4541] focus:outline-none focus:border-[#C9A96E]/50
```
El foco se comunica solo con el borde dorado, sin ring. Dos variantes según el sistema de tarjeta en el que viva.

**Checkbox personalizado de confirmación de lectura** · `portal/app/(public)/firmar/[token]/PublicSignButton.tsx`
```
label: flex items-start gap-3 cursor-pointer group select-none ; input real: sr-only ; caja: w-5 h-5 rounded border-2 flex items-center justify-center transition-all, activa bg-[#C9A96E] border-[#C9A96E], inactiva border-white/20 bg-white/5 group-hover:border-white/40 ; check SVG w-3 h-3 text-[#0C0C0C] strokeWidth 3 ; texto: text-xs text-[#B0A898] leading-relaxed
```
Patrón de he leído y acepto. Directamente reutilizable como marcar lección como completada.

**Botón de ayuda flotante con bottom sheet de FAQ** · `portal/components/HelpButton.tsx`
```
botón: fixed bottom-20 right-4 z-40 w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#C9A96E]/40 text-[#C9A96E] text-sm font-bold flex items-center justify-center shadow-lg hover:border-[#C9A96E]/70 ; backdrop: fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end ; hoja: bg-[#111] rounded-t-2xl border-t border-[#C9A96E]/20 px-5 pt-5 pb-10 max-h-[80vh] overflow-y-auto ; título: font-[family-name:var(--font-cormorant)] text-2xl font-light text-[#C9A96E] ; acordeón: border border-white/10 rounded-xl overflow-hidden, pregunta text-sm text-[#F5F0E8] font-medium leading-snug en botón px-4 py-4, chevron con rotate-180 al abrir, respuesta px-4 pb-4 text-sm text-[#B0A898] leading-relaxed border-t border-white/5 pt-3
```
El FAQ es un diccionario por pageId dentro del propio componente, con fallback a 'default'. Se monta en mi-retiro, programa, acuerdos, detalle de acuerdo, compromisos y equipo, pero no en info, documentos ni avisos.

**Modal de bienvenida de primera vez** · `portal/components/FirstTimeWelcome.tsx`
```
backdrop: fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center px-4 overflow-y-auto ; tarjeta: max-w-sm w-full mt-20 mb-10 bg-[#111] rounded-2xl p-8 border border-[#C9A96E]/20 shadow-2xl ; ornamento: w-12 h-12 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/30 con estrella SVG stroke #C9A96E ; título: font-[family-name:var(--font-cormorant)] text-3xl font-light text-center mb-3 ; subtítulo: text-sm text-[#B0A898] text-center leading-relaxed mb-8 ; lista: space-y-4 con check circle SVG en #C9A96E ; CTA: w-full py-4 bg-[#C9A96E] text-[#0C0C0C] font-semibold text-sm rounded-xl hover:bg-[#D4B07A] active:scale-[0.98]
```
Se controla con localStorage bajo la clave trascendencia_welcomed_v1 y se carga con next/dynamic ssr false desde mi-retiro:8. Modelo listo para un onboarding de curso.

**Ornamento circular de icono** · `portal/app/(public)/firmar/[token]/page.tsx:90-94, mi-retiro/page.tsx:113 (versión pequeña), compromisos/page.tsx:85`
```
w-16 h-16 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/30 flex items-center justify-center mx-auto mb-5 con SVG w-8 h-8 text-[#C9A96E] strokeWidth 2.5. Variantes de w-9, w-12 y w-14 según contexto
```
Marcador de estado terminal (firmado, bloqueado, error). En error cambia a bg-red-500/10 border-red-500/30 text-red-400.

**Fila de estado de entregable** · `portal/app/(participant)/mi-retiro/page.tsx:174-224`
```
contenedor: bg-[#1A1A1A] border border-white/10 rounded-2xl p-5 mb-4 space-y-3 con eyebrow text-[10px] uppercase tracking-[0.15em] text-[#C9A96E] mb-3 ; fila: flex items-center justify-between con nombre text-sm text-[#F5F0E8] y estado a la derecha: enlace text-xs text-[#C9A96E] hover:underline, o text-xs text-emerald-400 entregado, o text-xs text-amber-400 en proceso, o text-xs text-[#6B7280] pendiente
```
Modelo de checklist de recursos entregados. Tres estados en tres colores, siempre en text-xs a la derecha.

**Tarjeta de perfil con foto y bio** · `portal/app/(participant)/equipo/page.tsx:57-79`
```
bg-[#181818] border border-[#2A2A2A] rounded-xl p-5 ; cabecera flex items-start justify-between mb-3 con nombre font-bold text-[#F5F0E8] y rol text-xs text-[#C9A96E] font-medium mt-0.5 uppercase tracking-wider ; avatar w-14 h-14 rounded-full overflow-hidden flex-shrink-0 con img w-full h-full object-cover, y fallback de inicial sobre color derivado del nombre ; bio p text-sm text-[#A09A8F] leading-relaxed
```
Es la única imagen que existe en todo el lado del participante, y es un avatar recortado en círculo con etiqueta img cruda, no next/image. No hay ningún patrón de imagen dentro de texto de lectura.

### Hallazgos
- Hay dos sistemas de tarjeta que nunca se reconciliaron y ambos están vivos. El editorial usa bg-[#1A1A1A], border-white/10, rounded-2xl, títulos en Cormorant light y eyebrows de 10px con tracking abierto (mi-retiro/page.tsx:175 y 323, programa/page.tsx:245, compromisos/page.tsx:84). El utilitario usa bg-[#181818], border-[#2A2A2A], rounded-xl y títulos en DM Sans bold (info/page.tsx:106, acuerdos/page.tsx:87, avisos/page.tsx:70, equipo/page.tsx:57). Mi Retiro es editorial, todo lo demás es utilitario. PersonaLab debe elegir uno solo y no repetir la bifurcación: para lectura de curso, el editorial es el que carga la marca.
- portal/app/(participant)/documentos/page.tsx es deuda visual pura y además tiene un defecto de legibilidad real. Toda la página está escrita con estilos inline y sin Tailwind (líneas 31-93), monta tarjetas con background '#fff' y border '1px solid #e5e7eb' dentro del layout oscuro, y en la línea 67 el nombre del documento se pinta sin declarar color, por lo que hereda el text-[#F5F0E8] del layout: texto crema sobre blanco, prácticamente invisible. El botón de descarga usa background '#111' y color '#fff' (líneas 79-81), otra paleta ajena. La página tampoco lleva HelpButton ni respeta el padding px-5 o px-6 del resto. Es exactamente el patrón que PersonaLab no debe imitar, y es el único lugar donde se listan documentos descargables.
- Lo mejor del portal para copiar es el modo documento: la hoja blanca sobre el lienzo negro en acuerdos/[id]/page.tsx:36-47 y firmar/[token]/page.tsx:115-123. Es el único momento en que el portal cambia de modo de color y ensancha el contenedor de max-w-lg a max-w-2xl para leer. La versión pública está mejor resuelta que la privada: sombra en lugar de borde (shadow-xl, línea 123), cabecera con más aire (px-8 pt-10 pb-7), artículos numerados automáticamente con {i + 1} (línea 157) y cierre en itálica separado por border-t (línea 169). Si PersonaLab hace lectura inmersiva, esta es la referencia y conviene tomar la versión pública, no la privada.
- El mismo documento está implementado dos veces con divergencias silenciosas. acuerdos/[id]/page.tsx:67-94 y firmar/[token]/page.tsx:152-172 renderizan la misma estructura de contenido (intro, articles, meta, sigs) con clases distintas: cuerpo slate-700 contra slate-600, artículos sin numerar contra numerados, meta en caja bg-slate-50 contra párrafo itálico con borde superior, líneas de firma border-t slate-400 contra border-t-2 slate-300. Además los tipos AgreementContent difieren: en el privado meta admite objeto o string, en el público solo string. PersonaLab debería extraer un componente de renderizado de contenido desde el principio en lugar de duplicar.
- No existe ningún patrón para imágenes dentro de texto de lectura. En todo el lado del participante hay exactamente una etiqueta de imagen, y es el avatar circular del equipo con img crudo y eslint desactivado (equipo/page.tsx:64-70). No hay next/image, no hay figura, no hay pie de foto, no hay imagen de portada de sección. Si PersonaLab publica cursos con imágenes, ese patrón hay que inventarlo, no hay de dónde copiarlo.
- Tampoco hay texto enriquecido. Todo el contenido largo es un string plano renderizado con whitespace-pre-wrap (info/page.tsx:152, 164, 176, 188; programa/page.tsx:252; avisos/page.tsx:80). No hay markdown, no hay plugin de tipografía de Tailwind (verificado en package.json y en tailwind.config.ts), no hay encabezados internos ni listas ni énfasis. El cuerpo nunca supera text-sm y el contenedor nunca supera max-w-lg salvo en documentos, así que la medida de línea de lectura es de aproximadamente 512px con texto de 14px. Para lectura sostenida de curso eso es texto pequeño; conviene subir a text-base y a leading-loose o similar en el lector de PersonaLab.
- La clase scrollbar-hide se usa en programa/page.tsx:137 pero no está definida en ninguna parte: no hay regla en app/globals.css (que tiene solo 11 líneas), no hay plugin en tailwind.config.ts y no hay dependencia de scrollbar en package.json. Es una clase muerta y la barra de scroll horizontal del selector de días sí se ve.
- El auto scroll al día de hoy es frágil. programa/page.tsx:218-226 inyecta un script con dangerouslySetInnerHTML que escucha DOMContentLoaded. En una navegación cliente de Next el evento ya ocurrió, así que el scroll al día actual no se ejecuta de forma fiable. Si PersonaLab necesita saltar a la lección en curso, hacerlo con useEffect en un componente cliente.
- Guion largo en copy visible, contra la regla dura del usuario. Aparece en info/page.tsx:142 dentro de la frase sobre logística y vestimenta, en mi-retiro/page.tsx:264 y 279 como separador entre fecha de inicio y fecha de fin, en el fallback de formatDate de mi-retiro:11, documentos:13, info:5 y acuerdos/[id]:14, en la lista de features de components/FirstTimeWelcome.tsx, y en dos respuestas del FAQ de components/HelpButton.tsx (las de formulario y compromisos). PersonaLab no debe heredar ese hábito: usar la palabra a, dos puntos o punto.
- Erratas y mezclas menores. En acuerdos/page.tsx:33 el badge dice Proximamente sin acento. Se mezclan emojis con la iconografía SVG dibujada a mano: pin en programa/page.tsx:205, símbolo de información en acuerdos/page.tsx:81, megáfono en avisos/page.tsx:55. El resto del portal usa SVG stroke 1.5 inline y consistente (ParticipantNav.tsx:6-40), así que los emojis rompen el registro.
- El padding horizontal no está normalizado: px-6 en mi-retiro, px-5 en programa, acuerdos, info, avisos, equipo y compromisos, px-4 en el detalle de acuerdo y en la firma pública, y 24px inline en documentos. Al navegar entre pestañas el contenido se desplaza lateralmente. Definir un solo token de gutter para PersonaLab.
- info/page.tsx:82 repite bg-[#0C0C0C] min-h-screen aunque el layout ya lo aplica en layout.tsx:35. Es inofensivo pero indica que las páginas no confían en el shell, lo que a la larga produce divergencia.
- El contenido progresivo funciona pero se comunica mal. El gating es una consulta con .eq('activo', true) más orden por columna orden (programa/page.tsx:105-110) y el único rastro para el participante es el sello Disponible desde en text-[10px] text-white/20 (líneas 256-257), un gris que sobre #1A1A1A es casi invisible. No hay animación ni marca de novedad ni distinción entre lo que ya estaba y lo recién liberado. Para un curso publicado por goteo hace falta al menos un estado de nuevo y un contraste usable.
- No existe ningún concepto de progreso de lectura. La única barra de progreso del portal cuenta acuerdos firmados (acuerdos/page.tsx:86-103) y el único avance secuencial son las tarjetas de Paso 1 y Paso 2 de mi-retiro/page.tsx:317-395, que bloquean con opacity-60 y pointer-events-none. No hay marcar como leído, ni siguiente y anterior, ni indicador de posición dentro de un texto largo, ni recuperación del punto de lectura. Todo eso es territorio nuevo para PersonaLab, aunque la barra de progreso y el patrón de paso bloqueado sirven de base directa.
- El botón de ayuda no está en todas partes. HelpButton se monta en mi-retiro, programa, acuerdos, el detalle de acuerdo, compromisos y equipo, pero falta en info/page.tsx, documentos/page.tsx y avisos/page.tsx. Si PersonaLab adopta el patrón, montarlo desde el layout y no página por página.
- Riesgo de contraste no medido pero visible a ojo: #6B7280 sobre #0C0C0C se usa para texto de 10 a 12px en metadatos, horas del timeline y etiquetas inactivas del nav (ParticipantNav.tsx:72 y 75, programa/page.tsx:191), y white/20 se usa para el sello de disponibilidad. No lo verifiqué con herramienta de contraste, pero son los dos candidatos claros a fallar WCAG AA. En una vista de lectura larga, elevar el secundario a #A09A8F o #B0A898, que es lo que ya hace el sistema editorial.
- El foco de teclado solo se comunica con cambio de color de borde y siempre con focus:outline-none (SignAgreementButton.tsx y PublicSignButton.tsx). En una experiencia de lectura de curso, con navegación por teclado, eso es insuficiente.

## Lectura 2

El admin de Trascendencia es un panel claro sobre `bg-slate-50` construido casi por completo con la escala slate de Tailwind: superficies blancas con `border-slate-200 rounded-xl shadow-sm`, texto slate-900 para títulos y slate-400/500 para lo secundario, y un único acento oscuro (`bg-slate-900`) que sirve de primario para todo. El color aparece solo en badges, siempre con la fórmula `bg-{color}-100 text-{color}-700` en pastilla `rounded-full` o `rounded-md`. La densidad es de herramienta interna: celdas `px-4 py-3`, texto base `text-sm`, mucho `text-xs` y bastante `text-[10px]`/`text-[11px]`. Los formularios son largos, en una sola columna de `max-w-2xl`, agrupados en tarjetas blancas con encabezado `text-xs uppercase tracking-wider text-slate-500`, y guardan con un patrón de "banner de error arriba, botón que dice Guardando..., redirect al terminar". La grieta grande es que el sistema no está escrito en ningún lado: conviven tres dialectos de estilo (Tailwind con tokens, Tailwind con hex crudos como `#111827` y `#0C0C0C`, y objetos `CSSProperties` inline), cuatro tratamientos de foco distintos y tres estilos de label, todos en archivos hermanos.

### Colores
- Fondo de la app admin: `bg-slate-50` en el <main> de /Users/franciscoesquivel/Documents/GitHub/4meaning-Web/.claude/worktrees/portal-4meaning-review-5c6748/portal/app/(admin)/layout.tsx:26
- Superficie base (tarjeta, tabla, formulario, lista): `bg-white` + `border-slate-200`. Aparece 20+ veces, por ejemplo FamiliasClient.tsx:181, ChecklistClient.tsx:215, EditarEventoForm.tsx:142, OperacionClient.tsx:145
- Primario: `bg-slate-900 text-white`. Hover inconsistente: `hover:bg-slate-800` en FamiliasClient.tsx:95 y NuevoItemForm.tsx:199, `hover:bg-slate-700` en EditarEventoForm.tsx:297, ChecklistClient.tsx:295 y OperacionClient.tsx:231
- Mismo primario escrito como hex crudo `bg-[#111827]` en ItinerarioClient.tsx:422 y 475, y en NuevoItemForm.tsx:199. `#111827` es exactamente slate-900, o sea es el mismo color con dos notaciones
- Primario en el formulario inline: `background: '#111'` en familias/nueva/page.tsx:155. Ese sí es un negro distinto a slate-900
- Cabecera de tabla y de grupo: `bg-slate-50` (FamiliasClient.tsx:184, ChecklistClient.tsx:216)
- Hover de fila: `hover:bg-slate-50` (FamiliasClient.tsx:200)
- Escala de texto: título `text-slate-900`, cuerpo `text-slate-600`/`text-slate-700`, secundario `text-slate-500`, terciario y vacío `text-slate-400`, guion de celda vacía `text-slate-300` (FamiliasClient.tsx:251 y 258)
- Hero oscuro de operación: `bg-[#0C0C0C] text-white` en OperacionClient.tsx:116, 314 y 410. Es el único negro casi puro del admin
- Badges de status de familia, mapa completo en FamiliasClient.tsx:40-43: invited `bg-violet-100 text-violet-700`, confirmed `bg-blue-100 text-blue-700`, completed `bg-slate-100 text-slate-500`, pending `bg-amber-100 text-amber-700`, fallback `bg-slate-100 text-slate-600`
- Semáforo de estado de fila: listo `bg-emerald-100 text-emerald-700` (FamiliasClient.tsx:213), intake completo `bg-green-100 text-green-700` (FamiliasClient.tsx:222), pendiente `bg-slate-100 text-slate-500` (FamiliasClient.tsx:215). Emerald y green se usan indistintamente para lo mismo
- Badge STAFF: `bg-amber-100 text-amber-700` con `text-[10px] font-bold uppercase tracking-wide rounded` (ItinerarioClient.tsx:136 y 378, ItinerarioList.tsx:122)
- Badge de grupo: `bg-orange-100 text-orange-700` (ItinerarioClient.tsx:58, ItinerarioList.tsx:117)
- TIPO_COLORS del itinerario, definido dos veces idéntico en ItinerarioClient.tsx:36-46 y ItinerarioList.tsx:30-40: sesion violet, taller purple, comida amber, actividad blue, libre slate-100/slate-500, traslado sky, logistica gray-100/gray-600, bienvenida emerald, cierre `bg-red-100 text-red-500`
- El mismo mapa contradicho en OperacionClient.tsx:59-69: taller indigo (no purple), actividad green (no blue), logistica blue (no gray). El mismo tipo de item se pinta distinto según la pantalla
- Error de formulario: `bg-red-50 border-red-200 text-red-700` (EditarEventoForm.tsx:135, NuevoItemForm.tsx:93). El equivalente inline usa `#fee2e2` / `#fca5a5` / `#991b1b` (familias/nueva/page.tsx:62)
- Peligro / eliminar: `text-[#DC2626] border-[#FCA5A5] hover:bg-[#FEE2E2]` en DeleteItemButton.tsx:29-30. Es red-600 / red-300 / red-100 escrito en hex
- Callout de nota staff: `bg-amber-50 border-amber-200`, título `text-amber-600`, cuerpo `text-amber-800` (ItinerarioClient.tsx:412-414, ItinerarioList.tsx:177-181)
- Progreso: track `bg-slate-100`, relleno `bg-emerald-500` (ChecklistClient.tsx:187-189). Checkbox marcado también `bg-emerald-500 border-emerald-500` (ChecklistClient.tsx:48)
- Toast éxito: `bg-slate-900 text-white` con ícono `text-emerald-400`. Toast error: `bg-red-50 border border-red-200 text-red-700` con ícono `text-red-500` (ToastProvider.tsx:46-47, 60, 71)
- Bloque atrasado en operación: `border-l-4 border-amber-400 bg-amber-50/30`, badge `bg-red-100 text-red-600`, badge Ahora `bg-slate-900 text-white` (OperacionClient.tsx:451, 474, 479)
- Fila de familia ya llegada: `bg-green-50/30` (OperacionClient.tsx:295). Bloque de pendientes: `bg-amber-50 border-amber-200` (OperacionClient.tsx:260)
- Paleta del lado participante, distinta por completo (HelpButton.tsx, único archivo leído de ese mundo): botón `bg-[#1A1A1A]` con borde `border-[#C9A96E]/40` y texto `#C9A96E`; hoja `bg-[#111]`; texto principal `#F5F0E8`; cuerpo `#B0A898`; backdrop `bg-black/70 backdrop-blur-sm`; bordes internos `border-white/10` y `border-white/5` (HelpButton.tsx:57, 65, 69, 74, 94, 100, 108)

### Tipografia
- H1 de página: `text-2xl font-bold text-slate-900` (FamiliasClient.tsx:92, NuevoItemForm.tsx:89). Pero EditarEventoForm.tsx:132 usa `text-xl font-bold` para el mismo rol
- Encabezado de sección de formulario y de tabla, el patrón más repetido del admin: `text-xs font-semibold text-slate-500 uppercase tracking-wider` (EditarEventoForm.tsx:143, 187, 195, 235, 248; FamiliasClient.tsx:185; ItinerarioClient.tsx:324; OperacionClient.tsx:147)
- Variante que se desvía: ChecklistClient.tsx:217 usa `text-xs font-semibold text-slate-600 uppercase tracking-wide` (slate-600 y tracking-wide en vez de slate-500 y tracking-wider)
- Label de campo, escuela A (uppercase): `block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider`, con asterisco `<span className="text-red-500">*</span>` (EditarEventoForm.tsx:42-43)
- Label de campo, escuela B (sentence case): `block text-sm font-medium text-slate-700 mb-1`, con el asterisco dentro del texto del label como "Título *" (NuevoItemForm.tsx:78 y 100)
- Label de campo, escuela C (inline): `fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4` (familias/nueva/page.tsx:172-178)
- Texto de control (input, select, textarea, botón): siempre `text-sm`
- Fila de tabla: nombre `font-semibold text-slate-900`, sub-línea `text-xs text-slate-400 mt-0.5`, celda de dato `text-slate-600 text-sm` (FamiliasClient.tsx:204-205, 250)
- Métrica de tarjeta resumen: label `text-xs text-slate-500 font-medium mb-1`, valor `text-lg font-bold text-slate-900` (FamiliasClient.tsx:104-105). La métrica grande de operación sube a `text-2xl font-bold` con el denominador en `text-sm font-normal text-slate-400` (OperacionClient.tsx:172-174)
- Eyebrow de hero: `text-xs font-semibold uppercase tracking-widest text-slate-400` (OperacionClient.tsx:117). Es el único `tracking-widest` del admin
- Título de hero: `text-2xl font-semibold leading-tight mb-2` (OperacionClient.tsx:120 y 412). Versión compacta en sidebar: `text-base font-semibold leading-snug` (OperacionClient.tsx:320)
- Horas: siempre `font-mono` en operación, `text-xs font-mono text-slate-400` (OperacionClient.tsx:152, 459) o `text-sm font-mono text-slate-300` sobre el hero oscuro (OperacionClient.tsx:122). En itinerario NO son mono, solo `text-xs text-slate-400` (ItinerarioList.tsx:101)
- Micro-tipografía arbitraria: `text-[11px]` para badges y notas (OperacionClient.tsx:126, 274, 340), `text-[10px]` para timestamps y badges secundarios (FamiliasClient.tsx:281, ItinerarioClient.tsx:136 y 308, OperacionClient.tsx:155)
- Título de modal: `text-xl font-bold text-slate-900 mb-2` (ItinerarioClient.tsx:373)
- Toast: `text-sm font-medium` (ToastProvider.tsx:44)
- Botón de acción de fila: `text-xs ... font-medium` (FamiliasClient.tsx:300). Botón de formulario: `text-sm font-medium` (EditarEventoForm.tsx:297)
- El lado participante usa serif de marca: `font-[family-name:var(--font-cormorant)] text-2xl font-light` (HelpButton.tsx:74). No aparece en ningún archivo del admin

### Espaciado
- Contenedor de página de listado: `p-8 max-w-7xl` (FamiliasClient.tsx:89). Operación varía a `pt-6 px-8 max-w-7xl` (OperacionClient.tsx:540)
- Contenedor de página de formulario: `p-8 max-w-2xl` (EditarEventoForm.tsx:126, NuevoItemForm.tsx:81). El formulario inline usa `padding: 32, maxWidth: 600` (familias/nueva/page.tsx:53), que es casi lo mismo pero no igual (max-w-2xl = 672px)
- Ritmo vertical del formulario: `space-y-5` entre secciones (EditarEventoForm.tsx:140, NuevoItemForm.tsx:98), `space-y-4` entre campos dentro de una tarjeta (EditarEventoForm.tsx:142), `space-y-3` en el formulario compacto del checklist (ChecklistClient.tsx:246), `gap: 16` / `gap: 12` en el inline (familias/nueva/page.tsx:67 y 81)
- Padding de tarjeta de formulario: `p-5` (EditarEventoForm.tsx:142). Tarjeta compacta: `p-4` (ChecklistClient.tsx:246). Modal: `p-6` (ItinerarioClient.tsx:370)
- Grillas de campos: `grid grid-cols-2 gap-4` (EditarEventoForm.tsx:145, 162, 197; NuevoItemForm.tsx:104, 115, 126) y `grid grid-cols-3 gap-4` (EditarEventoForm.tsx:167). Sin variante responsive, siempre 2 o 3 columnas fijas
- Padding de control: `px-3 py-2` para todo input, select y textarea. Único caso en todo el admin sin excepción, incluido el inline (`padding: '8px 12px'`, familias/nueva/page.tsx:182)
- Botón primario de formulario: `px-6 py-2.5`. Botón primario de header: `px-4 py-2`. Botón de fila: `px-2.5 py-1`. Botón de formulario compacto: `px-4 py-1.5` (ChecklistClient.tsx:295)
- Celda de tabla: `px-4 py-3` tanto en `th` como en `td` (FamiliasClient.tsx:185, 203)
- Fila de lista: `px-5 py-3` en operación (OperacionClient.tsx:151), `px-4 py-3.5` en itinerario (ItinerarioList.tsx:99), `px-4 py-3` en checklist (ChecklistClient.tsx:43)
- Cabecera de tarjeta de lista: `px-5 py-3 border-b border-slate-100` (OperacionClient.tsx:146) o `px-4 py-2.5 bg-slate-50 border-b border-slate-100` (ChecklistClient.tsx:216)
- Barra de acciones al pie del formulario: `flex gap-3 pt-2` (EditarEventoForm.tsx:293, NuevoItemForm.tsx:195). El checklist usa `flex gap-2 pt-1` (ChecklistClient.tsx:291) y el inline `gap: 12, paddingTop: 8` (familias/nueva/page.tsx:151)
- Estado vacío: `p-12 text-center` (FamiliasClient.tsx:167 y 177, ItinerarioClient.tsx:471) o `p-10 text-center` (ChecklistClient.tsx:198)
- Header de página a contenido: `mb-6`. Barra de filtros a tabla: `mb-4` (FamiliasClient.tsx:91 y 126). Bloque de día en itinerario: `mb-8` con título `mb-3` (ItinerarioClient.tsx:99-100)
- Gap entre chips de filtro: `gap-1.5` (FamiliasClient.tsx:141). Entre botones de acción de fila: `gap-2` (FamiliasClient.tsx:297) o `gap-1.5` (ItinerarioList.tsx:139)
- Toast: contenedor `fixed bottom-6 right-6 z-[100] gap-2`; tarjeta `px-4 py-3 gap-3 min-w-[240px] max-w-[340px]` (ToastProvider.tsx:44 y 115)
- Anchos mínimos codificados a mano: `min-w-[130px]`, `min-w-[160px]`, `min-w-[170px]` en las tarjetas de resumen (FamiliasClient.tsx:103-119); `min-w-[200px]` en el buscador (FamiliasClient.tsx:133); `min-w-[600px]` en la tabla (FamiliasClient.tsx:182); `min-w-[80px]` / `min-w-[88px]` en la columna de hora (ItinerarioList.tsx:101, ItinerarioClient.tsx:119)

### Bordes
- Jerarquía de radios muy consistente: superficie `rounded-xl` (12px), hero `rounded-2xl` (OperacionClient.tsx:116), control `rounded-lg` (8px) para inputs y botones, badge de tipo `rounded-md`, badge de estado y chip de filtro `rounded-full`
- Excepción del radio: el formulario inline usa `borderRadius: 8` en inputs y `borderRadius: 6` en botones (familias/nueva/page.tsx:184 y 155). El resto del admin nunca usa 6px
- Borde por defecto: `border-slate-200`. Separador interno de filas: `border-slate-100` o `divide-y divide-slate-100` (OperacionClient.tsx:149). Separador de cabecera de tabla: `border-b border-slate-200` (FamiliasClient.tsx:184)
- Borde de input: `border border-slate-200` en Tailwind, `1px solid #d1d5db` (slate-300) en el inline (familias/nueva/page.tsx:183). Son grosores iguales pero tonos distintos
- CheckInButton usa `border-slate-300` con `hover:border-slate-400` (CheckInButton.tsx:87), un escalón más oscuro que el resto de los botones secundarios que usan slate-200
- Foco, cuatro tratamientos distintos en el mismo panel: `focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent` (EditarEventoForm.tsx:51), `focus:outline-none focus:ring-2 focus:ring-slate-900` sin border-transparent (FamiliasClient.tsx:133, EditarEventoForm.tsx:152), `focus:outline-none focus:ring-2 focus:ring-slate-900/10` (NuevoItemForm.tsx:77), `outline-none focus:border-slate-400` sin ring (ChecklistClient.tsx:256), y `outline: 'none'` sin nada (familias/nueva/page.tsx:186)
- Sombras: `shadow-sm` en toda superficie de contenido, `shadow-lg` en el toast (ToastProvider.tsx:44), `shadow-2xl` en el modal (ItinerarioClient.tsx:361), `shadow-sm` también como señal de estado activo en el segmented control (ItinerarioClient.tsx:453) y en el selector de rol (OperacionClient.tsx:549)
- Borde punteado como affordance de "agregar": `border border-dashed border-slate-300 hover:border-slate-400` (ChecklistClient.tsx:239). Único uso de dashed en todo el admin
- Checkbox: `w-5 h-5 rounded border-2` con `border-slate-300` sin marcar (ChecklistClient.tsx:46-49)
- Tab activo: `border-b-2 -mb-px border-slate-900` sobre contenedor `border-b border-slate-200` (ItinerarioClient.tsx:221 y 229-231)
- Marca lateral de estado: `border-l-4 border-amber-400` para item atrasado (OperacionClient.tsx:451)
- Fieldset (solo en el formulario inline): `border: '1px solid #e5e7eb', borderRadius: 8, padding: 16` con legend `padding: '0 4px'` (familias/nueva/page.tsx:79-80)
- Lado participante: `rounded-t-2xl border-t border-[#C9A96E]/20` para la hoja inferior, `border border-white/10 rounded-xl` para el item de acordeón (HelpButton.tsx:69 y 94)

### Patrones de componente

**Superficie de contenido** · `portal/app/(admin)/eventos/[id]/familias/FamiliasClient.tsx:181`
```
bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden
```
El envoltorio de absolutamente todo: tablas, listas, formularios, estados vacíos. Si PersonaLab adopta un solo token, que sea este. El `overflow-hidden` es lo que recorta las esquinas de la primera y última fila.

**Botón primario de header (compacto)** · `portal/app/(admin)/eventos/[id]/familias/FamiliasClient.tsx:95`
```
px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors
```
Acción principal de una página de listado, casi siempre un <Link> con texto "+ Agregar X". Cuando va dentro de un estado vacío se le agrega `inline-block` (FamiliasClient.tsx:171).

**Botón primario de formulario (alto)** · `portal/app/(admin)/eventos/[id]/editar/EditarEventoForm.tsx:297`
```
px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-60
```
Submit al pie de un formulario largo. Su gemelo en NuevoItemForm.tsx:199 usa `bg-[#111827] hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed`. Unificar en uno solo antes de copiar.

**Botón secundario / Cancelar** · `portal/app/(admin)/eventos/[id]/itinerario/nuevo/NuevoItemForm.tsx:205`
```
px-6 py-2.5 bg-white text-slate-700 border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors
```
Siempre a la derecha del primario dentro de `flex gap-3 pt-2`. En EditarEventoForm.tsx:303 es idéntico pero sin `bg-white` ni `font-medium`. En ChecklistClient.tsx:302 es la versión compacta `px-4 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50`.

**Botón fantasma de fila** · `portal/app/(admin)/eventos/[id]/familias/FamiliasClient.tsx:300`
```
text-xs text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium
```
Acciones por fila (Editar, Ficha). El equivalente en itinerario omite `font-medium` y `hover:border-slate-300` y agrega `whitespace-nowrap` (ItinerarioList.tsx:142). Van agrupadas en `flex items-center gap-2`.

**Botón peligro** · `portal/app/(admin)/eventos/[id]/itinerario/DeleteItemButton.tsx:29`
```
px-2.5 py-1 text-xs text-[#DC2626] border border-[#FCA5A5] rounded-lg transition-colors whitespace-nowrap cursor-pointer bg-transparent  +  hover:bg-[#FEE2E2]  |  opacity-60 cursor-not-allowed cuando loading
```
Única variante destructiva explícita del admin. Es texto rojo con borde rosa, nunca relleno rojo. Dispara `confirm()` nativo antes de borrar (línea 17) y muestra '...' mientras carga.

**Acción destructiva revelada en hover** · `portal/app/(admin)/eventos/[id]/checklist/ChecklistClient.tsx:69`
```
flex-shrink-0 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all text-xs px-1  (el contenedor de la fila lleva `group` en la línea 43)
```
Segundo idioma para borrar, distinto del anterior: una ✕ que aparece al pasar el mouse. Bueno para listas densas, inaccesible por teclado y táctil. Elegir uno de los dos para PersonaLab.

**Input de texto canónico** · `portal/app/(admin)/eventos/[id]/editar/EditarEventoForm.tsx:51`
```
w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white
```
El más completo de los cuatro que existen. Se usa igual para `type=text`, `date`, `number` y `email`. Ningún input del admin tiene `id`, así que el label no está asociado.

**Label uppercase (escuela A)** · `portal/app/(admin)/eventos/[id]/editar/EditarEventoForm.tsx:42`
```
block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider   +   requerido: <span className="text-red-500">*</span>
```
El que domina en el formulario más largo del admin. Es el que recomiendo para PersonaLab porque es el mismo token que los encabezados de sección y de tabla, lo que hace que todo el chrome rime.

**Label sentence case (escuela B)** · `portal/app/(admin)/eventos/[id]/itinerario/nuevo/NuevoItemForm.tsx:78`
```
block text-sm font-medium text-slate-700 mb-1   +   el asterisco va dentro del texto: "Título *"
```
Se declara como constante `labelCls` y se reusa en todo el archivo. Es más legible que la escuela A pero pesa visualmente lo mismo que el input. Está en conflicto directo con EditarEventoForm.

**Textarea** · `portal/app/(admin)/eventos/[id]/editar/EditarEventoForm.tsx:228`
```
w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white resize-none   +   rows={3} o rows={4}
```
Misma caja que el input más `resize-none` y `rows`. En NuevoItemForm.tsx:163 y 192 intentan `resize-vertical`, que no existe en Tailwind 3.4.1: ahí el resize queda en el default del navegador.

**Select** · `portal/app/(admin)/eventos/[id]/editar/EditarEventoForm.tsx:152`
```
w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white
```
Sin flecha custom ni appearance-none, se usa el select nativo. En ChecklistClient.tsx:269 agrega `text-slate-700`. En NuevoItemForm.tsx:129 comparte literalmente la misma constante que los inputs.

**Sección de formulario (tarjeta titulada)** · `portal/app/(admin)/eventos/[id]/editar/EditarEventoForm.tsx:142-143`
```
contenedor: bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm  |  título h2: text-xs font-semibold text-slate-500 uppercase tracking-wider  |  subtítulo opcional: text-xs text-slate-400 mt-0.5
```
La unidad de composición de todo formulario largo. Cinco secciones apiladas con `space-y-5`: Información básica, La Nube, Datos comerciales, Notas internas, Información para participantes. Es el patrón que PersonaLab debería heredar tal cual para sus editores.

**Banner de error de formulario** · `portal/app/(admin)/eventos/[id]/itinerario/nuevo/NuevoItemForm.tsx:93`
```
bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-red-700 text-sm
```
Único mecanismo de error visible del admin. Va entre el H1 y el <form>, renderizado condicionalmente con `{error && (...)}`. Muestra `error.message` crudo de Supabase, texto en inglés. En EditarEventoForm.tsx:135 es igual con `mb-5`.

**Barra de acciones del formulario** · `portal/app/(admin)/eventos/[id]/editar/EditarEventoForm.tsx:293`
```
flex gap-3 pt-2   con [primario, secundario] en ese orden, izquierda a derecha
```
Sin borde superior, sin fondo, sin sticky. Simplemente el último hijo del `space-y-5`. El secundario es un <Link> de navegación, no un botón, en EditarEventoForm y NuevoItemForm.

**Estado vacío con CTA** · `portal/app/(admin)/eventos/[id]/familias/FamiliasClient.tsx:167-175`
```
bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm  |  texto: text-slate-400 text-sm mb-4  |  CTA: el botón primario compacto con inline-block
```
Hay dos niveles: vacío de verdad (con CTA) y vacío por filtro (solo texto, sin CTA, FamiliasClient.tsx:177-179). Buena distinción, vale la pena copiarla. ItinerarioClient.tsx:471 es idéntico; ChecklistClient.tsx:198 usa `p-10` y un CTA secundario.

**Cabecera de tabla** · `portal/app/(admin)/eventos/[id]/familias/FamiliasClient.tsx:184-185`
```
<tr className="bg-slate-50 border-b border-slate-200">  +  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
```
La tabla es `w-full min-w-[600px] text-sm border-collapse` (línea 182). Nueve columnas: Familia, Estado, Intake, Acuerdos, Habitación, Dieta, Check-in, Video, Acciones. La última th pierde el `text-left`, detalle no intencional.

**Fila de tabla** · `portal/app/(admin)/eventos/[id]/familias/FamiliasClient.tsx:198-208`
```
tr: hover:bg-slate-50 transition-colors  +  border-b border-slate-100 solo si i < filtered.length - 1  |  td: px-4 py-3  |  celda principal: div font-semibold text-slate-900  +  div text-xs text-slate-400 mt-0.5
```
Patrón de dos líneas por celda principal (nombre fuerte arriba, contexto tenue abajo). El borde condicional por índice se repite en ChecklistClient.tsx:223 y ItinerarioList.tsx:96. Con `divide-y divide-slate-100` en el tbody se logra lo mismo sin la condición, como sí hace OperacionClient.tsx:149.

**Badge pastilla de estado** · `portal/app/(admin)/eventos/[id]/familias/FamiliasClient.tsx:49`
```
inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold   +   par bg-{color}-100 text-{color}-700
```
Fórmula universal del admin. Variante compacta `px-2 py-0.5` para el semáforo de fila (línea 213) y `gap-1` cuando lleva un ✓ literal como prefijo del texto. El mapa vive en un `Record<string,string>` al inicio del archivo con fallback `bg-slate-100 text-slate-600`.

**Badge cuadrado de categoría** · `portal/app/(admin)/eventos/[id]/itinerario/ItinerarioClient.tsx:50`
```
inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold   +   TIPO_COLORS[tipo] ?? 'bg-slate-100 text-slate-600'
```
`rounded-md` para taxonomía (tipo de item), `rounded-full` para estado. Distinción de forma que sí vale la pena mantener en PersonaLab: la forma dice si el dato es una categoría o un progreso.

**Chip de filtro** · `portal/app/(admin)/eventos/[id]/familias/FamiliasClient.tsx:146-150`
```
base: px-3 py-1.5 text-xs font-medium rounded-full transition-colors  |  activo: bg-slate-900 text-white  |  inactivo: bg-white border border-slate-200 text-slate-600 hover:bg-slate-50
```
Grupo en `flex gap-1.5`, precedido de un input de búsqueda `min-w-[200px]` y seguido de un botón de texto "Limpiar filtros" (`text-xs text-slate-400 hover:text-slate-600`, línea 159) que solo aparece si hay filtros activos. El contador de resultados vive inline al lado del input (línea 136).

**Segmented control de vista** · `portal/app/(admin)/eventos/[id]/itinerario/ItinerarioClient.tsx:448-466`
```
contenedor: flex items-center bg-slate-100 rounded-lg p-1  |  activo: px-3 py-1.5 text-sm font-medium rounded-md bg-white text-slate-900 shadow-sm  |  inactivo: px-3 py-1.5 text-sm font-medium rounded-md text-slate-500 hover:text-slate-700
```
El estado activo se comunica con superficie blanca elevada dentro de un riel gris, no con color. Las etiquetas llevan emoji de prefijo: "☰ Lista", "⏱ Horario".

**Tabs subrayadas** · `portal/app/(admin)/eventos/[id]/itinerario/ItinerarioClient.tsx:221-243`
```
contenedor: flex items-center gap-1 border-b border-slate-200 mb-6  |  tab: px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors  |  activo: border-slate-900 text-slate-900  |  inactivo: border-transparent text-slate-500 hover:text-slate-700
```
El `-mb-px` es lo que hace que el subrayado del tab tape el borde del contenedor. Cada tab puede llevar un sufijo tenue: `ml-1.5 text-xs text-slate-400 font-normal` con la fecha (línea 237).

**Pills de selector de modo** · `portal/app/(admin)/eventos/[id]/operacion/OperacionClient.tsx:547-551`
```
base: px-4 py-2 rounded-xl text-sm font-semibold transition-all  |  activo: bg-slate-900 text-white shadow-sm  |  inactivo: border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 bg-white
```
Tercer idioma para lo mismo que el segmented control y las tabs. Aquí es `rounded-xl` y `font-semibold`, más grande. La selección persiste en localStorage con clave `op_role_${eventId}` (línea 530).

**Toast** · `portal/components/ToastProvider.tsx:43-47 y 114-115`
```
tarjeta: flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium min-w-[240px] max-w-[340px] transition-all duration-200  |  success: bg-slate-900 text-white con ícono check w-4 h-4 text-emerald-400  |  error: bg-red-50 border border-red-200 text-red-700 con ícono ✕ w-4 h-4 text-red-500  |  entrada: opacity-0 translate-y-2 → opacity-100 translate-y-0  |  contenedor: fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none, con cada hijo en pointer-events-auto
```
Doble requestAnimationFrame para disparar la animación de entrada (línea 28), auto-cierre a 3000ms, salida de 200ms antes de desmontar. `role="alert"` en la tarjeta y `aria-live="polite" aria-atomic="false"` en el contenedor. Botón de cerrar con `aria-label="Cerrar"`. Se consume con `const { addToast } = useToast()` y `addToast('mensaje', 'success' | 'error')`.

**Modal centrado** · `portal/app/(admin)/eventos/[id]/itinerario/ItinerarioClient.tsx:359-368`
```
wrapper: fixed inset-0 z-50 flex items-center justify-center p-4  |  backdrop: absolute inset-0 bg-black/40 con onClick={onClose}  |  panel: relative bg-white rounded-xl shadow-2xl max-w-[480px] w-full max-h-[90vh] overflow-y-auto con contenido en p-6  |  cerrar: absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors
```
Único modal del admin. El título lleva `pr-8` para no chocar con la ✕ (línea 372). Al pie repite la barra `flex gap-3 pt-2` con primario Editar y secundario Cerrar. Sin Escape, sin focus trap, sin role=dialog.

**Bottom sheet (lado participante)** · `portal/components/HelpButton.tsx:63-71`
```
backdrop: fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end con onClick={() => setOpen(false)}  |  hoja: bg-[#111] rounded-t-2xl border-t border-[#C9A96E]/20 px-5 pt-5 pb-10 max-h-[80vh] overflow-y-auto con onClick={e => e.stopPropagation()}  |  lanzador: fixed bottom-20 right-4 z-40 w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#C9A96E]/40 text-[#C9A96E] text-sm font-bold flex items-center justify-center shadow-lg
```
Patrón móvil, contenido pre-escrito por `pageId` en un `Record` estático (líneas 5-39). El `stopPropagation` en la hoja es lo que evita que se cierre al tocar dentro. El `bottom-20` deja espacio para la barra de navegación inferior.

**Acordeón de fila expandible** · `portal/app/(admin)/eventos/[id]/itinerario/ItinerarioList.tsx:107-136 y 151-153`
```
toggle: button className="flex-1 flex items-center gap-2 text-left min-w-0" con disabled={!hasDetails}  |  chevron: w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 + rotate-180 cuando abierto  |  cuerpo: px-4 pb-4 pt-0 border-t border-slate-50 bg-slate-50/60 con el contenido en pl-[80px] space-y-2 pt-3
```
Lo mejor de este patrón: `hasDetails` se calcula antes (línea 86) y si no hay nada que mostrar el toggle se deshabilita y el chevron no se dibuja. El `pl-[80px]` alinea el detalle con la columna de título, saltando la columna de hora. La versión participante del mismo acordeón está en HelpButton.tsx:96-111.

**Barra de progreso** · `portal/app/(admin)/eventos/[id]/checklist/ChecklistClient.tsx:183-191`
```
meta: flex items-center justify-between text-xs text-slate-500 mb-1.5 con "N/M completadas" a la izquierda y "X%" a la derecha  |  track: w-full bg-slate-100 rounded-full h-2  |  fill: bg-emerald-500 h-2 rounded-full transition-all duration-500 con style={{ width: `${pct}%` }}
```
Solo se renderiza si `totalAll > 0`. La transición de 500ms es la más lenta del admin y hace que marcar una tarea se sienta como avance.

**Checkbox de tarea** · `portal/app/(admin)/eventos/[id]/checklist/ChecklistClient.tsx:43-64`
```
botón: flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors  |  marcado: bg-emerald-500 border-emerald-500 text-white con svg w-3 h-3 strokeWidth={3}  |  sin marcar: border-slate-300 hover:border-slate-400  |  título marcado: line-through text-slate-400  |  fila completa marcada: opacity-60
```
Es un <button>, no un <input type=checkbox>, sin role ni aria-checked. Tres señales redundantes de "hecho" a la vez: relleno, tachado y opacidad de la fila. Funciona bien visualmente.

**Botón fantasma dashed para agregar** · `portal/app/(admin)/eventos/[id]/checklist/ChecklistClient.tsx:239`
```
flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 border border-dashed border-slate-300 hover:border-slate-400 px-4 py-2.5 rounded-xl w-full transition-colors justify-center
```
Ocupa todo el ancho al pie de la lista y al hacer clic se reemplaza por el formulario inline. El patrón exacto que PersonaLab necesita para "agregar pregunta" o "agregar bloque".

**Formulario inline de creación rápida** · `portal/app/(admin)/eventos/[id]/checklist/ChecklistClient.tsx:244-307`
```
form: bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3  |  título h4: text-sm font-semibold text-slate-800  |  campos: w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-slate-400 placeholder-slate-400  |  acciones: flex gap-2 pt-1 con px-4 py-1.5
```
El primer input lleva `autoFocus`. Al enviar con éxito: limpia el estado, cierra el formulario y lanza `addToast('Tarea agregada', 'success')` (líneas 146-149). El submit está deshabilitado con `disabled={saving || !newTask.titulo.trim()}` (línea 294), la única validación reactiva de todo el admin. Es el mejor modelo de autoría que hay en el repositorio.

**Campo condicional por opción __custom__** · `portal/app/(admin)/eventos/[id]/itinerario/nuevo/NuevoItemForm.tsx:173-187 y ChecklistClient.tsx:279-289`
```
<option value="__custom__">Otro (escribir)</option>  y luego  {form.responsable === '__custom__' && <input className={`${inputCls} mt-2`} .../>}
```
Truco recurrente: un select con opción escape que revela un input de texto libre debajo. Al guardar se resuelve con un ternario (NuevoItemForm.tsx:51-53). PersonaLab lo va a necesitar para taxonomías abiertas.

**Botón optimista con deshacer** · `portal/app/(admin)/eventos/[id]/familias/CheckInButton.tsx:65-91`
```
por hacer: text-xs text-slate-600 border border-slate-300 px-2.5 py-1 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors font-medium disabled:opacity-40 whitespace-nowrap  |  hecho: span inline-flex items-center gap-1.5 con pill bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-semibold que dice "Llegó HH:MM", más botón × text-slate-400 hover:text-slate-600 text-xs font-bold leading-none disabled:opacity-40 con title="Deshacer check-in"
```
El mejor patrón de guardado del admin: escribe el estado optimista, revierte y lanza toast de error si falla, y siempre llama `router.refresh()`. El resultado no es un mensaje sino el propio control transformándose en su estado final con el dato (la hora) incorporado. Copiarlo tal cual.

**Toggle binario con estado pendiente** · `portal/app/(admin)/eventos/[id]/operacion/OperacionClient.tsx:379-389`
```
base: text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all disabled:opacity-50  |  activado: bg-red-100 border-red-300 text-red-700 con label 'ATRASADO'  |  desactivado: bg-transparent border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 con label 'Atrasado'  |  cargando: label '…'
```
Usa `useTransition` sobre una server action. El estado se comunica también por mayúsculas del label, no solo por color. El label de carga se reduce a un solo carácter para que el botón no cambie de ancho, detalle bueno.

**Callout de nota interna** · `portal/app/(admin)/eventos/[id]/itinerario/ItinerarioClient.tsx:411-416`
```
bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800  |  título: font-semibold text-xs uppercase tracking-wide text-amber-600 mb-1  |  cuerpo: whitespace-pre-wrap
```
Contenido visible solo para admin, siempre condicionado a `isAdmin && item.notas_staff`. El `whitespace-pre-wrap` es lo que respeta los saltos de línea del textarea. Versión compacta en ItinerarioList.tsx:177 con `p-2.5` y `text-xs`.

**Tarjeta de métrica** · `portal/app/(admin)/eventos/[id]/familias/FamiliasClient.tsx:103-106`
```
flex flex-col items-start px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm min-w-[130px]  |  label: text-xs text-slate-500 font-medium mb-1  |  valor: text-lg font-bold text-slate-900
```
Cinco tarjetas en `flex flex-wrap gap-3 mb-6`. El valor casi siempre es una fracción "N/M" en texto plano. La versión de operación es más grande y agrega un badge de estado a la derecha (OperacionClient.tsx:169-186).

**Hero oscuro** · `portal/app/(admin)/eventos/[id]/operacion/OperacionClient.tsx:116-133`
```
rounded-2xl bg-[#0C0C0C] text-white p-8 mb-6  |  eyebrow: text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3  |  título: text-2xl font-semibold leading-tight mb-2  |  meta: text-slate-300 text-sm font-mono  |  detalle: text-xs text-slate-500 mt-2
```
Único bloque de alto contraste del admin, reservado para "lo que está pasando ahora". Versión sidebar en `rounded-xl p-5` con título `text-base` (línea 314). Sirve de ancla en una pantalla que si no sería toda blanca.

**Lista con divisores** · `portal/app/(admin)/eventos/[id]/operacion/OperacionClient.tsx:145-160`
```
contenedor: bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden  |  cabecera: px-5 py-3 border-b border-slate-100 con h3 text-xs font-semibold uppercase tracking-wider text-slate-500  |  cuerpo: divide-y divide-slate-100  |  fila: px-5 py-3 flex items-center gap-4
```
Alternativa a la tabla cuando hay pocas columnas. Más limpio que el borde condicional por índice que usan FamiliasClient e ItinerarioList. Este es el que PersonaLab debería usar.

**Breadcrumb de retorno** · `portal/app/(admin)/eventos/[id]/itinerario/nuevo/NuevoItemForm.tsx:82-90`
```
wrapper mb-6 con <Link className="text-sm text-slate-500 hover:text-slate-700 transition-colors">← Itinerario</Link>  seguido de  <h1 className="text-2xl font-bold text-slate-900 mt-3">
```
Toda página de formulario abre así: flecha de regreso tenue arriba, título abajo. En EditarEventoForm.tsx:128 va envuelto en <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6"> con el texto "← Volver al evento".

**Fieldset agrupador (solo en el formulario inline)** · `portal/app/(admin)/eventos/[id]/familias/nueva/page.tsx:79-104`
```
fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, margin: 0 }}  |  legend style={{ fontSize: 13, fontWeight: 600, color: '#374151', padding: '0 4px' }}  |  contenido: flex flex-col gap 12
```
Único uso de <fieldset>/<legend> semánticos en todo el admin, y está en el peor archivo. La idea de agrupar "Persona 1" y "Persona 2 (opcional)" es buena y vale la pena rescatarla, pero traducida al patrón de tarjeta titulada de EditarEventoForm.

### Hallazgos
- TRES DIALECTOS DE ESTILO CONVIVEN. Tailwind con tokens slate (la mayoría), Tailwind con hex crudos (`bg-[#111827]` en ItinerarioClient.tsx:422 y 475 y NuevoItemForm.tsx:199, `bg-[#0C0C0C]` en OperacionClient.tsx:116, `text-[#DC2626]` en DeleteItemButton.tsx:29), y objetos `React.CSSProperties` inline (familias/nueva/page.tsx:172-189). El mismo negro se escribe de tres formas. PersonaLab tiene que elegir uno y no negociar.
- familias/nueva/page.tsx ES EL PEOR ARCHIVO A IMITAR. Es la única página de creación sin Tailwind. Rompe cinco tokens a la vez: radio 6 en botones y 8 en inputs en vez de rounded-lg, primario `#111` en vez de slate-900, borde `#d1d5db` (slate-300) en vez de slate-200, `outline: 'none'` sin ningún reemplazo de foco (línea 186), y `maxWidth: 600` en vez de max-w-2xl (672px). Si PersonaLab necesita un formulario de alta, el modelo es EditarEventoForm, no este.
- CUATRO TRATAMIENTOS DE FOCO EN CUATRO ARCHIVOS HERMANOS. `focus:ring-2 focus:ring-slate-900 focus:border-transparent` (EditarEventoForm.tsx:51), `focus:ring-2 focus:ring-slate-900` sin border-transparent (FamiliasClient.tsx:133), `focus:ring-2 focus:ring-slate-900/10` que es casi invisible (NuevoItemForm.tsx:77), `focus:border-slate-400` sin anillo (ChecklistClient.tsx:256), y ninguno en el inline. Para un producto que va a ser sobre todo formularios, esto es lo primero que hay que fijar.
- NINGÚN INPUT DEL ADMIN TIENE `id` NI NINGÚN `<label>` TIENE `htmlFor`. Verificado en EditarEventoForm.tsx:42-52, NuevoItemForm.tsx:100-101, ChecklistClient.tsx:250-257 y familias/nueva/page.tsx:69-76. Tocar la etiqueta no enfoca el campo y los lectores de pantalla no asocian nada. Es una deuda de una línea por campo que PersonaLab no debería heredar.
- NO EXISTE VALIDACIÓN, SOLO `required` DEL NAVEGADOR. Cero mensajes por campo, cero estado visual de campo inválido, cero `aria-invalid`. El único error que ve el usuario es el mensaje crudo de Postgres: `setError(error.message)` en familias/nueva/page.tsx:46 y NuevoItemForm.tsx:73. Se le muestra texto de base de datos en inglés a una coordinadora. La única excepción sana es ChecklistClient.tsx:294, que deshabilita el submit con `!newTask.titulo.trim()`.
- BUG DE GUARDADO EN EDITAR EVENTO. `updateEvento` (editar/actions.ts) envuelve su `redirect()` en un try/catch, así que el NEXT_REDIRECT que Next lanza internamente queda atrapado y la función retorna `{ error: 'NEXT_REDIRECT' }` en vez de navegar. Del otro lado, EditarEventoForm.tsx:93-115 hace `await updateEvento(...)` y nunca inspecciona el valor de retorno; su catch (línea 116) solo corre si algo se lanza. Resultado por lectura de código: al guardar, el botón pasa a 'Guardando...' y luego vuelve a 'Guardar cambios' sin redirect, sin toast y sin banner. Los datos sí se escriben pero el usuario no recibe absolutamente ninguna confirmación. El comentario de la línea 117 que dice que redirect lanza internamente ya no describe lo que hace la action. No lo ejecuté, es análisis estático.
- CINCO PATRONES DE GUARDADO DISTINTOS PARA LA MISMA CLASE DE ACCIÓN. (1) Optimista con rollback silencioso y `console.error`, el usuario no ve nada si falla: ChecklistClient.tsx:99-115. (2) Optimista con rollback y toast de error: CheckInButton.tsx:40-45. (3) Banner arriba más redirect al éxito, sin toast: NuevoItemForm.tsx:73-74 y familias/nueva/page.tsx:45-49. (4) Toast de éxito sin navegación: ChecklistClient.tsx:149. (5) Nada en absoluto: EditarEventoForm. PersonaLab necesita una sola regla, y la mejor candidata es la de CheckInButton.
- ChecklistClient IGNORA LOS ERRORES DE ESCRITURA. En el alta (líneas 144-152) el `if (!error && data)` no tiene rama else: si el insert falla, `saving` vuelve a false, el formulario sigue lleno y no se dice nada. En el borrado (líneas 117-121) directamente no se lee el error y la fila ya desapareció de la UI. En el toggle (línea 111) el error solo va a la consola.
- CUATRO TEXTOS DISTINTOS PARA 'CARGANDO'. `'Guardando…'` con puntos suspensivos U+2026 (ChecklistClient.tsx:297, VideoEntregadoButton.tsx:33), `'Guardando...'` con tres puntos separados (NuevoItemForm.tsx:201, EditarEventoForm.tsx:299, familias/nueva/page.tsx:157), `'...'` a secas (DeleteItemButton.tsx:33) y `'…'` a secas (OperacionClient.tsx:388). No hay spinner en ningún lado del admin: el único indicador de proceso es el texto del botón.
- TRES OPACIDADES DE DESHABILITADO. `disabled:opacity-50` (ChecklistClient.tsx:295, OperacionClient.tsx:382), `disabled:opacity-60` (EditarEventoForm.tsx:297, NuevoItemForm.tsx:199), `disabled:opacity-40` (CheckInButton.tsx:87, VideoEntregadoButton.tsx:31). Y solo NuevoItemForm.tsx:199 agrega `disabled:cursor-not-allowed`; en el inline el cursor se maneja a mano con un ternario (familias/nueva/page.tsx:155).
- EL MAPA DE COLOR POR TIPO ESTÁ DUPLICADO Y CONTRADICHO. `TIPO_COLORS` aparece literal dos veces (ItinerarioClient.tsx:36-46 y ItinerarioList.tsx:30-40) y una tercera versión distinta vive en `tipoBadgeClass` de OperacionClient.tsx:59-69, donde taller pasa de purple a indigo, actividad de blue a green y logistica de gray a blue. El mismo item se pinta de dos colores según en qué pantalla lo mire el usuario. En PersonaLab, ese mapa debe ser un módulo importado, no una constante copiada.
- CÓDIGO MUERTO CON MARKUP COMPLETO. `CascadeView` ocupa 93 líneas (ItinerarioClient.tsx:72-164) y nunca se renderiza: la vista 'cascade' delega en `ItinerarioList` (línea 481). Sobrevive con su propio layout de columnas lado a lado que nadie ve. Además `eventName` y `teamMembers` se destructuran sin usarse (línea 440), este último ya renombrado a `_teamMembers` para callar al linter.
- CLASE DE TAILWIND QUE NO EXISTE. `resize-vertical` en NuevoItemForm.tsx:163 y 192 no es una utilidad de Tailwind 3.4.1 (portal/package.json:26; portal/tailwind.config.ts no declara plugins ni extiende resize). Las utilidades válidas son resize-none, resize-y, resize-x, resize. Esas dos textareas quedan con el resize por defecto del navegador, no con el que el autor creía estar aplicando. EditarEventoForm sí usa `resize-none` correctamente.
- CONFIRMACIONES DESTRUCTIVAS CON `confirm()` NATIVO. ChecklistClient.tsx:118 y DeleteItemButton.tsx:17. El diálogo del sistema operativo rompe por completo el lenguaje visual del panel, y esto pese a que en ItinerarioClient.tsx:357 ya existe un modal propio bien construido que podría servir de base. PersonaLab, donde borrar una pregunta o una versión es destructivo de verdad, necesita un diálogo de confirmación real.
- EL MODAL NO ES ACCESIBLE. ItinerarioClient.tsx:359-437 no cierra con Escape, no atrapa el foco, no bloquea el scroll del body, no tiene `role="dialog"` ni `aria-modal`. Solo tiene backdrop clicable (línea 360). El bottom sheet de HelpButton.tsx:63-71 tiene exactamente los mismos huecos.
- EL TOAST NO TIENE COLA NI LÍMITE, Y SOLO DOS TIPOS. Auto-cierre fijo de 3000ms (ToastProvider.tsx:35), sin tope de toasts simultáneos: marcar diez tareas seguidas apila diez tarjetas en `flex-col` hasta salirse de la pantalla. `ToastType` es solo `'success' | 'error'` (línea 5), no hay info ni warning ni loading. Y los pesos visuales están invertidos: el éxito es una tarjeta negra sólida y el error es una tarjeta clara con borde (líneas 46-47), o sea lo rutinario grita más que lo que salió mal.
- LA TABLA DE FAMILIAS SE CORTA EN PANTALLAS ANGOSTAS. Nueve columnas con `min-w-[600px]` (FamiliasClient.tsx:182) dentro de un contenedor con `overflow-hidden` (línea 181) y sin `overflow-x-auto` en ningún ancestro. Debajo de ~600px de contenido disponible el usuario no puede llegar a la columna de Acciones. Además no hay ordenamiento ni paginación: el filtro es puramente cliente sobre el array completo (líneas 71-84).
- LECTURA DE localStorage DURANTE EL RENDER. El inicializador de `useState` en OperacionClient.tsx:512-518 lee localStorage, lo que puede desincronizar el HTML del servidor con el del cliente. El propio autor lo parchea con un `useEffect` justo debajo (líneas 521-526) cuyo comentario dice literalmente que maneja el desajuste de SSR. Patrón a no copiar: el estado persistido debe leerse solo en el efecto.
- UN CLIENTE DE SUPABASE NUEVO POR RENDER. `createBrowserClient(...)` se llama en el cuerpo del componente en ChecklistClient.tsx:94, CheckInButton.tsx:25, NuevoItemForm.tsx:17, DeleteItemButton.tsx:11 y familias/nueva/page.tsx:10. Ninguno está memoizado, y en ChecklistClient ese objeto además es dependencia de dos `useCallback` (líneas 115 y 121), así que los callbacks se recrean en cada render.
- EL ADMIN Y EL PARTICIPANTE SON DOS PRODUCTOS DISTINTOS SIN PUENTE. HelpButton solo se monta en siete páginas de portal/app/(participant)/ y en ninguna del admin, y usa dorado `#C9A96E` sobre negro con serif Cormorant. El admin es slate sobre blanco con la fuente por defecto. No comparten ni un token. PersonaLab tiene que decidir si es un tercer mundo o si se ancla a uno de los dos, porque hoy no hay una capa común de la que colgarse.
- GUION LARGO EN COPY VISIBLE, CONTRA LA REGLA DEL USUARIO. Está en OperacionClient.tsx:262 ('Pendientes de llegar — {pending.length}'), NuevoItemForm.tsx:174 ('— Sin asignar —') y 176 ('{m.nombre} — {m.rol}'), y HelpButton.tsx:24 y 33 dentro del texto de las FAQ. Los guiones cortos de los rangos de hora ('–' en ItinerarioList.tsx:103 y OperacionClient.tsx:123) son otra cosa y sí están bien. PersonaLab debería nacer limpio de esto.
- LO QUE SÍ HAY QUE COPIAR SIN TOCAR. Cuatro decisiones del admin están bien resueltas y se sostienen: (1) la escala de radios que codifica jerarquía (rounded-xl superficie, rounded-lg control, rounded-md categoría, rounded-full estado); (2) el estado vacío en dos niveles, con CTA cuando está vacío de verdad y sin CTA cuando el vacío lo causó un filtro (FamiliasClient.tsx:167 vs 177); (3) el `hasDetails` que deshabilita el toggle y esconde el chevron cuando no hay nada que expandir (ItinerarioList.tsx:86 y 109-110); (4) el CheckInButton, que en vez de mostrar un mensaje transforma el propio control en su estado final con el dato incorporado y un deshacer al lado (CheckInButton.tsx:65-80). Ese cuarto punto es el modelo de feedback que debería regir toda la autoría de PersonaLab.

## Lectura 3

El chasis admin de Trascendencia es un shell horizontal, no lateral: una barra fija de 56px (h-14) arriba, y en las paginas de evento una segunda barra pegajosa de 48px (sticky top-14) que suma 104px de cromo, todo sobre un lienzo bg-slate-50 (#f8fafc). No hay barra lateral viva; portal/components/AdminNav.tsx declara un aside w-[240px] con paleta oscura #111111, pero no esta importado en ningun archivo del proyecto, es codigo muerto. El lenguaje visual es Tailwind de fabrica sin tokens propios: tailwind.config.ts solo extiende background y foreground apuntando a variables CSS que globals.css nunca define y que nadie usa, asi que la paleta real es la escala slate mas azul, ambar, esmeralda, rojo y violeta, con una capa de hexadecimales sueltos que duplican esos mismos colores. La tipografia es DM Sans en un solo eje, con una escala practicamente binaria: text-xs y text-sm cubren el 90 por ciento del admin, text-2xl bold es el unico titulo de pagina, y Cormorant Garamond esta cargado pero jamas se usa en el admin. La sensacion final es la de un panel operativo sobrio y denso, tarjetas blancas rounded-xl con shadow-sm sobre gris muy claro, correcto pero con cuatro disciplinas de contenedor distintas y sin jerarquia de titulo en la pagina de detalle.

### Colores
- #f8fafc bg-slate-50: lienzo de toda el area de contenido admin, en portal/app/(admin)/layout.tsx:26; tambien fondo del thead de tabla en portal/app/(admin)/usuarios/page.tsx:21 y hover de fila en usuarios/page.tsx:32
- #ffffff bg-white: barra superior (portal/components/AdminTopNav.tsx:36), sub-nav de evento (portal/app/(admin)/eventos/[id]/EventSubNav.tsx:41) y superficie de toda tarjeta y tabla
- #e2e8f0 border-slate-200: borde estructural estandar. Sub-nav (EventSubNav.tsx:41), tarjetas (eventos/[id]/page.tsx:175, 198, 224, 262, 299), wrapper de tabla (usuarios/page.tsx:18), borde de thead (usuarios/page.tsx:21), botones secundarios (eventos/[id]/page.tsx:148)
- #E5E7EB literal (gray-200 de Tailwind, NO slate-200): unico borde de la barra superior, portal/components/AdminTopNav.tsx:36. Es el unico lugar del chasis que usa la escala gray en vez de slate
- #f1f5f9 border-slate-100 / bg-slate-100: divisores entre filas de lista (eventos/[id]/page.tsx:176, 186, 209; dashboard/page.tsx:114, 236), borde de botones terciarios de la sidebar de acciones (eventos/[id]/page.tsx:237, 253), fondo de pill de nav activa (AdminTopNav.tsx:30), fondo de badge neutro y de contadores
- #0f172a bg-slate-900: negro primario. Boton primario (usuarios/page.tsx:99, dashboard/page.tsx:86), acciones destacadas (eventos/[id]/page.tsx:230), banner de retiro en curso (dashboard/page.tsx:202), pill activa de Operacion en el sub-nav (EventSubNav.tsx:81), toast de exito (components/ToastProvider.tsx:46). Como texto: todos los titulos y nombres primarios
- #111827 bg-[#111827] (gray-900): SEGUNDO negro primario, solo en portal/app/(admin)/eventos/page.tsx:54 y :74, con hover:bg-slate-800 (#1e293b). Convive con bg-slate-900 sin razon visible
- #334155 slate-700: hover del boton primario (dashboard/page.tsx:86, eventos/[id]/page.tsx:230), texto del boton de AlertCard (dashboard/page.tsx:51), texto de la pill de Operacion inactiva (EventSubNav.tsx:82)
- #475569 slate-600: texto de nav superior inactiva (AdminTopNav.tsx:31), botones secundarios (eventos/[id]/page.tsx:148, 237), contador del kanban (eventos/page.tsx:90)
- #64748b slate-500: labels de seccion en mayusculas, subtitulos, links de sub-nav inactivos (EventSubNav.tsx:86), encabezados de tabla (usuarios/page.tsx:22)
- #94a3b8 slate-400: metadatos, fechas, back link del sub-nav (EventSubNav.tsx:45), email en la barra superior y boton de cerrar sesion (AdminTopNav.tsx:54, 57), labels de la barra de metricas (eventos/[id]/page.tsx:165)
- #cbd5e1 slate-300: texto de celda sin dato en tabla (usuarios/page.tsx:48) y borde del boton de AlertCard (dashboard/page.tsx:51)
- #e2e8f0 text-slate-200: color del separador literal | en el sub-nav, EventSubNav.tsx:51
- Badge neutro Prospecto/Borrador: bg-slate-100 #f1f5f9 + text-slate-600 #475569 (EventSubNav.tsx:13, eventos/[id]/page.tsx:8, 47). Variantes mas apagadas del mismo fondo: text-slate-500 para draft y completed (eventos/[id]/page.tsx:31, 116) y text-slate-400 para archived (eventos/[id]/page.tsx:119)
- Badge azul Confirmado: bg-blue-100 #dbeafe + text-blue-700 #1d4ed8 (EventSubNav.tsx:14, eventos/[id]/page.tsx:9, 118). El mismo estado en familias se escribe bg-[#DBEAFE] + text-[#2563EB] (blue-100 + blue-600) en eventos/[id]/page.tsx:31 y :49, un tono de texto mas claro
- Badge ambar En preparacion: bg-amber-100 #fef3c7 + text-amber-700 #b45309 (EventSubNav.tsx:15, eventos/[id]/page.tsx:10). Su gemelo escrito a mano es bg-[#FEF9C3] (yellow-100) + text-[#D97706] (amber-600) para pending, sent y signed en eventos/[id]/page.tsx:33, 48, 50
- Badge verde Ejecutado: bg-emerald-100 #d1fae5 + text-emerald-700 #047857 (EventSubNav.tsx:16, eventos/[id]/page.tsx:11, 117). Gemelo a mano para approved: bg-[#DCFCE7] (green-100) + text-[#16A34A] (green-600), eventos/[id]/page.tsx:51
- Badge rojo Cancelado: bg-red-100 #fee2e2 + text-red-500 #ef4444 (EventSubNav.tsx:17, eventos/[id]/page.tsx:12). Rompe el patron: todos los demas badges usan el tono 700 para el texto, este usa 500. Gemelo a mano para rejected: bg-[#FEE2E2] + text-[#DC2626], eventos/[id]/page.tsx:52
- Badge violeta Invitado: bg-violet-100 #ede9fe + text-violet-700 #6d28d9, eventos/[id]/page.tsx:30. Unico uso de violeta en todo el chasis
- Alertas del dashboard, borde izquierdo grueso + fondo palido: ambar border-amber-400 #fbbf24 sobre bg-amber-50 #fffbeb; rojo border-red-400 #f87171 sobre bg-red-50 #fef2f2; neutro border-slate-300 #cbd5e1 sobre bg-slate-50. Todo en portal/app/(admin)/dashboard/page.tsx:38-41
- Exito del dashboard: border-emerald-400 #34d399 + bg-emerald-50 #ecfdf5 + icono text-emerald-500 #10b981 + texto text-emerald-800 #065f46, dashboard/page.tsx:61-65
- Nota comercial: bg-blue-50 #eff6ff + border-blue-100 #dbeafe + text-blue-700 en el label y text-blue-800 #1e40af en el cuerpo, eventos/[id]/page.tsx:323-325. Nota interna: bg-[#FEF9C3] + border-yellow-200 #fef08a + text-yellow-800 #854d0e, eventos/[id]/page.tsx:331-333
- Link externo: text-blue-600 #2563eb con hover:underline, unico link azul del chasis, eventos/[id]/page.tsx:306. Boton de confirmacion destructiva: bg-amber-500 #f59e0b hover bg-amber-600 #d97706, eventos/[id]/EventStatusButton.tsx:46
- Encabezados de columna del kanban de eventos, unico lugar donde el color va en el texto y no en un badge: text-slate-600, text-blue-700, text-amber-700, text-emerald-700, text-red-500 en portal/app/(admin)/eventos/page.tsx:23-27
- Paleta muerta de portal/components/AdminNav.tsx (componente no importado en ningun archivo): fondo #111111, bordes #1F2937 (gray-800), texto inactivo #9CA3AF (gray-400), secundario #6B7280 (gray-500), label de grupo #4B5563 (gray-600) y #374151 (gray-700), acento terracota #B9735A en el hover del cruce a PersonaLab (AdminNav.tsx:68)

### Tipografia
- Familia unica DM Sans, cargada con pesos 300/400/500/600 y variable --font-sans en portal/app/layout.tsx:14-20, aplicada al body en portal/app/globals.css:8. Cormorant Garamond se carga en app/layout.tsx:6 pero NO se usa en ningun archivo del chasis admin, solo en components/FirstTimeWelcome.tsx:61 y components/HelpButton.tsx:74
- Escala real medida por frecuencia en app/(admin): text-xs 303 usos, text-sm 268, text-2xl 19, text-xl 16, text-lg 14, text-base 11, text-3xl 2. En la practica es un sistema de dos tamanos con un titulo
- Titulo de pagina H1: text-2xl font-bold text-slate-900, sin tracking. eventos/page.tsx:51, usuarios/page.tsx:94, dashboard/page.tsx:272, 380, 455
- Titulo dentro de superficie oscura: text-xl font-bold leading-tight, dashboard/page.tsx:205
- Cifra de metrica, dos pesos distintos segun la pagina: text-2xl font-semibold text-slate-900 tabular-nums en eventos/[id]/page.tsx:164, y text-2xl font-bold text-slate-900 sin tabular-nums en dashboard/page.tsx:221
- Titulo de tarjeta: text-sm font-semibold text-slate-900, eventos/[id]/page.tsx:177 y :200. Mismo tratamiento para el nombre del evento en el sub-nav, EventSubNav.tsx:54
- Etiqueta de seccion, el patron mas repetido del sistema: text-xs font-semibold text-slate-500 uppercase tracking-wider. dashboard/page.tsx:108, 233, 396; usuarios/page.tsx:22, 108, 117; eventos/[id]/page.tsx:263, 300
- Variante mas apagada de esa etiqueta: text-[11px] font-medium text-slate-400 uppercase tracking-wider para el bloque Acciones, eventos/[id]/page.tsx:225
- Fila de lista: nombre en text-sm font-medium text-slate-900, metadato debajo en text-xs text-slate-400 mt-0.5. eventos/[id]/page.tsx:188-189, dashboard/page.tsx:117-118, usuarios/page.tsx:44-45
- Micro tipografia de badge: text-xs font-semibold en los badges de estado; text-[10px] font-semibold en el badge de pipeline del sub-nav (EventSubNav.tsx:59) y en el chip de conteo de familias (eventos/page.tsx:121); text-[10px] font-bold en el contador circular del kanban (eventos/page.tsx:90)
- Encabezado de columna del kanban: text-xs font-semibold uppercase tracking-wider, eventos/page.tsx:87
- Wordmark de la barra superior: text-sm font-semibold tracking-tight text-slate-900, unico uso de tracking-tight en el chasis, AdminTopNav.tsx:39
- tabular-nums aparece una sola vez en todo el admin, en la barra de metricas de eventos/[id]/page.tsx:164

### Espaciado
- Barra superior h-14 = 56px, fixed top-0 left-0 right-0, padding px-6 = 24px. portal/components/AdminTopNav.tsx:36. Se compensa con pt-14 en el main, portal/app/(admin)/layout.tsx:26
- Sub-nav de evento h-12 = 48px, sticky top-14, padding px-6 = 24px, gap-3 = 12px entre los elementos de identidad. portal/app/(admin)/eventos/[id]/EventSubNav.tsx:41. Cromo total en una pagina de evento: 56 + 48 = 104px
- Cuatro disciplinas de padding de pagina conviviendo: p-8 (32px en los cuatro lados) en eventos/page.tsx:48 y usuarios/page.tsx:91; px-8 pt-6 pb-12 en eventos/[id]/page.tsx:127; px-8 pt-8 sin padding inferior en dashboard/page.tsx:198, 268, 374, 453
- Cuatro anchos de contenedor distintos: max-w-2xl (672px) con mx-auto en el dashboard (dashboard/page.tsx:198, 268, 374, 453); max-w-4xl (896px) SIN mx-auto, alineado a la izquierda, en usuarios/page.tsx:91; max-w-7xl (1280px) SIN mx-auto en eventos/[id]/page.tsx:127; sin limite alguno en el kanban de eventos/page.tsx:48
- Ritmo vertical: mb-8 = 32px despues del encabezado de pagina (eventos/page.tsx:50, usuarios/page.tsx:92, eventos/[id]/page.tsx:168); mb-6 = 24px entre bloques mayores (eventos/[id]/page.tsx:129, dashboard/page.tsx:202); mb-3 = 12px bajo las etiquetas en mayusculas (dashboard/page.tsx:108, 396; usuarios/page.tsx:108)
- Apilado interno: space-y-6 = 24px en la columna principal y space-y-4 = 16px en la sidebar (eventos/[id]/page.tsx:173, 222); space-y-1.5 = 6px entre botones de accion (eventos/[id]/page.tsx:226); flex flex-col gap-3 entre alertas del dashboard (dashboard/page.tsx:397)
- Padding de tarjeta segun rol: p-4 = 16px en las tarjetas de la sidebar (eventos/[id]/page.tsx:224, 262, 299, 323, 331); px-4 py-3 en cabeceras y filas de lista y en celdas de tabla (eventos/[id]/page.tsx:176, 186; usuarios/page.tsx:22, 34); px-5 py-4 en las tarjetas del dashboard (dashboard/page.tsx:44, 61, 219); px-6 py-4 en las celdas de la barra de metricas (eventos/[id]/page.tsx:163); px-5 py-3 en filas del dashboard (dashboard/page.tsx:232, 236)
- Estados vacios sobredimensionados: p-10 = 40px en dashboard/page.tsx:74, p-12 = 48px en eventos/page.tsx:61, p-8 = 32px en usuarios/page.tsx:121, y px-4 py-6 cuando el vacio vive dentro de una tarjeta (eventos/[id]/page.tsx:183, 206)
- Gaps de grilla: gap-4 = 16px entre columnas del kanban (eventos/page.tsx:80), gap-3 = 12px entre tarjetas dentro de una columna (eventos/page.tsx:84), gap-6 = 24px en la grilla de dos columnas del detalle (eventos/[id]/page.tsx:171), gap-1 = 4px entre pills de navegacion (AdminTopNav.tsx:43, EventSubNav.tsx:69), gap-px = 1px como truco de hairline en la barra de metricas (eventos/[id]/page.tsx:156)
- Padding de pill de navegacion: px-3 py-2 en la barra superior (AdminTopNav.tsx:28), px-3 py-1.5 en el sub-nav (EventSubNav.tsx:77)
- Padding de boton por jerarquia: px-5 py-2.5 primario grande (dashboard/page.tsx:86, eventos/page.tsx:74); px-4 py-2 primario estandar (eventos/page.tsx:54, usuarios/page.tsx:99); px-3 py-2 accion de sidebar (eventos/[id]/page.tsx:230, 237); px-3 py-1.5 secundario y terciario (eventos/[id]/page.tsx:148, dashboard/page.tsx:51, EventStatusButton.tsx:63); px-2.5 py-1 el mas pequeno (dashboard/page.tsx:313)
- Padding de badge: px-2 py-0.5 el estandar (eventos/[id]/page.tsx:39, 59, 138), px-2.5 py-0.5 para el badge de pipeline mas prominente (eventos/[id]/page.tsx:22), px-2 py-0.5 con text-[10px] en el sub-nav (EventSubNav.tsx:59), px-3 py-1.5 para el chip de cuenta regresiva del dashboard (dashboard/page.tsx:381)
- Truncados y topes: el nombre del evento en el sub-nav va truncate max-w-[180px] (EventSubNav.tsx:54); los toasts van min-w-[240px] max-w-[340px] (ToastProvider.tsx:44); el copy del estado vacio va max-w-xs mx-auto (dashboard/page.tsx:81)

### Bordes
- Radios por jerarquia: rounded-md 6px en pills de navegacion (AdminTopNav.tsx:28, EventSubNav.tsx:77) y en el chip de conteo del kanban (eventos/page.tsx:121); rounded-lg 8px en todos los botones (eventos/page.tsx:54, eventos/[id]/page.tsx:148, 230, 237); rounded-xl 12px en tarjetas, tablas y la barra de metricas (eventos/[id]/page.tsx:156, 175, 224; usuarios/page.tsx:18); rounded-2xl 16px solo en el banner del dashboard, su boton primario y el estado vacio grande (dashboard/page.tsx:74, 86, 202); rounded-full en todos los badges de estado y contadores
- rounded-r-xl, radio solo del lado derecho, exclusivo de las tarjetas de alerta del dashboard porque el borde izquierdo grueso debe quedar recto: dashboard/page.tsx:44 y :61
- Grosores: 1px por defecto en todo borde; border-l-4 = 4px en AlertCard y SuccessCard (dashboard/page.tsx:44, 61); border-b en la barra superior (AdminTopNav.tsx:36) y en el sub-nav (EventSubNav.tsx:41); border-l-2 = 2px como marca de activo en el AdminNav muerto (AdminNav.tsx:21-23); gap-px sobre un contenedor bg-slate-200 para producir hairlines de 1px sin bordes en la barra de metricas (eventos/[id]/page.tsx:156)
- Jerarquia de color de borde: border-slate-200 #e2e8f0 para el perimetro de una superficie; border-slate-100 #f1f5f9 para divisores internos y para botones terciarios de baja jerarquia; border-[#E5E7EB] solo en la barra superior; border-blue-100 y border-yellow-200 en los bloques de notas; border-red-200 en el toast de error (ToastProvider.tsx:47)
- Sombras, todas defaults de Tailwind sin personalizar: shadow-sm en practicamente toda tarjeta y tabla; shadow-md solo en el banner de retiro en curso (dashboard/page.tsx:202); hover:shadow-md como unica animacion de elevacion, en las tarjetas del kanban (eventos/page.tsx:107); shadow-lg en los toasts (ToastProvider.tsx:44)
- Estados de hover de borde: hover:border-slate-300 en las tarjetas del kanban (eventos/page.tsx:107) y hover:border-[#6B7280] en el boton de logout del AdminNav muerto (AdminNav.tsx:205)
- Capas z: z-50 barra superior (AdminTopNav.tsx:36), z-40 sub-nav (EventSubNav.tsx:41), z-10 el degradado de desvanecido dentro del sub-nav (EventSubNav.tsx:66), z-[100] la pila de toasts (ToastProvider.tsx:115)

### Patrones de componente

**Shell admin (el chasis completo)** · `portal/app/(admin)/layout.tsx:22-31`
```
<><AdminTopNav userEmail={...} /><ToastProvider><main className="pt-14 bg-slate-50 min-h-screen">{children}</main></ToastProvider></>
```
Es todo el chasis. Barra fija arriba, contenido con pt-14 para compensarla, lienzo gris muy claro a pantalla completa. No hay contenedor ni ancho maximo en este nivel: cada pagina decide el suyo. El guard de rol vive en las lineas 6-20 y redirige a /mi-retiro si el perfil no es super_admin, admin o staff.

**Barra superior fija** · `portal/components/AdminTopNav.tsx:36`
```
fixed top-0 left-0 right-0 w-full h-14 bg-white border-b border-[#E5E7EB] z-50 flex items-center justify-between px-6
```
56px de alto. Tres zonas: wordmark 4Meaning a la izquierda (text-sm font-semibold tracking-tight text-slate-900, linea 39), nav de dos links al centro con ml-8 flex gap-1 (linea 43), y a la derecha el email en text-xs text-slate-400 hidden sm:block mas el boton de cerrar sesion (lineas 54-57). Solo expone dos destinos: Eventos y Usuarios. Dashboard no esta en la nav, solo es el destino del wordmark.

**Link de nav superior con estado activo** · `portal/components/AdminTopNav.tsx:25-33`
```
base: 'px-3 py-2 text-sm rounded-md transition-colors'. Activo: 'text-slate-900 font-medium bg-slate-100'. Inactivo: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
```
El activo se marca con fondo slate-100 mas peso medium y texto slate-900. El hover del inactivo llega al MISMO fondo slate-100 que el activo, asi que en hover ambos estados se ven casi iguales y solo los diferencia el peso de la fuente. Coincidencia de estados a replicar con cuidado o a corregir. La deteccion es pathname === prefix || pathname.startsWith(prefix + '/'), linea 26.

**Sub-nav de evento (segundo nivel de navegacion)** · `portal/app/(admin)/eventos/[id]/EventSubNav.tsx:41`
```
sticky top-14 z-40 h-12 bg-white border-b border-slate-200 flex items-center px-6 gap-3 overflow-x-auto
```
48px de alto pegado justo debajo de la barra fija. Comprime en una sola linea cuatro cosas: back link, separador, identidad del evento y las 12 secciones. Se monta desde portal/app/(admin)/eventos/[id]/layout.tsx:24-28, que hace un fetch de id, nombre y pipeline_status antes de renderizar, y notFound() si el evento no existe (linea 20).

**Bloque de identidad dentro del sub-nav** · `portal/app/(admin)/eventos/[id]/EventSubNav.tsx:43-61`
```
back link: 'text-xs text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap flex-shrink-0' con el texto flecha izquierda + Eventos. Separador: <span className="text-slate-200">|</span>. Nombre: 'text-sm font-semibold text-slate-900 truncate max-w-[180px] flex-shrink-0'. Badge: 'text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0' + par de color
```
Este bloque ES el breadcrumb del portal. No existe ningun otro componente de migas de pan en todo el admin. El separador es un caracter pipe literal, no un slash ni un chevron. El nombre del evento se corta a 180px.

**Link de sub-nav, dos variantes** · `portal/app/(admin)/eventos/[id]/EventSubNav.tsx:77-87`
```
base: 'text-xs px-3 py-1.5 rounded-md whitespace-nowrap flex-shrink-0 transition-colors '. Normal activo: 'text-slate-900 font-semibold bg-slate-100'. Normal inactivo: 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'. Operacion activo: 'bg-slate-900 text-white hover:bg-slate-700'. Operacion inactivo: 'border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white'
```
Operacion recibe tratamiento de boton porque es el modo en vivo durante el retiro. Es el unico item de nav del portal con jerarquia visual propia. La deteccion de activo trata el indice de forma especial: si href es la raiz del evento exige igualdad exacta, si no acepta startsWith(href + '/'), lineas 72-75.

**Encabezado de pagina de indice (titulo + accion primaria)** · `portal/app/(admin)/eventos/page.tsx:50-58 y portal/app/(admin)/usuarios/page.tsx:92-103`
```
wrapper: 'flex items-center justify-between mb-8'. Titulo: 'text-2xl font-bold text-slate-900'. Subtitulo opcional debajo: 'text-sm text-slate-500 mt-1'. Boton: 'px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors'
```
Es el patron de encabezado mas consistente del portal. El titulo no lleva ni descripcion ni icono ni breadcrumb encima. En usuarios/page.tsx:94-95 el titulo y el subtitulo van envueltos en un div para que el flex los agrupe. Ojo: en eventos/page.tsx:54 el mismo boton usa bg-[#111827] hover:bg-slate-800 en vez de bg-slate-900 hover:bg-slate-700.

**Encabezado de pagina de DETALLE (no tiene titulo)** · `portal/app/(admin)/eventos/[id]/page.tsx:127-153`
```
contenedor: 'px-8 pt-6 pb-12 max-w-7xl'. Subheader: 'flex items-center justify-between mb-6' con izquierda 'flex items-center gap-2 flex-wrap text-sm text-slate-400' y derecha 'flex items-center gap-2'
```
Hallazgo estructural: la pagina de detalle NO tiene h1 ni ningun titulo. Arranca directo con una linea de metadatos en text-slate-400 (ciudad, pais, punto medio, rango de fechas, ubicacion, badge de status) y a la derecha el boton de transicion de estado mas Editar. El nombre del evento solo existe en el sub-nav, truncado a 180px. Todo el peso de la identidad de la pagina recae en una barra de 48px.

**Barra de metricas con hairlines por gap** · `portal/app/(admin)/eventos/[id]/page.tsx:156-168`
```
contenedor: 'grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden mb-8'. Celda: 'bg-white px-6 py-4'. Cifra: 'text-2xl font-semibold text-slate-900 tabular-nums'. Label: 'text-xs text-slate-400 mt-0.5'
```
El mejor truco del sistema: el fondo slate-200 del contenedor se ve solo a traves del gap-px, produciendo lineas de 1px sin declarar bordes en cada celda, y el overflow-hidden con rounded-xl recorta las esquinas. Cifra arriba, label abajo. Es la unica metrica del admin con tabular-nums. Cuatro valores: Familias, Acuerdos, Firmados y Tareas en formato hechas / totales.

**Tarjeta de metrica suelta (variante del dashboard)** · `portal/app/(admin)/dashboard/page.tsx:219-227`
```
'bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm mb-4'. Label: 'text-xs text-slate-500 font-medium mb-1'. Cifra: 'text-2xl font-bold text-slate-900' con denominador anidado 'text-base font-normal text-slate-400'
```
Contradice la barra de metricas en tres puntos: label ARRIBA en vez de abajo, slate-500 en vez de slate-400, y font-bold en vez de font-semibold, sin tabular-nums. El patron del denominador (24 en grande y /30 en text-base slate-400 dentro del mismo bloque) si vale la pena copiar.

**Tarjeta con cabecera y lista de filas (pseudo tabla)** · `portal/app/(admin)/eventos/[id]/page.tsx:175-195`
```
wrapper: 'bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden'. Cabecera: 'flex items-center justify-between px-4 py-3 border-b border-slate-100' con h3 'text-sm font-semibold text-slate-900' y link 'text-xs text-slate-400 hover:text-slate-600 transition-colors'. Fila: 'flex items-center justify-between px-4 py-3 text-sm' mas 'border-b border-slate-100' condicional en todas menos la ultima
```
Es el contenedor mas repetido del portal y sustituye a la tabla en casi todas partes. El divisor se aplica con un ternario sobre el indice (i < min(length,5) - 1) en vez de divide-y, salvo en dashboard/page.tsx:302 que si usa 'divide-y divide-slate-100'. El link de la cabecera siempre termina con una flecha derecha: Ver todas, Ver todos.

**Tabla real (unico ejemplo en todo el admin)** · `portal/app/(admin)/usuarios/page.tsx:17-56`
```
wrapper: 'bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden'. table: 'w-full text-sm border-collapse'. thead tr: 'bg-slate-50 border-b border-slate-200'. th: 'text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider'. tbody tr: 'hover:bg-slate-50 transition-colors' + 'border-b border-slate-100' salvo la ultima. td: 'px-4 py-3'
```
El unico elemento table del admin. La primera celda es la identidad en 'font-medium text-slate-900' con fallback 'text-slate-400 font-normal' cuando no hay dato (linea 35); las demas van en text-slate-500. Celda de dos lineas: valor en text-slate-900 font-medium y contexto debajo en text-xs text-slate-400 mt-0.5 (lineas 44-45). Nota: NO hay overflow-x-auto, la tabla no es responsive.

**Badge de estado** · `portal/app/(admin)/eventos/[id]/page.tsx:22-24 y 39-41`
```
'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ' + par de color, con fallback siempre a 'bg-slate-100 text-slate-600'. La variante prominente usa px-2.5 py-0.5
```
Tres componentes casi identicos conviven en el mismo archivo: PipelineBadge (linea 6), FamiliaStatusBadge (linea 28) y AgreementStatusBadge (linea 45), mas un cuarto mapa inline para el status del evento en las lineas 115-123 y un quinto mapa duplicado en EventSubNav.tsx:12-18. Cada uno declara su propio Record<string,string> de colores y de etiquetas. Si el prototipo quiere un solo Badge parametrizado, aqui esta la deuda que justifica la decision.

**Boton primario, secundario y terciario** · `portal/app/(admin)/eventos/[id]/page.tsx:230, 237 y 148`
```
primario en bloque: 'block w-full px-3 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors text-center'. terciario en bloque: 'block w-full px-3 py-2 text-sm text-slate-600 border border-slate-100 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors'. secundario inline: 'px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap'
```
Tres niveles claros: solido negro, contorno slate-100 muy tenue, contorno slate-200. Los botones en bloque de la sidebar de acciones llevan atributo title con una explicacion en espanol (lineas 229, 235, 242-247), un detalle de accesibilidad que vale la pena conservar. Nunca hay iconos dentro de los botones, solo texto y a veces una flecha o un signo mas.

**Tarjeta de kanban de evento** · `portal/app/(admin)/eventos/page.tsx:104-129`
```
'bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer block' mas ' opacity-60' cuando la columna es cancelado. Titulo: 'font-semibold text-slate-900 text-sm leading-tight mb-1.5'. Lugar: 'text-xs text-slate-500 mb-1'. Fechas: 'text-xs text-slate-400 mb-2'. Chip: 'text-[10px] font-medium text-slate-500 bg-slate-50 rounded-md px-2 py-1 inline-block'
```
Toda la tarjeta es un Link. Cinco columnas fijas: prospecto, confirmado, en_preparacion, ejecutado, cancelado (lineas 22-28), en grid 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4' (linea 80). Cabecera de columna: etiqueta coloreada mas contador circular 'inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold' (linea 90). Columna vacia: 'bg-white border border-slate-100 rounded-xl' con 'text-slate-400 text-xs text-center py-6' (lineas 97-99).

**Tarjeta de alerta con borde izquierdo** · `portal/app/(admin)/dashboard/page.tsx:44-56`
```
'flex items-start gap-4 border-l-4 {borderColor} {bgColor} rounded-r-xl px-5 py-4 shadow-sm'. Titulo: 'text-sm font-semibold text-slate-900'. Descripcion: 'text-xs text-slate-500 mt-0.5'. Boton: 'shrink-0 text-xs font-medium text-slate-700 border border-slate-300 bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap'
```
El unico componente del portal que codifica severidad con una franja lateral de 4px. Tres severidades via prop color: amber por defecto, red y slate (lineas 30, 38-41). Su gemelo positivo es SuccessCard (lineas 59-68), que cambia el layout a items-center, mete un icono SVG de 20px y usa una sola linea de texto en emerald-800.

**Banner de contexto en vivo** · `portal/app/(admin)/dashboard/page.tsx:202-216`
```
'bg-slate-900 text-white rounded-2xl px-6 py-5 mb-6 flex items-center justify-between gap-4 shadow-md'. Kicker: 'text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1'. Titulo: 'text-xl font-bold leading-tight'. Meta: 'text-sm text-slate-400 mt-1'. Boton invertido: 'shrink-0 bg-white text-slate-900 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors'
```
Unica superficie oscura del admin vivo y unico shadow-md. Estructura kicker en mayusculas, titulo, meta, boton invertido. Es el patron mas fuerte del portal y el mejor candidato a reutilizar cuando una corrida esta en curso.

**Estado vacio** · `portal/app/(admin)/dashboard/page.tsx:72-92`
```
'bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm'. Icono en caja: 'w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4' con svg 'w-5 h-5 text-slate-400' strokeWidth 1.5. Titulo: 'text-base font-semibold text-slate-900 mb-2'. Copy: 'text-sm text-slate-500 mb-6 max-w-xs mx-auto'. CTA: 'inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors'
```
Icono en cuadro redondeado, titulo, una frase de copy con ancho limitado y un CTA. La version de eventos/page.tsx:61-78 usa el mismo esqueleto pero con rounded-xl, p-12, icono en circulo w-12 h-12 y stroke #94a3b8 hardcodeado en el SVG. Dos ejecuciones del mismo patron.

**Degradado de desvanecido para nav con scroll horizontal** · `portal/app/(admin)/eventos/[id]/EventSubNav.tsx:64-69`
```
wrapper: 'relative flex-1 overflow-hidden'. Fade: 'pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent z-10'. Pista: 'flex items-center gap-1 overflow-x-auto scrollbar-none pr-8'
```
Insinua contenido cortado a la derecha con 48px de degradado desde blanco. Es la unica affordance de scroll del sistema. Ojo: la clase scrollbar-none NO existe, no es utilidad de Tailwind v3 y tailwind.config.ts:17 declara plugins vacio, asi que la barra de scroll nativa si se ve por debajo del degradado.

**Toast** · `portal/components/ToastProvider.tsx:43-47 y 115`
```
tarjeta: 'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium min-w-[240px] max-w-[340px] transition-all duration-200'. Exito: 'bg-slate-900 text-white' con icono 'text-emerald-400'. Error: 'bg-red-50 border border-red-200 text-red-700' con icono 'text-red-500'. Pila: 'fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none'
```
Abajo a la derecha, 24px de margen. Entra con opacity-0 translate-y-2 hacia opacity-100 translate-y-0 en 200ms (linea 54) y se descarta solo a los 3000ms (linea 32). El exito es oscuro solido, el error es palido con borde: dos tratamientos distintos para el mismo componente.

**Barra lateral MUERTA (no montada, referencia historica)** · `portal/components/AdminNav.tsx:53 y 15-29`
```
aside: 'w-[240px] min-h-screen bg-[#111111] flex flex-col flex-shrink-0 border-r border-[#1F2937]'. Link base: 'flex items-center gap-3 px-5 py-2.5 text-sm transition-colors'. Activo: 'text-white bg-white/5 border-l-2 border-white'. Inactivo: 'text-[#9CA3AF] border-l-2 border-transparent hover:text-white hover:bg-white/5'
```
Este componente no esta importado en NINGUN archivo del proyecto (grep de AdminNav solo devuelve su propia definicion). Es la referencia mas cercana al WorkspaceNav de PersonaLab: 240px contra 218px, activo marcado con borde izquierdo de 2px mas bg-white/5, y agrupacion por etiquetas 'text-[9px] font-semibold text-[#374151] uppercase tracking-widest' en tres bloques (Preparacion, Contenido, Ejecucion, lineas 108-171). Tambien contiene el unico cruce a PersonaLab del repo, un link 'text-[10px] tracking-widest uppercase text-[#6B7280] hover:text-[#B9735A]' en la linea 68.

### Hallazgos
- El chasis admin NO tiene barra lateral. La respuesta al ancho exacto de la barra lateral es que no existe: portal/app/(admin)/layout.tsx:22-31 monta solo AdminTopNav y un main. El aside de w-[240px] vive en portal/components/AdminNav.tsx:53 pero un grep de AdminNav en app y components solo devuelve su propia declaracion y su interface, nadie lo importa. Es codigo muerto de una version anterior del portal.
- El sistema no tiene tokens de diseno. portal/tailwind.config.ts:10-15 solo extiende colors.background y colors.foreground apuntando a var(--background) y var(--foreground), variables que portal/app/globals.css (11 lineas en total) nunca define y que ningun archivo del proyecto usa. Es configuracion de plantilla que quedo sin conectar. Todo el color viene de la paleta de fabrica de Tailwind mas hexadecimales inline.
- Hay dos negros primarios distintos. bg-slate-900 (#0f172a) es el estandar en dashboard, usuarios y detalle de evento; pero portal/app/(admin)/eventos/page.tsx:54 y :74 usan bg-[#111827] (gray-900) con hover:bg-slate-800. El boton mas visible del portal, Nuevo evento, es el que se sale del patron. El prototipo debe elegir UN negro.
- El mismo par de color semantico esta escrito de dos formas incompatibles en el mismo archivo. En portal/app/(admin)/eventos/[id]/page.tsx conviven bg-blue-100 text-blue-700 (linea 9) y bg-[#DBEAFE] text-[#2563EB] (linea 31), bg-amber-100 text-amber-700 (linea 10) y bg-[#FEF9C3] text-[#D97706] (linea 33), bg-emerald-100 text-emerald-700 (linea 11) y bg-[#DCFCE7] text-[#16A34A] (linea 51). Los hex duplican fondos identicos pero con textos un paso mas claros, produciendo dos azules de estado, dos ambares y dos verdes que se ven casi iguales pero no lo son.
- Cinco mapas de badges duplicados. PIPELINE_LABELS en EventSubNav.tsx:12-18, PipelineBadge en eventos/[id]/page.tsx:6-26, FamiliaStatusBadge en la linea 28, AgreementStatusBadge en la linea 45 y un mapa inline de status del evento en las lineas 115-123. Cinco Record<string,string> con etiquetas y colores repetidos y desalineados. El prototipo debe partir de un solo componente Badge parametrizado por estado.
- La pagina de detalle de evento no tiene titulo. portal/app/(admin)/eventos/[id]/page.tsx:127 arranca directo con una linea de metadatos en text-slate-400 y no hay ningun h1 en todo el archivo. El nombre del evento solo aparece en el sub-nav (EventSubNav.tsx:54) en text-sm truncado a max-w-[180px]. El usuario en una pantalla estrecha puede quedarse sin saber que evento esta viendo. Esto es lo que el prototipo debe corregir, no imitar.
- No existe sistema de breadcrumbs. La unica affordance de vuelta en todo el admin es el link con flecha izquierda mas Eventos en EventSubNav.tsx:43-48, en text-xs text-slate-400, seguido de un caracter pipe literal como separador (linea 51). Ninguna otra pagina del admin tiene forma de subir de nivel salvo la nav superior.
- La clase scrollbar-none de EventSubNav.tsx:69 no existe. No es utilidad de Tailwind v3 y tailwind.config.ts:17 declara plugins vacio, sin tailwind-scrollbar-hide. Lo mismo pasa con scrollbar-hide en app/(participant)/programa/page.tsx:137. La barra de scroll nativa se ve por debajo del degradado, que es precisamente lo que el degradado intentaba disimular.
- DM Sans se carga con pesos 300, 400, 500 y 600 (portal/app/layout.tsx:16) pero el codigo usa font-bold, que es 700, en todos los titulos de pagina (eventos/page.tsx:51, usuarios/page.tsx:94, dashboard/page.tsx:272, 380, 455), en la cifra del dashboard (dashboard/page.tsx:221) y en el contador del kanban (eventos/page.tsx:90). El 700 no esta en el subconjunto descargado, el navegador lo sintetiza. Si el prototipo quiere titulos bold reales debe agregar el peso, o bajar a font-semibold que si existe.
- Cormorant Garamond se descarga en cada pagina (app/layout.tsx:6-12, cuatro pesos mas italicas) y no se usa en ningun archivo del admin. Solo aparece en components/FirstTimeWelcome.tsx:61 y components/HelpButton.tsx:74, ambos del lado participante. El admin es 100 por ciento sans. Peso de descarga sin retorno visual.
- Cuatro disciplinas de contenedor conviviendo. El dashboard centra a max-w-2xl (672px) con mx-auto, usuarios limita a max-w-4xl SIN mx-auto (queda pegado a la izquierda), el detalle de evento limita a max-w-7xl tambien sin mx-auto, y el kanban de eventos no limita nada. En una pantalla de 1920px el usuario ve el contenido centrado, luego pegado a la izquierda, luego casi a todo ancho, segun la pagina. Es la incoherencia mas visible del portal.
- La cifra de metrica tiene dos tratamientos. eventos/[id]/page.tsx:164-165: font-semibold, tabular-nums, label DEBAJO en slate-400. dashboard/page.tsx:220-221: font-bold, sin tabular-nums, label ENCIMA en slate-500. Elegir uno. La version con tabular-nums y label debajo es la mejor de las dos.
- El borde de la barra superior es border-[#E5E7EB], que es gray-200, mientras todo el resto del chasis usa border-slate-200 (#e2e8f0). AdminTopNav.tsx:36 es el unico punto del admin vivo que usa la escala gray. La diferencia es sutil (gray tiene menos azul) pero rompe la coherencia justo en el elemento que enmarca toda la aplicacion.
- text-red-500 para Cancelado rompe el patron. Todos los demas badges usan el tono 700 para el texto: slate-600, blue-700, amber-700, emerald-700. Solo el rojo baja a 500 (EventSubNav.tsx:17, eventos/[id]/page.tsx:12), lo que le da menos contraste sobre bg-red-100 que a sus hermanos. Deberia ser red-700 si el prototipo busca consistencia de contraste.
- El sub-nav de evento carga 12 destinos en una barra plana de 48px sin agrupacion (EventSubNav.tsx:23-36: Resumen, Checklist, Contenido, Familias, Acuerdos, Materiales, Equipo, Itinerario, Avisos, Entregas, Operacion, Preview). Curiosamente, la agrupacion semantica SI existe pero en el codigo muerto: AdminNav.tsx:108-181 organiza los mismos destinos en Preparacion, Contenido y Ejecucion. El prototipo de PersonaLab hereda esa idea buena en WorkspaceNav.tsx:10-31 con los grupos Catalogo, Operacion y Despues, que es la direccion correcta.
- Los estados vacios tienen cuatro ejecuciones distintas: rounded-2xl p-10 con icono en cuadrado de 40px (dashboard/page.tsx:74-76), rounded-xl p-12 con icono en circulo de 48px y stroke #94a3b8 hardcodeado en el SVG (eventos/page.tsx:61-68), rounded-xl p-8 con solo una frase (usuarios/page.tsx:121), y px-4 py-6 text-center text-slate-400 text-sm cuando el vacio vive dentro de una tarjeta (eventos/[id]/page.tsx:183, 206). El ultimo es el mas util para reutilizar.
- El hover del link de nav inactivo llega al mismo bg-slate-100 que marca el estado activo, tanto en la barra superior (AdminTopNav.tsx:30-31) como en el sub-nav (EventSubNav.tsx:85-86). Con el cursor encima, activo e inactivo solo se distinguen por el peso de la fuente. El prototipo usa borderLeft con acento terracota #B9735A para el activo (WorkspaceNav.tsx:103), que resuelve mejor esa ambiguedad.
- El truco de hairlines de la barra de metricas (grid gap-px sobre bg-slate-200 con overflow-hidden rounded-xl, eventos/[id]/page.tsx:156) es la mejor pieza tecnica del chasis y vale la pena portarla tal cual al prototipo. Produce lineas de 1px perfectas sin dobles bordes ni bordes en las orillas.
- Los links de accion de la sidebar del detalle llevan atributo title con una explicacion en espanol (eventos/[id]/page.tsx:229, 235, 236, 242-247, 147). Es el unico lugar del portal con ayuda contextual y merece conservarse como convencion.
- La tabla de usuarios no tiene overflow-x-auto (usuarios/page.tsx:18-19). Con cuatro columnas y celdas de dos lineas se rompe en pantallas angostas. El resto del admin evita el problema usando filas flex en vez de table, asi que el patron de tabla real solo esta probado en un lugar y sin defensa responsive.
- El brand del chasis vivo es un wordmark de texto plano, no un logo: AdminTopNav.tsx:39 renderiza el string 4Meaning en text-sm font-semibold tracking-tight. El logo real (/logo.png y /4m-logo-wht.png) solo se usa en el AdminNav muerto (lineas 60 y 80). El prototipo de PersonaLab si usa la imagen (WorkspaceNav.tsx:50-55), asi que en este punto el prototipo va por delante del portal.
- El separador de rango de fechas en eventos/[id]/page.tsx:135 y eventos/page.tsx:118 es un guion medio (en dash), pero dashboard/page.tsx:389 usa una raya (em dash) para el mismo proposito, y el placeholder de fecha vacia en las tres funciones formatDate (dashboard/page.tsx:6, eventos/page.tsx:6, eventos/[id]/page.tsx:66) tambien es una raya. Dado el criterio del usuario contra la raya en copy visible, el prototipo deberia estandarizar en guion medio para rangos y en algo como Sin fecha para el vacio.


---

# Diseno entregado

El lector del participante hereda del lado participante de Trascendencia solo el chasis (lienzo profundo, columna única, modo documento en hoja clara) y rompe todo lo demás: el lienzo pasa de negro #0C0C0C a teal #002B34, muere el dorado #C9A96E y muere Cormorant Garamond, y el cuerpo sube de 14px en 512px a 17/18px en 576px. La pieza estructural es que el campo `soporte` de dominio.ts:49 decide qué clase de pantalla se dibuja: solo las bisagras de `pantalla` son páginas de lectura, las de `sala` y `objeto` son pantallas de cierre que dicen que ahí no hay nada que leer. La navegación no tiene barras ni porcentajes: la posición se dice con un nombre ("Víspera · Aquí vas") en un mapa llamado El recorrido, y se avanza con un enlace que nombra la siguiente bisagra. El moderador ve la misma página que el participante con una capa encima, nunca un documento paralelo. Nueve tipos de bloque con markup Tailwind y medidas cerradas, más los cuatro momentos de transición.

- **El lienzo del lector es teal profundo #002B34, no el negro #0C0C0C que usa hoy el lado participante (portal/app/(participant)/layout.tsx:35).** · BRAND.md línea 55 declara el Verde Petróleo #002B34 como color rector y fondos profundos, y las líneas 82 y 83 asignan la dominancia teal a PersonaLab contra la dominancia vino de Trascendencia. Si PersonaLab hereda el negro, las dos marcas se ven igual y la casa de marca deja de leerse. El teal ya está en el código del prototipo: dominio.ts:17 y WorkspaceNav.tsx:41.
- **Muere el dorado #C9A96E y muere Cormorant Garamond. El acento es terracota y la tipografía es 100 por ciento sans.** · BRAND.md línea 100 dice literalmente que la decisión de la web es tipografía 100 por ciento sans serif y que se descartó Cormorant. El dorado #C9A96E no aparece en ninguna fila de la paleta oficial (BRAND.md líneas 55 a 70) y Renata ya lo registró como fuera de paleta en su memoria (Renata.md línea 93). Cormorant además se descarga en cada página (app/layout.tsx:6-12, cuatro pesos más itálicas) para usarse en dos componentes.
- **La terracota se parte en tres tokens por superficie: #B9735A solo como marca no textual (rieles de 2px, puntos, botón de fondo), #CFA48F para texto sobre teal, #8F5341 para texto sobre papel.** · Medí el contraste. #B9735A sobre #002B34 da 4.06:1, por debajo del mínimo 4.5:1 de WCAG AA para texto normal, así que la terracota de marca no puede ser color de texto sobre el lienzo. #CFA48F (el token --terra-2 de BRAND.md línea 67) da 6.71:1 y pasa. Sobre papel #FAF8F4, #B9735A da 3.50:1 y también falla, mientras #8F5341 da 5.69:1 y pasa; ese #8F5341 ya está en el prototipo (ui.tsx:67, 218, 234).
- **El cuerpo sobre teal va en peso 400, no en el 300 que manda BRAND.md línea 116.** · El 300 de BRAND.md está escrito para el sitio de marketing, que es papel #FAF8F4 con tinta oscura. En tipografía invertida el trazo se adelgaza ópticamente, y a 17px sobre un fondo de luminancia 0.02 el peso 300 pierde cuerpo. Es compensación óptica estándar, no capricho. Sobre papel el cuerpo sí va en 300, como manda la marca. Los tamaños de 22px para arriba sí van en 300 sobre teal, porque a esa escala el trazo aguanta.
- **El peso más ligero de display es 300, no 200, aunque BRAND.md línea 113 pida 200 a 300.** · BRAND.md línea 106 fija el stack de sistema Helvetica Neue y la línea 110 prohíbe cargar fuentes externas. Helvetica Neue tiene Thin real (200) en macOS e iOS, pero fuera de Apple el stack cae a Arial y Roboto, donde el peso 200 no existe y el navegador lo redondea a 100 o a 300. El mismo titular se vería distinto según el teléfono. La ligereza se consigue con escala (hasta 56px), tracking -0.02em y leading 1.03, que es exactamente lo que BRAND.md línea 97 pide: jerarquía por escala y aire, no por peso.
- **El campo `soporte` de la bisagra (dominio.ts:49, valores sala, objeto, pantalla) decide qué clase de pantalla se dibuja. Solo `pantalla` es una página de lectura.** · Está escrito en el propio dominio: SOPORTE_NOTA en dominio.ts:33-37 dice que sala ocurre entre personas y el software no entra, y que objeto es pieza física que el software administra pero no entrega. Si el lector renderiza las tres igual, la pantalla se apropia de lo que pasa en la sala, que es justo lo que Renata.md línea 100 prohíbe. Una bisagra de sala se dibuja como pantalla de cierre a 60svh que dice que ahí no hay nada que leer.
- **La posición se dice con un nombre, nunca con un número ni con una barra. El mapa se llama El recorrido y marca la bisagra actual con un riel terracota de 2px y la frase Aquí vas.** · Los campos progress, completion_pct, score, streak, badge, rank y quiz están prohibidos por el léxico vinculante (dominio.ts:10-11, data.ts:9). Un contador tipo 3 de 10 es completion_pct disfrazado de texto. Un riel que solo marca la posición actual, sin llenar las anteriores, comunica dónde estás sin comunicar acumulación. El patrón de riel ya existe en el prototipo: WorkspaceNav.tsx:103 usa borderLeft de 2px en #B9735A para el activo.
- **Una bisagra se abre por fecha o por la mano del moderador. Nunca por lo que hizo el participante.** · El desbloqueo secuencial de Trascendencia (mi-retiro/page.tsx:317-395, con opacity-60 y pointer-events-none) condiciona el paso siguiente a haber terminado el anterior, que es progreso con otro nombre. En PersonaLab la Víspera se abre por calendario y la Ignición la abre el moderador el día de la corrida, que es lo que ya modela el prototipo con `activo` y con el estado de la corrida.
- **El moderador ve exactamente la misma página que el participante, con una capa encima. No hay documento paralelo ni ruta de moderador.** · Dos documentos se desincronizan. El repositorio ya tiene la prueba: el mismo contenido de acuerdo está implementado dos veces, en acuerdos/[id]/page.tsx:67-94 y firmar/[token]/page.tsx:152-172, y ya divergieron en color de cuerpo, numeración de artículos y estilo de las líneas de firma. La capa del moderador son bloques con audiencia solo_moderador, más una banda superior de 40px y un enlace Ver como participante que es un query param, no un estado guardado.
- **El cuerpo va a 17px en teléfono y 18px en escritorio, con interlineado 1.75 y 1.7, dentro de una columna de 576px. El shell de la página es de 736px para que imagen, video y cita puedan salirse de la columna de texto.** · El lado participante actual lee a text-sm (14px) dentro de max-w-lg (512px), y esa es la única presentación de texto largo que existe en todo el portal (info/page.tsx:152, programa/page.tsx:252, avisos/page.tsx:80). Catorce píxeles es tamaño de metadato, no de lectura sostenida. A 18px en 576px la medida cae en 64 caracteres, dentro del rango de 60 a 70 que es donde el ojo no se pierde de renglón.
- **El lector no lleva barra inferior de navegación. Todo el cromo es una barra superior pegajosa de 52px.** · ParticipantNav.tsx:54-82 monta cinco destinos fijos en 64px más el safe area, y el layout reserva pb-24 (96px) por ella. Eso es correcto para un portal de trámites y es ruido en una pantalla de lectura. El precedente correcto ya existe en el propio repositorio: la vista de documento de acuerdos/[id]/page.tsx:36 quita la navegación y deja un solo enlace de vuelta. Un valor de marca es sin prisa (BRAND.md línea 23) y cinco destinos permanentes contradicen eso.
- **El final de la experiencia no entrega nada descargable ni dice completado. Dice quién entrega el testimonio, en qué fecha y en persona.** · Renata.md línea 57 fija que el libro se recibe, no se descarga, y la línea 100 del mismo archivo registra que el testimonio lleva delivered_by humano. Una pantalla de certificado descargable convertiría el cierre ritual en un trámite y activaría de hecho el concepto de badge, que está prohibido.

# El lector del participante · PersonaLab

Especificación de cómo se ve una experiencia publicada. Todo lo que sigue está en píxeles, en clases de Tailwind 3.4.1 (la versión que declara `portal/package.json:26`) y con la ruta y línea del archivo del que sale cada herencia.

---

## 0. Regla de oro

La pantalla nunca es la experiencia. Es la víspera y el eco de la experiencia.

De ahí salen las tres reglas de forma que gobiernan todo el documento:

1. Si el `soporte` de la bisagra no es `pantalla`, no hay artículo que leer. Se dibuja una pantalla de cierre.
2. La posición se dice con un nombre, nunca con un número.
3. Lo que el moderador ve de más es una capa sobre la misma página, no otra página.

---

## 1. Dirección visual: qué se hereda de Trascendencia y qué se rompe

| Pieza | Trascendencia (archivo y línea) | PersonaLab | Por qué |
|---|---|---|---|
| Chasis | `(participant)/layout.tsx:35-40`: lienzo profundo, columna única, `mx-auto` | Se hereda la idea, cambia el color y el ancho | El chasis funciona |
| Lienzo | `#0C0C0C` | `#002B34` teal | `BRAND.md:55` y `BRAND.md:83` |
| Superficie elevada | `#1A1A1A` editorial y `#181818` utilitaria, dos sistemas que nunca se unificaron | Una sola: `#0A3B45` (`--teal-2`, `BRAND.md:66`) | Un sistema de tarjeta, no dos |
| Acento | Dorado `#C9A96E`, 114 apariciones | Terracota en tres tokens por superficie | El dorado no está en la paleta oficial |
| Titulares | Cormorant Garamond light | Sans del sistema, peso 300 a gran escala | `BRAND.md:100` |
| Cuerpo | `text-sm` (14px) en `max-w-lg` (512px) | 17px teléfono / 18px escritorio en 576px | 14px es tamaño de metadato |
| Filete | `border-white/10` y `border-[#2A2A2A]` | `border-white/[0.12]` (`--line-dk`, `BRAND.md:70`) | Un solo filete |
| Navegación | Barra inferior fija de 5 destinos, 64px + safe area (`ParticipantNav.tsx:54-82`) | Sin barra inferior. Una barra superior de 52px | El lector es modo de atención |
| Modo documento | Hoja blanca sobre lienzo oscuro (`acuerdos/[id]/page.tsx:36-47`) | Se hereda tal cual, repintado a papel `#FAF8F4` sobre teal | Es lo mejor que hay en el repositorio |
| Estado vacío | Caja que explica cuándo aparecerá el contenido (`programa/page.tsx:234-239`) | Se hereda tal cual | Es el gesto que hace legible el contenido progresivo |
| Sello de disponibilidad | `text-white/20` (`programa/page.tsx:256`) | Se descarta. Mínimo `#8FB0B6` | Medí `white/20` sobre `#1A1A1A`: 1.90:1, contra el mínimo de 4.5:1 |
| Barra de progreso | `acuerdos/page.tsx:86-103` | Prohibida | Léxico vinculante |

### Lo que se hereda sin tocar

- El truco del punto del timeline: `border-2` en el color del lienzo para que la línea vertical parezca cortada (`programa/page.tsx:196`).
- El estado vacío en dos niveles: con llamada a la acción cuando está vacío de verdad, sin ella cuando el vacío lo causó un filtro (`FamiliasClient.tsx:167` contra `:177`).
- El `whitespace-pre-wrap` para respetar los saltos de línea del autor.
- La hoja clara sobre lienzo oscuro como cambio de modo de lectura.

---

## 2. Tokens

### 2.1 Extensión de `portal/tailwind.config.ts`

Hoy el archivo solo extiende `background` y `foreground` apuntando a variables CSS que `globals.css` nunca define (`tailwind.config.ts:10-15`). Sin esta extensión, el lector necesita más de cuarenta valores arbitrarios ilegibles.

```ts
// portal/tailwind.config.ts
theme: {
  extend: {
    colors: {
      teal:      '#002B34',   // lienzo
      'teal-2':  '#0A3B45',   // superficie elevada
      wine:      '#4C0F18',
      terra:     '#B9735A',   // marca, NUNCA texto sobre teal ni sobre papel
      'terra-2': '#CFA48F',   // terracota de texto sobre teal
      'terra-3': '#8F5341',   // terracota de texto sobre papel
      ink:       '#14181B',
      paper:     '#FAF8F4',
      lectura:   '#F2EFE9',   // cuerpo sobre teal
      'lectura-2': '#A8C3C8', // secundario sobre teal
      'lectura-3': '#8FB0B6', // terciario sobre teal
      gris:      '#6F7777',   // secundario sobre papel
      line:      '#E7E1D8',   // filete sobre papel
    },
  },
}
```

`#F2EFE9`, `#A8C3C8` y `#8FB0B6` no son invención: ya están en `portal/app/prototipo/personalab/WorkspaceNav.tsx:62`, `:101` y `:68`.

### 2.2 Color con contraste medido

Todos los cocientes calculados contra el lienzo `#002B34` (luminancia relativa 0.0197) con la fórmula WCAG 2.1.

| Token | Hex | Sobre teal | Uso | Veredicto |
|---|---|---|---|---|
| lectura | `#F2EFE9` | 13.1:1 | Cuerpo, titulares | AAA |
| lectura-2 | `#A8C3C8` | 8.11:1 | Subtítulo, cuerpo secundario | AAA |
| lectura-3 | `#8FB0B6` | 6.49:1 | Pies de foto, metadatos, razón de cierre | AA en todo tamaño |
| terra-2 | `#CFA48F` | 6.71:1 | Eyebrows, enlaces, autoría de cita | AA en todo tamaño |
| terra | `#B9735A` | 4.06:1 | **Solo no textual**: rieles de 2px, puntos, fondo de botón | Falla AA como texto |
| teal-2 | `#0A3B45` | 1.24:1 contra el lienzo | Superficie elevada | Correcto para superficie |

Sobre papel `#FAF8F4` (luminancia 0.9404):

| Token | Hex | Sobre papel | Uso |
|---|---|---|---|
| ink | `#14181B` | 12.4:1 | Cuerpo del documento |
| gris | `#6F7777` | 3.7:1 | Solo metadatos de 13px para arriba, nunca cuerpo |
| terra-3 | `#8F5341` | 5.69:1 | Eyebrow del documento |
| terra | `#B9735A` | 3.50:1 | Falla. No usar como texto sobre papel |

Texto sobre el botón de terracota: `#14181B` da 4.81:1 y pasa. `#002B34` da 4.06:1 y falla. El botón lleva tinta, no teal.

### 2.3 Tipografía

Familia única, la del sistema, declarada una sola vez en `portal/app/globals.css`:

```css
:root {
  --font-hn: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
}
html { -webkit-text-size-adjust: 100%; }
```

Se consume con `font-[family-name:var(--font-hn)]`, exactamente la misma sintaxis que ya usa `(participant)/layout.tsx:35`.

| Rol | Móvil | Escritorio | Peso | Leading | Tracking | Clase |
|---|---|---|---|---|---|---|
| Portada H1 | 34px | 56px | 300 | 1.03 | -0.02em | `text-[clamp(2.125rem,8.5vw,3.5rem)] font-light leading-[1.03] tracking-[-0.02em]` |
| Tiempo H2 | 26px | 34px | 300 | 1.1 | -0.01em | `text-[clamp(1.625rem,5vw,2.125rem)] font-light leading-[1.1] tracking-[-0.01em]` |
| Bisagra H1 | 28px | 40px | 300 | 1.15 | -0.015em | `text-[clamp(1.75rem,6vw,2.5rem)] font-light leading-[1.15] tracking-[-0.015em]` |
| Subtítulo H3 | 21px | 24px | 300 | 1.3 | -0.01em | `text-[1.3125rem] sm:text-[1.5rem] font-light leading-[1.3]` |
| Cita | 22px | 26px | 300 | 1.45 / 1.4 | -0.01em | `text-[1.375rem] sm:text-[1.625rem] font-light leading-[1.45] sm:leading-[1.4]` |
| Cuerpo sobre teal | 17px | 18px | **400** | 1.75 / 1.7 | 0 | `text-[1.0625rem] sm:text-[1.125rem] font-normal leading-[1.75] sm:leading-[1.7]` |
| Cuerpo sobre papel | 16px | 17px | 300 | 1.75 | 0 | `text-[1rem] sm:text-[1.0625rem] font-light leading-[1.75]` |
| Consigna | 19px | 21px | 400 | 1.55 | 0 | `text-[1.1875rem] sm:text-[1.3125rem] font-normal leading-[1.55]` |
| Pie de foto | 13px | 13px | 300 | 1.6 | 0 | `text-[0.8125rem] font-light leading-[1.6]` |
| Eyebrow | 11px | 11px | 500 | 1 | 0.3em | `text-[0.6875rem] font-medium uppercase leading-none tracking-[0.3em]` |
| Micro eyebrow | 10px | 10px | 500 | 1 | 0.28em | `text-[0.625rem] font-medium uppercase leading-none tracking-[0.28em]` |

Reglas duras de peso:

- **Sobre teal el cuerpo va en 400.** Es compensación óptica por tipografía invertida. Es una desviación deliberada de `BRAND.md:116`, que fue escrito para el sitio de marketing, que es papel.
- **Sobre teal, del 22px para arriba se vuelve a 300.** A esa escala el trazo aguanta.
- **Nunca por debajo de 300.** El 200 que pide `BRAND.md:113` solo existe en Helvetica Neue de Apple. Fuera de Apple el stack cae a Roboto y el navegador redondea a 100 o a 300.
- **Nunca 600 ni más en texto de lectura.** El 500 solo aparece en eyebrows de 10 y 11px, donde el tracking abierto se come el peso.

Números: `font-variant-numeric: tabular-nums` en toda fecha y toda duración, que en el repositorio actual solo se usa una vez (`eventos/[id]/page.tsx:164`).

### 2.4 Ritmo vertical

Escala de 8: 4, 8, 12, 16, 20, 24, 28, 32, 44, 56, 80, 96, 112, 128.

| Situación | Móvil | Escritorio | Clase |
|---|---|---|---|
| Entre bloques | 44px | 56px | `mt-11 sm:mt-14` |
| Antes de cita, imagen, video, consigna | 56px | 80px | `mt-14 sm:mt-20` |
| Entre párrafos de un mismo bloque | 24px | 28px | `space-y-6 sm:space-y-7` |
| Subtítulo al primer párrafo | 16px | 16px | `mb-4` |
| Bloque de respiro, arriba y abajo | 80px | 112px | `my-20 sm:my-28` |
| Antes del pie Sigue | 80px | 112px | `mt-20 sm:mt-28` |
| Antes del cierre de tiempo | 96px | 96px | `mt-24` |
| Base del artículo tras la barra | 32px | 56px | `pt-8 sm:pt-14` |
| Colchón inferior | 128px | 128px | `pb-32` |

### 2.5 Anchos

| Contenedor | Ancho | Clase |
|---|---|---|
| Columna de texto | 576px | `max-w-[36rem]` |
| Columna de cita | 544px | `max-w-[34rem]` |
| Shell del artículo | 736px | `max-w-[46rem]` |
| Gutter | 20px móvil / 32px escritorio | `px-5 sm:px-8` |

Medida resultante: 64 caracteres a 18px en escritorio, 40 caracteres a 17px en un teléfono de 375px. El segundo número es bajo y es el techo real de un teléfono; lo digo en vez de disimularlo.

### 2.6 Bordes, radios, foco

- Radio único: `rounded-[6px]`. Es el radio del prototipo (`ui.tsx:50`, `:97`). No hay `rounded-2xl`, no hay `rounded-full` salvo en el círculo de reproducción y en los puntos.
- Filete: `border-white/[0.12]` sobre teal, `border-[#E7E1D8]` sobre papel. Un solo grosor: 1px.
- Riel de marca: `border-l-2 border-[#B9735A]`. Es lo único que usa terracota plena.
- Foco, y esto no existe hoy en ninguna parte del portal: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFA48F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#002B34]`. Todo elemento interactivo lo lleva.
- Sombras: ninguna. En un lienzo teal profundo la sombra no se ve y la elevación se comunica con `#0A3B45`.

---

## 3. Las cinco pantallas del lector

1. **El umbral**, una vez por experiencia y por persona.
2. **El recorrido**, el mapa.
3. **La bisagra de pantalla**, la página de lectura.
4. **La bisagra de sala o de objeto**, pantalla de cierre.
5. **El final**.

### 3.1 Shell

```tsx
// portal/app/prototipo/personalab/leer/[expId]/[bisagraId]/page.tsx
<div className="min-h-[100svh] overflow-x-clip bg-[#002B34] font-[family-name:var(--font-hn)] text-[#F2EFE9] antialiased">
  {esModerador && <BandaModerador expId={expId} />}
  <BarraLectura tiempo="Víspera" titulo="La carta de convocatoria" expId={expId} conBanda={esModerador} />
  <article className="mx-auto w-full max-w-[46rem] px-5 pb-32 pt-8 sm:px-8 sm:pt-14">
    <CabeceraBisagra ... />
    {bloques.map(b => <Bloque key={b.id} b={b} esModerador={esModerador} />)}
    <PieSigue siguiente={siguiente} />
  </article>
</div>
```

`min-h-[100svh]` y no `100vh`: en Safari de iOS la barra de URL colapsa y `100vh` provoca un salto de unos 60px. Tailwind 3.4 soporta la unidad. Hoy no se usa en ningún archivo del repositorio.

### 3.2 Barra de lectura, 52px

```tsx
<header className={`sticky z-40 h-[52px] border-b border-white/[0.12] bg-[#002B34]/[0.92] backdrop-blur-[6px] ${conBanda ? 'top-10' : 'top-0'}`}>
  <div className="mx-auto flex h-full max-w-[46rem] items-center gap-3 px-5 sm:px-8">
    <Link
      href={`/e/${expId}`}
      aria-label="Ir al recorrido"
      className="-ml-2.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[6px] text-[#A8C3C8] transition-colors hover:text-[#F2EFE9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFA48F]"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </Link>

    <button type="button" onClick={abrirMapa} className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFA48F]">
      <span className="text-[0.625rem] font-medium uppercase leading-none tracking-[0.28em] text-[#CFA48F]">
        {tiempo}
      </span>
      <span className="w-full truncate text-[0.8125rem] font-normal leading-none text-[#A8C3C8]">
        {titulo}
      </span>
    </button>

    <span className="flex-shrink-0 text-[0.625rem] uppercase tracking-[0.22em] text-[#8FB0B6]">
      Recorrido
    </span>
  </div>
</header>
```

Corrige el hallazgo más grave del admin actual: la página de detalle de evento no tiene título en ninguna parte salvo un sub-nav truncado a 180px (`eventos/[id]/page.tsx:127`, `EventSubNav.tsx:54`). Aquí el título de la bisagra y el tiempo están siempre a la vista, y tocarlos abre el mapa.

Cromo total: 52px para el participante, 92px para el moderador.

---

## 4. Catálogo de bloques

### 4.0 Contrato de datos

```ts
// portal/app/prototipo/personalab/bloques.ts
export type Audiencia = 'todos' | 'solo_moderador'

export interface Base { id: string; orden: number; audiencia: Audiencia }

export type Bloque =
  | (Base & { tipo: 'texto';     subtitulo?: string; parrafos: string[]; lista?: string[] })
  | (Base & { tipo: 'cita';      texto: string; autor?: string })
  | (Base & { tipo: 'imagen';    url: string; alt: string; ancho: number; alto: number; pie?: string })
  | (Base & { tipo: 'video';     embedUrl: string; poster: string; titulo: string; duracion: string })
  | (Base & { tipo: 'archivo';   url: string; nombre: string; extension: string; peso: string; paginas?: number })
  | (Base & { tipo: 'consigna';  consigna: string; nota?: string })
  | (Base & { tipo: 'nota';      etiqueta: string; texto: string })
  | (Base & { tipo: 'documento'; titulo: string; tipoDoc: string; secciones: { encabezado?: string; cuerpo: string }[] })
  | (Base & { tipo: 'respiro' })
```

Nueve tipos. `audiencia` vive en el bloque, no en la bisagra, porque un mismo momento tiene capas para los dos.

Regla de despacho: si `audiencia === 'solo_moderador'` y el lector no es moderador, el bloque **no se renderiza y no deja hueco**. Nada de placeholders con candado.

### 4.1 `texto`

```tsx
<section className="mx-auto mt-11 w-full max-w-[36rem] sm:mt-14">
  {b.subtitulo && (
    <h3 className="mb-4 text-[1.3125rem] font-light leading-[1.3] tracking-[-0.01em] text-[#F2EFE9] sm:text-[1.5rem]">
      {b.subtitulo}
    </h3>
  )}

  <div className="space-y-6 sm:space-y-7">
    {b.parrafos.map((p, i) => (
      <p key={i} className="whitespace-pre-wrap text-[1.0625rem] font-normal leading-[1.75] text-[#F2EFE9] sm:text-[1.125rem] sm:leading-[1.7]">
        {p}
      </p>
    ))}
  </div>

  {b.lista && (
    <ul className="mt-7 space-y-3.5">
      {b.lista.map((li, i) => (
        <li key={i} className="relative pl-6 text-[1.0625rem] font-normal leading-[1.7] text-[#F2EFE9] sm:text-[1.125rem]">
          <span aria-hidden className="absolute left-0 top-[0.73em] h-1 w-1 rounded-full bg-[#B9735A]" />
          {li}
        </li>
      ))}
    </ul>
  )}
</section>
```

El `top-[0.73em]` centra un punto de 4px en la primera línea de un texto con leading 1.7: el centro de la caja de línea cae a 0.85em y la mitad del punto son 0.12em.

`parrafos` es un arreglo, no un `string` con saltos. El repositorio actual guarda texto largo como string plano y lo pinta con `whitespace-pre-wrap` (`info/page.tsx:152`), que es la razón de que no exista ningún control tipográfico. El `whitespace-pre-wrap` se conserva dentro del párrafo para saltos intencionales, pero el ritmo entre párrafos lo pone el `space-y`, no el autor.

### 4.2 `cita`

```tsx
<figure className="mx-auto mt-14 w-full max-w-[34rem] border-l-2 border-[#B9735A] pl-6 sm:mt-20 sm:pl-8">
  <blockquote className="text-[1.375rem] font-light leading-[1.45] tracking-[-0.01em] text-[#F2EFE9] sm:text-[1.625rem] sm:leading-[1.4]">
    {b.texto}
  </blockquote>
  {b.autor && (
    <figcaption className="mt-5 text-[0.8125rem] font-medium uppercase leading-none tracking-[0.16em] text-[#CFA48F]">
      {b.autor}
    </figcaption>
  )}
</figure>
```

Sin comillas tipográficas dibujadas y sin itálica. El riel de 2px hace todo el trabajo. La cita es más angosta que el texto (544 contra 576) para que se lea como respiro y no como continuación.

### 4.3 `imagen`

```tsx
<figure className="mx-auto mt-14 w-full max-w-[46rem] sm:mt-20">
  <div
    className="relative -mx-5 w-[calc(100%_+_2.5rem)] overflow-hidden bg-[#0A3B45] sm:mx-0 sm:w-full sm:rounded-[6px]"
    style={{ aspectRatio: `${b.ancho} / ${b.alto}` }}
  >
    <Image
      src={b.url}
      alt={b.alt}
      fill
      sizes="(max-width: 640px) 100vw, 736px"
      className="object-cover"
    />
  </div>
  {b.pie && (
    <figcaption className="mx-auto mt-4 max-w-[36rem] px-0 text-[0.8125rem] font-light leading-[1.6] text-[#8FB0B6]">
      {b.pie}
    </figcaption>
  )}
</figure>
```

Tres cosas nuevas para este repositorio:

- **Sangrado completo en teléfono.** `-mx-5 w-[calc(100%_+_2.5rem)]` anula el gutter de 20px y la imagen toca los dos bordes. Necesita `overflow-x-clip` en el shell.
- **`next/image`.** Hoy el lado participante tiene exactamente una etiqueta de imagen y es un `<img>` crudo con eslint desactivado (`equipo/page.tsx:66`). No existe ningún patrón de imagen dentro de texto: esto es código nuevo.
- **`alt` obligatorio.** Si el autor deja el `alt` vacío, la publicación se bloquea. Es la única validación de accesibilidad que exijo en la puerta.

La caja lleva `aspectRatio` con el alto y el ancho reales, no `aspect-video` fijo, para que no haya salto de layout mientras carga.

### 4.4 `video`

```tsx
'use client'
<figure className="mx-auto mt-14 w-full max-w-[46rem] sm:mt-20">
  <div className="relative -mx-5 aspect-video w-[calc(100%_+_2.5rem)] overflow-hidden bg-[#0A3B45] sm:mx-0 sm:w-full sm:rounded-[6px]">
    {!abierto ? (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="group absolute inset-0 h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#CFA48F]"
      >
        <Image src={b.poster} alt="" fill sizes="(max-width: 640px) 100vw, 736px" className="object-cover opacity-70 transition-opacity duration-200 group-hover:opacity-85 motion-reduce:transition-none" />
        <span aria-hidden className="absolute inset-0 bg-[#002B34]/40" />
        <span aria-hidden className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#CFA48F]/60 bg-[#002B34]/70 backdrop-blur-[2px]">
          <svg width="18" height="20" viewBox="0 0 18 20" fill="#CFA48F" aria-hidden="true"><path d="M17 10 0 20V0z" /></svg>
        </span>
        <span className="absolute bottom-4 left-5 text-[0.75rem] font-medium uppercase tracking-[0.18em] text-[#F2EFE9]" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {b.duracion}
        </span>
        <span className="sr-only">Reproducir {b.titulo}</span>
      </button>
    ) : (
      <iframe
        src={`${b.embedUrl}?autoplay=1`}
        title={b.titulo}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    )}
  </div>
</figure>
```

El reproductor de terceros no se monta hasta el toque. En un teléfono con datos móviles eso ahorra entre 300KB y 900KB de JavaScript por bloque de video. La duración va visible antes de tocar, para que el participante decida con información.

Nunca `autoplay` sin toque. Nunca video de fondo.

### 4.5 `archivo`

```tsx
<a
  href={b.url}
  download
  className="mx-auto mt-11 flex w-full max-w-[36rem] items-center gap-4 rounded-[6px] border border-white/[0.14] bg-[#0A3B45] px-5 py-4 transition-colors hover:border-[#CFA48F]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFA48F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#002B34] motion-reduce:transition-none sm:mt-14"
>
  <span aria-hidden className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[4px] border border-[#CFA48F]/35 text-[0.625rem] font-medium uppercase tracking-[0.08em] text-[#CFA48F]">
    {b.extension}
  </span>
  <span className="min-w-0 flex-1">
    <span className="block truncate text-[0.9375rem] font-normal leading-tight text-[#F2EFE9]">{b.nombre}</span>
    <span className="mt-1 block text-[0.75rem] font-light text-[#8FB0B6]" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {b.paginas ? `${b.paginas} páginas · ` : ''}{b.peso}
    </span>
  </span>
  <span aria-hidden className="flex-shrink-0 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#CFA48F]">
    Descargar
  </span>
</a>
```

Alto total 76px. Por defecto `audiencia: 'solo_moderador'`, que es lo que Francisco pidió textualmente: el PDF lo descarga el moderador. Un archivo con `audiencia: 'todos'` es la excepción y el autor tiene que elegirla a mano.

Peso y páginas siempre visibles antes de tocar. El repositorio hoy lista documentos en la peor página que tiene (`documentos/page.tsx`, estilos inline, tarjeta blanca dentro de layout oscuro, nombre del documento sin color declarado que hereda crema sobre blanco y queda invisible en la línea 67). Este bloque la reemplaza.

### 4.6 `consigna`

```tsx
<aside className="mx-auto mt-14 w-full max-w-[36rem] border-y border-[#B9735A]/35 py-8 sm:mt-20 sm:py-10">
  <p className="text-[0.6875rem] font-medium uppercase leading-none tracking-[0.3em] text-[#CFA48F]">
    Para escribir a mano
  </p>
  <p className="mt-5 text-[1.1875rem] font-normal leading-[1.55] text-[#F2EFE9] sm:text-[1.3125rem]">
    {b.consigna}
  </p>
  {b.nota && (
    <p className="mt-4 text-[0.875rem] font-light leading-[1.7] text-[#8FB0B6]">{b.nota}</p>
  )}
</aside>
```

**No lleva campo de texto.** El bloque presenta la consigna y se calla. La regla universal heredada es escritura a mano sobre lo digital (`Renata.md:22` y `:100`), y el objeto de la Víspera es la libreta, no el formulario.

La única excepción es el Retorno, donde Renata diseñó dos cuerpos intercambiables, libreta física y PWA (`Renata.md:58`). Esa superficie de escritura pertenece a la especificación del Retorno, no a esta. Aquí solo dejo la frontera dicha.

### 4.7 `nota`

```tsx
<aside className="mx-auto mt-11 w-full max-w-[36rem] rounded-[6px] bg-[#0A3B45] px-5 py-5 sm:mt-14 sm:px-6 sm:py-6">
  <p className="text-[0.625rem] font-medium uppercase leading-none tracking-[0.28em] text-[#CFA48F]">
    {b.etiqueta}
  </p>
  <p className="mt-4 text-[0.9375rem] font-normal leading-[1.7] text-[#A8C3C8] sm:text-[1rem]">
    {b.texto}
  </p>
</aside>
```

Una sola variante. No hay nota roja, ámbar y azul. El repositorio actual tiene tres mapas de color por tipo que además se contradicen entre pantallas (`ItinerarioClient.tsx:36-46`, `ItinerarioList.tsx:30-40`, `OperacionClient.tsx:59-69`). La etiqueta lleva la semántica; el color no.

### 4.8 `documento`

Único cambio de modo del lector. Es la hoja clara sobre lienzo oscuro de `acuerdos/[id]/page.tsx:36-47`, repintada a papel.

```tsx
<article className="-mx-5 mt-14 bg-[#FAF8F4] px-6 py-10 sm:-mx-8 sm:mt-20 sm:rounded-[6px] sm:px-12 sm:py-14">
  <header className="border-b border-[#E7E1D8] pb-7">
    <p className="text-[0.625rem] font-medium uppercase leading-none tracking-[0.3em] text-[#8F5341]">
      {b.tipoDoc}
    </p>
    <h2 className="mt-4 text-[1.5rem] font-light leading-[1.25] tracking-[-0.01em] text-[#14181B] sm:text-[1.75rem]">
      {b.titulo}
    </h2>
  </header>

  <div className="mt-8 space-y-7">
    {b.secciones.map((s, i) => (
      <section key={i}>
        {s.encabezado && (
          <h3 className="mb-2 text-[0.9375rem] font-medium leading-snug text-[#14181B]">
            {i + 1}. {s.encabezado}
          </h3>
        )}
        <p className="max-w-[34rem] whitespace-pre-wrap text-[1rem] font-light leading-[1.75] text-[#14181B] sm:text-[1.0625rem]">
          {s.cuerpo}
        </p>
      </section>
    ))}
  </div>
</article>
```

Toma la versión pública, que está mejor resuelta que la privada: artículos numerados con `{i + 1}` (`firmar/[token]/page.tsx:157`) y cabecera con más aire. La versión privada no numera y usa un cuerpo un tono más claro.

Cuidado heredado: el layout impone `text-[#F2EFE9]` a todo lo que cuelga de él. Este bloque tiene que declarar `text-[#14181B]` en cada nodo de texto o hereda crema sobre papel, que es exactamente el defecto vivo de `documentos/page.tsx:67`.

### 4.9 `respiro`

```tsx
<div aria-hidden className="mx-auto my-20 flex w-full max-w-[36rem] items-center justify-center sm:my-28">
  <span className="h-1 w-1 rounded-full bg-[#B9735A]" />
  <span className="mx-3 h-1 w-1 rounded-full bg-[#B9735A]/50" />
  <span className="h-1 w-1 rounded-full bg-[#B9735A]/25" />
</div>
```

Tres puntos que se desvanecen, 80px de aire arriba y abajo. Es la única ornamentación del lector y existe porque `BRAND.md:146` pide amplio y sereno, con espacio para respirar.

### 4.10 Envoltura del bloque de moderador

```tsx
<div className="mx-auto mt-11 w-full max-w-[36rem] border-l-2 border-[#B9735A] bg-[#0A3B45] py-5 pl-5 pr-5 sm:mt-14 sm:pl-6 sm:pr-6">
  <p className="text-[0.625rem] font-medium uppercase leading-none tracking-[0.28em] text-[#CFA48F]">
    Solo tú ves esto
  </p>
  <div className="mt-4 [&>*]:!mt-0 [&>*]:!max-w-none">{children}</div>
</div>
```

El `[&>*]:!mt-0` cancela el margen superior del bloque envuelto, que ya lo pone la envoltura, y el `!max-w-none` deja que el bloque llene el ancho del contenedor.

---

## 5. Navegación

### 5.1 El recorrido, el mapa

Ruta `/e/[expId]`. Es a la vez índice y respuesta a dónde estoy.

```tsx
<nav aria-label="El recorrido" className="mx-auto w-full max-w-[36rem] px-5 pb-32 pt-10 sm:px-8 sm:pt-14">
  <p className="text-[0.6875rem] font-medium uppercase leading-none tracking-[0.3em] text-[#CFA48F]">
    El recorrido
  </p>
  <h1 className="mt-6 text-[clamp(1.875rem,7vw,2.75rem)] font-light leading-[1.08] tracking-[-0.02em] text-[#F2EFE9]">
    {exp.nombre}
  </h1>

  {TIEMPOS.map(t => (
    <section key={t.id} className="mt-16 first:mt-14">
      <h2 className="text-[clamp(1.625rem,5vw,2.125rem)] font-light leading-[1.1] tracking-[-0.01em] text-[#F2EFE9]">
        {t.titulo}
      </h2>
      <p className="mt-3 max-w-[30rem] text-[0.875rem] font-light leading-[1.7] text-[#8FB0B6]">
        {t.resumen}
      </p>

      <ol className="mt-7">
        {t.bisagras.map(b => {
          const aqui = b.id === actual
          const cerrada = !b.abierta
          return (
            <li key={b.id}>
              <Link
                href={cerrada ? '#' : `/e/${exp.id}/${b.id}`}
                aria-current={aqui ? 'step' : undefined}
                aria-disabled={cerrada || undefined}
                tabIndex={cerrada ? -1 : undefined}
                className={[
                  'block border-l-2 py-4 pl-5 pr-1 transition-colors motion-reduce:transition-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFA48F]',
                  aqui ? 'border-[#B9735A] bg-white/[0.05]' : 'border-white/[0.10] hover:border-[#CFA48F]/50',
                  cerrada ? 'pointer-events-none opacity-60' : '',
                ].join(' ')}
              >
                <span className="flex items-baseline justify-between gap-4">
                  <span className="text-[1.0625rem] font-normal leading-snug text-[#F2EFE9]">
                    {b.titulo}
                  </span>
                  {aqui && (
                    <span className="flex-shrink-0 text-[0.625rem] font-medium uppercase tracking-[0.24em] text-[#CFA48F]">
                      Aquí vas
                    </span>
                  )}
                </span>
                <span className="mt-1.5 block text-[0.8125rem] font-light leading-[1.6] text-[#8FB0B6]">
                  {cerrada ? b.razonCerrada : LINEA_SOPORTE[b.soporte]}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  ))}
</nav>
```

```ts
const LINEA_SOPORTE = {
  pantalla: 'Para leer',
  sala:     'Ocurre en la sala',
  objeto:   'Se recibe en la mano',
}
```

Cinco cosas que hace este mapa:

1. **Dice dónde estás con una palabra**, no con una fracción. El riel de 2px en `#B9735A` es el mismo gesto de `WorkspaceNav.tsx:103`.
2. **No marca lo ya leído.** Ningún ítem anterior cambia de aspecto. Marcar los anteriores es una barra de progreso hecha de filas.
3. **Muestra lo cerrado en vez de esconderlo, con su razón**: "Se abre el 15 de agosto", "La abre Rodrigo el día de la corrida". Es el patrón de `programa/page.tsx:234-239`, que es lo mejor que tiene el portal para contenido progresivo.
4. **Anuncia el soporte antes de entrar.** El participante sabe si va a leer o si eso pasa en la sala antes de tocar.
5. **Alto de fila 72px**, muy por encima del mínimo táctil de 44px.

`opacity-60` para lo cerrado, no `opacity-45` ni `text-white/20`. Con 60 por ciento el contraste efectivo se queda alrededor de 5:1; el `white/20` que usa hoy el portal para el sello de disponibilidad mide 1.90:1 sobre `#1A1A1A`, es decir es texto que técnicamente no está ahí.

### 5.2 El mapa como hoja, en teléfono

Tocar el título de la barra abre la misma lista como hoja de abajo hacia arriba, el patrón de `HelpButton.tsx:63-71`, corregido:

```tsx
<div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm" onClick={cerrar}>
  <div
    role="dialog"
    aria-modal="true"
    aria-label="El recorrido"
    onClick={e => e.stopPropagation()}
    className="max-h-[85svh] overflow-y-auto rounded-t-[6px] border-t-2 border-[#B9735A] bg-[#002B34] px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-6"
  >
    ...misma lista...
  </div>
</div>
```

Con lo que el modal actual no tiene: `role="dialog"`, `aria-modal`, cierre con Escape, bloqueo del scroll del cuerpo y trampa de foco. El modal de `ItinerarioClient.tsx:359-437` no tiene ninguna de las cinco.

### 5.3 Avanzar

```tsx
<footer className="mx-auto mt-20 w-full max-w-[36rem] sm:mt-28">
  <div aria-hidden className="h-px w-16 bg-[#B9735A]" />

  {siguiente ? (
    <Link href={`/e/${expId}/${siguiente.id}`} className="group mt-8 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFA48F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#002B34]">
      <span className="block text-[0.6875rem] font-medium uppercase leading-none tracking-[0.3em] text-[#8FB0B6]">
        Sigue
      </span>
      <span className="mt-3 block text-[1.375rem] font-light leading-[1.35] text-[#F2EFE9] transition-colors group-hover:text-[#CFA48F] motion-reduce:transition-none sm:text-[1.5rem]">
        {siguiente.titulo}
      </span>
      <span className="mt-2 block text-[0.8125rem] font-light text-[#8FB0B6]">
        {LINEA_SOPORTE[siguiente.soporte]}
      </span>
    </Link>
  ) : (
    <CierreDeTiempo tiempo={tiempo} siguienteTiempo={siguienteTiempo} />
  )}
</footer>
```

Un solo destino, nombrado. No hay "Siguiente" genérico, no hay flechas de anterior y siguiente compitiendo. La única vuelta atrás es la barra superior, y siempre lleva al mapa.

### 5.4 Regla de apertura

Una bisagra se abre por **fecha** (`abre_at`) o por **la mano del moderador**. Jamás por lo que hizo el participante.

El desbloqueo secuencial de `mi-retiro/page.tsx:317-395`, donde el paso 2 está en `opacity-60 pointer-events-none` hasta terminar el paso 1, es progreso con otro nombre y no se hereda.

### 5.5 Marcador de lectura

Se guarda `ultima_bisagra_vista` por grant. Es un marcapáginas, no una métrica: nunca se agrega, nunca se convierte en fracción, nunca se muestra a nadie más que a su dueño, y su único efecto visible es que el mapa se abre con la fila correcta a la vista. El campo no se llama `hinges_completed` ni nada que se le parezca.

### 5.6 Tope de longitud

Una bisagra de `pantalla` no pasa de **8 bloques o unas 1.200 palabras**. Pasado eso, el autor tiene que partirla. Es lo que permite no tener indicador de scroll: una bisagra cabe en una sesión de lectura de tres a cinco minutos.

---

## 6. Moderador y participante en la misma experiencia

El acceso es del moderador, que compra para su foro. Algunas experiencias abren espacio individual a la gente del foro según `abreEspacioAlForo` (`dominio.ts:88`).

### 6.1 Banda de moderador, 40px

```tsx
<div className="sticky top-0 z-50 border-t-2 border-[#B9735A] bg-[#0A3B45]">
  <div className="mx-auto flex h-10 max-w-[46rem] items-center justify-between gap-3 px-5 sm:px-8">
    <span className="truncate text-[0.625rem] font-medium uppercase tracking-[0.24em] text-[#CFA48F]">
      Lo ves como moderador
    </span>
    <Link
      href={`?como=participante`}
      className="flex-shrink-0 text-[0.625rem] font-medium uppercase tracking-[0.18em] text-[#A8C3C8] underline-offset-4 transition-colors hover:text-[#F2EFE9] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFA48F]"
    >
      Ver como participante
    </Link>
  </div>
</div>
```

Con `?como=participante` la banda cambia de texto a "Lo ves como lo ve tu foro" y el enlace pasa a "Volver a tu vista". Es un query param, no estado guardado: recargar devuelve la vista real.

### 6.2 Tabla de diferencias

| Cosa | Participante | Moderador |
|---|---|---|
| Banda superior de 40px | No existe | Sí, terracota |
| Cromo total | 52px | 92px |
| Bloques `solo_moderador` | No se renderizan, no dejan hueco | Envoltura con riel y "Solo tú ves esto" |
| Archivos del kit y guion | Invisibles | Descargables |
| `requiere[]` de la bisagra (`dominio.ts:50`) | Invisible | Lista al pie de la bisagra |
| `duracion` de la bisagra | Invisible | Visible en el mapa y en la cabecera |
| Bisagra de `sala` | Pantalla de cierre | Guion completo, modo sala |
| Bisagras aún cerradas para el foro | `opacity-60` más razón | Abiertas, con el rótulo "Tu foro aún no lo ve" |
| `notaDiseño` (`dominio.ts:94`) | Nunca | Nunca. Eso vive en el back office, no en el lector |
| Marca de titularidad | Nada | Una línea al pie del umbral: "El acceso es tuyo. La gente que convoques no necesita cuenta." |

El renglón de titularidad ya está escrito en el prototipo (`experiencia/[id]/page.tsx:231-234`) y se conserva casi literal.

### 6.3 Una sola fuente

La página es la misma. La capa del moderador es aditiva. No existe `/guion` ni `/moderador` como ruta paralela. La razón está en el propio repositorio: el contenido de acuerdo está implementado dos veces, en `acuerdos/[id]/page.tsx:67-94` y en `firmar/[token]/page.tsx:152-172`, y ya divergió en tres puntos sin que nadie lo decidiera.

---

## 7. Teléfono

Es donde va a pasar. Anchos de referencia: 375 (iPhone SE y mini), 390 (iPhone 14), 430 (Pro Max).

| Regla | Valor |
|---|---|
| Gutter | 20px (`px-5`), 32px a partir de 640 (`sm:px-8`) |
| Medida a 375px | 335px útiles a 17px, unos 40 caracteres |
| Alto de viewport | `min-h-[100svh]`, nunca `100vh` |
| Objetivo táctil mínimo | 44 × 44. Volver: 44×44. Fila del mapa: 72px. Archivo: 76px. Botón principal: 56px |
| Colchón inferior | `pb-32` (128px). Sin barra fija abajo, el colchón es lo que despega la última línea del indicador de inicio |
| Safe area | Solo en la hoja del mapa: `pb-[max(2.5rem,env(safe-area-inset-bottom))]` |
| Sangrado | Imagen y video sangran a los dos bordes con `-mx-5 w-[calc(100%_+_2.5rem)]`. El shell lleva `overflow-x-clip` o aparece scroll horizontal |
| Zoom de iOS | Ningún control con fuente menor a 16px. El lector casi no tiene controles, pero la regla aplica a la búsqueda del mapa si se agrega |
| Ajuste de texto | `-webkit-text-size-adjust: 100%` en `html`, o Safari en horizontal infla el cuerpo |
| Scroll horizontal | Prohibido en el cuerpo. La tabla no existe en el lector. Si algún día existe, va dentro de `overflow-x-auto` propio |
| Barras de scroll ocultas | Prohibido usar `scrollbar-hide` ni `scrollbar-none`. Ninguna de las dos existe: no son utilidades de Tailwind 3 y `tailwind.config.ts:17` declara `plugins: []`. Están vivas y muertas en `programa/page.tsx:137` y `EventSubNav.tsx:69` |
| Movimiento | Toda transición lleva `motion-reduce:transition-none`. Duración máxima 200ms |
| Imágenes | `sizes="(max-width: 640px) 100vw, 736px"` siempre |

### Presupuesto de la pantalla de 812px de alto

- Barra de lectura: 52px, el 6.4 por ciento.
- Texto visible en el primer pliegue: unas 21 líneas a 29.75px de interlineado.

Con la barra inferior de cinco destinos que hereda hoy el participante serían 52 + 64 + 34 de safe area, o sea 150px de cromo, el 18 por ciento del alto. Por eso el lector no la lleva.

---

## 8. Los cuatro momentos de transición

### 8.1 Entrar: el umbral

Se ve una vez por experiencia y por persona, la primera vez que entra. Ocupa la pantalla completa, sin barra, sin scroll obligado.

```tsx
<section className="flex min-h-[100svh] flex-col justify-between bg-[#002B34] px-6 pb-10 pt-16 sm:px-10 sm:pb-16 sm:pt-24">
  <div className="mx-auto flex w-full max-w-[36rem] flex-1 flex-col justify-center">
    <p className="text-[0.6875rem] font-medium uppercase leading-none tracking-[0.3em] text-[#CFA48F]">
      PersonaLab
    </p>

    <h1 className="mt-7 text-[clamp(2.125rem,8.5vw,3.5rem)] font-light leading-[1.03] tracking-[-0.02em] text-[#F2EFE9]">
      Metamorfosis y Metanoia
    </h1>

    <p className="mt-4 text-[1.0625rem] font-light leading-[1.5] text-[#A8C3C8] sm:text-[1.1875rem]">
      Cerrando círculos
    </p>

    <p className="mt-10 max-w-[26rem] text-[1.375rem] font-light leading-[1.35] text-[#CFA48F] sm:text-[1.625rem]">
      No estás roto, estás mudando.
    </p>

    <div aria-hidden className="mt-12 h-px w-16 bg-[#B9735A]" />

    <p className="mt-6 text-[0.875rem] font-light leading-[1.75] text-[#8FB0B6]">
      Te convocó Rodrigo Lemus.<br />
      Foro Anáhuac · 15 de agosto.
    </p>
  </div>

  <div className="mx-auto w-full max-w-[36rem]">
    <Link
      href={`/e/${expId}/${primera.id}`}
      className="flex h-14 w-full items-center justify-center rounded-[6px] bg-[#B9735A] text-[0.875rem] font-medium uppercase tracking-[0.18em] text-[#14181B] transition-colors hover:bg-[#CFA48F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFA48F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#002B34] motion-reduce:transition-none"
    >
      Entrar
    </Link>
    <p className="mt-6 text-center text-[0.625rem] uppercase tracking-[0.28em] text-[#8FB0B6]">
      Una experiencia de 4 Meaning
    </p>
  </div>
</section>
```

Cuatro reglas de oficio que este umbral cumple, sacadas de `Renata.md:99`:

- **La casa se presenta como sello de aval al pie, no como marca en la puerta.** Arriba manda PersonaLab, abajo "Una experiencia de 4 Meaning", que es el sello literal de `BRAND.md:127`.
- **Puerta única.** El umbral no muestra catálogo. Con un solo acceso se atraviesa en segundos.
- **Nombra a quien invitó.** "Te convocó Rodrigo Lemus". La pertenencia concreta no se pierde dentro de la casa.
- **La narrativa antes que la logística.** La frase de la experiencia va a 22 o 26px en terracota, arriba de la fecha.

Tinta `#14181B` sobre el botón terracota, no teal. Medido: 4.81:1 contra 4.06:1.

### 8.2 Terminar una parte: el cierre de bisagra

No dice completado, no da una palomita, no suma nada. Un filete de 64px, y el nombre de lo que sigue. Está en 5.3.

Si la bisagra pertenece al Retorno, el filete se acompaña de un solo gesto de cierre, que escribe `occurred_at` y no un booleano `completado`. Renata sustituyó explícitamente el booleano por el timestamp (`Renata.md:100`).

### 8.3 Terminar un tiempo: el traspaso

Aquí la pantalla se apaga y entrega el turno a la sala. Es el momento más importante del lector.

```tsx
<section className="-mx-5 mt-24 bg-[#0A3B45] px-6 py-24 sm:-mx-8 sm:rounded-[6px] sm:px-14 sm:py-32">
  <p className="text-[0.6875rem] font-medium uppercase leading-none tracking-[0.3em] text-[#CFA48F]">
    Termina la Víspera
  </p>
  <p className="mt-8 max-w-[26rem] text-[1.5rem] font-light leading-[1.4] text-[#F2EFE9] sm:text-[1.875rem]">
    Lo que sigue ocurre en la sala. Nos vemos el 15 de agosto.
  </p>
  <p className="mt-7 max-w-[24rem] text-[0.9375rem] font-light leading-[1.7] text-[#8FB0B6]">
    No hace falta traer el teléfono. Trae el objeto y la libreta.
  </p>
</section>
```

96px de aire arriba, 96 y 128 de padding interno, superficie elevada y solo tres líneas. Es la pantalla más vacía del producto y así tiene que ser.

### 8.4 Bisagra que no es de pantalla

```tsx
<section className="mx-auto flex min-h-[60svh] w-full max-w-[34rem] flex-col justify-center px-5 py-20 text-center sm:px-8">
  <p className="text-[0.6875rem] font-medium uppercase leading-none tracking-[0.3em] text-[#CFA48F]">
    {tiempo}
  </p>
  <h1 className="mt-6 text-[clamp(1.75rem,6vw,2.5rem)] font-light leading-[1.15] tracking-[-0.015em] text-[#F2EFE9]">
    {bisagra.titulo}
  </h1>
  <p className="mx-auto mt-7 max-w-[24rem] text-[1rem] font-light leading-[1.75] text-[#A8C3C8] sm:text-[1.0625rem]">
    {CIERRE[bisagra.soporte]}
  </p>
</section>
```

```ts
const CIERRE = {
  sala:   'Esto ocurre entre personas, en la sala. No hay nada que leer aquí.',
  objeto: 'Esto se recibe en la mano. No se descarga.',
}
```

Sin llamada a la acción, sin enlace de "Sigue". Solo la barra superior para volver al mapa. La pantalla que dice que no le toca no puede invitar a seguir usándola.

Para el moderador, la misma bisagra de `sala` sí abre el guion, con `duracion` y `requiere[]`.

### 8.5 El final

```tsx
<section className="mx-auto flex min-h-[80svh] w-full max-w-[34rem] flex-col justify-center px-5 py-24 sm:px-8">
  <div aria-hidden className="h-px w-16 bg-[#B9735A]" />

  <h1 className="mt-10 text-[clamp(1.875rem,7vw,2.75rem)] font-light leading-[1.08] tracking-[-0.02em] text-[#F2EFE9]">
    Hasta aquí llega la pantalla.
  </h1>

  <p className="mt-8 text-[1.0625rem] font-normal leading-[1.75] text-[#A8C3C8] sm:text-[1.125rem]">
    Lo que hiciste no está aquí dentro. Está en la libreta que escribiste a mano y en lo que dijiste en voz alta frente a tu foro.
  </p>

  <p className="mt-6 text-[1.0625rem] font-normal leading-[1.75] text-[#A8C3C8] sm:text-[1.125rem]">
    Rodrigo Lemus te entrega tu testimonio en persona el 12 de febrero.
  </p>

  <Link
    href={`/e/${expId}`}
    className="mt-14 inline-flex w-fit items-center border-b border-[#CFA48F]/45 pb-1.5 text-[0.8125rem] font-medium uppercase tracking-[0.2em] text-[#CFA48F] transition-colors hover:border-[#CFA48F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFA48F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#002B34]"
  >
    Volver al recorrido
  </Link>
</section>
```

Sin certificado, sin descarga, sin resumen de lo recorrido, sin porcentaje. El testimonio lo entrega una persona, en una fecha, en la mano (`Renata.md:57` y `:100`).

---

## 9. Accesibilidad, lo que hoy no existe y aquí sí

| Regla | Estado actual del repositorio |
|---|---|
| Anillo de foco visible en todo interactivo | Hoy hay cuatro tratamientos distintos en cuatro archivos hermanos y en el lado participante solo cambia el color del borde |
| `aria-current="step"` en la fila actual del mapa | No existe concepto de posición |
| `role="dialog"`, `aria-modal`, Escape, trampa de foco, bloqueo de scroll en la hoja | El modal de `ItinerarioClient.tsx:359-437` no tiene ninguna de las cinco |
| `alt` obligatorio en imagen, validado en la publicación | No hay imágenes en contenido |
| Contraste mínimo 4.5:1 en todo texto | `white/20` en `programa/page.tsx:256` mide 1.90:1 |
| `motion-reduce:transition-none` | No aparece en ningún archivo |
| `lang="es"` | Ya está en `app/layout.tsx:35` |
| Encabezados en orden, un solo `h1` por pantalla | El detalle de evento no tiene `h1` |

---

## 10. Lo que el lector no hace, y es intencional

1. No tiene barra de progreso, porcentaje, racha, insignia, puntaje ni contador de "n de N".
2. No marca lo ya leído en el mapa.
3. No desbloquea por actividad del participante.
4. No pide correo, no pide cuenta a la gente del foro, no pide respuesta escrita en pantalla salvo en el Retorno.
5. No autorreproduce video ni audio.
6. No usa emoji. El repositorio mezcla emoji con SVG dibujado a mano en `programa/page.tsx:205`, `acuerdos/page.tsx:81` y `avisos/page.tsx:55`. Aquí todo icono es SVG en línea, `strokeWidth={1.5}`, `currentColor`.
7. No usa guion largo en ningún texto visible. Los rangos van con la palabra "a" o con punto medio. El repositorio actual lo tiene en `OperacionClient.tsx:262`, `NuevoItemForm.tsx:174` y `:176`, `info/page.tsx:142`, `mi-retiro/page.tsx:264` y `:279`, y en varias respuestas del FAQ.
8. No entrega nada al final.

---

## 11. Orden de construcción sugerido

1. Extender `tailwind.config.ts` con los tokens y declarar `--font-hn` en `globals.css`. Sin esto todo lo demás son cadenas ilegibles.
2. `bloques.ts` con el contrato de nueve tipos, compartido con el editor del autor.
3. El shell, la barra de 52px y el bloque `texto`. Con eso ya se puede leer.
4. `cita`, `nota`, `respiro`. Son puro CSS.
5. El mapa El recorrido y el pie Sigue. Aquí ya se puede navegar la experiencia completa.
6. `imagen` y `video`. Necesitan `next/image` y almacenamiento, es donde entra la infraestructura.
7. `archivo` y la capa de moderador con la banda y `?como=participante`.
8. Umbral, cierre de tiempo, bisagra de sala, final. Son las cuatro transiciones y se hacen juntas porque comparten la misma composición vertical centrada.
9. `documento`, portado desde `firmar/[token]/page.tsx:115-187`, que es la mejor de las dos versiones existentes.


---

# Diseno entregado

Especificación de la pantalla de autoría de PersonaLab, escrita entera en el lenguaje visual de Trascendencia (escala slate sobre bg-slate-50, superficie bg-white border-slate-200 rounded-xl shadow-sm, un solo negro bg-slate-900, badges bg-{color}-100 text-{color}-700). El editor vive en /experiencias/[id]/editor con dos paneles: riel de índice de 264px a la izquierda y lienzo de bloques a la derecha; las propiedades no viven en un inspector fijo sino dentro del bloque abierto, porque el sistema nunca ha tenido una cuarta región vertical y sí tiene el patrón de acordeón de fila. Se agrega con el botón dashed de ChecklistClient.tsx:239, se reordena con botones arriba y abajo (no arrastrar: el repo no tiene ninguna dependencia de drag and drop), y se elimina con confirmación de dos pasos en línea al estilo de EventStatusButton.tsx:39-57, nunca con confirm() nativo. El editor de texto es un textarea con markdown restringido a diez capacidades y un renderer propio, sin WYSIWYG. PDF y video tienen cuatro y cinco estados con markup completo. El guardado combina autoguardado con botón explícito siempre clicable, chip de estado en la barra sticky, Cmd+S y aviso al salir. La publicación pasa por una ruta de revisión con bloqueos rojos y advertencias ámbar, y crea una versión numerada. La vista previa reutiliza el marco de teléfono que ya existe en preview/page.tsx:262-318 con dos lentes: como participante y como moderador. Se incluyen 22 estados vacíos y de error con copy exacto en español, y un módulo tokens.ts para que no se repita la deuda de los cinco mapas de badge duplicados del admin.

- **El chasis es barra lateral oscura de 240px (bg-slate-900) más dos filas sticky de 56px y 48px sobre el contenido, es decir 104px de cromo horizontal, exactamente el mismo total que una página de evento de Trascendencia.** · No invento una barra lateral: reactivo la que el repo ya tiene en portal/components/AdminNav.tsx:53 (aside w-[240px] min-h-screen bg-[#111111] flex flex-col flex-shrink-0 border-r border-[#1F2937]), traducida de la escala gray a slate. PersonaLab tiene siete destinos agrupados en Catálogo, Operación y Después (WorkspaceNav.tsx:10-31); meterlos en una barra superior de dos links como AdminTopNav.tsx:43-50 los aplastaría. Las dos filas sticky replican el patrón de EventSubNav.tsx:41 y dejan el estado de guardado y el botón Publicar siempre visibles mientras el autor hace scroll.
- **Dos paneles: riel de índice de 264px sticky a la izquierda y lienzo de bloques a la derecha con max-w-3xl. Las propiedades de cada bloque viven dentro del bloque abierto, en una franja de Ajustes, no en un inspector fijo a la derecha.** · Trascendencia no tiene ningún inspector persistente en ninguna pantalla. Su unidad de edición es la tarjeta con campos de EditarEventoForm.tsx:142-143 y su patrón de detalle en sitio es el acordeón de fila de ItinerarioList.tsx:107-153, que además calcula hasDetails y deshabilita el toggle cuando no hay nada que expandir. Un inspector sería una cuarta región vertical que el sistema nunca ha tenido y que duplicaría el mismo formulario en otro sitio.
- **La vista previa sustituye al riel del índice cuando se abre, en vez de aparecer como tercera columna.** · Una sola regla de layout, sin ramificar por breakpoint. Cuando el autor está escribiendo necesita el índice; cuando está revisando cómo se ve, necesita el teléfono. Nunca las dos cosas a la vez. El marco de teléfono ya existe y mide 375px de ancho (portal/app/(admin)/eventos/[id]/preview/page.tsx:264), así que el panel necesita 390px, casi lo mismo que el riel más el gap.
- **Reordenar se hace con botones de subir y bajar más un selector Mover a, no con arrastrar y soltar.** · Verificado con grep sobre app y components: no hay ni un draggable, ni un onDragStart, ni dnd-kit, ni react-beautiful-dnd en el repositorio, y portal/package.json solo declara next, react, supabase, resend y web-push. Arrastrar sería la única interacción del producto sin equivalente de teclado y exigiría una dependencia nueva. Los botones funcionan igual en el riel y en el lienzo, con teclado y en tablet.
- **El editor de texto es un textarea con markdown restringido a diez capacidades (párrafo, salto duro, negrita, itálica, H2, H3, lista con viñetas, lista numerada, cita, enlace) y un renderer propio de unas cuarenta líneas, sin dangerouslySetInnerHTML.** · El lector del participante hoy tiene exactamente un tratamiento de texto largo: text-sm leading-relaxed whitespace-pre-wrap sobre un string plano (preview/page.tsx:78, programa/page.tsx:252, info/page.tsx:152). Cada capacidad extra del editor crea un caso de render que el lector no sabe pintar. Diez capacidades es lo mínimo para escribir de verdad y el máximo que el sistema visual puede absorber sin inventar tipografía nueva.
- **El guardado combina autoguardado a los 1200 ms de inactividad con un botón Guardar siempre visible y siempre clicable, más un chip de estado de cuatro estados en la barra sticky.** · El usuario pidió literalmente poder guardar el progreso, así que tiene que existir un botón que se pueda apretar. Deshabilitarlo cuando no hay cambios produce ansiedad, así que guarda igual y responde Todo guardado. El chip resuelve el hallazgo de que Trascendencia tiene cinco patrones distintos de guardado y uno de ellos, EditarEventoForm, no da ninguna confirmación al usuario.
- **Toda acción destructiva usa confirmación de dos pasos en línea: el botón se transforma en frase de consecuencia más Confirmar más Cancelar, y después de borrar el mismo hueco ofrece Deshacer durante diez segundos.** · Es el patrón de EventStatusButton.tsx:39-57 combinado con el de CheckInButton.tsx:65-91, que es el mejor mecanismo de feedback del repositorio: el control se convierte en su estado final en vez de lanzar un mensaje aparte. Evita el confirm() nativo de ChecklistClient.tsx:118 y DeleteItemButton.tsx:17, que rompe el lenguaje visual con un diálogo del sistema operativo.
- **Cada bloque lleva una propiedad de audiencia con tres valores: participante, moderador o ambos, expuesta como segmented control en la franja de Ajustes.** · El dominio lo exige. El PDF que se descarga lo descarga el moderador, no el participante (petición textual del usuario), y el moderador es un profesional que opera la experiencia, no un participante. Sin esta propiedad, el autor no tiene forma de subir un guion de sala sin exponerlo. También es lo que hace posible la vista previa de dos lentes.
- **Publicar pasa por una ruta propia de revisión, /experiencias/[id]/publicar, con bloqueos en rojo que impiden publicar y advertencias en ámbar que se pueden saltar, y crea una versión numerada. Las corridas ya iniciadas se quedan en la versión con la que arrancaron.** · Una experiencia publicada llega a moderadores que ya compraron acceso para su foro. Publicar a ciegas un tiempo sin bisagras o un video que falló al subir es un daño hacia afuera. La ruta propia permite mostrar además qué recibe el participante, que es lo que el autor no puede ver desde el editor.
- **El editor normaliza cuatro deudas del admin y no las hereda: un solo negro (bg-slate-900 con hover:bg-slate-700), un solo tratamiento de foco (focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent), un solo texto de carga (Guardando… con puntos suspensivos U+2026) y una sola opacidad de deshabilitado (disabled:opacity-60 disabled:cursor-not-allowed). Todo vive en un módulo tokens.ts que se importa.** · El admin tiene dos negros primarios conviviendo (bg-slate-900 y bg-[#111827] en eventos/page.tsx:54), cuatro tratamientos de foco en cuatro archivos hermanos, cuatro textos de carga distintos, tres opacidades de deshabilitado y cinco mapas de badge duplicados. Un producto que va a ser sobre todo formularios no puede nacer con esa dispersión.
- **El cuerpo de lectura del lector de PersonaLab sube de text-sm leading-relaxed a text-[15px] leading-[1.75], y el sello de disponibilidad sube de text-white/20 a text-[#6B7280].** · Hoy el participante lee 14px dentro de un contenedor max-w-lg, es decir una medida de línea de unos 512px. Para un párrafo de aviso eso está bien; para una experiencia escrita de varios miles de caracteres es texto pequeño. El text-white/20 del sello (programa/page.tsx:256) es el candidato más claro a fallar contraste en todo el portal.
- **Dentro del editor no hay teal (#002B34) ni terracota (#B9735A). El acento del estado activo es border-l-2 border-slate-900 y el color solo aparece en badges.** · El usuario ya vio dos versiones del prototipo y pidió específicamente que se parezca más a Trascendencia. El prototipo actual está pintado en teal y terracota con estilos inline (dominio.ts:17-19, ui.tsx, WorkspaceNav.tsx), que es justamente lo que lo hace verse de otro producto. Trascendencia no tiene color de acento: tiene slate y un negro.
- **Los controles de cada fila de bloque están siempre visibles en text-slate-400 y se oscurecen en hover, en vez de aparecer con opacity-0 group-hover:opacity-100.** · El patrón de revelar en hover de ChecklistClient.tsx:69 es invisible con teclado y no existe en pantallas táctiles. En una pantalla cuyo trabajo entero es manipular bloques, esconder los verbos es el error más caro.

# La pantalla de autoría de PersonaLab

Especificación de implementación. Lenguaje visual: el de Trascendencia, extraído del código real. Léxico: experiencia, tiempo (víspera, ignición, retorno), bisagra, bloque, participante, moderador, autor, capítulo, foro, grant.

Nota de escritura: en todo el copy visible de esta especificación no aparece el guion largo. Punto, coma o dos puntos.

---

## 0. Principio rector

Trascendencia es un panel operativo sobrio y denso: superficies blancas `rounded-xl` con `shadow-sm` sobre `bg-slate-50`, tipografía de dos tamaños (`text-xs` y `text-sm` cubren el 90 por ciento del admin), un solo negro para lo primario y color únicamente en badges. La autoría de PersonaLab se construye dentro de ese vocabulario, sin agregar ni una familia tipográfica, ni un radio, ni un acento.

Tres cosas se corrigen en vez de imitarse, y esas correcciones son parte de la especificación:

1. La página de detalle de evento no tiene título (`eventos/[id]/page.tsx:127` arranca con metadatos en `text-slate-400`). Aquí el nombre de la experiencia sí es un `h1`.
2. El admin tiene cuatro disciplinas de contenedor. Aquí hay una: `max-w-7xl mx-auto`.
3. El admin tiene cinco mapas de badge duplicados. Aquí hay un módulo `tokens.ts` que se importa.

---

## 1. Rutas y archivos

```
portal/app/prototipo/personalab/
  tokens.ts                                  ← clases compartidas, único lugar
  lector/                                    ← componentes del lado participante
    TarjetaLectura.tsx
    RenderMarkdown.tsx
    markdown.ts
  experiencias/[id]/
    ExperienciaHeader.tsx                    ← fila sticky 1, 56px
    ExperienciaSubNav.tsx                    ← fila sticky 2, 48px
    page.tsx                                 ← Ficha (existe, se repinta)
    editor/
      page.tsx
      EditorClient.tsx                       ← estado, autoguardado, atajos
      RielIndice.tsx
      TarjetaBisagra.tsx
      SelectorTipoBloque.tsx
      BloqueTexto.tsx
      BloqueArchivo.tsx                      ← PDF e imagen
      BloqueVideo.tsx
      BloqueAviso.tsx
      BloqueEscritura.tsx
      AjustesBloque.tsx
      EstadoGuardado.tsx
      PanelVistaPrevia.tsx
      ConfirmacionEnLinea.tsx
    vista-previa/page.tsx                    ← versión a pantalla completa
    publicar/page.tsx
    historial/page.tsx
```

`portal/app/globals.css` recibe una adición, porque `scrollbar-none` se usa en el admin pero no existe:

```css
.scrollbar-none { scrollbar-width: none; -ms-overflow-style: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }
```

---

## 2. tokens.ts

```ts
// portal/app/prototipo/personalab/tokens.ts
// Un solo lugar. Trascendencia tiene cinco mapas de badge duplicados
// (EventSubNav.tsx:12, eventos/[id]/page.tsx:6, 28, 45 y 115). Aquí no se repite.

export const SUPERFICIE       = 'bg-white border border-slate-200 rounded-xl shadow-sm'
export const SUPERFICIE_PLANA = 'bg-white border border-slate-200 rounded-xl'
export const CABECERA_TARJETA = 'flex items-center justify-between px-4 py-3 border-b border-slate-100'

export const BTN_PRIMARIO   = 'px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
export const BTN_SECUNDARIO = 'px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors whitespace-nowrap disabled:opacity-60'
export const BTN_FILA       = 'text-xs text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium whitespace-nowrap disabled:opacity-60'
export const BTN_PELIGRO    = 'text-xs text-red-700 border border-red-300 bg-white px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors font-medium whitespace-nowrap disabled:opacity-60'
export const BTN_DASHED     = 'flex items-center justify-center gap-2 w-full text-sm text-slate-500 hover:text-slate-700 border border-dashed border-slate-300 hover:border-slate-400 px-4 py-2.5 rounded-xl transition-colors'
export const BTN_ICONO      = 'w-7 h-7 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400'

export const CAMPO          = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent'
export const CAMPO_FANTASMA = 'w-full bg-transparent border border-transparent rounded-lg px-2 py-1 hover:border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent placeholder-slate-300'
export const ETIQUETA_CAMPO   = 'block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider'
export const ETIQUETA_SECCION = 'text-xs font-semibold text-slate-500 uppercase tracking-wider'

export const BADGE_ESTADO = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold'
export const BADGE_TIPO   = 'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold'

export const ESTADO_EXPERIENCIA = {
  borrador:  { etiqueta: 'Borrador',              cls: 'bg-slate-100 text-slate-600' },
  cambios:   { etiqueta: 'Cambios sin publicar',  cls: 'bg-amber-100 text-amber-700' },
  publicada: { etiqueta: 'Publicada',             cls: 'bg-emerald-100 text-emerald-700' },
  retirada:  { etiqueta: 'Retirada',              cls: 'bg-red-100 text-red-700' },
} as const

export const TIPO_BLOQUE = {
  texto:     { etiqueta: 'Texto',      cls: 'bg-slate-100 text-slate-600' },
  cita:      { etiqueta: 'Cita',       cls: 'bg-violet-100 text-violet-700' },
  imagen:    { etiqueta: 'Imagen',     cls: 'bg-sky-100 text-sky-700' },
  documento: { etiqueta: 'Documento',  cls: 'bg-amber-100 text-amber-700' },
  video:     { etiqueta: 'Video',      cls: 'bg-blue-100 text-blue-700' },
  aviso:     { etiqueta: 'Aviso',      cls: 'bg-red-100 text-red-700' },
  escritura: { etiqueta: 'Escritura',  cls: 'bg-emerald-100 text-emerald-700' },
} as const

export const TEXTO_GUARDANDO = 'Guardando…'   // U+2026, un solo carácter, siempre este
```

Regla de forma heredada del admin y que se respeta: `rounded-full` cuando el badge dice un estado, `rounded-md` cuando dice una taxonomía. La forma comunica si el dato es progreso o categoría.

Nota sobre el rojo: el admin escribe `text-red-500` para Cancelado (`EventSubNav.tsx:17`) mientras todos los demás badges usan el tono 700. Aquí se usa `text-red-700` siempre.

---

## 3. El chasis

### 3.1 Barra lateral del workspace, 240px

Se reactiva `portal/components/AdminNav.tsx:53`, que hoy es código muerto (ningún archivo lo importa), traducido de la escala gray a slate.

```tsx
<aside className="w-[240px] min-h-screen bg-slate-900 flex flex-col flex-shrink-0 border-r border-slate-800 fixed left-0 top-0 z-50">
  {/* Capa 4 Meaning */}
  <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-2">
    <Link href="/prototipo/organizador?u=d" className="block shrink-0">
      <Image src="/4m-logo-wht.png" alt="4 Meaning" width={110} height={16}
             className="h-3.5 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
    </Link>
    <Link href="/dashboard"
          className="text-[10px] tracking-widest uppercase text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap">
      Trascendencia →
    </Link>
  </div>

  {/* Marca del workspace */}
  <div className="px-5 py-5 border-b border-slate-800">
    <div className="text-sm font-semibold tracking-tight text-white">PersonaLab</div>
    <div className="text-xs text-slate-500 mt-1">Diseño de experiencias</div>
  </div>

  {/* Navegación agrupada */}
  <nav className="flex-1 py-3 overflow-y-auto">
    {GRUPOS.map(g => (
      <div key={g.titulo ?? 'raiz'} className="mb-3">
        {g.titulo && (
          <div className="px-5 pt-2.5 pb-1.5 text-[9px] font-semibold text-slate-600 uppercase tracking-widest">
            {g.titulo}
          </div>
        )}
        {g.items.map(it => (
          <Link key={it.href} href={it.href}
                className={[
                  'flex items-center gap-3 px-5 py-2.5 text-sm transition-colors border-l-2',
                  activo(it)
                    ? 'text-white bg-white/5 border-white font-medium'
                    : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5',
                ].join(' ')}>
            {it.label}
          </Link>
        ))}
      </div>
    ))}
  </nav>

  <div className="px-5 py-3.5 border-t border-slate-800">
    <div className="text-xs text-slate-400">Lucía Ferrer</div>
    <div className="text-[10px] text-slate-500 mt-0.5">Autora</div>
  </div>
</aside>
```

Grupos: sin título (Resumen), Catálogo (Experiencias, Kit y fronteras), Operación (Corridas, Capítulos, Moderadores), Después (Retorno). Es la agrupación que ya existe en `WorkspaceNav.tsx:10-31` y que el admin muerto también tenía en `AdminNav.tsx:108-181`.

### 3.2 Fila sticky 1: encabezado de experiencia, 56px

Aquí vive lo que el detalle de evento de Trascendencia no tiene: un título de verdad. Y aquí viven, siempre visibles, el estado de guardado y el botón de publicar.

```tsx
<header className="sticky top-0 z-40 h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-3">
  <Link href="/prototipo/personalab/experiencias"
        className="text-xs text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap flex-shrink-0">
    ← Experiencias
  </Link>
  <span className="text-slate-200">|</span>

  <h1 className="text-sm font-semibold text-slate-900 truncate max-w-[280px] flex-shrink-0">
    {experiencia.nombre || 'Experiencia sin nombre'}
  </h1>
  <span className={`${BADGE_ESTADO} flex-shrink-0 ${ESTADO_EXPERIENCIA[estado].cls}`}>
    {ESTADO_EXPERIENCIA[estado].etiqueta}
  </span>

  <div className="flex-1" />

  <div className="flex items-center gap-3 flex-shrink-0">
    <EstadoGuardado estado={guardado} ultimoGuardadoAt={ultimoGuardadoAt} onGuardar={guardarAhora} />
    <span className="w-px h-5 bg-slate-100" />
    <button onClick={() => setVistaPrevia(v => !v)}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              vistaPrevia
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}>
      Vista previa
    </button>
    <Link href={`/prototipo/personalab/experiencias/${id}/publicar`}
          title="Revisar y publicar. Los moderadores con acceso verán la versión nueva."
          className="text-xs font-medium px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-700 transition-colors whitespace-nowrap">
      Publicar
    </Link>
  </div>
</header>
```

El botón Publicar recibe el tratamiento de botón sólido dentro de una barra de navegación. Es el mismo gesto que Trascendencia le da a Operación en `EventSubNav.tsx:81`: el único item con jerarquía visual propia porque es el modo que importa.

Cada control lleva atributo `title` con una explicación en español. Es la única ayuda contextual del portal (`eventos/[id]/page.tsx:229, 235, 242-247`) y merece conservarse como convención.

### 3.3 Fila sticky 2: secciones de la experiencia, 48px

```tsx
<div className="sticky top-14 z-30 h-12 bg-white border-b border-slate-200 flex items-center px-6">
  <div className="relative flex-1 overflow-hidden">
    <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent z-10" />
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pr-8">
      {[
        { href: ``,             label: 'Ficha' },
        { href: `/editor`,      label: 'Editor' },
        { href: `/kit`,         label: 'Kit' },
        { href: `/accesos`,     label: 'Accesos' },
        { href: `/historial`,   label: 'Historial' },
      ].map(({ href, label }) => (
        <Link key={label} href={`/prototipo/personalab/experiencias/${id}${href}`}
              className={`text-xs px-3 py-1.5 rounded-md whitespace-nowrap flex-shrink-0 transition-colors ${
                activo
                  ? 'text-slate-900 font-semibold bg-slate-100 border-b-2 border-slate-900 -mb-px rounded-b-none'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}>
          {label}
        </Link>
      ))}
    </div>
  </div>
</div>
```

Corrección deliberada: en el admin el hover del link inactivo llega al mismo `bg-slate-100` que marca el activo, así que con el cursor encima los dos estados se ven casi iguales (`AdminTopNav.tsx:30-31`, `EventSubNav.tsx:85-86`). Aquí el hover baja a `bg-slate-50` y el activo suma subrayado de 2px.

Cromo total: 56 más 48 igual a 104px, exactamente lo mismo que una página de evento en Trascendencia.

---

## 4. Layout del editor

### 4.1 La decisión

Opciones evaluadas:

| Opción | Veredicto |
|---|---|
| Tres paneles: lista, lienzo, inspector | Descartada. A 1440px con la lateral de 240px el lienzo cae a 434px. Y el inspector es una cuarta región vertical que Trascendencia nunca ha tenido. |
| Una columna con edición en sitio | Descartada. Una experiencia tiene tres tiempos y hasta diez bisagras (ver `dominio.ts:143-154`). Sin índice el autor se pierde en el scroll. |
| Página de lista más página de edición por bloque | Descartada. Es lo que hace hoy el admin con Itinerario y obliga a navegar para cada campo. Rompe el flujo de escritura. |
| **Dos paneles: riel de índice más lienzo, propiedades dentro del bloque** | **Elegida.** |

Justificación: el patrón nativo de Trascendencia para ver el detalle de una fila sin salir de la lista es el acordeón de `ItinerarioList.tsx:107-153`, y su unidad de captura es la tarjeta con campos de `EditarEventoForm.tsx:142-143`. Un bloque abierto es exactamente eso: un acordeón que despliega una tarjeta con campos. No hace falta inventar un inspector.

Reparto de propiedades:

- **De la experiencia** (nombre, subtítulo, narrativa, duración, `abreEspacioAlForo`, nota de diseño): viven en Ficha, ruta aparte, igual que `eventos/[id]/editar`.
- **De la bisagra** (título, tiempo, orden, soporte, duración, requiere): cabecera de la tarjeta más su franja de Ajustes.
- **Del bloque** (audiencia, descargable, nota para el moderador): franja de Ajustes del bloque.

### 4.2 El grid

```tsx
<main className="pl-[240px] bg-slate-50 min-h-screen">
  <ExperienciaHeader ... />
  <ExperienciaSubNav ... />

  <div className="px-8 pt-6 pb-24 max-w-7xl mx-auto">
    <div className={`grid gap-6 items-start ${
      vistaPrevia
        ? 'grid-cols-1 lg:grid-cols-[minmax(0,1fr)_390px]'
        : 'grid-cols-1 lg:grid-cols-[264px_minmax(0,1fr)]'
    }`}>
      {!vistaPrevia && (
        <aside className="hidden lg:block sticky top-[120px]">
          <RielIndice ... />
        </aside>
      )}

      <div className="min-w-0 max-w-3xl space-y-6">
        {/* lienzo */}
      </div>

      {vistaPrevia && (
        <aside className="hidden lg:block sticky top-[120px]">
          <PanelVistaPrevia ... />
        </aside>
      )}
    </div>
  </div>
</main>
```

`top-[120px]` es 104 de cromo más 16 de aire. Debajo de `lg` el riel se convierte en un botón Índice que abre una hoja inferior, y la vista previa manda a la ruta `/vista-previa`.

Un solo contenedor, `max-w-7xl mx-auto`. El admin tiene cuatro disciplinas distintas conviviendo, y `max-w-7xl` sin `mx-auto` en `eventos/[id]/page.tsx:127` deja el contenido pegado a la izquierda en pantallas grandes. Aquí se centra.

---

## 5. El riel del índice

```tsx
<div className={SUPERFICIE + ' overflow-hidden'}>
  <div className={CABECERA_TARJETA}>
    <h2 className={ETIQUETA_SECCION}>Índice</h2>
    <span className="text-xs text-slate-400 tabular-nums">{listas} / {total}</span>
  </div>

  {(['vispera', 'ignicion', 'retorno'] as const).map(t => {
    const bs = bisagrasDe(t)
    return (
      <div key={t}>
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            {ETIQUETA_TIEMPO[t]}
          </span>
          <span className="text-[10px] text-slate-400 tabular-nums">{bs.length}</span>
        </div>

        {bs.length === 0 ? (
          <div className="px-4 py-4 text-center text-xs text-slate-400 border-b border-slate-100">
            Este tiempo no está diseñado.
          </div>
        ) : bs.map(b => (
          <button key={b.id} onClick={() => irA(b.id)}
                  className={[
                    'w-full text-left flex items-start gap-2 px-4 py-2.5 border-b border-slate-100 border-l-2 transition-colors',
                    b.id === activaId
                      ? 'bg-slate-100 border-l-slate-900'
                      : 'border-l-transparent hover:bg-slate-50',
                  ].join(' ')}>
            <span className="text-[10px] text-slate-400 tabular-nums mt-1 w-4 flex-shrink-0">
              {String(b.orden).padStart(2, '0')}
            </span>
            <span className="flex-1 min-w-0">
              <span className={`block text-sm truncate ${
                b.id === activaId ? 'text-slate-900 font-semibold' : 'text-slate-700'
              }`}>
                {b.titulo || 'Bisagra sin título'}
              </span>
              <span className="block text-[11px] text-slate-400 mt-0.5">
                {b.bloques.length === 0
                  ? 'Sin bloques'
                  : `${b.bloques.length} bloque${b.bloques.length === 1 ? '' : 's'}`}
              </span>
            </span>
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              b.listo ? 'bg-emerald-500' : 'bg-amber-400'
            }`}
            title={b.listo ? 'Lista' : 'Falta trabajo'} />
          </button>
        ))}

        <div className="px-3 py-2 border-b border-slate-100">
          <button onClick={() => agregarBisagra(t)}
                  className="w-full text-xs text-slate-500 hover:text-slate-700 border border-dashed border-slate-300 hover:border-slate-400 rounded-lg py-1.5 transition-colors">
            + Bisagra en {ETIQUETA_TIEMPO[t].toLowerCase()}
          </button>
        </div>
      </div>
    )
  })}
</div>
```

El punto de color a la derecha es el único indicador de avance de autoría del riel, y es del autor, no del participante. No hay porcentaje, no hay barra, no hay racha.

---

## 6. El lienzo

### 6.1 Cabecera del tiempo

Entre grupos de bisagras, sobre `bg-slate-50` directamente, sin tarjeta:

```tsx
<div className="flex items-baseline justify-between gap-4 pt-2">
  <div>
    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
      {ETIQUETA_TIEMPO[t]}
    </h2>
    <p className="text-xs text-slate-400 mt-1 max-w-[52ch] leading-relaxed">
      {PAPEL_SOFTWARE[t]}
    </p>
  </div>
  <span className="text-xs text-slate-400 tabular-nums flex-shrink-0">
    {listas} de {total} listas
  </span>
</div>
```

`PAPEL_SOFTWARE` ya existe en `dominio.ts:27-31` y dice cosas como que en la ignición el software es mudo. Ese texto es la mejor guía de autoría que tiene el producto y tiene que estar en la pantalla donde se autora.

### 6.2 Tarjeta de bisagra

```tsx
<section id={`bisagra-${b.id}`}
         className={SUPERFICIE + ' overflow-hidden scroll-mt-[128px]'}>

  {/* Cabecera */}
  <div className="flex items-start justify-between gap-3 px-5 py-3 border-b border-slate-100">
    <div className="flex items-start gap-3 min-w-0 flex-1">
      <span className="text-xs text-slate-400 tabular-nums mt-2 w-5 flex-shrink-0 text-right">
        {String(b.orden).padStart(2, '0')}
      </span>
      <div className="min-w-0 flex-1">
        <label htmlFor={`titulo-${b.id}`} className="sr-only">Título de la bisagra</label>
        <input id={`titulo-${b.id}`} value={b.titulo}
               onChange={e => setTitulo(b.id, e.target.value)}
               placeholder="Título de la bisagra"
               className={CAMPO_FANTASMA + ' -ml-2 text-sm font-semibold text-slate-900'} />
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={BADGE_TIPO + ' ' + SOPORTE[b.soporte].cls}>{SOPORTE[b.soporte].etiqueta}</span>
          {b.duracion && <span className="text-xs text-slate-400">{b.duracion}</span>}
          <span className="text-xs text-slate-300">·</span>
          <span className="text-xs text-slate-400">
            {b.bloques.length === 0 ? 'Sin bloques' : `${b.bloques.length} bloques`}
          </span>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
      <button className={BTN_ICONO} disabled={esPrimera} title="Subir esta bisagra" aria-label="Subir esta bisagra">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <button className={BTN_ICONO} disabled={esUltima} title="Bajar esta bisagra" aria-label="Bajar esta bisagra">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <button onClick={() => setAjustes(!ajustes)}
              className={BTN_ICONO + (ajustes ? ' bg-slate-100 text-slate-900' : '')}
              title="Ajustes de la bisagra" aria-label="Ajustes de la bisagra" aria-expanded={ajustes}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="3" />
          <path strokeLinecap="round" d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10l1.4 1.4m0-12.8l-1.4 1.4m-10 10l-1.4 1.4" />
        </svg>
      </button>
      <ConfirmacionEnLinea
        etiqueta="Eliminar bisagra"
        pregunta={`Se elimina "${b.titulo || 'esta bisagra'}" con sus ${b.bloques.length} bloques.`}
        onConfirmar={() => eliminarBisagra(b.id)} />
    </div>
  </div>

  {/* Ajustes de la bisagra, plegable */}
  {ajustes && (
    <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 grid grid-cols-2 gap-4">
      <div>
        <label htmlFor={`soporte-${b.id}`} className={ETIQUETA_CAMPO}>Soporte</label>
        <select id={`soporte-${b.id}`} className={CAMPO}>
          <option value="sala">Sala. Ocurre entre personas, el software no entra.</option>
          <option value="objeto">Objeto. Pieza física, el software la administra.</option>
          <option value="pantalla">Pantalla. Vive dentro del portal.</option>
        </select>
      </div>
      <div>
        <label htmlFor={`duracion-${b.id}`} className={ETIQUETA_CAMPO}>Duración</label>
        <input id={`duracion-${b.id}`} placeholder="90 min" className={CAMPO} />
      </div>
      <div className="col-span-2">
        <label htmlFor={`requiere-${b.id}`} className={ETIQUETA_CAMPO}>
          Qué necesita el moderador en la mano
        </label>
        <input id={`requiere-${b.id}`} placeholder="Velas, libreta de cada participante" className={CAMPO} />
        <p className="text-[11px] text-slate-400 mt-1">Separa con comas. Aparece en el guion de sala.</p>
      </div>
    </div>
  )}

  {/* Bloques */}
  <div className="divide-y divide-slate-100">
    {b.bloques.map(bl => <FilaBloque key={bl.id} bloque={bl} />)}
  </div>

  {/* Pie: agregar bloque */}
  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
    <SelectorTipoBloque onElegir={t => agregarBloque(b.id, t)} />
  </div>
</section>
```

Sobre el campo fantasma: es el único control nuevo del sistema. Regla dura, para que nunca parezca texto muerto: `hover:border-slate-200` visible, anillo de foco estándar, `placeholder` que nombra el campo, y `label` con `sr-only`. Ningún input de este editor va sin `id` y sin `label` asociado, cosa que el admin no hace en ningún archivo.

### 6.3 Fila de bloque, colapsada

```tsx
<div className="group flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
  <span className={BADGE_TIPO + ' mt-0.5 flex-shrink-0 ' + TIPO_BLOQUE[bl.tipo].cls}>
    {TIPO_BLOQUE[bl.tipo].etiqueta}
  </span>

  <button onClick={() => abrir(bl.id)} className="flex-1 min-w-0 text-left" aria-expanded={false}>
    <span className="block text-sm text-slate-900 truncate">
      {resumen(bl) || <span className="text-slate-300">Bloque vacío</span>}
    </span>
    <span className="block text-xs text-slate-400 truncate mt-0.5">{detalle(bl)}</span>
  </button>

  {bl.audiencia !== 'participante' && (
    <span className={BADGE_TIPO + ' mt-0.5 flex-shrink-0 bg-slate-100 text-slate-500'}
          title="Este bloque no lo ve el participante">
      Solo moderador
    </span>
  )}

  <div className="flex items-center gap-0.5 flex-shrink-0">
    <button className={BTN_ICONO} title="Subir este bloque" aria-label="Subir este bloque">…</button>
    <button className={BTN_ICONO} title="Bajar este bloque" aria-label="Bajar este bloque">…</button>
    <ConfirmacionEnLinea compacto etiqueta="Eliminar bloque"
      pregunta="Se elimina este bloque." onConfirmar={() => eliminarBloque(bl.id)} />
  </div>
</div>
```

Los verbos están siempre visibles en `slate-400`, no escondidos tras `opacity-0 group-hover:opacity-100` como en `ChecklistClient.tsx:69`. Ese patrón es invisible con teclado y no existe en pantalla táctil.

### 6.4 Fila de bloque, abierta

Al abrir, la fila conserva su cabecera y despliega debajo el editor propio del tipo más la franja de Ajustes:

```tsx
<div className="border-l-2 border-slate-900 bg-white">
  {/* cabecera igual que la colapsada, con aria-expanded={true} */}
  <div className="px-5 pb-5">
    {/* editor del tipo, ver secciones 8, 9 y 10 */}
  </div>
  <AjustesBloque bloque={bl} />
</div>
```

### 6.5 Ajustes de bloque

```tsx
<div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-4 flex-wrap">
  <div className="flex items-center gap-2">
    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Quién lo ve</span>
    <div className="flex items-center bg-slate-100 rounded-lg p-1">
      {(['participante', 'moderador', 'ambos'] as const).map(a => (
        <button key={a} onClick={() => setAudiencia(bl.id, a)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  bl.audiencia === a
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}>
          {AUDIENCIA_ETIQUETA[a]}
        </button>
      ))}
    </div>
  </div>

  <button onClick={() => setNota(!nota)}
          className="text-xs text-slate-500 hover:text-slate-700 transition-colors">
    {bl.notaModerador ? 'Editar nota para el moderador' : '+ Nota para el moderador'}
  </button>
</div>

{nota && (
  <div className="px-5 pb-4 bg-slate-50">
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
      <label htmlFor={`nota-${bl.id}`}
             className="block font-semibold text-xs uppercase tracking-wide text-amber-600 mb-1.5">
        Nota para el moderador
      </label>
      <textarea id={`nota-${bl.id}`} rows={2}
                placeholder="El participante nunca ve esto. Sirve para el guion de sala."
                className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-y" />
    </div>
  </div>
)}
```

El callout ámbar es el mismo de `ItinerarioClient.tsx:411-416`, que es el patrón con el que Trascendencia ya distingue lo que solo ve el staff.

---

## 7. Agregar, reordenar, eliminar

### 7.1 Agregar

Gesto: botón dashed a ancho completo al pie de la bisagra. Es el patrón de `ChecklistClient.tsx:239`, la mejor affordance de creación del admin. Al pulsarlo se expande en sitio una rejilla de tipos, sin capa flotante, sin modal.

```tsx
// cerrado
<button onClick={() => setAbierto(true)} className={BTN_DASHED}>
  + Agregar bloque
</button>

// abierto
<div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
  <div className="flex items-center justify-between mb-3">
    <h4 className={ETIQUETA_SECCION}>Qué quieres agregar</h4>
    <button onClick={() => setAbierto(false)}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
      Cancelar
    </button>
  </div>
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
    {TIPOS.map(t => (
      <button key={t.id} onClick={() => elegir(t.id)}
              className="flex flex-col items-start gap-1.5 px-3 py-2.5 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors text-left">
        <span className={BADGE_TIPO + ' ' + TIPO_BLOQUE[t.id].cls}>{TIPO_BLOQUE[t.id].etiqueta}</span>
        <span className="text-[11px] text-slate-400 leading-snug">{t.pista}</span>
      </button>
    ))}
  </div>
</div>
```

Pistas exactas de cada tipo:

| Tipo | Pista |
|---|---|
| Texto | Para escribir. Es el bloque que más vas a usar. |
| Cita | Una frase sola, con peso. |
| Imagen | Una foto o una lámina, con pie. |
| Documento | Un PDF. Elige quién puede descargarlo. |
| Video | Un archivo o un enlace no listado. |
| Aviso | Algo que hay que leer sí o sí. |
| Escritura | El participante escribe para sí mismo. Nadie lo califica. |

El tipo Escritura solo aparece si `experiencia.abreEspacioAlForo` es verdadero. Si es falso, en su lugar va una celda apagada:

```tsx
<div className="flex flex-col items-start gap-1.5 px-3 py-2.5 border border-dashed border-slate-200 rounded-lg opacity-60">
  <span className={BADGE_TIPO + ' bg-slate-100 text-slate-400'}>Escritura</span>
  <span className="text-[11px] text-slate-400 leading-snug">
    Esta experiencia no abre espacio al foro. Cámbialo en la Ficha.
  </span>
</div>
```

Al elegir un tipo, el bloque se inserta **al final de esa bisagra**, ya abierto, con el foco en su primer campo. Nunca se abre un formulario en otra página.

También hay un punto de inserción entre bloques: al pasar el cursor por el divisor aparece una línea con un botón central de 20px:

```tsx
<div className="relative h-0">
  <div className="absolute inset-x-5 -top-3 h-6 flex items-center opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
    <span className="flex-1 h-px bg-slate-200" />
    <button className="mx-2 w-5 h-5 rounded-full bg-white border border-slate-300 text-slate-400 hover:border-slate-900 hover:text-slate-900 text-xs leading-none transition-colors"
            title="Insertar bloque aquí" aria-label="Insertar bloque aquí">+</button>
    <span className="flex-1 h-px bg-slate-200" />
  </div>
</div>
```

Este sí puede esconderse en hover porque es una comodidad, no la única vía: el botón dashed del pie siempre está.

### 7.2 Reordenar

Gesto principal: botones de subir y bajar, en la fila del bloque y en la cabecera de la bisagra. Deshabilitados en los extremos con `disabled:opacity-40`, nunca ocultos, para que la posición se lea del propio control.

Gesto secundario: mover entre bisagras o entre tiempos, dentro de Ajustes:

```tsx
<div>
  <label htmlFor={`mover-${bl.id}`} className={ETIQUETA_CAMPO}>Mover a</label>
  <select id={`mover-${bl.id}`} className={CAMPO} defaultValue="">
    <option value="" disabled>Elige otra bisagra</option>
    {bisagras.map(b => (
      <option key={b.id} value={b.id}>
        {ETIQUETA_TIEMPO[b.tiempo]} · {String(b.orden).padStart(2,'0')} {b.titulo}
      </option>
    ))}
  </select>
</div>
```

Al mover, el lienzo hace scroll a la nueva posición y la fila entra con `bg-slate-50` durante 900 ms para que la vista no se pierda.

Arrastrar y soltar: no se construye ahora. El repositorio no tiene ninguna dependencia ni ningún `draggable`. Si algún día se agrega, va encima de los botones, nunca en su lugar.

### 7.3 Eliminar

Componente `ConfirmacionEnLinea`, con la mecánica de `EventStatusButton.tsx:39-57` y el remate de `CheckInButton.tsx:65-91`.

```tsx
// Estado 1, reposo
<button onClick={() => setPaso('confirmar')} className={BTN_ICONO + ' hover:text-red-600 hover:bg-red-50'}
        title={etiqueta} aria-label={etiqueta}>
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
  </svg>
</button>

// Estado 2, confirmando
<div className="flex items-center gap-2">
  <span className="text-xs text-slate-500">{pregunta}</span>
  <button onClick={confirmar} disabled={cargando}
          className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors">
    {cargando ? '…' : 'Eliminar'}
  </button>
  <button onClick={() => setPaso('reposo')}
          className="px-3 py-1 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
    Cancelar
  </button>
</div>

// Estado 3, deshacer, 10 segundos
<div className="flex items-center gap-2">
  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
    Eliminado
  </span>
  <button onClick={deshacer}
          className="text-xs font-medium text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors">
    Deshacer
  </button>
</div>
```

Nunca `confirm()` del navegador. Nunca un modal.

Regla de escalado de la confirmación:

| Qué se elimina | Pregunta exacta |
|---|---|
| Bloque vacío | Se elimina y no hay nada que perder. (se borra directo, sin paso 2) |
| Bloque con texto | Se elimina este bloque con lo que escribiste. |
| Bloque con archivo | Se elimina este bloque y su archivo deja de estar disponible. |
| Bisagra | Se elimina "{título}" con sus {n} bloques. |
| Bisagra ya publicada | Se elimina "{título}". Está publicada, así que los moderadores dejarán de verla en cuanto publiques de nuevo. |

---

## 8. El editor de texto

### 8.1 Qué necesita para escribir de verdad

Diez capacidades, ni una más:

1. Párrafo
2. Salto de línea duro dentro del párrafo
3. Negrita
4. Itálica
5. Título de sección (H2)
6. Subtítulo (H3)
7. Lista con viñetas
8. Lista numerada
9. Cita destacada
10. Enlace

Formato: markdown restringido, guardado como texto plano. El renderer es propio, de unas cuarenta líneas, y devuelve nodos de React. Nunca `dangerouslySetInnerHTML`. Cualquier sintaxis fuera de la gramática se muestra literal, no se interpreta.

### 8.2 Qué se descarta y por qué

| Descartado | Razón |
|---|---|
| Color de texto, tamaño, familia | El lector del participante tiene una sola escala. Un autor con selector de color rompe la marca en la primera semana. |
| Alineación y sangría | El lector es una columna de 512px en teléfono. No hay nada que alinear. |
| Subrayado | Se confunde con enlace. |
| Tachado y resaltado | No existe ningún tratamiento equivalente en el lado participante. |
| Tablas y columnas | No caben en teléfono y el lector no tiene patrón para ellas. |
| HTML crudo y embeds arbitrarios | Superficie de seguridad y de rotura visual sin techo. |
| Emojis como iconografía | El portal usa SVG de trazo 1.5 dibujado a mano. Los emojis de `programa/page.tsx:205` y `avisos/page.tsx:55` rompen el registro y no se replican. |
| Imagen en línea dentro del texto | La imagen es un bloque propio, con su pie y su medida. |
| Notas al pie, índices, anclas | Complejidad sin demanda. |

### 8.3 Markup

```tsx
<div className="px-5 pb-5">
  <div className="flex items-center gap-1 border border-slate-200 border-b-0 rounded-t-lg bg-slate-50 px-2 py-1.5">
    <button type="button" onClick={() => envolver('**')} title="Negrita (Cmd+B)" aria-label="Negrita"
            className={BTN_ICONO + ' text-sm font-bold'}>B</button>
    <button type="button" onClick={() => envolver('*')} title="Itálica (Cmd+I)" aria-label="Itálica"
            className={BTN_ICONO + ' text-sm italic'}>I</button>

    <span className="w-px h-4 bg-slate-200 mx-1" />

    <button type="button" onClick={() => prefijo('## ')} title="Título de sección" aria-label="Título de sección"
            className={BTN_ICONO + ' text-[11px] font-semibold'}>H2</button>
    <button type="button" onClick={() => prefijo('### ')} title="Subtítulo" aria-label="Subtítulo"
            className={BTN_ICONO + ' text-[11px] font-semibold'}>H3</button>

    <span className="w-px h-4 bg-slate-200 mx-1" />

    <button type="button" onClick={() => prefijo('- ')} title="Lista con viñetas" aria-label="Lista con viñetas"
            className={BTN_ICONO}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="5" cy="7" r="1" fill="currentColor" /><circle cx="5" cy="12" r="1" fill="currentColor" />
        <circle cx="5" cy="17" r="1" fill="currentColor" />
        <path strokeLinecap="round" d="M9 7h11M9 12h11M9 17h11" />
      </svg>
    </button>
    <button type="button" onClick={() => prefijo('1. ')} title="Lista numerada" aria-label="Lista numerada"
            className={BTN_ICONO}>…</button>
    <button type="button" onClick={() => prefijo('> ')} title="Cita" aria-label="Cita"
            className={BTN_ICONO}>…</button>
    <button type="button" onClick={insertarEnlace} title="Enlace (Cmd+K)" aria-label="Enlace"
            className={BTN_ICONO}>…</button>

    <div className="flex-1" />

    <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
      <button type="button" onClick={() => setModo('escribir')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                modo === 'escribir' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>Escribir</button>
      <button type="button" onClick={() => setModo('leer')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                modo === 'leer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>Leer</button>
    </div>
  </div>

  {modo === 'escribir' ? (
    <>
      <label htmlFor={`texto-${bl.id}`} className="sr-only">Texto del bloque</label>
      <textarea id={`texto-${bl.id}`} rows={10} value={bl.texto}
                onChange={e => setTexto(bl.id, e.target.value)}
                placeholder="Escribe aquí lo que va a leer el participante."
                className="w-full px-4 py-3 border border-slate-200 rounded-b-lg text-sm leading-relaxed text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-y" />
    </>
  ) : (
    <div className="border border-slate-200 rounded-b-lg bg-white px-4 py-3 min-h-[240px]">
      <RenderMarkdown texto={bl.texto} tono="claro" />
    </div>
  )}

  <div className="flex items-center justify-between mt-1.5">
    <span className="text-[11px] text-slate-400">
      Markdown simple: **negrita**, *itálica*, ## título, - lista, &gt; cita
    </span>
    <span className="text-[11px] text-slate-400 tabular-nums">
      {palabras} palabras · {minutos} min de lectura
    </span>
  </div>
</div>
```

`resize-y`, que sí existe en Tailwind. El admin escribe `resize-vertical` en `NuevoItemForm.tsx:163 y 192`, que no es una utilidad válida y no hace nada.

Atajos dentro del textarea: Cmd/Ctrl+B negrita, Cmd/Ctrl+I itálica, Cmd/Ctrl+K enlace, Cmd/Ctrl+S guardar. Enter dentro de una lista continúa la lista. Enter en una lista vacía la cierra.

El modo Leer del editor usa `tono="claro"` sobre blanco. La vista previa del panel usa `tono="oscuro"` con las clases del participante. Es el mismo componente con dos mapas de clase, y ese es el punto: el markdown se renderiza en un solo sitio del código.

---

## 9. Documento PDF

Cinco estados de interfaz, cuatro de los cuales pidió el usuario.

### 9.1 Vacío, esperando archivo

```tsx
<label htmlFor={`pdf-${bl.id}`}
       onDragOver={e => { e.preventDefault(); setArrastrando(true) }}
       onDragLeave={() => setArrastrando(false)}
       onDrop={soltar}
       className={`flex flex-col items-center justify-center gap-2 w-full border border-dashed rounded-xl px-4 py-8 text-center cursor-pointer transition-colors ${
         arrastrando ? 'border-slate-900 bg-slate-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
       }`}>
  <span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    </svg>
  </span>
  <span className="text-sm font-medium text-slate-700">
    Arrastra el PDF aquí o haz clic para elegirlo
  </span>
  <span className="text-xs text-slate-400">Un archivo PDF, hasta 25 MB.</span>
</label>
<input id={`pdf-${bl.id}`} type="file" accept="application/pdf" className="sr-only" onChange={elegir} />
```

### 9.2 Subiendo

```tsx
<div className={SUPERFICIE_PLANA + ' px-4 py-3'}>
  <div className="flex items-center justify-between gap-3 mb-2">
    <div className="min-w-0">
      <p className="text-sm font-medium text-slate-900 truncate">{archivo.nombre}</p>
      <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
        {subido} de {total}
      </p>
    </div>
    <button onClick={cancelar} className={BTN_FILA + ' flex-shrink-0'}>Cancelar</button>
  </div>
  <div className="w-full bg-slate-100 rounded-full h-2">
    <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
         style={{ width: `${pct}%` }} />
  </div>
</div>
```

Es literalmente la barra de progreso de `ChecklistClient.tsx:187-191`, incluida la transición de 500 ms, que es la más lenta del admin y hace que el avance se sienta.

### 9.3 Listo

```tsx
<div className={SUPERFICIE_PLANA + ' px-4 py-3'}>
  <div className="flex items-center gap-3">
    <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
      PDF
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-slate-900 truncate">{archivo.nombre}</p>
      <p className="text-xs text-slate-400 mt-0.5">
        {archivo.peso} · {archivo.paginas} páginas · subido el {fecha(archivo.subidoAt)}
      </p>
    </div>
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <a href={archivo.url} target="_blank" rel="noopener noreferrer" className={BTN_FILA}>Abrir</a>
      <label className={BTN_FILA + ' cursor-pointer'}>
        Reemplazar
        <input type="file" accept="application/pdf" className="sr-only" onChange={reemplazar} />
      </label>
      <ConfirmacionEnLinea compacto etiqueta="Quitar archivo"
        pregunta="Se quita el archivo. El bloque se queda vacío."
        onConfirmar={quitar} />
    </div>
  </div>

  <div className="flex items-center gap-5 mt-3 pt-3 border-t border-slate-100">
    <label className="flex items-center gap-2 cursor-pointer group select-none">
      <input type="checkbox" className="sr-only peer" checked={bl.descargable} onChange={toggle} />
      <span className="w-4 h-4 rounded border-2 border-slate-300 bg-white flex items-center justify-center transition-colors peer-checked:bg-slate-900 peer-checked:border-slate-900 group-hover:border-slate-400">
        <svg className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
             fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <span className="text-xs text-slate-600">Se puede descargar</span>
    </label>
    <span className="text-xs text-slate-400">
      Quién lo ve se define abajo, en Quién lo ve.
    </span>
  </div>
</div>
```

Por defecto, un documento nace con audiencia `moderador` y descargable activo. Es lo que pidió el usuario: cargar PDFs que el moderador va a descargar.

### 9.4 Fallido

```tsx
<div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
  <div className="flex items-start gap-3">
    <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24"
         stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-red-700">No se pudo subir {archivo.nombre}</p>
      <p className="text-xs text-red-600 mt-0.5">{motivo}</p>
    </div>
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <button onClick={reintentar}
              className="text-xs font-medium text-red-700 border border-red-300 bg-white px-2.5 py-1 rounded-lg hover:bg-red-100 transition-colors">
        Reintentar
      </button>
      <button onClick={descartar} className={BTN_FILA + ' bg-white'}>Descartar</button>
    </div>
  </div>
</div>
```

Motivos exactos, en español y sin jerga:

| Causa | Motivo exacto |
|---|---|
| Conexión cortada | Se cortó la conexión al {pct} por ciento. El archivo sigue en tu computadora, no se perdió nada. |
| Demasiado grande | Pesa {peso} y el máximo son 25 MB. Comprímelo o divídelo en dos. |
| Formato equivocado | Esto no es un PDF. Solo se admiten archivos .pdf. |
| PDF protegido | El PDF tiene contraseña. Quítasela y vuelve a subirlo. |
| Error del servidor | Falló del lado nuestro, no del tuyo. Vuelve a intentar en un minuto. |

---

## 10. Video

Cinco estados: vacío, subiendo, procesando, listo, fallido. El estado de procesamiento existe porque después de subir todavía no se conoce la duración ni la miniatura.

### 10.1 Vacío, con dos vías

```tsx
<div className="flex items-center bg-slate-100 rounded-lg p-1 w-fit mb-3">
  <button onClick={() => setVia('archivo')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            via === 'archivo' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}>Subir archivo</button>
  <button onClick={() => setVia('enlace')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            via === 'enlace' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}>Pegar enlace</button>
</div>

{via === 'archivo' ? (
  <label htmlFor={`video-${bl.id}`} className="…mismo dropzone que el PDF…">
    <span className="text-sm font-medium text-slate-700">
      Arrastra el video aquí o haz clic para elegirlo
    </span>
    <span className="text-xs text-slate-400">MP4 o MOV, hasta 500 MB.</span>
  </label>
) : (
  <div>
    <label htmlFor={`enlace-${bl.id}`} className={ETIQUETA_CAMPO}>Enlace del video</label>
    <input id={`enlace-${bl.id}`} type="url" placeholder="https://vimeo.com/…" className={CAMPO} />
    <p className="text-[11px] text-slate-400 mt-1">
      Vimeo o YouTube, siempre en modo no listado. Un enlace público deja de ser tuyo.
    </p>
  </div>
)}
```

### 10.2 Procesando

```tsx
<div className={SUPERFICIE_PLANA + ' px-4 py-3 flex items-center gap-3'}>
  <span className="w-24 h-14 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
    <span className="inline-block w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
  </span>
  <div className="min-w-0 flex-1">
    <p className="text-sm font-medium text-slate-900 truncate">{archivo.nombre}</p>
    <p className="text-xs text-slate-400 mt-0.5">
      Subido. Estamos preparándolo para que se vea bien en teléfono. Puedes seguir trabajando.
    </p>
  </div>
</div>
```

El spinner es el que ya usa `ToggleBlockButton.tsx:37`, con `border-2` y `border-t-transparent`.

### 10.3 Listo

```tsx
<div className={SUPERFICIE_PLANA + ' px-4 py-3'}>
  <div className="flex items-center gap-3">
    <span className="relative w-24 h-14 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
      <img src={video.poster} alt="" className="w-full h-full object-cover opacity-80" />
      <span className="absolute inset-0 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <span className="absolute bottom-1 right-1 text-[10px] font-medium text-white bg-black/70 px-1 rounded tabular-nums">
        {video.duracion}
      </span>
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-slate-900 truncate">{video.nombre}</p>
      <p className="text-xs text-slate-400 mt-0.5">{video.peso} · {video.resolucion} · {video.duracion}</p>
    </div>
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <button className={BTN_FILA}>Reproducir</button>
      <label className={BTN_FILA + ' cursor-pointer'}>Reemplazar<input type="file" className="sr-only" /></label>
      <ConfirmacionEnLinea compacto etiqueta="Quitar video"
        pregunta="Se quita el video. El bloque se queda vacío." onConfirmar={quitar} />
    </div>
  </div>

  <div className="mt-3 pt-3 border-t border-slate-100">
    <label htmlFor={`pie-${bl.id}`} className={ETIQUETA_CAMPO}>Qué es este video</label>
    <input id={`pie-${bl.id}`} placeholder="Una frase. Aparece debajo del video."
           className={CAMPO} />
  </div>
</div>
```

Advertencia de dominio, se muestra cuando el video vive en una bisagra con soporte `sala` o cuando el pie contiene la palabra formación:

```tsx
<div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
  <p className="font-semibold text-xs uppercase tracking-wide text-amber-600 mb-1">Ojo con el kit</p>
  <p className="text-sm text-amber-800 leading-relaxed">
    La pieza humana solo se transmite en formación presencial, nunca por video. Este video sirve de apoyo,
    no sustituye la formación del moderador.
  </p>
</div>
```

La regla está literal en `dominio.ts:64-66`. La advertencia no bloquea, solo avisa.

---

## 11. El guardado

El usuario lo pidió con nombre propio: guardar el progreso. Tiene que ser visible y tiene que ser pulsable.

### 11.1 Reglas

1. Autoguardado a los 1200 ms de inactividad en cualquier campo, y siempre al salir de un campo.
2. Botón explícito, siempre visible y siempre pulsable. Si no hay cambios, guarda igual y responde Todo guardado. Nunca se deshabilita: un botón de guardar apagado produce dudas.
3. Cmd/Ctrl+S guarda y evita el diálogo del navegador.
4. Al intentar cerrar la pestaña con cambios pendientes, `beforeunload`.
5. Los autoguardados no lanzan toast. El toast se reserva para el guardado manual con éxito y para el fallo. El proveedor de toasts no tiene cola ni tope (`ToastProvider.tsx:35`), así que un toast por autoguardado apilaría tarjetas hasta salirse de la pantalla.
6. Ante fallo: reintento automático a los 5, 15 y 60 segundos, chip en rojo y banner persistente en el lienzo. El banner es persistente porque el toast se va solo a los 3000 ms y un error de guardado no puede desaparecer solo.
7. El borrador vive en el servidor, no en `localStorage`. `OperacionClient.tsx:512-518` lee `localStorage` durante el render y el propio autor lo tuvo que parchear con un efecto por desajuste de servidor y cliente. No se repite.

### 11.2 El chip

```tsx
// Todo guardado
<div className="flex items-center gap-1.5 flex-shrink-0">
  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
  <span className="text-xs text-slate-400">Todo guardado</span>
  <span className="text-xs text-slate-300 hidden xl:inline">· {haceCuanto}</span>
</div>

// Sin guardar
<div className="flex items-center gap-2 flex-shrink-0">
  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
  <span className="text-xs text-amber-700">Sin guardar</span>
  <button onClick={guardarAhora}
          className="text-xs font-medium text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors">
    Guardar
  </button>
</div>

// Guardando
<div className="flex items-center gap-1.5 flex-shrink-0">
  <span className="inline-block w-3 h-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
  <span className="text-xs text-slate-400">Guardando…</span>
</div>

// Falló
<div className="flex items-center gap-2 flex-shrink-0">
  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
  <span className="text-xs text-red-700">No se pudo guardar</span>
  <button onClick={guardarAhora}
          className="text-xs font-medium text-red-700 border border-red-300 bg-white px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors">
    Reintentar
  </button>
</div>
```

`haceCuanto` se formatea así: menos de un minuto da "hace un momento", menos de una hora da "hace {n} min", el resto da la hora en formato 24 horas. Se recalcula cada 30 segundos.

### 11.3 El banner de error

Al principio del lienzo, sobre todas las bisagras. Es el patrón de alerta con franja lateral de `dashboard/page.tsx:44-56`.

```tsx
<div className="flex items-start gap-4 border-l-4 border-red-400 bg-red-50 rounded-r-xl px-5 py-4 shadow-sm">
  <div className="flex-1">
    <p className="text-sm font-semibold text-slate-900">Tus últimos cambios no se guardaron</p>
    <p className="text-xs text-slate-500 mt-0.5">
      Lo que escribiste sigue en pantalla, no se ha perdido. No cierres esta pestaña hasta que diga Todo guardado.
      Reintentamos solos en {segundos} segundos.
    </p>
  </div>
  <button onClick={guardarAhora}
          className="shrink-0 text-xs font-medium text-slate-700 border border-slate-300 bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap">
    Reintentar ahora
  </button>
</div>
```

---

## 12. La vista previa

### 12.1 El panel

Reutiliza el marco de teléfono que ya existe en `portal/app/(admin)/eventos/[id]/preview/page.tsx:262-318`, con su barra de estado, su muesca y su barra de navegación inferior simulada.

```tsx
<div className="space-y-3">
  {/* Cabecera del panel */}
  <div className={SUPERFICIE + ' px-4 py-3'}>
    <div className="flex items-center justify-between gap-3 mb-3">
      <h2 className={ETIQUETA_SECCION}>Vista previa</h2>
      <Link href={`/prototipo/personalab/experiencias/${id}/vista-previa`} target="_blank"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap">
        Pantalla completa →
      </Link>
    </div>
    <div className="flex items-center bg-slate-100 rounded-lg p-1">
      <button onClick={() => setLente('participante')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                lente === 'participante' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>Como participante</button>
      <button onClick={() => setLente('moderador')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                lente === 'moderador' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>Como moderador</button>
    </div>
  </div>

  {/* Teléfono */}
  <div className="relative mx-auto" style={{ width: '375px' }}>
    <div className="relative bg-[#0C0C0C] rounded-[40px] shadow-2xl border-4 border-[#2A2A2A] overflow-hidden"
         style={{ minHeight: '640px' }}>
      {/* barra de estado, muesca y nav inferior, copiadas de preview/page.tsx:270-316 */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 text-[9px] font-semibold uppercase tracking-widest text-[#C9A96E] bg-black/60 px-2 py-0.5 rounded-full">
        Vista previa
      </div>
      <div className="overflow-y-auto" style={{ height: '580px', paddingBottom: '80px' }}>
        <div className="px-5 pt-4 space-y-4">
          {bloquesVisibles(lente).length === 0
            ? <VacioLector lente={lente} />
            : bloquesVisibles(lente).map(bl => <TarjetaLectura key={bl.id} bloque={bl} />)}
        </div>
      </div>
    </div>
  </div>

  <p className="text-[11px] text-slate-400 text-center px-4 leading-relaxed">
    Estás viendo el borrador. El participante ve la última versión publicada hasta que publiques de nuevo.
  </p>
</div>
```

El chip Vista previa dentro del teléfono no es decoración: sin él, una captura de pantalla del panel es indistinguible de producción.

### 12.2 Las dos lentes

- **Como participante**: solo bloques con audiencia `participante` o `ambos`. Sin notas para el moderador. Sin documentos marcados solo para moderador.
- **Como moderador**: todo, más las notas en el callout ámbar, más los documentos con su botón de descarga. Es el guion de sala tal como el moderador lo va a ver.

Esta pantalla es la respuesta a la pregunta que el autor no puede contestar de otra forma: qué queda del lado de allá.

### 12.3 Tokens del lector

La tarjeta de lectura hereda el sistema editorial del participante, que es el que carga la marca:

```tsx
<article className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-5">
  <div className="text-[10px] uppercase tracking-[0.15em] text-[#C9A96E] mb-2">
    {ETIQUETA_TIEMPO[bloque.tiempo]}
  </div>
  <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">{bloque.titulo}</h3>
  <div className="text-[15px] leading-[1.75] text-[#B0A898] space-y-3">
    <RenderMarkdown texto={bloque.texto} tono="oscuro" />
  </div>
</article>
```

Mapa de clases del renderer en tono oscuro:

| Nodo | Clases |
|---|---|
| Párrafo | `text-[15px] leading-[1.75] text-[#B0A898]` |
| H2 | `text-base font-semibold text-[#F5F0E8] mt-6 mb-2` |
| H3 | `text-sm font-semibold text-[#F5F0E8] mt-4 mb-1.5` |
| Negrita | `font-semibold text-[#F5F0E8]` |
| Itálica | `italic` |
| Lista | `list-disc pl-5 space-y-1.5 marker:text-[#C9A96E]` |
| Lista numerada | `list-decimal pl-5 space-y-1.5 marker:text-[#6B7280]` |
| Cita | `border-l-2 border-[#C9A96E]/40 pl-4 italic text-[#F5F0E8] font-[family-name:var(--font-cormorant)] text-lg leading-relaxed` |
| Enlace | `text-[#C9A96E] underline underline-offset-2 hover:text-[#D4B07A]` |

Dos cambios deliberados respecto de lo que hay hoy en el lado participante: el cuerpo sube de `text-sm leading-relaxed` a `text-[15px] leading-[1.75]`, y cualquier sello de disponibilidad sube de `text-white/20` a `text-[#6B7280]`. Hoy el participante lee 14px en una columna de 512px y el sello está en un blanco al 20 por ciento que casi no se ve sobre `#1A1A1A`.

---

## 13. Publicar

### 13.1 Los tres estados de una experiencia

| Estado | Badge | Qué significa |
|---|---|---|
| Borrador | `bg-slate-100 text-slate-600` | Nunca se ha publicado. Ningún moderador la ve. |
| Publicada | `bg-emerald-100 text-emerald-700` | Lo que hay en el editor es idéntico a lo publicado. |
| Cambios sin publicar | `bg-amber-100 text-amber-700` | Está publicada y además hay ediciones que los moderadores todavía no ven. |
| Retirada | `bg-red-100 text-red-700` | Ya no se puede licenciar a capítulos nuevos. Las corridas en curso siguen. |

Cuando el estado es Publicada o Cambios sin publicar, el editor muestra un aviso fijo arriba del lienzo:

```tsx
<div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Versión {n} publicada</p>
  <p className="text-sm text-blue-800 leading-relaxed">
    Lo que edites aquí no lo ven los moderadores hasta que publiques de nuevo.
  </p>
</div>
```

Es el bloque de nota comercial de `eventos/[id]/page.tsx:323-325`.

### 13.2 La ruta de revisión

`/experiencias/[id]/publicar`, contenedor `max-w-3xl mx-auto px-8 pt-6 pb-12`.

**Bloque 1: qué recibe el participante.** Barra de métricas con el truco de hairlines por gap de `eventos/[id]/page.tsx:156`, que es la mejor pieza técnica del chasis.

```tsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden mb-6">
  {[
    { label: 'Bisagras',   value: bisagras.length },
    { label: 'Bloques que ve', value: bloquesParticipante },
    { label: 'Documentos', value: documentos },
    { label: 'Minutos de lectura', value: minutos },
  ].map(m => (
    <div key={m.label} className="bg-white px-6 py-4">
      <div className="text-2xl font-semibold text-slate-900 tabular-nums">{m.value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{m.label}</div>
    </div>
  ))}
</div>
```

**Bloque 2: bloqueos.** Si hay uno solo, el botón de publicar no existe.

```tsx
<div className="space-y-3 mb-6">
  <h2 className={ETIQUETA_SECCION + ' mb-3'}>Hay que arreglar esto antes de publicar</h2>
  {bloqueos.map(b => (
    <div key={b.id} className="flex items-start gap-4 border-l-4 border-red-400 bg-red-50 rounded-r-xl px-5 py-4 shadow-sm">
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-900">{b.titulo}</p>
        <p className="text-xs text-slate-500 mt-0.5">{b.detalle}</p>
      </div>
      <Link href={b.href}
            className="shrink-0 text-xs font-medium text-slate-700 border border-slate-300 bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap">
        Ir a arreglarlo
      </Link>
    </div>
  ))}
</div>
```

Lista completa de bloqueos, con copy exacto:

| Título | Detalle |
|---|---|
| La experiencia no tiene nombre | Sin nombre no se puede licenciar a ningún capítulo. |
| La ignición no tiene ninguna bisagra | Una experiencia sin ignición no es una experiencia. |
| Hay {n} bisagras sin título | Una bisagra sin título aparece en blanco en el guion del moderador. |
| Hay {n} bloques de texto vacíos | Se van a ver como una tarjeta en blanco. Escríbelos o elimínalos. |
| Hay {n} archivos que fallaron al subir | Súbelos otra vez o quita el bloque. |
| Hay {n} bloques de documento sin archivo | El bloque existe pero no hay nada que descargar. |
| Hay {n} enlaces de video que no reconocemos | Solo admitimos Vimeo y YouTube en modo no listado. |

**Bloque 3: advertencias.** No impiden publicar.

| Título | Detalle |
|---|---|
| La víspera está vacía | Es el tiempo que hoy no existe en ningún lado y es donde el software más sirve. |
| Hay {n} bisagras sin duración | El moderador no va a poder planear la jornada. |
| Hay {n} piezas del kit marcadas como que faltan | El capítulo va a recibir una lista incompleta. |
| Hay un video de {min} minutos | En teléfono, un video largo casi nadie lo termina. Considera partirlo. |
| Hay {n} documentos que ve el participante | Confirma que quieres eso. Por defecto los documentos son del moderador. |
| Ninguna bisagra abre espacio para escribir | Esta experiencia abre espacio al foro pero no hay dónde escribir. |
| Un bloque de video parece de formación | El kit dice que la pieza humana no se transmite por video. |

**Bloque 4: la confirmación.** Dos pasos, con la mecánica de `EventStatusButton.tsx:39-57`.

```tsx
// Paso 1
<button onClick={() => setConfirmando(true)} disabled={bloqueos.length > 0}
        className={BTN_PRIMARIO + ' w-full sm:w-auto'}>
  Publicar versión {n + 1}
</button>

// Paso 2
<div className={SUPERFICIE + ' p-5'}>
  <p className="text-sm font-semibold text-slate-900 mb-1">
    Se publica la versión {n + 1} de {experiencia.nombre}
  </p>
  <p className="text-sm text-slate-500 leading-relaxed mb-4">
    Los {n} moderadores con acceso van a ver la versión nueva la próxima vez que abran la experiencia.
    Las corridas que ya empezaron se quedan con la versión que tenían.
  </p>
  {advertencias.length > 0 && (
    <p className="text-xs text-amber-700 mb-4">
      Publicas con {advertencias.length} advertencia{advertencias.length === 1 ? '' : 's'} sin resolver.
    </p>
  )}
  <div className="flex gap-3">
    <button onClick={publicar} disabled={cargando} className={BTN_PRIMARIO}>
      {cargando ? 'Publicando…' : 'Sí, publicar'}
    </button>
    <button onClick={() => setConfirmando(false)} className={BTN_SECUNDARIO}>Cancelar</button>
  </div>
</div>
```

Al publicar: toast `Versión {n+1} publicada`, tipo success, y redirección a la Ficha.

### 13.3 Versiones

Publicar congela una copia del contenido y le da número. La corrida guarda con qué versión arrancó. El moderador de una corrida en curso ve un aviso en su panel: `Hay una versión nueva de esta experiencia. Tu foro sigue con la versión {n} hasta que termine.`

Esto es una decisión de producto, no una consecuencia técnica. Está marcada como riesgo porque no ha sido validada con Francisco.

---

## 14. Estados vacíos y de error, copy exacto

Dos niveles de vacío, la distinción buena que ya hace `FamiliasClient.tsx:167 contra 177`: vacío de verdad lleva llamada a la acción, vacío por filtro no.

### 14.1 En el editor

| Situación | Dónde | Copy exacto | Acción |
|---|---|---|---|
| Experiencia sin ninguna bisagra | Lienzo, tarjeta `p-12 text-center` | **Esta experiencia todavía no está diseñada.** No es que falte capturarla: es que no existe. Empieza por la ignición, que es donde ocurre. | Botón: Crear la primera bisagra |
| Tiempo sin bisagras | Lienzo, dentro del grupo, `px-4 py-6 text-center text-slate-400 text-sm` | Este tiempo no está diseñado. | Botón dashed: + Bisagra en {tiempo} |
| Tiempo sin bisagras | Riel | Este tiempo no está diseñado. | ninguna |
| Bisagra sin bloques | Dentro de la tarjeta, `px-5 py-6 text-center text-slate-400 text-sm` | La bisagra existe pero no tiene contenido. | Selector de tipo abierto |
| Bloque de texto vacío | Resumen de la fila colapsada | Bloque vacío | ninguna |
| Documento sin archivo | Fila colapsada, detalle | Sin archivo. Súbelo o elimina el bloque. | ninguna |
| Kit vacío en la Ficha | Tarjeta | Sin kit definido. Un capítulo no puede correr esto sin saber qué necesita. | Botón: Definir el kit |

### 14.2 En la vista previa

| Situación | Copy exacto |
|---|---|
| Nada visible para el participante | Con esta lente el participante no ve nada todavía. Los bloques que hiciste son solo para el moderador. |
| Nada para el moderador | No hay nada para el moderador en esta experiencia. Ni guion, ni documentos, ni notas. |
| Bisagra de soporte sala sin nada en pantalla | Esta bisagra ocurre en la sala. El software no entra y eso está bien. |

### 14.3 Errores

| Situación | Dónde | Copy exacto |
|---|---|---|
| Falla el guardado | Banner rojo en el lienzo | Tus últimos cambios no se guardaron. Lo que escribiste sigue en pantalla, no se ha perdido. No cierres esta pestaña hasta que diga Todo guardado. |
| Falla el guardado manual | Toast tipo error | No se pudo guardar. Revisa tu conexión y vuelve a intentar. |
| Sin conexión | Banner ámbar | Estás sin conexión. Puedes seguir escribiendo. Guardamos en cuanto vuelvas a estar en línea. |
| Otra persona editó | Banner ámbar con dos botones | {Nombre} guardó cambios en esta experiencia mientras la tenías abierta. Recarga para ver su versión, o copia lo tuyo antes de recargar. |
| Archivo demasiado grande | En el bloque | Pesa {peso} y el máximo son {limite}. Comprímelo o divídelo en dos. |
| Formato no admitido, PDF | En el bloque | Esto no es un PDF. Solo se admiten archivos .pdf. |
| Formato no admitido, video | En el bloque | Ese formato no lo podemos reproducir. Usa MP4 o MOV. |
| Enlace de video no reconocido | Bajo el campo, `text-xs text-red-600 mt-1` | No reconocemos ese enlace. Solo Vimeo y YouTube, siempre en modo no listado. |
| Subida cortada | En el bloque | Se cortó la conexión al {pct} por ciento. El archivo sigue en tu computadora, no se perdió nada. |
| Error del servidor al subir | En el bloque | Falló del lado nuestro, no del tuyo. Vuelve a intentar en un minuto. |
| Experiencia inexistente | Página completa | Esta experiencia no existe o la eliminaron. |
| Sin permiso de autoría | Página completa | Puedes ver esta experiencia pero no editarla. Pídele acceso de autor a quien la creó. |
| Publicación bloqueada | Página de publicar | No se puede publicar todavía. Hay {n} cosa{s} por arreglar. |
| Publicación sin cambios | Página de publicar | No hay nada nuevo que publicar. Lo que ven los moderadores es exactamente lo que hay en el editor. |
| Historial vacío | Página de historial | Esta experiencia nunca se ha publicado. |
| Sesión caducada | Banner rojo | Tu sesión caducó. Abre otra pestaña, entra de nuevo y vuelve aquí. Lo que escribiste sigue en pantalla. |

Ningún mensaje de error muestra texto de base de datos ni inglés. El admin hoy hace `setError(error.message)` con el mensaje crudo de Postgres en `familias/nueva/page.tsx:46` y en `NuevoItemForm.tsx:73`, y se lo enseña en inglés a una coordinadora. Aquí el mensaje técnico va a la consola y al log; a la pantalla va una frase escrita por una persona.

### 14.4 Estado vacío, markup canónico

```tsx
<div className={SUPERFICIE + ' p-12 text-center'}>
  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  </div>
  <p className="text-base font-semibold text-slate-900 mb-2">{titulo}</p>
  <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">{cuerpo}</p>
  <button className={BTN_PRIMARIO}>{cta}</button>
</div>
```

Uno solo. El admin tiene cuatro ejecuciones distintas del mismo patrón.

---

## 15. Modelo de datos

### 15.1 Para el prototipo, TypeScript sin base de datos

Se agrega a `dominio.ts`, respetando el léxico y sin ningún campo prohibido:

```ts
export type TipoBloque = 'texto' | 'cita' | 'imagen' | 'documento' | 'video' | 'aviso' | 'escritura'
export type Audiencia  = 'participante' | 'moderador' | 'ambos'
export type EstadoArchivo = 'vacio' | 'subiendo' | 'procesando' | 'listo' | 'fallido'
export type EstadoPublicacion = 'borrador' | 'publicada' | 'cambios' | 'retirada'

export interface Archivo {
  nombre: string
  peso: string
  url: string
  estado: EstadoArchivo
  progreso?: number          // 0 a 100, solo mientras sube
  motivoFallo?: string
  paginas?: number           // PDF
  duracion?: string          // video
  poster?: string            // video
  descargable: boolean
}

export interface Bloque {
  id: string
  tipo: TipoBloque
  orden: number
  audiencia: Audiencia
  texto?: string             // markdown restringido
  pie?: string
  archivo?: Archivo
  enlace?: string
  notaModerador?: string
}

// Bisagra gana bloques. Todo lo demás de dominio.ts:40-51 se conserva.
export interface Bisagra {
  id: string
  tiempo: Tiempo
  orden: number
  titulo: string
  descripcion: string
  soporte: Soporte
  duracion?: string
  listo: boolean
  requiere?: string[]
  bloques: Bloque[]          // nuevo
}

export interface VersionPublicada {
  numero: number
  publicadaAt: string
  publicadaPor: string
  nota?: string
}

// Experiencia gana estado de publicación e historial.
// estadoPublicacion, versiones, borradorActualizadoAt, borradorActualizadoPor
```

Campos que no existen y no van a existir en el modelo del participante: `progress`, `completion_pct`, `score`, `streak`, `badge`, `rank`, `quiz`. La única señal de avance del editor, el punto verde o ámbar del riel, es del autor y vive en `Bisagra.listo`, que ya existía.

### 15.2 Para el esquema real, boceto

Migración `20260808_experiencia_autoria.sql`, siguiendo la convención de nombres de `portal/supabase/migrations`.

```
experiencias            id, nombre, subtitulo, narrativa, duracion, abre_espacio_al_foro,
                        maduracion, estado_publicacion, version_actual,
                        borrador_actualizado_at, borrador_actualizado_por
bisagras                id, experiencia_id, tiempo, orden, titulo, descripcion,
                        soporte, duracion, listo, requiere (text[])
bloques                 id, bisagra_id, tipo, orden, audiencia, texto, pie,
                        enlace, nota_moderador, archivo_id
archivos                id, bucket_path, nombre_original, mime, peso_bytes,
                        estado, paginas, duracion_seg, poster_path, descargable
experiencia_versiones   id, experiencia_id, numero, contenido (jsonb congelado),
                        publicada_at, publicada_por, nota
corridas                + version_experiencia (int)
```

RLS: escritura solo para perfiles con rol de autor sobre esa experiencia. Lectura del contenido publicado para moderadores con grant vigente sobre el capítulo. Los archivos con `audiencia = 'moderador'` nunca se sirven por URL pública, siempre por URL firmada de vida corta.

---

## 16. Accesibilidad, no negociable

1. Todo input, textarea y select lleva `id`, y su `label` lleva `htmlFor`. El admin no lo hace en ningún archivo. Un editor de autoría es un formulario gigante y sin esto es inusable con lector de pantalla.
2. Un solo tratamiento de foco en todo el editor: `focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent`. El admin tiene cuatro tratamientos en cuatro archivos hermanos, uno de ellos casi invisible (`focus:ring-slate-900/10`).
3. Todo botón con solo icono lleva `aria-label` y `title`.
4. El acordeón de bloque lleva `aria-expanded` y `aria-controls`.
5. Ninguna acción existe únicamente en hover.
6. El orden de tabulación sigue el orden visual: riel, luego lienzo de arriba abajo, luego panel.
7. El chip de guardado vive dentro de una región `aria-live="polite"` para que el cambio de estado se anuncie.
8. Contraste: nada de texto informativo por debajo de `slate-400` sobre blanco. `slate-300` se reserva para separadores y para el guion de celda vacía.

---

## 17. Qué no se construye ahora

- Arrastrar y soltar bloques.
- Editor WYSIWYG.
- Comentarios y colaboración en tiempo real.
- Plantillas de experiencia.
- Traducción y multiidioma.
- Versionado con ramas. Solo hay una línea de versiones numeradas.
- Cualquier cosa que mida al participante: progreso, porcentaje, puntaje, racha, insignia, ranking, examen. Está prohibido por el dominio y no entra por la puerta de atrás disfrazado de otra cosa.

---

## 18. Orden de construcción sugerido

1. `tokens.ts`, la regla de `scrollbar-none` en `globals.css`, y el repintado del chasis: `AdminNav` reactivado en slate, `ExperienciaHeader`, `ExperienciaSubNav`.
2. El riel y el lienzo con bisagras y bloques de texto, con agregar, reordenar y eliminar completos. Sin archivos todavía.
3. El guardado entero, incluidos los cuatro estados del chip, el banner y el aviso al salir.
4. `RenderMarkdown` más el `PanelVistaPrevia` con las dos lentes.
5. La ruta de publicar con sus bloqueos y advertencias.
6. Bloques de documento y de video, primero simulados con temporizadores para probar los cinco estados sin infraestructura, después conectados al almacenamiento real.

Los pasos 1 a 5 no necesitan nada del servidor ni de almacenamiento, así que se pueden llevar al prototipo con los datos simulados que ya existen en `dominio.ts`. El paso 6 es el único que abre trabajo de infraestructura.