import React, { useState } from 'react';
import { ShieldCheck, FileText, RefreshCw, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PolicyPage() {
  const [activeTab, setActiveTab] = useState('privacy');

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'refund', label: 'Refund Policy', icon: RefreshCw },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
          Legal & Policies
        </h1>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 text-gray-700 leading-relaxed border border-gray-100">
          
          {/* PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">Privacy Policy</h2>
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              
              <h3 className="text-lg font-semibold text-gray-800">1. Information We Collect</h3>
              <p>
                We collect information you provide directly to us when you create an account, enroll in a course, or communicate with us. This includes your name, email address, and payment confirmation details (we do not store your actual credit card information).
              </p>

              <h3 className="text-lg font-semibold text-gray-800">2. How We Use Your Information</h3>
              <p>
                We use your information to provide access to our courses, process transactions, send you technical notices and support messages, and communicate with you about new courses or features.
              </p>

              <h3 className="text-lg font-semibold text-gray-800">3. Data Security</h3>
              <p>
                We implement appropriate security measures to protect your personal information. Your payment data is processed securely through Razorpay, and our database is hosted on secure Firebase servers.
              </p>

              <h3 className="text-lg font-semibold text-gray-800">4. Cookies</h3>
              <p>
                We use cookies to maintain your login session and preferences. You can control cookie settings through your browser.
              </p>
            </div>
          )}

          {/* TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">Terms of Service</h2>
              
              <h3 className="text-lg font-semibold text-gray-800">1. Acceptance of Terms</h3>
              <p>
                By accessing and using Aatmik Jagrati Musics, you agree to comply with and be bound by these Terms of Service.
              </p>

              <h3 className="text-lg font-semibold text-gray-800">2. Course License</h3>
              <p>
                When you purchase a course, we grant you a limited, non-exclusive, non-transferable license to access and view the course content for your personal, non-commercial purposes. <strong>Sharing your account credentials with others is strictly prohibited</strong> and may result in account suspension without refund.
              </p>

              <h3 className="text-lg font-semibold text-gray-800">3. Intellectual Property</h3>
              <p>
                All content, including videos, text, logos, and graphics, is the property of Aatmik Jagrati Musics and is protected by copyright laws. You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>

              <h3 className="text-lg font-semibold text-gray-800">4. User Conduct</h3>
              <p>
                You agree not to use the platform for any unlawful purpose or to harass, abuse, or harm others. We reserve the right to terminate accounts that violate these standards.
              </p>
            </div>
          )}

          {/* REFUND POLICY */}
          {activeTab === 'refund' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">Refund & Cancellation Policy</h2>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="font-semibold text-yellow-800">
                  Please read this policy carefully before making a purchase.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-gray-800">1. Digital Products</h3>
              <p>
                Due to the nature of digital content, courses that have been accessed or viewed are generally non-refundable. Once you have started watching the videos or downloaded materials, we cannot offer a refund unless there is a technical defect that we cannot resolve.
              </p>

              <h3 className="text-lg font-semibold text-gray-800">2. Refund Eligibility</h3>
              <p>
                We may consider refund requests within <strong>5 days</strong> of purchase ONLY if:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>You have not accessed more than 10% of the course content.</li>
                <li>There is a proven technical issue preventing you from accessing the content.</li>
                <li>The purchase was made accidentally (duplicate transaction).</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800">3. Live Sessions</h3>
              <p>
                For live classes, cancellations must be made at least 24 hours before the session begins to be eligible for a refund. No refunds will be issued for missed live sessions.
              </p>

              <h3 className="text-lg font-semibold text-gray-800">4. How to Request</h3>
              <p>
                To request a refund, please contact us with your transaction ID and the reason for the request.
              </p>
            </div>
          )}

          {/* Contact Section Footer */}
          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <h4 className="font-semibold text-gray-900 mb-2">Have questions about these policies?</h4>
            <a 
              href="mailto:support@aatmikjagratimusics.com" 
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}