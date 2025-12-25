import SectionTitle from "../components/SectionTitle";

export default function FeaturesSection() {
    const features = [
        {
            title: "🎥 HD Video Lessons",
            desc: "Crystal-clear, multi-angle video tutorials that break down every concept step by step, perfect for both beginners and intermediate learners.",
            img: "/assets/online-class.jpg",
        },
        {
            title: "🎓 Course Certificates",
            desc: "Earn a shareable certificate after completing the course to showcase your skills on resumes, portfolios, and social profiles.",
            img: "/assets/certificate.jpg",
        },
        {
            title: "📑 Downloadable Notes",
            desc: "Download neatly structured notes, sheet music, and practice material so you can revise anytime without needing to be online.",
            img: "/assets/notes.jpg",
        },
        {
            title: "💬 Doubt Support",
            desc: "Get your questions resolved quickly through dedicated doubt support so you never stay stuck on any topic for long.",
            img: "/assets/doubt.png",
        },
    ];

    return (
        <>
            <SectionTitle 
                text1="Features" 
                text2="Why Learn With Us?" 
                text3="Everything you need to master the piano in one secure, easy-to-use platform." 
            />

            <div className="flex flex-wrap items-center justify-center gap-10 px-10 mt-5">
                {features.map((feature, index) => (
                    <div key={index} className="max-w-80 hover:-translate-y-0.5 transition duration-300">
                        {/* Background image div */}
                        <div 
                            className="h-60 rounded-xl bg-cover bg-center  shadow-md"
                            style={{ backgroundImage: `url(${feature.img})` }}
                        ></div>

                        {/* Text outside the image */}
                        <h3 className="text-base font-semibold text-slate-700 mt-4">{feature.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </>
    );
}
