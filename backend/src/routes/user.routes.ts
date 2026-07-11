import { Router } from "express";
import { classifica } from "../controllers/user.controller";

const router = Router();

router.get("/classifica", classifica);

export default router;
