// ── TOKENS DEL WORKSPACE ────────────────────────────────────────
// Copiados del admin real de Trascendencia, no inventados.
// Referencia: components/AdminTopNav.tsx, app/(admin)/layout.tsx:24-28,
// app/(admin)/eventos/[id]/EventSubNav.tsx.
//
// El chasis es NEUTRO (escala slate), igual que Trascendencia. El teal de
// PersonaLab entra solo como acento de identidad, nunca como fondo de
// pantalla: si el workspace se pinta de teal deja de parecerse, que es
// justo el reclamo que origino este repintado.

export const TEAL = '#002B34'

// Superficies
export const PAGINA = 'bg-slate-50 min-h-screen'
export const TARJETA = 'bg-white border border-slate-200 rounded-xl'
export const TARJETA_PLANA = 'bg-white border border-slate-200 rounded-xl overflow-hidden'

// Tipografia de pagina
export const H1 = 'text-2xl font-semibold tracking-tight text-slate-900'
export const SUBTITULO = 'text-sm text-slate-500 mt-1'
export const ETIQUETA = 'text-[11px] font-semibold uppercase tracking-wider text-slate-400'

// ── Botones ─────────────────────────────────────────────────────
// Calcados del admin, y completados con lo que al admin le falta.
//
// Antes de esto, en todo el workspace no habia ni un focus-visible ni un
// active: ningun boton reaccionaba al ser presionado, y ninguno era
// navegable con teclado. Eso no se arregla pantalla por pantalla, se
// arregla aqui una vez.

// El anillo de foco. El offset va sobre slate-50 porque ese es el fondo de
// pagina (PAGINA, arriba).
export const FOCO =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/25 ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50'

// La presion dura 100ms, mas rapido que el hover de 150: el boton tiene que
// sentirse por delante del dedo, no por detras.
const PRESION =
  'transition-[background-color,border-color,transform,opacity] duration-100 active:scale-[0.98]'

const BASE = 'inline-flex items-center justify-center gap-2 rounded-lg select-none'

export const BTN_PRIMARIO =
  `${BASE} bg-slate-900 text-white text-sm font-medium px-4 py-2 ` +
  'hover:bg-slate-700 active:bg-slate-950 ' +
  'disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed ' +
  'disabled:hover:bg-slate-200 disabled:active:scale-100 ' + PRESION + ' ' + FOCO

export const BTN_SECUNDARIO =
  `${BASE} bg-white border border-slate-200 text-slate-700 text-sm px-4 py-2 ` +
  'hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 ' +
  'disabled:bg-white disabled:text-slate-300 disabled:border-slate-100 disabled:cursor-not-allowed ' +
  'disabled:hover:bg-white disabled:active:scale-100 ' + PRESION + ' ' + FOCO

export const BTN_FILA =
  `${BASE} gap-1.5 text-xs border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md ` +
  'hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 ' +
  'disabled:text-slate-300 disabled:border-slate-100 disabled:cursor-not-allowed ' +
  'disabled:hover:bg-transparent disabled:hover:border-slate-100 disabled:active:scale-100 ' +
  PRESION + ' ' + FOCO

// Destructivo. Antes vivia suelto y escrito distinto en dos archivos.
export const BTN_PELIGRO =
  `${BASE} gap-1.5 text-xs font-medium border border-red-300 text-red-700 bg-red-50 ` +
  'px-2.5 py-1 rounded-md hover:bg-red-100 active:bg-red-200 ' + PRESION + ' ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50'

// Lo que todavia no existe. Un boton muerto es peor que un boton ausente:
// ensena que la interfaz no responde, y esa leccion se generaliza a los
// botones que si funcionan.
export const BTN_PRONTO =
  `${BASE} bg-white border border-dashed border-slate-200 text-slate-400 text-sm px-4 py-2 ` +
  'cursor-not-allowed'

// Tablas
export const TH =
  'text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3 border-b border-slate-200 whitespace-nowrap'
export const TD = 'px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-700'

// Pastillas de estado. Mismos pares de color que EventSubNav.tsx:12-18.
export const PASTILLA = 'text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap'

export const COLOR_ESTADO: Record<string, string> = {
  prospecto:      'bg-slate-100 text-slate-600',
  confirmada:     'bg-blue-100 text-blue-700',
  en_preparacion: 'bg-amber-100 text-amber-700',
  corrida:        'bg-emerald-100 text-emerald-700',
  cancelada:      'bg-red-100 text-red-500',
}

export const COLOR_MADURACION: Record<string, string> = {
  'diseño':   'bg-amber-100 text-amber-700',
  'piloto':   'bg-blue-100 text-blue-700',
  'lista':    'bg-emerald-100 text-emerald-700',
  'retirada': 'bg-slate-100 text-slate-600',
}

// Tipos de bloque y de soporte, siguiendo el patron de Contenido progresivo,
// que ya usa una pastilla de color por tipo.
export const COLOR_SOPORTE: Record<string, string> = {
  sala:     'bg-amber-100 text-amber-700',
  objeto:   'bg-violet-100 text-violet-700',
  pantalla: 'bg-blue-100 text-blue-700',
}

// Caja explicativa, calcada de la de Contenido progresivo.
export const EXPLICATIVO = 'bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3'
export const EXPLICATIVO_TEXTO = 'text-sm text-blue-900 leading-relaxed'

// Aviso ambar, el de las alertas del dashboard: borde izquierdo de 3px.
export const AVISO = 'bg-amber-50 border-l-[3px] border-amber-400 rounded-r-lg px-4 py-3'

// ── Estados vacios ──────────────────────────────────────────────
// Dos, no uno. La caja punteada llama la atencion, asi que se reserva para
// el vacio que SI es un problema: falta algo y hay que hacer algo. El vacio
// normal (nada agendado, nada en retorno) se dice en voz baja y sin caja.
export const VACIO =
  'border border-dashed border-slate-200 rounded-xl px-5 py-6 text-sm text-slate-500 leading-relaxed'
export const VACIO_NEUTRO = 'px-5 py-6 text-sm text-slate-400 leading-relaxed'
