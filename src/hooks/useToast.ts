import { useSnackbar } from 'notistack';

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export function useToast() {
  const { enqueueSnackbar } = useSnackbar();

  const show = (message: string, variant: ToastVariant = 'default') =>
    enqueueSnackbar(message, { variant });

  return {
    show,
    success: (message: string) => show(message, 'success'),
    error: (message: string) => show(message, 'error'),
    info: (message: string) => show(message, 'info'),
    warning: (message: string) => show(message, 'warning'),
  };
}
