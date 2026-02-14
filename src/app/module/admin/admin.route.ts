import { Router } from "express";
import { adminController } from "./admin.controller";



const router = Router();


router.get('/', adminController.getAllAdmin)

router.get('/:id', adminController.getAdminById)

router.patch('/:id', adminController.updateAdmin)

router.delete('/:id', adminController.adminDelete)


export const adminRoutes = router;