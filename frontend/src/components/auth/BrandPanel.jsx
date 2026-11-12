import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from './icons';

export default function BrandPanel() {
  return (
    <aside className="hidden flex-col md:flex justify-between bg-blue-800 px-6 py-8 text-white sm:px-10 sm:py-10 lg:w-5/12 lg:px-12 lg:py-14">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-800"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-blue-900">
            <Search className="h-6 w-6" />
          </span>
          <span className="text-xl font-bold tracking-tight">
            Campus<span className="text-yellow-400">Retrieval</span>
          </span>
        </Link>

        <div className="mt-8 lg:mt-20">
          <span className="mb-5 block h-1 w-12 rounded-full bg-yellow-400" aria-hidden="true" />
          <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
            Lost something? Find your way back to it.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-blue-100 sm:text-base">
            Campus Retrieval helps students report, discover, and retrieve lost belongings within the campus, all in one
            trusted place.
          </p>
        </div>
      </div>

      <div className="pt-8">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 rounded-lg text-sm font-medium text-blue-200 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          aria-label="Back to landing page"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700/60 text-blue-200 transition group-hover:bg-blue-700 group-hover:text-white">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </span>
          <span>Back to Landing Page</span>
        </Link>
      </div>
    </aside>
  );
}
