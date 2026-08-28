import { motion } from "motion/react";
import heroShield from "@/assets/hero-shield.png";

const badges = ["GDPR", "ISO 9001:2015", "AICPA SOC 2", "PCI DSS", "ISO 27001", "CMMC", "CCPA"];
const orbits = ["Remediation", "Certification", "Compliance by design", "Compliance maintenance"];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-36 pb-20 lg:pt-44">
      <div className="pointer-events-none absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-16 px-6 lg:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <span className="h-px w-12 bg-primary/60" />
            <span className="eyebrow">Expert-led cybersecurity compliance services</span>
          </motion.div>

          <h1 className="mt-8 max-w-xl font-display text-5xl leading-[1.05] font-semibold tracking-tight lg:text-[4.2rem]">
            {["Elevate Your", "Cybersecurity", "Compliance"].map((line, i) => (
              <motion.span
                key={line}
                className="block"
                initial={{ opacity: 0, y: 34 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mt-7 max-w-lg text-base leading-relaxed text-muted-foreground"
          >
            CyberCrest is your trusted assessment and advisory partner with proven methodologies and
            dependable consultants to ensure your compliance and information security success.
          </motion.p>

          <motion.a
            href="#contact"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="btn-glow mt-10 inline-flex rounded-full bg-foreground px-9 py-4 font-mono text-xs tracking-[0.18em] text-background"
          >
            TALK TO AN EXPERT
          </motion.a>

          <div className="mt-16 flex flex-wrap gap-3">
            {badges.map((b, i) => (
              <motion.span
                key={b}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.85 + i * 0.06 }}
                className="rounded-full border border-border bg-surface/70 px-4 py-2 font-mono text-[10px] tracking-[0.16em] text-muted-foreground"
              >
                {b}
              </motion.span>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto aspect-square w-full max-w-[560px]"
        >
          <div className="pulse-ring absolute inset-0 rounded-full border border-primary/30" />
          <div className="absolute inset-[8%] rounded-full border border-border" />
          <div className="spin-slow absolute inset-0">
            <span className="absolute top-[6%] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary" />
            <span className="absolute bottom-[6%] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-accent" />
          </div>

          {orbits.map((o, i) => (
            <span
              key={o}
              className="absolute max-w-[9rem] font-display text-sm text-muted-foreground"
              style={{
                top: i < 2 ? "12%" : "auto",
                bottom: i >= 2 ? "12%" : "auto",
                left: i % 2 === 0 ? "-2%" : "auto",
                right: i % 2 === 1 ? "-2%" : "auto",
                textAlign: i % 2 === 1 ? "right" : "left",
              }}
            >
              {o}
            </span>
          ))}

          <img
            src={heroShield.src}
            alt="CyberCrest metallic shield emblem"
            width={1024}
            height={1024}
            className="float-slow relative h-full w-full object-contain p-[18%] drop-shadow-[0_0_60px_rgba(45,212,191,0.25)]"
          />
        </motion.div>
      </div>
    </section>
  );
}
