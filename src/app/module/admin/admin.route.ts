import { Router } from "express";
import { adminController } from "./admin.controller";
import { checkAuth } from "../../middleware/ckeckAuth";
import { Role } from "../../../generated/prisma/enums";



const router = Router();


router.get('/', adminController.getAllAdmin)

router.get('/:id', adminController.getAdminById)

router.patch('/:id', adminController.updateAdmin)

router.delete('/:id', adminController.adminDelete)



router.patch("/change-user-status", 
    checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
     adminController.changeUserStatus);
router.patch("/change-user-role",
     checkAuth(Role.SUPER_ADMIN),
     adminController.changeUserRole);



export const adminRoutes = router;