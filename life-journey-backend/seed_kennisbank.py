#!/usr/bin/env python3
"""
Seed script voor BewaardVoorJou.nl kennisbank.

Maakt 15 SEO-geoptimaliseerde kennisbank artikelen aan via de API.

Gebruik:
  python seed_kennisbank.py --email admin@example.com --password jouwwachtwoord
  python seed_kennisbank.py --email admin@example.com --password jouwwachtwoord --url https://api.bewaardvoorjou.nl/api/v1
"""

import argparse
import sys
import requests


def login(base_url: str, email: str, password: str) -> str:
    resp = requests.post(
        f"{base_url}/auth/login",
        data={"username": email, "password": password},
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

    print(f"  Aangemaakt en gepubliceerd: {article['title']}")


# ---------------------------------------------------------------------------
# Alle 15 kennisbank artikelen
# ---------------------------------------------------------------------------

ARTICLES = [

    # =========================================================================
    # CATEGORIE A: Beginnen met je levensverhaal
    # =========================================================================

    {
        "title": "Hoe begin ik met het vastleggen van mijn levensverhaal?",
        "slug": "hoe-begin-ik-met-het-vastleggen-van-mijn-levensverhaal",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#F5E6D3",
        "header_text_color": "#5C3D2E",
        "published_at": "2026-01-05T09:00:00+00:00",
        "meta_title": "Hoe begin ik met mijn levensverhaal? | BewaardVoorJou.nl",
        "meta_description": "Ontdek hoe je stap voor stap begint met het vastleggen van je levensverhaal. BewaardVoorJou.nl begeleidt je door 30 hoofdstukken met warmte en gemak.",
        "keywords": "levensverhaal schrijven, biografie beginnen, herinneringen vastleggen, levensverhaal ouderen, hoe schrijf je een biografie, levensverhaal beginnen",
        "tags": "beginnen, levensverhaal, biografie, tips, ouderen",
        "excerpt": "Het vastleggen van je levensverhaal begint niet met het schrijven van een heel boek, maar met het uitspreken van één enkele herinnering. BewaardVoorJou.nl begeleidt je stap voor stap door dertig hoofdstukken, zodat jouw unieke verhaal bewaard blijft voor de mensen die jou lief zijn.",
        "content": """<p><strong>In het kort:</strong> Het vastleggen van je levensverhaal begint niet met het schrijven van een heel boek, maar met het uitspreken van één enkele herinnering. Bij BewaardVoorJou.nl word je stap voor stap begeleid door dertig gestructureerde hoofdstukken, zodat jouw unieke verhaal bewaard blijft voor de mensen die jou het meest dierbaar zijn.</p>

<p>Misschien heb je het al vaker gedacht: "Ik moet mijn verhalen ergens bewaren voordat ik ze vergeet." Of misschien zei jouw vader of moeder het vroeger, en nu vraag je je af wat er allemaal verloren is gegaan. Die prikkel is goed. Die prikkel is precies juist.</p>

<p>Want levensverhalen zijn de mooiste erfenis die er bestaat. Geen geld, geen huis en geen sieraad kan ooit de warmte doorgeven van een verhaal in jouw eigen woorden. Toch is de drempel om te beginnen voor veel mensen enorm groot.</p>

<h2>Waarom jouw levensverhaal ertoe doet</h2>

<p>Bij WeAreImpact, waar wij digitale platforms bouwen die mensen met elkaar verbinden, is ons keer op keer gebleken dat de meest waardevolle kennis in organisaties niet in documenten staat, maar in de hoofden van mensen. Datzelfde geldt voor families.</p>

<p>Onderzoek van de Universiteit van Emory toont aan dat kinderen die de verhalen van hun ouders en grootouders kennen, weerbaarder zijn en een sterkere identiteit hebben. Ze weten waar ze vandaan komen. En dat geeft houvast, zeker in een wereld die zo snel verandert.</p>

<p>Bij Stichting de Baan, waar wij werken met mensen in een kwetsbare positie, zien wij dagelijks hoe het vertellen van je verhaal een therapeutisch effect heeft. Het ordent gedachten, geeft betekenis aan gebeurtenissen en versterkt het gevoel van eigenwaarde. Iemand die zijn verhaal vertelt, voelt zich gehoord.</p>

<p>BewaardVoorJou.nl ontstond vanuit die exacte behoefte. Het idee begon met een persoonlijke vraag: wat als mijn vader er niet meer is? Wat weet ik dan eigenlijk van zijn leven? Dat gevoel van urgentie is de drijvende kracht achter alles wat wij doen.</p>

<h2>De grootste drempel: waar begin je?</h2>

<p>De meest gehoorde reden waarom mensen nooit beginnen is niet luiheid of tijdgebrek. Het is de overweldiging van het idee zelf. "Mijn leven is zo groot. Waar begin ik?"</p>

<p>Het antwoord is eenvoudig: begin niet bij het begin. Begin bij een herinnering die vandaag spontaan bij je opkomt. Een geur uit de keuken van je grootmoeder. De fiets waarmee je naar school reed. De avond waarop je je partner voor het eerst ontmoette.</p>

<p>Dat ene moment is het startpunt. Alles wat daarna komt, volgt vanzelf.</p>

<p>Wij hebben dit patroon ontdekt bij het bouwen van BewaardVoorJou.nl en ook bij het werken met deelnemers bij Stichting de Baan. Mensen die beginnen met "de perfecte eerste herinnering" blokkeren. Mensen die beginnen met "de eerste herinnering die nu bij me opkomt" vertellen door.</p>

<h2>De kracht van structuur: dertig hoofdstukken</h2>

<p>BewaardVoorJou.nl begeleidt je door dertig zorgvuldig ontworpen hoofdstukken, verdeeld over vijf levensfasen. Deze structuur is niet willekeurig gekozen. Ze is gebaseerd op bewezen narratieve technieken en inzichten uit de levensverhaaltherapie.</p>

<p>De vijf fasen zijn:</p>

<ul>
<li><strong>Fase 1: Vroege jeugd (0 tot 12 jaar):</strong> Je eerste herinneringen, je thuis, je school en de mensen die je vroeg hebben gevormd.</li>
<li><strong>Fase 2: Jongvolwassenheid (12 tot 25 jaar):</strong> Wie word ik? Vriendschappen, eerste liefde, keuzes en dromen.</li>
<li><strong>Fase 3: Volwassenheid (25 tot 45 jaar):</strong> Werk, gezin, verantwoordelijkheid en de grote beslissingen van je leven.</li>
<li><strong>Fase 4: Rijpheid (45 tot 65 jaar):</strong> Oogsten wat je gezaaid hebt, loslaten wat voorbij is en herontdekken wie je bent.</li>
<li><strong>Fase 5: Wijsheid (65 jaar en ouder):</strong> Terugkijken, dankbaarheid en de levenslessen die je wilt doorgeven.</li>
</ul>

<p>Elk hoofdstuk heeft zijn eigen focus en eigen vragen. Je hoeft niet alles in één keer te doen. Je kiest zelf het tempo, de volgorde en de diepte.</p>

<h2>Welke methode past bij jou?</h2>

<p>Niet iedereen is een schrijver. Dat hoeft ook niet. Bij BewaardVoorJou.nl kies je helemaal zelf hoe je jouw herinneringen deelt:</p>

<ul>
<li><strong>Audio:</strong> Spreek je verhaal in en laat de app automatisch transcriberen. Je hebt alleen een telefoon of computer met een microfoon nodig.</li>
<li><strong>Video:</strong> Vertel je verhaal rechtstreeks in de camera. Zo bewaar je niet alleen de woorden, maar ook je gezicht, je stem en je expressie.</li>
<li><strong>Tekst:</strong> Typ je het liever zelf uit? Dat kan uiteraard ook. De AI interviewer stelt dan gerichte vragen om je op gang te helpen.</li>
</ul>

<p>Vanuit onze ervaring met DatingAssistent, waar wij mensen begeleiden bij het omzetten van gedachten naar woorden, weten wij dat mensen die mogen kiezen hoe ze communiceren veel opener zijn. Dezelfde vrijheid bieden wij bij BewaardVoorJou.nl.</p>

<h2>Hoe de AI interviewer jou begeleidt</h2>

<p>De AI interviewer van BewaardVoorJou.nl is geen koude vragenlijst. Het is een warme, geduldig luisterende gesprekspartner die reageert op wat jij vertelt. Als je iets interessants zegt, vraagt de interviewer door. Als je stilte nodig hebt, wacht de interviewer.</p>

<p>De vragen zijn zorgvuldig geformuleerd in gewone Nederlandse spreektaal, niet in formeel of technisch taalgebruik. Zo voelt het gesprek aan als een keukentafelgesprek, niet als een sollicitatiegesprek.</p>

<h2>Praktische tips voor vandaag</h2>

<p>Wil je vandaag beginnen? Hier zijn drie concrete stappen die elke nieuwe gebruiker helpen:</p>

<ul>
<li><strong>Kies één moment:</strong> Denk aan één herinnering die je nu bijstaat. Niet de belangrijkste, gewoon de eerste die opkomt.</li>
<li><strong>Zeg het hardop:</strong> Vertel die herinnering hardop aan jezelf, aan een huisdier of aan een plant. Het klinkt gek, maar het werkt. Zeggen is gemakkelijker dan schrijven.</li>
<li><strong>Open BewaardVoorJou.nl:</strong> Maak een gratis account aan en begin met het eerste hoofdstuk. Je hoeft niet te plannen. Je hoeft alleen maar te beginnen.</li>
</ul>

<p>Het allermooiste van een levensverhaal is niet de perfectie ervan. Het is de echtheid. Jouw stem, jouw woorden, jouw herinneringen. Die zijn onvervangbaar.</p>

<h2>Veelgestelde vragen</h2>

<h3>Moet ik mijn leven chronologisch vertellen?</h3>
<p>Nee, dat hoeft helemaal niet. Je kunt beginnen bij welk hoofdstuk dan ook. Veel mensen beginnen bij een periode die hen nu het meest bezighoudt en werken van daaruit verder. De structuur van dertig hoofdstukken is een hulpmiddel, geen verplichting.</p>

<h3>Hoe lang duurt het om mijn levensverhaal vast te leggen?</h3>
<p>Dat hangt volledig van jou af. Sommige mensen werken een uur per week en zijn na een paar maanden klaar. Anderen werken jaren aan hun verhaal en blijven aanvullen. Er is geen deadline en geen eindpunt dat je moet halen.</p>

<h3>Wat als ik een herinnering liever voor mezelf houd?</h3>
<p>Dat is volledig jouw keuze. Elk hoofdstuk en elk antwoord is standaard privé. Jij beslist zelf wat je deelt met familie, en wanneer. Je kunt ook bepaalde onderdelen voor altijd privé houden.</p>

<h3>Heb ik speciale apparatuur nodig?</h3>
<p>Nee. Een telefoon, tablet of computer met internetverbinding is alles wat je nodig hebt. De microfoon die al in jouw apparaat zit, is ruim voldoende voor opnames van hoge kwaliteit.</p>

<h3>Wat als ik ergens vastloopt?</h3>
<p>Dan helpt de AI interviewer je verder. Als een vraag te moeilijk is of te veel pijn doet, kun je die altijd overslaan en later terugkomen. Je kunt ook contact opnemen met ons support team via de chatfunctie in de app.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag nog helemaal gratis uit. Geen creditcard nodig en binnen één minuut start je al met je eerste herinnering.</p>

<p><a href="/registreren">Start nu gratis met vertellen</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "title": "De 30 hoofdstukken van je leven: wat kun je verwachten?",
        "slug": "de-30-hoofdstukken-van-je-leven-wat-kun-je-verwachten",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#E8D5C4",
        "header_text_color": "#5C3D2E",
        "published_at": "2026-01-19T09:00:00+00:00",
        "meta_title": "De 30 hoofdstukken van je levensverhaal | BewaardVoorJou.nl",
        "meta_description": "Ontdek hoe de 30 hoofdstukken van BewaardVoorJou.nl jouw levensverhaal structureren. Van vroege jeugd tot wijsheid, elk hoofdstuk heeft zijn eigen focus.",
        "keywords": "30 hoofdstukken levensverhaal, levensfasen biografie, structuur levensverhaal, levensverhaal onderwerpen, biografie schrijven structuur",
        "tags": "structuur, hoofdstukken, levensfasen, biografie, levensverhaal",
        "excerpt": "BewaardVoorJou.nl begeleidt je door dertig zorgvuldig ontworpen hoofdstukken, verdeeld over vijf levensfasen. Van je vroegste herinneringen tot de wijsheid die je wilt doorgeven.",
        "content": """<p><strong>In het kort:</strong> BewaardVoorJou.nl begeleidt je door dertig zorgvuldig ontworpen hoofdstukken, verdeeld over vijf levensfasen. Elk hoofdstuk heeft een eigen focus en eigen vragen, zodat geen enkel belangrijk moment van jouw leven onbesproken blijft. Je kiest zelf de volgorde en het tempo.</p>

<p>Een levensverhaal zonder structuur voelt al snel als een la vol losse foto's. Prachtig, maar chaotisch. De structuur van dertig hoofdstukken geeft jou een helder pad zonder jouw vrijheid in te perken. Denk aan een wandeling door je eigen leven, waarbij de kaart er altijd is maar je zelf bepaalt hoe je loopt.</p>

<h2>Waarom dertig hoofdstukken?</h2>

<p>Bij het ontwerpen van BewaardVoorJou.nl hebben wij bij WeAreImpact uitgebreid onderzoek gedaan naar levensverhaaltherapie, autobiografisch schrijven en narratieve geneeskunde. Wat bleek: verhalen die te breed zijn blokkeren mensen, verhalen die te smal zijn missen diepgang.</p>

<p>Dertig hoofdstukken bieden de juiste balans. Breed genoeg om een heel leven te omvatten, specifiek genoeg om elke sessie overzichtelijk en behapbaar te maken. Per hoofdstuk ben je gemiddeld dertig tot negentig minuten bezig, afhankelijk van hoe diep je in een onderwerp duikt.</p>

<h2>Fase 1: Vroege jeugd (0 tot 12 jaar)</h2>

<p>De eerste levensfase bevat de hoofdstukken over jouw vroegste herinneringen, jouw thuis, jouw familie en de mensen die jou als kind hebben gevormd. Vragen gaan over jouw geboorteplaats, jouw eerste dag op school, bijzondere tradities in het gezin en de verhalen die jij als kind hoorde.</p>

<p>Veel mensen zijn verrast hoe levendig de herinneringen worden als de juiste vragen worden gesteld. Een geur, een geluid of een oud liedje dat de AI interviewer noemt, kan plotseling een schat aan herinneringen openen die decennia verborgen waren.</p>

<h2>Fase 2: Jongvolwassenheid (12 tot 25 jaar)</h2>

<p>De tweede fase gaat over de jaren waarin je jezelf begon te ontdekken. Vriendschappen, eerste liefde, keuzes voor een opleiding of beroep, dromen en teleurstellingen. Dit zijn de jaren die mensen het meest vormen, en tegelijk de jaren waarover het minst gesproken wordt.</p>

<p>De vragen in deze fase zijn bewust open en uitnodigend. Er is geen oordeel. Geen antwoord is fout. Het gaat om jouw beleving, jouw waarheid.</p>

<h2>Fase 3: Volwassenheid (25 tot 45 jaar)</h2>

<p>De derde fase belicht de grote beslissingen: een partner kiezen, kinderen krijgen of juist niet, een carrière opbouwen, een huis kopen, verhuizen, rouwen. Dit zijn de jaren van verantwoordelijkheid en van keuzes met langetermijngevolgen.</p>

<p>Vanuit onze ervaring bij Stichting de Baan weten wij dat mensen in deze levensfase vaak worstelen met het gevoel dat ze "gewoon dingen deden die gedaan moesten worden". De vragen in deze fase helpen zichtbaar te maken hoe bijzonder en moedig die alledaagse keuzes eigenlijk waren.</p>

<h2>Fase 4: Rijpheid (45 tot 65 jaar)</h2>

<p>De vierde fase is de fase van oogsten en loslaten. Kinderen die het huis uitgaan, ouders die overlijden, een carrière die haar hoogtepunt bereikt of juist van richting verandert. Maar ook: de vrijheid die groeit, de rust die komt en de herbezinning op wat echt belangrijk is.</p>

<p>Veel gebruikers van BewaardVoorJou.nl geven aan dat juist deze fase hen het meest raakt. Het is de fase waarin je voor het eerst echt begint terug te kijken én vooruit te kijken tegelijk.</p>

<h2>Fase 5: Wijsheid (65 jaar en ouder)</h2>

<p>De vijfde en laatste fase is de fase van doorgeven. Wat heb je geleerd? Wat zou je anders doen? Welke waarden wil je meegeven aan je kinderen en kleinkinderen? Wat is de kern van jouw levensverhaal?</p>

<p>Dit zijn de hoofdstukken die na jouw leven het langst blijven leven. Ze vormen de erfenis die niet gekocht of verkocht kan worden.</p>

<h2>Hoe de hoofdstukken op elkaar aansluiten</h2>

<p>Een bijzonder kenmerk van BewaardVoorJou.nl is dat de AI interviewer verbanden legt tussen hoofdstukken. Als je in fase 2 vertelt over een droom die je had, kan de interviewer in fase 4 vragen of je die droom hebt kunnen waarmaken. Zo wordt jouw levensverhaal niet een verzameling losse fragmenten, maar een samenhangend geheel.</p>

<h2>Veelgestelde vragen</h2>

<h3>Moet ik alle dertig hoofdstukken afronden?</h3>
<p>Nee. Sommige mensen werken alle dertig hoofdstukken volledig af. Anderen focussen op de hoofdstukken die hen het meest aanspreken. Alles wat je invult is waardevol, ook als het maar één hoofdstuk is.</p>

<h3>Kan ik een hoofdstuk later aanvullen?</h3>
<p>Ja, altijd. Een hoofdstuk is nooit echt "klaar". Jij kunt op elk moment terugkeren om een herinnering toe te voegen, een antwoord te bewerken of een nieuwe gedachte op te schrijven.</p>

<h3>In welke volgorde werk ik de hoofdstukken af?</h3>
<p>In welke volgorde je maar wilt. De meeste mensen beginnen bij fase 1, maar anderen beginnen bij een periode die nu actueel is in hun leven. Er is geen goede of foute volgorde.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag nog helemaal gratis uit. Geen creditcard nodig en binnen één minuut start je al met je eerste herinnering.</p>

<p><a href="/registreren">Start nu gratis met vertellen</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "title": "Tips om herinneringen op te halen voor je biografie",
        "slug": "tips-om-herinneringen-op-te-halen-voor-je-biografie",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#EDE0D0",
        "header_text_color": "#5C3D2E",
        "published_at": "2026-02-02T09:00:00+00:00",
        "meta_title": "Tips om herinneringen op te halen voor je biografie | BewaardVoorJou.nl",
        "meta_description": "Lukt het niet om herinneringen boven te halen voor je levensverhaal? Deze bewezen tips helpen je om vergeten momenten weer tot leven te wekken.",
        "keywords": "herinneringen ophalen, biografie schrijven tips, geheugen activeren, herinneringen terughalen, autobiografie hulp, levensverhaal herinneringen",
        "tags": "herinneringen, tips, biografie, geheugen, levensverhaal",
        "excerpt": "Herinneringen ophalen voor je biografie lukt het beste met de juiste triggers. Van oude foto's tot bekende geuren en muziek: ontdek bewezen technieken om vergeten momenten weer tot leven te wekken.",
        "content": """<p><strong>In het kort:</strong> Herinneringen ophalen voor je levensverhaal lukt het beste met gerichte triggers zoals foto's, muziek, geuren en gesprekken met familieleden. De AI interviewer van BewaardVoorJou.nl stelt bovendien de juiste doorvraagvragen om herinneringen vanzelf naar boven te laten komen.</p>

<p>Je weet dat er zoveel te vertellen is. Maar op het moment dat je wilt beginnen, lijken de herinneringen te zijn weggevlucht. Je staart naar een leeg scherm en denkt: "Waaraan moet ik beginnen?" Dit is een van de meest voorkomende ervaringen bij mensen die hun levensverhaal willen vastleggen. En het is volkomen normaal.</p>

<p>Het geheugen werkt niet als een computer. Herinneringen worden niet opgeslagen in netjes gelabelde mappen die je kunt openen wanneer je wilt. Ze zijn verweven met zintuigen, emoties en associaties. De juiste trigger kan in één seconde tientallen jaren ophalen.</p>

<h2>Tip 1: Gebruik muziek als tijdmachine</h2>

<p>Muziek is verreweg de krachtigste geheugenactivator. Een liedje uit jouw tienerjaren kan in vijf seconden een complete wereld oproepen: de geur van de danszaal, het gezicht van een eerste liefde, de kleding die je droeg.</p>

<p>Maak een playlist van muziek uit de periode waarover je wilt vertellen. Luister ernaar voordat je begint met opnemen of schrijven. Laat de herinneringen vanzelf komen en start dan de opname.</p>

<p>Bij BewaardVoorJou.nl suggereert de AI interviewer soms bekende liedjes of artiesten uit een bepaald decennium als je aangeeft dat je vastloopt. Dit is een bewuste keuze in het ontwerp van de app, gebaseerd op inzichten uit de muziektherapie.</p>

<h2>Tip 2: Kijk door oude foto's en voorwerpen</h2>

<p>Oude foto albums, brieven, schoolrapporten, ansichtkaarten en vergeelde krantenknipsels zijn schatten voor het geheugen. Pak ze erbij voordat je begint. Spreek hardop wat je ziet. Stel jezelf vragen: wie is dit? Wanneer was dit? Hoe voelde ik me die dag?</p>

<p>Voorwerpen werken ook uitstekend. Een oud speelgoed, een kledingstuk, een sieraad of een gereedschapsstuk kan een lawine aan herinneringen losmaken. Houd zo'n voorwerp in je handen terwijl je praat of opneemt.</p>

<h2>Tip 3: Praat met familieleden</h2>

<p>Jouw broers, zussen, neven en nichten herinneren zich dingen die jij bent vergeten. En jij herinnert je dingen die zij zijn vergeten. Een gesprek van een halfuur met een familielid kan meer herinneringen activeren dan uren alleen nadenken.</p>

<p>Stel concrete vragen: "Weet jij nog die zomer dat we bij oma logeerden?" of "Hoe heette ook alweer die buurman bij wie we altijd appels gingen plukken?" Concrete vragen werken beter dan open vragen als "Wat weet jij nog van vroeger?"</p>

<p>Vanuit onze samenwerking met Stichting de Baan zien wij dat intergenerationele gesprekken niet alleen herinneringen activeren, maar ook de band tussen familieleden versterken. Het ophalen van herinneringen is zelf al een waardevol moment.</p>

<h2>Tip 4: Gebruik geuren bewust</h2>

<p>De reukzin is direct verbonden met het limbisch systeem, het emotionele geheugencentrum van de hersenen. Een vertrouwde geur kan een emotionele herinnering onmiddellijk activeren, zonder dat je er bewust voor hoeft te zoeken.</p>

<p>Denk aan geuren die passen bij de periode waarover je wilt vertellen: de geur van een bepaald parfum, gebakken aardappels, zeelucht, hooikoorts of motorolie. Sommige mensen zoeken bewust naar die geuren voordat ze beginnen met opnemen.</p>

<h2>Tip 5: Schrijf tien willekeurige woorden op</h2>

<p>Dit is een techniek die wij bij WeAreImpact gebruiken in creatieve sessies. Schrijf tien willekeurige woorden op die iets te maken hebben met de periode waarover je wilt vertellen. Woorden als: zomer, fiets, meester, appelboom, caravan, radio, voetbal, gordijnen, zeep, station.</p>

<p>Kijk dan naar die woorden. Eén van die woorden zal een herinnering activeren. Begin daar. Volg de herinnering waarheen die je leidt.</p>

<h2>Tip 6: Laat de AI interviewer het werk doen</h2>

<p>BewaardVoorJou.nl is speciaal ontworpen om herinneringen te activeren via gerichte vragen. De AI interviewer stelt nooit een te brede vraag. In plaats van "Vertel eens over je jeugd" vraagt de interviewer: "Welke geur herinner je je nog van de keuken van je moeder?" of "Hoe zag de straat eruit waarop je opgroeide?"</p>

<p>Die specificiteit is precies wat werkt. Concrete vragen roepen concrete herinneringen op. Brede vragen roepen vage indrukken op.</p>

<h2>Veelgestelde vragen</h2>

<h3>Wat als ik bepaalde periodes echt niet meer weet?</h3>
<p>Dat is heel gewoon, zeker voor vroege kindheitsjaren. Gebruik dan de herinneringen die je wél hebt als startpunt. Wat anderen jou over die periode hebben verteld, is ook een geldige bron voor je levensverhaal.</p>

<h3>Moet ik mijn herinneringen kunnen bewijzen?</h3>
<p>Absoluut niet. Een biografie is geen rechtbankdossier. Het gaat om jouw beleving, jouw perspectief en jouw waarheid. Als jij iets zo heeft beleefd, dan is dat de waardevolle informatie.</p>

<h3>Wat als ik herinneringen heb die pijnlijk zijn?</h3>
<p>Je hoeft niets te vertellen wat je niet wilt vertellen. Pijnlijke herinneringen kun je altijd overslaan of een hoofdstuk privé houden. Als je merkt dat een onderwerp veel emotie oproept, is het ook een optie om die emotie zelf te beschrijven zonder alle details in te gaan.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag nog helemaal gratis uit. Geen creditcard nodig en binnen één minuut start je al met je eerste herinnering.</p>

<p><a href="/registreren">Start nu gratis met vertellen</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "title": "Ik ben geen schrijver, kan ik BewaardVoorJou.nl toch gebruiken?",
        "slug": "ik-ben-geen-schrijver-kan-ik-bewaardvoorjou-toch-gebruiken",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#F0E4D5",
        "header_text_color": "#5C3D2E",
        "published_at": "2026-02-16T09:00:00+00:00",
        "meta_title": "Geen schrijver? Toch je levensverhaal vastleggen | BewaardVoorJou.nl",
        "meta_description": "Je hoeft geen schrijver te zijn om je levensverhaal vast te leggen. Spreek je verhaal in via audio of video, de rest doet BewaardVoorJou.nl voor jou.",
        "keywords": "geen schrijver levensverhaal, levensverhaal inspreken, audio biografie, video biografie, levensverhaal zonder schrijven, biografie ouderen gemakkelijk",
        "tags": "audio, video, geen schrijver, toegankelijk, levensverhaal",
        "excerpt": "Je hoeft helemaal geen schrijver te zijn om jouw levensverhaal vast te leggen. Bij BewaardVoorJou.nl kun je jouw herinneringen gewoon inspreken via audio of video. De app zet je woorden automatisch om naar tekst.",
        "content": """<p><strong>In het kort:</strong> Je hoeft helemaal geen schrijver te zijn om jouw levensverhaal vast te leggen. Bij BewaardVoorJou.nl kun je jouw herinneringen gewoon inspreken via audio of video. De app zet je woorden automatisch om naar tekst, en de AI interviewer helpt je om je gedachten te ordenen. Schrijven is optioneel, praten is genoeg.</p>

<p>"Ik ben geen schrijver." Het is een van de meest gehoorde uitspraken bij mensen die nadenken over het vastleggen van hun levensverhaal. En het is ook een van de grootste misverstanden over BewaardVoorJou.nl.</p>

<p>Want schrijven is slechts één van de drie manieren om jouw verhaal vast te leggen. En voor de meeste mensen is het niet eens de beste manier.</p>

<h2>Spreken is natuurlijker dan schrijven</h2>

<p>De mens communiceert al honderdduizenden jaren via gesproken taal. Schrijven is een relatief jonge vaardigheid, en één die niet iedereen even gemakkelijk afgaat. Maar praten? Dat kunnen we allemaal.</p>

<p>Vanuit onze ervaring met DatingAssistent, waar wij mensen helpen om hun gedachten en gevoelens onder woorden te brengen, weten wij dat mensen die mogen praten in plaats van schrijven veel opener zijn. Ze gebruiken rijkere taal, meer details en meer emotie. Gesproken verhalen hebben een warmte die getypte tekst zelden bereikt.</p>

<p>Bij BewaardVoorJou.nl heeft spreken dan ook altijd de voorkeur als mensen zelf geen voorkeur hebben. Het is gewoon de meest natuurlijke manier.</p>

<h2>Optie 1: Audio opname</h2>

<p>De audio optie is het meest laagdrempelig. Je drukt op de opnameknop, je praat, en de app luistert. De ingebouwde spraakherkenningstechnologie van BewaardVoorJou.nl, gebaseerd op Whisper, zet jouw woorden automatisch om naar tekst. Zo houd je altijd een geschreven versie van jouw verhaal.</p>

<p>Je kunt je audio opname pauzeren wanneer je wilt, verder praten als je klaar bent, en achteraf de tekst doorlezen en aanpassen waar nodig. De opname zelf wordt ook bewaard, zodat jouw stem voor altijd bewaard blijft naast de tekst.</p>

<h2>Optie 2: Video opname</h2>

<p>Met de video optie bewaar je niet alleen jouw woorden, maar ook jouw gezicht, jouw glimlach, jouw gebaren en jouw stem. Voor kinderen en kleinkinderen is een video van een geliefde familielid onbetaalbaar.</p>

<p>Video opnemen werkt via de camera van je telefoon, tablet of laptop. Je kijkt in de camera alsof je een vriend aankijkt en je vertelt. De AI interviewer stelt de vragen in beeld, zodat je altijd weet waarover je het wilt hebben. Na de opname transcribeert de app alles automatisch.</p>

<h2>Optie 3: Tekst typen</h2>

<p>Houd je toch liever van typen? Dan kan dat uiteraard ook. De AI interviewer stelt gerichte vragen en jij typt jouw antwoord. Voor mensen die graag de tijd nemen om hun woorden te kiezen, is dit soms de prettigste optie.</p>

<p>Sommige mensen kiezen ook voor een combinatie: zij typen de kerngedachten en vullen die aan met een audio opname voor de warmere, persoonlijkere details.</p>

<h2>De AI interviewer helpt je formuleren</h2>

<p>Zelfs als je besluit te typen, hoef je niet te zoeken naar de juiste woorden. De AI interviewer van BewaardVoorJou.nl stelt concrete, gerichte vragen die jou op gang helpen. "Wat was de eerste gedachte die je had toen je je partner voor het eerst ontmoette?" is een veel betere startvraag dan "Vertel eens over je liefdesgeschiedenis."</p>

<p>Concrete vragen roepen concrete antwoorden op. En concrete antwoorden zijn de mooiste verhalen.</p>

<h2>Ervaringen uit de praktijk</h2>

<p>Bij Stichting de Baan begeleiden wij mensen die om uiteenlopende redenen moeite hebben met schrijven: ouderen met artritis, mensen met dyslexie, mensen die weinig formeel onderwijs hebben genoten. Voor al deze groepen is de audio en video optie van BewaardVoorJou.nl een uitkomst. Zij vertellen verhalen die anders voor altijd verloren zouden zijn gegaan.</p>

<h2>Veelgestelde vragen</h2>

<h3>Hoe goed is de spraakherkenning?</h3>
<p>BewaardVoorJou.nl gebruikt Whisper, momenteel een van de beste spraakherkenningstechnologieën voor de Nederlandse taal. Het herkent regionale accenten, dialecten en zelfs zachte stemmen goed. De getranscribeerde tekst kun je altijd achteraf aanpassen waar nodig.</p>

<h3>Wat als ik een traag spreektempo heb of lange pauzes nodig heb?</h3>
<p>Geen enkel probleem. De opnamefunctie herkent pauzes als deel van het gesprek en stopt niet automatisch. Je mag zoveel tijd nemen als je nodig hebt.</p>

<h3>Kan ik een combinatie van methodes gebruiken?</h3>
<p>Ja, dat kan zelfs binnen één hoofdstuk. Je kunt een vraag schriftelijk beantwoorden en een volgende vraag inspreken. BewaardVoorJou.nl slaat alles netjes samen op in jouw verhaal.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag nog helemaal gratis uit. Geen creditcard nodig en binnen één minuut start je al met je eerste herinnering.</p>

<p><a href="/registreren">Start nu gratis met vertellen</a></p>""",
    },

    # =========================================================================
    # CATEGORIE B: Hoe werkt de AI interviewer?
    # =========================================================================

    {
        "title": "Praten in plaats van typen: hoe werkt de audio en video-ondersteuning?",
        "slug": "praten-in-plaats-van-typen-hoe-werkt-audio-en-video",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#DDE8F0",
        "header_text_color": "#1E3A5F",
        "published_at": "2026-03-02T09:00:00+00:00",
        "meta_title": "Audio en video opnames in je levensverhaal | BewaardVoorJou.nl",
        "meta_description": "Ontdek hoe je jouw levensverhaal inspreekt via audio of video bij BewaardVoorJou.nl. De app transcribeert automatisch en bewaart ook de originele opname.",
        "keywords": "audio biografie opnemen, video levensverhaal, herinneringen inspreken, spraakherkenning biografie, levensverhaal opnemen telefoon",
        "tags": "audio, video, opname, spraakherkenning, techniek",
        "excerpt": "Bij BewaardVoorJou.nl kun je jouw levensverhaal gewoon inspreken via audio of opnemen via video. De app transcribeert alles automatisch naar tekst en bewaart ook je originele opname voor de generaties na jou.",
        "content": """<p><strong>In het kort:</strong> Bij BewaardVoorJou.nl kun je jouw levensverhaal inspreken via audio of opnemen via video. De app transcribeert alles automatisch naar tekst met behulp van geavanceerde spraakherkenning. Jouw originele opname wordt ook bewaard, zodat toekomstige generaties niet alleen jouw woorden lezen, maar ook jouw stem horen.</p>

<p>Veel mensen denken dat een digitaal levensverhaal iets is wat je typt achter een computer. Maar bij BewaardVoorJou.nl is typen slechts één van de opties. Voor de meeste mensen is spreken veel natuurlijker, sneller en rijker in detail.</p>

<h2>Hoe werkt audio opnemen?</h2>

<p>Audio opnemen werkt via de microfoon van jouw apparaat. Dat kan een telefoon zijn, een tablet, een laptop of een computer met een ingebouwde of aangesloten microfoon. Je hebt geen speciale apparatuur nodig.</p>

<p>Zodra je een vraag van de AI interviewer ziet, druk je op de opnameknop. Je praat. De app luistert. Je kunt stoppen wanneer je wilt, even nadenken, en dan verdergaan. Na afloop zie je de getranscribeerde tekst en kunt die desgewenst aanpassen.</p>

<p>De opname zelf wordt ook bewaard naast de tekst. Zo bewaar je beide: de precieze woorden én de klank van jouw stem.</p>

<h2>Hoe werkt video opnemen?</h2>

<p>Video opnemen werkt via de camera van jouw apparaat. Op een telefoon of tablet gebruik je de frontcamera, zodat je recht in het oog van de kijker kijkt. Op een laptop gebruik je de ingebouwde webcam.</p>

<p>De AI interviewer stelt de vragen in beeld, zodat je altijd weet waarover je vertelt. Je kijkt in de camera en je vertelt. Na de opname verwerkt de app de video, transcribeert de gesproken tekst en slaat alles veilig op.</p>

<p>Een video opname bewaart meer dan woorden. Het bewaart jouw gezichtsuitdrukking, jouw glimlach, jouw handgebaar als je iets vertelt en de traan die misschien over jouw wang rolt bij een emotionele herinnering. Voor kleinkinderen die je misschien nooit hebben gekend, is dat onschatbaar.</p>

<h2>Welke technologie zit erachter?</h2>

<p>BewaardVoorJou.nl gebruikt voor spraakherkenning de technologie Whisper. Dit is momenteel een van de meest nauwkeurige spraakherkenningstechnologieën die beschikbaar zijn voor de Nederlandse taal, inclusief regionale dialecten en accenten.</p>

<p>Bij het bouwen van BewaardVoorJou.nl hebben wij bij WeAreImpact uitgebreid getest met verschillende spraakherkenningstechnologieën. Whisper bleek veruit het beste resultaat te geven voor het Nederlands, ook bij zachte stemmen, licht accent of minder duidelijke dictie.</p>

<h2>Wat zijn de technische vereisten?</h2>

<p>De technische vereisten zijn bewust laag gehouden, zodat ook mensen met oudere apparaten BewaardVoorJou.nl kunnen gebruiken:</p>

<ul>
<li>Een telefoon, tablet, laptop of computer met een microfoon en camera</li>
<li>Een internetverbinding (voor het uploaden van de opnames)</li>
<li>Een moderne webbrowser (zoals Chrome, Firefox, Safari of Edge)</li>
<li>Een gratis account op BewaardVoorJou.nl</li>
</ul>

<p>Je hoeft niets te installeren. BewaardVoorJou.nl werkt volledig via de webbrowser.</p>

<h2>Is mijn opname privé?</h2>

<p>Jouw opnames zijn strikt privé. Ze worden versleuteld opgeslagen op beveiligde Nederlandse servers en zijn alleen toegankelijk voor jou, tenzij jij expliciet besluit om ze te delen. Wij verwerken jouw opnames uitsluitend voor transcriptie en bewaring. Wij gebruiken ze nooit voor andere doeleinden.</p>

<h2>Veelgestelde vragen</h2>

<h3>Hoe lang mag een opname zijn?</h3>
<p>Er is geen tijdslimiet per opname. Je kunt zo lang praten als je wilt. Bij langere opnames raden wij aan om af en toe een korte pauze in te lassen, zodat de transcriptie nauwkeuriger is.</p>

<h3>Kan ik een opname verwijderen?</h3>
<p>Ja, altijd. Je kunt een opname op elk moment verwijderen vanuit jouw account. Verwijderde opnames worden ook van onze servers verwijderd.</p>

<h3>Wat als de transcriptie fouten bevat?</h3>
<p>De getranscribeerde tekst kun je altijd aanpassen. Klik op het tekstgedeelte dat je wilt wijzigen, maak de correctie en sla op. De originele audio of video opname blijft ongewijzigd.</p>

<h3>Kan ik een opname ook later terugluisteren?</h3>
<p>Ja. In jouw persoonlijk archief staan alle opnames terug te luisteren en te bekijken. Je kunt ze ook downloaden naar jouw eigen apparaat.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag nog helemaal gratis uit. Geen creditcard nodig en binnen één minuut start je al met je eerste herinnering.</p>

<p><a href="/registreren">Start nu gratis met vertellen</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "title": "Wat doet de AI interviewer precies?",
        "slug": "wat-doet-de-ai-interviewer-precies",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#D8E8F5",
        "header_text_color": "#1E3A5F",
        "published_at": "2026-03-16T09:00:00+00:00",
        "meta_title": "Wat doet de AI interviewer? | BewaardVoorJou.nl",
        "meta_description": "De AI interviewer van BewaardVoorJou.nl stelt warme, gerichte vragen om jouw levensverhaal boven te halen. Geen koude vragenlijst, maar een gesprek aan de keukentafel.",
        "keywords": "AI interviewer levensverhaal, kunstmatige intelligentie biografie, AI vragen stellen, digitale interviewer ouderen, AI levensverhaal schrijven",
        "tags": "AI interviewer, kunstmatige intelligentie, vragen stellen, technologie, levensverhaal",
        "excerpt": "De AI interviewer van BewaardVoorJou.nl is geen koude vragenlijst maar een warme, intelligente gesprekspartner. Hij stelt gerichte vragen, luistert naar jouw antwoorden en vraagt door op de momenten die ertoe doen.",
        "content": """<p><strong>In het kort:</strong> De AI interviewer van BewaardVoorJou.nl is een intelligente, warme gesprekspartner die jou door jouw levensverhaal begeleidt. Hij stelt gerichte vragen per hoofdstuk, past zijn vragen aan op wat jij vertelt en vraagt door op emotionele of interessante momenten. Jij vertelt, hij luistert en verdiept.</p>

<p>De naam "AI interviewer" klinkt misschien technisch en koud. De werkelijkheid is precies het tegenovergestelde. Bij BewaardVoorJou.nl hebben wij bewust gekozen voor de metafoor van een gesprek aan de keukentafel. Jij aan de ene kant, een warme, geduldige luisteraar aan de andere kant.</p>

<h2>Hoe de AI interviewer vragen stelt</h2>

<p>De AI interviewer werkt met een verfijnd systeem van gelaagde vragen. Elk hoofdstuk begint met een openingsvraag die ruimte geeft en uitnodigt. Vervolgens reageert de interviewer op wat jij vertelt met gerichte vervolgvragen.</p>

<p>Stel, je vertelt over jouw eerste schooldag. Je zegt: "Ik was heel erg zenuwachtig en mijn moeder had een brood meegenomen." De AI interviewer reageert dan niet met een volledig nieuwe vraag, maar met iets als: "Wat herinner je je nog van het brood dat je moeder had meegenomen?" Of: "Hoe zag de klas eruit op die eerste dag?"</p>

<p>Die specificiteit is de sleutel. Concrete vragen roepen concrete, rijke herinneringen op.</p>

<h2>Wat de AI interviewer niet doet</h2>

<p>Net zo belangrijk als wat de interviewer doet, is wat hij niet doet:</p>

<ul>
<li>Hij onderbreekt nooit midden in een zin</li>
<li>Hij stelt nooit twee vragen tegelijk</li>
<li>Hij oordeelt nooit over wat je vertelt</li>
<li>Hij dringt nooit aan als je ergens niet op in wilt gaan</li>
<li>Hij haast nooit, ook niet als je lang nadenkt</li>
</ul>

<p>Die principes zijn bewust ingebouwd. Vanuit onze ervaring met DatingAssistent weten wij dat mensen het meest opengaan als ze zich veilig voelen en niet gehaast. Een goede interviewer geeft ruimte. Onze AI doet hetzelfde.</p>

<h2>Hoe de AI aanpast aan jouw verhaal</h2>

<p>De AI interviewer leest en onthoudt alles wat je eerder hebt verteld. Als je in een vroeg hoofdstuk een bepaalde persoon noemt, kan de interviewer in een later hoofdstuk naar diezelfde persoon verwijzen. Als je vertelt dat je opgroeide in een kleine boerengemeenschap, past de interviewer zijn vragen daarvoor aan.</p>

<p>Dit contextbewustzijn is wat het verschil maakt tussen een generieke vragenlijst en een echt gepersonaliseerd gesprek. Jouw levensverhaal is uniek. De AI interviewer behandelt het ook zo.</p>

<h2>De technologie achter de interviewer</h2>

<p>De AI interviewer van BewaardVoorJou.nl is gebouwd op Claude, een van de meest geavanceerde taalmodellen die momenteel beschikbaar zijn. Claude is door Anthropic ontworpen met een sterke focus op veiligheid, eerlijkheid en empathie. Dit sluit perfect aan bij de waarden van BewaardVoorJou.nl.</p>

<p>Bij WeAreImpact hebben wij uitgebreid getest welk taalmodel het beste aansluit bij de warmte en geduldigheid die wij zoeken voor een levensverhaalplatform. Claude bleek het meest consistent in toon, het meest empathisch in doorvragen en het minst geneigd tot onnodige formaliteit.</p>

<h2>Is de AI interviewer echt privé?</h2>

<p>Absoluut. Jouw gesprekken met de AI interviewer zijn volledig privé. De conversaties worden alleen verwerkt om jou betere vervolgvragen te geven en worden nooit gebruikt voor het trainen van AI modellen, voor commerciële doeleinden of voor enige andere partij dan jijzelf. Alles voldoet aan de Europese AVG wetgeving.</p>

<h2>Veelgestelde vragen</h2>

<h3>Is de AI interviewer in het Nederlands?</h3>
<p>Ja, de AI interviewer spreekt en schrijft uitsluitend in het Nederlands, in gewone, begrijpelijke spreektaal. Geen formeel taalgebruik, geen moeilijke woorden.</p>

<h3>Kan ik de vragen van de AI ook overslaan?</h3>
<p>Ja, altijd. Elke vraag kun je overslaan door op "Volgende vraag" te klikken. Je hoeft nooit ergens op te antwoorden wat je niet wilt beantwoorden.</p>

<h3>Wat als ik het niet eens ben met de vraag?</h3>
<p>Dan kun je dat gewoon zeggen. De AI interviewer past zich aan. Je kunt ook een andere insteek kiezen of zelf een onderwerp aandragen dat je liever bespreekt.</p>

<h3>Wordt de AI interviewer beter naarmate ik meer vertel?</h3>
<p>Ja. Hoe meer jij vertelt, hoe beter de AI interviewer aansluit bij jouw specifieke levensverhaal. De eerste vragen zijn altijd wat algemener. Na een paar antwoorden worden de vragen steeds persoonlijker en diepgaander.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag nog helemaal gratis uit. Geen creditcard nodig en binnen één minuut start je al met je eerste herinnering.</p>

<p><a href="/registreren">Start nu gratis met vertellen</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "title": "Kan ik mijn antwoorden tussentijds aanpassen of pauzeren?",
        "slug": "kan-ik-mijn-antwoorden-tussentijds-aanpassen-of-pauzeren",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#D5E5F5",
        "header_text_color": "#1E3A5F",
        "published_at": "2026-03-30T09:00:00+00:00",
        "meta_title": "Antwoorden aanpassen en pauzeren | BewaardVoorJou.nl",
        "meta_description": "Ja, je kunt je antwoorden in BewaardVoorJou.nl altijd aanpassen, aanvullen of pauzeren. Er is geen tijdsdruk en je verhaal is nooit definitief af.",
        "keywords": "levensverhaal aanpassen, biografie bewerken, pauzeren levensverhaal, antwoorden wijzigen biografie, flexibel levensverhaal",
        "tags": "bewerken, pauzeren, flexibel, aanpassen, levensverhaal",
        "excerpt": "Ja, je kunt bij BewaardVoorJou.nl altijd pauzeren, terugkeren en aanpassen. Er is geen tijdsdruk, geen definitief antwoord en geen moment waarop je verhaal 'klaar' moet zijn. Jouw levensverhaal groeit met jou mee.",
        "content": """<p><strong>In het kort:</strong> Ja, bij BewaardVoorJou.nl kun je altijd pauzeren, terugkeren en aanpassen. Er is geen tijdsdruk. Je antwoorden zijn nooit definitief en je kunt op elk moment iets toevoegen, wijzigen of verwijderen. Jouw levensverhaal groeit en verandert met jou mee.</p>

<p>Een van de grootste zorgen die nieuwe gebruikers van BewaardVoorJou.nl hebben, is de vraag of ze "iets goed moeten doen". Of ze misschien iets zeggen wat ze later niet meer kunnen veranderen. Of ze gestraft worden als ze halverwege stoppen.</p>

<p>Het antwoord op al die zorgen is hetzelfde: nee. BewaardVoorJou.nl is gebouwd rond jouw vrijheid en jouw gemak. Er is altijd een weg terug.</p>

<h2>Altijd pauzeren, altijd verdergaan</h2>

<p>Jouw sessie wordt op elk moment automatisch opgeslagen. Als je halverwege een antwoord stopt, als je apparaat uitvalt of als je gewoon even genoeg hebt: jouw voortgang is veilig. De volgende keer dat je inlogt, ga je precies verder waar je was gebleven.</p>

<p>Er is ook geen sessietijd die afloopt. Je kunt tien minuten werken, dan een week niets doen en dan weer beginnen. BewaardVoorJou.nl wacht geduldig op je terug.</p>

<h2>Antwoorden aanpassen en aanvullen</h2>

<p>Elk antwoord dat je hebt gegeven, kun je op elk moment aanpassen. Open het betreffende hoofdstuk, klik op het antwoord dat je wilt wijzigen, maak de aanpassing en sla op. Zo eenvoudig is het.</p>

<p>Je kunt ook antwoorden aanvullen. Soms herinner je je een week later ineens een detail dat je was vergeten. Gewoon toevoegen. Soms zie je jaren later een oude foto die een herinnering wakker maakt. Gewoon openen en aanvullen.</p>

<p>Een levensverhaal is namelijk nooit echt af. Het groeit en verdiept naarmate je ouder wordt en meer terugblikt. BewaardVoorJou.nl is zo ontworpen dat jouw verhaal met jou kan meegroeien.</p>

<h2>Geen tijdsdruk, nooit</h2>

<p>Wij hebben bij het bouwen van BewaardVoorJou.nl bewust gekozen voor een ontwerp zonder tijdsdruk. Geen aftellende klokken, geen waarschuwingen dat je "bijna klaar moet zijn" en geen reminders die je opjagen.</p>

<p>Vanuit onze ervaring bij Stichting de Baan weten wij dat tijdsdruk bij ouderen en kwetsbare doelgroepen leidt tot stress, fouten en afhaken. Dat willen wij voorkomen. Jouw verhaal is het waard om er rustig de tijd voor te nemen.</p>

<h2>Privéantwoorden die je niet wilt delen</h2>

<p>Misschien vertel je iets wat je later toch liever privé houdt. Dat kan. Elk antwoord heeft een privéinstelling. Je kunt een antwoord op elk moment van "zichtbaar voor familie" naar "alleen voor mezelf" zetten, en andersom.</p>

<h2>Veelgestelde vragen</h2>

<h3>Wat gebeurt er als ik midden in een audio opname stop?</h3>
<p>De opname tot aan het moment dat je stopte, wordt automatisch opgeslagen. Je kunt die later terugluisteren, aanvullen of verwijderen.</p>

<h3>Kan ik een volledig hoofdstuk opnieuw beginnen?</h3>
<p>Ja. Je kunt de inhoud van een hoofdstuk wissen en opnieuw beginnen als je dat wilt. Wij raden aan om eerst de bestaande inhoud door te lezen voordat je wist, want soms zijn er waardevolle details die je onbewust al had vastgelegd.</p>

<h3>Wat als ik een antwoord heb gedeeld met familie en het daarna wil aanpassen?</h3>
<p>Je kunt een gedeeld antwoord altijd aanpassen. Familieleden die toegang hebben, zien dan de nieuwe versie. De oude versie is niet meer zichtbaar.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag nog helemaal gratis uit. Geen creditcard nodig en binnen één minuut start je al met je eerste herinnering.</p>

<p><a href="/registreren">Start nu gratis met vertellen</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "title": "Stapsgewijze handleiding: je eerste herinnering opnemen",
        "slug": "stapsgewijze-handleiding-je-eerste-herinnering-opnemen",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#E0EAF5",
        "header_text_color": "#1E3A5F",
        "published_at": "2026-04-06T09:00:00+00:00",
        "meta_title": "Je eerste herinnering opnemen: stap voor stap | BewaardVoorJou.nl",
        "meta_description": "Leer stap voor stap hoe je jouw eerste herinnering opneemt in BewaardVoorJou.nl. Van account aanmaken tot je eerste opname: eenvoudig en snel.",
        "keywords": "eerste herinnering opnemen, BewaardVoorJou handleiding, levensverhaal beginnen stap voor stap, biografie beginnen handleiding, levensverhaal app beginnen",
        "tags": "handleiding, beginnen, stap voor stap, opnemen, eerste keer",
        "excerpt": "Binnen vijf minuten heb je je eerste herinnering opgenomen in BewaardVoorJou.nl. Deze stap voor stap handleiding leidt je door het hele proces, van account aanmaken tot je eerste bewaarde herinnering.",
        "content": """<p><strong>In het kort:</strong> Binnen vijf minuten heb je je eerste herinnering vastgelegd in BewaardVoorJou.nl. Je maakt een gratis account aan, kiest een hoofdstuk, laat de AI interviewer je de eerste vraag stellen en begint te praten of te typen. Klaar.</p>

<p>Beginnen is het moeilijkste. Maar zodra je die eerste herinnering hebt vastgelegd, verandert er iets. Je denkt: "Dat was niet zo moeilijk." En dan wil je verder. Deze handleiding helpt je door die eerste vijf minuten heen.</p>

<h2>Stap 1: Maak een gratis account aan</h2>

<p>Ga naar BewaardVoorJou.nl en klik op "Gratis beginnen" of "Account aanmaken". Je hebt alleen een emailadres nodig. Je vult je naam in, je emailadres en je kiest een wachtwoord. Dat is alles.</p>

<p>Er is geen creditcard vereist voor de gratis versie. Je ontvangt een bevestigingsemail. Klik op de link in die email en je account is actief.</p>

<h2>Stap 2: Kies je eerste hoofdstuk</h2>

<p>Na het inloggen zie je het overzicht van de dertig hoofdstukken, verdeeld over vijf levensfasen. Je hoeft niet bij fase 1 te beginnen als dat niet voelt als het juiste startpunt. Kies het hoofdstuk dat je nu het meest aanspreekt.</p>

<p>Voor de meeste mensen is de vroege jeugd een goed startpunt: het is ver genoeg in het verleden om prettig over te vertellen, maar dichtbij genoeg om heldere herinneringen te hebben. Maar vertrouw je eigen gevoel.</p>

<h2>Stap 3: Start de AI interviewer</h2>

<p>Zodra je een hoofdstuk opent, stelt de AI interviewer je de eerste vraag. Neem een moment om de vraag te lezen of te beluisteren. Je hoeft niet meteen te antwoorden. Laat de vraag even bezinken.</p>

<p>Als de vraag je niet aanspreekt, klik je op "Andere vraag". De interviewer stelt dan een andere vraag over hetzelfde hoofdstuk. Je kunt dit zo vaak doen als je wilt totdat je een vraag vindt die je raakt.</p>

<h2>Stap 4: Kies je opnamemethode</h2>

<p>Je ziet drie knoppen: Audio, Video en Tekst. Kies de methode die het meest comfortabel voelt.</p>

<ul>
<li><strong>Audio:</strong> Klik op de microfoonknop. Wacht op het groene lichtje. Begin te praten. Klik op stop als je klaar bent.</li>
<li><strong>Video:</strong> Klik op de cameraknop. Zorg dat je goed verlicht bent en kijk in de camera. Klik op stop als je klaar bent.</li>
<li><strong>Tekst:</strong> Klik op het tekstveld en begin te typen. Er is geen minimum of maximum lengte.</li>
</ul>

<h2>Stap 5: Opslaan en doorgaan</h2>

<p>Na je antwoord klik je op "Opslaan". De app slaat je antwoord op en de AI interviewer stelt een vervolgvraag. Je kunt direct verder gaan, of je kunt stoppen en een andere keer verdergaan. Alles is opgeslagen.</p>

<p>Je eerste herinnering staat nu veilig bewaard. Gefeliciteerd.</p>

<h2>Tips voor een goede eerste opname</h2>

<ul>
<li>Kies een rustige omgeving zonder achtergrondgeluid voor audio en video opnames</li>
<li>Zorg voor goede verlichting als je video opneemt: zit met je gezicht naar het licht, niet ertegen</li>
<li>Begin met een herinnering die positief is: je eerste opname mag licht en prettig zijn</li>
<li>Spreek zoals je normaal praat: er is geen "goed" of "fout" in hoe je je verhaal vertelt</li>
</ul>

<h2>Veelgestelde vragen</h2>

<h3>Wat als ik mijn wachtwoord vergeet?</h3>
<p>Op de inlogpagina staat een link "Wachtwoord vergeten". Vul je emailadres in en je ontvangt een link om een nieuw wachtwoord te kiezen.</p>

<h3>Kan ik BewaardVoorJou.nl gebruiken op een telefoon?</h3>
<p>Ja, BewaardVoorJou.nl werkt op alle moderne telefoons via de webbrowser. Open de website in Safari op een iPhone of in Chrome op een Android telefoon en log in.</p>

<h3>Wat als ik iemand anders wil laten helpen bij het opnemen?</h3>
<p>Dat is helemaal prima. Veel mensen laten een kind of kleinkind helpen met de technische kant terwijl zij zelf vertellen. Je kunt ook iemand uitnodigen om samen een sessie te doen: één persoon stelt de vragen voor, de ander antwoordt.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag nog helemaal gratis uit. Geen creditcard nodig en binnen één minuut start je al met je eerste herinnering.</p>

<p><a href="/registreren">Start nu gratis met vertellen</a></p>""",
    },

    # =========================================================================
    # CATEGORIE C: Privacy, veiligheid en delen
    # =========================================================================

    {
        "title": "Waar worden mijn levensverhalen opgeslagen? Alles over onze Nederlandse servers",
        "slug": "waar-worden-mijn-levensverhalen-opgeslagen-nederlandse-servers",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#E8F0E0",
        "header_text_color": "#2A4A1A",
        "published_at": "2026-04-13T09:00:00+00:00",
        "meta_title": "Waar worden mijn levensverhalen opgeslagen? | BewaardVoorJou.nl",
        "meta_description": "Jouw levensverhalen worden opgeslagen op beveiligde Nederlandse servers, volledig conform de AVG. Geen Amerikaanse big tech, geen datadeling, geen risico.",
        "keywords": "levensverhaal opgeslagen waar, data privacy biografie, Nederlandse servers privacy, AVG biografie, veilige opslag levensverhaal, GDPR biografie",
        "tags": "privacy, veiligheid, servers, AVG, GDPR, opslag",
        "excerpt": "Jouw levensverhalen worden opgeslagen op streng beveiligde Nederlandse servers, volledig conform de AVG wetgeving. Geen Amerikaanse bedrijven, geen datadeling met derden, geen risico.",
        "content": """<p><strong>In het kort:</strong> Jouw levensverhalen, foto's, audio en video opnames worden opgeslagen op streng beveiligde servers binnen de Europese Unie, volledig conform de AVG wetgeving. Er worden geen gegevens gedeeld met Amerikaanse techbedrijven of andere derden. Alleen jij bepaalt wie er toegang heeft.</p>

<p>Als je jouw meest persoonlijke herinneringen toevertrouwt aan een digitaal platform, wil je weten dat ze veilig zijn. Niet veilig met een vage belofte, maar veilig met concrete garanties. In dit artikel leggen wij precies uit hoe BewaardVoorJou.nl jouw gegevens opslaat en beschermt.</p>

<h2>Nederlandse servers, geen uitzondering</h2>

<p>Jouw levensverhalen worden opgeslagen op servers die zich fysiek bevinden binnen de Europese Unie. BewaardVoorJou.nl werkt bewust niet met de grote Amerikaanse cloudproviders voor de opslag van persoonlijke verhalen. Dat is een principiële keuze, geen technische noodzaak.</p>

<p>De reden voor deze keuze is eenvoudig: Amerikaanse wetgeving, waaronder de Cloud Act, staat de Amerikaanse overheid in bepaalde omstandigheden toe om toegang te eisen tot gegevens die opgeslagen zijn bij Amerikaanse bedrijven, ook als die servers in Europa staan. Door te kiezen voor Europese servers en Europese providers, valt BewaardVoorJou.nl volledig buiten die jurisdictie.</p>

<p>Bij WeAreImpact, waar wij meerdere digitale platforms hebben gebouwd voor kwetsbare doelgroepen, is dit privacyprinciep altijd een van de eerste beslissingen in het ontwerp. Bij BewaardVoorJou.nl was dat niet anders.</p>

<h2>Encryptie van jouw gegevens</h2>

<p>Alle gegevens die jij opslaat op BewaardVoorJou.nl worden versleuteld. Dat geldt voor tekst, audio opnames, video opnames en foto's. Versleuteling betekent dat jouw gegevens onleesbaar zijn voor iedereen die niet de juiste sleutel heeft, ook voor onze eigen medewerkers in de normale gang van zaken.</p>

<p>De verbinding tussen jouw apparaat en onze servers is beveiligd met HTTPS, het standaard encryptieprotocol voor veilige verbindingen op het internet.</p>

<h2>AVG wetgeving: jouw rechten zijn geborgd</h2>

<p>BewaardVoorJou.nl voldoet volledig aan de Algemene Verordening Gegevensbescherming (AVG), de Europese privacywetgeving die ook bekend staat als GDPR. Dat betekent concreet:</p>

<ul>
<li>Je hebt altijd het recht om jouw gegevens in te zien</li>
<li>Je hebt het recht om jouw gegevens te laten corrigeren</li>
<li>Je hebt het recht om jouw gegevens te laten verwijderen</li>
<li>Je hebt het recht op overdraagbaarheid van jouw gegevens</li>
<li>Je hebt het recht om bezwaar te maken tegen verwerking</li>
</ul>

<p>Om een van deze rechten uit te oefenen, kun je contact opnemen via onze supportpagina. Wij reageren binnen de wettelijke termijn van dertig dagen, maar streven ernaar sneller te reageren.</p>

<h2>Backups en beschikbaarheid</h2>

<p>Jouw gegevens worden dagelijks geback-upt naar een secundaire, eveneens versleutelde opslaglocatie. Dit beschermt jouw verhalen tegen technische storingen, menselijke fouten en andere onverwachte gebeurtenissen.</p>

<p>BewaardVoorJou.nl streeft naar een beschikbaarheid van meer dan 99,5% per jaar. Geplande onderhoudswerkzaamheden vinden zoveel mogelijk buiten kantooruren plaats en worden vooraf aangekondigd via email.</p>

<h2>Wat er met jouw data gebeurt als je stopt</h2>

<p>Als je jouw account opzegt, blijven jouw gegevens nog dertig dagen beschikbaar zodat je ze eventueel kunt exporteren. Na dertig dagen worden ze definitief verwijderd van onze servers, inclusief alle backups. Je ontvangt een bevestiging van verwijdering per email.</p>

<h2>Veelgestelde vragen</h2>

<h3>Kunnen medewerkers van BewaardVoorJou.nl mijn verhalen lezen?</h3>
<p>Nee, niet in de normale gang van zaken. Jouw verhalen zijn versleuteld opgeslagen. Alleen bij een officieel verzoek van jou voor technische ondersteuning, en uitsluitend met jouw uitdrukkelijke toestemming, kan een technisch medewerker beperkte toegang krijgen tot specifieke technische gegevens.</p>

<h3>Wat als BewaardVoorJou.nl stopt met bestaan?</h3>
<p>In het geval dat BewaardVoorJou.nl zou ophouden te bestaan, ontvang je ruim van tevoren een bericht met instructies om jouw gegevens te exporteren. Jouw verhalen zijn altijd van jou en verlaten onze servers nooit zonder jouw toestemming.</p>

<h3>Worden mijn gegevens gebruikt voor AI training?</h3>
<p>Nee. Jouw verhalen, opnames en persoonlijke gegevens worden nooit gebruikt voor het trainen van AI modellen, voor onderzoek of voor enig ander doel dan het leveren van de dienst aan jou.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag nog helemaal gratis uit. Geen creditcard nodig en binnen één minuut start je al met je eerste herinnering.</p>

<p><a href="/registreren">Start nu gratis met vertellen</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "title": "Hoe werkt de tijdgestuurde vrijgave voor familie?",
        "slug": "hoe-werkt-de-tijdgestuurde-vrijgave-voor-familie",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#F0EAD5",
        "header_text_color": "#4A3A1A",
        "published_at": "2026-04-20T09:00:00+00:00",
        "meta_title": "Tijdgestuurde vrijgave voor familie | BewaardVoorJou.nl",
        "meta_description": "Bij BewaardVoorJou.nl kun je instellen dat jouw levensverhaal automatisch vrijgegeven wordt voor familie na een bepaalde datum. Bewaar je verhaal voor de toekomst.",
        "keywords": "tijdgestuurde vrijgave levensverhaal, erfenis digitaal bewaren, levensverhaal doorgeven na overlijden, digitale erfenis familie, levensverhaal toekomst",
        "tags": "tijdgestuurde vrijgave, erfenis, familie, toekomst, legacy",
        "excerpt": "De tijdgestuurde vrijgave van BewaardVoorJou.nl laat jou bepalen wanneer jouw familie toegang krijgt tot jouw levensverhaal. Op een verjaardag, bij een bijzondere gelegenheid of na jouw overlijden: jij stelt de datum in.",
        "content": """<p><strong>In het kort:</strong> Met de tijdgestuurde vrijgave van BewaardVoorJou.nl kun je instellen dat jouw levensverhaal automatisch vrijgegeven wordt voor specifieke familieleden op een door jou gekozen datum. Dat kan een verjaardag zijn, een jubileum of na jouw overlijden. Jij beslist, jij beheert.</p>

<p>Stel je voor: jouw kleinkind wordt achttien jaar. Op die ochtend ontvangt hij of zij een email met daarin een link naar het levensverhaal dat jij voor hem of haar hebt opgenomen. Jouw stem, jouw gezicht, jouw woorden. Een cadeau dat geen winkel kan geven.</p>

<p>Of stel je voor: na jouw overlijden vinden jouw kinderen in hun inbox een bericht met daarin jouw volledige levensverhaal. Alles wat je nooit hardop hebt gezegd, maar wel hebt opgenomen voor hen.</p>

<p>Dit is wat de tijdgestuurde vrijgave van BewaardVoorJou.nl mogelijk maakt.</p>

<h2>Hoe stel je de tijdgestuurde vrijgave in?</h2>

<p>In jouw accountinstellingen vind je de sectie "Nalatenschap en vrijgave". Hier kun je per familielid of per groep familieleden instellen op welke datum zij toegang krijgen tot welke delen van jouw verhaal.</p>

<p>Je kiest een datum of een gebeurtenis, de ontvanger of ontvangers en welke hoofdstukken of onderdelen worden vrijgegeven. Je kunt ook een persoonlijk bericht toevoegen dat samen met de toegangslink wordt verzonden.</p>

<h2>Vrijgave op een specifieke datum</h2>

<p>Kies een exacte datum en tijd. Op dat moment ontvangt de ontvanger automatisch een email met uitleg en een toegangslink. Dit is ideaal voor verjaardagen, jubilea, afstudeermomenten of andere bijzondere gelegenheden.</p>

<h2>Vrijgave na overlijden</h2>

<p>BewaardVoorJou.nl biedt ook de mogelijkheid van een inactiveringsbeheer. Dit werkt als volgt: je stelt in dat als je gedurende een bepaalde periode niet meer hebt ingelogd, vertrouwde contactpersonen een verificatieverzoek ontvangen. Als jij niet meer reageert op dat verzoek, wordt de vrijgave geactiveerd.</p>

<p>Dit mechanisme is zorgvuldig ontworpen om zowel onbedoelde vroege vrijgave als een te lange vertraging te voorkomen. Je kunt de inactiveringsperiode zelf instellen: van zes maanden tot twee jaar.</p>

<h2>Wie kan jij uitnodigen?</h2>

<p>Je kunt iedereen uitnodigen via emailadres. Dat kunnen zijn:</p>

<ul>
<li>Kinderen en kleinkinderen</li>
<li>Broers, zussen, neven en nichten</li>
<li>Vrienden of vertrouwde bekenden</li>
<li>Een notaris of andere rechtspersoon</li>
</ul>

<p>Per ontvanger kun je instellen welke delen van jouw verhaal zij mogen zien. Zo kun je sommige hoofdstukken voor iedereen vrijgeven en andere hoofdstukken alleen voor jouw directe kinderen.</p>

<h2>De gedachte achter de tijdgestuurde vrijgave</h2>

<p>Bij het ontwerpen van deze functie zijn wij bij WeAreImpact geïnspireerd door de traditie van nalatenschapsplanning en door gesprekken met gebruikers die aangaven: "Ik wil mijn verhaal bewaren voor mijn kleinkinderen, maar ik wil er zelf bij zijn als ze het lezen." De tijdgestuurde vrijgave geeft mensen de controle over het moment van doorgeven, ook als ze er niet meer bij zijn.</p>

<h2>Veelgestelde vragen</h2>

<h3>Kan ik de tijdgestuurde vrijgave annuleren?</h3>
<p>Ja, altijd. Zolang jij ingelogd bent en jouw account actief is, kun je een vrijgave op elk moment aanpassen of annuleren. Pas na jouw bevestiging wordt de vrijgave definitief.</p>

<h3>Wat zien familieleden precies?</h3>
<p>Dat bepaal jij volledig zelf. Je kiest per vrijgave welke hoofdstukken, antwoorden en opnames zichtbaar worden. Je kunt ook een volledig hoofdstuk zichtbaar maken maar bepaalde antwoorden daarbinnen privé houden.</p>

<h3>Wat als de ontvanger geen emailadres heeft?</h3>
<p>Dan kun je de toegangslink ook op een andere manier doorgeven, via een notaris, via een vertrouwde tussenpersoon of via een gedrukt document. Neem contact op met onze support voor hulp bij alternatieven.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag nog helemaal gratis uit. Geen creditcard nodig en binnen één minuut start je al met je eerste herinnering.</p>

<p><a href="/registreren">Start nu gratis met vertellen</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "title": "Wie heeft er toegang tot mijn verhalen?",
        "slug": "wie-heeft-er-toegang-tot-mijn-verhalen",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#EBF0E0",
        "header_text_color": "#2A4A1A",
        "published_at": "2026-04-27T09:00:00+00:00",
        "meta_title": "Wie heeft toegang tot mijn levensverhaal? | BewaardVoorJou.nl",
        "meta_description": "Standaard heeft alleen jijzelf toegang tot jouw levensverhaal bij BewaardVoorJou.nl. Jij bepaalt wie er toegang krijgt en wanneer. Volledige controle, altijd.",
        "keywords": "wie heeft toegang levensverhaal, privacy biografie, levensverhaal beveiligd, toegang beheren biografie, familie toegang levensverhaal",
        "tags": "toegang, privacy, beveiliging, familie, controle",
        "excerpt": "Standaard heeft alleen jijzelf toegang tot jouw levensverhaal bij BewaardVoorJou.nl. Jij bepaalt zelf wie je uitnodigt, welke delen zichtbaar zijn en wanneer. Er is geen automatische toegang voor familieleden of medewerkers.",
        "content": """<p><strong>In het kort:</strong> Standaard heeft alleen jijzelf toegang tot jouw levensverhaal bij BewaardVoorJou.nl. Jij bepaalt wie je uitnodigt, welke delen van jouw verhaal zichtbaar zijn en wanneer. Medewerkers van BewaardVoorJou.nl hebben in de normale gang van zaken geen toegang tot jouw verhalen.</p>

<p>Privacy is geen bijzaak bij BewaardVoorJou.nl. Het is de basis van alles wat wij doen. Jouw levensverhaal is het meest persoonlijke wat er bestaat. Het bevat herinneringen, gevoelens en gedachten die je misschien nooit hardop hebt uitgesproken. Dat verdient de hoogste bescherming die wij kunnen bieden.</p>

<h2>Standaard: alleen jijzelf</h2>

<p>Wanneer je een account aanmaakt bij BewaardVoorJou.nl, is alles wat je invult standaard strikt privé. Geen familielid, geen kennis en geen medewerker van BewaardVoorJou.nl kan jouw verhalen zien tenzij jij daar expliciet toestemming voor geeft.</p>

<p>Die toestemming geef jij altijd per onderdeel en per persoon. Er is geen "alles openbaar" knop en ook geen "alles voor familie" instelling die alles in één keer zichtbaar maakt. De controle blijft altijd bij jou.</p>

<h2>Gedeeld via uitnodiging</h2>

<p>Als jij wilt dat iemand jouw verhalen kan lezen of beluisteren, nodig je die persoon uit via emailadres. Je kiest welke hoofdstukken zichtbaar zijn voor die persoon. De genodigde ontvangt een email met een persoonlijke toegangslink en kan inloggen om de door jou geselecteerde onderdelen te bekijken.</p>

<p>Je kunt een uitnodiging op elk moment intrekken. De persoon verliest dan direct zijn of haar toegang.</p>

<h2>Tijdgestuurde vrijgave voor later</h2>

<p>Via de tijdgestuurde vrijgave kun je instellen dat bepaalde familieleden pas na een specifieke datum toegang krijgen. Zo kun je jouw verhaal al schrijven terwijl je nog leeft, maar de toegang bewaren voor een later moment. Meer informatie over de tijdgestuurde vrijgave vind je in ons aparte kennisbank artikel hierover.</p>

<h2>Medewerkers van BewaardVoorJou.nl</h2>

<p>Medewerkers van BewaardVoorJou.nl hebben in de normale gang van zaken geen toegang tot jouw persoonlijke verhalen. Jouw verhalen zijn versleuteld opgeslagen en alleen toegankelijk met jouw persoonlijke inloggegevens.</p>

<p>In uitzonderlijke gevallen, zoals bij een technische storing waarbij jij actief om hulp vraagt, kan een technisch medewerker met jouw uitdrukkelijke schriftelijke toestemming tijdelijke beperkte toegang krijgen tot specifieke technische gegevens. Dit wordt altijd gelogd en jij ontvangt een verslag van wat er is ingezien.</p>

<h2>Juridische verzoeken</h2>

<p>In het geval van een juridisch verzoek van een Nederlandse of Europese autoriteit zijn wij wettelijk verplicht om te beoordelen of wij hieraan moeten voldoen. Wij verstrekken nooit meer gegevens dan wettelijk vereist. Wij informeren jou altijd over een dergelijk verzoek, tenzij de wet ons dat verbiedt. Dit scenario is in de praktijk uiterst zeldzaam.</p>

<h2>Veelgestelde vragen</h2>

<h3>Kan ik zien wie er toegang heeft tot mijn verhalen?</h3>
<p>Ja. In jouw accountinstellingen vind je een overzicht van alle personen die jij hebt uitgenodigd en welke onderdelen zij kunnen zien. Je kunt dit overzicht op elk moment bekijken en aanpassen.</p>

<h3>Kan een familielid mijn verhaal zien zonder dat ik dat weet?</h3>
<p>Nee. Toegang is alleen mogelijk als jij die expliciet hebt verleend via een uitnodiging of een tijdgestuurde vrijgave. Er is geen manier voor familieleden om toegang te krijgen zonder jouw toestemming.</p>

<h3>Wat als ik een gedeelde versie wil terughalen?</h3>
<p>Je kunt een uitnodiging op elk moment intrekken. De persoon verliest direct zijn of haar toegang en kan de inhoud niet meer bekijken. Gedownloade kopieën die de persoon zelf heeft opgeslagen, vallen buiten onze controle.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag nog helemaal gratis uit. Geen creditcard nodig en binnen één minuut start je al met je eerste herinnering.</p>

<p><a href="/registreren">Start nu gratis met vertellen</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "title": "Hoe exporteer ik mijn eigen data en herinneringen?",
        "slug": "hoe-exporteer-ik-mijn-eigen-data-en-herinneringen",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#E5F0E8",
        "header_text_color": "#2A4A1A",
        "published_at": "2026-05-04T09:00:00+00:00",
        "meta_title": "Hoe exporteer ik mijn levensverhaal? | BewaardVoorJou.nl",
        "meta_description": "Exporteer jouw levensverhaal, audio en video opnames eenvoudig vanuit BewaardVoorJou.nl. Jouw data is altijd van jou en altijd beschikbaar voor download.",
        "keywords": "levensverhaal exporteren, biografie downloaden, data export biografie, levensverhaal opslaan op eigen apparaat, AVG data portabiliteit",
        "tags": "export, download, data portabiliteit, AVG, eigen data",
        "excerpt": "Bij BewaardVoorJou.nl kun je jouw volledige levensverhaal op elk moment exporteren: tekst, audio en video opnames. Jouw data is altijd van jou en nooit gevangen in ons platform.",
        "content": """<p><strong>In het kort:</strong> Bij BewaardVoorJou.nl kun je jouw volledige levensverhaal op elk moment exporteren. Je kunt tekst exporteren als PDF of Word document, audio opnames downloaden als MP3 bestanden en video opnames downloaden als MP4 bestanden. Jouw data is altijd van jou.</p>

<p>Eén van de principes waar wij bij BewaardVoorJou.nl het meest trots op zijn, is het principe van data portabiliteit. Jouw verhaal is van jou. Niet van ons. Dat betekent dat jij altijd het recht hebt om jouw gegevens mee te nemen, naar een andere dienst, naar een persoonlijk archief of naar een familielid toe.</p>

<h2>Wat kun je exporteren?</h2>

<p>BewaardVoorJou.nl biedt drie exportopties:</p>

<ul>
<li><strong>Tekst als PDF:</strong> Alle getranscribeerde en getypte antwoorden worden samengebundeld in een mooi opgemaakt PDF document, geordend per levensfase en hoofdstuk. Dit document kun je printen, opslaan of doorsturen.</li>
<li><strong>Tekst als Word document:</strong> Dezelfde inhoud als het PDF, maar in een bewerkbaar Word formaat. Zo kun je de inhoud verder bewerken, opnemen in een ander document of aanleveren aan een uitgever.</li>
<li><strong>Audio opnames als MP3:</strong> Alle audio opnames worden beschikbaar gesteld als afzonderlijke MP3 bestanden, geordend per hoofdstuk.</li>
<li><strong>Video opnames als MP4:</strong> Alle video opnames worden beschikbaar gesteld als afzonderlijke MP4 bestanden, geordend per hoofdstuk.</li>
<li><strong>Volledig archief als ZIP:</strong> Alles tegelijk: tekst, audio en video in één gecomprimeerd archief.</li>
</ul>

<h2>Hoe exporteer je stap voor stap?</h2>

<p>Ga naar jouw accountinstellingen en kies "Mijn data exporteren". Selecteer welke exportopties je wilt en klik op "Export starten". Voor kleinere exports is de download direct beschikbaar. Voor grotere exports, met veel audio en video, ontvang je een email zodra het archief klaar is om te downloaden.</p>

<h2>Jouw recht op data portabiliteit</h2>

<p>Het recht op data portabiliteit is vastgelegd in de Europese AVG wetgeving. Dit recht houdt in dat jij altijd jouw persoonlijke gegevens kunt opvragen en meenemen in een gangbaar, machineleesbaar formaat. BewaardVoorJou.nl respecteert en faciliteert dit recht volledig.</p>

<p>Bij WeAreImpact zien wij data portabiliteit niet alleen als een juridische verplichting, maar als een fundamenteel kenmerk van ethische digitale dienstverlening. Wij hebben dit recht bewust centraal gesteld in het ontwerp van BewaardVoorJou.nl.</p>

<h2>Wat kun je doen met jouw export?</h2>

<ul>
<li>Een persoonlijk archief aanleggen op een externe harde schijf of in een cloud opslag naar keuze</li>
<li>Het PDF document laten printen als fysiek levensboek</li>
<li>De audio en video opnames delen via een USB stick of door ze te uploaden naar een familieplatform</li>
<li>De tekst aanleveren aan een professionele ghostwriter of uitgever</li>
</ul>

<h2>Veelgestelde vragen</h2>

<h3>Kan ik ook een deel van mijn verhaal exporteren?</h3>
<p>Ja. Bij de exportopties kun je selecteren welke hoofdstukken je wilt opnemen in de export. Je hoeft niet alles in één keer te exporteren.</p>

<h3>Hoe groot is een volledige export?</h3>
<p>Dat hangt af van hoeveel audio en video je hebt opgenomen. Een tekstexport is altijd klein, een paar megabyte. Een volledig archief met meerdere uren audio en video kan meerdere gigabyte groot zijn.</p>

<h3>Worden mijn gegevens verwijderd na de export?</h3>
<p>Nee. Exporteren betekent kopiëren, niet verwijderen. Jouw gegevens blijven gewoon op BewaardVoorJou.nl staan totdat jij ze expliciet verwijdert of jouw account opzegt.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag nog helemaal gratis uit. Geen creditcard nodig en binnen één minuut start je al met je eerste herinnering.</p>

<p><a href="/registreren">Start nu gratis met vertellen</a></p>""",
    },

    # =========================================================================
    # CATEGORIE D: Account en abonnementen
    # =========================================================================

    {
        "title": "Hoe maak ik een gratis account aan bij BewaardVoorJou.nl?",
        "slug": "hoe-maak-ik-een-gratis-account-aan",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#F5F0E0",
        "header_text_color": "#4A3A0A",
        "published_at": "2026-05-11T09:00:00+00:00",
        "meta_title": "Gratis account aanmaken bij BewaardVoorJou.nl",
        "meta_description": "Een gratis account aanmaken bij BewaardVoorJou.nl is klaar in één minuut. Geen creditcard nodig, geen technische kennis vereist. Stap voor stap uitgelegd.",
        "keywords": "account aanmaken BewaardVoorJou, gratis registreren levensverhaal, BewaardVoorJou beginnen, levensverhaal app registratie, gratis biografie account",
        "tags": "account, registreren, gratis, beginnen, aanmelden",
        "excerpt": "Een gratis account aanmaken bij BewaardVoorJou.nl duurt minder dan één minuut. Je hebt alleen een emailadres nodig. Geen creditcard, geen technische kennis en geen verplichtingen.",
        "content": """<p><strong>In het kort:</strong> Een gratis account aanmaken bij BewaardVoorJou.nl duurt minder dan één minuut. Je hebt alleen een emailadres nodig. Er is geen creditcard vereist, geen verborgen kosten en geen verplichtingen. Na registratie kun je direct beginnen met jouw eerste herinnering.</p>

<p>Wij hebben het registratieproces bij BewaardVoorJou.nl bewust zo eenvoudig mogelijk gemaakt. Een nieuwe gebruiker moet zo min mogelijk hoeven invullen voordat hij of zij kan beginnen met het echte werk: het vastleggen van herinneringen.</p>

<h2>Wat je nodig hebt</h2>

<p>Voor het aanmaken van een gratis account heb je alleen het volgende nodig:</p>

<ul>
<li>Een emailadres</li>
<li>Een zelfgekozen wachtwoord</li>
<li>Jouw voornaam (zodat de AI interviewer je bij naam kan aanspreken)</li>
</ul>

<p>Meer is niet nodig. Geen telefoonnummer, geen adresgegevens en geen betaalinformatie.</p>

<h2>Stap voor stap account aanmaken</h2>

<p><strong>Stap 1:</strong> Ga naar BewaardVoorJou.nl en klik op de knop "Gratis beginnen" of "Account aanmaken". Die knop staat prominent op de homepage.</p>

<p><strong>Stap 2:</strong> Vul jouw voornaam, emailadres en een wachtwoord in. Jouw wachtwoord moet minimaal acht tekens bevatten. Kies iets dat je kunt onthouden maar dat anderen niet gemakkelijk kunnen raden.</p>

<p><strong>Stap 3:</strong> Klik op "Account aanmaken". Je ontvangt binnen een minuut een bevestigingsemail op het opgegeven emailadres.</p>

<p><strong>Stap 4:</strong> Open de bevestigingsemail en klik op de link "Bevestig mijn account". Je wordt automatisch doorgestuurd naar BewaardVoorJou.nl en bent direct ingelogd.</p>

<p><strong>Stap 5:</strong> Klaar. Je ziet nu het overzicht van de dertig hoofdstukken en kunt direct beginnen.</p>

<h2>Wat is er gratis beschikbaar?</h2>

<p>Met een gratis account kun je meerdere hoofdstukken starten, audio en video opnames maken en jouw verhaal bewaren. De gratis versie is ruim genoeg om een goed beeld te krijgen van de werking van het platform en om jouw eerste herinneringen vast te leggen.</p>

<h2>Hulp nodig bij registratie?</h2>

<p>Als je vastloopt bij het registreren, staan wij klaar via de supportchat op de website. Veel ouderen laten ook een kind of kleinkind helpen bij het aanmaken van het account, waarna ze daarna zelfstandig verder kunnen.</p>

<p>Vanuit Stichting de Baan weten wij dat de eerste technische stap voor veel oudere gebruikers de grootste drempel is. Zodra die stap gezet is, gaat de rest vanzelf. Aarzel dan ook niet om hulp te vragen voor dat eerste moment.</p>

<h2>Veelgestelde vragen</h2>

<h3>Ik heb de bevestigingsemail niet ontvangen. Wat nu?</h3>
<p>Controleer eerst jouw spam of ongewenste post map. Als de email daar ook niet staat, ga dan terug naar de registratiepagina en klik op "Email opnieuw versturen". Als het probleem aanhoudt, neem dan contact op via de supportchat.</p>

<h3>Kan ik ook inloggen met een Google of Facebook account?</h3>
<p>Op dit moment ondersteunt BewaardVoorJou.nl alleen inloggen met emailadres en wachtwoord. We werken aan de mogelijkheid om ook via andere methodes in te loggen.</p>

<h3>Is mijn emailadres veilig bij jullie?</h3>
<p>Ja. Jouw emailadres wordt uitsluitend gebruikt voor inloggen, bevestigingen en optionele notificaties. Wij verkopen of delen jouw emailadres nooit met derden en sturen je geen ongewenste reclame.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag nog helemaal gratis uit. Geen creditcard nodig en binnen één minuut start je al met je eerste herinnering.</p>

<p><a href="/registreren">Start nu gratis met vertellen</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "title": "Is BewaardVoorJou.nl echt gratis te proberen?",
        "slug": "is-bewaardvoorjou-echt-gratis-te-proberen",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#F8F0DA",
        "header_text_color": "#4A3A0A",
        "published_at": "2026-05-15T09:00:00+00:00",
        "meta_title": "Is BewaardVoorJou.nl gratis? | Alles over de gratis versie",
        "meta_description": "Ja, BewaardVoorJou.nl is echt gratis te proberen. Geen creditcard, geen verborgen kosten. Ontdek wat de gratis versie inhoudt en wanneer een betaald abonnement interessant is.",
        "keywords": "BewaardVoorJou gratis, levensverhaal app gratis, gratis biografie app, BewaardVoorJou kosten, levensverhaal gratis beginnen",
        "tags": "gratis, kosten, abonnement, proberen, prijzen",
        "excerpt": "Ja, BewaardVoorJou.nl is echt gratis te proberen. Geen creditcard nodig, geen proefperiode die automatisch overgaat in een betaald abonnement. De gratis versie is ruim genoeg om jouw eerste herinneringen vast te leggen.",
        "content": """<p><strong>In het kort:</strong> Ja, BewaardVoorJou.nl is echt gratis te proberen. Er is geen creditcard vereist, geen verborgen kosten en geen proefperiode die na dertig dagen automatisch overgaat in een betaald abonnement. De gratis versie biedt voldoende ruimte om jouw eerste herinneringen vast te leggen en de app goed te leren kennen.</p>

<p>Wij begrijpen de scepsis. Veel "gratis" apps blijken na een tijdje toch te vragen om een betaald abonnement, soms pas nadat je al urenlang werk hebt gestoken in het platform. BewaardVoorJou.nl werkt anders. Hier is precies wat de gratis versie inhoudt.</p>

<h2>Wat is gratis?</h2>

<p>Met een gratis account bij BewaardVoorJou.nl kun je:</p>

<ul>
<li>Jouw account aanmaken en jouw profiel instellen</li>
<li>Alle dertig hoofdstukken bekijken en starten</li>
<li>Meerdere audio en video opnames maken</li>
<li>Tekst invoeren in alle hoofdstukken</li>
<li>Jouw verhalen opslaan en terugkijken</li>
<li>Gebruik maken van de AI interviewer voor de startvragen</li>
</ul>

<p>Er is geen tijdslimiet op de gratis versie. Je kunt er maanden of jaren gebruik van maken zonder ooit te betalen.</p>

<h2>Wanneer is een betaald abonnement interessant?</h2>

<p>Een betaald abonnement voegt extra mogelijkheden toe voor mensen die meer uit BewaardVoorJou.nl willen halen:</p>

<ul>
<li>Onbeperkte opnameruimte voor audio en video</li>
<li>Geavanceerde AI doorvraagfuncties die dieper ingaan op jouw verhaal</li>
<li>De tijdgestuurde vrijgave voor familie</li>
<li>Export als mooi opgemaakt PDF levensboek</li>
<li>Prioriteitsondersteuning via telefoon</li>
</ul>

<p>De gratis versie is bewust genereus gehouden omdat wij geloven dat iedereen, ongeacht financiële situatie, het recht heeft om zijn of haar levensverhaal te bewaren. Vanuit die overtuiging zijn wij bij WeAreImpact ook aan BewaardVoorJou.nl begonnen.</p>

<h2>Geen verborgen kosten, nooit</h2>

<p>Bij BewaardVoorJou.nl zijn er geen verborgen kosten. Je betaalt nooit voor functies die niet expliciet worden vermeld als onderdeel van een betaald abonnement. De prijzen van de betaalde abonnementen staan duidelijk vermeld op de prijzenpagina.</p>

<h2>Geen automatische overstap naar betaald</h2>

<p>Wij sturen je geen creditcardformulier, geen proefperiode die automatisch wordt verlengd en geen misleidende aanbiedingen. Als jij besluit over te stappen naar een betaald abonnement, doe je dat actief en bewust. Nooit automatisch.</p>

<h2>Veelgestelde vragen</h2>

<h3>Blijft de gratis versie voor altijd beschikbaar?</h3>
<p>Ja, dat is onze intentie. Wij geloven dat de gratis basisversie een permanente pijler is van BewaardVoorJou.nl. Als daar ooit iets in zou veranderen, informeren wij gebruikers ruim van tevoren.</p>

<h3>Wat gebeurt er met mijn verhalen als ik overstap van gratis naar betaald?</h3>
<p>Niets verandert. Alles wat je in de gratis versie hebt opgeslagen, blijft volledig beschikbaar in de betaalde versie. Er is geen verlies van data bij een overstap.</p>

<h3>Kan ik ook overstappen van betaald terug naar gratis?</h3>
<p>Ja. Als je jouw betaald abonnement opzegt, val je terug op de gratis versie. Jouw verhalen blijven bewaard. Functies die exclusief zijn voor de betaalde versie, zoals de tijdgestuurde vrijgave, worden gedeactiveerd totdat je opnieuw een betaald abonnement afsluit.</p>

<hr>

<p><strong>Jouw levensverhaal verdient een veilige en mooie plek.</strong> Probeer BewaardVoorJou.nl vandaag nog helemaal gratis uit. Geen creditcard nodig en binnen één minuut start je al met je eerste herinnering.</p>

<p><a href="/registreren">Start nu gratis met vertellen</a></p>""",
    },

    # -------------------------------------------------------------------------

    {
        "title": "Hoe kan ik mijn abonnement opzeggen?",
        "slug": "hoe-kan-ik-mijn-abonnement-opzeggen",
        "section": "knowledge",
        "header_type": "color",
        "header_color": "#F5EDE0",
        "header_text_color": "#4A3A0A",
        "published_at": "2026-05-20T09:00:00+00:00",
        "meta_title": "Abonnement opzeggen bij BewaardVoorJou.nl | Stap voor stap",
        "meta_description": "Je kunt jouw abonnement bij BewaardVoorJou.nl op elk moment opzeggen. Stap voor stap uitgelegd. Jouw verhalen blijven altijd bewaard, ook na opzegging.",
        "keywords": "abonnement opzeggen BewaardVoorJou, BewaardVoorJou opzeggen, abonnement annuleren biografie app, opzeggen levensverhaal app, account verwijderen BewaardVoorJou",
        "tags": "opzeggen, abonnement, account, annuleren, klantenservice",
        "excerpt": "Je kunt jouw abonnement bij BewaardVoorJou.nl op elk moment opzeggen via jouw accountinstellingen. Je verhalen blijven altijd veilig bewaard en je valt automatisch terug op de gratis versie.",
        "content": """<p><strong>In het kort:</strong> Je kunt jouw betaald abonnement bij BewaardVoorJou.nl op elk moment opzeggen via jouw accountinstellingen, zonder bel verplichtingen of opzegtermijnen. Na opzegging behoud je toegang tot de betaalde functies tot het einde van jouw betaalde periode. Daarna val je automatisch terug op de gratis versie. Jouw verhalen blijven altijd bewaard.</p>

<p>Wij willen dat jij BewaardVoorJou.nl gebruikt omdat je er waarde in ziet, niet omdat opzeggen te ingewikkeld is. Daarom is het opzeggen van jouw abonnement bewust zo eenvoudig mogelijk gemaakt.</p>

<h2>Stap voor stap opzeggen</h2>

<p><strong>Stap 1:</strong> Log in op jouw account op BewaardVoorJou.nl.</p>

<p><strong>Stap 2:</strong> Klik op jouw naam of profielfoto rechts bovenin en kies "Accountinstellingen".</p>

<p><strong>Stap 3:</strong> Ga naar het tabblad "Abonnement".</p>

<p><strong>Stap 4:</strong> Klik op "Abonnement opzeggen". Je ziet een overzicht van wat er verandert na opzegging.</p>

<p><strong>Stap 5:</strong> Bevestig de opzegging. Je ontvangt een bevestigingsemail.</p>

<p>Dat is alles. Geen telefoontje nodig, geen wachttijden en geen ingewikkelde formulieren.</p>

<h2>Wat er verandert na opzegging</h2>

<p>Na opzegging behoud je alle betaalde functies tot het einde van jouw huidige abonnementsperiode. Als je op de vijftiende van de maand opzegt en jouw abonnement loopt tot de eenendertigste, kun je de betaalde functies nog gebruiken tot en met de eenendertigste.</p>

<p>Daarna val je automatisch terug op de gratis versie. Jouw verhalen, opnames en alle inhoud die je hebt opgeslagen, blijven volledig bewaard. Alleen functies die exclusief zijn voor de betaalde versie worden gedeactiveerd.</p>

<h2>Jouw verhalen blijven altijd van jou</h2>

<p>Het allerbelangrijkste om te weten: jouw levensverhaal verdwijnt niet als je jouw abonnement opzegt. Alles wat je hebt opgeslagen, blijft veilig bewaard in de gratis versie van jouw account. Je kunt het altijd terugzien, aanvullen en exporteren.</p>

<p>Dit principe, dat jouw data altijd van jou is, is een van de kernwaarden van BewaardVoorJou.nl. Bij WeAreImpact gebruiken wij de stelregel: een platform dat jouw data gijzelt zodra je wilt vertrekken, verdient je vertrouwen niet. Wij geven je altijd de vrijheid om te gaan.</p>

<h2>Volledig account verwijderen</h2>

<p>Wil je niet alleen jouw abonnement opzeggen maar ook jouw volledige account en alle gegevens verwijderen? Dat kan ook, via de knop "Account verwijderen" in jouw accountinstellingen. Let op: dit is definitief. Alle verhalen, opnames en gegevens worden onherroepelijk verwijderd. Exporteer jouw data eerst als je die wilt bewaren.</p>

<h2>Veelgestelde vragen</h2>

<h3>Krijg ik geld terug als ik halverwege een periode opzeg?</h3>
<p>Betaalde abonnementen worden niet gerestitueerd voor de resterende periode. Je behoudt wel toegang tot alle betaalde functies tot het einde van de betaalde periode.</p>

<h3>Kan ik opnieuw een abonnement afsluiten na opzegging?</h3>
<p>Ja, altijd. Je kunt op elk gewenst moment opnieuw een betaald abonnement afsluiten via jouw accountinstellingen. Alle inhoud die je eerder had opgeslagen, is er nog steeds.</p>

<h3>Wat als ik moeite heb met het opzeggen?</h3>
<p>Neem contact op met onze klantenservice via de supportchat op de website of via het contactformulier. Wij helpen je zo snel mogelijk verder. Wij sturen je geen teleurgesteld bericht en proberen je niet over te halen te blijven. Als je wilt opzeggen, helpen wij je daarmee.</p>

<h3>Wat als ik jouw service niet goed vond?</h3>
<p>Dan horen wij dat graag. Niet om je op gedachten te brengen, maar omdat eerlijke feedback ons helpt om beter te worden. Je kunt ons bereiken via het contactformulier of door te reageren op de bevestigingsemail van jouw opzegging.</p>

<hr>

<p><strong>Heb je toch vragen over jouw abonnement?</strong> Ons team staat voor je klaar via de supportchat op BewaardVoorJou.nl. Wij reageren doorgaans binnen één werkdag.</p>

<p><a href="/contact">Neem contact op met ons team</a></p>""",
    },

]


def main():
    parser = argparse.ArgumentParser(
        description="Seed kennisbank artikelen voor BewaardVoorJou.nl"
    )
    parser.add_argument("--email", required=True, help="Admin emailadres")
    parser.add_argument("--password", required=True, help="Admin wachtwoord")
    parser.add_argument(
        "--url",
        default="http://localhost:8000/api/v1",
        help="API basis-URL (standaard: http://localhost:8000/api/v1)",
    )
    args = parser.parse_args()

    print(f"Inloggen als {args.email}...")
    token = login(args.url, args.email, args.password)
    print("Inloggen gelukt.\n")

    print(f"Aanmaken van {len(ARTICLES)} kennisbank artikelen...\n")
    for article in ARTICLES:
        create_and_publish(args.url, token, article.copy())

    print(f"\nKlaar! {len(ARTICLES)} artikelen verwerkt.")
    print("Controleer de kennisbank via het admin dashboard.")


if __name__ == "__main__":
    main()
