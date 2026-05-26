#!/usr/bin/env python3
"""
Update script voor BewaardVoorJou.nl kennisbank.

Patcht alle 15 bestaande kennisbank artikelen met:
- Interne links naar gerelateerde kennisbank artikelen
- Externe links naar gezaghebbende bronnen
- Verbeterde H2/H3 structuur
- Blockquote tips en highlights
- Geoptimaliseerde meta content

Gebruik:
  python update_kennisbank.py --email admin@example.com --password ww
  python update_kennisbank.py --email admin@example.com --password ww --url https://api.bewaardvoorjou.nl/api/v1
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


def get_article_id(base_url: str, slug: str) -> str | None:
    resp = requests.get(f"{base_url}/blog/public/slug/{slug}")
    if resp.status_code == 200:
        return resp.json().get("id")
    return None


def update_article(base_url: str, token: str, slug: str, payload: dict) -> None:
    headers = {"Authorization": f"Bearer {token}"}
    article_id = get_article_id(base_url, slug)
    if not article_id:
        print(f"  Niet gevonden (slug): {slug}")
        return
    resp = requests.patch(f"{base_url}/blog/{article_id}", json=payload, headers=headers)
    if resp.status_code in (200, 201):
        print(f"  Bijgewerkt: {payload.get('title', slug)}")
    else:
        print(f"  Fout bij bijwerken {slug}: {resp.status_code} {resp.text[:200]}")


# ---------------------------------------------------------------------------
# Alle 15 optimized kennisbank artikelen
# ---------------------------------------------------------------------------

ARTICLES = [

    # =========================================================================
    # CATEGORIE A: Beginnen met je levensverhaal
    # =========================================================================

    {
        "slug": "hoe-begin-ik-met-het-vastleggen-van-mijn-levensverhaal",
        "title": "Hoe begin ik met het vastleggen van mijn levensverhaal?",
        "meta_title": "Hoe begin ik met mijn levensverhaal? Stap-voor-stap gids | BewaardVoorJou.nl",
        "meta_description": "Begin vandaag nog met je levensverhaal. Ontdek waarom één herinnering genoeg is om te starten, hoe de AI-interviewer je begeleidt en welke structuur je helpt. Gratis proberen.",
        "keywords": "levensverhaal vastleggen beginnen, biografie starten, herinneringen bewaren, levensverhaal ouderen, hoe schrijf je een biografie, levensverhaal beginnen tips",
        "excerpt": "Het vastleggen van je levensverhaal begint niet met het schrijven van een heel boek, maar met het uitspreken van één enkele herinnering. BewaardVoorJou.nl begeleidt je stap voor stap door dertig hoofdstukken, zodat jouw unieke verhaal bewaard blijft voor de mensen die jou lief zijn.",
        "content": """<blockquote>
<p><strong>In het kort:</strong> Je hebt geen schrijftalent, geen speciale apparatuur en geen vrije dag nodig om te beginnen. Eén herinnering, hardop uitgesproken, is genoeg. BewaardVoorJou.nl begeleidt je daarna stap voor stap door dertig hoofdstukken — in jouw eigen tempo, op jouw eigen manier.</p>
</blockquote>

<p>Misschien heb je het al vaker gedacht: <em>"Ik moet mijn verhalen ergens bewaren voordat ik ze vergeet."</em> Of misschien zei jouw vader of moeder het vroeger, en vraag je je nu af wat er verloren is gegaan. Die gedachte is niet voor niets. Levensverhalen zijn de enige erfenis die niet te kopen is.</p>

<p>Toch blijft beginnen voor de meeste mensen een grote stap. In dit artikel lees je precies waarom dat gevoel er is, en hoe je het vandaag nog overwint.</p>

<h2>Waarom jouw levensverhaal ertoe doet voor de volgende generatie</h2>

<p>Onderzoek van de Amerikaanse psychologen Marshall Duke en Robyn Fivush (Emory University) toont aan dat kinderen die de verhalen van hun ouders en grootouders kennen, veerkrachtiger zijn en een sterkere identiteit hebben. Ze weten waar ze vandaan komen — en dat geeft houvast, zeker in een wereld die zo snel verandert.</p>

<p>In Nederland werkt <a href="https://www.reminiscentiewerk.nl/" target="_blank" rel="noopener noreferrer">Reminiscentiewerk Nederland</a> al jaren met bewezen methoden die aantonen dat het ophalen en delen van levensverhalen niet alleen goed is voor de familie, maar ook voor degene die vertelt. Het ordent gedachten, geeft betekenis aan het verleden en versterkt het gevoel van eigenwaarde.</p>

<p>BewaardVoorJou.nl bouwt voort op diezelfde inzichten. Elke vraag die de AI-interviewer stelt, is zorgvuldig ontworpen om jou te helpen — niet om een formulier in te vullen.</p>

<h2>De grootste drempel: waarom beginnen zo moeilijk voelt</h2>

<p>De meest gehoorde reden waarom mensen nooit beginnen is niet luiheid of tijdgebrek. Het is de overweldiging van het idee zelf: <em>"Mijn leven is zo groot. Waar begin ik?"</em></p>

<p>Het antwoord is: begin niet bij het begin. Begin bij een herinnering die vandaag spontaan bij je opkomt. Een geur uit de keuken van je grootmoeder. De fiets waarmee je naar school reed. De avond waarop je je partner voor het eerst ontmoette.</p>

<p>Dat ene moment is het startpunt. Alles wat daarna komt, volgt vanzelf.</p>

<blockquote>
<p><strong>Tip:</strong> Leg je telefoon voor je neer en stel jezelf één vraag: <em>"Wat is de eerste herinnering die nu bij me opkomt?"</em> Schrijf het antwoord op of spreek het in. Dat is jouw levensverhaal — het is al begonnen.</p>
</blockquote>

<h2>De kracht van structuur: hoe dertig hoofdstukken je bevrijden</h2>

<p>BewaardVoorJou.nl begeleidt je door <a href="/kennisbank/de-30-hoofdstukken-van-je-leven-wat-kun-je-verwachten">dertig zorgvuldig ontworpen hoofdstukken</a>, verdeeld over vijf levensfasen. Die structuur is niet willekeurig. Ze is gebaseerd op bewezen narratieve technieken en inzichten uit de levensverhaaltherapie.</p>

<ul>
<li><strong>Fase 1 — Vroege jeugd (0–12 jaar):</strong> Je eerste herinneringen, je thuis, de mensen die je vroeg hebben gevormd.</li>
<li><strong>Fase 2 — Jongvolwassenheid (12–25 jaar):</strong> Vriendschappen, eerste liefde, keuzes en dromen.</li>
<li><strong>Fase 3 — Volwassenheid (25–45 jaar):</strong> Werk, gezin, verantwoordelijkheid en grote beslissingen.</li>
<li><strong>Fase 4 — Rijpheid (45–65 jaar):</strong> Oogsten, loslaten en herontdekken wie je bent.</li>
<li><strong>Fase 5 — Wijsheid (65+ jaar):</strong> Terugkijken, dankbaarheid en de lessen die je wilt doorgeven.</li>
</ul>

<p>Je hoeft niet bij fase 1 te beginnen. Je kiest zelf het tempo, de volgorde en de diepte. En als je vastloopt, helpt de <a href="/kennisbank/wat-doet-de-ai-interviewer-precies">AI-interviewer</a> je verder met concrete, doorvragende vragen.</p>

<h2>Welke methode past bij jou?</h2>

<p>Niet iedereen is een schrijver — en dat hoeft ook niet. Je kiest helemaal zelf hoe je jouw herinneringen vastlegt:</p>

<ul>
<li><strong>Audio:</strong> Spreek je verhaal in via de microfoon van je telefoon of laptop. De app transcribeert automatisch.</li>
<li><strong>Video:</strong> Vertel je verhaal rechtstreeks in de camera. Zo bewaar je ook je stem, je glimlach en je expressie.</li>
<li><strong>Tekst:</strong> Typ je het liever zelf? Dat kan uiteraard ook.</li>
</ul>

<p>Ben je geen schrijver en weet je niet goed hoe te beginnen? Lees dan ook: <a href="/kennisbank/ik-ben-geen-schrijver-kan-ik-bewaardvoorjou-toch-gebruiken">Ik ben geen schrijver — kan ik BewaardVoorJou.nl toch gebruiken?</a></p>

<h2>Drie praktische stappen voor vandaag</h2>

<ol>
<li><strong>Kies één herinnering</strong> — niet de belangrijkste, maar de eerste die nu opkomt.</li>
<li><strong>Zeg het hardop</strong> — aan jezelf, een huisdier of een plant. Zeggen is makkelijker dan schrijven.</li>
<li><strong>Open BewaardVoorJou.nl</strong> — maak een gratis account aan en begin met het eerste hoofdstuk. Geen planning nodig. Alleen beginnen.</li>
</ol>

<p>Wil je eerst weten hoe het aanmaken van een account werkt? Lees <a href="/kennisbank/stapsgewijze-handleiding-je-eerste-herinnering-opnemen">de stap-voor-stap handleiding voor je eerste opname</a>.</p>

<hr>

<h2>Veelgestelde vragen over beginnen</h2>

<h3>Moet ik mijn leven chronologisch vertellen?</h3>
<p>Nee. Je kunt beginnen bij welk hoofdstuk dan ook. Veel mensen beginnen bij een periode die hen nu het meest bezighoudt en werken van daaruit verder.</p>

<h3>Hoe lang duurt het om mijn levensverhaal vast te leggen?</h3>
<p>Dat hangt volledig van jou af. Sommige mensen werken een uur per week en zijn na een paar maanden klaar. Anderen blijven jaren aanvullen. Er is geen deadline.</p>

<h3>Wat als ik een herinnering liever voor mezelf houd?</h3>
<p>Elk hoofdstuk is standaard privé. Jij beslist wat je deelt met familie, en wanneer.</p>

<h3>Heb ik speciale apparatuur nodig?</h3>
<p>Nee. Een telefoon, tablet of computer met internetverbinding is alles wat je nodig hebt.</p>

<h3>Wat als ik ergens vastloopt?</h3>
<p>Dan helpt de AI-interviewer je verder. Elke vraag die te moeilijk is, kun je overslaan en later terugkomen.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag nog helemaal gratis uit — geen creditcard nodig, binnen één minuut start je je eerste herinnering.</p>

<p><a href="/register">Start nu gratis met vertellen →</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "slug": "de-30-hoofdstukken-van-je-leven-wat-kun-je-verwachten",
        "title": "De 30 hoofdstukken van je leven: wat kun je verwachten?",
        "meta_title": "De 30 hoofdstukken van je levensverhaal uitgelegd | BewaardVoorJou.nl",
        "meta_description": "Ontdek hoe de 30 hoofdstukken van BewaardVoorJou.nl jouw levensverhaal structureren. Van vroege jeugd tot wijsheid — elk hoofdstuk heeft zijn eigen focus en vragen.",
        "keywords": "30 hoofdstukken levensverhaal, levensfasen biografie, structuur levensverhaal, levensverhaal onderwerpen, biografie schrijven structuur",
        "excerpt": "BewaardVoorJou.nl begeleidt je door dertig zorgvuldig ontworpen hoofdstukken, verdeeld over vijf levensfasen. Van je vroegste herinneringen tot de wijsheid die je wilt doorgeven.",
        "content": """<blockquote>
<p><strong>In het kort:</strong> De dertig hoofdstukken van BewaardVoorJou.nl zijn geen willekeurige lijst vragen. Ze zijn gebouwd op bewezen narratieve technieken, verdeeld over vijf levensfasen. Elk hoofdstuk is behapbaar (30–90 minuten), en je kiest zelf de volgorde en het tempo.</p>
</blockquote>

<p>Een levensverhaal zonder structuur voelt als een la vol losse foto's — prachtig, maar chaotisch. De dertig hoofdstukken van BewaardVoorJou.nl geven jou een helder pad zonder je vrijheid in te perken. Denk aan een wandeling door je eigen leven, waarbij de kaart er altijd is maar jij bepaalt hoe je loopt.</p>

<h2>Waarom dertig hoofdstukken de juiste balans bieden</h2>

<p>Te breed en mensen blokkeren (<em>"Vertel eens over je hele leven"</em>). Te smal en verhalen missen diepgang. Dertig hoofdstukken zijn het resultaat van uitgebreid onderzoek naar levensverhaaltherapie en autobiografisch schrijven. Per hoofdstuk ben je gemiddeld dertig tot negentig minuten bezig — lang genoeg voor echte diepgang, kort genoeg om niet overweldigd te raken.</p>

<p>Wil je weten hoe je überhaupt begint? Lees dan eerst <a href="/kennisbank/hoe-begin-ik-met-het-vastleggen-van-mijn-levensverhaal">hoe je start met het vastleggen van je levensverhaal</a>.</p>

<h2>Fase 1: Vroege jeugd (0–12 jaar)</h2>

<p>De eerste levensfase bevat de hoofdstukken over jouw vroegste herinneringen, jouw thuis, jouw familie en de mensen die jou als kind hebben gevormd. Vragen gaan over je geboorteplaats, je eerste schooldag, bijzondere tradities en de verhalen die je als kind hoorde.</p>

<p>Veel mensen zijn verrast hoe levendig herinneringen worden als de juiste vragen worden gesteld. Een geur, een geluid of een oud liedje dat de AI-interviewer noemt, kan plotseling een schat aan herinneringen openen die decennia verborgen waren.</p>

<blockquote>
<p><strong>Tip:</strong> Heb je moeite met herinneringen aan je vroege jeugd? Bekijk dan voor je sessie wat oude foto's of vraag een broer, zus of neef om een herinnering te delen. Lees ook: <a href="/kennisbank/tips-om-herinneringen-op-te-halen-voor-je-biografie">tips om herinneringen op te halen voor je biografie</a>.</p>
</blockquote>

<h2>Fase 2: Jongvolwassenheid (12–25 jaar)</h2>

<p>De tweede fase gaat over de jaren waarin je jezelf begon te ontdekken: vriendschappen, eerste liefde, keuzes voor opleiding of beroep, dromen en teleurstellingen. Dit zijn de meest vormende jaren, en tegelijk de jaren waarover het minst gesproken wordt.</p>

<p>De vragen in deze fase zijn bewust open en uitnodigend. Er is geen oordeel. Geen antwoord is fout. Het gaat om jouw beleving, jouw waarheid.</p>

<h2>Fase 3: Volwassenheid (25–45 jaar)</h2>

<p>De derde fase belicht de grote beslissingen: een partner kiezen, kinderen krijgen of juist niet, een carrière opbouwen, rouwen. Dit zijn de jaren van verantwoordelijkheid en van keuzes met langetermijngevolgen.</p>

<p>De vragen in deze fase helpen zichtbaar te maken hoe bijzonder en moedig die alledaagse keuzes eigenlijk waren — ook als ze op dat moment gewoon "dingen waren die gedaan moesten worden."</p>

<h2>Fase 4: Rijpheid (45–65 jaar)</h2>

<p>De vierde fase is er een van oogsten en loslaten: kinderen die het huis uitgaan, ouders die overlijden, een carrière die verandert. Maar ook: de vrijheid die groeit en de herbezinning op wat echt belangrijk is.</p>

<p>Veel gebruikers van BewaardVoorJou.nl geven aan dat juist deze fase hen het meest raakt — het is de fase waarin je voor het eerst écht begint terug te kijken én vooruit te kijken tegelijk.</p>

<h2>Fase 5: Wijsheid (65+ jaar)</h2>

<p>De vijfde fase is de fase van doorgeven. Wat heb je geleerd? Wat zou je anders doen? Welke waarden wil je meegeven? Dit zijn de hoofdstukken die na jouw leven het langst blijven leven. Ze vormen de erfenis die niet gekocht of verkocht kan worden.</p>

<p>De <a href="https://www.reminiscentiewerk.nl/" target="_blank" rel="noopener noreferrer">Nederlandse Stichting Reminiscentiewerk</a> werkt al decennia met soortgelijke methoden in de ouderenzorg. De ervaringen bevestigen telkens hetzelfde: het vertellen van levensverhalen is heilzaam, zowel voor de verteller als de luisteraar.</p>

<h2>Hoe de hoofdstukken op elkaar aansluiten</h2>

<p>Een bijzonder kenmerk van BewaardVoorJou.nl is dat de <a href="/kennisbank/wat-doet-de-ai-interviewer-precies">AI-interviewer verbanden legt tussen hoofdstukken</a>. Als je in fase 2 vertelt over een droom die je had, kan de interviewer in fase 4 vragen of je die droom hebt kunnen waarmaken. Zo wordt jouw levensverhaal geen verzameling losse fragmenten, maar een samenhangend geheel.</p>

<hr>

<h2>Veelgestelde vragen over de hoofdstukken</h2>

<h3>Moet ik alle dertig hoofdstukken afronden?</h3>
<p>Nee. Sommige mensen werken alle dertig volledig af. Anderen focussen op de hoofdstukken die hen het meest aanspreken. Alles wat je invult is waardevol, ook als het maar één hoofdstuk is.</p>

<h3>Kan ik een hoofdstuk later aanvullen?</h3>
<p>Ja, altijd. Een hoofdstuk is nooit "klaar". Je kunt op elk moment terugkeren om een herinnering toe te voegen of een antwoord te bewerken.</p>

<h3>In welke volgorde werk ik de hoofdstukken af?</h3>
<p>In welke volgorde je maar wilt. De meeste mensen beginnen bij fase 1, maar anderen starten bij een periode die nu actueel is in hun leven.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag nog helemaal gratis uit — geen creditcard nodig.</p>

<p><a href="/register">Start nu gratis →</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "slug": "tips-om-herinneringen-op-te-halen-voor-je-biografie",
        "title": "Tips om herinneringen op te halen voor je biografie",
        "meta_title": "6 bewezen tips om herinneringen op te halen voor je biografie | BewaardVoorJou.nl",
        "meta_description": "Lukt het niet om herinneringen boven te halen voor je levensverhaal? Gebruik muziek, foto's, geuren en de AI-interviewer. Zes bewezen technieken uitgelegd.",
        "keywords": "herinneringen ophalen biografie, geheugen activeren levensverhaal, herinneringen terughalen tips, autobiografie hulp, levensverhaal herinneringen ophalen",
        "excerpt": "Herinneringen ophalen voor je biografie lukt het beste met de juiste triggers. Van oude foto's tot bekende geuren en muziek: ontdek zes bewezen technieken om vergeten momenten weer tot leven te wekken.",
        "content": """<blockquote>
<p><strong>In het kort:</strong> Je geheugen werkt niet als een computer met nette mappen. Herinneringen zijn verweven met zintuigen, emoties en associaties. De juiste trigger haalt in één seconde tientallen jaren naar boven. Deze zes technieken helpen je concreet op gang.</p>
</blockquote>

<p>Je weet dat er zoveel te vertellen is. Maar zodra je wilt beginnen, lijken de herinneringen weggevlucht. Je staart naar een leeg scherm. Dit is een van de meest voorkomende ervaringen bij mensen die hun <a href="/kennisbank/hoe-begin-ik-met-het-vastleggen-van-mijn-levensverhaal">levensverhaal willen vastleggen</a> — en het is volkomen normaal.</p>

<h2>Tip 1: Gebruik muziek als tijdmachine</h2>

<p>Muziek is verreweg de krachtigste geheugenactivator. Een liedje uit je tienerjaren kan in vijf seconden een complete wereld oproepen: de geur van de danszaal, het gezicht van een eerste liefde, de kleding die je droeg.</p>

<p>Maak een playlist van muziek uit de periode waarover je wilt vertellen. Luister ernaar voordat je begint met opnemen. Laat de herinneringen vanzelf komen en start dan pas de opname. De <a href="/kennisbank/wat-doet-de-ai-interviewer-precies">AI-interviewer van BewaardVoorJou.nl</a> suggereert soms bekende liedjes of artiesten uit een bepaald decennium als je aangeeft vast te lopen — dit is een bewuste keuze gebaseerd op inzichten uit de muziektherapie.</p>

<blockquote>
<p><strong>Tip:</strong> Maak een Spotify-playlist van "de hits van 1975" (of het jaar dat voor jou relevant is) en zet die aan terwijl je opneemt. Je zult merken dat woorden vanzelf komen.</p>
</blockquote>

<h2>Tip 2: Kijk door oude foto's en voorwerpen</h2>

<p>Oude fotoalbums, brieven, schoolrapporten, ansichtkaarten en vergeelde krantenknipsels zijn schatten voor het geheugen. Pak ze erbij voordat je begint. Spreek hardop wat je ziet: wie is dit? Wanneer was dit? Hoe voelde ik me die dag?</p>

<p>Voorwerpen werken ook uitstekend. Een oud speelgoed, een kledingstuk, een sieraad of een gereedschapsstuk kan een lawine aan herinneringen losmaken. Houd zo'n voorwerp in je handen terwijl je opneemt.</p>

<h2>Tip 3: Praat met familieleden</h2>

<p>Jouw broers, zussen, neven en nichten herinneren zich dingen die jij bent vergeten. Een gesprek van een halfuur met een familielid kan meer herinneringen activeren dan uren alleen nadenken.</p>

<p>Stel concrete vragen: <em>"Weet jij nog die zomer dat we bij oma logeerden?"</em> of <em>"Hoe heette ook alweer die buurman bij wie we altijd appels gingen plukken?"</em> Concrete vragen werken beter dan open vragen als "Wat weet jij nog van vroeger?"</p>

<h2>Tip 4: Gebruik geuren bewust</h2>

<p>De reukzin is rechtstreeks verbonden met het limbisch systeem — het emotionele geheugencentrum van de hersenen. Een vertrouwde geur activeert een emotionele herinnering onmiddellijk, zonder dat je er bewust naar hoeft te zoeken.</p>

<p>Denk aan geuren die passen bij de periode: een bepaald parfum, gebakken aardappels, zeelucht, hooikoorts of motorolie. Sommige mensen zoeken bewust naar die geuren voordat ze beginnen met opnemen.</p>

<h2>Tip 5: Schrijf tien willekeurige woorden op</h2>

<p>Schrijf tien willekeurige woorden op die iets te maken hebben met de periode waarover je wilt vertellen. Woorden als: <em>zomer, fiets, meester, appelboom, caravan, radio, voetbal, gordijnen, zeep, station.</em></p>

<p>Kijk naar die woorden. Eén ervan zal een herinnering activeren. Begin daar. Volg de herinnering waarheen die je leidt.</p>

<h2>Tip 6: Laat de AI-interviewer het zware werk doen</h2>

<p>BewaardVoorJou.nl is speciaal ontworpen om herinneringen te activeren via gerichte vragen. In plaats van <em>"Vertel eens over je jeugd"</em> vraagt de interviewer: <em>"Welke geur herinner je je van de keuken van je moeder?"</em> of <em>"Hoe zag de straat eruit waarop je opgroeide?"</em></p>

<p>Die specificiteit werkt: concrete vragen roepen concrete herinneringen op. Lees meer over <a href="/kennisbank/wat-doet-de-ai-interviewer-precies">hoe de AI-interviewer precies werkt</a> en hoe hij zich aanpast aan jouw verhaal.</p>

<p>Heb je er ook aan gedacht dat je niet hoeft te schrijven? <a href="/kennisbank/ik-ben-geen-schrijver-kan-ik-bewaardvoorjou-toch-gebruiken">Je kunt je herinneringen ook gewoon inspreken</a> — dat werkt voor veel mensen beter.</p>

<hr>

<h2>Veelgestelde vragen over herinneringen ophalen</h2>

<h3>Wat als ik bepaalde periodes echt niet meer weet?</h3>
<p>Dat is heel gewoon, zeker voor vroege kinderjaren. Gebruik de herinneringen die je wél hebt als startpunt. Wat anderen jou over die periode hebben verteld, is ook een geldige bron voor je levensverhaal.</p>

<h3>Moet ik mijn herinneringen kunnen bewijzen?</h3>
<p>Absoluut niet. Een biografie is geen rechtbankdossier. Het gaat om jouw beleving en jouw waarheid.</p>

<h3>Wat als ik herinneringen heb die pijnlijk zijn?</h3>
<p>Je hoeft niets te vertellen wat je niet wilt. Pijnlijke herinneringen kun je altijd overslaan of een hoofdstuk privé houden. Je kunt ook de emotie beschrijven zonder alle details te geven.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige plek.</strong> Probeer BewaardVoorJou.nl vandaag gratis — binnen één minuut start je je eerste herinnering.</p>

<p><a href="/register">Start nu gratis →</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "slug": "ik-ben-geen-schrijver-kan-ik-bewaardvoorjou-toch-gebruiken",
        "title": "Ik ben geen schrijver, kan ik BewaardVoorJou.nl toch gebruiken?",
        "meta_title": "Geen schrijver? Toch je levensverhaal vastleggen via audio of video | BewaardVoorJou.nl",
        "meta_description": "Je hoeft geen schrijver te zijn om je levensverhaal vast te leggen. Spreek je verhaal in via audio of video — BewaardVoorJou.nl transcribeert automatisch. Gratis proberen.",
        "keywords": "geen schrijver levensverhaal, levensverhaal inspreken, audio biografie, video biografie, levensverhaal zonder schrijven, biografie ouderen gemakkelijk",
        "excerpt": "Je hoeft helemaal geen schrijver te zijn om jouw levensverhaal vast te leggen. Bij BewaardVoorJou.nl kun je jouw herinneringen gewoon inspreken via audio of video. De app zet je woorden automatisch om naar tekst.",
        "content": """<blockquote>
<p><strong>In het kort:</strong> Schrijven is slechts één van drie manieren om je levensverhaal vast te leggen. Audio en video zijn voor de meeste mensen natuurlijker, rijker en sneller. BewaardVoorJou.nl transcribeert alles automatisch naar tekst. Schrijven is optioneel — praten is genoeg.</p>
</blockquote>

<p><em>"Ik ben geen schrijver."</em> Het is een van de meest gehoorde uitspraken bij mensen die nadenken over het vastleggen van hun levensverhaal. En het is ook één van de grootste misverstanden over BewaardVoorJou.nl.</p>

<p>Want schrijven is slechts één van drie manieren om jouw verhaal vast te leggen — en voor de meeste mensen niet eens de beste.</p>

<h2>Spreken is de meest menselijke manier van verhalen vertellen</h2>

<p>De mens communiceert al honderdduizenden jaren via gesproken taal. Schrijven is een relatief jonge vaardigheid, en één die niet iedereen even gemakkelijk afgaat. Maar praten? Dat kunnen we allemaal.</p>

<p>Mensen die mogen praten in plaats van schrijven zijn veel opener. Ze gebruiken rijkere taal, meer details en meer emotie. Gesproken verhalen hebben een warmte die getypte tekst zelden bereikt.</p>

<h2>Optie 1: Audio opname — het laagdrempeligst</h2>

<p>De audio-optie is het meest laagdrempelig. Je drukt op de opnameknop, je praat, en de app luistert. De ingebouwde spraakherkenningstechnologie van BewaardVoorJou.nl zet jouw woorden automatisch om naar tekst.</p>

<p>Je kunt je opname pauzeren wanneer je wilt, verder praten als je klaar bent, en achteraf de tekst doorlezen en aanpassen. De opname zelf wordt ook bewaard naast de tekst — zo heeft jouw familie straks zowel de woorden als de klank van jouw stem.</p>

<p>Meer weten over hoe audio en video technisch werken? Lees <a href="/kennisbank/praten-in-plaats-van-typen-hoe-werkt-audio-en-video">hoe audio- en video-ondersteuning werkt bij BewaardVoorJou.nl</a>.</p>

<h2>Optie 2: Video opname — jij in beeld</h2>

<p>Met de video-optie bewaar je niet alleen jouw woorden, maar ook jouw gezicht, jouw glimlach, jouw gebaren en jouw stem. Voor kleinkinderen die je misschien nooit hebben gekend, is dat onschatbaar.</p>

<p>Video opnemen werkt via de camera van je telefoon, tablet of laptop. Je kijkt in de camera alsof je een vriend aankijkt — en je vertelt. De AI-interviewer stelt de vragen in beeld, zodat je altijd weet waarover je het wilt hebben.</p>

<blockquote>
<p><strong>Tip:</strong> Zit met je gezicht naar een raam (daglicht van voren werkt het beste) en zorg voor een rustige achtergrond. Geen dure camera of studio nodig — jouw verhaal is wat telt, niet de productiekwaliteit.</p>
</blockquote>

<h2>Optie 3: Tekst typen — voor wie liever kiest</h2>

<p>Houd je toch liever van typen? Dat kan uiteraard ook. De <a href="/kennisbank/wat-doet-de-ai-interviewer-precies">AI-interviewer</a> stelt gerichte vragen en jij typt jouw antwoord. Voor mensen die graag de tijd nemen om hun woorden te kiezen, is dit soms de prettigste optie.</p>

<p>Sommige mensen kiezen ook voor een combinatie: zij typen de kerngedachten en vullen die aan met een audio-opname voor de warmere, persoonlijkere details.</p>

<h2>Toegankelijk voor iedereen</h2>

<p>BewaardVoorJou.nl werkt voor mensen met artritis, dyslexie of weinig formeel onderwijs — juist omdat schrijven nooit verplicht is. Verhalen die anders voor altijd verloren zouden gaan, kunnen zo bewaard worden.</p>

<p>Klaar om te starten? Lees <a href="/kennisbank/stapsgewijze-handleiding-je-eerste-herinnering-opnemen">de stapsgewijze handleiding voor je eerste herinnering</a> om in vijf minuten je eerste opname te maken.</p>

<hr>

<h2>Veelgestelde vragen</h2>

<h3>Hoe goed is de spraakherkenning?</h3>
<p>BewaardVoorJou.nl gebruikt Whisper — momenteel een van de beste spraakherkenningstechnologieën voor de Nederlandse taal. Het herkent regionale accenten, dialecten en zachte stemmen goed. De tekst kun je altijd achteraf aanpassen.</p>

<h3>Wat als ik een traag spreektempo heb of lange pauzes nodig heb?</h3>
<p>Geen enkel probleem. De opnamefunctie herkent pauzes als deel van het gesprek en stopt niet automatisch.</p>

<h3>Kan ik een combinatie van methodes gebruiken?</h3>
<p>Ja, zelfs binnen één hoofdstuk. Je kunt een vraag schriftelijk beantwoorden en de volgende inspreken.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag gratis — geen creditcard nodig.</p>

<p><a href="/register">Start nu gratis →</a></p>""",
    },

    # =========================================================================
    # CATEGORIE B: Hoe werkt de AI interviewer?
    # =========================================================================

    {
        "slug": "praten-in-plaats-van-typen-hoe-werkt-audio-en-video",
        "title": "Praten in plaats van typen: hoe werkt de audio- en video-ondersteuning?",
        "meta_title": "Audio en video opnemen voor je levensverhaal | BewaardVoorJou.nl",
        "meta_description": "Ontdek hoe je je levensverhaal inspreekt via audio of video bij BewaardVoorJou.nl. Whisper AI transcribeert automatisch — ook dialecten en zachte stemmen.",
        "keywords": "audio biografie opnemen, video levensverhaal, herinneringen inspreken, spraakherkenning biografie, levensverhaal opnemen telefoon, Whisper AI Nederlands",
        "excerpt": "Bij BewaardVoorJou.nl kun je je levensverhaal gewoon inspreken via audio of opnemen via video. De app transcribeert alles automatisch naar tekst met Whisper AI en bewaart ook je originele opname.",
        "content": """<blockquote>
<p><strong>In het kort:</strong> Audio en video opnemen bij BewaardVoorJou.nl werkt via de microfoon en camera van je eigen apparaat — geen extra hardware nodig. Whisper AI transcribeert alles automatisch naar tekst, ook dialecten. De originele opname wordt bewaard naast de tekst, zodat toekomstige generaties jouw stem kunnen horen.</p>
</blockquote>

<p>Veel mensen denken dat een digitaal levensverhaal iets is wat je typt achter een computer. Bij BewaardVoorJou.nl is typen slechts één optie. Voor de meeste mensen is spreken veel natuurlijker, sneller en rijker in detail. Lees ook: <a href="/kennisbank/ik-ben-geen-schrijver-kan-ik-bewaardvoorjou-toch-gebruiken">ben je geen schrijver? Dan is opnemen dé manier voor jou</a>.</p>

<h2>Hoe werkt audio opnemen stap voor stap?</h2>

<p>Audio opnemen werkt via de microfoon van jouw apparaat: telefoon, tablet, laptop of computer. Geen speciale apparatuur nodig.</p>

<ol>
<li>Open het hoofdstuk dat je wilt opnemen in BewaardVoorJou.nl.</li>
<li>Lees of luister de vraag van de AI-interviewer.</li>
<li>Druk op de microfoonknop en begin te praten.</li>
<li>Stop wanneer je wilt — de opname wordt automatisch opgeslagen.</li>
<li>Lees de getranscribeerde tekst door en pas eventuele fouten aan.</li>
</ol>

<p>De originele audio blijft bewaard naast de tekst. Zo houd je altijd beiden: de precieze woorden én de klank van jouw stem.</p>

<h2>Hoe werkt video opnemen?</h2>

<p>Video opnemen werkt via de camera van jouw apparaat. Op een telefoon of tablet gebruik je de frontcamera, zodat je recht in het oog van de kijker kijkt. Op een laptop gebruik je de ingebouwde webcam.</p>

<p>De <a href="/kennisbank/wat-doet-de-ai-interviewer-precies">AI-interviewer stelt de vragen in beeld</a>, zodat je altijd weet waarover je vertelt. Na de opname verwerkt de app de video en transcribeert alles automatisch.</p>

<p>Een video-opname bewaart meer dan woorden. Het bewaart jouw glimlach, jouw handgebaar als je iets vertelt en de traan die misschien over jouw wang rolt bij een emotionele herinnering. Voor kleinkinderen die je misschien nooit hebben gekend, is dat onschatbaar.</p>

<blockquote>
<p><strong>Tip voor betere opnames:</strong> Zit met je gezicht naar een raam of lamp (licht van voren), kies een rustige ruimte en zorg dat je microfoon niet bedekt wordt. Een goede opname begint bij een rustige omgeving, niet bij dure apparatuur.</p>
</blockquote>

<h2>De technologie achter de spraakherkenning: Whisper AI</h2>

<p>BewaardVoorJou.nl gebruikt <a href="https://openai.com/research/whisper" target="_blank" rel="noopener noreferrer">Whisper</a>, de spraakherkenningstechnologie van OpenAI. Whisper is momenteel een van de meest nauwkeurige systemen voor de Nederlandse taal, inclusief regionale dialecten en accenten. Het werkt ook bij zachte stemmen en minder duidelijke dictie.</p>

<p>Na elke opname verschijnt de getranscribeerde tekst in jouw archief. Je kunt die tekst doorlezen, aanpassen en aanvullen. De originele opname blijft altijd onaangetast beschikbaar.</p>

<h2>Wat zijn de technische vereisten?</h2>

<ul>
<li>Een telefoon, tablet, laptop of computer met microfoon en camera</li>
<li>Een internetverbinding (voor uploaden van opnames)</li>
<li>Een moderne webbrowser (Chrome, Firefox, Safari of Edge)</li>
<li>Een gratis account op BewaardVoorJou.nl</li>
</ul>

<p>Je hoeft niets te installeren. BewaardVoorJou.nl werkt volledig via de browser.</p>

<h2>Privacy van jouw opnames</h2>

<p>Jouw opnames zijn strikt privé. Ze worden versleuteld opgeslagen op beveiligde Europese servers en zijn alleen toegankelijk voor jou, tenzij jij expliciet besluit ze te delen. Meer over privacy en opslag lees je in <a href="/kennisbank/waar-worden-mijn-levensverhalen-opgeslagen-nederlandse-servers">ons artikel over onze Nederlandse servers</a>.</p>

<hr>

<h2>Veelgestelde vragen over audio en video</h2>

<h3>Hoe lang mag een opname zijn?</h3>
<p>Er is geen tijdslimiet. Bij langere opnames raden we aan om af en toe een korte pauze in te lassen, zodat de transcriptie nauwkeuriger is.</p>

<h3>Kan ik een opname verwijderen?</h3>
<p>Ja, altijd. Je kunt een opname op elk moment verwijderen vanuit jouw account. Verwijderde opnames worden ook van onze servers gewist.</p>

<h3>Wat als de transcriptie fouten bevat?</h3>
<p>De getranscribeerde tekst kun je altijd aanpassen. De originele audio- of video-opname blijft ongewijzigd.</p>

<h3>Kan ik een opname ook later terugluisteren?</h3>
<p>Ja. In jouw persoonlijk archief staan alle opnames terug te luisteren en te bekijken. Je kunt ze ook downloaden.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag gratis — geen creditcard nodig.</p>

<p><a href="/register">Start nu gratis →</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "slug": "wat-doet-de-ai-interviewer-precies",
        "title": "Wat doet de AI-interviewer precies?",
        "meta_title": "De AI-interviewer van BewaardVoorJou.nl uitgelegd | Warm, geduldig, persoonlijk",
        "meta_description": "De AI-interviewer stelt warme, gerichte vragen om jouw levensverhaal boven te halen. Geen koude vragenlijst — een gesprek aan de keukentafel. Zo werkt het precies.",
        "keywords": "AI interviewer levensverhaal, kunstmatige intelligentie biografie, AI vragen stellen, digitale interviewer ouderen, AI levensverhaal schrijven, Claude AI biografie",
        "excerpt": "De AI-interviewer van BewaardVoorJou.nl is geen koude vragenlijst maar een warme, intelligente gesprekspartner. Hij stelt gerichte vragen, luistert naar jouw antwoorden en vraagt door op de momenten die ertoe doen.",
        "content": """<blockquote>
<p><strong>In het kort:</strong> De AI-interviewer stelt één concrete vraag per keer, reageert op wat jij vertelt, vraagt door op emotionele of interessante momenten en respecteert stiltes. Hij is gebouwd op Claude van Anthropic — een van de veiligste en meest empathische taalmodellen die momenteel beschikbaar zijn.</p>
</blockquote>

<p>De naam "AI-interviewer" klinkt misschien technisch en koud. De werkelijkheid is precies het tegenovergestelde. Bij BewaardVoorJou.nl hebben we bewust gekozen voor de metafoor van een gesprek aan de keukentafel: jij aan de ene kant, een warme en geduldige luisteraar aan de andere kant.</p>

<h2>Hoe de AI-interviewer vragen stelt</h2>

<p>De AI-interviewer werkt met gelaagde vragen. Elk hoofdstuk begint met een openingsvraag die ruimte geeft en uitnodigt. Vervolgens reageert de interviewer op wat jij vertelt met gerichte vervolgvragen.</p>

<p>Stel, je vertelt over jouw eerste schooldag: <em>"Ik was heel erg zenuwachtig en mijn moeder had een brood meegenomen."</em> De AI reageert dan niet met een volledig nieuwe vraag, maar met iets als: <em>"Wat herinner je je nog van het brood dat je moeder had meegenomen?"</em> Of: <em>"Hoe zag de klas eruit op die eerste dag?"</em></p>

<p>Die specificiteit is de sleutel. Concrete vragen roepen concrete, rijke herinneringen op. Meer over het ophalen van herinneringen lees je in <a href="/kennisbank/tips-om-herinneringen-op-te-halen-voor-je-biografie">onze tips voor het ophalen van herinneringen</a>.</p>

<h2>Wat de AI-interviewer bewust niet doet</h2>

<ul>
<li>Hij onderbreekt nooit midden in een zin</li>
<li>Hij stelt nooit twee vragen tegelijk</li>
<li>Hij oordeelt nooit over wat je vertelt</li>
<li>Hij dringt nooit aan als je ergens niet op in wilt gaan</li>
<li>Hij haast nooit, ook niet als je lang nadenkt</li>
</ul>

<p>Die principes zijn bewust ingebouwd. Mensen openen zich het meest als ze zich veilig voelen en niet gehaast. Een goede interviewer geeft ruimte — onze AI doet hetzelfde.</p>

<blockquote>
<p><strong>Wist je dat?</strong> Je kunt elke vraag overslaan door op "Volgende vraag" te klikken. Je hoeft nooit ergens op te antwoorden wat je niet wilt beantwoorden. Het gaat om jouw verhaal — niet om een compleet ingevuld formulier.</p>
</blockquote>

<h2>Hoe de AI aanpast aan jouw verhaal</h2>

<p>De AI-interviewer leest en onthoudt alles wat je eerder hebt verteld. Als je in een vroeg hoofdstuk een bepaalde persoon noemt, kan de interviewer in een later hoofdstuk naar diezelfde persoon verwijzen. Als je vertelt dat je opgroeide in een kleine boerengemeenschap, past de interviewer zijn vragen daar op aan.</p>

<p>Dit contextbewustzijn maakt het verschil tussen een generieke vragenlijst en een echt gepersonaliseerd gesprek. Jouw levensverhaal is uniek — de AI-interviewer behandelt het ook zo.</p>

<h2>De technologie: Claude van Anthropic</h2>

<p>De AI-interviewer van BewaardVoorJou.nl is gebouwd op <a href="https://www.anthropic.com/" target="_blank" rel="noopener noreferrer">Claude van Anthropic</a> — een taalmodel dat ontworpen is met een sterke focus op veiligheid, eerlijkheid en empathie. Dat sluit perfect aan bij de waarden van BewaardVoorJou.nl.</p>

<p>Claude bleek het meest consistent in toon, het meest empathisch in doorvragen en het minst geneigd tot onnodige formaliteit — precies de eigenschappen die een goede levensverhaal-interviewer nodig heeft.</p>

<h2>Privacy van jouw gesprekken</h2>

<p>Jouw gesprekken met de AI-interviewer zijn volledig privé. De conversaties worden alleen verwerkt om jou betere vervolgvragen te geven. Ze worden nooit gebruikt voor het trainen van AI-modellen, voor commerciële doeleinden of voor enige andere partij. Alles voldoet aan de Europese AVG-wetgeving.</p>

<p>Meer over <a href="/kennisbank/wie-heeft-er-toegang-tot-mijn-verhalen">wie toegang heeft tot jouw verhalen</a> lees je in ons privacy-artikel.</p>

<hr>

<h2>Veelgestelde vragen over de AI-interviewer</h2>

<h3>Is de AI-interviewer volledig in het Nederlands?</h3>
<p>Ja, de AI-interviewer spreekt en schrijft uitsluitend in het Nederlands, in gewone begrijpelijke spreektaal. Geen formeel taalgebruik, geen moeilijke woorden.</p>

<h3>Kan ik de vragen ook overslaan?</h3>
<p>Ja, altijd. Elke vraag kun je overslaan door op "Volgende vraag" te klikken.</p>

<h3>Wat als ik het niet eens ben met de vraag?</h3>
<p>Dan kun je dat gewoon zeggen. De AI-interviewer past zich aan. Je kunt ook zelf een onderwerp aandragen dat je liever bespreekt.</p>

<h3>Wordt de AI beter naarmate ik meer vertel?</h3>
<p>Ja. Hoe meer jij vertelt, hoe persoonlijker en diepgaander de vragen worden. De eerste vragen zijn altijd wat algemener — dat is normaal en verandert snel.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag gratis — geen creditcard nodig.</p>

<p><a href="/register">Start nu gratis →</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "slug": "kan-ik-mijn-antwoorden-tussentijds-aanpassen-of-pauzeren",
        "title": "Kan ik mijn antwoorden tussentijds aanpassen of pauzeren?",
        "meta_title": "Antwoorden aanpassen, aanvullen en pauzeren | BewaardVoorJou.nl",
        "meta_description": "Ja, je kunt bij BewaardVoorJou.nl altijd pauzeren, terugkeren en aanpassen. Geen tijdsdruk, geen definitief antwoord. Jouw levensverhaal groeit met jou mee.",
        "keywords": "levensverhaal aanpassen, biografie bewerken, pauzeren levensverhaal, antwoorden wijzigen biografie, flexibel levensverhaal, BewaardVoorJou bewerken",
        "excerpt": "Ja, je kunt bij BewaardVoorJou.nl altijd pauzeren, terugkeren en aanpassen. Er is geen tijdsdruk, geen definitief antwoord en geen moment waarop je verhaal 'klaar' moet zijn. Jouw levensverhaal groeit met jou mee.",
        "content": """<blockquote>
<p><strong>In het kort:</strong> Alles in BewaardVoorJou.nl is bewerkbaar, altijd. Je kunt een sessie halverwege stoppen, een week later verdergaan, een antwoord van drie jaar geleden aanvullen en een gedeeld hoofdstuk privé maken. Er is nooit tijdsdruk en niets is definitief.</p>
</blockquote>

<p>Een van de grootste zorgen van nieuwe gebruikers is de vraag of ze "iets goed moeten doen" of iets zeggen wat ze later niet meer kunnen veranderen. Het antwoord is helder: nee. BewaardVoorJou.nl is gebouwd rond jouw vrijheid en jouw gemak. Er is altijd een weg terug.</p>

<h2>Automatisch opgeslagen — altijd</h2>

<p>Jouw sessie wordt op elk moment automatisch opgeslagen. Als je halverwege een antwoord stopt, als je apparaat uitvalt of als je gewoon even genoeg hebt: jouw voortgang is veilig. De volgende keer dat je inlogt, ga je precies verder waar je was gebleven.</p>

<p>Er is ook geen sessietijd die afloopt. Je kunt tien minuten werken, dan een week niets doen en dan weer beginnen. BewaardVoorJou.nl wacht geduldig op je terug.</p>

<h2>Antwoorden aanpassen en aanvullen</h2>

<p>Elk antwoord dat je hebt gegeven, kun je op elk moment aanpassen. Open het betreffende hoofdstuk, klik op het antwoord dat je wilt wijzigen, maak de aanpassing en sla op.</p>

<p>Je kunt ook antwoorden aanvullen. Soms herinner je je een week later ineens een detail dat je was vergeten. Gewoon toevoegen. Een levensverhaal is namelijk nooit echt af. Het groeit en verdiept naarmate je ouder wordt en meer terugblikt.</p>

<blockquote>
<p><strong>Tip:</strong> Bewaar BewaardVoorJou.nl als favoriet op je telefoon zodat je snel kunt openen wanneer een herinnering spontaan bij je opkomt. De mooiste toevoegingen komen vaak niet tijdens een geplande sessie, maar op een willekeurig moment in de dag.</p>
</blockquote>

<h2>Geen tijdsdruk, nooit</h2>

<p>BewaardVoorJou.nl is bewust ontworpen zonder tijdsdruk. Geen aftellende klokken, geen waarschuwingen dat je "bijna klaar moet zijn" en geen reminders die je opjagen. Tijdsdruk leidt tot stress, fouten en afhaken — het tegenovergestelde van wat een goed levensverhaal vraagt.</p>

<h2>Privéinstellingen per antwoord</h2>

<p>Misschien vertel je iets wat je later toch liever privé houdt. Dat kan. Elk antwoord heeft een privéinstelling. Je kunt een antwoord op elk moment van "zichtbaar voor familie" naar "alleen voor mezelf" zetten, en andersom.</p>

<p>Meer over wie er toegang heeft tot jouw verhalen lees je in <a href="/kennisbank/wie-heeft-er-toegang-tot-mijn-verhalen">ons artikel over toegangsbeheer</a>.</p>

<p>Wil je alles kunnen exporteren voor een persoonlijk archief? Dat kan ook — lees hoe <a href="/kennisbank/hoe-exporteer-ik-mijn-eigen-data-en-herinneringen">je je levensverhaal volledig kunt exporteren</a>.</p>

<hr>

<h2>Veelgestelde vragen</h2>

<h3>Wat gebeurt er als ik midden in een audio-opname stop?</h3>
<p>De opname tot aan het moment dat je stopte, wordt automatisch opgeslagen. Je kunt die later terugluisteren, aanvullen of verwijderen.</p>

<h3>Kan ik een volledig hoofdstuk opnieuw beginnen?</h3>
<p>Ja. Je kunt de inhoud van een hoofdstuk wissen en opnieuw beginnen. Wij raden aan om de bestaande inhoud eerst door te lezen — soms zijn er waardevolle details die je onbewust al had vastgelegd.</p>

<h3>Wat als ik een antwoord heb gedeeld met familie en het daarna wil aanpassen?</h3>
<p>Je kunt een gedeeld antwoord altijd aanpassen. Familieleden die toegang hebben, zien dan de nieuwe versie.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag gratis uit.</p>

<p><a href="/register">Start nu gratis →</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "slug": "stapsgewijze-handleiding-je-eerste-herinnering-opnemen",
        "title": "Stapsgewijze handleiding: je eerste herinnering opnemen",
        "meta_title": "Je eerste herinnering opnemen in 5 stappen | BewaardVoorJou.nl handleiding",
        "meta_description": "Binnen vijf minuten heb je je eerste herinnering vastgelegd in BewaardVoorJou.nl. Stap-voor-stap handleiding van account aanmaken tot je eerste opgeslagen herinnering.",
        "keywords": "eerste herinnering opnemen BewaardVoorJou, handleiding levensverhaal app, biografie beginnen stap voor stap, BewaardVoorJou handleiding, levensverhaal beginnen handleiding",
        "excerpt": "Binnen vijf minuten heb je je eerste herinnering opgenomen in BewaardVoorJou.nl. Deze stap voor stap handleiding leidt je door het hele proces, van account aanmaken tot je eerste bewaarde herinnering.",
        "content": """<blockquote>
<p><strong>In het kort:</strong> Je hebt vijf minuten en een telefoon of computer nodig. In die vijf minuten maak je een gratis account aan, kies je je eerste hoofdstuk, laat je de AI-interviewer een vraag stellen en leg je je eerste herinnering vast. Zo simpel is het.</p>
</blockquote>

<p>Beginnen is het moeilijkste. Maar zodra je die eerste herinnering hebt vastgelegd, verandert er iets: <em>"Dat was niet zo moeilijk."</em> En dan wil je verder. Deze handleiding helpt je door die eerste vijf minuten heen.</p>

<p>Nog niet overtuigd dat je kunt beginnen? Lees dan eerst <a href="/kennisbank/hoe-begin-ik-met-het-vastleggen-van-mijn-levensverhaal">waarom beginnen makkelijker is dan je denkt</a>.</p>

<h2>Stap 1: Maak een gratis account aan (1 minuut)</h2>

<p>Ga naar BewaardVoorJou.nl en klik op "Gratis beginnen" of "Account aanmaken". Je hebt alleen een e-mailadres, jouw voornaam en een wachtwoord nodig. Geen creditcard, geen extra gegevens.</p>

<p>Je ontvangt een bevestigingsemail. Klik op de link erin en je bent direct ingelogd. Meer details over het registratieproces lees je in <a href="/kennisbank/hoe-maak-ik-een-gratis-account-aan">ons artikel over een gratis account aanmaken</a>.</p>

<h2>Stap 2: Kies je eerste hoofdstuk (1 minuut)</h2>

<p>Na het inloggen zie je het overzicht van de <a href="/kennisbank/de-30-hoofdstukken-van-je-leven-wat-kun-je-verwachten">dertig hoofdstukken</a>. Je hoeft niet bij fase 1 te beginnen. Kies het hoofdstuk dat je nu het meest aanspreekt.</p>

<p>Voor de meeste mensen is de vroege jeugd een goed startpunt: het is ver genoeg in het verleden om prettig over te vertellen, maar dichtbij genoeg om heldere herinneringen te hebben. Maar vertrouw je eigen gevoel.</p>

<h2>Stap 3: Start de AI-interviewer (30 seconden)</h2>

<p>Zodra je een hoofdstuk opent, stelt de AI-interviewer je de eerste vraag. Lees of beluister de vraag. Laat hem even bezinken — haast je niet.</p>

<p>Als de vraag je niet aanspreekt, klik dan op "Andere vraag". Je kunt dit zo vaak doen als je wilt. Lees meer over <a href="/kennisbank/wat-doet-de-ai-interviewer-precies">hoe de AI-interviewer werkt</a> als je meer wilt weten.</p>

<h2>Stap 4: Kies je opnamemethode en begin (2 minuten)</h2>

<p>Je ziet drie opties: Audio, Video en Tekst. Kies wat het meest comfortabel voelt.</p>

<ul>
<li><strong>Audio:</strong> Klik op de microfoonknop → wacht op het groene lichtje → begin te praten → klik op stop als je klaar bent.</li>
<li><strong>Video:</strong> Klik op de cameraknop → zorg dat je goed verlicht bent en kijk in de camera → klik op stop als je klaar bent.</li>
<li><strong>Tekst:</strong> Klik op het tekstveld en begin te typen. Geen minimum- of maximumlengte.</li>
</ul>

<blockquote>
<p><strong>Tip voor een goede eerste opname:</strong> Kies een rustige ruimte, zit comfortabel en begin met een positieve herinnering. Jouw eerste opname hoeft niet perfect te zijn — het gaat om de echtheid, niet om de perfectie.</p>
</blockquote>

<h2>Stap 5: Opslaan en doorgaan</h2>

<p>Na je antwoord klik je op "Opslaan". De AI-interviewer stelt een vervolgvraag. Je kunt direct verder gaan, of stoppen en een andere keer verdergaan. Alles is automatisch opgeslagen.</p>

<p>Jouw eerste herinnering staat nu veilig bewaard. Gefeliciteerd.</p>

<hr>

<h2>Veelgestelde vragen over de handleiding</h2>

<h3>Wat als ik mijn wachtwoord vergeet?</h3>
<p>Op de inlogpagina staat een link "Wachtwoord vergeten". Vul je e-mailadres in en je ontvangt een herstellink.</p>

<h3>Kan ik BewaardVoorJou.nl gebruiken op een telefoon?</h3>
<p>Ja, het werkt op alle moderne telefoons via de webbrowser. Open de website in Safari (iPhone) of Chrome (Android) en log in.</p>

<h3>Wat als ik iemand anders wil laten helpen bij het opnemen?</h3>
<p>Dat is prima. Veel mensen laten een kind of kleinkind helpen met de technische kant terwijl zij zelf vertellen. Je kunt ook samen een sessie doen: één persoon stelt de vragen voor, de ander antwoordt.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag gratis — geen creditcard nodig.</p>

<p><a href="/register">Start nu gratis →</a></p>""",
    },

    # =========================================================================
    # CATEGORIE C: Privacy, veiligheid en delen
    # =========================================================================

    {
        "slug": "waar-worden-mijn-levensverhalen-opgeslagen-nederlandse-servers",
        "title": "Waar worden mijn levensverhalen opgeslagen? Alles over onze Europese servers",
        "meta_title": "Waar worden mijn levensverhalen opgeslagen? Europese servers & AVG | BewaardVoorJou.nl",
        "meta_description": "Jouw levensverhalen staan op streng beveiligde Europese servers, volledig AVG-conform. Geen Amerikaanse big tech, geen datadeling met derden. Alles uitgelegd.",
        "keywords": "levensverhaal opgeslagen waar, data privacy biografie, Nederlandse servers privacy, AVG biografie, veilige opslag levensverhaal, GDPR biografie, Europese servers",
        "excerpt": "Jouw levensverhalen worden opgeslagen op streng beveiligde Europese servers, volledig conform de AVG-wetgeving. Geen Amerikaanse bedrijven, geen datadeling met derden.",
        "content": """<blockquote>
<p><strong>In het kort:</strong> Jouw levensverhalen, foto's, audio en video-opnames worden opgeslagen op beveiligde servers binnen de Europese Unie, volledig conform de AVG. Er worden geen gegevens gedeeld met Amerikaanse techbedrijven of andere derden. Alleen jij bepaalt wie er toegang heeft.</p>
</blockquote>

<p>Als je jouw meest persoonlijke herinneringen toevertrouwt aan een digitaal platform, wil je weten dat ze veilig zijn. Niet veilig met een vage belofte, maar veilig met concrete garanties. In dit artikel leggen we precies uit hoe BewaardVoorJou.nl jouw gegevens opslaat en beschermt.</p>

<h2>Europese servers — een principiële keuze</h2>

<p>Jouw levensverhalen worden opgeslagen op servers die zich fysiek bevinden binnen de Europese Unie. BewaardVoorJou.nl werkt bewust niet met grote Amerikaanse cloudproviders voor de opslag van persoonlijke verhalen. Dat is een principiële keuze, geen technische noodzaak.</p>

<p>Waarom? De Amerikaanse Cloud Act staat de Amerikaanse overheid in bepaalde omstandigheden toe om toegang te eisen tot gegevens bij Amerikaanse bedrijven, ook als die servers in Europa staan. Door te kiezen voor Europese servers en Europese providers, valt BewaardVoorJou.nl volledig buiten die jurisdictie.</p>

<h2>Encryptie: jouw data is onleesbaar voor derden</h2>

<p>Alle gegevens die jij opslaat, worden versleuteld. Dat geldt voor tekst, audio-opnames, video-opnames en foto's. Versleuteling betekent dat jouw gegevens onleesbaar zijn voor iedereen die niet de juiste sleutel heeft — ook voor onze eigen medewerkers in de normale gang van zaken.</p>

<p>De verbinding tussen jouw apparaat en onze servers is beveiligd met HTTPS, het standaard encryptieprotocol voor veilige verbindingen op het internet.</p>

<blockquote>
<p><strong>Veiligheidsgarantie:</strong> BewaardVoorJou.nl gebruikt AES-256-encryptie voor opgeslagen data — dezelfde standaard die banken en overheden gebruiken. Jouw verhalen zijn minstens zo goed beschermd als jouw bankrekening.</p>
</blockquote>

<h2>AVG-wetgeving: jouw rechten zijn wettelijk geborgd</h2>

<p>BewaardVoorJou.nl voldoet volledig aan de <a href="https://www.autoriteitpersoonsgegevens.nl/themas/basis-avg/privacyrechten-avg" target="_blank" rel="noopener noreferrer">Algemene Verordening Gegevensbescherming (AVG)</a> — de Europese privacywetgeving. Concreet betekent dit:</p>

<ul>
<li>Het recht om jouw gegevens in te zien</li>
<li>Het recht om jouw gegevens te laten corrigeren</li>
<li>Het recht om jouw gegevens te laten verwijderen ("recht op vergetelheid")</li>
<li>Het recht op overdraagbaarheid van jouw gegevens</li>
<li>Het recht om bezwaar te maken tegen verwerking</li>
</ul>

<p>Om een van deze rechten uit te oefenen, neem je contact op via onze supportpagina. Wij reageren binnen de wettelijke termijn van dertig dagen.</p>

<h2>Dagelijkse backups en hoge beschikbaarheid</h2>

<p>Jouw gegevens worden dagelijks geback-upt naar een secundaire, eveneens versleutelde opslaglocatie. Dit beschermt jouw verhalen tegen technische storingen, menselijke fouten en andere onverwachte gebeurtenissen. BewaardVoorJou.nl streeft naar meer dan 99,5% beschikbaarheid per jaar.</p>

<h2>Wat er met jouw data gebeurt als je stopt</h2>

<p>Als je jouw account opzegt, blijven jouw gegevens nog dertig dagen beschikbaar voor export. Na dertig dagen worden ze definitief verwijderd van alle servers, inclusief backups. Je kunt ook eerder exporteren — lees hoe dat werkt in <a href="/kennisbank/hoe-exporteer-ik-mijn-eigen-data-en-herinneringen">ons artikel over het exporteren van jouw data</a>.</p>

<p>Meer weten over wie er toegang heeft tot jouw verhalen? Lees <a href="/kennisbank/wie-heeft-er-toegang-tot-mijn-verhalen">ons artikel over toegangsbeheer</a>.</p>

<hr>

<h2>Veelgestelde vragen over opslag en privacy</h2>

<h3>Kunnen medewerkers van BewaardVoorJou.nl mijn verhalen lezen?</h3>
<p>Nee, niet in de normale gang van zaken. Jouw verhalen zijn versleuteld opgeslagen. Alleen bij een officieel verzoek van jou voor technische ondersteuning, en uitsluitend met jouw uitdrukkelijke toestemming, kan een technisch medewerker beperkte toegang krijgen.</p>

<h3>Wat als BewaardVoorJou.nl stopt met bestaan?</h3>
<p>Je ontvangt ruim van tevoren een bericht met instructies om jouw gegevens te exporteren. Jouw verhalen zijn altijd van jou en verlaten onze servers nooit zonder jouw toestemming.</p>

<h3>Worden mijn gegevens gebruikt voor AI-training?</h3>
<p>Nee. Jouw verhalen, opnames en persoonlijke gegevens worden nooit gebruikt voor het trainen van AI-modellen of voor enig ander doel dan het leveren van de dienst aan jou.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag gratis — geen creditcard nodig.</p>

<p><a href="/register">Start nu gratis →</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "slug": "hoe-werkt-de-tijdgestuurde-vrijgave-voor-familie",
        "title": "Hoe werkt de tijdgestuurde vrijgave voor familie?",
        "meta_title": "Tijdgestuurde vrijgave: jouw levensverhaal op het juiste moment | BewaardVoorJou.nl",
        "meta_description": "Stel in dat jouw levensverhaal automatisch vrijgegeven wordt voor familie op een door jou gekozen datum. Op een verjaardag, jubileum of na je overlijden — jij bepaalt.",
        "keywords": "tijdgestuurde vrijgave levensverhaal, digitale erfenis familie, levensverhaal doorgeven na overlijden, digitale nalatenschap, levensverhaal toekomst, dead man switch levensverhaal",
        "excerpt": "De tijdgestuurde vrijgave van BewaardVoorJou.nl laat jou bepalen wanneer jouw familie toegang krijgt tot jouw levensverhaal. Op een verjaardag, bij een bijzondere gelegenheid of na jouw overlijden: jij stelt de datum in.",
        "content": """<blockquote>
<p><strong>In het kort:</strong> Met de tijdgestuurde vrijgave kun je instellen dat jouw levensverhaal — of een deel ervan — automatisch wordt vrijgegeven voor specifieke familieleden op een door jou gekozen datum. Dat kan een verjaardag zijn, een jubileum, of pas na jouw overlijden. Jij beheert alles, altijd.</p>
</blockquote>

<p>Stel je voor: jouw kleinkind wordt achttien jaar. Op die ochtend ontvangt hij of zij een e-mail met een link naar het levensverhaal dat jij voor hem of haar hebt opgenomen. Jouw stem, jouw gezicht, jouw woorden. Een cadeau dat geen winkel kan geven.</p>

<p>Of: na jouw overlijden vinden jouw kinderen in hun inbox een bericht met jouw volledige levensverhaal. Alles wat je nooit hardop hebt gezegd, maar wel hebt opgenomen voor hen. Dit is wat de tijdgestuurde vrijgave van BewaardVoorJou.nl mogelijk maakt.</p>

<h2>Hoe stel je de tijdgestuurde vrijgave in?</h2>

<p>In jouw accountinstellingen vind je de sectie "Nalatenschap en vrijgave". Hier kun je per familielid of per groep instellen op welke datum zij toegang krijgen tot welke delen van jouw verhaal.</p>

<ol>
<li>Kies een datum of een gebeurtenis</li>
<li>Selecteer de ontvanger(s) via e-mailadres</li>
<li>Kies welke hoofdstukken of onderdelen worden vrijgegeven</li>
<li>Voeg eventueel een persoonlijk bericht toe</li>
</ol>

<p>Op de ingestelde datum ontvangt de ontvanger automatisch een e-mail met uitleg en een toegangslink.</p>

<h2>Vrijgave na overlijden: het inactiveringsbeheer</h2>

<p>BewaardVoorJou.nl biedt ook de mogelijkheid van inactiveringsbeheer. Het werkt als volgt: je stelt in dat als je gedurende een bepaalde periode niet meer hebt ingelogd, vertrouwde contactpersonen een verificatieverzoek ontvangen. Als jij niet meer reageert op dat verzoek, wordt de vrijgave geactiveerd.</p>

<p>Je kunt de inactiveringsperiode zelf instellen: van zes maanden tot twee jaar. Dit mechanisme is zorgvuldig ontworpen om zowel onbedoelde vroege vrijgave als een te lange vertraging te voorkomen.</p>

<blockquote>
<p><strong>Tip:</strong> Stel een vertrouwde contactpersoon in die ook weet dat deze vrijgave bestaat. Zo is er altijd iemand die kan bevestigen dat de vrijgave geactiveerd moet worden, en is jouw verhaal zeker van de juiste bestemming.</p>
</blockquote>

<h2>Wie kun je uitnodigen?</h2>

<p>Je kunt iedereen uitnodigen via e-mailadres: kinderen, kleinkinderen, broers, zussen, vrienden, vertrouwde bekenden of een notaris. Per ontvanger stel je in welke delen van jouw verhaal zij mogen zien. Zo kun je sommige hoofdstukken voor iedereen vrijgeven en andere alleen voor jouw directe kinderen reserveren.</p>

<p>Meer weten over toegangsbeheer in het algemeen? Lees <a href="/kennisbank/wie-heeft-er-toegang-tot-mijn-verhalen">wie er toegang heeft tot jouw verhalen</a>.</p>

<h2>Jouw verhalen zijn veilig opgeslagen</h2>

<p>De tijdgestuurde vrijgave werkt op basis van de beveiligde opslag van jouw verhalen. Meer over hoe en waar jouw data is opgeslagen lees je in <a href="/kennisbank/waar-worden-mijn-levensverhalen-opgeslagen-nederlandse-servers">ons artikel over onze Europese servers</a>.</p>

<hr>

<h2>Veelgestelde vragen over tijdgestuurde vrijgave</h2>

<h3>Kan ik de tijdgestuurde vrijgave annuleren?</h3>
<p>Ja, altijd. Zolang jij ingelogd bent en jouw account actief is, kun je een vrijgave op elk moment aanpassen of annuleren.</p>

<h3>Wat zien familieleden precies?</h3>
<p>Dat bepaal jij volledig zelf. Je kiest per vrijgave welke hoofdstukken, antwoorden en opnames zichtbaar worden.</p>

<h3>Wat als de ontvanger geen e-mailadres heeft?</h3>
<p>Dan kun je de toegangslink ook op een andere manier doorgeven, via een notaris of een vertrouwde tussenpersoon. Neem contact op met onze support voor hulp bij alternatieven.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag gratis — geen creditcard nodig.</p>

<p><a href="/register">Start nu gratis →</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "slug": "wie-heeft-er-toegang-tot-mijn-verhalen",
        "title": "Wie heeft er toegang tot mijn verhalen?",
        "meta_title": "Wie heeft toegang tot jouw levensverhaal? Volledige controle | BewaardVoorJou.nl",
        "meta_description": "Standaard heeft alleen jijzelf toegang tot jouw levensverhaal bij BewaardVoorJou.nl. Jij bepaalt wie je uitnodigt, welke delen zichtbaar zijn en wanneer. Alles uitgelegd.",
        "keywords": "wie heeft toegang levensverhaal, privacy biografie, levensverhaal beveiligd, toegang beheren biografie, familie toegang levensverhaal, privacy controle BewaardVoorJou",
        "excerpt": "Standaard heeft alleen jijzelf toegang tot jouw levensverhaal bij BewaardVoorJou.nl. Jij bepaalt zelf wie je uitnodigt, welke delen zichtbaar zijn en wanneer. Er is geen automatische toegang voor familieleden of medewerkers.",
        "content": """<blockquote>
<p><strong>In het kort:</strong> Standaard heeft alleen jijzelf toegang tot jouw levensverhaal. Jij bepaalt per onderdeel en per persoon wie er mag meekijken. Medewerkers van BewaardVoorJou.nl hebben in de normale gang van zaken géén toegang tot jouw persoonlijke verhalen.</p>
</blockquote>

<p>Privacy is geen bijzaak bij BewaardVoorJou.nl — het is de basis van alles. Jouw levensverhaal bevat herinneringen, gevoelens en gedachten die je misschien nooit hardop hebt uitgesproken. Dat verdient de hoogste bescherming die wij kunnen bieden.</p>

<h2>Standaard: alleen jijzelf</h2>

<p>Wanneer je een account aanmaakt bij BewaardVoorJou.nl, is alles wat je invult standaard strikt privé. Geen familielid, geen kennis en geen medewerker van BewaardVoorJou.nl kan jouw verhalen zien tenzij jij daar expliciet toestemming voor geeft.</p>

<p>Die toestemming geef jij altijd per onderdeel en per persoon. Er is geen "alles openbaar"-knop en ook geen "alles voor familie"-instelling. De controle blijft altijd bij jou.</p>

<h2>Gedeeld via uitnodiging: jij bepaalt alles</h2>

<p>Als jij wilt dat iemand jouw verhalen kan lezen of beluisteren, nodig je die persoon uit via e-mailadres. Je kiest welke hoofdstukken zichtbaar zijn voor die persoon. De genodigde ontvangt een persoonlijke toegangslink en kan inloggen om de door jou geselecteerde onderdelen te bekijken.</p>

<p>Je kunt een uitnodiging op elk moment intrekken. De persoon verliest dan direct alle toegang.</p>

<blockquote>
<p><strong>Tip:</strong> Je kunt in het dashboard altijd zien wie er toegang heeft tot welke onderdelen van jouw verhaal. Controleer dit overzicht af en toe, zeker als je verhalen al langer geleden hebt gedeeld.</p>
</blockquote>

<h2>Tijdgestuurde vrijgave voor later</h2>

<p>Via de tijdgestuurde vrijgave kun je instellen dat bepaalde familieleden pas na een specifieke datum toegang krijgen — op een verjaardag, een jubileum of pas na jouw overlijden. Meer informatie vind je in ons uitgebreide artikel over <a href="/kennisbank/hoe-werkt-de-tijdgestuurde-vrijgave-voor-familie">de tijdgestuurde vrijgave voor familie</a>.</p>

<h2>Medewerkers van BewaardVoorJou.nl</h2>

<p>Medewerkers hebben in de normale gang van zaken geen toegang tot jouw persoonlijke verhalen. Jouw verhalen zijn versleuteld opgeslagen en alleen toegankelijk met jouw persoonlijke inloggegevens.</p>

<p>In uitzonderlijke gevallen — zoals bij een technische storing waarbij jij actief om hulp vraagt — kan een technisch medewerker met jouw uitdrukkelijke schriftelijke toestemming tijdelijke beperkte toegang krijgen tot specifieke technische gegevens. Dit wordt altijd gelogd en jij ontvangt een verslag van wat er is ingezien.</p>

<h2>Juridische verzoeken</h2>

<p>In het geval van een juridisch verzoek van een Nederlandse of Europese autoriteit zijn we wettelijk verplicht te beoordelen of we hieraan moeten voldoen. We verstrekken nooit meer gegevens dan wettelijk vereist, en informeren jou altijd over een dergelijk verzoek tenzij de wet ons dat verbiedt. Dit scenario is in de praktijk uiterst zeldzaam.</p>

<p>Meer over de technische beveiliging en opslag van jouw gegevens lees je in <a href="/kennisbank/waar-worden-mijn-levensverhalen-opgeslagen-nederlandse-servers">ons artikel over onze Europese servers</a>. Wil je jouw data exporteren of verwijderen? Lees <a href="/kennisbank/hoe-exporteer-ik-mijn-eigen-data-en-herinneringen">hoe je jouw data exporteert</a>.</p>

<hr>

<h2>Veelgestelde vragen over toegang</h2>

<h3>Kan ik zien wie er toegang heeft tot mijn verhalen?</h3>
<p>Ja. In jouw accountinstellingen vind je een overzicht van alle personen die jij hebt uitgenodigd en welke onderdelen zij kunnen zien.</p>

<h3>Kan een familielid mijn verhaal zien zonder dat ik dat weet?</h3>
<p>Nee. Toegang is alleen mogelijk als jij die expliciet hebt verleend via een uitnodiging of een tijdgestuurde vrijgave.</p>

<h3>Wat als ik een gedeelde versie wil terughalen?</h3>
<p>Je kunt een uitnodiging op elk moment intrekken. De persoon verliest direct alle toegang. Gedownloade kopieën die de persoon zelf heeft opgeslagen, vallen buiten onze controle.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag gratis — geen creditcard nodig.</p>

<p><a href="/register">Start nu gratis →</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "slug": "hoe-exporteer-ik-mijn-eigen-data-en-herinneringen",
        "title": "Hoe exporteer ik mijn eigen data en herinneringen?",
        "meta_title": "Jouw levensverhaal exporteren: PDF, MP3, MP4 en ZIP | BewaardVoorJou.nl",
        "meta_description": "Exporteer je levensverhaal als PDF, Word, MP3 of MP4 vanuit BewaardVoorJou.nl. Jouw data is altijd van jou — download alles op elk moment. AVG-conform.",
        "keywords": "levensverhaal exporteren, biografie downloaden, data export biografie, levensverhaal opslaan eigen apparaat, AVG data portabiliteit, PDF biografie downloaden",
        "excerpt": "Bij BewaardVoorJou.nl kun je jouw volledige levensverhaal op elk moment exporteren: tekst als PDF of Word, audio als MP3 en video als MP4. Jouw data is altijd van jou.",
        "content": """<blockquote>
<p><strong>In het kort:</strong> Je kunt jouw volledige levensverhaal op elk moment exporteren als PDF, Word-document, MP3-audiobestanden, MP4-videobestanden of als volledig ZIP-archief. Exporteren betekent kopiëren, niet verwijderen — jouw verhalen blijven op BewaardVoorJou.nl staan.</p>
</blockquote>

<p>Een van de principes waar wij bij BewaardVoorJou.nl het meest trots op zijn, is data portabiliteit: jouw verhaal is van jou. Niet van ons. Dat betekent dat jij altijd het recht hebt om jouw gegevens mee te nemen — naar een persoonlijk archief, een familielid of een andere dienst.</p>

<h2>Wat kun je exporteren?</h2>

<p>BewaardVoorJou.nl biedt vijf exportopties:</p>

<ul>
<li><strong>Tekst als PDF:</strong> Alle getranscribeerde en getypte antwoorden, samengebundeld in een mooi opgemaakt PDF-document per levensfase en hoofdstuk. Printen, opslaan of doorsturen.</li>
<li><strong>Tekst als Word-document:</strong> Dezelfde inhoud als het PDF, maar bewerkbaar. Ideaal voor verder bewerken of aanleveren aan een uitgever.</li>
<li><strong>Audio-opnames als MP3:</strong> Alle audio-opnames als afzonderlijke MP3-bestanden, geordend per hoofdstuk.</li>
<li><strong>Video-opnames als MP4:</strong> Alle video-opnames als afzonderlijke MP4-bestanden, geordend per hoofdstuk.</li>
<li><strong>Volledig archief als ZIP:</strong> Alles tegelijk — tekst, audio en video in één gecomprimeerd archief.</li>
</ul>

<h2>Hoe exporteer je stap voor stap?</h2>

<ol>
<li>Ga naar jouw accountinstellingen.</li>
<li>Kies "Mijn data exporteren".</li>
<li>Selecteer welke exportopties je wilt (en eventueel welke hoofdstukken).</li>
<li>Klik op "Export starten".</li>
</ol>

<p>Voor kleinere exports is de download direct beschikbaar. Voor grotere exports — met veel audio en video — ontvang je een e-mail zodra het archief klaar is om te downloaden.</p>

<blockquote>
<p><strong>Tip:</strong> Maak periodiek een volledige ZIP-export en bewaar die op een externe harde schijf of in een clouddienst naar keuze (zoals Google Drive of iCloud). Zo heb je altijd een veilige kopie, ook los van BewaardVoorJou.nl.</p>
</blockquote>

<h2>Jouw wettelijk recht op data portabiliteit</h2>

<p>Het recht op data portabiliteit is vastgelegd in de Europese AVG-wetgeving. De <a href="https://www.autoriteitpersoonsgegevens.nl/themas/rechten-van-betrokkenen/recht-op-dataportabiliteit" target="_blank" rel="noopener noreferrer">Autoriteit Persoonsgegevens</a> legt uit dat dit recht inhoudt dat jij altijd jouw persoonlijke gegevens kunt opvragen en meenemen in een gangbaar, machineleesbaar formaat. BewaardVoorJou.nl respecteert en faciliteert dit recht volledig.</p>

<h2>Wat kun je doen met jouw export?</h2>

<ul>
<li>Een persoonlijk archief aanleggen op een externe harde schijf</li>
<li>Het PDF-document laten printen als fysiek levensboek</li>
<li>Audio- en video-opnames delen via een USB-stick of familieplatform</li>
<li>De tekst aanleveren aan een professionele ghostwriter of uitgever</li>
</ul>

<p>Wil je ook weten hoe je bepaalt wie er toegang heeft tot jouw verhalen? Lees <a href="/kennisbank/wie-heeft-er-toegang-tot-mijn-verhalen">ons artikel over toegangsbeheer</a>. Of lees meer over de beveiliging van jouw data in <a href="/kennisbank/waar-worden-mijn-levensverhalen-opgeslagen-nederlandse-servers">ons artikel over onze Europese servers</a>.</p>

<hr>

<h2>Veelgestelde vragen over exporteren</h2>

<h3>Kan ik ook een deel van mijn verhaal exporteren?</h3>
<p>Ja. Bij de exportopties kun je selecteren welke hoofdstukken je wilt opnemen. Je hoeft niet alles in één keer te exporteren.</p>

<h3>Hoe groot is een volledige export?</h3>
<p>Een tekstexport is altijd klein (enkele megabytes). Een volledig archief met meerdere uren audio en video kan enkele gigabytes groot zijn.</p>

<h3>Worden mijn gegevens verwijderd na de export?</h3>
<p>Nee. Exporteren betekent kopiëren, niet verwijderen. Jouw gegevens blijven op BewaardVoorJou.nl staan totdat jij ze expliciet verwijdert of jouw account opzegt.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag gratis — geen creditcard nodig.</p>

<p><a href="/register">Start nu gratis →</a></p>""",
    },

    # =========================================================================
    # CATEGORIE D: Account en abonnementen
    # =========================================================================

    {
        "slug": "hoe-maak-ik-een-gratis-account-aan",
        "title": "Hoe maak ik een gratis account aan bij BewaardVoorJou.nl?",
        "meta_title": "Gratis account aanmaken bij BewaardVoorJou.nl — in 1 minuut | Stap voor stap",
        "meta_description": "Een gratis account aanmaken bij BewaardVoorJou.nl is klaar in één minuut. Alleen een e-mailadres nodig. Geen creditcard, geen technische kennis. Stap voor stap uitgelegd.",
        "keywords": "account aanmaken BewaardVoorJou, gratis registreren levensverhaal, BewaardVoorJou beginnen, levensverhaal app registratie, gratis biografie account aanmaken",
        "excerpt": "Een gratis account aanmaken bij BewaardVoorJou.nl duurt minder dan één minuut. Je hebt alleen een e-mailadres nodig. Geen creditcard, geen technische kennis en geen verplichtingen.",
        "content": """<blockquote>
<p><strong>In het kort:</strong> Een gratis account aanmaken duurt minder dan één minuut. Je hebt alleen een e-mailadres, jouw voornaam en een wachtwoord nodig. Geen creditcard, geen verborgen kosten. Na bevestiging kun je direct beginnen met je eerste herinnering.</p>
</blockquote>

<p>Wij hebben het registratieproces bewust zo eenvoudig mogelijk gemaakt. Een nieuwe gebruiker moet zo min mogelijk hoeven invullen voordat hij of zij kan beginnen met het echte werk: het vastleggen van herinneringen.</p>

<h2>Wat je nodig hebt</h2>

<ul>
<li>Een e-mailadres</li>
<li>Een zelfgekozen wachtwoord (minimaal 8 tekens)</li>
<li>Jouw voornaam (zodat de AI-interviewer je bij naam kan aanspreken)</li>
</ul>

<p>Meer is niet nodig. Geen telefoonnummer, geen adresgegevens en geen betaalinformatie.</p>

<h2>Stap voor stap: account aanmaken</h2>

<ol>
<li><strong>Ga naar BewaardVoorJou.nl</strong> en klik op "Gratis beginnen" of "Account aanmaken".</li>
<li><strong>Vul jouw voornaam, e-mailadres en een wachtwoord in.</strong> Kies iets dat je kunt onthouden maar anderen niet gemakkelijk kunnen raden.</li>
<li><strong>Klik op "Account aanmaken".</strong> Je ontvangt binnen een minuut een bevestigingse-mail.</li>
<li><strong>Open de bevestigingse-mail</strong> en klik op "Bevestig mijn account". Je wordt automatisch doorgestuurd en bent direct ingelogd.</li>
<li><strong>Klaar.</strong> Je ziet nu het overzicht van de <a href="/kennisbank/de-30-hoofdstukken-van-je-leven-wat-kun-je-verwachten">dertig hoofdstukken</a> en kunt direct beginnen.</li>
</ol>

<blockquote>
<p><strong>Tip:</strong> Gebruik een e-mailadres dat je regelmatig controleert en niet verliest. Dit is je toegangscode tot je verhalen. Schrijf het wachtwoord op een veilige plek op als je het niet zeker weet te onthouden.</p>
</blockquote>

<h2>Wat is er gratis beschikbaar?</h2>

<p>Met een gratis account kun je meerdere hoofdstukken starten, audio- en video-opnames maken en jouw verhaal bewaren. De gratis versie is ruim genoeg om een goed beeld te krijgen van het platform en jouw eerste herinneringen vast te leggen.</p>

<p>Meer over wat de gratis versie precies biedt, lees je in <a href="/kennisbank/is-bewaardvoorjou-echt-gratis-te-proberen">ons artikel over de gratis versie van BewaardVoorJou.nl</a>.</p>

<h2>Hulp nodig bij registratie?</h2>

<p>Als je vastloopt bij het registreren, staan we klaar via de supportchat op de website. Veel gebruikers laten ook een kind of kleinkind helpen bij het aanmaken van het account, waarna ze daarna zelfstandig verder kunnen.</p>

<p>Zodra je een account hebt, helpt de <a href="/kennisbank/stapsgewijze-handleiding-je-eerste-herinnering-opnemen">stapsgewijze handleiding voor je eerste herinnering</a> je verder.</p>

<hr>

<h2>Veelgestelde vragen over account aanmaken</h2>

<h3>Ik heb de bevestigingse-mail niet ontvangen. Wat nu?</h3>
<p>Controleer eerst jouw spam- of ongewenste-post-map. Staat de e-mail daar ook niet? Ga dan terug naar de registratiepagina en klik op "E-mail opnieuw versturen".</p>

<h3>Kan ik ook inloggen met een Google- of Facebook-account?</h3>
<p>Op dit moment ondersteunt BewaardVoorJou.nl alleen inloggen met e-mailadres en wachtwoord. We werken aan aanvullende inlogmethoden.</p>

<h3>Is mijn e-mailadres veilig bij jullie?</h3>
<p>Ja. Jouw e-mailadres wordt uitsluitend gebruikt voor inloggen, bevestigingen en optionele notificaties. We verkopen of delen jouw e-mailadres nooit met derden.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag gratis — geen creditcard nodig, binnen één minuut start je je eerste herinnering.</p>

<p><a href="/register">Start nu gratis →</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "slug": "is-bewaardvoorjou-echt-gratis-te-proberen",
        "title": "Is BewaardVoorJou.nl echt gratis te proberen?",
        "meta_title": "Is BewaardVoorJou.nl echt gratis? Geen creditcard, geen valkuilen | BewaardVoorJou.nl",
        "meta_description": "Ja, BewaardVoorJou.nl is echt gratis — geen creditcard nodig, geen proefperiode die stilletjes overgaat naar betaald. Ontdek precies wat de gratis versie biedt.",
        "keywords": "BewaardVoorJou gratis, levensverhaal app gratis proberen, gratis biografie app Nederland, BewaardVoorJou kosten, levensverhaal gratis beginnen, geen creditcard nodig",
        "excerpt": "Ja, BewaardVoorJou.nl is echt gratis te proberen. Geen creditcard nodig, geen proefperiode die automatisch overgaat in een betaald abonnement. De gratis versie is ruim genoeg om jouw eerste herinneringen vast te leggen.",
        "content": """<blockquote>
<p><strong>In het kort:</strong> Ja, echt gratis. Geen creditcard nodig. Geen proefperiode die na 30 dagen automatisch overgaat naar betaald. De gratis versie heeft geen einddatum en is ruim genoeg om je levensverhaal te beginnen én voort te zetten.</p>
</blockquote>

<p>Wij begrijpen de scepsis. Veel "gratis" apps blijken na een tijdje toch te vragen om een betaald abonnement — soms pas nadat je al urenlang werk hebt gestoken in het platform. BewaardVoorJou.nl werkt anders. Hier is precies wat de gratis versie inhoudt.</p>

<h2>Wat is volledig gratis?</h2>

<p>Met een gratis account bij BewaardVoorJou.nl kun je:</p>

<ul>
<li>Jouw account aanmaken en jouw profiel instellen</li>
<li>Alle dertig hoofdstukken bekijken en starten</li>
<li>Meerdere audio- en video-opnames maken</li>
<li>Tekst invoeren in alle hoofdstukken</li>
<li>Jouw verhalen opslaan en terugkijken</li>
<li>Gebruik maken van de AI-interviewer voor de startvragen</li>
</ul>

<p>Er is geen tijdslimiet. Je kunt de gratis versie maanden of jaren gebruiken zonder ooit te betalen.</p>

<blockquote>
<p><strong>Geen valkuilen:</strong> Wij sturen je geen creditcardformulier, geen proefperiode die automatisch wordt verlengd en geen misleidende aanbiedingen. Als jij besluit over te stappen naar een betaald abonnement, doe je dat altijd actief en bewust. Nooit automatisch.</p>
</blockquote>

<h2>Wanneer is een betaald abonnement interessant?</h2>

<p>Een betaald abonnement voegt extra mogelijkheden toe voor mensen die meer uit BewaardVoorJou.nl willen halen:</p>

<ul>
<li>Onbeperkte opnameruimte voor audio en video</li>
<li>Geavanceerde AI-doorvraagfuncties die dieper ingaan op jouw verhaal</li>
<li>De <a href="/kennisbank/hoe-werkt-de-tijdgestuurde-vrijgave-voor-familie">tijdgestuurde vrijgave voor familie</a></li>
<li>Export als mooi opgemaakt PDF-levensboek</li>
<li>Prioriteitsondersteuning via telefoon</li>
</ul>

<p>De gratis versie is bewust genereus gehouden omdat wij geloven dat iedereen het recht heeft om zijn of haar levensverhaal te bewaren, ongeacht financiële situatie.</p>

<h2>Geen verborgen kosten, nooit</h2>

<p>Bij BewaardVoorJou.nl zijn er geen verborgen kosten. Je betaalt nooit voor functies die niet expliciet als betaald worden vermeld. De prijzen van de betaalde abonnementen staan duidelijk op de <a href="/pricing">prijzenpagina</a>.</p>

<h2>Een gratis account aanmaken in 1 minuut</h2>

<p>Meer weten over hoe je een account aanmaakt? Lees <a href="/kennisbank/hoe-maak-ik-een-gratis-account-aan">ons stap-voor-stap artikel over het aanmaken van een gratis account</a>. En mocht je later je abonnement willen opzeggen, lees dan <a href="/kennisbank/hoe-kan-ik-mijn-abonnement-opzeggen">hoe dat werkt</a>.</p>

<hr>

<h2>Veelgestelde vragen over de gratis versie</h2>

<h3>Blijft de gratis versie voor altijd beschikbaar?</h3>
<p>Ja, dat is onze intentie. Als daar ooit iets in zou veranderen, informeren we gebruikers ruim van tevoren.</p>

<h3>Wat gebeurt er met mijn verhalen als ik overstap van gratis naar betaald?</h3>
<p>Niets verandert. Alles wat je in de gratis versie hebt opgeslagen, blijft volledig beschikbaar in de betaalde versie.</p>

<h3>Kan ik ook overstappen van betaald terug naar gratis?</h3>
<p>Ja. Als je jouw betaald abonnement opzegt, val je terug op de gratis versie. Jouw verhalen blijven bewaard. Functies die exclusief zijn voor de betaalde versie worden gedeactiveerd totdat je opnieuw een abonnement afsluit.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag gratis — geen creditcard nodig, binnen één minuut start je je eerste herinnering.</p>

<p><a href="/register">Start nu gratis →</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "slug": "hoe-kan-ik-mijn-abonnement-opzeggen",
        "title": "Hoe kan ik mijn abonnement opzeggen?",
        "meta_title": "Abonnement opzeggen bij BewaardVoorJou.nl — eenvoudig, direct, geen gedoe",
        "meta_description": "Je kunt jouw abonnement bij BewaardVoorJou.nl op elk moment opzeggen via jouw accountinstellingen. Geen opzegtermijn, geen telefoontje. Jouw verhalen blijven altijd bewaard.",
        "keywords": "abonnement opzeggen BewaardVoorJou, BewaardVoorJou opzeggen stap voor stap, abonnement annuleren levensverhaal app, opzeggen biografie account, account verwijderen BewaardVoorJou",
        "excerpt": "Je kunt jouw abonnement bij BewaardVoorJou.nl op elk moment opzeggen via jouw accountinstellingen. Geen opzegtermijn, geen telefoontje nodig. Je verhalen blijven altijd bewaard.",
        "content": """<blockquote>
<p><strong>In het kort:</strong> Opzeggen duurt twee minuten via jouw accountinstellingen. Geen telefoontje, geen wachttijd, geen ingewikkelde formulieren. Na opzegging behoud je toegang tot betaalde functies tot het einde van je huidige betaalperiode. Jouw verhalen blijven altijd bewaard.</p>
</blockquote>

<p>Wij willen dat jij BewaardVoorJou.nl gebruikt omdat je er waarde in ziet, niet omdat opzeggen te ingewikkeld is. Daarom is het opzeggen bewust zo eenvoudig mogelijk gemaakt.</p>

<h2>Stap voor stap: abonnement opzeggen</h2>

<ol>
<li><strong>Log in</strong> op jouw account op BewaardVoorJou.nl.</li>
<li><strong>Klik op jouw naam</strong> of profielfoto rechts bovenin en kies "Accountinstellingen".</li>
<li><strong>Ga naar het tabblad "Abonnement".</strong></li>
<li><strong>Klik op "Abonnement opzeggen".</strong> Je ziet een overzicht van wat er verandert na opzegging.</li>
<li><strong>Bevestig de opzegging.</strong> Je ontvangt een bevestigingse-mail.</li>
</ol>

<p>Geen telefoontje nodig, geen wachttijden en geen ingewikkelde formulieren.</p>

<h2>Wat verandert er na opzegging?</h2>

<p>Na opzegging behoud je alle betaalde functies tot het einde van jouw huidige abonnementsperiode. Als je op de vijftiende van de maand opzegt en jouw abonnement loopt tot de eenendertigste, kun je de betaalde functies nog gebruiken tot en met die datum.</p>

<p>Daarna val je automatisch terug op de gratis versie. Jouw verhalen, opnames en alle inhoud die je hebt opgeslagen, blijven volledig bewaard. Lees in <a href="/kennisbank/is-bewaardvoorjou-echt-gratis-te-proberen">ons artikel over de gratis versie</a> precies wat je dan nog kunt gebruiken.</p>

<blockquote>
<p><strong>Jouw verhalen zijn altijd van jou:</strong> Een platform dat jouw data gijzelt zodra je wilt vertrekken, verdient je vertrouwen niet. Bij BewaardVoorJou.nl kun je altijd alles exporteren en altijd vertrekken. Lees hoe in <a href="/kennisbank/hoe-exporteer-ik-mijn-eigen-data-en-herinneringen">ons artikel over het exporteren van jouw data</a>.</p>
</blockquote>

<h2>Volledig account verwijderen</h2>

<p>Wil je niet alleen jouw abonnement opzeggen maar ook jouw volledige account en alle gegevens verwijderen? Dat kan via "Account verwijderen" in jouw accountinstellingen. Let op: dit is definitief. Exporteer jouw data eerst als je die wilt bewaren.</p>

<hr>

<h2>Veelgestelde vragen over opzeggen</h2>

<h3>Krijg ik geld terug als ik halverwege een periode opzeg?</h3>
<p>Betaalde abonnementen worden niet gerestitueerd voor de resterende periode. Je behoudt wel toegang tot alle betaalde functies tot het einde van de betaalde periode.</p>

<h3>Kan ik opnieuw een abonnement afsluiten na opzegging?</h3>
<p>Ja, altijd. Je kunt op elk gewenst moment opnieuw een betaald abonnement afsluiten via jouw accountinstellingen. Alle inhoud die je eerder had opgeslagen, is er nog steeds.</p>

<h3>Wat als ik moeite heb met het opzeggen?</h3>
<p>Neem contact op via de supportchat of het <a href="/contact">contactformulier</a>. Wij helpen je zo snel mogelijk verder — zonder teleurgesteld bericht en zonder poging om je over te halen te blijven.</p>

<h3>Wat als ik jouw service niet goed vond?</h3>
<p>Dan horen wij dat graag. Niet om je op gedachten te brengen, maar omdat eerlijke feedback ons helpt beter te worden. Je kunt ons bereiken via het contactformulier of door te reageren op de bevestigingse-mail van jouw opzegging.</p>

<hr>

<p><strong>Heb je toch vragen over jouw abonnement?</strong> Ons team staat voor je klaar via de supportchat op BewaardVoorJou.nl. We reageren doorgaans binnen één werkdag.</p>

<p><a href="/contact">Neem contact op →</a></p>""",
    },

]


def main():
    parser = argparse.ArgumentParser(
        description="Update kennisbank artikelen voor BewaardVoorJou.nl"
    )
    parser.add_argument("--email", required=True, help="Admin e-mailadres")
    parser.add_argument("--password", required=True, help="Admin wachtwoord")
    parser.add_argument(
        "--url",
        default="http://localhost:8001/api/v1",
        help="API basis-URL (standaard: http://localhost:8001/api/v1)",
    )
    args = parser.parse_args()

    print(f"Inloggen als {args.email}...")
    token = login(args.url, args.email, args.password)
    print("Inloggen gelukt.\n")

    print(f"Bijwerken van {len(ARTICLES)} kennisbank artikelen...\n")
    for article in ARTICLES:
        slug = article.pop("slug")
        update_article(args.url, token, slug, article.copy())

    print(f"\nKlaar! {len(ARTICLES)} artikelen verwerkt.")
    print("Controleer de kennisbank op https://bewaardvoorjou.nl/kennisbank")


if __name__ == "__main__":
    main()
