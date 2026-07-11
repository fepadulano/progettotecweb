import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    const utenteEsistente = await User.findOne({ where: { email } });
    if (utenteEsistente) {
      res
        .status(400)
        .json({ errore: "Un account con questa email esiste già." });
      return;
    }

    const sale = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, sale);

    await User.create({
      username,
      email,
      password: passwordHash,
    });

    res.status(201).json({ messaggio: "Utente registrato con successo!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errore: "Errore durante la registrazione." });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const utente = await User.findOne({ where: { email } });
    if (!utente) {
      res.status(404).json({ errore: "Utente non trovato." });
      return;
    }

    const passwordValida = await bcrypt.compare(password, utente.password);
    if (!passwordValida) {
      res.status(401).json({ errore: "Password errata." });
      return;
    }

    const token = jwt.sign(
      { id: utente.id, username: utente.username },
      process.env.JWT_SECRET || "chiave_segreta_di_riserva",
      { expiresIn: "24h" },
    );

    res.status(200).json({ messaggio: "Login effettuato!", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errore: "Errore durante il login." });
  }
};
