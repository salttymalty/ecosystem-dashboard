"use client"

import { useMemo } from "react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import {
  DOMAIN_COLORS,
  DOMAIN_LABELS,
  type TimelineRollup,
  computeDomainBalance,
} from "@/lib/ecosystem-data"
import { useDashboard } from "@/lib/dashboard-store"
import { AnimatedNumber } from "./animated-number"

export function RadarBalance({ data }: { data: TimelineRollup[] }) {
  const { activeDomain } = useDashboard()

  const { chartData, balanceScore } = useMemo(() => {
    const totals: Record<string, number> = {}
    data.forEach((d) => {
      Object.entries(d.domains).forEach(([k, v]) => {
        totals[k] = (totals[k] || 0) + v
      })
    })

    const maxDomain = Math.max(...Object.values(totals), 1)
    const cd = Object.entries(DOMAIN_LABELS).map(([key, label]) => ({
      domain: label,
      hours: Math.round((totals[key] || 0) * 10) / 10,
      normalized: ((totals[key] || 0) / maxDomain) * 100,
      fill: DOMAIN_COLORS[key],
      key,
    }))

    return {
      chartData: cd,
      balanceScore: computeDomainBalance(totals),
    }
  }, [data])

  return (
    <div className="flex flex-col items-center">
      <div className="w-full h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid
              stroke="hsl(25 10% 20%)"
              strokeDasharray="2 4"
            />
            <PolarAngleAxis
              dataKey="domain"
              tick={{ fill: "hsl(25 10% 55%)", fontSize: 12 }}
            />
            <Radar
              name="Hours"
              dataKey="normalized"
              stroke="hsl(15 70% 55%)"
              fill="hsl(15 70% 55%)"
              fillOpacity={0.2}
              strokeWidth={2}
              animationDuration={1200}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(25 14% 10%)",
                border: "1px solid hsl(25 10% 20%)",
                borderRadius: "8px",
                color: "hsl(30 15% 90%)",
                fontSize: "12px",
              }}
              formatter={(_: unknown, __: unknown, props: { payload: { hours: number; domain: string } }) => [
                `${props.payload.hours}h`,
                props.payload.domain,
              ]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Balance score */}
      <div className="flex flex-col items-center gap-1 mt-2">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">Balance Score</div>
        <div className="flex items-baseline gap-1">
          <AnimatedNumber
            value={Math.round(balanceScore * 100)}
            className="text-2xl font-display font-semibold text-foreground"
          />
          <span className="text-sm text-muted-foreground">/100</span>
        </div>
        <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(25 10% 16%)" }}>
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${balanceScore * 100}%`,
              backgroundColor:
                balanceScore > 0.7
                  ? "#81b29a"
                  : balanceScore > 0.4
                  ? "#f2cc8f"
                  : "#e07a5f",
            }}
          />
        </div>
      </div>
    </div>
  )
}
