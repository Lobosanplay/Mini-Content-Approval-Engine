import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

interface CookieOptions {
  name: string;
  value: string;
  options?: {
    domain?: string;
    path?: string;
    maxAge?: number;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: "lax" | "strict" | "none";
  };
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieOptions[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );
}
