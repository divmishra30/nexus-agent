'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Define navigation links
const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Flags', href: '/country-flags' },
  { name: 'Upload', href: '/upload' },
  { name: 'Attachments', href: '/view-attachments' },
  { name: 'Search', href: '/google-search' },
  { name: 'Games', href: '/tic-tac-toe' },
  { name: 'URL Details', href: '/url-details' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' }
];

/**
 * Nexus Agent Header Component
 * Features:
 * - High-fidelity full-height hover interactions
 * - Shared layout background motion
 * - Defined border highlight design
 * - Responsive navigation with Google Translate
 */
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle scroll effect for header appearance
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle resize to close mobile menu
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  // Desktop navigation link classes
  const navLinkClasses = `
    relative px-5 h-full flex items-center text-sm font-semibold tracking-wide transition-colors duration-300
    text-white/70 hover:text-white
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500
  `;

  // Mobile navigation link classes
  const mobileNavLinkClasses = `
    text-2xl font-bold text-white py-2 block border-b border-white/10
    hover:bg-white/10 hover:text-[var(--color-primary-300)] transition-colors duration-200 rounded-lg px-2
    focus:outline-none focus:ring-2 focus:ring-blue-500/50
  `;

  return (
    <header 
      className={`fixed top-0 left-0 w-full h-20 z-50 transition-all duration-300 border-b ${
        scrolled || isMenuOpen
          ? 'bg-black border-white/20 shadow-2xl' 
          : 'bg-black/95 border-white/10'
      }`}
    >
      <nav className="container mx-auto h-full flex justify-between items-stretch px-6" aria-label="Main navigation">
        {/* Logo Container */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="Nexus App Home"
            onClick={() => isMenuOpen && toggleMenu()}
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 p-0.5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-black">
                <img src="/uploads/nexus-app-logo.png" alt="Nexus App Logo" className="h-7 w-7 object-contain" />
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white transition-opacity group-hover:opacity-80">
              Nexus <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Agent</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation - Full Height Stretch */}
        <div className="hidden lg:flex items-stretch gap-x-1">
          <ul 
            className="flex items-stretch" 
            id="main-navigation-menu-desktop" 
            role="menubar"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {NAV_LINKS.map((link, index) => (
              <li role="none" key={link.name} className="relative h-full flex">
                <Link 
                  href={link.href} 
                  className={navLinkClasses} 
                  role="menuitem"
                  onMouseEnter={() => setHoveredIndex(index)}
                >
                  <span className="relative z-10">{link.name}</span>
                  
                  <AnimatePresence>
                    {hoveredIndex === index && (
                      <motion.div
                        layoutId="nav-hover-pill"
                        className="absolute inset-0 bg-blue-600/10 border-b-2 border-blue-500 z-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 30, 
                          mass: 1 
                        }}
                      />
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            ))} 
          </ul>
          
          <div className="flex items-center ml-4 gap-4">
            <div className="h-8 w-px bg-white/20" />
            
            <Link 
              href="/login" 
              className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full transition-all duration-300 hover:bg-blue-50 active:scale-95"
            >
              Sign In
            </Link>
            
            <div id="google_translate_element_desktop" className="google-translate-widget scale-90 origin-right"></div>
          </div>
        </div>

        {/* Mobile Toggle Container */}
        <div className="lg:hidden flex items-center">
          <button
            className="text-white p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-90 border border-white/20"
            onClick={toggleMenu}
            aria-controls="main-navigation-menu-mobile"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        id="main-navigation-menu-mobile"
        className={`fixed inset-0 top-20 bg-black transition-all duration-500 ease-in-out lg:hidden ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="flex flex-col h-full px-6 py-8 overflow-y-auto">
          <ul className="flex flex-col space-y-4" role="menubar">
             <li className="mb-4">
                <div id="google_translate_element_mobile" className="google-translate-widget"></div>
             </li>
            {NAV_LINKS.map((link) => (
              <li role="none" key={link.name}>
                <Link href={link.href} className={mobileNavLinkClasses} onClick={toggleMenu} role="menuitem">
                  {link.name}
                </Link>
              </li>
            ))}
            <li role="none" className="pt-4">
              <Link href="/login" className="w-full py-4 bg-blue-600 text-white text-center font-bold rounded-2xl block hover:bg-blue-700 transition-colors duration-200" onClick={toggleMenu} role="menuitem">Sign In</Link>
            </li>
          </ul>
          
          <div className="mt-auto pb-12 text-center text-white/40 text-sm">
            © 2026 Nexus Agent. Premium AI Workspace.
          </div>
        </div>
      </div>
    </header>
  );
}