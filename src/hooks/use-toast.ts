'use client';

import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

let toastState: Toast[] = [];
let listeners: ((toasts: Toast[]) => void)[] = [];

const emit = (toasts: Toast[]) => {
  toastState = toasts;
  listeners.forEach(l => l(toasts));
};

export const toast = (t: Omit<Toast, 'id'>) => {
  const id = Math.random().toString(36).slice(2);
  const newToast = { ...t, id };
  emit([...toastState, newToast]);
  setTimeout(() => emit(toastState.filter(x => x.id !== id)), 4000);
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>(toastState);

  const subscribe = useCallback((cb: (toasts: Toast[]) => void) => {
    listeners.push(cb);
    return () => { listeners = listeners.filter(l => l !== cb); };
  }, []);

  useState(() => {
    const unsub = subscribe(setToasts);
    return unsub;
  });

  return { toast, toasts };
};
