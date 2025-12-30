import { Link } from "react-router-dom";
import { Mail, Phone, Instagram, Youtube, Facebook, MessageCircle } from "lucide-react";


export default function Footer() {
    return (
        <footer className="px-6 md:px-16 lg:px-24 xl:px-32 mt-40 w-full text-slate-600 border-t border-gray-200 pt-12">
            <div className="max-w-7xl mx-auto">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-gray-200">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-1">
                            <Link to="/">
                                <img src="/assets/logo.png" alt="Logo" className="h-10" />
                            </Link>
                            <Link to="/">
                                <h1 className="font-bold text-xl md:text-2xl text-indigo-600 hover:text-indigo-700 transition">
                                    Aatmik Jagrati Musics
                                </h1>
                            </Link>
                        </div>
                        <p className="mt-4 text-sm leading-relaxed">
                            Master your musical instrument with expert-led courses. Learn at your own pace with professional lessons and resources.
                        </p>
                        
                        {/* Social Links */}
                        <div className="flex gap-4 mt-6">
                            <a 
                                href="https://www.instagram.com/aatmik_jagrati_musics/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gradient-to-r hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300"
                                aria-label="Instagram"
                            >
                                <Instagram size={18} />
                            </a>
                            <a 
                                href="https://www.youtube.com/@AatmikJagratimusics" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-red-600 flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300"
                                aria-label="YouTube"
                            >
                                <Youtube size={18} />
                            </a>
                            <a 
                                href="https://www.facebook.com/people/Aatmik-jagrati-musics/61573999355501/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-600 flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300"
                                aria-label="Facebook"
                            >
                                <Facebook size={18} />
                            </a>
                            <a 
                                href="https://wa.me/918982836220" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-green-600 flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300"
                                aria-label="WhatsApp"
                            >
                                <MessageCircle size={18} />
                            </a>
                        </div>
                    </div>


                    {/* Quick Links */}
                    <div>
                        <h2 className="font-semibold mb-4 text-gray-800">Quick Links</h2>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/" className="hover:text-indigo-600 transition">Home</Link></li>
                            <li><Link to="/courses" className="hover:text-indigo-600 transition">Courses</Link></li>
                            <li><Link to="/my-courses" className="hover:text-indigo-600 transition">My Learning</Link></li>
                            <li><Link to="/login" className="hover:text-indigo-600 transition">Student Login</Link></li>
                            <li><Link to="/admin" className="hover:text-indigo-600 transition">Admin Panel</Link></li>
                        </ul>
                    </div>


                    {/* Contact Info */}
                    <div>
                        <h2 className="font-semibold mb-4 text-gray-800">Contact Us</h2>
                        <div className="space-y-3 text-sm">
                            <a href="tel:+918982836220" className="flex items-start gap-2 hover:text-indigo-600 transition group">
                                <Phone size={16} className="mt-0.5 flex-shrink-0" />
                                <span className="break-words">+91 8982836220</span>
                            </a>
                            <a href="mailto:ajmusicscontact714@gmail.com" className="flex items-start gap-2 hover:text-indigo-600 transition group">
                                <Mail size={16} className="mt-0.5 flex-shrink-0" />
                                <span className="break-words">ajmusicscontact714@gmail.com</span>
                            </a>
                            <a href="https://wa.me/918982836220" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-green-600 transition group">
                                <MessageCircle size={16} className="mt-0.5 flex-shrink-0" />
                                <span className="break-words">WhatsApp Chat</span>
                            </a>
                        </div>
                    </div>
                </div>


                {/* Bottom Bar */}
                <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                    <p className="text-center md:text-left">
                        © 2025 Aatmik Jagrati Musics. All Rights Reserved.
                    </p>
                    <div className="flex gap-6 text-center">
                        <Link to="/privacy" className="hover:text-indigo-600 transition">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-indigo-600 transition">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
