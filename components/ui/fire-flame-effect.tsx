"use client";

import React, { useEffect, useRef } from "react";

interface FireFlameEffectProps {
  className?: string;
  isHovered?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  type: "flame" | "ember";
  colorType: number; // 0: Cyan flame, 1: Teal flame, 2: Amber/gold fire ember, 3: White-hot
  wobbleSpeed: number;
  wobbleAmp: number;
}

export function FireFlameEffect({ className = "", isHovered = false }: FireFlameEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hoveredRef = useRef(isHovered);

  useEffect(() => {
    hoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = container.offsetWidth);
    let height = (canvas.height = container.offsetHeight);

    const handleResize = () => {
      if (!container || !canvas) return;
      width = canvas.width = container.offsetWidth;
      height = canvas.height = container.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    const particles: Particle[] = [];
    // Card boundary offset inside this generous container
    const padX = 28;
    const padYTop = 36;
    const padYBottom = 22;

    function spawnParticle() {
      const isHover = hoveredRef.current;
      const cardW = width - padX * 2;
      const cardH = height - (padYTop + padYBottom);
      if (cardW <= 0 || cardH <= 0) return;

      const isEmber = Math.random() < 0.4;
      const edge = Math.random();
      let x = 0;
      let y = 0;
      let vx = (Math.random() - 0.5) * 0.8;
      let vy = -(1.2 + Math.random() * 1.6);

      if (edge < 0.6) {
        // Bottom edge - main fire source
        x = padX + Math.random() * cardW;
        y = padYTop + cardH + (Math.random() * 4 - 2);
        vy = -(1.4 + Math.random() * (isHover ? 2.6 : 1.8));
      } else if (edge < 0.8) {
        // Left side
        x = padX + (Math.random() * 4 - 2);
        y = padYTop + Math.random() * cardH;
        vx = -(0.2 + Math.random() * 0.8);
        vy = -(1.0 + Math.random() * 1.5);
      } else {
        // Right side
        x = padX + cardW + (Math.random() * 4 - 2);
        y = padYTop + Math.random() * cardH;
        vx = 0.2 + Math.random() * 0.8;
        vy = -(1.0 + Math.random() * 1.5);
      }

      if (isEmber) {
        // Floating Ember Spark (smooth rising spark with sine wave)
        const maxLife = 35 + Math.floor(Math.random() * 35);
        particles.push({
          x,
          y,
          vx: vx * 1.2,
          vy: vy * 1.3,
          radius: 1.2 + Math.random() * 1.8,
          maxRadius: 2.5,
          life: 0,
          maxLife,
          type: "ember",
          colorType: Math.random() < 0.55 ? 2 : Math.random() < 0.85 ? 0 : 3, // amber/cyan/white
          wobbleSpeed: 0.08 + Math.random() * 0.1,
          wobbleAmp: 0.6 + Math.random() * 1.2,
        });
      } else {
        // Flame Body Particle (soft glowing flame ball)
        const maxLife = 28 + Math.floor(Math.random() * 24);
        const radius = (isHover ? 14 : 11) + Math.random() * 8;
        particles.push({
          x,
          y,
          vx: vx * 0.8,
          vy: vy * 1.0,
          radius,
          maxRadius: radius,
          life: 0,
          maxLife,
          type: "flame",
          colorType: Math.random() < 0.7 ? 0 : 2, // cyan / amber accent
          wobbleSpeed: 0.05 + Math.random() * 0.08,
          wobbleAmp: 0.4 + Math.random() * 0.8,
        });
      }
    }

    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    function render() {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx?.clearRect(0, 0, width, height);

      // Smooth spawning rate
      const maxCount = hoveredRef.current ? 48 : 32;
      if (particles.length < maxCount) {
        spawnParticle();
        if (hoveredRef.current || Math.random() < 0.4) {
          spawnParticle();
        }
      }

      // Additive blending for rich, radiant burning fire effect
      ctx!.globalCompositeOperation = "lighter";

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        const progress = p.life / p.maxLife; // 0 to 1
        // Smooth fade curve: soft fade in at birth, smooth gentle fade to 0 before dying
        const alpha = Math.sin(progress * Math.PI) * (1 - progress * 0.3);

        if (p.type === "ember") {
          // Embers drift smoothly with subtle sine wobble
          p.x += p.vx + Math.sin(p.life * p.wobbleSpeed) * p.wobbleAmp;
          p.y += p.vy;

          const r = Math.max(0.6, p.radius * (1 - progress * 0.4));

          ctx!.beginPath();
          ctx!.arc(p.x, p.y, r, 0, Math.PI * 2);

          if (p.colorType === 2) {
            // Warm Amber / Golden Fire Spark
            ctx!.fillStyle = `rgba(251, 146, 60, ${alpha * 0.95})`;
          } else if (p.colorType === 0) {
            // Mitsuru Electric Cyan Spark
            ctx!.fillStyle = `rgba(34, 211, 238, ${alpha * 0.95})`;
          } else {
            // Bright White-hot Core Spark
            ctx!.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
          }
          ctx!.fill();
        } else {
          // Flame body particles rise, shrink smoothly, and diffuse
          p.x += p.vx + Math.sin(p.life * p.wobbleSpeed) * p.wobbleAmp;
          p.y += p.vy;

          const currentRadius = Math.max(1, p.maxRadius * (1 - progress * 0.75));
          const grad = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentRadius);

          if (p.colorType === 0) {
            // Mitsuru Pure Cyan Flame
            grad.addColorStop(0, `rgba(224, 253, 255, ${alpha * 0.6})`); // White-hot core
            grad.addColorStop(0.35, `rgba(34, 211, 238, ${alpha * 0.45})`); // Vibrant cyan
            grad.addColorStop(0.7, `rgba(14, 165, 233, ${alpha * 0.2})`); // Deep sky blue
            grad.addColorStop(1, "rgba(14, 165, 233, 0)"); // Smooth transparent edge
          } else {
            // Warm Fire Accent Flame
            grad.addColorStop(0, `rgba(254, 243, 199, ${alpha * 0.65})`);
            grad.addColorStop(0.4, `rgba(245, 158, 11, ${alpha * 0.4})`);
            grad.addColorStop(0.75, `rgba(234, 88, 12, ${alpha * 0.18})`);
            grad.addColorStop(1, "rgba(234, 88, 12, 0)");
          }

          ctx!.fillStyle = grad;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      ctx!.globalCompositeOperation = "source-over";
      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      // Generous bounds so particles never hit the container edge
      className={`absolute -top-9 -bottom-6 -left-7 -right-7 pointer-events-none z-0 overflow-visible ${className}`}
      // Soft radial & linear mask to smoothly blur/feather all outer edges into complete transparency
      style={{
        maskImage:
          "radial-gradient(ellipse 90% 80% at 50% 60%, black 55%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 90% 80% at 50% 60%, black 55%, transparent 100%)",
      }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
