import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../Config/firebaseConfig';
import { BookOpen, Radio, Clock } from 'lucide-react';

const calculateTimeLeft = (expiryDate) => {
    const difference = +new Date(expiryDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
        timeLeft = {
            days: Math.ceil(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }

    return timeLeft;
};

export default function MyClassroom() {
    const { currentUser } = useAuth();
    const [myCourses, setMyCourses] = useState([]);
    const [myLiveCourses, setMyLiveCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({});

    useEffect(() => {
        const fetchMyLearning = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }
            try {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();

                    // --- 1. Fetch Regular Courses ---
                    const enrolledCoursesInfo = (userData.enrolledCourses || []).filter(
                        c => c.expiryDate && c.expiryDate.toDate() > new Date()
                    );
                    if (enrolledCoursesInfo.length > 0) {
                        const courseIds = enrolledCoursesInfo.map(c => c.courseId);
                        const coursesRef = collection(db, 'courses');
                        const q = query(coursesRef, where('__name__', 'in', courseIds));
                        const snapshot = await getDocs(q);
                        const details = snapshot.docs.map(doc => {
                            const courseData = { id: doc.id, ...doc.data() };
                            const enrollment = enrolledCoursesInfo.find(c => c.courseId === doc.id);
                            return { ...courseData, expiryDate: enrollment.expiryDate };
                        });
                        setMyCourses(details);
                    }

                    // --- 2. Fetch Live Courses ---
                    const enrolledLiveCoursesInfo = (userData.enrolledLiveCourses || []).filter(
                        c => c.expiryDate && c.expiryDate.toDate() > new Date()
                    );
                    if (enrolledLiveCoursesInfo.length > 0) {
                        const liveCourseIds = enrolledLiveCoursesInfo.map(c => c.courseId);
                        const liveCoursesRef = collection(db, 'liveCourses');
                        const q = query(liveCoursesRef, where('__name__', 'in', liveCourseIds));
                        const snapshot = await getDocs(q);
                        const details = snapshot.docs.map(doc => {
                            const courseData = { id: doc.id, ...doc.data() };
                            const enrollment = enrolledLiveCoursesInfo.find(c => c.courseId === doc.id);
                            return { ...courseData, expiryDate: enrollment.expiryDate };
                        });
                        setMyLiveCourses(details);
                    }
                }
            } catch (error) {
                console.error("Error fetching learning content:", error);
            }
            setLoading(false);
        };

        fetchMyLearning();
    }, [currentUser]);

    // Timer for countdown - runs every second
    useEffect(() => {
        // Only start timer if we have courses
        if (myCourses.length === 0 && myLiveCourses.length === 0) {
            return;
        }

        const timer = setInterval(() => {
            const newTimeLeft = {};
            let hasExpired = false;
            
            // Calculate time for regular courses
            myCourses.forEach(course => {
                if (course.expiryDate) {
                    const remaining = calculateTimeLeft(course.expiryDate.toDate());
                    newTimeLeft[`course-${course.id}`] = remaining;
                    
                    if (Object.keys(remaining).length === 0) {
                        hasExpired = true;
                    }
                }
            });

            // Calculate time for live courses
            myLiveCourses.forEach(course => {
                if (course.expiryDate) {
                    const remaining = calculateTimeLeft(course.expiryDate.toDate());
                    newTimeLeft[`live-${course.id}`] = remaining;
                    
                    if (Object.keys(remaining).length === 0) {
                        hasExpired = true;
                    }
                }
            });
            
            setTimeLeft(newTimeLeft);
            
            // Refresh page if any course has expired
            if (hasExpired) {
                window.location.reload();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [myCourses.length, myLiveCourses.length]); // Only re-run when length changes

    const formatTimeDisplay = (timer) => {
        if (!timer || Object.keys(timer).length === 0) {
            return null;
        }

        // If days >= 1, show only days
        if (timer.days >= 1) {
            return `${timer.days} ${timer.days === 1 ? 'day' : 'days'} left`;
        }
        
        // If less than 1 day, show hours, minutes, and seconds
        return `${timer.hours}h ${timer.minutes}m ${timer.seconds}s left`;
    };

    if (loading) {
        return <div className="text-center pt-40">Loading your classroom...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-10 pb-16 px-6 md:px-16">
            <header className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">My Classroom</h1>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">All your enrolled courses and live sessions in one place.</p>
            </header>
            
            <main className="max-w-6xl mx-auto space-y-16">
                {/* --- Regular Courses Section --- */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <BookOpen /> My Courses
                    </h2>
                    {myCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {myCourses.map(course => {
                                const timer = timeLeft[`course-${course.id}`];
                                const isExpiringSoon = timer && timer.days < 1;
                                const timeDisplay = formatTimeDisplay(timer);

                                return (
                                    <div key={course.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300">
                                        <Link to={`/courses/${course.id}`}>
                                            <img src={course.imageUrl} alt={course.title} className="w-full h-48 object-cover" />
                                        </Link>
                                        <div className="p-6 flex-grow flex flex-col">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                                            
                                            {/* Validity Timer */}
                                            {timeDisplay && (
                                                <div className={`mt-2 mb-4 p-2 rounded-md text-sm font-semibold flex items-center justify-center ${isExpiringSoon ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    <Clock className="w-4 h-4 mr-2" />
                                                    <span>{timeDisplay}</span>
                                                </div>
                                            )}

                                            {!course.expiryDate && (
                                                <div className="mt-2 mb-4 p-2 rounded-md text-sm font-semibold flex items-center justify-center bg-blue-100 text-blue-800">
                                                    <Clock className="w-4 h-4 mr-2" />
                                                    <span>Lifetime Access</span>
                                                </div>
                                            )}

                                            <div className="mt-auto pt-4">
                                                <Link to={`/courses/${course.id}`} className="w-full text-center block bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition">
                                                    Start Learning
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500">You have not enrolled in any courses yet.</p>
                    )}
                </div>

                {/* --- Live Courses Section --- */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <Radio /> My Live Sessions
                    </h2>
                    {myLiveCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {myLiveCourses.map(course => {
                                const timer = timeLeft[`live-${course.id}`];
                                const isExpiringSoon = timer && timer.days < 1;
                                const timeDisplay = formatTimeDisplay(timer);

                                return (
                                    <div key={course.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300">
                                        <Link to={`/enrolled/live-course/${course.id}`}>
                                            <img src={course.imageUrl} alt={course.title} className="w-full h-48 object-cover" />
                                        </Link>
                                        <div className="p-6 flex-grow flex flex-col">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                                            
                                            {/* Validity Timer */}
                                            {timeDisplay && (
                                                <div className={`mt-2 mb-4 p-2 rounded-md text-sm font-semibold flex items-center justify-center ${isExpiringSoon ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    <Clock className="w-4 h-4 mr-2" />
                                                    <span>{timeDisplay}</span>
                                                </div>
                                            )}

                                            {!course.expiryDate && (
                                                <div className="mt-2 mb-4 p-2 rounded-md text-sm font-semibold flex items-center justify-center bg-blue-100 text-blue-800">
                                                    <Clock className="w-4 h-4 mr-2" />
                                                    <span>Lifetime Access</span>
                                                </div>
                                            )}

                                            <div className="mt-auto pt-4">
                                                <Link to={`/enrolled/live-course/${course.id}`} className="w-full text-center block bg-red-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-red-600 transition">
                                                    Go to Session
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500">You have not enrolled in any live sessions.</p>
                    )}
                </div>

                {(myCourses.length === 0 && myLiveCourses.length === 0) && (
                    <div className="text-center bg-white p-12 rounded-lg shadow-lg">
                        <BookOpen className="mx-auto h-16 w-16 text-gray-300" />
                        <h2 className="mt-4 text-xl font-semibold text-gray-800">Your classroom is empty.</h2>
                        <Link to="/courses" className="mt-6 inline-block bg-indigo-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-indigo-700 transition">
                            Explore Content
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
