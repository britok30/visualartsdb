





export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // JSON.stringify does not escape "</script>", so synced data containing it
  // could break out of the tag and execute markup. Escaping "<" is the
  // standard mitigation (valid JSON, inert in HTML).
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
