import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

function getAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

async function getProxyFetch() {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (proxyUrl) {
    try {
      const { ProxyAgent, fetch: undiciFetch } = await import('undici');
      const dispatcher = new ProxyAgent(proxyUrl);
      return (input: RequestInfo | URL, init?: RequestInit) => {
        return undiciFetch(input as string, {
          ...init as Record<string, unknown>,
          dispatcher,
        }) as unknown as Promise<Response>;
      };
    } catch {
      return undefined;
    }
  }
  return undefined;
}

// Client-side Supabase client (lazy init)
let _supabase: SupabaseClient | null = null;
export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(getUrl(), getAnonKey());
  }
  return _supabase;
}

// For backwards compat
export const supabase = typeof window !== 'undefined'
  ? createClient(getUrl(), getAnonKey())
  : (null as unknown as SupabaseClient);

// Server-side Supabase client with service role key
export async function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const proxyFetch = await getProxyFetch();

  return createClient(getUrl(), serviceRoleKey, {
    ...(proxyFetch ? { global: { fetch: proxyFetch } } : {}),
  });
}
