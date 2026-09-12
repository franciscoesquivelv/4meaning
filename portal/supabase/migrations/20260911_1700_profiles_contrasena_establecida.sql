-- ============================================================
-- QUIEN ENTRA POR INVITACIÓN NUNCA PONÍA CONTRASEÑA
-- ============================================================
--
-- Encontrado en vivo por Francisco el 2026-09-11: cerró sesión de su cuenta
-- de prueba y no pudo volver a entrar. Causa real: `inviteUserByEmail` crea
-- la cuenta SIN contraseña. El enlace del correo la deja con una sesión
-- válida, y tanto `/auth/callback` (flujo PKCE) como `CompletarSesion.tsx`
-- (flujo implícito) mandaban a esa sesión derecho al portal, sin pasar por
-- ninguna pantalla que pidiera elegir una. La persona queda adentro, pero
-- sin ninguna forma de volver a entrar el día que la sesión expire o cierre.
--
-- Esta columna es la memoria de "esta cuenta ya tiene una contraseña real
-- puesta por su dueño". Nula significa que todavía no. Los dos flujos de
-- entrada la consultan después de establecer la sesión, y si es nula,
-- mandan a `/nueva-contrasena` en vez de al portal.

alter table public.profiles
  add column if not exists contrasena_establecida_at timestamptz;

comment on column public.profiles.contrasena_establecida_at is
  'Cuándo esta persona puso su propia contraseña por primera vez. Nula si nunca la ha puesto: quien entró solo por un enlace de invitación queda así hasta que pase por /nueva-contrasena.';

-- ── Backfill: SOLO equipo, y por qué no hay más que esto ──────────
--
-- La primera versión de esta migración backfilleaba a partir de
-- `auth.users.encrypted_password is not null and <> ''`, asumiendo que
-- `inviteUserByEmail` deja esa columna vacía hasta que la persona pone su
-- propia contraseña. Verificado en vivo el 2026-09-11, con una consulta
-- de solo lectura contra la base real: FALSO. La cuenta de prueba
-- "prueba2", invitada y jamás pasada por /nueva-contrasena, ya tenía
-- `encrypted_password` con un valor (ni null ni vacío) que nadie conoce.
-- Esa heurística habría marcado como "ya tiene contraseña" a cualquier
-- invitado pendiente, reabriendo exactamente el bug que esta migración
-- existe para cerrar. Hallazgo de Hugo, confirmado con datos reales antes
-- de aplicarse, no después.
--
-- Sin una señal confiable para participantes/individuales, se backfillea
-- SOLO el equipo (admin/staff/super_admin): esas cuentas nunca pasan por
-- `/auth/callback` ni por `CompletarSesion.tsx` (siempre entran por
-- `/login` con email y contraseña directo, `signInWithPassword`), así que
-- el valor de esta columna les es irrelevante en la práctica. Se deja
-- correcto igual, por si algún día algo más lo llega a leer.
--
-- Todo participante/individual existente queda en NULL a propósito. La
-- próxima vez que cualquiera de ellos use un enlace de invitación o de
-- sesión, va a pasar UNA VEZ por /nueva-contrasena, así ya tuviera una
-- contraseña real de antes (por ejemplo, por una recuperación pasada). Es
-- fricción menor y visible, nunca un hueco: la misma dirección segura que
-- ya establece el resto de este fix, aplicada también aquí.
update public.profiles
set contrasena_establecida_at = now()
where role in ('super_admin', 'admin', 'staff')
  and contrasena_establecida_at is null;

-- ── Comprobación ──────────────────────────────────────────
--
-- select role, count(*), count(contrasena_establecida_at) as con_marca
--   from public.profiles group by role;
--
-- Todo el equipo debe salir con con_marca = count(*). Participant/individual
-- deben salir con con_marca = 0: es el estado correcto, no un defecto.
