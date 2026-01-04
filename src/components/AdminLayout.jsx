/* eslint-disable no-irregular-whitespace */
import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  BookCopy,
  PlusCircle,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  Radio,
  Users,           // <--- Imported Users icon
  LayoutDashboard  // <--- Imported Dashboard icon
} from 'lucide-react'

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const linkClasses =
    'flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 group relative'
  const activeLinkClasses =
    'flex items-center gap-3 rounded-xl px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200 transition-all group relative'

  const navigationItems = [
    // --- 1. Main Dashboard Link (Stats Page) ---
    { 
        to: '/admin', 
        label: 'Dashboard', 
        icon: LayoutDashboard, 
        end: true // Ensures this only lights up when exactly on /admin
    },
    // --- 2. New User Management Link ---
    { 
        to: '/admin/users', 
        label: 'User Management', 
        icon: Users 
    },
    // --- Existing Links ---
    { to: '/admin/courses', label: 'Courses', icon: BookCopy },
    { to: '/admin/create-course', label: 'Create Course', icon: PlusCircle },
    { to: '/admin/live-courses', label: 'Live Courses', icon: Radio },
    {
      to: '/admin/create-live-course',
      label: 'Create Live Course',
      icon: PlusCircle,
    },
    { to: '/courses', label: 'Back to Site', icon: ExternalLink },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* --- Mobile Header --- */}
      <div className="lg:hidden bg-white border-b shadow-sm sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Linked Title to Main Dashboard */}
          <Link to="/admin" className="flex items-center gap-2">
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Admin Board
            </span>
          </Link>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <div className="flex min-h-screen">
        {/* --- Sidebar --- */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 h-screen
            w-64 bg-white border-r shadow-xl
            transform transition-transform duration-300 ease-in-out
            z-50 
            ${
              isMobileMenuOpen
                ? 'translate-x-0'
                : '-translate-x-full lg:translate-x-0'
            }
          `}
        >
          <div className="flex flex-col h-full">
            {/* --- Header for the slide-out mobile menu --- */}
            <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b">
              <span className="font-bold text-lg text-gray-700">Menu</span>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* --- Header for the desktop sidebar --- */}
            <div className="hidden lg:flex items-center justify-center px-4 py-5 border-b">
              {/* Linked Title to Main Dashboard */}
              <Link to="/admin">
                <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Board
                </span>
              </Link>
            </div>

            {/* --- Navigation --- */}
            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
              <div>
                {navigationItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end} // Important for the main Dashboard link
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      isActive ? activeLinkClasses : linkClasses
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={`h-5 w-5 ${
                            isActive
                              ? 'text-white'
                              : 'text-gray-500 group-hover:text-indigo-600'
                          } transition`}
                        />
                        <span className="font-medium text-sm flex-1">
                          {item.label}
                        </span>
                        {isActive && <ChevronRight className="h-4 w-4" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </nav>
          </div>
        </aside>

        <main className="flex-1 w-full lg:w-[calc(100vw-16rem)] overflow-x-hidden">
          <div className="p-4 sm:p-5 lg:p-6 xl:p-8 max-w-[1920px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}