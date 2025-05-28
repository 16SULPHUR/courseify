// lib/validations/package.ts
import * as z from "zod";

export const packageSchema = z.object({
  title: z.string().min(3, { message: "Package title must be at least 3 characters." }),
  courseIds: z.array(z.string().min(1, "Course ID cannot be empty")) // Expecting Mongoose ObjectIds
    .nonempty({ message: "Please select at least one course for the package." }),
  image: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

export type PackageFormValues = z.infer<typeof packageSchema>;