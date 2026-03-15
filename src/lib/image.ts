export async function fileToCompressedDataUrl(
    file: File,
    opts?: { maxSide?: number; mime?: "image/webp" | "image/jpeg"; quality?: number }
) {
    const maxSide = opts?.maxSide ?? 800;
    const mimePreferred = opts?.mime ?? "image/webp";
    const quality = opts?.quality ?? 0.65;

    if (!file.type.startsWith("image/")) {
        return await fileToDataUrl(file);
    }

    try {
        const bmp = await createImageBitmap(file);

        const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
        const w = Math.max(1, Math.round(bmp.width * scale));
        const h = Math.max(1, Math.round(bmp.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            bmp.close?.();
            return await fileToDataUrl(file);
        }

        ctx.drawImage(bmp, 0, 0, w, h);
        bmp.close?.();

        const blob =
            (await canvasToBlob(canvas, mimePreferred, quality)) ??
            (await canvasToBlob(canvas, "image/jpeg", Math.min(0.85, quality + 0.05)));

        if (!blob) return await fileToDataUrl(file);
        return await blobToDataUrl(blob);
    } catch {
        return await fileToDataUrl(file);
    }
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number) {
    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
}

function blobToDataUrl(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(r.error);
        r.readAsDataURL(blob);
    });
}

function fileToDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(r.error);
        r.readAsDataURL(file);
    });
}
