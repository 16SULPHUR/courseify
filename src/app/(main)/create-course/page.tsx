// src/app/(main)/create-course/page.tsx
'use client';
import CourseForm from '@/components/courses/CourseForm';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreateCoursePage() {
    const { isAuthenticated, token } = useAuthStore(); // token check for initial load
    const router = useRouter();

    useEffect(() => {
        // This check is crucial for client-side protection.
        // Zustand's state might take a moment to hydrate.
        // Checking token directly from localStorage can be an initial quick check too.
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (!isAuthenticated && !storedToken) {
            router.replace('/auth/login?redirect=/create-course');
        }
    }, [isAuthenticated, token, router]);

    // Render form only if authenticated, or show loading/redirecting message
    if (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('authToken')) {
         // This state will be brief as useEffect redirects.
        return <p className="text-center py-10">Redirecting to login...</p>;
    }


    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-center">Create a New Course</h1>
            <CourseForm />
        </div>
    );
}