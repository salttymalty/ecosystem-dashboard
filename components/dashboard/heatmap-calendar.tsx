"use client"

import { useMemo, useState } from "react"
import { DOMAIN_COLORS, type TimelineRollup } from "@/lib/ecosystem-data"
import { useDashboard } from "@/lib/dashboard-store"
import { cn } from "@/lib/utils"

const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""]
const CELL_SIZE = 14
const CELL_GAP = 3

function getHeatColor(hours: number, maxHours: number, domain?: string | null): string {
  if (hours === 0) return "hsl(25 10% 14%)"
  const intensity = Math.min(hours / maxHours, 1)

  if (domain && DOMAIN_COLORS[domain]) {
    const base = DOMAIN_COLORS[domain]
    return `color-mix(in oklch, ${base} ${Math.round(20 + intensity * 80)}%, hsl(25 10% 14%))`
  }

  // Default warm gradient
  const hue = 15
  const sat = 70
  const light = 20 + intensity * 35
  return `hsl(${hue} ${sat}% ${light}%)`
}

export function HeatmapCalendar({ data }: { data: TimelineRollup[] }) {
  const { activeDomain, setDateRange } = useDashboard()
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    date: string
    hours: number
  } | null>(null)

  const { weeks, months, maxHours } = useMemo(() => {
    const maxH = Math.max(...data.map((d) => d.totalHours), 1)
    const ws: (TimelineRollup | null)[][] = []
    let currentWeek: (TimelineRollup | null)[] = []

    // Pad start to align with day of week
    if (data.length > 0) {
      const firstDay = new Date(data[0].date).getDay()
      for (let i = 0; i < firstDay; i++) currentWeek.push(null)
    }

    data.forEach((d) => {
      currentWeek.push(d)
      if (currentWeek.length === 7) {
        ws.push(currentWeek)
        currentWeek = []
      }
    })
    if (currentWeek.length > 0) ws.push(currentWeek)

    // Compute month labels
    const ms: { label: string; weekIndex: number }[] = []
    let lastMonth = ""
    ws.forEach((week, wi) => {
      const firstDay = week.find((d) => d !== null)
      if (firstDay) {
        const month = new Date(firstDay.date).toLocaleString("en", { month: "short" })
        if (month !== lastMonth) {
          ms.push({ label: month, weekIndex: wi })
          lastMonth = month
        }
      }
    })

    return { weeks: ws, months: ms, maxHours: maxH }
  }, [data])

  const getFilteredHours = (day: TimelineRollup): number => {
    if (!activeDomain) return day.totalHours
    return day.domains[activeDomain] || 0
  }

  return (
    <div className="relative">
      {/* Month labels */}
      <div className="flex mb-1.5" style={{ paddingLeft: 32 }}>
        {months.map((m) => (
          <span
            key={`${m.label}-${m.weekIndex}`}
            className="text-xs text-muted-foreground"
            style={{ position: "relative", left: m.weekIndex * (CELL_SIZE + CELL_GAP) }}
          >
            {m.label}
          </span>
        ))}
      </div>

      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col justify-between pr-1.5" style={{ height: 7 * (CELL_SIZE + CELL_GAP) - CELL_GAP }}>
          {DAYS.map((d, i) => (
            <span key={i} className="text-[10px] text-muted-foreground leading-none" style={{ height: CELL_SIZE, lineHeight: `${CELL_SIZE}px` }}>
              {d}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${di}`}
                      style={{ width: CELL_SIZE, height: CELL_SIZE }}
                    />
                  )
                }

                const hours = getFilteredHours(day)
                const color = getHeatColor(hours, maxHours, activeDomain)

                return (
                  <div
                    key={day.date}
                    className={cn(
                      "rounded-sm cursor-pointer transition-all duration-150 hover:scale-125 hover:z-10 animate-cell-reveal"
                    )}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor: color,
                      animationDelay: `${(wi * 7 + di) * 4}ms`,
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setTooltip({
                        x: rect.left + rect.width / 2,
                        y: rect.top - 8,
                        date: day.date,
                        hours,
                      })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => {
                      const d = new Date(day.date)
                      const start = new Date(d)
                      start.setDate(start.getDate() - 3)
                      const end = new Date(d)
                      end.setDate(end.getDate() + 3)
                      setDateRange([start, end])
                    }}
                    role="gridcell"
                    aria-label={`${day.date}: ${hours.toFixed(1)} hours`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2.5 py-1.5 rounded-md text-xs font-mono pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
            backgroundColor: "hsl(25 14% 10%)",
            color: "hsl(30 15% 90%)",
            border: "1px solid hsl(25 10% 20%)",
            boxShadow: "0 4px 12px hsla(25, 40%, 10%, 0.4)",
          }}
        >
          <div className="font-sans font-medium">{tooltip.date}</div>
          <div className="text-muted-foreground">{tooltip.hours.toFixed(1)}h</div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
        <span>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((i) => (
          <div
            key={i}
            className="rounded-sm"
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              backgroundColor: getHeatColor(i * maxHours, maxHours, activeDomain),
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
