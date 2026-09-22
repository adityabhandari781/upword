let client;

function clientConfig() {
  const documentConfig = globalThis.document?.documentElement?.dataset;
  const configured = globalThis.HEIGHT_WORDLE_SUPABASE_CONFIG ?? {};
  return {
    url: configured.url ?? documentConfig?.supabaseUrl ?? '',
    publishableKey: configured.publishableKey ?? documentConfig?.supabasePublishableKey ?? '',
  };
}

export function isSupabaseConfigured() {
  const config = clientConfig();
  return Boolean(config.url && config.publishableKey && globalThis.supabase?.createClient);
}

export function getSupabase() {
  if (client !== undefined) return client;
  if (!isSupabaseConfigured()) {
    client = null;
    return client;
  }

  const config = clientConfig();
  try {
    client = globalThis.supabase.createClient(config.url, config.publishableKey, {
      auth: {
        autoRefreshToken: true,
        // ponytail: browser persistence keeps this casual anonymous account after refresh;
        // move sessions to server-issued httpOnly cookies if accounts gain valuable data.
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  } catch {
    client = null;
  }

  return client;
}
