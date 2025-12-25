import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../Config/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import LiveClassCard from '../components/LiveClassCard';

export default function LiveClasses() {
    const [liveCourses, setLiveCourses] = useState([]);
    const [enrolledLiveCourses, setEnrolledLiveCourses] = useState([]); // 1. New State
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    // 2. Fetch User's Live Enrollments
    useEffect(() => {
        const fetchEnrolledLiveCourses = async () => {
            if (!currentUser) return;
            
            try {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    // Make sure we fetch 'enrolledLiveCourses', not 'enrolledCourses'
                    const enrolled = userData.enrolledLiveCourses || [];
                    setEnrolledLiveCourses(enrolled);
                }
            } catch (error) {
                console.error('Error fetching enrolled live courses:', error);
            }
        };
        fetchEnrolledLiveCourses();
    }, [currentUser]);

    useEffect(() => {
        const fetchLiveCourses = async () => {
            try {
                const coursesCollection = collection(db, 'liveCourses');
                const courseSnapshot = await getDocs(coursesCollection);
                const courseList = courseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setLiveCourses(courseList);
            } catch (error) {
                console.error("Error fetching live courses: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLiveCourses();
    }, []);

    if (loading) {
        return <div className="pt-32 text-center">Loading live classes...</div>;
    }

    return (
        <div className="pt-10 pb-16 px-6 md:px-16 lg:px-24 xl:px-32 bg-gray-50 min-h-screen">
            <header className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
                    Upcoming Live Classes
                </h1>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                    Join our live interactive sessions and learn directly from the experts.
                </p>
            </header>
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {liveCourses.map(course => (
                    <LiveClassCard 
                        key={course.id} 
                        course={course}
                        enrolledCourses={enrolledLiveCourses} 
                    />
                ))}
            </main>
        </div>
    );
}