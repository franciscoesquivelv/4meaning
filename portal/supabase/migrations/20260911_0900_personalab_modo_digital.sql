-- ============================================================
-- PERSONALAB · EL MODO DIGITAL
--
-- Corre DESPUÉS de 20260813_personalab_contenido.sql y de
-- 20260813_personalab_almacenamiento.sql.
--
-- QUÉ ES ESTO. PersonaLab se diseñó entero alrededor de un moderador que
-- compra una licencia y corre una corrida con su foro dentro de un capítulo.
-- El producto digital lo compra una persona y lo atraviesa sola: no tiene
-- corrida, ni foro, ni capítulo, ni moderador. Esta migración agrega lo que
-- falta para eso y NO toca nada del modo presencial.
--
-- LO QUE NO HACE FALTA AGREGAR, y conviene saberlo antes de leer lo que sigue:
--
--   · El nivel de acceso ya funciona. `pl_nivel_audiencia()` da nivel 1 a
--     cualquier grant vivo, sin mirar la titularidad, así que quien compra
--     solo ve exactamente los bloques de audiencia 'todos' y ninguno de
--     moderador. Ese filtro vive en la RLS de `blocks`, no en la aplicación.
--   · `grants` ya admite un acceso sin corrida: `run_id` es nulable.
--   · Las versiones ya tienen estado publicado, con un índice que garantiza
--     una sola publicada a la vez.
-- ============================================================


-- ── 1. Una palabra para quien compra solo ─────────────────────────────
--
-- `titularidad` era 'moderador' | 'miembro_foro'. Quien compra el producto
-- digital no es miembro de ningún foro. Funcionaría con ese valor, porque el
-- nivel de audiencia no lo mira, pero estaríamos escribiendo una mentira en
-- una columna para siempre. El léxico de esta casa importa: acabamos de
-- contar ocho grupos de vocabulario duplicado en la otra marca.

-- Va suelto y no dentro de un bloque `do`: `add value` tiene reglas propias
-- de transacción, y `if not exists` ya lo hace idempotente por su cuenta.
alter type pl_titularidad add value if not exists 'individual';


-- ── 2. El modo de entrega, en la bisagra ──────────────────────────────
--
-- Una experiencia, dos formas de entregarla, contenidos distintos. Decidido
-- por Francisco el 2026-09-10: el Presente como Regalo digital y el
-- presencial son la misma experiencia y comparten dirección, pero el
-- presencial está armado para que un moderador dé el contenido.
--
-- POR QUÉ NO ALCANZA `soporte`. Ya existe `hinges.soporte` con
-- 'sala' | 'objeto' | 'pantalla', pero eso dice el medio de UNA bisagra, no
-- el modo de entrega de la experiencia. La "Invitación al foro" del
-- presencial también es de pantalla, y no va en el producto digital. Son dos
-- ejes distintos y hacen falta los dos.

do $$ begin
  create type pl_modo as enum ('digital', 'presencial', 'ambos');
exception when duplicate_object then null; end $$;

-- El valor por defecto es 'presencial' A PROPÓSITO, y es la decisión
-- importante de esta línea. Todo lo que existe hoy se escribió para una sala
-- con moderador. Si alguien agrega una bisagra y olvida marcar el modo, el
-- error que queremos es que FALTE en el producto digital, no que aparezca
-- contenido presencial delante de alguien que compró solo. Falla cerrado.
alter table public.hinges
  add column if not exists modo pl_modo not null default 'presencial';

comment on column public.hinges.modo is
  'En qué entrega aparece esta bisagra. Por defecto presencial: falla cerrado, una bisagra sin marcar no llega al producto digital.';

create index if not exists hinges_modo_idx
  on public.hinges (experience_id, modo, tiempo, orden);


-- ── 3. Audio ──────────────────────────────────────────────────────────
--
-- Había once tipos de bloque y ninguno era audio. El producto digital es
-- pregrabado y el audio es la mitad de lo que se entrega.

alter type pl_tipo_bloque add value if not exists 'audio';

-- Y HAY QUE ARREGLAR LA RESTRICCIÓN, o el tipo nuevo nace roto.
--
-- `blocks_contenido_por_tipo` valida qué exige cada tipo, y termina en un
-- `else` que pide texto. Un bloque de audio caería en ese `else` y la base lo
-- rechazaría por no traer texto, que es justo lo que un audio no trae. Audio
-- se comporta como video: o tiene un medio subido, o tiene una URL.
--
-- Nota de método: la comparación va como `tipo::text` y no como literal del
-- enum. Postgres no deja usar un valor de enum recién agregado dentro de la
-- misma transacción que lo agregó, y con el cast se compara texto contra
-- texto, así que esta migración corre de una sola pasada.

alter table public.blocks drop constraint if exists blocks_contenido_por_tipo;
alter table public.blocks add constraint blocks_contenido_por_tipo check (
  case
    when tipo::text = 'pausa'   then true
    when tipo::text = 'cita'    then coalesce(contenido->>'texto','') <> ''
    when tipo::text = 'objeto'  then coalesce(contenido->>'texto','') <> ''
    when tipo::text = 'archivo' then media_id is not null
    when tipo::text = 'imagen'  then media_id is not null
    when tipo::text in ('video','audio')
      then media_id is not null or coalesce(contenido->>'url','') <> ''
    else coalesce(contenido->>'texto','') <> ''
  end
);


-- ── 4. Dónde se quedó ─────────────────────────────────────────────────
--
-- NO ES UNA BARRA DE AVANCE, Y ESO NO ES UN DETALLE. El léxico vinculante
-- del Consejo #002 prohíbe por nombre los campos `progress`,
-- `completion_pct`, `score`, `streak`, `badge`, `rank` y `quiz`. Aquí no hay
-- porcentaje, ni racha, ni nada que se pueda pintar como un termómetro.
--
-- Lo único que guarda es cuál fue la última bisagra que la persona abrió, y
-- cuándo, para poder recibirla de vuelta donde la dejó. Una fila por persona
-- y experiencia, que se pisa a sí misma.
--
-- No guarda NADA de lo que la persona escribe: eso vive en su sesión y se va
-- cuando cierra. Decisión de Francisco del 2026-09-10.

create table if not exists public.bookmarks (
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  experience_id uuid not null references public.experiences(id) on delete cascade,
  hinge_id      uuid not null references public.hinges(id) on delete cascade,
  visto_at      timestamptz not null default now(),
  primary key (profile_id, experience_id)
);

comment on table public.bookmarks is
  'La última bisagra que abrió cada persona, para recibirla donde la dejó. No es progreso: no hay porcentaje ni racha, y está prohibido agregarlos.';

alter table public.bookmarks enable row level security;

-- Cada quien ve y escribe el suyo, y nada más. El equipo no lo lee: saber
-- por dónde va alguien en una experiencia íntima no le hace falta a nadie
-- para operar, y pedirlo sería recolección sin uso.
create policy "cada quien ve su marcador" on public.bookmarks
  for select using (profile_id = auth.uid());

create policy "cada quien mueve su marcador" on public.bookmarks
  for insert with check (profile_id = auth.uid());

create policy "cada quien actualiza su marcador" on public.bookmarks
  for update using (profile_id = auth.uid())
          with check (profile_id = auth.uid());


-- ── 5. La compra que existe antes que la cuenta ───────────────────────
--
-- ESTE ES EL RIESGO PRINCIPAL DEL PRODUCTO, escrito como tabla.
--
-- El recorrido decidido es: la persona paga en el landing de 4meaning.life,
-- le llega un correo, y ENTONCES crea sus credenciales en el portal. O sea
-- que entre el pago y la cuenta hay una ventana donde existe un cobro y no
-- existe ningún usuario a quien darle acceso. Si esa ventana se pierde, la
-- persona pagó y no tiene nada, que es la peor falla posible aquí.
--
-- Por eso la compra se guarda por su cuenta, identificada por CORREO, y no
-- caduca nunca. Lo que caduca es el enlace del correo, que se puede volver a
-- mandar. La compra, no.

create table if not exists public.purchases (
  id             uuid primary key default gen_random_uuid(),
  experience_id  uuid not null references public.experiences(id),
  email          text not null,

  -- Lo que dijo la pasarela, tal cual, para poder conciliar después.
  proveedor      text not null,
  referencia     text not null,
  monto_centavos int  not null check (monto_centavos >= 0),
  moneda         text not null,
  pagado_at      timestamptz not null,

  -- El puente hacia la cuenta, cuando ocurra.
  canjeado_at    timestamptz,
  profile_id     uuid references public.profiles(id),
  grant_id       uuid references public.grants(id),

  created_at     timestamptz not null default now(),

  -- IDEMPOTENCIA DEL WEBHOOK. Las pasarelas reintentan: Stripe reenvía un
  -- evento hasta tres días si no recibe 200. Sin esta restricción, cada
  -- reintento crearía otra compra y otro correo. Con ella, el segundo
  -- intento choca y el manejador lo trata como ya procesado.
  unique (proveedor, referencia)
);

comment on table public.purchases is
  'Un pago hecho, identificado por correo, que sobrevive hasta que alguien cree su cuenta y se convierta en grant. No caduca nunca: lo que caduca es el enlace del correo.';

-- Buscar por correo es la operación del canje, y buscar las no canjeadas es
-- la de soporte: quién pagó y todavía no entró.
create index if not exists purchases_email_idx
  on public.purchases (lower(email));
create index if not exists purchases_pendientes_idx
  on public.purchases (pagado_at) where canjeado_at is null;

alter table public.purchases enable row level security;

-- SIN POLÍTICA DE LECTURA PARA NADIE MÁS QUE EL EQUIPO, y a propósito.
-- Esta tabla lleva el correo de alguien y lo que pagó, antes de que exista
-- cuenta. El canje lo hace una ruta del servidor con la llave de servicio,
-- que salta RLS, así que no hace falta abrirle nada al cliente. Lo que no se
-- abre no se puede filtrar.
create policy "pl equipo gestiona compras" on public.purchases
  for all using (public.is_staff()) with check (public.is_staff());


-- ── 6. Cómo se verifica que esto quedó ────────────────────────────────
--
--   select column_name from information_schema.columns
--    where table_schema='public' and table_name='hinges' and column_name='modo';
--
--   select unnest(enum_range(null::pl_titularidad));   -- debe incluir individual
--   select unnest(enum_range(null::pl_tipo_bloque));   -- debe incluir audio
--
--   select table_name from information_schema.tables
--    where table_schema='public' and table_name in ('bookmarks','purchases');
