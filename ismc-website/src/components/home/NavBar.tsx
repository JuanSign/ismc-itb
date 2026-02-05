"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Next.js Image component
import { NavItem } from './data/types';

const navItems: NavItem[] = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Activities', href: '#activities' },
];

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-ismc-darkBlue text-ismc-cream shadow-md font-montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="shrink-0 flex items-center">
            <Link href="/" className="relative h-12 w-32 md:w-48 transition-opacity hover:opacity-90">
              <Image 
                src="/logo/Header.png" 
                alt="ISMC XV Header" 
                fill 
                className="object-contain object-left" 
                priority
              />
            </Link>
          </div>
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex space-x-8">
              {navItems.map((item) => (
                <Link 
                  key={item.label}
                  href={item.href} 
                  className="hover:text-ismc-orange transition-colors duration-200 font-bold text-sm tracking-wide uppercase"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative h-10 w-10 md:h-12 md:w-12">
              <Image 
                src="/logo/ISMC-ITB.png" 
                alt="ISMC ITB Logo" 
                fill 
                className="object-contain" 
              />
            </div>
            <div className="relative h-10 w-10 md:h-12 md:w-12">
              <Image 
                src="/logo/HMT-ITB.png" 
                alt="HMT ITB Logo" 
                fill 
                className="object-contain" 
              />
            </div>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-ismc-cream hover:text-white focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-ismc-darkBlue border-t border-ismc-teal/20 animate-fade-in">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-bold hover:bg-ismc-teal/10 hover:text-ismc-orange transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="flex items-center gap-4 pt-4 mt-4 border-t border-ismc-teal/10">
               <div className="relative h-10 w-10">
                  <Image src="/logo/ISMC-ITB.png" alt="ISMC ITB" fill className="object-contain" />
               </div>
               <div className="relative h-10 w-10">
                  <Image src="/logo/HMT-ITB.png" alt="HMT ITB" fill className="object-contain" />
               </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}