import { toast } from "sonner";
import type { ExternalToast } from "sonner";

const DEFAULT_OPTIONS: ExternalToast = {
  duration: 4000,
};

const withDefaults = (options?: ExternalToast) => ({
  ...DEFAULT_OPTIONS,
  ...options,
});

export const notify = {
  message: (message: Parameters<typeof toast>[0], options?: ExternalToast) =>
    toast(message, withDefaults(options)),
  success: (
    message: Parameters<typeof toast.success>[0],
    options?: ExternalToast
  ) => toast.success(message, withDefaults(options)),
  error: (
    message: Parameters<typeof toast.error>[0],
    options?: ExternalToast
  ) => toast.error(message, withDefaults(options)),
  info: (message: Parameters<typeof toast.info>[0], options?: ExternalToast) =>
    toast.info(message, withDefaults(options)),
  warning: (
    message: Parameters<typeof toast.warning>[0],
    options?: ExternalToast
  ) => toast.warning(message, withDefaults(options)),
  promise: toast.promise as <T>(
    promise: Promise<T>,
    handlers: Parameters<typeof toast.promise>[1],
    options?: ExternalToast
  ) => ReturnType<typeof toast.promise>,
  dismiss: toast.dismiss,
};
