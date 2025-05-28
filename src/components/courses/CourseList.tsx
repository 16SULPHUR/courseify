// src/components/courses/CourseList.tsx
'use client'; // For location selector interaction

import { useEffect, useState } from 'react';
import { ICourse } from '@/lib/types';
import { fetchCourses, getErrorMessage } from '@/lib/api';
import CourseCard from './CourseCard';
import LocationSelector from '@/components/LocationSelector'; // We'll create this
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

export default function CourseList() {
    const [courses, setCourses] = useState<ICourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);

    useEffect(() => {
        const loadCourses = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchCourses(selectedLocation);
                setCourses(data);
            } catch (err) {
                setError(getErrorMessage(err));
                setCourses([]); // Clear courses on error
            } finally {
                setIsLoading(false);
            }
        };
        loadCourses();
    }, [selectedLocation]);

    if (isLoading) {
        return (
            <div>
                <div className="mb-6 flex justify-end">
                    <Skeleton className="h-10 w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return <p className="text-red-500 text-center">Error loading courses: {error}</p>;
    }

    return (
        <div>
            <div className="mb-6 flex justify-end">
                <LocationSelector
                    selectedLocation={selectedLocation}
                    onLocationChange={setSelectedLocation}
                />
            </div>
            {courses.length === 0 ? (
                <p className="text-center text-muted-foreground">No courses found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courses.map((course) => (
                        <CourseCard key={course._id} course={course} />
                    ))}
                </div>
            )}
        </div>
    );
}

const CardSkeleton = () => (
    <div className="flex flex-col space-y-3 p-4 border rounded-lg">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex justify-between pt-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
        </div>
    </div>
);