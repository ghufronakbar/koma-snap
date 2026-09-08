const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const greens = [[41, 59, 45], [96, 115, 68], [168, 184, 106], [224, 232, 186]];
export function filterRows(request, start, end) {
    const { data, width, height, collection, intensity, exposure, seed } = request;
    const amount = intensity / 100;
    const multiplier = Math.pow(2, exposure);
    if ((collection === 'vhs' || collection === 'riso') && amount > 0 && !request.source)
        request.source = new Uint8ClampedArray(data);
    const source = request.source;
    const shift = Math.max(1, Math.round(width * 2 / 352));
    for (let row = start; row < Math.min(end, height); row++) {
        for (let column = 0; column < width; column++) {
            const offset = (row * width + column) * 4;
            const red = clamp(data[offset] * multiplier, 0, 255);
            const green = clamp(data[offset + 1] * multiplier, 0, 255);
            const blue = clamp(data[offset + 2] * multiplier, 0, 255);
            if (collection === 'normal' || amount === 0) {
                data[offset] = red;
                data[offset + 1] = green;
                data[offset + 2] = blue;
                continue;
            }
            const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
            const logicalX = Math.floor(column * 352 / width);
            const logicalY = Math.floor(row * 352 / width);
            const random = Math.sin(logicalX * 127.1 + logicalY * 311.7 + seed * 19) * 43758.5453;
            const noise = (random - Math.floor(random) - 0.5);
            let output;
            if (collection === 'impact') {
                const threshold = 115 + noise * 15;
                const ink = luminance < threshold || (luminance < 168 && logicalX % 5 < 2 && logicalY % 5 < 2);
                output = ink ? [30, 29, 27] : [250, 245, 234];
            }
            else if (collection === 'copy') {
                const shade = clamp((luminance - 125) * 2.3 + 130 + noise * 100, 22, 238);
                output = [shade, shade * 0.98, shade * 0.91];
            }
            else if (collection === 'pocket') {
                const threshold = (bayer[(row % 4) * 4 + column % 4] / 16 - 0.5) * 55;
                output = greens[clamp(Math.round((luminance + threshold) * 3 / 255), 0, 3)];
            }
            else if (collection === 'riso') {
                const shifted = (row * width + Math.min(width - 1, column + shift)) * 4;
                const shiftedLuminance = clamp((source[shifted] * 0.2126 + source[shifted + 1] * 0.7152 + source[shifted + 2] * 0.0722) * multiplier, 0, 255);
                const dot = bayer[(logicalY % 4) * 4 + logicalX % 4] / 16 - 0.5;
                const teal = clamp((190 - shiftedLuminance) / 160 + dot * 0.12, 0, 1);
                const pink = clamp((245 - luminance) / 190 + noise * 0.08, 0, 1);
                output = [
                    250 * (1 - teal * 0.88) * (1 - pink * 0.07) + noise * 8,
                    239 * (1 - teal * 0.53) * (1 - pink * 0.77) + noise * 8,
                    220 * (1 - teal * 0.49) * (1 - pink * 0.54) + noise * 8,
                ];
            }
            else if (collection === 'vhs') {
                const leftOffset = (row * width + Math.max(0, column - shift)) * 4;
                const rightOffset = (row * width + Math.min(width - 1, column + shift)) * 4;
                const line = logicalY % 3 === 0 ? 0.86 : 1;
                const grain = noise * 16;
                output = [
                    (clamp(source[rightOffset] * multiplier, 0, 255) * 0.84 + luminance * 0.08 + 17 + grain) * line,
                    (green * 0.88 + luminance * 0.07 + 6 + grain) * line,
                    (clamp(source[leftOffset + 2] * multiplier, 0, 255) * 0.91 + luminance * 0.06 + 13 + grain) * line,
                ];
            }
            else if (collection === 'flash') {
                const distance = Math.pow((column / Math.max(1, width - 1) - 0.5) * 1.4, 2) + Math.pow((row / Math.max(1, height - 1) - 0.5) * 1.4, 2);
                const vignette = 1 - distance * 0.2;
                const lift = 18 * Math.max(0, 1 - distance);
                const grain = noise * 9;
                output = [
                    ((red - 112) * 1.13 + 122 + lift + grain) * vignette,
                    ((green - 112) * 1.08 + 116 + lift * 0.8 + grain) * vignette,
                    ((blue - 112) * 1.02 + 104 + lift * 0.5 + grain) * vignette,
                ];
            }
            else {
                const tone = clamp(luminance * 0.85 + 30, 0, 255);
                const dot = logicalX % 7 === 0 && logicalY % 7 === 0 ? 10 : 0;
                output = [tone * 1.02 - dot, tone * 0.94 - dot, tone * 1.06 - dot];
            }
            data[offset] = red * (1 - amount) + output[0] * amount;
            data[offset + 1] = green * (1 - amount) + output[1] * amount;
            data[offset + 2] = blue * (1 - amount) + output[2] * amount;
        }
    }
}

self.onmessage = (event) => {
  const request = event.data;
  try {
    filterRows(request, 0, request.height);
    self.postMessage({ id: request.id, data: request.data }, [request.data.buffer]);
  } catch (error) {
    self.postMessage({ id: request.id, error: error instanceof Error ? error.message : 'Image processing failed' });
  }
};
