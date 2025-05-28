// lib/validations/course.ts
import * as z from "zod";

export const courseSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().optional(),
  price: z.coerce // Use coerce for number inputs from forms
    .number({ invalid_type_error: "Price must be a number." })
    .positive({ message: "Price must be a positive number." }),
  image: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  
});

export type CourseFormValues = z.infer<typeof courseSchema>;