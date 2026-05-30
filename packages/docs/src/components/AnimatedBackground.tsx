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

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor((canvas.width * canvas.height) / 6000); 
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.8 + 0.4,
          speedY: Math.random() * 0.8 + 0.4,
          opacity: Math.random() * 0.2 + 0.1,
          pulseSpeed: Math.random() * 0.02 + 0.005,
          pulseState: Math.random() * Math.PI * 2,
        });
      }
    };

    const resize = () => {
      const oldWidth = canvas.width;
      const oldHeight = canvas.height;
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      canvas.width = newWidth;
      canvas.height = newHeight;

      if (oldWidth === 0 || oldHeight === 0) {
        initParticles();
        return;
      }

      // Smoothly scale existing particles' positions instead of resetting them
      const targetNum = Math.floor((newWidth * newHeight) / 6000);
      
      particles.forEach((p) => {
        p.x = (p.x / oldWidth) * newWidth;
        p.y = (p.y / oldHeight) * newHeight;
      });

      // Adjust particle count smoothly without wiping the list
      if (particles.length < targetNum) {
        const diff = targetNum - particles.length;
        for (let i = 0; i < diff; i++) {
          particles.push({
            x: Math.random() * newWidth,
            y: Math.random() * newHeight,
            size: Math.random() * 1.8 + 0.4,
            speedY: Math.random() * 0.8 + 0.4,
            opacity: Math.random() * 0.2 + 0.1,
            pulseSpeed: Math.random() * 0.02 + 0.005,
            pulseState: Math.random() * Math.PI * 2,
          });
        }
      } else if (particles.length > targetNum) {
        particles.splice(targetNum);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";

      particles.forEach((p) => {
        p.pulseState += p.pulseSpeed;
        const currentOpacity = p.opacity + Math.sin(p.pulseState) * 0.4;
        
        ctx.globalAlpha = Math.max(0.05, Math.min(0.4, currentOpacity));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.y -= p.speedY;

        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resize();
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    
    // Initial size setup
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
    
    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
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
