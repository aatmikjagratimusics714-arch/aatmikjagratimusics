import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Config/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { CheckCircleIcon, ClockIcon, ArrowLeftIcon, VideoCameraIcon } from '@heroicons/react/24/solid';


// --- HELPER FUNCTION: Converts URLs to clickable links ---
const renderTextWithLinks = (text) => {
  if (!text) return null;

  // Regex to find URLs starting with http:// or https://
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return text.split(urlRegex).map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-white hover:text-indigo-200 break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};


export default function LiveClassInfoPage() {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
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
        console.error('Error fetching live course details: ', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center"><p>Live class not found.</p></div>;
  }

  const courseFeatures = [
      { icon: ClockIcon, text: "Interactive Live Session" },
      ...(course.validityDays ? [{
          icon: VideoCameraIcon,
          text: `${course.validityDays}-day access to recording`
      }] : []),
      { icon: CheckCircleIcon, text: 'Q&A with instructor' },
      { icon: CheckCircleIcon, text: 'Access on mobile and desktop' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white pt-24 pb-12">
        <div className="container mx-auto px-6 max-w-7xl">
          <Link to="/live-classes" className="inline-flex items-center text-indigo-100 hover:text-white transition mb-6">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Live Classes
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h1 className="text-4xl lg:text-5xl font-extrabold">{course.title}</h1>
              
              <div className="text-lg lg:text-xl text-indigo-100 mt-4 whitespace-pre-wrap">
                {renderTextWithLinks(course.description)}
              </div>

              <div className="mt-6 flex items-center">
                <span className="text-indigo-100">Hosted by</span>
                <span className="ml-2 font-semibold">{course.instructor}</span>
              </div>
            </div>
            
            {/* Purchase Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <img src={course.imageUrl} alt={course.title} className="w-full h-48 object-cover rounded-xl mb-6"/>
              <span className="text-4xl font-extrabold text-gray-900">{course.price}</span>
              <Link 
                to={currentUser ? `/checkout/live/${course.id}` : '/login'}
                className="w-full block text-center bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition text-lg mt-6"
              >
                Enroll Now
              </Link>
              <div className="border-t mt-6 pt-6">
                <p className="font-semibold text-gray-800 mb-3">This session includes:</p>
                <div className="space-y-2">
                  {courseFeatures.map((item, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-700">
                      <item.icon className="w-5 h-5 text-green-500 mr-3" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
