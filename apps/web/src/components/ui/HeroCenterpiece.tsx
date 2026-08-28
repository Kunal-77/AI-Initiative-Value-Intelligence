"use client";

import React, { useState, useRef } from "react";
import { Sparkles } from "lucide-react";

export function HeroCenterpiece() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Relative position from the center (-0.5 to 0.5)
    const relX = (e.clientX - rect.left) / width - 0.5;
    const relY = (e.clientY - rect.top) / height - 0.5;
    
    // Calculate rotation tilt (tilt up to 15 degrees)
    setRotateX(-relY * 15);
    setRotateY(relX * 15);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative mx-auto aspect-square w-full max-w-[460px] flex items-center justify-center select-none cursor-pointer group"
      style={{
        perspective: "1000px"
      }}
    >
      {/* Outer Orbit Ring */}
      <div 
        className="absolute rounded-full border border-primary/20 aspect-square w-[82%] transition-transform duration-300 pointer-events-none"
        style={{
          transform: `rotateX(${rotateX * 0.4}deg) rotateY(${rotateY * 0.4}deg)`
        }}
      >
        {/* Glowing Points around orbit (Top, Right, Bottom, Left) */}
        {/* Top point */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(20,184,166,0.8)] animate-pulse" />
          <span className="absolute top-3.5 font-mono text-[8px] tracking-[0.16em] text-muted-foreground whitespace-nowrap">
            ROI MODELER
          </span>
        </div>

        {/* Right point */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 flex items-center">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(20,184,166,0.8)] animate-pulse" />
          <span className="absolute right-3.5 font-mono text-[8px] tracking-[0.16em] text-muted-foreground whitespace-nowrap">
            RISK CONTROL
          </span>
        </div>

        {/* Bottom point */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex flex-col items-center">
          <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(223,130,56,0.8)] animate-pulse" />
          <span className="absolute bottom-3.5 font-mono text-[8px] tracking-[0.16em] text-muted-foreground whitespace-nowrap">
            LEDGER SYNC
          </span>
        </div>

        {/* Left point */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 flex items-center">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(20,184,166,0.8)] animate-pulse" />
          <span className="absolute left-3.5 font-mono text-[8px] tracking-[0.16em] text-muted-foreground whitespace-nowrap">
            MODEL REGISTRY
          </span>
        </div>
      </div>

      {/* Inner subtle orbit ring */}
      <div 
        className="absolute rounded-full border border-border/30 aspect-square w-[66%] pointer-events-none transition-transform duration-300"
        style={{
          transform: `rotateX(${rotateX * 0.2}deg) rotateY(${rotateY * 0.2}deg)`
        }}
      />

      {/* 3D Rotating Logo Centerpiece */}
      <div
        className="relative w-40 h-40 transition-all duration-300 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
        }}
      >
        {/* Continuous horizontal rotation container */}
        <div
          className="w-full h-full animate-[spin-y-slow_16s_linear_infinite]"
          style={{
            transformStyle: "preserve-3d"
          }}
        >
          {/* Layered SVG faces for 3D thickness */}
          {[...Array(6)].map((_, i) => {
            const zTranslate = -i * 2;
            const opacity = 1 - i * 0.15;
            return (
              <div
                key={i}
                className="absolute inset-0 w-full h-full"
                style={{
                  transform: `translateZ(${zTranslate}px)`,
                  opacity: opacity,
                  filter: i > 0 ? "brightness(0.65)" : "none",
                  backfaceVisibility: "visible"
                }}
              >
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full drop-shadow-[0_0_20px_rgba(20,184,166,0.25)]"
                >
                  <defs>
                    <linearGradient id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="oklch(0.78 0.13 190)" />
                      <stop offset="100%" stopColor="oklch(0.62 0.15 210)" />
                    </linearGradient>
                    <filter id={`glow-${i}`}>
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Interlocked Tech Diamond Geometry Background */}
                  <polygon
                    points="100,20 170,90 100,160 30,90"
                    fill="none"
                    stroke={`url(#grad-${i})`}
                    strokeWidth="1.5"
                    strokeOpacity="0.35"
                  />

                  {/* Dynamic Inner glowing accents */}
                  <polygon
                    points="100,45 145,90 100,135 55,90"
                    fill="none"
                    stroke={`url(#grad-${i})`}
                    strokeWidth="1"
                    strokeDasharray="6,4"
                    strokeOpacity="0.25"
                  />

                  {/* Stylized AIVI Monogram spelling out the text */}
                  {/* A */}
                  <path
                    d="M 44 110 L 58 70 L 72 110"
                    fill="none"
                    stroke={`url(#grad-${i})`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 50 100 L 66 100"
                    fill="none"
                    stroke={`url(#grad-${i})`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* I */}
                  <path
                    d="M 86 70 L 86 110"
                    fill="none"
                    stroke={`url(#grad-${i})`}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  {/* V */}
                  <path
                    d="M 100 70 L 114 110 L 128 70"
                    fill="none"
                    stroke={`url(#grad-${i})`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* I */}
                  <path
                    d="M 142 70 L 142 110"
                    fill="none"
                    stroke={`url(#grad-${i})`}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  {/* Floating Glowing Particle Center */}
                  <circle
                    cx="100"
                    cy="90"
                    r="4"
                    fill="oklch(0.78 0.13 190)"
                    filter={`url(#glow-${i})`}
                  />
                </svg>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
