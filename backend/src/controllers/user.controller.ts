import { Request, Response } from "express";
import { Partita, Utente } from "../models";

export const classifica = async (req: Request, res: Response): Promise<void> => {
  try {
    const partiteVinte = await Partita.findAll({
      where: { stato: "VINTA" },
      include: [{ model: Utente, attributes: ["username"] }],
    });

    // raggruppiamo le partite vinte per utente in un semplice oggetto,
    // usando l'id utente come chiave, invece di farlo fare al database
    const perUtente: Record<
      number,
      { username: string; vittorie: number; tempoTotaleSecondi: number }
    > = {};

    for (const partita of partiteVinte) {
      const id = partita.userId;
      const tempoImpiegato =
        (partita.updatedAt.getTime() - partita.createdAt.getTime()) / 1000;

      if (!perUtente[id]) {
        perUtente[id] = {
          username: (partita as any).User?.username ?? "Anonimo",
          vittorie: 0,
          tempoTotaleSecondi: 0,
        };
      }

      perUtente[id].vittorie += 1;
      perUtente[id].tempoTotaleSecondi += tempoImpiegato;
    }

    // vittorie più alte prima, a parità vince il tempo medio più basso
    const risultato = Object.entries(perUtente)
      .map(([id, s]) => ({
        id: Number(id),
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
