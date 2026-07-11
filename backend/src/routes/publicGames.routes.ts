import { Router } from "express";
import {
  elencaPartiteConcluse,
  ottieniDettaglioPartita,
} from "../controllers/publicGames.controller";

const router = Router();

// nessun middleware di autenticazione qui: consultabili da chiunque
router.get("/", elencaPartiteConcluse);
router.get("/:id", ottieniDettaglioPartita);

export default router;
