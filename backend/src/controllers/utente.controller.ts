import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import database from "../config/database";

export const classifica = async (req: Request, res: Response): Promise<void> => {
  try {
    // ordiniamo per vittorie (più alto è meglio) e tempo medio (più basso è meglio)
    const risultato = await database.query(
      `
      SELECT
        "Utenti".id,
        "Utenti".username,
        COUNT("Partite".id)::int AS "partiteVinte",
        AVG(EXTRACT(EPOCH FROM ("Partite"."updatedAt" - "Partite"."createdAt")))::float AS "tempoMedioSecondi"
      FROM "Partite"
      JOIN "Utenti" ON "Utenti".id = "Partite".id_utente
      WHERE "Partite".stato = 'VINTA'
      GROUP BY "Utenti".id, "Utenti".username
      ORDER BY "partiteVinte" DESC, "tempoMedioSecondi" ASC
      LIMIT 10
      `,
      { type: QueryTypes.SELECT },
    );

    res.status(200).json(risultato);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ errore: "Errore durante il recupero della classifica." });
  }
};
