importScripts('/vendor/mediapipe/vision_bundle.js');
let detector;
self.onmessage = async ({ data }) => {
    try {
        if (!detector) {
            const files = await Vision.FilesetResolver.forVisionTasks('/vendor/mediapipe/wasm');
            detector = await Vision.FaceLandmarker.createFromOptions(files, {
                baseOptions: { modelAssetPath: '/models/face_landmarker.task', delegate: 'CPU' },
                runningMode: 'IMAGE', numFaces: 1,
            });
        }
        const result = data.image ? detector.detect(data.image).faceLandmarks[0] ?? [] : [];
        self.postMessage({ id: data.id, points: result.map(point => ({ x: point.x, y: point.y })) });
    } catch {
        self.postMessage({ id: data.id, error: 'Face effects are unavailable on this device. Your camera still works.' });
    } finally {
        data.image?.close();
    }
};
