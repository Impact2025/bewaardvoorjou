# BewaardVoorJou.nl — SEO & Social Media Actieplan

## 🎯 Huidige status (29 juni 2026)

| Metric | Waarde |
|--------|--------|
| GSC property | sc-domain:bewaardvoorjou.nl ✅ |
| Sitemap | 72 URLs, 0 errors ✅ |
| Geïndexeerd | 0 van 72 ⚠️ |
| Clicks (90d) | 11 |
| Impressies (90d) | 104 |
| Gem. positie | 25.8 |
| IndexNow | ✅ Werkend, dagelijkse cron 08:00 |

---

## 📋 Fase 1: Technische basis (deze week) — direct effect

### ✅ Gereed
- [x] IndexNow alle 72 URLs gepingt
- [x] Sitemap opnieuw ingediend in GSC
- [x] Dagelijkse IndexNow cron job (08:00)
- [x] WebSite + SearchAction schema in layout
- [x] Organization schema verbeterd (sameAs ingevuld)
- [x] BlogPosting/Article schema verbeterd (timeRequired, keywords, image)
- [x] CollectionPage schema op KB overzicht

### 🔜 Deze week
- [ ] Cover images genereren met `scripts/generate_covers.py`
- [ ] Cover images koppelen via API (og_image veld)
- [ ] GSC kontroleren 48u na IndexNow ping

---

## 📋 Fase 2: Content & interne linkstructuur (week 2-3)

### Pillar → Cluster structuur per categorie
```
LEVENSVERHAAL (pillar)
├── /kennisbank/complete-gids-levensverhaal-vastleggen ← gids ⭐
├── /kennisbank/hoe-begin-ik-met-het-vastleggen-van-mijn-levensverhaal
├── /kennisbank/de-30-hoofdstukken-van-je-leven
├── /kennisbank/stapsgewijze-handleiding-je-eerste-herinnering-opnemen
├── /kennisbank/wat-doet-de-ai-interviewer-precies
├── /kennisbank/hoe-werkt-praten-tegen-de-ai-interviewer
├── /kennisbank/praten-in-plaats-van-typen-hoe-werkt-audio-en-video
├── /kennisbank/tips-om-herinneringen-op-te-halen-voor-je-biografie
├── /kennisbank/autobiografie-schrijven-stappenplan
├── /kennisbank/memoires-schrijven-voorbeelden-en-tips
├── /kennisbank/levensverhaal-laten-schrijven-kosten
├── /blog/levensverhaal-opschrijven-hoe-u-herinneringen-bewaart-voor-d
├── /blog/van-losse-verhalen-naar-een-blijvend-familieboek
└── /blog/levensverhaal-bewaren-geschenk-kinderen

FAMILIE (cluster)
├── /kennisbank/familieverhalen-bundelen-boek
├── /kennisbank/herinneringen-bewaren-kleinkinderen
├── /kennisbank/levensverhaal-bewaren-belang-familie
├── /kennisbank/interview-ouders-25-vragen
├── /kennisbank/digitale-nalatenschap-regelen-gids
├── /blog/5-vragen-ouders-stellen-voordat-te-laat
└── /blog/interview-ouder-starten-praktische-gids

BABY & KRAAMCADEAU (cluster)
├── /kennisbank/babyboek-eerste-jaar-bijhouden-tips
├── /kennisbank/babydagboek-app-vergelijken-2026
├── /kennisbank/babyherinneringen-bewaren-10-manieren
├── /kennisbank/babyontwikkeling-per-maand-0-12
├── /kennisbank/digitaal-babyboek-waarom-digitaal
├── /kennisbank/digitaal-vs-papieren-babyboek-vergelijking
├── /kennisbank/eerste-verjaardag-baby-vieren-ideeen
├── /kennisbank/grootouders-op-de-hoogte-baby
├── /kennisbank/kraamcadeau-babyboek-digitaal
├── /kennisbank/kraamcadeau-ouders-die-al-alles-hebben
├── /kennisbank/mijlpalen-baby-eerste-jaar
├── /kennisbank/originele-kraamcadeau-ideeen
├── /kennisbank/partner-ervaring-baby-eerste-jaar-samen
├── /blog/bewaard-voor-baby-live-digitale-babyboek
└── /blog/digitaal-vs-fysiek-herinneringen-bewaren

CADEAU & SPECIALE GELEGENHEDEN (cluster)
├── /kennisbank/cadeau-70-jaar-originele-ideeen
├── /blog/vaderdag-cadeau-2026-voor-de-vader-die-alles-heeft
└── /levensverhaal-cadeau-geven

VEILIGHEID & TECHNIEK (cluster)
├── /kennisbank/waar-worden-mijn-levensverhalen-opgeslagen-nederlandse-servers
├── /kennisbank/wie-heeft-er-toegang-tot-mijn-verhalen
├── /kennisbank/hoe-werkt-de-tijdgestuurde-vrijgave-voor-familie
├── /kennisbank/hoe-exporteer-ik-mijn-eigen-data-en-herinneringen
├── /kennisbank/is-bewaardvoorjou-echt-gratis-te-proberen
├── /kennisbank/hoe-maak-ik-een-gratis-account-aan
├── /kennisbank/hoe-kan-ik-mijn-abonnement-opzeggen
├── /kennisbank/kan-ik-mijn-antwoorden-tussentijds-aanpassen-of-pauzeren
├── /kennisbank/ik-ben-geen-schrijver-kan-ik-bewaardvoorjou-toch-gebruiken
└── /veilig-digitaal-familiearchief
```

**Actie**: Bij elk artikel interne links toevoegen naar 2-3 andere artikelen in dezelfde cluster + 1 naar de pillar.

---

## 📋 Fase 3: Social media strategie (direct starten)

### Beste posttijden (Nederlandse doelgroep)
| Platform | Beste dagen | Beste tijden | Frequentie |
|----------|-------------|--------------|------------|
| LinkedIn | Di, Wo, Do | 07:30-09:00, 12:00-13:00, 17:00-18:00 | 3x/week |
| Facebook | Wo, Do, Za | 11:00, 13:00, 09:00 | 3x/week |
| Instagram | Ma, Di, Wo, Do | 09:00-11:00 | 3x/week |
| X (Twitter) | Ma-Vr | 08:00, 12:00, 17:00 | 5x/week |

### Content pijlers (40-30-20-10 regel)
1. **Thought leadership (40%)** — Waarom levensverhalen bewaren belangrijk is, AI in herinneringen, digitale nalatenschap
2. **Praktische tips (30%)** — Hoe begin je, welke vragen stel je, inspiratie voor cadeaus
3. **Storytelling / impact (20%)** — Waarom verhalen generaties verbinden, citaten, voorbeelden
4. **Interactie / vragen (10%)** — Polls, vragen aan volgers, reacties uitlokken

### Weekplanning (3 posts/week LinkedIn)

**Maandag 07:30 — Thought leadership** 🧠
> "Waarom digitale nalatenschap net zo belangrijk is als een testament. 📜
> Je huis, je spaargeld, je sieraden — daar heb je regelingen voor getroffen.
> Maar wat gebeurt er met je verhalen, je herinneringen, je levenswijsheid?
> Bij BewaardVoorJou.nl kun je je levensverhaal veilig bewaren én bepalen wie het wanneer ontvangt.
> 👉 https://bewaardvoorjou.nl/kennisbank/digitale-nalatenschap-regelen-gids
> #DigitaleNalatenschap #Levensverhaal #Erfgoed"

**Woensdag 12:00 — Praktische tip** 💡
> "5 vragen die je vandaag nog aan je ouders kunt stellen:
> 1️⃣ Wat was het beste advies dat jij ooit kreeg?
> 2️⃣ Hoe zag jouw droom eruit toen je jong was?
> 3️⃣ Wat was de gelukkigste dag van je leven?
> 4️⃣ Wat zou je anders doen als je opnieuw kon beginnen?
> 5️⃣ Wat is jouw belangrijkste les voor je (klein)kinderen?
> Leg hun antwoorden vast voordat het te laat is. 🎙️
> 👉 https://bewaardvoorjou.nl/blog/5-vragen-ouders-stellen-voordat-te-laat
> #Ouders #Interview #FamilieVerhalen"

**Vrijdag 17:00 — Storytelling/inspiratie** ✨
> "Het mooiste geschenk dat je je kinderen kunt geven? Jouw verhaal.
> Geen cadeau dat ooit veroudert. Geen herinnering die vervaagt.
> Alleen de stem van iemand die van hen houdt, voor altijd bewaard.
> Begin vandaag. Het duurt maar 2 minuten. 📖
> 👉 https://bewaardvoorjou.nl/register
> #Levensverhaal #Familie #HerinneringenBewaren"

---

## 📋 Fase 4: Automatisering & Cron Jobs

### Bestaande cron jobs
| Job | Schema | Wat |
|-----|--------|-----|
| bewaardvoorjou-indexnow-daily | Dagelijks 08:00 | Pingt alle 72 URLs naar IndexNow |

### Nieuwe cron jobs (aan te maken)

**1. SEO GSC weekly report** — Zondag 10:00
Controleert GSC data: aantal geïndexeerde URLs, clicks, impressies, top queries. Rapporteert of de IndexNow werkt.

**2. Social media post ma/wo/vr** — 07:30, 12:00, 17:00
Genereert een LinkedIn post op basis van de content pijlers en een willekeurig artikel uit de sitemap.

### LinkedIn posting (automatisch via Hermes cron)
Deze cron jobs kunnen posts genereren, maar daadwerkelijk posten op LinkedIn vereist ofwel:
- **Plan A**: LinkedIn API via een service account → volledig geautomatiseerd
- **Plan B**: Genereer de post + zet klaar voor review (half-automatisch)
- **Plan C**: Buffer / Hootsuite / Later API gebruiken

**Aanbeveling**: Begin met Plan B (cron genereert post voor review), switch naar Plan A als de API setup werkt.

---

## 📋 Fase 5: Content gap-analyse (week 4-6)

### Ontbrekende onderwerpen (hoge SEO-potentie, nog geen content)
- [ ] "Hoe schrijf ik mijn levensverhaal?" (5.400/mnd zoekvolume)
- [ ] "Autobiografie voorbeeld" (2.200/mnd)
- [ ] "Herinneringenboek maken" (1.300/mnd)
- [ ] "Interview met ouders vragenlijst" (1.000/mnd)
- [ ] "Levensverhaal op papier" (880/mnd)
- [ ] "Familiegeschiedenis onderzoeken" (720/mnd)
- [ ] "Stamboom maken met verhalen" (590/mnd)
- [ ] "Cadeau voor 80-jarige" (4.400/mnd)
- [ ] "Cadeau voor 60-jarige" (2.900/mnd)
- [ ] "Cadeau voor 50-jarige" (3.600/mnd)

### Maandelijkse content target
- **Blog**: 2 nieuwe artikelen/maand
- **KB**: 2 nieuwe artikelen/maand
- **Totaal**: 4 artikelen/maand = 48/jaar

---

## 📅 Tijdlijn

| Week | Doel | Acties |
|------|------|--------|
| Week 1 (deze week) | Technische basis ✅ | IndexNow, schemas, sitemap, cover images |
| Week 2 | Eerste indexaties | GSC checken, interne links toevoegen |
| Week 3 | Social media start | Eerste LinkedIn posts, automatisering |
| Week 4-6 | Content gaps vullen | 4 nieuwe artikelen, pillar updates |
| Maand 2 | Groei meten | GSC trends, aanpassen op data |
| Maand 3 | Schalen | Automatisering verfijnen, backlinks |

---

## 📊 KPI's (doelen over 3 maanden)

| KPI | Huidig | Doel (90d) |
|-----|--------|------------|
| Geïndexeerde URLs | 0 | 40+ |
| Clicks/maand | ~3 | 100+ |
| Impressies/maand | ~35 | 5.000+ |
| Gem. positie | 25.8 | < 15 |
| Sitemap submitted | 72 | 80+ |
