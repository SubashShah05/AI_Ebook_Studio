import React, { useEffect } from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import TrustSection from '../components/landing/TrustSection';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import ProductPreview from '../components/landing/ProductPreview';
import Pricing from '../components/landing/Pricing';
import Testimonials from '../components/landing/Testimonials';
import FAQ from '../components/landing/FAQ';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  // Simple smooth scroll handling for hash links if they don't work natively
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    
    // Add smooth scroll style to html on mount
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Handle initial hash
    if (window.location.hash) {
      setTimeout(handleHashChange, 100);
    }
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white flex flex-col font-sans overflow-x-hidden transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <TrustSection />
        <Features />
        <HowItWorks />
        <ProductPreview />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
