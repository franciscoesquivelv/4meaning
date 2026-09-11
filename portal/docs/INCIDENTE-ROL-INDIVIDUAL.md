# El rol "individual" no existe para la base de datos

> Documento de incidente. Se escribe ANTES de corregir. La corrección entra
> estructurada dentro de la Etapa 2 del frente de registro de PersonaLab, no
> como parche suelto encima de lo que ya existe.

## Por qué existe este documento

El 11 de septiembre se agregó un cuarto rol de cuenta, `individual`, para el
cliente que compra una experiencia digital de PersonaLab por su cuenta. Se
usó en tres lugares: el selector de rol en `Usuarios → Nuevo`, la función
`inicioDe()` que decide a dónde entra cada quien, y la ruta que crea cuentas,
`/api/admin/invite`.

**La base de datos nunca lo aceptó.** `profiles.role` tiene esta restricción,
escrita en `supabase/schema.sql:12-13`:

```sql
role text not null default 'participant'
  check (role in ('super_admin','admin','staff','participant'))
```

`individual` no está en esa lista. Se amplió la restricción equivocada:
`grants.titularidad` (columna distinta, en `20260911_personalab_modo_digital.sql`),
y se dio por hecho que con eso bastaba. No bastaba.

## Qué pasa exactamente cuando se dispara

En `app/api/admin/invite/route.ts`, la escritura del rol:

```ts
await service.from('profiles').upsert({ id: userId, email, full_name, role }, { onConflict: 'id' })
await service.from('profiles').update({ full_name, role }).eq('id', userId)
```

Ninguna de las dos líneas revisa `error`. Si alguien elige "Cliente PersonaLab"
en el formulario:

1. La base rechaza el `upsert`/`update` por violar la restricción.
2. El código no se entera, porque no mira el error.
3. La ruta responde `{ ok: true }` de todos modos.
4. El perfil queda con el rol que ya tenía, o con el valor por defecto de la
   columna, `'participant'`.
5. Esa persona entra al portal tratada como participante de Trascendencia, no
   como cliente de PersonaLab.

Es el mismo patrón que ya se encontró y corrigió dos veces esta semana en
otras pantallas: un fallo que se disfraza de éxito porque nadie mira el
`error` que Supabase sí devuelve.

## Alcance real

No hay ningún cliente afectado todavía. La restricción de la base impide que
exista una sola fila con `role = 'individual'`: el error es del tipo que se
detiene solo, no del tipo que corrompe datos en silencio y los deja ahí.
Tampoco hay evidencia de que alguien haya intentado crear una cuenta así: el
mismo día se encontró que el enlace a `Usuarios` desaparece de la barra
mientras se está dentro de PersonaLab, así que es probable que nadie haya
llegado siquiera al formulario.

## Lo que la corrección tiene que cubrir, en la Etapa 2

No es solo agregar `'individual'` a la lista de la restricción. Eso resuelve
el síntoma. La causa es más amplia y se decide con estructura, no a las
carreras:

1. **Ampliar la restricción de `profiles.role`.** Requiere una migración,
   aprobada como cambio de estructura.
2. **Que ninguna escritura a `profiles` deje pasar un error sin mirarlo.**
   No es solo esta ruta: es una regla para todo el archivo, y probablemente
   para cualquier escritura de rol en el portal.
3. **Decidir qué pasa cuando SÍ falla.** Hoy la ruta no tiene ninguna forma de
   decirle al staff "no se pudo, inténtalo de nuevo" cuando algo de esto
   truena. Con este flujo apuntando a convertirse en el camino de respaldo
   manual (Etapa 7 del protocolo), tiene que fallar de forma visible.

## Ampliación del 2026-09-11 (auditoría de Hugo y Leo, Etapa 3)

El alcance era más grande de lo que este documento decía. Dos hallazgos que
cambian la prioridad:

**Leo: el respaldo manual está roto HOY, no solo en el flujo nuevo.**
`app/(admin)/usuarios/nuevo/page.tsx` con rol "Cliente PersonaLab" pasa por
la misma escritura defectuosa. Mientras no se corrija, `/usuarios/nuevo` no
es un respaldo operable: es una ilusión de respaldo, porque responde éxito
igual. Esto sube la urgencia de este incidente: no es solo un bloqueo del
diseño de la Etapa 2, es un defecto activo en la única vía manual que existe
ahora mismo.

**Hugo: ampliar `profiles.role` NO basta. Hay dos listas más que rechazan
`individual` a nivel de aplicación**, verificadas:

```
app/(admin)/usuarios/actions.ts:5
const ROLES_VALIDOS = ['super_admin', 'admin', 'staff', 'participant'] as const
```
```
app/(admin)/usuarios/EditRoleSelect.tsx:19
const ROLES = ['super_admin', 'admin', 'staff', 'participant'] as const
```

`ROLES_VALIDOS` guarda `updateUserRole`, el server action detrás del
selector estándar de edición de rol en `/usuarios`. Aunque la migración de
`profiles.role` corra, un super admin **sigue sin poder** asignar
`individual` desde esa pantalla: la única puerta seguiría siendo
`/usuarios/nuevo`. Las tres correcciones (la restricción de la base y las
dos listas de aplicación) tienen que aplicarse juntas, o el incidente queda
resuelto a medias sin que se note.

Se cierra este documento cuando la Etapa 4 entregue las tres correcciones
juntas, verificadas contra código real.
