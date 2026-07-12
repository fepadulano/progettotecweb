import { Request, Response } from "express";
import { Partita, Utente } from "../models";

export const classifica = async (req: Request, res: Response): Promise<void> => {
  try {
    const partiteVinte = await Partita.findAll({
      where: { stato: "VINTA" },
      include: [{ model: Utente, attributes: ["username"] }],
    });

    // passo 1: raggruppiamo le partite vinte per utente, in un oggetto
    // semplice con l'id utente come chiave
    const perUtente: {
      [idUtente: number]: {
        username: string;
        vittorie: number;
        tempoTotaleSecondi: number;
      };
    } = {};

    for (const partita of partiteVinte) {
      const idUtente = partita.userId;
      const utenteCollegato = (partita as any).User;
      const username = utenteCollegato ? utenteCollegato.username : "Anonimo";
      const tempoPartitaSecondi =
        (partita.updatedAt.getTime() - partita.createdAt.getTime()) / 1000;

      if (perUtente[idUtente] === undefined) {
        perUtente[idUtente] = {
          username: username,
          vittorie: 0,
          tempoTotaleSecondi: 0,
        };
      }

      perUtente[idUtente].vittorie = perUtente[idUtente].vittorie + 1;
      perUtente[idUtente].tempoTotaleSecondi =
        perUtente[idUtente].tempoTotaleSecondi + tempoPartitaSecondi;
    }

    // passo 2: trasformiamo l'oggetto in un array di righe, calcolando
    // subito il tempo medio di ogni utente
    const righe = [];
    for (const idUtente in perUtente) {
      const statistiche = perUtente[idUtente];
      righe.push({
        id: Number(idUtente),
        username: statistiche.username,
        partiteVinte: statistiche.vittorie,
        tempoMedioSecondi: statistiche.tempoTotaleSecondi / statistiche.vittorie,
      });
    }

    // passo 3: ordiniamo le righe, più vittorie prima; a parità di
    // vittorie vince chi ha il tempo medio più basso
    righe.sort(function (a, b) {
      if (a.partiteVinte !== b.partiteVinte) {
        return b.partiteVinte - a.partiteVinte;
      }
      return a.tempoMedioSecondi - b.tempoMedioSecondi;
    });

    // passo 4: teniamo solo i primi 10
    const risultato = righe.slice(0, 10);

    res.status(200).json(risultato);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ errore: "Errore durante il recupero della classifica." });
  }
};
