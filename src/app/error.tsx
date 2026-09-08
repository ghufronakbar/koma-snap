'use client';

import FallbackPage from '@/components/fallback-page';

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
    return <><title>Something went wrong — KomaSnap</title><FallbackPage kind="error" retry={retry} /></>;
}
