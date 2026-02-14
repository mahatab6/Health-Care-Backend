import { Router } from "express";
import { authController } from "./auth.controller";


const router = Router()

router.post('/register', authController.registerPatient)

router.post('/login', authController.loginPatient)

router.post('/refresh-token', authController.getNewAccessToken)


export const AuthRoutes = router;