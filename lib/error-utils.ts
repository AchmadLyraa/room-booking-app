/**
 * Extract meaningful error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}

/**
 * Determine if error is a user-facing error or server error
 * Backend throws errors dengan format tertentu
 */
export function isUserError(error: unknown): boolean {
  if (error instanceof Error) {
    // Common user-facing errors dari backend
    const userErrorKeywords = [
      "already booked",
      "not available",
      "conflict",
      "invalid",
      "expired",
      "permission",
      "unauthorized",
      "already",
      "not found",
    ];
    return userErrorKeywords.some((keyword) =>
      error.message.toLowerCase().includes(keyword),
    );
  }
  return false;
}
