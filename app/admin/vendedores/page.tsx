import { redirect } from 'next/navigation'
import { getCurrentUser, requireAdmin } from '@/lib/utils/auth'
import { getVendedorStats } from '@/app/actions/vendedor-stats'
import VendedoresClient from '@/app/admin/vendedores/VendedoresClient'

export const dynamic = 'force-dynamic'

export default async function VendedoresPage() {
    const user = await getCurrentUser()
    if (!user) {
        redirect('/login')
    }

    try {
        await requireAdmin()
    } catch {
        redirect('/')
    }

    const data = await getVendedorStats()

    return (
        <>
            <div className="mb-4 lg:mb-6">
                <h1 className="text-2xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1 lg:mb-2">
                    Vendedores
                </h1>
                <p className="text-sm lg:text-base text-slate-600 dark:text-slate-400">
                    Rendimiento y estadísticas de ventas por vendedor
                </p>
            </div>
            <VendedoresClient data={data} />
        </>
    )
}
