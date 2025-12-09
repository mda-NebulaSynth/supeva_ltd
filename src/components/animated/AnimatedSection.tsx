import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';
import { fadeInUp, scrollViewport, getAnimationVariants } from '../../utils/animations';

interface AnimatedSectionProps {
    children: ReactNode;
    className?: string;
    variants?: Variants;
    delay?: number;
}

/**
 * Animated section component with scroll-triggered reveal
 * Uses Framer Motion's whileInView for performance
 */
export const AnimatedSection = ({
    children,
    className = '',
    variants = fadeInUp,
    delay = 0
}: AnimatedSectionProps) => {
    const animationVariants = getAnimationVariants(variants);

    return (
        <motion.section
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewport}
            variants={animationVariants}
            transition={{ delay }}
        >
            {children}
        </motion.section>
    );
};
