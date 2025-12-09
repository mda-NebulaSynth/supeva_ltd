export interface BannerSlot {
    id: string;
    label: string;
    location: string;
    page: string;
    recommendedSize: {
        width: number;
        height: number;
    };
    description: string;
    aspectRatio: string;
}

export const BANNER_SLOTS: BannerSlot[] = [
    {
        id: 'homepage-hero',
        label: 'Homepage - Hero Banner',
        location: 'Top of homepage, between hero and featured projects',
        page: 'Homepage',
        recommendedSize: {
            width: 1200,
            height: 400
        },
        description: 'Large horizontal banner for maximum visibility',
        aspectRatio: '3:1'
    },
    {
        id: 'Homepage-Ad-1',
        label: 'Homepage - Between Sections',
        location: 'Between featured projects and testimonials',
        page: 'Homepage',
        recommendedSize: {
            width: 1200,
            height: 400
        },
        description: 'Wide banner in the middle of the homepage',
        aspectRatio: '3:1'
    },
    {
        id: 'projects-top',
        label: 'Projects Page - Top Banner',
        location: 'Top of projects page, after filters',
        page: 'Projects',
        recommendedSize: {
            width: 1200,
            height: 300
        },
        description: 'Horizontal banner above project listings',
        aspectRatio: '4:1'
    },
    {
        id: 'blog-top',
        label: 'Blog Page - Top Banner',
        location: 'Top of blog page, after filters',
        page: 'Blog',
        recommendedSize: {
            width: 1200,
            height: 300
        },
        description: 'Horizontal banner above blog posts',
        aspectRatio: '4:1'
    },
    {
        id: 'blog-sidebar',
        label: 'Blog - Sidebar Banner',
        location: 'Blog post sidebar (desktop only)',
        page: 'Blog Post',
        recommendedSize: {
            width: 300,
            height: 600
        },
        description: 'Vertical banner in blog sidebar',
        aspectRatio: '1:2'
    },
    {
        id: 'project-detail-top',
        label: 'Project Details - Top Banner',
        location: 'Top of project detail page',
        page: 'Project Details',
        recommendedSize: {
            width: 1200,
            height: 300
        },
        description: 'Banner above project details',
        aspectRatio: '4:1'
    },
    {
        id: 'footer-banner',
        label: 'Footer - Wide Banner',
        location: 'Above footer section (all pages)',
        page: 'Global',
        recommendedSize: {
            width: 1200,
            height: 200
        },
        description: 'Thin banner above the footer',
        aspectRatio: '6:1'
    }
];

export const getBannerSlot = (id: string): BannerSlot | undefined => {
    return BANNER_SLOTS.find(slot => slot.id === id);
};

export const getBannerSlotsByPage = (page: string): BannerSlot[] => {
    return BANNER_SLOTS.filter(slot => slot.page === page || slot.page === 'Global');
};
