import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";


const router = Router();

router.post('/', SpecialtyController.createSpecialty);

router.get('/', SpecialtyController.getAllSpecialties);

router.delete('/:id', SpecialtyController.deleteSpecialties);

router.patch("/:id", SpecialtyController.updateSpecialties)



export const SpecialtyRoutes = router