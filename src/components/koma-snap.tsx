'use client';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { collections, initialScene, localDate, outputSize, type OutputFormat, type Scene, type Step } from '@/lib/model';
import { demoPhotos, importPhoto, releasePhoto } from '@/lib/photos';
import { renderFinal, stopRenderer, toBlob } from '@/lib/render';
import { useCamera } from '@/hooks/use-camera';
import { Artwork, Icon, Modal, PhotoPreview } from './ui';
import { Editor } from './editor';
import { FaceTracker } from '@/lib/face-tracker';
import { FaceControls } from './face-controls';
import { LivePreview } from './live-preview';
export default function KomaSnap() {
    const [scene, setScene] = useState<Scene>(initialScene);
    const [tracker] = useState(() => new FaceTracker());
    useEffect(() => () => tracker.close(), [tracker]);
    const sceneRef = useRef(scene);
    const [step, setStep] = useState<Step>('intro');
    const stepRef = useRef<Step>('intro');
    const [dialog, setDialog] = useState<'privacy' | 'how' | 'credits' | 'reset' | null>(null);
    const [notice, setNotice] = useState('');
    const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fileInput = useRef<HTMLInputElement>(null);
    const replaceSlot = useRef<number | null>(null);
    const [importing, setImporting] = useState(false);
    const importGeneration = useRef(0);
    const [selectedPhoto, setSelectedPhoto] = useState(0);
    const [timer, setTimer] = useState(3);
    const [sound, setSound] = useState(false);
    const [prompts, setPrompts] = useState(true);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [capturing, setCapturing] = useState(false);
    const [captureSlot, setCaptureSlot] = useState(0);
    const [retakeSlot, setRetakeSlot] = useState<number | null>(null);
    const captureGeneration = useRef(0);
    const audio = useRef<AudioContext | null>(null);
    const { videoRef, status: cameraStatus, error: cameraError, facing, mirror, setMirror, canSwitch, waiting, start: startCamera, stop: stopCamera, capture } = useCamera();
    useEffect(() => { if (cameraStatus !== 'ready' || !scene.faceEffect || scene.faceEffect === 'none') tracker.close(); }, [cameraStatus, scene.faceEffect, tracker]);
    const [historyState, setHistoryState] = useState({ undo: false, redo: false });
    const history = useRef<{
        past: Scene[];
        future: Scene[];
        transaction: Scene | null;
    }>({ past: [], future: [], transaction: null });
    const [format, setFormat] = useState<OutputFormat>('story');
    const [scale, setScale] = useState(1);
    const demo = useMemo(() => ({ ...initialScene(), photos: demoPhotos() }), []);
    const hasPhotos = scene.photos.some(Boolean);
    const full = scene.photos.every(Boolean);
    const filled = scene.photos.filter(Boolean).length;
    const collection = collections.find(item => item.id === scene.collection)!;
    const notify = useCallback((message: string) => { if (noticeTimer.current)
        clearTimeout(noticeTimer.current); setNotice(message); noticeTimer.current = setTimeout(() => setNotice(''), 6500); }, []);
    const assign = useCallback((next: Scene) => { sceneRef.current = next; setScene(next); }, []);
    const commit = useCallback(() => { const state = history.current; if (state.transaction) {
        state.past = [...state.past.slice(-29), state.transaction];
        state.future = [];
        state.transaction = null;
        setHistoryState({ undo: history.current.past.length > 0 || history.current.transaction !== null, redo: history.current.future.length > 0 });
    } }, []);
    const change = useCallback((next: Scene, transient = false) => {
        const state = history.current;
        if (transient) {
            if (!state.transaction) {
                state.transaction = sceneRef.current;
                setHistoryState({ undo: true, redo: false });
            }
        }
        else {
            if (state.transaction)
                commit();
            state.past = [...state.past.slice(-29), sceneRef.current];
            state.future = [];
            setHistoryState({ undo: history.current.past.length > 0 || history.current.transaction !== null, redo: history.current.future.length > 0 });
        }
        assign(next);
        if (next.layout !== 'strip')
            setFormat(current => current === 'strip' ? 'story' : current);
    }, [assign, commit]);
    const clearHistory = useCallback(() => { history.current = { past: [], future: [], transaction: null }; setHistoryState({ undo: history.current.past.length > 0 || history.current.transaction !== null, redo: history.current.future.length > 0 }); }, []);
    const undo = () => { commit(); const state = history.current; const previous = state.past.pop(); if (!previous)
        return; state.future.push(sceneRef.current); assign(previous); if (previous.layout !== 'strip')
        setFormat(current => current === 'strip' ? 'story' : current); setHistoryState({ undo: history.current.past.length > 0 || history.current.transaction !== null, redo: history.current.future.length > 0 }); };
    const redo = () => { const state = history.current; const next = state.future.pop(); if (!next)
        return; state.past.push(sceneRef.current); assign(next); if (next.layout !== 'strip')
        setFormat(current => current === 'strip' ? 'story' : current); setHistoryState({ undo: history.current.past.length > 0 || history.current.transaction !== null, redo: history.current.future.length > 0 }); };
    const cancelCapture = useCallback(() => { captureGeneration.current++; setCapturing(false); setCountdown(null); }, []);
    const navigate = useCallback((next: Step) => { cancelCapture(); stopCamera(); commit(); stepRef.current = next; setStep(next); window.history.pushState({ koma: next }, '', '/'); window.scrollTo({ top: 0, behavior: 'instant' }); }, [stopCamera, cancelCapture, commit]);
    const invalidateImport = useCallback(() => { importGeneration.current++; }, []);
    useEffect(() => {
        const previousScrollRestoration = window.history.scrollRestoration;
        window.history.scrollRestoration = 'manual';
        window.scrollTo({ top: 0, behavior: 'instant' });
        window.history.replaceState({ koma: 'intro' }, '', '/');
        const back = (event: PopStateEvent) => { cancelCapture(); stopCamera(); commit(); const target = event.state?.koma as Step | undefined; const valid = ['intro', 'booth', 'studio', 'result'].includes(target ?? ''); const next = valid && target ? target : 'intro'; const safe = (next === 'studio' || next === 'result') && !sceneRef.current.photos.every(Boolean) ? 'intro' : next; stepRef.current = safe; setStep(safe); };
        const hidden = () => { if (document.hidden)
            cancelCapture(); };
        window.addEventListener('popstate', back);
        document.addEventListener('visibilitychange', hidden);
        return () => { window.history.scrollRestoration = previousScrollRestoration; window.removeEventListener('popstate', back); document.removeEventListener('visibilitychange', hidden); invalidateImport(); cancelCapture(); sceneRef.current.photos.forEach(releasePhoto); audio.current?.close(); stopRenderer(); if (noticeTimer.current)
            clearTimeout(noticeTimer.current); };
    }, [stopCamera, cancelCapture, commit, invalidateImport]);
    const chooseFiles = (slot: number | null = null) => { replaceSlot.current = slot; if (fileInput.current) {
        fileInput.current.multiple = slot === null;
        fileInput.current.value = '';
        fileInput.current.click();
    } };
    const replace = (slot: number) => { notify('Replacing a photo clears edit history. Your decorations stay.'); chooseFiles(slot); };
    const filesSelected = async (files: FileList | null) => {
        if (!files?.length || importing || capturing)
            return;
        const target = replaceSlot.current;
        const empty = sceneRef.current.photos.flatMap((photo, index) => photo ? [] : [index]);
        const slots = target === null ? empty : [target];
        if (files.length > slots.length) {
            notify(`There’s room for ${slots.length} ${slots.length === 1 ? 'photo' : 'photos'}. Please select again.`);
            if (fileInput.current) fileInput.current.value = '';
            return;
        }
        stopCamera();
        cancelCapture();
        if (stepRef.current === 'intro')
            navigate('booth');
        setImporting(true);
        const current = ++importGeneration.current;
        let successes = 0;
        const failures: string[] = [];
        try {
            for (let index = 0; index < files.length; index++) {
                try {
                    const photo = await importPhoto(files[index]);
                    if (current !== importGeneration.current) {
                        releasePhoto(photo);
                        return;
                    }
                    const photos = [...sceneRef.current.photos];
                    releasePhoto(photos[slots[index]]);
                    photos[slots[index]] = photo;
                    clearHistory();
                    assign({ ...sceneRef.current, photos });
                    setSelectedPhoto(slots[index]);
                    successes++;
                }
                catch (error) {
                    failures.push(error instanceof Error ? error.message : 'Could not open that photo.');
                }
            }
            if (failures.length)
                notify(failures.join(' '));
            else if (target !== null)
                notify('New photo, same story. Check its crop before finishing.');
            else if (successes)
                notify(`${successes} ${successes === 1 ? 'photo is' : 'photos are'} in. Looking good.`);
        }
        finally {
            if (current === importGeneration.current) {
                setImporting(false);
                if (fileInput.current) fileInput.current.value = '';
            }
        }
    };
    const useDemo = () => { if (hasPhotos) {
        navigate('booth');
        return;
    } assign({ ...sceneRef.current, photos: demoPhotos() }); clearHistory(); navigate('studio'); notify('You’re trying original demo illustrations. Add your own photos anytime.'); };
    const tick = () => { if (!sound || !audio.current)
        return; const oscillator = audio.current.createOscillator(); const gain = audio.current.createGain(); oscillator.type = 'triangle'; oscillator.frequency.setValueAtTime(950, audio.current.currentTime); oscillator.frequency.exponentialRampToValueAtTime(140, audio.current.currentTime + 0.07); gain.gain.setValueAtTime(0.12, audio.current.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audio.current.currentTime + 0.09); oscillator.connect(gain); gain.connect(audio.current.destination); oscillator.start(); oscillator.stop(audio.current.currentTime + 0.1); };
    const takePhotos = async () => {
        if (capturing || importing || cameraStatus !== 'ready')
            return;
        if (sound) {
            try {
                audio.current ??= new AudioContext();
                await audio.current.resume();
            }
            catch {
                notify('Sound is unavailable. The visual countdown still works.');
            }
        }
        const current = ++captureGeneration.current;
        const slots = retakeSlot !== null ? [retakeSlot] : sceneRef.current.photos.flatMap((photo, index) => photo ? [] : [index]);
        if (!slots.length)
            return;
        setCapturing(true);
        try {
            for (const slot of slots) {
                setCaptureSlot(slot);
                const endsAt = performance.now() + timer * 1000;
                while (performance.now() < endsAt) {
                    if (current !== captureGeneration.current)
                        return;
                    setCountdown(Math.ceil((endsAt - performance.now()) / 1000));
                    await new Promise(resolve => setTimeout(resolve, 80));
                }
                if (current !== captureGeneration.current)
                    return;
                setCountdown(null);
                const photo = await capture(sceneRef.current.faceEffect && sceneRef.current.faceEffect !== 'none' ? async source => {
                    try { return await tracker.detect(source); }
                    catch { notify('Face effects could not be captured. Your clean photo is saved; retry in the editor.'); return []; }
                } : undefined);
                if (current !== captureGeneration.current) {
                    releasePhoto(photo);
                    return;
                }
                tick();
                const photos = [...sceneRef.current.photos];
                releasePhoto(photos[slot]);
                photos[slot] = photo;
                clearHistory();
                assign({ ...sceneRef.current, photos });
                setSelectedPhoto(slot);
                await new Promise(resolve => setTimeout(resolve, 350));
            }
            if (current === captureGeneration.current) {
                stopCamera();
                setRetakeSlot(null);
                notify(sceneRef.current.photos.every(Boolean) ? 'Four little moments. Take a look before you make them yours.' : 'This frame is in. Add the remaining photos when you’re ready.');
            }
        }
        catch (error) {
            notify(error instanceof Error ? error.message : 'Could not capture this photo. Try again.');
        }
        finally {
            if (current === captureGeneration.current) {
                setCapturing(false);
                setCountdown(null);
            }
        }
    };
    const reset = () => { importGeneration.current++; cancelCapture(); stopCamera(); sceneRef.current.photos.forEach(releasePhoto); if (fileInput.current) fileInput.current.value = ''; assign({ ...initialScene(), collection: scene.collection }); clearHistory(); setRetakeSlot(null); setSelectedPhoto(0); setScale(1); setFormat('story'); setDialog(null); navigate('intro'); };
    const goBooth = () => navigate('booth');
    return <div className={`app-shell ${step === 'intro' ? 'is-intro' : 'is-workspace'}`}>
    <header className="site-header"><button className="brand" onClick={() => navigate('intro')} aria-label="KomaSnap home"><span className="brand-mark"><Icon name="grid" size={25}/></span>KomaSnap<span className="brand-period">.</span></button>
      {step === 'intro' ? <nav aria-label="Main navigation"><button onClick={goBooth}>The booth</button><button onClick={() => setDialog('how')}>How it works<Icon name="arrow" size={14}/></button></nav> : <nav className="step-nav" aria-label="Your progress">{(['booth', 'studio', 'result'] as const).map((item, index) => <button key={item} aria-current={step === item ? 'step' : undefined} disabled={item !== 'booth' && !full || importing || capturing} onClick={() => navigate(item)}><span>0{index + 1}</span>{item === 'booth' ? 'Booth' : item === 'studio' ? 'Studio' : 'Your strip'}{index < 2 && <i>/</i>}</button>)}</nav>}
      <span className="header-note"><i />A LITTLE CREATIVE ESCAPE</span>
    </header>
    <main id="main-content">
      {step === 'intro' && <>
        <section className="hero page-enter"><div className="hero-copy"><div className="eyebrow"><span className="tiny-star">✳</span> YOUR EVERYDAY, A LITTLE MORE EXTRA.</div><h1>Your face.<br />Four panels.<br /><span>Your story.</span><svg className="headline-underline" viewBox="0 0 420 18" aria-hidden="true"><path d="M3 11Q178-4 413 7M41 16q189-9 343-3"/></svg></h1><p>Turn a few little moments into a whole mood.<br className="desktop-only"/> A manga-inspired photobooth. Made for you.</p><div className="hero-actions"><button className="button primary hero-cta" onClick={goBooth}>{hasPhotos ? 'Resume your session' : 'Let’s make a strip'}<Icon name="arrow"/></button><button className="button text-link" onClick={() => chooseFiles()}><Icon name="upload" size={17}/>Use my photos</button></div><div className="hero-privacy"><Icon name="lock" size={15}/><span>No sign-up. No uploads. Just you.</span></div></div>
          <div className="hero-art" aria-label="Original manga photostrip examples"><div className="hero-halo"/><div className="hero-cross cross-one">+</div><div className="hero-cross cross-two">+</div><div className="hero-note top-note">NOT YOUR<br />AVERAGE SELFIE.<svg viewBox="0 0 90 60" aria-hidden="true"><path d="M9 5q-12 38 58 36m-13-10 16 11-20 5"/></svg></div><div className="hero-back-strip"><Artwork scene={{ ...demo, collection: 'shoujo', intensity: 90, title: 'SOFT SPOT', caption: 'DEAR DIARY, IT WAS A GOOD DAY.' }} width={320} label="Soft Shoujo demo illustration"/></div><div className="hero-front-strip"><span className="paper-tape"/><Artwork scene={demo} width={420} label="Koma Impact four-panel demo illustration"/></div><span className="hero-burst"><span>100%<br /><strong>YOU.</strong></span></span><div className="hero-note bottom-note">four frames.<br /><span>infinite personalities.</span></div><div className="demo-label">ORIGINAL DEMO ART · YOUR PHOTOS GO HERE</div></div>
        </section>
        <section className="collection-shelf" aria-label="Explore the collections"><div className="shelf-title"><span className="eyebrow">PICK YOUR PERSONALITY</span><span>Same you. Different universe.</span></div><div className="collection-grid">{collections.map((item, index) => <button key={item.id} className={`collection-card ${item.id}`} onClick={() => { assign({ ...sceneRef.current, collection: item.id, background: 0 }); goBooth(); }}><span className="collection-number">0{index + 1}</span><span className={`collection-art ${item.id}`}><PhotoPreview scene={{ ...demo, collection: item.id }} slot={index % 4}/><span className="collection-art-overlay">{item.mark}</span></span><span className="collection-info"><strong>{item.name}</strong><small>{item.eyebrow}</small></span><Icon name="arrow" size={17}/></button>)}</div></section>
        <div className="intro-bottom"><span><Icon name="sparkle" size={16}/> Little moments deserve a good frame.</span><button className="text-button" onClick={useDemo}>Just looking? Try the demo<Icon name="arrow" size={15}/></button></div>
      </>}
      {step === 'booth' && <section className="booth-page page-enter"><div className="workspace-title"><div><span className="eyebrow">01 / THE BOOTH</span><h1>{full && cameraStatus !== 'ready' ? 'That’s a ' : 'Meet the '}<em>{full && cameraStatus !== 'ready' ? 'good look.' : 'camera.'}</em></h1></div><p>{full ? 'Four frames, all you. Keep them or try one again.' : 'No perfect poses needed. Just show up as you.'}</p></div>
        <div className="booth-collections" aria-label="Choose a collection">{collections.map(item => <button key={item.id} className={scene.collection === item.id ? 'active' : ''} aria-pressed={scene.collection === item.id} disabled={capturing || importing} onClick={() => assign({ ...sceneRef.current, collection: item.id, background: 0 })}><span style={{ background: item.color }}/>{item.name}{scene.collection === item.id && <Icon name="check" size={14}/>}</button>)}</div>
        <div className="booth-grid"><div className="camera-side"><div className={`camera-stage ${cameraStatus === 'ready' ? 'live' : ''}`}>
          <video ref={videoRef} playsInline muted aria-label="Live camera preview" style={{ transform: mirror ? 'scaleX(-1)' : 'none', visibility: cameraStatus === 'ready' ? 'visible' : 'hidden' }}/>
          {cameraStatus === 'ready' && <LivePreview videoRef={videoRef} scene={scene} slot={retakeSlot ?? (capturing ? captureSlot : Math.max(0, scene.photos.findIndex(photo => !photo)))} mirror={mirror} tracker={tracker}/>}
          {cameraStatus !== 'ready' && (scene.photos[selectedPhoto] ? <PhotoPreview scene={scene} slot={selectedPhoto} large/> : <div className="camera-empty"><span className="empty-camera-icon"><Icon name="camera" size={48}/></span><h2>A little camera time?</h2><p>Your best angle is the one you’re having fun in.</p><button className="button primary" disabled={cameraStatus === 'loading' || importing} onClick={() => startCamera()}><Icon name="camera" size={18}/>{cameraStatus === 'loading' ? 'Waiting for permission…' : 'Enable camera'}</button><button className="text-button" disabled={importing} onClick={() => chooseFiles()}>or choose photos from your device<Icon name="upload" size={15}/></button><span className="fine-print">Camera off until you say so.</span></div>)}
          <div className="camera-corners"><i /><i /><i /><i /></div>
          {cameraStatus === 'ready' && <><span className="live-badge"><i />LIVE · YOUR LOOK</span><span className="camera-shot-number">{capturing ? captureSlot + 1 : retakeSlot !== null ? retakeSlot + 1 : filled + 1}<small>/ 04</small></span>{prompts && <div className="pose-prompt">{collection.prompts[capturing ? captureSlot : retakeSlot ?? Math.min(filled, 3)]}</div>}</>}
          {countdown !== null && <div className="countdown" aria-live="off">{countdown}</div>}
          {importing && <div className="import-overlay"><span className="spinner"/>Opening your photos…</div>}
        </div>
        {(cameraError || waiting) && <div className="inline-message" role="status"><Icon name="info"/><div>{cameraError || 'Still waiting? Choose Allow in your browser, or use photos instead.'}<div className="mini-actions"><button className="text-button" onClick={() => startCamera()}>Try camera again</button><button className="text-button" onClick={() => chooseFiles()}>Use my photos</button></div></div></div>}
        <div className="camera-toolbar"><div className="camera-tools"><label className="timer-select"><Icon name="clock" size={17}/><select aria-label="Countdown timer" value={timer} disabled={capturing} onChange={event => setTimer(Number(event.target.value))}><option value={3}>3 sec</option><option value={5}>5 sec</option></select></label><button className={`icon-button ${mirror ? 'on' : ''}`} aria-label="Mirror camera" aria-pressed={mirror} disabled={capturing} onClick={() => setMirror(!mirror)}><Icon name="flip" size={18}/></button><button className={`icon-button ${sound ? 'on' : ''}`} aria-label="Shutter sound" aria-pressed={sound} disabled={capturing} onClick={() => setSound(!sound)}><Icon name={sound ? 'volume' : 'mute'} size={18}/></button><button className={`icon-button ${prompts ? 'on' : ''}`} aria-label="Pose prompts" aria-pressed={prompts} disabled={capturing} onClick={() => setPrompts(!prompts)}><Icon name="sparkle" size={18}/></button>{canSwitch && <button className="icon-button" aria-label="Switch camera" disabled={capturing} onClick={() => startCamera(facing === 'user' ? 'environment' : 'user')}><Icon name="rotate" size={18}/></button>}</div><span className="micro">YOUR PHOTOS STAY IN THIS TAB</span></div>
        <div className="shutter-area">{capturing ? <button className="button secondary" onClick={cancelCapture}><Icon name="close"/>Stop here</button> : cameraStatus === 'ready' ? <button className="shutter-button" onClick={takePhotos} disabled={importing || full && retakeSlot === null}><span><Icon name="camera" size={23}/></span>{retakeSlot !== null ? `Retake frame ${retakeSlot + 1}` : `Take ${4 - filled} ${filled === 3 ? 'photo' : 'photos'}`}</button> : !full ? <button className="button secondary" disabled={importing || cameraStatus === 'loading'} onClick={() => startCamera()}><Icon name="camera"/>{cameraStatus === 'loading' ? 'Waiting for camera…' : 'Open camera'}</button> : <span className="all-set"><Icon name="check"/>Your four moments are in.</span>}
          {!capturing && !full && <button className="text-button" disabled={importing} onClick={() => chooseFiles()}><Icon name="upload" size={16}/>Add photos</button>}{!capturing && retakeSlot !== null && <button className="text-button" onClick={() => { setRetakeSlot(null); stopCamera(); }}>Cancel retake</button>}
        </div></div>
        <aside className="photo-rail"><div className="rail-heading"><span className="eyebrow">THE LITTLE MOMENTS</span><span>{filled}/4</span></div><div className="shot-list">{scene.photos.map((photo, index) => <button key={photo?.id ?? index} className={`shot-slot ${selectedPhoto === index ? 'selected' : ''} ${capturing && captureSlot === index ? 'taking' : ''}`} disabled={capturing || importing} onClick={() => { if (photo) {
            setSelectedPhoto(index);
            stopCamera();
            setRetakeSlot(null);
        }
        else
            chooseFiles(index); }} aria-label={photo ? `Select photo ${index + 1}` : `Add photo ${index + 1}`}><span className="shot-label">0{index + 1}</span>{photo ? <PhotoPreview scene={scene} slot={index}/> : <span className="empty-shot"><Icon name="plus" size={20}/><small>{index === 0 ? 'THE INTRO' : index === 1 ? 'THE BUILDUP' : index === 2 ? 'THE PLOT TWIST' : 'THE FINALE'}</small></span>}</button>)}</div>
          {scene.photos[selectedPhoto] && !capturing && <div className="review-controls"><button className="small-button" disabled={importing || cameraStatus === 'loading'} onClick={() => { setRetakeSlot(selectedPhoto); notify('Retaking clears undo history after the new photo is captured.'); startCamera(); }}><Icon name="rotate" size={14}/>Retake</button><button className="small-button" disabled={importing} onClick={() => replace(selectedPhoto)}><Icon name="upload" size={14}/>Replace</button><button className="icon-button" disabled={selectedPhoto === 0 || importing} aria-label="Move selected photo earlier" onClick={() => { const photos = [...scene.photos]; [photos[selectedPhoto - 1], photos[selectedPhoto]] = [photos[selectedPhoto], photos[selectedPhoto - 1]]; change({ ...scene, photos }); setSelectedPhoto(selectedPhoto - 1); }}><Icon name="back" size={16}/></button><button className="icon-button" disabled={selectedPhoto === 3 || importing} aria-label="Move selected photo later" onClick={() => { const photos = [...scene.photos]; [photos[selectedPhoto + 1], photos[selectedPhoto]] = [photos[selectedPhoto], photos[selectedPhoto + 1]]; change({ ...scene, photos }); setSelectedPhoto(selectedPhoto + 1); }}><Icon name="arrow" size={16}/></button></div>}
          <FaceControls scene={scene} change={next => assign(next)} disabled={capturing || importing}/>
          <div className="final-look"><span className="micro">LIVE LOOK · {collection.name.toUpperCase()}</span><p>Look, face effects and panel decor appear live. The small preview shows your full composition. Final exports render at higher resolution.</p></div>
        </aside></div>
        <div className="workspace-actions"><button className="text-button" onClick={() => navigate('intro')} disabled={importing || capturing}><Icon name="back" size={17}/>Back</button><span className="fine-print">{full ? 'Happy with the cast? Let’s set the scene.' : `${4 - filled} more ${filled === 3 ? 'photo' : 'photos'} to complete your story.`}</span><button className="button primary" disabled={!full || importing || capturing} onClick={() => { setRetakeSlot(null); navigate('studio'); }}>Make it yours<Icon name="arrow"/></button></div>
      </section>}
      {step === 'studio' && <Editor scene={scene} change={change} commit={commit} undo={undo} redo={redo} canUndo={historyState.undo} canRedo={historyState.redo} back={() => navigate('booth')} finish={() => navigate('result')} replace={replace} notify={notify}/>}
      {step === 'result' && <Result scene={scene} format={format} setFormat={setFormat} scale={scale} setScale={setScale} change={next => change(next)} back={() => navigate('studio')} another={() => setDialog('reset')} notify={notify}/>}
    </main>
    <footer className="site-footer"><span>© 2026 KomaSnap <span className="footer-dot">·</span> Made for the plot.</span><div><button onClick={() => setDialog('privacy')}><Icon name="lock" size={13}/>Private by design</button><button onClick={() => setDialog('credits')}>About & credits<Icon name="arrow" size={13}/></button></div><span className="footer-note">FOUR FRAMES. ALL YOU.</span></footer>
    <input type="file" className="visually-hidden" ref={fileInput} accept="image/jpeg,image/png,image/webp" multiple aria-label="Upload your photos" onChange={event => { void filesSelected(event.target.files); }}/>
    {notice && <div className="toast" role="status"><Icon name="info" size={18}/><span>{notice}</span><button className="icon-button" aria-label="Dismiss message" onClick={() => setNotice('')}><Icon name="close" size={16}/></button></div>}
    {dialog === 'privacy' && <Modal title="Your photos. Your business." onClose={() => setDialog(null)}><div className="privacy-hero"><Icon name="lock" size={34}/><p>Made here.<br /><strong>Stays here.</strong></p></div><p>Your photos are processed in this browser tab. KomaSnap doesn’t upload them, track you, or save a hidden copy.</p><ul className="modal-list"><li>No account, analytics, or cloud photo processing.</li><li>Refreshing or closing this tab clears your session. Download your strip before leaving.</li><li>The camera stops when you leave the booth or hide the tab.</li><li>When you choose Share, your device hands the image to the app you select.</li><li>Hosting still receives requests for app files and may keep access logs. Client-first does not mean offline.</li></ul><button className="button primary full" onClick={() => setDialog(null)}>Sounds good<Icon name="check" size={17}/></button></Modal>}
    {dialog === 'how' && <Modal title="Four frames. That’s the whole plot." onClose={() => setDialog(null)}><ol className="how-list"><li><span>01</span><div><h3>Pick your world.</h3><p>Manga ink, soft daydreams, copy-shop chaos, or a pocketful of pixels.</p></div></li><li><span>02</span><div><h3>Show up as you.</h3><p>Take four photos or choose them from your device. Retake just the one you want.</p></div></li><li><span>03</span><div><h3>Make it a keeper.</h3><p>Add a caption, move a sticker, choose your frame. Download or share the finished image.</p></div></li></ol><button className="button primary full" onClick={() => { setDialog(null); goBooth(); }}>Let’s do this<Icon name="arrow"/></button></Modal>}
    {dialog === 'credits' && <Modal title="A small corner of the internet." onClose={() => setDialog(null)}><p>KomaSnap is a client-first creative photobooth, inspired by manga panels, photocopied zines, and little things worth keeping.</p><p>Demo portraits are original illustrations, not real people or AI-transformed photographs. Your uploaded photos receive local image effects—not generative AI.</p><p>Original illustrations, stickers, and the mark are available under CC0. Barlow Condensed, Geist, and Geist Mono are locally bundled under the SIL Open Font License.</p><p className="fine-print">Asset origins and font licenses are included with the project. No subscription. No obligatory watermark. No drama, except in your strip.</p><button className="button secondary full" onClick={() => setDialog(null)}>Back to the good stuff<Icon name="arrow"/></button></Modal>}
    {dialog === 'reset' && <Modal title="Ready for another story?" onClose={() => setDialog(null)}><p>Starting fresh clears these photos and edits. Make sure you’ve downloaded your image first.</p><div className="modal-actions"><button className="button secondary" onClick={() => setDialog(null)}>Keep this one</button><button className="button primary" onClick={reset}>Start fresh<Icon name="arrow"/></button></div></Modal>}
  </div>;
}
function Result({ scene, format, setFormat, scale, setScale, change, back, another, notify }: {
    scene: Scene;
    format: OutputFormat;
    setFormat: (format: OutputFormat) => void;
    scale: number;
    setScale: (scale: number) => void;
    change: (scene: Scene) => void;
    back: () => void;
    another: () => void;
    notify: (message: string) => void;
}) {
    const [output, setOutput] = useState<{
        url: string;
        file: File;
        key: string;
    } | null>(null);
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(0);
    const [canShare, setCanShare] = useState(false);
    const [canCopy, setCanCopy] = useState(false);
    const [distributing, setDistributing] = useState(false);
    const key = useMemo(() => JSON.stringify({ scene, format, scale }), [scene, format, scale]);
    const ready = output?.key === key && !error;
    const size = outputSize(format, scale);
    const collection = collections.find(item => item.id === scene.collection)!;
    useEffect(() => {
        const controller = new AbortController();
        let url: string | null = null;
        const timer = setTimeout(async () => {
            setError('');
            try {
                const image = await renderFinal(scene, format, scale, controller.signal);
                const blob = await toBlob(image);
                image.width = 1;
                image.height = 1;
                if (controller.signal.aborted)
                    return;
                const file = new File([blob], `komasnap-${scene.collection}-${localDate()}-${crypto.randomUUID().slice(0, 6)}.png`, { type: 'image/png' });
                url = URL.createObjectURL(blob);
                setOutput({ url, file, key });
                setCanCopy(!!navigator.clipboard?.write && typeof ClipboardItem !== 'undefined');
                setCanShare(!!navigator.canShare?.({ files: [file] }));
            }
            catch (failure) {
                if (!controller.signal.aborted)
                    setError(failure instanceof Error ? failure.message : 'Could not prepare your image. Try standard size.');
            }
        }, 50);
        return () => { clearTimeout(timer); controller.abort(); if (url)
            URL.revokeObjectURL(url); };
    }, [scene, format, scale, key, attempt]);
    const download = () => { if (!ready || !output)
        return; const anchor = document.createElement('a'); anchor.href = output.url; anchor.download = output.file.name; document.body.appendChild(anchor); anchor.click(); anchor.remove(); notify('Download started. If the image opens instead, use your browser’s save option.'); };
    const share = async () => { if (!ready || !output || distributing)
        return; setDistributing(true); try {
        await navigator.share({ files: [output.file], title: 'Made with KomaSnap' });
        notify('Your image was handed to the share sheet.');
    }
    catch (failure) {
        if (!(failure instanceof DOMException && failure.name === 'AbortError'))
            notify('Sharing isn’t available here. Download your PNG instead.');
    }
    finally {
        setDistributing(false);
    } };
    const copy = async () => { if (!ready || !output || distributing)
        return; setDistributing(true); try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': output.file })]);
        notify('Image copied. Paste it into a chat or post.');
    }
    catch {
        notify('Copy was not allowed in this browser. Download your PNG instead.');
    }
    finally {
        setDistributing(false);
    } };
    return <section className="result-page page-enter"><div className="workspace-title"><div><span className="eyebrow">03 / A LITTLE SOMETHING TO KEEP</span><h1>Oh, that’s a <em>keeper.</em></h1></div><p>Made by you. Ready for the world.<br />Or just your camera roll.</p></div><div className="result-grid"><div className="result-stage"><span className="micro result-edition">THE FINAL EDITION / {collection.name.toUpperCase()}</span><div className={`result-image ${format}`} style={{ aspectRatio: `${size.width}/${size.height}` }}>{ready && output && <Image src={output.url} alt="Your finished KomaSnap image, exactly as it will be exported" width={size.width} height={size.height} unoptimized/>}{!ready && !error && <div className="result-loading"><span className="spinner"/><span>Preparing your image…</span></div>}{error && <div className="result-loading error" role="alert"><Icon name="info" size={26}/><p>{error}</p><button className="button secondary" onClick={() => setAttempt(attempt + 1)}>Try again</button></div>}</div><span className="result-proof"><Icon name="check" size={14}/>What you see is what you save.</span></div><aside className="result-controls"><h2>Give it a good home.</h2><p className="helper">Choose a format. Keep the whole story.</p><span className="field-label">THE FORMAT</span><div className="format-options">{(['story', 'square', ...(scene.layout === 'strip' ? ['strip'] : [])] as OutputFormat[]).map(item => <button key={item} className={format === item ? 'active' : ''} aria-pressed={format === item} onClick={() => setFormat(item)}><span className={`format-icon ${item}`}/><strong>{item === 'story' ? 'Story' : item === 'square' ? 'Square' : 'Strip'}</strong><small>{item === 'story' ? '9:16' : item === 'square' ? '1:1' : '1:3'}</small></button>)}</div>{format !== 'strip' && <div className="background-control"><span className="field-label">A LITTLE BACKGROUND</span><div className="swatches">{collection.palette.map((color, index) => <button key={color} style={{ background: color }} className={scene.background === index ? 'active' : ''} aria-label={`Background ${index + 1}`} aria-pressed={scene.background === index} onClick={() => change({ ...scene, background: index })}>{scene.background === index && <Icon name="check" size={17}/>}</button>)}</div></div>}<div className="inspector-divider"/><label className="field">Image size<select value={scale} onChange={event => setScale(Number(event.target.value))}><option value={1}>Standard · ready to share</option><option value={2}>2× · a bigger keepsake</option></select></label><div className="output-meta"><span>PNG IMAGE</span><span>{size.width} × {size.height} PX</span></div><div className="distribution-buttons">{canShare && <button className="button primary share-primary full" disabled={!ready || distributing} onClick={share}><Icon name="share"/>Share image<Icon name="arrow"/></button>}<button className={`button primary full ${canShare ? 'with-share' : ''}`} disabled={!ready || distributing} onClick={download}><Icon name="download"/>Download PNG<Icon name="arrow"/></button>{canCopy && <button className="button secondary full" disabled={!ready || distributing} onClick={copy}><Icon name="copy"/>Copy image</button>}</div><p className="fine-print">No watermark required. No strings attached.<br />Sharing options depend on your device.</p><div className="private-result"><Icon name="lock" size={18}/><span>Remember to download before closing.<br /><strong>This tab is your only copy.</strong></span></div></aside></div><div className="workspace-actions"><button className="button secondary" onClick={back}><Icon name="back"/>A few more edits</button><button className="text-button" onClick={another}>One more story?<Icon name="plus" size={17}/></button></div></section>;
}
