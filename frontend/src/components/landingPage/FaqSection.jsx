import React, { useState } from 'react';

export default function FaqSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const faqItems = [
    {
      q: 'How do I verify that a listed item belongs to me?',
      a: 'During the claim process, you will be prompted to provide distinctive identifying marks that are intentionally withheld from public display—such as serial numbers, unique engravings, lock screen wallpapers, or specific case hallmarks, along with your official university ID.',
    },
    {
      q: 'Where can I drop off an item I found on campus?',
      a: 'You can hand in found possessions at any Campus Security Help Desk, university library circulation counter, or deposit them into any 24/7 contactless CampusRetrieval smart drop locker located throughout campus halls.',
    },
    {
      q: 'How long are unclaimed items kept in custody?',
      a: 'In accordance with official university regulations, items are held securely in the centralized campus vault for 60 calendar days. After this holding period, unclaimed non-sensitive items may be donated to student aid programs.',
    },
    {
      q: 'Is there any fee or charge to claim my lost property?',
      a: 'No. CampusRetrieval is a 100% free institutional service operated jointly by Campus Security and Student Affairs for all registered students, faculty, and university campus visitors.',
    },
    {
      q: 'How does the smart locker pickup process work?',
      a: 'Once your ownership claim is verified and approved by security personnel, you will receive a single-use encrypted QR code and 6-digit PIN via SMS and email. Scan or enter your credentials at your assigned locker station for instant contactless pickup.',
    },
  ];

  return (
    <div>
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Find clear answers to common questions about lost reports, security intake, claim approvals, and smart locker pickup.
        </p>
      </div>

      <div className="space-y-4 max-w-3xl mx-auto mt-10">
        {faqItems.map((item, index) => {
          const isOpen = openFaqIndex === index;
          return (
            <div
              key={item.q}
              className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm transition hover:shadow-md hover:border-blue-200 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between p-5 text-left text-base font-bold text-[#0f172a] focus-visible:ring-2 ring-blue-500 focus:outline-none transition-colors"
              >
                <span className="pr-4">{item.q}</span>
                <svg
                  className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <div
                className={`grid transition-all duration-200 ease-in-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-1">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
