import { useNotificationStore } from '../../store/useNotificationStore';
import { Icon } from '../ui/Icon';

const typeStyles = {
  info: 'bg-slate-800 border-slate-600',
  success: 'bg-emerald-700 border-emerald-500',
  warning: 'bg-amber-700 border-amber-500',
  kitchen: 'bg-violet-700 border-violet-500',
};

const typeIcons = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  kitchen: 'skillet',
};

export default function ToastContainer() {
  const toasts = useNotificationStore((s) => s.toasts);
  const dismissToast = useNotificationStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border text-white shadow-2xl animate-in slide-in-from-right ${typeStyles[t.type]}`}
        >
          <Icon name={typeIcons[t.type]} size={22} className="shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{t.title}</p>
            <p className="text-xs opacity-90 mt-0.5">{t.message}</p>
          </div>
          <button
            onClick={() => dismissToast(t.id)}
            className="p-1 rounded-lg hover:bg-white/10 shrink-0"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
