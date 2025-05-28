// components/packages/PackageModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PackageForm from "./PackageForm";
import { PackageFormValues } from "@/lib/validations/package";
import { Package as PackageInterface, Course } from "@/lib/api";

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: PackageFormValues) => Promise<void>;
  availableCourses: Course[]; // User's courses for selection
  initialData?: PackageInterface | null;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export default function PackageModal({
  isOpen,
  onClose,
  onSubmit,
  availableCourses,
  initialData,
  isLoading,
  mode = "create",
}: PackageModalProps) {
  if (!isOpen) return null;

  const courseIds =
    Array.isArray(initialData?.courses)
      ? initialData.courses.map(c => typeof c === 'string' ? c : (c as any)._id)
      : undefined;

  const formInitialData: Partial<PackageFormValues> | undefined = initialData
    ? {
        title: initialData.title,
        ...(courseIds && courseIds.length > 0 ? { courseIds: courseIds as [string, ...string[]] } : {}),
        image: initialData.image,
      }
    : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg"> {/* Wider for course list */}
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Package" : "Edit Package"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details to create a new package of courses."
              : "Update the details of your package."}
          </DialogDescription>
        </DialogHeader>
        <PackageForm
          onSubmit={onSubmit}
          availableCourses={availableCourses}
          initialData={formInitialData}
          isLoading={isLoading}
          submitButtonText={mode === "create" ? "Create Package" : "Save Changes"}
        />
      </DialogContent>
    </Dialog>
  );
}