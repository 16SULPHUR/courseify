"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CourseFormValues, courseSchema } from "@/lib/validations/course";
import { Loader2, UploadCloud, XCircle } from "lucide-react";
import { ChangeEvent, useState, useRef, useEffect } from "react";
import { uploadImage as uploadImageService } from "@/lib/imageUpload"; // Import the service
import Image from "next/image";
// import { useToast } from "@/components/ui/use-toast";


interface CourseFormProps {
  onSubmit: (values: CourseFormValues) => Promise<void>;
  initialData?: Partial<CourseFormValues>;
  isLoading?: boolean; // Overall form submission loading state
  submitButtonText?: string;
}

export default function CourseForm({
  onSubmit,
  initialData = {},
  isLoading = false,
  submitButtonText = "Save Course",
}: CourseFormProps) {
  // const { toast } = useToast();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialData?.image || undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      image: initialData?.image || "", // This will hold the URL
    },
  });

  // Update form's image field when imageUrl state changes
  useEffect(() => {
    form.setValue("image", imageUrl || "");
  }, [imageUrl, form]);


  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const uploadedUrl = await uploadImageService(file);
      setImageUrl(uploadedUrl); // Update local state for preview
      form.setValue("image", uploadedUrl); // Explicitly set form value
      // toast({ title: "Success", description: "Image uploaded." });
    } catch (error: any) {
      console.error("Image upload failed in form:", error);
      // toast({
      //   title: "Image Upload Failed",
      //   description: error.message || "Could not upload the image.",
      //   variant: "destructive",
      // });
      // Optionally clear the file input if upload fails
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
          // Ensure the latest imageUrl is part of the values submitted
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
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Advanced Web Development" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your course..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (USD)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="e.g., 49.99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
{/* Image Upload Field */}
        <FormItem>
          <FormLabel>Course Image</FormLabel>
          <FormControl>
            <div>
              <Input
                type="file"
                accept="image/png, image/jpeg, image/gif, image/webp"
                onChange={handleImageUpload}
                className="hidden" // Hide default file input
                ref={fileInputRef}
                disabled={isUploadingImage || isLoading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={triggerFileInput}
                disabled={isUploadingImage || isLoading || !!imageUrl} // Disable if image already uploaded/present
                className="w-full mb-2 flex items-center justify-center"
              >
                {isUploadingImage ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="mr-2 h-4 w-4" />
                )}
                {isUploadingImage ? "Uploading..." : (imageUrl ? "Change Image" : "Upload Image")}
              </Button>

              {imageUrl && (
                <div className="mt-2 p-2 border rounded-md relative aspect-video max-w-xs mx-auto">
                  <Image src={imageUrl} alt="Uploaded preview" layout="fill" objectFit="contain" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 bg-destructive/80 hover:bg-destructive text-destructive-foreground hover:text-destructive-foreground rounded-full h-6 w-6"
                    onClick={removeImage}
                    disabled={isUploadingImage || isLoading}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage>{form.formState.errors.image?.message}</FormMessage>
        </FormItem>
        {/* Hidden input to store the URL, form.setValue handles this now */}
        {/* <input type="hidden" {...form.register("image")} /> */}

        <Button type="submit" className="w-full sm:w-auto" disabled={isUploadingImage || isLoading}>
          {(isUploadingImage || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitButtonText}
        </Button>
      </form>
    </Form>
  );
}