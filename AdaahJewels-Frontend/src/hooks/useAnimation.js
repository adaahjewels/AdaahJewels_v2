/**
 * Animation Utilities & Custom Hooks
 * 
 * Provides reusable animation helpers for common UI patterns:
 * - useCountUp: Animate numbers incrementally
 * - useScrollReveal: Reveal elements on scroll
 * - useBounceAnimation: Trigger bounce effects
 * - useLoadingAnimation: Control loading state
 */

import { useState, useEffect, useRef } from 'react';
import { useMotionValue, useTransform } from 'framer-motion';

/**
 * Count up animation for numbers
 * Useful for statistics, prices, counters
 * 
 * @param {number} from - Starting number
 * @param {number} to - Target number
 * @param {number} duration - Animation duration in ms
 * @param {Function} onComplete - Callback when animation completes
 * @returns {number} Current animated value
 */
export const useCountUp = (from = 0, to = 100, duration = 1000, onComplete) => {
  const [count, setCount] = useState(from);
  const countRef = useRef(null);

  useEffect(() => {
    const range = to - from;
    const increment = range / (duration / 16);
    let current = from;

    const timer = setInterval(() => {
      current += increment;
      if (current >= to) {
        setCount(to);
        clearInterval(timer);
        onComplete?.();
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [from, to, duration, onComplete]);

  return count;
};

/**
 * Bounce animation trigger
 * Use for cart additions, notifications, feedback
 * 
 * @param {boolean} trigger - Condition to trigger bounce
 * @returns {string} Animation state (trigger/reset)
 */
export const useBounceAnimation = (trigger = false) => {
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (trigger) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 600);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return bounce;
};

/**
 * Loading state animation
 * Manages loading transitions with smooth effects
 * 
 * @returns {Object} { isLoading, startLoading, stopLoading, reset }
 */
export const useLoadingAnimation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading && progress < 90) {
      const timer = setTimeout(() => {
        setProgress((p) => Math.min(p + Math.random() * 30, 90));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, progress]);

  return {
    isLoading,
    progress,
    startLoading: () => {
      setIsLoading(true);
      setProgress(10);
    },
    stopLoading: () => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 300);
    },
    reset: () => {
      setIsLoading(false);
      setProgress(0);
    },
  };
};

/**
 * Debounce hook
 * Useful for search inputs, resize handlers
 * 
 * @param {any} value - Value to debounce
 * @param {number} delay - Debounce delay in ms
 * @returns {any} Debounced value
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Smooth scroll animation
 * Handles smooth scrolling to elements
 * 
 * @param {string} selector - Element selector or ID
 * @param {number} offset - Offset from top in pixels
 */
export const useSmoothScroll = (selector, offset = 80) => {
  const scroll = () => {
    const element = document.querySelector(selector);
    if (element) {
      const top = element.offsetTop - offset;
      window.scrollTo({
        top,
        behavior: 'smooth',
      });
    }
  };

  return scroll;
};

/**
 * Scroll reveal animation
 * Detects when element enters viewport
 * 
 * @returns {Object} { ref, isVisible }
 */
export const useScrollReveal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return { ref, isVisible };
};

/**
 * Parallax scroll effect
 * Creates depth with different scroll speeds
 * 
 * @param {number} speed - Parallax speed multiplier (0-1)
 * @returns {Object} { style, ref }
 */
export const useParallax = (speed = 0.5) => {
  const [offset, setOffset] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    style: {
      transform: `translateY(${offset * speed}px)`,
    },
    ref,
  };
};

/**
 * Ripple effect on click
 * Material Design-style ripple animation
 * 
 * @returns {Object} { onMouseDown, ripples, handleClear }
 */
export const useRipple = () => {
  const [ripples, setRipples] = useState([]);

  const onMouseDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, ripple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
    }, 600);
  };

  return { onMouseDown, ripples };
};

/**
 * Keyboard shortcut handler
 * Useful for accessibility and power users
 * 
 * @param {string} key - Key combination (e.g., 'ctrl+k')
 * @param {Function} callback - Function to execute
 */
export const useKeyboardShortcut = (key, callback) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const keys = key.toLowerCase().split('+');
      const eventKey = e.key.toLowerCase();

      const ctrl = keys.includes('ctrl') && e.ctrlKey;
      const shift = keys.includes('shift') && e.shiftKey;
      const alt = keys.includes('alt') && e.altKey;
      const mainKey = keys[keys.length - 1] === eventKey;

      if (ctrl && shift && mainKey) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback]);
};
