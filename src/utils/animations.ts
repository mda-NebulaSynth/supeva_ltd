import { Variants } from 'framer-motion';

/**
 * Animation configuration and utilities for Framer Motion
 * Optimized for 60+ FPS performance using transform and opacity only
 */

// Viewport configuration for scroll animations
export const scrollViewport = {
    once: true,
    amount: 0.2,
    margin: '0px 0px -100px 0px'
};

// Fade animations
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

export const fadeInDown: Variants = {
    hidden: { opacity: 0, y: -40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

export const fadeInLeft: Variants = {
    hidden: { opacity: 0, x: -40 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

export const fadeInRight: Variants = {
    hidden: { opacity: 0, x: 40 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

// Scale animations
export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
};

export const scaleInUp: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

// Stagger container for children animations
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
};

// Hover and tap animations for interactive elements
export const hoverScale = {
    scale: 1.05,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
};

export const hoverLift = {
    y: -8,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
};

export const tapScale = {
    scale: 0.95,
    transition: { duration: 0.1 }
};

// Page transition variants
export const pageTransition = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
            when: 'beforeChildren',
            staggerChildren: 0.1
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: { duration: 0.3 }
    }
};

// Slide animations
export const slideInLeft: Variants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

export const slideInRight: Variants = {
    hidden: { x: '100%', opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

// Card animations with shadow
export const cardHover = {
    y: -8,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
};

// Utility function to check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get animation variants with reduced motion support
export const getAnimationVariants = (variants: Variants): Variants => {
    if (prefersReducedMotion()) {
        return {
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.3 } }
        };
    }
    return variants;
};

// Performance optimization: will-change styles
export const willChangeTransform = {
    willChange: 'transform, opacity'
} as const;

// Easing functions
export const easings = {
    smooth: [0.22, 1, 0.36, 1],
    spring: [0.68, -0.55, 0.265, 1.55],
    ease: [0.25, 0.1, 0.25, 1],
    linear: [0, 0, 1, 1]
} as const;
