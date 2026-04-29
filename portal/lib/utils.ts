import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmtDate(str: string | null): string {
  if (!str) return '—'
  const months = ['enero','febrero','marzo','abril','mayo','junio',
                  'julio','agosto','septiembre','octubre','noviembre','diciembre']
  const [y, m, d] = str.split('-')
  return `${parseInt(d)} de ${months[parseInt(m) - 1]} de ${y}`
}

export function fmtDateShort(str: string | null): string {
  if (!str) return '—'
  const [y, m, d] = str.split('-')
  return `${d}/${m}/${y}`
}

export function fmtTime(str: string | null): string {
  if (!str) return ''
  return str.slice(0, 5)  // HH:MM from HH:MM:SS
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export const AGREEMENT_TYPE_LABELS: Record<string, string> = {
  evento:       'Evento',
  video:        'Equipo de Video',
  storybook:    'Storybook',
  staff:        'Staff',
  participante: 'Participante',
  fotografo:    'Fotógrafo',
  custom:       'Personalizado',
}

export const STATUS_LABELS: Record<string, string> = {
  draft:     'Borrador',
  sent:      'Enviado',
  viewed:    'Visto',
  signed:    'Firmado',
  approved:  'Aprobado',
  rejected:  'Rechazado',
}

export const STATUS_COLORS: Record<string, string> = {
  draft:    'text-muted',
  sent:     'text-info',
  viewed:   'text-warning',
  signed:   'text-success',
  approved: 'text-success',
  rejected: 'text-error',
}
