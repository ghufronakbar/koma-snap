type FallbackPageProps = {
    kind: 'not-found' | 'error';
    retry?: () => void;
};

export default function FallbackPage({ kind, retry }: FallbackPageProps) {
    const missing = kind === 'not-found';
    const goHome = () => window.location.assign(new URL('/', window.location.href).href);

    return <div className="app-shell fallback-shell">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <header className="site-header">
            {missing ? <Link className="brand fallback-home" href="/" aria-label="KomaSnap home"><span className="brand-mark" aria-hidden="true">▦</span>KomaSnap<span className="brand-period">.</span></Link> : <button className="brand" onClick={goHome} aria-label="KomaSnap home"><span className="brand-mark" aria-hidden="true">▦</span>KomaSnap<span className="brand-period">.</span></button>}
            <span className="header-note">A LITTLE CREATIVE ESCAPE</span>
        </header>
        <main id="main-content" className="fallback-main">
            <div className="fallback-print" aria-hidden="true"><span>KOMASNAP / OUTTAKES</span><strong>{missing ? '404' : 'Oops.'}</strong><span>{missing ? 'FRAME NOT FOUND' : 'TAKE TWO?'}</span></div>
            <section className="fallback-copy" aria-labelledby="fallback-title">
                <span className="eyebrow">{missing ? 'A LITTLE OFF-SCRIPT' : 'AN UNEXPECTED PLOT TWIST'}</span>
                <h1 id="fallback-title">{missing ? 'This frame is missing.' : 'Let’s try another take.'}</h1>
                <p>{missing ? 'The page you’re looking for may have moved, or never made it into the strip. Your next story starts back at the booth.' : 'Something interrupted the scene. Try again, or head home for a fresh start.'}</p>
                <div className="fallback-actions">
                    {!missing && <button className="button primary" type="button" onClick={retry}>Try again<span aria-hidden="true">↻</span></button>}
                    {missing ? <Link className="button primary" href="/">Back to home<span aria-hidden="true">→</span></Link> : <button className="button text-link" onClick={goHome}>Back to home<span aria-hidden="true">→</span></button>}
                </div>
                {!missing && <p className="fallback-note">Unsaved photos and edits may be lost when restarting.</p>}
            </section>
        </main>
        <footer className="site-footer"><span>KomaSnap · Made for the plot.</span><span className="footer-note">FOUR FRAMES. ALL YOU.</span></footer>
    </div>;
}
import Link from 'next/link';
