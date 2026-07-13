import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Utente } from "../models";

export const registra = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    const utenteEsistente = await Utente.findOne({ where: { email } });
    if (utenteEsistente) {
      res
        .status(400)
        .json({ messaggio: "Un account con questa email esiste già." });
      return;
    }

    const sale = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, sale);

    await Utente.create({
      username,
      email,
      password: passwordHash,
    });

    res.status(201).json({ messaggio: "Utente registrato con successo!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ messaggio: "Errore durante la registrazione." });
  }
};

export const accedi = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const utente = await Utente.findOne({ where: { email } });
    if (!utente) {
      res.status(404).json({ messaggio: "Utente non trovato." });
      return;
    }

    const passwordValida = await bcrypt.compare(password, utente.password);
    if (!passwordValida) {
      res.status(401).json({ messaggio: "Password errata." });
      return;
    }

    const token = jwt.sign(
      { id: utente.id, username: utente.username },
      process.env.JWT_SECRET || "chiave_segreta_di_riserva",
      { expiresIn: "24h" },
    );

    res
      .status(200)
      .json({ messaggio: "Login effettuato!", token, username: utente.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ messaggio: "Errore durante il login." });
  }
};
