import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { CreateAdminZodSchema, createDoctorZodSchema, CreateSuperAdminZodSchema } from "./user.validation";
import { checkAuth } from "../../middleware/ckeckAuth";
import { Role } from "../../../generated/prisma/enums";


const router = Router()

router.post('/create-doctor',validateRequest(createDoctorZodSchema) , UserController.createDoctor)

router.post('/create-admin',checkAuth(Role.SUPER_ADMIN), validateRequest(CreateAdminZodSchema) , UserController.createAdmin)

router.post('/create-super-admin', validateRequest(CreateSuperAdminZodSchema) , UserController.createSuperAdmin)


export const UserRoutes = router