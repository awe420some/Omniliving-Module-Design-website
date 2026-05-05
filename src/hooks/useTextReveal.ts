'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';

interface UseTextRevealOptions {
  delay?: number;
  duration?: number;
  splitBy?: 'word' | 'char';
  threshold?: number;
  stagger?: number;
}

interface TextRevealControls {
  isVisible: boolean;
  segments: string[];
  getAnimationProps: (index: number) => {
    initial: { opacity: number; y: number };
    animate: { opacity: number; y: number };
    transition: { duration: number; delay: number; ease: string };
  };
}

export function useTextReveal(
  ref: React.RefObject<HTMLElement | null>,
  text: string,
  options: UseTextRevealOptions = {},
): TextRevealControls {
  const {
    delay = 0,
    duration = 0.5,
    splitBy = 'word',
    threshold = 0.2,
    stagger = 0.05,
  } = options;

  const [isVisible, setIsVisible] = useState(false);

  const segments = useMemo(() => {
    if (splitBy === 'char') {
      return text.split('');
    }
    return text.split(' ');
  }, [text, splitBy]);

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      });
    },
    [],
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(observerCallback, {
      threshold,
      rootMargin: '0px 0px -50px 0px',
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, observerCallback, threshold]);

  const getAnimationProps = useCallback(
    (index: number) => ({
      initial: { opacity: 0, y: 20 },
      animate: isVisible
        ? { opacity: 1, y: 0 }
        : { opacity: 0, y: 20 },
      transition: {
        duration,
        delay: delay + index * stagger,
        ease: 'easeOut',
      },
    }),
    [isVisible, delay, duration, stagger],
  );

  return {
    isVisible,
    segments,
    getAnimationProps,
  };
}
