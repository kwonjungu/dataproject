import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

// Client-side Supabase client (browser uses fetch natively)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role key
// Uses proxy only if HTTPS_PROXY is set (dev/sandbox environments)
export async function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const proxyFetch = await getProxyFetch();

  return createClient(supabaseUrl, serviceRoleKey, {
    ...(proxyFetch ? { global: { fetch: proxyFetch } } : {}),
  });
}
