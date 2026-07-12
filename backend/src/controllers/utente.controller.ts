import { Request, Response } from "express";
import { fn, col, literal } from "sequelize";
import { Partita, Utente } from "../models";

export const classifica = async (req: Request, res: Response): Promise<void> => {
  try {
    // ordiniamo per vittorie (più alto è meglio) e tempo medio (più basso è meglio)
    const righe = await Partita.findAll({
      where: { stato: "VINTA" },
      attributes: [
        "userId",
        [fn("COUNT", col("Partita.id")), "partiteVinte"],
        [
          fn(
            "AVG",
            literal(
              `EXTRACT(EPOCH FROM ("Partita"."updatedAt" - "Partita"."createdAt"))`,
            ),
          ),
          "tempoMedioSecondi",
        ],
      ],
      include: [{ model: Utente, attributes: ["username"] }],
      group: ["Partita.userId", "Utente.id"],
      order: [
        [literal('"partiteVinte"'), "DESC"],
        [literal('"tempoMedioSecondi"'), "ASC"],
      ],
      limit: 10,
      raw: true,
    });

    const risultato = (righe as any[]).map((riga) => ({
      id: riga.userId,
      username: riga["Utente.username"],
      partiteVinte: parseInt(riga.partiteVinte, 10),
      tempoMedioSecondi: parseFloat(riga.tempoMedioSecondi),
    }));

    res.status(200).json(risultato);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ errore: "Errore durante il recupero della classifica." });
  }
};
