import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Config/firebaseConfig';
import { Radio, ArrowLeft, Video } from 'lucide-react';

export default function EnrolledLiveCoursePage() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const courseRef = doc(db, 'liveCourses', courseId);
                const courseSnap = await getDoc(courseRef);
                if (courseSnap.exists()) {
                    setCourse({ id: courseSnap.id, ...courseSnap.data() });
                }
            } catch (error) {
                console.error('Error fetching course details:', error);
            } finally {
                setLoading(false);
            }
        };
        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><p>Loading session details...</p></div>;
    }

    if (!course) {
        return <div className="min-h-screen flex items-center justify-center"><p>Session not found.</p></div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 pt-24 pb-12">
            <div className="container mx-auto px-6 max-w-6xl">
                <Link to="/my-classroom" className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to My Classroom
                </Link>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <img src={course.imageUrl} alt={course.title} className="w-full h-64 object-cover"/>
                    <div className="p-8">
                        <h1 className="text-4xl font-extrabold text-gray-900">{course.title}</h1>
                        <p className="text-gray-600 mt-4 leading-relaxed">{course.description}</p>
                        
                        <div className="mt-8 border-t pt-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Session Access</h2>
                            <a 
                                href={course.meetingLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-3 text-center bg-red-500 text-white font-bold py-4 rounded-xl hover:bg-red-600 transition text-lg"
                            >
                                <Radio /> Join Live Session Now
                            </a>
                        </div>
                    </div>
                </div>
                
                {/* Full Width Video Section */}
                {course.recordedVideoUrl && (
                    <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-6 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Video className="text-purple-600" size={20} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Session Recording</h2>
                            </div>
                        </div>
                        <div className="w-full bg-black" style={{ aspectRatio: '16/9' }}>
                            <video 
                                src={course.recordedVideoUrl}
                                controls
                                className="w-full h-full"
                                controlsList="nodownload"
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
