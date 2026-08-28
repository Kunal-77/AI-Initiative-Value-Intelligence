import { motion } from "motion/react";
import { useState } from "react";
import { Reveal, Eyebrow } from "./Reveal";
import {
  ShieldCheck,
  Wrench,
  Layers,
  RefreshCcw,
  Plus,
  Minus,
  Quote,
  ArrowUpRight,
} from "lucide-react";

/* ---------------- Mission ---------------- */
export function Mission() {
  return (
    <section id="mission" className="relative py-28">
      <div className="mx-auto grid max-w-[1400px] gap-14 px-6 lg:grid-cols-[0.9fr_1.4fr]">
        <Reveal>
          <Eyebrow>Our mission</Eyebrow>
        </Reveal>
        <div>
          <Reveal delay={0.05}>
            <h2 className="font-display text-3xl leading-tight font-semibold tracking-tight lg:text-[2.6rem]">
              Achieve Certifications and Reduce Risks with Efficient, Expert-Led Cybersecurity
              Compliance Solutions
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-8 text-muted-foreground md:grid-cols-2">
            <Reveal delay={0.12}>
              <p>
                Businesses face mounting pressure to comply with evolving cybersecurity regulations,
                and non-compliance carries fines, penalties and financial liability. CyberCrest is
                here to simplify complex cybersecurity compliance requirements that delay your
                growth.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p>
                Our certified team provides assessment and compliance advisory services to streamline
                information security certifications and attestations, fix security gaps and improve
                audit success so you can stay compliant, win new clients and confidently move
                forward.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Index rail ---------------- */
const chapters = [
  "MISSION",
  "WHEN TO START",
  "OUR SERVICES",
  "TESTIMONIALS",
  "ATTESTATIONS",
  "METHODOLOGY",
  "DELIVERABLES",
  "TECH SOLUTIONS",
  "INDUSTRIES",
  "WHY US",
  "KEY FACTS",
  "ACCREDITATIONS",
];

export function ChapterIndex() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-surface/30 py-20">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {chapters.map((c, i) => (
            <Reveal key={c} delay={i * 0.03}>
              <a
                href="#services"
                className="group flex items-center gap-4 border-b border-border pb-4 font-mono text-xs tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
              >
                <span className="text-primary/70">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-border">/</span>
                <span>{c}</span>
                <ArrowUpRight className="ml-auto h-4 w-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- When to start ---------------- */
const triggers = [
  {
    title: "A Customer or Business Partner Asks for Proof",
    body: "A customer, prospect or partner requires a certification or attestation before they will sign or renew. Deals stall until you can hand over a report — the first decision is which framework you can realistically meet before their deadline.",
  },
  {
    title: "A Regulator Puts You on Notice",
    body: "A government or regulatory body notifies you that your organization faces fines, penalties or financial liability. The requirements are fixed and the clock is running, so remediation is prioritized by risk.",
  },
  {
    title: "You Decide to Get Ahead of It",
    body: "No one is forcing the issue yet. A proactive approach fits remediation around your business objectives and turns compliance into a strategic advantage in vendor risk reviews.",
  },
];

export function WhenToStart() {
  return (
    <section id="when-to-start" className="py-28">
      <div className="mx-auto max-w-[1400px] px-6">
        <Reveal>
          <Eyebrow>When to start</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-6 max-w-3xl font-display text-3xl font-semibold tracking-tight lg:text-[2.6rem]">
            When Your Company Needs Cybersecurity Compliance Experts
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-2xl text-muted-foreground">
            Compliance rarely arrives when it suits you. It usually shows up in one of the situations
            below, each with a deadline attached.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {triggers.map((t, i) => (
            <Reveal key={t.title} delay={0.1 + i * 0.1}>
              <article className="glass-card hover-lift h-full rounded-2xl p-8">
                <span className="font-mono text-xs tracking-[0.2em] text-accent">
                  0{i + 1}
                </span>
                <h3 className="mt-6 font-display text-xl font-semibold">{t.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Services ---------------- */
const services = [
  {
    icon: ShieldCheck,
    title: "Compliance Attestations and Certifications",
    body: "Receive timely and streamlined information security attestations and certifications across all major regulations and standards to demonstrate your security posture.",
  },
  {
    icon: Wrench,
    title: "Hands-On Remediation Assistance",
    body: "Leave no security gap unpatched with hands-on remediation support that follows a thorough security risk assessment, so you meet audit requirements with confidence.",
  },
  {
    icon: Layers,
    title: "Compliance by Design",
    body: "Industry-leading technology and expert supervision set up audit-ready environments designed to pass rigorous compliance assessments from day one.",
  },
  {
    icon: RefreshCcw,
    title: "Ongoing Compliance Maintenance",
    body: "Professional support to keep meeting regulatory requirements as standards change, so your compliance program never lapses between audit cycles.",
  },
];

export function Services() {
  return (
    <section id="services" className="relative overflow-hidden py-28">
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-[140px]" />
      <div className="relative mx-auto max-w-[1400px] px-6">
        <Reveal>
          <Eyebrow>Our services</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-6 max-w-3xl font-display text-3xl font-semibold tracking-tight lg:text-[2.6rem]">
            How Our Cybersecurity Compliance Consulting Services Help Your Business
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="glass-card group relative h-full overflow-hidden rounded-3xl p-10"
              >
                <div className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "var(--gradient-line)" }} />
                <span className="grid h-14 w-14 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-8 font-display text-2xl font-semibold">{s.title}</h3>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */
const testimonials = [
  {
    quote:
      "CyberCrest took our SOC 2 readiness from a vague checklist to a clear plan. We cleared the audit on the first attempt.",
    name: "VP Engineering",
    org: "SaaS platform, Series B",
  },
  {
    quote:
      "Their consultants worked as an extension of our team. Remediation was prioritized by real risk, not by what looked easy.",
    name: "Director of IT",
    org: "Healthcare provider",
  },
  {
    quote:
      "We needed CMMC guidance fast. The kickoff and scoping were done in days and the roadmap held for the full engagement.",
    name: "CISO",
    org: "Defense supplier",
  },
];

export function Testimonials() {
  const [active, setActive] = useState(0);
  const t = testimonials[active]!;

  return (
    <section id="testimonials" className="border-y border-border bg-surface/30 py-28">
      <div className="mx-auto max-w-[1400px] px-6">
        <Reveal>
          <Eyebrow>Testimonials</Eyebrow>
        </Reveal>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight lg:text-[2.6rem]">
            Hear from Our Clients
          </h2>
          <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground">
            0{active + 1} / 0{testimonials.length}
          </span>
        </div>

        <motion.blockquote
          key={active}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card mt-12 rounded-3xl p-10 lg:p-14"
        >
          <Quote className="h-8 w-8 text-primary" />
          <p className="mt-8 max-w-4xl font-display text-2xl leading-snug lg:text-3xl">{t.quote}</p>
          <footer className="mt-10 font-mono text-xs tracking-[0.18em] text-muted-foreground">
            {t.name} — {t.org}
          </footer>
        </motion.blockquote>

        <div className="mt-8 flex gap-3">
          {testimonials.map((item, i) => (
            <button
              key={item.name}
              aria-label={`Testimonial ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === active ? "w-14 bg-primary" : "w-6 bg-border hover:bg-muted-foreground"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Attestations ---------------- */
const frameworks = [
  "ISO 9001",
  "CMMC",
  "ISO 27001",
  "PCI DSS",
  "NIST 800-171",
  "SOC 2",
  "NIS 2",
  "HIPAA",
  "HITRUST",
  "NIST CSF",
  "FedRAMP",
  "GDPR",
  "CCPA",
  "Penetration Testing",
];

export function Attestations() {
  return (
    <section id="attestations" className="py-28">
      <div className="mx-auto max-w-[1400px] px-6">
        <Reveal>
          <Eyebrow>Attestations</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-6 max-w-2xl font-display text-3xl font-semibold tracking-tight lg:text-[2.6rem]">
            Frameworks We Assess and Certify Against
          </h2>
        </Reveal>
        <div className="mt-12 flex flex-wrap gap-3">
          {frameworks.map((f, i) => (
            <Reveal key={f} delay={i * 0.03}>
              <span className="hover-lift inline-block rounded-full border border-border bg-surface/60 px-6 py-3 font-mono text-xs tracking-[0.16em] text-muted-foreground">
                {f}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Methodology ---------------- */
const steps = [
  { t: "Scoping & Kickoff", d: "We map your environment, applicable frameworks and deadlines in a structured kickoff call." },
  { t: "Gap Assessment", d: "A thorough security gap assessment against the target framework's control set." },
  { t: "Remediation", d: "Hands-on support to close gaps, prioritized by risk rather than by ease of fix." },
  { t: "Audit & Attestation", d: "We prepare evidence, support the audit and take you through to certification." },
  { t: "Maintenance", d: "Ongoing monitoring keeps your program current between audit cycles." },
];

export function Methodology() {
  return (
    <section id="methodology" className="border-y border-border bg-surface/30 py-28">
      <div className="mx-auto max-w-[1400px] px-6">
        <Reveal>
          <Eyebrow>Methodology</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-6 max-w-2xl font-display text-3xl font-semibold tracking-tight lg:text-[2.6rem]">
            A Proven Path from Gap to Certification
          </h2>
        </Reveal>

        <ol className="relative mt-16 border-l border-border pl-8">
          {steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.08}>
              <li className="relative pb-12 last:pb-0">
                <span className="absolute -left-[41px] grid h-6 w-6 place-items-center rounded-full border border-primary/50 bg-background font-mono text-[10px] text-primary">
                  {i + 1}
                </span>
                <h3 className="font-display text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">{s.d}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------- Key facts (counters) ---------------- */
const facts = [
  { v: "500+", l: "Assessments delivered" },
  { v: "13", l: "Frameworks covered" },
  { v: "98%", l: "First-attempt audit success" },
  { v: "20+", l: "Years of combined expertise" },
];

export function Facts() {
  return (
    <section id="facts" className="py-28">
      <div className="mx-auto grid max-w-[1400px] gap-6 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((f, i) => (
          <Reveal key={f.l} delay={i * 0.08}>
            <div className="glass-card hover-lift rounded-2xl p-8 text-center">
              <div className="font-display text-4xl font-semibold text-primary lg:text-5xl">{f.v}</div>
              <div className="mt-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {f.l}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
const faqs = [
  {
    q: "How much does a compliance consultant cost?",
    a: "Cybersecurity compliance services are priced by scope, not from a price list. Cost depends on the framework, the size and complexity of your in-scope environment and how mature your existing controls are.",
  },
  {
    q: "Can you advise on which compliance frameworks apply to my business?",
    a: "Absolutely. We assess your industry, applicable regulatory requirements and data handling mechanisms to advise on the required compliance attestations and certifications.",
  },
  {
    q: "Do you provide one-time assessments or ongoing compliance monitoring?",
    a: "We offer both one-time assessments and ongoing services, although the majority of our clients benefit from recurring engagements.",
  },
  {
    q: "Do you assist with drafting compliance documentation?",
    a: "Yes, our consultants can help you draft, refine and implement security policies, procedures and internal documentation required.",
  },
  {
    q: "What happens if I fail an audit?",
    a: "Every audit and certification process is preceded by a thorough security gap assessment and remediation support, which makes audit failure unlikely given our proven methodology.",
  },
  {
    q: "Do you work with startups and small businesses?",
    a: "Yes. We work with organizations of all sizes, adjusting our approach to their particular goals — from startups to global Fortune 500 organizations.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-y border-border bg-surface/30 py-28">
      <div className="mx-auto max-w-[1400px] px-6">
        <Reveal>
          <Eyebrow>FAQ</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight lg:text-[2.6rem]">
            Frequently Asked Questions
          </h2>
        </Reveal>

        <div className="mt-12 divide-y divide-border border-y border-border">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left transition-colors hover:text-primary"
                >
                  <span className="font-display text-lg font-medium">{f.q}</span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border">
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-3xl pb-7 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */
export function Cta() {
  return (
    <section id="contact" className="relative overflow-hidden py-32">
      <div className="pointer-events-none absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <h2 className="font-display text-4xl font-semibold tracking-tight lg:text-6xl">
            Move forward with confidence
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
            Don't let compliance delays hold you back from growing your business. Get in touch to talk
            it over with a CyberCrest expert.
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <motion.a
            href="mailto:sales@cybercrestcompliance.com"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="btn-glow mt-10 inline-flex rounded-full bg-foreground px-10 py-4 font-mono text-xs tracking-[0.18em] text-background"
          >
            TALK TO AN EXPERT
          </motion.a>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
const footerCols = [
  {
    title: "Compliance and Data Privacy",
    links: ["ISO 9001", "CMMC", "ISO 27001", "PCI DSS", "NIST 800-171", "SOC 2", "NIS 2", "HIPAA", "GDPR", "CCPA"],
  },
  {
    title: "Technical Services",
    links: [
      "PENETRATION TESTING",
      "CLOUD SECURITY ASSESSMENT",
      "SECURITY ASSESSMENT",
      "BUSINESS CONTINUITY & DR",
      "VULNERABILITY SCANNING",
    ],
  },
  { title: "Company", links: ["ABOUT US", "CONTACT", "BLOG"] },
  { title: "Contact", links: ["Encinitas, CA 92024", "sales@cybercrestcompliance.com", "+1 (800) 587-1250"] },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-20">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {footerCols.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-xs tracking-[0.18em] text-primary uppercase">{col.title}</h3>
              <ul className="mt-6 space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#top"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
          <span className="font-display text-lg font-bold tracking-tight">CYBERCREST</span>
          <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground">
            © 2026 Cybercrest Compliance Services. All rights reserved
          </span>
          <a href="#top" className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground hover:text-primary">
            PRIVACY POLICY
          </a>
        </div>
      </div>
    </footer>
  );
}
