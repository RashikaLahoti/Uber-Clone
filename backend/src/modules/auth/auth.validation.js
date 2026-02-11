import { z } from "zod";

export const signUpSchema = z.object({
  body: z.object({
    name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must be less than 50 characters long")
    .trim(),
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Invalid email format")
    .trim(),
  phone: z
    .string({
      required_error: "Phone number is required",
    })
    .regex(/^\d{10}$/, "Phone number must be 10 digits")
    .trim(),

  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, "Passwsord must be greater than 6 characters")
    .max(50, "Password must not be greater than 50 characters"),

  // ROLE is not mentioned because it can be sent RIDER by default
  })
});

export const loginSchema = z.object({
  body: z
    .object({
      email: z
        .string()
        .email("Invalid email format")
        .trim()
        .optional()
        .or(z.literal("")),

      phone: z
        .string()
        .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
        .trim()
        .optional()
        .or(z.literal("")),

      password: z
        .string({
          required_error: "Password is required",
        })
        .min(6, "Password is required"),
    })
    .refine((data) => {
      const hasEmail = data.email?.trim().length > 0;
      const hasPhone = data.phone?.trim().length > 0;
      return hasEmail || hasPhone;
    }, {
      message: "Either email or phone is required",
      path: ["email"],
    }),
});
