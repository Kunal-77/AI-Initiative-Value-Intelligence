"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Cpu,
  Tv,
  Music,
  Cloud,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "../ui/cn";

export interface SubscriptionOrbitProps {
  totalSpend: number;
  activeCount: number;
  categoryData: {
    name: string;
    count: number;
    monthlyCost: number;
    colorClass: string;
    icon: React.ComponentType<any>;
  }[];
  onHoverCategory?: (categoryName: string | null) => void;
  hoveredCategory?: string | null;
}

type OrbitNode = {
  name: string;
  icon: React.ComponentType<any>;
  angle: number;
  accent: string;
  glow: string;
  border: string;
  bg: string;
};

type NodeRuntime = {
  element: HTMLDivElement;
  config: OrbitNode;
};

/* ================================================================
   PREMIUM AIVI PALETTE
   No cyan / purple / neon gradients.
================================================================ */

const COLORS = {
  graphite: "#0B0D11",
  surface: "#11151C",
  elevated: "#171C24",
  raised: "#202630",

  steel: "#7DA7D9",
  champagne: "#C9A86A",
  silver: "#D9DEE7",
  muted: "#8F98A8",
  steelDark: "#6B8DB2",
};

const NODES: OrbitNode[] = [
  {
    name: "AI & Productivity",
    icon: Cpu,
    angle: -90,
    accent: COLORS.steel,
    glow: "rgba(125,167,217,.55)",
    border: "rgba(125,167,217,.48)",
    bg: "rgba(125,167,217,.10)",
  },
  {
    name: "Entertainment",
    icon: Tv,
    angle: -18,
    accent: COLORS.silver,
    glow: "rgba(217,222,231,.38)",
    border: "rgba(217,222,231,.38)",
    bg: "rgba(217,222,231,.08)",
  },
  {
    name: "Music",
    icon: Music,
    angle: 54,
    accent: COLORS.muted,
    glow: "rgba(143,152,168,.38)",
    border: "rgba(143,152,168,.38)",
    bg: "rgba(143,152,168,.08)",
  },
  {
    name: "Cloud & Software",
    icon: Cloud,
    angle: 126,
    accent: COLORS.steelDark,
    glow: "rgba(107,141,178,.45)",
    border: "rgba(107,141,178,.42)",
    bg: "rgba(107,141,178,.08)",
  },
  {
    name: "Other",
    icon: Layers,
    angle: 198,
    accent: COLORS.champagne,
    glow: "rgba(201,168,106,.48)",
    border: "rgba(201,168,106,.44)",
    bg: "rgba(201,168,106,.08)",
  },
];

const PARTICLES = [
  [12, 28, COLORS.steel],
  [21, 70, COLORS.champagne],
  [31, 18, COLORS.silver],
  [44, 78, COLORS.steel],
  [57, 17, COLORS.muted],
  [68, 74, COLORS.steelDark],
  [78, 30, COLORS.champagne],
  [88, 57, COLORS.steel],
  [73, 87, COLORS.champagne],
  [25, 88, COLORS.silver],
  [9, 53, COLORS.muted],
  [91, 36, COLORS.steel],
] as const;

export function SubscriptionOrbit({
  totalSpend,
  activeCount,
  categoryData,
  onHoverCategory,
  hoveredCategory,
}: SubscriptionOrbitProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<NodeRuntime[]>([]);

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const angleRef = useRef(0);
  const velocityRef = useRef(0.007);

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const currentHovered = hoveredCategory ?? hoveredNode;

  /* ================================================================
     CATEGORY DATA
  ================================================================= */

  const categoryMap = useMemo(() => {
    const map = new Map<
      string,
      {
        count: number;
        monthlyCost: number;
      }
    >();

    categoryData.forEach((item) => {
      map.set(item.name, {
        count: item.count,
        monthlyCost: item.monthlyCost,
      });
    });

    return map;
  }, [categoryData]);

  /* ================================================================
     REDUCED MOTION
  ================================================================= */

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const update = () => setReducedMotion(media.matches);

    update();

    media.addEventListener("change", update);

    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  /* ================================================================
     NODE REGISTRATION
  ================================================================= */

  const registerNode = useCallback(
    (config: OrbitNode, element: HTMLDivElement | null) => {
      if (!element) {
        return;
      }

      const exists = nodeRefs.current.some(
        (item) => item.element === element,
      );

      if (!exists) {
        nodeRefs.current.push({
          element,
          config,
        });
      }
    },
    [],
  );

  /* ================================================================
     NODE RENDERING
  ================================================================= */

  const renderNodes = useCallback(() => {
    const angle = angleRef.current;

    const radiusX = 42;
    const radiusY = 42;

    nodeRefs.current.forEach((runtime) => {
      const node = runtime.config;
      const element = runtime.element;

      if (!element.isConnected) {
        return;
      }

      const radians =
        ((node.angle + angle) * Math.PI) / 180;

      const x = Math.cos(radians) * radiusX;
      const y = Math.sin(radians) * radiusY;

      const isHovered = currentHovered === node.name;

      const scale = isHovered ? 1.12 : 1;
      const opacity = isHovered ? 1 : 0.88;

      element.style.left =
        `calc(50% + ${x}% - 22px)`;

      element.style.top =
        `calc(50% + ${y}% - 22px)`;

      element.style.transform =
        `translate3d(0,0,0) scale(${scale})`;

      element.style.opacity = String(opacity);

      element.style.filter = "none";
      element.style.zIndex = "80";

      element.style.setProperty(
        "--node-accent",
        node.accent,
      );

      element.style.setProperty(
        "--node-glow",
        node.glow,
      );
    });
  }, [currentHovered]);

  /* ================================================================
     ANIMATION
  ================================================================= */

  useEffect(() => {
    if (reducedMotion) {
      renderNodes();
      return;
    }

    let mounted = true;

    const animate = (time: number) => {
      if (!mounted) return;

      const last = lastTimeRef.current ?? time;

      const delta = Math.min(time - last, 40);

      lastTimeRef.current = time;

      const targetVelocity = 0.007;

      velocityRef.current +=
        (targetVelocity - velocityRef.current) * 0.05;

      angleRef.current =
        (angleRef.current -
          delta * velocityRef.current +
          360) %
        360;

      renderNodes();

      animationRef.current =
        requestAnimationFrame(animate);
    };

    animationRef.current =
      requestAnimationFrame(animate);

    return () => {
      mounted = false;

      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }

      animationRef.current = null;
      lastTimeRef.current = null;
    };
  }, [reducedMotion, renderNodes]);

  /* ================================================================
     HOVER
  ================================================================= */

  const handleNodeEnter = (name: string) => {
    setHoveredNode(name);
    onHoverCategory?.(name);
  };

  const handleNodeLeave = () => {
    setHoveredNode(null);
    onHoverCategory?.(null);
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative h-full w-full select-none touch-none cursor-default",
      )}
      style={{
        perspective: "1200px",
        perspectiveOrigin: "50% 50%",
      }}
    >
      {/* ==========================================================
          HEADER
      ========================================================== */}

      <div className="pointer-events-none absolute left-5 top-4 z-[100] flex items-center gap-2">
        <div
          className="
            flex h-6 w-6 items-center justify-center
            rounded-md
            border
            bg-[#171C24]
            text-[#7DA7D9]
          "
          style={{
            borderColor:
              "rgba(125,167,217,.28)",
            boxShadow:
              "0 0 14px rgba(125,167,217,.08)",
          }}
        >
          <Sparkles className="h-3.5 w-3.5" />
        </div>

        <span
          className="
            text-[9px]
            font-mono
            font-semibold
            uppercase
            tracking-[0.24em]
            text-[#7DA7D9]/75
          "
        >
          SUBSCRIPTION ECOSYSTEM
        </span>
      </div>

      {/* ==========================================================
          PARTICLES
      ========================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {PARTICLES.map(
          ([left, top, color], index) => (
            <span
              key={index}
              className="
                absolute
                h-[2px]
                w-[2px]
                rounded-full
              "
              style={{
                left: `${left}%`,
                top: `${top}%`,
                background: color as string,
                boxShadow:
                  `0 0 5px ${color}`,
                opacity: 0.32,
                animation: reducedMotion
                  ? undefined
                  : `orbitParticle ${3 +
                  (index % 4) * 0.8
                  }s ease-in-out ${index * 0.25
                  }s infinite alternate`,
              }}
            />
          ),
        )}
      </div>

      {/* ==========================================================
          AMBIENT CORE — STEEL BLUE
      ========================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[58%]
          w-[58%]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-[70px]
        "
        style={{
          background:
            "rgba(125,167,217,.035)",
        }}
      />

      {/* Small champagne atmospheric accent */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[34%]
          w-[34%]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-[60px]
        "
        style={{
          background:
            "rgba(201,168,106,.018)",
        }}
      />

      {/* ==========================================================
          ORBIT STAGE
      ========================================================== */}

      <div
        ref={stageRef}
        className="absolute inset-[11%]"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Outer ring */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            h-[94%]
            w-[94%]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            border
          "
          style={{
            borderColor:
              "rgba(125,167,217,.10)",
          }}
        />

        {/* Main ring */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            h-[84%]
            w-[84%]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            border
          "
          style={{
            borderColor:
              "rgba(217,222,231,.13)",
            boxShadow:
              "0 0 20px rgba(125,167,217,.025)",
          }}
        />

        {/* Champagne technical ring */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            h-[76%]
            w-[76%]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            border
          "
          style={{
            borderColor:
              "rgba(201,168,106,.12)",
          }}
        />

        {/* Inner steel ring */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            h-[70%]
            w-[70%]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            border
          "
          style={{
            borderColor:
              "rgba(125,167,217,.07)",
          }}
        />

        {/* ========================================================
            CATEGORY NODES
        ========================================================= */}

        {NODES.map((node) => {
          const Icon = node.icon;

          const data =
            categoryMap.get(node.name);

          const count = data?.count ?? 0;
          const spend =
            data?.monthlyCost ?? 0;

          const active =
            currentHovered === node.name;

          return (
            <div
              key={node.name}
              ref={(element) =>
                registerNode(node, element)
              }
              className="
                absolute
                left-1/2
                top-1/2
                h-11
                w-11
                will-change-transform
              "
              style={{
                transformStyle:
                  "preserve-3d",
              }}
              onPointerEnter={() =>
                handleNodeEnter(node.name)
              }
              onPointerLeave={
                handleNodeLeave
              }
            >
              {/* Node halo */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -inset-3
                  rounded-full
                  blur-md
                  transition-all
                  duration-500
                "
                style={{
                  background: node.glow,
                  opacity: active
                    ? 0.25
                    : 0.07,
                }}
              />

              {/* Node */}

              <div
                className="
                  relative
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  border
                  backdrop-blur-md
                  transition-all
                  duration-300
                "
                style={{
                  borderColor: active
                    ? node.accent
                    : node.border,

                  background:
                    `radial-gradient(
                      circle at 35% 30%,
                      ${node.bg},
                      rgba(11,13,17,.96)
                    )`,

                  boxShadow: active
                    ? `
                      0 0 20px ${node.glow},
                      inset 0 0 12px ${node.bg}
                    `
                    : `
                      0 0 8px ${node.glow}
                    `,
                }}
              >
                <Icon
                  className="h-4 w-4"
                  style={{
                    color: node.accent,
                    filter:
                      active
                        ? `drop-shadow(
                            0 0 4px ${node.glow}
                          )`
                        : "none",
                  }}
                />

                <span
                  className="
                    pointer-events-none
                    absolute
                    -inset-[4px]
                    rounded-full
                    border
                    border-dashed
                    opacity-20
                  "
                  style={{
                    borderColor:
                      node.accent,

                    animation: reducedMotion
                      ? undefined
                      : "spin 12s linear infinite",
                  }}
                />
              </div>

              {/* ==================================================
                  LABEL
              ================================================== */}

              <div
                className={cn(
                  "pointer-events-none absolute top-1/2 -translate-y-1/2",
                  "w-[112px]",
                  "transition-all duration-300",

                  node.angle === -90 ||
                    node.angle === -18 ||
                    node.angle === 54
                    ? "left-[54px] text-left"
                    : "right-[54px] text-right",
                )}
              >
                <div
                  className="
                    rounded-lg
                    border
                    bg-[#11151C]/90
                    px-2
                    py-1.5
                    backdrop-blur-md
                  "
                  style={{
                    borderColor: active
                      ? `${node.accent}45`
                      : "rgba(217,222,231,.06)",

                    boxShadow: active
                      ? `0 0 14px ${node.glow}18`
                      : "none",
                  }}
                >
                  <div
                    className="
                      text-[9px]
                      font-bold
                      leading-tight
                    "
                    style={{
                      color:
                        node.accent,
                    }}
                  >
                    {node.name}
                  </div>

                  <div
                    className="
                      mt-0.5
                      whitespace-nowrap
                      text-[8px]
                      font-mono
                      text-[#8F98A8]
                    "
                  >
                    ${spend.toFixed(2)}
                    {" • "}
                    {count}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* ========================================================
            CENTRAL AIVI CORE
        ========================================================= */}

        <div
          className="
            absolute
            left-1/2
            top-1/2
            z-[60]
            flex
            h-[190px]
            w-[190px]
            -translate-x-1/2
            -translate-y-1/2
            items-center
            justify-center
          "
        >
          {/* Outer atmospheric field */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              rounded-full
              blur-2xl
            "
            style={{
              background:
                "rgba(125,167,217,.025)",
            }}
          />

          {/* Steel outer ring */}

          <div
            className="
              pointer-events-none
              absolute
              inset-3
              rounded-full
              border
            "
            style={{
              borderColor:
                "rgba(125,167,217,.12)",

              animation: reducedMotion
                ? undefined
                : "spin 40s linear infinite",
            }}
          />

          {/* Champagne technical ring */}

          <div
            className="
              pointer-events-none
              absolute
              inset-5
              rounded-full
              border
              border-dashed
            "
            style={{
              borderColor:
                "rgba(201,168,106,.14)",

              animation: reducedMotion
                ? undefined
                : "spinReverse 30s linear infinite",
            }}
          />

          {/* Core */}

          <div
            className="
              relative
              flex
              h-[118px]
              w-[118px]
              flex-col
              items-center
              justify-center
              rounded-full
              border
              bg-[#0B0D11]/95
              backdrop-blur-xl
            "
            style={{
              borderColor:
                "rgba(125,167,217,.28)",

              boxShadow: `
                0 0 28px rgba(125,167,217,.10),
                inset 0 0 28px rgba(125,167,217,.035)
              `,
            }}
          >
            {/* Inner pulse */}

            <div
              className="
                pointer-events-none
                absolute
                inset-2
                rounded-full
                border
              "
              style={{
                borderColor:
                  "rgba(201,168,106,.10)",

                animation: reducedMotion
                  ? undefined
                  : "corePulse 4.5s ease-in-out infinite",
              }}
            />

            {/* ====================================================
                AIVI SHIELD
            ==================================================== */}

            <svg
              viewBox="0 0 100 100"
              className="
                relative
                z-10
                h-10
                w-10
              "
              style={{
                filter:
                  "drop-shadow(0 0 6px rgba(125,167,217,.32))",
              }}
            >
              <path
                d="
                  M50 8
                  L82 20
                  V49
                  C82 69 68 84 50 92
                  C32 84 18 69 18 49
                  V20
                  Z
                "
                fill="rgba(125,167,217,.025)"
                stroke="#7DA7D9"
                strokeWidth="2"
              />

              <path
                d="
                  M50 19
                  L70 27
                  V48
                  C70 61 61 71 50 77
                  C39 71 30 61 30 48
                  V27
                  Z
                "
                fill="none"
                stroke="#C9A86A"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />

              <path
                d="
                  M50 31
                  L59 43
                  L50 56
                  L41 43
                  Z
                "
                fill="none"
                stroke="#7DA7D9"
                strokeWidth="2"
              />

              <circle
                cx="50"
                cy="43"
                r="2.5"
                fill="#C9A86A"
              />
            </svg>

            <span
              className="
                relative
                z-10
                mt-1
                text-[18px]
                font-black
                tracking-[0.16em]
                text-[#F4F1EA]
              "
            >
              AIVI
            </span>

            <span
              className="
                relative
                z-10
                text-[6px]
                font-mono
                uppercase
                tracking-[0.4em]
                text-[#C9A86A]
              "
            >
              FINANCIAL CORE
            </span>

            <div
              className="
                relative
                z-10
                my-1.5
                h-px
                w-9
                bg-[#202630]
              "
            />

            <span
              className="
                relative
                z-10
                text-[7px]
                font-semibold
                uppercase
                tracking-[0.15em]
                text-[#8F98A8]
              "
            >
              {activeCount} SUBSCRIPTIONS
            </span>

            <span
              className="
                relative
                z-10
                mt-0.5
                font-mono
                text-[16px]
                font-bold
                text-[#7DA7D9]
              "
              style={{
                textShadow:
                  "0 0 8px rgba(125,167,217,.25)",
              }}
            >
              ${totalSpend.toFixed(2)}
            </span>
          </div>
        </div>

        {/* ========================================================
            BOTTOM PLATFORM
        ========================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            bottom-[2%]
            h-[24px]
            w-[62%]
            -translate-x-1/2
            rounded-[50%]
            border
            bg-[#7DA7D9]/[0.018]
          "
          style={{
            borderColor:
              "rgba(125,167,217,.18)",
            boxShadow:
              "0 0 18px rgba(125,167,217,.07)",
          }}
        />

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            bottom-[5%]
            h-[10px]
            w-[42%]
            -translate-x-1/2
            rounded-[50%]
            bg-[#7DA7D9]/[0.06]
            blur-md
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            bottom-[7%]
            h-px
            w-[32%]
            -translate-x-1/2
            bg-gradient-to-r
            from-transparent
            via-[#7DA7D9]/35
            to-transparent
          "
        />
      </div>

      {/* ==========================================================
          HOVER INFORMATION
      ========================================================== */}

      <div
        className={cn(
          "pointer-events-none absolute bottom-3 left-1/2 z-[100]",
          "-translate-x-1/2",
          "rounded-full border",
          "bg-[#11151C]/90 px-3 py-1",
          "font-mono text-[7px] uppercase tracking-[0.18em]",
          "text-[#8F98A8] backdrop-blur-sm",
          "transition-all duration-300",

          currentHovered
            ? "opacity-0"
            : "opacity-70",
        )}
        style={{
          borderColor:
            "rgba(217,222,231,.08)",
        }}
      >
        Hover orbit points to inspect categories
      </div>

      {/* ==========================================================
          LOCAL ANIMATIONS
      ========================================================= */}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes orbitParticle {
              0% {
                transform:
                  translate3d(0, 0, 0)
                  scale(0.75);
                opacity: 0.18;
              }

              100% {
                transform:
                  translate3d(3px, -4px, 0)
                  scale(1.15);
                opacity: 0.55;
              }
            }

            @keyframes corePulse {
              0%,
              100% {
                transform: scale(0.96);
                opacity: 0.30;
              }

              50% {
                transform: scale(1.03);
                opacity: 0.65;
              }
            }

            @keyframes spinReverse {
              from {
                transform: rotate(360deg);
              }

              to {
                transform: rotate(0deg);
              }
            }
          `,
        }}
      />
    </div>
  );
}