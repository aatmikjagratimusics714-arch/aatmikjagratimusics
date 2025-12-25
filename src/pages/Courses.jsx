import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../Config/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, loading: authLoading } = useAuth();

  // Fetch user's enrolled courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!currentUser || authLoading) return;
      
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const enrolled = userData.enrolledCourses || [];
          setEnrolledCourses(enrolled);
        }
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      }
    };
    fetchEnrolledCourses();
  }, [currentUser, authLoading]);

  // Fetch all courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesCollection = collection(db, 'courses');
        const courseSnapshot = await getDocs(coursesCollection);
        const courseList = courseSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(courseList);
      } catch (error) {
        console.error("Error fetching courses: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading || authLoading) {
    return (
      <div className="pt-32 text-center">
        <div className="text-xl text-gray-600">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="pt-10 pb-16 px-6 md:px-16 lg:px-24 xl:px-32 bg-gray-50 min-h-screen">
      <header className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
          Explore Our Courses
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Choose from our expertly crafted courses to begin your learning journey.
        </p>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {courses.map(course => (
          <CourseCard 
            key={course.id}
            course={course}
            enrolledCourses={enrolledCourses}
          />
        ))}
      </main>
    </div>
  );
}
