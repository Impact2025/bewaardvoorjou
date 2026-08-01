import Link from "next/link";
import { BABY_KB_GROUPS } from "@/lib/baby-kb-links";

interface BabyKennisbankLinksProps {
  /** Kop boven het blok. */
  title?: string;
  /** Optionele intro-zin onder de kop. */
  intro?: string;
  /** Achtergrond van de sectie — verschilt per landingspagina. */
  className?: string;
}

/**
 * Interne-linkblok naar de kennisbankartikelen over het eerste jaar.
 *
 * Staat op /voor-baby en /baby-herinneringen-vastleggen. Reden: de
 * baby-artikelen kregen tot nu toe nauwelijks contextuele interne links,
 * waardoor Google ze wel kende via de sitemap maar niet indexeerde.
 */
export function BabyKennisbankLinks({
  title = "Lees meer over het eerste jaar",
  intro,
  className = "bg-gradient-to-br from-cream via-white to-warm-sand/20",
}: BabyKennisbankLinksProps) {
  return (
    <section className={`py-16 px-4 sm:px-6 ${className}`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-2 text-center">
          {title}
        </h2>
        {intro && (
          <p className="text-slate-600 text-center mb-10 max-w-2xl mx-auto leading-relaxed">
            {intro}
          </p>
        )}

        <div className={intro ? "space-y-10" : "space-y-10 mt-8"}>
          {BABY_KB_GROUPS.map((group) => (
            <div key={group.heading}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">
                {group.heading}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {group.links.map((link) => (
                  <Link
                    key={link.slug}
                    href={`/kennisbank/${link.slug}`}
                    className="bg-white rounded-xl p-5 border-2 border-neutral-sand hover:border-orange/30 hover:shadow-md transition-all group"
                  >
                    <h4 className="font-serif font-semibold text-slate-900 mb-1 group-hover:text-orange transition-colors">
                      {link.title}
                    </h4>
                    <p className="text-sm text-slate-600">{link.blurb}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center mt-10">
          <Link
            href="/kennisbank"
            className="text-orange font-medium hover:underline"
          >
            Bekijk de hele kennisbank
          </Link>
        </p>
      </div>
    </section>
  );
}
