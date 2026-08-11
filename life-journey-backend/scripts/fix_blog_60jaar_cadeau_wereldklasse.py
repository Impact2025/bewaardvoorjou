"""
Herschrijving van "60 jaar en alles al gehad? Geef iets wat wel binnenkomt"
(slug: 60-jaar-cadeau-geef-iets-wat-wel-binnenkomt) naar wereldklasse-niveau.

Aanleiding: audit van het artikel liet zien dat het qua techniek (title,
meta_description, schema.org) al in orde was, maar qua content te dun bleef
voor een concurrerende commerciele zoekopdracht ("cadeau 60 jaar"):

  1. TE DUN. ~450 woorden lopende tekst tegenover 1200-2000+ woorden bij
     concurrerende cadeaugidsen. Toegevoegd: een concrete sectie met
     invulbare voorbeeldvragen (wat vraag je iemand om bij te dragen) zodat
     de lezer niet alleen het "waarom" maar ook het "wat nu" krijgt.
  2. GEEN FAQ-SCHEMA. Het artikel had geen "Veelgestelde vragen"-sectie,
     terwijl life-journey-frontend/src/lib/faq-schema.ts elk artikel met zo'n
     sectie automatisch omzet naar FAQPage-structured-data (rijke resultaten
     in Google). Toegevoegd: vier echte vragen in het H3-patroon dat de
     extractor herkent.
  3. CANNIBALISATIE-RISICO. De sectie "Voor 50, 60 en 65" verbreedde de
     scope van dit 60-jaar-specifieke artikel naar dezelfde doelgroep als de
     bestaande pillar /mijlpaal-cadeau. Ingekort tot een doorverwijzing in
     plaats van een eigen behandeling van 50/65, zodat dit artikel scherp op
     "cadeau 60 jaar" gericht blijft en de pillar het bredere zoekwoord
     houdt.

Title, meta_title, meta_description en de zes-pijlers-verwijzingen blijven
ongewijzigd: die waren al correct. author/dateModified in de structured data
zijn een sitebrede templatefix (zie life-journey-frontend/src/app/blog/[slug]/
page.tsx en kennisbank/[slug]/page.tsx), niet iets wat dit script regelt.

Idempotent: als de content al vervangen is, meldt het script dat en doet
niets. Met --dry wordt alleen getoond wat er zou gebeuren.

    export DATABASE_URL="postgresql://user:pass@host:5432/db"
    python fix_blog_60jaar_cadeau_wereldklasse.py --dry
    python fix_blog_60jaar_cadeau_wereldklasse.py

Na uitvoering: POST /api/revalidate {"section":"blog"} (admin-token) om de
ISR-window van 900s te omzeilen.
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


SLUG = "60-jaar-cadeau-geef-iets-wat-wel-binnenkomt"

NEW_CONTENT = """\
<p><strong>In het kort:</strong> voor iemand van 50, 60 of 65 die materieel niets tekortkomt, is het mooiste cadeau geen ding maar betekenis. Een gezamenlijk, persoonlijk eerbetoon raakt oneindig veel dieper dan een anonieme envelop met geld. Ik leg uit waarom, hoe je het samen maakt, en welke vragen je aan de bijdragers stelt zodat er niet "gefeliciteerd!" maar een echt verhaal uitkomt.</p>

<p>In mijn tijd in de welzijnssector zag ik hoe mensen op latere leeftijd steeds minder waarde hechten aan spullen en steeds meer aan betekenis. "Ik heb alles al" is meestal geen grap, maar een eerlijke constatering. En juist dat maakt de cadeaukeuze lastig, tot je beseft dat het antwoord niet in een winkel ligt.</p>

<h2>Waarom de envelop met geld tekortschiet</h2>
<p>Bij een groepscadeau gebeurt er vaak iets vervelends: iedereen wacht op elkaar. Niemand voelt zich verantwoordelijk voor het persoonlijke deel, en voor je het weet wordt het een anonieme envelop met geld. Handig, maar vergeetbaar. Psychologen noemen dat mechanisme het omstander-effect: hoe meer mensen erbij betrokken zijn, hoe minder iemand het initiatief neemt.</p>
<blockquote>
<p>Een envelop zegt: we wisten het even niet. Een gezamenlijk verhaal zegt: jij hebt ertoe gedaan, en hier is het bewijs.</p>
</blockquote>

<h2>Wat een mijlpaal echt bijzonder maakt</h2>
<p>Zestig worden is een moment om terug te kijken op een rijk leven. Het mooiste cadeau sluit daarop aan: het viert wie iemand is en wat hij heeft betekend. Dat doe je niet met een ding, maar met verhalen, van iedereen die om die persoon geeft.</p>
<p>Stel je voor dat kinderen, kleinkinderen, vrienden en oud-collega's elk een herinnering bijdragen. Samen vormen die een portret dat niemand alleen had kunnen maken. Dat is een cadeau dat op de dag zelf tranen oproept, en er daarna nog jaren is.</p>

<h2>Welke vragen zorgen voor een écht verhaal, niet voor "gefeliciteerd!"</h2>
<p>Het grootste risico bij een gezamenlijk cadeau is dat elke bijdrage hetzelfde zegt. Vraag daarom niet vrijblijvend om "een leuke herinnering", maar geef elke bijdrager een concrete vraag om mee te beginnen. Een paar voorbeelden die werken:</p>
<ul>
<li><strong>Voor (klein)kinderen:</strong> "Wat is het eerste wat je je herinnert dat papa/mama/opa/oma je leerde?"</li>
<li><strong>Voor de partner:</strong> "Welk moment wist je zeker dat dit de juiste persoon was?"</li>
<li><strong>Voor vrienden:</strong> "Wat is het gekste of mooiste dat jullie samen hebben meegemaakt?"</li>
<li><strong>Voor (oud-)collega's:</strong> "Wat heb je van deze persoon geleerd dat je nooit meer vergeet?"</li>
</ul>
<p>Een concrete vraag verlaagt de drempel enorm. "Vertel iets moois" laat mensen dagenlang niets doen; "wat leerde hij je als kind" levert vaak binnen vijf minuten een antwoord op.</p>

<h2>Zo maak je het samen, zonder gedoe</h2>
<p>Vroeger kostte zoiets iemand dagen knip- en plakwerk. Nu niet meer. Met BewaardVoorJou.nl nodig je iedereen uit om in zijn eigen tempo een herinnering bij te dragen, in tekst, audio of video, dankzij de <strong>multimodale invoer</strong>. De <strong>empathische AI-interviewer</strong> helpt mensen die niet weten wat ze moeten zeggen op gang, met een concrete vraag in plaats van een leeg vak. En met de <strong>eenvoudige export</strong> maak je er een gedrukt levensboek van om cadeau te geven.</p>

<h2>Ook geschikt voor 50 of 65</h2>
<p>Hetzelfde idee werkt net zo goed rond een vijftigste verjaardag of een pensioen op vijfenzestigste: vier de mens, niet de spullen. De volledige aanpak per mijlpaal, inclusief planning en voorbeeldteksten, staat op de pagina over het <a href="/mijlpaal-cadeau">mijlpaal cadeau voor 50, 60 of 65 jaar</a>.</p>

<h2>Veelgestelde vragen over een cadeau voor 60 jaar</h2>
<h3>Hoeveel tijd moet ik inplannen voordat de verjaardag is?</h3>
<p>Reken op minimaal drie tot vier weken. Niet omdat het bijdragen zelf veel tijd kost (vaak vijf tot tien minuten per persoon), maar omdat mensen het laten liggen tot je ze een tweede keer herinnert.</p>
<h3>Wat als iemand niet goed uit zijn woorden komt?</h3>
<p>Laat diegene inspreken in plaats van typen. De meeste mensen vertellen makkelijker dan ze schrijven, en de AI-interviewer stelt een vervolgvraag als het antwoord kort blijft.</p>
<h3>Kan ik dit ook doen als de groep verspreid over het land of de wereld woont?</h3>
<p>Ja, dat is precies waarom dit beter werkt dan een fysiek gastenboek. Iedereen draagt bij wanneer het hem uitkomt, en jij voegt alles samen tot één verhaal.</p>
<h3>Moet het cadeau digitaal blijven?</h3>
<p>Nee. Je kunt het verzamelde verhaal laten drukken tot een gedrukt levensboek, zodat de jarige op de dag zelf iets tastbaars in handen krijgt in plaats van alleen een link.</p>

<p>Waarom zo'n tastbaar eerbetoon dieper raakt dan een felicitatie-appje, lees je in <a href="/kennisbank/de-psychologie-van-bewaren-waarom-je-niets-wilt-weggooien">dit artikel over de psychologie van bewaren</a>.</p>

<hr>
<h2>Twee manieren om vandaag te beginnen</h2>
<p><strong>Voor families en vrienden:</strong> begin nu met verzamelen, dan is het op tijd klaar. <a href="/register">Maak gratis een account aan</a> en nodig iedereen uit.</p>
<p><strong>Voor organisaties</strong> die afscheid of jubilea van medewerkers betekenisvol willen maken: ik denk graag mee. Plan een verkenning via <a href="https://www.weareimpact.nl" target="_blank" rel="noopener noreferrer">WeAreImpact.nl</a>.</p>
"""


def main() -> None:
    ap = argparse.ArgumentParser(description="60-jaar-cadeau artikel naar wereldklasse-niveau")
    ap.add_argument("--dry", action="store_true", help="alleen tonen, niets wijzigen")
    ap.add_argument("--database-url", default=os.environ.get("DATABASE_URL"))
    args = ap.parse_args()

    if not args.database_url:
        print("GEEN DATABASE_URL — exporteer DATABASE_URL of geef --database-url.")
        sys.exit(2)

    os.environ["DATABASE_URL"] = args.database_url
    db = SessionLocal()
    try:
        post = db.query(BlogPost).filter(BlogPost.slug == SLUG).first()
        if not post:
            print(f"[MISSING] {SLUG} — niet gevonden.")
            sys.exit(1)

        if post.content.strip() == NEW_CONTENT.strip():
            print(f"[{SLUG}] content is al herschreven, niets te doen.")
            return

        old_words = len(post.content.split())
        new_words = len(NEW_CONTENT.split())
        print(f"[REWRITE] {SLUG}: {old_words} -> {new_words} woorden"
              + ("  (DRY)" if args.dry else ""))
        if not args.dry:
            post.content = NEW_CONTENT
            db.commit()
            print("Opgeslagen.")
        else:
            print("Dry-run: niets opgeslagen.")

        print("\nVergeet niet: POST /api/revalidate {\"section\":\"blog\"} zodat de "
              "wijziging niet tot 15 minuten op zich laat wachten.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
