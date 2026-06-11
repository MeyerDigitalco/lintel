import Link from "next/link";
import { requireTenant } from "@/lib/tenant-auth";
import { Logo } from "@/components/Logo";
import { PortalNav } from "@/components/portal/PortalNav";
import { signOutAction } from "@/app/(auth)/actions";

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await requireTenant();

  if (!tenant.active.portalEnabled) {
    return (
      <div className="min-h-screen bg-paper">
        <div className="mx-auto max-w-md px-5 py-20 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-6 font-heading text-xl font-semibold tracking-tight">
            Portal not enabled yet
          </h1>
          <p className="mt-2 text-sm text-slate">
            Your landlord hasn&apos;t enabled the tenant portal for your tenancy.
            Please contact them directly in the meantime.
          </p>
          <form action={signOutAction} className="mt-6">
            <button className="text-sm text-evergreen hover:underline" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper pb-20">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-hairline bg-paper/90 px-4 backdrop-blur">
        <Link href="/portal" aria-label="Lintel">
          <Logo />
        </Link>
        <form action={signOutAction}>
          <button className="text-sm text-slate hover:text-ink" type="submit">
            Sign out
          </button>
        </form>
      </header>
      <main className="mx-auto max-w-md px-4 py-6">{children}</main>
      <PortalNav />
    </div>
  );
}
