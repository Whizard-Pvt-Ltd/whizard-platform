export type ConfirmationIconColor =
  | 'primary'
  | 'accent'
  | 'warn'
  | 'basic'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export type ConfirmationActionColor =
  | 'primary'
  | 'accent'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'warn';

export interface WhizardConfirmationConfig {
  title?: string;
  message?: string;
  icon?: {
    show?: boolean;
    name?: string;
    color?: ConfirmationIconColor;
  };
  actions?: {
    confirm?: {
      show?: boolean;
      label?: string;
      color?: ConfirmationActionColor;
    };
    cancel?: {
      show?: boolean;
      label?: string;
    };
  };
  dismissible?: boolean;
}

export type ConfirmationDialogResult = 'confirmed' | 'cancelled' | undefined;
