-- ============================================================
-- PRUEBA DE UN SOLO USO · pl_abrir_borrador() copia bisagras de verdad
-- ============================================================
--
-- CORRE ESTO UNA VEZ, INMEDIATAMENTE DESPUÉS DE APLICAR
-- `20260914_1030_hinges_por_version.sql`, ANTES DE CONFIAR EN LA MIGRACIÓN.
--
-- POR QUÉ EXISTE. La pieza central de esa migración es un
-- `WITH mapa AS MATERIALIZED (...)` donde un CTE de escritura,
-- `bisagras_copiadas` (el INSERT a `hinges`), NO es referenciado por
-- nombre en el INSERT final a `blocks` (que lee `mapa` directo). Daniel,
-- auditando la migración, señaló con honestidad que su entendimiento es
-- que Postgres ejecuta un CTE de escritura hasta el final SIEMPRE, esté o
-- no referenciado río abajo — así lo documenta Postgres desde la versión
-- 12 — pero no lo verificó ejecutándolo, porque no hay entorno para eso en
-- esta sesión. Esta prueba cierra esa duda con datos reales, sin dejar
-- rastro: todo corre dentro de una transacción que termina en ROLLBACK.
--
-- QUÉ PRUEBA, EN CONCRETO: que llamar a `pl_abrir_borrador` sobre una
-- experiencia real con bisagras reales de verdad INSERTA esas bisagras
-- copiadas en `hinges`, con la misma cuenta que las bisagras originales.
-- Si el CTE `bisagras_copiadas` no corriera por no estar referenciado, este
-- conteo daría 0 y lo vas a ver de inmediato.
--
-- CERO RIESGO: `rollback` al final deshace el borrador entero, incluidas
-- las bisagras y bloques que se copiaron. La base queda exactamente como
-- estaba. No hace falta limpieza manual después.

begin;

do $$
declare
  v_exp uuid;
  v_super uuid;
  v_originales int;
  v_nuevo uuid;
  v_copiadas int;
  v_bloques_originales int;
  v_bloques_copiados int;
begin
  select id into v_exp from public.experiences where slug = 'presente-regalo';
  if v_exp is null then
    raise exception 'No encontré la experiencia presente-regalo. Ajusta el slug antes de correr esto.';
  end if;

  -- pl_abrir_borrador exige pl_es_equipo(). El editor SQL no corre como
  -- nadie en particular, así que hay que decirle a la base quién es quien
  -- pregunta. Mismo truco que ya usa verificar-almacenamiento.sql.
  select id into v_super from public.profiles where role = 'super_admin' limit 1;
  if v_super is null then
    raise exception 'No encontré ningún profiles.role = super_admin. Sin eso no se puede probar pl_abrir_borrador aquí.';
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_super)::text, true);

  select count(*) into v_originales
  from public.hinges h
  join public.experience_versions v on v.id = h.version_id
  where v.experience_id = v_exp and v.estado = 'publicada';

  select count(*) into v_bloques_originales
  from public.blocks b
  join public.experience_versions v on v.id = b.version_id
  where v.experience_id = v_exp and v.estado = 'publicada';

  if v_originales = 0 then
    raise exception 'La versión publicada de presente-regalo no tiene bisagras. No hay nada que copiar para probar.';
  end if;

  -- La llamada real, tal como la usaría el editor.
  v_nuevo := public.pl_abrir_borrador(v_exp);

  select count(*) into v_copiadas from public.hinges where version_id = v_nuevo;
  select count(*) into v_bloques_copiados from public.blocks where version_id = v_nuevo;

  raise notice '── Bisagras: % en la publicada, % copiadas al borrador.', v_originales, v_copiadas;
  raise notice '── Bloques:  % en la publicada, % copiados al borrador.', v_bloques_originales, v_bloques_copiados;

  if v_copiadas = v_originales and v_bloques_copiados = v_bloques_originales then
    raise notice '✅ El CTE bisagras_copiadas SÍ corre completo aunque nada lo referencie río abajo. La migración es segura.';
  else
    raise exception '❌ LAS CUENTAS NO CUADRAN. bisagras_copiadas: % vs %, bloques: % vs %. NO apliques esta migración en producción sin investigar primero.',
      v_originales, v_copiadas, v_bloques_originales, v_bloques_copiados;
  end if;
end $$;

-- Deshace TODO lo de arriba: el borrador, sus bisagras copiadas y sus
-- bloques copiados. La base queda exactamente como estaba antes de correr
-- este archivo.
rollback;
