import Link from "next/link";
import { requireSession, isWriterRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { updateProfile, updateEmail, updatePassword, updateOrgName, deleteAccount } from "./actions";
import { setLanguage } from "@/app/lang-actions";
import { getLang } from "@/lib/i18n/lang";
import { availableLanguages, LANGUAGES } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

const inputCls =
  "h-11 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";
const labelCls = "mb-1 block text-xs font-medium text-slate";

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  landlord: "Landlord",
  accountant: "Accountant",
  tenant: "Tenant",
  contractor: "Contractor",
};

export default async function SettingsPage() {
  const { orgId, role, country } = await requireSession();
  const lang = getLang(country);
  const langs = availableLanguages(country);
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: org } = await supabase.from("orgs").select("name").eq("id", orgId).maybeSingle();

  const fullName = (user?.user_metadata?.full_name as string) ?? "";
  const email = user?.email ?? "";
  const isAdmin = role === "owner" || role === "admin";
  const writer = isWriterRole(role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, your team and your plan."
        action={<Badge>{ROLE_LABEL[role] ?? role}</Badge>}
      />

      {writer && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/dashboard/settings/billing">
            <Card className="h-full transition-colors hover:border-evergreen/40">
              <CardBody>
                <h3 className="font-heading text-sm font-semibold tracking-tight">Plan &amp; add-ons</h3>
                <p className="mt-1 text-xs text-slate">
                  Turn the voice assistant, tenant portal and maintenance portal on or off.
                </p>
              </CardBody>
            </Card>
          </Link>
          <Link href="/dashboard/settings/team">
            <Card className="h-full transition-colors hover:border-evergreen/40">
              <CardBody>
                <h3 className="font-heading text-sm font-semibold tracking-tight">Team &amp; roles</h3>
                <p className="mt-1 text-xs text-slate">
                  Invite admins, landlords and accountants, and manage their access.
                </p>
              </CardBody>
            </Card>
          </Link>
        </div>
      )}

      <Card>
        <CardBody>
          <h2 className="font-heading text-base font-semibold tracking-tight">Your profile</h2>
          <form action={updateProfile} className="mt-4 flex items-end gap-3">
            <div className="flex-1">
              <label className={labelCls} htmlFor="full_name">Display name</label>
              <input id="full_name" name="full_name" defaultValue={fullName} className={inputCls} placeholder="Your name" />
            </div>
            <Button type="submit" variant="outline">Save</Button>
          </form>
        </CardBody>
      </Card>

      {langs.length > 1 && (
        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold tracking-tight">Language</h2>
            <p className="mt-1 text-xs text-slate">Choose the language for your dashboard. This applies to your account only.</p>
            <form action={setLanguage} className="mt-4 flex items-end gap-3">
              <div className="flex-1">
                <label className={labelCls} htmlFor="lang">Display language</label>
                <select id="lang" name="lang" defaultValue={lang} className={inputCls}>
                  {langs.map((l) => (
                    <option key={l} value={l}>{LANGUAGES[l]?.nativeName ?? l}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" variant="outline">Save</Button>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          <h2 className="font-heading text-base font-semibold tracking-tight">Email address</h2>
          <p className="mt-1 text-xs text-slate">
            Changing this sends a confirmation link to the new address. The change applies once confirmed.
          </p>
          <form action={updateEmail} className="mt-4 flex items-end gap-3">
            <div className="flex-1">
              <label className={labelCls} htmlFor="email">Email</label>
              <input id="email" name="email" type="email" defaultValue={email} className={inputCls} />
            </div>
            <Button type="submit" variant="outline">Update</Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="font-heading text-base font-semibold tracking-tight">Password</h2>
          <form action={updatePassword} className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="password">New password</label>
              <input id="password" name="password" type="password" autoComplete="new-password" className={inputCls} placeholder="At least 8 characters" />
            </div>
            <div>
              <label className={labelCls} htmlFor="confirm">Confirm password</label>
              <input id="confirm" name="confirm" type="password" autoComplete="new-password" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" variant="outline">Change password</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {isAdmin && (
        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold tracking-tight">Organisation</h2>
            <form action={updateOrgName} className="mt-4 flex items-end gap-3">
              <div className="flex-1">
                <label className={labelCls} htmlFor="name">Business name</label>
                <input id="name" name="name" defaultValue={org?.name ?? ""} className={inputCls} />
              </div>
              <Button type="submit" variant="outline">Save</Button>
            </form>
          </CardBody>
        </Card>
      )}

      <Card className="border-red/40 bg-red/5">
        <CardBody>
          <h2 className="font-heading text-base font-semibold tracking-tight text-red">Delete account</h2>
          <p className="mt-1 text-xs text-slate">
            This permanently closes your account and signs you out.
            {role === "owner" ? " If you are the only owner, your organisation and all of its data are removed too." : ""}
            {" "}This cannot be undone.
          </p>
          <form action={deleteAccount} className="mt-4 flex items-end gap-3">
            <div className="flex-1 max-w-xs">
              <label className={labelCls} htmlFor="confirm">Type DELETE to confirm</label>
              <input id="confirm" name="confirm" autoComplete="off" placeholder="DELETE" className={inputCls} />
            </div>
            <Button type="submit" variant="outline" className="border-red text-red hover:bg-red/10">Delete my account</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
