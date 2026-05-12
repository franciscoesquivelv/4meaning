-- ============================================================
-- RLS para tablas agregadas después del schema inicial
-- Ejecutar en Supabase SQL Editor
-- ============================================================
-- Cubre: intake_responses, checklist_tasks, event_content_blocks,
--        team_members, compromisos
-- El schema.sql ya cubre: profiles, events, families,
--        invitations, documents, itinerary_items
-- La ruta /firmar usa createServiceClient() — sin necesidad de
--        políticas anon en agreements.
-- ============================================================
-- IMPORTANTE: cada sección está envuelta en un DO block que
-- verifica si la tabla existe antes de crear las políticas.
-- ============================================================

-- ── INTAKE_RESPONSES ────────────────────────────────────────
DO $intake$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'intake_responses'
  ) THEN
    RAISE NOTICE 'intake_responses no existe, saltando';
  ELSE
    ALTER TABLE public.intake_responses ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Staff ve intake_responses"       ON public.intake_responses;
    DROP POLICY IF EXISTS "Participante ve su intake"       ON public.intake_responses;
    DROP POLICY IF EXISTS "Participante gestiona su intake" ON public.intake_responses;
    DROP POLICY IF EXISTS "Admin gestiona intake_responses" ON public.intake_responses;

    CREATE POLICY "Staff ve intake_responses" ON public.intake_responses
      FOR SELECT USING (is_staff());

    CREATE POLICY "Participante ve su intake" ON public.intake_responses
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.families f
          WHERE f.id = family_id
            AND (f.user_id1 = auth.uid() OR f.user_id2 = auth.uid())
        )
      );

    CREATE POLICY "Participante gestiona su intake" ON public.intake_responses
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.families f
          WHERE f.id = family_id
            AND (f.user_id1 = auth.uid() OR f.user_id2 = auth.uid())
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.families f
          WHERE f.id = family_id
            AND (f.user_id1 = auth.uid() OR f.user_id2 = auth.uid())
        )
      );

    CREATE POLICY "Admin gestiona intake_responses" ON public.intake_responses
      FOR ALL USING (my_role() IN ('super_admin', 'admin'));

    RAISE NOTICE 'RLS aplicado a intake_responses';
  END IF;
END $intake$;

-- ── CHECKLIST_TASKS ──────────────────────────────────────────
DO $checklist$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'checklist_tasks'
  ) THEN
    RAISE NOTICE 'checklist_tasks no existe, saltando';
  ELSE
    ALTER TABLE public.checklist_tasks ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Staff ve checklist_tasks"          ON public.checklist_tasks;
    DROP POLICY IF EXISTS "Participante ve sus tareas"        ON public.checklist_tasks;
    DROP POLICY IF EXISTS "Participante actualiza sus tareas" ON public.checklist_tasks;
    DROP POLICY IF EXISTS "Admin gestiona checklist_tasks"    ON public.checklist_tasks;

    CREATE POLICY "Staff ve checklist_tasks" ON public.checklist_tasks
      FOR SELECT USING (is_staff());

    CREATE POLICY "Participante ve sus tareas" ON public.checklist_tasks
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.families f
          WHERE f.id = family_id
            AND (f.user_id1 = auth.uid() OR f.user_id2 = auth.uid())
        )
      );

    CREATE POLICY "Participante actualiza sus tareas" ON public.checklist_tasks
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.families f
          WHERE f.id = family_id
            AND (f.user_id1 = auth.uid() OR f.user_id2 = auth.uid())
        )
      );

    CREATE POLICY "Admin gestiona checklist_tasks" ON public.checklist_tasks
      FOR ALL USING (my_role() IN ('super_admin', 'admin'));

    RAISE NOTICE 'RLS aplicado a checklist_tasks';
  END IF;
END $checklist$;

-- ── EVENT_CONTENT_BLOCKS ─────────────────────────────────────
DO $content$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'event_content_blocks'
  ) THEN
    RAISE NOTICE 'event_content_blocks no existe, saltando';
  ELSE
    ALTER TABLE public.event_content_blocks ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Staff ve content_blocks"             ON public.event_content_blocks;
    DROP POLICY IF EXISTS "Participante ve content_blocks activos" ON public.event_content_blocks;
    DROP POLICY IF EXISTS "Admin gestiona content_blocks"       ON public.event_content_blocks;

    CREATE POLICY "Staff ve content_blocks" ON public.event_content_blocks
      FOR SELECT USING (is_staff());

    CREATE POLICY "Participante ve content_blocks activos" ON public.event_content_blocks
      FOR SELECT USING (
        activo = true
        AND EXISTS (
          SELECT 1 FROM public.families f
          WHERE f.event_id = event_id
            AND (f.user_id1 = auth.uid() OR f.user_id2 = auth.uid())
        )
      );

    CREATE POLICY "Admin gestiona content_blocks" ON public.event_content_blocks
      FOR ALL USING (my_role() IN ('super_admin', 'admin'));

    RAISE NOTICE 'RLS aplicado a event_content_blocks';
  END IF;
END $content$;

-- ── TEAM_MEMBERS ─────────────────────────────────────────────
DO $team$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'team_members'
  ) THEN
    RAISE NOTICE 'team_members no existe, saltando';
  ELSE
    ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Staff ve team_members"   ON public.team_members;
    DROP POLICY IF EXISTS "Participante ve equipo"  ON public.team_members;
    DROP POLICY IF EXISTS "Admin gestiona team_members" ON public.team_members;

    CREATE POLICY "Staff ve team_members" ON public.team_members
      FOR SELECT USING (is_staff());

    CREATE POLICY "Participante ve equipo" ON public.team_members
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.families f
          WHERE f.event_id = event_id
            AND (f.user_id1 = auth.uid() OR f.user_id2 = auth.uid())
        )
      );

    CREATE POLICY "Admin gestiona team_members" ON public.team_members
      FOR ALL USING (my_role() IN ('super_admin', 'admin'));

    RAISE NOTICE 'RLS aplicado a team_members';
  END IF;
END $team$;

-- ── COMPROMISOS ──────────────────────────────────────────────
DO $compromisos$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'compromisos'
  ) THEN
    RAISE NOTICE 'compromisos no existe — ejecutar 20260512_compromisos.sql primero';
  ELSE
    ALTER TABLE public.compromisos ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Staff ve compromisos"                  ON public.compromisos;
    DROP POLICY IF EXISTS "Participante gestiona sus compromisos" ON public.compromisos;
    DROP POLICY IF EXISTS "Admin gestiona compromisos"            ON public.compromisos;

    CREATE POLICY "Staff ve compromisos" ON public.compromisos
      FOR SELECT USING (is_staff());

    CREATE POLICY "Participante gestiona sus compromisos" ON public.compromisos
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.families f
          WHERE f.id = family_id
            AND (f.user_id1 = auth.uid() OR f.user_id2 = auth.uid())
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.families f
          WHERE f.id = family_id
            AND (f.user_id1 = auth.uid() OR f.user_id2 = auth.uid())
        )
      );

    CREATE POLICY "Admin gestiona compromisos" ON public.compromisos
      FOR ALL USING (my_role() IN ('super_admin', 'admin'));

    RAISE NOTICE 'RLS aplicado a compromisos';
  END IF;
END $compromisos$;

-- ── VERIFICACIÓN ─────────────────────────────────────────────
-- Después de ejecutar, corre esto para confirmar:
--
-- SELECT tablename, rowsecurity
-- FROM pg_tables WHERE schemaname = 'public'
-- ORDER BY tablename;
--
-- Para dar role super_admin al admin principal (si no se hizo):
-- UPDATE public.profiles SET role = 'super_admin'
-- WHERE email = 'f.esquivelviteri@gmail.com';
