import React from 'react'; // <-- This was the line with the typo, now corrected.
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../Config/firebaseConfig';
import { Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Function to fetch courses from Firestore
const fetchCourses = async () => {
    const coursesCollection = collection(db, 'courses');
    const courseSnapshot = await getDocs(coursesCollection);
    return courseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Function to delete a course
const deleteCourse = async (courseId) => {
    const courseDoc = doc(db, 'courses', courseId);
    await deleteDoc(courseDoc);
};

export default function AdminCourses() {
    const queryClient = useQueryClient();

    // Fetch courses using React Query
    const { data: courses, isLoading, isError, error } = useQuery({
        queryKey: ['courses'],
        queryFn: fetchCourses,
    });

    // Mutation for deleting a course
    const deleteMutation = useMutation({
        mutationFn: deleteCourse,
        onSuccess: () => {
            // Invalidate and refetch the courses query to update the list
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            alert("Course deleted successfully!");
        },
        onError: (error) => {
            console.error("Error deleting course: ", error);
            alert("Failed to delete course.");
        }
    });

    const handleDeleteCourse = (courseId) => {
        if (window.confirm("Are you sure you want to delete this course permanently? This action cannot be undone.")) {
            deleteMutation.mutate(courseId);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading courses...</div>;
    if (isError) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Courses</h1>
            <div className="mt-6 bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <ul className="divide-y divide-gray-200">
                        {courses.map(course => (
                            <li key={course.id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <img src={course.imageUrl} alt="" className="w-16 h-16 rounded-md object-cover hidden sm:block" />
                                    <div>
                                        <p className="font-medium text-gray-900">{course.title}</p>
                                        <p className="text-sm text-gray-500">{course.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 self-end sm:self-center">
                                    <Link to={`/admin/course/${course.id}`} className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1.5 py-2 px-3 rounded-md hover:bg-gray-100 transition">
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