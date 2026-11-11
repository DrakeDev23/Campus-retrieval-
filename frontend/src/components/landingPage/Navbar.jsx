import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/browse-found-items', label: 'Browse Found Items' },
  { to: '/how-it-works', label: 'How It Works' },
];

const FOCUS_RING = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';

const desktopLinkClasses = ({ isActive }) =>
  [
    'px-4 py-2 rounded-full text-sm transition-colors',
    FOCUS_RING,
    isActive
      ? 'font-semibold text-blue-700 bg-blue-50'
      : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50',
  ].join(' ');

const mobileLinkClasses = ({ isActive }) =>
  [
    'block rounded-lg px-3 py-2 text-base transition-colors',
    FOCUS_RING,
    isActive
      ? 'font-semibold text-blue-700 bg-blue-50'
      : 'font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50',
  ].join(' ');

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className={`flex items-center gap-3 rounded-lg ${FOCUS_RING}`}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Campus<span className="text-blue-600">Retrieval</span>
              </span>
              <span className="text-[11px] font-medium text-slate-400 tracking-wide">
                Lost-and-Found Retrieval System
              </span>
            </div>
          </NavLink>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={desktopLinkClasses}>
                {link.label}
              </NavLink>
            ))}
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
        <div className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 pt-3 pb-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={mobileLinkClasses}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
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
