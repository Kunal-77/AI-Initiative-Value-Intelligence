"use client";

import React, { useState, useEffect, useRef } from "react";

export interface LazyViewportProps {
  children: React.ReactNode;
  placeholder: React.ReactNode;
  rootMargin?: string;
  minHeight?: string;
}

export function LazyViewport({
  children,
  placeholder,
  rootMargin = "300px 0px",
  minHeight = "200px",
}: LazyViewportProps) {
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasBeenVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true);
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
  }, [hasBeenVisible, rootMargin]);

  return (
    <div ref={containerRef} style={{ minHeight: hasBeenVisible ? "auto" : minHeight }}>
      {hasBeenVisible ? children : placeholder}
    </div>
  );
}
