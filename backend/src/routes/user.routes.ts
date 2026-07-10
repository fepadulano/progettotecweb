import { Router } from "express";
import { getLeaderboard } from "../controllers/user.controller";

const router = Router();

router.get("/leaderboard", getLeaderboard);

export default router;
