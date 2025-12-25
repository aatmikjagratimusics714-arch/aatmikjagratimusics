import React from 'react';
import { Link } from 'react-router-dom';
// FIX 1: Added CheckCircle for the enrolled icon
import { Calendar, Clock, CheckCircle } from 'lucide-react';

// FIX 2: Added 'enrolledCourses' to props
function LiveClassCard({ course, enrolledCourses = [] }) {
  
  // FIX 3: Calculate if the user is currently enrolled in this live class
  const isEnrolled = enrolledCourses.some(enrollment => {
    if (enrollment.courseId !== course.id) return false;
    
    // Check validity
    if (enrollment.expiryDate) {
      const expiry = enrollment.expiryDate.toDate ? enrollment.expiryDate.toDate() : new Date(enrollment.expiryDate);
      return expiry > new Date();
    }
    return true;
  });

  const formatLiveDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatLiveTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border border-gray-200">
      <div className="relative overflow-hidden">
        {/* Live Badge */}
        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 animate-pulse">
          LIVE
        </div>
        
        {/* FIX 4: Enrolled Badge (Left side) */}
        {isEnrolled && (
          <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-lg flex items-center gap-1">
            <CheckCircle size={12} />
            Enrolled
          </div>
        )}

        <img 
          src={course.imageUrl} 
          alt={course.title} 
          className="w-full h-52 object-cover transform hover:scale-105 transition-transform duration-300" 
        />
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-snug">
          {course.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          By {course.instructor}
        </p>
        
        {/* Live Date & Time */}
        {course.liveDate && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-gray-700">
                {formatLiveDate(course.liveDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-gray-700">
                {formatLiveTime(course.liveDate)}
              </span>
            </div>
          </div>
        )}
        
        {course.validityDays && (
          <div className="inline-flex items-center gap-1.5 w-fit mb-4 bg-indigo-50 px-3 py-1.5 rounded-lg">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-indigo-600">
              {course.validityDays} days recording access
            </span>
          </div>
        )}

        {/* FIX 5: Conditional Price Display */}
        <div className="flex items-center gap-3 mt-auto pt-3 border-t border-gray-100 min-h-[50px]">
          {isEnrolled ? (
             <span className="text-green-600 font-bold text-lg flex items-center gap-2">
               <CheckCircle size={20} />
               Purchased
             </span>
          ) : (
            <span className="text-2xl font-bold text-gray-900">
              {course.price}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 pt-0">
        {/* FIX 6: Conditional Button Link */}
        {isEnrolled ? (
          <Link 
            to={`/enrolled/live-course/${course.id}`} 
            className="w-full text-center block bg-green-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm"
          >
            Go to Classroom
          </Link>
        ) : (
          <Link 
            to={`/live-course/${course.id}`} 
            className="w-full text-center block bg-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
}

export default LiveClassCard;