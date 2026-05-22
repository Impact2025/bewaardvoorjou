"""
Seed-script: voegt 5 startartikelen toe aan de blog.

Gebruik:
  python seed_blog_articles.py

Vereist:
  - DATABASE_URL in .env
  - Alembic migratie 20260522_add_blog_view_count al uitgevoerd
"""
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

# Voeg projectmap toe aan path
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
load_dotenv()

from app.db.session import SessionLocal
from app.models.blog_post import BlogPost


ARTICLES = [
    {
        "title": "Het meest betekenisvolle Vaderdag cadeau van 2026 (voor de vader die alles al heeft)",
        "slug": "vaderdag-cadeau-2026-voor-de-vader-die-alles-heeft",
        "excerpt": "Geen stropdas, geen gadget — dit cadeau geeft je kinderen iets wat ze voor altijd bij zich dragen: jouw verhaal.",
        "tags": "vaderdag,cadeau,herinneringen,familie,tips",
        "header_color": "#FFF3E0",
        "header_text_color": "#7B3F00",
        "section": "blog",
        "status": "published",
        "meta_title": "Vaderdag cadeau 2026 — het verhaal van je vader bewaren",
        "meta_description": "Geen gadget of stropdas — geef je vader het mooiste cadeau: zijn levensverhaal vastgelegd voor altijd. Tips + hoe te beginnen.",
        "keywords": "vaderdag cadeau 2026, cadeau voor vader, levensverhaal bewaren, herinneringen vastleggen, bijzonder cadeau papa",
        "content": """<h2>Waarom het moeilijkste cadeau ook het mooiste is</h2>
<p>Je kent het gevoel: Vaderdag nadert en je scrollt eindeloos door webshops op zoek naar iets <em>bijzonders</em>. Een gadget die hij al heeft. Een fles wijn die hij prima zelf kan kopen. Een grappige beker die over zes maanden achter in de kast staat.</p>
<p>Maar wat als het perfecte cadeau geen ding is?</p>
<p>Wat als het een gesprek is. Een verhaal. Een herinnering die je vastlegt voordat het te laat is.</p>

<h2>Het cadeau dat generaties meegaat</h2>
<p>Stel je voor: je kleinkinderen luisteren dertig jaar later naar de stem van hun opa. Ze horen hoe hij als kind de straat op ging zonder telefoon, hoe hij hun oma voor het eerst ontmoette, welke les het leven hem het meest heeft bijgebracht.</p>
<p>Dat is geen fantasie. Met <strong>BewaardVoorJou.nl</strong> kun je dit vandaag nog beginnen — als cadeau voor Vaderdag.</p>

<h2>Hoe het werkt: 3 stappen</h2>
<ol>
<li><strong>Maak een account aan</strong> voor je vader (gratis, duurt 2 minuten)</li>
<li><strong>Start het eerste interview</strong> — onze AI stelt warme, open vragen over zijn jeugd, zijn dromen en zijn wijsheid</li>
<li><strong>Leg zijn stem vast</strong> — audio-opnames worden automatisch omgezet naar tekst en bewaard voor altijd</li>
</ol>

<h2>De vragen die je nooit durfde te stellen</h2>
<p>De meeste kinderen willen meer weten over hun ouders, maar weten niet hoe ze het gesprek moeten beginnen. Onze AI-interviewer begeleidt je vader door 18 thema's: van zijn vroegste herinneringen tot zijn levenslessen voor de volgende generaties.</p>
<blockquote>
<p>"Ik heb altijd gedacht dat mijn vader een gewone man was. Nu ik zijn verhalen lees, besef ik dat hij een héld was." — Sabine, 42</p>
</blockquote>

<h2>Wat kost het?</h2>
<p>Je kunt gratis beginnen. Geen creditcard nodig. De eerste herinneringen zijn direct beschikbaar. Voor families die alles willen bewaren — inclusief foto's, video's en een fysiek boek — zijn er betaalbare pakketten beschikbaar.</p>

<h2>Begin vandaag nog</h2>
<p>Vaderdag is over een paar weken. Je hebt tijd genoeg om het mooiste cadeau te geven dat hij ooit heeft gekregen: zijn eigen levensverhaal, bewaard voor altijd.</p>
<p><strong>Want een stropdas vergeet hij. Zijn eigen verhaal nooit.</strong></p>""",
    },
    {
        "title": "5 vragen die je je ouders MOET stellen voordat het te laat is",
        "slug": "5-vragen-ouders-stellen-voordat-te-laat",
        "excerpt": "De antwoorden die je zult missen als je ze niet vraagt. Een gids voor een gesprek dat van onschatbare waarde is.",
        "tags": "familie,herinneringen,ouders,tips,gesprek",
        "header_color": "#E8F5E9",
        "header_text_color": "#1B5E20",
        "section": "blog",
        "status": "published",
        "meta_title": "5 vragen die je je ouders moet stellen | BewaardVoorJou.nl",
        "meta_description": "Welke vragen moet je je ouders stellen voordat hun verhalen verloren gaan? Ontdek 5 gespreksstarters die je nooit zal vergeten.",
        "keywords": "vragen ouders stellen, levensverhaal ouders, herinneringen bewaren, ouders interview, familigeschiedenis",
        "content": """<h2>De gesprekken die we uitstellen tot het te laat is</h2>
<p>Bijna iedereen kent het gevoel. Je ouder wordt ouder, en ergens in je achterhoofd weet je dat er zoveel verhalen zijn die je nog niet kent. Over hun jeugd. Over hoe ze elkaar leerden kennen. Over wat hen heeft gevormd.</p>
<p>Maar de waan van de dag wint het altijd. Er is altijd een volgende keer.</p>
<p>Tot er geen volgende keer meer is.</p>

<h2>Vraag 1: "Wat is jouw vroegste herinnering?"</h2>
<p>Deze vraag opent altijd een deur. De vroegste herinneringen zijn vaak onverwacht — een geur, een geluid, een moment dat iedereen al lang vergeten is behalve degene die het beleefde. Laat je ouder antwoorden zonder te onderbreken. Stel daarna door: <em>"En wat voelde je toen?"</em></p>

<h2>Vraag 2: "Wat was het moeilijkste moment in je leven?"</h2>
<p>Dit is een gevoelige vraag, maar juist de moeite waard. Niet om pijn op te rakelen, maar om te begrijpen hoe jouw ouder met tegenslagen om is gegaan. De wijsheid die daarin zit, is onbetaalbaar voor de generaties na hen.</p>

<h2>Vraag 3: "Hoe was de wereld toen jij jong was?"</h2>
<p>Jongeren van nu groeien op met smartphones en sociale media. Je ouders groeiden op in een compleet andere wereld. Laat hen vertellen over spelletjes op straat, over de eerste televisie in huis, over hoe je een vriend belde via een telefooncel.</p>

<h2>Vraag 4: "Wat heb je geleerd van je ouders?"</h2>
<p>Hiermee ontrafel je een generatie verder in de familiegeschiedenis. Wat jouw ouders meekrijgen van hun ouders, is doorgegeven aan jou — bewust of onbewust. Dit gesprek maakt de keten zichtbaar.</p>

<h2>Vraag 5: "Wat wil je dat je kleinkinderen weten over jou?"</h2>
<p>Dit is de vraag die sommige ouderen laat huilen — van dankbaarheid. Want eindelijk vraagt iemand naar wat zij écht willen doorgeven. Niet wat ze deden, maar wie ze zijn.</p>

<h2>Leg het vast, nu je de kans hebt</h2>
<p>Met BewaardVoorJou.nl kun je deze gesprekken bewaren in audio, tekst en foto's. Onze AI-interviewer begeleidt je ouder door een volledig levensverhaal, stap voor stap, in hun eigen tempo.</p>""",
    },
    {
        "title": "Waarom je levensverhaal bewaren het grootste geschenk is aan je kinderen",
        "slug": "levensverhaal-bewaren-geschenk-kinderen",
        "excerpt": "Je hoeft geen beroemdheid te zijn om een verhaal te hebben dat de moeite waard is om te bewaren. Integendeel.",
        "tags": "inspiratie,levensverhaal,familie,kinderen,nalatenschap",
        "header_color": "#FCE4EC",
        "header_text_color": "#880E4F",
        "section": "blog",
        "status": "published",
        "meta_title": "Je levensverhaal bewaren — het mooiste erfgoed | BewaardVoorJou.nl",
        "meta_description": "Waarom het vastleggen van je eigen verhaal het meest waardevolle cadeau is dat je je kinderen en kleinkinderen kunt geven.",
        "keywords": "levensverhaal bewaren, erfgoed familie, herinneringen vastleggen, nalatenschap ouders, digitaal familiearchief",
        "content": """<h2>Je bent geen beroemdheid. Je verhaal is toch uniek.</h2>
<p>Veel mensen denken: "Mijn leven is niet bijzonder genoeg om op te schrijven." Ze waren geen president, schreven geen bestseller, klommen niet op de hoogste berg.</p>
<p>Maar hun kleinkinderen denken daar anders over.</p>
<p>Want voor een kind van acht jaar is opa — die de oorlog meemaakte als peuter, die met zijn handen een huis bouwde, die dertig jaar lang elke ochtend dezelfde bakker groette — een levende legende.</p>

<h2>Wat verlies je als je het niet vastlegt?</h2>
<p>Elke dag verdwijnen er verhalen. Niet door brand of vloedgolf, maar simpelweg omdat iemand overlijdt zonder dat er iemand de tijd heeft genomen om te luisteren.</p>
<p>De naam van de straat waar je opgroeide. De geur van je moeders keuken. Het nummer dat je vader floot als hij tevreden was. Kleine dingen die nergens staan opgeschreven, maar die voor jouw kinderen alles zouden betekenen.</p>

<h2>Wat krijgen je kinderen als je het wél vastlegt?</h2>
<ul>
<li>Een anker in hun identiteit: <em>dit is waar wij vandaan komen</em></li>
<li>Antwoorden op vragen die ze later zullen hebben</li>
<li>Een gevoel van continuïteit over generaties heen</li>
<li>Jouw stem, jouw lach — lang nadat je er niet meer bent</li>
</ul>

<h2>Hoe begin je?</h2>
<p>Begin klein. Eén herinnering. Vijf minuten. Een audio-opname terwijl je in de auto rijdt. Onze AI-interviewer stelt de vragen — jij hoeft alleen maar te antwoorden.</p>
<p>Het verhaal schrijft zichzelf. Jij hoeft het alleen maar te beginnen.</p>""",
    },
    {
        "title": "Hoe start je een interview met je ouder? (Praktische gids voor beginners)",
        "slug": "interview-ouder-starten-praktische-gids",
        "excerpt": "Je wilt het gesprek starten, maar weet niet hoe. Deze stap-voor-stap gids helpt je op weg zonder ongemakkelijke stiltes.",
        "tags": "tips,interview,ouders,beginnen,praktisch",
        "header_color": "#E3F2FD",
        "header_text_color": "#0D47A1",
        "section": "blog",
        "status": "published",
        "meta_title": "Interview met je ouder starten — praktische gids | BewaardVoorJou.nl",
        "meta_description": "Wil je het levensverhaal van je ouder vastleggen maar weet je niet waar te beginnen? Deze gids helpt je stap voor stap op weg.",
        "keywords": "interview ouder starten, levensverhaal opnemen, herinneringen vastleggen tips, gesprek met ouders, familiegeschiedenis",
        "content": """<h2>Het moeilijkste is beginnen</h2>
<p>Je weet dat je het moet doen. Je ouder wordt ouder. De verhalen zijn er — ergens. Maar elke keer dat jullie samen zijn, gaat het gesprek over het weer, over de buren, over of je genoeg eet.</p>
<p>Hoe begin je een gesprek over een heel leven?</p>

<h2>Stap 1: Kies het juiste moment</h2>
<p>Niet tijdens een druk familiediner. Niet tijdens een haastig bezoekje. Kies een rustig moment: een zondagmiddag, een autorit, een wandeling. Wanneer er tijd is, en geen agenda om naar terug te keren.</p>

<h2>Stap 2: Begin met het makkelijkste</h2>
<p>Vraag niet meteen naar de moeilijkste momenten. Begin met het leukste: jeugd, vrienden, spelletjes. <em>"Hoe was jouw favoriete sport als kind?"</em> is een veilige start die altijd werkt.</p>

<h2>Stap 3: Gebruik een hulpmiddel</h2>
<p>Een telefoon op tafel die opneemt, verlaagt de druk. Niemand hoeft te onthouden. Niemand hoeft aantekeningen te maken. Je kunt gewoon luisteren.</p>
<p>Met BewaardVoorJou.nl stelt de AI automatisch de volgende vraag zodra je ouder klaar is met antwoorden. Jij bent er gewoon bij — als luisteraar, niet als interviewer.</p>

<h2>Stap 4: Laat stiltes toe</h2>
<p>De mooiste antwoorden komen na een stille pauze. Vul niet meteen in, verbeter niet, vraag niet door voor de ander klaar is. Stilte is geen ongemak — het is ruimte voor nadenken.</p>

<h2>Stap 5: Sla het op</h2>
<p>Een gesprek dat je niet bewaart, bestaat over tien jaar alleen nog in je hoofd — vervaagd, gefragmenteerd. Audio, tekst, foto's: zorg dat er iets tastbaars overblijft.</p>

<h2>Klaar om te beginnen?</h2>
<p>Maak gratis een account aan voor je ouder en start vandaag nog met het eerste interview. Het duurt maar 20 minuten, en de verhalen die je terugkrijgt, bewaar je voor de rest van je leven.</p>""",
    },
    {
        "title": "Digitaal vs. fysiek: hoe bewaar je herinneringen het beste?",
        "slug": "digitaal-vs-fysiek-herinneringen-bewaren",
        "excerpt": "Fotoboek of cloud? Audio-opname of dagboek? We zetten de voor- en nadelen naast elkaar zodat jij de beste keuze maakt.",
        "tags": "tips,digitaal,bewaren,fotoboek,technologie",
        "header_color": "#F3E5F5",
        "header_text_color": "#4A148C",
        "section": "blog",
        "status": "published",
        "meta_title": "Digitaal vs. fysiek herinneringen bewaren | BewaardVoorJou.nl",
        "meta_description": "Fotoboek of cloudopslag? Dagboek of audio-opname? Ontdek welke methode het beste werkt voor het bewaren van levensverhalen.",
        "keywords": "herinneringen bewaren digitaal, fotoboek maken, levensverhaal opschrijven, digitaal archief familie, audio opname herinneringen",
        "content": """<h2>De eeuwige vraag: papier of pixels?</h2>
<p>Je wilt de herinneringen van je ouder bewaren. Maar hoe? Een fotoboek dat over de vloer slingert bij elke verhuizing? Een USB-stick die je kwijtraakt? Een cloudopslag die je over twintig jaar misschien niet meer kunt betalen?</p>
<p>Er is geen perfect antwoord, maar er is wel een slimme combinatie.</p>

<h2>De voordelen van fysiek bewaren</h2>
<ul>
<li>Geen technologie nodig om het te openen</li>
<li>Tastbaar, emotioneel — je kunt het vasthouden</li>
<li>Overleeft (mits goed bewaard) generaties</li>
<li>Geen abonnement, geen wachtwoord</li>
</ul>
<p>Maar: een brand, een overstroming, een verhuizing — en het is weg.</p>

<h2>De voordelen van digitaal bewaren</h2>
<ul>
<li>Meerdere back-ups mogelijk</li>
<li>Deelbaar met de hele familie tegelijk</li>
<li>Audio en video mogelijk — de stem van je oma, haar lach</li>
<li>Doorzoekbaar: vind in seconden de herinnering die je zoekt</li>
</ul>
<p>Maar: technologie verandert. Formats worden verouderd. Platforms gaan failliet.</p>

<h2>De slimste aanpak: beiden</h2>
<p>De meest duurzame methode combineert digitaal en fysiek. Leg alles digitaal vast — audio, tekst, foto's — en laat daarna een fysiek boek drukken als mijlpaal.</p>
<p>BewaardVoorJou.nl doet dit automatisch. Verhalen worden digitaal bewaard in een veilige omgeving, en je kunt ze op elk moment exporteren of laten drukken als een mooi fysiek boek — perfect als cadeau of als familiearchief.</p>

<h2>Wat is het meest waardevol?</h2>
<p>Audio. Altijd audio. Een foto laat zien hoe iemand eruitzag. Een audio-opname laat horen hoe iemand <em>klonk</em>. Zijn aarzeling voor een moeilijke herinnering. Haar lach bij een grapje. Die nuances verdwijnen in tekst.</p>
<p>Begin met opnemen. De rest komt vanzelf.</p>""",
    },
]


def seed():
    db = SessionLocal()
    try:
        created = 0
        for data in ARTICLES:
            slug = data["slug"]
            if db.query(BlogPost).filter(BlogPost.slug == slug).first():
                print(f"  Overgeslagen (bestaat al): {slug}")
                continue

            post = BlogPost(
                id=str(uuid4()),
                author_id="seed",
                section=data["section"],
                title=data["title"],
                slug=slug,
                excerpt=data.get("excerpt"),
                tags=data.get("tags"),
                header_color=data.get("header_color"),
                header_text_color=data.get("header_text_color"),
                content=data["content"],
                meta_title=data.get("meta_title"),
                meta_description=data.get("meta_description"),
                keywords=data.get("keywords"),
                status=data["status"],
                published_at=datetime.now(timezone.utc),
                view_count=0,
            )
            db.add(post)
            created += 1
            print(f"  Aangemaakt: {slug}")

        db.commit()
        print(f"\nKlaar -- {created} artikel(en) aangemaakt.")
    except Exception as e:
        db.rollback()
        print(f"\nFout: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
