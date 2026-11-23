import React from 'react';
import { AudienceSection } from '../components/AudienceSection';
import { BentoServicesSection } from '../components/BentoServicesSection';
import { FAQSection } from '../components/FAQSection';
import { FinalCTASection } from '../components/FinalCTASection';
import { GrowthSystemSection } from '../components/GrowthSystemSection';
import { HeroSection } from '../components/HeroSection';
import { OfferSection } from '../components/OfferSection';

export function LandingPage() {
  return (
    <main>
      <HeroSection />
      <GrowthSystemSection />
      <BentoServicesSection />
      <AudienceSection />
      <OfferSection />
      <FAQSection />
      <FinalCTASection />
    </main>
  );
}

