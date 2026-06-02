# Verwerkersregister — BewaardVoorJou
**Art. 30 AVG — Register van verwerkingsactiviteiten**

| Veld | Waarde |
|------|--------|
| Verwerkingsverantwoordelijke | WeAreImpact B.V. |
| KVK | 70285888 |
| Adres | Heintje Hoeksteeg 11a, 1012 GR Amsterdam |
| Contactpersoon | v.munster@weareimpact.nl |
| Versie | 1.0 |
| Datum | 1 juni 2026 |
| Volgende review | 1 december 2026 |

---

## 1. Verwerkingsactiviteiten (Art. 30 lid 1)

### 1.1 Gebruikersregistratie en authenticatie

| | |
|---|---|
| **Doel** | Aanmaken en beheren van gebruikersaccounts; veilige inlog via JWT |
| **Rechtsgrond** | Art. 6 lid 1 sub b (uitvoering overeenkomst) |
| **Categorieën betrokkenen** | Geregistreerde gebruikers (consumenten, 18+) |
| **Categorieën persoonsgegevens** | E-mailadres, weergavenaam, geboortejaar (optioneel), wachtwoord (Argon2-hash), geboorteland, taalvoorkeur, IP-adres (login-log) |
| **Bijzondere categorieën** | Nee |
| **Verwerkers** | Neon.tech (databasehosting) |
| **Doorgifte buiten EER** | Neon.tech: VS — SCCs 2021 van toepassing |
| **Bewaartermijn** | Zolang account actief; na wissingsverzoek (Art. 17): 30 dagen |

---

### 1.2 Audio- en video-opnames levensverhalen

| | |
|---|---|
| **Doel** | Vastleggen, opslaan en terugvinden van persoonlijke levensverhalen |
| **Rechtsgrond** | Art. 9 lid 2 sub a (uitdrukkelijke toestemming — bijzondere categorie) |
| **Categorieën betrokkenen** | Geregistreerde gebruikers + eventuele derden die worden vermeld in opnames |
| **Categorieën persoonsgegevens** | Audio-opnames, video-opnames, bestandsmetadata (grootte, formaat, opnameduur, timestamp) |
| **Bijzondere categorieën** | Ja — biometrische gegevens (stemopname; Art. 9 lid 1 AVG) |
| **Verwerkers** | Cloudflare R2 / AWS S3 eu-west-1 (opslag), OpenRouter/OpenAI Whisper (transcriptie) |
| **Doorgifte buiten EER** | OpenRouter/OpenAI: VS — SCCs 2021; Cloudflare R2: EU-regio |
| **Bewaartermijn** | Zolang account actief; na wissing 30 dagen |

---

### 1.3 AI-transcriptie van opnames

| | |
|---|---|
| **Doel** | Omzetten van audio naar tekst voor doorzoekbaarheid en analyse |
| **Rechtsgrond** | Art. 9 lid 2 sub a (toestemming) |
| **Categorieën betrokkenen** | Gebruikers wiens opname wordt getranscribeerd |
| **Categorieën persoonsgegevens** | Ruwe audiotranscriptie (volledige tekst), woordindex per segment, vertrouwensscore |
| **Bijzondere categorieën** | Ja — gezondheidsgegevens en levensbeschouwelijke gegevens kunnen voorkomen in de inhoud |
| **Verwerkers** | OpenRouter B.V. → OpenAI Whisper large-v3 (VS) |
| **Doorgifte buiten EER** | VS — SCCs 2021 van toepassing |
| **Bewaartermijn** | Zolang account actief; na wissing 30 dagen |

---

### 1.4 AI-interview en vraag-generatie

| | |
|---|---|
| **Doel** | Genereren van persoonlijke interviewvragen op basis van antwoorden en hoofdstukcontext |
| **Rechtsgrond** | Art. 9 lid 2 sub a (toestemming) |
| **Categorieën betrokkenen** | Gebruikers die de interview-functie gebruiken |
| **Categorieën persoonsgegevens** | Eerdere antwoorden (gedeeltelijk), hoofdstukcontext, voortgang gesprek |
| **Bijzondere categorieën** | Ja — inhoud kan bijzondere categorieën bevatten (gezondheid, geloof, politieke opvattingen) |
| **Verwerkers** | OpenRouter → Anthropic (Claude Sonnet 4.6) — VS |
| **Doorgifte buiten EER** | VS — SCCs 2021 van toepassing |
| **Bewaartermijn** | Conversatiecontext: sessiongebonden (niet apart opgeslagen); antwoorden: zolang account actief |

---

### 1.5 Emotionele highlight-detectie

| | |
|---|---|
| **Doel** | Identificeren van emotioneel waardevolle fragmenten (lach, inzicht, liefde, wijsheid) |
| **Rechtsgrond** | Art. 9 lid 2 sub a (toestemming) |
| **Categorieën betrokkenen** | Gebruikers met transcribeerde opnames |
| **Categorieën persoonsgegevens** | Getranscribeerde tekst, emotielabel, tijdsindex, vertrouwensscore |
| **Bijzondere categorieën** | Ja — emotionele gegevens; indirect biometrisch |
| **Verwerkers** | OpenRouter → Anthropic (Claude Sonnet 4.6) — VS |
| **Doorgifte buiten EER** | VS — SCCs 2021 |
| **Bewaartermijn** | Zolang account actief; na wissing 30 dagen |

---

### 1.6 Familie-ecosysteem

| | |
|---|---|
| **Doel** | Uitnodigen van familieleden; delen van verhalen binnen familiepods |
| **Rechtsgrond** | Art. 6 lid 1 sub b (overeenkomst) + toestemming uitgenodigde persoon |
| **Categorieën betrokkenen** | Geregistreerde gebruikers; uitgenodigde familieleden (niet-gebruikers) |
| **Categorieën persoonsgegevens** | E-mailadres uitgenodigde, weergavenaam, familierelatie, uitnodigingstimestamp |
| **Bijzondere categorieën** | Nee (tenzij inhoud bijzondere gegevens bevat) |
| **Verwerkers** | Neon.tech (database), Resend Inc. (e-mail) |
| **Doorgifte buiten EER** | Neon.tech: VS — SCCs; Resend: FR (EU) |
| **Bewaartermijn** | Zolang familierelatie actief; bij wissing gebruiker: 30 dagen |

---

### 1.7 E-mailcommunicatie (transactioneel)

| | |
|---|---|
| **Doel** | Versturen van bevestigings-, notificatie- en systeemmails |
| **Rechtsgrond** | Art. 6 lid 1 sub b (uitvoering overeenkomst) |
| **Categorieën betrokkenen** | Alle geregistreerde gebruikers |
| **Categorieën persoonsgegevens** | E-mailadres, weergavenaam, type e-mail, timestamp |
| **Bijzondere categorieën** | Nee |
| **Verwerkers** | Resend Inc. (FR) |
| **Doorgifte buiten EER** | Nee (EU-gebaseerd) |
| **Bewaartermijn** | E-maillog: 90 dagen |

---

### 1.8 Betalingsverwerking

| | |
|---|---|
| **Doel** | Verwerken van abonnementen en eenmalige aankopen |
| **Rechtsgrond** | Art. 6 lid 1 sub b (overeenkomst) + Art. 6 lid 1 sub c (fiscale bewaarplicht) |
| **Categorieën betrokkenen** | Betalende gebruikers |
| **Categorieën persoonsgegevens** | Naam, e-mailadres, factuuradres, Stripe-customer-ID, betaalstatus (geen volledige kaartgegevens — die blijven bij Stripe) |
| **Bijzondere categorieën** | Nee |
| **Verwerkers** | Stripe Inc. (IE/VS) |
| **Doorgifte buiten EER** | Stripe IE (EU-vertegenwoordiging); VS-servers SCCs |
| **Bewaartermijn** | Factuurgegevens: 7 jaar (fiscale bewaarplicht Wet IB) |

---

### 1.9 Legacy / nalatenschap planning

| | |
|---|---|
| **Doel** | Beheren van Dead Man's Switch, tijdcapsules, nabestaanden-toegang |
| **Rechtsgrond** | Art. 6 lid 1 sub a (toestemming) |
| **Categorieën betrokkenen** | Gebruikers; aangewezen nabestaanden/begunstigden |
| **Categorieën persoonsgegevens** | E-mailadres begunstigde, vrijgavedatum, instructies gebruiker |
| **Bijzondere categorieën** | Nee (tenzij inhoud bijzondere gegevens bevat) |
| **Verwerkers** | Neon.tech, Resend Inc. |
| **Doorgifte buiten EER** | Neon.tech: VS — SCCs |
| **Bewaartermijn** | Zolang gebruiker account heeft; daarna conform wissingsverzoek |

---

### 1.10 Foutregistratie en monitoring (optioneel)

| | |
|---|---|
| **Doel** | Detecteren en diagnosticeren van technische fouten |
| **Rechtsgrond** | Art. 6 lid 1 sub f (gerechtvaardigd belang — beveiliging/stabiliteit platform) |
| **Categorieën betrokkenen** | Alle gebruikers (anoniem of gepseudonimiseerd) |
| **Categorieën persoonsgegevens** | Stack traces, foutmeldingen, user-agent, IP-adres (gepseudonimiseerd) |
| **Bijzondere categorieën** | Nee |
| **Verwerkers** | Sentry (VS) — indien geactiveerd |
| **Doorgifte buiten EER** | VS — SCCs 2021 |
| **Bewaartermijn** | 90 dagen |

---

## 2. Verwerkers — Overzicht en DPA-status

| Verwerker | Land | Dienst | DPA-basis | SCCs nodig | Status |
|-----------|------|--------|-----------|------------|--------|
| **Neon.tech** | VS (EU-regio beschikbaar) | PostgreSQL database | Neon DPA (accepteren in dashboard) | Ja (VS-servers) | ⚠️ Tekenen |
| **OpenRouter** | VS | AI-routing (Anthropic + Whisper) | OpenRouter ToS + DPA | Ja | ⚠️ Tekenen |
| **Anthropic** | VS | Claude Sonnet 4.6 (via OpenRouter) | Via OpenRouter DPA | Ja | ⚠️ Via OpenRouter |
| **OpenAI Whisper** | VS | Transcriptie (via OpenRouter) | Via OpenRouter DPA | Ja | ⚠️ Via OpenRouter |
| **Cloudflare R2** | EU (eu-west-1) | Mediaopslag | Cloudflare DPA (auto via ToS) | Nee (EU-regio) | ✅ Gedekt |
| **Resend Inc.** | FR | E-maillevering | Resend DPA (accepteren dashboard) | Nee (EU) | ⚠️ Accepteren |
| **Stripe Inc.** | IE (EU) | Betalingen | Stripe DPA (auto via ToS) | Nee (IE-entiteit) | ✅ Gedekt |
| **Sentry** | VS | Error tracking (optioneel) | Sentry DPA (accepteren) | Ja | ⚠️ Tekenen / deactiveren |

---

## 3. Beveiligingsmaatregelen (Art. 32 AVG)

| Maatregel | Status |
|-----------|--------|
| Wachtwoorden gehasht (Argon2id) | ✅ |
| HTTPS / TLS 1.2+ | ✅ |
| JWT met korte vervaltijd | ✅ |
| Rate limiting op API-endpoints | ✅ |
| Toegangscontrole per gebruiker (row-level) | ✅ |
| S3-buckets niet publiek | ✅ |
| Presigned URLs (tijdelijk, 1 uur) | ✅ |
| Encryptie at rest (S3 SSE-S3) | ⚠️ Controleren of KMS actief is |
| Database-encryptie (Neon.tech) | ✅ (beheerd) |
| Audit logging gevoelige acties | ⚠️ Nog implementeren |
| Dataminimalisatie in AI-prompts | ⚠️ Review vereist |
| Pseudonimisering foutlogs | ⚠️ Sentry-config reviewen |

---

## 4. Procedures betrokkenenrechten (Art. 15–22 AVG)

| Recht | Implementatie | Termijn |
|-------|---------------|---------|
| Inzage (Art. 15) | `GET /api/v1/account/me/export` | 30 dagen |
| Portabiliteit (Art. 20) | `GET /api/v1/account/me/export` (JSON) | 30 dagen |
| Wissing (Art. 17) | `DELETE /api/v1/account/me` | 30 dagen |
| Rectificatie (Art. 16) | `PUT /api/v1/account/me` (profiel-edit) | 30 dagen |
| Beperking (Art. 18) | Handmatig — procedure via e-mail | 30 dagen |
| Bezwaar (Art. 21) | Handmatig — procedure via e-mail | 30 dagen |
| Herroepen toestemming | Handmatig — e-mail + accountverwijdering | Onmiddellijk |

**Contactpunt betrokkenenrechten:** privacy@bewaardvoorjou.nl (of v.munster@weareimpact.nl)

---

## 5. Datalekprocedure (Art. 33–34 AVG)

1. Ontdekking → interne melding binnen **2 uur**
2. Beoordeling impact → binnen **24 uur** beslissen of AP-melding nodig
3. Melding Autoriteit Persoonsgegevens → binnen **72 uur** via meldloket.autoriteitpersoonsgegevens.nl
4. Betrokkenen informeren → indien hoog risico, **onverwijld**
5. Documentatie → vastleggen in datalekregister (ook niet-meldingsplichtige incidenten)

---

*Versie 1.0 — 1 juni 2026 — WeAreImpact B.V.*
*Volgende review: 1 december 2026 of bij materiële wijziging in verwerkingen*
