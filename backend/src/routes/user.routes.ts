import { Router } from "express";
import { ottieniClassifica } from "../controllers/user.controller";

const router = Router();

router.get("/classifica", ottieniClassifica);

export default router;
