import { useState, useEffect } from 'react';
import { Mail, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { StaggeredList, StaggeredItem } from '../components/animated/StaggeredList';
import { SEO } from '../components/SEO';

type TeamMember = Database['public']['Tables']['team_members']['Row'];

export const TeamPage = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    const fetchTeamMembers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('team_members')
                .select('*')
                .order('order', { ascending: true });

            if (error) throw error;
            setTeamMembers(data || []);
        } catch (error) {
            console.error('Error fetching team members:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <SEO
                title="Our Team - Supeva Real Estate"
                description="Meet the dedicated professionals behind Supeva. Our experienced team is committed to helping you find your dream home."
            />

            <div className="min-h-screen">
                {/* Hero Section */}
                <section className="relative py-20 bg-gradient-to-br from-primary-900 to-accent-900 text-white">
                    <div className="container-custom text-center">
                        <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 animate-fade-in">
                            Meet Our Team
                        </h1>
                        <p className="text-lg max-w-3xl mx-auto animate-slide-up">
                            Dedicated professionals committed to turning your real estate dreams into reality. Our team brings expertise, passion, and personalized service to every client.
                        </p>
                    </div>
                </section>

                {/* Team Members Grid */}
                <section className="section">
                    <div className="container-custom">
                        {loading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="card overflow-hidden animate-pulse">
                                        <div className="h-80 bg-gray-200"></div>
                                        <div className="p-6 space-y-3">
                                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-4 bg-gray-200 rounded"></div>
                                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : teamMembers.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-lg text-gray-500">No team members found.</p>
                            </div>
                        ) : (
                            <StaggeredList className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {teamMembers.map((member) => (
                                    <StaggeredItem key={member.id}>
                                        <div className="group card overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                            {/* Member Image */}
                                            <div className="relative h-80 overflow-hidden">
                                                <img
                                                    src={member.image}
                                                    alt={member.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            </div>

                                            {/* Member Info */}
                                            <div className="p-6">
                                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                                                    {member.name}
                                                </h3>
                                                <p className="text-primary-600 font-medium mb-4">
                                                    {member.role}
                                                </p>
                                                <p className="text-gray-600 mb-6 line-clamp-3">
                                                    {member.bio}
                                                </p>

                                                {/* Contact Info */}
                                                <div className="space-y-2 pt-4 border-t border-gray-100">
                                                    <a
                                                        href={`mailto:${member.email}`}
                                                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                                                    >
                                                        <Mail className="w-4 h-4 flex-shrink-0" />
                                                        <span className="truncate">{member.email}</span>
                                                    </a>
                                                    <a
                                                        href={`tel:${member.phone}`}
                                                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                                                    >
                                                        <Phone className="w-4 h-4 flex-shrink-0" />
                                                        <span>{member.phone}</span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </StaggeredItem>
                                ))}
                            </StaggeredList>
                        )}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="section bg-gradient-to-br from-primary-600 to-accent-600 text-white">
                    <div className="container-custom text-center">
                        <h2 className="text-4xl font-display font-bold mb-6">
                            Want to Join Our Team?
                        </h2>
                        <p className="text-lg mb-8 max-w-2xl mx-auto">
                            We're always looking for talented individuals who share our passion for real estate excellence.
                        </p>
                        <a
                            href="/contact"
                            className="btn bg-white text-primary-600 hover:bg-gray-100"
                        >
                            Get In Touch
                        </a>
                    </div>
                </section>
            </div>
        </>
    );
};
