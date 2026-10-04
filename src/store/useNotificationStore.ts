import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'kitchen';
  createdAt: number;
  read: boolean;
  meta?: {
    pedidoId?: string;
    mesaNumero?: string | number;
    itemName?: string;
  };
}

interface NotificationState {
  notifications: AppNotification[];
  toasts: AppNotification[]; // currently visible toasts
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  dismissToast: (id: string) => void;
  unreadCount: () => number;
}

// Simple beep using Web Audio API
function playNotificationSound(type: AppNotification['type'] = 'info') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'kitchen') {
      // Double beep for kitchen ready
      osc.frequency.value = 880;
      gain.gain.value = 0.15;
      osc.start();
      setTimeout(() => {
        osc.frequency.value = 1175;
      }, 120);
      setTimeout(() => {
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.stop(ctx.currentTime + 0.15);
      }, 280);
    } else {
      osc.frequency.value = 660;
      gain.gain.value = 0.1;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // Audio not available
  }
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  toasts: [],

  addNotification: (n) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const full: AppNotification = {
      ...n,
      id,
      createdAt: Date.now(),
      read: false,
    };

    set((s) => ({
      notifications: [full, ...s.notifications].slice(0, 50),
      toasts: [full, ...s.toasts].slice(0, 3),
    }));

    playNotificationSound(n.type);

    // Auto dismiss toast after 5s
    setTimeout(() => {
      get().dismissToast(id);
    }, 5000);
  },

  markAsRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  clearAll: () => set({ notifications: [], toasts: [] }),

  dismissToast: (id) =>
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    })),

  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
