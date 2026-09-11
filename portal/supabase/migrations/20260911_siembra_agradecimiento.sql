-- ============================================================
-- SIEMBRA · El Agradecimiento, modo digital
--
-- GENERADA, NO ESCRITA A MANO, desde `app/(admin)/personalab/dominio.ts` y
-- `contenido.ts`, que es donde vive hoy el texto que escribieron Patricia y
-- el consejo. El generador está en el scratchpad de la sesión.
--
-- QUÉ SIEMBRA: la experiencia, una versión publicada, sus 12 bisagras marcadas
-- como `modo = 'digital'`, y sus bloques de contenido.
--
-- POR QUÉ EL AGRADECIMIENTO Y NO EL PRESENTE COMO REGALO. El contenido del
-- Presente como Regalo digital (finitud, gratitud, silencio, perdón) todavía
-- no está escrito, y no me toca inventarlo. El Agradecimiento sí está escrito
-- entero, va a ser producto digital propio, y sirve para ver la interfaz con
-- texto real y de largo real en vez de con relleno.
--
-- IDEMPOTENTE: los UUID son deterministas y todo va con `on conflict`. Se
-- puede correr dos veces sin duplicar nada.
-- ============================================================

insert into public.experiences (id, slug, nombre, subtitulo, narrativa, duracion, maduracion, abre_espacio_al_foro, nota_diseno)
values ('c4804225-39f2-5df5-8533-aa84d048d2a5', 'agradecimiento', 'El Agradecimiento', 'Un día de siembra y seis meses de raíz', 'Nadie se dio a sí mismo la existencia. Este día no busca que salgas agradecido para siempre, sino que salgas con una historia tuya y con ganas de volver a ella.', 'Un día, más seis meses de retorno', 'piloto', true, 'El día siembra la virtud, no la completa. Y nada se fuerza: la autenticidad es condición, no adorno. Forzar el agradecimiento en alguien que llega en su peor día hace daño en vez de bien, y por eso cada bisagra honda lleva su salida.')
on conflict (id) do update set
  nombre = excluded.nombre, subtitulo = excluded.subtitulo, duracion = excluded.duracion;

insert into public.experience_versions (id, experience_id, numero, estado, notas, publicada_at)
values ('98cde38b-d08a-5cdf-9bba-e475a60b5548', 'c4804225-39f2-5df5-8533-aa84d048d2a5', 1, 'publicada', 'Siembra inicial desde el prototipo.', now())
on conflict (id) do update set estado = 'publicada';


-- ── Bisagras ──────────────────────────────────────────────
insert into public.hinges (id, experience_id, tiempo, orden, titulo, descripcion, soporte, duracion, requiere, listo, modo)
values ('5f4ec7dd-08a5-5e26-aab5-5b8c22988ef7', 'c4804225-39f2-5df5-8533-aa84d048d2a5', 'vispera', 1, 'La carta de convocatoria', 'Lo que recibe el foro dos semanas antes. Fija el tono y quita la tarea.', 'pantalla', null, '{}'::text[], true, 'digital')
on conflict (id) do update set titulo = excluded.titulo, orden = excluded.orden, modo = 'digital';
insert into public.hinges (id, experience_id, tiempo, orden, titulo, descripcion, soporte, duracion, requiere, listo, modo)
values ('5f208faa-5e5a-5c98-8edc-46e64a53a5c5', 'c4804225-39f2-5df5-8533-aa84d048d2a5', 'vispera', 2, 'La noche de antes', 'Un solo mensaje, corto, la víspera. No pide nada.', 'pantalla', null, '{}'::text[], true, 'digital')
on conflict (id) do update set titulo = excluded.titulo, orden = excluded.orden, modo = 'digital';
insert into public.hinges (id, experience_id, tiempo, orden, titulo, descripcion, soporte, duracion, requiere, listo, modo)
values ('17621baa-cc51-5e4f-880a-edfc8308abee', 'c4804225-39f2-5df5-8533-aa84d048d2a5', 'ignicion', 3, 'Bajar el ritmo', 'Salir del modo agenda y volver a notar. Termina arriba, sin haber bajado.', 'sala', '40 min', array['Sillas en círculo','Nada sobre las mesas']::text[], true, 'digital')
on conflict (id) do update set titulo = excluded.titulo, orden = excluded.orden, modo = 'digital';
insert into public.hinges (id, experience_id, tiempo, orden, titulo, descripcion, soporte, duracion, requiere, listo, modo)
values ('0cbfc7f2-a3f1-5ddb-abe6-581b65d06fa0', 'c4804225-39f2-5df5-8533-aa84d048d2a5', 'ignicion', 4, 'Alguien te sostuvo', 'Un momento concreto, con detalle. No una idea general de gratitud.', 'sala', '50 min', array['Libreta del ancla','Lápiz por persona']::text[], true, 'digital')
on conflict (id) do update set titulo = excluded.titulo, orden = excluded.orden, modo = 'digital';
insert into public.hinges (id, experience_id, tiempo, orden, titulo, descripcion, soporte, duracion, requiere, listo, modo)
values ('06a6f425-b304-5617-96be-2d73a52fbed4', 'c4804225-39f2-5df5-8533-aa84d048d2a5', 'ignicion', 5, 'La grieta', 'Donde puede aparecer emoción real. Lleva salida, y la salida se dice antes.', 'sala', '45 min', array['Pañuelos, discretos','Agua']::text[], true, 'digital')
on conflict (id) do update set titulo = excluded.titulo, orden = excluded.orden, modo = 'digital';
insert into public.hinges (id, experience_id, tiempo, orden, titulo, descripcion, soporte, duracion, requiere, listo, modo)
values ('f48e4b55-c162-5a74-a9e6-c2f899ef8329', 'c4804225-39f2-5df5-8533-aa84d048d2a5', 'ignicion', 6, 'Tu historia', 'Dificultad, ayuda recibida, quién soy por eso. Cierra lo que la grieta abrió.', 'sala', '55 min', array['Libreta del ancla']::text[], true, 'digital')
on conflict (id) do update set titulo = excluded.titulo, orden = excluded.orden, modo = 'digital';
insert into public.hinges (id, experience_id, tiempo, orden, titulo, descripcion, soporte, duracion, requiere, listo, modo)
values ('c1e6ff7e-d9ce-56c0-bb1b-c815c2040f39', 'c4804225-39f2-5df5-8533-aa84d048d2a5', 'ignicion', 7, 'Decirlo en voz alta', 'Primero de dos en dos, donde todos hablan. Después el círculo, y ahí ya es voluntario.', 'sala', '60 min', array['Parejas armadas de antemano','Espacio para separarlas, aunque sea en dos salas','Círculo cerrado para la segunda mitad','Reloj a la vista del moderador, no del foro']::text[], true, 'digital')
on conflict (id) do update set titulo = excluded.titulo, orden = excluded.orden, modo = 'digital';
insert into public.hinges (id, experience_id, tiempo, orden, titulo, descripcion, soporte, duracion, requiere, listo, modo)
values ('d2eea781-1421-57c4-b986-e50a22dfa80d', 'c4804225-39f2-5df5-8533-aa84d048d2a5', 'ignicion', 8, 'La llave', 'Sellar el ancla, elegir el ritmo y ensayar el gesto una vez, ahí mismo.', 'objeto', '25 min', array['Libreta del ancla','Los ritmos escritos donde todos los vean']::text[], true, 'digital')
on conflict (id) do update set titulo = excluded.titulo, orden = excluded.orden, modo = 'digital';
insert into public.hinges (id, experience_id, tiempo, orden, titulo, descripcion, soporte, duracion, requiere, listo, modo)
values ('71fbaddd-a66d-50eb-a1e2-76cb6e098285', 'c4804225-39f2-5df5-8533-aa84d048d2a5', 'ignicion', 9, 'Lo que vas a devolver', 'La voluntad de retribuir, sin exigir el acto ni ponerle fecha.', 'sala', '20 min', '{}'::text[], true, 'digital')
on conflict (id) do update set titulo = excluded.titulo, orden = excluded.orden, modo = 'digital';
insert into public.hinges (id, experience_id, tiempo, orden, titulo, descripcion, soporte, duracion, requiere, listo, modo)
values ('e6894c71-2c6d-50a8-a58c-6cde19ef4d42', 'c4804225-39f2-5df5-8533-aa84d048d2a5', 'retorno', 10, 'El gesto de cada semana', 'Abrir en el ancla, quedarse quieto, escribir la rama, cerrar viendo la raíz.', 'pantalla', null, '{}'::text[], true, 'digital')
on conflict (id) do update set titulo = excluded.titulo, orden = excluded.orden, modo = 'digital';
insert into public.hinges (id, experience_id, tiempo, orden, titulo, descripcion, soporte, duracion, requiere, listo, modo)
values ('33e4a9c1-c4b6-5c26-8478-c68964414fdb', 'c4804225-39f2-5df5-8533-aa84d048d2a5', 'retorno', 11, 'La capa del mes', 'Mismo gesto, otra función: no se añade, se contempla lo añadido.', 'pantalla', null, '{}'::text[], true, 'digital')
on conflict (id) do update set titulo = excluded.titulo, orden = excluded.orden, modo = 'digital';
insert into public.hinges (id, experience_id, tiempo, orden, titulo, descripcion, soporte, duracion, requiere, listo, modo)
values ('34475a93-9fe1-5f04-8154-7ce444da1663', 'c4804225-39f2-5df5-8533-aa84d048d2a5', 'retorno', 12, 'Recibir el libro', 'A los seis meses. No se descarga: se recibe, en persona y con una palabra.', 'objeto', null, '{}'::text[], false, 'digital')
on conflict (id) do update set titulo = excluded.titulo, orden = excluded.orden, modo = 'digital';

-- ── Bloques ───────────────────────────────────────────────
-- Omitidos a propósito, 3: exigen un archivo subido que el prototipo
-- no tiene, y los tres son de audiencia 'moderador', así que no salen en el
-- producto digital. Entran cuando exista el medio de verdad:
--   g25  video  bisagra ag5
--   g46  archivo  bisagra ag8
--   g61  imagen  bisagra ag12
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('65ad5436-32c6-58fc-a9ec-73e6446a02d5', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '5f4ec7dd-08a5-5e26-aab5-5b8c22988ef7', 1, 'texto', 'todos', '{"texto":"En dos semanas vamos a pasar un día juntos, y va a ser sobre el agradecimiento.\n\nNo hace falta que prepares nada. No hay lectura previa, no hay que traer una lista, y no vamos a pedirte que te pongas de pie a decir por qué estás agradecido."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('41eba5b7-5186-530a-bb85-480419a9cd62', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '5f4ec7dd-08a5-5e26-aab5-5b8c22988ef7', 2, 'texto', 'todos', '{"texto":"## Lo que sí vamos a hacer\n\nVamos a buscar **un momento**. Uno solo, concreto, en el que alguien te sostuvo. No una idea general de que la vida es buena, sino una tarde, una persona, algo que pasó de verdad.\n\nDe ahí sale una historia que es tuya, y esa historia se queda contigo mucho después del día."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('6c7b3631-92a9-5165-a8c2-8fc87ec38aed', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '5f4ec7dd-08a5-5e26-aab5-5b8c22988ef7', 3, 'aviso', 'todos', '{"texto":"Si llegas en un mal momento, ven igual. No vamos a pedirte que finjas que estás bien, y en ningún ejercicio es obligatorio hablar."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('a8990026-9ed4-5fac-9f49-00aaebc5bef5', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '5f4ec7dd-08a5-5e26-aab5-5b8c22988ef7', 4, 'nota', 'moderador', '{"texto":"Manda esta carta catorce días antes, no antes. Si se manda con un mes, se olvida; con una semana, la gente ya se comprometió a otra cosa.\n\nSi alguien te contesta preguntando qué tiene que llevar, responde solo \"nada\". Cualquier tarea previa arranca el día con deuda, y el día se sostiene sobre lo contrario."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('9e286dda-959b-52af-86ca-5371bb5fa9b6', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '5f208faa-5e5a-5c98-8edc-46e64a53a5c5', 1, 'texto', 'todos', '{"texto":"Mañana nos vemos.\n\nLlega sin prisa, y si puedes, deja libre lo que viene después. Vas a salir con algo que no vas a querer meter entre dos pendientes."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('791b4c38-0d27-5287-b9ed-56e9bd2e4794', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '5f208faa-5e5a-5c98-8edc-46e64a53a5c5', 2, 'pausa', 'todos', '{}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('ac2b9a50-8aa9-5cb1-ba58-6f77398aa162', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '5f208faa-5e5a-5c98-8edc-46e64a53a5c5', 3, 'texto', 'todos', '{"texto":"Nada más. Duerme."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('ceaa0ad9-a36c-5c3e-88d5-aa6a3d58716c', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '5f208faa-5e5a-5c98-8edc-46e64a53a5c5', 4, 'nota', 'moderador', '{"texto":"Este mensaje es corto a propósito y no debe crecer. La tentación de agregarle logística, hora y dirección es fuerte: mándala aparte. Este mensaje solo baja el ritmo."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('35b6f4a3-a157-5a34-b19b-b450db01cb41', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '17621baa-cc51-5e4f-880a-edfc8308abee', 1, 'texto', 'todos', '{"texto":"Llevas semanas resolviendo cosas. Eso no está mal, pero tiene un costo: cuando uno vive resolviendo, deja de notar.\n\nLo que tenemos alrededor se vuelve paisaje. Sigue ahí, y deja de verse."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('3792e24f-21da-531e-bd78-6fd3778921d9', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '17621baa-cc51-5e4f-880a-edfc8308abee', 2, 'consigna', 'todos', '{"texto":"Nombra tres cosas de esta semana que estuvieron bien y que no notaste mientras pasaban. Pequeñas. Que no sean logros."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('82deac89-9d20-566b-a418-0911c5122a64', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '17621baa-cc51-5e4f-880a-edfc8308abee', 3, 'pausa', 'todos', '{}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('6b9be461-bd8a-5854-900e-aaaf57a183dd', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '17621baa-cc51-5e4f-880a-edfc8308abee', 4, 'nota', 'moderador', '{"texto":"Este tracto termina ARRIBA. Es cálido y no baja. Si alguien se adelanta y trae algo hondo, agradécelo y guárdalo: \"eso vamos a trabajarlo en un rato, no lo sueltes\". Bajar aquí desordena todo el día.\n\nInsiste en que sean cosas pequeñas. Cuando alguien dice \"mi familia\", pide el momento: qué día, qué pasó."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('e647a302-d111-5b98-87ec-020292812967', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '17621baa-cc51-5e4f-880a-edfc8308abee', 5, 'nota', 'moderador', '{"texto":"Al terminar va un descanso ligero, incluso social. Es el único del día donde está bien que la gente hable de otra cosa."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('0100ebcb-12be-574e-bfe5-0749e5b36d44', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '0cbfc7f2-a3f1-5ddb-abe6-581b65d06fa0', 1, 'texto', 'todos', '{"texto":"Nadie se dio a sí mismo la existencia. Todo lo que somos, empezando por estar aquí, lo recibimos de alguien.\n\nEso suena a frase. Deja de sonar a frase cuando le pones un nombre y una fecha."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('16a87fe3-9945-5738-a6cd-16f6ee24d8a5', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '0cbfc7f2-a3f1-5ddb-abe6-581b65d06fa0', 2, 'cita', 'todos', '{"texto":"La comunión de las conciencias es el hecho primitivo.","autor":"Maurice Nédoncelle"}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('1a3f50d4-25d3-5768-bfd3-4cc59f71cf85', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '0cbfc7f2-a3f1-5ddb-abe6-581b65d06fa0', 3, 'consigna', 'todos', '{"texto":"Busca un momento en que alguien te sostuvo: te ayudó, te cuidó, o simplemente estuvo cuando no podías solo. Uno. Con fecha, con lugar y con cara."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('b2942b66-1f06-5e0d-b3e6-7cabc7b29b69', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '0cbfc7f2-a3f1-5ddb-abe6-581b65d06fa0', 4, 'gesto', 'todos', '{"texto":"Escríbelo a mano en la primera página. Todavía no la historia completa: solo el momento, tal como te llega."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('49d7d568-5023-5757-a719-0ab3d8153a1b', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '0cbfc7f2-a3f1-5ddb-abe6-581b65d06fa0', 5, 'nota', 'moderador', '{"texto":"Va a haber alguien que no tenga un rostro claro. Hay quien agradece a la vida, o a algo que recibió sin saber de quién. No lo corrijas y no le pidas que encuentre una persona: lo que se pide es concreción, no destinatario.\n\nLo que sí pides siempre es el detalle. Un episodio real deja huella; un concepto no."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('37e3ea9d-3ea7-5565-882b-e8ff565fc211', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '06a6f425-b304-5617-96be-2d73a52fbed4', 1, 'aviso', 'todos', '{"texto":"Aquí puede aparecer emoción, y puede no aparecer. Las dos cosas están bien. Si en algún momento quieres parar, paras, y no tienes que explicar por qué."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('2bef25b3-554c-57cc-a0d7-b9cbeef632c0', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '06a6f425-b304-5617-96be-2d73a52fbed4', 2, 'texto', 'todos', '{"texto":"Vuelve al momento que escribiste. No a lo que significa. Al momento.\n\nDónde estabas. Qué hora era. Qué te dijo esa persona, con sus palabras. Qué habrías hecho si no hubiera estado."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('abaa1c0c-098f-54a2-963d-78a30a65c53f', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '06a6f425-b304-5617-96be-2d73a52fbed4', 3, 'consigna', 'todos', '{"texto":"Quédate ahí un momento, sin escribir. Solo mirándolo."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('f7f82748-75c1-59d8-8b57-6dc26ac03260', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '06a6f425-b304-5617-96be-2d73a52fbed4', 4, 'pausa', 'todos', '{}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('d16ac42a-5357-546a-a342-a7d1e3092189', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '06a6f425-b304-5617-96be-2d73a52fbed4', 5, 'nota', 'moderador', '{"texto":"ESTA ES LA BISAGRA DELICADA DEL DÍA. Tres reglas.\n\nUno: el permiso de parar se dice EN VOZ, antes de empezar, no se deja en letra chica. Y se dice sin dramatismo, como quien menciona dónde está la salida.\n\nDos: si alguien llora, no lo consueles ni lo señales. Sostén el silencio. Consolar rápido comunica que la emoción es un problema que hay que apagar.\n\nTres: tú no eres terapeuta y esto no es terapia. Si alguien abre algo que claramente te queda grande, no lo trabajes en la sala. Acompáñalo al descanso, y ahí le pasas el puntero de apoyo."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('d717e2ae-e771-5784-af89-e83c8b9cb4fb', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '06a6f425-b304-5617-96be-2d73a52fbed4', 6, 'nota', 'moderador', '{"texto":"NO cortes aquí. La siguiente bisagra va pegada a esta, sin descanso en medio. La grieta abre y la historia contiene lo que se abrió; si mandas al foro a un café en este punto, la gente sale cruda y no vuelve igual."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('fa9ecf48-f08e-53e6-8a35-0503e444dd6d', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'f48e4b55-c162-5a74-a9e6-c2f899ef8329', 1, 'texto', 'todos', '{"texto":"Lo que acabas de mirar todavía no es una historia. Es un recuerdo suelto, y los recuerdos sueltos se pierden.\n\nUna historia tiene tres partes: **qué era difícil**, **quién apareció**, y **quién eres tú por eso**."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('3b96de70-4c1d-5502-8e13-9622d1e7a119', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'f48e4b55-c162-5a74-a9e6-c2f899ef8329', 2, 'texto', 'todos', '{"texto":"La segunda parte es donde casi todos se equivocan, y es la que más pesa.\n\nNo escribas lo que esa persona **hizo por ti**. Escribe **cómo es ella**. Qué la llevó a aparecer. Qué tuvo que poner de su parte. Qué dice de ella que estuviera ahí.\n\nLa diferencia parece pequeña y no lo es. Contar el favor te deja a ti en el centro. Contar a la persona la pone a ella."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('f1153d5e-5676-52e5-98f0-0498b7b9a1d1', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'f48e4b55-c162-5a74-a9e6-c2f899ef8329', 3, 'consigna', 'todos', '{"texto":"Escribe tu historia con esas tres partes, y en la segunda habla de quién es esa persona, no de lo que te dio. Que quepa en una página. No la hagas bonita."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('1ca61a51-d376-582b-8f61-fe2305c6901d', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'f48e4b55-c162-5a74-a9e6-c2f899ef8329', 4, 'gesto', 'todos', '{"texto":"A mano, en la libreta. Esta es la que se va a quedar seis meses contigo, así que escríbela como hablas."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('5cb58f91-0390-57d6-98b2-81c45ec570bd', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'f48e4b55-c162-5a74-a9e6-c2f899ef8329', 5, 'nota', 'moderador', '{"texto":"LA SEGUNDA PARTE ES LA QUE HAY QUE VIGILAR. Que hable de la persona, no del favor. Esa instrucción es la que tiene la mejor evidencia de toda la experiencia: en trescientas setenta conversaciones grabadas, lo que hizo que el otro se sintiera visto y querido fue que le dijeran quién era, no lo que había hecho por ellos.\n\nY tiene un segundo efecto: hablar de la persona en vez del favor baja la sensación de deuda, que es el riesgo del cierre del día."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('7ca0d5a7-ac8e-5050-90f1-15387ec39ce0', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'f48e4b55-c162-5a74-a9e6-c2f899ef8329', 6, 'nota', 'moderador', '{"texto":"La tercera parte, \"quién soy por eso\", es la que casi todos se saltan. Pásate por las mesas y pregúntala uno por uno.\n\nY vigila la tentación de la moraleja. Si alguien escribe \"aprendí a valorar lo que tengo\", devuélvelo al hecho: qué cambió en ti, en concreto, después de aquello."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('ec532925-5085-5858-b34b-8c326e8b8b31', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'f48e4b55-c162-5a74-a9e6-c2f899ef8329', 7, 'nota', 'moderador', '{"texto":"Aquí sí va descanso, y es distinto al primero: silencio, sin prisa, sin música. No es un coffee break. Dilo antes de soltarlos, o la sala se llena de conversación y se pierde lo que se acaba de abrir."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('b77ce432-e9af-518b-bbec-8b466fd321e3', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'c1e6ff7e-d9ce-56c0-bb1b-c815c2040f39', 1, 'texto', 'todos', '{"texto":"Hasta aquí trabajaste solo, y eso no fue el calentamiento. Era la condición.\n\nUno no puede entregar lo que todavía no tiene. Ahora que la historia es tuya, se puede decir."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('fc563ced-2098-51a7-ae43-f2717092f72e', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'c1e6ff7e-d9ce-56c0-bb1b-c815c2040f39', 2, 'consigna', 'todos', '{"texto":"De dos en dos. Lee tu historia completa a una sola persona, y después escucha la suya. Sin explicarla antes ni justificarla después."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('a7aceddc-4171-565c-a6b3-ffe97bc90063', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'c1e6ff7e-d9ce-56c0-bb1b-c815c2040f39', 3, 'aviso', 'todos', '{"texto":"Nadie comenta la historia de nadie. No se aconseja, no se compara y no se responde con una propia. Se escucha, y ya."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('7d0d3e90-fb2e-5b23-b6de-5d9e59b5f3ef', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'c1e6ff7e-d9ce-56c0-bb1b-c815c2040f39', 4, 'pausa', 'todos', '{}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('03b22ea9-e0c1-5c0b-adef-57b05f91a69b', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'c1e6ff7e-d9ce-56c0-bb1b-c815c2040f39', 5, 'texto', 'todos', '{"texto":"Ahora el círculo completo, y aquí ya nadie tiene que leer.\n\nQuien quiera decir algo, dice algo. Puede ser su historia entera, o una línea, o el nombre de la persona que apareció en ella."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('31472d18-2f6f-55aa-afbd-7953fadabb8e', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'c1e6ff7e-d9ce-56c0-bb1b-c815c2040f39', 6, 'nota', 'moderador', '{"texto":"POR QUÉ PRIMERO DE DOS EN DOS Y NO EN CÍRCULO. Cuando se comparó, la conversación uno a uno produjo más conexión y más apoyo percibido que decirlo en público. El plenario no gana nada medible y sí trae un riesgo: quien escucha diez historias hermosas sin tener una a la altura puede salir peor de como entró.\n\nLa pareja resuelve las dos cosas. Todos hablan, todos son escuchados, y nadie se compara contra diez."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('4216280f-852d-5a50-9be3-7b40eebc6d91', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'c1e6ff7e-d9ce-56c0-bb1b-c815c2040f39', 7, 'nota', 'moderador', '{"texto":"Arma tú las parejas, no las dejes al azar de quién se sienta con quién. Y separa a los que llegaron juntos: con un conocido de años se cuenta la versión que ya conoce."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('322ea3d9-13ef-5c17-8801-f5d600ef7868', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'c1e6ff7e-d9ce-56c0-bb1b-c815c2040f39', 8, 'nota', 'moderador', '{"texto":"EN EL CÍRCULO, el riesgo es que se vuelva competencia: quién agradece mejor, quién se quiebra más. La regla de no comentar hay que sostenerla desde el primer turno; si dejas pasar un aplauso, ya no la recuperas.\n\nEmpieza tú, con algo tuyo de verdad y corto. El largo del primer turno fija el largo de todos.\n\nY el círculo es voluntario de verdad. Si hablan cuatro de doce, estuvo bien. Que no hable nadie también es un resultado, no un fracaso tuyo."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('5e816f94-c078-5c11-92ef-518218b26c8e', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'd2eea781-1421-57c4-b986-e50a22dfa80d', 1, 'objeto', 'todos', '{"texto":"Tu libreta","pie":"La primera página ya no se toca. Lo que sigue son las páginas de después."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('942952df-7bfb-5399-89e4-64b227a8e1dd', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'd2eea781-1421-57c4-b986-e50a22dfa80d', 2, 'texto', 'todos', '{"texto":"Esa página es tu ancla. Durante los próximos seis meses vas a volver a ella, y no vas a escribir encima: vas a escribir después.\n\nLa raíz no cambia. Lo que crece son las ramas."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('1e7f73bc-5f7c-5a94-b8da-74ff26adeafc', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'd2eea781-1421-57c4-b986-e50a22dfa80d', 3, 'consigna', 'todos', '{"texto":"Elige tu ritmo, ahora: una vez por semana o dos. Y elige el día. Escríbelo en la segunda página."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('e8ef84e6-f9c3-5a5b-9741-fe8b1dab2109', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'd2eea781-1421-57c4-b986-e50a22dfa80d', 4, 'gesto', 'todos', '{"texto":"Ensáyalo una vez, aquí, con todos: abre en la página del ancla, quédate en silencio, ciérrala. Sin escribir nada todavía."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('2efe0e07-0eaf-52cb-9992-4e4350772b7e', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'd2eea781-1421-57c4-b986-e50a22dfa80d', 5, 'nota', 'moderador', '{"texto":"El ritmo se elige AQUÍ, contigo delante, no después en frío. Y el ensayo se hace de verdad, aunque se sienta raro hacer un simulacro de algo tan pequeño: es lo que convierte el gesto en reflejo.\n\nAntes de cerrar el día, confirma con los ojos que cada quien tiene su ancla sellada y su ritmo escrito. Eso se ve, no se asume."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('39cf842e-c12a-516d-9e0d-4e09e168e330', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '71fbaddd-a66d-50eb-a1e2-76cb6e098285', 1, 'cita', 'todos', '{"texto":"Nadie puede dar lo que no ha recibido.","autor":"Tomás de Aquino"}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('4849186a-601f-5981-adc1-011fc09f10f7', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '71fbaddd-a66d-50eb-a1e2-76cb6e098285', 2, 'aviso', 'todos', '{"texto":"Si en algún momento de hoy sentiste que quedaste debiendo algo, eso es normal y no significa que debas nada. Un regalo que se convierte en factura deja de ser regalo, y lo que recibiste fue un regalo."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('a8305d52-f1a3-58e9-b8d4-0dcf24b43a3f', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '71fbaddd-a66d-50eb-a1e2-76cb6e098285', 3, 'texto', 'todos', '{"texto":"No hay nada que saldar. Esa persona no te prestó: te dio.\n\nLo que sí pasa, cuando uno se sabe sostenido, es que le nacen ganas de sostener. No es una obligación que te queda. Es algo que te sale."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('9090eefb-454e-59a7-ad34-7c0319591ae7', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '71fbaddd-a66d-50eb-a1e2-76cb6e098285', 4, 'consigna', 'todos', '{"texto":"Si te nace un nombre, quédatelo. Si no te nace ninguno, también está bien: hoy no es el día de decidir eso."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('8cd57f84-ca0c-5129-89c0-f0461ca5131f', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '71fbaddd-a66d-50eb-a1e2-76cb6e098285', 5, 'nota', 'moderador', '{"texto":"ESTA ES LA BISAGRA DE MAYOR RIESGO DEL DÍA, y no es la que parece. En el estudio más grande que existe, con diez mil personas en treinta y cuatro países, las prácticas de agradecimiento SUBEN la sensación de estar endeudado. Es el único efecto adverso que se mide al alza de forma consistente, y este es el momento donde aparece.\n\nPor eso el aviso de arriba va antes que nada, y por eso la consigna admite quedarse sin nombre. Alguien que sale con la sensación de deber un favor sale peor de como entró."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('f9d8415b-52f8-55e7-ab39-6adcf7783f30', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '71fbaddd-a66d-50eb-a1e2-76cb6e098285', 6, 'nota', 'moderador', '{"texto":"LO QUE NO SE HACE AQUÍ: no pidas que lo digan en voz alta, no armes una ronda de compromisos, no preguntes \"¿y qué vas a hacer con esto?\", y no pongas fechas.\n\nTomás distingue la deuda legal, que se exige, de la deuda moral, que obliga desde dentro. Todo lo de esa lista convierte la segunda en la primera.\n\nCierra con la palabra de cierre, la que se transmite en la formación. Es la que tiene que rimar con la de los seis meses."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('9988016e-06cb-5589-9939-f4821b9bea99', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'e6894c71-2c6d-50a8-a58c-6cde19ef4d42', 1, 'texto', 'todos', '{"texto":"Siempre igual, para que se vuelva reflejo.\n\nAbres en la página del ancla, nunca en blanco. Te quedas quieto un momento. Escribes la rama de esta semana. Y cierras viendo la raíz completa otra vez, no la rama sola."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('910676e5-c833-5bba-a8b3-764dac31a4cb', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'e6894c71-2c6d-50a8-a58c-6cde19ef4d42', 2, 'consigna', 'todos', '{"texto":"Esta semana, la lente es: alguien que te sostuvo sin que se lo pidieras."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('90547682-24c4-5de4-9af5-32dd4bab302a', '98cde38b-d08a-5cdf-9bba-e475a60b5548', 'e6894c71-2c6d-50a8-a58c-6cde19ef4d42', 3, 'aviso', 'todos', '{"texto":"Si se pone pesado, salta directo al cierre sin terminar la rama. Eso cuenta como un retorno completo. Parar también es haber terminado."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('3da73893-dad4-5766-840f-49ee48180a96', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '33e4a9c1-c4b6-5c26-8478-c68964414fdb', 1, 'texto', 'todos', '{"texto":"Este mes no vas a añadir. Vas a mirar lo que añadiste.\n\nRelee las ramas de las últimas cuatro semanas, completas, antes de escribir nada."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('4b5bb431-3474-5b7a-8496-0f948d6e39e2', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '33e4a9c1-c4b6-5c26-8478-c68964414fdb', 2, 'consigna', 'todos', '{"texto":"Escribe una sola línea sobre lo que notas al leerlas juntas. No una rama nueva: lo que se repite."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('5a0f88a6-f323-5874-9c8f-62776e87f0dc', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '34475a93-9fe1-5f04-8154-7ce444da1663', 1, 'objeto', 'todos', '{"texto":"Tu libro","pie":"Veinticuatro semanas encuadernadas. Se recibe en la mano."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('87d792f0-53d7-5e7d-94ea-e129e713fa7a', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '34475a93-9fe1-5f04-8154-7ce444da1663', 2, 'texto', 'todos', '{"texto":"Empezó con una página y una persona que te sostuvo.\n\nEsto es lo que creció encima."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;
insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values ('6457848d-55fa-516c-a830-369ebffded96', '98cde38b-d08a-5cdf-9bba-e475a60b5548', '34475a93-9fe1-5f04-8154-7ce444da1663', 3, 'nota', 'moderador', '{"texto":"El libro no se manda y no se descarga: se entrega, uno por uno, diciendo el nombre. Convoca al foro para esto aunque hayan pasado seis meses y cueste juntarlos.\n\nLa palabra de cierre retoma la del día cero. Quien no la recuerde, que no improvise: pídesela a quien lo formó."}'::jsonb)
on conflict (id) do update set contenido = excluded.contenido, orden = excluded.orden;

-- ── Comprobación ──────────────────────────────────────────
--
--   select h.titulo, count(b.id) as bloques
--     from public.hinges h
--     left join public.blocks b on b.hinge_id = h.id
--    where h.experience_id = 'c4804225-39f2-5df5-8533-aa84d048d2a5'
--    group by h.titulo, h.orden order by h.orden;
--
-- Debe devolver 12 filas y 58 bloques en total.
generado: 12 bisagras, 58 bloques

-- ── Cómo probar el camino del COMPRADOR ───────────────────────────────
--
-- Ojo: si entras con tu cuenta de super_admin vas a ver todo sin comprar
-- nada, porque `pl_nivel_audiencia()` le da nivel 3 al equipo. Eso prueba que
-- la pantalla dibuja, no que el acceso funcione.
--
-- Para probar de verdad hace falta una cuenta que NO sea del equipo y un
-- acceso vivo. Con el correo de esa cuenta:
--
--   insert into public.grants (profile_id, experience_id, titularidad, otorgado_por)
--   select p.id,
--          (select id from public.experiences where slug = 'agradecimiento'),
--          'individual',
--          auth.uid()
--     from public.profiles p
--    where p.email = 'CORREO_DE_PRUEBA'
--   on conflict (profile_id, experience_id, run_id) do nothing;
--
-- Y para quitarlo, que es lo que hay que comprobar después: el acceso se
-- REVOCA, no se borra, porque el registro de quién tuvo acceso importa.
--
--   update public.grants set revocado_at = now()
--    where experience_id = (select id from public.experiences where slug='agradecimiento')
--      and profile_id = (select id from public.profiles where email='CORREO_DE_PRUEBA');
--
-- Con el acceso revocado, el lector tiene que responder "Esta experiencia no
-- está en tu cuenta". Si responde otra cosa, la RLS no está haciendo su
-- trabajo y hay que parar.
