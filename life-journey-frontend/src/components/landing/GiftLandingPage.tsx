import type { ReactNode } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/button";
import { GiftOffer } from "@/components/gift/GiftOffer";
import {
  FaqSection,
  InShort,
  RelatedLinks,
  breadcrumbJsonLd,
  faqJsonLd,
  type Faq,
  type RelatedLink,
} from "@/components/landing/LandingBlocks";
import {
  buildProductJsonLd,
  giftCheckoutPath,
  giftPackage,
  priceLabel,
} from "@/lib/pricing";
import { ArrowRight, CheckCircle } from "lucide-react";

export interface GiftLandingConfig {
  pageUrl: string;
  /** Titel voor structured data en deelkaart. */
  title: string;
  description: string;
  breadcrumbName: string;
  productName: string;
  productDescription: string;
  /** Hero: gewone tekst + oranje deel. */
  h1Plain: string;
  h1Accent: string;
  lead: string;
  ctaLabel: string;
  /** Aanspreekvorm in het aanbodblok ("moeder", "vader"). */
  recipient: string;
  inShort: ReactNode;
  reasonsTitle: string;
  reasons: { icon: ReactNode; title: string; desc: string }[];
  themesTitle: string;
  themesIntro: string;
  themes: string[];
  /** Alinea's voor het blok per leeftijd of situatie. */
  ageTitle: string;
  ageBlocks: { label: string; text: string }[];
  offerTitle: string;
  faqs: Faq[];
  faqIntro: string;
  related: RelatedLink[];
}

/** Bouwt het JSON-LD-blok; los exporteerbaar zodat de pagina het in zijn <script> kan zetten. */
export function giftLandingJsonLd(c: GiftLandingConfig, ogImage: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: c.title,
        description: c.description,
        url: c.pageUrl,
        breadcrumb: breadcrumbJsonLd(c.breadcrumbName, c.pageUrl),
      },
      buildProductJsonLd({
        name: c.productName,
        description: c.productDescription,
        url: c.pageUrl,
        image: ogImage,
        offers: [{ code: giftPackage(), gift: true }],
      }),
      faqJsonLd(c.faqs),
    ],
  };
}

/**
 * Gedeelde opbouw voor cadeau-landingspagina's. De tekst is per pagina uniek
 * (geen invulsjabloon); alleen de opmaak en de voorraadlogica zijn gedeeld.
 */
export function GiftLandingPage({ config: c, ogImage }: { config: GiftLandingConfig; ogImage: string }) {
  const code = giftPackage();
  return (
    <div className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(giftLandingJsonLd(c, ogImage)) }}
      />
      <PublicHeader />

      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 md:py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight mb-6">
            {c.h1Plain} <span className="text-orange">{c.h1Accent}</span>
          </h1>
          <p className="text-xl text-white/90 leading-relaxed mb-10 max-w-2xl">{c.lead}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              className="bg-orange hover:bg-orange/90 text-white text-lg px-10 py-7 rounded-xl font-semibold"
            >
              <Link href={giftCheckoutPath(code)} className="inline-flex items-center">
                {c.ctaLabel} — {priceLabel(code)} <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
            <Button
              asChild
              className="bg-white/10 hover:bg-white/20 text-white text-lg px-10 py-7 rounded-xl border-2 border-white/40"
            >
              <Link href="/register">Eerst gratis proberen</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-6 mt-10 text-sm text-white/90">
            {["Inspreken, video of typen", "Datum van de uitnodiging kies je zelf", "14 dagen bedenktijd"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <InShort>{c.inShort}</InShort>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-12 text-center">
            {c.reasonsTitle}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {c.reasons.map((r) => (
              <div key={r.title} className="bg-cream rounded-2xl p-7 text-center border border-neutral-sand">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 mb-5">
                  {r.icon}
                </div>
                <h3 className="text-lg font-serif font-semibold text-slate-900 mb-2">{r.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-6">{c.themesTitle}</h2>
          <p className="text-lg text-slate-700 leading-relaxed mb-8">{c.themesIntro}</p>
          <ul className="space-y-3">
            {c.themes.map((t) => (
              <li key={t} className="flex items-start gap-3 text-lg text-slate-800">
                <CheckCircle className="h-5 w-5 text-orange flex-shrink-0 mt-1" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto space-y-5 text-lg text-slate-700 leading-relaxed">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900">{c.ageTitle}</h2>
          {c.ageBlocks.map((b) => (
            <p key={b.label}>
              <strong className="text-slate-900">{b.label}</strong> {b.text}
            </p>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-10 text-center">
            {c.offerTitle}
          </h2>
          <GiftOffer recipient={c.recipient} />
        </div>
      </section>

      <FaqSection faqs={c.faqs} intro={c.faqIntro} />
      <RelatedLinks links={c.related} />
      <PublicFooter />
    </div>
  );
}
