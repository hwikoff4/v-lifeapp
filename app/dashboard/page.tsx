import DashboardClientV2 from "./DashboardClientV2"

/**
 * Dashboard page - Gamified V2
 * 
 * Features XP, levels, achievements, and daily missions.
 * Data is fetched once at app start by AppDataProvider and cached.
 */
export default function DashboardPage() {
  return <DashboardClientV2 />
}
