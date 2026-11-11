import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import campusBg from '../../assets/uc.jpg';
import mascot from '../../assets/uc-tigers-mascot.gif';

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmptyHint, setShowEmptyHint] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setShowEmptyHint(true);
      return;
    }
    navigate(`/browse-found-items?q=${encodeURIComponent(query)}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (showEmptyHint) setShowEmptyHint(false);
  };

  return (
    <section className="relative overflow-hidden isolate pt-12 pb-24 md:pt-16 md:pb-32 lg:pt-20 lg:pb-36">
      <img src={campusBg} alt="University campus building" className="absolute inset-0 -z-30 h-full w-full object-cover object-[60%_center] md:object-center opacity-60 blur-[1px]" />
      <div aria-hidden="true" className="absolute inset-0 -z-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(15,23,42,0.6)_100%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none bg-gradient-to-r from-white/95 via-white/85 to-white/60 md:from-white/90 md:via-white/70 md:to-white/20" />
      <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-32 -z-10 pointer-events-none bg-gradient-to-t from-white to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 xl:gap-8 items-center">
          
          <div className="xl:col-span-7 flex flex-col space-y-6 text-left">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full text-xs font-semibold bg-blue-100/90 text-blue-900 border border-blue-200 shadow-sm backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              Official Campus Lost &amp; Found Portal
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0f172a] tracking-tight leading-[1.15]">
              Lost something on campus? We’ve got you covered.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Connect with fellow students, campus security, and faculty to report, track, and recover misplaced valuables in real time across all university halls.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button type="button" className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-150 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Report Lost Item
              </button>
              <button type="button" className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300/80 shadow-sm transition-all duration-150">
                Browse Found Catalog
              </button>
            </div>

            <div className="pt-2 max-w-xl">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center" noValidate>
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search for lost items (e.g., Student ID, MacBook, keys)..."
                  aria-invalid={showEmptyHint}
                  aria-describedby={showEmptyHint ? 'hero-search-hint' : undefined}
                  className={`w-full pl-10 pr-28 py-3.5 bg-white/95 backdrop-blur-sm border rounded-xl text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 transition ${
                    showEmptyHint
                      ? 'border-red-400 ring-2 ring-red-200 focus:ring-red-400 focus:border-red-400 animate-shake'
                      : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                <button type="submit" className="absolute right-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition">
                  Search
                </button>
              </form>

              {showEmptyHint && (
                <p id="hero-search-hint" role="alert" className="mt-2 text-xs font-medium text-red-600 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                  Type something to search, e.g. "keys" or "backpack".
                </p>
              )}

              <div className="flex items-center gap-2 mt-2.5 text-xs text-slate-500">
                <span className="font-medium text-slate-600">Trending:</span>
                <button type="button" className="hover:text-blue-600 underline">AirPods</button>
                <span>&bull;</span>
                <button type="button" className="hover:text-blue-600 underline">Water Bottle</button>
                <span>&bull;</span>
                <button type="button" className="hover:text-blue-600 underline">Student Card</button>
                <span>&bull;</span>
                <button type="button" className="hover:text-blue-600 underline">Calculator</button>
              </div>
            </div>
          </div>

          <div className="hidden xl:flex xl:col-span-5 justify-center xl:justify-end mt-8 xl:mt-0">
            <div className="relative w-full max-w-[260px] sm:max-w-sm lg:max-w-md flex justify-center items-center">
              <div className="absolute -top-3 left-0 sm:-top-2 sm:-left-2 z-10 bg-white rounded-2xl px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-md border border-blue-50 select-none flex items-center gap-1.5 pointer-events-none">
                <span>Lost something? I&apos;ll help!</span>
                <div className="absolute -bottom-1 left-4 w-2 h-2 bg-white rotate-45 border-r border-b border-blue-50" />
              </div>
              <img src={mascot} alt="UC Tigers mascot waving" draggable={false} className="w-full max-w-[260px] sm:max-w-sm lg:max-w-md h-auto select-none drop-shadow-2xl [filter:drop-shadow(0_20px_30px_rgba(15,23,42,0.25))] transition duration-300 hover:scale-105" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
