"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export interface UseInViewOptions {
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

export function useInView({
  rootMargin = "200px 0px 200px 0px",
  threshold = 0,
  triggerOnce = true,
}: UseInViewOptions = {}) {
  const [inView, setInView] = useState(false);
  const [node, setNode] = useState<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback((nodeElement: Element | null) => {
    setNode(nodeElement);
  }, []);

  useEffect(() => {
    if (inView && triggerOnce) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) {
            observer.unobserve(node);
          }
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(node);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [node, rootMargin, threshold, triggerOnce, inView]);

  return [ref, inView] as const;
}
