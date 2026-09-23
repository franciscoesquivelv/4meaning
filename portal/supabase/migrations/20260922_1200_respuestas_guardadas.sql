-- ============================================================
-- LO QUE SE ESCRIBE, CUANDO SE DECIDE GUARDARLO
-- ============================================================
--
-- Hasta hoy, `Escritura.tsx` no guardaba nada en ninguna tabla -- decisión
-- de Francisco del 2026-09-10, correcta para esa fecha: el producto digital
-- ni siquiera existía todavía como algo con secciones distintas. El
-- 2026-09-13 la revisó con el consejo encima y la cambió: un interruptor
-- POR SECCIÓN decide si lo que se escribe ahí se guarda, porque "el cierre
-- reúne el material" y "lo escrito en Finitud vuelve en Gratitud" (ver
-- memoria de proyecto `presente-regalo-digital.md`, decisiones 2, 9 y 11)
-- necesitan que algo sobreviva más allá de la pestaña abierta. Hasta hoy
-- eso nunca se construyó: `Escritura.tsx` seguía con la regla vieja, sin
-- excepción, y su propio texto en pantalla se lo decía a quien escribía.
--
-- ESTA TABLA ES ESE GUARDADO, Y SOLO ESO. No es la infraestructura del test
-- con diagnóstico por categorías que Daniel especificó en su interacción 14
-- (esa es una pieza más grande, con su propia tabla de diagnóstico, y sigue
-- sin construirse a propósito -- no es lo que este cambio pide resolver).
--
-- POR QUÉ SE ANCLA A `block_id` Y NO A UNA CLAVE APARTE DENTRO DEL JSONB.
-- Verificado contra la definición real de `pl_abrir_borrador`
-- (`20260914_1030_hinges_por_version.sql:198-262`): cada vez que se abre un
-- borrador nuevo, TANTO `hinges` COMO `blocks` se copian con ids nuevos
-- (`gen_random_uuid()` por fila). Eso significa que un `block_id` nunca es
-- estable ENTRE versiones -- pero tampoco necesita serlo: una respuesta se
-- escribe mientras alguien lee UNA versión concreta, y la Regla 3 de
-- `pl_puede_ver_version()` ya garantiza que quien empezó a leer no se mueve
-- de versión aunque el equipo publique una nueva mientras tanto. La
-- continuidad que hace falta (leer en Gratitud lo que se escribió en
-- Finitud) ocurre DENTRO de una misma versión, nunca cruzando una
-- republicación, así que `block_id` con `on delete cascade` alcanza: no
-- hace falta inventar una clave estable que sobreviva copias que este
-- caso de uso no necesita atravesar.
--
-- POR QUÉ HAY POLÍTICA DE BORRADO, Y NO ES OPCIONAL. Nota ya escrita en
-- `20260914_1030_hinges_por_version.sql:55-69`: "no existe ninguna política
-- de borrado en todo el proyecto". Condición de Sora, registrada en
-- `presente-regalo-digital.md`: "Nada que guarde sale sin borrado...
-- Prometer borrado sin borrado es la única mentira que este producto no
-- puede permitirse." Esta tabla es la primera vez que ese borrado deja de
-- ser teórico, así que nace con su `for delete` desde la primera línea.

create table if not exists public.responses (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  block_id    uuid not null references public.blocks(id) on delete cascade,
  texto       text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- PREGUNTA DE NEGOCIO ABIERTA, NO ERROR (Hugo, auditoría 2026-09-22): si
  -- la misma persona llegara a tener grant dos veces sobre la misma
  -- experiencia publicada (dos `run_id` de grupo distintos, sin que exista
  -- versión nueva de por medio), el `block_id` sería idéntico entre las
  -- dos y esta restricción fusionaría en silencio las respuestas de una
  -- corrida con las de la otra. Hoy el producto digital individual otorga
  -- grants sin `run_id` (uno por persona por experiencia), así que el caso
  -- no aplica a "El Presente como Regalo" tal como se vende hoy. Si algún
  -- día un producto admite repetir la misma experiencia publicada más de
  -- una vez para la misma persona, esta restricción necesita revisarse
  -- antes, no después.
  unique (profile_id, block_id)
);

comment on table public.responses is
  'Lo que una persona escribió en una consigna marcada para guardarse (Bloque.guarda = true). Ancla a block_id, no sobrevive a un nuevo borrador -- ver comentario de cabecera.';

alter table public.responses enable row level security;

-- LECTURA Y ESCRITURA: solo la propia fila, nunca la de otra persona.
create policy "responses_select_propia" on public.responses
  for select using (profile_id = auth.uid());

-- INSERT/UPDATE verifican además que el bloque sea uno que esta persona
-- puede de verdad LEER hoy -- no solo "tiene algún grant en la
-- experiencia". Hallazgo de Hugo, auditoría del 2026-09-22: una primera
-- versión de este archivo solo exigía `pl_nivel_audiencia(experience_id)
-- > 0`, que es más laxo que la propia política de lectura vigente de
-- `blocks` (`20260914_1030_hinges_por_version.sql:365-372`), la cual
-- exige ADEMÁS `pl_puede_ver_version(version_id)` (nunca un borrador
-- ajeno, nunca una versión retirada sin anclar) y que el peso de
-- audiencia del bloque no supere el nivel de quien pregunta (nunca un
-- bloque `moderador`/`equipo` desde una cuenta `participante`). Sin
-- ambas condiciones, alguien que adivinara un `block_id` de un bloque que
-- ni siquiera puede leer, podría igual escribirle una respuesta -- no es
-- una fuga explotable desde la UI (no hay oráculo que entregue esos ids),
-- pero rompe la doctrina de este proyecto de que el filtro vive en la
-- base, no en la pantalla. Se copia el MISMO predicado que ya usa
-- `blocks` para su propio `select`, en vez de inventar uno más laxo.
create policy "responses_insert_propia_con_grant" on public.responses
  for insert with check (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.blocks bl
      where bl.id = block_id
        and public.pl_puede_ver_version(bl.version_id)
        and public.pl_peso_audiencia(bl.audiencia) <= public.pl_nivel_audiencia(
          (select experience_id from public.experience_versions where id = bl.version_id)
        )
    )
  );

create policy "responses_update_propia_con_grant" on public.responses
  for update using (
    profile_id = auth.uid()
  ) with check (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.blocks bl
      where bl.id = block_id
        and public.pl_puede_ver_version(bl.version_id)
        and public.pl_peso_audiencia(bl.audiencia) <= public.pl_nivel_audiencia(
          (select experience_id from public.experience_versions where id = bl.version_id)
        )
    )
  );

-- BORRADO: la propia fila, sin condición de grant -- si el grant se
-- revocó después de escribir, la persona sigue pudiendo borrar lo suyo.
create policy "responses_delete_propia" on public.responses
  for delete using (profile_id = auth.uid());

create index if not exists responses_profile_idx on public.responses (profile_id);
create index if not exists responses_block_idx on public.responses (block_id);

-- ── Comprobación ────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'responses'
  ) then
    raise exception 'public.responses no quedó creada.';
  end if;

  if (
    select count(*) from pg_policies
    where schemaname = 'public' and tablename = 'responses'
  ) < 4 then
    raise exception 'Faltan políticas RLS en public.responses (se esperan 4: select/insert/update/delete).';
  end if;
end $$;
