import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";
import { checkAuth } from "../../middleware/ckeckAuth";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../../config/multer.config";
import { validateRequest } from "../../middleware/validateRequest";
import { createSpecialtyZodSchema } from "./specialty.validation";

// checkAuth
// checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
const router = Router();

router.post('/', multerUpload.single("file"),validateRequest(createSpecialtyZodSchema), SpecialtyController.createSpecialty);

router.get('/',checkAuth(Role.PATIENT), SpecialtyController.getAllSpecialties);

router.delete('/:id', SpecialtyController.deleteSpecialties);

router.patch("/:id", SpecialtyController.updateSpecialties)



export const SpecialtyRoutes = router