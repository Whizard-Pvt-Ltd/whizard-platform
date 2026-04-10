export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  /** Auto-dismiss after this many ms. Default 4000. 0 = persistent. */
  duration?: number;
  /** Show the close (X) affordance. Default true. */
  dismissible?: boolean;
}

export interface Toast {
  id: number;
  variant: ToastVariant;
  message: string;
  dismissible: boolean;
}
