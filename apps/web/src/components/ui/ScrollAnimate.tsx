"use client";

import React, { useEffect, useRef, useState } from "react";

export interface ScrollAnimateProps {
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  delayMs?: number;
  rootMargin?: string;
  threshold?: number;
}

export function ScrollAnimate({
  children,
  className = "scroll-trigger",
  activeClassName = "active",
  delayMs = 0,
  rootMargin = "300px 0px",
  threshold = 0.05,
}: ScrollAnimateProps) {
  const [isActive, setIsActive] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Graceful bypass for reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delayMs > 0) {
            setTimeout(() => setIsActive(true), delayMs);
          } else {
            setIsActive(true);
          }
        }
      },
      { rootMargin, threshold }
    );

    const currentRef = elementRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [delayMs, rootMargin, threshold]);

  return (
    <div
      ref={elementRef}
      className={`${className} ${isActive ? activeClassName : ""}`}
    >
      {children}
    </div>
  );
}
