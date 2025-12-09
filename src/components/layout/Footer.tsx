import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, MessageCircle, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { AdSlot } from '../AdSlot';

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <>
            {/* Footer Banner */}
            <section className="py-8 bg-gray-100 border-t">
                <div className="container-custom">
                    <AdSlot id="footer-banner" className="max-w-6xl mx-auto" />
                </div>
            </section>

            <footer className="bg-gray-900 text-gray-300">
                <div className="container-custom py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Company Info */}
                    <div>
                        <Link to="/" className="flex items-center space-x-2 mb-6 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-display font-bold text-white">
                                Supeva
                            </span>
                        </Link>
                        <p className="text-gray-400 mb-6">
                            Your trusted partner in finding the perfect property. Building dreams, creating homes.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors duration-300"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors duration-300"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors duration-300"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors duration-300"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-display font-bold text-lg mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/projects" className="hover:text-primary-400 transition-colors duration-200">
                                    Our Projects
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-primary-400 transition-colors duration-200">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/team" className="hover:text-primary-400 transition-colors duration-200">
                                    Our Team
                                </Link>
                            </li>
                            <li>
                                <Link to="/blog" className="hover:text-primary-400 transition-colors duration-200">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-primary-400 transition-colors duration-200">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Projects */}
                    <div>
                        <h3 className="text-white font-display font-bold text-lg mb-6">Featured Projects</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/projects/furaha" className="hover:text-primary-400 transition-colors duration-200">
                                    Furaha Residences
                                </Link>
                            </li>
                            <li>
                                <Link to="/projects/zuri" className="hover:text-primary-400 transition-colors duration-200">
                                    Zuri Heights
                                </Link>
                            </li>
                            <li>
                                <Link to="/projects/marble-view" className="hover:text-primary-400 transition-colors duration-200">
                                    Marble View Estates
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-display font-bold text-lg mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-1" />
                                <span>123 Real Estate Avenue, Nairobi, Kenya</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                                <a href="tel:+254700000000" className="hover:text-primary-400 transition-colors duration-200">
                                    +254 700 000 000
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                                <a href="mailto:info@supeva.com" className="hover:text-primary-400 transition-colors duration-200">
                                    info@supeva.com
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <MessageCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
                                <a href="https://wa.me/254700000000" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors duration-200">
                                    WhatsApp
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="container-custom py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm">
                            © {currentYear} Supeva Sandbox. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <Link to="/privacy" className="hover:text-primary-400 transition-colors duration-200">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="hover:text-primary-400 transition-colors duration-200">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            </footer>
        </>
    );
};
