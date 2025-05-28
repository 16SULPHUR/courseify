// lib/validations/auth.ts
import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  location: z.string().optional(),
  profileImage: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')), // Allow empty string or valid URL
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
