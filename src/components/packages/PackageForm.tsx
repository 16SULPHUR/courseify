// components/packages/PackageForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PackageFormValues, packageSchema } from "@/lib/validations/package";
import { Course } from "@/lib/api"; // To type the courses prop
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {  Loader2 } from "lucide-react";
import Link from "next/link";

interface PackageFormProps {
  onSubmit: (values: PackageFormValues) => Promise<void>;
  availableCourses: Course[]; // User's own courses to select from
  initialData?: Partial<PackageFormValues>;
  isLoading?: boolean;
  submitButtonText?: string;
}

export default function PackageForm({
  onSubmit,
  availableCourses,
  initialData = {},
  isLoading = false,
  submitButtonText = "Save Package",
}: PackageFormProps) {
  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      title: initialData?.title || "",
      courseIds: initialData?.courseIds || [], // Expecting array of Mongoose _ids
      image: initialData?.image || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Package Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Web Development Bootcamp" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="courseIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Courses</FormLabel>
              <FormDescription>
                Choose the courses to include in this package.
              </FormDescription>
              {availableCourses.length === 0 ? (
                 <p className="text-sm text-muted-foreground p-4 border rounded-md">You don't have any courses to add to a package yet. <Link href="/dashboard/my-courses" className="underline">Create some courses first.</Link></p>
              ) : (
                <ScrollArea className="h-48 rounded-md border p-4">
                  <div className="space-y-2">
                    {availableCourses.map((course) => (
                      <FormField
                        key={course._id} // Use Mongoose _id as key
                        control={form.control}
                        name="courseIds"
                        render={({ field: courseIdField }) => { // Renamed field to avoid conflict
                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={courseIdField.value?.includes(course._id)} // Check against Mongoose _id
                                  onCheckedChange={(checked) => {
                                    const currentCourseIds = courseIdField.value || [];
                                    return checked
                                      ? courseIdField.onChange([...currentCourseIds, course._id])
                                      : courseIdField.onChange(
                                          currentCourseIds.filter(
                                            (value) => value !== course._id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {course.title} (ID: {course.courseId.substring(0,8)}...)
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
              <FormMessage /> {/* For errors like "at least one course" */}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Package Image URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="http://example.com/package-image.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto" disabled={isLoading || availableCourses.length === 0}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitButtonText}
        </Button>
      </form>
    </Form>
  );
}