#!/usr/bin/env python3
"""
Seed-script voor de wereldklasse-contentlancering van BewaardVoorJou.nl.

Voegt 6 kennisbank- en 4 blogartikelen toe, geschreven volgens de
redactiegids v2.0 (ik-vorm als Vincent, dynamische E-E-A-T invalshoeken
A/B/C, sentence case, duale CTA, formule-kaarten als blockquote). Elk
artikel krijgt een unieke publicatiedatum tussen 2025-12-01 en 2026-07-01.

Werkwijze (identiek aan seed_kennisbank.py): aanmaken via de API zodat de
HTML-sanitizer draait, daarna publiceren en de publicatiedatum terugzetten.

Gebruik (lokaal):
  python scripts/seed_wereldklasse_content.py --email admin@... --password ...

Gebruik (productie):
  python scripts/seed_wereldklasse_content.py --email admin@... --password ... \
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

    # =====================================================================
    # KENNISBANK
    # =====================================================================

    # K1 — Privacy & Nederlandse hosting (invalshoek A)
    {
        "title": "Waar staan mijn herinneringen echt? Over Nederlandse servers en encryptie",
        "slug": "waar-staan-mijn-herinneringen-nederlandse-servers-encryptie",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#E3ECF5",
        "header_text_color": "#1E3A5F",
        "published_at": "2025-12-03T09:00:00+00:00",
        "meta_title": "Waar staan mijn herinneringen? NL-servers & encryptie",
        "meta_description": "Je levensverhaal staat op streng beveiligde Nederlandse servers, bank-niveau versleuteld. Ik leg uit hoe we jouw herinneringen echt beschermen.",
        "keywords": "levensverhaal veilig opslaan, nederlandse servers avg, encryptie herinneringen, privacy levensverhaal, waar worden mijn gegevens opgeslagen",
        "tags": "privacy, veiligheid, avg, hosting, encryptie",
        "excerpt": "Je herinneringen staan op streng beveiligde Nederlandse servers, versleuteld op bank-niveau. Ik leg uit wat dat concreet betekent en waarom ik die keuze heb gemaakt.",
        "content": """<p><strong>In het kort:</strong> je herinneringen bij BewaardVoorJou.nl staan op streng beveiligde Nederlandse servers, volledig versleuteld op bank-niveau. Geen Amerikaanse cloudgigant, geen meekijken. In dit artikel leg ik precies uit wat dat betekent en waarom ik die keuze bewust heb gemaakt.</p>

<p>In mijn dagelijkse werk als innovatiemanager bouw ik met WeAreImpact AI-oplossingen die aan de strengste security-eisen moeten voldoen. Diezelfde onwrikbare standaarden heb ik doorgetrokken naar ons levensboekplatform. Want een levensverhaal is het meest persoonlijke wat iemand bezit. Als ik dat niet met bank-niveau zorg bescherm, verdien ik het vertrouwen niet.</p>

<h2>Waarom de plek waar je data staat ertoe doet</h2>
<p>Veel mensen denken bij "de cloud" aan een vage plek ergens in de lucht. In werkelijkheid is de cloud gewoon een computer van iemand anders, in een gebouw, in een land, onder een bepaalde wet. En juist dat laatste maakt het verschil.</p>
<p>Veel populaire diensten slaan je gegevens op bij Amerikaanse techbedrijven. Onder Amerikaanse wetgeving kan een overheid in bepaalde gevallen toegang eisen tot die data, zelfs als die van een Europeaan is. Voor een vakantiefoto maakt dat weinig uit. Voor het verhaal van je leven wél.</p>

<h2>Wat 100% Nederlandse hosting concreet betekent</h2>
<p>Ik heb ervoor gekozen om alles op te slaan op streng beveiligde Nederlandse servers. Dat betekent:</p>
<ul>
<li>Je verhalen vallen volledig onder de Europese privacywet (de AVG), zonder omwegen.</li>
<li>Er is geen Amerikaanse partij die toegang kan afdwingen.</li>
<li>De fysieke servers staan in Nederland, onder Nederlands toezicht.</li>
</ul>

<h2>Bank-niveau versleuteling, uitgelegd zonder jargon</h2>
<p>Versleuteling klinkt technisch, maar het idee is simpel. Stel je een kluis voor waarvan alleen jij de sleutel hebt. Zelfs als iemand de kluis steelt, ziet hij niets bruikbaars zonder die sleutel. Zo werkt encryptie: je herinneringen worden omgezet in onleesbare code, en alleen met de juiste sleutel worden ze weer leesbaar.</p>
<blockquote>
<p><strong>De kern in één zin:</strong> niemand kijkt ongevraagd mee. Jouw verhaal is versleuteld opgeslagen, en jij bepaalt wie het ooit te zien krijgt.</p>
</blockquote>
<p>Dit is een van de zes vaste pijlers onder alles wat we bouwen: <strong>bank-niveau versleuteling</strong>. Niet als marketingterm, maar als bouwbesluit.</p>

<h2>Wat betekent dit voor jou, aan de keukentafel?</h2>
<p>Het betekent dat je een herinnering kunt inspreken over je moeilijkste jaar, of een boodschap voor een kleinkind dat nog geboren moet worden, zonder je zorgen te maken over wie er meeleest. Die rust is precies de bedoeling. Techniek die hapert of onveilig voelt, haalt de stroom aan herinneringen weg. Techniek die je vertrouwt, laat je vrijuit vertellen.</p>

<h2>Veelgestelde vragen</h2>
<h3>Kunnen medewerkers van BewaardVoorJou mijn verhalen lezen?</h3>
<p>Nee. Je verhalen zijn versleuteld en standaard privé. Wij gebruiken je inhoud nooit voor reclame of om AI-modellen te trainen.</p>
<h3>Wat gebeurt er als ik mijn account opzeg?</h3>
<p>Dan kun je eerst alles exporteren, en daarna worden je gegevens verwijderd. Je blijft eigenaar van je eigen verhaal. Lees hierover meer in <a href="/kennisbank/van-digitaal-verhaal-naar-tastbaar-levensboek-exporteren">het artikel over exporteren</a>.</p>
<h3>Kan ik zelf bepalen wie wat ziet?</h3>
<p>Ja. Met tijdgestuurde vrijgave bepaal je precies wie welk hoofdstuk wanneer mag zien. Dat lees je in <a href="/kennisbank/tijdgestuurde-vrijgave-zelf-bepalen-wie-wat-wanneer-ziet">dit artikel over de time-lock</a>.</p>
""" + CTA_DUAAL,
    },

    # K2 — Time-lock / tijdgestuurde vrijgave (invalshoek A)
    {
        "title": "Zelf bepalen wie wat wanneer ziet: zo werkt tijdgestuurde vrijgave",
        "slug": "tijdgestuurde-vrijgave-zelf-bepalen-wie-wat-wanneer-ziet",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#E7EEF6",
        "header_text_color": "#1E3A5F",
        "published_at": "2026-01-08T09:00:00+00:00",
        "meta_title": "Tijdgestuurde vrijgave: zelf bepalen wie wat ziet",
        "meta_description": "Met tijdgestuurde vrijgave bepaal jij wie welk hoofdstuk wanneer ziet. Een brief voor later, een verhaal voor straks. Zo werkt de time-lock.",
        "keywords": "tijdgestuurde vrijgave, time lock levensverhaal, brief voor later, boodschap na overlijden, herinnering vrijgeven toekomst",
        "tags": "time-lock, privacy, nalatenschap, vrijgave, controle",
        "excerpt": "Sommige woorden zijn pas voor later. Met tijdgestuurde vrijgave bepaal jij wie welk hoofdstuk op welk moment mag lezen, horen of zien.",
        "content": """<p><strong>In het kort:</strong> met tijdgestuurde vrijgave (de time-lock) bepaal je zelf wie welk deel van je levensverhaal op welk moment te zien krijgt. Een boodschap voor de achttiende verjaardag van je kleinkind, een verhaal dat pas later mag worden gedeeld: jij houdt de regie, altijd.</p>

<p>In mijn werk als tech-ondernemer draait alles om controle over wie waarbij mag. Diezelfde gedachte zit in ons platform. Want een levensverhaal gaat niet alleen over wat je vertelt, maar ook over wanneer het gehoord mag worden. Sommige woorden zijn een cadeau voor de toekomst.</p>

<h2>Waarom timing soms alles is</h2>
<p>Niet elke herinnering is voor iedereen, en niet elk moment is het juiste moment. Een grootouder wil een kleinkind misschien iets meegeven voor als het achttien wordt. Een ouder wil een boodschap achterlaten die pas telt op een trouwdag die nog moet komen. Zonder controle over timing blijven die woorden ofwel ongezegd, ofwel te vroeg gedeeld.</p>

<h2>Zo werkt de time-lock in de praktijk</h2>
<p>Je legt een hoofdstuk of een losse herinnering vast zoals je gewend bent: in tekst, audio of video. Daarna kies je wie het mag ontvangen en wanneer. Bijvoorbeeld:</p>
<ul>
<li><strong>Nu delen</strong> met je kinderen, zodat jullie er samen over kunnen praten.</li>
<li><strong>Later vrijgeven</strong> op een datum die jij kiest, zoals een verjaardag of jubileum.</li>
<li><strong>Privé houden</strong> voor altijd, alleen voor jezelf.</li>
</ul>
<blockquote>
<p><strong>Tijdgestuurde vrijgave</strong> is een van de zes pijlers van het platform: jij bepaalt wie op welk moment toegang krijgt tot welke hoofdstukken.</p>
</blockquote>

<h2>Een brief voor later, zonder de techniek te hoeven begrijpen</h2>
<p>Je hoeft geen instellingen of ingewikkelde schermen te doorgronden. Je kiest een naam en een moment, en de rest gebeurt vanzelf. Toen ik dit ontwierp, dacht ik aan mensen die vastlopen zodra techniek in de weg gaat zitten. Daarom praat je tegen ons platform alsof je bij mij aan de keukentafel zit, en werkt de vrijgave met gewone taal: aan wie, en wanneer.</p>

<h2>Wat als er iets met mij gebeurt?</h2>
<p>Ook daar is aan gedacht. Je kunt vastleggen dat bepaalde hoofdstukken pas vrijkomen op een gekozen moment of onder gekozen voorwaarden. Zo blijft je verhaal van jou, en komt het precies terecht bij wie jij wilt, wanneer jij dat wilt. Meer over veilige opslag lees je in <a href="/kennisbank/waar-staan-mijn-herinneringen-nederlandse-servers-encryptie">het artikel over Nederlandse servers en encryptie</a>.</p>

<h2>Veelgestelde vragen</h2>
<h3>Kan ik een vrijgavedatum later nog aanpassen?</h3>
<p>Ja. Zolang de datum nog niet is verstreken, kun je de ontvanger of het moment altijd wijzigen.</p>
<h3>Ziet de ontvanger dat er iets voor later klaarstaat?</h3>
<p>Alleen als jij dat wilt. Je kunt een vrijgave volledig als verrassing instellen, of juist aankondigen.</p>
<h3>Werkt dit ook voor audio en video?</h3>
<p>Ja, voor elke vorm. Juist een stem of een gezicht dat later vrijkomt, raakt vaak het diepst.</p>
""" + CTA_DUAAL,
    },

    # K3 — Reminiscentie in de zorg (invalshoek C)
    {
        "title": "Waarom levensverhalen werken in de zorg: reminiscentie als activiteit",
        "slug": "reminiscentie-in-de-zorg-levensverhalen-als-activiteit",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#EFE7DA",
        "header_text_color": "#5C3D2E",
        "published_at": "2026-02-05T09:00:00+00:00",
        "meta_title": "Reminiscentie in de zorg: levensverhalen als activiteit",
        "meta_description": "Reminiscentie ordent gedachten, geeft betekenis en gaat eenzaamheid tegen. Ik deel wat ik in de welzijnssector leerde over de kracht van verhalen.",
        "keywords": "reminiscentie zorg, levensverhaal ouderen zorg, eenzaamheid tegengaan, welzijnssector activiteiten, verhalen ophalen dementie",
        "tags": "reminiscentie, zorg, welzijn, eenzaamheid, ouderen",
        "excerpt": "In de welzijnssector zag ik duizenden keren hoe kostbaar het is om verhalen te vangen voordat ze vervagen. Reminiscentie is geen vrijblijvend tijdverdrijf, maar zorg.",
        "content": """<p><strong>In het kort:</strong> reminiscentie — het actief ophalen en delen van levensverhalen — ordent gedachten, geeft betekenis aan een leven en gaat eenzaamheid tegen. Voor zorg- en welzijnsorganisaties is het een waardevolle, herhaalbare activiteit. Ik leg uit waarom, en hoe je het opzet.</p>

<p>In mijn tijd als directeur in de welzijnssector heb ik duizenden keren gezien hoe kostbaar het is om geluksmomenten en verhalen actief te vangen voordat ze vervagen. Bij Stichting de Baan werkten we met honderden deelnemers en tientallen vrijwilligers, en telkens bleek: echte aandacht zit niet in een programma of een computer, maar in het stellen van de juiste vraag op het juiste moment.</p>

<h2>Wat reminiscentie precies doet</h2>
<p>Reminiscentie is het bewust ophalen van herinneringen, vaak met een aanleiding: een oude foto, een liedje, een geur. Het is meer dan gezellig terugkijken. Het heeft een aantoonbaar effect op het welzijn van mensen:</p>
<ul>
<li><strong>Het ordent gedachten.</strong> Een leven op een rij zetten geeft overzicht en rust.</li>
<li><strong>Het geeft betekenis.</strong> Gebeurtenissen krijgen een plek in een groter verhaal.</li>
<li><strong>Het versterkt eigenwaarde.</strong> Iemand die zijn verhaal vertelt, voelt zich gehoord en gezien.</li>
<li><strong>Het gaat eenzaamheid tegen.</strong> Verhalen delen schept verbinding, tussen generaties en binnen een groep.</li>
</ul>

<h2>De valkuil: het blijft vaak bij goede bedoelingen</h2>
<p>Bijna elke zorgorganisatie wíl aandacht voor levensverhalen. Toch strandt het vaak op tijd en menskracht. Een goed verhaalgesprek voorbereiden, voeren en vastleggen kost uren die er in de praktijk niet zijn. Het gevolg: de mooie voornemens verdampen, en de verhalen vervagen alsnog.</p>
<blockquote>
<p>Echte aandacht zit niet in een computerprogramma, maar in het stellen van de juiste vragen. De techniek hoort dat gesprek te dragen, niet te vervangen.</p>
</blockquote>

<h2>Hoe de techniek hier helpt, zonder de warmte weg te nemen</h2>
<p>Ik heb BewaardVoorJou.nl zo gebouwd dat de <strong>empathische AI-interviewer</strong> het voorwerk uit handen neemt. Die stelt op het juiste moment de juiste verdiepingsvraag en loodst iemand rustig door de hoofdstukken van zijn leven. Een vrijwilliger of begeleider hoeft dan niet meer de perfecte vragen te bedenken, maar kan gewoon náást de deelnemer zitten en luisteren. Dankzij slimme techniek doe je in een fractie van de tijd waar je anders een middag voor nodig had.</p>
<p>En omdat mensen vrij kunnen kiezen tussen praten, inspreken of typen — de <strong>multimodale invoer</strong> — doet ook iemand met artritis, dyslexie of weinig schoolervaring gewoon mee.</p>

<h2>Reminiscentie opzetten in jouw organisatie</h2>
<p>Wil je reminiscentie structureel inbedden als activiteit, bijvoorbeeld in een woonzorgcentrum of een welzijnsprogramma? Dan denk ik daar graag over mee, vanuit de praktijk. Ik weet hoe de werkvloer werkt én hoe je techniek zo inzet dat ze de menselijke maat versterkt in plaats van verstoort.</p>

<h2>Veelgestelde vragen</h2>
<h3>Werkt dit ook voor mensen met beginnende dementie?</h3>
<p>Vaak wel. Juist lang geleden opgeslagen herinneringen blijven lang bereikbaar. Een vertrouwde vraag of een oud liedje kan verrassend veel losmaken. Ga altijd uit van wat iemand nog wél kan.</p>
<h3>Hebben deelnemers technische vaardigheden nodig?</h3>
<p>Nee. Ze praten gewoon; een begeleider of de interviewer doet de rest.</p>
<h3>Wie is eigenaar van de verhalen?</h3>
<p>De deelnemer zelf, altijd. Verhalen zijn privé tenzij iemand ze bewust deelt.</p>
""" + CTA_DUAAL,
    },

    # K4 — Een dierbare op afstand interviewen (invalshoek B)
    {
        "title": "Zo interview je een ouder die ver weg woont",
        "slug": "een-ouder-op-afstand-interviewen-levensverhaal-vastleggen",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#F0E7D8",
        "header_text_color": "#5C3D2E",
        "published_at": "2026-03-05T09:00:00+00:00",
        "meta_title": "Een ouder op afstand interviewen: zo doe je dat",
        "meta_description": "Woont je vader of moeder ver weg? Zo leg je toch samen een levensverhaal vast, in tekst, audio of video, in ieders eigen tempo.",
        "keywords": "ouder op afstand interviewen, levensverhaal vastleggen afstand, herinneringen ouder ver weg, ouders interviewen tips, verhaal opnemen op afstand",
        "tags": "op afstand, interview, ouders, multimodaal, tips",
        "excerpt": "Afstand hoeft geen reden te zijn om het gesprek uit te stellen. Ik laat zien hoe je samen een levensverhaal vastlegt, ook als je niet vaak op bezoek kunt.",
        "content": """<p><strong>In het kort:</strong> ook als je ouder ver weg woont, kun je samen een levensverhaal vastleggen. Je vader of moeder spreekt herinneringen in via audio of video wanneer het uitkomt, en jij leest, luistert en reageert wanneer het jou uitkomt. De afstand valt weg; het verhaal blijft.</p>

<p>Toen mijn eigen vader zijn levensverhaal wilde vastleggen, zag ik hoe snel hij vastliep achter de computer. Het haperen van de techniek haalde de stroom aan herinneringen weg. Juist om die drempel te slopen — voor hem, en nu voor iedereen — heb ik ons platform zo gemaakt dat je er gewoon tegen praat, alsof je bij mij aan de keukentafel zit. En dat werkt net zo goed als de keukentafel duizend kilometer verderop staat.</p>

<h2>Waarom afstand het gesprek zo vaak uitstelt</h2>
<p>Veel mensen wachten met dit soort gesprekken tot "het volgende bezoek". Maar bezoeken zijn kort, vol en gehaast. Er is altijd een reden om het uit te stellen. En bij afstand komt daar een extra drempel bij: je kunt niet even samen op de bank gaan zitten met een fotoalbum. Dat gevoel van "het komt er niet van" is precies waar zoveel verhalen verloren gaan.</p>

<h2>De oplossing: ieder in zijn eigen tempo</h2>
<p>Het mooie van vastleggen op afstand is dat het niet op hetzelfde moment hoeft te gebeuren. Dankzij de <strong>multimodale invoer</strong> kiest je ouder zelf hoe en wanneer:</p>
<ul>
<li><strong>Audio:</strong> je moeder spreekt op een rustige avond een herinnering in. De app zet het automatisch om naar tekst.</li>
<li><strong>Video:</strong> je vader vertelt recht in de camera. Zo bewaar je niet alleen de woorden, maar ook zijn stem en gezicht.</li>
<li><strong>Tekst:</strong> wie liever typt, typt. De interviewer stelt de vragen die op gang helpen.</li>
</ul>
<p>Jij kunt op je eigen moment meelezen, meeluisteren en doorvragen. Zo ontstaat een gesprek dat zich uitspreidt over weken, zonder dat iemand hoeft te haasten.</p>

<h2>Drie praktische tips voor op afstand</h2>
<blockquote>
<p><strong>Begin klein.</strong> Vraag niet om "het hele leven", maar om één herinnering. De eerste die spontaan opkomt is altijd goed genoeg.</p>
</blockquote>
<ul>
<li><strong>Kies een vast moment.</strong> Bijvoorbeeld elke zondag één hoofdstuk. Ritme verlaagt de drempel.</li>
<li><strong>Laat de interviewer het werk doen.</strong> De <strong>empathische AI-interviewer</strong> stelt concrete vragen, zodat jij niet hoeft te bedenken hoe je een heel leven ter sprake brengt.</li>
<li><strong>Reageer warm.</strong> Een kort bericht terug ("wat mooi dat je dit vertelde") houdt het gesprek levend.</li>
</ul>

<h2>Wat je ouder niet hoeft te kunnen</h2>
<p>Je ouder hoeft geen schrijver te zijn, geen computerkenner en geen techneut. Praten is genoeg. Alles wat verder nodig is, neemt de app over. Meer hierover lees je in <a href="/kennisbank/reminiscentie-in-de-zorg-levensverhalen-als-activiteit">het artikel over de kracht van verhalen ophalen</a>.</p>

<h2>Veelgestelde vragen</h2>
<h3>Moeten we op hetzelfde moment online zijn?</h3>
<p>Nee. Juist niet. Ieder werkt wanneer het uitkomt; dat is de hele kracht van deze aanpak.</p>
<h3>Wat als mijn ouder de techniek eng vindt?</h3>
<p>Begin samen met één audio-opname via de telefoon. Zodra iemand merkt dat het gewoon praten is, verdwijnt de angst meestal snel.</p>
<h3>Kan ik zelf een account voor mijn ouder aanmaken?</h3>
<p>Ja, dat kan, en het is vaak de makkelijkste start. Je zet alles klaar en je ouder hoeft alleen nog maar te vertellen.</p>
""" + CTA_DUAAL,
    },

    # K5 — De psychologie van bewaren (invalshoek C, SVI-formule)
    {
        "title": "De psychologie van bewaren: waarom je niets wilt weggooien",
        "slug": "de-psychologie-van-bewaren-waarom-je-niets-wilt-weggooien",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#EFE3D6",
        "header_text_color": "#5C3D2E",
        "published_at": "2026-04-09T09:00:00+00:00",
        "meta_title": "De psychologie van bewaren: waarom weggooien pijn doet",
        "meta_description": "Waarom voelt een eerste mutsje weggooien als verlies? De wetenschap van het verlengde zelf verklaart waarom bewaren actieve emotionele regulatie is.",
        "keywords": "psychologie van bewaren, verlengde zelf, sentimentele waarde, waarom bewaar je spullen, herinneringen loslaten, extended self belk",
        "tags": "psychologie, herinneringen, bewaren, wetenschap, betekenis",
        "excerpt": "Waarom voelt het weggooien van een eerste mutsje bijna als een amputatie? De wetenschap laat zien dat bewaren geen passieve gewoonte is, maar actieve emotionele regulatie.",
        "content": """<p><strong>In het kort:</strong> bewaren is geen passieve gewoonte, maar actieve emotionele regulatie. Objecten worden verlengstukken van wie we zijn, en daarom voelt het weggooien van een dierbaar voorwerp als verlies. Ik leg de wetenschap erachter uit, en wat het betekent voor hoe je herinneringen vastlegt.</p>

<p>In mijn tijd in de welzijnssector zag ik keer op keer hoe zwaar het voor mensen kan zijn om iets weg te doen wat op het oog "maar een dingetje" is. Een versleten knuffel, een eerste paar schoentjes, een verjaardagskaart van iemand die er niet meer is. Dat gevoel is niet sentimenteel gedoe. Er zit echte psychologie onder.</p>

<h2>Objecten als verlengstuk van jezelf</h2>
<p>De psycholoog Russell Belk beschreef het als het "verlengde zelf": de spullen om ons heen zijn geen losse dingen, maar dragen een stukje van onze identiteit. Een eerste mutsje van je kind is niet zomaar stof; het is een bewijsstuk van een periode die jou heeft gevormd. Het weggooien voelt daarom bijna als een amputatie, en dat is geen overdrijving maar een herkenbaar mechanisme.</p>
<p>De kinderarts en psychoanalyticus Donald Winnicott liet zien hoe zulke objecten werken als een "kalmeringsbrug" tijdens grote overgangen. Denk aan het knuffeltje waar een kind niet zonder kan. Ook volwassenen houden zulke ankers vast, juist op momenten van verandering.</p>

<h2>De waarde van een herinnering, in één formule</h2>
<p>Onderzoekers proberen die emotionele waarde soms te vatten in een index. Je hoeft geen wiskundige te zijn om te zien wat ze bedoelen:</p>
<blockquote>
<p><strong>Sentimentele Waarde-index (SVI)</strong></p>
<p><code>SVI = (Zintuiglijke resonantie × Identiteit) ÷ (Chaos × Overgang)</code></p>
<p>In gewone taal: de emotionele waarde van een voorwerp stijgt naarmate het méér zintuigen raakt en méér over wie je bent zegt, en daalt naarmate het verdwijnt in chaos of losraakt van een betekenisvol moment.</p>
</blockquote>
<p>De praktische les zit in die noemer: <strong>chaos verlaagt de waarde</strong>. Duizend ongeordende foto's op een telefoon raken je minder dan één zorgvuldig bewaarde herinnering. Bewaren werkt pas als je ook kiest.</p>

<h2>Waarom digitaal bewaren vaak toch niet lukt</h2>
<p>We maken meer beeld dan ooit, en toch vervaagt er meer dan ooit. Bestanden verdwijnen in mappen die niemand ooit nog opent. De herinnering is technisch bewaard, maar emotioneel onbereikbaar. Dat is het verschil tussen opslaan en écht bewaren.</p>
<p>Daarom draait BewaardVoorJou.nl niet om zoveel mogelijk opslaan, maar om betekenis vasthouden. De <strong>empathische AI-interviewer</strong> helpt je de verhalen áchter de voorwerpen te vertellen, zodat niet het spul maar de betekenis bewaard blijft. En met <strong>eenvoudige export</strong> kun je die betekenis omzetten in iets tastbaars, bijvoorbeeld een gedrukt levensboek. Hoe dat werkt lees je in <a href="/kennisbank/van-digitaal-verhaal-naar-tastbaar-levensboek-exporteren">het artikel over exporteren</a>.</p>

<h2>Veelgestelde vragen</h2>
<h3>Betekent dit dat ik alles moet bewaren?</h3>
<p>Juist niet. Kiezen wat je bewaart, verhoogt de waarde van wat overblijft. Eén betekenisvol verhaal is meer waard dan honderd losse fragmenten.</p>
<h3>Waarom raakt een stem me dieper dan een foto?</h3>
<p>Omdat een stem meer zintuigen tegelijk aanspreekt: klank, aarzeling, emotie. Dat verhoogt de zintuiglijke resonantie uit de formule hierboven.</p>
<h3>Is het gezond om zo aan spullen te hechten?</h3>
<p>Hechten aan betekenisvolle voorwerpen is heel normaal en meestal gezond. Het wordt pas een last als de chaos de betekenis overwoekert. Ordenen helpt daar juist tegen.</p>
""" + CTA_DUAAL,
    },

    # K6 — Export naar tastbaar levensboek (pijler export)
    {
        "title": "Van digitaal verhaal naar tastbaar levensboek: zo exporteer je alles",
        "slug": "van-digitaal-verhaal-naar-tastbaar-levensboek-exporteren",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#EDE4D3",
        "header_text_color": "#5C3D2E",
        "published_at": "2026-01-22T09:00:00+00:00",
        "meta_title": "Van digitaal verhaal naar tastbaar levensboek exporteren",
        "meta_description": "Je verhalen blijven van jou. Exporteer je teksten, audio en video, of laat er een gedrukt levensboek van maken. Zo werkt exporteren bij BewaardVoorJou.",
        "keywords": "levensverhaal exporteren, gedrukt levensboek, herinneringen downloaden, biografie boek laten maken, levensverhaal op usb",
        "tags": "export, levensboek, tastbaar, eigendom, familie",
        "excerpt": "Een digitaal verhaal is prachtig, maar soms wil je het kunnen vasthouden. Ik leg uit hoe je alles exporteert en er een tastbaar levensboek van maakt.",
        "content": """<p><strong>In het kort:</strong> je verhalen bij BewaardVoorJou.nl blijven altijd van jou. Je kunt je teksten, audio en video op elk moment exporteren, en er bijvoorbeeld een gedrukt levensboek van laten maken. Digitaal vastleggen en tastbaar bewaren gaan hier hand in hand.</p>

<p>In mijn dagelijkse werk bouw ik digitale systemen, en toch ben ik ervan overtuigd dat sommige dingen tastbaar moeten worden. Een levensverhaal is daar het mooiste voorbeeld van. Een bestand in de cloud raakt makkelijk vergeten; een boek op de schoot van een kleinkind niet. Daarom is <strong>eenvoudige export</strong> een van de zes vaste pijlers van het platform.</p>

<h2>Waarom je verhaal tastbaar maken loont</h2>
<p>Digitale herinneringen hebben grote voordelen: je kunt ze delen, doorzoeken en er de stem bij bewaren. Maar ze hebben ook een zwakte. Wat je niet kunt vasthouden, vergeet je sneller. Een tastbaar object werkt anders: het aanraken van een boek of een doos zorgt voor een directe, bijna lijfelijke verankering die een scherm nooit bereikt. Waar digitale bestanden in de cloud verdwijnen, blijft een boek op tafel liggen, zichtbaar, uitnodigend.</p>
<blockquote>
<p>De slimste aanpak combineert beide werelden: leg alles digitaal vast, en maak er op een mijlpaal iets tastbaars van.</p>
</blockquote>

<h2>Wat je precies kunt exporteren</h2>
<p>Alles wat je vastlegt, blijft van jou en kun je meenemen:</p>
<ul>
<li><strong>Je teksten</strong> — alle antwoorden en verhalen, netjes geordend per hoofdstuk.</li>
<li><strong>Je audio en video</strong> — de originele opnames, inclusief je stem en beeld.</li>
<li><strong>Een gedrukt levensboek</strong> — een verzorgde, fysieke uitgave om te bewaren of cadeau te geven.</li>
</ul>
<p>Zo houd je altijd zelf de sleutel tot je eigen verhaal, ongeacht wat er in de toekomst met welk platform gebeurt.</p>

<h2>Digitaal vastleggen, tastbaar vieren</h2>
<p>De mooiste momenten ontstaan als het digitale verhaal een tastbare vorm krijgt. Een gedrukt levensboek bij een tachtigste verjaardag. Een export voor de kinderen bij een afscheid. Een boek dat generaties later nog op tafel ligt. Het digitale werk maakt dat mogelijk zonder dat iemand uren hoeft te knippen en plakken; het tastbare resultaat maakt dat het beklijft.</p>
<p>Wil je begrijpen waarom dat tastbare zo diep raakt? Dat lees je in <a href="/kennisbank/de-psychologie-van-bewaren-waarom-je-niets-wilt-weggooien">het artikel over de psychologie van bewaren</a>.</p>

<h2>Jouw verhaal, jouw eigendom</h2>
<p>Ik vind het belangrijk dat je nooit "vastzit" aan een dienst. Je kunt je gegevens altijd meenemen. Dat is geen bijzaak, maar een principe. Meer over hoe veilig alles ondertussen bewaard wordt, lees je in <a href="/kennisbank/waar-staan-mijn-herinneringen-nederlandse-servers-encryptie">het artikel over Nederlandse servers en encryptie</a>.</p>

<h2>Veelgestelde vragen</h2>
<h3>Kost exporteren extra?</h3>
<p>Je eigen teksten en opnames kun je meenemen. Een gedrukt levensboek is een fysiek product; de mogelijkheden daarvoor vind je bij de <a href="/pricing">pakketten</a>.</p>
<h3>In welk formaat krijg ik mijn verhaal?</h3>
<p>Je teksten in een leesbaar documentformaat, je opnames als losse audio- en videobestanden. Alles gewoon te openen op je eigen apparaat.</p>
<h3>Kan ik later nog aanvullen en opnieuw exporteren?</h3>
<p>Ja. Een levensverhaal is nooit echt af. Je kunt altijd aanvullen en op elk moment een nieuwe export of een nieuw boek maken.</p>
""" + CTA_DUAAL,
    },

    # =====================================================================
    # BLOG
    # =====================================================================

    # B1 — Afscheid van een collega (Peak-End, invalshoek C)
    {
        "title": "Het afscheid dat een collega nooit vergeet (en waarom een fruitmand faalt)",
        "slug": "het-afscheid-dat-een-collega-nooit-vergeet",
        "section": "blog",
        "header_type": "color",
        "header_color": "#E7EEF6",
        "header_text_color": "#1E3A5F",
        "published_at": "2025-12-16T09:00:00+00:00",
        "meta_title": "Het afscheidscadeau dat een collega nooit vergeet",
        "meta_description": "Een fruitmand na 42 jaar dienst? Waarom het einde van een loopbaan de hele herinnering bepaalt, en hoe je een afscheid maakt dat echt binnenkomt.",
        "keywords": "afscheidscadeau collega pensioen, afscheid werk betekenisvol, pensioen cadeau collega, offboarding, afscheid loopbaan",
        "tags": "afscheid, pensioen, werk, cadeau, betekenis",
        "excerpt": "Een havenmeester kreeg na 42 jaar een supermarkt-fruitmand. Zijn LinkedIn-post werd 45.000 keer bekeken. Waarom het einde alles bepaalt, en hoe je het anders doet.",
        "content": """<p><strong>In het kort:</strong> hoe je afscheid neemt van een collega bepaalt hoe hij zijn hele loopbaan onthoudt. Een goedkoop, onpersoonlijk gebaar kan decennia loyaliteit uitwissen; een betekenisvol afscheid maakt van een vertrekkende collega een ambassadeur voor het leven. Dit is waarom, en hoe je het beter aanpakt.</p>

<p>In mijn tijd in de welzijnssector heb ik veel afscheiden meegemaakt, en ik heb geleerd dat er weinig zo veel zegt over een organisatie als de manier waarop ze iemand laat gaan. Een warm afscheid kost aandacht, geen vermogen. En toch gaat het opvallend vaak mis.</p>

<h2>De havenmeester en de fruitmand</h2>
<p>Er is een verhaal dat is blijven hangen. Een havenmeester nam afscheid na 42 jaar trouwe dienst. Vanwege "operationele drukte" werd zijn afscheid 48 uur van tevoren geregeld. Hij kreeg een fruitmand uit de supermarkt, in een kille kantine. Gekwetst plaatste hij zijn ervaring op LinkedIn. Die post werd 45.000 keer bekeken, en twee topkandidaten trokken zich terug voor de functie van zijn opvolger.</p>
<p>Dat is de tastbare prijs van een zielloos afscheid. Niet alleen voor de vertrekkende collega, maar voor het beeld dat achterblijvers krijgen van hun eigen toekomst.</p>

<h2>Waarom het einde zwaarder weegt dan alle jaren ervoor</h2>
<p>De psycholoog Daniel Kahneman ontdekte dat we een ervaring niet onthouden als een gemiddelde, maar vooral via twee momenten: het hoogtepunt en het einde.</p>
<blockquote>
<p><strong>De Peak-End Rule</strong></p>
<p><code>Herinnering ≈ (piekmoment + eindmoment) ÷ 2</code></p>
<p>In gewone taal: het slot van een loopbaan bepaalt onevenredig sterk hoe iemand er zijn leven lang op terugkijkt. Een sterk, warm einde kan jaren van gedoe overschrijven. Een koud einde kan jaren van waardering wissen.</p>
</blockquote>
<p>Een fruitmand is dus niet zomaar een schrale attentie. Het is het laatste, en dus zwaarst wegende, hoofdstuk van iemands werkende leven.</p>

<h2>Wat wél werkt: het verhaal in plaats van het ding</h2>
<p>Onderzoek laat een scherp verschil zien. Bij een standaard, transactioneel afscheid voelt slechts een klein deel van de mensen zich echt gerespecteerd. Bij een persoonlijk, op herinnering gericht afscheid ligt dat vele malen hoger. Het verschil zit niet in de prijs, maar in de betekenis.</p>
<p>Een afscheid dat blijft hangen, verzamelt de verhalen: de anekdotes van collega's, de momenten die ertoe deden, de betekenis van iemands werk. Precies daarvoor heb ik BewaardVoorJou.nl gebouwd. De <strong>empathische AI-interviewer</strong> haalt die verhalen naar boven en de <strong>eenvoudige export</strong> maakt er iets tastbaars van, zonder dat een overwerkt secretariaat er twintig uur in hoeft te steken.</p>

<h2>Van vertrekkende collega naar ambassadeur</h2>
<p>Een goed afscheid is geen kostenpost, maar een investering. Wie warm vertrekt, blijft over je praten, stuurt talent jouw kant op en komt soms zelf terug. Het is de goedkoopste vorm van werving die er bestaat. Wil je meer weten over de psychologie van bewaren die hieronder ligt? Dat lees je in <a href="/kennisbank/de-psychologie-van-bewaren-waarom-je-niets-wilt-weggooien">dit kennisbankartikel</a>.</p>

<hr>
<h2>Twee manieren om vandaag te beginnen</h2>
<p><strong>Voor jou persoonlijk:</strong> wil je zelf een levensverhaal vastleggen, of dat van iemand die je dierbaar is? <a href="/register">Start gratis met vertellen</a>, geen creditcard nodig.</p>
<p><strong>Voor HR- en directieteams:</strong> wil je afscheid en offboarding omzetten van een risico naar een sterk punt van je werkgeversmerk? Ik help organisaties dat structureel op te zetten. Plan een strategische verkenning via <a href="https://www.weareimpact.nl" target="_blank" rel="noopener noreferrer">WeAreImpact.nl</a>.</p>
""",
    },

    # B2 — Eerste 1000 dagen (baby, invalshoek B)
    {
        "title": "De eerste duizend dagen: waarom je nú al herinneringen wilt vastleggen",
        "slug": "de-eerste-duizend-dagen-herinneringen-vastleggen",
        "section": "blog",
        "header_type": "color",
        "header_color": "#F3E8DE",
        "header_text_color": "#7B3F00",
        "published_at": "2026-02-19T09:00:00+00:00",
        "meta_title": "De eerste duizend dagen: herinneringen vastleggen",
        "meta_description": "De dagen duren lang, de jaren vliegen. Waarom de eerste duizend dagen van je kind vragen om vastleggen, en hoe je dat doet zonder je telefoon vol te zetten.",
        "keywords": "eerste 1000 dagen, baby herinneringen vastleggen, tropenjaren, herinneringen kind bewaren, ouderschap herinneringen",
        "tags": "baby, ouderschap, herinneringen, tropenjaren, tips",
        "excerpt": "De dagen duren lang, maar de jaren vliegen voorbij. Waarom juist de drukste periode van het ouderschap vraagt om bewust vastleggen, en hoe je dat rustig doet.",
        "content": """<p><strong>In het kort:</strong> in de eerste duizend dagen van een kind gebeurt er ontzettend veel, en verdwijnt er ook ontzettend veel. De dagen duren lang, maar de jaren vliegen. Bewust een paar herinneringen vastleggen kost weinig tijd en levert iets op wat je nooit terugkrijgt als je het laat lopen.</p>

<p>Toen mijn eigen vader zijn verhaal wilde vastleggen, zag ik hoe veel er al vervaagd was, gewoon omdat niemand het op het moment zelf had opgeschreven. Dat zette me aan het denken over het andere uiteinde van het leven: het prille begin, waarin alles nieuw is en juist daarom zo snel verdwijnt.</p>

<h2>De paradox van de tropenjaren</h2>
<p>Ouders van jonge kinderen kennen het gevoel: de dagen zijn eindeloos, de nachten kort, en toch is het volgende jaar ineens voorbij. Dat eerste woordje, die specifieke manier waarop je kind "nog een keer" zei, de knuffel waar het niet zonder kon: het lijkt onvergetelijk, tot het vervaagt.</p>
<p>We maken meer foto's dan ooit, en toch voelen veel ouders zich er niet dichterbij door. Een deel van de ouders ervaart juist overbelasting door de telefoon, en een verrassend groot deel voelt zich er zelfs door afgeleid van hun kind. Meer beeld is niet hetzelfde als meer herinnering.</p>

<h2>Waarom een foto niet genoeg is</h2>
<p>Een foto laat zien hoe je kind eruitzag. Een verhaal laat zien wie het was, en wie jij was als ouder in die periode. Het gaat niet om het perfecte plaatje, maar om de kleine dingen die nergens vanzelf worden opgeslagen:</p>
<ul>
<li>Het woord dat je kind verkeerd uitsprak, en dat jullie daarna expres zo bleven zeggen.</li>
<li>Wat je voelde tijdens die eerste nacht thuis.</li>
<li>De hoop die je had, de angst die er ook was.</li>
</ul>
<blockquote>
<p>Bewaren is geen passieve handeling, maar een manier om nu al betekenis te geven aan wat er gebeurt. Je legt niet alleen vast voor later; je staat er ook even bewust bij stil.</p>
</blockquote>

<h2>Vastleggen zonder er een project van te maken</h2>
<p>Je hebt geen uren en geen schrijftalent nodig. Met de <strong>multimodale invoer</strong> spreek je gewoon een herinnering in terwijl je kind slaapt, of vertel je iets recht in de camera. De app zet het om naar tekst en bewaart je stem erbij. Een minuut is genoeg. De <strong>empathische AI-interviewer</strong> stelt af en toe een vraag die je anders nooit had bedacht, zodat er meer boven komt dan alleen "het was druk maar mooi".</p>

<h2>Een cadeau aan je kind van later</h2>
<p>Ooit is dat kind volwassen, en wil het misschien weten hoe die eerste jaren echt waren. Niet de geregisseerde foto's, maar het echte verhaal, in jouw stem. Dat is een cadeau dat je alleen nú kunt maken. Waarom die tastbare herinnering later zo diep raakt, lees je in <a href="/kennisbank/de-psychologie-van-bewaren-waarom-je-niets-wilt-weggooien">dit artikel over de psychologie van bewaren</a>.</p>

<hr>
<h2>Twee manieren om vandaag te beginnen</h2>
<p><strong>Voor ouders:</strong> leg vanavond nog je eerste herinnering vast. <a href="/register">Start gratis</a>, geen creditcard nodig, één minuut is genoeg.</p>
<p><strong>Voor organisaties in zorg of welzijn</strong> die met jonge gezinnen werken: ik denk graag mee over hoe je verhalen vastleggen inzet als betekenisvolle activiteit. Plan een verkenning via <a href="https://www.weareimpact.nl" target="_blank" rel="noopener noreferrer">WeAreImpact.nl</a>.</p>
""",
    },

    # B3 — 60 jaar cadeau (mijlpaal, invalshoek C)
    {
        "title": "60 jaar en alles al gehad? Geef iets wat wél binnenkomt",
        "slug": "60-jaar-cadeau-geef-iets-wat-wel-binnenkomt",
        "section": "blog",
        "header_type": "color",
        "header_color": "#EDE3D4",
        "header_text_color": "#5C3D2E",
        "published_at": "2026-03-24T09:00:00+00:00",
        "meta_title": "Cadeau voor 60 jaar: geef iets wat wél binnenkomt",
        "meta_description": "Wat geef je iemand van 60 die alles al heeft? Waarom een envelop met geld faalt en een levensverhaal juist raakt. Een cadeau-idee met betekenis.",
        "keywords": "cadeau 60 jaar, cadeau iemand die alles heeft, mijlpaal verjaardag cadeau, betekenisvol cadeau 60, cadeau 50 60 65 jaar",
        "tags": "cadeau, mijlpaal, verjaardag, 60 jaar, betekenis",
        "excerpt": "Wat geef je iemand die alles al heeft? Niet nog een ding. Waarom een gezamenlijke, anonieme envelop met geld tekortschiet, en wat wél raakt op een mijlpaal.",
        "content": """<p><strong>In het kort:</strong> voor iemand van 50, 60 of 65 die materieel niets tekortkomt, is het mooiste cadeau geen ding maar betekenis. Een gezamenlijk, persoonlijk eerbetoon raakt oneindig veel dieper dan een anonieme envelop met geld. Ik leg uit waarom, en hoe je het samen maakt.</p>

<p>In mijn tijd in de welzijnssector zag ik hoe mensen op latere leeftijd steeds minder waarde hechten aan spullen en steeds meer aan betekenis. "Ik heb alles al" is meestal geen grap, maar een eerlijke constatering. En juist dat maakt de cadeaukeuze lastig, tot je beseft dat het antwoord niet in een winkel ligt.</p>

<h2>Waarom de envelop met geld tekortschiet</h2>
<p>Bij een groepscadeau gebeurt er vaak iets vervelends: iedereen wacht op elkaar. Niemand voelt zich verantwoordelijk voor het persoonlijke deel, en voor je het weet wordt het een anonieme envelop met geld. Handig, maar vergeetbaar. Psychologen noemen dat mechanisme het omstander-effect: hoe meer mensen erbij betrokken zijn, hoe minder iemand het initiatief neemt.</p>
<blockquote>
<p>Een envelop zegt: we wisten het even niet. Een gezamenlijk verhaal zegt: jij hebt ertoe gedaan, en hier is het bewijs.</p>
</blockquote>

<h2>Wat een mijlpaal echt bijzonder maakt</h2>
<p>Zestig worden is een moment om terug te kijken op een rijk leven. Het mooiste cadeau sluit daarop aan: het viert wie iemand is en wat hij heeft betekend. Dat doe je niet met een ding, maar met verhalen, van iedereen die om die persoon geeft.</p>
<p>Stel je voor dat kinderen, kleinkinderen, vrienden en oud-collega's elk een herinnering bijdragen. Samen vormen die een portret dat niemand alleen had kunnen maken. Dat is een cadeau dat op de dag zelf tranen oproept, en er daarna nog jaren is.</p>

<h2>Zo maak je het samen, zonder gedoe</h2>
<p>Vroeger kostte zoiets iemand dagen knip- en plakwerk. Nu niet meer. Met BewaardVoorJou.nl nodig je iedereen uit om in zijn eigen tempo een herinnering bij te dragen, in tekst, audio of video, dankzij de <strong>multimodale invoer</strong>. De <strong>empathische AI-interviewer</strong> helpt mensen die niet weten wat ze moeten zeggen op gang, met een concrete vraag in plaats van een leeg vak. En met de <strong>eenvoudige export</strong> maak je er een gedrukt levensboek van om cadeau te geven.</p>

<h2>Voor 50, 60 én 65</h2>
<p>Of het nu gaat om een vijftigste verjaardag, een zestigste, of een pensioen rond je vijfenzestigste: het idee is hetzelfde. Vier de mens, niet de spullen. Waarom zo'n tastbaar eerbetoon neurologisch dieper raakt dan een felicitatie-appje, lees je in <a href="/kennisbank/de-psychologie-van-bewaren-waarom-je-niets-wilt-weggooien">dit artikel over de psychologie van bewaren</a>.</p>

<hr>
<h2>Twee manieren om vandaag te beginnen</h2>
<p><strong>Voor families en vrienden:</strong> begin nu met verzamelen, dan is het op tijd klaar. <a href="/register">Maak gratis een account aan</a> en nodig iedereen uit.</p>
<p><strong>Voor organisaties</strong> die afscheid of jubilea van medewerkers betekenisvol willen maken: ik denk graag mee. Plan een verkenning via <a href="https://www.weareimpact.nl" target="_blank" rel="noopener noreferrer">WeAreImpact.nl</a>.</p>
""",
    },

    # B4 — Tastbaar vs appje (haptiek, invalshoek A/C mix -> C)
    {
        "title": "Waarom een tastbaar verhaal dieper raakt dan duizend appjes",
        "slug": "waarom-een-tastbaar-verhaal-dieper-raakt-dan-appjes",
        "section": "blog",
        "header_type": "color",
        "header_color": "#EAE3D6",
        "header_text_color": "#5C3D2E",
        "published_at": "2026-04-27T09:00:00+00:00",
        "meta_title": "Waarom een tastbaar verhaal dieper raakt dan appjes",
        "meta_description": "Aanraken activeert het beloningssysteem in je brein. Waarom een tastbaar levensverhaal neurologisch dieper raakt dan een scherm vol berichten.",
        "keywords": "tastbaar versus digitaal, waarom aanraken belangrijk, haptiek herinneringen, tastzin brein, fysiek boek versus digitaal",
        "tags": "tastbaar, haptiek, wetenschap, herinneringen, digitaal",
        "excerpt": "Je vingertoppen nemen een enorm deel van je hersenschors in beslag. Waarom iets vasthouden je dieper raakt dan duizend berichten, en wat dat betekent voor herinneringen.",
        "content": """<p><strong>In het kort:</strong> aanraken is geen bijzaak van hoe we waarde ervaren, maar een hoofdrol. Iets tastbaars vasthouden activeert het beloningssysteem in je brein op een manier die een scherm niet bereikt. Daarom raakt een tastbaar levensverhaal dieper dan duizend appjes. Ik leg de wetenschap uit, in gewone taal.</p>

<p>Ik bouw voor mijn werk digitale systemen, en juist daarom fascineert het me waar digitaal tekortschiet. Want hoe handig een scherm ook is, er is iets wat het niet kan: je kunt het niet écht vasthouden. En dat blijkt meer uit te maken dan we denken.</p>

<h2>Je brein zit vol in je vingertoppen</h2>
<p>Onze huid bevat gevoelige receptoren die druk en textuur omzetten in emotie. Sommige detecteren fijne vormen, andere de structuur van hout of linnen. En hier wordt het bijzonder: je vingertoppen nemen een onevenredig groot deel van je hersenschors in beslag. Aanraken is voor je brein dus geen klein detail, maar groot nieuws.</p>
<blockquote>
<p>Het aanraken van een dierbaar voorwerp activeert direct het beloningssysteem in het brein. Het is een korte weg naar een gevoel van waarde die een scherm simpelweg niet kan nemen.</p>
</blockquote>

<h2>Waarom een appje vervliegt en een boek blijft</h2>
<p>Een felicitatie via de app is aardig, maar vluchtig. Je leest het, en het schuift weg onder het volgende bericht. Een tastbaar verhaal werkt anders. Je pakt het op, voelt het gewicht, slaat een bladzijde om. Dat kleine lichamelijke gebaar zorgt voor een verankering die berichten missen. Waar digitale bestanden verdwijnen in mappen die niemand opent, blijft een boek zichtbaar op tafel liggen.</p>
<p>Dat betekent niet dat digitaal waardeloos is, integendeel. Digitaal is de ideale manier om verhalen te verzamelen, te doorzoeken en er de stem bij te bewaren. Maar de diepste indruk ontstaat als dat digitale verhaal een tastbare vorm krijgt.</p>

<h2>Het beste van twee werelden</h2>
<p>Daarom heb ik BewaardVoorJou.nl zo ontworpen dat het digitale en het tastbare elkaar versterken. Je legt alles moeiteloos digitaal vast met de <strong>empathische AI-interviewer</strong>, en met de <strong>eenvoudige export</strong> maak je er een gedrukt levensboek van dat je kunt vasthouden en doorgeven. Zo vang je het verhaal digitaal, en laat je het tastbaar beklijven. Hoe dat exporteren precies werkt, lees je in <a href="/kennisbank/van-digitaal-verhaal-naar-tastbaar-levensboek-exporteren">dit kennisbankartikel</a>.</p>

<h2>Wat dit betekent voor jouw herinneringen</h2>
<p>Als je iemand echt wilt raken, geef dan iets wat hij kan vasthouden. Niet in plaats van het digitale, maar als kroon erop. Een verhaal dat je kunt aanraken, blijft, letterlijk en figuurlijk.</p>

<hr>
<h2>Twee manieren om vandaag te beginnen</h2>
<p><strong>Voor jou persoonlijk:</strong> leg een verhaal vast en maak er iets tastbaars van. <a href="/register">Start gratis met vertellen</a>, geen creditcard nodig.</p>
<p><strong>Voor organisaties</strong> die betekenisvolle, tastbare eerbetonen willen inzetten bij afscheid, jubilea of zorg: ik denk graag mee. Plan een verkenning via <a href="https://www.weareimpact.nl" target="_blank" rel="noopener noreferrer">WeAreImpact.nl</a>.</p>
""",
    },
]


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed wereldklasse-content voor BewaardVoorJou.nl")
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
