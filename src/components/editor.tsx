'use client';
import Image from 'next/image';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { clamp, collections, defaultCrop, geometry, graphemes, layouts, localDate, objectRect, textLimit, type Crop, type Photo, type Scene, type SceneObject } from '@/lib/model';
import { stickerUrl, stickers } from '@/lib/stickers';
import { Artwork, Icon, Modal, PhotoPreview, Slider } from './ui';
import { FaceControls } from './face-controls';
import { FaceTracker } from '@/lib/face-tracker';
import { loadImage } from '@/lib/render';
function FacePhotoTracking({ scene, change }: { scene: Scene; change: (scene: Scene) => void }) {
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const [tracker] = useState(() => new FaceTracker());
    const latest = useRef(scene);
    const mounted = useRef(true);
    useEffect(() => { latest.current = scene; }, [scene]);
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; tracker.close(); }; }, [tracker]);
    if (!scene.faceEffect || scene.faceEffect === 'none') return null;
    const detect = async () => {
        setBusy(true); setMessage('Finding one face in each photo, locally…');
        try {
            const results = new Map<string, NonNullable<Photo['landmarks']>>();
            for (const photo of latest.current.photos) {
                if (!mounted.current) return;
                if (photo) results.set(photo.id, await tracker.detect(await loadImage(photo.url)));
            }
            if (!mounted.current) return;
            change({ ...latest.current, photos: latest.current.photos.map(photo => photo && results.has(photo.id) ? { ...photo, landmarks: results.get(photo.id) } : photo) });
            setMessage([...results.values()].some(points => points.length) ? 'Effects placed. Photos without a detected face stay unchanged.' : 'No face found. Try a clear, front-facing photo with good light.');
        } catch { if (mounted.current) setMessage('Tracking unavailable. Your photos are safe. You can retry or turn the effect off.'); }
        finally { if (mounted.current) setBusy(false); }
    };
    return <div className="face-photo-tracking"><button className="button secondary full" disabled={busy} onClick={detect}>{busy ? 'Finding faces…' : 'Fit effects to photos'}</button><p className="fine-print" role="status">{message || 'Use this for uploads, or photos captured with face effects off.'}</p></div>;
}
type EditorProps = {
    scene: Scene;
    change: (scene: Scene, transient?: boolean) => void;
    commit: () => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    back: () => void;
    finish: () => void;
    replace: (slot: number) => void;
    notify: (message: string) => void;
};
export function Editor({ scene, change, commit, undo, redo, canUndo, canRedo, back, finish, replace, notify }: EditorProps) {
    const [tab, setTab] = useState('Look');
    const [previewError, setPreviewError] = useState('');
    const [selected, setSelected] = useState<string | null>(null);
    const [cropSlot, setCropSlot] = useState<number | null>(null);
    const art = geometry(scene);
    const activeObject = scene.objects.find(object => object.id === selected);
    const overlay = useRef<HTMLDivElement>(null);
    const drag = useRef<{
        id: string;
        x: number;
        y: number;
        startX: number;
        startY: number;
        anchorWidth: number;
        anchorHeight: number;
        mode: 'move' | 'scale' | 'rotate';
        scale: number;
        rotation: number;
    } | null>(null);
    const [clearConfirm, setClearConfirm] = useState(false);
    const patch = (values: Partial<Scene>, transient = false) => change({ ...scene, ...values }, transient);
    const editObject = (values: Partial<SceneObject>, transient = false) => { if (!activeObject)
        return; patch({ objects: scene.objects.map(object => object.id === activeObject.id ? { ...object, ...values } : object) }, transient); };
    const add = (asset: string) => { if (scene.objects.length >= 12) {
        notify('Twelve decorations is the limit. Remove one to make room.');
        return;
    } const object: SceneObject = { id: crypto.randomUUID(), asset, text: asset.startsWith('bubble') ? 'PLOT TWIST!' : '', anchor: 'artwork', x: 0.7, y: 0.35, scale: 1, rotation: -8 }; patch({ objects: [...scene.objects, object] }); setSelected(object.id); };
    const startDrag = (event: PointerEvent<HTMLButtonElement>, object: SceneObject, mode: 'move' | 'scale' | 'rotate') => {
        event.preventDefault();
        event.stopPropagation();
        setSelected(object.id);
        const bounds = overlay.current!.getBoundingClientRect();
        const anchor = object.anchor === 'artwork' ? art : art.panels.find(panel => panel.slot === object.anchor)!;
        drag.current = { id: object.id, startX: event.clientX, startY: event.clientY, x: object.x, y: object.y, anchorWidth: anchor.width * bounds.width / art.width, anchorHeight: anchor.height * bounds.height / art.height, mode, scale: object.scale, rotation: object.rotation };
        event.currentTarget.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent<HTMLButtonElement>) => {
        const current = drag.current;
        if (!current)
            return;
        const distanceX = event.clientX - current.startX, distanceY = event.clientY - current.startY;
        const values = current.mode === 'move' ? { x: clamp(current.x + distanceX / current.anchorWidth, 0.04, 0.96), y: clamp(current.y + distanceY / current.anchorHeight, 0.04, 0.96) } : current.mode === 'scale' ? { scale: clamp(current.scale + (distanceX + distanceY) / 110, 0.4, 2.4) } : { rotation: clamp(current.rotation + distanceX, -180, 180) };
        patch({ objects: scene.objects.map(object => object.id === current.id ? { ...object, ...values } : object) }, true);
    };
    const end = () => { if (drag.current) {
        drag.current = null;
        commit();
    } };
    return <section className="studio-page page-enter">
    <div className="workspace-title"><div><span className="eyebrow">02 / THE STUDIO</span><h1>Make it <em>yours.</em></h1></div><p>A little more you. A little less ordinary.</p></div>
    <div className="studio-grid">
      <div className="editor-workspace" onKeyDown={event => {
            if ((event.target as HTMLElement).matches('input, textarea, select'))
                return;
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
                event.preventDefault();
                if (event.shiftKey)
                    redo();
                else
                    undo();
            }
            if (event.key === 'Escape')
                setSelected(null);
            if (!activeObject)
                return;
            if (event.key === 'Delete' || event.key === 'Backspace') {
                event.preventDefault();
                patch({ objects: scene.objects.filter(object => object.id !== selected) });
                setSelected(null);
            }
            const delta = event.shiftKey ? 0.04 : 0.01;
            if (event.key.startsWith('Arrow')) {
                event.preventDefault();
                editObject({ x: clamp(activeObject.x + (event.key === 'ArrowRight' ? delta : event.key === 'ArrowLeft' ? -delta : 0), 0.04, 0.96), y: clamp(activeObject.y + (event.key === 'ArrowDown' ? delta : event.key === 'ArrowUp' ? -delta : 0), 0.04, 0.96) });
            }
        }}>
        <div className="workspace-topline"><span className="micro">YOUR ORIGINAL EDITION</span><div className="history-buttons"><button className="icon-button" onClick={undo} disabled={!canUndo} aria-label="Undo"><Icon name="undo"/></button><button className="icon-button" onClick={redo} disabled={!canRedo} aria-label="Redo"><Icon name="redo"/></button></div></div>
        <div className={`editable-art ${scene.layout}`}>
          <Artwork scene={scene} width={scene.layout === 'strip' ? 420 : 650} onError={setPreviewError}/>
          <div className="object-overlay" ref={overlay} onClick={event => { if (event.target === event.currentTarget)
        setSelected(null); }}>
            {scene.objects.map(object => {
            const bounds = objectRect(object, scene);
            if (!bounds)
                return null;
            return <div key={object.id} className={`object-controls ${selected === object.id ? 'selected' : ''}`} style={{ left: `${bounds.x / art.width * 100}%`, top: `${bounds.y / art.height * 100}%`, width: `${bounds.width / art.width * 100}%`, height: `${bounds.height / art.height * 100}%`, transform: `translate(-50%, -50%) rotate(${object.rotation}deg)` }}>
              <button className="object-hit" aria-label={`Move ${object.asset}`} onPointerDown={event => startDrag(event, object, 'move')} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onClick={() => { setSelected(object.id); setTab('Decor'); }}/>
              {selected === object.id && <><button className="object-handle resize" aria-label="Resize decoration" onPointerDown={event => startDrag(event, object, 'scale')} onPointerMove={move} onPointerUp={end} onPointerCancel={end}/><button className="object-handle rotation" aria-label="Rotate decoration" onPointerDown={event => startDrag(event, object, 'rotate')} onPointerMove={move} onPointerUp={end} onPointerCancel={end}><Icon name="rotate" size={12}/></button></>}
            </div>;
        })}
          </div>
        </div>
        <span className="workspace-hint"><Icon name="lock" size={12}/> Made here. Stays here.</span>
      </div>
      <aside className="inspector">
        <div className="editor-tabs" role="tablist" aria-label="Customize your strip">{['Look', 'Layout', 'Photos', 'Decor', 'Text'].map(item => <button role="tab" id={`tab-${item}`} aria-controls={`panel-${item}`} aria-selected={tab === item} tabIndex={tab === item ? 0 : -1} key={item} onClick={() => setTab(item)} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
        const items = ['Look', 'Layout', 'Photos', 'Decor', 'Text'];
        const next = items[(items.indexOf(item) + (event.key === 'ArrowRight' ? 1 : 4)) % 5];
        setTab(next);
        document.getElementById(`tab-${next}`)?.focus();
    } }}>{item}</button>)}</div>
        <div className="inspector-content" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === 'Look' && <><FaceControls scene={scene} change={change}/><FacePhotoTracking scene={scene} change={change}/><div className="section-label"><h2>Pick your world</h2><span>01—{String(collections.length).padStart(2, '0')}</span></div><div className="look-options">{collections.map(collection => <button key={collection.id} className={`look-option ${scene.collection === collection.id ? 'active' : ''}`} aria-pressed={scene.collection === collection.id} onClick={() => patch({ collection: collection.id, background: 0 })}><span className={`look-symbol ${collection.id}`}><Icon name={collection.icon} size={25}/></span><span><strong>{collection.name}</strong><small>{collection.description}</small></span>{scene.collection === collection.id && <Icon name="check" size={16}/>}</button>)}</div>{scene.collection !== 'normal' && <Slider label="Effect intensity" value={scene.intensity} suffix="%" onChange={intensity => patch({ intensity }, true)} onCommit={commit}/>}<div className="inspector-divider"/>{scene.collection === 'normal' ? <><h2>Nothing extra. Just you.</h2><p className="helper">Original photo colors, no automatic stickers or textures. Your crop, exposure, optional face effects and hand-placed decor stay editable.</p></> : <><h2>The finishing touches</h2><p className="helper">Same photos. A different little story.</p><button className="button secondary full" onClick={() => patch({ seed: scene.seed + 1 })}><Icon name="shuffle"/>Remix the details<span className="micro">{scene.seed % 3 + 1}/3</span></button><p className="fine-print">Only the preset decorations change. Your edits stay yours.</p></>}</>}
          {tab === 'Layout' && <><h2>A frame for your story</h2><p className="helper">All your photos stay safe when you switch.</p>{layouts.map(layout => <button key={layout.id} className={`layout-option ${scene.layout === layout.id ? 'active' : ''}`} aria-pressed={scene.layout === layout.id} onClick={() => patch({ layout: layout.id })}><span className={`layout-icon ${layout.id}`}>{Array.from({ length: layout.id === 'cover' ? 1 : 4 }, (_, index) => <i key={index}/>)}</span><span><strong>{layout.name}</strong><small>{layout.description}</small></span>{layout.id === scene.layout && <Icon name="check" size={16}/>}</button>)}{scene.layout === 'cover' && <><h3>Your cover star</h3><div className="cover-picker">{scene.photos.map((photo, index) => <button key={photo?.id ?? index} className={scene.cover === index ? 'active' : ''} aria-label={`Choose photo ${index + 1} for cover`} aria-pressed={scene.cover === index} onClick={() => patch({ cover: index })}><PhotoPreview scene={scene} slot={index}/><span>{index + 1}</span></button>)}</div></>}</>}
          {tab === 'Photos' && <><h2>Every frame counts</h2><p className="helper">Adjust the crop, exposure, or order.</p><div className="editor-photo-list">{scene.photos.map((photo, index) => <div key={photo?.id ?? index} className="editor-photo-row"><button className="photo-open" aria-label={`Adjust photo ${index + 1}`} onClick={() => setCropSlot(index)}><PhotoPreview scene={scene} slot={index}/></button><div><strong>Frame 0{index + 1}</strong><div className="mini-actions"><button className="text-button" onClick={() => setCropSlot(index)}>Adjust</button><button className="text-button" onClick={() => replace(index)}>Replace</button></div></div><div className="reorder-buttons"><button className="icon-button" aria-label={`Move photo ${index + 1} earlier`} disabled={index === 0} onClick={() => { const photos = [...scene.photos]; [photos[index - 1], photos[index]] = [photos[index], photos[index - 1]]; patch({ photos }); }}><Icon name="back" size={15}/></button><button className="icon-button" aria-label={`Move photo ${index + 1} later`} disabled={index === 3} onClick={() => { const photos = [...scene.photos]; [photos[index + 1], photos[index]] = [photos[index], photos[index + 1]]; patch({ photos }); }}><Icon name="arrow" size={15}/></button></div></div>)}</div></>}
          {tab === 'Decor' && <><div className="section-label"><h2>A little extra drama</h2><span>{scene.objects.length}/12</span></div><div className="sticker-grid">{stickers.filter(sticker => sticker.collection === scene.collection).map(sticker => <button key={sticker.id} title={sticker.name} aria-label={`Add ${sticker.name}`} onClick={() => add(sticker.id)}><Image src={stickerUrl(sticker.id)} alt="" width={120} height={120} unoptimized/></button>)}</div><div className="bubble-buttons"><button className="button secondary" onClick={() => add('bubble-oval')}>Speech bubble<Icon name="plus" size={16}/></button><button className="button secondary" onClick={() => add('bubble-burst')}>Shout!<Icon name="plus" size={16}/></button></div>
            {scene.objects.length > 0 && <label className="field">Selected decoration<select value={selected ?? ''} onChange={event => setSelected(event.target.value || null)}><option value="">Choose a decoration</option>{scene.objects.map((object, index) => <option value={object.id} key={object.id}>{index + 1}. {object.asset}{!objectRect(object, scene) ? ' (hidden in this layout)' : ''}</option>)}</select></label>}
            {activeObject && <div className="object-inspector"><div className="section-label"><h3>{activeObject.asset.replaceAll('-', ' ')}</h3><div><button className="icon-button" aria-label="Duplicate decoration" onClick={() => { if (scene.objects.length >= 12)
                return notify('Remove a decoration to make room.'); const object = { ...activeObject, id: crypto.randomUUID(), x: clamp(activeObject.x + 0.05, 0.04, 0.96) }; patch({ objects: [...scene.objects, object] }); setSelected(object.id); }}><Icon name="copy" size={17}/></button><button className="icon-button" aria-label="Delete decoration" onClick={() => { patch({ objects: scene.objects.filter(object => object.id !== selected) }); setSelected(null); }}><Icon name="trash" size={17}/></button></div></div>
              {activeObject.asset.startsWith('bubble') && <label className="field">What happens next?<textarea value={activeObject.text} rows={3} onChange={event => editObject({ text: textLimit(event.target.value, 60) }, true)} onBlur={commit}/><small>{graphemes(activeObject.text).length}/60 · Keep it short so it fits.</small></label>}
              <label className="field">Attach to<select value={activeObject.anchor} onChange={event => editObject({ anchor: event.target.value === 'artwork' ? 'artwork' : Number(event.target.value), x: 0.5, y: 0.5 })}><option value="artwork">Whole artwork</option>{[0, 1, 2, 3].map(index => <option key={index} value={index}>Panel {index + 1}</option>)}</select></label>
              <Slider label="Horizontal position" value={Math.round(activeObject.x * 100)} min={4} max={96} onChange={value => editObject({ x: value / 100 }, true)} onCommit={commit}/><Slider label="Vertical position" value={Math.round(activeObject.y * 100)} min={4} max={96} onChange={value => editObject({ y: value / 100 }, true)} onCommit={commit}/><Slider label="Size" value={activeObject.scale} min={0.4} max={2.4} step={0.05} suffix="×" onChange={scale => editObject({ scale }, true)} onCommit={commit}/><Slider label="Rotation" value={activeObject.rotation} min={-180} max={180} suffix="°" onChange={rotation => editObject({ rotation }, true)} onCommit={commit}/>
              <div className="mini-actions">{[-15, 0, 15].map(rotation => <button key={rotation} className="small-button" onClick={() => editObject({ rotation })}>{rotation}°</button>)}<button className="small-button" onClick={() => patch({ objects: [activeObject, ...scene.objects.filter(object => object.id !== selected)] })}>To back</button><button className="small-button" onClick={() => patch({ objects: [...scene.objects.filter(object => object.id !== selected), activeObject] })}>To front</button></div>
            </div>}
            {scene.objects.length > 0 && <button className="text-button danger" onClick={() => setClearConfirm(true)}>Clear my decorations</button>}
          </>}
          {tab === 'Text' && <><h2>Put it into words</h2><p className="helper">An episode title. An inside joke. A moment.</p><label className="field">Title<input value={scene.title} onChange={event => patch({ title: textLimit(event.target.value, 40) }, true)} onBlur={commit}/><small>{graphemes(scene.title).length}/40</small></label><label className="field">A little caption<textarea rows={3} value={scene.caption} onChange={event => patch({ caption: textLimit(event.target.value, 60) }, true)} onBlur={commit}/><small>{graphemes(scene.caption).length}/60</small></label><label className="toggle-row"><span>Add a date</span><input type="checkbox" checked={scene.showDate} onChange={event => patch({ showDate: event.target.checked, date: scene.date || localDate() })}/></label>{scene.showDate && <label className="field">Date<input type="date" value={scene.date} onChange={event => patch({ date: event.target.value })}/></label>}<label className="toggle-row"><span>Small KomaSnap credit<small>Always optional. Always free.</small></span><input type="checkbox" checked={scene.credit} onChange={event => patch({ credit: event.target.checked })}/></label></>}
        </div>
      </aside>
    </div>
    <div className="workspace-actions"><button className="button secondary" onClick={back}><Icon name="back"/>Back to photos</button><span className="fine-print">Keep this tab open. Refreshing clears your photos.</span><button className="button primary" onClick={finish} disabled={!!previewError}>Finish strip<Icon name="arrow"/></button></div>
    {cropSlot !== null && scene.photos[cropSlot] && <CropModal scene={scene} slot={cropSlot} onClose={() => setCropSlot(null)} onApply={photo => { patch({ photos: scene.photos.map((item, index) => index === cropSlot ? photo : item) }); setCropSlot(null); }}/>}
    {clearConfirm && <Modal title="Clear your decorations?" onClose={() => setClearConfirm(false)}><p>This removes your added stickers and speech bubbles. Your photos and preset details stay.</p><div className="modal-actions"><button className="button secondary" onClick={() => setClearConfirm(false)}>Keep them</button><button className="button primary" onClick={() => { patch({ objects: [] }); setSelected(null); setClearConfirm(false); }}>Clear decorations</button></div></Modal>}
  </section>;
}
function CropModal({ scene, slot, onClose, onApply }: {
    scene: Scene;
    slot: number;
    onClose: () => void;
    onApply: (photo: Photo) => void;
}) {
    const [photo, setPhoto] = useState(scene.photos[slot]!);
    const crop = photo.crops[scene.layout] ?? defaultCrop;
    const drag = useRef<{
        x: number;
        y: number;
        crop: Crop;
    } | null>(null);
    const cropChange = (values: Partial<Crop>) => setPhoto({ ...photo, crops: { ...photo.crops, [scene.layout]: { ...crop, ...values } } });
    return <Modal title={`A closer look · Frame 0${slot + 1}`} onClose={onClose} className="crop-modal"><div className="crop-preview" onPointerDown={event => { drag.current = { x: event.clientX, y: event.clientY, crop }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={event => { if (drag.current)
        cropChange({ x: clamp(drag.current.crop.x + (event.clientX - drag.current.x) / 130 * (photo.mirror ? -1 : 1), -1, 1), y: clamp(drag.current.crop.y + (event.clientY - drag.current.y) / 130, -1, 1) }); }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}><PhotoPreview scene={{ ...scene, photos: scene.photos.map((item, index) => index === slot ? photo : item) }} slot={slot} large/><div className="crop-grid"/></div><p className="fine-print">Drag to position, or use the sliders. Crop changes apply to this layout.</p><Slider label="Zoom" value={crop.zoom} min={1} max={3} step={0.05} suffix="×" onChange={zoom => cropChange({ zoom })}/><Slider label="Horizontal" value={crop.x} min={-1} max={1} step={0.02} onChange={x => cropChange({ x })}/><Slider label="Vertical" value={crop.y} min={-1} max={1} step={0.02} onChange={y => cropChange({ y })}/><Slider label="Exposure" value={photo.exposure} min={-1} max={1} step={0.05} onChange={exposure => setPhoto({ ...photo, exposure })}/><label className="toggle-row"><span>Mirror this photo</span><input type="checkbox" checked={photo.mirror} onChange={event => setPhoto({ ...photo, mirror: event.target.checked })}/></label><div className="modal-actions"><button className="text-button" onClick={() => { setPhoto({ ...photo, exposure: 0, crops: { ...photo.crops, [scene.layout]: { ...defaultCrop } } }); }}>Reset crop</button><button className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" onClick={() => onApply(photo)}>Apply<Icon name="check" size={16}/></button></div></Modal>;
}
