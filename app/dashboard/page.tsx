import DashboardClient from "./DashboardClient"

/**
 * Dashboard page - now lightweight and fast
 * 
 * Data is fetched once at app start by AppDataProvider and cached,
 * so this component no longer needs to query the database on every navigation.
 */
export default function DashboardPage() {
  return <DashboardClient />
}
