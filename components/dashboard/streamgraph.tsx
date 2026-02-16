"use client"

import { useMemo, useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  DOMAIN_COLORS,
  DOMAIN_LABELS,
  type TimelineRollup,
} from "@/lib/ecosystem-data"
import { useDashboard } from "@/lib/dashboard-store"

export function Streamgraph({ data }: { data: TimelineRollup[] }) {
  const { activeDomain } = useDashboard()
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null)

  const domains = useMemo(
    () => Object.keys(DOMAIN_COLORS),
    []
  )

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        date: d.date,
        ...Object.fromEntries(
          domains.map((domain) => [domain, d.domains[domain] || 0])
        ),
      })),
    [data, domains]
  )

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString("en", { month: "short", day: "numeric" })
  }

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: "hsl(25 10% 55%)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={60}
          />
          <YAxis
            tick={{ fill: "hsl(25 10% 55%)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={30}
            tickFormatter={(v) => `${v}h`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(25 14% 10%)",
              border: "1px solid hsl(25 10% 20%)",
              borderRadius: "8px",
              color: "hsl(30 15% 90%)",
              fontSize: "12px",
              boxShadow: "0 4px 12px hsla(25, 40%, 10%, 0.4)",
            }}
            labelFormatter={formatDate}
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)}h`,
              DOMAIN_LABELS[name] || name,
            ]}
          />
          {domains.map((domain) => {
            const isActive = !activeDomain || activeDomain === domain
            const isHovered = hoveredDomain === domain

            return (
              <Area
                key={domain}
                type="monotone"
                dataKey={domain}
                stackId="1"
                stroke={DOMAIN_COLORS[domain]}
                fill={DOMAIN_COLORS[domain]}
                fillOpacity={
                  isHovered ? 0.8 : isActive ? 0.5 : 0.08
                }
                strokeOpacity={isActive ? 0.8 : 0.1}
                strokeWidth={isHovered ? 2 : 1}
                onMouseEnter={() => setHoveredDomain(domain)}
                onMouseLeave={() => setHoveredDomain(null)}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            )
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
