// components/packages/PackageCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package as PackageIcon, Eye, Edit3, Trash2, UserCircle, BookOpen } from 'lucide-react'; // Renamed Package to avoid conflict
import { PackageCourseMinimal, Package as PackageInterface } from '@/lib/api'; // Import the Package interface

interface PackageCardProps {
  pkg: PackageInterface; // Renamed prop to avoid conflict with imported Package icon
  onEdit?: (pkg: PackageInterface) => void;
  onDelete?: (packageId: string, packageTitle: string) => void;
  isOwner?: boolean;
}

const formatPrice = (price?: number, currency?: string) => {
  if (typeof price === 'undefined' || !currency) return "N/A";
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(price);
};

export default function PackageCard({ pkg, onEdit, onDelete, isOwner = false }: PackageCardProps) {
  const displayPrice = pkg.localizedPriceInfo?.localizedPrice ?? pkg.baseTotalPriceUSD;
  const displayCurrency = pkg.localizedPriceInfo?.localizedCurrency ?? 'USD';
  const creatorName = typeof pkg.creatorId === 'object' ? pkg.creatorId.name : 'Unknown Creator';
  const courseCount = Array.isArray(pkg.courses) ? pkg.courses.length : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="p-0 relative aspect-video">
        {pkg.image ? (
          <Image
            src={pkg.image}
            alt={pkg.title}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
        ) : (
          <div className="bg-secondary flex items-center justify-center h-full rounded-t-lg">
            <PackageIcon className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-6 flex-grow">
        <CardTitle className="mb-2 text-xl">{pkg.title}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
            <BookOpen className="w-4 h-4 mr-1.5"/> {courseCount} {courseCount === 1 ? "Course" : "Courses"}
        </div>
        <div className="text-sm text-muted-foreground mb-3 flex items-center">
          <UserCircle className="w-4 h-4 mr-1.5" /> By {creatorName}
        </div>
        {/* You could list a few course titles here if desired */}
        <CardDescription className="line-clamp-2 text-xs">
            {Array.isArray(pkg.courses) && pkg.courses.length > 0 ?
             (pkg.courses as PackageCourseMinimal[]).slice(0, 3).map(c => c.title).join(', ') + (pkg.courses.length > 3 ? '...' : '')
             : "No specific course details available in summary."}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:items-center">
        <Badge variant="secondary" className="text-lg font-semibold py-1 px-3">
          Total: {formatPrice(displayPrice, displayCurrency)}
          {pkg.localizedPriceInfo?.appliedMultiplier && pkg.localizedPriceInfo.appliedMultiplier !== 1 && (
            <span className="ml-1 text-xs opacity-75">(x{pkg.localizedPriceInfo.appliedMultiplier})</span>
          )}
        </Badge>
        <div className="flex gap-2">
          <Link href={`/packages/${pkg.packageId}`}>
            <Button variant="outline" size="sm"><Eye className="mr-1 h-4 w-4" /> View</Button>
          </Link>
          {isOwner && onEdit && (
            <Button variant="default" size="sm" onClick={() => onEdit(pkg)}>
              <Edit3 className="mr-1 h-4 w-4" /> Edit
            </Button>
          )}
          {isOwner && onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(pkg.packageId, pkg.title)}>
              <Trash2 className="mr-1 h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}