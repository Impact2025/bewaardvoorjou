import { describe, it, expect } from "vitest";
import { extractFaqFromHtml, buildFaqPageJsonLd } from "@/lib/faq-schema";

describe("extractFaqFromHtml", () => {
  it("herkent de h3+p-markup uit de TipTap-editor", () => {
    const html = `
      <h2>Veelgestelde vragen</h2>
      <h3>Moet ik chronologisch vertellen?</h3>
      <p>Nee, je mag springen in de tijd.</p>
      <h3>Is het veilig?</h3>
      <p>Ja, alles staat versleuteld opgeslagen.</p>
    `;
    expect(extractFaqFromHtml(html)).toEqual([
      { question: "Moet ik chronologisch vertellen?", answer: "Nee, je mag springen in de tijd." },
      { question: "Is het veilig?", answer: "Ja, alles staat versleuteld opgeslagen." },
    ]);
  });

  it("herkent de strong+br-markup uit de contentscripts", () => {
    const html = `
      <h2>Veelgestelde vragen</h2>
      <p><strong>Wat als mijn geheugen gaten heeft?</strong><br>
      Dat is normaal. We vullen hiaten aan met contextvragen.</p>
    `;
    expect(extractFaqFromHtml(html)).toEqual([
      {
        question: "Wat als mijn geheugen gaten heeft?",
        answer: "Dat is normaal. We vullen hiaten aan met contextvragen.",
      },
    ]);
  });

  it("herkent een vetgedrukte vraag met het antwoord in een eigen alinea", () => {
    const html = `
      <h2>Veelgestelde vragen over familiearchief aanleggen</h2>
      <p><strong>Hoe organiseer ik oude fotoalbums?</strong></p>
      <p>Begin met het fotograferen van de album-pagina's met je telefoon.</p>
      <p><strong>Wat is de beste scanresolutie?</strong></p>
      <p>Voor standaard documenten is 300 DPI de ideale balans.</p>
    `;
    expect(extractFaqFromHtml(html).map((f) => f.question)).toEqual([
      "Hoe organiseer ik oude fotoalbums?",
      "Wat is de beste scanresolutie?",
    ]);
  });

  it("levert elke vraag hoogstens één keer, ook als patronen overlappen", () => {
    const html = `
      <h2>Veelgestelde vragen</h2>
      <p><strong>Overlappende vraag?</strong></p>
      <p>Het antwoord.</p>
      <p>Nog een alinea.</p>
    `;
    const faqs = extractFaqFromHtml(html);
    expect(faqs).toHaveLength(1);
    expect(faqs[0].answer).toBe("Het antwoord.");
  });

  it("matcht een kop met onderwerp erachter", () => {
    const html = `
      <h2>Veelgestelde vragen over levensverhaal vastleggen</h2>
      <p><strong>Moet je een interessant leven gehad hebben?</strong><br>Nee.</p>
    `;
    expect(extractFaqFromHtml(html)).toHaveLength(1);
  });

  it("stopt bij de volgende h2", () => {
    const html = `
      <h2>Veelgestelde vragen over het bewaren van herinneringen</h2>
      <h3>Waarom vervagen herinneringen?</h3>
      <p>Door reconsolidatie.</p>
      <h2>Bewaar je herinneringen</h2>
      <h3>Niet meenemen?</h3>
      <p>Deze staat buiten de FAQ-sectie.</p>
    `;
    const faqs = extractFaqFromHtml(html);
    expect(faqs).toHaveLength(1);
    expect(faqs[0].question).toBe("Waarom vervagen herinneringen?");
  });

  it("slaat vetgedrukte tussenkopjes zonder vraagteken over", () => {
    const html = `
      <h2>Veelgestelde vragen</h2>
      <p><strong>Extra opties:</strong><br>Aanvullende gesprekken zijn mogelijk.</p>
      <p><strong>Kan ik later aanvullen?</strong><br>Ja, altijd.</p>
    `;
    const faqs = extractFaqFromHtml(html);
    expect(faqs).toHaveLength(1);
    expect(faqs[0].question).toBe("Kan ik later aanvullen?");
  });

  it("behoudt documentvolgorde als beide patronen gemengd voorkomen", () => {
    const html = `
      <h2>Veelgestelde vragen</h2>
      <p><strong>Eerste vraag?</strong><br>Eerste antwoord.</p>
      <h3>Tweede vraag?</h3>
      <p>Tweede antwoord.</p>
    `;
    expect(extractFaqFromHtml(html).map((f) => f.question)).toEqual([
      "Eerste vraag?",
      "Tweede vraag?",
    ]);
  });

  it("geeft niets terug zonder FAQ-kop of zonder content", () => {
    expect(extractFaqFromHtml("")).toEqual([]);
    expect(extractFaqFromHtml("<h2>Conclusie</h2><h3>Vraag?</h3><p>Antwoord.</p>")).toEqual([]);
  });

  it("stript inline opmaak en entities uit vraag en antwoord", () => {
    const html = `
      <h2>Veelgestelde vragen</h2>
      <p><strong>Hoe gaat dat met <em>privacy</em>?</strong><br>Jij &amp; jij alleen bepaalt dat.</p>
    `;
    expect(extractFaqFromHtml(html)[0]).toEqual({
      question: "Hoe gaat dat met privacy ?",
      answer: "Jij & jij alleen bepaalt dat.",
    });
  });
});

describe("buildFaqPageJsonLd", () => {
  it("geeft null bij een lege lijst", () => {
    expect(buildFaqPageJsonLd([])).toBeNull();
  });

  it("bouwt geldige FAQPage-structured-data", () => {
    const ld = buildFaqPageJsonLd([{ question: "Werkt het?", answer: "Ja." }]) as {
      "@type": string;
      mainEntity: { "@type": string; name: string; acceptedAnswer: { text: string } }[];
    };
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity[0].name).toBe("Werkt het?");
    expect(ld.mainEntity[0].acceptedAnswer.text).toBe("Ja.");
  });
});
