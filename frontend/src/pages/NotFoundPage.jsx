import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center max-w-md">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md">
          404
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-base text-slate-600 leading-relaxed">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}
