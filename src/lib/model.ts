export type CollectionId = 'normal' | 'impact' | 'shoujo' | 'copy' | 'pocket' | 'riso' | 'vhs' | 'flash';
export type LayoutId = 'strip' | 'manga' | 'cover';
export type OutputFormat = 'story' | 'square' | 'strip';
export type Step = 'intro' | 'booth' | 'studio' | 'result';
export type Crop = {
    x: number;
    y: number;
    zoom: number;
};
export type Photo = {
    landmarks?: { x: number; y: number }[];
    id: string;
    url: string;
    width: number;
    height: number;
    mirror: boolean;
    exposure: number;
    crops: Partial<Record<LayoutId, Crop>>;
};
export type SceneObject = {
    id: string;
    asset: string;
    text: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    anchor: number | 'artwork';
};
export type Scene = {
    faceEffect?: 'none' | 'blush' | 'manga' | 'freckles' | 'starry' | 'neko' | 'drama';
    faceIntensity?: number;
    collection: CollectionId;
    layout: LayoutId;
    intensity: number;
    title: string;
    caption: string;
    date: string;
    showDate: boolean;
    credit: boolean;
    seed: number;
    cover: number;
    objects: SceneObject[];
    background: number;
    photos: (Photo | null)[];
};
export type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
    slot: number;
};
export const collections: {
    id: CollectionId;
    name: string;
    eyebrow: string;
    description: string;
    color: string;
    palette: string[];
    prompts: string[];
    mark: string;
    icon: string;
}[] = [
    { id: 'normal', name: 'Normal', eyebrow: 'JUST YOU', description: 'Original color. Nothing to hide behind.', color: '#8c897f', palette: ['#f4f1e9', '#e4e2dc', '#383834'], prompts: ['Just be you', 'A little smile', 'Switch it up', 'One for keeps'], mark: 'YOU', icon: 'camera' },
    { id: 'impact', name: 'Koma Impact', eyebrow: 'THE ORIGINAL', description: 'Ink. Impact. Main character energy.', color: '#b83b25', palette: ['#ebe4d6', '#c3503b', '#272725'], prompts: ['Meet the hero', "Something’s off", 'Plot twist', 'Final move'], mark: '!!', icon: 'sparkle' },
    { id: 'shoujo', name: 'Soft Shoujo', eyebrow: 'A SOFTER SIDE', description: 'For your soft-focus daydreams.', color: '#857095', palette: ['#e8dfed', '#f2e5dd', '#676075'], prompts: ['A little smile', 'Look away', 'Secret crush', 'Happy ending'], mark: '✧', icon: 'sparkle' },
    { id: 'copy', name: 'Copy Club', eyebrow: 'OFF THE RECORD', description: 'Rough edges. Zero apologies.', color: '#66694e', palette: ['#d6d3bf', '#dfbd64', '#343432'], prompts: ['Straight face', 'Side eye', 'Make some noise', 'No rules'], mark: 'COPY', icon: 'layers' },
    { id: 'pocket', name: 'Pocket ’98', eyebrow: 'PRESS START', description: 'Small pixels. Big nostalgia.', color: '#627744', palette: ['#cbd5a0', '#e5e6ca', '#34482e'], prompts: ['Player ready', 'New challenger', 'Power up', 'You win'], mark: '+98', icon: 'grid' },
    { id: 'riso', name: 'Risograph', eyebrow: 'TWO INKS. ALL YOU.', description: 'Pink meets teal. A little off-register.', color: '#bb496b', palette: ['#f1dfcc', '#e99aae', '#27696c'], prompts: ['First impression', 'Show your colors', 'Off the grid', 'Limited edition'], mark: '2 INK', icon: 'layers' },
    { id: 'vhs', name: 'Midnight VHS', eyebrow: 'AFTER HOURS', description: 'Color trails. Late-night tape energy.', color: '#5c6f91', palette: ['#d9dce3', '#bd9d8f', '#293141'], prompts: ['Press record', 'Caught on tape', 'After midnight', 'End of side A'], mark: 'REC', icon: 'play' },
    { id: 'flash', name: 'Flash Booth', eyebrow: 'ONE MORE SHOT', description: 'Warm highlights. A night worth keeping.', color: '#a37342', palette: ['#f4e6d0', '#dfb995', '#43382f'], prompts: ['Flash ready', 'Lean in', 'Laugh it off', 'Last one, promise'], mark: 'FLASH', icon: 'camera' },
];
export const layouts: {
    id: LayoutId;
    name: string;
    description: string;
}[] = [
    { id: 'strip', name: 'Four-Panel Strip', description: 'The classic. Four little moments.' },
    { id: 'manga', name: 'Manga Page', description: 'Your very own plot twist.' },
    { id: 'cover', name: 'Cover Shot', description: 'One face. Front-page energy.' },
];
export const defaultCrop: Crop = { x: 0, y: 0, zoom: 1 };
export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
export function localDate() { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export function initialScene(): Scene { return { collection: 'impact', layout: 'strip', intensity: 82, title: 'A LITTLE MAIN CHARACTER ENERGY', caption: 'ONE DAY. FOUR LITTLE MOMENTS.', date: '', showDate: false, credit: true, seed: 0, cover: 0, objects: [], background: 0, photos: [null, null, null, null] }; }
export function geometry(scene: Pick<Scene, 'layout' | 'cover'>): {
    width: number;
    height: number;
    panels: Rect[];
} {
    if (scene.layout === 'strip')
        return { width: 400, height: 1200, panels: [0, 1, 2, 3].map(slot => ({ x: 24, y: 52 + slot * 258, width: 352, height: 246, slot })) };
    if (scene.layout === 'cover')
        return { width: 600, height: 800, panels: [{ x: 28, y: 100, width: 544, height: 568, slot: scene.cover }] };
    return { width: 600, height: 800, panels: [{ x: 28, y: 64, width: 544, height: 224, slot: 0 }, { x: 28, y: 300, width: 266, height: 170, slot: 1 }, { x: 306, y: 300, width: 266, height: 170, slot: 2 }, { x: 28, y: 482, width: 544, height: 220, slot: 3 }] };
}
export function objectRect(object: SceneObject, scene: Scene) {
    const art = geometry(scene);
    const anchor = object.anchor === 'artwork' ? { x: 0, y: 0, width: art.width, height: art.height } : art.panels.find(panel => panel.slot === object.anchor);
    if (!anchor)
        return null;
    return { x: anchor.x + object.x * anchor.width, y: anchor.y + object.y * anchor.height, width: 110 * object.scale, height: (object.asset.startsWith('bubble') ? 85 : 75) * object.scale };
}
export function outputSize(format: OutputFormat, scale = 1) { const base = format === 'story' ? [1080, 1920] : format === 'square' ? [1080, 1080] : [800, 2400]; return { width: base[0] * scale, height: base[1] * scale }; }
export function graphemes(value: string) { return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value), entry => entry.segment); }
export function textLimit(value: string, limit: number) { return graphemes(value).slice(0, limit).join(''); }
