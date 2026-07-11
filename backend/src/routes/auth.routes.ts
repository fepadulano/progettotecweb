import { Router } from "express";
import { registra, accedi } from "../controllers/auth.controller";

const router = Router();

router.post("/registrati", registra);
router.post("/accedi", accedi);

export default router;
