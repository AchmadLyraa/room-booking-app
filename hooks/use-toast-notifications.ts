"use client";

import { useToast } from "@/components/ui/use-toast";
import { getErrorMessage } from "@/lib/error-utils";

/**
 * Hook untuk toast notifications
 * Usage: const { showError, showSuccess } = useToastNotifications();
 */
export function useToastNotifications() {
  const { toast } = useToast();

  const showError = (error: unknown, title = "Error") => {
    const message = getErrorMessage(error);
    toast({
      title,
      description: message,
      variant: "destructive",
    });
  };

  const showSuccess = (message: string, title = "Success") => {
    toast({
      title,
      description: message,
    });
  };

  return { showError, showSuccess };
}
