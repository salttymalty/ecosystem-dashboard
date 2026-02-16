"use client"

import { Calendar } from "lucide-react"
import type { WeeklyReview } from "@/lib/ecosystem-data"

export function WeeklyReviewCard({ reviews }: { reviews: WeeklyReview[] }) {
  if (reviews.length === 0) return null

  const latest = reviews[reviews.length - 1]

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-emerald-400" />
        <h2 className="font-display text-base font-semibold text-foreground">
          Weekly Review
        </h2>
        <span className="text-xs text-muted-foreground font-mono ml-auto">
          {latest.week}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{latest.period}</p>
      <p className="text-sm text-foreground leading-relaxed">
        {latest.summary}
      </p>
    </div>
  )
}
