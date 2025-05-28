// components/packages/PackageForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { uploadImage as uploadImageService } from "@/lib/imageUpload";
import Image from 'next/image';
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
import { Loader2, UploadCloud, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, ChangeEvent } from "react";

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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialData?.image || undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      title: initialData?.title || "",
      courseIds: initialData?.courseIds || [],
      image: initialData?.image || "", // This will hold the URL
    },
  });

  useEffect(() => {
    form.setValue("image", imageUrl || "");
  }, [imageUrl, form]);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    // ... (identical to handleImageUpload in CourseForm)
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const uploadedUrl = await uploadImageService(file);
      setImageUrl(uploadedUrl);
      form.setValue("image", uploadedUrl);
      // toast({ title: "Success", description: "Image uploaded." });
    } catch (error: any) {
      // toast({ title: "Image Upload Failed", description: error.message || "Could not upload image.", variant: "destructive" });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImageUrl(undefined);
    form.setValue("image", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          const finalValues = { ...values, image: imageUrl || "" };
          return onSubmit(finalValues);
        })}
        className="space-y-6"
      >
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
                        control={form.control}
                        name="courseIds"
                        render={({ field }) => ( // 'field' here is for the courseIds array
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
                                    // No new FormField here, just the item for layout
                                    <FormItem key={course._id} className="flex flex-row items-start space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(course._id)}
                                          onCheckedChange={(checked) => {
                                            const currentCourseIds = field.value || [];
                                            return checked
                                              ? field.onChange([...currentCourseIds, course._id])
                                              : field.onChange(
                                                currentCourseIds.filter(
                                                  (value) => value !== course._id
                                                )
                                              );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {course.title} (ID: {course.courseId.substring(0, 8)}...)
                                      </FormLabel>
                                    </FormItem>
                                  ))}
                                </div>
                              </ScrollArea>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
              <FormMessage /> {/* For errors like "at least one course" */}
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Package Image</FormLabel>
          <FormControl>
            <div>
              <Input
                type="file"
                accept="image/*" // More generic accept
                onChange={handleImageUpload}
                className="hidden"
                ref={fileInputRef}
                disabled={isUploadingImage || isLoading}
              />
              <Button
                type="button" variant="outline" onClick={triggerFileInput}
                disabled={isUploadingImage || isLoading || !!imageUrl}
                className="w-full mb-2 flex items-center justify-center"
              >
                {isUploadingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                {isUploadingImage ? "Uploading..." : (imageUrl ? "Change Image" : "Upload Image")}
              </Button>
              {imageUrl && ( /* ... image preview with remove button ... */
                <div className="mt-2 p-2 border rounded-md relative aspect-video max-w-xs mx-auto">
                  <Image src={imageUrl} alt="Uploaded preview" layout="fill" objectFit="contain" />
                  <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 bg-destructive/80 hover:bg-destructive text-destructive-foreground hover:text-destructive-foreground rounded-full h-6 w-6" onClick={removeImage} disabled={isUploadingImage || isLoading} >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage>{form.formState.errors.image?.message}</FormMessage>
        </FormItem>

        <Button type="submit" className="w-full sm:w-auto" disabled={isLoading || availableCourses.length === 0}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitButtonText}
        </Button>
      </form>
    </Form>
  );
}