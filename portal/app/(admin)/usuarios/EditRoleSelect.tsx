'use client'
import { useTransition } from 'react'
import { updateUserRole } from './actions'

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super admin',
  admin: 'Admin',
  staff: 'Staff',
  participant: 'Participante',
}

const ROLE_STYLES: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  admin: 'bg-blue-100 text-blue-700',
  staff: 'bg-green-100 text-green-700',
  participant: 'bg-slate-100 text-slate-600',
}

const ROLES = ['super_admin', 'admin', 'staff', 'participant'] as const

interface EditRoleSelectProps {
  userId: string
  currentRole: string
}

export default function EditRoleSelect({ userId, currentRole }: EditRoleSelectProps) {
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value
    startTransition(() => {
      updateUserRole(userId, newRole)
    })
  }

  const colorClass = ROLE_STYLES[currentRole] ?? 'bg-slate-100 text-slate-600'

  return (
    <select
      defaultValue={currentRole}
      onChange={handleChange}
      disabled={isPending}
      className={`rounded-full px-2 py-0.5 text-xs font-semibold border-0 outline-none cursor-pointer appearance-none transition-opacity ${colorClass} ${isPending ? 'opacity-50' : 'opacity-100'}`}
    >
      {ROLES.map(role => (
        <option key={role} value={role}>
          {ROLE_LABELS[role]}
        </option>
      ))}
    </select>
  )
}
