import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, Menu, Search, LogOut, ShieldCheck, ChevronRight } from './icons';

export default function Header({
  onOpenMobile,
  unreadCount = 2,
  onOpenNotifications,
  semester = 'AY 2026–2027 • 1st Semester',
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const studentName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Jane G. Doe';
  const studentId = user?.studentId || '2024-08912';
  const initials = studentName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'ST';

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Trigger + Semester Badge */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobile}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="hidden sm:inline">Active Term:</span>
            <span>{semester}</span>
          </div>
        </div>

        {/* Right: Actions, Notifications & Profile Menu */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <Link
            to="/browse-found-items"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Public Catalog</span>
          </Link>

          {/* Notifications Trigger */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            aria-label={`View notifications (${unreadCount} unread)`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* User Quick Info */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 -mr-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              aria-expanded={userMenuOpen}
              aria-label="User profile menu"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                {initials}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-slate-900 truncate max-w-[130px]">{studentName}</span>
                <span className="text-[10px] text-slate-400">{studentId}</span>
              </div>
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setUserMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl border border-slate-200 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{studentName}</p>
                    <p className="text-[11px] text-slate-500 truncate">ID: {studentId}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Student Account
                    </span>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <span>Return to Landing Page</span>
                    </Link>
                    <Link
                      to="/browse-found-items"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <span>Browse Campus Items</span>
                    </Link>
                  </div>
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
