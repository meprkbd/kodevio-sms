import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .nonempty("Username is required")
      .min(3, "Username must be at least 3 characters long"),
    email: z
      .string()
      .nonempty("Email is required")
      .email("Invalid email format"),
    password: z
      .string()
      .nonempty("Password is required")
      .min(8, "Password must be at least 8 characters long"),
    confirmPassword: z
      .string()
      .nonempty("Confirm password is required")
      .min(8, "Confirm Password must be at least 8 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().nonempty("Email is required").email("Invalid email format"),
  password: z
    .string()
    .nonempty("Password is required")
    .min(8, "Password must be at least 8 characters long"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().nonempty("Email is required").email("Invalid email format"),
});

export const verifyOtpSchema = z.object({
  email: z.string().nonempty("Email is required").email("Invalid email format"),
  otp: z
    .string()
    .nonempty("OTP is required")
    .length(6, "OTP must be exactly 6 characters long"),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .nonempty("Password is required")
    .min(8, "Password must be at least 8 characters long"),
  confirmPassword: z
    .string()
    .nonempty("Confirm password is required")
    .min(8, "Confirm Password must be at least 8 characters long"),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type VerifyOtpSchema = z.infer<typeof verifyOtpSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
