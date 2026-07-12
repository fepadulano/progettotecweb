export function censuraTesto(
  testoOriginale: string,
  paroleIndovinate: string[],
): string {
  return testoOriginale.replace(/[a-zA-Zà-ÿ]+/gi, (corrispondenza) => {
    if (paroleIndovinate.includes(corrispondenza.toLowerCase())) {
      return corrispondenza; // parola indovinata: la lascia in chiaro
    }
    return "_".repeat(corrispondenza.length); // parola ignota: trattini
  });
}
