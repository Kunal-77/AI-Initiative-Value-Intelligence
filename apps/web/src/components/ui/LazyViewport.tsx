"use client";

import React, { useState, useEffect, useRef } from "react";

export interface LazyViewportProps {
  children: React.ReactNode | (() => React.ReactNode);
  placeholder: React.ReactNode;
  rootMargin?: string;
  minHeight?: string;
  name?: string;
}

export function LazyViewport({
  children,
  placeholder,
  rootMargin = "200px 0px",
  minHeight = "200px",
  name = "Unnamed Section",
}: LazyViewportProps) {
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (hasBeenVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true);
          if (isDev) {
            console.log(`[LazyViewport] Mounted: ${name}`);
          }
        }
      },
      { rootMargin }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [hasBeenVisible, rootMargin, name, isDev]);

  return (
    <div ref={containerRef} style={{ minHeight: hasBeenVisible ? "auto" : minHeight }}>
      {hasBeenVisible
        ? typeof children === "function"
          ? (children as () => React.ReactNode)()
          : children
        : placeholder}
    </div>
  );
}

