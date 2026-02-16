
import z from "zod";



export const createSpecialtyZodSchema = z.object({
    title: z.string("title must be string").min(1, "title is required"),
    description: z.string("description must be string").min(1, "description is required").optional()
})
