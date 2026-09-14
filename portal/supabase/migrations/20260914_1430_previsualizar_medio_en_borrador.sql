-- ============================================================
-- ETAPA 3: EL EQUIPO PUEDE VER SU PROPIO MEDIO EN BORRADOR
-- ============================================================
--
-- ENCONTRADO PROBANDO, NO LEYENDO. Subí una imagen real de prueba al
-- editor, la adjunté a un bloque real de un borrador real, y pedí la URL
-- de lectura autenticado como el mismo staff que la subió: 404.
--
-- La migración de la Etapa 2 (`20260914_1030_hinges_por_version.sql`) ya
-- dejó escrito, a propósito, que `pl_puede_ver_medio` seguiría exigiendo
-- una versión publicada o retirada+anclada, "ni siquiera para el equipo
-- previsualizando un borrador... eso es problema de la Etapa 5, no de
-- esta." Esa decisión estaba bien MIENTRAS nada escribía `media_id` de
-- verdad. Ahora que el editor sube archivos de verdad (esta etapa), la
-- consecuencia es distinta: subir una imagen y ver un cuadro roto en la
-- vista previa, en la primera vez que alguien del equipo prueba subir
-- algo. Eso no es una mejora futura, es el flujo básico de esta etapa sin
-- terminar.
--
-- QUÉ CAMBIA, Y QUÉ NO. `pl_puede_ver_medio` gana una tercera salida,
-- ADEMÁS de publicada y retirada+anclada: publicada, retirada+anclada, O
-- borrador+equipo. Nada más. No se toca `pl_puede_ver_version` (que sigue
-- sin conocer 'borrador' en absoluto): esto es estrictamente sobre medios,
-- y estrictamente sobre quien ya tiene, por otra vía, permiso de gestionar
-- ese borrador.

create or replace function public.pl_puede_ver_medio(m uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.blocks b
    join public.experience_versions v on v.id = b.version_id
    where b.media_id = m
      and (
        public.pl_puede_ver_version(b.version_id)
        or (v.estado = 'borrador' and public.pl_es_equipo())
      )
      and public.pl_peso_audiencia(b.audiencia) <= public.pl_nivel_audiencia(v.experience_id)
  )
$$;

comment on function public.pl_puede_ver_medio(uuid) is
  'Publicada o retirada+anclada: igual que hinges y blocks, vía pl_puede_ver_version. Borrador: solo el equipo, y solo porque ya puede gestionar ese borrador por otra vía (la política "pl equipo gestiona"). La Etapa 5 sigue pendiente para lo que esto NO resuelve: un participante nunca ve un medio de un borrador, publicado o no.';
