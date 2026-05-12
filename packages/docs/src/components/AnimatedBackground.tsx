"use client";

import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: { x: number; y: number; size: number; speedY: number; opacity: number; pulseSpeed: number; pulseState: number }[] = [];
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor((canvas.width * canvas.height) / 6000); 
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.8 + 0.4,
          speedY: Math.random() * 0.8 + 0.4, // faster speed
          opacity: Math.random() * 0.2 + 0.1, // dimmer white
          pulseSpeed: Math.random() * 0.02 + 0.005,
          pulseState: Math.random() * Math.PI * 2,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";

      particles.forEach((p) => {
        // Calculate pulsing opacity
        p.pulseState += p.pulseSpeed;
        const currentOpacity = p.opacity + Math.sin(p.pulseState) * 0.4;
        
        ctx.globalAlpha = Math.max(0.05, Math.min(0.4, currentOpacity));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Move upwards slowly
        p.y -= p.speedY;

        // Reset to bottom if it goes off screen
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }} 
    />
  );
}
