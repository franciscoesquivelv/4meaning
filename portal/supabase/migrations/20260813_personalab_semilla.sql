-- ============================================================
-- PERSONALAB · Semilla del catálogo
-- Corre DESPUÉS de 20260813_personalab_contenido.sql
-- ============================================================
--
-- Siembra las cuatro experiencias del catálogo y los cinco capítulos, con
-- el contenido real de El Presente como Regalo, que es la única experiencia
-- con bisagras diseñadas y con abre_espacio_al_foro en true.
--
-- NO siembra moderadores, corridas ni accesos: esos necesitan filas reales
-- de auth.users. Al final del archivo hay una plantilla para crearlos con
-- los ids de personas que existan de verdad.
--
-- Idempotente: usa slug como clave natural y hace on conflict do nothing.

-- ── Experiencias ────────────────────────────────────────────

insert into public.experiences (slug, nombre, subtitulo, narrativa, duracion, maduracion, abre_espacio_al_foro, nota_diseno)
values
  ('presente-regalo', 'El Presente como Regalo', null, null,
   'Media jornada', 'lista', true, null),

  ('metamorfosis', 'Metamorfosis y Metanoia', 'Cerrando círculos',
   'No estás roto, estás mudando.',
   'Un día completo', 'piloto', false,
   'Sobre-desarrollada en lo conceptual, sub-desarrollada en lo vivencial. El retorno está entero sin diseñar.'),

  ('nido-vacio', 'El Nido Vacío', null, null,
   'Por definir', 'diseno', true,
   'Su unidad de participación está sin resolver: el capítulo base es individual pero admite variante en pareja, y eso rompe el modelo.'),

  ('proposito-vida', 'Propósito de Vida', null, null,
   'Por definir', 'diseno', false,
   'Se vende en la landing y no tiene diseño detrás. Es el hueco más urgente del catálogo.')
on conflict (slug) do nothing;

-- ── Versiones ───────────────────────────────────────────────

insert into public.experience_versions (experience_id, numero, estado, publicada_at)
select e.id, 1, 'publicada', now()
from public.experiences e
where e.slug = 'presente-regalo'
on conflict (experience_id, numero) do nothing;

insert into public.experience_versions (experience_id, numero, estado)
select e.id, 1, 'borrador'
from public.experiences e
where e.slug = 'metamorfosis'
on conflict (experience_id, numero) do nothing;

-- ── Bisagras ────────────────────────────────────────────────

insert into public.hinges (experience_id, tiempo, orden, titulo, descripcion, soporte, duracion, listo)
select e.id, v.tiempo::pl_tiempo, v.orden, v.titulo, v.descripcion, v.soporte::pl_soporte, v.duracion, v.listo
from public.experiences e
cross join (values
  ('vispera',  1, 'Invitación al foro',   'Convocatoria breve, una semana antes.',                 'pantalla', null,     true),
  ('ignicion', 1, 'El inventario del hoy','Qué hay de valioso en el presente que no se está mirando.','sala',   '60 min', true),
  ('ignicion', 2, 'La carta al futuro',   'Escrita a mano. No se sube ni se transcribe.',           'objeto',  '45 min', true),
  ('retorno',  1, 'Capa mensual',         'Un solo puntero al mes, nunca una racha.',               'pantalla', null,    true),
  ('retorno',  2, 'Entrega de la carta',  'La carta vuelve a su autor a los seis meses. Se recibe, no se descarga.', 'objeto', null, true)
) as v(tiempo, orden, titulo, descripcion, soporte, duracion, listo)
where e.slug = 'presente-regalo'
  and not exists (
    select 1 from public.hinges h
    where h.experience_id = e.id and h.tiempo = v.tiempo::pl_tiempo and h.orden = v.orden
  );

insert into public.hinges (experience_id, tiempo, orden, titulo, descripcion, soporte, duracion, requiere, listo)
select e.id, v.tiempo::pl_tiempo, v.orden, v.titulo, v.descripcion, v.soporte::pl_soporte, v.duracion, v.requiere, v.listo
from public.experiences e
cross join (values
  ('vispera',  1, 'La carta de convocatoria', 'Lo que reciben los miembros del foro dos semanas antes.', 'pantalla', null,      array['Lista del foro'], true),
  ('vispera',  2, 'Lo que hay que traer',     'Un objeto propio que represente algo que no termina de cerrarse.', 'objeto', null, '{}'::text[], true),
  ('vispera',  3, 'Preparación de sala',      'Checklist de materiales y disposición del espacio.', 'pantalla', null,           '{}'::text[], false),
  ('ignicion', 1, 'Muda',                     'Reconocer qué ya no sirve.',                        'sala',     '90 min',        array['Objeto de cada participante','Círculo de sillas'], true),
  ('ignicion', 2, 'Crisálida',                'El tiempo intermedio. No se puede acelerar.',       'sala',     '120 min',       '{}'::text[], false),
  ('ignicion', 3, 'Eclosión',                 'Lo que emerge. Se nombra en voz alta.',             'sala',     '75 min',        '{}'::text[], false),
  ('ignicion', 4, 'Vuelo',                    'Ritual de cierre.',                                 'objeto',   '45 min',        array['Velas','Libreta de cada participante'], true),
  ('retorno',  1, 'El gesto mínimo',          'Lo que cada quien se comprometió a hacer, en su frase.', 'pantalla', null,       '{}'::text[], false),
  ('retorno',  2, 'Capa mensual',             'Un solo puntero al mes.',                           'pantalla', null,            '{}'::text[], false),
  ('retorno',  3, 'Cierre a seis meses',      'Ver la raíz completa. El testimonio lo entrega una persona.', 'sala', null,      '{}'::text[], false)
) as v(tiempo, orden, titulo, descripcion, soporte, duracion, requiere, listo)
where e.slug = 'metamorfosis'
  and not exists (
    select 1 from public.hinges h
    where h.experience_id = e.id and h.tiempo = v.tiempo::pl_tiempo and h.orden = v.orden
  );

-- ── Bloques de El Presente como Regalo ──────────────────────
-- Contenido real, no relleno.

insert into public.blocks (version_id, hinge_id, orden, tipo, audiencia, contenido)
select ver.id, h.id, b.orden, b.tipo::pl_tipo_bloque, b.audiencia::pl_audiencia, b.contenido::jsonb
from public.experiences e
join public.experience_versions ver on ver.experience_id = e.id and ver.numero = 1
join public.hinges h on h.experience_id = e.id
cross join (values
  ('vispera',  1, 1, 'texto', 'todos',
   '{"texto":"Dentro de una semana vamos a sentarnos juntos una tarde. No hace falta que prepares nada, ni que leas nada antes. Solo que vengas.\n\nLo único que te pedimos es que llegues sin prisa."}'),
  ('vispera',  1, 2, 'cita', 'todos',
   '{"texto":"La vida no es lo que uno vivió, sino la que uno recuerda, y cómo la recuerda para contarla.","autor":"Gabriel García Márquez"}'),
  ('vispera',  1, 3, 'nota', 'moderador',
   '{"texto":"Manda esta carta siete días antes, no antes. Con dos semanas la gente la lee y la olvida. Con tres días se siente apurada."}'),

  ('ignicion', 1, 1, 'texto', 'todos',
   '{"texto":"Casi todo lo que valoramos de nuestra vida lo vamos a valorar **después**. Cuando ya no esté, o cuando cambie."}'),
  ('ignicion', 1, 2, 'consigna', 'todos',
   '{"texto":"Escribe cinco cosas que hoy forman parte de tu vida y que dentro de diez años ya no van a estar igual."}'),
  ('ignicion', 1, 3, 'gesto', 'todos',
   '{"texto":"A mano, en tu libreta. Nadie va a leer esto, ni ahora ni después."}'),
  ('ignicion', 1, 4, 'pausa', 'todos', '{}'),
  ('ignicion', 1, 5, 'nota', 'moderador',
   '{"texto":"Da doce minutos reales. La gente termina en cuatro y se queda mirando la hoja. Los ocho que sobran son donde aparece lo bueno. No rescates el silencio."}'),

  ('ignicion', 2, 1, 'texto', 'todos',
   '{"texto":"Vas a escribirle a la persona que vas a ser dentro de seis meses.\n\nNo es una carta de propósitos. No le pidas nada. Cuéntale cómo está tu vida hoy, con lo que tenga de bueno y de difícil."}'),
  ('ignicion', 2, 2, 'objeto', 'todos',
   '{"texto":"Papel y sobre","pie":"Escribe a mano y cierra el sobre tú mismo. Nadie más lo va a tocar."}'),
  ('ignicion', 2, 3, 'aviso', 'todos',
   '{"texto":"Esta carta no se digitaliza, no se fotografía y no se comparte. La guardamos cerrada y te la devolvemos cerrada."}'),
  ('ignicion', 2, 4, 'nota', 'moderador',
   '{"texto":"Ten sobres de sobra. Siempre alguien arruina el primero. Y no pongas música: el silencio de cuarenta personas escribiendo es parte del ejercicio."}'),

  ('retorno',  1, 1, 'texto', 'todos',
   '{"texto":"Una vez al mes te vamos a escribir. Una sola vez, y siempre lo mismo: una pregunta corta.\n\nNo hay que responder. No llevamos la cuenta de quién responde."}'),
  ('retorno',  1, 2, 'nota', 'moderador',
   '{"texto":"Techo duro: un envío al mes. Si alguien propone un recordatorio extra, la respuesta es no. Un segundo mensaje convierte la invitación en deuda."}'),

  ('retorno',  2, 1, 'texto', 'todos',
   '{"texto":"Han pasado seis meses. La carta que escribiste vuelve hoy."}'),
  ('retorno',  2, 2, 'pausa', 'todos', '{}'),
  ('retorno',  2, 3, 'texto', 'todos',
   '{"texto":"Ábrela cuando estés solo y con tiempo. No la leas en el estacionamiento ni entre dos reuniones."}'),
  ('retorno',  2, 4, 'objeto', 'todos',
   '{"texto":"Tu sobre","pie":"Se recibe en la mano, de una persona. No se descarga."}'),
  ('retorno',  2, 5, 'nota', 'moderador',
   '{"texto":"Entrégalas una por una, diciendo el nombre en voz alta. No las dejes en una mesa para que cada quien recoja la suya. El acto de entregar es la mitad del ejercicio."}')
) as b(tiempo, hinge_orden, orden, tipo, audiencia, contenido)
where e.slug = 'presente-regalo'
  and h.tiempo = b.tiempo::pl_tiempo
  and h.orden = b.hinge_orden
  and not exists (
    select 1 from public.blocks x
    where x.version_id = ver.id and x.hinge_id = h.id and x.orden = b.orden
  );

-- ── Kit ─────────────────────────────────────────────────────

insert into public.kit_pieces (experience_id, columna, nombre, detalle, por_persona, disponible)
select e.id, k.columna::pl_columna_kit, k.nombre, k.detalle, k.por_persona, k.disponible
from public.experiences e
cross join (values
  ('presente-regalo', 'objeto',         'Papel y sobre lacrado',            'Para la carta al futuro.',        true,  true),
  ('presente-regalo', 'humano',         'Formación del moderador',          'Una sesión presencial.',          false, true),
  ('presente-regalo', 'administrativo', 'Guion del moderador',              'Versión 2.0.',                    false, true),
  ('presente-regalo', 'administrativo', 'Calendario de entrega de cartas',  'Cuándo vuelve cada carta.',       false, true),
  ('metamorfosis',    'objeto',         'Libreta de la muda',               'Cosida a mano. Se escribe a mano, no se transcribe.', true, true),
  ('metamorfosis',    'objeto',         'Vela de cierre',                   'Para el ritual de Vuelo.',        true,  true),
  ('metamorfosis',    'objeto',         'Caja de la crisálida',             'Sin definir. Depende del diseño de la bisagra, que falta.', true, false),
  ('metamorfosis',    'humano',         'Formación del moderador',          'Dos sesiones presenciales. No existe versión en video ni la va a haber.', false, true),
  ('metamorfosis',    'humano',         'Acompañamiento de la primera corrida', 'Alguien de 4 Meaning en la sala la primera vez.', false, true),
  ('metamorfosis',    'administrativo', 'Guion del moderador',              'Versión 1.2.',                    false, true),
  ('metamorfosis',    'administrativo', 'Inventario de objetos por capítulo','Qué tiene cada capítulo y qué reponer.', false, false),
  ('metamorfosis',    'administrativo', 'Licencia del capítulo',            'Vigencia y alcance.',             false, false)
) as k(slug, columna, nombre, detalle, por_persona, disponible)
where e.slug = k.slug
  and not exists (
    select 1 from public.kit_pieces x where x.experience_id = e.id and x.nombre = k.nombre
  );

-- ── Capítulos ───────────────────────────────────────────────

insert into public.chapters (nombre, ciudad, pais)
select v.nombre, v.ciudad, v.pais
from (values
  ('Foro Anáhuac',          'Ciudad de México', 'México'),
  ('Foro Monterrey Norte',  'Monterrey',        'México'),
  ('Foro Guadalajara',      'Guadalajara',      'México'),
  ('Foro San Salvador',     'San Salvador',     'El Salvador'),
  ('Foro Bogotá',           'Bogotá',           'Colombia')
) as v(nombre, ciudad, pais)
where not exists (select 1 from public.chapters c where c.nombre = v.nombre);

-- ============================================================
-- PLANTILLA: moderadores, corridas y accesos
-- ============================================================
-- Estos necesitan filas reales de auth.users, así que van comentados.
-- Sustituye el correo y descomenta.
--
-- -- 1. Vincular una persona real como moderadora de un capítulo
-- insert into public.chapter_moderators (chapter_id, profile_id)
-- select c.id, p.id
-- from public.chapters c, public.profiles p
-- where c.nombre = 'Foro Anáhuac' and p.email = 'moderador@ejemplo.mx';
--
-- -- 2. Registrar su formación. Sin esto no puede conducir la experiencia.
-- insert into public.moderator_training (profile_id, experience_id)
-- select p.id, e.id
-- from public.profiles p, public.experiences e
-- where p.email = 'moderador@ejemplo.mx' and e.slug = 'presente-regalo';
--
-- -- 3. Crear la corrida
-- insert into public.runs (experience_id, version_id, chapter_id, moderador_id, fecha, estado, personas_en_el_foro)
-- select e.id, v.id, c.id, p.id, '2026-09-19', 'confirmada', 9
-- from public.experiences e
-- join public.experience_versions v on v.experience_id = e.id and v.estado = 'publicada'
-- , public.chapters c, public.profiles p
-- where e.slug = 'presente-regalo' and c.nombre = 'Foro Anáhuac' and p.email = 'moderador@ejemplo.mx';
--
-- -- 4. Otorgarle el acceso. Esta es la pieza que le abre la experiencia.
-- insert into public.grants (profile_id, experience_id, run_id, titularidad, otorgado_por)
-- select p.id, r.experience_id, r.id, 'moderador', auth.uid()
-- from public.profiles p, public.runs r
-- where p.email = 'moderador@ejemplo.mx' and r.moderador_id = p.id;
