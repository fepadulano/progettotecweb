import { Request, Response } from "express";
import { GameSession, User } from "../models";
import { censorText } from "../utils/censorText";

const CONCLUDED_STATUSES = ["WON", "ABANDONED"];

function durationInSeconds(session: GameSession): number {
  return (session.updatedAt.getTime() - session.createdAt.getTime()) / 1000;
}

export const listCompletedGames = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const sessions = await GameSession.findAll({
      where: { status: CONCLUDED_STATUSES },
      attributes: [
        "id",
        "article_title",
        "status",
        "attempts_count",
        "createdAt",
        "updatedAt",
      ],
      include: [{ model: User, attributes: ["username"] }],
      order: [["updatedAt", "DESC"]],
    });

    const result = sessions.map((session) => ({
      id: session.id,
      titoloArticolo: session.article_title,
      stato: session.status,
      tentativi: session.attempts_count,
      durataSecondi: durationInSeconds(session),
      username: (session as any).User?.username ?? null,
      giocataIl: session.createdAt,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ errore: "Errore durante il recupero delle partite concluse." });
  }
};

export const getCompletedGameDetail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const session = await GameSession.findOne({
      where: { id, status: CONCLUDED_STATUSES },
      include: [{ model: User, attributes: ["username"] }],
    });

    if (!session) {
      res
        .status(404)
        .json({ errore: "Partita non trovata o ancora in corso." });
      return;
    }

    res.status(200).json({
      id: session.id,
      titoloArticolo: session.article_title,
      stato: session.status,
      testoCensurato: censorText(session.article_text, session.guessed_words),
      tentativi: session.attempts_count,
      durataSecondi: durationInSeconds(session),
      username: (session as any).User?.username ?? null,
      giocataIl: session.createdAt,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ errore: "Errore durante il recupero della partita." });
  }
};
