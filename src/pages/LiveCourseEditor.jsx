import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../Config/firebaseConfig';
import { Upload, Radio, BookOpen, ArrowLeft, Video } from 'lucide-react';
import { uploadToCloudinary } from '../services/cloudinaryService';

// Simplified template for a new live course
const newLiveCourseTemplate = {
  title: "",
  description: "",
  imageUrl: "",
  instructor: "",
  price: "₹",
  originalPrice: "", // <--- Added Original Price field
  validityDays: "",
  meetingLink: "",
  liveDate: "", 
  recordedVideoUrl: "", 
  createdAt: serverTimestamp(),
};

export default function LiveCourseEditor() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Progress states
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);

  const isNewCourse = !courseId;

  useEffect(() => {
    const fetchCourse = async () => {
      if (isNewCourse) {
        setCourse(newLiveCourseTemplate);
        setLoading(false);
      } else {
        try {
          const docRef = doc(db, 'liveCourses', courseId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setCourse({ id: docSnap.id, ...docSnap.data() });
          }
        } catch (error) {
          console.error("Error fetching live course:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchCourse();
  }, [courseId, isNewCourse]);

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const courseData = { ...course };
      
      if (isNewCourse) {
        courseData.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, 'liveCourses'), courseData);
        alert('Live course created successfully!');
        navigate(`/admin/live-course/${docRef.id}`);
      } else {
        const courseRef = doc(db, 'liveCourses', courseId);
        delete courseData.id;
        await updateDoc(courseRef, courseData);
        alert('Live course saved successfully!');
      }
    } catch (error) {
      console.error("Error saving live course: ", error);
      alert('Failed to save live course.');
    }
    setSaving(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      // Pass the progress setter to the function
      const imageUrl = await uploadToCloudinary(file, (progress) => {
        setImageUploadProgress(progress);
      });
      
      setCourse(prev => ({ ...prev, imageUrl }));
      setImageUploadProgress(0); // Reset after success
    } catch (error) {
      setImageUploadProgress(0);
      alert('Image upload failed. Please try again.');
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      alert('Please upload a video file.');
      return;
    }
    
    try {
      // Pass the progress setter to the function
      const videoUrl = await uploadToCloudinary(file, (progress) => {
        setVideoUploadProgress(progress);
      });
      
      setCourse(prev => ({ ...prev, recordedVideoUrl: videoUrl }));
      setVideoUploadProgress(0); // Reset after success
    } catch (error) {
      setVideoUploadProgress(0);
      // Error is already alerted in cloudinaryService for size issues
    }
  };

  const handleCourseChange = (e) => {
    setCourse(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isUploading = imageUploadProgress > 0 || videoUploadProgress > 0;

  if (loading) return <div className="p-8 text-center">Loading editor...</div>;
  if (!course) return <div className="p-8 text-center">Course not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Link to="/admin/live-courses" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft size={24} />
              </Link>
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Radio className="text-indigo-600" size={20} />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {isNewCourse ? 'Create New Live Course' : 'Edit Live Course'}
                </h1>
              </div>
            </div>
            <button
              onClick={handleSaveChanges}
              disabled={saving || isUploading}
              className="bg-indigo-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-indigo-700 transition shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Course Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BookOpen className="text-indigo-600" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Live Course Information</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image Upload Section */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Live Course Image
              </label>
              <div className="relative group">
                {course.imageUrl && imageUploadProgress === 0 ? (
                  <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                    <img src={course.imageUrl} alt="Preview" className="w-full h-48 object-cover" />
                    <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                      <div className="text-white text-center">
                        <Upload size={32} className="mx-auto mb-2" />
                        <span className="font-medium">Change Image</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                ) : imageUploadProgress > 0 ? (
                  <div className="w-full h-48 bg-gray-100 rounded-xl border-2 border-gray-300 flex flex-col items-center justify-center p-4">
                     <div className="w-16 h-16 mb-3 relative">
                       <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 64 64">
                         <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                         <circle cx="32" cy="32" r="28" stroke="#4f46e5" strokeWidth="4" fill="none"
                           strokeDasharray={`${2 * Math.PI * 28}`}
                           strokeDashoffset={`${2 * Math.PI * 28 * (1 - imageUploadProgress / 100)}`}
                           strokeLinecap="round" className="transition-all duration-300" />
                       </svg>
                       <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-sm font-bold text-indigo-600">{imageUploadProgress}%</span>
                       </div>
                     </div>
                     <p className="text-sm text-gray-600 font-medium">Uploading...</p>
                  </div>
                ) : (
                  <label className="w-full h-48 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 transition cursor-pointer flex flex-col items-center justify-center group">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition">
                      <Radio size={32} className="text-gray-400 group-hover:text-indigo-500 transition" />
                    </div>
                    <p className="font-medium text-gray-700">Upload Image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Course Details Section */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                <input type="text" name="title" value={course.title} onChange={handleCourseChange} placeholder="e.g., Live Workshop on Piano" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea name="description" value={course.description || ''} onChange={handleCourseChange} placeholder="Details about the live session" rows="4" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg resize-none"></textarea>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Instructor *</label>
                    <input type="text" name="instructor" value={course.instructor} onChange={handleCourseChange} placeholder="Instructor's Name" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"/>
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Recording Access Validity (days) *</label>
                    <input type="number" name="validityDays" value={course.validityDays || ''} onChange={handleCourseChange} placeholder="e.g., 30" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"/>
                 </div>
              </div>

              {/* Price and Original Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (Selling Price) *</label>
                    <input type="text" name="price" value={course.price} onChange={handleCourseChange} placeholder="e.g., ₹499" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"/>
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price (Optional)</label>
                    <input type="text" name="originalPrice" value={course.originalPrice || ''} onChange={handleCourseChange} placeholder="e.g., ₹999" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"/>
                    <p className="text-xs text-gray-500 mt-1">Shows a discount (e.g., <span className="line-through">₹999</span>)</p>
                 </div>
              </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Meeting Link *</label>
                    <input type="url" name="meetingLink" value={course.meetingLink} onChange={handleCourseChange} placeholder="https://zoom.us/j/..." className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"/>
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Live Date & Time *</label>
                    <input 
                      type="datetime-local" 
                      name="liveDate" 
                      value={course.liveDate || ''} 
                      onChange={handleCourseChange} 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"
                    />
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recorded Video Upload Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Video className="text-purple-600" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Recorded Video (Optional)</h2>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload the recorded video after the live session ends. This will be available for students who enrolled.
            </p>

            {course.recordedVideoUrl && videoUploadProgress === 0 ? (
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="text-green-600" size={20} />
                      <span className="font-semibold text-gray-900">Video Uploaded</span>
                    </div>
                    <p className="text-sm text-gray-600 break-all">{course.recordedVideoUrl}</p>
                  </div>
                  <label className="flex-shrink-0 cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
                    Replace Video
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                  </label>
                </div>
              </div>
            ) : videoUploadProgress > 0 ? (
              <div className="border-2 border-gray-300 rounded-xl p-6 bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 relative flex-shrink-0">
                    <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                     <circle cx="32" cy="32" r="28" stroke="#8b5cf6" strokeWidth="4" fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - videoUploadProgress / 100)}`}
                        strokeLinecap="round" className="transition-all duration-300" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-600">{videoUploadProgress}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Uploading video...</p>
                    <p className="text-sm text-gray-600">Please wait. Do not close this window.</p>
                  </div>
                </div>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-purple-400 transition cursor-pointer bg-gray-50 hover:bg-purple-50">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Video size={32} className="text-purple-600" />
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">Upload Recorded Video</p>
                  <p className="text-sm text-gray-600">MP4, MOV, or other video formats</p>
                  <p className="text-xs text-gray-500 mt-1">Maximum file size: 100MB</p>
                </div>
                <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}