import { Router } from "express";
import { classifica } from "../controllers/utente.controller";

const router = Router();

router.get("/classifica", classifica);

export default router;
