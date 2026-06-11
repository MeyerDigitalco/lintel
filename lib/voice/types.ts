/**
 * Voice assistant intents.
 *
 * The assistant is deliberately scoped — it never moves money, sends messages
 * or serves notices on its own. Every actionable intent is surfaced to the user
 * for an explicit confirm step before anything is written, and all writes are
 * audit-logged.
 */

export type QueryKind = "rent_roll" | "arrears" | "expiries";

export type VoiceIntent =
  | {
      type: "log_transaction";
      direction: "income" | "expense";
      amount: number;
      category: string; // SA105 key
      description: string;
      propertyHint: string | null;
    }
  | { type: "query"; kind: QueryKind }
  | { type: "draft_message"; topic: string }
  | { type: "unknown"; text: string };

export interface ParsedCommand {
  intent: VoiceIntent;
  /** human-readable echo of what we understood, for the confirm card */
  summary: string;
}
