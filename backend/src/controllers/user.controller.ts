import { Request, Response } from "express";
import { Partita, Utente } from "../models";

type StatisticheUtente = {
  username: string;
  vittorie: number;
  tempoTotaleSecondi: number;
};

export const classifica = async (req: Request, res: Response): Promise<void> => {
  try {
    const partiteVinte = await Partita.findAll({
      where: { stato: "WON" },
      include: [{ model: Utente, attributes: ["username"] }],
    });

    // raggruppiamo le partite vinte per utente, contando le vittorie e
    // sommando il tempo impiegato, invece di farlo fare al database
    const statistiche = new Map<number, StatisticheUtente>();

    for (const partita of partiteVinte) {
      const username = (partita as any).User?.username ?? "Anonimo";
      const tempoImpiegato =
        (partita.updatedAt.getTime() - partita.createdAt.getTime()) / 1000;

      const attuali = statistiche.get(partita.userId) ?? {
        username,
        vittorie: 0,
        tempoTotaleSecondi: 0,
      };

      attuali.vittorie += 1;
      attuali.tempoTotaleSecondi += tempoImpiegato;
      statistiche.set(partita.userId, attuali);
    }

    // vittorie più alte prima, a parità vince il tempo medio più basso
    const risultato = Array.from(statistiche.entries())
      .map(([id, s]) => ({
        id,
        username: s.username,
        partiteVinte: s.vittorie,
        tempoMedioSecondi: s.tempoTotaleSecondi / s.vittorie,
      }))
      .sort(
        (a, b) =>
          b.partiteVinte - a.partiteVinte || a.tempoMedioSecondi - b.tempoMedioSecondi,
      )
      .slice(0, 10);

    res.status(200).json(risultato);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ errore: "Errore durante il recupero della classifica." });
  }
};
