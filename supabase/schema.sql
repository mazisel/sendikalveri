-- Sendikalveri full rebuild schema.
-- Applies a destructive reset so old id-only conflicts from sendikadata are removed.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS public.confederation_unions CASCADE;
DROP TABLE IF EXISTS public.confederation_snapshots CASCADE;
DROP TABLE IF EXISTS public.union_counts CASCADE;
DROP TABLE IF EXISTS public.sector_unions CASCADE;
DROP TABLE IF EXISTS public.sector_snapshots CASCADE;
DROP TABLE IF EXISTS public.analytics_summary CASCADE;
DROP TABLE IF EXISTS public.confederations CASCADE;
DROP TABLE IF EXISTS public.sectors CASCADE;
DROP TABLE IF EXISTS public.unions CASCADE;
DROP TABLE IF EXISTS public.source_dates CASCADE;
DROP TABLE IF EXISTS public.sync_runs CASCADE;
DROP TYPE IF EXISTS public.union_type CASCADE;
DROP TYPE IF EXISTS public.sync_status CASCADE;

CREATE TYPE public.union_type AS ENUM ('labor', 'civil');
CREATE TYPE public.sync_status AS ENUM ('running', 'success', 'failed');

CREATE TABLE public.sync_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status public.sync_status NOT NULL DEFAULT 'running',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE,
    source_counts JSONB NOT NULL DEFAULT '{}'::jsonb,
    message TEXT
);

CREATE TABLE public.source_dates (
    id BIGSERIAL PRIMARY KEY,
    type public.union_type NOT NULL,
    source_date DATE NOT NULL,
    is_latest BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (type, source_date)
);

CREATE UNIQUE INDEX source_dates_one_latest_per_type
ON public.source_dates (type)
WHERE is_latest;

CREATE TABLE public.unions (
    id BIGSERIAL PRIMARY KEY,
    source_id INT NOT NULL,
    type public.union_type NOT NULL,
    name TEXT NOT NULL,
    full_name TEXT,
    address TEXT,
    phone_number TEXT,
    confederation_source_id INT,
    confederation_name TEXT,
    established_year INT,
    president TEXT,
    website TEXT,
    email TEXT,
    sector_name TEXT,
    sector_no TEXT,
    sector_source_id INT,
    sector_ranking INT,
    bargaining_authority BOOLEAN,
    member_count BIGINT NOT NULL DEFAULT 0,
    worker_count BIGINT NOT NULL DEFAULT 0,
    is_sector BOOLEAN,
    is_open BOOLEAN,
    source_detail_available BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (source_id, type)
);

CREATE INDEX unions_type_member_count_idx ON public.unions (type, member_count DESC);
CREATE INDEX unions_search_idx ON public.unions USING GIN (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(full_name, '')));

CREATE TABLE public.union_counts (
    id BIGSERIAL PRIMARY KEY,
    union_id BIGINT NOT NULL REFERENCES public.unions(id) ON DELETE CASCADE,
    source_date DATE NOT NULL,
    member_count BIGINT NOT NULL DEFAULT 0,
    UNIQUE (union_id, source_date)
);

CREATE TABLE public.sectors (
    id BIGSERIAL PRIMARY KEY,
    source_id INT NOT NULL,
    type public.union_type NOT NULL,
    group_no TEXT,
    name TEXT NOT NULL,
    current_union_count INT NOT NULL DEFAULT 0,
    current_union_rate NUMERIC NOT NULL DEFAULT 0,
    current_member_count BIGINT NOT NULL DEFAULT 0,
    current_worker_count BIGINT NOT NULL DEFAULT 0,
    latest_source_date DATE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (source_id, type)
);

CREATE INDEX sectors_type_group_idx ON public.sectors (type, group_no);
CREATE INDEX sectors_member_count_idx ON public.sectors (type, current_member_count DESC);

CREATE TABLE public.sector_snapshots (
    id BIGSERIAL PRIMARY KEY,
    sector_id BIGINT NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
    source_date DATE NOT NULL,
    union_count INT NOT NULL DEFAULT 0,
    union_rate NUMERIC NOT NULL DEFAULT 0,
    member_count BIGINT NOT NULL DEFAULT 0,
    worker_count BIGINT NOT NULL DEFAULT 0,
    UNIQUE (sector_id, source_date)
);

CREATE TABLE public.sector_unions (
    id BIGSERIAL PRIMARY KEY,
    sector_id BIGINT NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
    union_id BIGINT REFERENCES public.unions(id) ON DELETE SET NULL,
    source_date DATE NOT NULL,
    union_source_id INT NOT NULL,
    union_name TEXT NOT NULL,
    union_member_count BIGINT NOT NULL DEFAULT 0,
    sector_worker_count BIGINT NOT NULL DEFAULT 0,
    member_ratio NUMERIC NOT NULL DEFAULT 0,
    UNIQUE (sector_id, source_date, union_source_id)
);

CREATE TABLE public.confederations (
    id BIGSERIAL PRIMARY KEY,
    source_id INT NOT NULL,
    type public.union_type NOT NULL,
    name TEXT NOT NULL,
    full_name TEXT,
    logo TEXT,
    established_year TEXT,
    president TEXT,
    address TEXT,
    phone_number TEXT,
    email TEXT,
    website TEXT,
    union_count INT NOT NULL DEFAULT 0,
    member_count BIGINT NOT NULL DEFAULT 0,
    union_with_authority INT NOT NULL DEFAULT 0,
    latest_source_date DATE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (source_id, type)
);

CREATE INDEX confederations_type_member_count_idx ON public.confederations (type, member_count DESC);

CREATE TABLE public.confederation_snapshots (
    id BIGSERIAL PRIMARY KEY,
    confederation_id BIGINT NOT NULL REFERENCES public.confederations(id) ON DELETE CASCADE,
    source_date DATE NOT NULL,
    member_count BIGINT NOT NULL DEFAULT 0,
    union_count INT NOT NULL DEFAULT 0,
    union_with_authority INT NOT NULL DEFAULT 0,
    UNIQUE (confederation_id, source_date)
);

CREATE TABLE public.confederation_unions (
    id BIGSERIAL PRIMARY KEY,
    confederation_id BIGINT NOT NULL REFERENCES public.confederations(id) ON DELETE CASCADE,
    union_id BIGINT REFERENCES public.unions(id) ON DELETE SET NULL,
    source_date DATE NOT NULL,
    union_source_id INT NOT NULL,
    union_name TEXT NOT NULL,
    sector_group TEXT,
    member_count BIGINT NOT NULL DEFAULT 0,
    member_ratio NUMERIC NOT NULL DEFAULT 0,
    UNIQUE (confederation_id, source_date, union_source_id)
);

CREATE TABLE public.analytics_summary (
    id BIGSERIAL PRIMARY KEY,
    type public.union_type UNIQUE NOT NULL,
    latest_source_date DATE,
    total_rate NUMERIC NOT NULL DEFAULT 0,
    current_count INT NOT NULL DEFAULT 0,
    total_member_count BIGINT NOT NULL DEFAULT 0,
    total_worker_count BIGINT NOT NULL DEFAULT 0,
    highest_rate_name TEXT,
    highest_rate_value NUMERIC NOT NULL DEFAULT 0,
    highest_rate_member_count BIGINT NOT NULL DEFAULT 0,
    highest_rate_total_count BIGINT NOT NULL DEFAULT 0,
    lowest_rate_name TEXT,
    lowest_rate_value NUMERIC NOT NULL DEFAULT 0,
    lowest_rate_member_count BIGINT NOT NULL DEFAULT 0,
    lowest_rate_total_count BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.union_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sector_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sector_unions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confederations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confederation_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confederation_unions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sync runs viewable by everyone." ON public.sync_runs FOR SELECT USING (true);
CREATE POLICY "Source dates viewable by everyone." ON public.source_dates FOR SELECT USING (true);
CREATE POLICY "Analytics viewable by everyone." ON public.analytics_summary FOR SELECT USING (true);
CREATE POLICY "Unions viewable by everyone." ON public.unions FOR SELECT USING (true);
CREATE POLICY "Union counts viewable by everyone." ON public.union_counts FOR SELECT USING (true);
CREATE POLICY "Sectors viewable by everyone." ON public.sectors FOR SELECT USING (true);
CREATE POLICY "Sector snapshots viewable by everyone." ON public.sector_snapshots FOR SELECT USING (true);
CREATE POLICY "Sector unions viewable by everyone." ON public.sector_unions FOR SELECT USING (true);
CREATE POLICY "Confederations viewable by everyone." ON public.confederations FOR SELECT USING (true);
CREATE POLICY "Confederation snapshots viewable by everyone." ON public.confederation_snapshots FOR SELECT USING (true);
CREATE POLICY "Confederation unions viewable by everyone." ON public.confederation_unions FOR SELECT USING (true);
