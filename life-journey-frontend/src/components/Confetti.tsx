"use client";

import { useEffect, useState } from "react";

interface ConfettiProps {
  show: boolean;
  duration?: number;
  particleCount?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
}

export function Confetti({ show, duration = 3000, particleCount = 50 }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!show) {
      setParticles([]);
      return;
    }

    const colors = [
      '#FF8C42', // Orange
      '#FFB84D', // Gold
      '#FFC857', // Yellow
      '#7BB661', // Green
      '#E0AA3E', // Honey
      '#F47B3B', // Dark orange
      '#F5A623', // Dark gold
    ];

    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // Random horizontal position
      y: -10, // Start above viewport
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4, // Size between 4-12px
      rotation: Math.random() * 360,
      delay: Math.random() * 1000, // Staggered start
    }));

    setParticles(newParticles);

    // Clean up after animation
    const timer = setTimeout(() => {
      setParticles([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [show, duration, particleCount]);

  if (!show || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="confetti absolute"
          style={{
            left: `${particle.x}%`,
            backgroundColor: particle.color,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}ms`,
            transform: `rotate(${particle.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// Hook for easy confetti triggering
export function useConfetti() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiConfig, setConfettiConfig] = useState({ duration: 3000, particleCount: 50 });

  const triggerConfetti = (duration = 3000, particleCount = 50) => {
    setConfettiConfig({ duration, particleCount });
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), duration);
  };

  return {
    showConfetti,
    triggerConfetti,
    ConfettiComponent: () => (
      <Confetti
        show={showConfetti}
        duration={confettiConfig.duration}
        particleCount={confettiConfig.particleCount}
      />
    )
  };
}