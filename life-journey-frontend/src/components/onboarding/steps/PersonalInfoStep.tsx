"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Camera, X, Upload } from "lucide-react";
import type { PersonalInfoData } from "@/lib/onboarding-types";

interface PersonalInfoStepProps {
  data: PersonalInfoData;
  onChange: (data: PersonalInfoData) => void;
}

export function PersonalInfoStep({ data, onChange }: PersonalInfoStepProps) {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Selecteer een geldige foto bestand');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Foto mag niet groter zijn dan 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64 for now (in production, upload to server)
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onChange({ ...data, family_photo: base64 });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      setIsUploading(false);
    }
  };

  const removePhoto = () => {
    onChange({ ...data, family_photo: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
        <User className="h-8 w-8 text-blue-600" />
      </div>

      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        Vertel ons over jezelf
      </h2>
      <p className="text-slate-600 text-center mb-8">
        Hoe mogen we je noemen? En deel een familiefoto als je wilt.
      </p>

      <div className="space-y-6 max-w-sm mx-auto">
        <div className="space-y-2">
          <Label htmlFor="display_name">Je naam</Label>
          <Input
            id="display_name"
            value={data.display_name}
            onChange={(e) =>
              onChange({ ...data, display_name: e.target.value })
            }
            placeholder="Bijv. Maria"
            className="text-lg"
          />
          <p className="text-sm text-slate-500">
            Dit wordt de titel van je levensverhaal
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="birth_year">Geboortejaar (optioneel)</Label>
          <select
            id="birth_year"
            value={data.birth_year || ""}
            onChange={(e) =>
              onChange({
                ...data,
                birth_year: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
          >
            <option value="">Selecteer...</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <p className="text-sm text-slate-500">
            Helpt ons vragen beter af te stemmen op je levensfase
          </p>
        </div>

        {/* Family Photo Upload */}
        <div className="space-y-2">
          <Label>Familiefoto (optioneel)</Label>
          <div className="flex flex-col items-center space-y-4">
            {data.family_photo ? (
              <div className="relative">
                <img
                  src={data.family_photo}
                  alt="Familiefoto"
                  className="w-24 h-24 rounded-full object-cover border-4 border-orange/20"
                />
                <Button
                  variant="danger"
                  className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                  onClick={removePhoto}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <Camera className="h-8 w-8 text-slate-400" />
              </div>
            )}

            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="family-photo"
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-orange border-t-transparent rounded-full animate-spin" />
                    Uploaden...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    {data.family_photo ? 'Wijzigen' : 'Upload foto'}
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-slate-500 text-center">
              Max 5MB • JPG, PNG of GIF<br />
              Maakt je verhaal persoonlijker
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
