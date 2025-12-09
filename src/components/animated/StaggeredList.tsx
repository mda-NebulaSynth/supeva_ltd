import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { staggerContainer, staggerItem, scrollViewport, getAnimationVariants } from '../../utils/animations';

interface StaggeredListProps {
    children: ReactNode;
    className?: string;
    staggerDelay?: number;
}

/**
 * Staggered list container for sequential item animations
 * Perfect for grids, lists, and repeating elements
 */
export const StaggeredList = ({
    children,
    className = '',
    staggerDelay = 0.1
}: StaggeredListProps) => {
    const containerVariants = getAnimationVariants(staggerContainer);

    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewport}
            variants={containerVariants}
            transition={{ staggerChildren: staggerDelay }}
        >
            {children}
        </motion.div>
    );
};

interface StaggeredItemProps {
    children: ReactNode;
    className?: string;
}

export const StaggeredItem = ({ children, className = '' }: StaggeredItemProps) => {
    const itemVariants = getAnimationVariants(staggerItem);

    return (
        <motion.div className={className} variants={itemVariants}>
            {children}
        </motion.div>
    );
};
