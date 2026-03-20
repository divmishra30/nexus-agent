'use client'
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu on resize when transitioning to desktop view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640 && isMenuOpen) { // Tailwind's 'sm' breakpoint is 640px
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  // Common classes for navigation links, updated for light background
  const baseLinkClasses = "block px-4 py-2 rounded-lg text-lg font-medium text-text-default transition-all duration-200";
  const hoverFocusLinkClasses = "hover:bg-primary-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-2";

  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-border-default/50 py-3 shadow-sm z-50">
      <nav className="container mx-auto flex flex-wrap justify-between items-center px-6" aria-label="Main navigation">
        <Link 
          href="/" 
          className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-600 hover:opacity-80 transition-opacity rounded-lg"
          aria-label="Nexus App Home"
          onClick={() => isMenuOpen && toggleMenu()} // Close mobile menu if navigating home
        >
          Nexus App
        </Link>

        {/* Mobile menu button - visible only on small screens */}
        <button
          className="sm:hidden text-text-default p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={toggleMenu}
          aria-controls="main-navigation-menu-mobile"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        {/* Desktop navigation and Google Translate - visible on sm and up */}
        <div className="hidden sm:flex flex-wrap items-center gap-x-8"> {/* This div wraps the desktop nav and translate */}
          <ul className="flex flex-wrap justify-end gap-x-2" id="main-navigation-menu-desktop" role="menubar">
            <li role="none"><Link href="/" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`} role="menuitem">Home</Link></li>
            <li role="none"><Link href="/country-flags" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`} role="menuitem">Country Flags</Link></li>
            <li role="none"><Link href="/upload" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`} role="menuitem">Upload</Link></li>
            <li role="none"><Link href="/view-attachments" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`} role="menuitem">View Attachments</Link></li>
            <li role="none"><Link href="/google-search" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`} role="menuitem">Google Search</Link></li>
            <li role="none"><Link href="/tic-tac-toe" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`} role="menuitem">Tic-Tac-Toe</Link></li>
            <li role="none"><Link href="/login" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`} role="menuitem">Login</Link></li>
          </ul>
          {/* Google Translate for Desktop */}
          <div id="google_translate_element_desktop" className="google-translate-widget"></div>
        </div>

        {/* Mobile navigation (collapsible, visible when menu is open) */}
        <div
          id="main-navigation-menu-mobile"
          className={`basis-full transition-all duration-300 ease-in-out overflow-hidden sm:hidden ${
            isMenuOpen ? 'max-h-screen opacity-100 pt-6 pb-4' : 'max-h-0 opacity-0'
          }`}
          aria-hidden={!isMenuOpen}
        >
          <ul className="flex flex-col space-y-2" role="menubar">
            {/* Google Translate for Mobile */}
            <li className="w-full text-center py-2" role="none">
              <div id="google_translate_element_mobile" className="google-translate-widget inline-block"></div>
            </li>
            <li role="none"><Link href="/" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`} onClick={toggleMenu} role="menuitem">Home</Link></li>
            <li role="none"><Link href="/country-flags" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`} onClick={toggleMenu} role="menuitem">Country Flags</Link></li>
            <li role="none"><Link href="/upload" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`} onClick={toggleMenu} role="menuitem">Upload</Link></li>
            <li role="none"><Link href="/view-attachments" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`} onClick={toggleMenu} role="menuitem">View Attachments</Link></li>
            <li role="none"><Link href="/google-search" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`} onClick={toggleMenu} role="menuitem">Google Search</Link></li>
            <li role="none"><Link href="/tic-tac-toe" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`} onClick={toggleMenu} role="menuitem">Tic-Tac-Toe</Link></li>
            <li role="none"><Link href="/login" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`} onClick={toggleMenu} role="menuitem">Login</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}