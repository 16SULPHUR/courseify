// app/dashboard/my-courses/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import {
  fetchMyCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  Course,
  // CreateCoursePayload, UpdateCoursePayload // These are used by CourseFormValues
} from '@/lib/api';
import CourseCard from '@/components/courses/CourseCard';
import CourseModal from '@/components/courses/CourseModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext'; // Import useLocation
import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle } from 'lucide-react';
// import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CourseFormValues } from '@/lib/validations/course';

export default function MyCoursesPage() {
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true); // For page-level loading
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submissions
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string } | null>(null);

  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const { selectedCountry, isLoading: isLocationLoading } = useLocation(); // Get location context
  const router = useRouter();
  // const { toast } = useToast();

  const loadMyCourses = useCallback(async () => {
    if (!isAuthenticated || isAuthLoading || isLocationLoading) {
      // Don't fetch if not authenticated or contexts are still loading
      // If auth is loading, the effect below will handle redirection or re-fetch
      setIsLoadingPage(true); // Ensure loader stays if critical contexts aren't ready
      return;
    }
    setIsLoadingPage(true);
    try {
      let locationParam: string | undefined = undefined;
      // Priority: Dropdown > User Profile (though for "My Courses", user's own location might be less relevant for pricing view)
      // Let's prioritize dropdown for viewing purposes on this page.
      if (selectedCountry && selectedCountry.code !== "GLOBAL") {
        locationParam = selectedCountry.name;
      } else if (user?.location) { // Fallback to user's own location if dropdown is GLOBAL
        locationParam = user.location;
      }

      console.log("[MyCoursesPage] Fetching my courses with locationParam:", locationParam); // DEBUG LOG
      const fetchedCourses = await fetchMyCourses(locationParam);
      setMyCourses(fetchedCourses);
    } catch (error) {
      console.error("Failed to load my courses", error);
      // toast({ title: "Error", description: "Could not fetch your courses.", variant: "destructive" });
    } finally {
      setIsLoadingPage(false);
    }
  }, [isAuthenticated, isAuthLoading, isLocationLoading, selectedCountry, user?.location]); // Added user.location

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard/my-courses');
    } else if (isAuthenticated) {
      // This will now run when isAuthenticated is true AND when selectedCountry changes
      loadMyCourses();
    }
  }, [isAuthenticated, isAuthLoading, router, loadMyCourses]); // loadMyCourses is memoized

  // ... (handleOpenCreateModal, handleOpenEditModal, handleCloseModal, handleFormSubmit, handleDeleteConfirmation, handleConfirmDelete - no changes needed here)
  const handleOpenCreateModal = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course: Course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleFormSubmit = async (values: CourseFormValues) => {
    setIsSubmitting(true);
    const payload = { // No changes here, location doesn't affect create/update payload
        ...values,
        image: values.image || undefined,
        description: values.description || undefined,
    };

    try {
      if (editingCourse) {
        await updateCourse(editingCourse.courseId, payload);
        // toast({ title: "Success", description: "Course updated successfully." });
      } else {
        await createCourse(payload);
        // toast({ title: "Success", description: "Course created successfully." });
      }
      handleCloseModal();
      loadMyCourses();
    } catch (error: any) {
      console.error("Failed to save course", error);
      // toast({
      //   title: "Error",
      //   description: error.response?.data?.message || "Could not save the course.",
      //   variant: "destructive",
      // });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirmation = (courseId: string, courseTitle: string) => {
    setCourseToDelete({ id: courseId, title: courseTitle });
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteCourse(courseToDelete.id);
      // toast({ title: "Success", description: `Course "${courseToDelete.title}" deleted.`});
      setMyCourses(prev => prev.filter(c => c.courseId !== courseToDelete.id));
    } catch (error: any) {
      console.error("Failed to delete course", error);
      // toast({
      //   title: "Error",
      //   description: error.response?.data?.message || "Could not delete the course.",
      //   variant: "destructive",
      // });
    } finally {
      setIsSubmitting(false);
      setCourseToDelete(null);
    }
  };

  // Initial loading state for the whole page
  if (isAuthLoading || (isAuthenticated && isLocationLoading && isLoadingPage && myCourses.length === 0)) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
            <h1 className="text-3xl font-bold">My Courses</h1>
            {!(isAuthLoading || isLocationLoading) && selectedCountry && selectedCountry.code !== "GLOBAL" && (
                <p className="text-sm text-muted-foreground">
                    Viewing prices as they would appear in: {selectedCountry.name}
                </p>
            )}
        </div>
        <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Course
        </Button>
      </div>

      {/* More nuanced loading state for when courses are being refetched due to location change */}
      {isLoadingPage && myCourses.length > 0 && (
        <div className="text-center my-4 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" /> Refreshing course prices...
        </div>
      )}

      {!isLoadingPage && myCourses.length === 0 && (
        <div className="text-center py-10 bg-card border rounded-lg">
          <p className="text-xl text-muted-foreground mb-4">You haven't created any courses yet.</p>
          <Button onClick={handleOpenCreateModal} size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Course
          </Button>
        </div>
      )}

      {myCourses.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {myCourses.map((course) => (
            <CourseCard
              key={course.courseId}
              course={course} // This will now contain localizedPriceInfo from the backend
              isOwner={true}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteConfirmation}
            />
          ))}
        </div>
      )}

      <CourseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialData={editingCourse}
        isLoading={isSubmitting}
        mode={editingCourse ? "edit" : "create"}
      />

      {/* ... (AlertDialog for delete confirmation - no changes needed) ... */}
       {courseToDelete && (
        <AlertDialog open={!!courseToDelete} onOpenChange={() => setCourseToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the course
                <span className="font-semibold"> "{courseToDelete.title}"</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCourseToDelete(null)} disabled={isSubmitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}