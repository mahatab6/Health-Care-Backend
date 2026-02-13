import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const createDoctorZodSchema = z.object({
  password: z
    .string("password is required")
    .min(6, "password must be at least 6 characters")
    .max(20, "password must be less than 20 characters"),
  doctor: z.object({
    name: z
      .string("name is required")
      .min(3, "name must be at least 3 characters")
      .max(50, "name must be less than 50 characters"),
    email: z.email("email is required"),
    profilePhoto: z.string().optional(),
    contactNumber: z.string().optional(),
    address: z.string().optional(),
    registrationNumber: z.string("registration number is required"),
    experience: z
      .number("experience is required")
      .nonnegative("experience must be a non-negative number"),
    gender: z.enum([Gender.MALE, Gender.FEMALE], "gender is required"),
    appointmentFee: z
      .number("appointment fee is required")
      .nonnegative("appointment fee must be a non-negative number"),
    qualification: z.string("qualification is required"),
    currentWorkingPlace: z.string("current working place is required"),
    designation: z.string("designation is required"),
  }),
  Specialties: z
    .array(z.string(), "specialties must be an array of strings")
    .min(1, "at least one specialty is required"),
});


export const CreateAdminZodSchema = z.object({
  password: z.string("password is required").min(6, "password must be at least 6 characters"),
  admin: z.object({
    name: z.string("name is required").min(3, "name must be at least 3 characters").max(50, "name must be less than 50 characters"),
    email: z.email("email is required"),
    profilePhoto: z.string().optional(),
    contactNumber: z.string("contact number is required"),
    address: z.string("address is required"),
    gender: z.enum([Gender.MALE, Gender.FEMALE], "gender is required"),
  })
});

export const CreateSuperAdminZodSchema = z.object({
  password: z.string("password is required").min(6, "password must be at least 6 characters"),
  superAdmin: z.object({
    name: z.string("name is required").min(3, "name must be at least 3 characters").max(50, "name must be less than 50 characters"),
    email: z.email("email is required"),
    profilePhoto: z.string().optional(),
    contactNumber: z.string("contact number is required"),
    address: z.string("address is required"),
    gender: z.enum([Gender.MALE, Gender.FEMALE], "gender  is required"),
  })
});
