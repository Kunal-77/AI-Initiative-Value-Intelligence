const items = [
  "SOC 2",
  "ISO 27001",
  "PCI DSS",
  "CMMC",
  "HIPAA",
  "HITRUST",
  "NIST 800-171",
  "FedRAMP",
  "GDPR",
  "NIS 2",
  "ISO 9001",
  "CCPA",
];

export function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-border bg-surface/40 py-6">
      <div className="marquee-track flex w-max gap-14">
        {[...items, ...items].map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="font-mono text-sm tracking-[0.22em] text-muted-foreground"
          >
            {item}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
