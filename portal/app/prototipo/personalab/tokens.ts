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

// Botones, calcados del admin
export const BTN_PRIMARIO =
  'bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors'
export const BTN_SECUNDARIO =
  'bg-white border border-slate-200 text-slate-700 text-sm px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors'
export const BTN_FILA =
  'text-xs border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md hover:bg-slate-50 transition-colors'

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

// Estado vacio
export const VACIO =
  'border border-dashed border-slate-200 rounded-xl px-5 py-6 text-sm text-slate-500 leading-relaxed'
