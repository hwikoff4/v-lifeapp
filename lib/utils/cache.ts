interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresIn: number
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map()

  set<T>(key: string, data: T, expiresIn = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    })
    console.log(`[v0] Cached data for key: ${key}`)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    const isExpired = Date.now() - entry.timestamp > entry.expiresIn

    if (isExpired) {
      console.log(`[v0] Cache expired for key: ${key}`)
      this.cache.delete(key)
      return null
    }

    console.log(`[v0] Cache hit for key: ${key}`)
    return entry.data as T
  }

  clear(): void {
    this.cache.clear()
    console.log(`[v0] Cache cleared`)
  }

  delete(key: string): void {
    this.cache.delete(key)
    console.log(`[v0] Deleted cache for key: ${key}`)
  }
}

export const cache = new SimpleCache()
