import { Router } from "express";
import { adminController } from "./admin.controller";



const router = Router();


router.get('/', adminController.getAllAdmin)

router.get('/:id', adminController.getAdminById)


export const adminRoutes = router;