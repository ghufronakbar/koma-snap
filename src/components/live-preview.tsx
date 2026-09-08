'use client';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { geometry, type Photo, type Scene } from '@/lib/model';
import { renderArtwork } from '@/lib/render';
import type { FaceTracker } from '@/lib/face-tracker';

export function LivePreview({ videoRef, scene, slot, mirror, tracker }: { videoRef: RefObject<HTMLVideoElement | null>; scene: Scene; slot: number; mirror: boolean; tracker: FaceTracker }) {
    const panelRef = useRef<HTMLCanvasElement>(null);
    const stripRef = useRef<HTMLCanvasElement>(null);
    const settings = useRef({ scene, slot, mirror });
    const [message, setMessage] = useState('Preparing live look…');
    const [ready, setReady] = useState(false);
    useEffect(() => { settings.current = { scene, slot, mirror }; }, [scene, slot, mirror]);
    useEffect(() => {
        let stopped = false;
        let timeout: ReturnType<typeof setTimeout>;
        let landmarks: Photo['landmarks'] = [];
        let tracking = false;
        let failed = false;
        let lastEffect = 'none';
        let trackedAt = 0;
        let rendered = false;
        const abort = new AbortController();
        const source = document.createElement('canvas');
        const tick = async () => {
            try {
                const video = videoRef.current;
                if (!video || video.readyState < 2) return;
                const { scene: current, slot: active, mirror: flipped } = settings.current;
                const effect = current.faceEffect ?? 'none';
                if (effect !== lastEffect) { failed = false; landmarks = []; lastEffect = effect; }
                source.width = 480;
                source.height = Math.round(480 * video.videoHeight / video.videoWidth);
                source.getContext('2d')!.drawImage(video, 0, 0, source.width, source.height);
                if (effect !== 'none' && !tracking && !failed) {
                    tracking = true;
                    void tracker.detect(source).then(points => {
                        if (stopped || (settings.current.scene.faceEffect ?? 'none') !== effect) return;
                        landmarks = points.map((point, index) => {
                            const previous = landmarks?.[index];
                            return previous && performance.now() - trackedAt < 350 ? { x: previous.x * 0.25 + point.x * 0.75, y: previous.y * 0.25 + point.y * 0.75 } : point;
                        }); trackedAt = performance.now();
                        setMessage(points.length ? 'Face effect ready · processed locally' : 'Move one face into view · good light helps');
                    }).catch(() => { if (!stopped && (settings.current.scene.faceEffect ?? 'none') === effect) { failed = true; landmarks = []; setMessage('Tracking unavailable. Turn effects off and on to retry; camera still works.'); } }).finally(() => { tracking = false; });
                }
                if (effect === 'none') setMessage('Live look + decor · no face tracking');
                const artGeometry = geometry(current);
                const visibleSlot = current.layout === 'cover' ? current.cover : active;
                const photo: Photo = { id: 'live', url: '', width: source.width, height: source.height, mirror: flipped, exposure: 0, crops: {}, landmarks: performance.now() - trackedAt < 500 ? landmarks : [] };
                const photos = [...current.photos]; photos[visibleSlot] = photo;
                const artwork = await renderArtwork({ ...current, photos }, current.layout === 'strip' ? 360 : 480, abort.signal, { slot: visibleSlot, source });
                if (stopped) return;
                const panel = artGeometry.panels.find(item => item.slot === visibleSlot)!;
                const scale = artwork.width / artGeometry.width;
                const target = panelRef.current;
                if (target) {
                    target.width = Math.round(panel.width * scale); target.height = Math.round(panel.height * scale);
                    target.getContext('2d')!.drawImage(artwork, panel.x * scale, panel.y * scale, panel.width * scale, panel.height * scale, 0, 0, target.width, target.height);
                }
                const strip = stripRef.current;
                if (strip) { strip.width = artwork.width; strip.height = artwork.height; strip.getContext('2d')!.drawImage(artwork, 0, 0); }
                rendered = true;
                setReady(true);
            } catch {
                if (!stopped) { setReady(false); setMessage(rendered ? 'Live look paused. Showing natural camera while retrying.' : 'Live look unavailable. Showing natural camera while retrying.'); }
            } finally {
                if (!stopped) timeout = setTimeout(tick, 90);
            }
        };
        void tick();
        return () => { stopped = true; clearTimeout(timeout); abort.abort(); };
    }, [videoRef, tracker]);
    return <><canvas ref={panelRef} style={{ visibility: ready ? 'visible' : 'hidden' }} className="live-effect-canvas" aria-label="Live filtered camera with face effects and panel decorations"/><canvas ref={stripRef} style={{ visibility: ready ? 'visible' : 'hidden' }} className="live-strip-canvas" aria-label="Full composition live preview"/><span className="live-effect-status" role="status">{message}</span></>;
}
