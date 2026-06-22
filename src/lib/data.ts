import { createServerSupabaseClient } from "./supabase";
import type {
  AnalyticsSummary,
  ConfederationRow,
  ConfederationSnapshot,
  ConfederationUnion,
  SectorRow,
  SectorSnapshot,
  SectorUnion,
  SourceDate,
  UnionCount,
  UnionRow,
  UnionType,
} from "./types";

type QueryResponse<T> = {
  data: T | null;
  error: { message: string } | null;
};

async function readMany<T>(query: PromiseLike<QueryResponse<T[]>>): Promise<T[]> {
  try {
    const { data, error } = await query;
    if (error) {
      return [];
    }
    return data ?? [];
  } catch {
    return [];
  }
}

async function readOne<T>(query: PromiseLike<QueryResponse<T[]>>): Promise<T | null> {
  const rows = await readMany<T>(query);
  return rows[0] ?? null;
}

function client() {
  return createServerSupabaseClient();
}

const EMPTY_DASHBOARD = {
  summaries: [] as AnalyticsSummary[],
  topSectors: [] as SectorRow[],
  topUnions: [] as UnionRow[],
  topConfederations: [] as ConfederationRow[],
  latestDates: [] as SourceDate[],
};

export async function getDashboardData() {
  const supabase = client();
  if (!supabase) {
    return EMPTY_DASHBOARD;
  }

  const [summaries, topSectors, topUnions, topConfederations, latestDates] = await Promise.all([
    readMany<AnalyticsSummary>(
      supabase
        .from("analytics_summary")
        .select(
          "type,latest_source_date,total_rate,current_count,total_member_count,total_worker_count,highest_rate_name,highest_rate_value,lowest_rate_name,lowest_rate_value",
        )
        .order("type")
        .returns<AnalyticsSummary[]>(),
    ),
    readMany<SectorRow>(
      supabase
        .from("sectors")
        .select("id,source_id,type,group_no,name,current_union_count,current_union_rate,current_member_count,current_worker_count,latest_source_date")
        .order("current_member_count", { ascending: false })
        .limit(10)
        .returns<SectorRow[]>(),
    ),
    readMany<UnionRow>(
      supabase
        .from("unions")
        .select(
          "id,source_id,type,name,full_name,address,phone_number,confederation_source_id,confederation_name,established_year,website,email,sector_name,sector_no,sector_source_id,sector_ranking,bargaining_authority,member_count,worker_count,is_sector,is_open,source_detail_available,updated_at",
        )
        .order("member_count", { ascending: false })
        .limit(10)
        .returns<UnionRow[]>(),
    ),
    readMany<ConfederationRow>(
      supabase
        .from("confederations")
        .select(
          "id,source_id,type,name,full_name,established_year,president,address,phone_number,email,website,union_count,member_count,union_with_authority,latest_source_date",
        )
        .order("member_count", { ascending: false })
        .limit(10)
        .returns<ConfederationRow[]>(),
    ),
    readMany<SourceDate>(
      supabase
        .from("source_dates")
        .select("type,source_date,is_latest")
        .eq("is_latest", true)
        .returns<SourceDate[]>(),
    ),
  ]);

  return { summaries, topSectors, topUnions, topConfederations, latestDates };
}

export async function getSectors(type: UnionType | "all"): Promise<SectorRow[]> {
  const supabase = client();
  if (!supabase) {
    return [];
  }
  const baseQuery = supabase
    .from("sectors")
    .select("id,source_id,type,group_no,name,current_union_count,current_union_rate,current_member_count,current_worker_count,latest_source_date")
    .order("type")
    .order("group_no");
  const query = type === "all" ? baseQuery : baseQuery.eq("type", type);
  return readMany<SectorRow>(query.returns<SectorRow[]>());
}

export async function getSectorDetail(type: UnionType, sourceId: number) {
  const empty = { sector: null as SectorRow | null, snapshots: [] as SectorSnapshot[], unions: [] as SectorUnion[] };
  const supabase = client();
  if (!supabase) {
    return empty;
  }
  const sector = await readOne<SectorRow>(
    supabase
      .from("sectors")
      .select("id,source_id,type,group_no,name,current_union_count,current_union_rate,current_member_count,current_worker_count,latest_source_date")
      .eq("type", type)
      .eq("source_id", sourceId)
      .limit(1)
      .returns<SectorRow[]>(),
  );
  if (!sector) {
    return empty;
  }
  const [snapshots, unions] = await Promise.all([
    readMany<SectorSnapshot>(
      supabase
        .from("sector_snapshots")
        .select("source_date,union_count,union_rate,member_count,worker_count")
        .eq("sector_id", sector.id)
        .order("source_date")
        .returns<SectorSnapshot[]>(),
    ),
    readMany<SectorUnion>(
      supabase
        .from("sector_unions")
        .select("union_source_id,union_name,union_member_count,sector_worker_count,member_ratio")
        .eq("sector_id", sector.id)
        .order("union_member_count", { ascending: false })
        .returns<SectorUnion[]>(),
    ),
  ]);
  return { sector, snapshots, unions };
}

export async function getConfederations(type: UnionType | "all"): Promise<ConfederationRow[]> {
  const supabase = client();
  if (!supabase) {
    return [];
  }
  const baseQuery = supabase
    .from("confederations")
    .select(
      "id,source_id,type,name,full_name,established_year,president,address,phone_number,email,website,union_count,member_count,union_with_authority,latest_source_date",
    )
    .order("member_count", { ascending: false });
  const query = type === "all" ? baseQuery : baseQuery.eq("type", type);
  return readMany<ConfederationRow>(query.returns<ConfederationRow[]>());
}

export async function getConfederationDetail(type: UnionType, sourceId: number) {
  const empty = {
    confederation: null as ConfederationRow | null,
    snapshots: [] as ConfederationSnapshot[],
    unions: [] as ConfederationUnion[],
  };
  const supabase = client();
  if (!supabase) {
    return empty;
  }
  const confederation = await readOne<ConfederationRow>(
    supabase
      .from("confederations")
      .select(
        "id,source_id,type,name,full_name,established_year,president,address,phone_number,email,website,union_count,member_count,union_with_authority,latest_source_date",
      )
      .eq("type", type)
      .eq("source_id", sourceId)
      .limit(1)
      .returns<ConfederationRow[]>(),
  );
  if (!confederation) {
    return empty;
  }
  const [snapshots, unions] = await Promise.all([
    readMany<ConfederationSnapshot>(
      supabase
        .from("confederation_snapshots")
        .select("source_date,member_count,union_count,union_with_authority")
        .eq("confederation_id", confederation.id)
        .order("source_date")
        .returns<ConfederationSnapshot[]>(),
    ),
    readMany<ConfederationUnion>(
      supabase
        .from("confederation_unions")
        .select("union_source_id,union_name,sector_group,member_count,member_ratio")
        .eq("confederation_id", confederation.id)
        .order("member_count", { ascending: false })
        .returns<ConfederationUnion[]>(),
    ),
  ]);
  return { confederation, snapshots, unions };
}

export async function getUnions(type: UnionType | "all", search: string): Promise<UnionRow[]> {
  const supabase = client();
  if (!supabase) {
    return [];
  }
  const baseQuery = supabase
    .from("unions")
    .select(
      "id,source_id,file_number,type,name,full_name,address,phone_number,confederation_source_id,confederation_name,established_year,website,email,sector_name,sector_no,sector_source_id,sector_ranking,bargaining_authority,member_count,worker_count,is_sector,is_open,source_detail_available,updated_at",
    )
    .order("type")
    .order("member_count", { ascending: false })
    .limit(1200);
  const query = type === "all" ? baseQuery : baseQuery.eq("type", type);
  const rows = await readMany<UnionRow>(query.returns<UnionRow[]>());
  const normalized = search.trim().toLocaleLowerCase("tr-TR");
  if (!normalized) {
    return rows;
  }
  return rows.filter((row) => {
    const haystack = `${row.name} ${row.full_name ?? ""}`.toLocaleLowerCase("tr-TR");
    return haystack.includes(normalized);
  });
}

export async function getUnionDetail(type: UnionType, sourceId: number) {
  const supabase = client();
  if (!supabase) {
    return { union: null as UnionRow | null, counts: [] as UnionCount[] };
  }
  const union = await readOne<UnionRow>(
    supabase
      .from("unions")
      .select(
        "id,source_id,file_number,type,name,full_name,address,phone_number,confederation_source_id,confederation_name,established_year,president,website,email,sector_name,sector_no,sector_source_id,sector_ranking,bargaining_authority,member_count,worker_count,is_sector,is_open,source_detail_available,updated_at",
      )
      .eq("type", type)
      .eq("source_id", sourceId)
      .limit(1)
      .returns<UnionRow[]>(),
  );
  if (!union) {
    return { union: null as UnionRow | null, counts: [] as UnionCount[] };
  }
  const counts = await readMany<UnionCount>(
    supabase
      .from("union_counts")
      .select("source_date,member_count")
      .eq("union_id", union.id)
      .order("source_date")
      .returns<UnionCount[]>(),
  );
  return { union, counts };
}
