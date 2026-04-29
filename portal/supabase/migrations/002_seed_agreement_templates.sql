-- ════════════════════════════════════════════════════════════
-- Default agreement templates (global — not event-specific)
-- These are the base templates; event-specific overrides stored in agreements.contenido
-- ════════════════════════════════════════════════════════════

-- Note: event_id = NULL means global template available for all events
-- Run after 001_initial_schema.sql

-- Templates are stored as JSONB matching the DOCS structure from the hub:
-- { title, intro_template, articles: [{heading, body}] }
-- Variables use {{variable}} syntax, replaced at generation time.

INSERT INTO agreements (
  id, event_id, family_id, type, nombre, contenido, status, created_at
) VALUES
-- This table is for actual agreement instances, not templates.
-- Templates live in the DOCS object in the frontend (lib/agreements/templates.ts)
-- and get instantiated as rows here when an admin sends them.
-- No seed data needed here.
;

-- ════════════════════════════════════════════════════════════
-- Migration helper: import historical events
-- ════════════════════════════════════════════════════════════
-- Use this pattern to import past events (even if data is incomplete):
--
-- INSERT INTO events (slug, nombre, capitulo, ciudad, fecha_inicio, fecha_fin, status, n_parejas)
-- VALUES
--   ('ypo-mx-norte-2024', 'YPO México Norte 2024', 'YPO México Norte', 'Pátzcuaro', '2024-03-14', '2024-03-16', 'completed', 12),
--   ('ypo-panama-2024',   'YPO Panamá 2024',        'YPO Panamá',        'Ciudad de Panamá', NULL, NULL, 'completed', NULL);
--
-- INSERT INTO families (event_id, nombre_familia, nombre1, email1, nombre2, email2, status)
-- VALUES
--   ((SELECT id FROM events WHERE slug = 'ypo-mx-norte-2024'), 'Familia García López', 'Carlos García', 'carlos@email.com', 'Ana López', 'ana@email.com', 'completed');
