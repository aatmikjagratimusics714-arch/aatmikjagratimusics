import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../Config/firebaseConfig';
import { User, Mail, Edit3, Key, Shield, Camera, X } from 'lucide-react';
import { Link } from 'react-router-dom';


export default function Profile() {
    const { currentUser, userRole } = useAuth();
    const [displayName, setDisplayName] = useState(currentUser.displayName || '');
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [photoURL, setPhotoURL] = useState(currentUser.photoURL || '');
    const fileInputRef = useRef(null);


    // Check if user is admin based on Firestore role
    const isAdmin = userRole === 'admin';


    const handleProfileUpdate = async () => {
        if (currentUser.displayName === displayName) return;


        setLoading(true);
        setError('');
        setMessage('');
        try {
            await updateProfile(currentUser, { displayName });
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError('Failed to update profile. Please try again.');
            console.error(err);
        }
        setLoading(false);
    };


    const handlePasswordReset = async () => {
        setError('');
        setMessage('');
        try {
            await sendPasswordResetEmail(currentUser.auth, currentUser.email);
            setMessage(`Password reset email sent to ${currentUser.email}.`);
        } catch (err) {
            setError('Failed to send password reset email.');
            console.error(err);
        }
    };


    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;


        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file.');
            return;
        }


        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB.');
            return;
        }


        setUploadingImage(true);
        setError('');
        setMessage('');


        try {
            // Create a reference to the storage location
            const imageRef = ref(storage, `profile-pictures/${currentUser.uid}/${file.name}`);
            
            // Upload the file
            await uploadBytes(imageRef, file);
            
            // Get the download URL
            const downloadURL = await getDownloadURL(imageRef);
            
            // Update user profile with new photo URL
            await updateProfile(currentUser, { photoURL: downloadURL });
            
            setPhotoURL(downloadURL);
            setMessage('Profile picture updated successfully!');
        } catch (err) {
            setError('Failed to upload image. Please try again.');
            console.error(err);
        }
        
        setUploadingImage(false);
    };


    const handleRemoveImage = async () => {
        if (!photoURL) return;


        setUploadingImage(true);
        setError('');
        setMessage('');


        try {
            // Update profile to remove photo URL by setting it to empty string
            await updateProfile(currentUser, { photoURL: '' });
            setPhotoURL('');
            setMessage('Profile picture removed successfully!');
        } catch (err) {
            setError('Failed to remove profile picture.');
            console.error(err);
        }


        setUploadingImage(false);
    };


    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-16">
            <div className="max-w-3xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>


                {message && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                        {error}
                    </div>
                )}


                {/* Admin Dashboard Button */}
                {isAdmin && (
                    <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-6">
                        <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Admin Access</h3>
                                    <p className="text-sm text-gray-600">You have administrator privileges</p>
                                </div>
                            </div>
                            <Link
                                to="/admin"
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-md flex items-center space-x-2 whitespace-nowrap"
                            >
                                <Shield className="w-5 h-5" />
                                <span>Go to Admin Panel</span>
                            </Link>
                        </div>
                    </div>
                )}


                {/* Profile Picture Section */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
                    <div className="flex flex-col items-center space-y-4">
                        {/* Profile Picture Display */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                {photoURL ? (
                                    <img 
                                        src={photoURL} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-16 h-16 text-gray-400" />
                                )}
                            </div>
                            
                            {/* Edit/Upload Button */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                                className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition disabled:opacity-50"
                            >
                                <Camera className="w-5 h-5" />
                            </button>
                        </div>


                        {/* Hidden File Input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />


                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50 text-sm font-medium"
                            >
                                {uploadingImage ? 'Uploading...' : photoURL ? 'Change Picture' : 'Upload Picture'}
                            </button>
                            {photoURL && (
                                <button
                                    onClick={handleRemoveImage}
                                    disabled={uploadingImage}
                                    className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Remove Picture
                                </button>
                            )}
                        </div>
                    </div>
                </div>


                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <User className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="text-gray-900">{currentUser.displayName || 'Not set'}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Mail className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-gray-900">{currentUser.email}</p>
                            </div>
                        </div>
                        {isAdmin && (
                            <div className="flex items-center">
                                <Shield className="w-5 h-5 text-indigo-600 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-500">Role</p>
                                    <p className="text-indigo-600 font-medium">Administrator</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Edit3 className="w-5 h-5 mr-2" /> Update Name
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                                Display Name
                            </label>
                            <input
                                id="displayName"
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleProfileUpdate}
                            disabled={loading}
                            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </div>


                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Key className="w-5 h-5 mr-2" /> Password
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Reset your password via email
                    </p>
                    <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Send Reset Email
                    </button>
                </div>
            </div>
        </div>
    );
}
