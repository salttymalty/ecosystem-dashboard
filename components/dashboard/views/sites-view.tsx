"use client"

import { useEcosystemData } from "@/lib/ecosystem-provider"
import { useDashboard } from "@/lib/dashboard-store"
import { DOMAIN_COLORS, DOMAIN_LABELS, type Site } from "@/lib/ecosystem-data"
import { ExternalLink, Globe, Lock } from "lucide-react"
import { useMemo } from "react"

const PLATFORM_LABELS: Record<string, string> = {
  cloudflare: "Cloudflare",
  "github-pages": "GitHub Pages",
  tiiny: "tiiny.site",
  shopify: "Shopify",
  vercel: "Vercel",
}

function SiteRow({ site }: { site: Site }) {
  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/50 transition-colors group"
    >
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: DOMAIN_COLORS[site.domain] || DOMAIN_COLORS["cross-domain"] }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">
            {site.label}
          </span>
          {site.private && (
            <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
          )}
        </div>
        <span className="text-xs text-muted-foreground truncate block">
          {site.url.replace("https://", "")}
        </span>
      </div>
      <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
        {PLATFORM_LABELS[site.platform] || site.platform}
      </span>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </a>
  )
}

export function SitesView() {
  const { sites } = useEcosystemData()
  const { activeDomain } = useDashboard()

  const filtered = useMemo(() => {
    if (!activeDomain) return sites
    return sites.filter((s) => s.domain === activeDomain)
  }, [sites, activeDomain])

  const grouped = useMemo(() => {
    const groups: Record<string, Site[]> = {}
    filtered.forEach((s) => {
      const key = s.domain
      if (!groups[key]) groups[key] = []
      groups[key].push(s)
    })
    // Sort domains by site count descending
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length)
  }, [filtered])

  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    filtered.forEach((s) => {
      counts[s.platform] = (counts[s.platform] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [filtered])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight">
          Sites
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {filtered.length} deployed across {platformCounts.length} platforms
        </p>
      </div>

      {/* Platform summary */}
      <div className="flex flex-wrap gap-2">
        {platformCounts.map(([platform, count]) => (
          <div
            key={platform}
            className="px-3 py-1.5 rounded-lg bg-accent/50 text-xs text-muted-foreground"
          >
            <span className="font-medium text-foreground">{count}</span>
            {" "}
            {PLATFORM_LABELS[platform] || platform}
          </div>
        ))}
      </div>

      {/* Grouped by domain */}
      <div className="space-y-6">
        {grouped.map(([domain, domainSites]) => (
          <div key={domain}>
            <div className="flex items-center gap-2 mb-2 px-1">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: DOMAIN_COLORS[domain] || DOMAIN_COLORS["cross-domain"] }}
              />
              <h3 className="text-sm font-medium text-foreground">
                {DOMAIN_LABELS[domain] || domain}
              </h3>
              <span className="text-xs text-muted-foreground">
                {domainSites.length}
              </span>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
              {domainSites.map((site) => (
                <SiteRow key={site.url} site={site} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
