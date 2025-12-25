import Marquee from "react-fast-marquee";
import TestimonialCard from "../components/TestimonialCard";
import { testimonialsData } from "../data/testimonialsData";
import SectionTitle from "../components/SectionTitle";

export default function Testimonials() {
    // Only duplicate data if there are multiple items, otherwise keep it single
    const displayData = testimonialsData.length > 1 
        ? [...testimonialsData, ...testimonialsData] 
        : testimonialsData;

    return (
        <div className="py-16">
            <SectionTitle
                text1="Know about our team"
                text2="People connected with us"
                text3="Best professional teachers and team of peoples working behind to develop your musical skills"
            />

            {testimonialsData.length > 1 ? (
                <>
                    <Marquee className="max-w-6xl mx-auto mt-12" gradient={true} speed={30}>
                        <div className="flex items-center justify-center py-6">
                            {displayData.map((testimonial, index) => (
                                <TestimonialCard key={index} testimonial={testimonial} />
                            ))}
                        </div>
                    </Marquee>
                    
                    <Marquee className="max-w-6xl mx-auto mt-4" gradient={true} speed={30} direction="right">
                        <div className="flex items-center justify-center py-6">
                            {displayData.map((testimonial, index) => (
                                <TestimonialCard key={index} testimonial={testimonial} />
                            ))}
                        </div>
                    </Marquee>
                </>
            ) : (
                <div className="max-w-6xl mx-auto mt-12 flex justify-center">
                    <div className="py-6">
                        {testimonialsData.map((testimonial, index) => (
                            <TestimonialCard key={index} testimonial={testimonial} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
