-- ============================================================
-- LA PAUSA GANA TIEMPO DE VERDAD
-- ============================================================
--
-- Hallazgo de Elena, Consejo del 2026-09-11, que resultó ser el diagnóstico
-- de fondo de todo este frente: "no falta misterio, falta fricción
-- sensorial. La sala tiene tiempo real; la pantalla no tiene nada que
-- resista el dedo." Y la prueba estaba en el propio catálogo: el bloque
-- `pausa` existe desde el primer día para encarnar un respiro, y hasta hoy
-- eran tres puntos decorativos sin ningún tiempo detrás. El diseño ya sabía
-- que faltaba tiempo; nunca lo construyó.
--
-- Francisco eligió construir esto el 2026-09-12, por encima de la Etapa 3
-- (los tramos), porque El Agradecimiento no tiene tramos y aquello no se
-- vería donde él prueba.
--
-- QUÉ ES ESTE CAMPO. `segundos` dentro del `contenido` de un bloque
-- `pausa`: el piso de tiempo mínimo que dura la bisagra que lo contiene
-- antes de ofrecer el paso siguiente. Se escribe a mano, nunca lo infiere
-- el sistema (decisión de Leo: "nadie audita por qué una pausa duró 4
-- segundos y otra 11 si nace de una fórmula"). Sin el campo, cero espera:
-- la pausa se comporta como siempre.
--
-- DE DÓNDE SALE EL 20. Sora contó las palabras reales de audiencia `todos`
-- de las cinco bisagras con pausa, a 200 palabras por minuto: ag2 10s,
-- ag3 16s, ag4 28s, ag5 20s, ag7 34s. Mediana 20. Queda por debajo del
-- trabajo real en las cuatro bisagras que llevan consigna (que en digital
-- abre un campo de escritura, o sea minutos), así que quien lee de verdad
-- no se topa nunca con la espera. Solo se nota en ag2, "Mañana nos vemos.
-- Nada más. Duerme.", que es justo donde debe notarse.
--
-- EL TECHO DE 30 NO VIVE AQUÍ. Se aplica en el código (`PisoDeTiempo.tsx`),
-- no como restricción de la base, porque un contenido que pida más está mal
-- escrito, no mal configurado, y quiero que eso se vea al leerlo y no que
-- la base lo rechace en silencio.

update public.blocks b
set contenido = coalesce(b.contenido, '{}'::jsonb) || jsonb_build_object('segundos', 20)
from public.hinges h, public.experiences e
where b.hinge_id = h.id
  and h.experience_id = e.id
  and e.slug = 'agradecimiento'
  and b.tipo = 'pausa';

-- ── Comprobación ──────────────────────────────────────────
--
-- select h.titulo, b.contenido
--   from public.blocks b
--   join public.hinges h on h.id = b.hinge_id
--   join public.experiences e on e.id = h.experience_id
--  where e.slug = 'agradecimiento' and b.tipo = 'pausa'
--  order by h.tiempo, h.orden;
--
-- Deben salir cinco filas (La noche de antes, Bajar el ritmo, Alguien te
-- sostuvo, La grieta, Decirlo en voz alta), todas con {"segundos": 20}.
-- El Presente como Regalo queda sin tocar a propósito: sus pausas siguen
-- sin tiempo hasta que alguien mida su contenido, que hoy es esqueleto.
