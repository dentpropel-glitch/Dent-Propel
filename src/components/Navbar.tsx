import React, { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useFunnel } from '../context/FunnelContext';
import { Logo } from './Logo';
import { ThemeSelector } from './ThemeSelector';

const NAV_LINKS = [
  { label: 'The System', href: '#the-system' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Our Offer', href: '#offer' },
  { label: 'FAQs', href: '#faqs' },
];

export function Navbar() {
  const { route, navigate } = useFunnel();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isFunnelStep = route === '/checkout' || route === '/thank-you';

  if (isFunnelStep) {
    const activeStep = route === '/checkout' ? 2 : 3;
    return (
      <header className="sticky top-0 z-40 border-b border-[#DCE7EE] dark:border-[#304258] bg-white/85 dark:bg-[#080E1D]/85 backdrop-blur-md">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Logo onClick={() => navigate('/')} size="sm" />

          <nav aria-label="Funnel progress" className="hidden md:flex items-center gap-3 text-xs sm:text-sm font-medium">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-[#46596A] dark:text-[#B8C8D8] hover:text-[#102338] dark:hover:text-[#F5FAFF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Explore
            </button>
            <span className="text-[#DCE7EE] dark:text-[#304258]" aria-hidden="true">→</span>
            <span
              className={`whitespace-nowrap shrink-0 ${
                activeStep === 2
                  ? 'text-[#087D94] dark:text-[#22D3D5] font-semibold'
                  : 'text-[#46596A] dark:text-[#B8C8D8]'
              }`}
            >
              Checkout
            </span>
            <span className="text-[#DCE7EE] dark:text-[#304258]" aria-hidden="true">→</span>
            <span
              className={`whitespace-nowrap shrink-0 ${
                activeStep === 3
                  ? 'text-[#087D94] dark:text-[#22D3D5] font-semibold'
                  : 'text-[#46596A] dark:text-[#B8C8D8]'
              }`}
            >
              Confirmation
            </span>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <ThemeSelector />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 pt-3 px-4 sm:px-6">
      <div className="max-w-[1280px] mx-auto rounded-2xl border border-[#DCE7EE]/90 dark:border-[#304258]/90 bg-white/82 dark:bg-[#080E1D]/82 backdrop-blur-xl shadow-sm dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.6)]">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Mark */}
          <Logo onClick={() => navigate('/')} />

          {/* Zone 2: Navigation Links */}
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.href);
                }}
                className="text-sm font-medium text-[#46596A] dark:text-[#B8C8D8] hover:text-[#087D94] dark:hover:text-[#22D3D5] transition-colors whitespace-nowrap shrink-0"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Theme Selector & Single Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:block">
              <ThemeSelector />
            </div>
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#087D94] hover:bg-[#06687C] dark:bg-gradient-to-r dark:from-[#22D3D5] dark:to-[#43B5EC] dark:text-[#080E1D] dark:hover:opacity-95 transition-all whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-[#DCE7EE] dark:border-[#304258] bg-white/80 dark:bg-[#152337] text-[#102338] dark:text-[#F5FAFF] cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#DCE7EE] dark:border-[#304258] px-4 py-4 space-y-4">
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    navigate(item.href);
                  }}
                  className="px-3 py-2.5 rounded-lg text-base font-medium text-[#102338] dark:text-[#F5FAFF] hover:bg-[#F6F9FC] dark:hover:bg-[#152337]"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="pt-2 border-t border-[#DCE7EE] dark:border-[#304258] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#46596A] dark:text-[#B8C8D8]">
                  Appearance
                </span>
                <ThemeSelector compact />
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/checkout');
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-[#087D94] dark:bg-gradient-to-r dark:from-[#22D3D5] dark:to-[#43B5EC] dark:text-[#080E1D] cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
