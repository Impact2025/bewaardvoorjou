import { describe, it, expect } from "vitest";
import { articleTitle, normalizeArticleHtml } from "@/lib/seo/article-html";

describe("normalizeArticleHtml", () => {
  it("haalt een titel-H1 aan het begin weg", () => {
    const html = '\n<h1 class="x">Titel</h1>\n<p>Tekst</p>';
    expect(normalizeArticleHtml(html)).toBe("<p>Tekst</p>");
  });

  it("maakt een H1 verderop in de tekst een H2", () => {
    const html = "<p>Intro</p><h1>Kop</h1><p>Meer</p>";
    expect(normalizeArticleHtml(html)).toBe("<p>Intro</p><h2>Kop</h2><p>Meer</p>");
  });

  it("laat HTML zonder H1 ongemoeid", () => {
    const html = "<h2>Kop</h2><p>Tekst</p>";
    expect(normalizeArticleHtml(html)).toBe(html);
  });

  it("verdraagt lege content", () => {
    expect(normalizeArticleHtml("")).toBe("");
  });
});

describe("articleTitle", () => {
  it("geeft een title met merknaam absoluut door", () => {
    expect(articleTitle("Memoires schrijven | BewaardVoorJou.nl")).toEqual({
      absolute: "Memoires schrijven | BewaardVoorJou.nl",
    });
  });

  it("laat een title zonder merknaam over aan de layout-template", () => {
    expect(articleTitle("25 vragen voor je ouders")).toBe("25 vragen voor je ouders");
  });
});
