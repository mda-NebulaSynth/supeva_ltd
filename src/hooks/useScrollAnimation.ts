import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

/**
 * Custom hook for triggering animations on scroll using IntersectionObserver
 * Optimized for performance with proper cleanup
 */
export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
    const {
        threshold = 0.2,
        rootMargin = '0px 0px -100px 0px',
        triggerOnce = true
    } = options;

    const ref = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce && observer) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            {
                threshold,
                rootMargin
            }
        );

        observer.observe(element);

        return () => {
            if (observer && element) {
                observer.unobserve(element);
            }
        };
    }, [threshold, rootMargin, triggerOnce]);

    return { ref, isVisible };
};

/**
 * Hook for detecting if element is in viewport
 */
export const useInView = (options?: IntersectionObserverInit) => {
    const ref = useRef<HTMLElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            options
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [options]);

    return { ref, inView };
};

/**
 * Hook for parallax scroll effects
 */
export const useParallax = (speed: number = 0.5) => {
    const ref = useRef<HTMLElement>(null);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const handleScroll = () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * speed;
            setOffset(rate);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);

    return { ref, offset };
};

/**
 * Hook for scroll progress tracking
 */
export const useScrollProgress = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrolled = window.pageYOffset;
            const progress = (scrolled / documentHeight) * 100;
            setProgress(Math.min(progress, 100));
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial calculation

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return progress;
};
