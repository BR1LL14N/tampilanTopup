import { checkBalance } from '@/lib/digiflazz';

interface BalanceCache {
  amount: number;
  timestamp: number;
}

// In-memory cache variable across Node.js runtime
let cachedBalance: BalanceCache | null = null;
const CACHE_TTL_MS = 45 * 1000; // 45 seconds cache TTL

export class BalanceGuardService {
  /**
   * Retrieves the current available Digiflazz deposit balance using a high-performance in-memory cache.
   * Prevents API rate-limiting while keeping balance data fresh.
   */
  static async getAvailableBalance(): Promise<number> {
    const now = Date.now();

    if (cachedBalance && (now - cachedBalance.timestamp) < CACHE_TTL_MS) {
      return cachedBalance.amount;
    }

    try {
      const res = await checkBalance();
      if (res && res.data && res.data.deposit !== undefined) {
        const deposit = Number(res.data.deposit) || 0;
        cachedBalance = {
          amount: deposit,
          timestamp: now,
        };
        return deposit;
      }
    } catch (err) {
      console.error('[BalanceGuard] Failed to fetch Digiflazz balance from API:', err);
    }

    // Fallback to last known balance or safe default if API is momentarily unresponsive
    return cachedBalance ? cachedBalance.amount : 99999999;
  }

  /**
   * Forces cache invalidation so the next call queries the latest balance immediately.
   * Useful when an admin tops up deposit or when an order is completed.
   */
  static invalidateCache() {
    cachedBalance = null;
  }
}
