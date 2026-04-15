'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import InteractiveParticles from './InteractiveParticles';

/**
 * HeroVisualization Component
 * Features:
 * - High-performance Interactive Particle System (Canvas)
 * - Mouse tracking parallax effect
 * - High-contrast defined borders (No blurs)
 * - Floating 3D-effect metric cards
 * - Animated Gradient Mesh background using radial gradients
 * - Dynamic Rolling Number counter for latency metrics
 * - 'Bobble' spring interactions on tap/click
 */
export default function HeroVisualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion values for mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring configuration for parallax
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Bobble spring configuration for interactions
  const bobbleSpring = { 
    type: 'spring', 
    stiffness: 400, 
    damping: 17, 
    mass: 1 
  };

  // Rolling Number Logic for Latency Metric
  const latencyBase = useMotionValue(0);
  const roundedLatency = useTransform(latencyBase, (latest) => Math.round(latest));

  useEffect(() => {
    // Animate from 0 to 24 with a organic spring feel
    const controls = animate(latencyBase, 24, {
      type: 'spring',
      stiffness: 100,
      damping: 30,
      duration: 2
    });
    return controls.stop;
  }, [latencyBase]);

  // Transformations for layered parallax effect
  const backNodesX = useTransform(smoothX, [0, 1000], [15, -15]);
  const backNodesY = useTransform(smoothY, [0, 1000], [15, -15]);

  const midLayerX = useTransform(smoothX, [0, 1000], [-25, 25]);
  const midLayerY = useTransform(smoothY, [0, 1000], [-25, 25]);

  const frontLayerX = useTransform(smoothX, [0, 1000], [40, -40]);
  const frontLayerY = useTransform(smoothY, [0, 1000], [40, -40]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-[600px] md:h-[800px] overflow-hidden bg-slate-950 flex items-center justify-center cursor-crosshair"
    >
      {/* Hardware Accelerated Interactive Particle Background */}
      <InteractiveParticles />

      {/* Animated Gradient Mesh Background Layers */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, hsla(220, 90%, 56%, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, hsla(280, 80%, 65%, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, hsla(220, 90%, 56%, 0.2) 0%, transparent 70%)
            `
          }}
        />
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100"></div>
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]"></div>
      </div>

      {/* Layer 1: Enhanced Motion Nodes */}
      <motion.div 
        style={{ x: backNodesX, y: backNodesY }}
        className="absolute inset-0 z-10 pointer-events-none"
      >
        {[...Array(8)].map((_, i) => (
          <motion.div 
            key={i}
            whileTap={{ scale: 0.8 }}
            transition={bobbleSpring}
            className="absolute w-1.5 h-1.5 bg-blue-500/20 rounded-full border border-blue-400/40 pointer-events-auto cursor-pointer"
            style={{
              left: `${(i * 157) % 100}%`,
              top: `${(i * 123) % 100}%`,
            }}
          />
        ))}
      </motion.div>

      {/* Layer 2: Middle Layer (Geometric Shapes) */}
      <motion.div 
        style={{ x: midLayerX, y: midLayerY }}
        className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
      >
        <svg className="w-[800px] h-[800px] opacity-10" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.1" fill="none" className="text-blue-500 animate-pulse-slow" />
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.05" fill="none" className="text-purple-500" />
          <path d="M20,50 L80,50 M50,20 L50,80" stroke="currentColor" strokeWidth="0.05" className="text-slate-500" />
        </svg>
      </motion.div>

      {/* Layer 3: Foreground (Interactive UI Cards) */}
      <motion.div 
        style={{ x: frontLayerX, y: frontLayerY }}
        className="relative z-30 flex flex-col md:flex-row gap-8 items-center"
      >
        {/* Main Hero Card */}
        <motion.div 
          whileHover={{ scale: 1.02, rotateZ: 1 }}
          whileTap={{ scale: 0.96 }}
          transition={bobbleSpring}
          className="w-80 p-8 bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer"
        >
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-blue-600 rounded-2xl border-2 border-blue-400/30 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                Live Optimized
              </span>
           </div>
           <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Nexus Engine</h3>
           <p className="text-slate-400 text-sm mb-6">Neural-enhanced processing architecture for ultra-responsive UI components.</p>
           <div className="space-y-3">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "85%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                />
              </div>
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                <span>Efficiency</span>
                <span>85%</span>
              </div>
           </div>
        </motion.div>

        {/* Small Metrics Card */}
        <motion.div 
          animate={{ y: [0, -15, 0] }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{
            y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
            scale: bobbleSpring
          }}
          className="w-64 p-6 bg-slate-900 border-2 border-slate-800 rounded-2xl shadow-2xl cursor-pointer"
        >
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">System Latency</div>
          <div className="flex items-end gap-2">
            <motion.span 
              className="text-4xl font-black text-white tabular-nums"
            >
              {roundedLatency}
            </motion.span>
            <span className="text-blue-500 font-bold mb-1">ms</span>
          </div>
          <div className="mt-4 flex gap-1 items-end h-8">
            {[30, 45, 25, 60, 40, 70, 50].map((h, i) => (
              <motion.div 
                key={i} 
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.1, duration: 1 }}
                className="flex-1 bg-blue-500/20 border-t-2 border-blue-500 rounded-sm"
              />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Content Overlay */}
      <div className="absolute bottom-16 left-0 w-full text-center z-40 px-6 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
            Experience the <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Next Frontier</span>
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto font-medium">
            Real-time interactive intelligence meets industrial-grade performance.
          </p>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
        .bg-grid-white\\/\\[0\\.05\\] {
          background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
}