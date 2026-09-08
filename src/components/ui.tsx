'use client';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { geometry, type Scene } from '@/lib/model';
import { renderArtwork, renderPhoto } from '@/lib/render';
export function Icon({ name, size = 20, ...props }: {
    name: string;
    size?: number;
} & React.SVGProps<SVGSVGElement>) {
    const paths: Record<string, ReactNode> = {
        arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
        back: <path d="M20 12H4m6-6-6 6 6 6"/>,
        camera: <><path d="M4 6h4l2-3h4l2 3h4a1 1 0 0 1 1 1v12H3V7a1 1 0 0 1 1-1Z"/><circle cx="12" cy="12" r="4"/></>,
        play: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m10 8 6 4-6 4Z"/></>,
        upload: <><path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6"/></>,
        download: <path d="M12 3v13m-5-5 5 5 5-5M4 16v5h16v-5"/>,
        check: <path d="m5 12 4 4L19 6"/>,
        close: <path d="m6 6 12 12M6 18 18 6"/>,
        lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/></>,
        sparkle: <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>,
        shuffle: <><path d="m3 5 3 0c5 0 7 14 12 14h3m-4-4 4 4-4 4M3 19h3c5 0 7-14 12-14h3m-4-4 4 4-4 4"/></>,
        undo: <><path d="M4 10h10a6 6 0 0 1 0 12M4 10l5-5M4 10l5 5"/></>,
        redo: <><path d="M20 10H10a6 6 0 0 0 0 12m10-12-5-5m5 5-5 5"/></>,
        rotate: <><path d="M20 8a8 8 0 1 0 0 8m0-8V2m0 6h-6"/></>,
        flip: <><path d="M12 2v20M8 5 2 19h6Zm8 0 6 14h-6Z"/></>,
        trash: <><path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/></>,
        copy: <><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/></>,
        share: <><path d="M12 16V3m-4 4 4-4 4 4M5 11v10h14V11"/></>,
        plus: <path d="M12 4v16M4 12h16"/>,
        clock: <><circle cx="12" cy="12" r="9"/><path d="M12 6v7l4 2"/></>,
        volume: <><path d="M3 9h4l5-5v16l-5-5H3Zm13-2a7 7 0 0 1 0 10m3-13a11 11 0 0 1 0 16"/></>,
        mute: <><path d="M3 9h4l5-5v16l-5-5H3Zm13 0 5 6m-5 0 5-6"/></>,
        crop: <path d="M6 2v16h16M2 6h16v16"/>,
        info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/></>,
        layers: <><path d="m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 17l10 5 10-5"/></>,
        grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h7v4l-3 3h-4Z"/></>,
    };
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] ?? paths.sparkle}</svg>;
}
export function Modal({ title, children, onClose, className = '' }: {
    title: string;
    children: ReactNode;
    onClose: () => void;
    className?: string;
}) {
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(() => { const element = dialog.current; const previous = document.activeElement as HTMLElement | null; element?.showModal(); return () => { element?.close(); previous?.focus(); }; }, []);
    return <dialog ref={dialog} className={`modal ${className}`} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === dialog.current) {
        const bounds = dialog.current.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)
            onClose();
    } }} aria-label={title}><div className="modal-heading"><h2>{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><Icon name="close"/></button></div>{children}</dialog>;
}
export function Artwork({ scene, className = '', width = 400, label = 'Your photostrip preview', onError }: {
    scene: Scene;
    className?: string;
    width?: number;
    label?: string;
    onError?: (message: string) => void;
}) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState('');
    const onErrorRef = useRef(onError);
    useEffect(() => { onErrorRef.current = onError; }, [onError]);
    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setBusy(true);
            setError('');
            try {
                const output = await renderArtwork(scene, width, controller.signal);
                if (controller.signal.aborted)
                    return;
                const target = canvas.current;
                if (target) {
                    target.width = output.width;
                    target.height = output.height;
                    target.getContext('2d')?.drawImage(output, 0, 0);
                }
                setBusy(false);
                onErrorRef.current?.('');
            }
            catch (failure) {
                if (!controller.signal.aborted) {
                    const message = failure instanceof Error ? failure.message : 'Could not update the preview.';
                    setError(message);
                    setBusy(false);
                    onErrorRef.current?.(message);
                }
            }
        }, 45);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [scene, width]);
    const art = geometry(scene);
    return <div className={`artwork ${className}`} style={{ aspectRatio: `${art.width} / ${art.height}` }} aria-busy={busy}><canvas ref={canvas} aria-label={label} role="img"/>{busy && <span className="render-indicator" aria-label="Updating image"/>}{error && <span className="artwork-error" role="alert">{error}</span>}</div>;
}
export function PhotoPreview({ scene, slot, large = false }: {
    scene: Scene;
    slot: number;
    large?: boolean;
}) {
    const target = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const controller = new AbortController();
        const photo = scene.photos[slot];
        if (!photo)
            return;
        const panel = geometry(scene).panels.find(panel => panel.slot === slot) ?? { x: 0, y: 0, width: 352, height: 246, slot };
        const timer = setTimeout(async () => { try {
            const image = await renderPhoto(photo, scene, panel, large ? 760 : 180, controller.signal);
            if (!controller.signal.aborted && target.current) {
                target.current.width = image.width;
                target.current.height = image.height;
                target.current.getContext('2d')?.drawImage(image, 0, 0);
            }
        }
        catch { } }, 70);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [scene, slot, large]);
    return <canvas ref={target} className="photo-preview" role="img" aria-label={`Photo ${slot + 1} with ${scene.collection} effect`}/>;
}
export function Slider({ label, value, min = 0, max = 100, step = 1, onChange, onCommit, suffix = '' }: {
    label: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: number) => void;
    onCommit?: () => void;
    suffix?: string;
}) {
    const id = useId();
    return <label className="slider-field" htmlFor={id}><span>{label}<output aria-hidden="true">{Number.isInteger(value) ? value : value.toFixed(2)}{suffix}</output></span><input id={id} type="range" min={min} max={max} step={step} value={value} onChange={event => onChange(Number(event.target.value))} onPointerUp={onCommit} onKeyUp={onCommit} onBlur={onCommit}/></label>;
}
