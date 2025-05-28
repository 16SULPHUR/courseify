// app/packages/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { fetchAllPackages, Package as PackageInterface } from '@/lib/api'; // Renamed Package import
import PackageCard from '@/components/packages/PackageCard';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { Loader2 } from 'lucide-react';

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageInterface[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: isAuthLoading } = useAuth();
  const { selectedCountry, isLoading: isLocationLoading } = useLocation();

  const loadPackages = useCallback(async () => {
    if (isAuthLoading || isLocationLoading) {
      setIsLoadingPage(true);
      return;
    }
    setIsLoadingPage(true);
    setError(null);
    let locationParam: string | undefined = undefined;
    if (selectedCountry && selectedCountry.code !== "GLOBAL") {
      locationParam = selectedCountry.name;
    } else if (user?.location) {
      locationParam = user.location;
    }
    try {
      const fetchedPackages = await fetchAllPackages(locationParam);
      setPackages(fetchedPackages);
    } catch (err) {
      setError('Failed to load packages. Please try again later.');
      console.error(err);
    } finally {
      setIsLoadingPage(false);
    }
  }, [user, selectedCountry, isAuthLoading, isLocationLoading]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Explore Course Packages</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Discover curated collections of courses to accelerate your learning.
          {!(isAuthLoading || isLocationLoading) && selectedCountry && selectedCountry.code !== "GLOBAL" && (
            <span className="block text-sm"> Prices shown for: {selectedCountry.name}</span>
          )}
        </p>
      </div>

      {(isLoadingPage || isAuthLoading || isLocationLoading) && (
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-3 text-lg">Loading packages...</p>
        </div>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!isLoadingPage && !isAuthLoading && !isLocationLoading && !error && packages.length === 0 && (
        <p className="text-center text-muted-foreground">No packages available at the moment.</p>
      )}
      {!isLoadingPage && !isAuthLoading && !isLocationLoading && !error && packages.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <PackageCard key={pkg.packageId} pkg={pkg} />
          ))}
        </div>
      )}
    </div>
  );
}