// app/packages/[packageId]/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { fetchPackageById, Package as PackageInterface, PackageCourseMinimal } from '@/lib/api'; // Renamed Package import
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, UserCircle, BookOpen, ListChecks } from 'lucide-react';

const formatPrice = (price?: number, currency?: string) => {
  if (typeof price === 'undefined' || !currency) return "N/A";
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(price);
};

export default function SinglePackagePage() {
  const params = useParams();
  const packageId = params.packageId as string;

  const [pkg, setPkg] = useState<PackageInterface | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: isAuthLoading } = useAuth();
  const { selectedCountry, isLoading: isLocationLoading } = useLocation();

  const loadPackage = useCallback(async () => {
    if (!packageId || isAuthLoading || isLocationLoading) {
      setIsLoadingPage(true); return;
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
      const fetchedPackage = await fetchPackageById(packageId, locationParam);
      setPkg(fetchedPackage);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load package details.');
    } finally {
      setIsLoadingPage(false);
    }
  }, [packageId, user, selectedCountry, isAuthLoading, isLocationLoading]);

  useEffect(() => {
    loadPackage();
  }, [loadPackage]);


  if (isAuthLoading || isLocationLoading || (isLoadingPage && !pkg && !error) ) {
    return ( <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"> <Loader2 className="h-16 w-16 animate-spin text-primary" /> </div> );
  }
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;
  if (!pkg) return <p className="text-center text-muted-foreground py-10">Package not found.</p>;

  const displayPrice = pkg.localizedPriceInfo?.localizedPrice ?? pkg.baseTotalPriceUSD;
  const displayCurrency = pkg.localizedPriceInfo?.localizedCurrency ?? 'USD';
  const creatorName = typeof pkg.creatorId === 'object' ? pkg.creatorId.name : 'Unknown Creator';
  const coursesInPackage = Array.isArray(pkg.courses) ? pkg.courses as PackageCourseMinimal[] : [];


  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {!(isAuthLoading || isLocationLoading) && selectedCountry && selectedCountry.code !== "GLOBAL" && !pkg.localizedPriceInfo?.isBlacklisted && (
         <div className="mb-6 p-3 border rounded-md bg-secondary text-sm text-center">
            Displaying prices for: <span className="font-semibold">{selectedCountry.name}</span>.
        </div>
      )}
      {pkg.localizedPriceInfo?.isBlacklisted && (
        <div className="mb-6 p-3 border rounded-md bg-destructive/10 text-destructive text-center">
          This package is not available for purchase in your selected region.
        </div>
      )}

      <Card>
        {pkg.image && ( /* ... package image ... */
            <div className="relative aspect-video w-full">
                <Image src={pkg.image} alt={pkg.title} fill style={{objectFit:"cover"}} className="rounded-t-lg" priority />
            </div>
        )}
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{pkg.title}</CardTitle>
          <div className="flex items-center text-muted-foreground mt-2">
            <UserCircle className="w-5 h-5 mr-2"/> By {creatorName}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3 flex items-center"><ListChecks className="w-5 h-5 mr-2 text-primary" /> Courses in this package:</h3>
            {coursesInPackage.length > 0 ? (
              <ul className="space-y-2 list-inside">
                {coursesInPackage.map(course => (
                  <li key={course._id} className="p-3 border rounded-md hover:bg-secondary transition-colors">
                    <Link href={`/courses/${course.courseId}`} className="font-medium hover:underline">
                      {course.title}
                    </Link>
                    <span className="text-sm text-muted-foreground ml-2">({formatPrice(course.price, 'USD')})</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted-foreground">No courses listed in this package.</p>}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 pt-6 border-t">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-2xl font-semibold"> Total Price:{" "}
                <Badge variant="default" className="text-2xl py-2 px-4">
                  {formatPrice(displayPrice, displayCurrency)}
                </Badge>
              </h3>
              {/* ... multiplier and original price info ... */}
            </div>
            {!pkg.localizedPriceInfo?.isBlacklisted && ( <Button size="lg">Purchase Package</Button> )}
          </div>
           {/* ... conversion rate info ... */}
        </CardContent>
      </Card>
    </div>
  );
}