# DPA-actieplan — BewaardVoorJou
**Verwerkersovereenkomsten per verwerker (Art. 28 AVG)**

| | |
|---|---|
| Opgesteld door | WeAreImpact B.V. |
| Datum | 1 juni 2026 |
| Status | In uitvoering |

---

## Prioriteit

| Prioriteit | Verwerker | Reden |
|-----------|-----------|-------|
| 🔴 KRITIEK | OpenRouter / Anthropic | Bijzondere categorieën (stemopnames, emoties) → VS-doorgifte |
| 🔴 KRITIEK | Neon.tech | Alle persoonsgegevens in database → VS-doorgifte |
| 🟠 HOOG | Resend Inc. | E-mailadressen + namen → EU maar DPA ontbreekt |
| 🟡 MIDDEL | Sentry | Foutlogs kunnen PII bevatten → VS-doorgifte |
| 🟢 GEDEKT | Cloudflare R2 | EU-regio, DPA via ToS |
| 🟢 GEDEKT | Stripe Inc. | IE-entiteit, DPA via ToS |

---

## 1. OpenRouter (→ Anthropic + OpenAI Whisper)

**Verwerkte gegevens:** Gedeelten van transcripties, interviewantwoorden, conversatiecontext (bijzondere categorieën)
**Land:** VS
**Doorgifte:** Vereist SCCs 2021 (Standaard Contractuele Clausules)

### Actiestappen

1. **Ga naar:** https://openrouter.ai/privacy → zoek naar "Data Processing Agreement" of "DPA"
2. **Controleer:** Of OpenRouter een AVG-conforme DPA aanbiedt (inclusief SCCs)
3. **Download of accepteer** de DPA via het dashboard of door een verzoek te sturen naar: privacy@openrouter.ai
4. **Controleer dataminimalisatie:** Zorg dat in de API-aanroepen naar Anthropic geen onnodige PII meegaat (namen, e-mails) — gebruik pseudoniemen/UUID's waar mogelijk
5. **Anthropic-beleid:** Anthropic verwerkt data via OpenRouter — controleer of OpenRouter's DPA Anthropic als sub-verwerker dekt. Zo niet: directe DPA met Anthropic via https://privacy.anthropic.com
6. **Vastleggen:** Sla DPA-bevestiging op in `docs/legal/signed-dpas/` met datum

### Aandachtspunten
- OpenRouter bewaart standaard geen prompts (controleer privacy-instellingen account)
- Zet `X-OpenRouter-Data-Training: false` header in API-aanroepen als dit beschikbaar is
- Model: `anthropic/claude-sonnet-4-6` — controleer of Anthropic's commercial API-gebruik geen trainingsdata genereert (Anthropic Commercial Policy stelt van niet, maar documenteer dit)

---

## 2. Neon.tech (PostgreSQL Database)

**Verwerkte gegevens:** Alle persoonsgegevens — accounts, transcripties, emoties, familierelaties
**Land:** VS (met EU-regio optie)
**Doorgifte:** Vereist SCCs als US-regio wordt gebruikt

### Actiestappen

1. **Log in op:** https://console.neon.tech
2. **Ga naar:** Settings → Security / Privacy → Data Processing Agreement
3. **Accepteer de DPA** via het dashboard (Neon biedt standaard DPA voor betaalde accounts)
4. **Controleer regio:** Ga naar Project Settings → General → Region. Zorg dat de regio ingesteld is op `aws-eu-west-1` (Ierland) of `aws-eu-central-1` (Frankfurt)
   - Als de database nog in `us-east-2` staat → plan migratie naar EU-regio (Neon ondersteunt project-restore naar andere regio)
5. **Download DPA-bevestiging** en sla op in `docs/legal/signed-dpas/neon-dpa-DATUM.pdf`
6. **Vastleggen in verwerkersregister:** Noteer datum, regio, DPA-versie

### Aandachtspunten
- Neon gebruikt zelf AWS als sub-verwerker — dit is gedekt in hun DPA
- Controleer of connection strings in `.env` verwijzen naar EU-endpoint
- Backup-regio: controleer of backups ook in de EU blijven

---

## 3. Resend Inc.

**Verwerkte gegevens:** E-mailadressen, weergavenamen, type e-mail (bevestiging, uitnodiging, etc.)
**Land:** FR (EU — hoofdkantoor Parijs)
**Doorgifte:** Niet vereist (EU-entiteit)

### Actiestappen

1. **Log in op:** https://resend.com/account
2. **Ga naar:** Settings → Privacy / Legal
3. **Accepteer DPA** indien aangeboden, of stuur e-mail naar: privacy@resend.com met verzoek om DPA te ondertekenen
4. **Controleer data retention:** Zorg dat e-maillogs maximaal 90 dagen worden bewaard (Resend-instelling in dashboard)
5. **Vastleggen:** Sla bevestiging op in `docs/legal/signed-dpas/resend-dpa-DATUM.pdf`

### Aandachtspunten
- Resend is opgericht in de EU en valt direct onder AVG
- Controleer of API-sleutel alleen de minimale rechten heeft (geen volledige account-toegang)

---

## 4. Sentry (Optioneel — Error Tracking)

**Verwerkte gegevens:** Stack traces, foutmeldingen, user-agent, mogelijk IP-adressen en user-IDs
**Land:** VS
**Doorgifte:** Vereist SCCs als Sentry actief is

### Optie A — Sentry deactiveren (aanbevolen zolang DPIA ontbreekt)
- Verwijder Sentry SDK uit backend en frontend
- Gebruik alleen lokale logging (geen PII in logs)
- Dit elimineert dit AVG-risico volledig

### Optie B — Sentry activeren met AVG-maatregelen

1. **Log in op:** https://sentry.io → Settings → Legal → Data Processing Agreement
2. **Accepteer DPA** en download bevestiging
3. **Activeer dataminimalisatie in Sentry:**
   ```python
   # In Sentry initialisatie (backend)
   import sentry_sdk
   sentry_sdk.init(
       dsn="...",
       before_send=scrub_pii,  # custom filter
       send_default_pii=False,  # NOOIT op True zetten
   )
   ```
4. **Scrub PII** voor verzending: verwijder e-mailadressen, namen, tokens uit events
5. **SCCs:** Sentry biedt SCCs 2021 aan — accepteer via het dashboard
6. **Stel data retention in op 30 dagen** in Sentry-projectinstellingen

---

## 5. Cloudflare R2 — Actie: Geen (gedekt)

**Status:** ✅ Gedekt via Cloudflare's standaard DPA en AVG-conformiteitsverklaring
- Cloudflare heeft een EU-DPA automatisch van kracht via de gebruiksvoorwaarden
- R2 EU-regio (`eu-west-1`) — data verlaat de EU niet
- Documenteer dit in het verwerkersregister

**Verificatiestap:** Ga naar https://www.cloudflare.com/privacypolicy/ → Data Processing Addendum → bevestig dat jouw account hieronder valt

---

## 6. Stripe Inc. — Actie: Minimaal (gedekt via IE-entiteit)

**Status:** ✅ Grotendeels gedekt — Stripe Ireland Ltd. is de contractpartij voor EU-klanten
- Stripe DPA is automatisch van kracht via gebruiksvoorwaarden
- Stripe Ireland valt direct onder AVG (geen SCCs nodig voor verwerking binnen IE)

**Verificatiestap:** Ga naar https://stripe.com/nl/legal/dpa → bevestig dat jouw account de DPA accepteert en sla screenshot op

---

## Checklist — Te voltooien vóór livegang

```
[ ] OpenRouter DPA ondertekend/geaccepteerd
[ ] Neon.tech DPA geaccepteerd + EU-regio bevestigd
[ ] Resend DPA geaccepteerd of bevestiging ontvangen
[ ] Sentry: óf deactiveren óf DPA + scrubbing implementeren
[ ] Cloudflare R2 DPA-conformiteit gedocumenteerd
[ ] Stripe DPA-acceptatie gescreenshotted
[ ] Alle DPA's opgeslagen in docs/legal/signed-dpas/
[ ] Verwerkersregister bijgewerkt met DPA-data en -versies
```

---

## Sub-verwerkers

Let op: als een verwerker zelf sub-verwerkers gebruikt die nieuwe doorgifte naar buiten de EER creëren, moet je dit documenteren. Bekende sub-verwerkers:

| Verwerker | Sub-verwerker | Land | Gedekt |
|-----------|--------------|------|--------|
| OpenRouter | Anthropic | VS | Via OpenRouter DPA |
| OpenRouter | OpenAI Whisper | VS | Via OpenRouter DPA |
| Neon.tech | AWS (eu-west-1) | EU | Via Neon DPA |
| Resend | AWS SES (EU) | EU | Via Resend DPA |
| Stripe | AWS (IE) | EU | Via Stripe DPA |

---

*Versie 1.0 — 1 juni 2026 — WeAreImpact B.V.*
