# El admin de Trascendencia, visto en vivo

> Observacion directa del portal en produccion, con sesion de super admin,
> el 2026-08-07. Esto SUPERA lo que se dedujo leyendo el codigo: varias
> conclusiones de la lectura estatica estaban equivocadas.
> Sin datos personales: solo estructura y forma.

---

## Correccion mayor: el chasis no es el que yo creia

El prototipo de PersonaLab se construyo con una **barra lateral oscura**,
modelada sobre `components/AdminNav.tsx`.

**Ese componente no es el que se usa.** El admin real usa `AdminTopNav`:
interfaz CLARA, con barra superior. No hay barra lateral en ninguna pantalla.

Consecuencia: `app/prototipo/personalab/WorkspaceNav.tsx` hay que tirarlo y
rehacerlo como barra superior.

---

## 1. Barra superior (global)

- Fondo blanco, borde inferior de 1px muy claro.
- Izquierda: la palabra `4Meaning` en negro, peso medio, sin logo grafico.
- Centro: `Eventos` y `Usuarios`. El activo es una pastilla de fondo gris muy
  claro con esquinas redondeadas.
- Derecha: correo del usuario en gris claro, y `Cerrar sesion` en gris claro.
- Altura aproximada 54px.

## 2. Sub-navegacion de evento (segundo nivel)

Debajo de la barra superior, tambien blanca con borde inferior:

`← Eventos | [Nombre del evento] [pastilla de estado] | Resumen · Checklist ·
Contenido · Familias · Acuerdos · Materiales · Equipo · Itinerario · Avisos ·
Entregas · Operacion · Preview`

- El nombre del evento va en negro, peso medio.
- La pastilla de estado va junto al nombre (azul claro para "Confirmado").
- El item activo es pastilla gris clara; los demas van en gris medio sin fondo.
- `Operacion` se distingue con borde propio: es accion, no seccion.
- `Preview` va al final, tambien aparte.

## 3. Dashboard

Muy sobrio, nada de tarjetas de metricas.

- `Hola, [nombre]` en gris pequeno.
- Nombre del evento actual en negro grande, peso 500, cerca de 30px.
- Ciudad, pais y rango de fechas en gris, una linea.
- Pastilla a la derecha con la cuenta regresiva ("29 dias"), fondo gris claro.
- Rotulo `PENDIENTE ANTES DEL RETIRO` en mayusculas, gris, tracking amplio.
- Alertas: tarjeta de fondo amarillo muy claro con **borde izquierdo amarillo
  de 3px**, titulo en negro, subtitulo en gris, y boton blanco a la derecha.
- `EVENTOS ANTERIORES` con tarjetas simples en gris.

## 4. Listado de eventos: es un KANBAN, no una tabla

Cinco columnas por estado de pipeline, cada una con su rotulo en mayusculas y
un contador al lado:

`PROSPECTO 0 · CONFIRMADO 1 · EN PREPARACION 0 · EJECUTADO 1 · CANCELADO 0`

- Cada rotulo tiene color propio: prospecto gris, confirmado azul, en
  preparacion ambar, ejecutado verde, cancelado rojo.
- Las columnas vacias muestran una caja de borde punteado con "Sin eventos".
- Las tarjetas llevan nombre en negro, ciudad y fechas en gris, y una pastilla
  gris clara abajo con el conteo de familias.
- Arriba a la derecha: boton negro `+ Nuevo evento`.

**El prototipo de PersonaLab usa tabla para las corridas. Debe usar kanban.**

## 5. Detalle de evento

- Linea de contexto en gris: ciudad, fechas, sede, y pastilla verde `Activo`.
- A la derecha: `Marcar completado` y `Editar`, los dos botones blancos con
  borde.
- **Fila de metricas**: una sola caja con borde, dividida por lineas
  verticales. Cuatro celdas. Numero grande en negro peso 500 cerca de 30px,
  rotulo pequeno en gris debajo. Aqui: Familias, Acuerdos, Firmados, Tareas.
- **Dos columnas**, aproximadamente 2 a 1.
  - Izquierda: tarjetas con encabezado (titulo a la izquierda, `Ver todas →` a
    la derecha en gris) y filas con nombre en negro, subtitulo en gris, y
    pastilla de estado a la derecha.
  - Derecha: panel `ACCIONES` con un boton negro principal (`Modo operacion`) y
    debajo una pila de botones blancos con borde. Luego panel `DETALLES`.

## 6. Contenido progresivo: YA ES UN SISTEMA DE BLOQUES

Esta es la pieza que mas importa para la autoria de PersonaLab. Ya existe y
funciona asi:

- Titulo de pagina en negro grande, subtitulo explicativo en gris debajo.
- A la derecha: contador `4 activos · 4 total` en gris, y boton negro
  `+ Nuevo bloque`.
- **Caja explicativa** de fondo azul muy claro, con icono de informacion a la
  izquierda, texto en azul oscuro y una frase clave en negrita.
- **Tabla de bloques** con columnas `# · TITULO · TIPO · ACTIVADO · ESTADO`.
  - Titulo en negro peso medio, con un extracto del contenido truncado debajo
    en gris.
  - `TIPO` es una pastilla de color por tipo: Informacion azul, Formato gris,
    Reflexion amarillo.
  - `ESTADO` es un punto verde mas la palabra `Activo`, con boton `Desactivar`
    al lado.

Los tipos que existen hoy son Informacion, Formato y Reflexion. El sistema de
autoria de PersonaLab **extiende esto**, no lo reemplaza: agrega texto rico,
imagen, video, archivo descargable y nota interna.

## 7. Formulario de creacion

Aparece como panel a la derecha, en la misma pagina, sin navegar.

- Tarjeta blanca, esquinas redondeadas, borde muy claro, sombra suave.
- Titulo del panel en negro, peso medio.
- **Etiquetas en MAYUSCULAS**, cerca de 11px, gris, con asterisco rojo cuando
  el campo es obligatorio. Formato: `TITULO *`, `CONTENIDO (OPCIONAL)`.
- Inputs de ancho completo, esquinas redondeadas cerca de 8px, borde gris muy
  claro. Al enfocar, el borde se oscurece.
- Textarea de varias lineas para el cuerpo.
- Fila de dos columnas para campos cortos: `TIPO` como select y `ORDEN` como
  numero.
- Botones abajo: principal oscuro (`Guardar bloque`) y `Cancelar` blanco con
  borde, uno al lado del otro.

---

## Lo que hay que cambiar en el prototipo de PersonaLab

| Pieza | Ahora | Debe ser |
|---|---|---|
| Chasis | Barra lateral teal oscura | Barra superior clara, como el admin real |
| Corridas | Tabla | Kanban por estado |
| Resumen | Tarjetas de cifras sueltas | Fila de metricas en una sola caja dividida |
| Detalle de corrida | Dos columnas propias | Dos columnas con panel ACCIONES a la derecha |
| Experiencias | Tabla propia | Tabla al estilo de Contenido progresivo |
| Autoria | No existe | Extender el modelo de bloques que ya existe |
| Formularios | No existen | Etiquetas en mayusculas, panel lateral, boton oscuro mas cancelar |
