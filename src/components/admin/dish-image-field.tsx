"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  DEFAULT_DISH_PLACEHOLDER_IMAGE,
  DISH_IMAGE_ASPECT,
  isDefaultDishPlaceholderUrl,
  isMenuUploadedImageUrl
} from "@/lib/dish-image";
import { getCroppedImageBlob, rotateImage90Cw } from "@/lib/dish-image-crop-client";
import { AdminField } from "./admin-field";

const btnSecondary =
  "rounded-full border border-[#ccc] bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-800 hover:bg-neutral-50 disabled:opacity-50";
const btnPrimary =
  "rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white hover:bg-neutral-800 disabled:opacity-50";

type Props = {
  itemId: string;
  imageUrl: string;
  onChange: (url: string) => void;
};

export function DishImageField({ itemId, imageUrl, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cropPixelsRef = useRef<Area | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  /** Bust Next/Image cache after a new upload (URL path may stay the same). */
  const [previewNonce, setPreviewNonce] = useState(0);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    cropPixelsRef.current = pixels;
  }, []);

  useEffect(() => {
    return () => {
      if (sourceUrl?.startsWith("blob:")) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

  function openFilePicker() {
    setError("");
    fileRef.current?.click();
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) {
      setError("Bitte eine Bilddatei wählen (z. B. JPG oder PNG).");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError("Die Datei ist zu groß (max. 12 MB).");
      return;
    }
    if (sourceUrl?.startsWith("blob:")) URL.revokeObjectURL(sourceUrl);
    const url = URL.createObjectURL(file);
    setSourceUrl(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    cropPixelsRef.current = null;
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    if (sourceUrl?.startsWith("blob:")) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(null);
    setError("");
  }

  async function handleRotate90() {
    if (!sourceUrl) return;
    setError("");
    try {
      const dataUrl = await rotateImage90Cw(sourceUrl);
      if (sourceUrl.startsWith("blob:")) URL.revokeObjectURL(sourceUrl);
      setSourceUrl(dataUrl);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      cropPixelsRef.current = null;
    } catch {
      setError("Drehen ist fehlgeschlagen. Bitte anderes Bild versuchen.");
    }
  }

  async function applyCrop() {
    if (!sourceUrl) return;
    const pixels = cropPixelsRef.current;
    if (!pixels?.width || !pixels?.height) {
      setError("Bitte kurz warten, bis das Bild geladen ist, und den Ausschnitt anpassen.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const blob = await getCroppedImageBlob(sourceUrl, pixels);
      const form = new FormData();
      form.set("itemId", itemId);
      form.set("image", blob, "dish-crop.png");
      const res = await fetch("/api/admin/menu-item-image", { method: "POST", body: form });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Upload fehlgeschlagen.");
        return;
      }
      if (typeof data.url !== "string") {
        setError("Unerwartete Antwort vom Server.");
        return;
      }
      if (sourceUrl.startsWith("blob:")) URL.revokeObjectURL(sourceUrl);
      setSourceUrl(null);
      setEditorOpen(false);
      onChange(data.url);
      setPreviewNonce((n) => n + 1);
    } catch {
      setError("Upload fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setBusy(false);
    }
  }

  async function removeUploaded() {
    if (!isMenuUploadedImageUrl(imageUrl.split("?")[0] || imageUrl)) return;
    if (!window.confirm("Eigenes Bild entfernen und wieder den Platzhalter nutzen?")) return;
    setError("");
    const base = imageUrl.split("?")[0] || imageUrl;
    try {
      const res = await fetch(`/api/admin/menu-item-image?url=${encodeURIComponent(base)}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(typeof data.error === "string" ? data.error : "Löschen fehlgeschlagen.");
        return;
      }
      onChange(DEFAULT_DISH_PLACEHOLDER_IMAGE);
    } catch {
      setError("Löschen fehlgeschlagen.");
    }
  }

  const hasCustomUpload = isMenuUploadedImageUrl(imageUrl.split("?")[0] || imageUrl);
  const previewSrc = imageUrl.split("?")[0] || imageUrl;
  const canEditCurrentImage = !isDefaultDishPlaceholderUrl(previewSrc);

  /** Re-open cropper with the image currently shown (upload or external URL). */
  function openEditorWithCurrentImage() {
    setError("");
    if (isDefaultDishPlaceholderUrl(previewSrc)) {
      setError("Zuerst ein Bild über „Bild hochladen“ wählen.");
      return;
    }
    if (sourceUrl?.startsWith("blob:")) URL.revokeObjectURL(sourceUrl);
    const base = previewSrc.split("?")[0] || previewSrc;
    const bust = `${base.includes("?") ? "&" : "?"}v=${Date.now()}`;
    setSourceUrl(`${base}${bust}`);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    cropPixelsRef.current = null;
    setEditorOpen(true);
  }

  return (
    <AdminField label="Gerichtsbild" className="lg:col-span-2">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileSelected} />

      <div className="flex flex-col gap-4 rounded-xl border border-[#e5e5e5] bg-neutral-50/50 p-4">
        <p className="text-xs leading-relaxed text-neutral-600">
          Festes Format <strong className="font-medium text-neutral-800">4:3</strong> wie auf der Website. Bild wählen, mit dem
          Schieberegler zoomen und den Ausschnitt durch Ziehen positionieren. Optional 90° drehen.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="relative aspect-[4/3] w-full max-w-[280px] overflow-hidden rounded-lg border border-[#ddd] bg-neutral-200 shadow-sm">
            <Image
              key={`${previewSrc}-${previewNonce}`}
              src={previewSrc}
              alt="Vorschau Gerichtsbild"
              fill
              className="object-cover"
              sizes="280px"
              unoptimized={
                previewSrc.startsWith("blob:") ||
                previewSrc.startsWith("data:") ||
                isMenuUploadedImageUrl(previewSrc.split("?")[0] || previewSrc)
              }
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={openFilePicker} className={btnSecondary}>
                {hasCustomUpload ? "Neues Bild wählen …" : "Bild hochladen …"}
              </button>
              {canEditCurrentImage ? (
                <button type="button" onClick={openEditorWithCurrentImage} className={btnSecondary}>
                  Ausschnitt bearbeiten
                </button>
              ) : null}
              {hasCustomUpload ? (
                <button type="button" onClick={removeUploaded} className={btnSecondary}>
                  Bild löschen
                </button>
              ) : null}
            </div>
            <p className="text-[11px] text-neutral-500">
              Nach dem Speichern des Menüs bleibt das Bild dauerhaft erhalten. JPG/PNG/WebP werden automatisch als optimiertes WebP
              gespeichert.
            </p>
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
          </div>
        </div>
      </div>

      {editorOpen && sourceUrl ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dish-crop-title"
        >
          <div className="flex max-h-[min(92vh,860px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="border-b border-[#eee] px-4 py-3">
              <h3 id="dish-crop-title" className="font-serif text-lg text-neutral-900">
                Ausschnitt wählen
              </h3>
              <p className="mt-0.5 text-xs text-neutral-500">Ziehen zum Verschieben · Mausrad oder Slider zum Zoomen</p>
            </div>

            <div className="relative h-[min(52vh,360px)] w-full bg-neutral-900 sm:h-[400px]">
              <Cropper
                image={sourceUrl}
                crop={crop}
                zoom={zoom}
                aspect={DISH_IMAGE_ASPECT}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid
                minZoom={1}
                maxZoom={4}
              />
            </div>

            <div className="space-y-3 border-t border-[#eee] px-4 py-4">
              <div className="flex items-center gap-3">
                <span className="w-14 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={0.02}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="accent-gold h-2 w-full cursor-pointer"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handleRotate90} disabled={busy} className={btnSecondary}>
                  90° drehen
                </button>
              </div>
              {error ? <p className="text-xs text-red-600">{error}</p> : null}
              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button type="button" onClick={closeEditor} disabled={busy} className={btnSecondary}>
                  Abbrechen
                </button>
                <button type="button" onClick={() => void applyCrop()} disabled={busy} className={btnPrimary}>
                  {busy ? "Wird gespeichert…" : "Bild übernehmen"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminField>
  );
}
