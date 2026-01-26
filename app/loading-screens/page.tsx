import LoadingShowcase from '@/components/LoadingShowcase';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Loading Screens Showcase | Beaver',
    description: 'Explore premium loading screen designs for route transitions.',
};

export default function LoadingScreensPage() {
    return (
        <main>
            <LoadingShowcase />
        </main>
    );
}
