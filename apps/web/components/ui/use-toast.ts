import * as React from 'react';
import { toast } from 'sonner';

export type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
};

export function useToast() {
  const toastFunction = React.useCallback((props: ToastProps) => {
    const { title, description, variant = 'default', duration = 5000 } = props;

    if (variant === 'destructive') {
      toast.error(description || title || 'An error occurred', {
        duration,
      });
    } else {
      toast.success(description || title || 'Success', {
        duration,
      });
    }
  }, []);

  return {
    toast: toastFunction,
  };
}
