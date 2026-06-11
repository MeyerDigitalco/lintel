import "server-only";
import type { MtdProvider } from "@/lib/mtd";
import { mtdProvider as localProvider } from "./local-provider";
import { HmrcMtdProvider } from "./hmrc/provider";
import { MTD_PROVIDER } from "./hmrc/config";
import type { ClientContext } from "./hmrc/fraud-headers";

/**
 * Resolve the active MTD provider. Defaults to the local provider; switches to
 * the HMRC provider only when MTD_PROVIDER=hmrc. Either way, canSubmit() governs
 * whether the UI exposes any "file to HMRC" action.
 */
export function getMtdProvider(clientContext: ClientContext = {}): MtdProvider {
  if (MTD_PROVIDER === "hmrc") return new HmrcMtdProvider(clientContext);
  return localProvider;
}
