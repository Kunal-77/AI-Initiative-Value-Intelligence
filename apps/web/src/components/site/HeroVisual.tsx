import heroShield from "@/assets/hero-shield.png";

const orbits = ["Portfolio ROI", "Governance", "Value by design", "Continuous assurance"];

export function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px] hero-entrance-dashboard">

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
        alt="Beta AIVI value intelligence shield emblem"
        width={1024}
        height={1024}
        className="float-slow relative h-full w-full object-contain p-[18%] drop-shadow-[0_0_60px_rgba(45,212,191,0.25)]"
      />
    </div>
  );
}

export default HeroVisual;
