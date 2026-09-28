/**
 * Vaderdag valt in Nederland op de derde zondag van juni. Berekend in plaats
 * van hardgecodeerd, zodat /vaderdag na juni geen verlopen datum toont.
 * Op Vaderdag zelf geeft de functie die dag nog terug.
 */
export function nextVaderdag(now: Date = new Date()): Date {
  const thirdSundayOfJune = (year: number): Date => {
    const firstJune = new Date(year, 5, 1);
    const firstSunday = 1 + ((7 - firstJune.getDay()) % 7);
    return new Date(year, 5, firstSunday + 14);
  };

  const thisYear = thirdSundayOfJune(now.getFullYear());
  const endOfThisYear = new Date(thisYear.getFullYear(), 5, thisYear.getDate() + 1);
  return now < endOfThisYear ? thisYear : thirdSundayOfJune(now.getFullYear() + 1);
}
