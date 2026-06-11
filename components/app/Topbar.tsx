import { signOutAction } from "@/app/(auth)/actions";

export function Topbar({ email, orgName }: { email: string | null; orgName?: string }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-hairline bg-paper/80 px-5 backdrop-blur">
      <div className="text-sm text-slate">
        {orgName && <span className="font-medium text-ink">{orgName}</span>}
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-slate sm:block">{email}</span>
        <form action={signOutAction}>
          <button className="text-sm text-slate hover:text-ink" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
