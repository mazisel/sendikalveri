"use client";

import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { formatNumber } from "@/lib/format";
import type { ChartDatum } from "@/lib/types";

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1"];
const MIN_CHART_SIZE = 320;

type ChartSize = {
  width: number;
  height: number;
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl px-4 py-3 shadow-2xl">
      <p className="mb-1 text-xs font-medium text-zinc-400">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-bold text-zinc-100">
          {entry.name}: {formatNumber(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function MemberBarChart({ data }: { data: ChartDatum[] }) {
  const mounted = useMounted();
  const chartHeight = Math.max(MIN_CHART_SIZE, data.length * 44 + 40);
  const { ref, size } = useChartSize(mounted);
  if (!mounted) return <EmptyChart label="Grafik yükleniyor." />;
  if (data.length === 0) return <EmptyChart />;

  return (
    <div ref={ref} style={{ height: chartHeight }} className="min-w-0 w-full">
      {size ? (
        <BarChart width={size.width} height={size.height} data={data} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.06)" />
          <YAxis dataKey="name" type="category" width={getAxisWidth(size.width)} tick={{ fill: "#a1a1aa", fontSize: 12 }} interval={0} />
          <XAxis type="number" tick={{ fill: "#71717a", fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="value" name="Üye sayısı" radius={[0, 6, 6, 0]} fill="url(#barGradient)" animationDuration={800} barSize={24} />
        </BarChart>
      ) : (
        <ChartLoading />
      )}
    </div>
  );
}

export function SharePieChart({ data }: { data: ChartDatum[] }) {
  const mounted = useMounted();
  const { ref, size } = useChartSize(mounted);
  if (!mounted) return <EmptyChart label="Grafik yükleniyor." />;
  if (data.length === 0) return <EmptyChart />;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const outerRadius = size ? getPieOuterRadius(size) : 105;
  const innerRadius = Math.floor(outerRadius * 0.66);

  return (
    <div ref={ref} className="h-80 min-w-0 w-full">
      {size ? (
        <PieChart width={size.width} height={size.height}>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={innerRadius} outerRadius={outerRadius} paddingAngle={3} animationDuration={1000}>
            {data.map((entry, index) => (
              <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="fill-zinc-300 text-xl font-bold">
            {formatNumber(total)}
          </text>
          <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" className="fill-zinc-500 text-xs">
            Toplam
          </text>
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "#a1a1aa" }} />
        </PieChart>
      ) : (
        <ChartLoading />
      )}
    </div>
  );
}

export function HistoryLineChart({ data, label }: { data: ChartDatum[]; label: string }) {
  const mounted = useMounted();
  const { ref, size } = useChartSize(mounted);
  if (!mounted) return <EmptyChart label="Grafik yükleniyor." />;
  if (data.length === 0) return <EmptyChart />;

  return (
    <div ref={ref} className="h-80 min-w-0 w-full">
      {size ? (
        <AreaChart width={size.width} height={size.height} data={data} margin={{ top: 8, right: 16, bottom: 28, left: 0 }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 11 }} />
          <YAxis tick={{ fill: "#71717a", fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            name={label}
            stroke="#3b82f6"
            strokeWidth={2.5}
            fill="url(#areaGradient)"
            dot={false}
            animationDuration={1200}
          />
        </AreaChart>
      ) : (
        <ChartLoading />
      )}
    </div>
  );
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return mounted;
}

function useChartSize(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<ChartSize | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        const width = Math.floor(rect.width);
        const height = Math.floor(rect.height);
        setSize((previous) => {
          if (width <= 0 || height <= 0) {
            return previous === null ? previous : null;
          }
          if (previous?.width === width && previous.height === height) {
            return previous;
          }
          return { width, height };
        });
      });
    };

    measure();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(node);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [enabled]);

  return { ref, size };
}

function getAxisWidth(width: number) {
  return Math.min(220, Math.max(120, Math.floor(width * 0.34)));
}

function getPieOuterRadius(size: ChartSize) {
  return Math.min(105, Math.max(72, Math.floor(Math.min(size.width, size.height) * 0.32)));
}

function ChartLoading() {
  return <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">Grafik yükleniyor.</div>;
}

function EmptyChart({ label = "Grafik için veri bekleniyor." }: { label?: string }) {
  return (
    <div className="flex h-80 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] text-sm text-zinc-500">
      <BarChart3 className="h-8 w-8 text-zinc-600" />
      {label}
    </div>
  );
}
