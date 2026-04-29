// Auto-generated types matching the Supabase schema
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.ts
// This is a manual version until you connect your Supabase project.

export type UserRole       = 'super_admin' | 'admin' | 'staff' | 'participant'
export type EventStatus    = 'draft' | 'active' | 'completed' | 'archived'
export type FamilyStatus   = 'invited' | 'confirmed' | 'completed'
export type AgreementStatus = 'draft' | 'sent' | 'viewed' | 'signed' | 'approved' | 'rejected'
export type DocVisibility  = 'admin_only' | 'staff' | 'participant' | 'all'
export type ItineraryVisibility = 'staff_only' | 'participant' | 'all'
export type ItineraryType  = 'actividad' | 'taller' | 'comida' | 'logistica' | 'libre' | 'privado' | 'traslado'
export type InviteStatus   = 'pending' | 'accepted' | 'expired' | 'cancelled'
export type AgreementType  = 'evento' | 'video' | 'staff' | 'participante' | 'storybook' | 'fotografo' | 'custom'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  slug: string
  nombre: string
  capitulo: string | null
  ciudad: string | null
  pais: string | null
  fecha_inicio: string | null  // ISO date
  fecha_fin: string | null
  ubicacion: string | null
  status: EventStatus
  n_parejas: number | null
  notas_internas: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Family {
  id: string
  event_id: string
  nombre_familia: string | null
  nombre1: string
  email1: string
  user_id1: string | null
  nombre2: string | null
  email2: string | null
  user_id2: string | null
  habitacion: string | null
  notas: string | null
  status: FamilyStatus
  created_at: string
  updated_at: string
}

export interface AgreementArticle {
  heading: string
  body: string
}

export interface AgreementContent {
  intro: string
  articles: AgreementArticle[]
  meta: string
  sigs: { label: string }[]
}

export interface Agreement {
  id: string
  event_id: string
  family_id: string | null
  assigned_to: string | null
  assigned_email: string | null
  type: AgreementType | string
  nombre: string
  contenido: AgreementContent
  status: AgreementStatus
  signed_at: string | null
  signed_ip: string | null
  signed_user_agent: string | null
  approved_at: string | null
  approved_by: string | null
  rejected_at: string | null
  rejected_by: string | null
  notas_admin: string | null
  pdf_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  event_id: string | null
  family_id: string | null
  tipo: string
  nombre: string
  contenido: Record<string, unknown> | null
  visibilidad: DocVisibility
  pdf_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ItineraryItem {
  id: string
  event_id: string
  dia: number
  fecha: string | null
  hora_inicio: string | null  // HH:MM:SS
  hora_fin: string | null
  titulo: string
  descripcion: string | null
  tipo: ItineraryType
  visibilidad: ItineraryVisibility
  ubicacion: string | null
  responsable: string | null
  notas_staff: string | null
  orden: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Invitation {
  id: string
  event_id: string | null
  family_id: string | null
  email: string
  full_name: string | null
  role: UserRole
  status: InviteStatus
  custom_message: string | null
  profile_id: string | null
  sent_at: string
  accepted_at: string | null
  expires_at: string | null
  created_by: string | null
}

// ── Joined / enriched types ──────────────────────────────────
export interface FamilyWithProfiles extends Family {
  profile1?: Profile | null
  profile2?: Profile | null
}

export interface AgreementWithFamily extends Agreement {
  family?: Family | null
  assigned_profile?: Profile | null
}

export interface EventWithStats extends Event {
  families_count?: number
  agreements_signed?: number
  agreements_total?: number
}
