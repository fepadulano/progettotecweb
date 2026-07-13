import { Router } from "express";
import {
  elencaPartiteConcluse,
  ottieniDettaglioPartita,
} from "../controllers/partiteConcluse.controller";

const router = Router();

router.get("/", elencaPartiteConcluse);
router.get("/:id", ottieniDettaglioPartita);

export default router;
