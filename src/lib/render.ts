import { collections, defaultCrop, geometry, objectRect, outputSize, type Scene, type OutputFormat, type Photo, type Rect } from './model';
import { filterRows, type FilterRequest } from './filter';
import { stickerUrl, stickers } from './stickers';
import { drawFaceEffect } from './face-effects';
let filterWorker: Worker | null = null;
let sequence = 0;
let workerUnavailable = false;
const pending = new Map<number, {
    resolve: (data: Uint8ClampedArray) => void;
    reject: (reason: Error) => void;
}>();
const imageCache = new Map<string, HTMLImageElement>();
export function releaseImages() { imageCache.clear(); }
export function stopRenderer() { filterWorker?.terminate(); filterWorker = null; pending.forEach(job => job.reject(new Error('Processing stopped'))); pending.clear(); releaseImages(); }
export async function loadImage(url: string) {
    if (imageCache.has(url))
        return imageCache.get(url)!;
    const image = new Image();
    image.src = url;
    await image.decode();
    if (!url.startsWith('blob:')) {
        if (imageCache.size > 40)
            imageCache.delete(imageCache.keys().next().value!);
        imageCache.set(url, image);
    }
    return image;
}
export const yieldTask = () => new Promise<void>(resolve => setTimeout(resolve, 0));
function canvas(width: number, height: number) { const element = document.createElement('canvas'); element.width = Math.max(1, Math.round(width)); element.height = Math.max(1, Math.round(height)); return element; }
function context(element: HTMLCanvasElement) { const result = element.getContext('2d', { willReadFrequently: true }); if (!result)
    throw new Error('Your browser could not create an image canvas.'); return result; }
function check(signal?: AbortSignal) { if (signal?.aborted)
    throw new DOMException('Cancelled', 'AbortError'); }
async function processPixels(request: FilterRequest) {
    if (!workerUnavailable && typeof Worker !== 'undefined') {
        try {
            if (!filterWorker) {
                filterWorker = new Worker('/workers/filter.js', { type: 'module' });
                filterWorker.onmessage = (event: MessageEvent<{
                    id: number;
                    data: Uint8ClampedArray;
                    error?: string;
                }>) => { const job = pending.get(event.data.id); pending.delete(event.data.id); if (event.data.error)
                    job?.reject(new Error(event.data.error));
                else
                    job?.resolve(event.data.data); };
                filterWorker.onerror = () => { workerUnavailable = true; filterWorker?.terminate(); filterWorker = null; pending.forEach(job => job.reject(new Error('Worker unavailable'))); pending.clear(); };
            }
            const copy = new Uint8ClampedArray(request.data);
            return await new Promise<Uint8ClampedArray>((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); filterWorker!.postMessage({ ...request, data: copy, id }, [copy.buffer]); });
        }
        catch {
            workerUnavailable = true;
        }
    }
    for (let row = 0; row < request.height; row += 48) {
        filterRows(request, row, row + 48);
        await yieldTask();
    }
    return request.data;
}
export async function renderPhoto(photo: Photo, scene: Scene, panel: Rect, width: number, signal?: AbortSignal, liveSource?: HTMLCanvasElement) {
    check(signal);
    const source = liveSource ?? await loadImage(photo.url);
    const sourceWidth = liveSource?.width ?? photo.width;
    const sourceHeight = liveSource?.height ?? photo.height;
    check(signal);
    const rasterWidth = scene.collection === 'pocket' ? 160 : Math.max(1, Math.round(width));
    const raster = canvas(rasterWidth, rasterWidth * panel.height / panel.width);
    const painter = context(raster);
    const crop = photo.crops[scene.layout] ?? defaultCrop;
    const scale = Math.max(raster.width / sourceWidth, raster.height / sourceHeight) * crop.zoom;
    const drawWidth = sourceWidth * scale;
    const drawHeight = sourceHeight * scale;
    painter.fillStyle = '#fffaf0';
    painter.fillRect(0, 0, raster.width, raster.height);
    painter.save();
    if (photo.mirror) {
        painter.translate(raster.width, 0);
        painter.scale(-1, 1);
    }
    painter.drawImage(source, (raster.width - drawWidth) / 2 + crop.x * (drawWidth - raster.width) / 2, (raster.height - drawHeight) / 2 + crop.y * (drawHeight - raster.height) / 2, drawWidth, drawHeight);
    painter.restore();
    const pixels = painter.getImageData(0, 0, raster.width, raster.height);
    const output = await processPixels({ data: pixels.data, width: raster.width, height: raster.height, collection: scene.collection, intensity: scene.intensity, exposure: photo.exposure, seed: scene.seed });
    check(signal);
    pixels.data.set(output);
    painter.putImageData(pixels, 0, 0);
    if (scene.collection === 'shoujo') {
        const soft = canvas(Math.max(1, raster.width / 18), Math.max(1, raster.height / 18));
        context(soft).drawImage(raster, 0, 0, soft.width, soft.height);
        painter.globalCompositeOperation = 'screen';
        painter.globalAlpha = 0.12 * scene.intensity / 100;
        painter.drawImage(soft, 0, 0, raster.width, raster.height);
        painter.globalAlpha = 1;
        painter.globalCompositeOperation = 'source-over';
    }
    painter.save();
    if (photo.mirror) { painter.translate(raster.width, 0); painter.scale(-1, 1); }
    painter.translate((raster.width - drawWidth) / 2 + crop.x * (drawWidth - raster.width) / 2, (raster.height - drawHeight) / 2 + crop.y * (drawHeight - raster.height) / 2);
    drawFaceEffect(painter, photo, scene, drawWidth, drawHeight);
    painter.restore();
    return raster;
}
function displayFont() { return getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim() || 'Arial'; }
function uiFont() { return getComputedStyle(document.documentElement).getPropertyValue('--font-geist-sans').trim() || 'Arial'; }
function text(painter: CanvasRenderingContext2D, value: string, x: number, y: number, maxWidth: number, size: number, minSize: number, lines = 1, display = false) {
    let rows: string[] = [];
    for (let fontSize = size; fontSize >= minSize; fontSize--) {
        painter.font = `700 ${fontSize}px ${display ? displayFont() : uiFont()}`;
        rows = [''];
        for (const character of Array.from(value)) {
            const last = rows.length - 1;
            if (character === '\n')
                rows.push('');
            else if (painter.measureText(rows[last] + character).width > maxWidth && rows[last])
                rows.push(character);
            else
                rows[last] += character;
        }
        if (rows.length <= lines) {
            rows.forEach((row, index) => painter.fillText(row.trim(), x, y + index * fontSize * 1.18));
            return;
        }
    }
    throw new Error('That text needs a little more room. Shorten the caption or speech bubble.');
}
function speedlines(painter: CanvasRenderingContext2D, panel: Rect, seed: number, amount: number) {
    painter.save();
    painter.beginPath();
    painter.rect(panel.x, panel.y, panel.width, panel.height);
    painter.clip();
    painter.globalAlpha = amount * 0.55;
    for (let index = 0; index < 32; index++) {
        const angle = (index + seed * 0.2) / 32 * Math.PI * 2;
        const centerX = panel.x + panel.width / 2, centerY = panel.y + panel.height / 2;
        painter.lineWidth = index % 3 === 0 ? 2 : 0.7;
        painter.beginPath();
        painter.moveTo(centerX + Math.cos(angle) * panel.width * 0.38, centerY + Math.sin(angle) * panel.height * 0.38);
        painter.lineTo(centerX + Math.cos(angle) * panel.width, centerY + Math.sin(angle) * panel.height);
        painter.stroke();
    }
    painter.restore();
}
async function defaultDecor(painter: CanvasRenderingContext2D, scene: Scene) {
    if (scene.collection === 'normal') return;
    const art = geometry(scene);
    const pack = stickers.filter(sticker => sticker.collection === scene.collection);
    if (!pack.length) return;
    const preset = scene.seed % 3;
    for (let index = 0; index < Math.min(art.panels.length, 3); index++) {
        const panel = art.panels[index];
        const asset = pack[(index + preset * 2) % pack.length];
        const picture = await loadImage(stickerUrl(asset.id));
        painter.save();
        painter.translate(index % 2 === 0 ? panel.x + panel.width - 15 : panel.x + 15, panel.y + panel.height - 5);
        painter.rotate(((preset - 1) * 5 + (index % 2 ? -8 : 8)) * Math.PI / 180);
        const size = scene.collection === 'copy' ? 65 : 49;
        painter.drawImage(picture, -size / 2, -size / 2, size, size);
        painter.restore();
    }
}
export async function renderArtwork(scene: Scene, width = 480, signal?: AbortSignal, live?: { slot: number; source: HTMLCanvasElement }) {
    await document.fonts.ready;
    check(signal);
    const art = geometry(scene);
    const result = canvas(width, width * art.height / art.width);
    const painter = context(result);
    const scale = result.width / art.width;
    painter.scale(scale, scale);
    const paper = scene.collection === 'normal' ? '#fffefa' : scene.collection === 'hero' ? '#fff3d4' : scene.collection === 'shoujo' ? '#f6eff8' : scene.collection === 'pocket' ? '#e0e8ba' : scene.collection === 'riso' ? '#f6e8d5' : scene.collection === 'vhs' ? '#e5e7ed' : scene.collection === 'flash' ? '#fff2df' : '#fffaf0';
    painter.fillStyle = paper;
    painter.fillRect(0, 0, art.width, art.height);
    painter.fillStyle = '#282824';
    painter.strokeStyle = '#282824';
    painter.textAlign = 'left';
    text(painter, 'KOMASNAP', 24, 31, 180, 19, 14, 1, true);
    painter.textAlign = 'right';
    text(painter, scene.collection === 'pocket' ? 'LVL. 098' : scene.collection === 'hero' ? 'HERO EDITION' : 'ISSUE 001', art.width - 24, 30, 130, 10, 10);
    for (const panel of art.panels) {
        check(signal);
        const photo = scene.photos[panel.slot];
        if (photo) {
            const image = await renderPhoto(photo, scene, panel, panel.width * scale, signal, live?.slot === panel.slot ? live.source : undefined);
            painter.imageSmoothingEnabled = scene.collection !== 'pocket';
            painter.drawImage(image, panel.x, panel.y, panel.width, panel.height);
            image.width = 1;
            image.height = 1;
        }
        else {
            painter.fillStyle = '#e7e1d5';
            painter.fillRect(panel.x, panel.y, panel.width, panel.height);
        }
        painter.lineWidth = 2;
        painter.strokeStyle = '#282824';
        painter.strokeRect(panel.x, panel.y, panel.width, panel.height);
        if (scene.collection === 'impact')
            speedlines(painter, panel, scene.seed + panel.slot, scene.intensity / 100);
        painter.fillStyle = paper;
        painter.fillRect(panel.x + 7, panel.y + 7, 26, 19);
        painter.fillStyle = '#282824';
        painter.textAlign = 'center';
        text(painter, `0${panel.slot + 1}`, panel.x + 20, panel.y + 21, 24, 11, 10);
        await yieldTask();
    }
    await defaultDecor(painter, scene);
    for (const object of scene.objects) {
        check(signal);
        const bounds = objectRect(object, scene);
        if (!bounds)
            continue;
        painter.save();
        painter.translate(bounds.x, bounds.y);
        painter.rotate(object.rotation * Math.PI / 180);
        if (object.asset.startsWith('bubble')) {
            painter.fillStyle = '#fffdf5';
            painter.strokeStyle = '#282824';
            painter.lineWidth = 2;
            painter.beginPath();
            if (object.asset === 'bubble-burst') {
                for (let index = 0; index < 24; index++) {
                    const angle = index / 24 * Math.PI * 2;
                    const radius = index % 2 ? 0.42 : 0.53;
                    const pointX = Math.cos(angle) * bounds.width * radius, pointY = Math.sin(angle) * bounds.height * radius;
                    if (index === 0)
                        painter.moveTo(pointX, pointY);
                    else
                        painter.lineTo(pointX, pointY);
                }
                painter.closePath();
            }
            else {
                painter.ellipse(0, 0, bounds.width / 2, bounds.height / 2, 0, 0, Math.PI * 2);
            }
            painter.fill();
            painter.stroke();
            painter.fillStyle = '#282824';
            painter.textAlign = 'center';
            text(painter, object.text, 0, -bounds.height * 0.17, bounds.width * 0.72, 14 * object.scale, 7 * object.scale, 4);
        }
        else {
            const image = await loadImage(stickerUrl(object.asset));
            painter.drawImage(image, -bounds.width / 2, -bounds.height / 2, bounds.width, bounds.height);
        }
        painter.restore();
    }
    painter.fillStyle = '#282824';
    painter.textAlign = 'center';
    const footerY = scene.layout === 'strip' ? 1100 : 732;
    text(painter, scene.title, art.width / 2, footerY, art.width - 52, scene.layout === 'strip' ? 23 : 26, 12, scene.layout === 'strip' ? 2 : 1, true);
    text(painter, scene.caption, art.width / 2, footerY + (scene.layout === 'strip' ? 43 : 29), art.width - 54, 10, 7, 2);
    if (scene.showDate) {
        painter.textAlign = 'left';
        text(painter, scene.date, 24, art.height - 18, 170, 9, 8);
    }
    if (scene.credit) {
        painter.textAlign = 'right';
        text(painter, 'MADE WITH KOMASNAP', art.width - 24, art.height - 18, 160, 8, 7);
    }
    return result;
}
export async function renderFinal(scene: Scene, format: OutputFormat, scale: number, signal?: AbortSignal) {
    const size = outputSize(format, scale);
    if (format === 'strip')
        return renderArtwork(scene, size.width, signal);
    const result = canvas(size.width, size.height);
    const painter = context(result);
    const collection = collections.find(item => item.id === scene.collection)!;
    painter.fillStyle = collection.palette[scene.background];
    painter.fillRect(0, 0, size.width, size.height);
    painter.fillStyle = scene.background === 2 ? '#ffffff12' : '#20201e12';
    for (let row = 0; scene.collection !== 'normal' && row < size.height; row += 16 * scale)
        for (let column = 0; column < size.width; column += 16 * scale) {
            painter.beginPath();
            painter.arc(column, row, 0.8 * scale, 0, Math.PI * 2);
            painter.fill();
        }
    const art = geometry(scene);
    const paddingX = (format === 'story' ? 72 : 64) * scale, paddingY = (format === 'story' ? 180 : 64) * scale;
    const fit = Math.min((size.width - paddingX * 2) / art.width, (size.height - paddingY * 2) / art.height);
    const image = await renderArtwork(scene, art.width * fit, signal);
    check(signal);
    painter.shadowColor = '#00000025';
    painter.shadowBlur = 14 * scale;
    painter.shadowOffsetY = 8 * scale;
    painter.drawImage(image, (size.width - image.width) / 2, (size.height - image.height) / 2);
    image.width = 1;
    image.height = 1;
    return result;
}
export function toBlob(canvas: HTMLCanvasElement) { return new Promise<Blob>((resolve, reject) => { try {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not prepare the image. Try standard size.')), 'image/png');
}
catch {
    reject(new Error('Could not export this image. Try standard size.'));
} }); }
