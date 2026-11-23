import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useFunnel } from '../context/FunnelContext';
import { buildWhatsAppRedirectUrl } from '../lib/funnelLogic';
import { Logo } from './Logo';

export function Footer() {
  const { config, navigate } = useFunnel();

  const whatsappUrl = buildWhatsAppRedirectUrl(
    config.contact.whatsapp,
    'Hello Dent Propel, I would like to discuss growth options for my dental practice.',
  );
  const hasSocialLinks = Boolean(
    config.social.facebook || config.social.instagram || config.social.linkedin,
  );

  return (
    <footer className="bg-[#060B17] text-[#B8C8D8] border-t border-[#1E2E44]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#1E2E44]">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-3">
            <Logo onClick={() => navigate('/')} inverted />
            <p className="font-display text-sm font-semibold text-[#22D3D5]">
              {config.tagline}
            </p>
            <p className="text-sm leading-relaxed text-[#B8C8D8] max-w-sm">
              Connected dental marketing, lead generation, and automation systems designed for
              modern dental practices.
            </p>
            <p className="text-xs text-[#8AA0B8]">
              Primary Market: Pakistan · Expanding Internationally
            </p>
          </div>

          {/* Navigation */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5FAFF]">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'The System', href: '#the-system' },
                { label: 'Solutions', href: '#solutions' },
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Our Offer', href: '#offer' },
                { label: 'FAQs', href: '#faqs' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(link.href);
                    }}
                    className="hover:text-[#22D3D5] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Direct WhatsApp */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5FAFF]">
              Contact & Channels
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#22D3D5] hover:underline font-medium"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>WhatsApp: {config.contact.whatsapp || '03060069993'}</span>
                </a>
              </li>
              {config.contact.email && (
                <li>
                  <a
                    href={`mailto:${config.contact.email}`}
                    className="hover:text-[#22D3D5] transition-colors"
                  >
                    {config.contact.email}
                  </a>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="text-[#B8C8D8] hover:text-[#22D3D5] transition-colors cursor-pointer"
                >
                  Clinic Application Form →
                </button>
              </li>
            </ul>

            {hasSocialLinks && (
              <div className="pt-2 flex flex-wrap gap-4 text-sm">
                {config.social.facebook && (
                  <a
                    href={config.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#22D3D5] transition-colors"
                  >
                    Facebook
                  </a>
                )}
                {config.social.instagram && (
                  <a
                    href={config.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#22D3D5] transition-colors"
                  >
                    Instagram
                  </a>
                )}
                {config.social.linkedin && (
                  <a
                    href={config.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#22D3D5] transition-colors"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Legal */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5FAFF]">
              Legal
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/privacy')}
                  className="hover:text-[#22D3D5] transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/terms')}
                  className="hover:text-[#22D3D5] transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/refund-policy')}
                  className="hover:text-[#22D3D5] transition-colors cursor-pointer"
                >
                  Refund & Cancellation
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8AA0B8]">
          <span>© {new Date().getFullYear()} Dent Propel. All rights reserved.</span>
          <span>Driving Dental Growth.</span>
        </div>
      </div>
    </footer>
  );
}
