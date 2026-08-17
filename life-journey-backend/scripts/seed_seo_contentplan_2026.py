#!/usr/bin/env python3
"""
Seed-script voor het SEO-contentplan 2026 (14 artikelen).

BELANGRIJK: dit script is pas geschreven ná verificatie tegen de live
productie-database (blogpost-tabel, 69 gepubliceerde artikelen). Een eerste
versie van dit plan bevatte 6 onderwerpen die al bestonden onder een andere
titel/slug (kosten, biografie-gids, cadeau 70 jaar, complete gids
levensverhaal vastleggen, familieboek bundelen, 5 vragen aan ouders) — die
zijn geschrapt om keyword-kannibalisatie te voorkomen en vervangen door acht
geverifieerd nieuwe onderwerpen.

De 14 artikelen vullen de resterende contentgaten: dementie/Alzheimer, rouw
(voor en na overlijden), pensioen/levensovergang, emigratie/meertaligheid,
AI-vertrouwen (objection handling), huwelijksjubileum-cadeau,
familiegeschiedenis/genealogie, en de familie-pod-functie (nog niet als FAQ
uitgelegd). Geschreven volgens redactiegids v2.0 (ik-vorm als Vincent,
dynamische invalshoeken A/B/C, sentence case, duale CTA, formule-kaarten
als blockquote). Elk artikel krijgt een vaste publicatiedatum tussen
2026-01-08 en 2026-05-18.

Werkwijze (identiek aan seed_wereldklasse_content.py): aanmaken via de API
zodat de HTML-sanitizer draait, daarna publiceren en de publicatiedatum
terugzetten.

Gebruik (lokaal):
  python scripts/seed_seo_contentplan_2026.py --email admin@... --password ...

Gebruik (productie):
  python scripts/seed_seo_contentplan_2026.py --email admin@... --password ... \
      --url https://api.bewaardvoorjou.nl/api/v1
"""

import argparse
import sys

import requests


def login(base_url: str, email: str, password: str) -> str:
    resp = requests.post(
        f"{base_url}/auth/login",
        json={"email": email, "password": password},
    )
    if resp.status_code != 200:
        print(f"Inloggen mislukt: {resp.text}")
        sys.exit(1)
    return resp.json()["access_token"]


def create_and_publish(base_url: str, token: str, article: dict) -> None:
    headers = {"Authorization": f"Bearer {token}"}
    published_at = article.pop("published_at")

    resp = requests.post(f"{base_url}/blog", json=article, headers=headers)
    if resp.status_code == 409:
        print(f"  Overgeslagen (slug bestaat al): {article['slug']}")
        return
    if resp.status_code not in (200, 201):
        print(f"  Fout bij aanmaken {article['slug']}: {resp.text}")
        return

    post_id = resp.json()["id"]
    requests.post(f"{base_url}/blog/{post_id}/publish", headers=headers)
    requests.patch(
        f"{base_url}/blog/{post_id}",
        json={"published_at": published_at},
        headers=headers,
    )
    print(f"  Aangemaakt en gepubliceerd ({published_at[:10]}): {article['title']}")


# Herbruikbare duale CTA (consument + organisatie) — redactiegids §3.
CTA_DUAAL = """<hr>
<h2>Twee manieren om vandaag te beginnen</h2>
<p><strong>Wil je het zelf ervaren?</strong> Maak binnen een minuut een gratis account aan en praat met de empathische AI-interviewer. Geen creditcard nodig. <a href="/register">Start gratis met vertellen</a>.</p>
<p><strong>Werk je bij een zorg-, welzijns- of HR-organisatie?</strong> Dan denk ik graag met je mee over hoe je reminiscentie en betekenisvolle overgangen structureel opzet. Plan een strategische verkenning via <a href="https://www.weareimpact.nl" target="_blank" rel="noopener noreferrer">WeAreImpact.nl</a>.</p>"""


ARTICLES = [

    # =========================================================================
    # 1 — Is het niet raar om met een AI te praten? (kennisbank, invalshoek A)
    # =========================================================================
    {
        "title": "Is het niet raar om met een AI over je leven te praten?",
        "slug": "is-het-niet-raar-om-met-een-ai-over-je-leven-te-praten",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#EAF1F8",
        "header_text_color": "#1E3A5F",
        "published_at": "2026-01-08T09:00:00+00:00",
        "meta_title": "Is het niet raar om met een AI over je leven te praten?",
        "meta_description": "Een eerlijk antwoord op de meest gestelde twijfel: voelt het niet onpersoonlijk om je levensverhaal aan een AI te vertellen?",
        "keywords": "AI interviewer vertrouwen, is AI privacy veilig, praten met AI over persoonlijke dingen, AI levensverhaal echt",
        "tags": "ai-interviewer, vertrouwen, privacy",
        "excerpt": "Het is de meest gestelde vraag die ik krijg, en de eerlijkste twijfel die er is. Hier is mijn antwoord, zonder poespas.",
        "content": """<p><strong>In het kort:</strong> nee, het hoeft niet raar te voelen — mits de AI luistert in plaats van oordeelt, jouw woorden nooit herschrijft in iets anders dan wat jij bedoelde, en je verhaal privé blijft totdat jij besluit het te delen. Hier leg ik uit hoe dat concreet werkt, zonder de twijfel weg te wuiven.</p>

<h2>De twijfel is terecht</h2>
<p>"Praten met een AI over de moeilijkste periode van mijn leven" klinkt voor veel mensen in eerste instantie ongemakkelijk. Dat is een gezonde reactie, geen onterechte. Een AI is geen mens die met je meevoelt in de biologische zin van het woord. Die eerlijkheid begint bij het erkennen daarvan, niet bij het wegpraten ervan.</p>

<h2>Wat de AI-interviewer wél en niet doet</h2>
<p>De AI-interviewer stelt vragen, luistert door, en helpt je verder te vertellen dan het eerste antwoord — precies zoals een goede interviewer dat zou doen. Wat hij niet doet: oordelen, jouw woorden herschrijven tot iets anders, of je verhaal gebruiken voor iets anders dan waarvoor jij het bedoeld hebt. Meer over de mechaniek lees je in <a href="/kennisbank/wat-doet-de-ai-interviewer-precies">dit artikel over wat de AI-interviewer precies doet</a>.</p>

<h2>Waarom mensen het toch als prettig ervaren</h2>
<p>Wat veel gebruikers terugmelden is niet dat het "net zo goed" is als een mens, maar dat het net dat andere biedt: geen oordeel, geen tijdsdruk, geen ongemak om iets kwetsbaars te vertellen aan iemand die je kent. Voor sommige verhalen is die afstand juist bevrijdend — je vertelt het aan een luisterend oor zonder gezicht, en dat maakt de eerste stap makkelijker.</p>

<blockquote>
<p><strong>De kern in één zin:</strong> het gaat niet om nepintimiteit nabootsen, het gaat om een drempel wegnemen die anders onoverkomelijk blijft.</p>
</blockquote>

<h2>Waar de grens ligt</h2>
<p>Eerlijkheid hoort hierbij: als je liever met een mens praat, is dat een volstrekt legitieme keuze — zie de vergelijking met een ghostwriter in <a href="/kennisbank/levensverhaal-laten-schrijven-kosten">dit artikel</a>. De AI-interviewer is geen vervanging van menselijk contact, het is een laagdrempelige manier om te beginnen wanneer een leeg scherm of een dure ghostwriter je tegenhoudt.</p>

<h2>En je privacy dan</h2>
<p>Je verhaal wordt nooit gebruikt om AI-modellen mee te trainen, nooit gedeeld voor reclame, en staat versleuteld op Nederlandse servers. Lees de volledige uitleg in <a href="/kennisbank/waar-worden-mijn-levensverhalen-opgeslagen-nederlandse-servers">dit artikel over waar je verhalen worden opgeslagen</a>.</p>

<h2>Veelgestelde vragen</h2>
<h3>Kan ik altijd stoppen als het te veel wordt?</h3>
<p>Ja, op elk moment. Er is geen verplichting om door te gaan met een onderwerp dat te zwaar voelt.</p>
<h3>Leest een medewerker mee wat ik vertel?</h3>
<p>Nee. Je verhalen zijn standaard privé en versleuteld.</p>
""" + CTA_DUAAL,
    },

    # =========================================================================
    # 2 — Hoeveel tijd kost het? (kennisbank, invalshoek A, FAQ objection-handling)
    # =========================================================================
    {
        "title": "Hoeveel tijd kost het om je levensverhaal vast te leggen?",
        "slug": "hoeveel-tijd-kost-het-om-je-levensverhaal-vast-te-leggen",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#F1EDE4",
        "header_text_color": "#4A3B2A",
        "published_at": "2026-01-19T09:00:00+00:00",
        "meta_title": "Hoeveel tijd kost het om je levensverhaal vast te leggen?",
        "meta_description": "Geen weken vrij hoeven maken. Een realistisch beeld van de tijdsinvestering, hoofdstuk voor hoofdstuk.",
        "keywords": "hoeveel tijd kost levensverhaal, tijdsinvestering biografie, hoe lang duurt levensverhaal vastleggen",
        "tags": "tijdsinvestering, planning, levensverhaal",
        "excerpt": "De vraag die net zo vaak gesteld wordt als de kostenvraag, maar minder vaak beantwoord: hoeveel tijd gaat dit me kosten?",
        "content": """<p><strong>In het kort:</strong> een los hoofdstuk inspreken kost meestal 15 tot 30 minuten. Er is geen deadline en geen verplicht tempo — mensen die een compleet levensverhaal opbouwen doen dat vaak verspreid over maanden, in korte sessies, niet in één marathon.</p>

<h2>Waarom deze vraag er vaak niet bij wordt gezegd</h2>
<p>Bij de kostenvraag ("wat kost dit in euro's") wordt vaak stilgezwegen over de andere kostenpost die minstens zo zwaar weegt: tijd. Mensen die twijfelen om te beginnen, twijfelen vaker uit angst voor tijdsdruk dan uit angst voor het prijskaartje.</p>

<h2>Realistische tijdsinschatting per onderdeel</h2>
<ul>
<li><strong>Eén herinnering of los hoofdstuk inspreken:</strong> 15-30 minuten.</li>
<li><strong>Een gesprek met een ouder plannen en voeren:</strong> reken op een uur, inclusief opwarmen.</li>
<li><strong>Een compleet levensverhaal (alle hoofdstukken):</strong> geen vaste tijd — de meeste mensen bouwen dit op over maanden, in korte, losse sessies.</li>
</ul>

<h2>Er is geen deadline</h2>
<p>Anders dan bij een ghostwriter-traject, waar een tijdlijn en interviewrondes vooraf worden afgesproken, is er bij het zelf vastleggen geen enkele druk om binnen een bepaalde periode klaar te zijn. Je kunt een maand pauzeren en daarna verdergaan zonder dat er iets verloren gaat.</p>

<blockquote>
<p><strong>De kern in één zin:</strong> je hoeft geen weekend vrij te plannen — 20 minuten op een rustige avond is al genoeg om te beginnen.</p>
</blockquote>

<h2>Hoe je het behapbaar houdt</h2>
<p>De meest succesvolle aanpak is niet "één keer alles vertellen", maar een vast, licht ritme: bijvoorbeeld één hoofdstuk per week. Gebruik <a href="/kennisbank/de-30-hoofdstukken-van-je-leven-wat-kun-je-verwachten">de structuur van hoofdstukken</a> als houvast, zodat je nooit voor een leeg canvas staat maar steeds voor één afgebakende vraag.</p>

<h2>Wat als het langer duurt dan verwacht</h2>
<p>Dat is geen probleem. Anders dan bij een betaald ghostwriter-traject loop je geen extra kosten op als het langer duurt. Je werkt in je eigen tempo, zonder tikkende klok.</p>

<h2>Veelgestelde vragen</h2>
<h3>Kan ik tussentijds pauzeren zonder iets kwijt te raken?</h3>
<p>Ja, alles wat je al hebt vastgelegd blijft gewoon staan totdat je verdergaat.</p>
<h3>Is er een minimum aantal hoofdstukken dat ik moet afronden?</h3>
<p>Nee. Ook een enkel hoofdstuk is al waardevol en compleet op zichzelf.</p>
""" + CTA_DUAAL,
    },

    # =========================================================================
    # 3 — Familieleden uitnodigen: familie-pod (kennisbank, feature-FAQ)
    # =========================================================================
    {
        "title": "Familieleden uitnodigen: zo werkt de gedeelde familie-pod",
        "slug": "familieleden-uitnodigen-gedeelde-familie-pod",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#EAF1F8",
        "header_text_color": "#1E3A5F",
        "published_at": "2026-01-29T09:00:00+00:00",
        "meta_title": "Familieleden uitnodigen: zo werkt de familie-pod",
        "meta_description": "Je hoeft niet de enige te zijn die alles vastlegt. Zo nodig je familieleden uit voor een gedeeld familiearchief.",
        "keywords": "familieleden uitnodigen BewaardVoorJou, gedeeld familiearchief uitnodigen, familie pod, samen familiearchief opbouwen",
        "tags": "familie, functie, uitnodigen",
        "excerpt": "De familie-pod-functie in het kort: hoe je familieleden uitnodigt, wie wat kan zien, en waarom een gedeeld archief rijker wordt dan een eenmansproject.",
        "content": """<p><strong>In het kort:</strong> met de familie-pod-functie nodig je familieleden uit om samen bij te dragen aan hetzelfde archief. Iedereen legt vanuit zijn of haar eigen account herinneringen vast, en samen ontstaat een verhaal dat rijker is dan wat één persoon alleen zou kunnen vastleggen.</p>

<h2>Waarom één persoon het zelden compleet krijgt</h2>
<p>Vaak begint het bij één familielid dat het initiatief neemt om een ouder of grootouder te interviewen. Dat werkt goed als start, maar heeft een grens: één persoon kent maar één kant van elk verhaal. Een broer, zus of kleinkind heeft vaak een detail, een andere herinnering aan diezelfde gebeurtenis, of een foto die niemand anders had.</p>

<h2>Hoe je iemand uitnodigt</h2>
<p>Vanuit je account nodig je familieleden uit voor dezelfde familie-pod met een simpele link of uitnodiging. Zodra iemand die accepteert, kan diegene vanuit zijn of haar eigen account bijdragen: eigen herinneringen vastleggen, reageren op bestaande verhalen, of ontbrekende details aanvullen.</p>

<h2>Wie ziet wat</h2>
<p>Jij bepaalt zelf wat gedeeld wordt en wat privé blijft. Met tijdgestuurde vrijgave kun je bepaalde hoofdstukken ook pas op een later moment beschikbaar maken voor specifieke familieleden. Lees de volledige uitleg in <a href="/kennisbank/hoe-werkt-de-tijdgestuurde-vrijgave-voor-familie">dit artikel over tijdgestuurde vrijgave</a>.</p>

<blockquote>
<p><strong>De kern in één zin:</strong> een familiearchief wordt sterker naarmate meer stemmen eraan bijdragen, niet zwaarder voor wie het initiatief nam.</p>
</blockquote>

<h2>Praktisch voorbeeld</h2>
<p>Een grootouder spreekt een paar kernherinneringen in. Een kleinkind vult diezelfde gebeurtenis aan met zijn eigen kant van het verhaal. Een ander familielid voegt een foto toe die niemand anders nog had. Zo groeit het archief van meerdere kanten tegelijk. Gebruik <a href="/kennisbank/interview-ouders-25-vragen">deze 25 vragen</a> als startpunt voor wie nog niet weet waar te beginnen.</p>

<h2>Veelgestelde vragen</h2>
<h3>Hoeveel familieleden kan ik uitnodigen?</h3>
<p>Dat hangt af van je pakket — bekijk de mogelijkheden op de <a href="/pricing">pricing-pagina</a>.</p>
<h3>Kan ik een uitnodiging later weer intrekken?</h3>
<p>Ja, je houdt als eigenaar van de familie-pod altijd de controle over wie toegang heeft.</p>
<h3>Wat als een familielid niet zo digitaal vaardig is?</h3>
<p>Praten is de basis van het platform, geen typen nodig — dat maakt meedoen laagdrempelig voor iedereen.</p>
""" + CTA_DUAAL,
    },

    # =========================================================================
    # 4 — Familiegeschiedenis onderzoeken (kennisbank, invalshoek C)
    # =========================================================================
    {
        "title": "Familiegeschiedenis onderzoeken en vastleggen: van archief tot verhaal",
        "slug": "familiegeschiedenis-onderzoeken-en-vastleggen",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#F1EDE4",
        "header_text_color": "#4A3B2A",
        "published_at": "2026-02-08T09:00:00+00:00",
        "meta_title": "Familiegeschiedenis onderzoeken en vastleggen: complete gids",
        "meta_description": "Voorouders achterhalen is pas het begin. Zo verbind je archiefonderzoek met de verhalen die er nog niet in de kadaster staan.",
        "keywords": "familiegeschiedenis onderzoeken, genealogie starten, voorouders achterhalen, stamboom en verhalen combineren",
        "tags": "familiegeschiedenis, genealogie, onderzoek",
        "excerpt": "Een stamboom vertelt wie je voorouders waren. Verhalen vertellen wie ze werkelijk waren. Zo combineer je die twee.",
        "content": """<p><strong>In het kort:</strong> genealogisch onderzoek (archieven, burgerlijke stand, kadaster) geeft je de feiten: namen, data, plekken. Het levert zelden de verhalen erachter op. Deze gids laat zien hoe je die twee met elkaar verbindt tot een familiegeschiedenis die werkelijk leeft.</p>

<h2>Wat archiefonderzoek je wel en niet vertelt</h2>
<p>Nederlandse archieven, het CBG en de burgerlijke stand geven feiten: geboorte- en overlijdensdata, huwelijken, verhuizingen. Onmisbaar als basis, maar een geboorteakte vertelt niet waarom een overgrootvader emigreerde, of hoe een huwelijk tot stand kwam. Die verhalen bestaan alleen nog in de hoofden van wie ze zich herinnert.</p>

<h2>Waar te beginnen met onderzoek</h2>
<ul>
<li><strong>Regionale en nationale archieven</strong> voor geboorte-, huwelijks- en overlijdensaktes.</li>
<li><strong>Het Centraal Bureau voor Genealogie (CBG)</strong> voor bredere familiegeschiedenis en wapenkunde.</li>
<li><strong>Kadastergegevens</strong> voor eigendom en woonplaatsen door de generaties heen.</li>
</ul>

<h2>De verhalen die archieven niet hebben</h2>
<p>Terwijl je feiten verzamelt, is dit hét moment om ook de mondelinge overlevering vast te leggen — bij de oudste generatie die je nog kunt bereiken. Elke naam op een stamboom wordt pas een mens zodra er een verhaal bij hoort. Gebruik <a href="/kennisbank/interview-ouders-25-vragen">deze 25 vragen</a> als startpunt voor die gesprekken.</p>

<blockquote>
<p><strong>De kern in één zin:</strong> een stamboom laat zien wie er was. Een verhaal laat zien wie ze werkelijk waren.</p>
</blockquote>

<h2>Feiten en verhalen samenbrengen</h2>
<p>Koppel bij elk vastgelegd verhaal de bijbehorende feiten: een datum, een plek, een document. Zo ontstaat een familiegeschiedenis die zowel historisch onderbouwd als persoonlijk is — geen droge stamboom, en geen los verhaal zonder context.</p>

<h2>Met de hele familie</h2>
<p>Onderzoek en verhalen verzamelen werkt het best als meerdere familieleden meehelpen — iedereen heeft toegang tot andere bronnen en herinneringen. Zie <a href="/kennisbank/familieleden-uitnodigen-gedeelde-familie-pod">dit artikel over familieleden uitnodigen</a> voor hoe je dat organiseert.</p>

<h2>Veelgestelde vragen</h2>
<h3>Moet ik eerst het hele archiefonderzoek afronden voordat ik verhalen vastleg?</h3>
<p>Nee, doe het parallel. Verhalen vastleggen kan niet wachten op onderzoek dat jaren kan duren — mensen wel.</p>
<h3>Wat als er geen archiefstukken meer te vinden zijn?</h3>
<p>Dan wordt de mondelinge overlevering nog belangrijker — vaak de enige overgebleven bron.</p>
""" + CTA_DUAAL,
    },

    # =========================================================================
    # 5 — Reminiscentie en Alzheimer (kennisbank, invalshoek C)
    # =========================================================================
    {
        "title": "Waarom oude herinneringen het langst blijven bij Alzheimer",
        "slug": "waarom-oude-herinneringen-langst-blijven-alzheimer",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#EAF1F8",
        "header_text_color": "#1E3A5F",
        "published_at": "2026-02-18T09:00:00+00:00",
        "meta_title": "Waarom oude herinneringen het langst blijven bij Alzheimer",
        "meta_description": "Het geheugen van iemand met Alzheimer werkt niet 'kapot' — het werkt anders. Wat reminiscentie daarover leert.",
        "keywords": "reminiscentie alzheimer, waarom onthouden dementiepatiënten vroeger beter, geheugen alzheimer oude herinneringen",
        "tags": "alzheimer, dementie, reminiscentie, zorg",
        "excerpt": "Dat iemand met Alzheimer zich een jeugdherinnering beter herinnert dan het ontbijt van vanochtend, is geen toeval. Zo werkt het geheugen dan.",
        "content": """<p><strong>In het kort:</strong> bij Alzheimer verdwijnen recente herinneringen vaak sneller dan oude. Dat is geen willekeurig verval, maar een patroon dat samenhangt met hoe herinneringen in het brein worden opgeslagen. Reminiscentie — het actief ophalen van oude herinneringen — sluit daarop aan als erkende, laagdrempelige methode.</p>

<p><em>Dit artikel geeft geen medisch advies en vervangt geen professionele zorgbegeleiding. Het is bedoeld als toegankelijke uitleg en praktisch startpunt.</em></p>

<h2>Hoe geheugen bij Alzheimer werkt</h2>
<p>Geheugen is geen simpele harde schijf die willekeurig leegloopt. Recente herinneringen zijn nog "vers" opgeslagen en kwetsbaarder voor verstoring; oude, vaak herhaalde herinneringen liggen dieper verankerd, soms via meerdere zintuigen tegelijk (een geur, een lied, een stem). Bij Alzheimer worden recente herinneringen daardoor vaak eerder aangetast dan herinneringen van decennia geleden.</p>

<h2>Waarom oude herinneringen langer intact blijven</h2>
<p>Dit patroon wordt in de neuropsychologie de wet van Ribot genoemd: hoe ouder een herinnering, hoe stabieler die doorgaans is opgeslagen, en hoe langer die weerstand biedt tegen geheugenverval. Dat verklaart waarom iemand zich een liedje uit de jaren zestig feilloos herinnert, terwijl het gesprek van tien minuten geleden alweer is weggezakt.</p>

<h2>Reminiscentie als erkende methode in de zorg</h2>
<p>Reminiscentietherapie maakt hier bewust gebruik van: door gericht oude herinneringen op te halen (via foto's, muziek, geur, voorwerpen), wordt een gevoel van herkenning en welbevinden aangesproken dat nog wél bereikbaar is. Het is een breed toegepaste, laagdrempelige methode in de ouderenzorg — niet als vervanging van medische behandeling, maar als aanvulling die concreet bijdraagt aan kwaliteit van leven. Lees ook <a href="/kennisbank/reminiscentie-in-de-zorg-levensverhalen-als-activiteit">dit bredere artikel over reminiscentie als activiteit in de zorg</a>.</p>

<blockquote>
<p><strong>De kern in één zin:</strong> het geheugen van iemand met Alzheimer werkt niet "kapot" — het werkt anders, en oude herinneringen zijn vaak nog het best bereikbaar.</p>
</blockquote>

<h2>Praktisch: hoe je dit thuis toepast</h2>
<ul>
<li>Gebruik oude foto's als gespreksopener, niet als test ("weet je nog wie dit is") maar als uitnodiging ("wat gebeurde er die dag?").</li>
<li>Muziek uit de jeugd van iemand kan herinneringen en emoties oproepen die woorden alleen niet losmaken.</li>
<li>Vertrouwde geuren en voorwerpen werken vaak sterker dan een direct gesprek.</li>
</ul>

<h2>De brug naar zelf vastleggen</h2>
<p>Reminiscentie werkt het best als er al een basis van vastgelegde verhalen ligt om op terug te grijpen. Hoe je dat aanpakt als mantelzorger, ook wanneer het geheugen al wisselvallig is, lees je in <a href="/kennisbank/levensverhaal-vastleggen-bij-dementie-gids-mantelzorgers">deze gids voor mantelzorgers</a>.</p>

<h2>Veelgestelde vragen</h2>
<h3>Werkt reminiscentie bij elke vorm van dementie?</h3>
<p>De mate waarin verschilt per persoon en per fase. Overleg bij twijfel altijd met een zorgprofessional.</p>
<h3>Kan ik dit ook toepassen als er nog geen diagnose is, maar wel vergeetachtigheid?</h3>
<p>Ja — reminiscentie is voor iedereen een prettige, verbindende activiteit, met of zonder diagnose.</p>
""" + CTA_DUAAL,
    },

    # =========================================================================
    # 6 — Dementie: gids voor mantelzorgers (kennisbank, invalshoek C)
    # =========================================================================
    {
        "title": "Levensverhaal vastleggen bij dementie: een gids voor mantelzorgers",
        "slug": "levensverhaal-vastleggen-bij-dementie-gids-mantelzorgers",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#F1EDE4",
        "header_text_color": "#4A3B2A",
        "published_at": "2026-02-28T09:00:00+00:00",
        "meta_title": "Levensverhaal vastleggen bij dementie: gids mantelzorgers",
        "meta_description": "Ook als het geheugen wisselvallig is, valt er nog veel vast te leggen. Praktische tips voor mantelzorgers.",
        "keywords": "levensverhaal vastleggen dementie, verhaal ouder met dementie opschrijven, mantelzorger herinneringen vastleggen",
        "tags": "dementie, mantelzorg, levensverhaal, zorg",
        "excerpt": "Een diagnose dementie voelt vaak als een deur die dichtgaat. Er is nog veel dat open kan blijven — als je op tijd begint.",
        "content": """<p><strong>In het kort:</strong> een diagnose dementie betekent niet dat het te laat is om herinneringen vast te leggen. In de goede momenten, met de juiste aanpak, kan er nog veel worden opgehaald en bewaard — en het proces zelf kan verbindend zijn, ook als het verhaal niet compleet wordt.</p>

<p><em>Dit artikel is bedoeld als praktische steun voor mantelzorgers, niet als medisch of zorgadvies. Bij twijfel is een gesprek met de behandelend zorgprofessional altijd de eerste stap.</em></p>

<h2>Waarom nu beginnen beter is dan wachten</h2>
<p>Het is een begrijpelijke reflex om te wachten "tot er meer rust is" of "tot het beter gaat". Bij dementie werkt die logica averechts: de goede momenten van vandaag zijn niet gegarandeerd voor morgen. Beginnen zodra er ruimte is — ook al is het maar een fragment — is waardevoller dan wachten op het perfecte moment dat mogelijk niet meer komt.</p>

<h2>Wat je kunt doen in goede en mindere momenten</h2>
<p>Herinneringen ophalen gaat het makkelijkst in de betere momenten van de dag, vaak de ochtend. Gebruik reminiscentie-technieken (zie <a href="/kennisbank/waarom-oude-herinneringen-langst-blijven-alzheimer">dit artikel over waarom oude herinneringen langer blijven</a>) om een gesprek op gang te brengen: een foto, een lied, een geur. Op mindere momenten hoeft er niets geforceerd te worden — soms is er simpelweg samen zijn, zonder de druk om iets vast te leggen.</p>

<h2>Anderen betrekken</h2>
<p>Je hoeft dit niet alleen te doen. Partner, kinderen en soms ook zorgverleners kennen ieder andere fragmenten van hetzelfde verhaal. Door meerdere mensen te betrekken (zie <a href="/kennisbank/familieleden-uitnodigen-gedeelde-familie-pod">dit artikel over familieleden uitnodigen</a>) ontstaat een vollediger beeld dan één persoon in zijn eentje kan vastleggen.</p>

<blockquote>
<p><strong>De kern in één zin:</strong> je hoeft niet te wachten op een compleet verhaal — elk vastgelegd fragment is winst, ook een onvolledig verhaal heeft waarde.</p>
</blockquote>

<h2>Wat als het verhaal onvolledig blijft — en waarom dat oké is</h2>
<p>Een levensverhaal hoeft geen afgerond boek te zijn om waardevol te zijn. Losse fragmenten, herhalingen, gaten in de tijdlijn: dat is geen falen, dat is de werkelijkheid van dementie, en die werkelijkheid is zelf ook onderdeel van het verhaal. Voor veel families is juist de poging, het samen zoeken naar herinneringen, achteraf net zo waardevol als het eindresultaat.</p>

<h2>Steun en hulpmiddelen</h2>
<p>Praten is voor de meeste mensen met dementie makkelijker dan typen of lezen — dat sluit aan bij hoe het platform is opgebouwd: geen scherm vol tekst, maar een gesprek. Voor bredere ondersteuning bij mantelzorg kun je terecht bij lokale steunpunten en de huisarts.</p>

<h2>Veelgestelde vragen</h2>
<h3>Kan iemand met dementie zelf met een AI-interviewer praten?</h3>
<p>Dat verschilt sterk per persoon en fase. Vaak werkt het beter als een mantelzorger het gesprek samen begeleidt.</p>
<h3>Is het pijnlijk om te merken dat het verhaal niet compleet is?</h3>
<p>Dat kan gevoelig zijn — geef jezelf en je naaste de ruimte om dat te voelen. Het onvolledige is ook een deel van de waarheid.</p>
""" + CTA_DUAAL,
    },

    # =========================================================================
    # 7 — Levensverhaal vastleggen bij ongeneeslijke ziekte (kennisbank, invalshoek C)
    # =========================================================================
    {
        "title": "Je levensverhaal vastleggen als de tijd dringt",
        "slug": "levensverhaal-vastleggen-als-de-tijd-dringt",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#EAF1F8",
        "header_text_color": "#1E3A5F",
        "published_at": "2026-03-10T09:00:00+00:00",
        "meta_title": "Je levensverhaal vastleggen als de tijd dringt",
        "meta_description": "Wat je nog kunt vastleggen, en hoe — zonder dat het een race tegen de klok hoeft te voelen.",
        "keywords": "levensverhaal vastleggen ongeneeslijke ziekte, verhaal nalaten aan kinderen, herinneringen vastleggen bij ziekte",
        "tags": "afscheid, ziekte, nalatenschap, levensverhaal",
        "excerpt": "Als de tijd beperkt is, hoeft vastleggen geen race te worden. Wat écht telt, en hoe je daar rustig bij kunt beginnen.",
        "content": """<p><strong>In het kort:</strong> als de tijd beperkt is, voelt "je levensverhaal vastleggen" soms als nóg een taak in een tijd die al zwaar genoeg is. Dat hoeft het niet te zijn. Met de juiste prioriteiten en een laagdrempelige manier van vertellen, kan dit iets zijn dat rust brengt in plaats van druk.</p>

<p><em>Dit artikel is geschreven met zorgvuldigheid voor een gevoelig onderwerp. Er wordt bewust geen haast of verkoopdruk in de tekst gelegd — lees het rustig, op het moment dat het jou past.</em></p>

<h2>Waarom mensen dit vaak te lang uitstellen</h2>
<p>Het is een van de meest menselijke reacties: iets dat met de eindigheid van het leven te maken heeft, wordt uitgesteld omdat het geen prettig onderwerp is om over na te denken. Dat is volkomen begrijpelijk. Tegelijk merken veel families achteraf dat ze wensten dat er meer was vastgelegd — niet omdat het moest, maar omdat de stem, de manier van vertellen, de details die nooit ergens anders opgeschreven staan, achteraf onbetaalbaar blijken.</p>

<h2>Wat prioriteit heeft als de tijd beperkt is</h2>
<p>Je hoeft niet een compleet levensverhaal na te streven. Denk aan wat het meest waardevol zou zijn voor wie achterblijft:</p>
<ul>
<li>Een boodschap voor specifieke mensen, op specifieke momenten in hun leven (zie <a href="/kennisbank/hoe-werkt-de-tijdgestuurde-vrijgave-voor-familie">tijdgestuurde vrijgave</a>).</li>
<li>De verhalen die alleen jij kunt vertellen — niet de feiten die ergens anders al vastliggen.</li>
<li>Antwoorden op vragen die je dierbaren misschien nooit hardop hebben durven stellen.</li>
</ul>

<h2>Praten in plaats van schrijven</h2>
<p>Schrijven kost energie die er misschien niet is. Praten is vaak lichter, en je stem zelf is iets wat blijft — een dimensie die tekst niet kan vastleggen. Zie <a href="/kennisbank/praten-in-plaats-van-typen-hoe-werkt-audio-en-video">dit artikel over praten in plaats van typen</a> voor hoe dat in zijn werk gaat.</p>

<blockquote>
<p><strong>De kern in één zin:</strong> het gaat niet om een compleet boek, het gaat om wat er nog gezegd wil worden — in je eigen tempo, in je eigen stem.</p>
</blockquote>

<h2>Hoe familie kan helpen zonder over te nemen</h2>
<p>Familie kan ondersteunen door vragen te stellen, technische kanten te regelen, en vooral door ruimte te maken — niet door te sturen wat er verteld wordt. Dit is een van de momenten waarop luisteren belangrijker is dan begeleiden.</p>

<h2>Wat er met het verhaal gebeurt na het afronden</h2>
<p>Met tijdgestuurde vrijgave bepaal je zelf wie welk deel wanneer te zien krijgt — nu al, of pas op een later, specifiek moment. Zo blijft de regie bij jou, ook over wat er na jou gebeurt. Lees ook <a href="/kennisbank/waar-worden-mijn-levensverhalen-opgeslagen-nederlandse-servers">hoe je verhalen veilig worden bewaard</a>.</p>

<h2>Veelgestelde vragen</h2>
<h3>Moet ik dit in één keer afronden?</h3>
<p>Nee. Je kunt op elk moment stoppen en op een later moment verder gaan, in je eigen tempo.</p>
<h3>Kan een familielid dit namens iemand anders doen?</h3>
<p>Het waardevolst is het als de persoon zelf vertelt, al is het met hulp bij het opstarten. De stem en woordkeuze zijn onderdeel van wat blijft.</p>
""" + CTA_DUAAL,
    },

    # =========================================================================
    # 8 — Na het overlijden: verhaal herlezen geeft troost (kennisbank, invalshoek C)
    # =========================================================================
    {
        "title": "Na het overlijden: waarom het verhaal van een dierbare herlezen troost geeft",
        "slug": "na-het-overlijden-waarom-het-verhaal-herlezen-troost-geeft",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#F1EDE4",
        "header_text_color": "#4A3B2A",
        "published_at": "2026-03-20T09:00:00+00:00",
        "meta_title": "Na het overlijden: waarom een verhaal herlezen troost geeft",
        "meta_description": "Rouw gaat niet over vergeten, maar over een nieuwe band met wie er niet meer is. Waarom vastgelegde verhalen daarbij helpen.",
        "keywords": "rouwverwerking herinneringen, verhaal overledene herlezen, troost na overlijden, rouw en herinneringen",
        "tags": "rouw, overlijden, herinneringen, troost",
        "excerpt": "Rouw gaat zelden over loslaten. Vaker gaat het over een nieuwe manier vinden om verbonden te blijven — en een vastgelegd verhaal helpt daarbij.",
        "content": """<p><strong>In het kort:</strong> in de rouwpsychologie wordt allang niet meer gedacht in "loslaten en verdergaan", maar in het vinden van een nieuwe, blijvende band met wie er niet meer is. Een vastgelegd levensverhaal — met stem, woordkeuze en details die nergens anders bestaan — is een van de sterkste vormen die die blijvende band kan aannemen.</p>

<p><em>Dit artikel is bedoeld als zachte, informatieve steun. Het vervangt geen professionele rouwbegeleiding.</em></p>

<h2>Waarom "loslaten" niet de juiste verwachting is</h2>
<p>Lange tijd werd rouw gezien als een proces dat eindigt bij loslaten. Hedendaags onderzoek naar rouw laat een genuanceerder beeld zien: de meeste mensen verwerken verlies niet door de band met de overledene te verbreken, maar door die op een nieuwe manier voort te zetten — in herinnering, in gewoontes, in verhalen die worden doorverteld.</p>

<h2>Wat een vastgelegd verhaal daarin betekent</h2>
<p>Een foto toont hoe iemand eruitzag. Een vastgelegd verhaal — in eigen stem, eigen woorden, eigen humor — laat iemand nog even zíjn. Voor veel nabestaanden is het horen van die stem, jaren later, een van de weinige manieren om een dierbare weer heel even dichtbij te voelen.</p>

<h2>Waarom dit vaak pas achteraf wordt gewaardeerd</h2>
<p>Veel mensen realiseren zich de waarde van een vastgelegd verhaal pas nadat iemand er niet meer is — en dan is het te laat. Dat is precies waarom dit onderwerp niet moet wachten tot een crisismoment. Zie <a href="/kennisbank/levensverhaal-vastleggen-waar-begin-je">dit artikel over waar je begint</a> als je nu, op tijd, wilt starten voor iemand anders — of voor jezelf.</p>

<blockquote>
<p><strong>De kern in één zin:</strong> rouw gaat niet over vergeten. Het gaat over een nieuwe manier vinden om verbonden te blijven — en een verhaal in iemands eigen stem is daar een van de sterkste vormen van.</p>
</blockquote>

<h2>Hoe je een bestaand verhaal gebruikt in het rouwproces</h2>
<p>Er is geen juiste manier. Sommige nabestaanden herlezen of herluisteren een verhaal met regelmaat, anderen bewaren het juist voor een specifiek moment — een verjaardag, een jubileum. Met tijdgestuurde vrijgave kan een verhaal ook bewust pas op zo'n moment beschikbaar komen. Zie <a href="/kennisbank/hoe-werkt-de-tijdgestuurde-vrijgave-voor-familie">dit artikel</a>.</p>

<h2>Als er nog geen verhaal is vastgelegd</h2>
<p>Ook zonder een compleet, vooraf vastgelegd verhaal kan familie samen herinneringen ophalen en vastleggen na een overlijden — als een gezamenlijk proces van herdenken. Zie <a href="/kennisbank/familieleden-uitnodigen-gedeelde-familie-pod">dit artikel over familieleden uitnodigen</a> voor hoe je dat samen doet.</p>

<h2>Veelgestelde vragen</h2>
<h3>Is het niet te pijnlijk om een stem terug te horen?</h3>
<p>Dat verschilt per persoon en moment. Voor velen is het juist troostend, al kan het in het begin ook overweldigend zijn — er is geen goed of fout tempo.</p>
<h3>Kan ik ook nu al beginnen met vastleggen, voor later?</h3>
<p>Ja, en dat is precies het advies: begin voordat het moet, niet pas wanneer het te laat is.</p>
""" + CTA_DUAAL,
    },

    # =========================================================================
    # 9 — Met pensioen: volgende hoofdstuk (blog, invalshoek B)
    # =========================================================================
    {
        "title": "Met pensioen: je volgende hoofdstuk begint met een terugblik",
        "slug": "met-pensioen-je-volgende-hoofdstuk-begint-met-een-terugblik",
        "section": "blog",
        "header_type": "color",
        "header_color": "#EAF1F8",
        "header_text_color": "#1E3A5F",
        "published_at": "2026-03-30T09:00:00+00:00",
        "meta_title": "Met pensioen: je volgende hoofdstuk begint met een terugblik",
        "meta_description": "Pensioen is geen eindpunt, maar een overgang. Waarom terugblikken op je werkende leven het begin kan zijn van iets nieuws.",
        "keywords": "pensioen levensverhaal, met pensioen terugblikken, pensioen nieuw hoofdstuk, afscheid werkend leven",
        "tags": "pensioen, overgang, levensverhaal",
        "excerpt": "Een carrière van veertig jaar verdwijnt niet in een laatste werkdag. Waarom terugblikken bij pensioen meer is dan nostalgie.",
        "content": """<p><strong>In het kort:</strong> pensioen wordt vaak gevierd met een cadeau vanuit collega's, maar de overgang zelf — van een leven met structuur naar een leven met vrije ruimte — verdient meer dan een taart en een toespraak. Terugblikken op je werkende leven is niet alleen nostalgie, het is een manier om bewust een nieuw hoofdstuk te beginnen.</p>

<h2>Pensioen is een overgang, geen eindpunt</h2>
<p>Veertig jaar werk laat zich niet samenvatten in een afscheidsborrel. Het is een van de grootste identiteitsovergangen die er zijn: van "wat doe je voor werk" naar een heel andere invulling van wie je bent. Die overgang verdient reflectie, niet alleen viering.</p>

<h2>Waarom terugblikken helpt bij vooruitkijken</h2>
<p>Mensen die bewust stilstaan bij wat hun werkende leven hun heeft gebracht — de mensen, de lessen, de momenten waar ze trots op zijn — starten vaak met meer richting aan hun volgende fase dan mensen die die overgang laten passeren zonder erbij stil te staan. Het gaat niet om terugkijken om te blijven hangen, maar om te begrijpen waar je vandaan komt voordat je bepaalt waar je heen wilt.</p>

<h2>Dit is geen collega-cadeau, dit is voor jezelf</h2>
<p>Anders dan een <a href="/blog/het-afscheid-dat-een-collega-nooit-vergeet">afscheidscadeau van collega's</a>, dat vanuit anderen komt, gaat dit om een project dat je voor jezelf doet — of samen met je partner of kinderen. Het is geen verplichting vanuit de werkvloer, maar een moment dat je zelf claimt.</p>

<blockquote>
<p><strong>De kern in één zin:</strong> je werkende leven verdwijnt niet met je laatste werkdag — het verdient een plek in het verhaal van je hele leven.</p>
</blockquote>

<h2>Waar je kunt beginnen</h2>
<ul>
<li>De eerste werkdag die je je nog herinnert, en wat er toen door je heen ging.</li>
<li>De collega's en momenten die je carrière hebben gevormd.</li>
<li>Wat je hoopt dat je (klein)kinderen weten over wat werk voor jou betekende.</li>
</ul>
<p>Voor structuur bij een breder overzicht van je leven, niet alleen je werk, kun je <a href="/kennisbank/de-30-hoofdstukken-van-je-leven-wat-kun-je-verwachten">dit overzicht van levenshoofdstukken</a> gebruiken.</p>

<h2>Het begin van iets nieuws</h2>
<p>Terugblikken en vooruitkijken sluiten elkaar niet uit. Voor veel mensen is het juist door het verleden een plek te geven, dat er ruimte ontstaat om aan de volgende fase te beginnen zonder onafgemaakte gedachten mee te slepen.</p>

<h2>Veelgestelde vragen</h2>
<h3>Moet ik dit vlak voor mijn pensioen doen, of kan het ook later?</h3>
<p>Er is geen juist moment — sommige mensen beginnen er juist een paar jaar ná hun pensioen mee, als de rust is gevonden.</p>
<h3>Kan mijn partner hierbij helpen?</h3>
<p>Zeker, en het kan het gesprek tussen jullie verrijken over wat er nu, samen, voor jullie beiden verandert.</p>
""" + CTA_DUAAL,
    },

    # =========================================================================
    # 10 — Levensverhaal vastleggen als emigrant (kennisbank, invalshoek A)
    # =========================================================================
    {
        "title": "Levensverhaal vastleggen als je in het buitenland woont",
        "slug": "levensverhaal-vastleggen-als-je-in-het-buitenland-woont",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#F1EDE4",
        "header_text_color": "#4A3B2A",
        "published_at": "2026-04-09T09:00:00+00:00",
        "meta_title": "Levensverhaal vastleggen als je in het buitenland woont",
        "meta_description": "Afstand maakt het lastiger om verhalen door te geven aan familie thuis. Zo overbrug je dat digitaal.",
        "keywords": "levensverhaal vastleggen buitenland, emigrant familieverhaal, Nederlanders in het buitenland herinneringen",
        "tags": "emigratie, buitenland, familie, afstand",
        "excerpt": "Duizenden kilometers tussen jou en familie thuis maken het lastiger om verhalen door te geven. Niet onmogelijk.",
        "content": """<p><strong>In het kort:</strong> emigratie brengt een extra laag aan het vastleggen van familieverhalen: fysieke afstand tot familie thuis, soms een andere taal die kinderen inmiddels spreken, en de vraag hoe je een familiegeschiedenis levend houdt over landsgrenzen heen. Dit artikel laat zien hoe dat digitaal overbrugbaar is.</p>

<h2>Waarom afstand het risico op verlies vergroot</h2>
<p>Wie in Nederland woont bij zijn ouders om de hoek, kan verhalen bijna terloops oppikken — bij het koffiedrinken, tijdens een verjaardag. Wie duizenden kilometers verderop woont, mist die terloopse momenten. Verhalen die "vanzelf" hadden kunnen worden doorgegeven, moeten dan bewust worden vastgelegd, anders gaan ze verloren.</p>

<h2>Digitaal overbruggen wat afstand tegenhoudt</h2>
<p>Een videogesprek met een ouder in Nederland kan meteen worden gebruikt om een herinnering vast te leggen, in plaats van een los telefoontje dat achteraf niet meer te reconstrueren is. Zie <a href="/kennisbank/een-ouder-op-afstand-interviewen-levensverhaal-vastleggen">dit artikel over een ouder op afstand interviewen</a> voor de praktische aanpak.</p>

<h2>Als kinderen een andere taal spreken</h2>
<p>Voor gezinnen waar de kinderen inmiddels beter Engels, Duits of een andere taal spreken dan Nederlands, is het extra belangrijk om verhalen vast te leggen zolang ze nog in de oorspronkelijke taal en met alle nuance verteld kunnen worden. Zie <a href="/kennisbank/levensverhaal-vastleggen-dialect-andere-taal">dit artikel over meertalig vastleggen</a> voor wat daarbij wel en niet werkt.</p>

<blockquote>
<p><strong>De kern in één zin:</strong> afstand maakt het overbrengen van familieverhalen lastiger, niet onmogelijk — als je het bewust aanpakt in plaats van op toeval te vertrouwen.</p>
</blockquote>

<h2>De hele familie erbij betrekken, ook over grenzen heen</h2>
<p>Een gedeeld digitaal archief werkt onafhankelijk van waar familieleden wonen. Zie <a href="/kennisbank/familieleden-uitnodigen-gedeelde-familie-pod">dit artikel over familieleden uitnodigen</a> voor hoe je dat opzet, ongeacht tijdzone of landsgrens.</p>

<h2>Waarom veiligheid hierbij extra telt</h2>
<p>Bij het delen van persoonlijke verhalen over grenzen heen is het extra relevant om te weten waar die gegevens staan en onder welk recht ze vallen. Lees <a href="/kennisbank/waar-worden-mijn-levensverhalen-opgeslagen-nederlandse-servers">dit artikel over Nederlandse servers en privacy</a>.</p>

<h2>Veelgestelde vragen</h2>
<h3>Werkt het platform ook goed vanuit een ander land?</h3>
<p>Ja, alles werkt gewoon via internet, ongeacht waar je woont.</p>
<h3>Kan ik verhalen vastleggen in een andere taal dan Nederlands?</h3>
<p>Ja, zie <a href="/kennisbank/levensverhaal-vastleggen-dialect-andere-taal">dit artikel</a> voor de mogelijkheden en beperkingen.</p>
""" + CTA_DUAAL,
    },

    # =========================================================================
    # 11 — Cadeau 40 jaar getrouwd (blog, invalshoek B)
    # =========================================================================
    {
        "title": "Cadeau 40 jaar getrouwd: een huwelijksjubileum dat je vastlegt",
        "slug": "cadeau-40-jaar-getrouwd-huwelijksjubileum",
        "section": "blog",
        "header_type": "color",
        "header_color": "#EAF1F8",
        "header_text_color": "#1E3A5F",
        "published_at": "2026-04-19T09:00:00+00:00",
        "meta_title": "Cadeau 40 jaar getrouwd: huwelijksjubileum vastleggen",
        "meta_description": "Weer bloemen of een weekendje weg? Dit cadeau legt vast wat veertig jaar huwelijk werkelijk heeft opgeleverd.",
        "keywords": "cadeau 40 jaar getrouwd, huwelijksjubileum cadeau, cadeau rubberen bruiloft, origineel huwelijksjubileum cadeau",
        "tags": "cadeau, huwelijksjubileum, huwelijk",
        "excerpt": "Veertig jaar huwelijk verdient meer dan bloemen. Een cadeau dat het verhaal van dat huwelijk zelf vastlegt.",
        "content": """<p><strong>In het kort:</strong> een huwelijksjubileum zoals veertig jaar getrouwd wordt vaak gevierd met een etentje of een cadeaubon, maar het meest bijzondere cadeau is het verhaal van het huwelijk zelf — hoe het begon, wat het overleefde, wat het bijzonder maakt.</p>

<h2>Waarom het gebruikelijke cadeau tekortschiet</h2>
<p>Na veertig jaar samen hebben de meeste stellen weinig behoefte aan nog een voorwerp. Wat ze zelden krijgen, is de kans om het verhaal van hun huwelijk zelf terug te horen — verteld door henzelf, met alle details die alleen zij nog weten.</p>

<h2>Wat dit cadeau anders maakt</h2>
<p>In plaats van een cadeau dat je aan het stel geeft, geef je hen de gelegenheid om samen terug te blikken: hoe ze elkaar ontmoetten, de moeilijke jaren die ze doorkwamen, de grappen die alleen zij nog snappen. Dat verhaal vastgelegd, is een cadeau dat na het jubileum blijft groeien in waarde.</p>

<h2>Hoe je het cadeau vormgeeft</h2>
<ul>
<li><strong>Begin met een gezamenlijk gesprek</strong> op de dag van het jubileum zelf: laat het stel samen de eerste herinnering inspreken, over hoe ze elkaar leerden kennen.</li>
<li><strong>Betrek de kinderen</strong>: laat hen gerichte vragen voorbereiden over momenten die zij zich herinneren.</li>
<li><strong>Bouw het verder op</strong> in de weken na het jubileum, in het eigen tempo van het stel.</li>
</ul>

<blockquote>
<p><strong>De kern in één zin:</strong> na veertig jaar huwelijk is het verhaal zelf het waardevolste bezit — dit cadeau legt dat vast voordat het vervaagt.</p>
</blockquote>

<h2>Ook geschikt voor andere jubilea</h2>
<p>Deze aanpak werkt net zo goed bij een 25-jarig (zilveren) of 50-jarig (gouden) huwelijksjubileum — het gaat niet om het specifieke aantal jaren, maar om het moment dat uitnodigt tot terugblikken.</p>

<h2>Veelgestelde vragen</h2>
<h3>Wat als het stel niet zo van aandacht houdt?</h3>
<p>Begin dan klein en privé: geen groot moment, gewoon een rustig gesprek tussen hen samen, zonder toeschouwers.</p>
<h3>Kan dit ook als groepscadeau van de hele familie?</h3>
<p>Ja, zie <a href="/kennisbank/familieleden-uitnodigen-gedeelde-familie-pod">dit artikel over familieleden uitnodigen</a> voor hoe iedereen kan bijdragen.</p>
""" + CTA_DUAAL,
    },

    # =========================================================================
    # 12 — Moederdag-cadeau (blog, invalshoek B, seizoensgebonden)
    # =========================================================================
    {
        "title": "Moederdag-cadeau: het verhaal dat ze nog niet heeft",
        "slug": "moederdag-cadeau-het-verhaal-dat-ze-nog-niet-heeft",
        "section": "blog",
        "header_type": "color",
        "header_color": "#F1EDE4",
        "header_text_color": "#4A3B2A",
        "published_at": "2026-04-27T09:00:00+00:00",
        "meta_title": "Moederdag-cadeau: het verhaal dat ze nog niet heeft",
        "meta_description": "Geen bloemen die na een week verwelken — een cadeau dat blijft. Zo maak je van Moederdag iets blijvends.",
        "keywords": "moederdag cadeau origineel, moederdag cadeau bijzonder, moederdag cadeau 2026",
        "tags": "cadeau, moederdag, moeder",
        "excerpt": "Bloemen verwelken binnen een week. Dit cadeau groeit juist, jaar na jaar.",
        "content": """<p><strong>In het kort:</strong> bloemen en chocolade zijn fijn, maar vergeten binnen een paar dagen. Het cadeau dat écht blijft hangen op Moederdag, is er een dat groeit in plaats van verwelkt: het verhaal van haar eigen leven, in haar eigen woorden.</p>

<h2>Waarom de gebruikelijke cadeaus zo snel vervliegen</h2>
<p>Een bos bloemen is lief, maar over twee weken weg. Een cadeaubon wordt besteed en vergeten. Dat is niet erg — het hoort bij het ritueel van de dag. Maar als je op zoek bent naar iets dat verder reikt dan die ene zondag, is er een andere categorie cadeaus die het overwegen waard is.</p>

<h2>Een cadeau dat groeit in plaats van verwelkt</h2>
<p>Een vastgelegd levensverhaal begint klein — een paar herinneringen, een eerste hoofdstuk — en groeit in de maanden en jaren erna. Elk gesprek voegt iets toe. Waar bloemen na een week worden weggegooid, wordt dit cadeau juist waardevoller naarmate de tijd verstrijkt.</p>

<h2>Hoe je het cadeau vormgeeft</h2>
<ul>
<li><strong>Begin het samen op Moederdag zelf</strong>: maak een gratis account aan en spreek samen de eerste herinnering in.</li>
<li><strong>Stel gerichte vragen</strong> die verder gaan dan het gebruikelijke — zie <a href="/kennisbank/interview-ouders-25-vragen">deze 25 vragen</a> als startpunt.</li>
<li><strong>Betrek de kinderen erbij</strong>: laat kleinkinderen meeluisteren of zelf vragen stellen.</li>
</ul>

<blockquote>
<p><strong>De kern in één zin:</strong> het meest gegeven cadeau met Moederdag is er over twee weken vergeten. Dit niet.</p>
</blockquote>

<h2>Voor moeders die niet van "gedoe" houden</h2>
<p>Sommige moeders vinden het ongemakkelijk om in het middelpunt te staan, of ervaren "een taak" als extra druk. Daarom werkt dit cadeau het best als het geen verplichting wordt, maar een uitnodiging: geen verwachting om meteen alles te vertellen, gewoon een gesprek, wanneer het haar uitkomt.</p>

<h2>Veelgestelde vragen</h2>
<h3>Werkt dit ook als cadeau voor een moeder die niet zo van schrijven houdt?</h3>
<p>Juist dan: ze praat, wij structureren. Geen schrijfwerk nodig.</p>
<h3>Kan ik dit cadeau ook combineren met iets tastbaars?</h3>
<p>Zeker — een vastgelegd verhaal kan later worden geëxporteerd naar een tastbaar boek. Zie <a href="/kennisbank/van-digitaal-verhaal-naar-tastbaar-levensboek-exporteren">dit artikel over exporteren</a>.</p>
""" + CTA_DUAAL,
    },

    # =========================================================================
    # 13 — Meertalig levensverhaal vastleggen (kennisbank, invalshoek A)
    # =========================================================================
    {
        "title": "Levensverhaal vastleggen in dialect of een andere taal",
        "slug": "levensverhaal-vastleggen-dialect-andere-taal",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#EAF1F8",
        "header_text_color": "#1E3A5F",
        "published_at": "2026-05-08T09:00:00+00:00",
        "meta_title": "Levensverhaal vastleggen in dialect of een andere taal",
        "meta_description": "Niet iedereen vertelt het liefst in het Nederlands. Wat kan en wat de beperkingen zijn bij meertalig vastleggen.",
        "keywords": "levensverhaal vastleggen andere taal, dialect transcriptie, meertalig levensverhaal",
        "tags": "taal, dialect, transcriptie, meertalig",
        "excerpt": "Sommige verhalen klinken alleen echt in het dialect waarin ze zijn beleefd. Wat kan onze transcriptietechniek daarmee, en wat niet?",
        "content": """<p><strong>In het kort:</strong> onze transcriptietechniek (Whisper large-v3) werkt goed in het Nederlands en de meest gesproken talen, en heeft ook enige mate van herkenning voor sterke dialecten. Bij zwaardere streektalen kan de nauwkeurigheid afnemen. We zijn daar liever eerlijk over dan dat we iets beloven wat de techniek niet waarmaakt.</p>

<h2>Waarom taal een drempel kan zijn</h2>
<p>Een levensverhaal vertelt het sterkst in de taal waarin het ook beleefd is. Voor sommige mensen is dat een dialect, voor anderen een andere taal dan het Nederlands waarin ze inmiddels dagelijks leven. Dat een platform in het Nederlands is opgebouwd, betekent niet automatisch dat het verhaal ook alleen in het Nederlands verteld kan worden.</p>

<h2>Wat de transcriptietechniek wel en niet goed doet</h2>
<p>We gebruiken Whisper large-v3 voor transcriptie, een van de meest geavanceerde spraak-naar-tekstmodellen die er zijn. Dat model is sterk in Nederlands en een groot aantal andere talen. Voor gangbaar Nederlands, ook met een regionaal accent, is de nauwkeurigheid doorgaans hoog.</p>

<h2>Dialect: wat werkt, wat niet</h2>
<p>Bij lichte tot gemiddelde tongval (bijvoorbeeld een Brabants, Limburgs of Gronings accent binnen het Nederlands) presteert de transcriptie doorgaans goed. Bij zwaar dialect dat qua woordenschat en klank sterk afwijkt van standaard-Nederlands (bijvoorbeeld authentiek Fries of een streektaal met veel eigen woorden), kan de nauwkeurigheid merkbaar afnemen — net zoals dat voor een mens die het dialect niet kent, ook lastiger te verstaan zou zijn.</p>

<h2>Tips om de kwaliteit te verbeteren</h2>
<ul>
<li>Spreek rustig en in een omgeving zonder veel achtergrondgeluid.</li>
<li>Controleer de transcriptie na afloop en corrigeer waar nodig — dit blijft altijd mogelijk.</li>
<li>Bij twijfel: begin met een korte testopname om te zien hoe de transcriptie met jouw manier van spreken omgaat.</li>
</ul>

<blockquote>
<p><strong>De kern in één zin:</strong> de techniek doet veel, maar niet alles — en we zijn daar liever eerlijk over dan dat we een belofte doen die we niet waarmaken.</p>
</blockquote>

<h2>Eerlijk over de grenzen</h2>
<p>Geen enkel spraakherkenningsmodel is op dit moment perfect voor elk dialect of elke taal. Waar de transcriptie tekortschiet, blijft het altijd mogelijk om tekst handmatig aan te vullen of te corrigeren — het verhaal zelf gaat nooit verloren, ook niet als de eerste automatische versie niet perfect is. Meer over hoe opnemen in zijn werk gaat lees je in <a href="/kennisbank/praten-in-plaats-van-typen-hoe-werkt-audio-en-video">dit artikel</a>.</p>

<h2>Ook relevant bij emigratie</h2>
<p>Voor Nederlanders die in het buitenland wonen en een andere voertaal gebruiken, speelt dit onderwerp extra: zie <a href="/kennisbank/levensverhaal-vastleggen-als-je-in-het-buitenland-woont">dit artikel over levensverhaal vastleggen vanuit het buitenland</a>.</p>

<h2>Veelgestelde vragen</h2>
<h3>In welke talen kan ik mijn verhaal het beste vertellen?</h3>
<p>Nederlands en de meest gangbare wereldtalen geven doorgaans de meest nauwkeurige transcriptie.</p>
<h3>Kan ik zelf de transcriptie corrigeren als er iets misgaat?</h3>
<p>Ja, je kunt de tekst op elk moment nalezen en aanpassen.</p>
""" + CTA_DUAAL,
    },

    # =========================================================================
    # 14 — Kerstcadeau: familiearchief onder de boom (blog, invalshoek B)
    # =========================================================================
    {
        "title": "Een familiearchief onder de kerstboom: zo begin je op tijd",
        "slug": "familiearchief-onder-de-kerstboom",
        "section": "blog",
        "header_type": "color",
        "header_color": "#F1EDE4",
        "header_text_color": "#4A3B2A",
        "published_at": "2026-05-18T09:00:00+00:00",
        "meta_title": "Een familiearchief onder de kerstboom: zo begin je op tijd",
        "meta_description": "Het meest gegeven cadeau met kerst is er over drie maanden vergeten. Dit niet.",
        "keywords": "origineel kerstcadeau familie, kerstcadeau ouders bijzonder, kerstcadeau dat blijft",
        "tags": "cadeau, kerst, familie",
        "excerpt": "De meeste kerstcadeaus zijn in het nieuwe jaar alweer vergeten. Een familiearchief werkt andersom: het begint pas echt te groeien na kerst.",
        "content": """<p><strong>In het kort:</strong> de meeste kerstcadeaus zijn in januari alweer vergeten. Een familiearchief werkt precies andersom — het cadeau begint pas echt te groeien nádat het is uitgepakt. Dit artikel legt uit hoe je er op tijd mee begint.</p>

<h2>Waarom spullen met kerst extra snel vergeten worden</h2>
<p>Onder de kerstboom liggen vaak de meeste cadeaus van het jaar, en juist daardoor vervagen ze ook het snelst — het ene cadeau overschaduwt het andere, en in januari is het moeilijk je zelfs nog te herinneren wat er precies is uitgepakt. Een cadeau dat wíl blijven hangen, heeft iets anders nodig dan nóg een doos onder de boom.</p>

<h2>Het cadeau van "beginnen", niet van "af zijn"</h2>
<p>Een familiearchief is geen kant-en-klaar object dat je uitpakt en waarmee het verhaal klaar is. Het is een cadeau dat je samen begint, en dat na kerst pas echt op gang komt: een eerste herinnering met kerst zelf, gevolgd door meer gesprekken in de maanden erna. Zo blijft het cadeau relevant, lang nadat de kerstboom is opgeruimd.</p>

<h2>Hoe je het inpakt en aankondigt</h2>
<p>Praktisch is dit eenvoudig: maak vooraf een gratis account aan, en print of schrijf een korte uitleg die je onder de boom legt — een "belofte" in plaats van een voorwerp. Op eerste of tweede kerstdag zelf kun je meteen samen de eerste herinnering inspreken, wat het cadeau direct tastbaar maakt zonder dat er iets fysiek hoeft te zijn ingepakt.</p>

<blockquote>
<p><strong>De kern in één zin:</strong> het meest gegeven cadeau met kerst is over drie maanden vergeten. Dit cadeau is er dan juist pas net aan het groeien.</p>
</blockquote>

<h2>Tijdlijn: wanneer starten voor kerst</h2>
<ul>
<li><strong>Begin november:</strong> account aanmaken en de eerste vragen verzamelen die je met kerst wilt stellen.</li>
<li><strong>Eerste of tweede kerstdag:</strong> samen de eerste herinnering inspreken — dit is het moment van "uitpakken".</li>
<li><strong>Januari en verder:</strong> in eigen tempo verder bouwen, met bijvoorbeeld <a href="/kennisbank/interview-ouders-25-vragen">deze 25 vragen</a> als leidraad.</li>
</ul>

<h2>Veelgestelde vragen</h2>
<h3>Is dit ook geschikt als kerstcadeau voor de hele familie samen?</h3>
<p>Ja — zie <a href="/kennisbank/familieleden-uitnodigen-gedeelde-familie-pod">dit artikel over familieleden uitnodigen</a> voor hoe je iedereen betrekt.</p>
<h3>Kan het cadeau later ook tastbaar gemaakt worden?</h3>
<p>Ja, via export naar een gedrukt boek — zie <a href="/kennisbank/van-digitaal-verhaal-naar-tastbaar-levensboek-exporteren">dit artikel</a>.</p>
""" + CTA_DUAAL,
    },

]


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed SEO-contentplan 2026 voor BewaardVoorJou.nl")
    parser.add_argument("--email", required=True, help="Admin e-mailadres")
    parser.add_argument("--password", required=True, help="Admin wachtwoord")
    parser.add_argument(
        "--url",
        default="http://localhost:8001/api/v1",
        help="API base-url (default: lokaal)",
    )
    args = parser.parse_args()

    token = login(args.url, args.email, args.password)
    print(f"Ingelogd. {len(ARTICLES)} artikelen worden aangemaakt op {args.url}\n")
    for article in ARTICLES:
        create_and_publish(args.url, token, dict(article))
    print("\nKlaar.")


if __name__ == "__main__":
    main()
