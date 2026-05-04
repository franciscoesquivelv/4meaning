'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type StatusKey = 'pendiente' | 'en_produccion' | 'entregado'

const STATUS_OPTIONS: { value: StatusKey; label: string; cls: string }[] = [
  { value: 'pendiente',     label: 'Pendiente',      cls: 'bg-slate-100 text-slate-600' },
  { value: 'en_produccion', label: 'En producción',  cls: 'bg-blue-100 text-blue-700' },
  { value: 'entregado',     label: 'Entregado',      cls: 'bg-green-100 text-green-700' },
]

function StatusSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (v: StatusKey) => void
}) {
  const current = STATUS_OPTIONS.find(o => o.value === value) ?? STATUS_OPTIONS[0]
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={e => onChange(e.target.value as StatusKey)}
        className={`appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 ${current.cls}`}
      >
        {STATUS_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-current opacity-60 text-[10px]">▾</span>
    </div>
  )
}

interface FamilyRow {
  id: string
  nombre_familia: string
  nombre1: string | null
  nombre2: string | null
  email1: string | null
  storybook_status: string | null
  video_status: string | null
  entrega_estimada: string | null
}

function isDelayed(estimada: string | null, sbStatus: string, vStatus: string): boolean {
  if (!estimada) return false
  if (sbStatus === 'entregado' && vStatus === 'entregado') return false
  return new Date(estimada + 'T23:59:59') < new Date()
}

export default function EntregaRow({ family, isLast }: { family: FamilyRow; isLast: boolean }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [sbStatus, setSbStatus] = useState<StatusKey>((family.storybook_status ?? 'pendiente') as StatusKey)
  const [vStatus, setVStatus]   = useState<StatusKey>((family.video_status ?? 'pendiente') as StatusKey)
  const [entrega, setEntrega]   = useState(family.entrega_estimada ?? '')
  const [saving, setSaving]     = useState(false)

  async function save(updates: Partial<{ storybook_status: string; video_status: string; entrega_estimada: string | null }>) {
    setSaving(true)
    await supabase.from('families').update(updates).eq('id', family.id)
    setSaving(false)
  }

  return (
    <tr className={`hover:bg-slate-50 transition-colors ${!isLast ? 'border-b border-slate-100' : ''} ${saving ? 'opacity-70' : ''}`}>
      {/* Familia */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">{family.nombre_familia}</span>
          {isDelayed(family.entrega_estimada, sbStatus, vStatus) && (
            <span className="text-xs font-semibold text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">Retrasado</span>
          )}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          {family.nombre1}{family.nombre2 ? ` · ${family.nombre2}` : ''}
        </div>
        {family.email1 && (
          <div className="text-xs text-slate-400 mt-0.5">{family.email1}</div>
        )}
      </td>

      {/* Storybook */}
      <td className="px-4 py-3">
        <StatusSelect
          value={sbStatus}
          onChange={v => {
            setSbStatus(v)
            save({ storybook_status: v })
          }}
        />
      </td>

      {/* Video */}
      <td className="px-4 py-3">
        <StatusSelect
          value={vStatus}
          onChange={v => {
            setVStatus(v)
            save({ video_status: v })
          }}
        />
      </td>

      {/* Fecha estimada */}
      <td className="px-4 py-3">
        <input
          type="date"
          value={entrega}
          onChange={e => setEntrega(e.target.value)}
          onBlur={() => save({ entrega_estimada: entrega || null })}
          className="px-2 py-1 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
        />
      </td>
    </tr>
  )
}
