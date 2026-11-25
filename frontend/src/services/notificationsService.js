import { INITIAL_NOTIFICATIONS } from '../components/dashboard/mockData.js';

const NOTIFS_STORAGE_KEY = 'itemfinder_notifications_v1';

let inMemoryNotifsFallback = null;

export function readNotificationsStore() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(NOTIFS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          inMemoryNotifsFallback = parsed;
          return parsed;
        }
      }
    }
  } catch {
  }

  if (inMemoryNotifsFallback) return inMemoryNotifsFallback;
  inMemoryNotifsFallback = INITIAL_NOTIFICATIONS;
  writeNotificationsStore(INITIAL_NOTIFICATIONS);
  return INITIAL_NOTIFICATIONS;
}

export function writeNotificationsStore(notifs) {
  inMemoryNotifsFallback = notifs;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(notifs));
    }
  } catch {
  }
}

export async function getNotifications(userOrId) {
  const all = readNotificationsStore();
  if (!userOrId) return all;

  const identifier = typeof userOrId === 'string' ? userOrId : userOrId.studentId || userOrId.id;
  const role = typeof userOrId === 'object' ? userOrId.role : null;

  return all.filter((n) => {
    if (!n.recipientId && !n.recipientRole) return true;

    if (role === 'admin' && (n.recipientRole === 'admin' || n.recipientId === 'admin')) {
      return true;
    }

    if (identifier && (n.recipientId === identifier || (n.recipientRole === 'student' && (!n.recipientId || n.recipientId === identifier)))) {
      return true;
    }

    return false;
  });
}

export async function markNotificationRead(id) {
  const current = readNotificationsStore();
  const updated = current.map((n) => (n.id === id ? { ...n, unread: false } : n));
  writeNotificationsStore(updated);
  return updated;
}

export async function markAllNotificationsRead(userOrId) {
  const current = readNotificationsStore();
  const identifier = typeof userOrId === 'string' ? userOrId : userOrId?.studentId || userOrId?.id;
  const role = typeof userOrId === 'object' ? userOrId.role : null;

  const updated = current.map((n) => {
    if (!userOrId) return { ...n, unread: false };
    if (role === 'admin' && (n.recipientRole === 'admin' || n.recipientId === 'admin')) {
      return { ...n, unread: false };
    }
    if (identifier && (n.recipientId === identifier || (n.recipientRole === 'student' && (!n.recipientId || n.recipientId === identifier)))) {
      return { ...n, unread: false };
    }
    return { ...n, unread: false };
  });

  writeNotificationsStore(updated);
  return updated;
}

export async function removeNotification(id) {
  const current = readNotificationsStore();
  const updated = current.filter((n) => n.id !== id);
  writeNotificationsStore(updated);
  return updated;
}

export function pushNotification(notif) {
  const current = readNotificationsStore();
  const newEntry = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: 'Just now',
    unread: true,
    ...notif,
  };
  const updated = [newEntry, ...current];
  writeNotificationsStore(updated);
  return updated;
}
