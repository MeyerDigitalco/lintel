export function LegalDisclaimer({ legislationUrl }: { legislationUrl?: string }) {
  return (
    <div className="rounded-lintel border border-amber/30 bg-amber/5 px-4 py-3 text-xs text-ink">
      <strong className="font-medium">Not legal advice.</strong> Lintel generates
      template-assisted documents to save you time. Notice periods and prescribed
      forms change — verify the wording and serve correctly, and consult a
      solicitor for anything contested.
      {legislationUrl && (
        <>
          {" "}
          <a
            href={legislationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-evergreen underline"
          >
            View the legislation
          </a>
          .
        </>
      )}
    </div>
  );
}
