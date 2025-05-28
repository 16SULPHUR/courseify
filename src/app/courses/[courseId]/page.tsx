// app/courses/[courseId]/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { fetchCourseById, Course } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const formatPrice = (price?: number, currency?: string) => {
  if (typeof price === 'undefined' || !currency) return "N/A";
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(price);
};

export default function SingleCoursePage() {
  const params = useParams();
  const courseId = params.courseId as string; // Ensure courseId is available

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: isAuthLoading } = useAuth();
  const { selectedCountry, isLoading: isLocationLoading } = useLocation();

  const loadCourse = useCallback(async () => {
    // Ensure courseId is present and contexts are ready
    if (!courseId || isAuthLoading || isLocationLoading) {
      setIsLoadingPage(true); // Keep showing page loader
      return;
    }

    setIsLoadingPage(true);
    setError(null);

    let locationParam: string | undefined = undefined;

    // Priority for locationParam:
    // 1. Selected from dropdown (if not GLOBAL)
    // 2. User's profile location (if logged in and has one)
    // 3. Undefined (backend handles default)
    if (selectedCountry && selectedCountry.code !== "GLOBAL") {
      locationParam = selectedCountry.name; // Or selectedCountry.code if backend expects code
    } else if (user?.location) {
      locationParam = user.location;
    }

    console.log(`[SingleCoursePage] Fetching course ${courseId} with locationParam:`, locationParam); // DEBUG LOG

    try {
      const fetchedCourse = await fetchCourseById(courseId, locationParam);
      setCourse(fetchedCourse);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load course details.');
      console.error(`[SingleCoursePage] Error fetching course ${courseId}:`, err); // DEBUG LOG
    } finally {
      setIsLoadingPage(false);
    }
  }, [courseId, user, selectedCountry, isAuthLoading, isLocationLoading]); // Dependencies for useCallback

  useEffect(() => {
    loadCourse();
  }, [loadCourse]); // useEffect depends on the memoized loadCourse function

  // Conditional rendering based on loading states and errors
  if (isAuthLoading || isLocationLoading || (isLoadingPage && !course && !error) ) {
    // Show loader if any critical data is still loading for the first time
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 py-10">{error}</p>;
  }

  if (!course) {
    // This case might be hit briefly if loadingPage is false but course is still null before error is set
    // Or if the course truly isn't found and no error was thrown by API (unlikely with AppError)
    return <p className="text-center text-muted-foreground py-10">Course not found or still loading.</p>;
  }

  // --- Render course details ---
  const displayPrice = course.localizedPriceInfo?.localizedPrice ?? course.price;
  const displayCurrency = course.localizedPriceInfo?.localizedCurrency ?? 'USD';
  const creatorName = typeof course.creatorId === 'object' ? course.creatorId.name : 'Unknown Creator';

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Message about selected location for pricing */}
      {!(isAuthLoading || isLocationLoading) && selectedCountry && selectedCountry.code !== "GLOBAL" && !course.localizedPriceInfo?.isBlacklisted && (
         <div className="mb-6 p-3 border rounded-md bg-secondary text-sm text-center">
            Displaying prices for: <span className="font-semibold">{selectedCountry.name}</span>. You can change this in the header.
        </div>
      )}

      {course.localizedPriceInfo?.isBlacklisted && (
        <div className="mb-6 p-4 border border-destructive rounded-md bg-destructive/10 text-destructive">
          <p className="font-semibold">Access Restricted</p>
          <p className="text-sm">{course.localizedPriceInfo.message}</p>
        </div>
      )}

      <Card>
        {course.image && (
          <div className="relative aspect-video w-full">
            <Image
              src={course.image}
              alt={course.title}
              fill // Use fill instead of layout="fill"
              style={{objectFit:"cover"}} // Use style for objectFit
              className="rounded-t-lg"
              priority // Consider adding priority for LCP images
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{course.title}</CardTitle>
          <div className="flex items-center text-muted-foreground mt-2">
            <UserCircle className="w-5 h-5 mr-2"/>
            <span>By {creatorName}</span>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-lg text-foreground mb-6 whitespace-pre-wrap">
            {course.description || "No detailed description available."}
          </CardDescription>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 pt-6 border-t">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-2xl font-semibold">
                Price:{" "}
                <Badge variant="default" className="text-2xl py-2 px-4">
                  {formatPrice(displayPrice, displayCurrency)}
                </Badge>
              </h3>
              {course.localizedPriceInfo?.appliedMultiplier && course.localizedPriceInfo.appliedMultiplier !== 1 && (
                <span className="ml-1 text-xs text-muted-foreground">(Multiplier: x{course.localizedPriceInfo.appliedMultiplier})</span>
              )}
            </div>
            {!course.localizedPriceInfo?.isBlacklisted && (
                <Button size="lg">Enroll Now</Button>
            )}
          </div>
          {course.localizedPriceInfo?.conversionRate && (
            <p className="text-xs text-muted-foreground mt-2">
                Original Price: {formatPrice(course.localizedPriceInfo.originalPriceUSD, course.localizedPriceInfo.originalCurrency)}.
                Conversion rate (USD to {displayCurrency}): {course.localizedPriceInfo.conversionRate.toFixed(4)}
            </p>
           )}
        </CardContent>
      </Card>
    </div>
  );
}