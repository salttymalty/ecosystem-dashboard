"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { DOMAIN_COLORS, DOMAIN_LABELS, type CorpusStats } from "@/lib/ecosystem-data"

// Map corpus domain keys to our canonical DOMAIN_COLORS keys
const CORPUS_DOMAIN_MAP: Record<string, string> = {
  ag: "ag",
  cogcom: "meta",
  consulting: "cross-domain",
  convene: "convene",
  "cross-domain": "cross-domain",
  design: "design",
  madhudson: "mad-hudson",
  meta: "meta",
  oeff: "oeff",
  personal: "personal",
}

function getColor(corpusDomain: string): string {
  const mapped = CORPUS_DOMAIN_MAP[corpusDomain] || "cross-domain"
  return DOMAIN_COLORS[mapped] || "#9ca3af"
}

function getLabel(corpusDomain: string): string {
  const mapped = CORPUS_DOMAIN_MAP[corpusDomain] || corpusDomain
  return DOMAIN_LABELS[mapped] || corpusDomain
}

interface DonutEntry {
  name: string
  value: number
  fill: string
}

export function CorpusDonut({ corpus }: { corpus: CorpusStats }) {
  const { entries, total } = useMemo(() => {
    const sorted = Object.entries(corpus.byDomain)
      .map(([key, count]) => ({
        name: getLabel(key),
        value: count,
        fill: getColor(key),
      }))
      .sort((a, b) => b.value - a.value)

    return { entries: sorted, total: corpus.total }
  }, [corpus])

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={entries}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
              strokeWidth={0}
              animationDuration={1000}
            >
              {entries.map((entry, i) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(25 14% 10%)",
                border: "1px solid hsl(25 10% 20%)",
                borderRadius: "8px",
                color: "hsl(30 15% 90%)",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [
                `${value} digests`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-display font-semibold text-foreground">{total}</span>
          <span className="text-xs text-muted-foreground">digests</span>
        </div>
      </div>

      {/* Legend — compact 2-column */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 w-full px-2">
        {entries.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: entry.fill }}
            />
            <span className="text-muted-foreground truncate">{entry.name}</span>
            <span className="text-foreground font-mono ml-auto">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
