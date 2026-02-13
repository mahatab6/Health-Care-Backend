
import z from "zod";

export const updateDoctorZodSchema = z.object({
    name: z.string().min(3).max(50).optional(),
    profilePhoto: z.string().optional(),
    contactNumber: z.string().optional(),
    address: z.string().optional(),
    registrationNumber: z.string().optional(),
    experience: z.number().nonnegative().optional(),
    appointmentFee: z.number().nonnegative().optional(),
    qualification: z.string().optional(),
    currentWorkingPlace: z.string().optional(),
    designation: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    Specialties: z.array(z.uuid("Each specialty ID must be a valid UUID")).optional()
})


