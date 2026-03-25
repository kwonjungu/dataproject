import { createClient } from '@supabase/supabase-js';
import { ProxyAgent, fetch as undiciFetch } from 'undici';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getProxyFetch() {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (proxyUrl) {
    const dispatcher = new ProxyAgent(proxyUrl);
    return (input: RequestInfo | URL, init?: RequestInit) => {
      return undiciFetch(input as string, {
        ...init as Record<string, unknown>,
        dispatcher,
      }) as unknown as Promise<Response>;
    };
  }
  return undefined;
}

// Client-side Supabase client (browser uses fetch natively)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role key + proxy support
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const proxyFetch = getProxyFetch();

  return createClient(supabaseUrl, serviceRoleKey, {
    ...(proxyFetch ? { global: { fetch: proxyFetch } } : {}),
  });
}
