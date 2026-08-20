/**
 * @fileoverview Intersection Observer hook for scroll-triggered animations.
 */

import { useState, useEffect, useRef } from 'react';

/** Returns true once the referenced element enters the viewport (fires once). */
export function useOnScreen(ref, threshold = 0.2) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);
  return visible;
}

/** Wrapper that adds .animate-in class when the element scrolls into view. */
export function AnimateSection({ children, className = '', threshold, ...rest }) {
  const ref = useRef(null);
  const visible = useOnScreen(ref, threshold);
  return (
    <div ref={ref} className={`animate-section ${visible ? 'animate-in' : ''} ${className}`} {...rest}>
      {children}
    </div>
  );
}
