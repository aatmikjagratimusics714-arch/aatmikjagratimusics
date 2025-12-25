import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
    const { currentUser } = useAuth();

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, Admin!</h1>
            <p className="text-muted-foreground mt-2">
                You are logged in as: <span className="font-semibold">{currentUser?.email}</span>
            </p>
            <div className="mt-6 p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold">What you can do here:</h2>
                <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
                    <li>View all existing courses.</li>
                    <li>Create new courses from scratch.</li>
                    <li>Edit the content of any course, including its levels, chapters, and topics.</li>
                </ul>
                <p className="mt-4">Use the sidebar on the left to navigate through the admin panel.</p>
            </div>
        </div>
    );
}