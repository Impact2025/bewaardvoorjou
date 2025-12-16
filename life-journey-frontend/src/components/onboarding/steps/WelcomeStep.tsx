"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, BookOpen, Shield, Play, Pause } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="text-center">
      {/* Video Welcome */}
      <div className="mb-8 relative">
        <div className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-slate-100 aspect-video relative">
          <video
            className="w-full h-full object-cover"
            poster="/welcome-poster.jpg"
            controls={false}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          >
            <source src="/welcome-video.mp4" type="video/mp4" />
            <source src="/welcome-video.webm" type="video/webm" />
            Uw browser ondersteunt deze video niet.
          </video>

          {/* Custom play button overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Button

                className="rounded-full w-16 h-16 bg-white/90 hover:bg-white text-slate-900 shadow-lg"
                onClick={() => {
                  const video = document.querySelector('video');
                  if (video) {
                    video.play();
                  }
                }}
              >
                <Play className="h-6 w-6 ml-1" />
              </Button>
            </div>
          )}
        </div>

        <p className="text-sm text-slate-500 mt-2">
          Bekijk onze welkomstvideo (2 minuten)
        </p>
      </div>

      <div className="w-16 h-16 rounded-full bg-orange/10 flex items-center justify-center mx-auto mb-6">
        <Sparkles className="h-8 w-8 text-orange" />
      </div>

      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        Welkom bij Bewaardvoorjou
      </h1>

      <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto">
        Samen bouwen we aan de digitale familiebibliotheek. We begeleiden je stap voor stap
        bij het vastleggen van je levensverhaal voor toekomstige generaties.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Feature
          icon={<BookOpen className="h-6 w-6" />}
          title="Jouw verhaal"
          description="Kies je eigen hoofdstukken"
        />
        <Feature
          icon={<Heart className="h-6 w-6" />}
          title="AI begeleiding"
          description="Nooit meer een blanco pagina"
        />
        <Feature
          icon={<Shield className="h-6 w-6" />}
          title="100% privé"
          description="Jij bepaalt wie toegang krijgt"
        />
      </div>

      <Button
        onClick={onNext}

        className="bg-orange hover:bg-orange/90 text-lg px-8"
      >
        Laten we beginnen
      </Button>

      <p className="text-sm text-slate-500 mt-6">
        Dit duurt ongeveer 3 minuten
      </p>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-slate-50">
      <div className="text-orange mb-2">{icon}</div>
      <h3 className="font-medium text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}
