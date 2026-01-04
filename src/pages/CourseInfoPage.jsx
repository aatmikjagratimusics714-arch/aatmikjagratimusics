/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Config/firebaseConfig';
import { useAuth } from '../context/AuthContext';
// Added ChatBubbleLeftRightIcon
import { 
  LockClosedIcon, 
  CheckCircleIcon, 
  PlayCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/solid';

export default function CourseInfoPage() {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedLevels, setExpandedLevels] = useState({});

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);

        if (courseSnap.exists()) {
          const courseData = { id: courseSnap.id, ...courseSnap.data() };
          setCourse(courseData);
          if (courseData.levels && courseData.levels.length > 0) {
            setExpandedLevels({ [courseData.levels[0].id]: true });
          }
        }
      } catch (error) {
        console.error('Error fetching course details: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  // --- NEW FUNCTION: Handle WhatsApp Demo Request ---
  const handleDemoRequest = () => {
    const phoneNumber = "918982836220";
    const message = `Hello, I would like to request a demo for the course: "${course.title}".`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const toggleLevel = (levelId) => {
    setExpandedLevels(prev => ({ ...prev, [levelId]: !prev[levelId] }));
  };

  const getTotalStats = () => {
    let totalLessons = 0;
    let totalDuration = 0;
    
    course?.levels?.forEach(level => {
      level.chapters?.forEach(chapter => {
        totalLessons += chapter.topics?.length || 0;
        chapter.topics?.forEach(topic => {
          if (topic.duration) {
            const minutes = parseInt(topic.duration) || 0;
            totalDuration += minutes;
          }
        });
      });
    });

    return { totalLessons, totalDuration };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Course Not Found</h1>
          <Link to="/courses" className="text-indigo-600 hover:underline">← Back to Courses</Link>
        </div>
      </div>
    );
  }

  const stats = getTotalStats();
  
  const courseFeatures = [
      { 
          icon: ClockIcon, 
          text: course.courseDuration 
              ? `${course.courseDuration} of content` 
              : `${Math.floor(stats.totalDuration / 60)}+ hours on-demand video` 
      },
      ...(course.validityDays ? [{
          icon: CheckCircleIcon,
          text: `${course.validityDays}-day access`
      }] : [{
          icon: CheckCircleIcon,
          text: 'Full lifetime access'
      }]),
      { icon: CheckCircleIcon, text: 'Access on mobile and desktop' },
      { icon: CheckCircleIcon, text: 'Certificate of completion' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white pt-24 pb-12 sm:pt-32 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <Link 
            to="/courses" 
            className="inline-flex items-center text-indigo-100 hover:text-white transition mb-4 sm:mb-6 text-sm sm:text-base"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
            <div className="lg:col-span-2">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-3 sm:mb-4">
                {course.title}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-indigo-100 mb-4 sm:mb-6 leading-relaxed">
                {course.description || 'Master the fundamentals and advance your skills with this comprehensive course.'}
              </p>
              
              <div className="mt-4 sm:mt-6 flex items-center text-sm sm:text-base">
                <span className="text-indigo-100">Created by</span>
                <span className="ml-2 font-semibold">{course.instructor}</span>
              </div>
            </div>

            {/* Mobile Card */}
            <div className="lg:hidden">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6">
                <img 
                  src={course.imageUrl} 
                  alt={course.title} 
                  className="w-full h-40 sm:h-48 object-cover rounded-lg sm:rounded-xl mb-4 sm:mb-6"
                />
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-baseline gap-2 sm:gap-3">
                    <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">{course.price}</span>
                    {course.originalPrice && (
                      <span className="text-base sm:text-lg text-gray-400 line-through">{course.originalPrice}</span>
                    )}
                  </div>
                </div>
                
                <Link 
                  to={currentUser ? `/checkout/course/${course.id}` : '/login'} 
                  className="w-full block text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 sm:py-4 rounded-lg sm:rounded-xl hover:shadow-lg hover:scale-[1.02] transition text-base sm:text-lg mb-4"
                >
                  Enroll Now
                </Link>

                {/* --- NEW BUTTON (Mobile): Request Demo --- */}
                <button
                  onClick={handleDemoRequest}
                  className="w-full flex items-center justify-center border-2 border-indigo-600 text-indigo-600 font-bold py-3 sm:py-4 rounded-lg sm:rounded-xl hover:bg-indigo-50 transition text-base sm:text-lg mb-6"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  Request a Demo
                </button>

                <div className="border-t border-gray-200 pt-4 sm:pt-6">
                  <p className="font-semibold text-gray-800 text-sm mb-3">This course includes:</p>
                  <div className="space-y-2">
                    {courseFeatures.map((item, idx) => (
                      <div key={idx} className="flex items-center text-xs sm:text-sm text-gray-700">
                        <item.icon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Course Curriculum</h2>
                <div className="text-xs sm:text-sm text-gray-600">
                  <span className="font-semibold">{course.levels?.length || 0}</span> sections • 
                  <span className="font-semibold ml-1">{stats.totalLessons}</span> lessons • 
                  <span className="font-semibold ml-1">{Math.floor(stats.totalDuration / 60)}h {stats.totalDuration % 60}m</span>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {course.levels?.map((level, levelIdx) => (
                  <div key={level.id} className="border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden hover:border-indigo-300 transition">
                    <button
                      onClick={() => toggleLevel(level.id)}
                      className="w-full flex items-center justify-between p-3 sm:p-4 lg:p-5 bg-gradient-to-r from-gray-50 to-white hover:from-indigo-50 hover:to-purple-50 transition"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold mr-2 sm:mr-3 lg:mr-4 flex-shrink-0 text-sm sm:text-base">
                          {levelIdx + 1}
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg truncate">{level.title}</h3>
                          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                            {level.chapters?.length || 0} chapters • {level.chapters?.reduce((acc, ch) => acc + (ch.topics?.length || 0), 0)} lessons
                          </p>
                        </div>
                      </div>
                      {expandedLevels[level.id] ? (
                        <ChevronUpIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0 ml-2" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0 ml-2" />
                      )}
                    </button>

                    {expandedLevels[level.id] && (
                      <div className="bg-gray-50 border-t border-gray-200">
                        {level.chapters?.map((chapter, chapterIdx) => (
                          <div key={chapter.id} className="border-b border-gray-200 last:border-0">
                            <div className="p-3 sm:p-4 lg:p-5 bg-white">
                              <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-100 text-purple-600 rounded-md flex items-center justify-center text-xs font-bold mr-2 sm:mr-3">
                                  {chapterIdx + 1}
                                </div>
                                {chapter.title}
                              </h4>
                              <ul className="space-y-1.5 sm:space-y-2 pl-7 sm:pl-9">
                                {chapter.topics?.map((topic, topicIdx) => (
                                  <li key={topic.id} className="flex items-start group hover:bg-indigo-50 p-1.5 sm:p-2 rounded-lg transition">
                                    <PlayCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-indigo-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <span className="text-xs sm:text-sm lg:text-base text-gray-700 group-hover:text-indigo-700">{topic.title}</span>
                                      {topic.duration && (
                                        <div className="flex items-center mt-0.5 sm:mt-1">
                                          <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1" />
                                          <span className="text-xs text-gray-500">{topic.duration}</span>
                                          <LockClosedIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 ml-2 sm:ml-3" />
                                        </div>
                                      )}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Description</h2>
              <div className="text-gray-700 leading-relaxed space-y-3 sm:space-y-4 text-sm sm:text-base">
                {course.description ? (
                  <p className="whitespace-pre-line">{course.description}</p>
                ) : (
                  <>
                    <p>
                      Welcome to the most comprehensive {course.title} course available online! Whether you're a complete beginner or looking to level up your skills, this course is designed to take you from zero to hero.
                    </p>
                    <p>
                      With over {stats.totalLessons} carefully crafted lessons, you'll learn at your own pace with lifetime access to all course materials. Our step-by-step approach ensures you build a solid foundation while working on real-world projects.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Sidebar Card */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="relative">
                  <img 
                    src={course.imageUrl} 
                    alt={course.title} 
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-extrabold text-gray-900">{course.price}</span>
                      {course.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">{course.originalPrice}</span>
                      )}
                    </div>
                  </div>
                  
                  <Link 
                    to={currentUser ? `/checkout/course/${course.id}` : '/login'} 
                    className="w-full block text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:scale-[1.02] transition text-lg mb-4"
                  >
                    {currentUser ? 'Enroll Now' : 'Sign In to Enroll'}
                  </Link>

                   {/* --- NEW BUTTON (Desktop): Request Demo --- */}
                  <button
                    onClick={handleDemoRequest}
                    className="w-full flex items-center justify-center border-2 border-indigo-600 text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-50 transition text-lg mb-6"
                  >
                    <ChatBubbleLeftRightIcon className="w-6 h-6 mr-2" />
                    Request a Demo
                  </button>

                  <div className="space-y-3 border-t border-gray-100 pt-6">
                    <p className="font-semibold text-gray-800 text-sm">This course includes:</p>
                    {courseFeatures.map((item, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-700">
                        <item.icon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
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
    </div>
  );
}