"""
Contentaudit van de 12 meest recente blog- en kennisbankartikelen
(10 aug 2026). Waar fix_blog_seo_issues_aug2026.py alleen metadata-bugs
opruimde, zit de schade hier in de artikeltekst zelf.

Lost op:

  1. VERZONNEN DIENST + PRIJZEN. "levensverhaal-vastleggen-complete-gids-
     voor-2026" (dezelfde dag gepubliceerd) verkocht een ghostwriting-
     traject van EUR 2.950 tot EUR 6.900, met 90-minutensessies, NIOD-
     archiefonderzoek en gebonden oplages. Dat bestaat niet: /pricing
     hanteert 79/149/229 voor self-service (zie de bron van waarheid in
     life-journey-frontend/src/lib/pricing.ts). Structured data en prijzen
     die de zichtbare site tegenspreken zijn een overtreding van het
     spam-beleid van Google, nog los van het conversieprobleem. Hetzelfde
     geldt voor "levensverhaal-laten-schrijven-cadeau-...", dat schreef
     over "wij interviewen familie" en "het verschil met een ander bureau".
     Beide artikelen zijn volledig herschreven rond het echte product.

  2. KANNIBALISATIE. Dat gidsartikel targette "levensverhaal vastleggen"
     met de titel "complete gids voor 2026", terwijl de pijlerpagina
     /levensverhaal-vastleggen al draait op "De complete oplossing [2026]".
     Het artikel is hertarget op de long tail "audio, video of opschrijven"
     en verwijst nu naar de pijler in plaats van ertegen te concurreren.

  3. ONVERIFIEERBARE CLAIMS. Verwijderd of gecorrigeerd:
     - een complete casestudy met 25 bewoners, GDS-15-metingen en een
       citaat van een gespreksleider (zorginstellingen-artikel);
     - "gebruikersonderzoek van BewaardVoorJou uit 2024 onder 400
       deelnemers" met een 3x-claim (nalatenschap-artikel);
     - "80% haakt af" en "60% loopt vast na hoofdstuk 3" (gidsartikel).
     De Cochrane-review is wel echt (Woods et al. 2018, CD001120.pub3,
     22 studies) maar werd overdreven weergegeven: het artikel claimde
     "vermindert depressieve symptomen significant, SMD -0.63", terwijl de
     review spreekt van een waarschijnlijk gering effect bij individuele
     reminiscentie (SMD -0.41, 4 studies, 131 deelnemers, klinisch belang
     onzeker). Nu correct geciteerd, met een link naar de review zelf in
     plaats van naar de homepage van cochrane.org.

  4. DODE INTERNE LINKS. Het gidsartikel linkte naar /werkwijze,
     /voorbeeldboeken, /over-ons, /veelgestelde-vragen en twee
     niet-bestaande artikelpaden: alle zes een 404.

  5. INTERNE LINKS ONTBRAKEN. De twee zwaarste artikelen (2068 en 2384
     woorden) hadden nul interne links, het cadeau-artikel had er een.
     Dat is precies het weespagina-patroon uit de GSC-analyse.

  6. META. Twee meta_titles waren midden in een woordgroep afgekapt op
     ~50 tekens, een was 62 tekens, en zes meta_descriptions waren de
     eerste 150 tekens van de intro met een beletselteken erachter.

  7. SLUGS. "de-30-hoofdstukken-van-je-leven-..." terwijl titel en inhoud
     58 hoofdstukken zeggen, en een resterend hoofdstuknummer in
     "1-start-met-een-digitaal-levensverhaal-...". De 301's staan in
     life-journey-frontend/src/middleware.ts. De afgekapte slugs van de
     kleinkinderen- en zorginstellingen-artikelen laten we met rust: die
     zijn lelijk maar niet misleidend, en een slugwijziging kost altijd
     wat linkwaarde.

Idempotent: fragmenten die al vervangen zijn worden overgeslagen, en het
script meldt het als een verwacht fragment niet meer voorkomt. Met --dry
wordt alleen getoond wat er zou gebeuren.

    export DATABASE_URL="postgresql://user:pass@host:5432/db"
    python fix_blog_content_audit_aug2026.py --dry
    python fix_blog_content_audit_aug2026.py

Na uitvoering: POST /api/revalidate met {"section":"blog"} (admin-token)
om de ISR-window van 900s te omzeilen.
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if not os.environ.get("DATABASE_URL"):
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except Exception:
        pass

from app.db.session import SessionLocal
from app.models.blog_post import BlogPost


# ─────────────────────────────────────────────────────────────────────────────
# 1. Volledige herschrijvingen
# ─────────────────────────────────────────────────────────────────────────────
# Deze twee artikelen beschreven van kop tot staart een dienst die niet
# bestaat. Een chirurgische ingreep volstond niet: de premisse zelf was fout.
#
# Prijzen staan bewust NIET in de lopende tekst maar achter een link naar
# /pricing. Precies de drift die pricing.ts beschrijft (vijf pagina's met
# elk hun eigen prijs) willen we niet opnieuw introduceren via de blog.

GIDS_SLUG_OLD = "levensverhaal-vastleggen-complete-gids-voor-2026"
GIDS_SLUG_NEW = "levensverhaal-vastleggen-audio-video-of-opschrijven"

GIDS_CONTENT = """\
<p>Je wilt je levensverhaal vastleggen, maar de eerste keuze blokkeert al: ga je
het inspreken, filmen of opschrijven? Die keuze bepaalt meer dan je denkt. Ze
bepaalt hoe vrij je vertelt, hoeveel tijd het kost en wat je kleinkinderen er
later mee kunnen.</p>

<p>Dit artikel helpt je kiezen. Niet met een lijstje voor- en nadelen, maar met
de vraag die er werkelijk toe doet: hoe kom jij het makkelijkst aan het
vertellen? Wil je eerst het grotere geheel zien, lees dan
<a href="/levensverhaal-vastleggen">hoe het vastleggen van een levensverhaal
werkt</a>.</p>

<h2>De kern: praten gaat sneller dan schrijven</h2>

<p>De meeste mensen die stranden, stranden op de lege pagina. Schrijven vraagt
dat je tegelijk herinnert, ordent en formuleert. Dat zijn drie taken op hetzelfde
moment, en de derde is de zwaarste. Praten vraagt er maar een: herinneren. De
ordening en de formulering kunnen daarna.</p>

<p>Daarom begint bijna elk geslaagd levensverhaal met een gesprek, ook als het
eindresultaat een geschreven boek is. De vraag is dus niet zozeer <em>of</em> je
gaat praten, maar wat je van dat gesprek bewaart: het geluid, het beeld of de
tekst.</p>

<h2>Audio: voor wie makkelijk vertelt</h2>

<p>Een audiogesprek is de laagste drempel die er is. Geen camera, geen make-up,
geen opgeruimde kamer. Je zit in je eigen stoel en je praat.</p>

<p><strong>Kies audio als:</strong> je merkt dat je losser praat dan schrijft, als
je snel afgeleid raakt door een camera, of als je iemand met een kwetsbare
gezondheid interviewt voor wie een filmsessie te belastend is.</p>

<p>Wat je wint is de stem zelf. Dat blijkt vaak pas jaren later het kostbaarste
deel: het accent, de aarzeling voor een moeilijk onderwerp, de lach halverwege een
zin. Een transcriptie geeft je de woorden, maar de opname geeft je de persoon.</p>

<p><strong>Waar het misgaat:</strong> ruis. Een telefoon op 30 tot 60 centimeter
van de spreker, in een kamer met gordijnen of een kleed, levert beter geluid op
dan een dure microfoon in een lege kamer met een harde vloer.</p>

<h2>Video: voor gebaren en gezichten</h2>

<p>Video voegt toe wat audio mist: handen die iets uitbeelden, ogen die vollopen,
de manier waarop iemand een foto vasthoudt terwijl hij erover vertelt.</p>

<p><strong>Kies video als:</strong> het verhaal om voorwerpen draait die je wilt
tonen, als de verteller expressief is met handen en gezicht, of als je een
mijlpaal wilt vastleggen waar het beeld deel van uitmaakt.</p>

<p><strong>Waar het misgaat:</strong> de opgevoerde versie. Zodra er een camera
staat, gaan mensen presenteren in plaats van vertellen. Laat de camera een paar
minuten lopen voordat je de eerste echte vraag stelt; die eerste minuten zijn
altijd stijf en die gooi je weg.</p>

<h2>Schrijven: voor wie eerst wil nadenken</h2>

<p>Sommige mensen denken pas helder als ze typen. Zij hebben de stilte nodig die
een gesprek niet biedt, en willen een zin drie keer kunnen herzien voordat hij
klopt.</p>

<p><strong>Kies schrijven als:</strong> je van nature een dagboekschrijver of
briefschrijver bent, als het onderwerp gevoelig ligt en je woorden wilt kunnen
wegen, of als je doof of slechthorend bent en gesprekken vermoeiend zijn.</p>

<p><strong>Waar het misgaat:</strong> perfectionisme. Wie schrijft om te
publiceren, schrijft niet af. Wie schrijft om te onthouden, wel. Meer hierover
staat in de gids over <a href="/levensverhaal-opschrijven">je levensverhaal
opschrijven</a>.</p>

<h2>De hybride aanpak: praten, dan redigeren</h2>

<p>In de praktijk werkt de combinatie het best, en dat is ook hoe BewaardVoorJou
is opgezet. Je beantwoordt de vragen van de gespreksleider hardop, de opname wordt
automatisch uitgeschreven, en daarna pas kijk je naar de tekst. Wat krom staat
verbeter je; wat je liever niet deelt haal je eruit.</p>

<p>Zo hoef je nooit vanaf nul te schrijven. Je redigeert wat je al verteld hebt,
en dat is een fundamenteel makkelijkere taak. Het verhaal groeit door de
<a href="/kennisbank/de-58-hoofdstukken-van-je-leven-wat-kun-je-verwachten">58
hoofdstukken</a> heen, in je eigen tempo.</p>

<h2>Zo kies je in dertig seconden</h2>

<table>
<thead>
<tr><th>Als dit op jou slaat</th><th>Begin met</th></tr>
</thead>
<tbody>
<tr><td>Ik praat makkelijker dan ik schrijf</td><td>Audio</td></tr>
<tr><td>Ik wil voorwerpen of foto's laten zien</td><td>Video</td></tr>
<tr><td>Ik wil mijn woorden kunnen wegen</td><td>Tekst</td></tr>
<tr><td>Ik weet het niet</td><td>Audio, en zie wat er gebeurt</td></tr>
</tbody>
</table>

<p>De laatste rij is geen grap. Je kunt per hoofdstuk wisselen, en de meeste
mensen ontdekken pas na twee of drie sessies wat bij hen past. Er is geen keuze
die je later niet kunt herzien.</p>

<h2>Wat het kost en hoe lang het duurt</h2>

<p>De doorlooptijd hangt bijna volledig af van je eigen tempo, niet van de
methode. Een hoofdstuk kost doorgaans tien tot twintig minuten praten. Wie
wekelijks een half uur uittrekt, heeft de kern van zijn verhaal binnen een jaar
staan; wie in vakanties werkt, doet er langer over en dat is prima.</p>

<p>Je kunt gratis beginnen en de eerste hoofdstukken volledig doorlopen voordat je
iets betaalt. De actuele pakketten en prijzen staan op de
<a href="/pricing">prijzenpagina</a>.</p>

<h2>Veelgestelde vragen over audio, video en schrijven</h2>

<p><strong>Kan ik later nog wisselen van methode?</strong><br>
Ja. De methode ligt per hoofdstuk vast, niet per verhaal. Veel mensen spreken de
jeugdhoofdstukken in en typen de gevoeliger hoofdstukken later zelf uit.</p>

<p><strong>Wat als mijn geheugen gaten heeft?</strong><br>
Dat is normaal en het hoeft geen probleem te zijn. De gespreksleider werkt met
contextvragen: niet "wat gebeurde er in 1965", maar "hoe rook het bij jullie thuis
op zondag". Zintuiglijke vragen halen meer boven water dan datums. Een oude foto
of een liedje uit die periode werkt vaak nog beter.</p>

<p><strong>Moet ik een bijzonder leven hebben gehad?</strong><br>
Nee. Een schoenmaker die veertig jaar in dezelfde straat werkte, vertelt zijn
kleinkinderen meer over vakmanschap en buurtleven dan welk cv ook. De vraag is
niet of je verhaal de moeite waard is, maar hoe je het vertelt.</p>

<p><strong>Hoe zit het met privacy en gevoelige passages?</strong><br>
Jij bepaalt per hoofdstuk wat je deelt en met wie. Opnames en teksten staan
versleuteld opgeslagen en zijn niet toegankelijk voor anderen tenzij jij een
deellink aanmaakt. Lees hoe dat technisch geregeld is op de pagina over het
<a href="/veilig-digitaal-familiearchief">veilig digitaal familiearchief</a>.</p>

<p><strong>Kan ik het resultaat later exporteren?</strong><br>
Ja, als PDF. Wil je het buiten elk platform om bewaren, dan kun je het verhaal
ook <a href="/levensverhaal-bewaren-usb">op een USB-stick zetten</a>, inclusief de
originele audio.</p>

<h2>Begin bij de makkelijkste herinnering</h2>

<p>Wat je ook kiest: begin niet bij je geboorte. Begin bij de herinnering die je
vanzelf al vaak vertelt, die ene anekdote die op verjaardagen terugkomt. Die zit
al klaar in je hoofd, en na dat eerste hoofdstuk is de drempel weg.</p>

<p>Twijfel je nog over de aanpak in het algemeen? Lees dan de stap-voor-stap-gids
<a href="/kennisbank/hoe-begin-ik-met-het-vastleggen-van-mijn-levensverhaal">hoe
je begint met het vastleggen van je levensverhaal</a>, of neem
<a href="/contact">vrijblijvend contact op</a> met een vraag.</p>
"""

CADEAU_SLUG = "levensverhaal-laten-schrijven-cadeau-een-geschenk-dat-generaties-raakt"

CADEAU_CONTENT = """\
<p>Een levensverhaal cadeau geven is iets anders dan een boek cadeau geven. Je
geeft iemand de gelegenheid om verteld te worden. Voor ouders en grootouders die
materieel niets meer nodig hebben, is dat vaak het enige cadeau dat nog echt
aankomt.</p>

<p>Maar hoe werkt dat, een levensverhaal laten schrijven? En wie schrijft het dan?
Dit artikel legt uit wat je precies weggeeft, voor wie het geschikt is en waar het
in de praktijk op stukloopt.</p>

<h2>Wie schrijft het verhaal eigenlijk?</h2>

<p>Bij BewaardVoorJou schrijft de verteller het zelf, zonder dat het aanvoelt als
schrijven. Dat klinkt tegenstrijdig, dus even concreet: de ontvanger krijgt
vragen voorgelegd door een gespreksleider en beantwoordt die hardop. Die
antwoorden worden automatisch uitgeschreven tot lopende tekst. Wat overblijft is
redigeren, niet schrijven.</p>

<p>Dat verschil is precies waarom dit wel afkomt en een leeg dagboek niet. Er is
geen lege pagina, alleen een vraag. En op een vraag kan iedereen antwoord
geven.</p>

<p>Het gaat dus niet om een biograaf die bij je ouders op de bank komt zitten en
familieleden interviewt. Het gaat om je vader of moeder die in eigen tempo, in
eigen woorden, zijn of haar verhaal vertelt aan iets dat geduldig doorvraagt.</p>

<h2>Voor wie is dit een goed cadeau?</h2>

<p>Het werkt goed voor iemand die graag vertelt maar nooit aan opschrijven
toekomt. Dat is de grote meerderheid. Het werkt minder goed voor iemand die van
nature gesloten is over het verleden: dan is het cadeau eerder een verplichting
dan een geschenk, en dat voel je aan beide kanten.</p>

<p>Een goede test: heeft deze persoon verhalen die op verjaardagen terugkomen? Zo
ja, dan is er materiaal genoeg en is de drempel laag.</p>

<h2>Een mijlpaalcadeau: 70, 75 of 80 jaar</h2>

<p>Rond een rond verjaardag komt de vraag "wat geef je iemand die alles heeft"
vanzelf op tafel. Een levensverhaal is dan aantrekkelijk omdat het niet
concurreert met wat er al in huis staat, en omdat het de jarige tot onderwerp
maakt in plaats van tot ontvanger.</p>

<p>Praktisch punt: geef het niet als verrassing op de dag zelf zonder uitleg. Een
cadeaubon met een korte toelichting werkt beter, zodat de ontvanger zelf kan
kiezen wanneer hij begint. Meer ideeën staan in het artikel over
<a href="/blog/7-persoonlijke-cadeaus-voor-ouders-die-alles-al-hebben">persoonlijke
cadeaus voor ouders die alles al hebben</a>.</p>

<h2>Samen doen werkt beter dan alleen geven</h2>

<p>De cadeaus die aankomen zijn zelden de cadeaus die je overhandigt en daarna
loslaat. Wie het verhaal van een ouder cadeau doet en vervolgens meeluistert bij
een paar hoofdstukken, krijgt er zelf het meeste van terug.</p>

<p>Dat geldt dubbel voor kleinkinderen. Een kleinkind dat de vragen stelt, krijgt
antwoorden die het bij een gewoon bezoek nooit zou horen. Hoe je dat praktisch
aanpakt staat in
<a href="/blog/levensverhaal-opnemen-met-kleinkinderen-7-praktische">levensverhaal
opnemen met kleinkinderen</a>.</p>

<h2>Van verhaal naar iets tastbaars</h2>

<p>Digitaal bewaren is duurzaam, maar een cadeau wil je kunnen overhandigen. Het
verhaal is te exporteren als PDF om te laten drukken, en je kunt het samen met de
originele audio-opnames <a href="/levensverhaal-bewaren-usb">op een USB-stick
zetten</a>. Dat laatste is voor veel families het punt waarop het pas echt een
erfstuk wordt: de stem hoor je terug, ook over dertig jaar.</p>

<h2>Waar het in de praktijk op stukloopt</h2>

<p>Drie dingen, in volgorde van hoe vaak ze voorkomen. Ten eerste: te groot
beginnen. Wie zich voorneemt "het hele leven" vast te leggen, begint niet. Eén
hoofdstuk is het doel, niet een boek.</p>

<p>Ten tweede: chronologie. Bij de geboorte beginnen is logisch en bijna altijd
saai. De jaren waar iemand het makkelijkst over praat liggen meestal tussen de
achttien en de dertig.</p>

<p>Ten derde: techniek. Als het cadeau voor iemand van tachtig is, doe dan de
eerste sessie samen. Daarna gaat het zelfstandig, maar die eerste keer is de
drempel.</p>

<h2>Veelgestelde vragen over een levensverhaal als cadeau</h2>

<p><strong>Moet de ontvanger kunnen typen?</strong><br>
Nee. De antwoorden kunnen volledig ingesproken worden; de tekst wordt automatisch
uitgeschreven. Typen kan wel, maar het hoeft niet.</p>

<p><strong>Wat als mijn moeder halverwege afhaakt?</strong><br>
Dan blijft staan wat er staat, en dat is nog steeds meer dan er zonder het cadeau
zou zijn. Er is geen tijdslimiet en geen verplichte volgorde; ze kan een jaar
later verdergaan waar ze gebleven was.</p>

<p><strong>Kan ik het samen met mijn broers en zussen geven?</strong><br>
Ja, en dat is vaak verstandig. Het verhaal is met maximaal vijf familieleden te
delen, afhankelijk van het pakket. Kijk op de <a href="/pricing">prijzenpagina</a>
wat er in welk pakket zit.</p>

<p><strong>Van wie is het verhaal?</strong><br>
Van de verteller. Die bepaalt wat er gedeeld wordt en met wie, ook als jij het
cadeau betaald hebt. Dat is een bewuste keuze: een levensverhaal onder toezicht
van de gever wordt geen eerlijk verhaal.</p>

<p><strong>Hoe zit het met privacy?</strong><br>
Alles staat versleuteld opgeslagen en is alleen toegankelijk voor wie de
verteller toegang geeft. De details staan op de pagina over het
<a href="/veilig-digitaal-familiearchief">veilig digitaal familiearchief</a>.</p>

<h2>Beginnen</h2>

<p>Wil je zien hoe het werkt voordat je iets weggeeft, lees dan
<a href="/levensverhaal-vastleggen">hoe het vastleggen in zijn geheel
verloopt</a>. Een cadeaubon regel je via de
<a href="/pricing">prijzenpagina</a>, en met een vraag kun je altijd
<a href="/contact">contact opnemen</a>.</p>
"""

CONTENT_REWRITES: dict[str, str] = {
    GIDS_SLUG_OLD: GIDS_CONTENT,
    CADEAU_SLUG: CADEAU_CONTENT,
}


# ─────────────────────────────────────────────────────────────────────────────
# 2. Chirurgische fragmentvervangingen
# ─────────────────────────────────────────────────────────────────────────────
# Alleen de passages die feitelijk niet houdbaar zijn. De rest van deze
# artikelen is inhoudelijk in orde en blijft ongemoeid.

ZORG_SLUG = "levensverhaal-vastleggen-voor-zorginstellingen-het-complete"
NALATENSCHAP_SLUG = "1-start-met-een-digitaal-levensverhaal-de-basis-van-jouw"

FRAGMENT_REPLACEMENTS: dict[str, list[tuple[str, str]]] = {
    ZORG_SLUG: [
        # De review bestaat en telt inderdaad 22 studies, maar de uitkomst
        # werd fors aangedikt. Nu geciteerd zoals de auteurs hem opschrijven,
        # inclusief de onzekerheid — dat is ook geloofwaardiger richting
        # zorgprofessionals, die deze review kennen.
        (
            '<p>Uit een <a href="https://www.cochrane.org">Cochrane-review van 2018</a>, '
            "waarin 22 gerandomiseerde gecontroleerde studies werden geanalyseerd, blijkt "
            "dat reminiscentietherapie depressieve symptomen bij ouderen significant "
            "vermindert. De effectgrootte (SMD -0.63) is vergelijkbaar met die van "
            "reguliere gesprekstherapieën, maar zonder de drempel van een therapeutische "
            "setting. Het werkt vooral goed omdat het aansluit bij de levensfase waarin "
            "mensen behoefte hebben aan zingeving en het integreren van hun levensloop.</p>",
            # PubMed in plaats van cochranelibrary.com of doi.org: die twee
            # blokkeren geautomatiseerde requests (419/403), wat linkcheckers
            # als een dode link rapporteren. De PubMed-vermelding is stabiel.
            '<p>De <a href="https://pubmed.ncbi.nlm.nih.gov/29493789/" '
            'rel="nofollow">Cochrane-review van Woods e.a. (2018)</a> bundelde 22 studies '
            "naar reminiscentietherapie bij dementie. De conclusie is genuanceerder dan "
            "vaak wordt weergegeven: er zijn positieve effecten op kwaliteit van leven, "
            "cognitie, communicatie en stemming, maar ze zijn klein. Voor individuele "
            "reminiscentie vonden de auteurs een waarschijnlijk gering effect op "
            "depressieschalen (SMD -0,41, gebaseerd op vier studies met 131 deelnemers), "
            "waarbij het klinische belang onzeker blijft. Op cognitie was het effect zeer "
            "klein maar consistent.</p>\n\n"
            "<p>Belangrijk voor de praktijk: de review vond géén schadelijke effecten. "
            "Reminiscentie is dus een interventie met een beperkte maar gunstige "
            "verhouding tussen opbrengst en risico — geen wondermiddel, wel iets dat "
            "verantwoord in te zetten is naast de reguliere zorg.</p>",
        ),
        # Volledig gefabriceerde casestudy: 25 bewoners, GDS-15-uitkomsten en
        # een citaat van een niet-bestaande gespreksleider. Vervangen door een
        # opzet die niets claimt wat niet gemeten is: hoe een pilot eruitziet
        # en waarop je hem zou moeten afrekenen.
        (
            "<h2>Hoe BewaardVoorJou zorginstellingen ondersteunt: de casestudy</h2>",
            "<h2>Hoe een pilot met BewaardVoorJou eruitziet</h2>",
        ),
        (
            "<p>Een zorginstelling met 120 bewoners verdeeld over vier afdelingen in "
            "Noord-Brabant zette BewaardVoorJou in voor hun reminiscentieprogramma. Het "
            "doel: levensverhalen vastleggen van 25 bewoners binnen drie maanden, zonder "
            "extra personeel aan te nemen. De resultaten laten zien wat een gestructureerd "
            "format oplevert voor zorgorganisaties.</p>",
            "<p>We publiceren geen resultaten van instellingen die we niet zelf hebben "
            "gemeten, dus in plaats van een casestudy beschrijven we hier hoe een pilot "
            "doorgaans wordt opgezet en waarop u hem zou moeten beoordelen. Een realistische "
            "pilot loopt drie maanden, op één afdeling, met een vooraf vastgesteld aantal "
            "deelnemers en zonder extra formatie.</p>",
        ),
        (
            "<h3>De aanpak</h3>\n<p>De instelling selecteerde vijftien medewerkers en "
            "vrijwilligers die werden opgeleid als gespreksleider. Zij voerden de "
            "gesprekken met bewoners aan de hand van het empathische AI-interviewplatform "
            "van BewaardVoorJou. Bewoners zonder schrijfervaring hoefden niets voor te "
            "bereiden; het platform stelde de vragen en ving de antwoorden op. De "
            "gesprekken vonden plaats in twee sessies van gemiddeld 45 minuten per "
            "bewoner.</p>",
            "<h3>De aanpak</h3>\n<p>Medewerkers en vrijwilligers worden ingewerkt als "
            "gespreksleider. Zij voeren de gesprekken aan de hand van het platform, dat de "
            "vragen stelt en de antwoorden opvangt. Bewoners hoeven niets voor te bereiden "
            "en niets te schrijven. Reken op sessies van drie kwartier: langer is voor de "
            "meeste bewoners vermoeiend, en twee kortere gesprekken leveren meer op dan één "
            "lang gesprek.</p>",
        ),
        (
            "<h3>De resultaten</h3>\n<p>Binnen de gestelde drie maanden werden 22 van de 25 "
            "levensverhalen volledig vastgelegd. Drie bewoners kozen ervoor om niet deel te "
            "nemen vanwege gezondheidsredenen. Uit de evaluatie na zes maanden bleek dat 18 "
            "van de 22 deelnemende bewoners een positieve verandering in stemming lieten "
            "zien, gemeten met de gevalideerde depressieschaal voor ouderen (GDS-15). Bij "
            "15 bewoners nam het aantal sociale interacties met medebewoners of familie toe "
            "met gemiddeld twee momenten per week. Een belangrijk resultaat: 19 van de 22 "
            "families gaven aan dat het levensverhaal een blijvende herinnering is, ook "
            "wanneer de bewoner later niet meer in staat is om zelf te vertellen.</p>",
            "<h3>Waarop u de pilot beoordeelt</h3>\n<p>Spreek de meetpunten vóór de start af, "
            "anders wordt de evaluatie een gevoelskwestie. Bruikbare indicatoren zijn: het "
            "aandeel gestarte verhalen dat ook is afgerond, de tijd die een gespreksleider "
            "er per bewoner werkelijk in stopt, en of het levensverhaal daadwerkelijk "
            "terugkomt in de zorgplanbespreking. Wilt u het effect op welbevinden meten, "
            "gebruik dan een gevalideerd instrument zoals de GDS-15 en leg een nulmeting "
            "vast — zonder beginmeting zegt een eindscore niets.</p>\n\n"
            "<p>Houd er rekening mee dat een deel van de bewoners afziet van deelname, "
            "meestal om gezondheidsredenen. Reken dat niet af als mislukking van het "
            "programma: deelname is vrijwillig en dat hoort zo.</p>",
        ),
        (
            "<h3>Ervaringen uit de praktijk</h3>\n<p>Een van de gespreksleiders omschreef "
            "het effect als volgt: \"Je leert de bewoner echt kennen, niet alleen als "
            "zorgvrager maar als mens met een verleden. Het gaf gesprekken een diepte die "
            "we eerder niet haalden.\" De instelling besloot na de pilot het programma uit "
            "te breiden naar alle afdelingen, inclusief de dagbesteding, waar reminiscentie "
            "als vaste activiteit wordt aangeboden.</p>",
            "<h3>Opschalen na de pilot</h3>\n<p>Werkt het op één afdeling, dan is de "
            "logische vervolgstap de dagbesteding: daar is meer tijd per bewoner en zijn "
            "groepsgesprekken makkelijker in te roosteren. Neem het levensverhaal bovendien "
            "op in het introductieprogramma voor nieuwe medewerkers, anders blijft het "
            "kennis van de paar mensen die de pilot hebben gedraaid.</p>",
        ),
    ],
    NALATENSCHAP_SLUG: [
        # Eigen onderzoek dat nergens gepubliceerd is, met een harde 3x-claim.
        (
            "Het voordeel boven zelf schrijven is groot. Uit een gebruikersonderzoek van "
            "BewaardVoorJou uit 2024 onder 400 deelnemers bleek dat mensen die via "
            "AI-interviews hun verhaal vastleggen, <strong>drie keer zoveel herinneringen "
            "delen</strong> dan mensen die zelf moeten schrijven. De vragen fungeren als "
            "geheugensteun.",
            "Het voordeel boven zelf schrijven zit hem in de drempel. Schrijven vraagt dat "
            "je tegelijk herinnert, ordent en formuleert; antwoord geven op een vraag "
            "vraagt alleen het eerste. De vragen werken bovendien als geheugensteun: je "
            "komt uit bij herinneringen waar je zelf niet naar op zoek was gegaan.",
        ),
        # Cijfer is plausibel maar werd toegeschreven aan een "onderzoek" met
        # een link naar een homepage. Zonder vindbare bron geen hard getal.
        (
            "Het is opvallend hoeveel mensen dit regelen. Onderzoek van het "
            '<a href="https://www.notariaat.nl/">Nederlands Notariaat</a> uit 2023 laat '
            "zien dat <strong>twee derde van de Nederlanders geen testament heeft</strong>. "
            "Toch kan een testament al op jonge leeftijd zinvol zijn, bijvoorbeeld als je "
            "samenwoont zonder trouwakte of als je een eigen bedrijf hebt.",
            "Een ruime meerderheid van de Nederlanders heeft geen testament, en dat is "
            "meestal uitstelgedrag in plaats van een bewuste keuze. Toch kan een testament "
            "al op jonge leeftijd zinvol zijn, bijvoorbeeld als je samenwoont zonder "
            "trouwakte of als je een eigen bedrijf hebt. Een notaris kan in één gesprek "
            "vertellen of het in jouw situatie iets toevoegt; de "
            '<a href="https://www.notariaat.nl/" rel="nofollow">Koninklijke Notariële '
            "Beroepsorganisatie</a> heeft een zoekfunctie per regio.",
        ),
    ],
}


# ─────────────────────────────────────────────────────────────────────────────
# 3. Interne links toevoegen aan artikelen die er nul of één hadden
# ─────────────────────────────────────────────────────────────────────────────
# Twee artikelen van 2000+ woorden zonder enige interne link geven hun
# autoriteit nergens aan door. We voegen een afsluitend blok toe in plaats
# van links de lopende tekst in te wringen: minder risico op rare zinnen,
# en het blok is later makkelijk terug te vinden en aan te passen.

LEES_VERDER_BLOCKS: dict[str, str] = {
    "levensverhaal-opnemen-met-kleinkinderen-7-praktische": """
<h2>Lees verder</h2>
<ul>
<li><a href="/levensverhaal-vastleggen">Hoe het vastleggen van een levensverhaal werkt</a> — de complete opzet, van eerste vraag tot afgerond verhaal.</li>
<li><a href="/blog/levensverhaal-vastleggen-audio-video-of-opschrijven">Audio, video of opschrijven?</a> — welke opnamevorm past bij welke verteller.</li>
<li><a href="/kennisbank/de-58-hoofdstukken-van-je-leven-wat-kun-je-verwachten">De 58 hoofdstukken van een levensverhaal</a> — waar je met je kleinkind over kunt doorpraten.</li>
<li><a href="/levensverhaal-bewaren-usb">Het verhaal op USB bewaren</a> — de opnames tastbaar maken als erfstuk.</li>
</ul>
""",
    ZORG_SLUG: """
<h2>Lees verder</h2>
<ul>
<li><a href="/levensverhaal-vastleggen">Hoe het vastleggen van een levensverhaal werkt</a> — de methode waar het programma op draait.</li>
<li><a href="/kennisbank/de-58-hoofdstukken-van-je-leven-wat-kun-je-verwachten">De 58 hoofdstukken</a> — de gespreksstructuur die uw gespreksleiders gebruiken.</li>
<li><a href="/veilig-digitaal-familiearchief">Veilig digitaal archief</a> — opslag, toegang en AVG voor bewonersgegevens.</li>
<li><a href="/contact">Een pilot bespreken</a> — vrijblijvend, ook als u alleen wilt sparren over de opzet.</li>
</ul>
""",
    "7-persoonlijke-cadeaus-voor-ouders-die-alles-al-hebben": """
<h2>Lees verder</h2>
<ul>
<li><a href="/blog/levensverhaal-laten-schrijven-cadeau-een-geschenk-dat-generaties-raakt">Een levensverhaal cadeau geven</a> — hoe dat werkt en voor wie het geschikt is.</li>
<li><a href="/blog/levensverhaal-opnemen-met-kleinkinderen-7-praktische">Samen opnemen met kleinkinderen</a> — het cadeau dat je samen maakt.</li>
<li><a href="/levensverhaal-bewaren-usb">Het verhaal op USB</a> — iets tastbaars om te overhandigen.</li>
<li><a href="/pricing">Pakketten en cadeaubonnen</a> — wat er in welk pakket zit.</li>
</ul>
""",
    "levensverhaal-op-usb-7-manieren-voor-een-tastbaar-erfstuk": """
<h2>Lees verder</h2>
<ul>
<li><a href="/levensverhaal-bewaren-usb">Levensverhaal bewaren op USB én in de cloud</a> — waarom je niet hoeft te kiezen.</li>
<li><a href="/levensverhaal-vastleggen">Eerst het verhaal vastleggen</a> — een USB-stick is de laatste stap, niet de eerste.</li>
<li><a href="/veilig-digitaal-familiearchief">Veilig digitaal familiearchief</a> — back-ups, encryptie en toegang voor nabestaanden.</li>
<li><a href="/blog/start-in-een-middag-met-je-familiearchief-aanleggen-de">Je familiearchief ordenen</a> — de mapstructuur die je op de stick zet.</li>
</ul>
""",
}


# ─────────────────────────────────────────────────────────────────────────────
# 4. Losse linkcorrecties
# ─────────────────────────────────────────────────────────────────────────────
# Absolute naar relatieve URL's (consistent met de rest van de content) en
# de trailing slash van /contact/ eraf: die levert een extra redirect op.

LINK_REWRITES: dict[str, dict[str, str]] = {
    ZORG_SLUG: {
        "https://bewaardvoorjou.nl/levensverhaal-vastleggen": "/levensverhaal-vastleggen",
    },
    "levensverhaal-opnemen-met-kleinkinderen-7-praktische": {
        "https://bewaardvoorjou.nl/levensverhaal-vastleggen": "/levensverhaal-vastleggen",
        "https://bewaardvoorjou.nl/blog/levensverhaal-op-usb-7-manieren-voor-een-tastbaar-erfstuk":
            "/blog/levensverhaal-op-usb-7-manieren-voor-een-tastbaar-erfstuk",
        "https://bewaardvoorjou.nl/blog": "/blog",
    },
    "start-in-een-middag-met-je-familiearchief-aanleggen-de": {
        "https://bewaardvoorjou.nl/veilig-digitaal-familiearchief": "/veilig-digitaal-familiearchief",
        "https://bewaardvoorjou.nl/levensverhaal-vastleggen": "/levensverhaal-vastleggen",
    },
    NALATENSCHAP_SLUG: {
        "https://bewaardvoorjou.nl/blog/herinneringen-bewaard-waarom-vastleggen-essentieel-is":
            "/blog/herinneringen-bewaard-waarom-vastleggen-essentieel-is",
        "https://bewaardvoorjou.nl/levensverhaal-vastleggen": "/levensverhaal-vastleggen",
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# 5. Metadata
# ─────────────────────────────────────────────────────────────────────────────
# meta_title <= 60 tekens, meta_description 145-160 met een reden om te
# klikken. De zes auto-gegenereerde descriptions waren de intro afgekapt op
# 150 tekens met een beletselteken — die winnen nooit een klik.

FIELD_FIXES: dict[str, dict[str, str]] = {
    GIDS_SLUG_OLD: {
        "slug": GIDS_SLUG_NEW,
        "title": "Levensverhaal vastleggen: audio, video of opschrijven?",
        "meta_title": "Levensverhaal vastleggen: audio, video of opschrijven?",
        "meta_description": (
            "Inspreken, filmen of typen? Ontdek welke manier van levensverhaal "
            "vastleggen bij jou past, waar elke methode op stukloopt en hoe je "
            "vandaag begint."
        ),
        "excerpt": (
            "De eerste keuze blokkeert vaak al: ga je je levensverhaal inspreken, "
            "filmen of opschrijven? Deze gids helpt je kiezen op basis van hoe jij "
            "het makkelijkst vertelt."
        ),
        "keywords": "levensverhaal vastleggen audio, levensverhaal inspreken, levensverhaal opnemen, levensverhaal opschrijven",
        "tags": "levensverhaal vastleggen, audio, video, schrijven",
    },
    CADEAU_SLUG: {
        "meta_title": "Levensverhaal cadeau geven: hoe het werkt",
        "meta_description": (
            "Een levensverhaal cadeau geven aan je ouders of grootouders: wie "
            "schrijft het, voor wie is het geschikt en waar loopt het op stuk? "
            "Praktische uitleg."
        ),
        "excerpt": (
            "Een levensverhaal cadeau geven is iets anders dan een boek geven: je "
            "geeft iemand de gelegenheid om verteld te worden. Zo werkt het in de "
            "praktijk."
        ),
        "keywords": "levensverhaal cadeau, levensverhaal laten schrijven, cadeau ouders, cadeau 70 jaar, herinneringenboek",
        "tags": "cadeau, levensverhaal, ouders, mijlpaal",
    },
    "levensverhaal-opnemen-met-kleinkinderen-7-praktische": {
        "meta_title": "Levensverhaal opnemen met kleinkinderen: 7 manieren",
        "meta_description": (
            "Neem samen met je kleinkind het levensverhaal van opa of oma op. 7 "
            "praktische manieren met AI-transcriptie, gespreksvragen en een "
            "startchecklist."
        ),
        "excerpt": (
            "Jij en je kleinkind gaan in gesprek, de app schrijft mee. Zeven "
            "praktische manieren om het levensverhaal van opa of oma vast te "
            "leggen — inclusief checklist."
        ),
    },
    ZORG_SLUG: {
        "meta_title": "Reminiscentieprogramma voor zorginstellingen opzetten",
        "meta_description": (
            "Levensverhalen vastleggen in de zorg zonder extra formatie: de zes "
            "bouwblokken van een reminiscentieprogramma en hoe u een pilot opzet "
            "en beoordeelt."
        ),
        "excerpt": (
            "Tijdgebrek, geen format en weerstand bij familie: daar lopen "
            "reminiscentieprogramma's op stuk. Dit artikel geeft u de zes "
            "bouwblokken en een realistische pilotopzet."
        ),
    },
    "7-persoonlijke-cadeaus-voor-ouders-die-alles-al-hebben": {
        "meta_description": (
            "Ouders die alles al hebben verlangen naar erkenning. 7 persoonlijke "
            "cadeau-ideeën die écht blijven hangen, van receptenboek tot "
            "levensverhaal."
        ),
        "excerpt": (
            "Wat ouders die alles al hebben écht raakt, is erkenning. Zeven "
            "persoonlijke cadeaus die langer meegaan dan de verjaardag zelf."
        ),
    },
    NALATENSCHAP_SLUG: {
        "slug": "start-met-een-digitaal-levensverhaal-de-basis-van-jouw-nalatenschap",
        "meta_description": (
            "Je nalatenschap vastleggen is meer dan een testament: ook je "
            "verhalen, wensen en wachtwoorden horen erbij. Negen stappen in de "
            "juiste volgorde."
        ),
        "excerpt": (
            "Nalatenschap vastleggen gaat niet alleen over bezittingen, maar ook "
            "over wensen en verhalen. Negen stappen, te beginnen bij het deel dat "
            "niemand anders voor je kan doen."
        ),
    },
    "de-30-hoofdstukken-van-je-leven-wat-kun-je-verwachten": {
        "slug": "de-58-hoofdstukken-van-je-leven-wat-kun-je-verwachten",
        "meta_title": "De 58 hoofdstukken van je levensverhaal uitgelegd",
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# Slugwijzigingen — de bijbehorende 301's staan in middleware.ts
# ─────────────────────────────────────────────────────────────────────────────
EXPECTED_SLUG_CHANGES = {
    GIDS_SLUG_OLD: GIDS_SLUG_NEW,
    NALATENSCHAP_SLUG: "start-met-een-digitaal-levensverhaal-de-basis-van-jouw-nalatenschap",
    "de-30-hoofdstukken-van-je-leven-wat-kun-je-verwachten":
        "de-58-hoofdstukken-van-je-leven-wat-kun-je-verwachten",
}


def _get(db, slug: str) -> BlogPost | None:
    """Zoekt op de oude slug, en anders op de nieuwe — zodat een tweede run niets stukmaakt."""
    post = db.query(BlogPost).filter(BlogPost.slug == slug).first()
    if post is None and slug in EXPECTED_SLUG_CHANGES:
        post = db.query(BlogPost).filter(BlogPost.slug == EXPECTED_SLUG_CHANGES[slug]).first()
    return post


def main() -> None:
    ap = argparse.ArgumentParser(description="Contentaudit blog augustus 2026")
    ap.add_argument("--dry", action="store_true", help="alleen tonen, niets wijzigen")
    ap.add_argument("--database-url", default=os.environ.get("DATABASE_URL"))
    args = ap.parse_args()

    if not args.database_url:
        print("GEEN DATABASE_URL — exporteer DATABASE_URL of geef --database-url.")
        sys.exit(2)

    os.environ["DATABASE_URL"] = args.database_url
    db = SessionLocal()
    problems = 0
    changed = 0
    try:
        touched: set[str] = set()

        # 1) Volledige herschrijvingen
        for slug, new_content in CONTENT_REWRITES.items():
            post = _get(db, slug)
            if not post:
                print(f"[MISSING] {slug}")
                problems += 1
                continue
            if post.content.strip() == new_content.strip():
                print(f"[{slug}] content al herschreven")
                continue
            old_words = len(post.content.split())
            new_words = len(new_content.split())
            print(f"[REWRITE] {slug}: {old_words} -> {new_words} woorden"
                  + ("  (DRY)" if args.dry else ""))
            if not args.dry:
                post.content = new_content
            touched.add(slug)
            changed += 1

        # 2) Fragmentvervangingen
        for slug, pairs in FRAGMENT_REPLACEMENTS.items():
            post = _get(db, slug)
            if not post:
                print(f"[MISSING] {slug}")
                problems += 1
                continue
            content = post.content
            hits = 0
            for old, new in pairs:
                if old not in content:
                    if new in content:
                        continue  # al gedaan in een eerdere run
                    print(f"[LET OP] {slug}: fragment niet gevonden — "
                          f"handmatig nakijken: {old[:70]!r}...")
                    problems += 1
                    continue
                content = content.replace(old, new, 1)
                hits += 1
            if hits:
                print(f"[FRAGMENT] {slug}: {hits} passage(s) vervangen"
                      + ("  (DRY)" if args.dry else ""))
                if not args.dry:
                    post.content = content
                touched.add(slug)
                changed += 1

        # 3) Linkcorrecties
        for slug, rewrites in LINK_REWRITES.items():
            post = _get(db, slug)
            if not post:
                print(f"[MISSING] {slug}")
                problems += 1
                continue
            content = post.content
            hits = 0
            for old_href, new_href in rewrites.items():
                needle = f'href="{old_href}"'
                if needle not in content:
                    continue
                content = content.replace(needle, f'href="{new_href}"')
                hits += 1
            if hits:
                print(f"[LINKS] {slug}: {hits} link(s) genormaliseerd"
                      + ("  (DRY)" if args.dry else ""))
                if not args.dry:
                    post.content = content
                touched.add(slug)
                changed += 1

        # 4) Lees verder-blokken
        for slug, block in LEES_VERDER_BLOCKS.items():
            post = _get(db, slug)
            if not post:
                print(f"[MISSING] {slug}")
                problems += 1
                continue
            if "<h2>Lees verder</h2>" in post.content:
                print(f"[{slug}] heeft al een Lees verder-blok")
                continue
            print(f"[LEESVERDER] {slug}: blok toegevoegd" + ("  (DRY)" if args.dry else ""))
            if not args.dry:
                post.content = post.content.rstrip() + "\n" + block
            touched.add(slug)
            changed += 1

        # 5) Metadata en slugs
        for slug, fields in FIELD_FIXES.items():
            post = _get(db, slug)
            if not post:
                print(f"[MISSING] {slug}")
                problems += 1
                continue
            diffs = []
            for field, value in fields.items():
                if getattr(post, field) == value:
                    continue
                if field == "meta_title" and len(value) > 60:
                    print(f"[LET OP] {slug}: meta_title {len(value)} tekens (>60)")
                    problems += 1
                if field == "meta_description" and not (140 <= len(value) <= 160):
                    print(f"[LET OP] {slug}: meta_description {len(value)} tekens "
                          "(buiten 140-160)")
                    problems += 1
                diffs.append(f"{field}: {getattr(post, field)!r} -> {value!r}")
                if not args.dry:
                    setattr(post, field, value)
            if diffs:
                print(f"[META] {slug}" + ("  (DRY)" if args.dry else ""))
                for d in diffs:
                    print("   ", d)
                touched.add(slug)
                changed += 1

        if not args.dry:
            db.commit()

        verb = "Zou wijzigen" if args.dry else "Gewijzigd"
        print(f"\n{verb}: {changed} bewerking(en) over {len(touched)} artikel(en).")
        if problems:
            print(f"Aandachtspunten: {problems} — zie [LET OP]/[MISSING] hierboven.")
        print("\nVergeet niet: POST /api/revalidate {\"section\":\"blog\"} en controleer "
              "dat de 301's in middleware.ts mee zijn gedeployed.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
