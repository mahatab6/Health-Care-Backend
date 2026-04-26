import {Router} from "express"
import { RagController } from "./rag.controller";




const router = Router();


router.get("/stats", RagController.getStats)

router.post("/ingest-docters", RagController.ingestDoctors)

export const RagRouter = router;