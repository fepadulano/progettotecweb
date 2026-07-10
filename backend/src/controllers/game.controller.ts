import { Request, Response } from "express";
import axios from "axios";
import { GameSession, Guess, User } from "../models";
import { censorText } from "../utils/censorText";

const WIKI_USER_AGENT =
  "WikiBlank/1.0 (progetto universitario Web Technologies, Federico II)";
const MIN_ARTICLE_LENGTH = 400; // sotto questa soglia l'articolo è uno stub con troppe poche parole comuni da indovinare
const MAX_ARTICLE_LENGTH = 1500; // oltre, il testo censurato diventa un muro di trattini troppo lungo da giocare
const MAX_FETCH_ATTEMPTS = 10;

// titoli con numeri, parentesi o troppe parole sono quasi sempre risultati sportivi,
// disambiguazioni, episodi o nomi scientifici: troppo difficili da indovinare a caso
function isGuessableTitle(title: string): boolean {
  if (/[0-9()]/.test(title)) return false;
  if (title.split(/\s+/).length > 4) return false;
  return /^[A-Za-zÀ-ÿ'\-\s]+$/.test(title);
}

// articoli di matematica/fisica a volte contengono formule che Wikipedia restituisce
// come sorgente LaTeX grezza (es. "{\displaystyle ...}"), che la censura per lettere
// non tocca e rende il testo illeggibile
function hasRawMarkup(text: string): boolean {
  return /\{\\[a-zA-Z]|\\displaystyle|\\frac|\\sqrt|\\begin\{/.test(text);
}

// taglia all'ultimo punto pieno prima del limite, così il testo censurato
// resta giocabile invece di essere un muro di trattini
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const cut = text.slice(0, maxLength);
  const lastPeriod = cut.lastIndexOf(".");
  return lastPeriod > MIN_ARTICLE_LENGTH ? cut.slice(0, lastPeriod + 1) : cut;
}

// riprova finché l'articolo non è abbastanza lungo, il titolo è indovinabile
// e il testo non contiene markup grezzo (vedi funzioni sopra)
async function fetchRandomArticle(): Promise<{
  title: string;
  text: string;
} | null> {
  for (let attempt = 0; attempt < MAX_FETCH_ATTEMPTS; attempt++) {
    const wikiResponse = await axios.get(
      // niente exintro: serve il testo intero, non solo l'incipit, altrimenti la
      // stragrande maggioranza delle voci resta sotto MIN_ARTICLE_LENGTH.
      // exsectionformat=plain evita che i titoli di sezione arrivino come "== Storia =="
      "https://it.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&generator=random&grnnamespace=0&grnlimit=1&explaintext=true&exsectionformat=plain",
      {
        // senza uno User-Agent descrittivo Wikipedia blocca la richiesta con 403
        headers: { "User-Agent": WIKI_USER_AGENT },
      },
    );

    const pages = wikiResponse.data.query.pages;
    const pageId = Object.keys(pages)[0];
    const title = pages[pageId].title;
    const text = pages[pageId].extract;

    if (
      text &&
      text.length >= MIN_ARTICLE_LENGTH &&
      isGuessableTitle(title) &&
      !hasRawMarkup(text)
    ) {
      return { title, text: truncateText(text, MAX_ARTICLE_LENGTH) };
    }
  }

  return null;
}

export const startGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    // riprendiamo una partita in corso invece di crearne una nuova, così si può
    // continuare da un altro dispositivo senza perdere i progressi
    const existingSession = await GameSession.findOne({
      where: { userId, status: "IN_PROGRESS" },
    });

    if (existingSession) {
      res.status(200).json({
        sessionId: existingSession.id,
        censoredText: censorText(
          existingSession.article_text,
          existingSession.guessed_words,
        ),
      });
      return;
    }

    const article = await fetchRandomArticle();

    if (!article) {
      res.status(500).json({
        errore:
          "Impossibile trovare un articolo adatto, riprova ad iniziare la partita.",
      });
      return;
    }

    const { title: articleTitle, text: articleText } = article;

    const newSession = await GameSession.create({
      userId,
      article_title: articleTitle,
      article_text: articleText, // testo originale, mai inviato al frontend prima della fine partita
      status: "IN_PROGRESS",
    });

    res.status(201).json({
      sessionId: newSession.id,
      censoredText: censorText(articleText, []),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errore: "Errore durante l'avvio della partita." });
  }
};

export const makeGuess = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { sessionId, word, isTitleGuess } = req.body;

    const session = await GameSession.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      res.status(404).json({ errore: "Partita non trovata." });
      return;
    }

    if (session.status !== "IN_PROGRESS") {
      res.status(400).json({ errore: "Partita già conclusa." });
      return;
    }

    const normalizedWord = word.toLowerCase().trim();
    const normalizedTitle = session.article_title.toLowerCase().trim();
    const currentWords = session.guessed_words || [];

    // una parola già indovinata non conta come tentativo, altrimenti un doppio
    // click sulla stessa parola costerebbe un punto al giocatore
    if (!isTitleGuess && currentWords.includes(normalizedWord)) {
      res.status(200).json({
        vittoria: false,
        tipo: "GIA_INDOVINATA",
        messaggio: `Hai già svelato la parola "${word}". Non ti scalo il tentativo, riprova!`,
      });
      return;
    }
    session.attempts_count += 1;

    if (isTitleGuess) {
      const isTitleMatch = normalizedWord === normalizedTitle;

      await Guess.create({
        sessionId,
        word_attempted: word,
        is_correct: isTitleMatch,
        is_title_guess: true,
      });

      if (isTitleMatch) {
        session.status = "WON";
        const pointsEarned = Math.max(10, 100 - session.attempts_count * 5);
        session.score = pointsEarned;
        await session.save();

        const user = await User.findByPk(userId);
        if (user) {
          user.total_score += pointsEarned;
          await user.save();
        }

        res.status(200).json({
          vittoria: true,
          tipo: "VITTORIA",
          messaggio: "Incredibile, hai indovinato il titolo esatto!",
          punteggio: pointsEarned,
          titoloOriginale: session.article_title,
          testoInChiaro: session.article_text,
        });
        return;
      } else {
        await session.save();
        res.status(200).json({
          vittoria: false,
          tipo: "ERRORE_TITOLO",
          messaggio: "Sbagliato! Questo non è il titolo dell'articolo.",
        });
        return;
      }
    }

    const wordRegex = new RegExp(`\\b${normalizedWord}\\b`, "gi");
    const textMatches = session.article_text.match(wordRegex);
    const matchCount = textMatches ? textMatches.length : 0;
    const isTextMatch = matchCount > 0;

    await Guess.create({
      sessionId,
      word_attempted: word,
      is_correct: isTextMatch,
      is_title_guess: false,
    });

    if (isTextMatch) {
      if (!currentWords.includes(normalizedWord)) {
        currentWords.push(normalizedWord);
        session.guessed_words = currentWords;
        session.changed("guessed_words", true);
      }
      await session.save();

      const updatedCensoredText = censorText(
        session.article_text,
        session.guessed_words,
      );

      const voltaLabel = matchCount === 1 ? "volta" : "volte";

      res.status(200).json({
        vittoria: false,
        tipo: "TESTO",
        messaggio: `Ottimo! La parola "${word}" compare ${matchCount} ${voltaLabel}.`,
        nuovoTestoCensurato: updatedCensoredText,
      });
    } else {
      await session.save();
      res.status(200).json({
        vittoria: false,
        tipo: "ERRORE",
        messaggio: "Questa parola non è presente nell'articolo.",
      });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ errore: "Errore durante il controllo del tentativo." });
  }
};

export const abandonGame = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { sessionId } = req.body;

    const session = await GameSession.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      res.status(404).json({ errore: "Partita non trovata." });
      return;
    }

    if (session.status !== "IN_PROGRESS") {
      res.status(400).json({ errore: "La partita è già conclusa." });
      return;
    }

    session.status = "ABANDONED";
    await session.save();

    res.status(200).json({
      messaggio: "Partita abbandonata.",
      titoloOriginale: session.article_title,
      testoInChiaro: session.article_text,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ errore: "Errore durante l'abbandono della partita." });
  }
};
