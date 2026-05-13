"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Loader2, Search, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import type { UnionType } from "@/lib/types";

type SearchVariant = "header" | "mobile" | "page";

type SearchSuggestion = {
  id: string;
  href: string;
  name: string;
  fullName: string | null;
  typeLabel: string;
  confederationName: string | null;
  sectorName: string | null;
  memberCount: string;
};

type SearchBoxProps = {
  variant: SearchVariant;
  defaultValue?: string;
  type?: UnionType | "all";
  onSubmit?: () => void;
  onSelect?: () => void;
};

const MIN_QUERY_LENGTH = 3;

const variantClassNames: Record<
  SearchVariant,
  {
    wrapper: string;
    form: string;
    dropdown: string;
    placeholder: string;
    showShortcut?: boolean;
    showSubmit?: boolean;
  }
> = {
  header: {
    wrapper: "relative hidden min-w-32 max-w-64 w-[18vw] xl:block",
    form:
      "flex h-9 w-full items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 transition-all focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20",
    dropdown: "absolute right-0 top-full z-50 mt-2 w-[min(28rem,calc(100vw-2rem))]",
    placeholder: "Sendika ara...",
    showShortcut: true,
  },
  mobile: {
    wrapper: "mt-2",
    form:
      "flex min-w-0 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 transition-all focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20",
    dropdown: "mt-2",
    placeholder: "Sendika adına göre ara",
  },
  page: {
    wrapper: "relative w-full min-w-0 xl:flex-1 xl:basis-[45vw] xl:max-w-3xl",
    form:
      "flex min-h-11 w-full min-w-0 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 transition-all focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20",
    dropdown: "absolute left-0 right-0 top-full z-40 mt-2",
    placeholder: "Sendika adına göre ara",
    showSubmit: true,
  },
};

export function SearchBox({ variant, defaultValue = "", type = "all", onSubmit, onSelect }: SearchBoxProps) {
  const config = variantClassNames[variant];
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [items, setItems] = useState<SearchSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const query = value.trim();
  const canSearch = query.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    if (!config.showShortcut) return;

    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase("tr-TR") === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        if (canSearch) setOpen(true);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [canSearch, config.showShortcut]);

  useEffect(() => {
    if (!canSearch) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setOpen(true);
      try {
        const params = new URLSearchParams({ q: query, limit: "8" });
        if (type !== "all") {
          params.set("type", type);
        }
        const response = await fetch(`/api/search?${params.toString()}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error("Arama önerileri alınamadı.");
        }
        const payload = (await response.json()) as { items?: SearchSuggestion[] };
        setItems(payload.items ?? []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setItems([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 220);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [canSearch, query, type]);

  function handleSubmit() {
    setOpen(false);
    onSubmit?.();
  }

  function handleSelect() {
    setOpen(false);
    onSelect?.();
  }

  return (
    <div className={config.wrapper}>
      <form action="/sendikalar" className={config.form} onSubmit={handleSubmit}>
        {type !== "all" ? <input type="hidden" name="type" value={type} /> : null}
        <Search className="h-4 w-4 shrink-0 text-zinc-500" />
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={value}
          autoComplete="off"
          placeholder={config.placeholder}
          className="min-w-0 flex-1 border-none bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open}
          aria-haspopup="listbox"
          onBlur={() => window.setTimeout(() => setOpen(false), 140)}
          onChange={(event) => {
            const nextValue = event.target.value;
            setValue(nextValue);
            if (nextValue.trim().length < MIN_QUERY_LENGTH) {
              setItems([]);
              setLoading(false);
              setOpen(false);
            }
          }}
          onFocus={() => {
            if (canSearch) setOpen(true);
          }}
        />
        {config.showShortcut ? (
          <kbd className="hidden shrink-0 rounded border border-white/[0.1] bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 2xl:inline-block">
            ⌘K
          </kbd>
        ) : null}
        {config.showSubmit ? (
          <button className="shrink-0 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/20">
            Ara
          </button>
        ) : null}
      </form>

      {open && canSearch ? (
        <div
          id={listId}
          role="listbox"
          className={cn(
            "overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl",
            config.dropdown,
          )}
        >
          {loading ? (
            <div className="flex items-center gap-2 px-3 py-3 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Aranıyor...
            </div>
          ) : items.length > 0 ? (
            <div className="max-h-80 overflow-y-auto py-1">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  role="option"
                  onClick={handleSelect}
                  className="flex min-w-0 items-start gap-3 px-3 py-2.5 transition-colors hover:bg-white/[0.06]"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                    <Users className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-zinc-100">{item.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-zinc-500">
                      {item.typeLabel}
                      {item.confederationName ? ` · ${item.confederationName}` : ""}
                      {item.sectorName ? ` · ${item.sectorName}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 pt-0.5 text-xs font-semibold tabular-nums text-zinc-400">{item.memberCount}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-3 py-3 text-sm text-zinc-500">Sonuç bulunamadı.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
