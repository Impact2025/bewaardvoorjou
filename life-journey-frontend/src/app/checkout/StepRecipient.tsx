"use client";

import { type CheckoutState } from "./CheckoutContent";
import { type ShippingAddress, type RecipientRelation } from "@/lib/api/orders";
import { useBabyTheme } from "@/components/baby/BabyThemeContext";

interface Props {
  state: CheckoutState;
  onChange: (updates: Partial<CheckoutState>) => void;
  onNext: () => void;
}

const RELATIONS: { value: RecipientRelation; label: string }[] = [
  { value: "vader", label: "Mijn vader" },
  { value: "moeder", label: "Mijn moeder" },
  { value: "opa", label: "Mijn opa" },
  { value: "oma", label: "Mijn oma" },
  { value: "schoonouder", label: "Schoonouder" },
  { value: "partner", label: "Mijn partner" },
  { value: "anders", label: "Iemand anders" },
];

// Baby-specifieke relaties: context van een kraamcadeau aan nieuwe ouder(s)
const BABY_RELATIONS: { value: RecipientRelation; label: string }[] = [
  { value: "moeder", label: "Aanstaande mama" },
  { value: "vader", label: "Aanstaande papa" },
  { value: "partner", label: "Partner" },
  { value: "zus", label: "Zus" },
  { value: "broer", label: "Broer" },
  { value: "vriendin", label: "Vriendin" },
  { value: "vriend", label: "Vriend" },
  { value: "collega", label: "Collega" },
  { value: "anders", label: "Iemand anders" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIGITAL_PACKAGES = new Set(["VERHAAL", "DIGITAAL", "BABY_GIFT"]);

export default function StepRecipient({ state, onChange, onNext }: Props) {
  const { t } = useBabyTheme();
  const isDigital = DIGITAL_PACKAGES.has(state.packageType);
  const isBaby = state.packageType === "BABY_GIFT";
  const addr = state.shippingAddress;

  const activeBtn = isBaby ? `${t.primary} text-white` : "bg-[#d4af37] text-[#1a1a1a]";
  const selectedOption = isBaby ? `${t.selectedBorder} text-gray-900 font-medium` : "border-[#d4af37] bg-[#d4af37]/10 text-[#1a1a1a] font-medium";
  const hoverOption = isBaby ? `border-[#e5e0d8] text-[#666] ${t.hoverBorder}` : "border-[#e5e0d8] text-[#666] hover:border-[#d4af37]/50";
  const ring = isBaby ? `focus:ring-2 ${t.inputRing}` : "focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50";
  const ctaBtn = isBaby ? `${t.primary} ${t.primaryHover} text-white` : "bg-[#d4af37] hover:bg-[#c49e2a] text-[#1a1a1a]";
  const name = state.recipientName.trim() || "hen";
  const activeRelations = isBaby ? BABY_RELATIONS : RELATIONS;

  const updateAddr = (field: keyof ShippingAddress, value: string) => {
    onChange({ shippingAddress: { ...addr, [field]: value } });
  };

  const addressFilled =
    addr.full_name.length >= 2 &&
    addr.street.length >= 2 &&
    addr.house_number.length >= 1 &&
    addr.postal_code.length >= 4 &&
    addr.city.length >= 2;

  const emailValid = EMAIL_RE.test(state.guestEmail);
  const recipientEmailValid = !state.recipientEmail || EMAIL_RE.test(state.recipientEmail);

  const giftValid =
    state.recipientName.trim().length >= 2 &&
    state.recipientRelation !== "" &&
    recipientEmailValid &&
    (state.skipShipping || addressFilled);

  const isValid = emailValid && (state.forSelf || giftValid);

  const handleForSelfToggle = (forSelf: boolean) => {
    onChange({
      forSelf,
      recipientEmail: forSelf ? "" : state.recipientEmail,
      recipientName: forSelf ? "" : state.recipientName,
      recipientRelation: forSelf ? "" : state.recipientRelation,
      personalMessage: forSelf ? "" : state.personalMessage,
      cardMessage: forSelf ? "" : state.cardMessage,
      messageMediaType: forSelf ? "text" : state.messageMediaType,
      messageMediaUrl: forSelf ? "" : state.messageMediaUrl,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-1">
          {state.forSelf
            ? "Jouw bestelling"
            : isBaby
            ? "Voor welke ouder(s) is dit cadeau?"
            : "Voor wie is dit cadeau?"}
        </h2>
        <p className="text-[#888] text-sm">
          {state.forSelf
            ? "Je toegangslink wordt naar jouw e-mailadres gestuurd."
            : isBaby
            ? "De naam van de ouder(s) komt op de cadeaubon te staan."
            : "Vertel ons voor wie het verhaal is. Zijn of haar naam komt op het cadeau te staan."}
        </p>
      </div>

      {/* Voor wie toggle */}
      <div className="bg-white rounded-xl border border-[#e5e0d8] p-1 flex gap-1">
        <button
          type="button"
          onClick={() => handleForSelfToggle(false)}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
            !state.forSelf ? activeBtn : "text-[#888] hover:text-[#1a1a1a]"
          }`}
        >
          🎁 Voor iemand anders
        </button>
        <button
          type="button"
          onClick={() => handleForSelfToggle(true)}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
            state.forSelf ? activeBtn : "text-[#888] hover:text-[#1a1a1a]"
          }`}
        >
          👤 Voor mezelf
        </button>
      </div>

      {state.forSelf ? (
        <div className="bg-white rounded-xl border border-[#e5e0d8] p-5">
          <h3 className="font-medium text-[#1a1a1a] mb-1">Jouw gegevens</h3>
          <p className="text-xs text-[#888]">Je toegangslink wordt naar jouw e-mailadres gestuurd.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#e5e0d8] p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#555] mb-1">
              {isBaby ? "Naam van de ouder(s)" : "Voornaam ontvanger"}{" "}
              <span className="text-[#e04040]">*</span>
              <span className="text-[#888] font-normal"> — komt op het cadeau</span>
            </label>
            <input
              type="text"
              placeholder={isBaby ? "bijv. Sara & Tom, of alleen Sara" : "bijv. Jan, Els, Opa"}
              value={state.recipientName}
              onChange={(e) => onChange({ recipientName: e.target.value })}
              maxLength={100}
              className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#555] mb-1">
              {isBaby ? "Wat zijn ze van jou?" : "Wat is hij of zij van jou?"}{" "}
              <span className="text-[#e04040]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activeRelations.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => onChange({ recipientRelation: r.value })}
                  className={`py-2 px-3 rounded-lg text-sm border transition-colors ${
                    state.recipientRelation === r.value ? selectedOption : hoverOption
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#555] mb-1">
              E-mail of telefoon van {name} <span className="text-[#888] font-normal">(optioneel)</span>
            </label>
            <input
              type="email"
              placeholder={`${name.toLowerCase()}@email.nl`}
              value={state.recipientEmail}
              onChange={(e) => onChange({ recipientEmail: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 ${
                state.recipientEmail && !recipientEmailValid ? "border-red-300 bg-red-50" : "border-[#e5e0d8]"
              }`}
            />
            <p className="text-xs text-[#888] mt-1">
              Hiermee kunnen we {name} een vriendelijk zetje geven om te starten.
              {isDigital
                ? " Geen contactgegevens? Geen probleem — je ontvangt na betaling een cadeaubon om te overhandigen."
                : " Geen contactgegevens? Geen probleem — de doos bevat een eigen startkaart."}
            </p>
          </div>
        </div>
      )}

      {/* Bezorgadres — alleen bij fysieke pakketten (niet bij digitaal/Verhaal) */}
      {!state.forSelf && !isDigital && (
        <div className="bg-white rounded-xl border border-[#e5e0d8] overflow-hidden">
          <button
            type="button"
            onClick={() => onChange({ skipShipping: !state.skipShipping })}
            className="w-full flex items-center justify-between p-5 hover:bg-[#faf9f7] transition-colors"
          >
            <div className="text-left">
              <p className="font-medium text-[#1a1a1a] text-sm">Bezorgadres</p>
              <p className="text-xs text-[#888] mt-0.5">
                {state.skipShipping
                  ? "Adres later invullen — we sturen je een herinnering"
                  : "Vul in zodat het cadeau op tijd aankomt"}
              </p>
            </div>
            <span className="text-xs font-medium text-[#d4af37] ml-4 flex-shrink-0">
              {state.skipShipping ? "Toevoegen ▾" : "Overslaan ▸"}
            </span>
          </button>

          {!state.skipShipping && (
            <div className="px-5 pb-5 space-y-4 border-t border-[#f0ece6]">
              {/* Bezorgen naar ontvanger of naar koper zelf */}
              <div>
                <p className="text-xs font-medium text-[#555] mb-2">Bezorgen naar</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onChange({ deliverToSelf: false })}
                    className={`py-2.5 px-3 rounded-lg text-xs border transition-colors text-left ${
                      !state.deliverToSelf
                        ? "border-[#d4af37] bg-[#d4af37]/10 text-[#1a1a1a] font-medium"
                        : "border-[#e5e0d8] text-[#666] hover:border-[#d4af37]/50"
                    }`}
                  >
                    <span className="block font-medium">{name === "hen" ? "De ontvanger" : name}</span>
                    <span className="text-[#888] font-normal">Cadeau wordt bezorgd bij {name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ deliverToSelf: true })}
                    className={`py-2.5 px-3 rounded-lg text-xs border transition-colors text-left ${
                      state.deliverToSelf
                        ? "border-[#d4af37] bg-[#d4af37]/10 text-[#1a1a1a] font-medium"
                        : "border-[#e5e0d8] text-[#666] hover:border-[#d4af37]/50"
                    }`}
                  >
                    <span className="block font-medium">Mijn eigen adres</span>
                    <span className="text-[#888] font-normal">Ik geef het zelf aan {name}</span>
                  </button>
                </div>
                {state.deliverToSelf && (
                  <p className="text-xs text-[#d4af37] mt-2 bg-[#d4af37]/5 rounded-lg px-3 py-2">
                    Vul hieronder jouw eigen adres in — de doos wordt bij jou thuis bezorgd.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#555] mb-1">
                  {state.deliverToSelf ? "Jouw volledige naam *" : "Volledige naam ontvanger *"}
                </label>
                <input
                  type="text"
                  placeholder={state.deliverToSelf ? "Jouw voor- en achternaam" : "Voor- en achternaam"}
                  value={addr.full_name}
                  onChange={(e) => updateAddr("full_name", e.target.value)}
                  className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
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
                    className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#555] mb-1">Huisnr. *</label>
                  <input
                    type="text"
                    placeholder="12A"
                    value={addr.house_number}
                    onChange={(e) => updateAddr("house_number", e.target.value)}
                    className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
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
                    className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#555] mb-1">Stad *</label>
                  <input
                    type="text"
                    placeholder="Amsterdam"
                    value={addr.city}
                    onChange={(e) => updateAddr("city", e.target.value)}
                    className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#555] mb-1">Land</label>
                <select
                  value={addr.country}
                  onChange={(e) => updateAddr("country", e.target.value)}
                  className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                >
                  <option value="NL">Nederland</option>
                  <option value="BE">België</option>
                  <option value="DE">Duitsland</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Jouw e-mailadres (koper) */}
      <div className="bg-white rounded-xl border border-[#e5e0d8] p-5">
        <h3 className="font-medium text-[#1a1a1a] mb-3">Jouw e-mailadres</h3>
        <p className="text-xs text-[#888] mb-3">
          {state.forSelf
            ? "Hier sturen we je toegangslink en bestelbevestiging naartoe."
            : "Hier sturen we de bestelbevestiging en de startkaart naartoe."}
        </p>
        <input
          type="email"
          placeholder="jij@email.nl"
          value={state.guestEmail}
          onChange={(e) => onChange({ guestEmail: e.target.value })}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 ${
            state.guestEmail && !emailValid ? "border-red-300 bg-red-50" : "border-[#e5e0d8]"
          }`}
        />
        {state.guestEmail && !emailValid && (
          <p className="text-xs text-red-500 mt-1">Vul een geldig e-mailadres in</p>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className={`w-full ${ctaBtn} disabled:bg-[#e5e0d8] disabled:text-[#aaa] disabled:cursor-not-allowed font-bold py-4 rounded-xl transition-colors text-lg`}
      >
        {state.forSelf ? "Volgende: Betalen →" : "Volgende: Jouw boodschap →"}
      </button>
    </div>
  );
}
