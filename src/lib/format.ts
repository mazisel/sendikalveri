import type { NumericValue, SearchParams, UnionType } from "./types";

export const TYPE_LABELS: Record<UnionType, string> = {
  labor: "İşçi",
  civil: "Kamu",
};

export const TYPE_DESCRIPTIONS: Record<UnionType, string> = {
  labor: "İş kolları ve işçi sendikaları",
  civil: "Hizmet kolları ve kamu görevlileri sendikaları",
};

export function toNumber(value: NumericValue | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  return Number(value);
}

export function formatNumber(value: NumericValue | undefined): string {
  return new Intl.NumberFormat("tr-TR").format(toNumber(value));
}

export function formatPercent(value: NumericValue | undefined, digits = 2): string {
  return `%${toNumber(value).toLocaleString("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "Veri yok";
  }
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function normalizeType(value: string | string[] | undefined): UnionType | "all" {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "civil" || raw === "kamu") {
    return "civil";
  }
  if (raw === "labor" || raw === "isci") {
    return "labor";
  }
  return "all";
}

export function typeFromParam(value: string): UnionType {
  return value === "civil" || value === "kamu" ? "civil" : "labor";
}

export function queryText(searchParams: SearchParams, key: string): string {
  const value = searchParams[key];
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

export function compactName(value: string, max = 26): string {
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}
