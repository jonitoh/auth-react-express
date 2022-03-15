export function isMinimalError(error: unknown): error is { name: string; message: string } {
  return !!error && typeof error === 'object' && 'name' in error && 'message' in error;
}
