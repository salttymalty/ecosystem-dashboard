"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { transformEcosystemData, type EcosystemData } from "./ecosystem-data"

const EcosystemContext = createContext<EcosystemData | null>(null)

export function EcosystemProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<EcosystemData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/data/ecosystem-index.json")
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load data: ${r.status}`)
        return r.json()
      })
      .then((raw) => setData(transformEcosystemData(raw)))
      .catch((e) => setError(e.message))
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8">
          <h1 className="font-display text-xl text-foreground mb-2">Failed to load ecosystem data</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8 space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading ecosystem data...</p>
        </div>
      </div>
    )
  }

  return (
    <EcosystemContext value={data}>
      {children}
    </EcosystemContext>
  )
}

export function useEcosystemData(): EcosystemData {
  const ctx = useContext(EcosystemContext)
  if (!ctx) throw new Error("useEcosystemData must be used inside EcosystemProvider")
  return ctx
}
