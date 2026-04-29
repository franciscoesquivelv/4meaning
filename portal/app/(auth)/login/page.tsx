import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Iniciar sesión' }

interface Props {
  searchParams: { error?: string; next?: string }
}

export default function LoginPage({ searchParams }: Props) {
  const next      = searchParams.next  ?? '/'
  const errorMsg  = searchParams.error === 'credenciales_invalidas'
    ? 'Correo o contraseña incorrectos.'
    : searchParams.error
      ? 'Error al iniciar sesión. Intenta de nuevo.'
      : null

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <img src="/logo.png" alt="Trascendencia" className="h-7 w-auto" />
        <p className="text-[8px] font-bold tracking-[0.28em] uppercase text-muted">
          Portal
        </p>
      </div>

      {/* Card */}
      <div className="bg-surface border border-border rounded-xl p-7">
        <h1 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted mb-6">
          Iniciar sesión
        </h1>

        <form method="POST" action="/api/auth/login" className="flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email"
              className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
              Correo electrónico <span className="text-ink/50">*</span>
            </label>
            <input
              id="email" name="email" type="email"
              required autoComplete="email" placeholder="tu@correo.com"
              className="w-full bg-surface2 border border-border rounded px-3 py-2.5
                text-ink text-[13px] placeholder:text-border-hi
                outline-none focus:border-border-hi transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password"
              className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
              Contraseña <span className="text-ink/50">*</span>
            </label>
            <input
              id="password" name="password" type="password"
              required autoComplete="current-password" placeholder="••••••••"
              className="w-full bg-surface2 border border-border rounded px-3 py-2.5
                text-ink text-[13px] placeholder:text-border-hi
                outline-none focus:border-border-hi transition-colors"
            />
          </div>

          {errorMsg && (
            <p className="text-[11px] text-error bg-error/8 border border-error/20 rounded px-3 py-2">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full mt-1 bg-ink text-bg text-[11px] font-bold uppercase
              tracking-[0.14em] py-3 rounded-lg hover:bg-ink/90 transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>

      <p className="text-center text-[10px] text-muted mt-6">
        ¿No tienes acceso?{' '}
        <span className="text-ink/60">Contacta al equipo de Trascendencia.</span>
      </p>
    </div>
  )
}
