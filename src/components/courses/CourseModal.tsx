// components/courses/CourseModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter, // if needed for close button
} from "@/components/ui/dialog";
import CourseForm from "./CourseForm";
import { CourseFormValues } from "@/lib/validations/course";
import { Course } from "@/lib/api";

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CourseFormValues) => Promise<void>;
  initialData?: Course | null; // Use full Course object for initialData convenience
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export default function CourseModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  mode = "create",
}: CourseModalProps) {
  if (!isOpen) return null;

  // Prepare initial form values from the Course object
  const formInitialData: Partial<CourseFormValues> | undefined = initialData
    ? {
        title: initialData.title,
        description: initialData.description,
        price: initialData.price,
        image: initialData.image,
      }
    : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Course" : "Edit Course"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details to add a new course."
              : "Update the details of your course."}
          </DialogDescription>
        </DialogHeader>
        <CourseForm
          onSubmit={onSubmit}
          initialData={formInitialData}
          isLoading={isLoading}
          submitButtonText={mode === "create" ? "Create Course" : "Save Changes"}
        />
      </DialogContent>
    </Dialog>
  );
}