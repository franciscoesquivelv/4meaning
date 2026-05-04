'use client'

import { useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Task = {
  id: string
  titulo: string
  descripcion: string | null
  fase: string | null
  done: boolean
  done_at: string | null
  orden: number
}

const FASES_PREDEFINIDAS = [
  '4 meses antes',
  '2 meses antes',
  '1 mes antes',
  '2 semanas antes',
  'Semana del evento',
  'Día del evento',
  'Post-evento',
]

function formatFase(fase: string | null) {
  return fase ?? 'Sin fase'
}

function TaskRow({
  task,
  onToggle,
  onDelete,
  isAdmin,
}: {
  task: Task
  onToggle: (id: string, done: boolean) => void
  onDelete: (id: string) => void
  isAdmin: boolean
}) {
  return (
    <div className={`flex items-start gap-3 px-4 py-3 group transition-colors ${task.done ? 'opacity-60' : ''}`}>
      <button
        onClick={() => onToggle(task.id, !task.done)}
        className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          task.done
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        {task.done && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-slate-800 ${task.done ? 'line-through text-slate-400' : ''}`}>
          {task.titulo}
        </p>
        {task.descripcion && (
          <p className="text-xs text-slate-400 mt-0.5">{task.descripcion}</p>
        )}
      </div>
      {isAdmin && (
        <button
          onClick={() => onDelete(task.id)}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all text-xs px-1"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default function ChecklistClient({
  eventId,
  initialTasks,
  isAdmin,
}: {
  eventId: string
  initialTasks: Task[]
  isAdmin: boolean
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [showForm, setShowForm] = useState(false)
  const [newTask, setNewTask] = useState({ titulo: '', descripcion: '', fase: '' })
  const [customFase, setCustomFase] = useState('')
  const [saving, setSaving] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleToggle = useCallback(async (id: string, done: boolean) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done, done_at: done ? new Date().toISOString() : null } : t))

    const { error } = await supabase
      .from('event_tasks')
      .update({ done, done_at: done ? new Date().toISOString() : null })
      .eq('id', id)

    if (error) {
      // Rollback to previous value
      setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !done, done_at: !done ? new Date().toISOString() : null } : t))
      console.error('Error al actualizar tarea:', error.message)
    }
  }, [supabase])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('¿Eliminar esta tarea?')) return
    setTasks(prev => prev.filter(t => t.id !== id))
    await supabase.from('event_tasks').delete().eq('id', id)
  }, [supabase])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.titulo.trim()) return
    setSaving(true)

    const fase = newTask.fase === '__custom__' ? customFase.trim() || null : newTask.fase || null

    const maxOrden = tasks.filter(t => t.fase === fase).reduce((m, t) => Math.max(m, t.orden), -1)

    const { data, error } = await supabase
      .from('event_tasks')
      .insert({
        event_id: eventId,
        titulo: newTask.titulo.trim(),
        descripcion: newTask.descripcion.trim() || null,
        fase,
        orden: maxOrden + 1,
      })
      .select('id, titulo, descripcion, fase, done, done_at, orden')
      .single()

    if (!error && data) {
      setTasks(prev => [...prev, data])
      setNewTask({ titulo: '', descripcion: '', fase: '' })
      setCustomFase('')
      setShowForm(false)
    }
    setSaving(false)
  }

  // Group tasks by phase
  const grouped: Record<string, Task[]> = {}
  for (const task of tasks) {
    const key = task.fase ?? ''
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(task)
  }

  // Sort phases: predefined first, then alphabetical, then null
  const phaseOrder = [...FASES_PREDEFINIDAS]
  const allPhases = Object.keys(grouped).sort((a, b) => {
    const ia = phaseOrder.indexOf(a)
    const ib = phaseOrder.indexOf(b)
    if (a === '' && b !== '') return 1
    if (b === '' && a !== '') return -1
    if (ia === -1 && ib === -1) return a.localeCompare(b)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })

  const totalDone = tasks.filter(t => t.done).length
  const totalAll = tasks.length

  return (
    <div>
      {/* Progress bar */}
      {totalAll > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>{totalDone}/{totalAll} completadas</span>
            <span>{totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${totalAll > 0 ? (totalDone / totalAll) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Tasks grouped by phase */}
      {tasks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-sm">
          <p className="text-slate-400 text-sm mb-3">Sin tareas todavía.</p>
          {isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm text-slate-600 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              + Agregar primera tarea
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {allPhases.map(phase => {
            const phaseTasks = grouped[phase]
            const phaseDone = phaseTasks.filter(t => t.done).length
            return (
              <div key={phase || '__none__'} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    {formatFase(phase || null)}
                  </h3>
                  <span className="text-xs text-slate-400">{phaseDone}/{phaseTasks.length}</span>
                </div>
                {phaseTasks.map((task, i) => (
                  <div key={task.id} className={i < phaseTasks.length - 1 ? 'border-b border-slate-100' : ''}>
                    <TaskRow task={task} onToggle={handleToggle} onDelete={handleDelete} isAdmin={isAdmin} />
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* Add task button / form */}
      {isAdmin && (
        <div className="mt-4">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 border border-dashed border-slate-300 hover:border-slate-400 px-4 py-2.5 rounded-xl w-full transition-colors justify-center"
            >
              + Agregar tarea
            </button>
          ) : (
            <form
              onSubmit={handleAdd}
              className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3"
            >
              <h4 className="text-sm font-semibold text-slate-800">Nueva tarea</h4>

              <input
                required
                autoFocus
                placeholder="Título de la tarea *"
                value={newTask.titulo}
                onChange={e => setNewTask(p => ({ ...p, titulo: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-slate-400 placeholder-slate-400"
              />

              <input
                placeholder="Descripción (opcional)"
                value={newTask.descripcion}
                onChange={e => setNewTask(p => ({ ...p, descripcion: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-slate-400 placeholder-slate-400"
              />

              <select
                value={newTask.fase}
                onChange={e => setNewTask(p => ({ ...p, fase: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-slate-400 bg-white text-slate-700"
              >
                <option value="">Sin fase</option>
                {FASES_PREDEFINIDAS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
                {/* Show existing custom phases */}
                {allPhases.filter(p => p && !FASES_PREDEFINIDAS.includes(p)).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
                <option value="__custom__">+ Fase personalizada…</option>
              </select>

              {newTask.fase === '__custom__' && (
                <input
                  placeholder="Nombre de la fase"
                  value={customFase}
                  onChange={e => setCustomFase(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-slate-400 placeholder-slate-400"
                />
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving || !newTask.titulo.trim()}
                  className="px-4 py-1.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Guardando…' : 'Agregar'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setNewTask({ titulo: '', descripcion: '', fase: '' }) }}
                  className="px-4 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
