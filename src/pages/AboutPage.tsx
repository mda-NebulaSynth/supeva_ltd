import { Target, Award, Users, TrendingUp, Building2, Heart, Shield, Zap } from 'lucide-react';
import { StaggeredList, StaggeredItem } from '../components/animated/StaggeredList';
import { SEO } from '../components/SEO';

export const AboutPage = () => {
    const values = [
        {
            icon: Shield,
            title: 'Trust & Integrity',
            description: 'We build lasting relationships through transparency and honesty in every transaction.'
        },
        {
            icon: Heart,
            title: 'Customer First',
            description: 'Your dreams and satisfaction are at the heart of everything we do.'
        },
        {
            icon: Zap,
            title: 'Innovation',
            description: 'Leveraging cutting-edge technology and modern design in every project.'
        },
        {
            icon: Award,
            title: 'Excellence',
            description: 'Committed to delivering the highest quality in construction and service.'
        }
    ];

    const stats = [
        { number: '500+', label: 'Happy Clients' },
        { number: '50+', label: 'Projects Completed' },
        { number: '15+', label: 'Years Experience' },
        { number: '98%', label: 'Client Satisfaction' }
    ];

    const milestones = [
        {
            year: '2009',
            title: 'Company Founded',
            description: 'Started with a vision to transform real estate development in Kenya.'
        },
        {
            year: '2012',
            title: 'First Major Project',
            description: 'Completed our first major residential complex in Nairobi.'
        },
        {
            year: '2016',
            title: 'Expansion',
            description: 'Expanded operations across major cities in Kenya.'
        },
        {
            year: '2020',
            title: 'Digital Innovation',
            description: 'Launched digital platforms for seamless client experience.'
        },
        {
            year: '2024',
            title: 'Sustainability Focus',
            description: 'Leading eco-friendly and sustainable development projects.'
        }
    ];

    return (
        <>
            <SEO
                title="About Us - Supeva Real Estate"
                description="Learn about Supeva's mission to provide quality, affordable housing solutions. Discover our values, expertise, and commitment to excellence in real estate development."
            />

            <div className="min-h-screen">
                {/* Hero Section */}
                <section className="relative py-20 bg-gradient-to-br from-primary-900 to-accent-900 text-white">
                    <div className="container-custom text-center">
                        <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 animate-fade-in">
                            About Supeva
                        </h1>
                        <p className="text-xl max-w-3xl mx-auto animate-slide-up">
                            Building dreams, creating communities, and transforming lives through innovative real estate solutions.
                        </p>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="section">
                    <div className="container-custom">
                        <StaggeredList className="grid md:grid-cols-2 gap-12">
                            <StaggeredItem>
                                <div className="card p-8">
                                    <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                                        <Target className="w-8 h-8 text-primary-600" />
                                    </div>
                                    <h2 className="text-3xl font-display font-bold mb-4">Our Mission</h2>
                                    <p className="text-gray-600 leading-relaxed">
                                        To provide quality, affordable housing solutions that empower individuals and families to own their dream homes. We are committed to excellence in construction, customer service, and community development.
                                    </p>
                                </div>
                            </StaggeredItem>

                            <StaggeredItem>
                                <div className="card p-8">
                                    <div className="w-16 h-16 bg-accent-100 rounded-lg flex items-center justify-center mb-6">
                                        <TrendingUp className="w-8 h-8 text-accent-600" />
                                    </div>
                                    <h2 className="text-3xl font-display font-bold mb-4">Our Vision</h2>
                                    <p className="text-gray-600 leading-relaxed">
                                        To be the leading real estate developer in Kenya, recognized for innovative designs, sustainable practices, and customer satisfaction. We envision communities where every family thrives in comfort and security.
                                    </p>
                                </div>
                            </StaggeredItem>
                        </StaggeredList>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="section bg-gradient-to-r from-primary-600 to-accent-600 text-white">
                    <div className="container-custom">
                        <StaggeredList className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <StaggeredItem key={index}>
                                    <div className="text-center">
                                        <div className="text-4xl md:text-5xl font-display font-bold mb-2">{stat.number}</div>
                                        <div className="text-lg text-white/90">{stat.label}</div>
                                    </div>
                                </StaggeredItem>
                            ))}
                        </StaggeredList>
                    </div>
                </section>

                {/* Core Values */}
                <section className="section">
                    <div className="container-custom">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-display font-bold mb-4">Our Core Values</h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                The principles that guide everything we do
                            </p>
                        </div>

                        <StaggeredList className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {values.map((value, index) => {
                                const Icon = value.icon;
                                return (
                                    <StaggeredItem key={index}>
                                        <div className="card p-6 hover:shadow-xl transition-shadow">
                                            <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                                                <Icon className="w-7 h-7 text-primary-600" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                                            <p className="text-gray-600">{value.description}</p>
                                        </div>
                                    </StaggeredItem>
                                );
                            })}
                        </StaggeredList>
                    </div>
                </section>

                {/* Our Story / Timeline */}
                <section className="section bg-gray-50">
                    <div className="container-custom">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-display font-bold mb-4">Our Journey</h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Milestones that shaped our story
                            </p>
                        </div>

                        <StaggeredList className="max-w-4xl mx-auto space-y-8">
                            {milestones.map((milestone, index) => (
                                <StaggeredItem key={index}>
                                    <div className="flex gap-6 md:gap-8">
                                        <div className="flex-shrink-0">
                                            <div className="w-20 h-20 md:w-24 md:h-24 bg-primary-600 text-white rounded-lg flex items-center justify-center">
                                                <span className="text-lg md:text-xl font-display font-bold">{milestone.year}</span>
                                            </div>
                                        </div>
                                        <div className="flex-grow card p-6">
                                            <h3 className="text-xl md:text-2xl font-bold mb-2">{milestone.title}</h3>
                                            <p className="text-gray-600">{milestone.description}</p>
                                        </div>
                                    </div>
                                </StaggeredItem>
                            ))}
                        </StaggeredList>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="section">
                    <div className="container-custom">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-display font-bold mb-4">Why Choose Supeva?</h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                What sets us apart in the real estate industry
                            </p>
                        </div>

                        <StaggeredList className="grid md:grid-cols-3 gap-8">
                            <StaggeredItem>
                                <div className="card p-8">
                                    <Building2 className="w-12 h-12 text-primary-600 mb-4" />
                                    <h3 className="text-xl font-bold mb-3">Quality Construction</h3>
                                    <p className="text-gray-600">
                                        We use premium materials and work with experienced contractors to ensure every project meets the highest standards.
                                    </p>
                                </div>
                            </StaggeredItem>

                            <StaggeredItem>
                                <div className="card p-8">
                                    <Users className="w-12 h-12 text-primary-600 mb-4" />
                                    <h3 className="text-xl font-bold mb-3">Expert Team</h3>
                                    <p className="text-gray-600">
                                        Our dedicated professionals bring decades of combined experience in real estate development and customer service.
                                    </p>
                                </div>
                            </StaggeredItem>

                            <StaggeredItem>
                                <div className="card p-8">
                                    <Award className="w-12 h-12 text-primary-600 mb-4" />
                                    <h3 className="text-xl font-bold mb-3">Proven Track Record</h3>
                                    <p className="text-gray-600">
                                        With hundreds of successful projects and satisfied clients, we've earned our reputation for excellence.
                                    </p>
                                </div>
                            </StaggeredItem>
                        </StaggeredList>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="section bg-gradient-to-br from-primary-600 to-accent-600 text-white">
                    <div className="container-custom text-center">
                        <h2 className="text-4xl font-display font-bold mb-6">
                            Ready to Find Your Dream Home?
                        </h2>
                        <p className="text-lg mb-8 max-w-2xl mx-auto">
                            Join hundreds of satisfied homeowners who trusted Supeva with their investment.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="/projects" className="btn bg-white text-primary-600 hover:bg-gray-100">
                                View Our Projects
                            </a>
                            <a href="/contact" className="btn bg-transparent border-2 border-white text-white hover:bg-white/10">
                                Contact Us
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};
