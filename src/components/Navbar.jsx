import { MenuIcon, XIcon, UserCircle, BookOpen } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const [openMobileMenu, setOpenMobileMenu] = useState(false);
    const [openProfileMenu, setOpenProfileMenu] = useState(false);
    const { currentUser, logout } = useAuth();
    const profileMenuRef = useRef(null);
    const navigate = useNavigate();

    // Effect to prevent scrolling when the mobile menu is open
    useEffect(() => {
        if (openMobileMenu) {
            document.body.classList.add("max-md:overflow-hidden");
        } else {
            document.body.classList.remove("max-md:overflow-hidden");
        }
    }, [openMobileMenu]);

    // Effect to close the profile dropdown when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setOpenProfileMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            setOpenProfileMenu(false);
            navigate('/');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <>
            <nav className={`flex items-center justify-between fixed z-50 top-0 w-full px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-slate-200 bg-white/40 ${openMobileMenu ? 'bg-white/80' : 'backdrop-blur'}`}>
                <div className="flex items-center gap-1">
                    <Link to="/">
                        <img src="/assets/logo.png" alt="Logo" className="h-10" />
                    </Link>
                    <Link to="/">
                        <h1 className="font-bold text-xl md:text-2xl text-indigo-600 hover:text-indigo-700 transition">
                            Aatmik Jagrati Musics
                        </h1>
                    </Link>
                </div>
                
                {/* --- Desktop Navigation --- */}
                <div className="hidden items-center md:gap-8 lg:gap-9 font-medium md:flex">
                    <NavLink to="/" className="hover:text-indigo-600 transition-colors">Home</NavLink>
                    <NavLink to="/courses" className="hover:text-indigo-600 transition-colors">Courses</NavLink>
                    <NavLink to="/live-classes" className="hover:text-indigo-600 transition-colors">Live Classes</NavLink>
                    {currentUser && (
                        <NavLink to="/my-classroom" className="hover:text-indigo-600 transition-colors">My Classroom</NavLink>
                    )}
                </div>
                
                {/* --- Mobile Menu Overlay --- */}
                <div className={`fixed inset-0 flex flex-col items-center justify-center gap-6 text-lg font-medium bg-white/80 backdrop-blur-md md:hidden transition duration-300 ${openMobileMenu ? "translate-x-0" : "-translate-x-full"}`}>
                    <NavLink to="/" onClick={() => setOpenMobileMenu(false)}>Home</NavLink>
                    <NavLink to="/courses" onClick={() => setOpenMobileMenu(false)}>Courses</NavLink>
                    <NavLink to="/live-classes" onClick={() => setOpenMobileMenu(false)}>Live Classes</NavLink>
                    {currentUser && (
                        <NavLink to="/my-classroom" onClick={() => setOpenMobileMenu(false)}>My Classroom</NavLink>
                    )}
                    
                    <div className="border-t border-gray-300 w-32 my-2"></div>

                    {currentUser ? (
                        <>
                            {/* Mobile Profile Picture */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-2 border-indigo-600">
                                    {currentUser.photoURL ? (
                                        <img 
                                            src={currentUser.photoURL} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <UserCircle size={40} className="text-gray-400" />
                                    )}
                                </div>
                                <p className="font-medium text-gray-800">{currentUser.displayName || currentUser.email}</p>
                            </div>
                            
                            <Link to="/profile" onClick={() => setOpenMobileMenu(false)} className="text-gray-800 hover:text-indigo-600">My Profile</Link>
                            <button 
                                onClick={() => { handleLogout(); setOpenMobileMenu(false); }} 
                                className="text-red-500 hover:text-red-700 font-medium"
                            >
                                Sign out
                            </button>
                        </>
                    ) : (
                        <Link to="/login" onClick={() => setOpenMobileMenu(false)}>
                            <button className="font-medium px-6 py-2 border border-indigo-600 rounded-md transition hover:bg-slate-100">
                                Sign in
                            </button>
                        </Link>
                    )}
                    
                    <button 
                        className="absolute top-6 right-6 aspect-square size-10 p-1 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-md" 
                        onClick={() => setOpenMobileMenu(false)}
                    >
                        <XIcon />
                    </button>
                </div>
                
                {/* Right side controls */}
                <div className="flex items-center gap-4">
                    {currentUser ? (
                        // Profile Dropdown for logged-in users
                        <div className="relative" ref={profileMenuRef}>
                            <button 
                                onClick={() => setOpenProfileMenu(!openProfileMenu)} 
                                className="hidden md:flex items-center gap-2 hover:opacity-80 transition"
                            >
                                {/* Profile Picture in Navbar */}
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-2 border-indigo-600">
                                    {currentUser.photoURL ? (
                                        <img 
                                            src={currentUser.photoURL} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <UserCircle size={24} className="text-gray-400" />
                                    )}
                                </div>
                            </button>
                            
                            {openProfileMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                                        {/* Profile Picture in Dropdown */}
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                                            {currentUser.photoURL ? (
                                                <img 
                                                    src={currentUser.photoURL} 
                                                    alt="Profile" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <UserCircle size={28} className="text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-500">Signed in as</p>
                                            <p className="font-medium text-gray-800 truncate">{currentUser.displayName || currentUser.email}</p>
                                        </div>
                                    </div>
                                    <div className="py-1">
                                        <Link 
                                            to="/my-classroom" 
                                            onClick={() => setOpenProfileMenu(false)}
                                            className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                                        >
                                            <BookOpen size={16} /> My Classroom
                                        </Link>
                                        <Link 
                                            to="/profile" 
                                            onClick={() => setOpenProfileMenu(false)}
                                            className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                                        >
                                            <UserCircle size={16} /> My Profile
                                        </Link>
                                    </div>
                                    <div className="border-t border-gray-100 py-1">
                                        <button 
                                            onClick={handleLogout} 
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Sign in button for guests
                        <Link to="/login">
                            <button className="hidden md:block hover:bg-slate-100 transition px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md font-medium">
                                Sign in
                            </button>
                        </Link>
                    )}
                    
                    {/* Mobile Menu Button */}
                    <button onClick={() => setOpenMobileMenu(!openMobileMenu)} className="md:hidden">
                        <MenuIcon size={26} className="active:scale-90 transition" />
                    </button>
                </div>
            </nav>

            {/* --- FIX: Added Spacer div to prevent content overlapping --- */}
            <div className="h-20"></div>
        </>
    );
}