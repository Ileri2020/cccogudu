const inFlightRequests = new Map<string, Promise<unknown>>();

/** Shares concurrent identical client requests, including React Strict Mode replays. */
export function dedupeClientRequest<T>(key: string, request: () => Promise<T>): Promise<T> {
  const existingRequest = inFlightRequests.get(key);
  if (existingRequest) return existingRequest as Promise<T>;

  const pendingRequest = request().finally(() => {
    if (inFlightRequests.get(key) === pendingRequest) {
      inFlightRequests.delete(key);
    }
  });

  inFlightRequests.set(key, pendingRequest);
  return pendingRequest;
}