import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const portraits = await Promise.all([1, 2, 3, 4].map(async index => `data:image/svg+xml;base64,${(await readFile(`public/demo/portrait-${index}.svg`)).toString('base64')}`));
const source = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#f5f1e8"/><g fill="#242420" font-family="Arial,sans-serif"><text x="65" y="70" font-size="28" font-weight="bold">▦ KomaSnap.</text><text x="65" y="228" font-size="72" font-weight="bold">Your face.</text><text x="65" y="311" font-size="72" font-weight="bold">Four panels.</text><text x="65" y="394" font-size="72" font-weight="bold" fill="#b83b25">Your story.</text><text x="68" y="477" font-size="20">A manga-inspired photobooth. Made for you.</text><text x="68" y="545" font-size="15">NO SIGN-UP. NO UPLOADS. JUST YOU.</text></g><g transform="translate(815 55) rotate(8 90 250)"><rect x="-9" y="-6" width="204" height="520" fill="#d9d1c3"/><rect width="188" height="505" fill="#fffaf0"/><text x="12" y="21" font-family="Arial" font-size="10" fill="#242420" font-weight="bold">KOMASNAP / ISSUE 001</text>${portraits.map((portrait, index) => `<image href="${portrait}" x="12" y="${30 + index * 111}" width="164" height="103" preserveAspectRatio="xMidYMid slice"/><rect x="12" y="${30 + index * 111}" width="164" height="103" stroke="#242420" fill="none"/>`).join('')}<text x="94" y="487" font-family="Arial" font-size="8" text-anchor="middle">FOUR FRAMES. ALL YOU.</text></g><path d="M67 413q221-14 433-3" fill="none" stroke="#b83b25" stroke-width="3"/></svg>`;
await writeFile('public/social-preview.svg', source);
await sharp(Buffer.from(source)).png().toFile('public/social-preview.png');

const icon = await sharp('public/icon.svg').resize(32, 32).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header[6] = 32;
header[7] = 32;
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(icon.length, 14);
header.writeUInt32LE(22, 18);
await writeFile('src/app/favicon.ico', Buffer.concat([header, icon]));
