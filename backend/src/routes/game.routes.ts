import { Router } from "express";
import { startGame, makeGuess, abandonGame } from "../controllers/game.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// tutte protette: senza token valido non si gioca
router.get("/start", authenticateToken, startGame);
router.post("/guess", authenticateToken, makeGuess);
router.post("/abandon", authenticateToken, abandonGame);

export default router;
