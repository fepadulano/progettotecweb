import { Request, Response } from "express";
import { fn, col, literal } from "sequelize";
import { Partita, Utente } from "../models";

export const ottieniClassifica = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // ordiniamo per vittorie (più alto è meglio) e tempo medio (più basso è meglio)
    const righe = await Partita.findAll({
      where: { stato: "WON" },
      attributes: [
        "userId",
        [fn("COUNT", col("GameSession.id")), "partiteVinte"],
        [
          fn(
            "AVG",
            literal(
              `EXTRACT(EPOCH FROM ("GameSession"."updatedAt" - "GameSession"."createdAt"))`,
            ),
          ),
          "tempoMedioSecondi",
        ],
      ],
      include: [{ model: Utente, attributes: ["username"] }],
      group: ["GameSession.userId", "User.id"],
      order: [
        [literal('"partiteVinte"'), "DESC"],
        [literal('"tempoMedioSecondi"'), "ASC"],
      ],
      limit: 10,
      raw: true,
    });

    const classifica = (righe as any[]).map((riga) => ({
      id: riga.userId,
      username: riga["User.username"],
      partiteVinte: parseInt(riga.partiteVinte, 10),
      tempoMedioSecondi: parseFloat(riga.tempoMedioSecondi),
    }));

    res.status(200).json(classifica);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ errore: "Errore durante il recupero della classifica." });
  }
};
