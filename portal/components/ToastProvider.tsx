'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

export type ToastType = 'success' | 'error'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  addToast: (message: string, type: ToastType) => void
  removeToast: (id: string) => void
}

export const ToastContext = createContext<ToastContextValue>({
  addToast: () => {},
  removeToast: () => {},
})

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true))
    })

    const dismissTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 200)
    }, 3000)

    return () => {
      cancelAnimationFrame(enterTimer)
      clearTimeout(dismissTimer)
    }
  }, [toast.id, onRemove])

  const baseCard =
    'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium min-w-[240px] max-w-[340px] transition-all duration-200'

  const successStyle = 'bg-slate-900 text-white'
  const errorStyle = 'bg-red-50 border border-red-200 text-red-700'

  return (
    <div
      className={[
        baseCard,
        toast.type === 'success' ? successStyle : errorStyle,
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
      ].join(' ')}
      role="alert"
    >
      {toast.type === 'success' ? (
        <svg
          className="flex-shrink-0 w-4 h-4 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg
          className="flex-shrink-0 w-4 h-4 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => {
          setVisible(false)
          setTimeout(() => onRemove(toast.id), 200)
        }}
        className={[
          'flex-shrink-0 ml-1 opacity-60 hover:opacity-100 transition-opacity',
          toast.type === 'error' ? 'text-red-500' : 'text-white',
        ].join(' ')}
        aria-label="Cerrar"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = typeof crypto !== 'undefined' ? crypto.randomUUID() : String(Date.now())
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
