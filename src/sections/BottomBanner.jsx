import { YoutubeIcon, Instagram, Facebook, MessageCircle } from "lucide-react";


export default function BottomBanner() {
    return (
        <div className="border-y border-dashed border-slate-200 w-full max-w-5xl mx-auto mt-28 px-16">
            <div className="flex flex-col text-center items-center gap-8 px-3 md:px-10 border-x border-dashed border-slate-200 py-20 -mt-10 -mb-10 w-full">
                <p className="text-xl font-medium max-w-2xl">
                    Join thousands of learners mastering music step by step with us. Connect with our community!
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-4">
                    {/* Instagram*/}
                    <a 
                        href="https://www.instagram.com/aatmik_jagrati_musics/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-md py-3 px-5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 transition text-white shadow-md hover:shadow-lg"
                    >
                        <Instagram size={20} />
                        <span>Instagram</span>
                    </a>


                    {/* YouTube */}
                    <a 
                        href="https://www.youtube.com/@AatmikJagratimusics" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-md py-3 px-5 bg-red-600 hover:bg-red-700 transition text-white shadow-md hover:shadow-lg"
                    >
                        <YoutubeIcon size={20} />
                        <span>YouTube</span>
                    </a>


                    {/* Facebook */}
                    <a 
                        href="https://www.facebook.com/people/Aatmik-jagrati-musics/61573999355501/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-md py-3 px-5 bg-blue-600 hover:bg-blue-700 transition text-white shadow-md hover:shadow-lg"
                    >
                        <Facebook size={20} />
                        <span>Facebook</span>
                    </a>


                    {/* WhatsApp */}
                    <a 
                        href="https://wa.me/918982836220" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-md py-3 px-5 bg-green-600 hover:bg-green-700 transition text-white shadow-md hover:shadow-lg"
                    >
                        <MessageCircle size={20} />
                        <span>WhatsApp</span>
                    </a>
                </div>


                <p className="text-sm text-gray-500 mt-2">
                    Follow us for daily tips, tutorials, and exclusive content!
                </p>
            </div>
        </div>
    );
}
