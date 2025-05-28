// components/courses/CourseCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Course } from '@/lib/api'; // Import the Course interface
import { Eye, Edit3, Trash2, UserCircle } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onEdit?: (course: Course) => void;
  onDelete?: (courseId: string, courseTitle: string) => void;
  isOwner?: boolean; // To show edit/delete buttons
}

const formatPrice = (price?: number, currency?: string) => {
  if (typeof price === 'undefined' || !currency) return "N/A";
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(price);
};

export default function CourseCard({ course, onEdit, onDelete, isOwner = false }: CourseCardProps) {
  const displayPrice = course.localizedPriceInfo?.localizedPrice ?? course.price;
  const displayCurrency = course.localizedPriceInfo?.localizedCurrency ?? 'USD';
  const creatorName = typeof course.creatorId === 'object' ? course.creatorId.name : 'Unknown Creator';


  return (
    <Card className="flex flex-col">
      <CardHeader className="p-0 relative aspect-video">
        {course.image ? (
          <Image
            src={course.image}
            alt={course.title}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
        ) : (
          <div className="bg-secondary flex items-center justify-center h-full rounded-t-lg">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-6 flex-grow">
        <CardTitle className="mb-2 text-xl">{course.title}</CardTitle>
        <CardDescription className="line-clamp-3 mb-3 text-sm">
          {course.description || "No description available."}
        </CardDescription>
         <div className="text-sm text-muted-foreground mb-3 flex items-center">
          <UserCircle className="w-4 h-4 mr-1" /> By {creatorName}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:items-center">
        <Badge variant="secondary" className="text-lg font-semibold py-1 px-3">
          {formatPrice(displayPrice, displayCurrency)}
          {course.localizedPriceInfo?.appliedMultiplier && course.localizedPriceInfo.appliedMultiplier !== 1 && (
            <span className="ml-1 text-xs opacity-75">(x{course.localizedPriceInfo.appliedMultiplier})</span>
          )}
        </Badge>
        <div className="flex gap-2">
          <Link href={`/courses/${course.courseId}`}>
            <Button variant="outline" size="sm"><Eye className="mr-1 h-4 w-4" /> View</Button>
          </Link>
          {isOwner && onEdit && (
            <Button variant="default" size="sm" onClick={() => onEdit(course)}>
              <Edit3 className="mr-1 h-4 w-4" /> Edit
            </Button>
          )}
          {isOwner && onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(course.courseId, course.title)}>
              <Trash2 className="mr-1 h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}