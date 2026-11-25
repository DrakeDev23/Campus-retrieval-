import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../landingPage/Navbar';
import Footer from '../landingPage/Footer';
import ScrollToTop from './ScrollToTop';

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
