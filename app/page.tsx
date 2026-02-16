import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { EcosystemProvider } from "@/lib/ecosystem-provider"

export default function Home() {
  return (
    <EcosystemProvider>
      <DashboardShell />
    </EcosystemProvider>
  )
}
