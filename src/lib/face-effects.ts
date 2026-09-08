import type { Photo, Scene } from './model';

export const faceEffects = [
    { id: 'none', name: 'Off' }, { id: 'blush', name: 'Soft Blush' },
    { id: 'manga', name: 'Manga Blush' }, { id: 'freckles', name: 'Freckles' },
    { id: 'starry', name: 'Starry' }, { id: 'neko', name: 'Neko' },
    { id: 'drama', name: 'Drama' },
] as const;

export function drawFaceEffect(painter: CanvasRenderingContext2D, photo: Photo, scene: Scene, width: number, height: number) {
    const points = photo.landmarks;
    if (!points?.[454] || !scene.faceEffect || scene.faceEffect === 'none') return;
    const left = points[234], right = points[454];
    const faceWidth = Math.hypot((right.x - left.x) * width, (right.y - left.y) * height);
    const angle = Math.atan2((right.y - left.y) * height, (right.x - left.x) * width);
    const mark = (index: number, paint: () => void) => {
        painter.save();
        painter.translate(points[index].x * width, points[index].y * height);
        painter.rotate(angle);
        painter.scale(faceWidth, faceWidth);
        painter.globalAlpha = (scene.faceIntensity ?? 70) / 100;
        painter.lineCap = 'round';
        paint();
        painter.restore();
    };
    for (const cheek of [50, 280]) mark(cheek, () => {
        if (scene.faceEffect === 'blush' || scene.faceEffect === 'manga') {
            painter.scale(1, 0.52);
            const glow = painter.createRadialGradient(0, 0, 0.015, 0, 0, 0.17);
            glow.addColorStop(0, '#e8667bbf'); glow.addColorStop(1, '#e8667b00');
            painter.fillStyle = glow; painter.fillRect(-0.18, -0.18, 0.36, 0.36);
            if (scene.faceEffect === 'manga') {
                painter.strokeStyle = '#c43d52'; painter.lineWidth = 0.012;
                for (const offset of [-0.07, 0, 0.07]) {
                    painter.beginPath(); painter.moveTo(offset + 0.025, -0.07); painter.lineTo(offset - 0.025, 0.07); painter.stroke();
                }
            }
        }
        if (scene.faceEffect === 'freckles') {
            painter.fillStyle = '#995740';
            for (let index = 0; index < 7; index++) {
                painter.beginPath(); painter.arc((index % 4 - 1.5) * 0.045, Math.floor(index / 4) * 0.045 - 0.02, 0.008, 0, Math.PI * 2); painter.fill();
            }
        }
        if (scene.faceEffect === 'neko') {
            painter.strokeStyle = '#493339'; painter.lineWidth = 0.009;
            const direction = cheek === 50 ? -1 : 1;
            for (const offset of [-0.04, 0.015, 0.07]) {
                painter.beginPath(); painter.moveTo(0, offset); painter.lineTo(direction * 0.17, offset * 1.7); painter.stroke();
            }
        }
    });
    if (scene.faceEffect === 'neko') mark(1, () => {
        painter.fillStyle = '#da8490'; painter.beginPath(); painter.moveTo(-0.045, -0.018); painter.lineTo(0.045, -0.018); painter.quadraticCurveTo(0, 0.075, -0.045, -0.018); painter.fill();
    });
    if (scene.faceEffect === 'starry') for (const index of [33, 263]) mark(index, () => {
        painter.translate(index === 33 ? -0.075 : 0.075, -0.03);
        painter.fillStyle = '#ffcf67'; painter.strokeStyle = '#956331'; painter.lineWidth = 0.006;
        painter.beginPath();
        for (let vertex = 0; vertex < 8; vertex++) {
            const radius = vertex % 2 ? 0.022 : 0.082;
            const rotation = vertex * Math.PI / 4;
            painter.lineTo(Math.cos(rotation) * radius, Math.sin(rotation) * radius);
        }
        painter.closePath(); painter.fill(); painter.stroke();
    });
    if (scene.faceEffect === 'drama') mark(389, () => {
        painter.translate(0.025, 0.045); painter.fillStyle = '#87cbe2'; painter.strokeStyle = '#3b657b'; painter.lineWidth = 0.006;
        painter.beginPath(); painter.moveTo(0, -0.1); painter.bezierCurveTo(-0.11, 0.025, -0.04, 0.09, 0.01, 0.075); painter.bezierCurveTo(0.09, 0.065, 0.055, 0, 0, -0.1); painter.fill(); painter.stroke();
    });
}
