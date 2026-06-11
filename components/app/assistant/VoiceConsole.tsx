"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/app/ui";
import { parseCommand } from "@/lib/voice/parse";
import { draftTenantMessage } from "@/lib/voice/draft";
import type { ParsedCommand } from "@/lib/voice/types";
import {
  voiceLogTransaction,
  voiceQuery,
  type QueryResult,
} from "@/app/dashboard/assistant/actions";

const EXAMPLES = [
  "Log expense £85 for boiler repair at 12 Oak Street",
  "Rent received £950",
  "Who's in arrears?",
  "Which certificates expire soon?",
  "Draft a message to my tenant about the gas safety check",
];

export function VoiceConsole() {
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed] = useState<ParsedCommand | null>(null);
  const [listening, setListening] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const recognitionRef = useRef<any>(null);

  function handleParse(text: string) {
    setQueryResult(null);
    setDraft(null);
    setSaved(null);
    const result = parseCommand(text);
    setParsed(result);
    if (result.intent.type === "draft_message") {
      setDraft(draftTenantMessage(result.intent.topic));
    }
  }

  function startListening() {
    const SR =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
      null;
    if (!SR) {
      alert("Speech recognition isn't available in this browser — type your command instead.");
      return;
    }
    const recognition = new SR();
    recognition.lang = "en-GB";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      handleParse(text);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  async function confirmLog() {
    if (parsed?.intent.type !== "log_transaction") return;
    setBusy(true);
    try {
      const r = await voiceLogTransaction({
        direction: parsed.intent.direction,
        amount: parsed.intent.amount,
        category: parsed.intent.category,
        description: parsed.intent.description,
        propertyHint: parsed.intent.propertyHint,
      });
      setSaved(
        r.matchedProperty
          ? "Saved and matched to a property."
          : "Saved (no property matched — assigned to portfolio)."
      );
      setParsed(null);
    } finally {
      setBusy(false);
    }
  }

  async function runQuery() {
    if (parsed?.intent.type !== "query") return;
    setBusy(true);
    try {
      setQueryResult(await voiceQuery(parsed.intent.kind));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Input */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-2">
            <Button
              onClick={listening ? stopListening : startListening}
              variant={listening ? "mint" : "primary"}
            >
              {listening ? "Listening… tap to stop" : "Speak a command"}
            </Button>
            <span className="text-xs text-slate">or type below</span>
          </div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const text = String(fd.get("cmd") ?? "");
              if (text.trim()) {
                setTranscript(text);
                handleParse(text);
              }
            }}
          >
            <input
              name="cmd"
              placeholder="e.g. Log expense £85 for boiler repair"
              className="h-11 flex-1 rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30"
            />
            <Button type="submit" variant="outline">Parse</Button>
          </form>
          {transcript && (
            <p className="mt-3 text-sm text-slate">
              Heard: <span className="text-ink">“{transcript}”</span>
            </p>
          )}
        </CardBody>
      </Card>

      {/* Confirmation / result */}
      {parsed && parsed.intent.type === "log_transaction" && (
        <Card className="border-evergreen/30">
          <CardBody>
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-semibold tracking-tight">Confirm before saving</h3>
              <Badge tone="amber">Needs confirmation</Badge>
            </div>
            <p className="mt-2 text-sm text-ink">{parsed.summary}</p>
            {parsed.intent.propertyHint && (
              <p className="text-xs text-slate">Property: {parsed.intent.propertyHint}</p>
            )}
            <div className="mt-4 flex gap-2">
              <Button onClick={confirmLog} disabled={busy}>
                {busy ? "Saving…" : "Confirm & save"}
              </Button>
              <Button variant="ghost" onClick={() => setParsed(null)}>Cancel</Button>
            </div>
            <p className="mt-3 text-xs text-slate">
              The assistant never saves money entries without your confirmation.
            </p>
          </CardBody>
        </Card>
      )}

      {parsed && parsed.intent.type === "query" && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-semibold tracking-tight">{parsed.summary}</h3>
              <Button size="sm" variant="outline" onClick={runQuery} disabled={busy}>
                {busy ? "Running…" : "Run query"}
              </Button>
            </div>
            {queryResult && (
              <table className="mt-3 w-full text-sm">
                <tbody>
                  {queryResult.rows.map((r, i) => (
                    <tr key={i} className="border-b border-hairline last:border-0">
                      <td className="py-2 text-ink">{r.label}</td>
                      <td className="py-2 text-right tabular-nums text-slate">{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      )}

      {parsed && parsed.intent.type === "draft_message" && draft && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-semibold tracking-tight">Draft message</h3>
              <Badge>Not sent</Badge>
            </div>
            <pre className="mt-3 whitespace-pre-wrap rounded-lintel bg-paper p-4 text-sm text-ink">
              {draft}
            </pre>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigator.clipboard?.writeText(draft)}
              >
                Copy
              </Button>
            </div>
            <p className="mt-3 text-xs text-slate">
              The assistant drafts only — copy this into your tenant thread to send.
            </p>
          </CardBody>
        </Card>
      )}

      {parsed && parsed.intent.type === "unknown" && (
        <Card>
          <CardBody>
            <p className="text-sm text-slate">{parsed.summary} Try one of the examples below.</p>
          </CardBody>
        </Card>
      )}

      {saved && (
        <Card className="border-mint/40">
          <CardBody>
            <p className="text-sm text-evergreen">{saved}</p>
          </CardBody>
        </Card>
      )}

      {/* Examples */}
      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-slate">Try saying</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setTranscript(ex);
                handleParse(ex);
              }}
              className="rounded-full border border-hairline bg-surface px-3 py-1 text-xs text-slate hover:text-ink"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
