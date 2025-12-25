import React from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../Config/firebaseConfig';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Function to fetch live courses from Firestore
const fetchLiveCourses = async () => {
    const coursesCollection = collection(db, 'liveCourses');
    const courseSnapshot = await getDocs(coursesCollection);
    return courseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Function to delete a live course
const deleteLiveCourse = async (courseId) => {
    const courseDoc = doc(db, 'liveCourses', courseId);
    await deleteDoc(courseDoc);
};

export default function AdminLiveCourses() {
    const queryClient = useQueryClient();

    // Fetch live courses using React Query
    const { data: courses, isLoading, isError, error } = useQuery({
        queryKey: ['liveCourses'], // Use a unique query key
        queryFn: fetchLiveCourses,
    });

    // Mutation for deleting a live course
    const deleteMutation = useMutation({
        mutationFn: deleteLiveCourse,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['liveCourses'] });
            alert("Live course deleted successfully!");
        },
        onError: (error) => {
            console.error("Error deleting live course: ", error);
            alert("Failed to delete live course.");
        }
    });

    const handleDeleteCourse = (courseId) => {
        if (window.confirm("Are you sure you want to delete this live course?")) {
            deleteMutation.mutate(courseId);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading live courses...</div>;
    if (isError) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Manage Live Courses</h1>
                <Link to="/admin/create-live-course" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700">
                    <PlusCircle size={18} />
                    Create Live Course
                </Link>
            </div>
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <ul className="divide-y divide-gray-200">
                        {courses && courses.map(course => (
                            <li key={course.id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <img src={course.imageUrl} alt={course.title} className="w-16 h-16 rounded-md object-cover hidden sm:block" />
                                    <div>
                                        <p className="font-medium text-gray-900">{course.title}</p>
                                        <p className="text-sm text-gray-500">{course.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 self-end sm:self-center">
                                    <Link to={`/admin/live-course/${course.id}`} className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1.5 py-2 px-3 rounded-md hover:bg-gray-100 transition">
                                        <Edit size={16} />
                                        Edit
                                    </Link>
                                    <button 
                                        onClick={() => handleDeleteCourse(course.id)} 
                                        disabled={deleteMutation.isLoading}
                                        className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1.5 py-2 px-3 rounded-md hover:bg-red-50 transition disabled:opacity-50"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}