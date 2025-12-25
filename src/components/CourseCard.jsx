import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

// FIX 1: Added 'enrolledCourses' to props
function CourseCard({ course, enrolledCourses = [] }) {
  const { currentUser } = useAuth();

  // FIX 2: Calculate if the user is currently enrolled in this specific course
  const isEnrolled = enrolledCourses.some(enrollment => {
    if (enrollment.courseId !== course.id) return false;
    
    // Check if access is still valid (if expiry exists)
    if (enrollment.expiryDate) {
      // Handle Firestore Timestamp or standard Date object
      const expiry = enrollment.expiryDate.toDate ? enrollment.expiryDate.toDate() : new Date(enrollment.expiryDate);
      return expiry > new Date();
    }
    
    // Lifetime access
    return true;
  });

  return (
    <div className="bg-white rounded-xl overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border border-gray-200">
      {/* Image Section - Clean, no overlays */}
      <div className="relative overflow-hidden">
        <img 
          src={course.imageUrl} 
          alt={course.title} 
          className="w-full h-52 object-cover transform hover:scale-105 transition-transform duration-300" 
        />
        {/* Optional: Visual badge on image if enrolled */}
        {isEnrolled && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <CheckCircleIcon className="w-3 h-3" />
            Enrolled
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex-grow flex flex-col">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-snug">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-sm text-gray-600 mb-3">
          {course.instructor}
        </p>

        {/* Description */}
        <p className="text-sm text-gray-500 mb-4 flex-grow line-clamp-3">
          {course.description || 'Enhance your skills with this comprehensive course.'}
        </p>

        {/* Validity Badge - Only show if NOT enrolled (cleaner look) */}
        {!isEnrolled && course.validityDays && (
          <div className="inline-flex items-center gap-1.5 w-fit mb-4">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-indigo-600">
              {course.validityDays} days access
            </span>
          </div>
        )}

        {/* Pricing Section - Hide price if already enrolled */}
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100 min-h-[50px]">
          {isEnrolled ? (
            <span className="text-green-600 font-bold text-sm flex items-center gap-1">
              <CheckCircleIcon className="w-5 h-5" />
              Purchased
            </span>
          ) : (
            <>
              <span className="text-2xl font-bold text-gray-900">
                {course.price}
              </span>
              {course.originalPrice && (
                <span className="text-base text-gray-400 line-through">
                  {course.originalPrice}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="p-5 pt-0">
        {/* FIX 3: Conditional Button rendering */}
        {isEnrolled ? (
          <Link 
            to="/my-classroom" 
            className="w-full text-center block bg-green-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm"
          >
            Go to Classroom
          </Link>
        ) : (
          <Link 
            to={`/course/${course.id}`} 
            className="w-full text-center block bg-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            View Course
          </Link>
        )}
      </div>
    </div>
  );
}

export default CourseCard;