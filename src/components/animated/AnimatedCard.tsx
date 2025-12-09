import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { scaleIn, tapScale, scrollViewport, getAnimationVariants } from '../../utils/animations';

interface AnimatedCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    enableHover?: boolean;
}

/**
 * Animated card component with hover effects
 * Optimized for performance with transform-only animations
 */
export const AnimatedCard = ({
    children,
    className = '',
    delay = 0,
    enableHover = true
}: AnimatedCardProps) => {
    const animationVariants = getAnimationVariants(scaleIn);

    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewport}
            variants={animationVariants}
            transition={{ delay }}
            whileHover={enableHover ? { y: -8 } : undefined}
            whileTap={enableHover ? tapScale : undefined}
            style={{ willChange: 'transform, opacity' }}
        >
            {children}
        </motion.div>
    );
};
