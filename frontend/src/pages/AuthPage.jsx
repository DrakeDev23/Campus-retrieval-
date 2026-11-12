import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import BrandPanel from '../components/auth/BrandPanel';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { ArrowLeft, Lock, Search } from '../components/auth/icons';

const MODES = [
  { id: 'login', label: 'Sign In' },
  { id: 'register', label: 'Register' },
];

export default function AuthPage({ initialMode }) {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const getTargetMode = () => {
    if (initialMode === 'register' || initialMode === 'login') return initialMode;
    const q = searchParams.get('mode');
    if (q === 'register' || q === 'login') return q;
    if (location.pathname === '/register') return 'register';
    return 'login';
  };

  const [mode, setMode] = useState(getTargetMode);
  const panelRef = useRef(null);
  const firstRender = useRef(true);

  useEffect(() => {
    const target = getTargetMode();
    setMode(target);
  }, [initialMode, location.pathname, searchParams]);

  useEffect(() => {
    document.title = mode === 'login' ? 'Sign In | Campus Retrieval' : 'Register | Campus Retrieval';
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    panelRef.current?.focus();
  }, [mode]);

  const switchTo = (next) => () => setMode(next);

  return (
    <main className="min-h-screen bg-white">
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <BrandPanel />

        <section className="flex flex-1 flex-col justify-center overflow-y-auto px-6 py-10 sm:px-10 lg:px-16 lg:py-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6">
              <Link
                to="/"
                className="group inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-600 transition hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                aria-label="Back to landing page"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition group-hover:border-blue-300 group-hover:bg-blue-50 group-hover:text-blue-700">
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                </span>
                <span>Back to Landing Page</span>
              </Link>
            </div>

            <Link to="/" className="mb-8 flex items-center justify-center gap-2.5 md:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-yellow-400">
                <Search className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Campus<span className="text-blue-700">Retrieval</span>
              </span>
            </Link>
            <div
              role="tablist"
              aria-label="Authentication mode"
              className="mb-8 grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1"
            >
              {MODES.map(({ id, label }) => {
                const active = mode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    id={`tab-${id}`}
                    aria-selected={active}
                    aria-controls="auth-panel"
                    tabIndex={active ? 0 : -1}
                    onClick={switchTo(id)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                        e.preventDefault();
                        setMode(id === 'login' ? 'register' : 'login');
                        document.getElementById(`tab-${id === 'login' ? 'register' : 'login'}`)?.focus();
                      }
                    }}
                    className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      active ? 'bg-white text-blue-800 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {label}
                    {active && (
                      <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-yellow-400" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>

            <div
              id="auth-panel"
              role="tabpanel"
              aria-labelledby={`tab-${mode}`}
              tabIndex={-1}
              ref={panelRef}
              className="focus:outline-none"
            >
              {mode === 'login' ? (
                <LoginForm key="login" onSwitchMode={switchTo('register')} />
              ) : (
                <RegisterForm key="register" onSwitchMode={switchTo('login')} />
              )}
            </div>

            <p className="mt-8 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-xs text-slate-500">
              <Lock className="h-4 w-4 text-blue-700" />
              University community members only.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
