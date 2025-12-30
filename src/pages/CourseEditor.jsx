import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../Config/firebaseConfig';
import { v4 as uuidv4 } from 'uuid';
import { PlusCircle, Trash2, Upload, Video, Music, BookOpen, GripVertical, ArrowLeft, Image as ImageIcon, XCircle } from 'lucide-react';
import { uploadToCloudinary } from '../services/cloudinaryService';

const newCourseTemplate = {
  title: "",
  description: "",
  imageUrl: "",
  instructor: "",
  price: "₹",
  originalPrice: "",
  courseDuration: "",
  accessDuration: "",
  validityDays: "",
  levels: [],
  createdAt: serverTimestamp(),
};

export default function CourseEditor() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Progress states
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [videoUploadProgress, setVideoUploadProgress] = useState({});
  const [notesImageUploadProgress, setNotesImageUploadProgress] = useState({});
  
  const [expandedLevels, setExpandedLevels] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});

  const isNewCourse = !courseId;

  useEffect(() => {
    const fetchCourse = async () => {
      if (isNewCourse) {
        setCourse(newCourseTemplate);
        setLoading(false);
      } else {
        try {
          const docRef = doc(db, 'courses', courseId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setCourse({ id: docSnap.id, ...docSnap.data() });
          }
        } catch (error) {
          console.error("Error fetching course:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchCourse();
  }, [courseId, isNewCourse]);

  const toggleLevel = (levelId) => {
    setExpandedLevels(prev => ({ ...prev, [levelId]: !prev[levelId] }));
  };

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const courseData = { ...course };
      if (isNewCourse) {
        courseData.createdAt = serverTimestamp();
      }
      
      if (isNewCourse) {
        const docRef = await addDoc(collection(db, 'courses'), courseData);
        alert('Course created successfully!');
        navigate(`/admin/course/${docRef.id}`);
      } else {
        const courseRef = doc(db, 'courses', courseId);
        delete courseData.id;
        delete courseData.createdAt;
        await updateDoc(courseRef, courseData);
        alert('Course saved successfully!');
      }
    } catch (error) {
      console.error("Error saving course: ", error);
      alert('Failed to save course.');
    }
    setSaving(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const imageUrl = await uploadToCloudinary(file, (progress) => {
        setImageUploadProgress(progress);
      });
      setCourse(prev => ({ ...prev, imageUrl }));
      setImageUploadProgress(0);
    } catch (error) {
      setImageUploadProgress(0);
      // alert handled in service if size issue, otherwise here
      if (!error.message.includes("File too large")) alert('Image upload failed.');
    }
  };

  const handleVideoUpload = async (e, levelIndex, chapterIndex, topicIndex, topicId) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const videoUrl = await uploadToCloudinary(file, (progress) => {
        setVideoUploadProgress(prev => ({ ...prev, [topicId]: progress }));
      });
      
      const syntheticEvent = { target: { name: 'videoUrl', value: videoUrl } };
      handleTopicChange(levelIndex, chapterIndex, topicIndex, syntheticEvent);
      
      setVideoUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[topicId];
        return newProgress;
      });
    } catch (error) {
      setVideoUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[topicId];
        return newProgress;
      });
      if (!error.message.includes("File too large")) alert('Video upload failed.');
    }
  };

  const handleNotesImageUpload = async (e, levelIndex, chapterIndex, topicIndex, topicId) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const imageUrl = await uploadToCloudinary(file, (progress) => {
         setNotesImageUploadProgress(prev => ({ ...prev, [topicId]: progress }));
      });

      const syntheticEvent = { target: { name: 'notesImageUrl', value: imageUrl } };
      handleTopicChange(levelIndex, chapterIndex, topicIndex, syntheticEvent);

      setNotesImageUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[topicId];
        return newProgress;
      });
    } catch (error) {
      setNotesImageUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[topicId];
        return newProgress;
      });
      if (!error.message.includes("File too large")) alert('Notes upload failed.');
    }
  };
  
  const handleRemoveNotesImage = (levelIndex, chapterIndex, topicIndex) => {
    const syntheticEvent = { target: { name: 'notesImageUrl', value: '' } };
    handleTopicChange(levelIndex, chapterIndex, topicIndex, syntheticEvent);
  };

  // ... (Rest of the helper functions: handleCourseChange, handleLevelChange, etc. remain exactly the same) ...
  const handleCourseChange = (e) => {
    setCourse(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLevelChange = (levelIndex, e) => {
    const newLevels = [...course.levels];
    newLevels[levelIndex] = { ...newLevels[levelIndex], [e.target.name]: e.target.value };
    setCourse(prev => ({ ...prev, levels: newLevels }));
  };

  const handleChapterChange = (levelIndex, chapterIndex, e) => {
    const newLevels = [...course.levels];
    newLevels[levelIndex].chapters[chapterIndex] = {
      ...newLevels[levelIndex].chapters[chapterIndex],
      [e.target.name]: e.target.value
    };
    setCourse(prev => ({ ...prev, levels: newLevels }));
  };

  const handleTopicChange = (levelIndex, chapterIndex, topicIndex, e) => {
    const newLevels = [...course.levels];
    newLevels[levelIndex].chapters[chapterIndex].topics[topicIndex] = {
      ...newLevels[levelIndex].chapters[chapterIndex].topics[topicIndex],
      [e.target.name]: e.target.value
    };
    setCourse(prev => ({ ...prev, levels: newLevels }));
  };

  const addLevel = () => {
    const newLevel = { id: uuidv4(), title: "", chapters: [] };
    setCourse(prev => ({ ...prev, levels: [...(prev.levels || []), newLevel] }));
    setExpandedLevels(prev => ({ ...prev, [newLevel.id]: true }));
  };

  const addChapter = (levelIndex) => {
    const newChapter = { id: uuidv4(), title: "", topics: [] };
    const newLevels = [...course.levels];
    newLevels[levelIndex].chapters = [...(newLevels[levelIndex].chapters || []), newChapter];
    setCourse(prev => ({ ...prev, levels: newLevels }));
    setExpandedChapters(prev => ({ ...prev, [newChapter.id]: true }));
  };

  const addTopic = (levelIndex, chapterIndex) => {
    const newTopic = { id: uuidv4(), title: "", duration: "", videoUrl: "", notes: "", notesImageUrl: "" };
    const newLevels = [...course.levels];
    newLevels[levelIndex].chapters[chapterIndex].topics = [
      ...(newLevels[levelIndex].chapters[chapterIndex].topics || []),
      newTopic
    ];
    setCourse(prev => ({ ...prev, levels: newLevels }));
  };

  const removeLevel = (levelIndex) => {
    if (window.confirm('Are you sure you want to delete this level?')) {
      setCourse(prev => ({ ...prev, levels: prev.levels.filter((_, i) => i !== levelIndex) }));
    }
  };

  const removeChapter = (levelIndex, chapterIndex) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      const newLevels = [...course.levels];
      newLevels[levelIndex].chapters = newLevels[levelIndex].chapters.filter((_, i) => i !== chapterIndex);
      setCourse(prev => ({ ...prev, levels: newLevels }));
    }
  };

  const removeTopic = (levelIndex, chapterIndex, topicIndex) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      const newLevels = [...course.levels];
      newLevels[levelIndex].chapters[chapterIndex].topics = 
        newLevels[levelIndex].chapters[chapterIndex].topics.filter((_, i) => i !== topicIndex);
      setCourse(prev => ({ ...prev, levels: newLevels }));
    }
  };

  const isUploading = imageUploadProgress > 0 || Object.keys(videoUploadProgress).length > 0 || Object.keys(notesImageUploadProgress).length > 0;

  if (loading) return <div className="p-4 sm:p-8 text-center">Loading course editor...</div>;
  if (!course) return <div className="p-4 sm:p-8 text-center">Course not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <Link to="/admin/courses" className="text-gray-500 hover:text-gray-700 transition flex-shrink-0">
                <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
              </Link>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Music className="text-indigo-600" size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {isNewCourse ? 'Create New Course' : 'Edit Course'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Create and manage your course</p>
              </div>
            </div>
            <button
              onClick={handleSaveChanges}
              disabled={saving || isUploading}
              className="bg-indigo-600 text-white font-semibold py-2 px-3 sm:py-2.5 sm:px-6 rounded-lg hover:bg-indigo-700 transition shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-1 sm:space-x-2 text-xs sm:text-base flex-shrink-0"
            >
              {saving ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Course Details Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BookOpen className="text-indigo-600" size={18} />
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Course Information</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Image Upload Section */}
            <div className="lg:col-span-1">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                Course Cover Image
              </label>
              <div className="relative group">
                {course.imageUrl && imageUploadProgress === 0 ? (
                  <div className="relative rounded-lg sm:rounded-xl overflow-hidden border-2 border-gray-200">
                    <img
                      src={course.imageUrl}
                      alt="Course preview"
                      className="w-full h-40 sm:h-48 object-cover"
                    />
                    <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                      <div className="text-white text-center">
                        <Upload size={28} className="mx-auto mb-2 sm:w-8 sm:h-8" />
                        <span className="text-xs sm:text-sm font-medium">Change Image</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : imageUploadProgress > 0 ? (
                  <div className="w-full h-40 sm:h-48 bg-gray-100 rounded-lg sm:rounded-xl border-2 border-gray-300 flex flex-col items-center justify-center p-3 sm:p-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-3 relative">
                      <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 64 64">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#e5e7eb"
                          strokeWidth="4"
                          fill="none"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#4f46e5"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - imageUploadProgress / 100)}`}
                          strokeLinecap="round"
                          className="transition-all duration-300"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs sm:text-sm font-bold text-indigo-600">{imageUploadProgress}%</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Uploading image...</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-2 sm:mt-3">
                      <div
                        className="bg-indigo-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                        style={{ width: `${imageUploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <label className="w-full h-40 sm:h-48 bg-gray-100 rounded-lg sm:rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition cursor-pointer flex flex-col items-center justify-center group">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-indigo-100 transition">
                      <Music size={24} className="sm:w-8 sm:h-8 text-gray-400 group-hover:text-indigo-500 transition" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700">Upload Course Image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Course Details Section */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={course.title}
                  onChange={handleCourseChange}
                  placeholder="Add course title"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none text-base sm:text-lg"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Course Description
                </label>
                <textarea
                  name="description"
                  value={course.description || ''}
                  onChange={handleCourseChange}
                  placeholder="Add a detailed course description"
                  rows="4"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none text-sm sm:text-base resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Instructor Name *
                  </label>
                  <input
                    type="text"
                    name="instructor"
                    value={course.instructor}
                    onChange={handleCourseChange}
                    placeholder="Add instructor name"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Course Price *
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={course.price}
                    onChange={handleCourseChange}
                    placeholder="₹999"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Original Price (Optional)
                  </label>
                  <input
                    type="text"
                    name="originalPrice"
                    value={course.originalPrice || ''}
                    onChange={handleCourseChange}
                    placeholder="₹4999"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">For showing discounts</p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Course Duration
                  </label>
                  <input
                    type="text"
                    name="courseDuration"
                    value={course.courseDuration || ''}
                    onChange={handleCourseChange}
                    placeholder="100 hours"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">e.g., 30 hours, 6 weeks</p>
                </div>
                
                {/* Validity Field */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Course Validity (days)
                  </label>
                  <input
                    type="number"
                    name="validityDays"
                    value={course.validityDays || ''}
                    onChange={handleCourseChange}
                    placeholder="e.g., 365"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Access period in days</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content Section - UI remains mostly same but uses new uploaders */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <BookOpen className="text-emerald-600" size={18} />
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Course Curriculum</h2>
            </div>
            <button
              onClick={addLevel}
              className="bg-indigo-600 text-white font-semibold py-2 px-4 sm:py-2.5 sm:px-5 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center space-x-2 shadow-md text-sm sm:text-base"
            >
              <PlusCircle size={16} className="sm:w-5 sm:h-5" />
              <span>Add Level</span>
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {course.levels?.length === 0 ? (
              <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg sm:rounded-xl border-2 border-dashed border-gray-300">
                <Music size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-600 font-medium mb-1 sm:mb-2">No levels added yet</p>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 px-4">Start building your course by adding a level</p>
                <button
                  onClick={addLevel}
                  className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition inline-flex items-center space-x-2 text-sm sm:text-base"
                >
                  <PlusCircle size={16} className="sm:w-5 sm:h-5" />
                  <span>Add Your First Level</span>
                </button>
              </div>
            ) : (
              course.levels?.map((level, levelIndex) => (
                <div key={level.id} className="border-2 border-gray-200 rounded-lg sm:rounded-xl overflow-hidden">
                  {/* Level Header */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 sm:p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button className="text-gray-400 hover:text-gray-600 cursor-move hidden sm:block">
                        <GripVertical size={20} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          name="title"
                          value={level.title}
                          onChange={(e) => handleLevelChange(levelIndex, e)}
                          placeholder="Add level title"
                          className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-white border-2 border-gray-200 rounded-lg font-bold text-sm sm:text-base lg:text-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none"
                        />
                      </div>
                      <button
                        onClick={() => toggleLevel(level.id)}
                        className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-white rounded-lg transition whitespace-nowrap"
                      >
                        {expandedLevels[level.id] ? 'Collapse' : 'Expand'}
                      </button>
                      <button
                        onClick={() => addChapter(levelIndex)}
                        className="hidden sm:flex px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-indigo-600 font-medium text-xs sm:text-sm rounded-lg hover:bg-indigo-50 transition items-center space-x-1"
                      >
                        <PlusCircle size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden md:inline">Chapter</span>
                      </button>
                      <button
                        onClick={() => removeLevel(levelIndex)}
                        className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={16} className="sm:w-5 sm:h-5" />
                      </button>
                    </div>
                    {/* Mobile Add Chapter Button */}
                    <button
                      onClick={() => addChapter(levelIndex)}
                      className="sm:hidden w-full mt-3 px-3 py-2 bg-white text-indigo-600 font-medium text-sm rounded-lg hover:bg-indigo-50 transition flex items-center justify-center space-x-1"
                    >
                      <PlusCircle size={14} />
                      <span>Add Chapter</span>
                    </button>
                  </div>

                  {/* Chapters */}
                  {expandedLevels[level.id] !== false && (
                    <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 bg-gray-50">
                      {level.chapters?.length === 0 ? (
                        <div className="text-center py-6 sm:py-8 bg-white rounded-lg border border-gray-200">
                          <p className="text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3">No chapters in this level</p>
                          <button
                            onClick={() => addChapter(levelIndex)}
                            className="text-indigo-600 font-medium text-xs sm:text-sm inline-flex items-center space-x-1 hover:underline"
                          >
                            <PlusCircle size={14} className="sm:w-4 sm:h-4" />
                            <span>Add First Chapter</span>
                          </button>
                        </div>
                      ) : (
                        level.chapters?.map((chapter, chapterIndex) => (
                          <div key={chapter.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            {/* Chapter Header */}
                            <div className="bg-gray-50 p-2 sm:p-3 border-b border-gray-200">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <button className="text-gray-400 hover:text-gray-600 cursor-move hidden sm:block">
                                  <GripVertical size={16} />
                                </button>
                                <div className="flex-1 min-w-0">
                                  <input
                                    type="text"
                                    name="title"
                                    value={chapter.title}
                                    onChange={(e) => handleChapterChange(levelIndex, chapterIndex, e)}
                                    placeholder="Add chapter title"
                                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg font-semibold text-xs sm:text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none"
                                  />
                                </div>
                                <button
                                  onClick={() => toggleChapter(chapter.id)}
                                  className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition whitespace-nowrap"
                                >
                                  {expandedChapters[chapter.id] ? 'Hide' : 'Show'}
                                </button>
                                <button
                                  onClick={() => addTopic(levelIndex, chapterIndex)}
                                  className="hidden sm:flex px-2 sm:px-3 py-1 sm:py-1.5 bg-indigo-50 text-indigo-600 font-medium text-xs rounded hover:bg-indigo-100 transition items-center space-x-1"
                                >
                                  <PlusCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                                  <span className="hidden md:inline">Lesson</span>
                                </button>
                                <button
                                  onClick={() => removeChapter(levelIndex, chapterIndex)}
                                  className="p-1 sm:p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                                >
                                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                </button>
                              </div>
                              {/* Mobile Add Lesson Button */}
                              <button
                                onClick={() => addTopic(levelIndex, chapterIndex)}
                                className="sm:hidden w-full mt-2 px-2 py-1.5 bg-indigo-50 text-indigo-600 font-medium text-xs rounded hover:bg-indigo-100 transition flex items-center justify-center space-x-1"
                              >
                                <PlusCircle size={12} />
                                <span>Add Lesson</span>
                              </button>
                            </div>

                            {/* Topics/Lessons */}
                            {expandedChapters[chapter.id] !== false && (
                              <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
                                {chapter.topics?.length === 0 ? (
                                  <div className="text-center py-4 sm:py-6 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500 text-xs mb-1.5 sm:mb-2">No lessons in this chapter</p>
                                    <button
                                      onClick={() => addTopic(levelIndex, chapterIndex)}
                                      className="text-indigo-600 font-medium text-xs inline-flex items-center space-x-1 hover:underline"
                                    >
                                      <PlusCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                                      <span>Add First Lesson</span>
                                    </button>
                                  </div>
                                ) : (
                                  chapter.topics?.map((topic, topicIndex) => (
                                    <div key={topic.id} className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                                      <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                                        <button className="text-gray-400 hover:text-gray-600 cursor-move mt-2 hidden sm:block">
                                          <GripVertical size={14} />
                                        </button>
                                        <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
                                          {/* Lesson Title & Duration */}
                                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                                            <div className="sm:col-span-2">
                                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                                Lesson Title *
                                              </label>
                                              <input
                                                type="text"
                                                name="title"
                                                value={topic.title}
                                                onChange={(e) => handleTopicChange(levelIndex, chapterIndex, topicIndex, e)}
                                                placeholder="Add lesson title"
                                                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                                Duration
                                              </label>
                                              <input
                                                type="text"
                                                name="duration"
                                                value={topic.duration}
                                                onChange={(e) => handleTopicChange(levelIndex, chapterIndex, topicIndex, e)}
                                                placeholder="e.g., 10 min"
                                                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none"
                                              />
                                            </div>
                                          </div>

                                          {/* Video Upload */}
                                          <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 sm:mb-2">
                                              Lesson Video
                                            </label>
                                            {videoUploadProgress[topic.id] !== undefined ? (
                                              <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-indigo-200">
                                                <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                                                  <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex-shrink-0">
                                                    <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 40 40">
                                                      <circle
                                                        cx="20"
                                                        cy="20"
                                                        r="16"
                                                        stroke="#e5e7eb"
                                                        strokeWidth="3"
                                                        fill="none"
                                                      />
                                                      <circle
                                                        cx="20"
                                                        cy="20"
                                                        r="16"
                                                        stroke="#4f46e5"
                                                        strokeWidth="3"
                                                        fill="none"
                                                        strokeDasharray={`${2 * Math.PI * 16}`}
                                                        strokeDashoffset={`${2 * Math.PI * 16 * (1 - videoUploadProgress[topic.id] / 100)}`}
                                                        strokeLinecap="round"
                                                        className="transition-all duration-300"
                                                      />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                      <span className="text-xs font-bold text-indigo-600">{videoUploadProgress[topic.id]}%</span>
                                                    </div>
                                                  </div>
                                                  <div className="flex-1 min-w-0">
                                                    <p className="text-xs sm:text-sm font-medium text-gray-700">Uploading video...</p>
                                                    <div className="w-full bg-gray-200 rounded-full h-1 sm:h-1.5 mt-1.5 sm:mt-2">
                                                      <div
                                                        className="bg-indigo-600 h-1 sm:h-1.5 rounded-full transition-all duration-300"
                                                        style={{ width: `${videoUploadProgress[topic.id]}%` }}
                                                      ></div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            ) : topic.videoUrl ? (
                                              <div className="bg-white p-2 sm:p-3 rounded-lg border border-gray-300">
                                                <div className="flex items-center justify-between gap-2">
                                                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                      <Video className="text-indigo-600" size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                      <p className="text-xs font-medium text-gray-700 truncate">
                                                        Video uploaded
                                                      </p>
                                                      <p className="text-xs text-gray-500 truncate">{topic.videoUrl.substring(0, 30)}...</p>
                                                    </div>
                                                  </div>
                                                  <label className="px-2 sm:px-3 py-1 sm:py-1.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded hover:bg-indigo-100 cursor-pointer transition whitespace-nowrap flex-shrink-0">
                                                    Change
                                                    <input
                                                      type="file"
                                                      accept="video/*"
                                                      onChange={(e) => handleVideoUpload(e, levelIndex, chapterIndex, topicIndex, topic.id)}
                                                      className="hidden"
                                                    />
                                                  </label>
                                                </div>
                                              </div>
                                            ) : (
                                              <label className="bg-white p-3 sm:p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition flex items-center justify-center space-x-2 sm:space-x-3">
                                                <Video className="text-gray-400 flex-shrink-0" size={18} />
                                                <div>
                                                  <p className="text-xs sm:text-sm font-medium text-gray-700">Upload lesson video</p>
                                                  <p className="text-xs text-gray-500">MP4, MOV up to 100MB</p>
                                                </div>
                                                <input
                                                  type="file"
                                                  accept="video/*"
                                                  onChange={(e) => handleVideoUpload(e, levelIndex, chapterIndex, topicIndex, topic.id)}
                                                  className="hidden"
                                                />
                                              </label>
                                            )}
                                          </div>

                                          {/* Notes Image Upload */}
                                          <div>
                                              <label className="block text-xs font-semibold text-gray-600 mb-1.5 sm:mb-2">
                                                  Lesson Notes Image (Optional)
                                              </label>
                                              {notesImageUploadProgress[topic.id] !== undefined ? (
                                                  <div className="w-full p-3 sm:p-4 bg-white rounded-lg border-2 border-indigo-200 flex items-center space-x-3">
                                                      <div className="w-10 h-10 relative flex-shrink-0">
                                                          <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 40 40">
                                                              <circle cx="20" cy="20" r="16" stroke="#e5e7eb" strokeWidth="3" fill="none" />
                                                              <circle cx="20" cy="20" r="16" stroke="#4f46e5" strokeWidth="3" fill="none"
                                                                  strokeDasharray={`${2 * Math.PI * 16}`}
                                                                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - notesImageUploadProgress[topic.id] / 100)}`}
                                                                  strokeLinecap="round" className="transition-all duration-300" />
                                                          </svg>
                                                          <div className="absolute inset-0 flex items-center justify-center">
                                                              <span className="text-xs font-bold text-indigo-600">{notesImageUploadProgress[topic.id]}%</span>
                                                          </div>
                                                      </div>
                                                      <div className="flex-1 min-w-0">
                                                          <p className="text-xs sm:text-sm font-medium text-gray-700">Uploading image...</p>
                                                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                                              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${notesImageUploadProgress[topic.id]}%` }}></div>
                                                          </div>
                                                      </div>
                                                  </div>
                                              ) : topic.notesImageUrl ? (
                                                  <div className="relative group">
                                                      <img src={topic.notesImageUrl} alt="Notes preview" className="w-full rounded-lg border border-gray-300" />
                                                      <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                          <label className="px-3 py-1.5 bg-white text-gray-800 text-xs font-medium rounded cursor-pointer hover:bg-gray-100 transition whitespace-nowrap">
                                                              Change Image
                                                              <input
                                                                  type="file"
                                                                  accept="image/*"
                                                                  onChange={(e) => handleNotesImageUpload(e, levelIndex, chapterIndex, topicIndex, topic.id)}
                                                                  className="hidden"
                                                              />
                                                          </label>
                                                          <button onClick={() => handleRemoveNotesImage(levelIndex, chapterIndex, topicIndex)}
                                                              className="ml-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition">
                                                              <XCircle size={16} />
                                                          </button>
                                                      </div>
                                                  </div>
                                              ) : (
                                                  <label className="bg-white p-3 sm:p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition flex items-center justify-center space-x-2 sm:space-x-3">
                                                      <ImageIcon className="text-gray-400 flex-shrink-0" size={18} />
                                                      <div>
                                                          <p className="text-xs sm:text-sm font-medium text-gray-700">Upload notes image</p>
                                                          <p className="text-xs text-gray-500">PNG, JPG</p>
                                                      </div>
                                                      <input
                                                          type="file"
                                                          accept="image/*"
                                                          onChange={(e) => handleNotesImageUpload(e, levelIndex, chapterIndex, topicIndex, topic.id)}
                                                          className="hidden"
                                                      />
                                                  </label>
                                              )}
                                          </div>

                                          {/* Notes Text Area */}
                                          <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                              Lesson Notes (Text)
                                            </label>
                                            <textarea
                                              name="notes"
                                              value={topic.notes}
                                              onChange={(e) => handleTopicChange(levelIndex, chapterIndex, topicIndex, e)}
                                              placeholder="Add lesson notes or practice tips"
                                              rows="2"
                                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none resize-none"
                                            ></textarea>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => removeTopic(levelIndex, chapterIndex, topicIndex)}
                                          className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition mt-4 sm:mt-6 flex-shrink-0"
                                        >
                                          <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}