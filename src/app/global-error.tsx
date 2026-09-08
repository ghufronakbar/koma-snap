'use client';

import FallbackPage from '@/components/fallback-page';
import { fontClasses } from './fonts';
import './globals.css';

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
    return <html lang="en" className={fontClasses}><body><title>Something went wrong — KomaSnap</title><FallbackPage kind="error" retry={retry} /></body></html>;
}
