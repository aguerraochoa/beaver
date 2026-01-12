import { redirect } from 'next/navigation'
import { getCurrentUser, requireAdmin } from '@/lib/utils/auth'
import { getDashboardStats } from '@/app/actions/stats'
import Layout from '@/components/Layout'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  try {
    await requireAdmin()
  } catch {
    redirect('/')
  }

  const stats = await getDashboardStats()

  return (
    <Layout>
      <div className="mb-4 lg:mb-6">
        <h1 className="text-2xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1 lg:mb-2">
          Dashboard
        </h1>
        <p className="text-sm lg:text-base text-slate-600 dark:text-slate-400">
          Resumen de inventario, ventas e ingresos
        </p>
      </div>
      <DashboardClient stats={stats} />
    </Layout>
  )
}

