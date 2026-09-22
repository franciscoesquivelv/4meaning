-- ============================================================
-- "FORO" SE LLAMA "GRUPO", TAMBIÉN EN LA BASE
-- ============================================================
--
-- Continuación de H-006 (docs/PENDIENTES.md): capítulo→grupo,
-- corrida→encuentro ya se hicieron en código. "Foro" es la misma palabra
-- para el mismo referente -- el propio dominio.ts ya lo decía: "foro
-- (el grupo que el moderador convoca)" -- así que no es una palabra
-- nueva, es terminar de fundir dos etiquetas en una. Decisión de Nora,
-- 2026-09-21.
--
-- POR QUÉ ESTO SÍ SE MUEVE HOY, Y `pl_estado_corrida` NO. Daniel lo
-- verificó él mismo antes de responder: un ENUM se aplaza porque sus
-- VALORES son strings comparados en muchos sitios dispersos (cada
-- comparación es un sitio que puede fallar en silencio si el valor
-- cambia sin que el sitio se entere). Un NOMBRE DE COLUMNA es distinto:
-- nada fuera de la costura de lectura/escritura lo compara jamás, así
-- que renombrarlo es un cambio de un solo punto. Verificado, no
-- asumido: cero políticas RLS, cero vistas, cero funciones, cero CHECK,
-- cero índices dependen de estos dos nombres.
--
-- LO QUE ESTO NO TOCA, A PROPÓSITO: `pl_titularidad.miembro_foro` es un
-- valor de enum, no un nombre de columna -- tiene la misma forma que
-- `pl_estado_corrida` y se aplaza con la misma razón. Queda registrado
-- aparte (docs/PENDIENTES.md).

alter table public.experiences
  rename column abre_espacio_al_foro to abre_espacio_al_grupo;

alter table public.runs
  rename column personas_en_el_foro to personas_en_el_grupo;

comment on column public.experiences.abre_espacio_al_grupo is
  'Si esta experiencia admite abrir acceso individual además del acceso del moderador. Antes "abre_espacio_al_foro".';

comment on column public.runs.personas_en_el_grupo is
  'Cuántas personas hay en el grupo de este encuentro. Antes "personas_en_el_foro".';

-- ── Comprobación ────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'experiences'
      and column_name = 'abre_espacio_al_grupo'
  ) then
    raise exception 'experiences.abre_espacio_al_grupo no quedó creada.';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'runs'
      and column_name = 'personas_en_el_grupo'
  ) then
    raise exception 'runs.personas_en_el_grupo no quedó creada.';
  end if;
end $$;
