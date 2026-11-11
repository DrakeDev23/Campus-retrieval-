import React from 'react';
import campusBg from '../assets/uc.jpg';
import Breadcrumb from '../components/common/Breadcrumb';
import HowItWorksSection from '../components/landingPage/HowItWorksSection';

export default function HowItWorksPage() {
  return (
    <section className="relative overflow-hidden isolate pt-8 pb-24 px-4 sm:px-6 lg:px-8">
      <img src={campusBg} alt="University campus background texture" className="absolute inset-0 -z-30 h-full w-full object-cover object-center opacity-20 grayscale-[30%]" />
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-white/80" />
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-gradient-to-b from-white via-white/60 to-slate-50" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(15,23,42,0.12)_100%)]" />
      <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-24 -z-10 pointer-events-none bg-gradient-to-t from-slate-50 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-8">
          <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'How It Works' }]} />
        </div>
        <HowItWorksSection />
      </div>
    </section>
  );
}
