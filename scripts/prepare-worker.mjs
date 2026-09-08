import { readFile, mkdir, writeFile, cp } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile('src/lib/filter.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ES2020 } }).outputText;
const handler = `
self.onmessage = (event) => {
  const request = event.data;
  try {
    filterRows(request, 0, request.height);
    self.postMessage({ id: request.id, data: request.data }, [request.data.buffer]);
  } catch (error) {
    self.postMessage({ id: request.id, error: error instanceof Error ? error.message : 'Image processing failed' });
  }
};
`;
await mkdir('public/workers', { recursive: true });
await writeFile('public/workers/filter.js', compiled + handler);
await mkdir('public/vendor/mediapipe', { recursive: true });
await cp('node_modules/@mediapipe/tasks-vision/vision_bundle.js', 'public/vendor/mediapipe/vision_bundle.js');
await cp('node_modules/@mediapipe/tasks-vision/wasm', 'public/vendor/mediapipe/wasm', { recursive: true });
