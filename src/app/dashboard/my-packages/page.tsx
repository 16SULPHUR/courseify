// app/dashboard/my-packages/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import {
    fetchMyPackages,
    createPackage,
    updatePackage,
    deletePackage,
    fetchMyCourses, // To get courses for selection
    Package as PackageInterface,
    Course,
    // CreatePackagePayload, UpdatePackagePayload // Types for form values
} from '@/lib/api';
import PackageCard from '@/components/packages/PackageCard';
import PackageModal from '@/components/packages/PackageModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle, PackageSearch } from 'lucide-react';
// import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, /* ... AlertDialog subcomponents ... */ } from "@/components/ui/alert-dialog"; // Make sure all are imported
import { PackageFormValues } from '@/lib/validations/package';

export default function MyPackagesPage() {
    const [myPackages, setMyPackages] = useState<PackageInterface[]>([]);
    const [myAvailableCourses, setMyAvailableCourses] = useState<Course[]>([]);
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true); // For loading available courses
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingPackage, setEditingPackage] = useState<PackageInterface | null>(null);
    const [packageToDelete, setPackageToDelete] = useState<{ id: string; title: string } | null>(null);

    const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
    const { selectedCountry, isLoading: isLocationLoading } = useLocation();
    const router = useRouter();
    //   const { toast } = useToast();

    // Load user's own courses for the package form
    const loadAvailableCourses = useCallback(async () => {
        if (!isAuthenticated) return;
        setIsLoadingCourses(true);
        try {
            const courses = await fetchMyCourses(); // No location needed for this list
            setMyAvailableCourses(courses);
        } catch (error) {
            console.error("Failed to load available courses for packages", error);
            //   toast({ title: "Error", description: "Could not fetch your courses for package creation.", variant: "destructive" });
        } finally {
            setIsLoadingCourses(false);
        }
    }, [isAuthenticated]); // Removed fetchMyCourses from dep array if it's stable

    // Load user's packages
    const loadMyPackages = useCallback(async () => {
        if (!isAuthenticated || isAuthLoading || isLocationLoading) {
            setIsLoadingPage(true); return;
        }
        setIsLoadingPage(true);
        try {
            let locationParam: string | undefined = undefined;
            if (selectedCountry && selectedCountry.code !== "GLOBAL") {
                locationParam = selectedCountry.name;
            } else if (user?.location) {
                locationParam = user.location;
            }
            const fetchedPackages = await fetchMyPackages(locationParam);
            setMyPackages(fetchedPackages);
        } catch (error) {
            console.error("Failed to load my packages", error);
            //   toast({ title: "Error", description: "Could not fetch your packages.", variant: "destructive" });
        } finally {
            setIsLoadingPage(false);
        }
    }, [isAuthenticated, isAuthLoading, isLocationLoading, selectedCountry, user?.location]);

    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            router.push('/login?redirect=/dashboard/my-packages');
        } else if (isAuthenticated) {
            loadMyPackages();
            loadAvailableCourses(); // Load courses when authenticated
        }
    }, [isAuthenticated, isAuthLoading, router, loadMyPackages, loadAvailableCourses]);

    const handleOpenCreateModal = () => {
        if (isLoadingCourses) {
            // toast({ title: "Please wait", description: "Loading your courses for selection..."});
            return;
        }
        setEditingPackage(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (pkg: PackageInterface) => {
        if (isLoadingCourses) {
            // toast({ title: "Please wait", description: "Loading your courses for selection..."});
            return;
        }
        setEditingPackage(pkg);
        setIsModalOpen(true);
    };

    // ... (handleCloseModal, handleFormSubmit, handleDeleteConfirmation, handleConfirmDelete - similar to MyCoursesPage, adapt for packages)
    const handleCloseModal = () => { setIsModalOpen(false); setEditingPackage(null); };

    const handleFormSubmit = async (values: PackageFormValues) => {
        setIsSubmitting(true);
        const payload = { ...values, image: values.image || undefined };
        try {
            if (editingPackage) {
                await updatePackage(editingPackage.packageId, payload); // Only title and image can be updated this way
                // toast({ title: "Success", description: "Package updated."});
            } else {
                await createPackage(payload);
                // toast({ title: "Success", description: "Package created."});
            }
            handleCloseModal();
            loadMyPackages();
        } catch (error: any) {
            // toast({ title: "Error", description: error.response?.data?.message || "Could not save package.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleDeleteConfirmation = (packageId: string, packageTitle: string) => { /* ... */ setPackageToDelete({ id: packageId, title: packageTitle }) };
    const handleConfirmDelete = async () => { /* ... similar to courses, call deletePackage ... */
        if (!packageToDelete) return; setIsSubmitting(true);
        try { await deletePackage(packageToDelete.id); 
            // toast({ title: "Success", description: "Package deleted." }); loadMyPackages(); 
        }
        catch (e: any) {
            //  toast({ title: "Error", description: e.response?.data?.message || "Failed to delete.", variant: "destructive" }); 
            }
        finally { setIsSubmitting(false); setPackageToDelete(null); }
    };


    if (isAuthLoading || (isAuthenticated && (isLocationLoading || isLoadingPage) && myPackages.length === 0)) {
        return (<div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"> <Loader2 className="h-16 w-16 animate-spin text-primary" /> </div>);
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">My Packages</h1>
                    {/* ... location display message ... */}
                </div>
                <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto" disabled={isLoadingCourses}>
                    {isLoadingCourses ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PlusCircle className="mr-2 h-5 w-5" />}
                    Create New Package
                </Button>
            </div>

            {/* ... Loading/Empty/Grid display for packages ... */}
            {isLoadingPage && myPackages.length > 0 && (<div className="text-center my-4"><Loader2 className="h-6 w-6 animate-spin inline-block mr-2" /> Refreshing package prices...</div>)}
            {!isLoadingPage && myPackages.length === 0 && ( /* ... "No packages yet" message ... */
                <div className="text-center py-10 bg-card border rounded-lg">
                    <PackageSearch className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-xl text-muted-foreground mb-4">You haven't created any packages yet.</p>
                    <Button onClick={handleOpenCreateModal} size="lg" disabled={isLoadingCourses}>
                        {isLoadingCourses ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PlusCircle className="mr-2 h-5 w-5" />} Create Your First Package
                    </Button>
                </div>
            )}

            {myPackages.length > 0 && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {myPackages.map((pkg) => (
                        <PackageCard key={pkg.packageId} pkg={pkg} isOwner={true} onEdit={handleOpenEditModal} onDelete={handleDeleteConfirmation} />
                    ))}
                </div>
            )}

            <PackageModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleFormSubmit}
                availableCourses={myAvailableCourses}
                initialData={editingPackage}
                isLoading={isSubmitting || isLoadingCourses} // Modal submit button disabled if courses still loading
                mode={editingPackage ? "edit" : "create"}
            />
            {/* ... AlertDialog for delete confirmation ... */}
        </div>
    );
}