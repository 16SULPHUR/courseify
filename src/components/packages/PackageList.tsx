// src/components/packages/PackageList.tsx
'use client';

import { useEffect, useState } from 'react';
import { IPackage } from '@/lib/types';
import { fetchPackages, getErrorMessage } from '@/lib/api';
import PackageCard from './PackageCard';
import LocationSelector from '@/components/LocationSelector';
import { Skeleton } from "@/components/ui/skeleton";

export default function PackageList() {
    const [packages, setPackages] = useState<IPackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);

    useEffect(() => {
        const loadPackages = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchPackages(selectedLocation);
                setPackages(data);
            } catch (err) {
                setError(getErrorMessage(err));
                setPackages([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadPackages();
    }, [selectedLocation]);

    if (isLoading) {
        return (
            <div>
                <div className="mb-6 flex justify-end">
                    <Skeleton className="h-10 w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => ( // Fewer skeletons for packages maybe
                        <CardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return <p className="text-red-500 text-center">Error loading packages: {error}</p>;
    }

    return (
        <div>
            <div className="mb-6 flex justify-end">
                <LocationSelector
                    selectedLocation={selectedLocation}
                    onLocationChange={setSelectedLocation}
                />
            </div>
            {packages.length === 0 ? (
                <p className="text-center text-muted-foreground">No packages found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {packages.map((pkg) => ( // Use pkg as variable name
                        <PackageCard key={pkg._id} pkg={pkg} />
                    ))}
                </div>
            )}
        </div>
    );
}

// Reusable Card Skeleton
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