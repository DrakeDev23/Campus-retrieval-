import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../landingPage/Navbar';
import Footer from '../landingPage/Footer';
import ScrollToTop from './ScrollToTop';

/**
 * Shared application shell. The navbar and footer render on every route
 * so they stay sticky and persistent while only the page content swaps.
 */
export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
