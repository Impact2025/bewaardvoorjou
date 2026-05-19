import Link from "next/link";
import Image from "next/image";

export function PublicFooter() {
  return (
    <footer className="border-t border-neutral-sand bg-white py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/Logo_Bewaardvoorjou.png"
                alt="BewaardVoorJou.nl"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <div className="flex flex-col">
                <span className="font-serif font-semibold text-slate-900">BewaardVoorJou.nl</span>
                <span className="text-xs text-slate-600">Vertel het vandaag,<br />bewaar het voor altijd</span>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Product</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/#features" className="hover:text-orange transition-colors">Hoe werkt het</Link></li>
              <li><Link href="/#trust" className="hover:text-orange transition-colors">Veiligheid</Link></li>
              <li><Link href="/register" className="hover:text-orange transition-colors">Gratis starten</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Support</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="mailto:info@bewaardvoorjou.nl" className="hover:text-orange transition-colors">Contact</a></li>
              <li><Link href="/faq" className="hover:text-orange transition-colors">Veelgestelde vragen</Link></li>
              <li><Link href="/about" className="hover:text-orange transition-colors">Over ons</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Juridisch</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/privacy" className="hover:text-orange transition-colors">Privacybeleid</Link></li>
              <li><Link href="/terms" className="hover:text-orange transition-colors">Algemene voorwaarden</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-sand text-center text-sm text-slate-600">
          <p>&copy; {new Date().getFullYear()} BewaardVoorJou.nl. Met liefde gemaakt in Nederland.</p>
        </div>
      </div>
    </footer>
  );
}
