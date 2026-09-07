"use client";

import React, { useRef, useState, useCallback } from "react";
import { cn } from "./cn";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  tiltEnabled?: boolean;
  tiltEffect?: boolean;
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(125, 167, 217, 0.12)",
  tiltEnabled = true,
  tiltEffect,
  ...props
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [transformStyle, setTransformStyle] = useState("");

  const isTilt = tiltEffect !== undefined ? tiltEffect : tiltEnabled;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!divRef.current) return;

      const rect = divRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setPosition({ x, y });
      setOpacity(1);

      if (isTilt) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4.5;
        const rotateY = ((x - centerX) / centerX) * 4.5;
        setTransformStyle(
          `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`
        );
      }
    },
    [isTilt]
  );

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
    if (isTilt) {
      setTransformStyle(
        "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
      );
    }
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: transformStyle ? "transform 0.15s ease-out" : "transform 0.4s ease-out",
      }}
      className={cn(
        "relative rounded-xl border border-white/[0.08] bg-[#11151C]/90 backdrop-blur-md overflow-hidden transition-colors hover:border-white/[0.18]",
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 z-10"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 45%)`,
        }}
      />
      <div className="relative z-20 h-full w-full">{children}</div>
    </div>
  );
}

export default SpotlightCard;
