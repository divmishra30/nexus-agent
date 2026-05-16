"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import HeroVisualization from '@/components/HeroVisualization';

const sectionVariants = { 
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = { 
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const fadeInAnimationVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 * index,
    },
  }),
};

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>
    ),
    title: "Intuitive AI Assistant",
    description: "Leverage the power of Gemini 1.5 to streamline your development workflow and generate stunning UI."
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
      </svg>
    ),
    title: "Dynamic UI Generation",
    description: "Transform ideas into interactive components and pages with intelligent code suggestions."
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
      </svg>
    ),
    title: "Real-time Project Insights",
    description: "Get immediate feedback and smart recommendations to improve your project structure and design."
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ),
    title: "Seamless Integration",
    description: "Works effortlessly with your existing Next.js projects, enhancing productivity without disrupting your flow."
  }
];

const appInfoFeatures = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z"></path>
      </svg>
    ),
    title: "Smart Automations",
    description: "Automate repetitive coding tasks and focus on creating unique user experiences."
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
      </svg>
    ),
    title: "Enterprise Security",
    description: "Built with security in mind, ensuring your project data and logic stay protected."
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
      </svg>
    ),
    title: "Global Scalability",
    description: "Design applications that scale effortlessly from a single user to millions worldwide."
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ),
    title: "Exceptional UX",
    description: "Create interfaces that users love, with built-in best practices for accessibility and design."
  }
];

const testimonials = [
  {
    quote: "Nexus App has completely transformed our development process. The AI assistant is like having a senior engineer by your side at all times.",
    author: "Sarah Connor",
    title: "Lead Developer at Tech Vision",
    initials: "SC",
  },
  {
    quote: "The visual excellence and interactive depth are unmatched. Our users love the new interfaces we build with Nexus App.",
    author: "Michael Johnson",
    title: "UX Designer at Creative Studio",
    initials: "MJ",
  },
  {
    quote: "A truly game-changing tool for any Next.js developer looking to push the boundaries of design and functionality.",
    author: "Emily Williams",
    title: "CTO of Global Tech Solutions",
    initials: "EW",
  },
];

const steps = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a6.22 6.22 0 003.111-5.358c0-3.418-2.67-6.188-5.992-6.188s-5.991 2.77-5.991 6.188c0 2.213 1.157 4.153 2.898 5.253.81.512 1.48 1.439 1.48 2.421v.192m7.5 0v-.192c0-.983-.658-1.823-1.508-2.316a6.22 6.22 0 00-3.111-5.358" />
      </svg>
    ),
    title: 'Define Your Vision',
    description: 'Clearly articulate your design or feature request to the Nexus AI.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    title: 'Generate & Refine',
    description: 'Watch as the AI generates elegant, functional code tailored to your project.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.61 3.51a14.98 14.98 0 00-6.16 12.12 14.98 14.98 0 009.61 9.11 6 6 0 011.08-1.08z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v.01M9 17v.01M7 17v.01" />
      </svg>
    ),
    title: 'Deploy & Iterate',
    description: 'Implement the code, gather feedback, and iterate with ease, powered by intelligent insights.',
  },
];

const clientLogos = [
  { id: '1', name: 'InnovateCorp', imgSrc: null, link: '#' },
  { id: '2', name: 'Global Solutions', imgSrc: null, link: '#' },
  { id: '3', name: 'FutureTech', imgSrc: null, link: '#' },
  { id: '4', name: 'NextGen AI', imgSrc: null, link: '#' },
  { id: '5', name: 'Creative Studio', imgSrc: null, link: '#' },
  { id: '6', name: 'Data Insights', imgSrc: null, link: '#' },
  { id: '7', name: 'Quantum Minds', imgSrc: null, link: '#' },
  { id: '8', name: 'Cloud Architects', imgSrc: null, link: '#' },
];

const btnPrimaryClasses = "bg-[var(--color-primary-600)] text-white font-[var(--font-weight-semibold)] py-3 px-6 rounded-[var(--radius-lg)] shadow-md transition-all duration-300 ease-in-out hover:bg-[var(--color-primary-700)] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-300)] active:scale-95 text-center";
const definedCardClasses = "bg-white border-2 border-slate-100 rounded-[var(--radius-2xl)] shadow-sm transition-all duration-300 ease-in-out hover:border-slate-300";
const iconWrapperClasses = "p-4 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-accent-500)] rounded-full text-white shadow-lg";
const textGradientClasses = "text-black"; 

/**
 * LogoImage Sub-component to handle graceful 404 fallbacks with premium defined borders
 */
const LogoImage = ({ src, name }: { src: string | null; name: string }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 border-2 border-slate-200 rounded-[var(--radius-xl)] text-slate-800 p-2 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-40 -z-10 transition-opacity group-hover:opacity-100 duration-300"></div>
        <span className="text-4xl font-black mb-1 opacity-20">{name.charAt(0)}</span>
        <span className="text-[10px] uppercase tracking-tighter font-bold text-center opacity-60 leading-none">{name}</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={`${name} Logo`} 
      onError={() => setHasError(true)}
      className="max-w-[80%] max-h-[80%] object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
    />
  );
};

export default function Home() {
  const [selectedFeature, setSelectedFeature] = useState<number | null>(0);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);

  return (
    <main className="flex flex-col items-center pt-4 pb-16 min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-200 text-black overflow-hidden">
      
      {/* New Intro Context Section */}
      <motion.section 
        className="w-full max-w-screen-xl mx-auto px-6 pt-12 pb-16 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-tight">
          Nexus Agent <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Ecosystem</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
          Architecting the future of web development with a unified platform of AI-powered tools, 
          real-time automation, and visually stunning interactive components.
        </p>
      </motion.section>

      {/* Replacement Hero Visualization Section */}
      <motion.section
        className="w-full max-w-[1400px] mx-auto overflow-hidden rounded-[var(--radius-3xl)] shadow-2xl border-4 border-slate-100"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <HeroVisualization />
      </motion.section>

      <motion.section
        className="w-full max-w-screen-xl mx-auto py-20 px-6 sm:px-12 bg-white rounded-[var(--radius-2xl)] shadow-xl border-2 border-slate-100 mt-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
    </motion.section>
    </main>
  );
}
