import { Router } from "express";
import { avviaPartita, inviaTentativo, abbandonaPartita } from "../controllers/partita.controller";
import { autenticaToken } from "../middlewares/auth.middleware";

const router = Router();

// tutte protette: senza token valido non si gioca
router.post("/avvia", autenticaToken, avviaPartita);
router.post("/tentativo", autenticaToken, inviaTentativo);
router.post("/abbandona", autenticaToken, abbandonaPartita);

export default router;
