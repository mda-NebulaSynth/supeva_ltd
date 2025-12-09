import { useEffect } from 'react';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    ogUrl?: string;
}

export const SEO = ({
    title = 'Supeva Sandbox - Premium Real Estate',
    description = 'Discover your dream property with Supeva Sandbox. Premium real estate projects in prime locations.',
    keywords = 'real estate, property, homes, apartments, Kenya, Nairobi, Supeva',
    ogImage = '/og-image.jpg',
    ogUrl = window.location.href,
}: SEOProps) => {
    useEffect(() => {
        // Update title
        document.title = title;

        // Update or create meta tags
        const updateMetaTag = (name: string, content: string, isProperty = false) => {
            const attribute = isProperty ? 'property' : 'name';
            let element = document.querySelector(`meta[${attribute}="${name}"]`);

            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attribute, name);
                document.head.appendChild(element);
            }

            element.setAttribute('content', content);
        };

        // Standard meta tags
        updateMetaTag('description', description);
        updateMetaTag('keywords', keywords);

        // Open Graph tags
        updateMetaTag('og:title', title, true);
        updateMetaTag('og:description', description, true);
        updateMetaTag('og:image', ogImage, true);
        updateMetaTag('og:url', ogUrl, true);
        updateMetaTag('og:type', 'website', true);

        // Twitter Card tags
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', title);
        updateMetaTag('twitter:description', description);
        updateMetaTag('twitter:image', ogImage);
    }, [title, description, keywords, ogImage, ogUrl]);

    return null;
};
