'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toBlob } from '@/lib/render';
import type { Photo } from '@/lib/model';
export function useCamera() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const stream = useRef<MediaStream | null>(null);
    const generation = useRef(0);
    const [status, setStatus] = useState<'off' | 'loading' | 'ready' | 'error'>('off');
    const [error, setError] = useState('');
    const [facing, setFacing] = useState<'user' | 'environment'>('user');
    const [mirror, setMirror] = useState(true);
    const [canSwitch, setCanSwitch] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const stop = useCallback(() => { generation.current++; stream.current?.getTracks().forEach(track => track.stop()); stream.current = null; if (videoRef.current)
        videoRef.current.srcObject = null; setStatus('off'); setWaiting(false); }, []);
    const start = useCallback(async (direction: 'user' | 'environment' = 'user') => {
        stop();
        const current = generation.current;
        setError('');
        setWaiting(false);
        setStatus('loading');
        const timeout = setTimeout(() => { if (generation.current === current)
            setWaiting(true); }, 10000);
        try {
            if (!navigator.mediaDevices?.getUserMedia)
                throw new Error('Camera access needs a secure browser connection. Try uploading photos instead.');
            const media = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: direction }, width: { ideal: 1280 }, height: { ideal: 960 } } });
            if (generation.current !== current) {
                media.getTracks().forEach(track => track.stop());
                return;
            }
            stream.current = media;
            const video = videoRef.current;
            if (!video) {
                media.getTracks().forEach(track => track.stop());
                return;
            }
            video.srcObject = media;
            await video.play();
            if (generation.current !== current)
                return;
            const actualFacing = media.getVideoTracks()[0]?.getSettings().facingMode === 'environment' ? 'environment' : 'user';
            setFacing(actualFacing);
            setMirror(actualFacing === 'user');
            setStatus('ready');
            media.getVideoTracks()[0].onended = () => { if (generation.current === current) {
                stop();
                setError('The camera disconnected. Your captured photos are safe.');
            } };
            const devices = await navigator.mediaDevices.enumerateDevices();
            if (generation.current === current)
                setCanSwitch(devices.filter(device => device.kind === 'videoinput').length > 1);
        }
        catch (failure) {
            if (generation.current !== current)
                return;
            stream.current?.getTracks().forEach(track => track.stop());
            stream.current = null;
            setStatus('error');
            const name = failure instanceof DOMException ? failure.name : '';
            setError(name === 'NotAllowedError' ? 'Camera access was not allowed. Enable it in your browser settings, or use your photos.' : name === 'NotFoundError' ? 'No camera found. You can still make a strip with uploaded photos.' : name === 'NotReadableError' ? 'Your camera may be in use by another app. Close it and try again, or upload photos.' : failure instanceof Error ? failure.message : 'Could not connect to your camera. Try uploading photos.');
        }
        finally {
            clearTimeout(timeout);
            if (generation.current === current)
                setWaiting(false);
        }
    }, [stop]);
    const capture = useCallback(async (detect?: (source: HTMLCanvasElement) => Promise<NonNullable<Photo['landmarks']>>): Promise<Photo> => {
        const video = videoRef.current;
        if (!video || !video.videoWidth || video.readyState < 2)
            throw new Error('The camera is not ready yet. Please try again.');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const painter = canvas.getContext('2d');
        if (!painter)
            throw new Error('Could not capture this frame.');
        painter.drawImage(video, 0, 0);
        const landmarks = detect ? await detect(canvas) : undefined;
        return { id: crypto.randomUUID(), url: URL.createObjectURL(await toBlob(canvas)), width: canvas.width, height: canvas.height, mirror, exposure: 0, crops: {}, landmarks };
    }, [mirror]);
    useEffect(() => { const hidden = () => { if (document.hidden)
        stop(); }; document.addEventListener('visibilitychange', hidden); return () => { document.removeEventListener('visibilitychange', hidden); stop(); }; }, [stop]);
    return { videoRef, status, error, facing, mirror, setMirror, canSwitch, waiting, start, stop, capture };
}
