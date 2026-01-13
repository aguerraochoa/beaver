import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/app/actions/profile'
import ProfileClient from './ProfileClient'
import Layout from '@/components/Layout'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const profile = await getCurrentProfile()

    if (!profile) {
        redirect('/login')
    }

    return (
        <Layout>
            <div className="p-4 md:p-6 lg:p-8">
                <ProfileClient
                    initialNombre={profile.nombre}
                    initialUsername={profile.username}
                    email={profile.email}
                    rol={profile.rol}
                />
            </div>
        </Layout>
    )
}
