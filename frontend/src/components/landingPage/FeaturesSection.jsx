import React from 'react';
import campusBg from '../../assets/uc.jpg';

export default function FeaturesSection() {
  const features = [
    {
      title: 'Secure Custody Vault',
      desc: 'All turned-in items are stored in climate-controlled security vaults under 24/7 CCTV surveillance until authorized claim.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      ),
    },
    {
      title: 'Anti-Fraud Ownership Checks',
      desc: 'Serial numbers and distinctive hallmarks are hidden from public browse views, requiring claimants to verify specific private proofs.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-2.48-5.748A9.01 9.01 0 0012 3a9 9 0 109 9c0-.497-.04-1.01-.122-1.503" />
        </svg>
      ),
    },
    {
      title: 'Live 6-Stage Tracking',
      desc: 'Continuous real-time status updates through intake, documentation, owner notification, review, and final secure handover.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.25 2.25L15 6" />
        </svg>
      ),
    },
    {
      title: 'Permanent Audit Trail',
      desc: 'Every intake record, status transition, and retrieval pickup is digitally logged to guarantee institutional compliance.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 sm:p-12 lg:p-14 shadow-2xl border border-blue-900/40">
      <img src={campusBg} alt="University campus interior texture" className="absolute inset-0 h-full w-full rounded-3xl object-cover opacity-10 mix-blend-overlay pointer-events-none" />

      <div className="relative z-10 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 shadow-sm mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          OFFICIAL UNIVERSITY STANDARD
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
          Why Our Centralized Retrieval System Works
        </h2>

        <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
          CampusRetrieval eliminates decentralized bulletin boards and informal lost-and-found boxes with an institutional, verifiable pipeline that protects personal data and expedites reunification.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-10">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 flex items-center justify-center shrink-0">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {feature.title}
                </h3>
                <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
