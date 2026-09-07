"use client";

import { useEffect, useState } from "react";

export function ScrollProgressBar() {
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      if (scrollHeight > 0) {
        setScrollPercent((scrollTop / scrollHeight) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed top-0 left-0 right-0 z-50 h-[2px] w-full bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-[#7DA7D9] via-[#A5C3E8] to-[#C9A86A] transition-[width] duration-75 ease-out shadow-[0_0_8px_rgba(125,167,217,0.8)]"
        style={{ width: `${scrollPercent}%` }}
      />
    </div>
  );
}

export default ScrollProgressBar;
