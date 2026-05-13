import { getUnions } from "@/lib/data";
import { formatNumber, normalizeType, TYPE_LABELS } from "@/lib/format";

const MIN_QUERY_LENGTH = 3;
const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 12;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();
  const type = normalizeType(searchParams.get("type") ?? undefined);
  const limit = clampLimit(searchParams.get("limit"));

  if (query.length < MIN_QUERY_LENGTH) {
    return Response.json({ items: [] });
  }

  const unions = await getUnions(type, query.slice(0, 100));
  const items = unions.slice(0, limit).map((union) => ({
    id: `${union.type}-${union.source_id}`,
    href: `/sendikalar/${union.type}/${union.source_id}`,
    name: union.name,
    fullName: union.full_name,
    type: union.type,
    typeLabel: TYPE_LABELS[union.type],
    confederationName: union.confederation_name,
    sectorName: union.sector_name,
    memberCount: formatNumber(union.member_count),
  }));

  return Response.json({ items });
}

function clampLimit(value: string | null) {
  const parsed = Number(value ?? DEFAULT_LIMIT);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_LIMIT;
  }
  return Math.min(MAX_LIMIT, Math.max(1, Math.trunc(parsed)));
}
