import type { Metadata } from 'next';
import FallbackPage from '@/components/fallback-page';

export const metadata: Metadata = { title: 'Page not found — KomaSnap' };

export default function NotFound() {
    return <FallbackPage kind="not-found" />;
}
