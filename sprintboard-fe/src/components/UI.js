import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Inbox, LoaderCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Modal({ open, title, subtitle, onClose, children, size = 'medium' }) {
  useEffect(() => {
    const close = (event) => event.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal modal-${size}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-header">
          <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
          <button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}

export function Toast() {
  const { toast, setToast } = useApp();
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast, setToast]);
  if (!toast) return null;
  const Icon = toast.type === 'error' ? AlertCircle : CheckCircle2;
  return <div className={`toast toast-${toast.type}`}><Icon size={18} /><span>{toast.message}</span></div>;
}

export function Loading({ label = 'Loading data' }) {
  return <div className="loading-state"><LoaderCircle className="spin" size={22} /><span>{label}</span></div>;
}

export function EmptyState({ title, text, action, icon: Icon = Inbox }) {
  return <div className="empty-state"><Icon size={28} /><h3>{title}</h3><p>{text}</p>{action}</div>;
}

export function Avatar({ name = '?', size = 'md' }) {
  const initials = name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  return <span className={`avatar avatar-${size}`} title={name}>{initials}</span>;
}

export function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
