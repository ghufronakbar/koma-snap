import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('public/demo', { recursive: true });
await mkdir('public/fonts', { recursive: true });
await mkdir('docs/plan/visual-proofs', { recursive: true });
const expressions = [
  '<path d="M174 154q13-9 25 0m39 0q13-9 25 0"/><path d="M199 204q20 15 39-1"/><ellipse cx="188" cy="163" rx="4" ry="7" fill="#292824"/><ellipse cx="251" cy="163" rx="4" ry="7" fill="#292824"/>',
  '<path d="M169 150l30 6m39-7 27-4"/><ellipse cx="189" cy="166" rx="4" ry="7" fill="#292824"/><ellipse cx="251" cy="161" rx="4" ry="7" fill="#292824"/><path d="M205 207q18-7 30-1"/>',
  '<path d="M173 143q13-13 26-2m39 0q12-12 25 2"/><ellipse cx="190" cy="163" rx="9" ry="12"/><ellipse cx="251" cy="163" rx="9" ry="12"/><ellipse cx="220" cy="208" rx="12" ry="17" fill="#292824"/>',
  '<path d="M174 159q12-14 25 0m39 0q13-14 25 0"/><path d="M198 196q23 8 45 0q-6 35-23 32q-17-2-22-32" fill="#fff8eb"/>',
];
for (let index = 0; index < 4; index++) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="330" viewBox="0 0 440 330"><defs><pattern id="dots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".8" fill="#292824" opacity=".2"/></pattern></defs><path fill="#d6c8ad" d="M0 0h440v330H0z"/><path fill="url(#dots)" d="M0 0h440v330H0z"/><circle cx="220" cy="170" r="145" fill="#eee4d1"/><g stroke="#292824" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="M126 316q-32-133 11-218q8-54 83-57q89-4 104 75l-5 200" fill="#292824"/><path d="M72 330q20-69 109-78h78q89 9 111 78" fill="${index === 3 ? '#aa4233' : '#65746d'}"/><path d="M179 250l41 47 42-47M160 259l-16 42 41-3-12 32m107-70 16 41-38-3 12 32" fill="none"/><path d="M193 225v35q26 27 54 0v-41" fill="#d6ac8c"/><path d="M150 115q-13 112 43 129q34 19 64-5q44-30 35-121" fill="#ebc6a7"/><path d="M143 133q33-4 49-54q-1 46 62 55l-15-28q22 27 56 35l-1-42q-25-55-82-37q-44-3-69 71" fill="#292824"/><path d="M220 167l-5 18 8 3" fill="none"/><g fill="none">${expressions[index]}</g><path d="M157 189l19 2m85 0 18-2" stroke="#b77465" stroke-width="5" opacity=".55"/><path d="M117 95l-10 83m-7-38-4 48" stroke="#eee4d1" stroke-width="2"/>${index === 3 ? '<path d="M303 312l-18-73q-3-13 5-15q8-2 12 12l6 16-7-58q-2-13 6-14q8 0 11 14l10 48 7-47q2-12 10-9q7 2 5 15l-5 68q20-15 25-5q3 10-12 25l-16 23" fill="#ebc6a7"/>' : ''}</g><path d="M12 12h20m-20 0v20m396-20h20v20M12 298v20h20m376 0h20v-20" stroke="#292824" fill="none" opacity=".35"/></svg>`;
  await writeFile(`public/demo/portrait-${index + 1}.svg`, svg);
}
const fonts = [
  ['barlow.ttf', 'barlowcondensed/BarlowCondensed-Bold.ttf'],
  ['barlow-OFL.txt', 'barlowcondensed/OFL.txt'],
  ['geist.ttf', 'geist/Geist%5Bwght%5D.ttf'],
  ['geist-OFL.txt', 'geist/OFL.txt'],
  ['geist-mono.ttf', 'geistmono/GeistMono%5Bwght%5D.ttf'],
  ['geist-mono-OFL.txt', 'geistmono/OFL.txt'],
];
for (const [name, path] of fonts) {
  const response = await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${path}`);
  if (!response.ok) throw new Error(`Font download failed: ${name} ${response.status}`);
  await writeFile(`public/fonts/${name}`, Buffer.from(await response.arrayBuffer()));
}
const views = [ ['intro-desktop', 1280, 720], ['booth-mobile', 390, 844], ['studio-desktop', 1280, 720], ['studio-mobile', 390, 844], ['result-mobile', 390, 844] ];
for (const [name, width, height] of views) {
  const mobile = width < 500;
  const panelWidth = mobile ? 130 : 180;
  const panelX = mobile ? 130 : 760;
  await writeFile(`docs/plan/visual-proofs/${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#f5f1e8"/><text x="24" y="42" font-family="Arial" font-size="24" font-weight="bold">▦ KomaSnap</text><path d="M24 64H${width-24}" stroke="#d6d0c3"/><text x="24" y="112" fill="#b83b25" font-family="monospace" font-size="12">${name.toUpperCase()}</text><text x="24" y="${mobile ? 156 : 245}" font-family="Arial" font-size="${mobile ? 32 : 76}" font-weight="bold">${name.startsWith('intro') ? 'Your face.' : name.startsWith('booth') ? 'Meet the camera.' : name.startsWith('studio') ? 'Make it yours.' : 'A keeper.'}</text><rect x="${panelX}" y="${mobile ? 200 : 145}" width="${panelWidth}" height="${panelWidth * 3}" fill="#fffdf7" stroke="#20201e"/>${[0,1,2,3].map(index=>`<rect x="${panelX+10}" y="${(mobile ? 215 : 160)+index*(panelWidth*.61)}" width="${panelWidth-20}" height="${panelWidth*.54}" fill="#d6d0c3"/><text x="${panelX+20}" y="${(mobile ? 235 : 180)+index*panelWidth*.61}" font-family="monospace" font-size="12">0${index+1}</text>`).join('')}<rect x="24" y="${height-92}" width="${mobile ? width-48 : 240}" height="48" rx="6" fill="#b83b25"/><text x="45" y="${height-62}" font-family="Arial" fill="#fffdf7" font-size="16">${name.startsWith('result') ? 'Download PNG' : name.startsWith('studio') ? 'Finish strip →' : 'Start booth →'}</text></svg>`);
}
