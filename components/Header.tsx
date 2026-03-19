'use client'
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Common classes for navigation links
  const baseLinkClasses = "block px-[var(--spacing-3)] py-[var(--spacing-2)] rounded-[var(--radius-sm)] text-[var(--font-size-lg)] font-[var(--font-weight-medium)] text-white";
  const hoverFocusLinkClasses = "hover:bg-[rgba(255,255,255,0.15)] hover:text-[var(--color-primary-100)] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-200)] focus:ring-offset-2 focus:ring-offset-[var(--color-primary-700)]";

  return (
    <header className="fixed top-0 left-0 w-full bg-[var(--color-primary-700)] text-white py-[var(--spacing-4)] shadow-xl z-50">
      <nav className="container mx-auto flex flex-wrap justify-between items-center px-[var(--spacing-4)]" aria-label="Main navigation">
        <Link 
          href="/" 
          className={`text-[var(--font-size-3xl)] sm:text-[var(--font-size-4xl)] font-[var(--font-weight-extrabold)] tracking-wide mb-[var(--spacing-4)] sm:mb-[var(--spacing-0)] ${hoverFocusLinkClasses} rounded-[var(--radius-sm)]`}
          aria-label="Nexus App Home"
        >
          Nexus App
        </Link>

        {/* Mobile menu button */}
        <button
          className={`sm:hidden text-white text-[var(--font-size-2xl)] p-[var(--spacing-2)] rounded-[var(--radius-sm)] ${hoverFocusLinkClasses}`}
          onClick={toggleMenu}
          aria-controls="main-navigation-menu"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        {/* Desktop navigation */}
        <ul className="hidden sm:flex flex-wrap justify-end gap-x-[var(--spacing-6)] gap-y-[var(--spacing-2)]" id="main-navigation-menu">
          <li><Link href="/" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`}>Home</Link></li>
          <li><Link href="/country-flags" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`}>Country Flags</Link></li>
          <li><Link href="/upload" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`}>Upload</Link></li>
          <li><Link href="/view-attachments" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`}>View Attachments</Link></li>
          <li><Link href="/google-search" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`}>Google Search</Link></li>
          <li><Link href="/login" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`}>Login</Link></li>
        </ul>

        {/* Mobile navigation (visible when menu is open) */}
        {isMenuOpen && (
          <ul className="basis-full flex flex-col items-center mt-[var(--spacing-4)] space-y-[var(--spacing-3)] sm:hidden" id="main-navigation-menu-mobile">
            <li><Link href="/" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`} onClick={toggleMenu}>Home</Link></li>
            <li><Link href="/country-flags" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`} onClick={toggleMenu}>Country Flags</Link></li>
            <li><Link href="/upload" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`} onClick={toggleMenu}>Upload</Link></li>
            <li><Link href="/view-attachments" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`} onClick={toggleMenu}>View Attachments</Link></li>
            <li><Link href="/google-search" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`} onClick={toggleMenu}>Google Search</Link></li>
            <li><Link href="/login" className={`${baseLinkClasses} ${hoverFocusLinkClasses}`} onClick={toggleMenu}>Login</Link></li>
          </ul>
        )}
      </nav>
    </header>
  );
}
