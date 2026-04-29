-- ════════════════════════════════════════════════════════════
-- TRASCENDENCIA PORTAL — Initial Schema
-- ════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor or via supabase db push

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Enums ───────────────────────────────────────────────────
CREATE TYPE user_role       AS ENUM ('super_admin', 'admin', 'staff', 'participant');
CREATE TYPE event_status    AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE family_status   AS ENUM ('invited', 'confirmed', 'completed');
CREATE TYPE agreement_status AS ENUM ('draft', 'sent', 'viewed', 'signed', 'approved', 'rejected');
CREATE TYPE doc_visibility  AS ENUM ('admin_only', 'staff', 'participant', 'all');
CREATE TYPE itinerary_visibility AS ENUM ('staff_only', 'participant', 'all');
CREATE TYPE itinerary_type  AS ENUM ('actividad', 'taller', 'comida', 'logistica', 'libre', 'privado', 'traslado');
CREATE TYPE invite_status   AS ENUM ('pending', 'accepted', 'expired', 'cancelled');

-- ════════════════════════════════════════════════════════════
-- PROFILES (extends auth.users)
-- ════════════════════════════════════════════════════════════
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  phone         TEXT,
  role          user_role NOT NULL DEFAULT 'participant',
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on new auth user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'participant')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════════
-- EVENTS (Retiros)
-- ════════════════════════════════════════════════════════════
CREATE TABLE events (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug             TEXT UNIQUE NOT NULL,            -- ypo-mexico-norte-2025
  nombre           TEXT NOT NULL,                   -- Retiro YPO México Norte
  capitulo         TEXT,                            -- YPO México Norte
  ciudad           TEXT,
  pais             TEXT DEFAULT 'México',
  fecha_inicio     DATE,
  fecha_fin        DATE,
  ubicacion        TEXT,                            -- Hotel / venue
  status           event_status NOT NULL DEFAULT 'draft',
  n_parejas        INT,
  notas_internas   TEXT,                            -- Internal only
  created_by       UUID REFERENCES profiles(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ════════════════════════════════════════════════════════════
-- FAMILIES (Couples / participants per event)
-- ════════════════════════════════════════════════════════════
CREATE TABLE families (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Family name
  nombre_familia  TEXT,                             -- Familia Rodríguez Sánchez

  -- Person 1
  nombre1         TEXT NOT NULL,
  email1          TEXT NOT NULL,
  user_id1        UUID REFERENCES profiles(id),     -- Populated when invite accepted

  -- Person 2 (optional — supports single attendees)
  nombre2         TEXT,
  email2          TEXT,
  user_id2        UUID REFERENCES profiles(id),

  -- Logistics
  habitacion      TEXT,
  notas           TEXT,
  status          family_status NOT NULL DEFAULT 'invited',

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER families_updated_at BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ════════════════════════════════════════════════════════════
-- INVITATIONS
-- ════════════════════════════════════════════════════════════
CREATE TABLE invitations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id        UUID REFERENCES events(id) ON DELETE SET NULL,
  family_id       UUID REFERENCES families(id) ON DELETE SET NULL,
  email           TEXT NOT NULL,
  full_name       TEXT,
  role            user_role NOT NULL DEFAULT 'participant',
  status          invite_status NOT NULL DEFAULT 'pending',
  custom_message  TEXT,                             -- Personal message in email
  profile_id      UUID REFERENCES profiles(id),     -- Populated on accept
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at     TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  created_by      UUID REFERENCES profiles(id)
);

-- ════════════════════════════════════════════════════════════
-- AGREEMENTS
-- ════════════════════════════════════════════════════════════
CREATE TABLE agreements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  family_id       UUID REFERENCES families(id) ON DELETE CASCADE,

  -- Who needs to sign (can be non-family: photographer, videographer...)
  assigned_to     UUID REFERENCES profiles(id),
  assigned_email  TEXT,                             -- For non-portal signers

  -- Agreement content
  type            TEXT NOT NULL,                    -- evento, video, staff, participante, storybook, fotografo, custom
  nombre          TEXT NOT NULL,                    -- Display name
  contenido       JSONB NOT NULL,                   -- {intro, articles:[{heading,body}], meta, sigs:[{label}]}

  -- Status workflow
  status          agreement_status NOT NULL DEFAULT 'draft',

  -- Signing
  signed_at       TIMESTAMPTZ,
  signed_ip       TEXT,
  signed_user_agent TEXT,

  -- Admin approval
  approved_at     TIMESTAMPTZ,
  approved_by     UUID REFERENCES profiles(id),
  rejected_at     TIMESTAMPTZ,
  rejected_by     UUID REFERENCES profiles(id),
  notas_admin     TEXT,

  -- Storage
  pdf_url         TEXT,                             -- Supabase Storage path

  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER agreements_updated_at BEFORE UPDATE ON agreements
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ════════════════════════════════════════════════════════════
-- DOCUMENTS (non-agreement: itinerary PDF, materials, storybook, etc.)
-- ════════════════════════════════════════════════════════════
CREATE TABLE documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id        UUID REFERENCES events(id) ON DELETE CASCADE,
  family_id       UUID REFERENCES families(id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL,                    -- itinerario, material_familia, storybook, info_preliminar, custom
  nombre          TEXT NOT NULL,
  contenido       JSONB,                            -- Flexible structured content
  visibilidad     doc_visibility NOT NULL DEFAULT 'participant',
  pdf_url         TEXT,
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ════════════════════════════════════════════════════════════
-- ITINERARY ITEMS (Minute by minute)
-- ════════════════════════════════════════════════════════════
CREATE TABLE itinerary_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  dia             INT NOT NULL DEFAULT 1,           -- Day number (1, 2, 3...)
  fecha           DATE,
  hora_inicio     TIME,
  hora_fin        TIME,
  titulo          TEXT NOT NULL,
  descripcion     TEXT,
  tipo            itinerary_type NOT NULL DEFAULT 'actividad',
  visibilidad     itinerary_visibility NOT NULL DEFAULT 'participant',
  ubicacion       TEXT,
  responsable     TEXT,                             -- Who runs this (name, not FK)
  notas_staff     TEXT,                             -- Internal — never shown to participants
  orden           INT NOT NULL DEFAULT 0,
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER itinerary_updated_at BEFORE UPDATE ON itinerary_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Index for ordering ──────────────────────────────────────
CREATE INDEX itinerary_event_order ON itinerary_items (event_id, dia, orden, hora_inicio);
CREATE INDEX agreements_family    ON agreements (family_id);
CREATE INDEX agreements_event     ON agreements (event_id);
CREATE INDEX families_event       ON families (event_id);
CREATE INDEX documents_event      ON documents (event_id);

-- ════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════

ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE families         ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items  ENABLE ROW LEVEL SECURITY;

-- ── Helper: is current user staff or above ──────────────────
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'admin', 'staff')
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'admin')
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ── PROFILES ────────────────────────────────────────────────
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (id = auth.uid());

CREATE POLICY "Staff can read all profiles"
  ON profiles FOR SELECT USING (is_staff());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admin can update any profile"
  ON profiles FOR UPDATE USING (is_admin());

-- ── EVENTS ──────────────────────────────────────────────────
CREATE POLICY "Staff can read all events"
  ON events FOR SELECT USING (is_staff());

CREATE POLICY "Participants can read their event"
  ON events FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM families f
      WHERE f.event_id = events.id
      AND (f.user_id1 = auth.uid() OR f.user_id2 = auth.uid())
    )
  );

CREATE POLICY "Admin can insert events"
  ON events FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admin can update events"
  ON events FOR UPDATE USING (is_admin());

-- ── FAMILIES ────────────────────────────────────────────────
CREATE POLICY "Staff can read all families"
  ON families FOR SELECT USING (is_staff());

CREATE POLICY "Participants can read own family"
  ON families FOR SELECT USING (
    user_id1 = auth.uid() OR user_id2 = auth.uid()
  );

CREATE POLICY "Admin can manage families"
  ON families FOR ALL USING (is_admin());

-- ── INVITATIONS ─────────────────────────────────────────────
CREATE POLICY "Admin can manage invitations"
  ON invitations FOR ALL USING (is_admin());

CREATE POLICY "Users can read own invitations"
  ON invitations FOR SELECT USING (email = (
    SELECT email FROM profiles WHERE id = auth.uid()
  ));

-- ── AGREEMENTS ──────────────────────────────────────────────
CREATE POLICY "Staff can read all agreements"
  ON agreements FOR SELECT USING (is_staff());

CREATE POLICY "Participants can read own agreements"
  ON agreements FOR SELECT USING (
    assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM families f
      WHERE f.id = agreements.family_id
      AND (f.user_id1 = auth.uid() OR f.user_id2 = auth.uid())
    )
  );

CREATE POLICY "Participants can sign own agreements"
  ON agreements FOR UPDATE USING (
    assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM families f
      WHERE f.id = agreements.family_id
      AND (f.user_id1 = auth.uid() OR f.user_id2 = auth.uid())
    )
  );

CREATE POLICY "Admin can manage agreements"
  ON agreements FOR ALL USING (is_admin());

-- ── DOCUMENTS ───────────────────────────────────────────────
CREATE POLICY "Admin can manage all documents"
  ON documents FOR ALL USING (is_admin());

CREATE POLICY "Staff can read staff+ documents"
  ON documents FOR SELECT USING (
    is_staff() AND visibilidad IN ('staff', 'all', 'admin_only')
  );

CREATE POLICY "Participants can read their documents"
  ON documents FOR SELECT USING (
    visibilidad IN ('participant', 'all')
    AND (
      family_id IS NULL -- event-wide document
      OR EXISTS (
        SELECT 1 FROM families f
        WHERE f.id = documents.family_id
        AND (f.user_id1 = auth.uid() OR f.user_id2 = auth.uid())
      )
    )
  );

-- ── ITINERARY ───────────────────────────────────────────────
CREATE POLICY "Staff can read all itinerary"
  ON itinerary_items FOR SELECT USING (is_staff());

CREATE POLICY "Staff can manage itinerary"
  ON itinerary_items FOR ALL USING (is_admin());

CREATE POLICY "Participants can read participant itinerary"
  ON itinerary_items FOR SELECT USING (
    visibilidad IN ('participant', 'all')
    AND EXISTS (
      SELECT 1 FROM families f
      WHERE f.event_id = itinerary_items.event_id
      AND (f.user_id1 = auth.uid() OR f.user_id2 = auth.uid())
    )
  );

-- ════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- Run these in Supabase Dashboard → Storage
-- ════════════════════════════════════════════════════════════
-- INSERT INTO storage.buckets (id, name, public) VALUES ('agreements', 'agreements', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true);
