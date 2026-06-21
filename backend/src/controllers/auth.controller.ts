import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models"; // Importiamo il modello dal nostro index.ts

// --- REGISTRAZIONE ---
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Criptiamo la password prima di salvarla
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Salviamo il nuovo utente nel database
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

// --- LOGIN ---
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Cerchiamo l'utente tramite l'email
    // @ts-ignore
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(404).json({ errore: "Utente non trovato." });
      return;
    }

    // Confrontiamo la password inserita con quella nel DB
    // @ts-ignore
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ errore: "Password errata." });
      return;
    }

    // Se è corretta, generiamo il Token JWT
    // @ts-ignore
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "chiave_segreta_di_riserva",
      { expiresIn: "24h" }
    );

    res.status(200).json({ message: "Login effettuato!", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errore: "Errore durante il login." });
  }
};