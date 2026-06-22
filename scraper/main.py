import argparse
import html
import os
import re
import sys
import unicodedata
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests
from requests.adapters import HTTPAdapter
from dotenv import load_dotenv
from supabase import Client, create_client
from urllib3.util.retry import Retry

BASE_URL = "https://sendikadata.com"
CSGB_BASE_URL = "https://www.csgb.gov.tr"
CSGB_UNION_SEARCH_PATH = "/api/union/UnionSearch"
OFFICIAL_CIVIL_UNIONS_URL = "https://aile.gov.tr/sendikalar/hizmet-kollarina-gore-kgs/"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    "Accept": "application/json",
}
TYPE_TO_BOOL = {"labor": True, "civil": False}
BOOL_KEY_TO_TYPE = {"true": "labor", "false": "civil"}
# The source API id is not the official "Sendika Dosya No".
KNOWN_LABOR_FILE_NUMBERS = [
    {
        "file_number": 337,
        "name": "TÜM EMEK-SEN",
        "full_name": "Turizm Otel Spor Emekçileri Sendikası",
    },
    {
        "file_number": 492,
        "name": "YENİ TÜM GÜVENLİK-İŞ",
        "full_name": "Yeni Tüm Güvenlik Savunma İşçileri Sendikası",
    },
    {
        "file_number": 543,
        "name": "MAĞAZA-MARKET SEN",
        "full_name": "Mağaza ve Market İşçileri Sendikası",
    },
]
KNOWN_CIVIL_FILE_NUMBERS = [
    {
        "file_number": 424,
        "name": "HTK-SEN",
        "full_name": "Hava Trafik Kontrolörleri ve Diğer Ulaştırma Çalışanları Sendikası",
    },
    {
        "file_number": 425,
        "name": "HÜRRİYETÇİ ULAŞIM-SEN",
        "full_name": "Hürriyetçi Ulaştırma Hizmetleri Kamu Çalışanları Sendikası",
    },
    {
        "file_number": 435,
        "name": "MÜHENDİS TEK-SEN ULAŞTIRMA",
        "full_name": "Mühendis, Teknik Hizmetler ve Diğer Ulaştırma Hizmetleri Çalışanları Sendikası",
    },
    {
        "file_number": 436,
        "name": "HAVACILIK UZMANLARI SENDİKASI",
        "full_name": "Havacılık Uzmanları ve Ulaştırma Hizmetleri Kamu Çalışanları Sendikası",
    },
    {
        "file_number": 482,
        "name": "KAMU ULAŞIM-SEN",
        "full_name": "Ulaştırma Kamu Çalışanları Sendikası",
    },
    {
        "file_number": 470,
        "name": "YHS BÜRO-SEN",
        "full_name": "Yardımcı Hizmetler Sınıfı ve Büro Çalışanları Sendikası",
    },
]

SESSION = requests.Session()
SESSION.headers.update(HEADERS)
SESSION.mount(
    "https://",
    HTTPAdapter(
        max_retries=Retry(
            total=3,
            connect=3,
            read=3,
            backoff_factor=0.8,
            status_forcelist=(429, 500, 502, 503, 504),
            allowed_methods=("GET",),
        )
    ),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Sync sendikadata.com into Supabase.")
    parser.add_argument("--dry-run", action="store_true", help="Fetch and validate source data without writing Supabase.")
    parser.add_argument("--skip-details", action="store_true", help="Skip per-union detail/count endpoints for a faster sync.")
    parser.add_argument("--env", default="../.env.local", help="Path to env file relative to scraper directory.")
    return parser.parse_args()


def load_env(env_path: str) -> None:
    base = Path(__file__).resolve().parent
    load_dotenv(dotenv_path=(base / env_path).resolve())


def get_client() -> Client:
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not service_key:
        raise RuntimeError("Supabase bilgileri bulunamadı: NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.")
    return create_client(supabase_url, service_key)


def get_json(path: str, params: dict[str, Any] | None = None) -> Any:
    response = SESSION.get(f"{BASE_URL}{path}", params=params, timeout=(10, 60))
    response.raise_for_status()
    return response.json()


def post_csgb(path: str, data: dict[str, Any]) -> Any:
    response = SESSION.post(f"{CSGB_BASE_URL}{path}", data=data, timeout=(10, 60))
    response.raise_for_status()
    return response.json()


def as_type(value: bool | str | None) -> str:
    if value is True or value == "true" or value == "labor":
        return "labor"
    return "civil"


def as_home_union_type(item: dict[str, Any]) -> str:
    return "civil" if item.get("sector") is False or item.get("sector") == "false" else "labor"


def is_home_union(item: dict[str, Any]) -> bool:
    return item.get("type") is True or item.get("type") == "true"


def as_int(value: Any, default: int = 0) -> int:
    if value is None or value == "":
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def as_float(value: Any, default: float = 0.0) -> float:
    if value is None or value == "":
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def normalize_key(value: Any) -> str:
    text = str(value or "").replace("ı", "i").replace("İ", "I")
    text = "".join(
        char
        for char in unicodedata.normalize("NFKD", text)
        if not unicodedata.combining(char)
    )
    text = re.sub(r"[^A-Za-z0-9]+", " ", text).upper()
    return re.sub(r"\s+", " ", text).strip()


def normalized_variants(value: Any) -> set[str]:
    raw = str(value or "")
    values = {raw}
    if "/" in raw:
        values.update(part for part in raw.split("/") if part.strip())

    variants: set[str] = set()
    for item in values:
        key = normalize_key(item)
        if not key:
            continue
        variants.add(key)
        without_sendikasi = re.sub(r"\bSENDIKASI\b", " ", key)
        without_sendikasi = re.sub(r"\s+", " ", without_sendikasi).strip()
        if without_sendikasi:
            variants.add(without_sendikasi)
    return variants


def file_number_keys(name: Any, full_name: Any = None) -> list[str]:
    name_keys = normalized_variants(name)
    full_keys = normalized_variants(full_name)
    keys = []
    for name_key in name_keys:
        for full_key in full_keys:
            keys.append(f"{name_key}|{full_key}")
    keys.extend(full_keys)
    keys.extend(name_keys)
    return keys


def add_file_number_mapping(mapping: dict[str, int], name: Any, full_name: Any, file_number: int) -> None:
    for key in file_number_keys(name, full_name):
        mapping.setdefault(key, file_number)


def html_lines(value: str) -> list[str]:
    value = re.sub(r"(?i)<br\s*/?>", "\n", value)
    value = re.sub(r"(?i)</p>", "\n", value)
    value = re.sub(r"<[^>]+>", " ", value)
    value = html.unescape(value)
    return [re.sub(r"\s+", " ", line).strip() for line in value.splitlines() if line.strip()]


def source_file_number(source: dict[str, Any] | None) -> int | None:
    if not source:
        return None
    for key in ("fileNumber", "fileNo", "dosyaNo", "sendikaDosyaNo", "registrationNumber"):
        value = as_int(source.get(key))
        if value:
            return value
    return None


def official_file_number(source: dict[str, Any] | None, official_map: dict[str, int]) -> int | None:
    if not source:
        return None
    explicit_file_number = source_file_number(source)
    if explicit_file_number:
        return explicit_file_number
    for key in file_number_keys(source.get("name"), source.get("fullName")):
        if key in official_map:
            return official_map[key]
    return None


def get_official_civil_file_numbers() -> dict[str, int]:
    mapping: dict[str, int] = {}
    try:
        response = SESSION.get(OFFICIAL_CIVIL_UNIONS_URL, timeout=(10, 30), headers={"Accept": "text/html"})
        response.raise_for_status()
        for row_html in re.findall(r"(?is)<tr\b.*?</tr>", response.text):
            cells = re.findall(r"(?is)<td\b[^>]*>(.*?)</td>", row_html)
            if len(cells) < 4:
                continue
            file_number = as_int(" ".join(html_lines(cells[2])))
            title_lines = html_lines(cells[3])
            if not file_number or not title_lines:
                continue
            add_file_number_mapping(
                mapping,
                title_lines[0],
                " ".join(title_lines[1:]) if len(title_lines) > 1 else None,
                file_number,
            )
    except requests.RequestException as exc:
        print(f"Official civil file number source skipped: {exc}", file=sys.stderr)

    for item in KNOWN_CIVIL_FILE_NUMBERS:
        add_file_number_mapping(mapping, item["name"], item["full_name"], item["file_number"])
    return mapping


def get_csgb_file_numbers(type_label: str) -> dict[str, int]:
    mapping: dict[str, int] = {}
    page_number = 1
    total_page = 1
    while page_number <= total_page:
        data = post_csgb(
            CSGB_UNION_SEARCH_PATH,
            {
                "according": "Business",
                "fileno": "FileNo",
                "type": type_label,
                "name": "",
                "dataSourceRequest.PageSize": 50,
                "dataSourceRequest.PageNumber": page_number,
            },
        )
        result = data.get("data", {}) if isinstance(data, dict) else {}
        total_page = as_int(result.get("TotalPage"), 1)
        for item in result.get("Data", []) or []:
            file_number = as_int(item.get("FileNo"))
            if not file_number:
                continue
            add_file_number_mapping(mapping, item.get("ShortName"), item.get("LongName"), file_number)
        page_number += 1
    return mapping


def get_official_file_numbers() -> dict[str, dict[str, int]]:
    civil = get_official_civil_file_numbers()
    try:
        civil.update(get_csgb_file_numbers("Kamu"))
    except requests.RequestException as exc:
        print(f"Official CSGB public-sector file numbers skipped: {exc}", file=sys.stderr)

    labor: dict[str, int] = {}
    try:
        labor = get_csgb_file_numbers("İşçi")
    except requests.RequestException as exc:
        print(f"Official CSGB worker file numbers skipped: {exc}", file=sys.stderr)
    for item in KNOWN_LABOR_FILE_NUMBERS:
        add_file_number_mapping(labor, item["name"], item["full_name"], item["file_number"])

    return {"labor": labor, "civil": civil}


def chunks(rows: list[dict[str, Any]], size: int = 500) -> list[list[dict[str, Any]]]:
    return [rows[index : index + size] for index in range(0, len(rows), size)]


def upsert_many(supabase: Client, table: str, rows: list[dict[str, Any]], on_conflict: str) -> None:
    if not rows:
        return
    for chunk in chunks(rows):
        supabase.table(table).upsert(chunk, on_conflict=on_conflict).execute()


def delete_stale_unions(supabase: Client, current_rows: list[dict[str, Any]]) -> None:
    current_keys = {(row["source_id"], row["type"]) for row in current_rows}
    existing_rows = supabase.table("unions").select("id,source_id,type").execute().data
    stale_ids = [
        row["id"]
        for row in existing_rows
        if (row["source_id"], row["type"]) not in current_keys
    ]
    for chunk in chunks(stale_ids):
        supabase.table("unions").delete().in_("id", chunk).execute()


def start_sync_run(supabase: Client) -> str | None:
    try:
        run = supabase.table("sync_runs").insert({"status": "running"}).execute().data[0]
        return run["id"]
    except Exception as exc:
        if "sync_runs" in str(exc):
            return None
        raise


def finish_sync_run(supabase: Client, run_id: str | None, status: str, message: str, counts: dict[str, int] | None = None) -> None:
    if not run_id:
        return
    payload: dict[str, Any] = {
        "status": status,
        "finished_at": datetime.now(timezone.utc).isoformat(),
        "message": message,
    }
    if counts is not None:
        payload["source_counts"] = counts
    supabase.table("sync_runs").update(payload).eq("id", run_id).execute()


def build_source_dates(raw_dates: dict[str, list[str]]) -> tuple[list[dict[str, Any]], dict[str, str]]:
    rows: list[dict[str, Any]] = []
    latest: dict[str, str] = {}
    for bool_key, source_type in BOOL_KEY_TO_TYPE.items():
        dates = raw_dates.get(bool_key, [])
        if dates:
            latest[source_type] = dates[0]
        for index, source_date in enumerate(dates):
            rows.append({"type": source_type, "source_date": source_date, "is_latest": index == 0})
    return rows, latest


def base_union_row(item: dict[str, Any], official_file_numbers: dict[str, dict[str, int]]) -> dict[str, Any]:
    row_type = as_home_union_type(item)
    type_file_numbers = official_file_numbers.get(row_type, {})
    return {
        "source_id": item.get("id"),
        "file_number": official_file_number(item, type_file_numbers),
        "type": row_type,
        "name": item.get("name") or "",
        "full_name": item.get("fullName"),
        "is_sector": item.get("type"),
        "is_open": item.get("open"),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


def merge_union_detail(row: dict[str, Any], detail: dict[str, Any] | None, official_file_numbers: dict[str, dict[str, int]]) -> dict[str, Any]:
    if not detail or as_type(detail.get("type")) != row["type"]:
        return row
    type_file_numbers = official_file_numbers.get(row["type"], {})
    row.update(
        {
            "name": detail.get("name") or row["name"],
            "full_name": detail.get("fullName") or row.get("full_name"),
            "file_number": official_file_number(detail, type_file_numbers) or row.get("file_number"),
            "address": detail.get("address"),
            "phone_number": detail.get("phoneNumber"),
            "confederation_source_id": detail.get("confederationId"),
            "confederation_name": detail.get("confederation"),
            "established_year": detail.get("establishedYear"),
            "president": detail.get("president"),
            "website": detail.get("website"),
            "email": detail.get("email"),
            "sector_name": detail.get("sector"),
            "sector_no": detail.get("sectorNo"),
            "sector_source_id": detail.get("sectorId"),
            "sector_ranking": detail.get("sectorRanking"),
            "bargaining_authority": detail.get("bargainingAuthority"),
            "member_count": as_int(detail.get("memberCount")),
            "worker_count": as_int(detail.get("count")),
            "is_open": detail.get("open"),
            "source_detail_available": True,
        }
    )
    return row


def build_sector_rows(
    source_type: str,
    latest_date: str,
    sectors_by_date: dict[str, list[dict[str, Any]]],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    sectors: list[dict[str, Any]] = []
    snapshots: list[dict[str, Any]] = []
    latest_sectors = sectors_by_date.get(latest_date, [])
    for item in latest_sectors:
        sectors.append(
            {
                "source_id": item.get("id"),
                "type": source_type,
                "group_no": item.get("groupNo"),
                "name": item.get("name") or "",
                "current_union_count": as_int(item.get("unionCount")),
                "current_union_rate": as_float(item.get("unionRate")),
                "current_member_count": as_int(item.get("memberCount")),
                "current_worker_count": as_int(item.get("count")),
                "latest_source_date": latest_date,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        )
    for source_date, items in sectors_by_date.items():
        for item in items:
            snapshots.append(
                {
                    "sector_source_id": item.get("id"),
                    "sector_type": source_type,
                    "source_date": source_date,
                    "union_count": as_int(item.get("unionCount")),
                    "union_rate": as_float(item.get("unionRate")),
                    "member_count": as_int(item.get("memberCount")),
                    "worker_count": as_int(item.get("count")),
                }
            )
    return sectors, snapshots


def build_analytics(
    source_type: str,
    latest_date: str,
    latest_sectors: list[dict[str, Any]],
    analytics_raw: dict[str, Any],
) -> dict[str, Any]:
    total_members = sum(as_int(item.get("memberCount")) for item in latest_sectors)
    total_workers = sum(as_int(item.get("count")) for item in latest_sectors)
    total_rate = (total_members * 100 / total_workers) if total_workers else 0
    raw = analytics_raw.get(source_type, {})
    highest = raw.get("highestRate", {}) or {}
    lowest = raw.get("lowestRate", {}) or {}
    return {
        "type": source_type,
        "latest_source_date": latest_date,
        "total_rate": total_rate,
        "current_count": as_int(raw.get("currentCount")),
        "total_member_count": total_members,
        "total_worker_count": total_workers,
        "highest_rate_name": highest.get("name"),
        "highest_rate_value": as_float(highest.get("unionRate")),
        "highest_rate_member_count": as_int(highest.get("memberCount")),
        "highest_rate_total_count": as_int(highest.get("count")),
        "lowest_rate_name": lowest.get("name"),
        "lowest_rate_value": as_float(lowest.get("unionRate")),
        "lowest_rate_member_count": as_int(lowest.get("memberCount")),
        "lowest_rate_total_count": as_int(lowest.get("count")),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


def fetch_source(skip_details: bool) -> dict[str, Any]:
    all_unions = get_json("/api/home/all")
    raw_dates = get_json("/api/home/dates")
    analytics_raw = get_json("/api/home/analytics-summary")
    tables_raw = get_json("/api/home/tables-summary")
    source_dates, latest_dates = build_source_dates(raw_dates)
    official_file_numbers = get_official_file_numbers()

    union_rows = [base_union_row(item, official_file_numbers) for item in all_unions if is_home_union(item)]
    union_counts: list[dict[str, Any]] = []
    if not skip_details:
        for row in union_rows:
            detail = get_json("/api/union", {"id": row["source_id"]})
            merge_union_detail(row, detail, official_file_numbers)
            if row.get("source_detail_available"):
                counts = get_json("/api/union/counts", {"id": row["source_id"]})
                for item in counts:
                    union_counts.append(
                        {
                            "union_source_id": row["source_id"],
                            "union_type": row["type"],
                            "source_date": item.get("date"),
                            "member_count": as_int(item.get("count")),
                        }
                    )

    sectors: list[dict[str, Any]] = []
    sector_snapshots: list[dict[str, Any]] = []
    sector_unions: list[dict[str, Any]] = []
    analytics_rows: list[dict[str, Any]] = []

    for source_type, bool_value in TYPE_TO_BOOL.items():
        bool_key = "true" if bool_value else "false"
        sectors_by_date: dict[str, list[dict[str, Any]]] = {}
        for source_date in raw_dates.get(bool_key, []):
            sectors_by_date[source_date] = get_json("/api/sector", {"type": 1 if bool_value else 0, "date": source_date})
        latest_date = latest_dates[source_type]
        type_sectors, type_snapshots = build_sector_rows(source_type, latest_date, sectors_by_date)
        sectors.extend(type_sectors)
        sector_snapshots.extend(type_snapshots)
        analytics_rows.append(build_analytics(source_type, latest_date, sectors_by_date[latest_date], analytics_raw))

        for sector in sectors_by_date[latest_date]:
            rows = get_json("/api/sector/unions", {"id": sector.get("id"), "date": latest_date})
            for item in rows:
                sector_unions.append(
                    {
                        "sector_source_id": sector.get("id"),
                        "sector_type": source_type,
                        "source_date": latest_date,
                        "union_source_id": item.get("unionId"),
                        "union_type": source_type,
                        "union_name": item.get("unionName") or "",
                        "union_member_count": as_int(item.get("unionMember")),
                        "sector_worker_count": as_int(item.get("sectorMember")),
                        "member_ratio": as_float(item.get("memberRatio")),
                    }
                )

    confederations: list[dict[str, Any]] = []
    confederation_snapshots: list[dict[str, Any]] = []
    confederation_unions: list[dict[str, Any]] = []

    for source_type, bool_value in TYPE_TO_BOOL.items():
        latest_date = latest_dates[source_type]
        summary_rows = get_json("/api/confederation/confederations-summary", {"type": 1 if bool_value else 0})
        for item in summary_rows:
            detail = get_json("/api/confederation", {"id": item.get("id")})
            confederations.append(
                {
                    "source_id": item.get("id"),
                    "type": source_type,
                    "name": detail.get("name") or item.get("name") or "",
                    "full_name": detail.get("fullName"),
                    "logo": detail.get("logo"),
                    "established_year": str(detail.get("establishedYear")) if detail.get("establishedYear") is not None else None,
                    "president": detail.get("president"),
                    "address": detail.get("address"),
                    "phone_number": detail.get("phoneNumber"),
                    "email": detail.get("email"),
                    "website": detail.get("website"),
                    "union_count": as_int(item.get("unionCount") or detail.get("unionCount")),
                    "member_count": as_int(item.get("memberCount")),
                    "union_with_authority": as_int(item.get("unionWithAuthority") or detail.get("unionWithAuthority")),
                    "latest_source_date": latest_date,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }
            )
            for count in get_json("/api/confederation/counts", {"id": item.get("id")}):
                confederation_snapshots.append(
                    {
                        "confederation_source_id": item.get("id"),
                        "confederation_type": source_type,
                        "source_date": count.get("date"),
                        "member_count": as_int(count.get("count")),
                        "union_count": as_int(item.get("unionCount")),
                        "union_with_authority": as_int(item.get("unionWithAuthority")),
                    }
                )
            for union in get_json("/api/confederation/unions", {"id": item.get("id"), "date": latest_date}):
                confederation_unions.append(
                    {
                        "confederation_source_id": item.get("id"),
                        "confederation_type": source_type,
                        "source_date": latest_date,
                        "union_source_id": union.get("id"),
                        "union_type": source_type,
                        "union_name": union.get("unionName") or "",
                        "sector_group": union.get("sector"),
                        "member_count": as_int(union.get("memberCount")),
                        "member_ratio": as_float(union.get("memberRatio")),
                    }
                )

    return {
        "source_dates": source_dates,
        "unions": union_rows,
        "union_counts": union_counts,
        "sectors": sectors,
        "sector_snapshots": sector_snapshots,
        "sector_unions": sector_unions,
        "confederations": confederations,
        "confederation_snapshots": confederation_snapshots,
        "confederation_unions": confederation_unions,
        "analytics_summary": analytics_rows,
        "tables_raw": tables_raw,
    }


def apply_sync(supabase: Client, payload: dict[str, Any]) -> None:
    run_id = start_sync_run(supabase)
    try:
        upsert_many(supabase, "source_dates", payload["source_dates"], "type,source_date")
        upsert_many(supabase, "unions", payload["unions"], "source_id,type")
        delete_stale_unions(supabase, payload["unions"])
        upsert_many(supabase, "sectors", payload["sectors"], "source_id,type")
        upsert_many(supabase, "confederations", payload["confederations"], "source_id,type")
        upsert_many(supabase, "analytics_summary", payload["analytics_summary"], "type")

        union_lookup = {
            (row["source_id"], row["type"]): row["id"]
            for row in supabase.table("unions").select("id,source_id,type").execute().data
        }
        sector_lookup = {
            (row["source_id"], row["type"]): row["id"]
            for row in supabase.table("sectors").select("id,source_id,type").execute().data
        }
        conf_lookup = {
            (row["source_id"], row["type"]): row["id"]
            for row in supabase.table("confederations").select("id,source_id,type").execute().data
        }

        union_counts = [
            {
                "union_id": union_lookup[(row["union_source_id"], row["union_type"])],
                "source_date": row["source_date"],
                "member_count": row["member_count"],
            }
            for row in payload["union_counts"]
            if (row["union_source_id"], row["union_type"]) in union_lookup
        ]
        upsert_many(supabase, "union_counts", union_counts, "union_id,source_date")

        sector_snapshots = [
            {
                "sector_id": sector_lookup[(row["sector_source_id"], row["sector_type"])],
                "source_date": row["source_date"],
                "union_count": row["union_count"],
                "union_rate": row["union_rate"],
                "member_count": row["member_count"],
                "worker_count": row["worker_count"],
            }
            for row in payload["sector_snapshots"]
            if (row["sector_source_id"], row["sector_type"]) in sector_lookup
        ]
        upsert_many(supabase, "sector_snapshots", sector_snapshots, "sector_id,source_date")

        sector_unions = [
            {
                "sector_id": sector_lookup[(row["sector_source_id"], row["sector_type"])],
                "union_id": union_lookup.get((row["union_source_id"], row["union_type"])),
                "source_date": row["source_date"],
                "union_source_id": row["union_source_id"],
                "union_name": row["union_name"],
                "union_member_count": row["union_member_count"],
                "sector_worker_count": row["sector_worker_count"],
                "member_ratio": row["member_ratio"],
            }
            for row in payload["sector_unions"]
            if (row["sector_source_id"], row["sector_type"]) in sector_lookup
        ]
        upsert_many(supabase, "sector_unions", sector_unions, "sector_id,source_date,union_source_id")

        conf_snapshots = [
            {
                "confederation_id": conf_lookup[(row["confederation_source_id"], row["confederation_type"])],
                "source_date": row["source_date"],
                "member_count": row["member_count"],
                "union_count": row["union_count"],
                "union_with_authority": row["union_with_authority"],
            }
            for row in payload["confederation_snapshots"]
            if (row["confederation_source_id"], row["confederation_type"]) in conf_lookup
        ]
        upsert_many(supabase, "confederation_snapshots", conf_snapshots, "confederation_id,source_date")

        conf_unions = [
            {
                "confederation_id": conf_lookup[(row["confederation_source_id"], row["confederation_type"])],
                "union_id": union_lookup.get((row["union_source_id"], row["union_type"])),
                "source_date": row["source_date"],
                "union_source_id": row["union_source_id"],
                "union_name": row["union_name"],
                "sector_group": row["sector_group"],
                "member_count": row["member_count"],
                "member_ratio": row["member_ratio"],
            }
            for row in payload["confederation_unions"]
            if (row["confederation_source_id"], row["confederation_type"]) in conf_lookup
        ]
        upsert_many(supabase, "confederation_unions", conf_unions, "confederation_id,source_date,union_source_id")

        counts = {
            key: len(value)
            for key, value in payload.items()
            if isinstance(value, list)
        }
        finish_sync_run(supabase, run_id, "success", "Sync completed.", counts)
    except Exception as exc:
        finish_sync_run(supabase, run_id, "failed", str(exc))
        raise


def print_summary(payload: dict[str, Any]) -> None:
    union_counter = Counter(row["type"] for row in payload["unions"])
    file_number_count = sum(1 for row in payload["unions"] if row.get("file_number"))
    file_number_counter = Counter(row["type"] for row in payload["unions"] if row.get("file_number"))
    print("Source summary")
    print(f"- unions: {len(payload['unions'])} (labor={union_counter['labor']}, civil={union_counter['civil']})")
    print(f"- official file numbers: {file_number_count} (labor={file_number_counter['labor']}, civil={file_number_counter['civil']})")
    print(f"- source dates: {len(payload['source_dates'])}")
    print(f"- sectors: {len(payload['sectors'])}")
    print(f"- sector snapshots: {len(payload['sector_snapshots'])}")
    print(f"- sector latest union rows: {len(payload['sector_unions'])}")
    print(f"- confederations: {len(payload['confederations'])}")
    print(f"- confederation snapshots: {len(payload['confederation_snapshots'])}")
    print(f"- confederation latest union rows: {len(payload['confederation_unions'])}")
    print(f"- union counts: {len(payload['union_counts'])}")
    for row in payload["analytics_summary"]:
        print(
            f"- {row['type']} totals: members={row['total_member_count']} "
            f"workers={row['total_worker_count']} rate={row['total_rate']:.2f}"
        )


def main() -> int:
    args = parse_args()
    load_env(args.env)
    try:
        payload = fetch_source(skip_details=args.skip_details)
        print_summary(payload)
        if args.dry_run:
            print("Dry-run completed without Supabase writes.")
            return 0
        apply_sync(get_client(), payload)
        print("Sync completed.")
        return 0
    except Exception as exc:
        print(f"Sync failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
