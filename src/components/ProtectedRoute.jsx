import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { currentUser } = useAuth();

    if (!currentUser) {
        // If the user is not logged in, redirect them to the /login page
        return <Navigate to="/login" />;
    }

    return children; // If they are logged in, render the component they are trying to access
}