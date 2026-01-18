// Universal Result type for server actions
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Helper to create success result
export function successResult<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

// Helper to create error result
export function errorResult(error: string): ActionResult {
  return { success: false, error };
}
