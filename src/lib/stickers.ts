import type { CollectionId } from './model';
const star = '<path d="m60 5 11 28 29-13-12 30 29 10-29 10 12 30-29-13-11 28-11-28-29 13 12-30L3 60l29-10-12-30 29 13Z"/>';
const heart = '<path d="M60 101 16 57C-8 25 32 3 60 35c28-32 68-10 44 22Z"/>';
const definitions: [
    string,
    string,
    CollectionId,
    string
][] = [
    ['keepsake', 'For keeps', 'normal', '<rect x="7" y="32" width="106" height="55" rx="5" fill="#fffefa"/><text x="60" y="65" font-size="18">FOR KEEPS</text>'],
    ['outlineheart', 'Heart outline', 'normal', '<path d="M60 98 20 58C-1 31 34 8 60 35c26-27 61-4 40 23Z" fill="none" stroke-width="4"/>'],
    ['littledate', 'A little moment', 'normal', '<path d="M15 28h90v65H15Z" fill="#fffefa"/><text x="60" y="53" font-size="14">A LITTLE</text><text x="60" y="77" font-size="18">MOMENT</text>'],
    ['register', 'Registration mark', 'riso', '<circle cx="60" cy="60" r="30" fill="none" stroke="#27696c" stroke-width="4"/><path d="M60 8v104M8 60h104" stroke="#bb496b" stroke-width="3"/>'],
    ['twoinks', 'Two ink stamp', 'riso', '<rect x="8" y="24" width="104" height="72" fill="#f6e8d5" stroke="#27696c" stroke-width="3"/><text x="60" y="54" font-size="17" fill="#bb496b" stroke="none">TWO INKS</text><text x="60" y="78" font-size="14" fill="#27696c" stroke="none">ONE OF ONE</text>'],
    ['risodots', 'Ink overlap', 'riso', '<circle cx="45" cy="58" r="34" fill="#de668a" stroke="none"/><circle cx="77" cy="65" r="30" fill="#287c80" opacity=".8" stroke="none"/>'],
    ['edition', 'Limited edition', 'riso', '<path d="m8 35 100-10 4 62-100 10Z" fill="#27696c" stroke="none"/><text x="60" y="54" font-size="15" fill="#f6e8d5" stroke="none">LIMITED</text><text x="60" y="77" font-size="19" fill="#f6e8d5" stroke="none">EDITION</text>'],
    ['inkflower', 'Ink flower', 'riso', '<g fill="#cc537c" stroke="none"><ellipse cx="60" cy="60" rx="15" ry="48"/><ellipse cx="60" cy="60" rx="15" ry="48" transform="rotate(60 60 60)"/><ellipse cx="60" cy="60" rx="15" ry="48" transform="rotate(120 60 60)"/></g><circle cx="60" cy="60" r="13" fill="#f6e8d5" stroke="#27696c"/>'],
    ['printcheck', 'Print check', 'riso', '<rect x="12" y="38" width="28" height="44" fill="#de668a" stroke="none"/><rect x="46" y="38" width="28" height="44" fill="#287c80" stroke="none"/><rect x="80" y="38" width="28" height="44" fill="#43383e" stroke="none"/>'],
    ['recording', 'REC indicator', 'vhs', '<rect x="4" y="37" width="112" height="46" rx="3" fill="#293141" stroke="none"/><circle cx="23" cy="60" r="7" fill="#eb705d" stroke="none"/><text x="74" y="69" font-size="28" fill="#fff2dc" stroke="none">REC</text>'],
    ['tapecassette', 'Video cassette', 'vhs', '<rect x="7" y="27" width="106" height="68" rx="5" fill="#293141"/><rect x="19" y="37" width="82" height="31" rx="3" fill="#e5e7ed"/><circle cx="37" cy="52" r="10" fill="#596785"/><circle cx="83" cy="52" r="10" fill="#596785"/><text x="60" y="86" font-size="12" fill="#fff2dc" stroke="none">SIDE A</text>'],
    ['playtape', 'Play tape', 'vhs', '<rect x="6" y="34" width="108" height="52" fill="#e5e7ed"/><path d="m20 47 0 26 20-13Z" fill="#596785" stroke="none"/><text x="77" y="67" font-size="21">PLAY</text>'],
    ['afterhours', 'After hours', 'vhs', '<path d="M6 29h108v63H6Z" fill="#293141" stroke="none"/><text x="60" y="53" font-size="17" fill="#e5e7ed" stroke="none">AFTER</text><text x="60" y="79" font-size="23" fill="#df9c80" stroke="none">HOURS</text>'],
    ['rewind', 'Rewind', 'vhs', '<path d="M56 28 14 60l42 32Zm50 0L64 60l42 32Z" fill="#596785" stroke="#e5e7ed" stroke-width="3"/>'],
    ['analoglabel', 'Analog label', 'vhs', '<rect x="8" y="34" width="104" height="52" fill="#fff2dc"/><text x="60" y="58" font-size="18">ANALOG</text><text x="60" y="77" font-size="12">MEMORIES</text>'],
    ['flashbolt', 'Flash bolt', 'flash', '<path d="M63 9 21 67h31l-7 44 55-67H68l10-35Z" fill="#e4b15c" stroke="#8e6236" stroke-width="3"/>'],
    ['contactframe', 'Contact frame', 'flash', '<rect x="7" y="14" width="106" height="92" fill="#fff2df" stroke-width="4"/><rect x="17" y="24" width="86" height="55" fill="#d7b692" stroke="none"/><text x="60" y="97" font-size="12">ONE MORE SHOT</text>'],
    ['nightout', 'Night out', 'flash', '<path d="m8 31 100-7-3 65-97 6Z" fill="#43382f" stroke="none"/><text x="60" y="54" font-size="20" fill="#fff2df" stroke="none">NIGHT</text><text x="60" y="79" font-size="25" fill="#dfb995" stroke="none">OUT</text>'],
    ['goldstar', 'Golden star', 'flash', `<g fill="#d7a15c" stroke="#926232">${star}</g>`],
    ['filmholes', 'Film edge', 'flash', '<rect x="24" y="7" width="72" height="106" fill="#43382f" stroke="none"/><path d="M32 16h10v14H32zm0 24h10v14H32zm0 24h10v14H32zm0 24h10v14H32zm46-72h10v14H78zm0 24h10v14H78zm0 24h10v14H78zm0 24h10v14H78Z" fill="#fff2df" stroke="none"/>'],
    ['goodcompany', 'Good company', 'flash', '<ellipse cx="60" cy="60" rx="53" ry="35" fill="#fff2df" stroke="#a37342" stroke-width="3"/><text x="60" y="55" font-size="17">GOOD</text><text x="60" y="77" font-size="16">COMPANY</text>'],
    ['burst', 'Impact burst', 'impact', star],
    ['speed', 'Speed corner', 'impact', '<path d="M5 5 95 24 5 16Zm0 22 78 13L5 42Zm0 29 65 0L5 72Zm0 36 84-17L5 110Z"/>'],
    ['bang', 'Exclamation', 'impact', '<path d="m48 8 28 0-8 68H56Zm6 79h19v22H54Z"/>'],
    ['ticks', 'Motion ticks', 'impact', '<path fill="none" stroke-width="8" d="m20 48-8-25m39 14-1-27m29 31L91 15m5 46 19-9"/>'],
    ['episode', 'Episode stamp', 'impact', '<rect x="4" y="27" width="112" height="65" fill="none" stroke-width="5"/><text x="60" y="56" font-size="18">EPISODE</text><text x="60" y="82" font-size="27">001</text>'],
    ['wow', 'WOW!', 'impact', '<path d="m5 35 20 3L21 17l28 12 14-22 11 23 33-14-7 23 16 16-17 15 13 23-28-4-19 24-15-21-32 8 6-26L3 63Z" fill="#fff9ec"/><text x="60" y="72" font-size="32">WOW!</text>'],
    ['petals', 'Petal cluster', 'shoujo', '<ellipse cx="44" cy="40" rx="17" ry="30" transform="rotate(-35 44 40)"/><ellipse cx="80" cy="70" rx="12" ry="25" transform="rotate(35 80 70)"/><ellipse cx="32" cy="96" rx="9" ry="17"/>'],
    ['sparkle', 'Sparkle', 'shoujo', '<path d="m60 4 12 42 43 14-43 13-12 43-13-43L4 60l43-14Z"/>'],
    ['heart', 'Little heart', 'shoujo', heart],
    ['ribbon', 'Ribbon', 'shoujo', '<path d="M54 47Q4 1 12 65q17 11 42-7l-23 49 26-13 9 18 5-54q24 28 42 9 9-57-43-20Z" fill="none" stroke-width="5"/>'],
    ['seal', 'Diary seal', 'shoujo', '<circle cx="60" cy="60" r="48" fill="none" stroke-width="3"/><circle cx="60" cy="60" r="40" fill="none" stroke-dasharray="2 5"/><text x="60" y="55" font-size="17">DEAR</text><text x="60" y="78" font-size="21">DIARY</text>'],
    ['flower', 'Flower corner', 'shoujo', '<path d="M60 44C20-5 1 40 38 60-8 96 41 122 60 77c25 52 65 6 21-17 53-22 2-61-21-16Z" fill="none" stroke-width="4"/><circle cx="60" cy="60" r="10"/>'],
    ['tape', 'Tape', 'copy', '<path d="m6 36 9-10 5 7 8-8 7 8 9-7 9 6 9-6 7 8 8-7 9 7 8-8 8 8 10-6-4 65-9-7-9 7-8-5-8 7-9-5-8 6-8-6-7 5-8-6-8 6-7-7-7 6Z" fill="#d3bd91" stroke="none"/><path d="M17 46h88M16 65h85M15 81h89" fill="none" opacity=".2"/>'],
    ['torn', 'Torn label', 'copy', '<path d="m5 25 14 3 11-8 9 8 14-6 12 7 16-5 9 5 22-4-8 18 9 14-5 13 6 25-19-3-11 6-13-7-14 7-13-6-16 4-16-4-8 3 6-18-7-11 7-17Z" fill="#fff9ec"/><text x="60" y="66" font-size="16">NO RULES</text>'],
    ['staples', 'Staple pair', 'copy', '<path d="M21 38h68v8H21zM31 70h68v8H31z" fill="#86827c"/><path d="M24 39h61m-52 33h61" stroke="#eee"/>'],
    ['barcode', 'Barcode', 'copy', '<path d="M10 25h3v60h-3zm7 0h6v60h-6zm10 0h2v60h-2zm6 0h5v60h-5zm9 0h3v60h-3zm7 0h7v60h-7zm11 0h2v60h-2zm6 0h4v60h-4zm8 0h6v60h-6zm10 0h2v60h-2zm6 0h5v60h-5zm9 0h8v60h-8z"/><text x="60" y="104" font-size="13">NOT FOR SALE</text>'],
    ['stamp', 'Copy stamp', 'copy', '<rect x="5" y="30" width="110" height="58" fill="none" stroke-width="5"/><text x="60" y="55" font-size="19">COPY CLUB</text><text x="60" y="77" font-size="14">MEMBERS ONLY</text>'],
    ['cutstar', 'Star cutout', 'copy', '<path d="m60 9 14 31 35 4-27 24 8 35-30-18-30 18 8-35L11 44l35-4Z"/>'],
    ['pixelstar', 'Pixel star', 'pocket', '<path d="M50 10h20v30h30v20H90v20h10v20H70V90H50v10H20V80h10V60H20V40h30Z"/>'],
    ['pixelheart', 'Pixel heart', 'pocket', '<path d="M10 30h10V20h25v10h10v10h10V30h10V20h25v10h10v40h-10v10H90v10H80v10H70v10H50v-10H40V90H30V80H20V70H10Z"/>'],
    ['cursor', 'Cursor', 'pocket', '<path d="M30 10v90h15V80h15l15 30 15-10-15-30h25Z"/>'],
    ['score', 'Score label', 'pocket', '<rect x="5" y="28" width="110" height="64" fill="none" stroke-width="4"/><text x="60" y="53" font-size="15">HIGH SCORE</text><text x="60" y="81" font-size="26">0098</text>'],
    ['battery', 'Battery', 'pocket', '<path d="M10 35h90v50H10Zm90 15h10v20h-10" fill="none" stroke-width="5"/><path d="M20 45h15v30H20Zm23 0h15v30H43Zm23 0h15v30H66Z"/>'],
    ['player', 'Player badge', 'pocket', '<path d="M10 30h100v60H10Z" fill="none" stroke-width="4"/><text x="60" y="55" font-size="18">PLAYER</text><text x="60" y="80" font-size="25">01</text>'],
];
export const stickers = definitions.map(([id, name, collection, content]) => ({ id, name, collection, content }));
export function stickerSvg(id: string, color = '#292824') {
    const content = stickers.find(sticker => sticker.id === id)?.content ?? '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120"><g fill="${color}" stroke="${color}" stroke-width="2" stroke-linejoin="round" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold">${content}</g></svg>`;
}
export function stickerUrl(id: string, color?: string) { return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(stickerSvg(id, color))}`; }
