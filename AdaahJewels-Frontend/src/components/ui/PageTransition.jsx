/**
 * Page Transition Wrapper
 * 
 * Provides smooth fade/slide animations when navigating between pages.
 * Uses Framer Motion for professional micro-interactions.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * Animation variants for different page transition effects
 */
const pageVariants = {
  fadeInOut: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

/**
 * PageTransition Component
 * Wraps page content to provide smooth transitions
 * 
 * @param {React.ReactNode} children - Page content to animate
 * @param {string} variant - Animation style (fadeInOut, slideUp, slideDown, scaleIn)
 * @returns {JSX.Element} Animated page wrapper
 */
export const PageTransition = ({ 
  children, 
  variant = 'slideUp' 
}) => {
  const location = useLocation();
  const selectedVariant = pageVariants[variant] || pageVariants.slideUp;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={selectedVariant.initial}
        animate={selectedVariant.animate}
        exit={selectedVariant.exit}
        transition={selectedVariant.transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Stagger Container for animating multiple children
 * Useful for animating lists, grids of items
 * 
 * @param {React.ReactNode} children - Elements to stagger
 * @param {number} staggerDelay - Delay between item animations (ms)
 * @returns {JSX.Element} Stagger container
 */
export const StaggerContainer = ({ 
  children, 
  staggerDelay = 0.1 
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
};

/**
 * Hover Lift Animation
 * Applies a subtle lift + shadow effect on hover
 * 
 * @param {React.ReactNode} children - Content to animate
 * @param {boolean} enabled - Enable/disable animation
 * @returns {JSX.Element} Wrapped element with hover effect
 */
export const HoverLift = ({ 
  children, 
  enabled = true 
}) => {
  const variants = {
    initial: { y: 0, boxShadow: '0 4px 6px rgba(26, 26, 26, 0.1)' },
    hover: { 
      y: -4, 
      boxShadow: '0 20px 25px rgba(26, 26, 26, 0.15)',
      transition: { duration: 0.3, ease: 'easeOut' }
    },
  };

  if (!enabled) return children;

  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

/**
 * Bounce Animation for feedback
 * Used for add-to-cart or notification animations
 * 
 * @param {boolean} trigger - Trigger animation
 * @param {Function} onComplete - Callback when animation completes
 * @returns {JSX.Element} Animated element
 */
export const BounceAnimation = ({ 
  trigger, 
  onComplete, 
  children 
}) => {
  const bounceVariants = {
    initial: { scale: 1 },
    bounce: {
      scale: [1, 1.3, 0.9, 1.1, 1],
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      animate={trigger ? 'bounce' : 'initial'}
      variants={bounceVariants}
      onAnimationComplete={() => onComplete?.()}
    >
      {children}
    </motion.div>
  );
};

/**
 * Fade In When Visible
 * Triggers animation when element enters viewport
 * 
 * @param {React.ReactNode} children - Content to animate
 * @param {number} delay - Animation delay (ms)
 * @returns {JSX.Element} Lazy-animated element
 */
export const FadeInWhenVisible = ({ 
  children, 
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
