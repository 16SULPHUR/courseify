'use client'


import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { fetchAllCourses, Course } from '@/lib/api';
import CourseCard from '@/components/courses/CourseCard';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { Loader2 } from 'lucide-react';

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, isLoading: isAuthLoading } = useAuth(); // Added isAuthLoading
    const { selectedCountry, isLoading: isLocationLoading } = useLocation();

    // Use useCallback for loadCourses to prevent re-creation on every render unless dependencies change
    const loadCourses = useCallback(async () => {
        // Wait for both auth and location context to be ready
        if (isAuthLoading || isLocationLoading) {
            setIsLoadingPage(true); // Keep showing page loader until contexts are ready
            return;
        }

        setIsLoadingPage(true);
        setError(null);

        let locationParam: string | undefined = undefined;

        // Priority:
        // 1. Selected from dropdown (if not GLOBAL)
        // 2. User's profile location (if logged in)
        // 3. Undefined (backend handles default)
        if (selectedCountry && selectedCountry.code !== "GLOBAL") {
            locationParam = selectedCountry.name; // Send country name (e.g., "India")
        } else if (user?.location) {
            locationParam = user.location;
        }
        // If neither, locationParam remains undefined

        console.log("Fetching all courses with locationParam:", locationParam); // DEBUG LOG

        try {
            const fetchedCourses = await fetchAllCourses(locationParam);
            setCourses(fetchedCourses);
        } catch (err) {
            setError('Failed to load courses. Please try again later.');
            console.error("Error fetching all courses:", err); // DEBUG LOG
        } finally {
            setIsLoadingPage(false);
        }
    }, [user, selectedCountry, isAuthLoading, isLocationLoading]); // Correct dependencies

    useEffect(() => {
        loadCourses();
    }, [loadCourses]);


    return (
        <div className="container mx-auto py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Explore Our Courses</h1>
                <p className="mt-3 text-lg text-muted-foreground">
                    Find the perfect course to expand your knowledge and skills.
                    {!(isAuthLoading || isLocationLoading) && selectedCountry && selectedCountry.code !== "GLOBAL" && (
                        <span className="block text-sm"> Prices shown for: {selectedCountry.name}</span>
                    )}
                </p>
            </div>

            {(isLoadingPage || isAuthLoading || isLocationLoading) && (
                <div className="flex justify-center items-center min-h-[300px]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="ml-3 text-lg">Loading courses...</p>
                </div>
            )}
            {!isLoadingPage && !isLocationLoading && !error && courses.length === 0 && (
                <p className="text-center text-muted-foreground">No courses available at the moment.</p>
            )}
            {!isLoadingPage && !isLocationLoading && !error && courses.length > 0 && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <CourseCard key={course.courseId} course={course} />
                    ))}
                </div>
            )}
        </div>
    );
}