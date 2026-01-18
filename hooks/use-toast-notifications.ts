"use client";

import { useToast } from "@/hooks/use-toast";

export function useToastNotifications() {
  const { toast } = useToast();

  const showError = (message: string, title = "Error") => {
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
