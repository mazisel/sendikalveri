export type UnionType = "labor" | "civil";

export type NumericValue = number | string | null;

export type SearchParams = {
  [key: string]: string | string[] | undefined;
};

export type AnalyticsSummary = {
  type: UnionType;
  latest_source_date: string | null;
  total_rate: NumericValue;
  current_count: number | null;
  total_member_count: NumericValue;
  total_worker_count: NumericValue;
  highest_rate_name: string | null;
  highest_rate_value: NumericValue;
  lowest_rate_name: string | null;
  lowest_rate_value: NumericValue;
};

export type SourceDate = {
  type: UnionType;
  source_date: string;
  is_latest: boolean;
};

export type UnionRow = {
  id: number;
  source_id: number;
  file_number?: number | null;
  type: UnionType;
  name: string;
  full_name: string | null;
  address: string | null;
  phone_number: string | null;
  confederation_source_id: number | null;
  confederation_name: string | null;
  established_year: number | null;
  president?: string | null;
  website: string | null;
  email: string | null;
  sector_name: string | null;
  sector_no: string | null;
  sector_source_id: number | null;
  sector_ranking: number | null;
  bargaining_authority: boolean | null;
  member_count: NumericValue;
  worker_count: NumericValue;
  is_sector: boolean | null;
  is_open: boolean | null;
  source_detail_available: boolean;
  updated_at: string | null;
};

export type UnionCount = {
  source_date: string;
  member_count: NumericValue;
};

export type SectorRow = {
  id: number;
  source_id: number;
  type: UnionType;
  group_no: string | null;
  name: string;
  current_union_count: number | null;
  current_union_rate: NumericValue;
  current_member_count: NumericValue;
  current_worker_count: NumericValue;
  latest_source_date: string | null;
};

export type SectorSnapshot = {
  source_date: string;
  union_count: number | null;
  union_rate: NumericValue;
  member_count: NumericValue;
  worker_count: NumericValue;
};

export type SectorUnion = {
  union_source_id: number;
  union_name: string;
  union_member_count: NumericValue;
  sector_worker_count: NumericValue;
  member_ratio: NumericValue;
};

export type ConfederationRow = {
  id: number;
  source_id: number;
  type: UnionType;
  name: string;
  full_name: string | null;
  established_year: string | null;
  president: string | null;
  address: string | null;
  phone_number: string | null;
  email: string | null;
  website: string | null;
  union_count: number | null;
  member_count: NumericValue;
  union_with_authority: number | null;
  latest_source_date: string | null;
};

export type ConfederationSnapshot = {
  source_date: string;
  member_count: NumericValue;
  union_count: number | null;
  union_with_authority: number | null;
};

export type ConfederationUnion = {
  union_source_id: number;
  union_name: string;
  sector_group: string | null;
  member_count: NumericValue;
  member_ratio: NumericValue;
};

export type ChartDatum = {
  name: string;
  value: number;
  secondary?: number;
};
