import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const headerAutenticazione = req.headers["authorization"];
  const token = headerAutenticazione && headerAutenticazione.split(" ")[1];

  if (!token) {
    res.status(401).json({ errore: "Accesso negato. Token mancante." });
    return;
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "chiave_segreta_di_riserva",
    (errore: any, datiUtente: any) => {
      if (errore) {
        res.status(403).json({ errore: "Token non valido o scaduto." });
        return;
      }

      (req as any).user = datiUtente;
      next();
    },
  );
};
