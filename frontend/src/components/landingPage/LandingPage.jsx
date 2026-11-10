import React from 'react';
import campusBg from '../../assets/uc.jpg';
import Navbar from './Navbar';
import Hero from './Hero';
import StatsSection from './StatsSection';
import HowItWorksSection from './HowItWorksSection';
import RecentFoundSection from './RecentFoundSection';
import FeaturesSection from './FeaturesSection';
import FaqSection from './FaqSection';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        <Hero />

        <section className="relative overflow-hidden isolate pt-12 pb-24 px-4 sm:px-6 lg:px-8">
          <img src={campusBg} alt="University campus background texture" className="absolute inset-0 -z-30 h-full w-full object-cover object-center opacity-20 grayscale-[30%]" />
          <div aria-hidden="true" className="absolute inset-0 -z-20 bg-white/80" />
          <div aria-hidden="true" className="absolute inset-0 -z-20 bg-gradient-to-b from-white via-white/60 to-slate-50" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(15,23,42,0.12)_100%)]" />
          <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-24 -z-10 pointer-events-none bg-gradient-to-t from-slate-50 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto space-y-20">
            <StatsSection />
            <HowItWorksSection />
          </div>
        </section>

        <RecentFoundSection />

        <section className="relative overflow-hidden isolate py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          <img src={campusBg} alt="University campus background texture" className="absolute inset-0 -z-30 h-full w-full object-cover object-center opacity-15 grayscale" />
          <div aria-hidden="true" className="absolute inset-0 -z-20 bg-gradient-to-b from-slate-50 via-white/85 to-white" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(15,23,42,0.10)_100%)]" />

          <div className="relative z-10 max-w-7xl mx-auto space-y-20">
            <FeaturesSection />
            <FaqSection />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
