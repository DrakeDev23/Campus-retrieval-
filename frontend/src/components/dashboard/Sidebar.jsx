import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  PackagePlus,
  Search,
  FileText,
  PackageCheck,
  Clock,
  Bell,
  Settings,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  LogOut,
  X,
} from './icons';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'report-lost', label: 'Report Lost Item', icon: PlusCircle, isAction: true },
  { id: 'report-found', label: 'Report Found Item', icon: PackagePlus, isAction: true },
  { id: 'browse', label: 'Browse Campus Items', icon: Search, isLink: '/browse-found-items' },
  { id: 'my-lost-reports', label: 'My Lost Reports', icon: FileText },
  { id: 'my-found-reports', label: 'My Found Reports', icon: PackageCheck },
  { id: 'claims-tracking', label: 'My Claims & Tracking', icon: Clock },
  { id: 'notifications', label: 'Notifications', icon: Bell, badgeCount: 2 },
  { id: 'settings', label: 'Profile & Settings', icon: Settings },
];

export default function Sidebar({
  activeTab,
  onSelectTab,
  profile,
  unreadCount = 2,
  mobileOpen = false,
  onCloseMobile,
  onOpenReportLost,
  onOpenReportFound,
}) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleNavClick = (item) => {
    if (onCloseMobile) onCloseMobile();
    if (item.isLink) {
      navigate(item.isLink);
      return;
    }
    if (item.id === 'report-lost') {
      if (onOpenReportLost) onOpenReportLost();
      return;
    }
    if (item.id === 'report-found') {
      if (onOpenReportFound) onOpenReportFound();
      return;
    }
    onSelectTab(item.id);
  };

  const displayName = profile?.fullName || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Jane G. Doe');
  const displayId = profile?.studentId || user?.studentId || '2024-08912';
  const displayCourse = profile?.course || 'BS Computer Science • 3rd Year';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'ST';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-72 select-none">
      {/* Top Brand & User Profile */}
      <div className="p-5 border-b border-slate-200/80">
        <div className="flex items-center justify-between mb-5">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs font-bold text-base transition group-hover:bg-blue-700">
              CR
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold text-slate-900 tracking-tight">
                Campus<span className="text-blue-600">Retrieval</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                Student Portal
              </span>
            </div>
          </Link>

          {mobileOpen && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Profile Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {initials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-900 truncate">{displayName}</h3>
            </div>
            <p className="text-xs font-medium text-slate-500 truncate">ID: {displayId}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified Student
              </span>
            </div>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-400 px-1 truncate">{displayCourse}</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badgeCount && unreadCount > 0 && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section - Campus Lost & Found Office Info */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70 text-xs text-slate-600 space-y-3">
        <div className="flex items-start gap-2.5">
          <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-xs">Lost &amp; Found Office</p>
            <p className="text-[11px] text-slate-500">Administration Hall, Rm 102</p>
            <p className="text-[10px] text-slate-400">Mon–Fri: 8:30 AM – 5:00 PM</p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>0912-345-6789</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30 w-72">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 flex-1 flex max-w-xs w-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
