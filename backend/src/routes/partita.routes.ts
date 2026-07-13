import { Router } from "express";
import {
  avviaPartita,
  inviaTentativo,
  abbandonaPartita,
} from "../controllers/partita.controller";
import { autenticaToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/avvia", autenticaToken, avviaPartita);
router.post("/tentativo", autenticaToken, inviaTentativo);
router.post("/abbandona", autenticaToken, abbandonaPartita);

export default router;
