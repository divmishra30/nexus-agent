'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

/**
 * InteractiveParticles Component
 * A high-performance HTML5 Canvas-based particle system.
 * Includes mouse repulsion, web-mesh connections, and screen wrapping.
 */
export default function InteractiveParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -1000, y: -1000 });
  const requestRef = useRef<number>(0);

  const PARTICLE_COUNT = 120;
  const CONNECTION_DISTANCE = 150;
  const MOUSE_RADIUS = 180;
  const MOUSE_STRENGTH = 0.5;

  // Initialize particles
  const init = useCallback((width: number, height: number) => {
    const p: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      p.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        color: 'hsla(220, 90%, 56%, 0.6)'
      });
    }
    particles.current = p;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      init(window.innerWidth, window.innerHeight);
    };

    const animate = () => {
      if (!ctx) return;
      
      // Clear canvas with a slightly transparent fill for a minor trail effect if desired
      // But for high performance and clean defined lines, we clear fully
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const p = particles.current;
      for (let i = 0; i < p.length; i++) {
        const part = p[i];

        // Update position
        part.x += part.vx;
        part.y += part.vy;

        // Screen Wrap
        if (part.x < 0) part.x = window.innerWidth;
        if (part.x > window.innerWidth) part.x = 0;
        if (part.y < 0) part.y = window.innerHeight;
        if (part.y > window.innerHeight) part.y = 0;

        // Mouse Influence
        const dx = mouse.current.x - part.x;
        const dy = mouse.current.y - part.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          const angle = Math.atan2(dy, dx);
          part.vx -= Math.cos(angle) * force * MOUSE_STRENGTH;
          part.vy -= Math.sin(angle) * force * MOUSE_STRENGTH;
        } else {
          // Gentle friction to stabilize
          part.vx *= 0.99;
          part.vy *= 0.99;
          // Keep minimum speed
          const speed = Math.sqrt(part.vx * part.vx + part.vy * part.vy);
          if (speed < 0.2) {
            part.vx += (Math.random() - 0.5) * 0.1;
            part.vy += (Math.random() - 0.5) * 0.1;
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fillStyle = part.color;
        ctx.fill();

        // Draw connections (Web Mesh)
        for (let j = i + 1; j < p.length; j++) {
          const part2 = p[j];
          const dx2 = part.x - part2.x;
          const dy2 = part.y - part2.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

          if (dist2 < CONNECTION_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(part.x, part.y);
            ctx.lineTo(part2.x, part2.y);
            const opacity = (1 - dist2 / CONNECTION_DISTANCE) * 0.15;
            ctx.strokeStyle = `hsla(220, 90%, 56%, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, [init]);

  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 5 }}
    />
  );
}