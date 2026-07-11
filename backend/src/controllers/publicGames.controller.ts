import { Request, Response } from "express";
import { GameSession, User } from "../models";
import { censorText } from "../utils/censorText";

const STATI_CONCLUSI = ["WON", "ABANDONED"];

function durataInSecondi(partita: GameSession): number {
  return (partita.updatedAt.getTime() - partita.createdAt.getTime()) / 1000;
}

export const listCompletedGames = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const partite = await GameSession.findAll({
      where: { stato: STATI_CONCLUSI },
      attributes: [
        "id",
        "titoloArticolo",
        "stato",
        "tentativi",
        "createdAt",
        "updatedAt",
      ],
      include: [{ model: User, attributes: ["username"] }],
      order: [["updatedAt", "DESC"]],
    });

    const risultato = partite.map((partita) => ({
      id: partita.id,
      titoloArticolo: partita.titoloArticolo,
      stato: partita.stato,
      tentativi: partita.tentativi,
      durataSecondi: durataInSecondi(partita),
      username: (partita as any).User?.username ?? null,
      giocataIl: partita.createdAt,
    }));

    res.status(200).json(risultato);
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

    const partita = await GameSession.findOne({
      where: { id, stato: STATI_CONCLUSI },
      include: [{ model: User, attributes: ["username"] }],
    });

    if (!partita) {
      res
        .status(404)
        .json({ errore: "Partita non trovata o ancora in corso." });
      return;
    }

    res.status(200).json({
      id: partita.id,
      titoloArticolo: partita.titoloArticolo,
      stato: partita.stato,
      testoCensurato: censorText(partita.testoArticolo, partita.paroleIndovinate),
      tentativi: partita.tentativi,
      durataSecondi: durataInSecondi(partita),
      username: (partita as any).User?.username ?? null,
      giocataIl: partita.createdAt,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ errore: "Errore durante il recupero della partita." });
  }
};
