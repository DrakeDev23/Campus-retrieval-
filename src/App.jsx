import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Campus Lost-and-Found Retrieval System
      </h1>
      <p className="text-gray-600 max-w-md mb-6">
        Frontend application foundation successfully initialized with React, Vite, React Router, TanStack Query, and Tailwind CSS.
      </p>
      <div className="inline-flex gap-4">
        <Link
          to="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Home
        </Link>
        <Link
          to="/about"
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
        >
          About Foundation
        </Link>
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">About Application Shell</h2>
      <p className="text-gray-600 max-w-md mb-6">
        This is an architectural placeholder routing shell. Full domain features will be implemented in subsequent phases.
      </p>
      <Link
        to="/"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Back to Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="font-semibold text-lg text-gray-800">Campus Retrieval</span>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
            Phase 1B Foundation
          </span>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        Campus Lost-and-Found System &copy; 2026
      </footer>
    </div>
  );
}
