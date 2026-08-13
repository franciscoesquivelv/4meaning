-- ============================================================
-- Las guardas de las RPC fallaban ABIERTAS
-- ============================================================
--
-- EL DEFECTO. is_staff() está definida así en el esquema:
--
--   select my_role() in ('super_admin','admin','staff')
--
-- Sin sesión, my_role() devuelve NULL, y `NULL in (...)` NO es falso: es
-- NULL. Así que is_staff() devuelve NULL, no false.
--
-- En una política de RLS eso es inofensivo: un USING nulo se trata como
-- falso y la fila no se ve. Falla CERRADO.
--
-- Pero en PL/pgSQL, `if not NULL then raise ... end if` no entra en la
-- rama, porque la condición es NULL y NULL no es true. La guarda se saltaba
-- entera. Falla ABIERTO.
--
-- Lo encontró la prueba 9 de verificar-almacenamiento: pl_publicar_version
-- dejó publicar sin sesión.
--
-- LA CORRECCIÓN: coalesce a false. Y de paso las funciones dejan de
-- depender de la forma exacta de is_staff(), que vive en otro archivo y
-- podría cambiar.

-- ── Helper que nunca devuelve NULL ──────────────────────────

create or replace function public.pl_es_equipo()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.is_staff(), false)
$$;

-- ── Abrir borrador ──────────────────────────────────────────

create or replace function public.pl_abrir_borrador(exp uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_origen uuid;
  v_nuevo  uuid;
  v_numero int;
begin
  if not public.pl_es_equipo() then
    raise exception 'Solo el equipo puede abrir un borrador.' using errcode = '42501';
  end if;

  select id into v_nuevo
  from public.experience_versions
  where experience_id = exp and estado = 'borrador'
  limit 1;
  if v_nuevo is not null then
    return v_nuevo;
  end if;

  select id into v_origen
  from public.experience_versions
  where experience_id = exp and estado = 'publicada'
  limit 1;

  select coalesce(max(numero), 0) + 1 into v_numero
  from public.experience_versions
  where experience_id = exp;

  insert into public.experience_versions (experience_id, numero, estado)
  values (exp, v_numero, 'borrador')
  returning id into v_nuevo;

  if v_origen is not null then
    insert into public.blocks (version_id, hinge_id, orden, tipo, audiencia, contenido, media_id)
    select v_nuevo, b.hinge_id, b.orden, b.tipo, b.audiencia, b.contenido, b.media_id
    from public.blocks b
    where b.version_id = v_origen;
  end if;

  return v_nuevo;
end;
$$;

-- ── Publicar versión ────────────────────────────────────────

create or replace function public.pl_publicar_version(ver uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exp uuid;
  v_estado pl_estado_version;
  v_vacios int;
begin
  if not public.pl_es_equipo() then
    raise exception 'Solo el equipo puede publicar.' using errcode = '42501';
  end if;

  select experience_id, estado into v_exp, v_estado
  from public.experience_versions where id = ver;

  if v_exp is null then
    raise exception 'Esa versión no existe.' using errcode = '42704';
  end if;
  if v_estado <> 'borrador' then
    raise exception 'Solo se publica un borrador. Esta versión está en %.', v_estado
      using errcode = '22023';
  end if;

  -- Última línea: la compuerta de la aplicación se puede saltar llamando
  -- esta RPC directo desde la consola del navegador.
  select count(*) into v_vacios
  from public.hinges h
  where h.experience_id = v_exp
    and exists (select 1 from public.blocks b where b.hinge_id = h.id and b.version_id = ver)
    and not exists (
      select 1 from public.blocks b
      where b.hinge_id = h.id and b.version_id = ver and b.audiencia = 'todos'
    );

  if v_vacios > 0 then
    -- Código propio, NO el P0001 por defecto: así quien llame puede
    -- distinguir este rechazo de cualquier otra excepción.
    raise exception
      '% bisagra(s) quedarían en blanco para el participante: todos sus bloques son solo de moderador.', v_vacios
      using errcode = '22023';
  end if;

  update public.experience_versions
    set estado = 'retirada'
    where experience_id = v_exp and estado = 'publicada';

  update public.experience_versions
    set estado = 'publicada', publicada_at = now(), publicada_por = auth.uid()
    where id = ver;
end;
$$;

-- ── Registrar descarga ──────────────────────────────────────

create or replace function public.pl_registrar_descarga(m uuid, ip_txt text, ua text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not coalesce(public.pl_puede_ver_medio(m), false) then
    raise exception 'Sin acceso a ese archivo.' using errcode = '42501';
  end if;
  insert into public.media_descargas (media_id, profile_id, ip, user_agent)
  values (m, auth.uid(), ip_txt, ua);
end;
$$;

-- ── Verificación ────────────────────────────────────────────
-- Sin sesión, is_staff() es NULL y pl_es_equipo() tiene que ser false.

do $$
begin
  if public.pl_es_equipo() is null then
    raise exception 'pl_es_equipo devolvió NULL. La corrección no sirvió.';
  end if;
end $$;
