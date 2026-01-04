import { Route, Routes, useLocation } from "react-router-dom";

// --- COMPONENT IMPORTS ---
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

// --- PAGE IMPORTS ---
import Home from "./pages/Home.jsx";
import Courses from "./pages/Courses.jsx";
import Login from "./pages/Login.jsx";
import CourseDetailPage from "./pages/CourseDetailPage.jsx"; 
import Profile from "./pages/Profile.jsx";
import MyClassroom from "./pages/MyClassroom.jsx"; 
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminCourses from "./pages/AdminCourses.jsx";
import CourseEditor from "./pages/CourseEditor.jsx";
import CourseInfoPage from "./pages/CourseInfoPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import AdminUsers from "./pages/AdminUsers.jsx"; // <--- ADDED IMPORT

// --- LIVE COURSE IMPORTS ---
import LiveClasses from "./pages/LiveClasses.jsx";
import LiveClassInfoPage from "./pages/LiveClassInfoPage.jsx";
import AdminLiveCourses from "./pages/AdminLiveCourses.jsx";
import LiveCourseEditor from "./pages/LiveCourseEditor.jsx";
import EnrolledLiveCoursePage from "./pages/EnrolledLiveCoursePage.jsx"; 

export default function App() {
  const pathname = useLocation().pathname;
  
  // Hide Navbar/Footer on login page and admin dashboard
  const showLayout = ![
    "/login",
  ].includes(pathname) && !pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />

      {/* Only render Navbar if showLayout is true */}
      {showLayout && <Navbar />}
      
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/courses" element={<Courses />} />
        
        {/* Public Info Pages */}
        <Route path="/course/:courseId" element={<CourseInfoPage />} />
        <Route path="/live-classes" element={<LiveClasses />} />
        <Route path="/live-course/:courseId" element={<LiveClassInfoPage />} />
        
        {/* --- Protected Routes --- */}
        <Route path="/my-classroom" element={<ProtectedRoute><MyClassroom /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        
        {/* Checkout Routes */}
        <Route path="/checkout/course/:courseId" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/checkout/live/:courseId" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        
        {/* Content Pages (After Enrollment) */}
        <Route path="/courses/:courseId" element={<ProtectedRoute><CourseDetailPage /></ProtectedRoute>} />
        <Route path="/enrolled/live-course/:courseId" element={<ProtectedRoute><EnrolledLiveCoursePage /></ProtectedRoute>} />
        
        {/* --- ADMIN ROUTES --- */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          
          {/* New User Management Route */}
          <Route path="users" element={<AdminUsers />} /> 
          
          {/* Standard Courses Admin */}
          <Route path="courses" element={<AdminCourses />} />
          <Route path="create-course" element={<CourseEditor />} />
          <Route path="course/:courseId" element={<CourseEditor />} />
          
          {/* Live Courses Admin */}
          <Route path="live-courses" element={<AdminLiveCourses />} />
          <Route path="create-live-course" element={<LiveCourseEditor />} />
          <Route path="live-course/:courseId" element={<LiveCourseEditor />} />
        </Route>
      </Routes>
      
      {showLayout && <Footer />}
    </>
  );
}