CREATE TABLE IF NOT EXISTS public.compromisos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  event_id    uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  texto       text NOT NULL,
  categoria   text NOT NULL DEFAULT 'general', -- 'relacion', 'personal', 'familia', 'general'
  completado  boolean NOT NULL DEFAULT false,
  completado_at timestamptz,
  orden       integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS compromisos_family_idx ON public.compromisos(family_id);
ALTER TABLE public.compromisos ENABLE ROW LEVEL SECURITY;
