"use client";

import type { Area } from "react-easy-crop";

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (e) => reject(e));
    if (url.startsWith("http://") || url.startsWith("https://")) {
      image.setAttribute("crossOrigin", "anonymous");
    }
    image.src = url;
  });
}

/** Export visible crop from the current (already oriented) image. */
export async function getCroppedImageBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  const { x, y, width, height } = pixelCrop;
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not create image"));
      },
      "image/png",
      1
    );
  });
}

/** Rotate image 90° clockwise; returns a data URL (JPEG) for use as the next crop source. */
export async function rotateImage90Cw(imageSrc: string): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  const w = image.naturalWidth;
  const h = image.naturalHeight;
  canvas.width = h;
  canvas.height = w;
  ctx.translate(h / 2, w / 2);
  ctx.rotate((90 * Math.PI) / 180);
  ctx.drawImage(image, -w / 2, -h / 2);
  return canvas.toDataURL("image/jpeg", 0.92);
}
