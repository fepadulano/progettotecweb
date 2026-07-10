import { Router } from "express";
import {
  listCompletedGames,
  getCompletedGameDetail,
} from "../controllers/publicGames.controller";

const router = Router();

// nessun middleware di autenticazione qui: consultabili da chiunque
router.get("/", listCompletedGames);
router.get("/:id", getCompletedGameDetail);

export default router;
