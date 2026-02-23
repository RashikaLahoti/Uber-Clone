import { z } from "zod";

// ============================================
// REUSABLE SCHEMAS (Internal)
// ============================================

const personalInfoSchema = z.object({
  languagePreference: z.enum(
    [
      "HINDI",
      "ENGLISH",
      "MARATHI",
      "TAMIL",
      "TELUGU",
      "KANNADA",
      "BENGALI",
      "GUJARATI",
    ],
    {
      required_error: "Language preference is required",
      invalid_type_error: "Invalid language preference",
    },
  ),
  city: z.enum(
    [
      "MUMBAI",
      "DELHI",
      "BANGALORE",
      "HYDERABAD",
      "CHENNAI",
      "KOLKATA",
      "PUNE",
      "AHMEDABAD",
      "BHOPAL",
      "INDORE",
    ],
    {
      required_error: "City is required",
      invalid_type_error: "Invalid city",
    },
  ),
  aadharNumber: z
    .string({ required_error: "Aadhar number is required" })
    .regex(/^[0-9]{12}$/, "Aadhar number must be exactly 12 digits")
    .trim(),
  profilePicture: z
    .string()
    .url("Profile picture must be a valid URL")
    .optional()
    .nullable(),
});

const documentsSchema = z.object({
  licenseNumber: z
    .string({ required_error: "License number is required" })
    .min(8, "License number must be at least 8 characters")
    .max(20, "License number cannot exceed 20 characters")
    .trim()
    .toUpperCase(),
  licenseExpiry: z
    .string()
    .optional()
    .nullable()
    .refine((date) => {
      if (!date) return true;
      return new Date(date) > new Date();
    }, "License expiry date must be in the future"),
  rcNumber: z
    .string({ required_error: "RC number is required" })
    .min(8, "RC number must be at least 8 characters")
    .max(15, "RC number cannot exceed 15 characters")
    .trim()
    .toUpperCase(),
  rcExpiry: z
    .string()
    .optional()
    .nullable()
    .refine((date) => {
      if (!date) return true;
      return new Date(date) > new Date();
    }, "RC expiry date must be in the future"),
});

const vehicleInfoSchema = z.object({
  vehicleType: z.enum(
    ["CAR", "BIKE", "AUTO", "E_RICKSHAW", "ELECTRIC_SCOOTER"],
    {
      required_error: "Vehicle type is required",
      invalid_type_error: "Invalid vehicle type",
    },
  ),
  vehicleNumber: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val?.toUpperCase())
    .refine((val) => {
      if (!val) return true;
      return /^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}$/.test(val);
    }, "Invalid vehicle number format (e.g., MH01AB1234)"),
  vehicleModel: z
    .string()
    .max(50, "Vehicle model cannot exceed 50 characters")
    .optional()
    .nullable(),
  vehicleColor: z
    .string()
    .max(20, "Vehicle color cannot exceed 20 characters")
    .optional()
    .nullable(),
});

const locationSchema = z
  .object({
    type: z.literal("Point").default("Point"),
    coordinates: z
      .array(z.number())
      .length(2, "Coordinates must be [longitude, latitude]"),
  })
  .optional();

// ============================================
// CREATE DRIVER PROFILE VALIDATION
// ============================================
export const createDriverProfileSchema = z.object({
  body: z.object({
    personalInfo: personalInfoSchema,
    documents: documentsSchema,
    vehicleInfo: vehicleInfoSchema,
    location: locationSchema,
  }),
});

// ============================================
// UPDATE DRIVER PROFILE VALIDATION
// ============================================
export const updateDriverProfileSchema = z.object({
  body: z.object({
    personalInfo: personalInfoSchema.partial().optional(),
    documents: documentsSchema.partial().optional(),
    vehicleInfo: vehicleInfoSchema.partial().optional(),
    location: locationSchema,
  }),
});

// ============================================
// UPDATE STATUS VALIDATION
// ============================================
export const updateStatusSchema = z.object({
  body: z.object({
    isOnline: z.boolean({
      required_error: "Status is required",
      invalid_type_error: "Status must be true or false",
    }),
  }),
});
