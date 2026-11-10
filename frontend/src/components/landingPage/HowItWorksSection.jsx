import React from 'react';

export default function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Report or Turn In',
      desc: 'Submit an instant lost item report or turn in a found article at any campus desk or smart drop-off locker.',
      footer: 'Step 1 • Instant Submission',
    },
    {
      step: '02',
      title: 'Custody & Cataloging',
      desc: 'Campus Security tags, photographs, and safely inventories the item into the CampusRetrieval database.',
      footer: 'Step 2 • Secure Storage',
    },
    {
      step: '03',
      title: 'Ownership Verification',
      desc: 'Verify claim with unique identifiers, student credential match, lock code, or matching description.',
      footer: 'Step 3 • Fraud Prevention',
    },
    {
      step: '04',
      title: 'Authorized Handover',
      desc: 'Collect your possession directly at the designated campus hub or via a contactless smart locker PIN.',
      footer: 'Step 4 • Successful Reunion',
    },
  ];

  return (
    <div id="how-it-works">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300 shadow-sm mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
          Verified Campus Recovery Pipeline
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
          How Item Retrieval Works
        </h2>

        <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          A secure, transparent protocol ensuring lost possessions safely find their way back to verified owners across campus.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {steps.map((item) => (
          <div
            key={item.step}
            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 font-extrabold text-sm flex items-center justify-center mb-4">
                {item.step}
              </div>
              <h3 className="text-base font-bold text-[#0f172a]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-medium text-slate-400">
              {item.footer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
