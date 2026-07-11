import { Request, Response } from "express";
import { fn, col, literal } from "sequelize";
import { GameSession, User } from "../models";

export const getLeaderboard = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // ordiniamo per vittorie (più alto è meglio) e tempo medio (più basso è meglio)
    const rows = await GameSession.findAll({
      where: { status: "WON" },
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
      include: [{ model: User, attributes: ["username"] }],
      group: ["GameSession.userId", "User.id"],
      order: [
        [literal('"partiteVinte"'), "DESC"],
        [literal('"tempoMedioSecondi"'), "ASC"],
      ],
      limit: 10,
      raw: true,
    });

    const leaderboard = (rows as any[]).map((row) => ({
      id: row.userId,
      username: row["User.username"],
      partiteVinte: parseInt(row.partiteVinte, 10),
      tempoMedioSecondi: parseFloat(row.tempoMedioSecondi),
    }));

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ errore: "Errore durante il recupero della classifica." });
  }
};
