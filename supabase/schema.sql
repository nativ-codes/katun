-- Katun Database Schema for Supabase
-- Run this in Supabase SQL Editor after creating your project

-- Players table
CREATE TABLE players (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Villages table
CREATE TABLE villages (
    id UUID PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location INT[2],
    resources JSONB DEFAULT '{
        "WOOD": 200,
        "IRON": 100,
        "FOOD": 150,
        "UPGRADE_POINTS": 0
    }',
    resource_updated_at TIMESTAMPTZ DEFAULT now(),
    buildings JSONB DEFAULT '[]',
    troops JSONB DEFAULT '[]',
    troop_levels JSONB DEFAULT '{}',
    training_queue JSONB DEFAULT '[]',
    construction_queue JSONB DEFAULT '[]',
    campaign JSONB DEFAULT '{"level": 1, "wins": 0}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Events table (world events)
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Event recipients (inbox per user)
CREATE TABLE event_recipients (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    status TEXT DEFAULT 'unread', -- unread, read
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Alliances
CREATE TABLE alliances (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id TEXT NOT NULL REFERENCES players(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Atomic resource spending function (anti-dupe protection)
-- This function ensures resource spending is atomic and prevents race conditions
CREATE OR REPLACE FUNCTION spend_resources(
    p_village_id UUID,
    p_cost JSONB
) RETURNS JSONB AS $$
DECLARE
    v_current JSONB;
    v_resources JSONB;
    v_resource TEXT;
    v_required NUMERIC;
    v_available NUMERIC;
BEGIN
    -- Lock and get current resources
    SELECT resources INTO v_current
    FROM villages
    WHERE id = p_village_id
    FOR UPDATE;

    IF v_current IS NULL THEN
        RAISE EXCEPTION 'Village not found';
    END IF;

    -- Validate all resources available before deducting
    FOR v_resource, v_required IN SELECT * FROM jsonb_each_text(p_cost)
    LOOP
        v_available := (v_current->>v_resource)::NUMERIC;
        IF v_available IS NULL OR v_available < v_required::NUMERIC THEN
            RAISE EXCEPTION 'Insufficient %: required %, available %',
                v_resource, v_required, COALESCE(v_available, 0);
        END IF;
    END LOOP;

    -- Deduct resources
    v_resources := v_current;
    FOR v_resource, v_required IN SELECT * FROM jsonb_each_text(p_cost)
    LOOP
        v_resources := jsonb_set(
            v_resources,
            ARRAY[v_resource],
            to_jsonb((v_current->>v_resource)::NUMERIC - v_required::NUMERIC)
        );
    END LOOP;

    -- Update village atomically
    UPDATE villages
    SET resources = v_resources, updated_at = now()
    WHERE id = p_village_id;

    RETURN v_resources;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
-- Enable RLS on tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE alliances ENABLE ROW LEVEL SECURITY;

-- Players can only access their own data (cast auth.uid() to text for comparison)
CREATE POLICY "Players can read own data" ON players
    FOR ALL USING (user_id = auth.uid()::text);

-- Players can only access their own villages
CREATE POLICY "Players can read own villages" ON villages
    FOR ALL USING (owner_id IN (
        SELECT id FROM players WHERE user_id = auth.uid()::text
    ));

-- Alliances are readable by all, but only owner can modify
CREATE POLICY "Alliances readable by all" ON alliances
    FOR SELECT USING (true);

CREATE POLICY "Alliances modifiable by owner" ON alliances
    FOR ALL USING (owner_id IN (
        SELECT id FROM players WHERE user_id = auth.uid()::text
    ));

-- Indexes for performance
CREATE INDEX idx_villages_owner ON villages(owner_id);
CREATE INDEX idx_villages_location ON villages USING GIN(location);
CREATE INDEX idx_event_recipients_user ON event_recipients(user_id);
CREATE INDEX idx_event_recipients_event ON event_recipients(event_id);
CREATE INDEX idx_event_recipients_status ON event_recipients(user_id, status);
CREATE INDEX idx_events_created ON events(created_at DESC);
