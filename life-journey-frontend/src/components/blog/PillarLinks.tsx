import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pickPillarLinks, type PillarLinkInput } from "@/lib/pillar-links";

/**
 * Contextuele links van een artikel naar de bijbehorende landingspagina's.
 * Bewust redactioneel vormgegeven (geen banner): de link moet als vervolg op
 * het artikel lezen, niet als advertentie.
 */
export function PillarLinks({ article }: { article: PillarLinkInput }) {
  const pillars = pickPillarLinks(article);
  if (pillars.length === 0) return null;

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-4">
      <div className="rounded-xl border border-neutral-sand bg-white p-5 sm:p-6">
        <h2 className="font-serif font-semibold text-slate-900 text-lg mb-4">
          Verder op deze site
        </h2>
        <ul className="space-y-3">
          {pillars.map((pillar) => (
            <li key={pillar.href}>
              <Link
                href={pillar.href}
                className="group flex items-start gap-2 text-slate-700 hover:text-orange transition-colors"
              >
                <ArrowRight className="h-4 w-4 mt-1 shrink-0 text-orange" />
                <span>
                  <span className="font-medium underline-offset-2 group-hover:underline">
                    {pillar.label}
                  </span>
                  <span className="block text-sm text-slate-500">
                    {pillar.teaser}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
