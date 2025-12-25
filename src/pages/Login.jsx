import React, { useState } from 'react';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithPopup,
    updateProfile,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider, db } from '../Config/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

class Logger {
    constructor(context = 'App') { this.context = context; }
    info(message, data = {}) { console.info('ℹ️', { timestamp: new Date().toISOString(), context: this.context, message, data }); }
    error(message, error = null, data = {}) { console.error('❌', { timestamp: new Date().toISOString(), context: this.context, message, data, error: error ? { name: error.name, message: error.message, code: error.code } : null }); }
}

export default function Login() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    
    const logger = new Logger('LoginPage');

    const createUserProfileDocument = async (user, additionalData = {}) => {
        if (!user) return;
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
            const { displayName, email } = user;
            const createdAt = new Date();
            try {
                await setDoc(userRef, {
                    displayName: displayName || additionalData.name,
                    email,
                    createdAt,
                    role: 'user',
                });
            } catch (error) {
                logger.error("Error creating user document", error);
            }
        }
    };

    const handleSuccess = (result) => {
        logger.info('Authentication successful', { uid: result.user.uid });
        navigate('/courses');
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            let result;
            if (isSignUp) {
                result = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(result.user, { displayName: name });
                await createUserProfileDocument(result.user, { name });
            } else {
                result = await signInWithEmailAndPassword(auth, email, password);
            }
            handleSuccess(result);
        } catch (authError) {
            handleAuthError(authError);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await createUserProfileDocument(result.user);
            handleSuccess(result);
        } catch (authError) {
            handleAuthError(authError);
        } finally {
            setLoading(false);
        }
    };
    
    const handleForgotPassword = async () => {
        if (!email) {
            setError("Please enter your email to reset your password.");
            return;
        }
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Password reset email sent! Check your inbox.");
        } catch (authError) {
            handleAuthError(authError);
        } finally {
            setLoading(false);
        }
    };

    const handleAuthError = (authError) => {
        logger.error('Authentication failed', authError);
        const friendlyMessages = {
            'auth/user-not-found': 'No account with this email.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/email-already-in-use': 'This email is already in use.',
            'auth/weak-password': 'Password must be at least 6 characters.',
            'auth/invalid-email': 'Please enter a valid email.',
            'auth/too-many-requests': 'Too many attempts. Try again later.',
            'auth/popup-closed-by-user': 'Sign-in window closed.',
            'auth/account-exists-with-different-credential': 'An account with this email already exists.'
        };
        setError(friendlyMessages[authError.code] || 'An unexpected error occurred.');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 mb-4">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            {isSignUp ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
                        </p>
                    </div>
                    
                    {/* Alerts */}
                    {error && (
                        <div className="p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="p-4 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg">
                            {message}
                        </div>
                    )}
                    
                    {/* Form */}
                    <form className="space-y-5" onSubmit={handleEmailSubmit}>
                        {isSignUp && (
                            <div>
                                <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input 
                                        id="full-name" 
                                        name="name" 
                                        type="text" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        required 
                                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none" 
                                        placeholder="John Doe" 
                                    />
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    id="email-address" 
                                    name="email" 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none" 
                                    placeholder="you@example.com" 
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    id="password" 
                                    name="password" 
                                    type={showPassword ? "text" : "password"}
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none" 
                                    placeholder="••••••••" 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        
                        {!isSignUp && (
                            <div className="flex items-center justify-end">
                                <button 
                                    type="button" 
                                    onClick={handleForgotPassword} 
                                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}
                        
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full py-3 px-4 text-white bg-gray-900 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                isSignUp ? 'Create Account' : 'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-4 text-sm text-gray-500 font-medium">OR</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    {/* Google Sign In */}
                    <button 
                        onClick={handleGoogleSignIn} 
                        disabled={loading} 
                        className="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <img 
                            className="w-5 h-5 mr-3" 
                            src="https://www.svgrepo.com/show/475656/google-color.svg" 
                            alt="Google logo" 
                        />
                        Continue with Google
                    </button>

                    {/* Toggle Sign Up/In */}
                    <div className="text-center pt-4 border-t border-gray-200">
                        <button 
                            type="button" 
                            onClick={() => setIsSignUp(!isSignUp)} 
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            {isSignUp ? (
                                <>Already have an account? <span className="font-semibold">Sign in</span></>
                            ) : (
                                <>Don't have an account? <span className="font-semibold">Sign up</span></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}