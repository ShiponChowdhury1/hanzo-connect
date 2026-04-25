/**
 * Resize and crop an image file to a target aspect-ratio + max width using
 * an off-screen canvas. Returns a JPEG dataURL ready to be persisted in
 * localStorage / state.
 *
 * Used to keep community cover photos a consistent size and avoid blowing
 * the localStorage budget with multi-MB raw uploads.
 */
export async function resizeImage(
  file: File,
  opts: { maxWidth?: number; aspect?: number; quality?: number } = {}
): Promise<string> {
  const { maxWidth = 1200, aspect = 16 / 9, quality = 0.85 } = opts;

  const dataURL: string = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("decode failed"));
    i.src = dataURL;
  });

  // Center-crop the source to the target aspect ratio.
  const srcAspect = img.width / img.height;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (srcAspect > aspect) {
    sw = img.height * aspect;
    sx = (img.width - sw) / 2;
  } else if (srcAspect < aspect) {
    sh = img.width / aspect;
    sy = (img.height - sh) / 2;
  }

  const targetW = Math.min(maxWidth, sw);
  const targetH = targetW / aspect;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(targetW);
  canvas.height = Math.round(targetH);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unsupported");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}
