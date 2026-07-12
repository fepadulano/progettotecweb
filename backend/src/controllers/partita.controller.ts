import { Request, Response } from "express";
import axios from "axios";
import { Partita, Tentativo, Utente } from "../models";
import { censuraTesto } from "../utils/censuraTesto";

const WIKI_USER_AGENT =
  "WikiBlank/1.0 (progetto universitario Web Technologies, Federico II)";
const LUNGHEZZA_MINIMA_ARTICOLO = 200; // sotto questa soglia l'articolo è uno stub con troppe poche parole comuni da indovinare
const LUNGHEZZA_MASSIMA_ARTICOLO = 1000; // oltre, il testo censurato diventa un muro di trattini troppo lungo da giocare
const MAX_TENTATIVI_RECUPERO = 10;

function idUtenteAutenticato(req: Request): number {
  return (req as any).user.id;
}

// articoli di matematica o fisica che a volte contengono formule tipo "{\displaystyle}", rende il testo illeggibile
function haMarkupGrezzo(testo: string): boolean {
  return /\{\\[a-zA-Z]|\\displaystyle|\\frac|\\sqrt|\\begin\{/.test(testo);
}

// taglia all'ultimo punto pieno prima del limite, così il testo censurato
// resta giocabile invece di essere un muro di trattini
function accorciaTesto(testo: string, lunghezzaMassima: number): string {
  if (testo.length <= lunghezzaMassima) return testo;

  const testoTagliato = testo.slice(0, lunghezzaMassima);
  const ultimoPunto = testoTagliato.lastIndexOf(".");
  return ultimoPunto > LUNGHEZZA_MINIMA_ARTICOLO
    ? testoTagliato.slice(0, ultimoPunto + 1)
    : testoTagliato;
}

// riprova finché l'articolo non è abbastanza lungo e il testo non contiene
// markup grezzo
async function recuperaArticoloCasuale(): Promise<{
  titolo: string;
  testo: string;
} | null> {
  for (let tentativo = 0; tentativo < MAX_TENTATIVI_RECUPERO; tentativo++) {
    const rispostaWiki = await axios.get(
      // prop=extracts : voglio il testo estratto della pagina
      //generator=random : scegli una pagina a caso
      //grnnamespace=0 : solo dal namespace 0 (voci enciclopediche vere, escluse pagine tipo Discussione:, Utente:, Categoria:)
      //grnlimit=1 : una sola pagina
      //explaintext=true → l'estratto in testo semplice, non HTML
      //exsectionformat=plain : i titoli di sezione come testo semplice, non == Storia ==
      "https://it.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&generator=random&grnnamespace=0&grnlimit=1&explaintext=true&exsectionformat=plain",
      {
        // senza uno user agent wikipedia blocca la richiesta con 403
        headers: { "User-Agent": WIKI_USER_AGENT },
      },
    );

    // rispostaWiki.data ha questa forma:
    // { query: { pages: { "8720481": { pageid, ns, title, extract } } } }
    // "pages" non è un array ma un oggetto con l'id della pagina come chiave,
    // e quell'id cambia ad ogni chiamata (l'articolo è casuale)
    const pagine = rispostaWiki.data.query.pages;
    const idPagina = Object.keys(pagine)[0];
    const titolo = pagine[idPagina].title;
    const testo = pagine[idPagina].extract;

    if (
      testo &&
      testo.length >= LUNGHEZZA_MINIMA_ARTICOLO &&
      !haMarkupGrezzo(testo)
    ) {
      return {
        titolo,
        testo: accorciaTesto(testo, LUNGHEZZA_MASSIMA_ARTICOLO),
      };
    }
  }

  return null;
}

export const avviaPartita = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = idUtenteAutenticato(req);

    // riprendiamo una partita in corso invece di crearne una nuova, così si può
    // continuare da un altro dispositivo senza perdere i progressi
    const partitaEsistente = await Partita.findOne({
      where: { userId, stato: "IN_CORSO" },
    });

    if (partitaEsistente) {
      res.status(200).json({
        idPartita: partitaEsistente.id,
        testoCensurato: censuraTesto(
          partitaEsistente.testoArticolo,
          partitaEsistente.paroleIndovinate,
        ),
      });
      return;
    }

    const articolo = await recuperaArticoloCasuale();

    if (!articolo) {
      res.status(500).json({
        errore:
          "Impossibile trovare un articolo adatto, riprova ad iniziare la partita.",
      });
      return;
    }

    const { titolo: titoloArticolo, testo: testoArticolo } = articolo;

    const nuovaPartita = await Partita.create({
      userId,
      titoloArticolo,
      testoArticolo, // testo originale, mai inviato al frontend prima della fine partita
      stato: "IN_CORSO",
    });

    res.status(201).json({
      idPartita: nuovaPartita.id,
      testoCensurato: censuraTesto(testoArticolo, []),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errore: "Errore durante l'avvio della partita." });
  }
};

// tentativo sul titolo: o si vince la partita, o si segna solo l'errore
async function gestisciTentativoTitolo(
  res: Response,
  partita: Partita,
  parola: string,
  parolaNormalizzata: string,
): Promise<void> {
  const titoloNormalizzato = partita.titoloArticolo.toLowerCase().trim();
  const titoloCorretto = parolaNormalizzata === titoloNormalizzato;

  await Tentativo.create({
    sessionId: partita.id,
    parolaTentata: parola,
    corretta: titoloCorretto,
    tentativoSulTitolo: true,
  });

  if (!titoloCorretto) {
    await partita.save();
    res.status(200).json({
      vittoria: false,
      tipo: "ERRORE_TITOLO",
      messaggio: "Sbagliato! Questo non è il titolo dell'articolo.",
    });
    return;
  }

  partita.stato = "VINTA";
  const punteggioGuadagnato = Math.max(10, 100 - partita.tentativi * 5);
  partita.punteggio = punteggioGuadagnato;
  await partita.save();

  const utente = await Utente.findByPk(partita.userId);
  if (utente) {
    utente.punteggioTotale += punteggioGuadagnato;
    await utente.save();
  }

  res.status(200).json({
    vittoria: true,
    tipo: "VITTORIA",
    messaggio: "Incredibile, hai indovinato il titolo esatto!",
    punteggio: punteggioGuadagnato,
    titoloOriginale: partita.titoloArticolo,
    testoInChiaro: partita.testoArticolo,
  });
}

// tentativo su una parola del testo: o si svela ovunque compaia, o si segna l'errore
async function gestisciTentativoParola(
  res: Response,
  partita: Partita,
  parola: string,
  parolaNormalizzata: string,
): Promise<void> {
  const regexParola = new RegExp(`\\b${parolaNormalizzata}\\b`, "gi");
  const corrispondenze = partita.testoArticolo.match(regexParola);
  const numeroOccorrenze = corrispondenze ? corrispondenze.length : 0;
  const parolaTrovata = numeroOccorrenze > 0;

  await Tentativo.create({
    sessionId: partita.id,
    parolaTentata: parola,
    corretta: parolaTrovata,
    tentativoSulTitolo: false,
  });

  if (!parolaTrovata) {
    await partita.save();
    res.status(200).json({
      vittoria: false,
      tipo: "ERRORE",
      messaggio: "Questa parola non è presente nell'articolo.",
    });
    return;
  }

  const paroleAttuali = partita.paroleIndovinate || [];
  if (!paroleAttuali.includes(parolaNormalizzata)) {
    paroleAttuali.push(parolaNormalizzata);
    partita.paroleIndovinate = paroleAttuali;
    partita.changed("paroleIndovinate", true);
  }
  await partita.save();

  const etichettaVolta = numeroOccorrenze === 1 ? "volta" : "volte";

  res.status(200).json({
    vittoria: false,
    tipo: "TESTO",
    messaggio: `Ottimo! La parola "${parola}" compare ${numeroOccorrenze} ${etichettaVolta}.`,
    nuovoTestoCensurato: censuraTesto(
      partita.testoArticolo,
      partita.paroleIndovinate,
    ),
  });
}

export const inviaTentativo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = idUtenteAutenticato(req);
    const { idPartita, parola, isTitolo } = req.body;

    const partita = await Partita.findOne({
      where: { id: idPartita, userId },
    });

    if (!partita) {
      res.status(404).json({ errore: "Partita non trovata." });
      return;
    }

    if (partita.stato !== "IN_CORSO") {
      res.status(400).json({ errore: "Partita già conclusa." });
      return;
    }

    const parolaNormalizzata = parola.toLowerCase().trim();
    const paroleAttuali = partita.paroleIndovinate || [];

    // una parola già indovinata non conta come tentativo, altrimenti un doppio
    // click sulla stessa parola costerebbe un punto al giocatore
    if (!isTitolo && paroleAttuali.includes(parolaNormalizzata)) {
      res.status(200).json({
        vittoria: false,
        tipo: "GIA_INDOVINATA",
        messaggio: `Hai già svelato la parola "${parola}". Non ti scalo il tentativo, riprova!`,
      });
      return;
    }

    partita.tentativi += 1;

    if (isTitolo) {
      await gestisciTentativoTitolo(res, partita, parola, parolaNormalizzata);
    } else {
      await gestisciTentativoParola(res, partita, parola, parolaNormalizzata);
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ errore: "Errore durante il controllo del tentativo." });
  }
};

export const abbandonaPartita = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = idUtenteAutenticato(req);
    const { idPartita } = req.body;

    const partita = await Partita.findOne({
      where: { id: idPartita, userId },
    });

    if (!partita) {
      res.status(404).json({ errore: "Partita non trovata." });
      return;
    }

    if (partita.stato !== "IN_CORSO") {
      res.status(400).json({ errore: "La partita è già conclusa." });
      return;
    }

    partita.stato = "ABBANDONATA";
    await partita.save();

    res.status(200).json({
      messaggio: "Partita abbandonata.",
      titoloOriginale: partita.titoloArticolo,
      testoInChiaro: partita.testoArticolo,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ errore: "Errore durante l'abbandono della partita." });
  }
};
