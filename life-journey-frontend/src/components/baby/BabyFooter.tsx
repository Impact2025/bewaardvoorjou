"use client";

import Link from "next/link";
import { useBabyTheme } from "./BabyThemeContext";

export function BabyFooter() {
  const { t } = useBabyTheme();

  return (
    <footer className="border-t border-gray-100 bg-white py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-2xl">👶</span>
              <span className="font-bold text-gray-900">Bewaard voor Baby</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Het digitale babyboek dat generaties meegaat. Wekelijkse vragen,
              mijlpalen bijhouden en een gedrukt fotoboek na een jaar.
            </p>
            <p className="mt-3 text-xs text-gray-400">
              Een product van{" "}
              <Link href="/" className={`${t.primaryText} hover:underline`}>
                BewaardVoorJou.nl
              </Link>
            </p>
          </div>

          {/* Baby product links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Dit product</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/voor-baby#features" className={`hover:${t.primaryText} transition-colors`}>
                  Hoe werkt het
                </Link>
              </li>
              <li>
                <Link href="/voor-baby#tijdlijn" className={`hover:${t.primaryText} transition-colors`}>
                  Het eerste jaar
                </Link>
              </li>
              <li>
                <Link href="/voor-baby#prijs" className={`hover:${t.primaryText} transition-colors`}>
                  Prijs & inhoud
                </Link>
              </li>
              <li>
                <Link href="/checkout?package=BABY_GIFT" className={`hover:${t.primaryText} transition-colors`}>
                  Geef als kraamcadeau
                </Link>
              </li>
              <li>
                <Link href="/checkout?package=BABY_GIFT&for_self=true" className={`hover:${t.primaryText} transition-colors`}>
                  Koop voor jezelf
                </Link>
              </li>
            </ul>
          </div>

          {/* Hulp & info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Hulp & info</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/faq" className={`hover:${t.primaryText} transition-colors`}>
                  Veelgestelde vragen
                </Link>
              </li>
              <li>
                <Link href="/about" className={`hover:${t.primaryText} transition-colors`}>
                  Over ons
                </Link>
              </li>
              <li>
                <Link href="/contact" className={`hover:${t.primaryText} transition-colors`}>
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={`hover:${t.primaryText} transition-colors`}>
                  Privacybeleid
                </Link>
              </li>
              <li>
                <Link href="/terms" className={`hover:${t.primaryText} transition-colors`}>
                  Algemene voorwaarden
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} BewaardVoorJou.nl &mdash; Bewaard voor Baby. Met liefde gemaakt in Nederland.</p>
          <Link href="/" className="hover:text-gray-600 transition-colors">
            Terug naar BewaardVoorJou.nl &rarr;
          </Link>
        </div>
      </div>
    </footer>
  );
}
