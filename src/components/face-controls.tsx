'use client';
import type { Scene } from '@/lib/model';
import { faceEffects } from '@/lib/face-effects';
import { Slider } from './ui';

export function FaceControls({ scene, change, disabled = false }: { scene: Scene; change: (scene: Scene) => void; disabled?: boolean }) {
    return <fieldset className="face-controls" disabled={disabled}>
        <legend>FACE EFFECTS <span>ON YOUR DEVICE</span></legend>
        <div className="face-options">{faceEffects.map(effect => <button type="button" key={effect.id} aria-pressed={(scene.faceEffect ?? 'none') === effect.id} onClick={() => change({ ...scene, faceEffect: effect.id })}>{effect.name}</button>)}</div>
        {scene.faceEffect && scene.faceEffect !== 'none' && <Slider label="Face effect intensity" suffix="%" value={scene.faceIntensity ?? 70} onChange={faceIntensity => change({ ...scene, faceIntensity })}/>}
        <p className="fine-print">One face at a time. No face recognition. No photo uploads.</p>
    </fieldset>;
}
