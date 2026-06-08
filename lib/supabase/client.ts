import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a dummy proxy to prevent crash on page load when Supabase is not configured
    return new Proxy({} as any, {
      get(target, prop) {
        if (prop === 'auth') {
          return new Proxy({} as any, {
            get(t, p) {
              return () => {
                throw new Error("Supabase is not configured. Please check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.");
              };
            }
          });
        }
        return () => {
          throw new Error("Supabase is not configured. Please check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.");
        };
      }
    });
  }

  return createBrowserClient(url, key);
}