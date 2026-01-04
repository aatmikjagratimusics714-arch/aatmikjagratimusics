import React, { useState, useEffect } from 'react';
import { db } from '../Config/firebaseConfig';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Search, User, ChevronDown, ChevronUp, Plus, CheckCircle, Trash2 } from 'lucide-react';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [liveCourses, setLiveCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // UI State
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [grantType, setGrantType] = useState('course'); // 'course' or 'live'
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [processing, setProcessing] = useState(false);

    // 1. Fetch All Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersSnap, coursesSnap, liveSnap] = await Promise.all([
                    getDocs(collection(db, 'users')),
                    getDocs(collection(db, 'courses')),
                    getDocs(collection(db, 'liveCourses'))
                ]);

                setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setCourses(coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLiveCourses(liveSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getCourseDetails = (id, type) => {
        const list = type === 'live' ? liveCourses : courses;
        return list.find(c => c.id === id) || { title: 'Unknown Course', imageUrl: null };
    };

    // 2. Handle Granting Access (FIXED: Respects Course Validity)
    const handleGrant = async (userId) => {
        if (!selectedCourseId) return;
        setProcessing(true);

        try {
            // Find the selected course details to check its validity
            const list = grantType === 'live' ? liveCourses : courses;
            const selectedCourse = list.find(c => c.id === selectedCourseId);
            
            let expiryDate = null; // Default to Lifetime (null)

            // If the course has specific validity days (e.g. 365), calculate the expiry date
            if (selectedCourse?.validityDays) {
                const days = parseInt(selectedCourse.validityDays);
                if (!isNaN(days) && days > 0) {
                    const date = new Date();
                    date.setDate(date.getDate() + days); // Add validity days to today
                    expiryDate = date;
                }
            }

            const newEnrollment = {
                courseId: selectedCourseId,
                enrolledAt: new Date(),
                expiryDate: expiryDate, // Will be specific date OR null (Lifetime)
                paymentId: 'admin_manual_grant', 
                type: grantType === 'live' ? 'live' : 'standard'
            };

            const userRef = doc(db, 'users', userId);
            const field = grantType === 'live' ? 'enrolledLiveCourses' : 'enrolledCourses';

            await updateDoc(userRef, {
                [field]: arrayUnion(newEnrollment)
            });

            // Update local state
            setUsers(prev => prev.map(u => {
                if (u.id === userId) {
                    const oldList = u[field] || [];
                    return { ...u, [field]: [...oldList, newEnrollment] };
                }
                return u;
            }));

            alert("Access granted successfully!");
            setSelectedCourseId(''); 

        } catch (error) {
            console.error("Error:", error);
            alert("Failed to grant access. Check permissions.");
        } finally {
            setProcessing(false);
        }
    };

    // 3. Handle Removing Access (Filter & Replace)
    const handleRemoveAccess = async (userId, enrollment, isLive) => {
        if (!window.confirm("Are you sure you want to remove access to this course?")) return;

        try {
            const userRef = doc(db, 'users', userId);
            const field = isLive ? 'enrolledLiveCourses' : 'enrolledCourses';

            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex === -1) return;

            const currentUser = users[userIndex];
            const oldList = currentUser[field] || [];

            // Filter out the course by ID
            const newList = oldList.filter(e => e.courseId !== enrollment.courseId);

            await updateDoc(userRef, {
                [field]: newList
            });

            setUsers(prev => {
                const newUsers = [...prev];
                newUsers[userIndex] = { ...newUsers[userIndex], [field]: newList };
                return newUsers;
            });

        } catch (error) {
            console.error("Error removing access:", error);
            alert("Failed to remove access.");
        }
    };

    const toggleUser = (userId) => {
        if (expandedUserId === userId) {
            setExpandedUserId(null);
            setSelectedCourseId(''); 
        } else {
            setExpandedUserId(userId);
            setSelectedCourseId(''); 
            setGrantType('course');
        }
    };

    const filteredUsers = users.filter(user => 
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Management Panel...</div>;

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm md:text-base text-gray-500 mt-1">Manage users and grant/revoke course access.</p>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative max-w-md w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Users List Container */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="hidden md:flex bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <div className="w-1/2">User</div>
                    <div className="w-1/2">Email</div>
                    <div className="w-10"></div>
                </div>

                <div className="divide-y divide-gray-200">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <div key={user.id} className={`transition ${expandedUserId === user.id ? 'bg-gray-50' : 'bg-white'}`}>
                                <div 
                                    onClick={() => toggleUser(user.id)}
                                    className="px-4 md:px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                                >
                                    <div className="flex items-center flex-1 min-w-0">
                                        <div className="flex-shrink-0 h-10 w-10 md:h-12 md:w-12">
                                            {user.photoURL ? (
                                                <img className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover" src={user.photoURL} alt={user.displayName} />
                                            ) : (
                                                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                                    <User className="h-5 w-5 md:h-6 md:w-6 text-indigo-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4 flex-1 md:flex md:items-center md:justify-between">
                                            <div className="md:w-1/2 pr-4">
                                                <div className="text-sm md:text-base font-medium text-gray-900 truncate">
                                                    {user.displayName || 'No Name'}
                                                </div>
                                                <div className="md:hidden text-xs text-gray-500 truncate mt-0.5">
                                                    {user.email}
                                                </div>
                                            </div>
                                            <div className="hidden md:block md:w-1/2 text-sm text-gray-500 truncate">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-2 flex-shrink-0">
                                        {expandedUserId === user.id ? 
                                            <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                                            <ChevronDown className="h-5 w-5 text-gray-400" />
                                        }
                                    </div>
                                </div>

                                {expandedUserId === user.id && (
                                    <div className="px-4 md:px-6 pb-6 pt-2 bg-gray-50 border-t border-gray-100">
                                        <div className="mb-6">
                                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <CheckCircle size={14} className="text-green-600"/> Currently Enrolled
                                            </h3>
                                            <div className="flex flex-wrap gap-3 md:gap-4">
                                                {[
                                                    ...(user.enrolledCourses || []).map(c => ({...c, isLive: false})), 
                                                    ...(user.enrolledLiveCourses || []).map(c => ({...c, isLive: true}))
                                                ].map((enrollment, idx) => {
                                                    const details = getCourseDetails(enrollment.courseId, enrollment.isLive ? 'live' : 'standard');
                                                    return (
                                                        <div key={idx} className="group bg-white p-3 rounded-lg border shadow-sm w-full sm:w-48 flex gap-3 items-center relative hover:shadow-md transition">
                                                            <div className="h-12 w-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 relative">
                                                                {details.imageUrl ? (
                                                                    <img src={details.imageUrl} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">IMG</div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-gray-900 truncate">
                                                                    {details.title}
                                                                </p>
                                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${enrollment.isLive ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                                    {enrollment.isLive ? 'Live Class' : 'Video Course'}
                                                                </span>
                                                            </div>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); 
                                                                    handleRemoveAccess(user.id, enrollment, enrollment.isLive);
                                                                }}
                                                                className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-2 rounded-full shadow-sm hover:bg-red-600 hover:text-white transition md:opacity-0 md:group-hover:opacity-100 opacity-100"
                                                                title="Remove Access"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                                {(!user.enrolledCourses?.length && !user.enrolledLiveCourses?.length) && (
                                                    <p className="text-sm text-gray-400 italic py-2">No active enrollments.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-white p-4 md:p-5 rounded-xl border border-indigo-100 shadow-sm max-w-3xl">
                                            <h3 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                                <Plus size={16} className="text-indigo-600"/> Grant New Access
                                            </h3>
                                            <div className="flex flex-col md:flex-row gap-4 md:items-end">
                                                <div className="w-full md:w-auto">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Type</label>
                                                    <div className="flex bg-gray-100 p-1 rounded-lg">
                                                        <button 
                                                            onClick={() => { setGrantType('course'); setSelectedCourseId(''); }}
                                                            className={`flex-1 md:flex-none px-4 py-2.5 text-xs font-medium rounded-md transition md:w-28 ${grantType === 'course' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                                                        >
                                                            Video Course
                                                        </button>
                                                        <button 
                                                            onClick={() => { setGrantType('live'); setSelectedCourseId(''); }}
                                                            className={`flex-1 md:flex-none px-4 py-2.5 text-xs font-medium rounded-md transition md:w-28 ${grantType === 'live' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                                                        >
                                                            Live Class
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex-1 w-full">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Select {grantType === 'live' ? 'Live Class' : 'Course'}</label>
                                                    <select 
                                                        className="w-full border-gray-300 border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                                        value={selectedCourseId}
                                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                                    >
                                                        <option value="">Select option...</option>
                                                        {(grantType === 'live' ? liveCourses : courses).map(c => (
                                                            <option key={c.id} value={c.id}>{c.title}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <button 
                                                    onClick={() => handleGrant(user.id)}
                                                    disabled={!selectedCourseId || processing}
                                                    className="w-full md:w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center shadow-sm"
                                                >
                                                    {processing ? '...' : 'Add Access'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="px-6 py-8 text-center text-sm text-gray-500">
                            No users found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}