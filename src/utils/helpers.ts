import { differenceInDays, parseISO } from 'date-fns';

/**
 * Check if a project is a new listing (created within last 14 days)
 */
export const isNewListing = (createdAt: string): boolean => {
    const created = parseISO(createdAt);
    const daysDiff = differenceInDays(new Date(), created);
    return daysDiff <= 14;
};

/**
 * Check if a blog post is new (published within last 7 days)
 */
export const isNewPost = (publishedAt: string): boolean => {
    const published = parseISO(publishedAt);
    const daysDiff = differenceInDays(new Date(), published);
    return daysDiff <= 7;
};

/**
 * Format price with currency
 */
export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
    }).format(price);
};

/**
 * Format price range
 */
export const formatPriceRange = (min: number, max: number): string => {
    return `${formatPrice(min)} - ${formatPrice(max)}`;
};

/**
 * Generate slug from title
 */
export const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};

/**
 * Format date for display
 */
export const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};
