"""
Herstelt de drie blogartikelen die hun content kwijtraakten en daardoor als
lege 200-pagina's in de sitemap stonden (op draft gezet op 1 augustus 2026).

De oorspronkelijke tekst uit `seed_blog_articles.py` was de korte startversie
van 250-341 woorden; de twee overlevende seed-artikelen waren inmiddels
doorgegroeid naar 774 en 921 woorden. Dit script zet er volwaardige versies
neer volgens redactiegids v2.0 (Vincent-stem, ik-vorm).

De artikelen blijven bewust op `draft` staan: publiceren is een redactionele
beslissing, niet die van een script.

Gebruik:
    venv\\Scripts\\python.exe scripts/herstel_drie_lege_blogartikelen.py --dry
    venv\\Scripts\\python.exe scripts/herstel_drie_lege_blogartikelen.py

De HTML gaat door dezelfde nh3-configuratie als de API-route, zodat wat er in
de database belandt identiek is aan wat een PATCH via /blog/{id} zou opleveren.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

import psycopg

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.api.v1.routes.blog import _sanitize_html  # noqa: E402


# ---------------------------------------------------------------------------
# Artikel 1 — invalshoek C (impact/zorg, ervaring Stichting de Baan)
# ---------------------------------------------------------------------------

VRAGEN_HTML = """
<p><strong>In het kort:</strong> de vragen die er het meest toe doen, stellen we bijna nooit. Niet uit desinteresse, maar omdat ze zwaar voelen &mdash; alsof je met het stellen ervan het einde ter sprake brengt. Dat hoeft niet zo te zijn. Hieronder staan vijf vragen die een gesprek openen in plaats van het te belasten, plus hoe je het antwoord bewaart zodat het niet verdwijnt zodra de koffie op is.</p>

<h2>Waarom we deze vragen blijven uitstellen</h2>

<p>Tot oktober 2025 was ik directeur van Stichting de Baan. In die jaren zag ik van dichtbij wat er gebeurt als niemand de vragen stelt. Niet uit onverschilligheid &mdash; integendeel. Families houden van elkaar en denken tegelijk dat er nog tijd is. Meestal is die er ook. Tot hij er ineens niet meer is.</p>

<p>Wat me het meest is bijgebleven, is dat mensen zelden de feiten missen. Ze weten wel waar hun vader werkte en in welk jaar hun moeder trouwde. Wat ze missen is de toon. Hoe hij vertelde. Waar zij om moest lachen. Het soort dingen dat niemand opschrijft omdat het vanzelfsprekend lijkt, precies zolang het er nog is.</p>

<p>De vijf vragen hieronder zijn geen checklist. Het zijn openingen. Je hoeft ze niet allemaal op één middag te stellen, en waarschijnlijk lukt dat ook niet.</p>

<h2>Vraag 1: waar was jij bang voor toen je zo oud was als ik nu?</h2>

<p>Dit is de beste startvraag die ik ken, omdat hij de rollen even omdraait. Je ouder is in dat antwoord geen ouder meer, maar iemand van jouw leeftijd die ook niet wist hoe het zou aflopen. Bijna iedereen die deze vraag krijgt, zwijgt eerst een paar seconden. Laat die stilte staan.</p>

<p>Wat er vaak op volgt: een baan die op de tocht stond, een verhuizing die verkeerd had kunnen uitpakken, twijfel over het ouderschap zelf. Dingen die jij nooit hebt gemerkt omdat ze goed zijn afgelopen.</p>

<h2>Vraag 2: welke keuze heeft je leven het meest veranderd?</h2>

<p>Let op het verschil met &quot;wat is je mooiste herinnering&quot;. Die vraag levert een ansichtkaart op. Deze levert een verhaal op, want elke keuze heeft een alternatief dat niet is doorgegaan.</p>

<p>Vraag door op dat alternatief. &quot;En als je het niet had gedaan?&quot; is vaak de vraag die het echte gesprek opent.</p>

<h2>Vraag 3: wie was er belangrijk voor je die ik nooit heb gekend?</h2>

<p>Iedereen heeft ze: de leraar, de buurvrouw, de collega die op het juiste moment iets zei. Mensen die niet op de foto's staan maar wel het verschil hebben gemaakt. Zodra je ouder er niet meer is, verdwijnen die namen definitief &mdash; er is niemand anders die ze kent.</p>

<h2>Vraag 4: waar heb je spijt van, en waarvan juist niet?</h2>

<p>De zwaarste van de vijf, en degene die je het beste kunt bewaren tot een gesprek al loopt. Stel hem niet koud. Maar stel hem wel, want dit is waar levenswijsheid zit die verder niemand je kan geven.</p>

<p>Het tweede deel is belangrijker dan het eerste. Waar iemand geen spijt van heeft, zegt meer over zijn waarden dan welk goed advies ook.</p>

<h2>Vraag 5: wat zou je willen dat ik over jou weet?</h2>

<p>Deze vraag geeft de regie terug. Je vraagt niet naar een gebeurtenis maar naar wat iemand zelf belangrijk vindt om door te geven. Vaak komt er iets uit dat je nooit had bedacht om te vragen.</p>

<p>Als je er maar één kunt stellen, stel dan deze.</p>

<h2>Het antwoord bewaren is het halve werk</h2>

<p>Hier gaat het meestal mis. Het gesprek is prachtig, iedereen is geraakt, en drie weken later weet je nog dat het over die buurvrouw ging maar niet meer hoe het verhaal precies liep.</p>

<p>Neem het daarom op. Niet met een notitieblok waar je ouder zenuwachtig van wordt, maar gewoon met je telefoon op tafel. Bij BewaardVoorJou werkt dat via een AI-interviewer die het gesprek begeleidt: hij stelt de vraag, luistert, en vraagt door op wat je ouder daadwerkelijk vertelt in plaats van een vaste lijst af te werken. Praten mag, typen mag ook &mdash; wie liever inspreekt, doet dat gewoon. Lees ook <a href="/kennisbank/hoe-werkt-praten-tegen-de-ai-interviewer">hoe praten tegen de AI-interviewer werkt</a> als je je daar iets bij wilt voorstellen.</p>

<p>Weet je niet waar je moet beginnen, dan helpt <a href="/kennisbank/hoe-begin-ik-met-het-vastleggen-van-mijn-levensverhaal">deze gids over de eerste stap</a>. Woont je ouder ver weg, dan kun je het gesprek ook <a href="/kennisbank/een-ouder-op-afstand-interviewen-levensverhaal-vastleggen">op afstand voeren</a>. En als er sprake is van dementie, lees dan eerst <a href="/kennisbank/levensverhaal-vastleggen-bij-dementie-gids-mantelzorgers">deze gids voor mantelzorgers</a> &mdash; daar gelden andere regels.</p>

<h2>Veelgestelde vragen</h2>

<h3>Wanneer is het te vroeg om deze vragen te stellen?</h3>
<p>Dat is het eigenlijk nooit. Het gevoel dat het te vroeg is, komt bijna altijd voort uit ongemak bij de vrager en niet bij degene die antwoordt. De meeste ouders vinden het fijn dat er eindelijk iemand vraagt.</p>

<h3>Mijn ouder is niet zo van het praten. Werkt dit dan wel?</h3>
<p>Vaak juist beter dan verwacht. Mensen die zeggen niets te vertellen te hebben, blijken dat wel te hebben zodra de vraag concreet genoeg is. Begin niet met &quot;vertel eens over je jeugd&quot;, maar met een specifiek moment.</p>

<h3>Moet ik het gesprek opnemen, of is opschrijven genoeg?</h3>
<p>Opschrijven bewaart de feiten, opnemen bewaart de stem. Juist die stem blijkt later het meest waardevol te zijn. Een opname kun je altijd nog uitwerken; andersom werkt niet.</p>

<h3>Wat als het gesprek emotioneel wordt?</h3>
<p>Dan gaat het goed. Stop niet meteen, maar dring ook niet aan. Een pauze en later verdergaan mag &mdash; je kunt <a href="/kennisbank/kan-ik-mijn-antwoorden-tussentijds-aanpassen-of-pauzeren">een verhaal altijd tussentijds pauzeren en aanvullen</a>.</p>

<h2>Begin vandaag, niet ooit</h2>

<p>Je hoeft geen interviewer te zijn en het hoeft niet perfect. Eén vraag, één keer, en het gesprek is begonnen.</p>

<p><a href="/register">Start gratis met het vastleggen van jullie verhaal</a> &mdash; je hebt geen betaalgegevens nodig om te beginnen. Werk je bij een zorgorganisatie, gemeente of werkgever en wil je dit voor een grotere groep inzetten? Neem dan contact op via <a href="https://www.weareimpact.nl" target="_blank" rel="noopener noreferrer">WeAreImpact</a>.</p>
"""

# ---------------------------------------------------------------------------
# Artikel 2 — invalshoek B (gebruiksgemak, de vader-casus)
# ---------------------------------------------------------------------------

INTERVIEW_HTML = """
<p><strong>In het kort:</strong> een goed interview met je ouder begint niet bij de juiste vragen, maar bij de juiste setting. In dit artikel lees je hoe je het eerste gesprek voorbereidt, hoe je de eerste tien minuten doorkomt, en hoe je doorvraagt zonder dat het een verhoor wordt. Reken op ongeveer een uur voor je eerste keer.</p>

<h2>Waarom het eerste gesprek zo ongemakkelijk voelt</h2>

<p>Mijn vader wilde zijn verhaal best vertellen. Het probleem was de computer. Hij ging zitten voor een leeg scherm, wist niet waar hij moest klikken, en na een kwartier was het enthousiasme weg. Niet omdat hij niets te vertellen had &mdash; hij had juist te veel te vertellen &mdash; maar omdat de drempel op de verkeerde plek lag.</p>

<p>Dat is me bijgebleven toen we BewaardVoorJou bouwden, en het geldt net zo goed voor een gesprek aan de keukentafel. De inhoud is zelden het probleem. De vorm wel.</p>

<h2>Stap 1: kies één onderwerp, niet een heel leven</h2>

<p>&quot;Vertel eens over vroeger&quot; is de vraag waar elk interview op stukloopt. Te groot, te vaag, en je ouder weet niet waar hij moet beginnen.</p>

<p>Kies in plaats daarvan één afgebakend onderwerp voor het hele gesprek. Het huis waar hij opgroeide. Zijn eerste baan. Hoe zij je moeder ontmoette. Eén onderwerp levert een uur gesprek op; tien onderwerpen leveren tien halve antwoorden op.</p>

<h2>Stap 2: kies het moment en de plek zorgvuldig</h2>

<p>Een paar dingen die in de praktijk verschil maken:</p>

<ul>
<li><strong>Overdag, niet 's avonds.</strong> Vermoeidheid maakt verhalen korter.</li>
<li><strong>Aan tafel, niet op de bank.</strong> Naast elkaar zitten praat makkelijker dan tegenover elkaar, maar aan tafel blijft de aandacht beter.</li>
<li><strong>Geen televisie aan.</strong> Klinkt vanzelfsprekend, gebeurt structureel toch.</li>
<li><strong>Zeg vooraf waar het over gaat.</strong> Verrassingsinterviews werken niet. Wie erover na heeft kunnen denken, vertelt meer.</li>
</ul>

<h2>Stap 3: de eerste tien minuten</h2>

<p>Begin nooit met de zwaarste vraag. Begin met iets feitelijks en concreets, waar je ouder zonder nadenken antwoord op kan geven: hoe zag de straat eruit, wie woonden er naast jullie, hoe rook het huis. Feiten zijn makkelijk. Ze brengen het geheugen op gang.</p>

<p>Pas als het gesprek loopt, verschuif je naar het gevoel. &quot;Was je daar gelukkig?&quot; werkt na tien minuten opwarmen wel, en aan het begin niet.</p>

<h2>Stap 4: doorvragen zonder te verhoren</h2>

<p>Het verschil tussen een interview en een verhoor zit in wat je doet na het antwoord. Vier dingen die werken:</p>

<ol>
<li><strong>Laat de stilte staan.</strong> De meeste mensen vullen een pauze van drie seconden vanzelf aan met het interessantste deel van hun verhaal. Wie meteen de volgende vraag stelt, mist dat.</li>
<li><strong>Vraag naar het beeld, niet naar de samenvatting.</strong> &quot;Hoe zag dat eruit?&quot; levert meer op dan &quot;en toen?&quot;</li>
<li><strong>Herhaal het laatste woord.</strong> Klinkt gek, werkt bijna altijd. &quot;Moeilijk?&quot; en je ouder legt het uit.</li>
<li><strong>Vraag niet door op alles.</strong> Merk je dat iemand ergens omheen praat, laat het dan. Het komt vaak later vanzelf terug.</li>
</ol>

<h2>Stap 5: leg het vast terwijl het gebeurt</h2>

<p>Meeschrijven werkt niet. Je bent aan het typen in plaats van aan het luisteren, en je ouder ziet je typen en gaat op je tempo praten.</p>

<p>Neem het gesprek dus op. Bij BewaardVoorJou kan dat met audio of video, en wordt de opname automatisch uitgewerkt tot tekst die je daarna nog kunt bijschaven. De AI-interviewer kan het gesprek ook zelf begeleiden: hij onthoudt namen en details die eerder zijn genoemd en vraagt daarop door, zodat je ouder ook zonder jou verder kan. Precies wat mijn vader nodig had &mdash; geen leeg scherm, maar een vraag.</p>

<p>Wil je eerst zien hoe zo'n eerste opname praktisch werkt, lees dan de <a href="/kennisbank/stapsgewijze-handleiding-je-eerste-herinnering-opnemen">stapsgewijze handleiding</a>. Bang dat je niet goed genoeg schrijft? Dat hoeft niet: <a href="/kennisbank/ik-ben-geen-schrijver-kan-ik-bewaardvoorjou-toch-gebruiken">schrijven is geen voorwaarde</a>. En zoek je meer vragen dan je in één gesprek kwijt kunt, dan staan er <a href="/kennisbank/interview-ouders-25-vragen">25 vragen klaar</a>.</p>

<h2>Veelgestelde vragen</h2>

<h3>Hoe lang moet een eerste interview duren?</h3>
<p>Drie kwartier tot een uur. Langer levert zelden betere verhalen op, en het maakt de drempel voor een tweede gesprek hoger.</p>

<h3>Wat als mijn ouder afdwaalt?</h3>
<p>Laat het gebeuren. Afdwalen is meestal het geheugen dat associeert, en daar komen de onverwachte verhalen uit. Stuur pas bij als je merkt dat het onderwerp echt weg is.</p>

<h3>Moet ik de vragen van tevoren doorgeven?</h3>
<p>Het onderwerp wel, de exacte vragen liever niet. Wie zich op een specifiek antwoord heeft voorbereid, vertelt een ingestudeerde versie in plaats van een herinnering.</p>

<h3>Kan ik dit ook doen als ik ver weg woon?</h3>
<p>Ja. Een videogesprek werkt verrassend goed, mits je dezelfde regels aanhoudt. Lees <a href="/kennisbank/een-ouder-op-afstand-interviewen-levensverhaal-vastleggen">hoe je een ouder op afstand interviewt</a>.</p>

<h3>Mijn ouder spreekt dialect. Is dat een probleem?</h3>
<p>Nee, en het is juist waardevol om te bewaren. Zie <a href="/kennisbank/levensverhaal-vastleggen-dialect-andere-taal">vastleggen in dialect of een andere taal</a>.</p>

<h2>Plan het eerste gesprek</h2>

<p>Niet ooit, maar deze maand. Eén onderwerp, drie kwartier, telefoon op tafel.</p>

<p><a href="/register">Maak gratis een account aan</a> en leg het eerste gesprek vast &mdash; er is geen betaalgegeven nodig om te starten. Wil je dit als organisatie aanbieden aan medewerkers of cli&euml;nten? Kijk dan op <a href="https://www.weareimpact.nl" target="_blank" rel="noopener noreferrer">WeAreImpact</a>.</p>
"""

# ---------------------------------------------------------------------------
# Artikel 3 — invalshoek A (privacy/veiligheid, tech-ondernemerschap)
# ---------------------------------------------------------------------------

DIGITAAL_HTML = """
<p><strong>In het kort:</strong> fysiek bewaren voelt veiliger dan het is, en digitaal bewaren is veiliger dan het voelt &mdash; maar alleen als je weet waar je spullen staan en wie erbij kan. In dit artikel zet ik beide naast elkaar, en leg ik uit waarom de belangrijkste vraag niet &quot;digitaal of fysiek&quot; is, maar &quot;van wie is het en wat gebeurt er als de aanbieder verdwijnt&quot;.</p>

<h2>Wat fysiek goed doet</h2>

<p>Een schoenendoos met foto's heeft eigenschappen die geen enkele app evenaart. Je kunt hem vastpakken. Je hebt geen wachtwoord nodig. Hij werkt over dertig jaar nog steeds, zonder dat iemand een bestandsformaat hoeft te ondersteunen. En als hij op zolder ligt, weet iedereen in het gezin waar dat is.</p>

<p>Er is ook een psychologische kant. Iets tastbaars nodigt uit tot samen kijken, en dat is precies waar herinneringen gedeeld worden. Zie ook <a href="/kennisbank/de-psychologie-van-bewaren-waarom-je-niets-wilt-weggooien">de psychologie van bewaren</a>.</p>

<h2>Waar fysiek misgaat</h2>

<p>Er is precies één exemplaar. Dat is het hele probleem. Brand, lekkage, een verhuizing, een goedbedoelde opruiming &mdash; en het is weg, zonder kopie.</p>

<p>Daar komt bij: papier vervaagt, foto's verkleuren, en videobanden en dia's zijn inmiddels lastiger af te spelen dan de meeste mensen denken. En het belangrijkste gaat sowieso verloren, want een foto bewaart het beeld maar niet het verhaal erachter. Wie erop staat, waarom die dag bijzonder was, wat er vlak daarna gebeurde: dat zit alleen in iemands hoofd.</p>

<h2>Wat digitaal goed doet</h2>

<p>Digitaal bewaren lost precies het kopie-probleem op. Een verhaal dat op meerdere plekken staat, gaat niet verloren bij één ongeluk. Je kunt het delen zonder het weg te geven. Je kunt zoeken. En je kunt meer bewaren dan beeld alleen: een stem, een gesprek, de manier waarop iemand vertelt.</p>

<h2>Waar digitaal misgaat</h2>

<p>Ook precies op één punt: je bent afhankelijk van een partij die je niet ziet. Een dienst die stopt, een account waarvan niemand het wachtwoord kent, servers in een land met andere regels, of voorwaarden waarin staat dat jouw materiaal gebruikt mag worden om modellen te trainen.</p>

<p>Dat is geen theoretisch risico. Ik bouw al jaren software en dit is het onderdeel waar ik zelf het kritischst op ben. Niet of iets in de cloud staat, maar in welke cloud, onder welk recht, en of je er zonder toestemming van de aanbieder weer uit komt.</p>

<h2>De vergelijking in het kort</h2>

<table>
<thead>
<tr><th>&nbsp;</th><th>Fysiek</th><th>Digitaal</th></tr>
</thead>
<tbody>
<tr><td>Bestand tegen ongelukken</td><td>Zwak &mdash; er is &eacute;&eacute;n exemplaar</td><td>Sterk, mits er kopie&euml;n zijn</td></tr>
<tr><td>Toegankelijk over 30 jaar</td><td>Sterk, mits het bewaard blijft</td><td>Hangt af van de aanbieder</td></tr>
<tr><td>Bewaart de stem</td><td>Nee</td><td>Ja</td></tr>
<tr><td>Deelbaar met familie</td><td>Alleen door af te staan</td><td>Ja, met behoud van origineel</td></tr>
<tr><td>Wie heeft toegang</td><td>Wie erbij kan</td><td>Hangt af van de instellingen</td></tr>
</tbody>
</table>

<h2>De vraag die er werkelijk toe doet</h2>

<p>Niet &quot;digitaal of fysiek&quot;, maar: waar staat het, wie kan erbij, en kom ik er weer uit?</p>

<p>Daarom hebben we bij BewaardVoorJou drie dingen als uitgangspunt genomen. Alles staat op Nederlandse servers, onder Nederlands en Europees recht. Alles is versleuteld op bankniveau en standaard priv&eacute; &mdash; niemand kijkt mee, ook wij niet. En je kunt je materiaal op elk moment exporteren, zodat je nooit vastzit aan ons. Wie precies wanneer iets mag zien, bepaal je zelf; dat kan ook pas jaren later ingaan.</p>

<p>Meer daarover lees je in <a href="/kennisbank/waar-worden-mijn-levensverhalen-opgeslagen-nederlandse-servers">waar je verhalen worden opgeslagen</a>, <a href="/kennisbank/wie-heeft-er-toegang-tot-mijn-verhalen">wie er toegang heeft</a> en <a href="/kennisbank/hoe-exporteer-ik-mijn-eigen-data-en-herinneringen">hoe je je eigen data exporteert</a>.</p>

<h2>Het hoeft geen keuze te zijn</h2>

<p>De beste opzet die ik ken, combineert allebei. Leg het verhaal digitaal vast, want daar bewaar je de stem en heb je kopie&euml;n. Maak er vervolgens iets tastbaars van, want dat is wat mensen samen openslaan.</p>

<p>Dat laatste is geen bijzaak. Een gedrukt levensboek op de eettafel wordt gelezen; een map in een account wordt vergeten. Lees <a href="/kennisbank/van-digitaal-verhaal-naar-tastbaar-levensboek-exporteren">hoe je van een digitaal verhaal een tastbaar levensboek maakt</a>.</p>

<h2>Veelgestelde vragen</h2>

<h3>Is digitaal bewaren veiliger dan fysiek?</h3>
<p>Tegen ongelukken wel, omdat er kopie&euml;n zijn. Tegen afhankelijkheid niet: bij fysiek bepaal jij alles, bij digitaal deel je die controle met een aanbieder. Kies daarom op basis van waar het staat en of je eruit kunt exporteren.</p>

<h3>Wat gebeurt er met mijn verhalen als de dienst stopt?</h3>
<p>Dat is de vraag die je aan elke aanbieder zou moeten stellen, voordat je begint. Kun je alles in &eacute;&eacute;n handeling downloaden in een gangbaar formaat? Zo niet, dan bewaar je niet, dan huur je.</p>

<h3>Moet ik oude foto's en video's dan gaan digitaliseren?</h3>
<p>Doe dat gericht in plaats van compleet. Begin bij het materiaal waarvan niemand anders een kopie heeft, en bij dragers die je nu al nauwelijks meer kunt afspelen.</p>

<h3>Kan ik bepalen dat mijn kinderen iets pas later te zien krijgen?</h3>
<p>Ja. Met tijdgestuurde vrijgave stel je in wie wat wanneer ziet &mdash; bijvoorbeeld pas bij een achttiende verjaardag. Zie <a href="/kennisbank/hoe-werkt-de-tijdgestuurde-vrijgave-voor-familie">hoe tijdgestuurde vrijgave werkt</a>.</p>

<h3>Blijft mijn materiaal van mij?</h3>
<p>Bij ons wel, en dat hoort de standaard te zijn. Controleer bij elke dienst of in de voorwaarden staat dat jij eigenaar blijft en dat je materiaal niet gebruikt wordt om modellen te trainen.</p>

<h2>Begin bij het verhaal, niet bij de doos</h2>

<p>Foto's heb je waarschijnlijk genoeg. Wat ontbreekt is de uitleg erbij, en die kan maar door &eacute;&eacute;n iemand gegeven worden.</p>

<p><a href="/register">Begin gratis met vastleggen</a> &mdash; zonder betaalgegevens. Ben je een organisatie die dit voor een grotere groep wil inzetten? Neem dan contact op via <a href="https://www.weareimpact.nl" target="_blank" rel="noopener noreferrer">WeAreImpact</a>.</p>
"""


ARTIKELEN = [
    {
        "slug": "5-vragen-ouders-stellen-voordat-te-laat",
        "content": VRAGEN_HTML,
        "meta_description": (
            "Vijf vragen die het gesprek met je ouders openen in plaats van het te "
            "belasten — plus hoe je de antwoorden bewaart voordat ze verdwijnen."
        ),
        "excerpt": (
            "De vragen die er het meest toe doen, stellen we bijna nooit. Deze vijf "
            "openen het gesprek zonder het zwaar te maken."
        ),
        "tags": "ouders, vragen, levensverhaal, gesprek, herinneringen",
    },
    {
        "slug": "interview-ouder-starten-praktische-gids",
        "content": INTERVIEW_HTML,
        "meta_description": (
            "Zo begin je het eerste interview met je ouder: één onderwerp, de juiste "
            "setting, en doorvragen zonder dat het een verhoor wordt."
        ),
        "excerpt": (
            "Een goed interview begint niet bij de juiste vragen, maar bij de juiste "
            "setting. Een praktische gids voor het eerste gesprek."
        ),
        "tags": "interview, ouders, praktische gids, opnemen, levensverhaal",
    },
    {
        "slug": "digitaal-vs-fysiek-herinneringen-bewaren",
        "content": DIGITAAL_HTML,
        "meta_description": (
            "Digitaal of fysiek herinneringen bewaren? De echte vraag is waar het "
            "staat, wie erbij kan en of je er weer uit komt. Een eerlijke vergelijking."
        ),
        "excerpt": (
            "Fysiek bewaren voelt veiliger dan het is, digitaal is veiliger dan het "
            "voelt. Een eerlijke vergelijking van beide."
        ),
        "tags": "digitaal, fysiek, herinneringen bewaren, privacy, export",
    },
]


def woorden(html: str) -> int:
    return len(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).split())


def dsn_uit_env() -> str:
    env_pad = Path(__file__).resolve().parents[1] / ".env"
    env = dict(
        re.match(r"^([A-Z_]+)=(.*)$", regel.strip()).groups()  # type: ignore[union-attr]
        for regel in env_pad.read_text(encoding="utf-8").splitlines()
        if re.match(r"^[A-Z_]+=", regel.strip())
    )
    return env["DATABASE_URL"].replace("postgresql+psycopg://", "postgresql://")


def main() -> None:
    ap = argparse.ArgumentParser(description="Herstel de drie lege blogartikelen")
    ap.add_argument("--dry", action="store_true", help="alleen tonen, niets wegschrijven")
    args = ap.parse_args()

    with psycopg.connect(dsn_uit_env()) as conn, conn.cursor() as cur:
        for artikel in ARTIKELEN:
            slug = artikel["slug"]
            schoon = _sanitize_html(artikel["content"].strip())
            assert schoon is not None

            cur.execute(
                "select status, length(coalesce(content,'')) from blogpost where slug = %s",
                (slug,),
            )
            rij = cur.fetchone()
            if rij is None:
                print(f"[{slug}] NIET GEVONDEN — overgeslagen")
                continue

            status, huidige_lengte = rij
            verlies = woorden(artikel["content"]) - woorden(schoon)
            print(
                f"[{slug}] status={status} nu={huidige_lengte} tekens "
                f"-> {woorden(schoon)} woorden"
                + (f"  (sanitizer verwijderde {verlies} woorden)" if verlies else "")
                + ("  (DRY)" if args.dry else "")
            )

            if args.dry:
                continue

            # status blijft bewust ongemoeid: publiceren doet de redactie.
            cur.execute(
                """update blogpost
                      set content = %s,
                          meta_description = %s,
                          excerpt = %s,
                          tags = %s,
                          updated_at = now()
                    where slug = %s""",
                (
                    schoon,
                    artikel["meta_description"],
                    artikel["excerpt"],
                    artikel["tags"],
                    slug,
                ),
            )

        if not args.dry:
            conn.commit()
            print("\nWeggeschreven. De artikelen staan nog op draft — publiceer ze via de admin.")


if __name__ == "__main__":
    main()
