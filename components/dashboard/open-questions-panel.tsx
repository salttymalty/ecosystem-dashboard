"use client"

import { HelpCircle } from "lucide-react"
import type { OpenQuestion } from "@/lib/ecosystem-data"

export function OpenQuestionsPanel({ items }: { items: OpenQuestion[] }) {
  if (items.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <HelpCircle className="h-4 w-4 text-blue-400" />
        <h2 className="font-display text-base font-semibold text-foreground">
          Open Questions
        </h2>
        <span className="text-xs text-blue-400 font-mono ml-auto">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex gap-3 p-3 rounded-lg text-sm animate-fade-in-up"
            style={{
              animationDelay: `${i * 80}ms`,
              backgroundColor: "hsla(210, 70%, 55%, 0.06)",
              border: "1px solid hsla(210, 70%, 55%, 0.15)",
            }}
          >
            <div className="shrink-0 mt-0.5">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "hsl(210, 70%, 55%)" }}
              />
            </div>
            <div>
              <span className="text-foreground font-medium">{item.project}</span>
              <p className="text-muted-foreground mt-0.5 leading-relaxed">
                {item.question}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
