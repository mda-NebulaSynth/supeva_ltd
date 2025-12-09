import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';

export const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error: submitError } = await supabase
                .from('contact_submissions')
                .insert(formData as any);

            if (submitError) throw submitError;

            setSuccess(true);
            setFormData({ name: '', email: '', phone: '', message: '' });
            setTimeout(() => setSuccess(false), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <>
            <SEO
                title="Contact Us - Supeva Sandbox"
                description="Get in touch with Supeva Sandbox. We're here to help you find your dream property."
            />

            {/* Hero Section */}
            <section className="relative py-20 bg-gradient-to-br from-primary-900 to-accent-900 text-white">
                <div className="container-custom">
                    <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 animate-fade-in">
                        Contact Us
                    </h1>
                    <p className="text-xl max-w-2xl animate-slide-up">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>
            </section>

            {/* Contact Section */}
            <section className="section">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div>
                            <h2 className="text-3xl font-display font-bold mb-6">Get in Touch</h2>
                            <p className="text-gray-600 mb-8">
                                Our team is ready to assist you with any inquiries about our properties or services.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-1">Visit Us</h3>
                                        <p className="text-gray-600">123 Real Estate Avenue, Nairobi, Kenya</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-1">Call Us</h3>
                                        <p className="text-gray-600">+254 700 000 000</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-1">Email Us</h3>
                                        <p className="text-gray-600">info@supeva.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MessageCircle className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-1">WhatsApp</h3>
                                        <a
                                            href="https://wa.me/254700000000"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
                                        >
                                            +254 700 000 000
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="card p-8">
                            <h2 className="text-2xl font-display font-bold mb-6">Send us a Message</h2>

                            {success && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-green-800">Message sent successfully! We'll get back to you soon.</p>
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="+254 700 000 000"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={5}
                                        className="textarea"
                                        placeholder="Tell us about your requirements..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn btn-primary disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
