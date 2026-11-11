import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import campusBg from '../../assets/uc.jpg';
import ItemCard from '../common/ItemCard';

export default function RecentFoundSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollPosition = container.scrollLeft;
    const children = Array.from(container.children);
    if (!children.length) return;

    let closestIndex = 0;
    let minDiff = Infinity;
    children.forEach((child, idx) => {
      const diff = Math.abs(child.offsetLeft - container.offsetLeft - scrollPosition);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });
    setCurrentIndex(closestIndex);
  };

  const scrollToIndex = (index) => {
    if (!scrollRef.current) return;
    const targetChild = scrollRef.current.children[index];
    if (targetChild) {
      targetChild.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
      setCurrentIndex(index);
    }
  };

  const items = [
    {
      category: 'Electronics',
      status: 'Verification Required',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
      title: 'MacBook Air 13" M2',
      description: 'Space Gray laptop found inside neoprene sleeve on the 2nd floor silent study carrels.',
      foundTime: 'Today, 10:15 AM',
      location: 'Main Library, 2nd Floor',
      custody: 'Campus Security Hub',
      custodyColor: 'text-blue-600',
      buttonType: 'claim',
    },
    {
      category: 'Audio',
      status: 'In Custody',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
      title: 'Sony WH-1000XM4 Headphones',
      description: 'Black over-ear wireless headphones with original carrying case and auxiliary cable.',
      foundTime: 'Today, 08:40 AM',
      location: 'Student Center Cafeteria',
      custody: 'Locker #04 (Self-Service)',
      custodyColor: 'text-blue-600',
      buttonType: 'claim',
    },
    {
      category: 'Identification',
      status: 'Retrieval Authorized',
      statusColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      title: 'Student ID & Keycard Lanyard',
      description: 'University branded navy lanyard holding magnetic dorm keycard and dining access badge.',
      foundTime: 'Yesterday, 04:20 PM',
      location: 'Science & Tech Quad',
      custody: 'Registrar Front Desk',
      custodyColor: 'text-blue-600',
      buttonType: 'claim',
    },
    {
      category: 'Personal Gear',
      status: 'Verification Required',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
      title: 'North Face Recon Backpack',
      description: 'Charcoal gray backpack containing notebooks, binders, and a graphite mechanical pencil set.',
      foundTime: 'Yesterday, 02:15 PM',
      location: 'Gymnasium Bleachers',
      custody: 'Athletics Equipment Desk',
      custodyColor: 'text-blue-600',
      buttonType: 'claim',
    },
    {
      category: 'Academics',
      status: 'In Custody',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
      title: 'TI-84 Plus CE Calculator',
      description: 'White graphing calculator with protective slide cover, found on lecture hall desk.',
      foundTime: 'Nov 09, 11:30 AM',
      location: 'Math & Sciences Bldg 102',
      custody: 'Locker #09 (Self-Service)',
      custodyColor: 'text-blue-600',
      buttonType: 'claim',
    },
    {
      category: 'Accessories',
      status: 'Retrieved',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      title: 'Car Key Fob & House Keys',
      description: 'Honda key fob on brass carabiner with two silver door keys and leather tag.',
      foundTime: 'Nov 08, 05:00 PM',
      location: 'West Campus Parking Lot B',
      custody: 'Reunited with Owner',
      custodyColor: 'text-emerald-600',
      buttonType: 'closed',
    },
  ];

  return (
    <section id="browse" className="relative overflow-hidden isolate py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
      <img src={campusBg} alt="University campus background texture" className="absolute inset-0 -z-30 h-full w-full object-cover object-center opacity-15 grayscale" />
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-gradient-to-b from-slate-50 via-white/85 to-slate-50" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(15,23,42,0.10)_100%)]" />
      <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-20 -z-10 pointer-events-none bg-gradient-to-t from-white to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              CURRENT CAMPUS INVENTORY
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight mt-1">
              Recently Found on Campus
            </h2>
            <p className="mt-2 text-base text-slate-600 max-w-xl">
              Browse authenticated property held by campus custody pending rightful ownership claims.
            </p>
          </div>
          <Link to="/browse-found-items" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition self-start sm:self-end shrink-0 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
            <span>View All Found Items ({items.length})</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="sm:hidden">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 shadow-xs">
              <svg className="w-3.5 h-3.5 text-blue-600 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5 3 12m0 0 4.5 4.5M3 12h18m-4.5-4.5L21 12m0 0-4.5 4.5" />
              </svg>
              <span>Swipe left or right</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {currentIndex + 1} of {items.length}
            </div>
          </div>

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 pb-2 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((item) => (
              <div key={item.title} className="w-full shrink-0 snap-center">
                <ItemCard item={item} />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-5">
            {items.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToIndex(idx)}
                aria-label={`Go to item ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => <ItemCard key={item.title} item={item} />)}
        </div>
      </div>
    </section>
  );
}
