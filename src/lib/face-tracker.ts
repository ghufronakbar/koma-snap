import type { Photo } from './model';

export class FaceTracker {
    private worker: Worker | null = null;
    private nextId = 0;
    private pending = new Map<number, { resolve: (points: NonNullable<Photo['landmarks']>) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> }>();
    async detect(source: ImageBitmapSource) {
        if (!this.worker) {
            this.worker = new Worker('/workers/face.js');
            this.worker.onmessage = ({ data }) => {
                const job = this.pending.get(data.id);
                if (!job) return;
                clearTimeout(job.timer); this.pending.delete(data.id);
                if (data.error) job.reject(new Error(data.error)); else job.resolve(data.points);
            };
            this.worker.onerror = () => this.close();
        }
        const worker = this.worker;
        const image = await createImageBitmap(source);
        if (worker !== this.worker) { image.close(); throw new Error('Tracking stopped.'); }
        return new Promise<NonNullable<Photo['landmarks']>>((resolve, reject) => {
            const id = ++this.nextId;
            const timer = setTimeout(() => this.close(), 30000);
            this.pending.set(id, { resolve, reject, timer });
            worker.postMessage({ id, image }, [image]);
        });
    }
    close() {
        this.worker?.terminate(); this.worker = null;
        this.pending.forEach(job => { clearTimeout(job.timer); job.reject(new Error('Face tracking stopped or could not load. Turn effects off and on to retry.')); });
        this.pending.clear();
    }
}
