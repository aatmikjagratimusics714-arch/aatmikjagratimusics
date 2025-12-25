import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldExclamationIcon,
  ChevronUpIcon,
  PlayCircleIcon,
  Bars3Icon,
} from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Config/firebaseConfig';

const getFirstTopic = (course) => {
  return course?.levels?.[0]?.chapters?.[0]?.topics?.[0] || null;
};

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [activeTab, setActiveTab] = useState('video');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openLevels, setOpenLevels] = useState({});

  useEffect(() => {
    const fetchCourseAndCheckAccess = async () => {
      if (authLoading) return;
      
      if (!currentUser) {
        navigate('/login');
        return;
      }

      setLoading(true);

      try {
        // 1. Fetch course FIRST
        const courseDocRef = doc(db, 'courses', courseId);
        const courseDocSnap = await getDoc(courseDocRef);

        if (!courseDocSnap.exists()) {
          setCourse(null);
          setLoading(false);
          return;
        }

        const courseData = courseDocSnap.data();
        const fetchedCourse = { id: courseDocSnap.id, ...courseData };
        setCourse(fetchedCourse);

        // 2. Fetch user enrollment
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const enrolledCourses = userData.enrolledCourses || [];

          // ✅ FIXED: Check enrollment by course ID (handles both string and exact match)
          const alreadyEnrolled = enrolledCourses.some(enrollment => 
            enrollment.courseId === courseId || 
            enrollment.courseId === courseDocSnap.id
          );
          
          setIsEnrolled(alreadyEnrolled);

          // Check if access is still valid
          const courseEnrollments = enrolledCourses.filter(enrollment => 
            (enrollment.courseId === courseId || enrollment.courseId === courseDocSnap.id) && 
            enrollment.expiryDate
          );

          if (courseEnrollments.length > 0) {
            // Find latest enrollment
            courseEnrollments.sort((a, b) => {
              const aTime = a.expiryDate?.toDate?.()?.getTime() || 0;
              const bTime = b.expiryDate?.toDate?.()?.getTime() || 0;
              return bTime - aTime;
            });

            const latest = courseEnrollments[0];
            const expiryDate = latest.expiryDate?.toDate?.();
            
            if (expiryDate && expiryDate > new Date()) {
              setHasAccess(true);
              const firstTopic = getFirstTopic(courseData);
              setCurrentTopic(firstTopic);
              
              const levels = courseData.levels || [];
              if (levels[0]?.id) {
                setOpenLevels({ [levels[0].id]: true });
              }
            } else {
              setHasAccess(false);
            }
          } else {
            setHasAccess(false);
          }
        } else {
          setHasAccess(false);
          setIsEnrolled(false);
        }
      } catch (error) {
        console.error('Error:', error);
        setHasAccess(false);
        setIsEnrolled(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndCheckAccess();
  }, [currentUser?.uid, courseId, authLoading, navigate]);

  const toggleLevel = (levelId) => {
    setOpenLevels(prev => ({ ...prev, [levelId]: !prev[levelId] }));
  };

  const handleSelectTopic = (topic) => {
    setCurrentTopic(topic);
    setIsSidebarOpen(false);
  };

  // Loading screen
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-lg text-gray-600">Loading course...</div>
      </div>
    );
  }

  // Course not found
  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Course not found</div>
      </div>
    );
  }

  // ACCESS DENIED / ALREADY ENROLLED
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center bg-white p-10 rounded-xl shadow-xl border">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            {isEnrolled ? (
              <ShieldExclamationIcon className="w-10 h-10 text-green-600" />
            ) : (
              <ShieldExclamationIcon className="w-10 h-10 text-red-500" />
            )}
          </div>
          
          <h1 className="mt-2 text-3xl font-bold text-gray-900 mb-4">
            {isEnrolled ? 'Already Enrolled' : 'Access Denied'}
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            {isEnrolled 
              ? 'You have already purchased this course. Check your My Courses page.' 
              : 'Get access to continue learning.'
            }
          </p>

          <div className="space-y-4">
            {isEnrolled ? (
              <div className="w-full p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-800 font-semibold text-lg">
                ✓ Already Enrolled
              </div>
            ) : (
              <Link
                to={`/checkout/${course.id}`}
                className="w-full block bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Enroll Now - ₹{course.price}
              </Link>
            )}
            
            <Link
              to="/my-courses"
              className="w-full block bg-gray-100 text-gray-800 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors text-center"
            >
              → View My Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // COURSE PLAYER (has access)
  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-slate-200 flex flex-col transform transition-all duration-300 lg:static lg:translate-x-0 lg:w-96 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-200">
          <h2 className="font-bold text-xl text-slate-800">Course Content</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {course.levels?.map(level => (
            <div key={level.id} className="border-b border-slate-200 last:border-b-0">
              <button
                onClick={() => toggleLevel(level.id)}
                className="w-full flex justify-between items-center p-4 text-left bg-slate-50 hover:bg-slate-100 focus:outline-none rounded-lg m-1"
              >
                <span className="font-bold text-slate-800">{level.title}</span>
                <ChevronUpIcon className={`w-5 h-5 text-slate-500 transition-transform ${openLevels[level.id] ? 'rotate-180' : ''}`} />
              </button>
              {openLevels[level.id] && (
                <div className="ml-4 space-y-2 pb-4">
                  {level.chapters?.map(chapter => (
                    <div key={chapter.id} className="border-t border-slate-200 pt-3">
                      <h4 className="font-semibold text-gray-700 px-2 py-1 text-sm">{chapter.title}</h4>
                      <ul className="space-y-1">
                        {chapter.topics?.map(topic => (
                          <li key={topic.id}>
                            <button
                              onClick={() => handleSelectTopic(topic)}
                              className={`w-full text-left p-3 pl-6 text-sm flex items-center gap-3 rounded-lg transition-all hover:bg-slate-50 ${
                                currentTopic?.id === topic.id ? 'bg-indigo-50 border-2 border-indigo-200 text-indigo-800' : ''
                              }`}
                            >
                              <PlayCircleIcon className={`w-5 h-5 flex-shrink-0 ${currentTopic?.id === topic.id ? 'text-indigo-500' : 'text-slate-400'}`} />
                              <div className="min-w-0 flex-1">
                                <p className={`font-medium truncate ${currentTopic?.id === topic.id ? 'text-indigo-800' : 'text-slate-800'}`}>
                                  {topic.title}
                                </p>
                                <span className={`text-xs ${currentTopic?.id === topic.id ? 'text-indigo-500' : 'text-slate-500'}`}>
                                  {topic.duration}
                                </span>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white p-6 border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <Link to="/courses" className="text-sm text-indigo-600 hover:underline mb-3 inline-block font-medium">
                ← Back to Courses
              </Link>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                {course.title}
              </h1>
            </div>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-y-auto p-6">
            {currentTopic ? (
              <>
                <div className="mb-8">
                  <div className="relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl" style={{ paddingBottom: '56.25%' }}>
                    <video
                      key={currentTopic.id}
                      className="absolute inset-0 w-full h-full"
                      src={currentTopic.videoUrl}
                      controls
                      controlsList="nodownload noremoteplayback"
                      disablePictureInPicture
                      onContextMenu={e => e.preventDefault()}
                      style={{ objectFit: 'contain' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">{currentTopic.title}</h2>
                  
                  <div className="border-b border-slate-200 pb-6 mb-6">
                    <nav className="flex space-x-8">
                      <button
                        onClick={() => setActiveTab('video')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'video'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        Overview
                      </button>
                      <button
                        onClick={() => setActiveTab('notes')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'notes'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        Notes
                      </button>
                    </nav>
                  </div>

                  <div>
                    {activeTab === 'video' && (
                      <div className="text-slate-600 text-lg">
                        <p className="leading-relaxed">
                          The lesson video is playing above. Select a lesson from the sidebar to begin.
                        </p>
                      </div>
                    )}

                    {activeTab === 'notes' && (
                      <div className="prose prose-slate max-w-none">
                        {currentTopic.notesImageUrl && (
                          <img
                            src={currentTopic.notesImageUrl}
                            alt={`Notes for ${currentTopic.title}`}
                            className="max-w-full h-auto rounded-xl mb-6 shadow-md"
                          />
                        )}
                        {currentTopic.notes ? (
                          <div className="prose-lg">{currentTopic.notes}</div>
                        ) : null}
                        {!currentTopic.notesImageUrl && !currentTopic.notes && (
                          <p className="text-slate-500 italic">No notes available for this lesson.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div className="max-w-md">
                  <PlayCircleIcon className="mx-auto h-24 w-24 text-slate-400 mb-6" />
                  <h2 className="text-2xl font-bold text-slate-700 mb-2">
                    No topics available
                  </h2>
                  <p className="text-slate-500">This course doesn't have any lessons yet. Check back later!</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
