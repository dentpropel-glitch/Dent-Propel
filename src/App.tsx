import React, { useState } from 'react';
import { MotionConfig } from 'motion/react';
import { CinematicIntro } from './components/CinematicIntro';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { Footer } from './components/Footer';
import { GeminiChatWidget } from './components/GeminiChatWidget';
import { ScrollProgressRail } from './components/MotionPrimitives';
import { Navbar } from './components/Navbar';
import { FunnelProvider, useFunnel } from './context/FunnelContext';
import { ThemeProvider } from './context/ThemeContext';
import { CheckoutPage } from './pages/CheckoutPage';
import { LandingPage } from './pages/LandingPage';
import { LegalPage } from './pages/LegalPage';
import { ThankYouPage } from './pages/ThankYouPage';

function FunnelRouter() {
  const { route } = useFunnel();
  const [initialRoute] = useState(route);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--dp-bg)] text-[var(--dp-text)]">
      <CinematicIntro initialRoute={initialRoute} />
      <ScrollProgressRail />
      <Navbar />
      <div className="flex-1">
        {route === '/' && <LandingPage />}
        {route === '/checkout' && <CheckoutPage />}
        {route === '/thank-you' && <ThankYouPage />}
        {route === '/privacy' && <LegalPage type="privacy" />}
        {route === '/terms' && <LegalPage type="terms" />}
        {route === '/refund-policy' && <LegalPage type="refund" />}
      </div>
      <Footer />
      <GeminiChatWidget />
      <FloatingWhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <FunnelProvider>
          <FunnelRouter />
        </FunnelProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
