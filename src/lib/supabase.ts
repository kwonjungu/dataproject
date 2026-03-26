import { createClient, SupabaseClient } from '@supabase/supabase-js';

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder';

function getUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL;
}

function getAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY;
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

// Client-side Supabase client (lazy)
let _supabase: SupabaseClient | null = null;
export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(getUrl(), getAnonKey());
  }
  return _supabase;
}
export const supabase = null as unknown as SupabaseClient; // unused, kept for compat

// Server-side Supabase client
export async function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase environment variables are not set');
  }

  const proxyFetch = await getProxyFetch();

  return createClient(url, key, {
    ...(proxyFetch ? { global: { fetch: proxyFetch } } : {}),
  });
}
