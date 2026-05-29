'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const stats = [
  { value: 10000, suffix: '+', label: 'Active Writers', prefix: '' },
  { value: 500000, suffix: '+', label: 'Words Generated', prefix: '' },
  { value: 50, suffix: '+', label: 'Content Templates', prefix: '' },
  { value: 99, suffix: '%', label: 'Uptime SLA', prefix: '' },
];

function AnimatedCounter({ target, suffix, prefix }: { target: number; suffix: string; prefix: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  const format = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(n >= 100000 ? 0 : 1) + 'K';
    return n.toString();
  };

  return (
    <span ref={ref} className="font-display text-5xl font-bold gradient-text">
      {prefix}{format(count)}{suffix}
    </span>
  );
}

export default function StatsSection() {
  return (
    <section className="py-24 bg-background border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="space-y-2">
              <AnimatedCounter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
