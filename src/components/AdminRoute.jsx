import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
    const { currentUser, userRole, loading: authLoading } = useAuth();

    if (authLoading) {
        return <div className="flex justify-center items-center h-screen">Verifying access...</div>;
    }

    if (!currentUser || userRole !== 'admin') {
        // If not logged in or the role is not 'admin', redirect to the home page
        return <Navigate to="/" />;
    }

    return children; // If checks pass, render the admin component
}