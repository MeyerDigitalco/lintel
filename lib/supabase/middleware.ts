import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured (e.g. env vars missing on the host), don't
  // crash the whole site in middleware, let requests through. Page-level
  // guards (requireSession) still protect server components.
  if (!url || !anon) return response;

  const path = request.nextUrl.pathname;
  const isProtected =
    path.startsWith("/dashboard") || path.startsWith("/portal") || path === "/home";

  try {
    let res = response;
    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]
        ) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          res = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options as never)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isProtected && !user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("next", path);
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch {
    // Never take the site down from middleware, fail open.
    return response;
  }
}
