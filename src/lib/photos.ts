import { loadImage, toBlob } from './render';
import type { Photo } from './model';
export async function importPhoto(file: File): Promise<Photo> {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
        throw new Error(`${file.name}: please use a JPG, PNG, or WebP image.`);
    if (file.size > 20 * 1024 * 1024)
        throw new Error(`${file.name}: choose an image smaller than 20 MB.`);
    const temporary = URL.createObjectURL(file);
    try {
        const image = await loadImage(temporary);
        if (image.naturalWidth * image.naturalHeight > 32000000)
            throw new Error(`${file.name}: choose an image under 32 megapixels.`);
        const ratio = Math.min(1, 2400 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.naturalWidth * ratio);
        canvas.height = Math.round(image.naturalHeight * ratio);
        const painter = canvas.getContext('2d');
        if (!painter)
            throw new Error('Your browser could not open this photo.');
        painter.fillStyle = '#fffaf0';
        painter.fillRect(0, 0, canvas.width, canvas.height);
        painter.drawImage(image, 0, 0, canvas.width, canvas.height);
        const blob = await toBlob(canvas);
        return { id: crypto.randomUUID(), url: URL.createObjectURL(blob), width: canvas.width, height: canvas.height, mirror: false, exposure: 0, crops: {} };
    }
    catch (error) {
        if (error instanceof Error && error.message.includes(':'))
            throw error;
        throw new Error(`${file.name}: this image couldn't be opened. Try another JPG or PNG.`);
    }
    finally {
        URL.revokeObjectURL(temporary);
    }
}
export function demoPhotos(): Photo[] { return [1, 2, 3, 4].map(index => ({ id: `demo-${index}`, url: `/demo/portrait-${index}.svg`, width: 440, height: 330, mirror: false, exposure: 0, crops: {} })); }
export function releasePhoto(photo: Photo | null) { if (photo?.url.startsWith('blob:'))
    URL.revokeObjectURL(photo.url); }
