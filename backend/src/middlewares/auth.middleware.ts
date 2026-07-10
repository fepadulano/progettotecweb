import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ errore: "Accesso negato. Token mancante." });
    return;
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "chiave_segreta_di_riserva",
    (err: any, user: any) => {
      if (err) {
        res.status(403).json({ errore: "Token non valido o scaduto." });
        return;
      }

      (req as any).user = user;
      next();
    },
  );
};
