import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, Search, X } from './icons';

export default function Header({
  sidebarOpen = true,
  onToggleSidebar,
  onOpenMobile,
  notifications = [],
  unreadCount = 0,
  onMarkAllRead,
  onRemoveNotification,
  onSelectNotification,
  onOpenNotifications,
  onBrowse,
  semester = 'AY 2026–2027 • 1st Semester',
}) {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  const handleToggle = onToggleSidebar || onOpenMobile;

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {!sidebarOpen && (
            <button
              type="button"
              onClick={handleToggle}
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer lg:hidden flex items-center justify-center animate-in fade-in duration-150"
              aria-label="Open sidebar menu"
              title="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="hidden sm:inline">Active Term:</span>
            <span>{semester}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-4">
          <button
            type="button"
            onClick={onBrowse || (() => navigate('/browse-found-items'))}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Browse Catalog</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              aria-label={`View notifications (${unreadCount} unread)`}
              aria-expanded={notifOpen}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setNotifOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 mt-2.5 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-white shadow-2xl border border-slate-200 z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/70">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Notifications ({notifications.length})
                      </h3>
                    </div>
                    {unreadCount > 0 && onMarkAllRead && (
                      <button
                        type="button"
                        onClick={onMarkAllRead}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3.5 transition flex items-start gap-3 relative group ${
                            item.unread ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div
                            onClick={() => {
                              setNotifOpen(false);
                              if (onSelectNotification) {
                                onSelectNotification(item);
                              } else if (item.deepLink) {
                                navigate(item.deepLink);
                              }
                            }}
                            className="flex-1 cursor-pointer min-w-0"
                          >
                            <div className="flex items-center gap-2 mb-0.5">
                              {item.unread && (
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                              )}
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {item.title}
                              </h4>
                              <span className="text-[10px] text-slate-400 ml-auto shrink-0 font-mono">
                                {item.timestamp}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                              {item.message}
                            </p>
                          </div>

                          {onRemoveNotification && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveNotification(item.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition cursor-pointer shrink-0"
                              title="Remove notification"
                              aria-label={`Remove notification: ${item.title}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">
                      {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNotifOpen(false);
                        if (onOpenNotifications) onOpenNotifications();
                      }}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
                    >
                      View all in Notifications
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
