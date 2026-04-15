'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * Premium Modern Footer Component
 * Features:
 * - Defined border design (No blurs)
 * - Semantic HTML5 footer
 * - High contrast product grid
 * - Framer Motion micro-interactions
 */
export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const linkStyles = "text-slate-500 hover:text-blue-600 transition-all duration-300 inline-block hover:translate-x-1";
  const headingStyles = "text-slate-900 font-bold mb-6 text-sm uppercase tracking-widest";

  return (
    <footer className="w-full bg-white border-t-2 border-slate-100 pt-20 pb-12" aria-label="Global Footer">
      <div className="container mx-auto px-6 max-w-screen-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand Identity */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <img src="/uploads/nexus-app-logo.png" alt="Logo" className="h-5 w-5 brightness-0 invert" />
              </div>
              <span className="text-xl font-black text-slate-900">Nexus Agent</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              Architecting the future of web development with AI-powered tools and stunning interactive components. Elevate your workflow today.
            </p>
            <div className="flex gap-4">
              {/* Social Icons Placeholders */}
              {['github', 'twitter', 'discord'].map((icon) => (
                <button 
                  key={icon} 
                  className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-200"
                  aria-label={`Follow us on ${icon}`}
                >
                  <span className="text-xs uppercase font-bold">{icon[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Product Features */}
          <div>
            <h3 className={headingStyles}>Product</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li><Link href="/" className={linkStyles}>Home Workspace</Link></li>
              <li><Link href="/country-flags" className={linkStyles}>Global Data</Link></li>
              <li><Link href="/upload" className={linkStyles}>Cloud Storage</Link></li>
              <li><Link href="/google-search" className={linkStyles}>Smart Search</Link></li>
              <li><Link href="/tic-tac-toe" className={linkStyles}>Game Labs</Link></li>
            </ul>
          </div>

          {/* Column 3: Support & Docs */}
          <div>
            <h3 className={headingStyles}>Resources</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li><Link href="/about" className={linkStyles}>About Agency</Link></li>
              <li><Link href="/contact" className={linkStyles}>Contact Support</Link></li>
              <li><a href="#" className={linkStyles}>Documentation</a></li>
              <li><a href="#" className={linkStyles}>API Status</a></li>
              <li><a href="#" className={linkStyles}>Community</a></li>
            </ul>
          </div>

          {/* Column 4: Legal & Newsletter */}
          <div>
            <h3 className={headingStyles}>Legal</h3>
            <ul className="flex flex-col gap-3 text-sm mb-8">
              <li><Link href="/privacy" className={linkStyles}>Privacy Policy</Link></li>
              <li><Link href="/terms" className={linkStyles}>Terms of Service</Link></li>
              <li><a href="#" className={linkStyles}>Cookie Policy</a></li>
            </ul>
            <div className="pt-4">
               <button 
                onClick={scrollToTop}
                className="group flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase"
              >
                Back to top
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  ↑
                </motion.span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 font-medium">
            © {new Date().getFullYear()} Nexus Agent Ecosystem. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
