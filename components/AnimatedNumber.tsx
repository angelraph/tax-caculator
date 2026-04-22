'use client';

import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  format: (n: number) => string;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({ value, format, duration = 0.75, className }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(() => format(0));
  const prevRef = useRef(0);
  const formatRef = useRef(format);
  formatRef.current = format;

  useEffect(() => {
    const from = prevRef.current;
    const controls = animate(from, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(v) {
        setDisplay(formatRef.current(Math.round(v)));
      },
      onComplete() {
        prevRef.current = value;
      },
    });
    return () => controls.stop();
  }, [value, duration]);

  return <span className={className}>{display}</span>;
}
