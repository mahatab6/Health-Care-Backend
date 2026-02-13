import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";
import { checkAuth } from "../../middleware/ckeckAuth";
import { Role } from "../../../generated/prisma/enums";

// checkAuth

const router = Router();

router.post('/', SpecialtyController.createSpecialty);

router.get('/',checkAuth(Role.PATIEND), SpecialtyController.getAllSpecialties);

router.delete('/:id', SpecialtyController.deleteSpecialties);

router.patch("/:id", SpecialtyController.updateSpecialties)



export const SpecialtyRoutes = router