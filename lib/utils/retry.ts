export interface RetryOptions {
  maxAttempts?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  onRetry?: (attempt: number, error: unknown) => void
}

export async function retryWithBackoff<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxAttempts = 3, initialDelay = 1000, maxDelay = 10000, backoffMultiplier = 2, onRetry } = options

  let lastError: Error | unknown

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, error)
      }

      if (attempt < maxAttempts - 1) {
        const delay = Math.min(initialDelay * Math.pow(backoffMultiplier, attempt), maxDelay)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

export function isNetworkError(error: any): boolean {
  return (
    error?.message?.includes("fetch") ||
    error?.message?.includes("network") ||
    error?.code === "NETWORK_ERROR" ||
    error?.status === 0
  )
}
