'use client';
import Link from 'next/link';

export default function Footer() {
  const footerLinkClasses = "text-[var(--color-text-muted)] hover:text-[var(--color-primary-600)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2 focus:ring-offset-[var(--color-background-light)] rounded-[var(--radius-sm)] px-[var(--spacing-1)] py-[var(--spacing-1)]";

  return (
    <footer className="bg-[var(--color-background-light)] text-[var(--color-text-default)] py-[var(--spacing-6)] px-[var(--spacing-4)] shadow-inner mt-auto border-t border-[var(--color-border-default)]" aria-label="Footer navigation and information">
      <div className="container mx-auto max-w-screen-2xl flex flex-col sm:flex-row justify-between items-center gap-[var(--spacing-4)]">
        <p className="text-sm text-[var(--color-text-muted)] order-2 sm:order-1">© {new Date().getFullYear()} Nexus App. All rights reserved.</p>
        <nav className="order-1 sm:order-2" aria-label="Legal and company links">
          <ul className="flex flex-wrap justify-center gap-[var(--spacing-4)] sm:gap-[var(--spacing-8)] text-sm sm:text-base">
            <li><Link href="/about" className={footerLinkClasses}>About Us</Link></li>
            <li><Link href="/contact" className={footerLinkClasses}>Contact</Link></li>
            <li><Link href="/privacy" className={footerLinkClasses}>Privacy Policy</Link></li>
            <li><Link href="/terms" className={footerLinkClasses}>Terms of Service</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}