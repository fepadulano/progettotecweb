export function censorText(
  originalText: string,
  guessedWords: string[],
): string {
  return originalText.replace(/[a-zA-Zà-ÿ]+/gi, (match) => {
    if (guessedWords.includes(match.toLowerCase())) {
      return match; // parola indovinata: la lascia in chiaro
    }
    return "_".repeat(match.length); // parola ignota: trattini
  });
}
