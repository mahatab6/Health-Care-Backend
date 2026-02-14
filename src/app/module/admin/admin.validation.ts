import z from "zod";
import { Gender } from "../../../generated/prisma/enums";


export const AdminValidation = z.object({
    name: z.string("name is required").min(3, "name must be at least 3 characters").max(50, "name must be less than 50 characters").optional(),
    profilePhoto: z.string().optional(),
    contactNumber: z.string("contact number is required").optional(),
    address: z.string("address is required").optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE], "gender  is required"),
})