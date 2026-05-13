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

const SOURCE_API = "https://sendikadata.com/api";

type QueryResponse<T> = {
  data: T | null;
  error: { message: string } | null;
};

type SourceSearchItem = {
  id?: number;
  name?: string;
  type?: boolean;
  fullName?: string | null;
  sector?: boolean;
  open?: boolean;
};

type SourceUnionDetail = {
  id?: number;
  name?: string;
  type?: boolean;
  fullName?: string | null;
  address?: string | null;
  phoneNumber?: string | null;
  confederation?: string | null;
  confederationId?: number | null;
  establishedYear?: number | null;
  website?: string | null;
  email?: string | null;
  count?: number;
  sector?: string | null;
  sectorNo?: string | null;
  sectorId?: number | null;
  sectorRanking?: number | null;
  bargainingAuthority?: boolean | null;
  memberCount?: number;
  president?: string | null;
  open?: boolean;
};

type SourceCount = {
  date: string;
  count: number;
};

type SourceSector = {
  id: number;
  name: string;
  groupNo: string;
  unionCount: number;
  unionRate: number;
  memberCount: number;
  count: number;
};

type SourceSectorUnion = {
  unionId: number;
  unionName: string;
  unionMember: number;
  sectorMember: number;
  memberRatio?: number;
};

type SourceConfederation = {
  id: number;
  name: string;
  fullName?: string | null;
  establishedYear?: string | number | null;
  president?: string | null;
  address?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  website?: string | null;
  type?: boolean;
  unionCount?: number;
  memberCount?: number;
  unionWithAuthority?: number;
};

type SourceConfederationUnion = {
  id: number;
  unionName: string;
  sector?: string | null;
  memberCount: number;
  memberRatio?: number;
};

type SourceAnalytics = {
  totalRate?: number;
  currentCount?: number;
  highestRate?: { name?: string; unionRate?: number; memberCount?: number; count?: number };
  lowestRate?: { name?: string; unionRate?: number; memberCount?: number; count?: number };
};

type SourceTables = {
  topUnionDTO?: Array<{ id: number; name: string; group?: string | null; memberCount?: number }>;
  unionConfederations?: Array<{ id: number; name: string; count?: number; memberCount?: number }>;
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

async function sourceJson<T>(path: string, params?: Record<string, string | number>): Promise<T | null> {
  try {
    const url = new URL(`${SOURCE_API}${path}`);
    Object.entries(params ?? {}).forEach(([key, value]) => url.searchParams.set(key, String(value)));
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0",
      },
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function fromBool(value: boolean | undefined): UnionType {
  return value === false ? "civil" : "labor";
}

function fromSearchSector(value: boolean | undefined): UnionType {
  return value === false ? "civil" : "labor";
}

function isSearchUnion(item: SourceSearchItem): boolean {
  return item.type === true;
}

function apiType(type: UnionType): number {
  return type === "labor" ? 1 : 0;
}

function boolKey(type: UnionType): "true" | "false" {
  return type === "labor" ? "true" : "false";
}

function sourceUnionToRow(item: SourceSearchItem, detail?: SourceUnionDetail | null): UnionRow {
  const rowType = fromSearchSector(item.sector);
  const hasMatchingDetail = detail && fromBool(detail.type) === rowType;
  return {
    id: item.id ?? 0,
    source_id: item.id ?? 0,
    type: rowType,
    name: (hasMatchingDetail ? detail.name : item.name) ?? "",
    full_name: (hasMatchingDetail ? detail.fullName : item.fullName) ?? null,
    address: hasMatchingDetail ? detail.address ?? null : null,
    phone_number: hasMatchingDetail ? detail.phoneNumber ?? null : null,
    confederation_source_id: hasMatchingDetail ? detail.confederationId ?? null : null,
    confederation_name: hasMatchingDetail ? detail.confederation ?? null : null,
    established_year: hasMatchingDetail ? detail.establishedYear ?? null : null,
    president: hasMatchingDetail ? detail.president ?? null : null,
    website: hasMatchingDetail ? detail.website ?? null : null,
    email: hasMatchingDetail ? detail.email ?? null : null,
    sector_name: hasMatchingDetail && typeof detail.sector === "string" ? detail.sector : null,
    sector_no: hasMatchingDetail ? detail.sectorNo ?? null : null,
    sector_source_id: hasMatchingDetail ? detail.sectorId ?? null : null,
    sector_ranking: hasMatchingDetail ? detail.sectorRanking ?? null : null,
    bargaining_authority: hasMatchingDetail ? detail.bargainingAuthority ?? null : null,
    member_count: hasMatchingDetail ? detail.memberCount ?? 0 : 0,
    worker_count: hasMatchingDetail ? detail.count ?? 0 : 0,
    is_sector: typeof item.type === "boolean" ? item.type : null,
    is_open: typeof item.open === "boolean" ? item.open : null,
    source_detail_available: Boolean(hasMatchingDetail),
    updated_at: null,
  };
}

function hasKnownUnionDetail(row: UnionRow): boolean {
  return row.source_detail_available || Number(row.member_count ?? 0) > 0;
}

function hasUsableUnionRows(rows: UnionRow[], requestedType: UnionType | "all"): boolean {
  if (rows.length === 0) {
    return false;
  }
  const laborRows = rows.filter((row) => row.type === "labor");
  const civilRows = rows.filter((row) => row.type === "civil");
  if (requestedType === "labor") {
    return laborRows.some(hasKnownUnionDetail) && laborRows.length <= 500;
  }
  if (requestedType === "civil") {
    return civilRows.some(hasKnownUnionDetail);
  }
  return laborRows.length > 0 && civilRows.length > 0 && civilRows.some(hasKnownUnionDetail);
}

function mergeUnionDetail(row: UnionRow, detail: SourceUnionDetail | null): UnionRow {
  if (!detail || fromBool(detail.type) !== row.type) {
    return row;
  }
  return {
    ...row,
    name: detail.name ?? row.name,
    full_name: detail.fullName ?? row.full_name,
    address: detail.address ?? row.address,
    phone_number: detail.phoneNumber ?? row.phone_number,
    confederation_source_id: detail.confederationId ?? row.confederation_source_id,
    confederation_name: detail.confederation ?? row.confederation_name,
    established_year: detail.establishedYear ?? row.established_year,
    president: detail.president ?? row.president ?? null,
    website: detail.website ?? row.website,
    email: detail.email ?? row.email,
    sector_name: typeof detail.sector === "string" ? detail.sector : row.sector_name,
    sector_no: detail.sectorNo ?? row.sector_no,
    sector_source_id: detail.sectorId ?? row.sector_source_id,
    sector_ranking: detail.sectorRanking ?? row.sector_ranking,
    bargaining_authority: detail.bargainingAuthority ?? row.bargaining_authority,
    member_count: detail.memberCount ?? row.member_count,
    worker_count: detail.count ?? row.worker_count,
    is_open: typeof detail.open === "boolean" ? detail.open : row.is_open,
    source_detail_available: true,
  };
}

async function getLiveUnionCounts(sourceId: number): Promise<UnionCount[]> {
  const sourceCounts = await sourceJson<SourceCount[]>("/union/counts", { id: sourceId });
  return (sourceCounts ?? []).map((item) => ({
    source_date: item.date,
    member_count: item.count,
  }));
}

async function latestSourceDates(): Promise<Record<UnionType, string>> {
  const dates = await sourceJson<Record<"true" | "false", string[]>>("/home/dates");
  return {
    labor: dates?.true?.[0] ?? "",
    civil: dates?.false?.[0] ?? "",
  };
}

async function getLiveDashboardData() {
  const dates = await latestSourceDates();
  const analytics = await sourceJson<Record<UnionType, SourceAnalytics>>("/home/analytics-summary");
  const tables = await sourceJson<Record<"true" | "false", SourceTables>>("/home/tables-summary");
  const laborSectors = dates.labor ? await sourceJson<SourceSector[]>("/sector", { type: 1, date: dates.labor }) : [];
  const civilSectors = dates.civil ? await sourceJson<SourceSector[]>("/sector", { type: 0, date: dates.civil }) : [];
  const sectorPairs: Array<{ type: UnionType; latest: string; sectors: SourceSector[] }> = [
    { type: "labor", latest: dates.labor, sectors: laborSectors ?? [] },
    { type: "civil", latest: dates.civil, sectors: civilSectors ?? [] },
  ];

  const summaries: AnalyticsSummary[] = sectorPairs.map(({ type, latest, sectors }) => {
    const totalMemberCount = sectors.reduce((sum, sector) => sum + sector.memberCount, 0);
    const totalWorkerCount = sectors.reduce((sum, sector) => sum + sector.count, 0);
    const raw = analytics?.[type] ?? {};
    return {
      type,
      latest_source_date: latest,
      total_rate: totalWorkerCount ? (totalMemberCount * 100) / totalWorkerCount : raw.totalRate ?? 0,
      current_count: raw.currentCount ?? 0,
      total_member_count: totalMemberCount,
      total_worker_count: totalWorkerCount,
      highest_rate_name: raw.highestRate?.name ?? null,
      highest_rate_value: raw.highestRate?.unionRate ?? 0,
      lowest_rate_name: raw.lowestRate?.name ?? null,
      lowest_rate_value: raw.lowestRate?.unionRate ?? 0,
    };
  });

  const topSectors: SectorRow[] = sectorPairs
    .flatMap(({ type, latest, sectors }) =>
      sectors.map((sector) => ({
        id: sector.id,
        source_id: sector.id,
        type,
        group_no: sector.groupNo,
        name: sector.name,
        current_union_count: sector.unionCount,
        current_union_rate: sector.unionRate,
        current_member_count: sector.memberCount,
        current_worker_count: sector.count,
        latest_source_date: latest,
      })),
    )
    .sort((left, right) => Number(right.current_member_count) - Number(left.current_member_count))
    .slice(0, 10);

  const topUnions: UnionRow[] = (["labor", "civil"] as UnionType[])
    .flatMap((type) =>
      (tables?.[boolKey(type)]?.topUnionDTO ?? []).map((item) =>
        sourceUnionToRow({
          id: item.id,
          name: item.name,
          type: true,
          fullName: null,
          sector: type === "labor",
          open: true,
        }, {
          id: item.id,
          name: item.name,
          type: type === "labor",
          memberCount: item.memberCount ?? 0,
          sectorNo: item.group ?? null,
        }),
      ),
    )
    .sort((left, right) => Number(right.member_count) - Number(left.member_count))
    .slice(0, 10);

  const topConfederations: ConfederationRow[] = (["labor", "civil"] as UnionType[])
    .flatMap((type) =>
      (tables?.[boolKey(type)]?.unionConfederations ?? []).map((item) => ({
        id: item.id,
        source_id: item.id,
        type,
        name: item.name,
        full_name: null,
        established_year: null,
        president: null,
        address: null,
        phone_number: null,
        email: null,
        website: null,
        union_count: item.count ?? 0,
        member_count: item.memberCount ?? 0,
        union_with_authority: 0,
        latest_source_date: dates[type],
      })),
    )
    .sort((left, right) => Number(right.member_count) - Number(left.member_count))
    .slice(0, 10);

  const latestDates: SourceDate[] = (["labor", "civil"] as UnionType[]).map((type) => ({
    type,
    source_date: dates[type],
    is_latest: true,
  }));

  return { summaries, topSectors, topUnions, topConfederations, latestDates };
}

export async function getDashboardData() {
  const supabase = client();
  if (!supabase) {
    return getLiveDashboardData();
  }

  const summaries = await readMany<AnalyticsSummary>(
    supabase
      .from("analytics_summary")
      .select(
        "type,latest_source_date,total_rate,current_count,total_member_count,total_worker_count,highest_rate_name,highest_rate_value,lowest_rate_name,lowest_rate_value",
      )
      .order("type")
      .returns<AnalyticsSummary[]>(),
  );

  const topSectors = await readMany<SectorRow>(
    supabase
      .from("sectors")
      .select("id,source_id,type,group_no,name,current_union_count,current_union_rate,current_member_count,current_worker_count,latest_source_date")
      .order("current_member_count", { ascending: false })
      .limit(10)
      .returns<SectorRow[]>(),
  );

  const topUnions = await readMany<UnionRow>(
    supabase
      .from("unions")
      .select(
        "id,source_id,type,name,full_name,address,phone_number,confederation_source_id,confederation_name,established_year,website,email,sector_name,sector_no,sector_source_id,sector_ranking,bargaining_authority,member_count,worker_count,is_sector,is_open,source_detail_available,updated_at",
      )
      .order("member_count", { ascending: false })
      .limit(10)
      .returns<UnionRow[]>(),
  );

  const topConfederations = await readMany<ConfederationRow>(
    supabase
      .from("confederations")
      .select(
        "id,source_id,type,name,full_name,established_year,president,address,phone_number,email,website,union_count,member_count,union_with_authority,latest_source_date",
      )
      .order("member_count", { ascending: false })
      .limit(10)
      .returns<ConfederationRow[]>(),
  );

  const latestDates = await readMany<SourceDate>(
    supabase
      .from("source_dates")
      .select("type,source_date,is_latest")
      .eq("is_latest", true)
      .returns<SourceDate[]>(),
  );

  if (summaries.length === 0) {
    return getLiveDashboardData();
  }

  return { summaries, topSectors, topUnions, topConfederations, latestDates };
}

export async function getSectors(type: UnionType | "all") {
  const supabase = client();
  if (!supabase) {
    return getLiveSectors(type);
  }
  const baseQuery = supabase
    .from("sectors")
    .select("id,source_id,type,group_no,name,current_union_count,current_union_rate,current_member_count,current_worker_count,latest_source_date")
    .order("type")
    .order("group_no");
  const query = type === "all" ? baseQuery : baseQuery.eq("type", type);
  const rows = await readMany<SectorRow>(query.returns<SectorRow[]>());
  return rows.length > 0 ? rows : getLiveSectors(type);
}

async function getLiveSectors(type: UnionType | "all"): Promise<SectorRow[]> {
  const dates = await latestSourceDates();
  const types: UnionType[] = type === "all" ? ["labor", "civil"] : [type];
  const rows = await Promise.all(
    types.map(async (sourceType) => {
      const date = dates[sourceType];
      const sectors = date ? await sourceJson<SourceSector[]>("/sector", { type: apiType(sourceType), date }) : [];
      return (sectors ?? []).map((sector) => ({
        id: sector.id,
        source_id: sector.id,
        type: sourceType,
        group_no: sector.groupNo,
        name: sector.name,
        current_union_count: sector.unionCount,
        current_union_rate: sector.unionRate,
        current_member_count: sector.memberCount,
        current_worker_count: sector.count,
        latest_source_date: date,
      }));
    }),
  );
  return rows.flat().sort((left, right) => {
    if (left.type !== right.type) {
      return left.type.localeCompare(right.type);
    }
    return (left.group_no ?? "").localeCompare(right.group_no ?? "", "tr");
  });
}

export async function getSectorDetail(type: UnionType, sourceId: number) {
  const supabase = client();
  if (!supabase) {
    return getLiveSectorDetail(type, sourceId);
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
    return getLiveSectorDetail(type, sourceId);
  }
  const snapshots = await readMany<SectorSnapshot>(
    supabase
      .from("sector_snapshots")
      .select("source_date,union_count,union_rate,member_count,worker_count")
      .eq("sector_id", sector.id)
      .order("source_date")
      .returns<SectorSnapshot[]>(),
  );
  const unions = await readMany<SectorUnion>(
    supabase
      .from("sector_unions")
      .select("union_source_id,union_name,union_member_count,sector_worker_count,member_ratio")
      .eq("sector_id", sector.id)
      .order("union_member_count", { ascending: false })
      .returns<SectorUnion[]>(),
  );
  return snapshots.length > 0 || unions.length > 0 ? { sector, snapshots, unions } : getLiveSectorDetail(type, sourceId);
}

async function getLiveSectorDetail(type: UnionType, sourceId: number) {
  const dates = await latestSourceDates();
  const date = dates[type];
  const current = date ? await sourceJson<SourceSector[]>("/sector", { type: apiType(type), date }) : [];
  const sectorSource = (current ?? []).find((sector) => sector.id === sourceId);
  if (!sectorSource) {
    return { sector: null, snapshots: [], unions: [] };
  }
  const sector: SectorRow = {
    id: sectorSource.id,
    source_id: sectorSource.id,
    type,
    group_no: sectorSource.groupNo,
    name: sectorSource.name,
    current_union_count: sectorSource.unionCount,
    current_union_rate: sectorSource.unionRate,
    current_member_count: sectorSource.memberCount,
    current_worker_count: sectorSource.count,
    latest_source_date: date,
  };
  const workerHistory = await sourceJson<SourceCount[]>("/sector/members", { id: sourceId });
  const unionHistory = await sourceJson<SourceCount[]>("/sector/union-counts", { id: sourceId });
  const byDate = new Map<string, SectorSnapshot>();
  for (const item of workerHistory ?? []) {
    byDate.set(item.date, {
      source_date: item.date,
      member_count: 0,
      worker_count: item.count,
      union_count: 0,
      union_rate: 0,
    });
  }
  for (const item of unionHistory ?? []) {
    const existing = byDate.get(item.date);
    if (existing) {
      existing.member_count = item.count;
      existing.union_rate = Number(existing.worker_count) ? (item.count * 100) / Number(existing.worker_count) : 0;
    }
  }
  const sourceUnions = date ? await sourceJson<SourceSectorUnion[]>("/sector/unions", { id: sourceId, date }) : [];
  const unions: SectorUnion[] = (sourceUnions ?? []).map((item) => ({
    union_source_id: item.unionId,
    union_name: item.unionName,
    union_member_count: item.unionMember,
    sector_worker_count: item.sectorMember,
    member_ratio: item.memberRatio ?? (item.sectorMember ? (item.unionMember * 100) / item.sectorMember : 0),
  }));
  return { sector, snapshots: Array.from(byDate.values()).sort((left, right) => left.source_date.localeCompare(right.source_date)), unions };
}

export async function getConfederations(type: UnionType | "all") {
  const supabase = client();
  if (!supabase) {
    return getLiveConfederations(type);
  }
  const baseQuery = supabase
    .from("confederations")
    .select(
      "id,source_id,type,name,full_name,established_year,president,address,phone_number,email,website,union_count,member_count,union_with_authority,latest_source_date",
    )
    .order("member_count", { ascending: false });
  const query = type === "all" ? baseQuery : baseQuery.eq("type", type);
  const rows = await readMany<ConfederationRow>(query.returns<ConfederationRow[]>());
  return rows.length > 0 ? rows : getLiveConfederations(type);
}

async function getLiveConfederations(type: UnionType | "all"): Promise<ConfederationRow[]> {
  const dates = await latestSourceDates();
  const types: UnionType[] = type === "all" ? ["labor", "civil"] : [type];
  const rows = await Promise.all(
    types.map(async (sourceType) => {
      const summary = await sourceJson<SourceConfederation[]>("/confederation/confederations-summary", { type: apiType(sourceType) });
      return (summary ?? []).map((item) => ({
        id: item.id,
        source_id: item.id,
        type: sourceType,
        name: item.name,
        full_name: item.fullName ?? null,
        established_year: item.establishedYear ? String(item.establishedYear) : null,
        president: item.president ?? null,
        address: item.address ?? null,
        phone_number: item.phoneNumber ?? null,
        email: item.email ?? null,
        website: item.website ?? null,
        union_count: item.unionCount ?? 0,
        member_count: item.memberCount ?? 0,
        union_with_authority: item.unionWithAuthority ?? 0,
        latest_source_date: dates[sourceType],
      }));
    }),
  );
  return rows.flat().sort((left, right) => Number(right.member_count) - Number(left.member_count));
}

export async function getConfederationDetail(type: UnionType, sourceId: number) {
  const supabase = client();
  if (!supabase) {
    return getLiveConfederationDetail(type, sourceId);
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
    return getLiveConfederationDetail(type, sourceId);
  }
  const snapshots = await readMany<ConfederationSnapshot>(
    supabase
      .from("confederation_snapshots")
      .select("source_date,member_count,union_count,union_with_authority")
      .eq("confederation_id", confederation.id)
      .order("source_date")
      .returns<ConfederationSnapshot[]>(),
  );
  const unions = await readMany<ConfederationUnion>(
    supabase
      .from("confederation_unions")
      .select("union_source_id,union_name,sector_group,member_count,member_ratio")
      .eq("confederation_id", confederation.id)
      .order("member_count", { ascending: false })
      .returns<ConfederationUnion[]>(),
  );
  return snapshots.length > 0 || unions.length > 0 ? { confederation, snapshots, unions } : getLiveConfederationDetail(type, sourceId);
}

async function getLiveConfederationDetail(type: UnionType, sourceId: number) {
  const dates = await latestSourceDates();
  const latestDate = dates[type];
  const detail = await sourceJson<SourceConfederation>("/confederation", { id: sourceId });
  const summary = await sourceJson<SourceConfederation[]>("/confederation/confederations-summary", { type: apiType(type) });
  const summaryRow = (summary ?? []).find((item) => item.id === sourceId);
  if (!detail && !summaryRow) {
    return { confederation: null, snapshots: [], unions: [] };
  }
  const source = detail ?? summaryRow;
  const confederation: ConfederationRow = {
    id: sourceId,
    source_id: sourceId,
    type,
    name: source?.name ?? "",
    full_name: source?.fullName ?? null,
    established_year: source?.establishedYear ? String(source.establishedYear) : null,
    president: source?.president ?? null,
    address: source?.address ?? null,
    phone_number: source?.phoneNumber ?? null,
    email: source?.email ?? null,
    website: source?.website ?? null,
    union_count: summaryRow?.unionCount ?? source?.unionCount ?? 0,
    member_count: summaryRow?.memberCount ?? source?.memberCount ?? 0,
    union_with_authority: summaryRow?.unionWithAuthority ?? source?.unionWithAuthority ?? 0,
    latest_source_date: latestDate,
  };
  const counts = await sourceJson<SourceCount[]>("/confederation/counts", { id: sourceId });
  const snapshots: ConfederationSnapshot[] = (counts ?? []).map((item) => ({
    source_date: item.date,
    member_count: item.count,
    union_count: confederation.union_count,
    union_with_authority: confederation.union_with_authority,
  }));
  const sourceUnions = latestDate ? await sourceJson<SourceConfederationUnion[]>("/confederation/unions", { id: sourceId, date: latestDate }) : [];
  const unions: ConfederationUnion[] = (sourceUnions ?? []).map((item) => ({
    union_source_id: item.id,
    union_name: item.unionName,
    sector_group: item.sector ?? null,
    member_count: item.memberCount,
    member_ratio: item.memberRatio ?? 0,
  }));
  return { confederation, snapshots, unions };
}

export async function getUnions(type: UnionType | "all", search: string) {
  const supabase = client();
  if (!supabase) {
    return getLiveUnions(type, search);
  }
  const baseQuery = supabase
    .from("unions")
    .select(
      "id,source_id,type,name,full_name,address,phone_number,confederation_source_id,confederation_name,established_year,website,email,sector_name,sector_no,sector_source_id,sector_ranking,bargaining_authority,member_count,worker_count,is_sector,is_open,source_detail_available,updated_at",
    )
    .order("type")
    .order("member_count", { ascending: false })
    .limit(1200);
  const query = type === "all" ? baseQuery : baseQuery.eq("type", type);
  const rows = await readMany<UnionRow>(query.returns<UnionRow[]>());
  if (!hasUsableUnionRows(rows, type)) {
    return getLiveUnions(type, search);
  }
  const normalized = search.trim().toLocaleLowerCase("tr-TR");
  if (!normalized) {
    return rows;
  }
  return rows.filter((row) => {
    const haystack = `${row.name} ${row.full_name ?? ""}`.toLocaleLowerCase("tr-TR");
    return haystack.includes(normalized);
  });
}

async function getLiveUnions(type: UnionType | "all", search: string): Promise<UnionRow[]> {
  const sourceRows = await sourceJson<SourceSearchItem[]>("/home/all");
  const rows = (sourceRows ?? []).filter(isSearchUnion).map((item) => sourceUnionToRow(item));
  const typedRows = type === "all" ? rows : rows.filter((row) => row.type === type);
  const normalized = search.trim().toLocaleLowerCase("tr-TR");
  const filtered = normalized
    ? typedRows.filter((row) => `${row.name} ${row.full_name ?? ""}`.toLocaleLowerCase("tr-TR").includes(normalized))
    : typedRows;
  return filtered.sort((left, right) => left.name.localeCompare(right.name, "tr"));
}

export async function getUnionDetail(type: UnionType, sourceId: number) {
  const supabase = client();
  if (!supabase) {
    return getLiveUnionDetail(type, sourceId);
  }
  const union = await readOne<UnionRow>(
    supabase
      .from("unions")
      .select(
        "id,source_id,type,name,full_name,address,phone_number,confederation_source_id,confederation_name,established_year,president,website,email,sector_name,sector_no,sector_source_id,sector_ranking,bargaining_authority,member_count,worker_count,is_sector,is_open,source_detail_available,updated_at",
      )
      .eq("type", type)
      .eq("source_id", sourceId)
      .limit(1)
      .returns<UnionRow[]>(),
  );
  if (!union) {
    return getLiveUnionDetail(type, sourceId);
  }
  const counts = await readMany<UnionCount>(
    supabase
      .from("union_counts")
      .select("source_date,member_count")
      .eq("union_id", union.id)
      .order("source_date")
      .returns<UnionCount[]>(),
  );
  if (counts.length > 0 && union.president) {
    return { union, counts };
  }
  const detail = await sourceJson<SourceUnionDetail>("/union", { id: sourceId });
  const mergedUnion = mergeUnionDetail(union, detail);
  const mergedCounts = counts.length > 0 ? counts : await getLiveUnionCounts(sourceId);
  if (mergedCounts.length > 0 || mergedUnion.source_detail_available) {
    return { union: mergedUnion, counts: mergedCounts };
  }
  return getLiveUnionDetail(type, sourceId);
}

async function getLiveUnionDetail(type: UnionType, sourceId: number) {
  const sourceRows = await sourceJson<SourceSearchItem[]>("/home/all");
  const baseRow = (sourceRows ?? []).find((item) => item.id === sourceId && isSearchUnion(item) && fromSearchSector(item.sector) === type);
  if (!baseRow) {
    return { union: null, counts: [] };
  }
  const detail = await sourceJson<SourceUnionDetail>("/union", { id: sourceId });
  const union = sourceUnionToRow(baseRow, detail);
  const counts = union.source_detail_available ? await getLiveUnionCounts(sourceId) : [];
  return { union, counts };
}
