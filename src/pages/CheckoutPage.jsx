import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../Config/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { 
    LockClosedIcon, 
    ShieldCheckIcon, 
    VideoCameraIcon, 
    BookOpenIcon,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/solid';

export default function CheckoutPage() {
    const { courseId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isLiveCourse = location.pathname.includes('/checkout/live/');

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    
    // 1. New State for enrollment check
    const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);

    // 2. Check Enrollment Status on Load
    useEffect(() => {
        const checkEnrollment = async () => {
            if (!currentUser || !courseId) return;

            try {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userDocRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    // Check the correct array based on course type
                    const listName = isLiveCourse ? 'enrolledLiveCourses' : 'enrolledCourses';
                    const enrollments = userData[listName] || [];

                    // Check if courseId exists and is NOT expired
                    const hasValidEnrollment = enrollments.some(enrollment => {
                        if (enrollment.courseId !== courseId) return false;
                        
                        // If there is an expiry date, ensure it is in the future
                        if (enrollment.expiryDate) {
                            const expiry = enrollment.expiryDate.toDate();
                            return expiry > new Date();
                        }
                        // If no expiry date (lifetime), they are enrolled
                        return true;
                    });

                    if (hasValidEnrollment) {
                        setIsAlreadyEnrolled(true);
                    }
                }
            } catch (error) {
                console.error("Error checking enrollment:", error);
            }
        };

        checkEnrollment();
    }, [currentUser, courseId, isLiveCourse]);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const collectionName = isLiveCourse ? 'liveCourses' : 'courses';
                const courseDoc = await getDoc(doc(db, collectionName, courseId));
                
                if (courseDoc.exists()) {
                    setCourse({ id: courseDoc.id, ...courseDoc.data() });
                } else {
                    alert("Course not found");
                    navigate(isLiveCourse ? '/live-classes' : '/courses');
                }
            } catch (error) {
                console.error("Error fetching details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId, navigate, isLiveCourse]);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        if (!currentUser) {
            alert("Please login to purchase.");
            navigate('/login');
            return;
        }

        setProcessing(true);

        const res = await loadRazorpayScript();

        if (!res) {
            alert('Razorpay SDK failed to load. Check your internet connection.');
            setProcessing(false);
            return;
        }

        const cleanPrice = course.price ? parseInt(course.price.toString().replace(/[^0-9]/g, '')) : 0;

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
            amount: cleanPrice * 100,
            currency: "INR",
            name: "Aatmik Jagrati Musics", 
            description: isLiveCourse ? `Live Session: ${course.title}` : `Course: ${course.title}`,
            image: "https://via.placeholder.com/150",
            
            handler: async function (response) {
                try {
                    console.log("Payment Success, Saving to DB...");
                    
                    const expiryDate = new Date();
                    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

                    const enrollmentData = {
                        courseId: course.id,
                        enrolledAt: new Date(),
                        expiryDate: expiryDate,
                        paymentId: response.razorpay_payment_id,
                        orderId: response.razorpay_order_id || "test_transaction",
                        amountPaid: cleanPrice,
                        type: isLiveCourse ? 'live' : 'standard'
                    };

                    const userRef = doc(db, 'users', currentUser.uid);
                    const fieldToUpdate = isLiveCourse ? 'enrolledLiveCourses' : 'enrolledCourses';

                    await setDoc(userRef, {
                        [fieldToUpdate]: arrayUnion(enrollmentData)
                    }, { merge: true });

                    alert(isLiveCourse 
                        ? "Payment Successful! You are enrolled in the Live Session." 
                        : "Payment Successful! Course added to your classroom.");
                        
                    navigate('/my-classroom');

                } catch (error) {
                    console.error("Error saving enrollment:", error);
                    alert(`Payment succeeded (ID: ${response.razorpay_payment_id}) but database update failed. Please contact support with this ID.`);
                } finally {
                    setProcessing(false);
                }
            },
            
            prefill: {
                name: currentUser.displayName || "",
                email: currentUser.email || "",
                contact: ""
            },
            theme: {
                color: "#4F46E5" 
            }
        };

        try {
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

            paymentObject.on('payment.failed', function (response) {
                alert("Payment Failed: " + response.error.description);
                setProcessing(false);
            });
        } catch (error) {
            console.error("Error opening Razorpay:", error);
            setProcessing(false);
        }
    };

    const getTotalStats = () => {
        if (isLiveCourse || !course?.levels) return { totalLessons: 0, totalDuration: 0 };
        
        let totalLessons = 0;
        let totalDuration = 0;
        
        course.levels.forEach(level => {
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
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }
    
    // 3. Render "Already Enrolled" Screen if true
    if (isAlreadyEnrolled) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircleIcon className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Enrolled</h2>
                    <p className="text-gray-600 mb-8">
                        You already have an active enrollment for this {isLiveCourse ? 'session' : 'course'}. 
                        There is no need to purchase it again.
                    </p>
                    <button 
                        onClick={() => navigate('/my-classroom')}
                        className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Go to My Classroom
                    </button>
                    <button 
                        onClick={() => navigate(-1)}
                        className="mt-4 text-sm text-gray-500 hover:text-gray-700 font-medium"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!course) return null;

    const stats = getTotalStats();

    const courseFeatures = isLiveCourse ? [
        { icon: ClockIcon, text: "Interactive Live Session" },
        ...(course.validityDays ? [{
            icon: VideoCameraIcon,
            text: `${course.validityDays}-day access to recording`
        }] : []),
        { icon: CheckCircleIcon, text: 'Q&A with instructor' },
        { icon: CheckCircleIcon, text: 'Access on mobile and desktop' }
    ] : [
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto mb-8">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">✓</div>
                        Course
                    </span>
                    <div className="w-12 h-0.5 bg-indigo-600"></div>
                    <span className="flex items-center gap-1">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                        Checkout
                    </span>
                    <div className="w-12 h-0.5 bg-slate-300"></div>
                    <span className="flex items-center gap-1 text-slate-400">
                        <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold">3</div>
                        Enrolled
                    </span>
                </div>
            </div>

            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                        
                        <div className="lg:col-span-2 p-8 lg:p-12">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Your Enrollment</h1>
                                <p className="text-slate-600">You're one step away from accessing premium content</p>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-200">
                                {course.imageUrl && (
                                    <img 
                                        src={course.imageUrl} 
                                        alt={course.title} 
                                        className="w-full h-48 object-cover rounded-lg mb-4"
                                    />
                                )}
                                
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                        {isLiveCourse ? (
                                            <VideoCameraIcon className="w-8 h-8 text-indigo-600" />
                                        ) : (
                                            <BookOpenIcon className="w-8 h-8 text-indigo-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider bg-indigo-100 text-indigo-700">
                                                {isLiveCourse ? 'Live Session' : 'Video Course'}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">{course.title}</h3>
                                        {course.instructor && (
                                            <p className="text-sm text-slate-600">by {course.instructor}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-slate-900">{course.price}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">
                                    {isLiveCourse ? 'This session includes' : 'This course includes'}
                                </h3>
                                <div className="space-y-3">
                                    {courseFeatures.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-slate-700">
                                            <item.icon className="w-5 h-5 flex-shrink-0 text-green-500" />
                                            <span>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-200">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                                    <span>Secure Payment</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <LockClosedIcon className="w-5 h-5 text-slate-400" />
                                    <span>SSL Encrypted</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                                    <span>Instant Access</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 lg:p-12 flex flex-col justify-between bg-gradient-to-br from-indigo-50 to-indigo-100/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h3>
                                
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-slate-700">
                                        <span>Course Price</span>
                                        <span className="font-semibold">{course.price}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-700">
                                        <span>Taxes & Fees</span>
                                        <span className="font-semibold">Included</span>
                                    </div>
                                    <div className="border-t-2 border-slate-300 pt-4 flex justify-between text-lg font-bold text-slate-900">
                                        <span>Total Amount</span>
                                        <span>{course.price}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={processing}
                                    className={`w-full py-4 px-6 rounded-xl text-base font-bold text-white shadow-lg 
                                    ${processing 
                                        ? 'bg-slate-400 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-95'
                                    } 
                                    transform transition-all duration-200 ease-out focus:outline-none focus:ring-4 focus:ring-indigo-300`}
                                >
                                    {processing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        `Proceed to Pay ${course.price}`
                                    )}
                                </button>

                                <button 
                                    onClick={() => navigate(-1)}
                                    disabled={processing}
                                    className="mt-4 w-full text-sm text-slate-600 hover:text-slate-900 transition-colors py-2 font-medium disabled:opacity-50"
                                >
                                    ← Go Back
                                </button>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-300">
                                <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                                    <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                                    <span className="font-semibold">100% Secure Checkout</span>
                                </div>
                                <p className="text-xs text-slate-500">
                                    Powered by Razorpay. Your payment information is encrypted and secure.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-600">
                        Need help? <button onClick={() => navigate('/support')} className="text-indigo-600 hover:text-indigo-700 font-semibold underline">Contact Support</button>
                    </p>
                </div>
            </div>
        </div>
    );
}