import React, { useState } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Campus<span className="text-blue-600">Retrieval</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">Home</a>
            <a href="#browse" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Browse Found Items</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">How It Works</a>
          </div>

          <div className="hidden lg:flex items-center space-x-3">
            <button type="button" className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 hover:bg-slate-50 rounded-lg transition shadow-sm">Report Lost</button>
            <button type="button" className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 hover:bg-slate-50 rounded-lg transition shadow-sm">Report Found</button>
            <button type="button" className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 transition">Sign In</button>
          </div>

          <div className="flex md:hidden">
            <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none" aria-label="Toggle navigation menu">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 pt-3 pb-4 space-y-3">
          <a href="#home" className="block text-base font-semibold text-blue-600">Home</a>
          <a href="#browse" className="block text-base font-medium text-slate-700 hover:text-slate-900">Browse Found Items</a>
          <a href="#how-it-works" className="block text-base font-medium text-slate-700 hover:text-slate-900">How It Works</a>
          <div className="pt-2 flex flex-col gap-2">
            <button className="w-full text-center py-2 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition">Report Lost</button>
            <button className="w-full text-center py-2 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition">Report Found</button>
            <button className="w-full text-center py-2 px-4 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold">Sign In</button>
          </div>
        </div>
      )}
    </nav>
  );
}
