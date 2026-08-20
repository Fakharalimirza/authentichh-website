import { useState, useEffect, useRef } from 'react';

export default function StatCounter({ target, suffix = '', label, decimal = false }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const duration = 2000;
          const start = performance.now();
          const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(decimal ? parseFloat((eased * target).toFixed(1)) : Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, decimal]);

  return (
    <div className="stat-item" ref={ref}>
      <div className="stat-number">
        {count}{suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
