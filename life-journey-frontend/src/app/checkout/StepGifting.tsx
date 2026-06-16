"use client";

import { type CheckoutState } from "./CheckoutContent";
import { type GiftReveal } from "@/lib/api/orders";

interface Props {
  state: CheckoutState;
  onChange: (updates: Partial<CheckoutState>) => void;
  onNext: () => void;
}

export default function StepGifting({ state, onChange, onNext }: Props) {
  const name = state.recipientName.trim() || "hen";
  const today = new Date().toISOString().slice(0, 10);

  const setReveal = (reveal: GiftReveal) => onChange({ giftReveal: reveal });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-1">Hoe wil je het geven?</h2>
        <p className="text-[#888] text-sm">Een paar laatste keuzes, dan ben je klaar.</p>
      </div>

      {/* Verrassing of aangekondigd */}
      <div className="bg-white rounded-xl border border-[#e5e0d8] p-5 space-y-3">
        <h3 className="font-medium text-[#1a1a1a]">Verrassing of vooraf vertellen?</h3>
        {([
          {
            value: "SURPRISE" as GiftReveal,
            title: "Verrassing",
            desc: `De doos komt onaangekondigd aan. Op de buitenkant staat duidelijk "Een cadeau van jou", zodat ${name} nooit schrikt van een onverwacht pakket.`,
          },
          {
            value: "ANNOUNCED" as GiftReveal,
            title: "Ik vertel het zelf eerst",
            desc: `Fijn als je niet wilt dat ${name} schrikt van een onverwacht pakket.`,
          },
        ]).map((opt) => (
          <label
            key={opt.value}
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              state.giftReveal === opt.value
                ? "border-[#d4af37] bg-[#d4af37]/10"
                : "border-[#e5e0d8] hover:border-[#d4af37]/50"
            }`}
          >
            <input
              type="radio"
              name="reveal"
              checked={state.giftReveal === opt.value}
              onChange={() => setReveal(opt.value)}
              className="mt-1 accent-[#d4af37]"
            />
            <div>
              <p className="text-sm font-medium text-[#1a1a1a]">{opt.title}</p>
              <p className="text-xs text-[#888] mt-0.5 leading-relaxed">{opt.desc}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Bezorgmoment */}
      <div className="bg-white rounded-xl border border-[#e5e0d8] p-5 space-y-3">
        <h3 className="font-medium text-[#1a1a1a]">Wanneer mag het bezorgd worden?</h3>
        <p className="text-xs text-[#888]">
          Kies een dag. We zorgen dat het cadeau op tijd aankomt. Laat leeg om zo snel mogelijk te
          versturen.
        </p>
        <input
          type="date"
          min={today}
          value={state.deliveryDate}
          onChange={(e) => onChange({ deliveryDate: e.target.value })}
          className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
        />
        {state.deliveryDate && (
          <button
            type="button"
            onClick={() => onChange({ deliveryDate: "" })}
            className="text-xs text-[#888] hover:text-[#1a1a1a] underline"
          >
            Zo snel mogelijk versturen
          </button>
        )}
      </div>

      <button
        onClick={onNext}
        className="w-full bg-[#d4af37] hover:bg-[#c49e2a] text-[#1a1a1a] font-bold py-4 rounded-xl transition-colors text-lg"
      >
        Volgende: Betalen →
      </button>
    </div>
  );
}
