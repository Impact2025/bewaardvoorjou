/**
 * Artikel-HTML uit de CMS bevat vaak zelf nog een <h1> met de titel, terwijl
 * de blog-/kennisbanktemplate de titel al als <h1> rendert. Dat gaf twee
 * H1's per pagina. Een H1 helemaal aan het begin is de dubbele titel en
 * valt weg; een H1 verderop in de tekst wordt een H2.
 */
export function normalizeArticleHtml(html: string): string {
  if (!html) return html;
  const withoutLeadingTitle = html.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, "");
  return withoutLeadingTitle
    .replace(/<h1\b/gi, "<h2")
    .replace(/<\/h1>/gi, "</h2>");
}

/**
 * De root-layout zet "| Bewaard voor jou" achter elke title. Bevat een
 * meta_title uit de CMS de merknaam al ("… | BewaardVoorJou.nl"), dan
 * kwam die er twee keer in. In dat geval de title absoluut doorgeven.
 */
export function articleTitle(title: string): string | { absolute: string } {
  return /bewaard\s*voor\s*jou/i.test(title) ? { absolute: title } : title;
}
