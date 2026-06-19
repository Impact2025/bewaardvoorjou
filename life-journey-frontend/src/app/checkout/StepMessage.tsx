"use client";

import { type CheckoutState } from "./CheckoutContent";
import GiftMessageRecorder from "./GiftMessageRecorder";

interface Props {
  state: CheckoutState;
  onChange: (updates: Partial<CheckoutState>) => void;
  onNext: () => void;
}

export default function StepMessage({ state, onChange, onNext }: Props) {
  const name = state.recipientName.trim() || "hen";
  const isBaby = state.packageType === "BABY_GIFT";

  const hasMessage =
    state.messageMediaType === "text"
      ? state.personalMessage.trim().length > 0
      : !!state.messageMediaUrl;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-1">Jouw boodschap</h2>
        <p className="text-[#888] text-sm">Dit is het hart van het cadeau — voor {name}.</p>
      </div>

      {/* Op de kaart / cadeaubon */}
      <div className="bg-white rounded-xl border border-[#e5e0d8] p-5 space-y-3">
        <div>
          <h3 className="font-medium text-[#1a1a1a]">
            {isBaby ? "Een paar woorden voor op de cadeaubon" : "Een paar woorden voor op de kaart"}
          </h3>
          <p className="text-xs text-[#888] mt-1 leading-relaxed">
            {isBaby
              ? `Dit is het eerste dat ${name} leest als ze de cadeaubon openen. Hou het warm en persoonlijk — vertel waarom je dit cadeau geeft.`
              : `Dit is het eerste dat ${name} leest bij het openen. Hou het kort en persoonlijk — een reden, een herinnering, of gewoon “ik hou van je”.`}
          </p>
        </div>
        <textarea
          placeholder={
            isBaby
              ? `Lieve ${name}, jullie nieuwe avontuur begint nu. Dit cadeau is er zodat elk moment bewaard blijft…`
              : `Voor ${name}, ik geef je dit omdat…`
          }
          value={state.cardMessage}
          onChange={(e) => onChange({ cardMessage: e.target.value })}
          maxLength={280}
          rows={3}
          className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 resize-none"
        />
        <p className="text-xs text-[#aaa]">{state.cardMessage.length}/280 · richtlengte ± 40 woorden</p>
      </div>

      {/* 3b. Een persoonlijk bericht (digitaal — ontgrendelt bij eerste start) */}
      <GiftMessageRecorder
        recipientName={state.recipientName}
        messageMediaType={state.messageMediaType}
        messageMediaUrl={state.messageMediaUrl}
        personalMessage={state.personalMessage}
        onChange={onChange}
      />

      {hasMessage && (
        <div className="bg-[#f0f7eb] border border-[#2d5016]/20 rounded-xl p-4">
          <p className="text-sm text-[#2d5016]">
            Mooi. Dit bewaren we tot {name} voor het eerst begint — dan is dit het eerste wat hij of
            zij ziet.
          </p>
        </div>
      )}

      {/* Betaling nooit blokkeren op een bericht — overslaan mag altijd */}
      <button
        onClick={onNext}
        className="w-full bg-[#d4af37] hover:bg-[#c49e2a] text-[#1a1a1a] font-bold py-4 rounded-xl transition-colors text-lg"
      >
        Volgende: Hoe wil je het geven? →
      </button>
      {!hasMessage && (
        <button
          onClick={onNext}
          className="w-full text-sm text-[#888] hover:text-[#1a1a1a] underline underline-offset-2 transition-colors -mt-3"
        >
          Sla over — ik voeg later een bericht toe
        </button>
      )}
    </div>
  );
}
