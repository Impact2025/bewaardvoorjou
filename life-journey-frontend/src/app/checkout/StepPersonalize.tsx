"use client";

import { type CheckoutState } from "./CheckoutContent";
import { type ShippingAddress } from "@/lib/api/orders";

interface Props {
  state: CheckoutState;
  onChange: (updates: Partial<CheckoutState>) => void;
  onNext: () => void;
}

export default function StepPersonalize({ state, onChange, onNext }: Props) {
  const addr = state.shippingAddress;

  const updateAddr = (field: keyof ShippingAddress, value: string) => {
    onChange({ shippingAddress: { ...addr, [field]: value } });
  };

  const addressFilled =
    addr.full_name.length >= 2 &&
    addr.street.length >= 2 &&
    addr.house_number.length >= 1 &&
    addr.postal_code.length >= 4 &&
    addr.city.length >= 2;

  const isValid = state.skipShipping ? true : addressFilled;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-1">Personaliseer je cadeau</h2>
        <p className="text-[#888] text-sm">Voor wie is dit? En hoe bereiken we hen?</p>
      </div>

      {/* Vaderdag digitale start notice */}
      <div className="bg-[#d4af37]/10 border border-[#d4af37]/40 rounded-xl p-4">
        <p className="text-sm font-semibold text-[#1a1a1a] mb-1">🎁 Digitale start voor Vaderdag</p>
        <p className="text-xs text-[#555] leading-relaxed">
          Je cadeau is direct bruikbaar — de ontvanger krijgt een persoonlijke link per e-mail.
          De fysieke doos wordt verstuurd zodra de voorraad beschikbaar is (september).
        </p>
      </div>

      {/* Ontvanger */}
      <div className="bg-white rounded-xl border border-[#e5e0d8] p-5 space-y-4">
        <h3 className="font-medium text-[#1a1a1a]">Over het cadeau</h3>

        <div>
          <label className="block text-sm font-medium text-[#555] mb-1">
            Voor wie is dit? <span className="text-[#888] font-normal">(optioneel)</span>
          </label>
          <input
            type="text"
            placeholder="bijv. Opa Jan, Papa, Oma Els"
            value={state.recipientName}
            onChange={(e) => onChange({ recipientName: e.target.value })}
            maxLength={100}
            className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#555] mb-1">
            E-mailadres van de ontvanger
            <span className="text-[#d4af37] font-normal ml-1">— stuur toegang direct door</span>
          </label>
          <input
            type="email"
            placeholder="papa@email.nl"
            value={state.recipientEmail}
            onChange={(e) => onChange({ recipientEmail: e.target.value })}
            className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
          />
          <p className="text-xs text-[#888] mt-1">
            De ontvanger krijgt een persoonlijke welkomstlink zodra de betaling is afgerond.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#555] mb-1">
            Persoonlijke boodschap <span className="text-[#888] font-normal">(optioneel)</span>
          </label>
          <textarea
            placeholder="bijv. Lieve papa, dit is voor jouw verhalen die wij nooit willen vergeten..."
            value={state.personalMessage}
            onChange={(e) => onChange({ personalMessage: e.target.value })}
            maxLength={500}
            rows={3}
            className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 resize-none"
          />
          <p className="text-xs text-[#aaa] mt-1">{state.personalMessage.length}/500</p>
        </div>
      </div>

      {/* Bezorgadres — optioneel via toggle */}
      <div className="bg-white rounded-xl border border-[#e5e0d8] overflow-hidden">
        <button
          type="button"
          onClick={() => onChange({ skipShipping: !state.skipShipping })}
          className="w-full flex items-center justify-between p-5 hover:bg-[#faf9f7] transition-colors"
        >
          <div className="text-left">
            <p className="font-medium text-[#1a1a1a] text-sm">Bezorgadres voor de doos</p>
            <p className="text-xs text-[#888] mt-0.5">
              {state.skipShipping
                ? "Adres later invullen — we sturen je een herinnering"
                : "Vul in zodat de doos klaarstaat zodra beschikbaar (september)"}
            </p>
          </div>
          <span className="text-xs font-medium text-[#d4af37] ml-4 flex-shrink-0">
            {state.skipShipping ? "Toevoegen ▾" : "Overslaan ▸"}
          </span>
        </button>

        {!state.skipShipping && (
          <div className="px-5 pb-5 space-y-4 border-t border-[#f0ece6]">
            <div>
              <label className="block text-sm font-medium text-[#555] mb-1">Volledige naam *</label>
              <input
                type="text"
                placeholder="Voor- en achternaam"
                value={addr.full_name}
                onChange={(e) => updateAddr("full_name", e.target.value)}
                className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[#555] mb-1">Straatnaam *</label>
                <input
                  type="text"
                  placeholder="Kerkstraat"
                  value={addr.street}
                  onChange={(e) => updateAddr("street", e.target.value)}
                  className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#555] mb-1">Huisnr. *</label>
                <input
                  type="text"
                  placeholder="12A"
                  value={addr.house_number}
                  onChange={(e) => updateAddr("house_number", e.target.value)}
                  className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#555] mb-1">Postcode *</label>
                <input
                  type="text"
                  placeholder="1234 AB"
                  value={addr.postal_code}
                  onChange={(e) => updateAddr("postal_code", e.target.value.toUpperCase())}
                  maxLength={7}
                  className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#555] mb-1">Stad *</label>
                <input
                  type="text"
                  placeholder="Amsterdam"
                  value={addr.city}
                  onChange={(e) => updateAddr("city", e.target.value)}
                  className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#555] mb-1">Land</label>
              <select
                value={addr.country}
                onChange={(e) => updateAddr("country", e.target.value)}
                className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
              >
                <option value="NL">Nederland</option>
                <option value="BE">België</option>
                <option value="DE">Duitsland</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Jouw e-mailadres (koper) */}
      <div className="bg-white rounded-xl border border-[#e5e0d8] p-5">
        <h3 className="font-medium text-[#1a1a1a] mb-3">Jouw e-mailadres</h3>
        <p className="text-xs text-[#888] mb-3">
          Hier sturen we de bestelbevestiging naartoe.
        </p>
        <input
          type="email"
          placeholder="jij@email.nl"
          value={state.guestEmail}
          onChange={(e) => onChange({ guestEmail: e.target.value })}
          className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
        />
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className="w-full bg-[#d4af37] hover:bg-[#c49e2a] disabled:bg-[#e5e0d8] disabled:text-[#aaa] disabled:cursor-not-allowed text-[#1a1a1a] font-bold py-4 rounded-xl transition-colors text-lg"
      >
        Volgende: Betalen →
      </button>
    </div>
  );
}
