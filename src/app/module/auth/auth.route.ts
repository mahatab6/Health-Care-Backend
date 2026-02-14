import { Router } from "express";
import { authController } from "./auth.controller";
import { checkAuth } from "../../middleware/ckeckAuth";
import { Role } from "../../../generated/prisma/enums";


const router = Router()

router.post('/register', authController.registerPatient)

router.post('/login', authController.loginPatient)

router.post('/refresh-token', authController.getNewAccessToken)

router.post('/change-password',checkAuth(Role.PATIENT, Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR), authController.changePassword)

router.post('/logout', checkAuth(Role.PATIENT, Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR), authController.logout)


export const AuthRoutes = router;