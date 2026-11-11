import React from 'react';
import { Link } from 'react-router-dom';
import campusBg from '../../assets/uc.jpg';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden isolate border-t border-slate-200 mt-auto pt-14 pb-8 px-4 sm:px-6 lg:px-8">
      <img src={campusBg} alt="University campus footer texture" className="absolute inset-0 -z-30 h-full w-full object-cover object-bottom opacity-15 grayscale" />
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-gradient-to-b from-white via-white/90 to-slate-50" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(15,23,42,0.08)_100%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Campus<span className="text-blue-600">Retrieval</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-sm">
              Centralized lost-and-found custody platform for students, faculty, and campus staff.
            </p>
            <div className="mt-4 text-xs text-slate-500 leading-relaxed space-y-0.5">
              <p>Administration Hall, Room 102</p>
              <p>Central University Campus</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              PUBLIC PORTAL
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li><Link to="/" className="transition hover:text-blue-700">Home</Link></li>
              <li><Link to="/browse-found-items" className="transition hover:text-blue-700">Browse Found Items</Link></li>
              <li><Link to="/how-it-works" className="transition hover:text-blue-700">How It Works</Link></li>
              <li><a href="#report-lost" className="transition hover:text-blue-700">Report a Lost Item</a></li>
              <li><a href="#report-found" className="transition hover:text-blue-700">Report a Found Item</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              CUSTODY DESK CONTACTS
            </h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p><span className="text-slate-400 font-normal">Office Desk:</span> <span className="font-medium text-slate-700">09123456789</span></p>
              <p><span className="text-slate-400 font-normal">Public Safety Dispatch:</span> <span className="font-medium text-slate-700">Ext. 4402</span></p>
              <p><span className="text-slate-400 font-normal">Email:</span> <a href="mailto:UCcustody@gmail.com" className="font-medium text-blue-600 hover:underline">UCcustody@gmail.com</a></p>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Vault Hours: Mon-Fri 8:30 AM - 5:00 PM
              </span>
            </div>
          </div>

        </div>

        <div className="my-8 border-t border-slate-200/80" />

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between items-center text-xs text-slate-500 text-center sm:text-left">
          <p>&copy; 2026 University Custody Services. All rights reserved.</p>
          <p>Strict Ownership Confidentiality Protected &bull; FERPA &amp; Student Privacy Compliant</p>
        </div>
      </div>
    </footer>
  );
}
