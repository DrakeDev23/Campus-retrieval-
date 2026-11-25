import React from 'react';
import { X } from './icons';

export default function NotificationsCard({ notifications, onMarkAllRead, onOpenNotif, onRemoveNotification }) {
  const unreadTotal = notifications.filter((n) => n.unread).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Recent Notifications</h2>
          <p className="text-[11px] text-slate-400">
            {unreadTotal > 0 ? `${unreadTotal} unread updates` : 'All updates read'}
          </p>
        </div>

        {unreadTotal > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            No notifications.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onOpenNotif && onOpenNotif(notif)}
              className={`py-3.5 first:pt-0 last:pb-0 transition cursor-pointer flex items-start justify-between gap-2.5 ${
                notif.unread ? 'opacity-100' : 'opacity-75 hover:opacity-100'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {notif.unread && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                    )}
                    <h3 className="text-xs font-semibold text-slate-900 truncate">
                      {notif.title}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {notif.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pl-3">
                  {notif.message}
                </p>
              </div>

              {onRemoveNotification && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveNotification(notif.id);
                  }}
                  className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                  title="Remove notification"
                  aria-label="Remove notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
