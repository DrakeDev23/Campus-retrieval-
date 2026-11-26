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
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  QrCode,
} from './icons';

export const STUDENT_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'report-lost', label: 'Report Lost Item', icon: PlusCircle, isAction: true },
  { id: 'report-found', label: 'Report Found Item', icon: PackagePlus, isAction: true },
  { id: 'browse', label: 'Browse Campus Items', icon: Search },
  { id: 'my-lost-reports', label: 'My Lost Reports', icon: FileText },
  { id: 'my-found-reports', label: 'My Found Reports', icon: PackageCheck },
  { id: 'claims-tracking', label: 'My Claims & Tracking', icon: Clock },
  { id: 'settings', label: 'Profile & Settings', icon: Settings },
];

export const ADMIN_NAV_ITEMS = [
  { id: 'admin-claims', label: 'Claims Verification', icon: ShieldCheck, isLink: '/admin' },
  { id: 'admin-verify-pass', label: 'Scan & Verify Pass', icon: QrCode, isLink: '/admin/verify-pass' },
  { id: 'admin-items', label: 'Found Items Custody', icon: PackageCheck, isLink: '/admin?tab=items' },
  { id: 'admin-browse', label: 'Browse Public Catalog', icon: Search, isLink: '/admin/catalog' },
];

export const NAV_ITEMS = STUDENT_NAV_ITEMS;

export default function Sidebar({
  isOpen = true,
  onToggle,
  onOpen,
  onClose,
  activeTab,
  onSelectTab,
  profile,
  unreadCount = 2,
  messageUnreadCount = 0,
  mobileOpen,
  onCloseMobile,
  onOpenReportLost,
  onOpenReportFound,
  mode = 'student',
}) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const isSidebarOpen = typeof mobileOpen !== 'undefined' ? mobileOpen : isOpen;
  const handleToggle = onToggle || onClose || onCloseMobile;
  const handleClose = onClose || onCloseMobile;
  const handleOpen = onOpen || onToggle;

  const currentNavItems = mode === 'admin' ? ADMIN_NAV_ITEMS : STUDENT_NAV_ITEMS;

  const handleNavClick = (item) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      if (handleClose) handleClose();
    }
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
    if (onSelectTab) onSelectTab(item.id);
  };

  const handleCollapsedNavClick = (item) => {
    if (handleOpen) handleOpen();
    handleNavClick(item);
  };

  const displayName =
    profile?.fullName ||
    user?.fullName ||
    (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : mode === 'admin' ? 'Officer R. Santos' : 'Jane G. Doe');

  const displayId = profile?.studentId || user?.studentId || (mode === 'admin' ? 'ADMIN-SEC-402' : '2024-08912');
  const roleBadge =
    profile?.badge ||
    user?.badge ||
    (mode === 'admin' || user?.role === 'admin' ? 'Security Desk Administrator' : 'Verified Student');

  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase() || (mode === 'admin' ? 'AD' : 'ST');

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const profileFooter = (
    <div className="p-3.5 border-t border-slate-200 bg-slate-50/80 text-xs space-y-2">
      <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative shrink-0">
              <div
                className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-xs shadow-xs ${
                  mode === 'admin' ? 'bg-yellow-400 text-slate-950 font-extrabold' : 'bg-blue-600 text-white'
                }`}
              >
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-slate-900 truncate leading-tight">
                {displayName}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono truncate">{displayId}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer shrink-0"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              mode === 'admin'
                ? 'text-yellow-900 bg-yellow-100/80 border-yellow-300'
                : 'text-emerald-800 bg-emerald-50/90 border-emerald-200'
            }`}
          >
            <ShieldCheck className={`w-3 h-3 ${mode === 'admin' ? 'text-yellow-700' : 'text-emerald-600'}`} />
            <span>{roleBadge}</span>
          </span>
        </div>
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-72 select-none">
      <div className="p-5 border-b border-slate-200/80">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-xs font-bold text-base transition ${
                mode === 'admin' ? 'bg-yellow-400 text-slate-950 group-hover:bg-yellow-300' : 'bg-blue-600 text-white group-hover:bg-blue-700'
              }`}
            >
              {mode === 'admin' ? 'AD' : 'CR'}
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold text-slate-900 tracking-tight">
                Campus<span className={mode === 'admin' ? 'text-yellow-600' : 'text-blue-600'}>Retrieval</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                {mode === 'admin' ? 'Admin Verification' : 'Student Portal'}
              </span>
            </div>
          </Link>

          {handleToggle && (
            <button
              type="button"
              onClick={handleToggle}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {mode === 'admin' ? 'Administrator Controls' : 'Navigation'}
        </p>
        {currentNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                isActive
                  ? mode === 'admin'
                    ? 'bg-yellow-400 text-slate-950 font-bold shadow-xs'
                    : 'bg-blue-600 text-white shadow-xs'
                  : item.isAction
                  ? 'text-blue-700 bg-blue-50/60 hover:bg-blue-100/70'
                  : mode === 'admin'
                  ? 'text-slate-600 hover:text-yellow-950 hover:bg-yellow-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? (mode === 'admin' ? 'text-slate-950' : 'text-white') : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {messageUnreadCount > 0 && (item.id === 'claims-tracking' || item.id === 'admin-claims') ? (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? mode === 'admin'
                        ? 'bg-slate-950 text-yellow-300'
                        : 'bg-white text-blue-700'
                      : mode === 'admin'
                      ? 'bg-yellow-400 text-slate-950'
                      : 'bg-blue-600 text-white'
                  }`}
                  title={`${messageUnreadCount} unread message(s)`}
                >
                  {messageUnreadCount}
                </span>
              ) : item.badgeCount && unreadCount > 0 ? (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {unreadCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {profileFooter}
    </div>
  );

  const collapsedContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-20 select-none items-center py-4 justify-between transition-all duration-300">
      <div className="flex flex-col items-center gap-3 w-full px-2 pb-4 border-b border-slate-200/80">
        <Link
          to="/"
          className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-xs font-bold text-base transition ${
            mode === 'admin' ? 'bg-yellow-400 text-slate-950 hover:bg-yellow-300 font-extrabold' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          title={mode === 'admin' ? 'CampusRetrieval Admin Portal' : 'CampusRetrieval Student Portal'}
        >
          {mode === 'admin' ? 'AD' : 'CR'}
        </Link>

        {handleToggle && (
          <button
            type="button"
            onClick={handleToggle}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 space-y-1.5 w-full flex flex-col items-center px-2">
        {currentNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleCollapsedNavClick(item)}
              title={`${item.label} (Click to open)`}
              className={`w-11 h-11 flex items-center justify-center rounded-xl text-xs font-semibold transition cursor-pointer relative ${
                isActive
                  ? mode === 'admin'
                    ? 'bg-yellow-400 text-slate-950 font-bold shadow-xs'
                    : 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {messageUnreadCount > 0 && (item.id === 'claims-tracking' || item.id === 'admin-claims') && (
                <span className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-xs font-bold flex items-center justify-center border-2 border-white ${
                  mode === 'admin' ? 'bg-slate-950 text-yellow-300' : 'bg-blue-600 text-white'
                }`}>
                  {messageUnreadCount > 9 ? '9+' : messageUnreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="pt-3 border-t border-slate-200/80 w-full flex flex-col items-center gap-2.5 px-2">
        <div
          onClick={handleOpen}
          className="relative cursor-pointer hover:scale-105 transition"
          title={`Click to open sidebar • ${displayName} (${displayId})`}
        >
          <div
            className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-xs shadow-xs ${
              mode === 'admin' ? 'bg-yellow-400 text-slate-950 font-extrabold' : 'bg-blue-600 text-white'
            }`}
          >
            {initials}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          title={`Sign Out (${displayName})`}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out shadow-xs ${
          isSidebarOpen ? 'w-72' : 'w-20'
        }`}
      >
        {isSidebarOpen ? sidebarContent : collapsedContent}
      </aside>

      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          isSidebarOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
        }`}
      >
        <div
          className={`fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleClose}
          aria-hidden="true"
        />
        <div
          className={`relative z-10 flex-1 flex max-w-xs w-full h-full shadow-2xl transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
