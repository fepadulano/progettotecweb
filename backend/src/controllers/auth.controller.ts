import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res
        .status(400)
        .json({ errore: "Un account con questa email esiste già." });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Utente registrato con successo!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errore: "Errore durante la registrazione." });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(404).json({ errore: "Utente non trovato." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ errore: "Password errata." });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "chiave_segreta_di_riserva",
      { expiresIn: "24h" },
    );

    res.status(200).json({ message: "Login effettuato!", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errore: "Errore durante il login." });
  }
};
