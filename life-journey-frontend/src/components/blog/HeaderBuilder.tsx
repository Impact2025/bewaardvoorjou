"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, Image as ImageIcon, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeaderSettings {
  header_type: "color" | "image";
  header_color: string;
  header_text_color: string;
  header_image_url: string;
}

interface HeaderBuilderProps {
  title: string;
  values: HeaderSettings;
  onChange: (field: keyof HeaderSettings, value: string) => void;
  onImageUpload: (file: File) => Promise<string>;
}

const HEADER_COLORS: { label: string; bg: string; text: string }[] = [
  { label: "Warm Oranje", bg: "#FF8C42", text: "#FFFFFF" },
  { label: "Goud", bg: "#FFB84D", text: "#1A1A1A" },
  { label: "Amber", bg: "#FFC857", text: "#1A1A1A" },
  { label: "Crème", bg: "#FAF7F2", text: "#1A1A1A" },
  { label: "Perkament", bg: "#F5ECD7", text: "#1A1A1A" },
  { label: "Terra", bg: "#C0614A", text: "#FFFFFF" },
  { label: "Leisteen", bg: "#475569", text: "#FFFFFF" },
  { label: "Donker", bg: "#1A1A1A", text: "#FAF7F2" },
];

export function HeaderBuilder({ title, values, onChange, onImageUpload }: HeaderBuilderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const url = await onImageUpload(file);
      onChange("header_image_url", url);
      // Sync naar og_image wanneer header image wordt geüpload
    } catch {
      setUploadError("Uploaden mislukt. Probeer een kleinere afbeelding.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const selectedColor = HEADER_COLORS.find((c) => c.bg === values.header_color) ?? HEADER_COLORS[0];

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <p className="font-semibold text-slate-800 text-sm">Header</p>
      </div>

      {/* Preview */}
      <div
        className="relative mx-5 mt-4 rounded-lg overflow-hidden"
        style={{
          height: 120,
          backgroundColor:
            values.header_type === "color"
              ? values.header_color || "#FF8C42"
              : undefined,
          backgroundImage:
            values.header_type === "image" && values.header_image_url
              ? `url(${values.header_image_url})`
              : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {values.header_type === "image" && values.header_image_url && (
          <div className="absolute inset-0 bg-black/30" />
        )}
        <div className="absolute inset-0 flex items-center px-6">
          <p
            className="font-bold text-lg leading-tight line-clamp-2"
            style={{
              color:
                values.header_type === "color"
                  ? values.header_text_color || "#FFFFFF"
                  : "#FFFFFF",
            }}
          >
            {title || "Artikeltitel"}
          </p>
        </div>
      </div>

      {/* Type selector */}
      <div className="flex gap-2 px-5 mt-4">
        <TypeTab
          active={values.header_type === "color"}
          onClick={() => onChange("header_type", "color")}
          icon={<Palette className="h-3.5 w-3.5" />}
          label="Kleur"
        />
        <TypeTab
          active={values.header_type === "image"}
          onClick={() => onChange("header_type", "image")}
          icon={<ImageIcon className="h-3.5 w-3.5" />}
          label="Afbeelding"
        />
      </div>

      {/* Color picker */}
      {values.header_type === "color" && (
        <div className="px-5 py-4 space-y-3">
          <p className="text-xs text-slate-500 font-medium">Achtergrondkleur</p>
          <div className="grid grid-cols-4 gap-2">
            {HEADER_COLORS.map((color) => (
              <button
                key={color.bg}
                type="button"
                title={color.label}
                onClick={() => {
                  onChange("header_color", color.bg);
                  onChange("header_text_color", color.text);
                }}
                className={cn(
                  "h-10 rounded-lg border-2 transition-all",
                  values.header_color === color.bg
                    ? "border-slate-800 scale-105 shadow-md"
                    : "border-transparent hover:border-slate-300"
                )}
                style={{ backgroundColor: color.bg }}
              >
                {values.header_color === color.bg && (
                  <span
                    className="text-xs font-bold"
                    style={{ color: color.text }}
                  >
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400">{selectedColor.label}</p>
        </div>
      )}

      {/* Image upload */}
      {values.header_type === "image" && (
        <div className="px-5 py-4 space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed text-sm transition-colors",
              uploading
                ? "border-slate-200 text-slate-400 cursor-not-allowed"
                : "border-slate-300 text-slate-600 hover:border-orange-400 hover:text-orange-600"
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploaden…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {values.header_image_url ? "Andere afbeelding kiezen" : "Afbeelding uploaden"}
              </>
            )}
          </button>

          {uploadError && (
            <p className="text-xs text-red-600">{uploadError}</p>
          )}

          {values.header_image_url && (
            <button
              type="button"
              onClick={() => onChange("header_image_url", "")}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              Afbeelding verwijderen
            </button>
          )}

          <p className="text-xs text-slate-400">
            Max 5 MB · JPEG, PNG, WebP of GIF
          </p>
        </div>
      )}
    </div>
  );
}

function TypeTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors",
        active
          ? "bg-slate-900 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
