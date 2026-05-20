"""
AI Interviewer Service - Generates empathetic prompts for life story recording
Uses OpenRouter (Claude) for high-quality, context-aware questions

Features:
- Context-aware prompting based on user's journey history
- Personalized questions using extracted themes and key people
- Follow-up engine for deeper conversations
"""
from typing import Iterable, Optional
from openai import OpenAI
from loguru import logger
from sqlalchemy.orm import Session

from app.schemas.common import ChapterId
from app.core.config import settings
from app.services.ai.memory import get_personalized_prompt_context, build_journey_memory


# Chapter-specific context and themes - v2.0: 7 fasen, 78 vragen
CHAPTER_CONTEXTS = {
    # Fase 1: Wie ben jij?
    ChapterId.intro_reflection: {
        "title": "Kernwoorden van je leven",
        "theme": "Als je jouw leven tot nu toe zou moeten beschrijven in één alinea, welke kernwoorden en gevoelens zouden daarin dan centraal staan?",
        "mood": "reflectief en samenvattend",
        "example_prompts": [
            "Welke drie woorden beschrijven jouw levensreis het beste?",
            "Welk gevoel komt steeds terug in je levensverhaal?",
            "Hoe zou je je leven in één zin samenvatten?"
        ]
    },
    ChapterId.intro_intention: {
        "title": "Je intentie",
        "theme": "Waarom ben je begonnen aan dit project om jouw levensverhaal vast te leggen? Wat hoop je hiermee te bereiken, of voor wie doe je het?",
        "mood": "warm en doelbewust",
        "example_prompts": [
            "Voor wie leg je dit verhaal vast?",
            "Wat hoop je dat mensen uit jouw verhaal meenemen?",
            "Waarom is het belangrijk voor jou om dit nu vast te leggen?"
        ]
    },
    ChapterId.intro_uniqueness: {
        "title": "Wat maakt jou uniek",
        "theme": "Beschrijf drie dingen die jou uniek maken en die je absoluut in je levensverhaal wilt opnemen.",
        "mood": "celebratief en persoonlijk",
        "example_prompts": [
            "Wat maakt jou anders dan anderen?",
            "Welke eigenschap of ervaring is typisch voor jou?",
            "Waar ben je het meest trots op over jezelf?"
        ]
    },

    # Fase 2: Je Wortels
    ChapterId.roots_first_memory: {
        "title": "Je vroegste herinnering",
        "theme": "Wat is het vroegste dat jij je herinnert — een beeld, een gevoel, een geur?",
        "mood": "zacht en uitnodigend",
        "example_prompts": [
            "Wat is het allereerste dat je je kunt herinneren?",
            "Welk beeld of gevoel brengt je terug naar je vroegste kindertijd?",
            "Hoe oud was je bij je vroegste herinnering, en wat zag je om je heen?"
        ]
    },
    ChapterId.roots_father: {
        "title": "Je vader",
        "theme": "Wie was je vader als mens — zijn werk, zijn humor, zijn manier van zijn?",
        "mood": "warm en nieuwsgierig",
        "example_prompts": [
            "Hoe zou je je vader beschrijven aan iemand die hem nooit heeft gekend?",
            "Wat is het eerste wat je aan je vader denkt?",
            "Welk moment met je vader herinner je je het levendigst?"
        ]
    },
    ChapterId.roots_mother: {
        "title": "Je moeder",
        "theme": "Wie was je moeder als mens — haar stem, haar geur, haar bijzonderheden?",
        "mood": "teder en zintuiglijk",
        "example_prompts": [
            "Hoe zou je je moeder beschrijven in drie woorden?",
            "Welke uitdrukking of gewoonte van je moeder herinner je je nog goed?",
            "Wat deed je moeder dat alleen zij deed?"
        ]
    },
    ChapterId.roots_grandparents: {
        "title": "Je grootouders",
        "theme": "Wie waren je grootouders en wat weet je over hun leven vóór jou?",
        "mood": "historisch en persoonlijk",
        "example_prompts": [
            "Welke grootouder kende je het best, en hoe was hij of zij?",
            "Wat weet je over het leven van je grootouders voor jij werd geboren?",
            "Is er een verhaal over je grootouders dat in de familie altijd wordt verteld?"
        ]
    },
    ChapterId.roots_siblings: {
        "title": "Broers, zussen en het gezinsleven",
        "theme": "Hoe was de sfeer thuis — rond de tafel, op vrije zaterdagen, in de vakanties?",
        "mood": "levendig en anekdotisch",
        "example_prompts": [
            "Hoe was jouw plek in het gezin — oudste, jongste, of middelste?",
            "Wat was een typische zondagmiddag bij jullie thuis?",
            "Welke gewoonte of traditie uit je gezin mis je nog?"
        ]
    },
    ChapterId.roots_home: {
        "title": "Het ouderlijk huis",
        "theme": "Beschrijf het huis waar je opgroeide — kamers, geuren, de sfeer",
        "mood": "nostalgisch en ruimtelijk",
        "example_prompts": [
            "Welke kamer in je ouderlijk huis herinner je je het best?",
            "Welke geur hoort voor jou bij het huis van je jeugd?",
            "Hoe zag de keuken of de woonkamer eruit?"
        ]
    },
    ChapterId.roots_neighborhood: {
        "title": "Je buurt of dorp",
        "theme": "Hoe was de buurt of het dorp — buren, buitenspelen, het dagelijkse leven",
        "mood": "levendig en gemeenschappelijk",
        "example_prompts": [
            "Hoe was de buurt waar je opgroeide — stad of platteland?",
            "Wie was de bekendste buurman of buurvrouw en waarom?",
            "Wat speelde je buiten met de andere kinderen?"
        ]
    },
    ChapterId.roots_faith: {
        "title": "Geloof en levensbeschouwing",
        "theme": "Welke rol speelde geloof of levensbeschouwing in je gezin en opvoeding?",
        "mood": "respectvol en open",
        "example_prompts": [
            "Groeide je op in een gelovig gezin of juist niet?",
            "Welke rol speelde de kerk, de moskee, of een andere plek van geloof in je jeugd?",
            "Hoe kijk je nu terug op de levensbeschouwing waarmee je opgroeide?"
        ]
    },
    ChapterId.roots_finances: {
        "title": "Het financiële klimaat thuis",
        "theme": "Had je het krap of ruim, en hoe merkte je dat als kind?",
        "mood": "eerlijk en zonder oordeel",
        "example_prompts": [
            "Hoe was het financieel bij jullie thuis toen je opgroeide?",
            "Is er een moment waarop je merkte hoe het er financieel voor stond?",
            "Wat leerde je over geld van je ouders?"
        ]
    },
    ChapterId.roots_hardship: {
        "title": "Wat je meedroeg",
        "theme": "Iets moeilijks uit je vroege jeugd — alleen wat je wilt delen",
        "mood": "voorzichtig en veilig",
        "example_prompts": [
            "Was er iets moeilijks in je jeugd dat je lang hebt meegedragen?",
            "Is er een periode uit je kindertijd die je liever zou vergeten?",
            "Je hoeft niet alles te vertellen — maar is er iets wat je nooit hebt uitgesproken?"
        ]
    },

    # Fase 3: Jeugd & School
    ChapterId.youth_favorite_place: {
        "title": "Je favoriete plek",
        "theme": "Neem ons mee naar je favoriete plek uit je kindertijd. Beschrijf wat je daar zag, hoorde, rook en voelde.",
        "mood": "nostalgisch en zintuiglijk",
        "example_prompts": [
            "Welke plek uit je jeugd mis je het meest?",
            "Beschrijf de geur die je terugbrengt naar je kindertijd",
            "Waar voelde je je als kind het meest gelukkig?"
        ]
    },
    ChapterId.youth_sounds: {
        "title": "Het geluid van toen",
        "theme": "Welk geluid associeer je het meest met je jeugd? Vertel een korte anekdote die bij dit geluid hoort.",
        "mood": "speels en zintuiglijk",
        "example_prompts": [
            "Welk geluid brengt je meteen terug naar je kindertijd?",
            "Wat hoorde je 's ochtends als je wakker werd?",
            "Welk geluid zul je nooit vergeten uit je jeugd?"
        ]
    },
    ChapterId.youth_hero: {
        "title": "Je held",
        "theme": "Wie was jouw grootste held of rolmodel toen je jong was, en welke invloed heeft die persoon gehad op wie je nu bent?",
        "mood": "bewonderend en reflectief",
        "example_prompts": [
            "Wie keek je als kind enorm tegen aan?",
            "Welke eigenschappen van je held heb je overgenomen?",
            "Wie wilde je worden toen je opgroeide?"
        ]
    },

    ChapterId.youth_primary_school: {
        "title": "De lagere school",
        "theme": "Een leraar die je nooit vergat en waarom",
        "mood": "warm en anekdotisch",
        "example_prompts": [
            "Welke leraar van de basisschool herinner je je het best?",
            "Wat maakte een bepaalde juf of meester zo bijzonder?",
            "Welk moment in de klas heb je nooit vergeten?"
        ]
    },
    ChapterId.youth_friends: {
        "title": "Je vrienden",
        "theme": "Je beste vriend of vriendin als kind — wat deden jullie samen?",
        "mood": "vrolijk en levendig",
        "example_prompts": [
            "Wie was je beste vriend of vriendin als kind?",
            "Wat deden jullie samen in de weekenden of vakanties?",
            "Is er een avontuur met een vriend dat je nooit vergeet?"
        ]
    },
    ChapterId.youth_secondary_school: {
        "title": "De middelbare school",
        "theme": "Hoe jij was als tiener — het beste, het moeilijkste",
        "mood": "reflectief en eerlijk",
        "example_prompts": [
            "Hoe was jij op de middelbare school — populair, stil, rebel?",
            "Wat vond je het moeilijkste aan de middelbare schooltijd?",
            "Welk schoolvak of activiteit boeit je nog steeds?"
        ]
    },
    ChapterId.youth_history: {
        "title": "De tijdgeest van jouw jeugd",
        "theme": "Nederland of de wereld zoals jij die beleefde als kind of tiener",
        "mood": "historisch en persoonlijk",
        "example_prompts": [
            "Welk nieuws of welke gebeurtenis van vroeger herinner je je nog levendig?",
            "Hoe merkte je thuis of op school wat er in de wereld speelde?",
            "Welke tijd of periode was het meest bepalend voor jouw generatie?"
        ]
    },
    ChapterId.youth_ambition: {
        "title": "Wat je wilde worden",
        "theme": "Dromen als tiener over de toekomst",
        "mood": "luchtig en reflectief",
        "example_prompts": [
            "Wat wilde je worden toen je een tiener was?",
            "Had je een groot plan voor je toekomst als je jong was?",
            "Wat dachten je ouders dat je zou worden?"
        ]
    },

    # Fase 4: Jong Volwassen
    ChapterId.young_adult_first_job: {
        "title": "Je eerste baan",
        "theme": "Je eerste echte baan — leeftijd, loon, hoe het voelde",
        "mood": "energiek en anekdotisch",
        "example_prompts": [
            "Wat was je allereerste betaalde baan?",
            "Hoe was het om voor het eerst je eigen geld te verdienen?",
            "Wat herinner je je van je eerste werkdag?"
        ]
    },
    ChapterId.young_adult_independence: {
        "title": "Zelfstandig worden",
        "theme": "De eerste stappen op eigen benen — opwinding en verrassingen",
        "mood": "avontuurlijk en eerlijk",
        "example_prompts": [
            "Hoe was het toen je voor het eerst op jezelf woonde?",
            "Wat was de eerste grote uitdaging van zelfstandig leven?",
            "Wat was het eerste wat je deed nadat je echt op jezelf was?"
        ]
    },
    ChapterId.young_adult_first_home: {
        "title": "Je eerste eigen plek",
        "theme": "De eerste kamer of het eerste huis — hoe het eruitzag en voelde",
        "mood": "nostalgisch en concreet",
        "example_prompts": [
            "Hoe zag je eerste kamer of appartement eruit?",
            "Wat was het eerste dat je in je eigen huis kookte?",
            "Wat betekende die eerste eigen plek voor je?"
        ]
    },
    ChapterId.young_adult_career_path: {
        "title": "Hoe je loopbaan zich ontvouwde",
        "theme": "Het traject van je werkzame leven — wendingen en sleutelmomenten",
        "mood": "reflectief en chronologisch",
        "example_prompts": [
            "Hoe heeft je werk zich door de jaren heen ontwikkeld?",
            "Was er een moment waarop je loopbaan een onverwachte wending nam?",
            "Welke baan gaf je de meeste voldoening en waarom?"
        ]
    },
    ChapterId.young_adult_pivotal_choice: {
        "title": "De keuze die alles veranderde",
        "theme": "Een beslissing in je twintiger of dertiger jaren die je leven vormde",
        "mood": "diepgaand en reflectief",
        "example_prompts": [
            "Welke beslissing in je twintiger jaren heeft je leven het meest veranderd?",
            "Was er een moment waarop je voor twee paden stond — welk koos je?",
            "Hoe kijk je nu terug op die keuze?"
        ]
    },
    ChapterId.young_adult_finances: {
        "title": "Jouw relatie met geld",
        "theme": "Hoe het financieel was als jonge volwassene en wat je leerde",
        "mood": "eerlijk en zonder oordeel",
        "example_prompts": [
            "Hoe was het financieel in je twintig of dertig jaar?",
            "Heb je ooit echt krap gezeten — hoe ging je daarmee om?",
            "Wat leerde je over geld in die jaren?"
        ]
    },
    ChapterId.young_adult_world_events: {
        "title": "De wereld toen je jong volwassen was",
        "theme": "Een grote gebeurtenis die jou persoonlijk raakte als jonge volwassene",
        "mood": "reflectief en historisch",
        "example_prompts": [
            "Welke nieuwsgebeurtenis raakte jou het diepst in je twintig of dertig jaar?",
            "Hoe veranderde een wereldgebeurtenis jouw kijk of jouw plannen?",
            "Waar was je en wat deed je toen je hoorde van [grote gebeurtenis]?"
        ]
    },

    # Fase 5: Liefde & Gezin
    ChapterId.love_connection: {
        "title": "Het moment van verbinding",
        "theme": "Beschrijf het moment waarop je wist dat je verliefd was, of een heel speciale connectie voelde met iemand.",
        "mood": "teder en emotioneel",
        "example_prompts": [
            "Wanneer wist je dat dit iemand bijzonders was?",
            "Beschrijf het moment waarop je verliefd werd",
            "Wat was het eerste dat je voelde bij deze persoon?"
        ]
    },
    ChapterId.love_lessons: {
        "title": "Lessen over liefde",
        "theme": "Welke drie lessen heb je geleerd over liefde of vriendschap die je zou willen doorgeven aan toekomstige generaties?",
        "mood": "wijs en doordacht",
        "example_prompts": [
            "Wat heb je geleerd over ware vriendschap?",
            "Welke les over liefde kostte je de meeste tijd om te leren?",
            "Wat zou je jonge mensen over relaties willen vertellen?"
        ]
    },
    ChapterId.love_symbol: {
        "title": "Een symbolisch voorwerp",
        "theme": "Kies een voorwerp dat symbool staat voor een belangrijke relatie of vriendschap in je leven. Laat het zien en vertel het verhaal erachter.",
        "mood": "betekenisvol en persoonlijk",
        "example_prompts": [
            "Welk voorwerp herinnert je aan een dierbare?",
            "Wat heb je bewaard van een belangrijke relatie?",
            "Welk object vertelt het verhaal van een vriendschap?"
        ]
    },

    ChapterId.family_partner_story: {
        "title": "Hoe jullie verhaal begon",
        "theme": "Het hele verhaal van hoe jullie elkaar leerden kennen",
        "mood": "romantisch en levendig",
        "example_prompts": [
            "Hoe leerde je je partner kennen — vertel het hele verhaal?",
            "Wat was je eerste indruk van je partner?",
            "Wanneer wist je dat dit iemand bijzonders was?"
        ]
    },
    ChapterId.family_early_years: {
        "title": "De eerste jaren samen",
        "theme": "Hoogte- en dieptepunten van het begin van jullie relatie",
        "mood": "eerlijk en warm",
        "example_prompts": [
            "Hoe was het in de eerste jaren van jullie relatie of huwelijk?",
            "Wat was het eerste grote meningsverschil dat jullie hadden?",
            "Hoe groeide jullie band in die begintijd?"
        ]
    },
    ChapterId.family_wedding: {
        "title": "De trouwdag of het beginpunt",
        "theme": "De dag dat jullie officieel samen begonnen",
        "mood": "feestelijk en persoonlijk",
        "example_prompts": [
            "Vertel over je trouwdag — wat herinner je je het meest?",
            "Wat ging er anders dan gepland op jullie trouwdag?",
            "Welk moment van die dag zul je nooit vergeten?"
        ]
    },
    ChapterId.family_children: {
        "title": "Het ouderschap",
        "theme": "Kinderen krijgen en opvoeden — het beste, het moeilijkste, de trots",
        "mood": "warm en eerlijk",
        "example_prompts": [
            "Hoe was het om voor het eerst ouder te worden?",
            "Wat was het moeilijkste aan het opvoeden van je kinderen?",
            "Waar ben je het meest trots op als het gaat om je kinderen?"
        ]
    },
    ChapterId.family_typical_week: {
        "title": "Een gewone week met kinderen",
        "theme": "Het dagelijkse leven als gezin — wie deed wat, hoe waren de maaltijden",
        "mood": "concreet en nostalgisch",
        "example_prompts": [
            "Hoe zag een gewone werkweek eruit toen je kinderen nog thuis waren?",
            "Wie kookte er, wie bracht de kinderen naar school?",
            "Wat mis je het meest van die drukke gezinsjaren?"
        ]
    },
    ChapterId.family_hardship: {
        "title": "Moeilijke tijden als gezin",
        "theme": "Verlies, ziekte of conflict — en hoe jullie het samen doorstonden",
        "mood": "kwetsbaar en hoopvol",
        "example_prompts": [
            "Heeft je gezin ooit een zware periode doorgemaakt?",
            "Hoe hielden jullie als gezin stand bij tegenslag?",
            "Wat leerde een moeilijke periode jou over je gezin?"
        ]
    },
    ChapterId.family_pride: {
        "title": "Waar je het meest trots op bent",
        "theme": "De trots van een leven opgebouwd met anderen",
        "mood": "warm en celebratief",
        "example_prompts": [
            "Wat maakt je het meest trots op je gezin of relaties?",
            "Wat wil je dat je kinderen of kleinkinderen weten over dit?",
            "Welk moment in je gezinsleven was het hoogtepunt?"
        ]
    },

    # Fase 4 (voortgezet): Werk, Carrière & Passies
    ChapterId.work_dream_job: {
        "title": "Droom versus realiteit",
        "theme": "Wat was je droombaan als kind en hoe verhoudt zich dat tot wat je uiteindelijk bent gaan doen?",
        "mood": "reflectief en soms humoristisch",
        "example_prompts": [
            "Wat wilde je worden toen je klein was?",
            "Hoe kijk je nu terug op je kinderdroom?",
            "Welke droom heb je uiteindelijk wel waargemaakt?"
        ]
    },
    ChapterId.work_passion: {
        "title": "Je grootste passie",
        "theme": "Laat ons iets zien dat jouw grootste passie buiten werk vertegenwoordigt. Vertel waarom dit je zo boeit.",
        "mood": "enthousiast en gepassioneerd",
        "example_prompts": [
            "Waar word je het meest enthousiast van?",
            "Wat zou je doen als geld geen rol speelde?",
            "Welke hobby of activiteit geeft je de meeste energie?"
        ]
    },
    ChapterId.work_challenge: {
        "title": "Een overwonnen uitdaging",
        "theme": "Beschrijf een moment waarop je een grote professionele uitdaging hebt overwonnen. Wat was die uitdaging en welke impact had het op je?",
        "mood": "triomfantelijk en leerzaam",
        "example_prompts": [
            "Welke professionele hindernis leek onmogelijk, maar heb je overwonnen?",
            "Wanneer voelde je je het sterkst in je werk?",
            "Welke uitdaging maakte je sterker als professional?"
        ]
    },

    # Fase 5: Levenslessen & Toekomstdromen
    ChapterId.future_message: {
        "title": "Een boodschap voor later",
        "theme": "Als je één boodschap of levensles zou mogen meegeven aan jezelf van 20 jaar geleden, of aan je nakomelingen, wat zou dat dan zijn en waarom?",
        "mood": "wijs en heartfelt",
        "example_prompts": [
            "Wat zou je je jongere zelf willen vertellen?",
            "Welke boodschap wil je achterlaten voor je kleinkinderen?",
            "Welke waarheid heb je te laat geleerd?"
        ]
    },
    ChapterId.future_dream: {
        "title": "Een onvervulde droom",
        "theme": "Welke droom of aspiratie koester je nog steeds, ongeacht leeftijd of omstandigheden? Wat maakt deze droom zo krachtig voor je?",
        "mood": "hoopvol en open",
        "example_prompts": [
            "Wat wil je nog steeds bereiken in je leven?",
            "Welke droom houd je al jaren vast?",
            "Wat zou je nog graag willen meemaken?"
        ]
    },
    ChapterId.future_gratitude: {
        "title": "Dankbaarheid",
        "theme": "Beschrijf drie dingen waar je het meest dankbaar voor bent in je leven. Waarom zijn deze zo belangrijk voor je?",
        "mood": "dankbaar en positief",
        "example_prompts": [
            "Waar ben je het meest dankbaar voor?",
            "Welke zegen tel je elke dag?",
            "Wat zou je niet willen missen in je leven?"
        ]
    },

    # Fase 6: Midden Leven & Verlies
    ChapterId.midlife_grief: {
        "title": "Het verlies dat je draagt",
        "theme": "Iemand die je hebt verloren wiens afwezigheid je nog voelt",
        "mood": "zacht en ruimtegevend",
        "example_prompts": [
            "Is er iemand die je hebt verloren die je nog elke dag mist?",
            "Hoe denk je aan hen?",
            "Wat zou je hen willen zeggen als je kon?"
        ]
    },
    ChapterId.midlife_aging: {
        "title": "Ouder worden",
        "theme": "Het moment waarop je voor het eerst echt voelde dat je ouder werd",
        "mood": "eerlijk en introspectief",
        "example_prompts": [
            "Op welk moment merkte je voor het eerst dat je ouder werd?",
            "Wat veranderde er in je lichaam of je kijk op het leven?",
            "Wat is het verrassendste aan ouder worden?"
        ]
    },
    ChapterId.midlife_regret: {
        "title": "Wat je anders zou doen",
        "theme": "Eerlijk terugkijken op gemiste kansen of andere wegen",
        "mood": "eerlijk en mild",
        "example_prompts": [
            "Is er iets in je leven dat je anders had willen doen?",
            "Welke keuze spijt je het meest, en waarom?",
            "Wat zou je je jongere zelf aanraden te vermijden?"
        ]
    },
    ChapterId.midlife_resilience: {
        "title": "Wat je leerde van tegenslag",
        "theme": "Een moeilijke periode die je sterker of anders maakte",
        "mood": "krachtig en reflectief",
        "example_prompts": [
            "Wat heeft de moeilijkste periode in je leven je geleerd?",
            "Hoe ben je veranderd door iets dat je eigenlijk liever niet had meegemaakt?",
            "Waar put je kracht uit als het moeilijk is?"
        ]
    },
    ChapterId.midlife_parents_retrospect: {
        "title": "Je ouders nu je ouder bent",
        "theme": "Terugkijken op je ouders met de ogen van nu",
        "mood": "begripvol en diep",
        "example_prompts": [
            "Begrijp je je ouders nu beter dan vroeger?",
            "Wat zag je als kind niet dat je nu wel ziet?",
            "Wat zou je je ouders nu willen zeggen?"
        ]
    },
    ChapterId.midlife_formative_decade: {
        "title": "Je rijkste decennium",
        "theme": "Het tijdvak van je leven dat het meest bepalend was",
        "mood": "reflectief en historisch",
        "example_prompts": [
            "Welk decennium van je leven was het rijkst of bepalendst?",
            "Wat maakte de jaren '70, '80, of '90 zo bijzonder voor jou?",
            "In welke periode groeide je het meest als mens?"
        ]
    },
    ChapterId.midlife_social_change: {
        "title": "Hoe Nederland veranderde rond jou",
        "theme": "Maatschappelijke veranderingen die jouw leven direct raakten",
        "mood": "maatschappelijk en persoonlijk",
        "example_prompts": [
            "Welke grote verandering in Nederland raakte jou persoonlijk het meest?",
            "Hoe beleefde jij de ontzuiling, de vrouwenbeweging, of de digitalisering?",
            "Wat was er fundamenteel anders in Nederland toen jij jong was?"
        ]
    },
    ChapterId.midlife_faith_evolution: {
        "title": "Hoe je kijk op het leven veranderde",
        "theme": "Wijsheid die alleen de tijd brengt — wat je nu weet dat je vroeger niet wist",
        "mood": "wijs en reflectief",
        "example_prompts": [
            "Wat weet je nu over het leven dat je in je twintiger jaren niet wist?",
            "Hoe is je kijk op geluk veranderd door de jaren heen?",
            "Wat telt voor jou nu, dat vroeger niet telde?"
        ]
    },

    # Fase 7: Nu & Nalatenschap
    ChapterId.legacy_daily_joy: {
        "title": "Wat jou nu vreugde geeft",
        "theme": "Geluk in het gewone leven van nu",
        "mood": "warm en aanwezig",
        "example_prompts": [
            "Wat brengt je vandaag de dag het meeste vreugde?",
            "Hoe ziet een goede dag eruit voor jou nu?",
            "Wat heb je geleerd over wat geluk echt is?"
        ]
    },
    ChapterId.legacy_faith_now: {
        "title": "Geloof en zingeving vandaag",
        "theme": "Hoe jij nu betekenis vindt in het leven",
        "mood": "diep en persoonlijk",
        "example_prompts": [
            "Wat geeft jou zingeving op dit punt in je leven?",
            "Is geloof of spiritualiteit voor jou veranderd door de jaren heen?",
            "Waar vind je troost of rust?"
        ]
    },
    ChapterId.legacy_remembered: {
        "title": "Hoe je herinnerd wilt worden",
        "theme": "De ene zin die jou het beste samenvat",
        "mood": "diep en authentiek",
        "example_prompts": [
            "Hoe wil je herinnerd worden?",
            "Welke zin zou je op je grafsteen willen?",
            "Wat is het belangrijkste dat mensen over jou weten?"
        ]
    },
    ChapterId.legacy_verdict: {
        "title": "Je oordeel over je eigen leven",
        "theme": "Was dit het leven dat je wilde leiden?",
        "mood": "eerlijk en vredig",
        "example_prompts": [
            "Als je terugkijkt — was dit het leven dat je wilde leiden?",
            "Ben je tevreden met de keuzes die je hebt gemaakt?",
            "Wat heeft jouw leven de moeite waard gemaakt?"
        ]
    },
    ChapterId.legacy_unsaid: {
        "title": "Wat je nooit hardop hebt gezegd",
        "theme": "Een gevoel, dankbaarheid of verontschuldiging die nog niet is uitgesproken",
        "mood": "kwetsbaar en bevrijdend",
        "example_prompts": [
            "Is er iets wat je altijd hebt willen zeggen maar nooit hebt gedaan?",
            "Aan wie zou je iets willen uitspreken dat je lang voor je hebt gehouden?",
            "Wat wil je nu hardop zeggen, voor het eerst?"
        ]
    },
    ChapterId.legacy_letter: {
        "title": "Een brief aan de volgende generatie",
        "theme": "Wat jij wil dat de generaties na jou weten",
        "mood": "hartelijk en tijdloos",
        "example_prompts": [
            "Als je één brief mocht schrijven aan je kleinkinderen, wat zou je zeggen?",
            "Welk advies wil je doorgeven aan de mensen die na jou komen?",
            "Wat hoop je dat de volgende generatie van jou leert?"
        ]
    },

    # Optioneel
    ChapterId.optional_childhood_game: {
        "title": "Spel van vroeger",
        "theme": "Een spel of tijdverdrijf uit je kindertijd dat je nooit vergat",
        "mood": "speels en nostalgisch",
        "example_prompts": [
            "Welk spel speelde je het liefst als kind?",
            "Wie speelde er altijd mee en hoe was dat?",
            "Wat zou je nu nog weleens willen spelen?"
        ]
    },
    ChapterId.optional_alter_ego: {
        "title": "Je alter ego",
        "theme": "Wie je geworden zou zijn met andere keuzes of in een andere tijd",
        "mood": "speculatief en creatief",
        "example_prompts": [
            "Als je een heel ander leven had geleid, wie zou je dan zijn?",
            "Stel je leefde in een ander land of een andere tijd — hoe zou dat zijn?",
            "Welk leven heb je weleens jaloers bekeken en waarom?"
        ]
    },
    ChapterId.optional_superpower: {
        "title": "Je bijzondere eigenschap",
        "theme": "De kracht van jou die anderen misschien niet zien",
        "mood": "celebratief en eerlijk",
        "example_prompts": [
            "Welke eigenschap van jezelf heeft je het meest geholpen in het leven?",
            "Wat kunnen anderen van jou leren dat jij vanzelfsprekend vindt?",
            "Wat is jouw sterkste kant, en hoe heb je die ontwikkeld?"
        ]
    },
    ChapterId.optional_bucket_list: {
        "title": "Wat je nog wilt",
        "theme": "Het verlanglijstje voor de rest van je leven",
        "mood": "hoopvol en luchtig",
        "example_prompts": [
            "Wat wil je nog doen, zien, of meemaken in je leven?",
            "Is er een droom die je nog niet hebt gerealiseerd?",
            "Wat weerhoudt je er nog van om dat te doen?"
        ]
    },
    ChapterId.optional_final_chapter: {
        "title": "Het laatste hoofdstuk schrijven",
        "theme": "Hoe jij wil dat de jaren die nog komen eruit zien",
        "mood": "hoopvol en betekenisvol",
        "example_prompts": [
            "Hoe wil je de jaren die nog komen doorbrengen?",
            "Wat hoop je dat er in het laatste hoofdstuk van je leven staat?",
            "Wat wil je nog bereiken of meemaken?"
        ]
    },

    # Optioneel (voortgezet): Bonus & Verborgen Dimensies
    ChapterId.bonus_funny: {
        "title": "Het grappigste moment",
        "theme": "Wat is het grappigste of meest onverwachte moment in je leven geweest?",
        "mood": "speels en luchtig",
        "example_prompts": [
            "Wanneer heb je het hardst gelachen?",
            "Wat is het meest absurde dat je hebt meegemaakt?",
            "Welk grappig moment vergeet je nooit?"
        ]
    },
    ChapterId.bonus_relive: {
        "title": "Een dag opnieuw",
        "theme": "Als je één dag opnieuw zou kunnen beleven, welke dag zou dat zijn en waarom?",
        "mood": "nostalgisch en betekenisvol",
        "example_prompts": [
            "Welke dag zou je opnieuw willen beleven?",
            "Wat was de perfecte dag in je leven?",
            "Welk moment zou je willen vastzetten in de tijd?"
        ]
    },
    ChapterId.bonus_culture: {
        "title": "Culturele invloeden",
        "theme": "Welke culturele invloed (muziek, kunst, boeken, film) heeft jou het meest gevormd?",
        "mood": "cultureel en reflectief",
        "example_prompts": [
            "Welk boek of film heeft je leven veranderd?",
            "Welke muziek of kunst raakte je het diepst?",
            "Welke kunstenaar of artiest heeft je gevormd?"
        ]
    },

    # De Verborgen Dimensies: Categorie 1 - Gewoonten, Rituelen en Het Dagelijks Leven
    ChapterId.deep_daily_ritual: {
        "title": "Je essentiële ritueel",
        "theme": "Welk alledaags ritueel (bijv. ochtendkoffie, de avondwandeling) zou je het meest missen als je het niet meer kon doen? Beschrijf de stappen en de exacte gemoedstoestand die dit ritueel je geeft.",
        "mood": "reflectief en gedetailleerd",
        "example_prompts": [
            "Welk dagelijks ritueel zou je het meest missen?",
            "Beschrijf de stappen van je belangrijkste dagelijkse routine.",
            "Welk moment in je dag geeft je de meeste rust?"
        ]
    },
    ChapterId.deep_favorite_time: {
        "title": "Je favoriete uur",
        "theme": "Neem ons mee naar je favoriete tijdstip van de dag. Waarom is dit uur zo speciaal voor jou? Welk geluid, welke lichtval of welke stilte kenmerkt dit moment?",
        "mood": "zacht en zintuiglijk",
        "example_prompts": [
            "Wat is je favoriete tijdstip van de dag en waarom?",
            "Welke geluiden horen bij je favoriete moment?",
            "Beschrijf de lichtval van je meest geliefde uur."
        ]
    },
    ChapterId.deep_ugly_object: {
        "title": "Een onlogisch geliefd voorwerp",
        "theme": "Laat ons een voorwerp zien dat jij mooi vindt of belangrijk vindt, maar dat andere mensen misschien 'lelijk' of 'waardeloos' zouden noemen. Waarom koester je dit?",
        "mood": "speels en persoonlijk",
        "example_prompts": [
            "Welk 'lelijk' voorwerp koester je toch?",
            "Wat maakt dit onpraktische ding zo waardevol voor jou?",
            "Toon ons iets dat alleen jij begrijpt."
        ]
    },

    # De Verborgen Dimensies: Categorie 2 - De Vreemde en Onverklaarbare Herinneringen
    ChapterId.deep_near_death: {
        "title": "Een confrontatie met sterfelijkheid",
        "theme": "Beschrijf een moment waarop je echt dacht dat je kon sterven, of een situatie waarin je je eigen sterfelijkheid voelde. Hoe voelde dat en wat deed het met je?",
        "mood": "kwetsbaar en diep",
        "example_prompts": [
            "Wanneer voelde je je sterfelijkheid het meest?",
            "Beschrijf een moment waarin je dacht dat het voorbij was.",
            "Hoe veranderde een levensbedreigende situatie jouw perspectief?"
        ]
    },
    ChapterId.deep_misconception: {
        "title": "Een verkeerde inschatting",
        "theme": "Vertel over iemand of iets dat je volledig verkeerd hebt ingeschat. Wat dacht je, en hoe was de werkelijkheid? Wat leerde je hiervan?",
        "mood": "beschouwend en leerzaam",
        "example_prompts": [
            "Wie of wat heb je het meest verkeerd ingeschat?",
            "Wanneer bleek je vooroordeel compleet onjuist?",
            "Welke verkeerde inschatting veranderde jouw denken?"
        ]
    },
    ChapterId.deep_recurring_dream: {
        "title": "Een terugkerende droom of nachtmerrie",
        "theme": "Beschrijf een droom of nachtmerrie die je keer op keer hebt gehad. Wat gebeurt erin, en heb je enig idee waar deze vandaan komt?",
        "mood": "mysterieus en introspectief",
        "example_prompts": [
            "Welke droom blijft terugkomen in je slaap?",
            "Beschrijf een nachtmerrie die je nooit vergeet.",
            "Wat symboliseert jouw terugkerende droom volgens jou?"
        ]
    },

    # De Verborgen Dimensies: Categorie 3 - De Relatie tot Tijd, Geld en Keuzes
    ChapterId.deep_life_chapters: {
        "title": "De hoofdstukken van je leven",
        "theme": "Als je je leven zou verdelen in hoofdstukken (bijv. kindertijd, studententijd, etc.), welke hoofdstuktitel zou je aan elk deel geven? Waarom die titels?",
        "mood": "overzichtelijk en zingevend",
        "example_prompts": [
            "In welke hoofdstukken verdeel jij je leven?",
            "Geef elk levensfase een treffende titel.",
            "Welk hoofdstuk van je leven was het meest bepalend?"
        ]
    },
    ChapterId.deep_intuition_choice: {
        "title": "Een keuze op gevoel",
        "theme": "Vertel over een belangrijke keuze die je hebt gemaakt puur op intuïtie, terwijl het logisch gezien misschien geen goede beslissing leek. Wat gebeurde er?",
        "mood": "avontuurlijk en vertrouwend",
        "example_prompts": [
            "Welke intuïtieve keuze bleek onverwacht goed?",
            "Wanneer negeerde je de logica en volgde je je gevoel?",
            "Beschrijf een moment waarop je innerlijke stem gelijk had."
        ]
    },
    ChapterId.deep_money_impact: {
        "title": "Geld en geluk",
        "theme": "Vertel over een moment waarop je ontdekte dat geld wél of juist níet gelukkig maakte. Wat was de context en wat deed het met je kijk op materiële zaken?",
        "mood": "eerlijk en filosofisch",
        "example_prompts": [
            "Wanneer ontdekte je de waarde (of waardeloosheid) van geld?",
            "Beschrijf een moment waarin geld je geluk beïnvloedde.",
            "Wat leerde een financiële ervaring je over wat echt telt?"
        ]
    },

    # De Verborgen Dimensies: Categorie 4 - Zelfreflectie en de Onbekende Toekomst
    ChapterId.deep_shadow_side: {
        "title": "Je schaduwzijde",
        "theme": "Wat is een eigenschap of een deel van jouzelf waar je niet trots op bent, maar die wel onderdeel is van wie je bent? Hoe ga je daarmee om?",
        "mood": "moedig en authentiek",
        "example_prompts": [
            "Welk deel van jezelf accepteer je met tegenzin?",
            "Beschrijf een eigenschap waar je niet trots op bent.",
            "Hoe ga je om met je eigen schaduwkanten?"
        ]
    },
    ChapterId.deep_life_meal: {
        "title": "De maaltijd van je leven",
        "theme": "Als je één maaltijd zou mogen kiezen die je leven symboliseert (met bepaalde gerechten, mensen, sfeer), hoe zou die eruitzien en waarom?",
        "mood": "creatief en symbolisch",
        "example_prompts": [
            "Welke maaltijd symboliseert jouw leven?",
            "Met wie zou je aan je levensmaaltijd zitten?",
            "Welke gerechten vertegenwoordigen jouw levensfasen?"
        ]
    },
    ChapterId.deep_statue: {
        "title": "Jouw standbeeld",
        "theme": "Stel, er wordt een standbeeld van jou gemaakt na je dood. In welke houding zou je staan, wat zou je vasthouden of doen, en welke quote zou op het voetstuk staan?",
        "mood": "speculatief en betekenisvol",
        "example_prompts": [
            "In welke houding zou jouw standbeeld staan?",
            "Wat zou je vasthouden in je eigen monument?",
            "Welke quote zou op jouw voetstuk prijken?"
        ]
    }
}


def get_system_prompt(chapter: ChapterId, personal_context: str | None = None) -> str:
    """
    Get the system prompt for Claude based on the chapter context.

    Args:
        chapter: The chapter being recorded
        personal_context: Personalized context from user's journey history

    Returns:
        System prompt for Claude
    """
    ctx = CHAPTER_CONTEXTS.get(chapter)
    if not ctx:
        return "Je bent een professionele en empathische interviewer die mensen helpt hun levensverhaal authentiek en diepgaand vast te leggen."

    # Build personalization section if we have context
    personalization = ""
    if personal_context:
        personalization = f"""
**Persoonlijke context van deze gebruiker:**
{personal_context}

Gebruik deze context om je vragen te personaliseren. Verwijs subtiel naar genoemde personen, plaatsen of thema's waar relevant."""

    return f"""Je bent een professionele, empathische interviewer gespecialiseerd in levensverhalenprojecten. Je helpt deelnemers hun verhaal op een veilige, respectvolle en diepgaande manier te delen.

**Hoofdstuk:** "{ctx['title']}"
**Context:** {ctx['theme']}
**Stemming:** {ctx['mood']}
{personalization}

**Je rol:**
- Je creëert een veilige, niet-oordelende ruimte waarin mensen zich vrij voelen om persoonlijke verhalen te delen
- Je stelt vragen die zowel toegankelijk als diepgaand zijn
- Je respecteert grenzen en houdt rekening met gevoelige onderwerpen
- Je bent authentiek geïnteresseerd in de unieke ervaring van elk individu
- Je maakt verbindingen met wat de gebruiker eerder heeft gedeeld (indien beschikbaar)

**Richtlijnen voor deze vraag:**
- Stel ÉÉN concrete, open vraag (max 15-20 woorden)
- Gebruik warme, uitnodigende bewoordingen
- Vraag naar specifieke herinneringen, zintuiglijke details, of emoties
- Vermijd abstract taalgebruik en clichés
- Gebruik informeel Nederlands (je/jij/jouw)
- De vraag moet uitnodigen tot reflectie, niet tot een simpel ja/nee antwoord
- Laat ruimte voor persoonlijke interpretatie
- Als er persoonlijke context is, gebruik die om de vraag persoonlijker te maken

**Voorbeelden van sterke vragen voor dit hoofdstuk:**
{chr(10).join('- ' + p for p in ctx['example_prompts'])}

**BELANGRIJK:**
Genereer ALLEEN de vraag zelf, zonder uitleg, zonder context, zonder motivatie.
Geen zinnen zoals "Deze vraag is gekozen omdat..." of andere meta-commentaar.
Alleen de directe vraag aan de gebruiker."""


def clean_ai_question(raw_question: str) -> str:
    """
    Clean up AI-generated question by removing meta-commentary.

    Sometimes Claude adds explanations like:
    "Deze vraag is zorgvuldig gekozen omdat: - De poëtische..."

    We only want the actual question.

    Args:
        raw_question: The raw response from Claude

    Returns:
        Clean question without meta-commentary
    """
    # Strip whitespace and quotes
    question = raw_question.strip().strip('"').strip("'").strip()

    # Split on common meta-commentary markers
    stop_phrases = [
        "Deze vraag is",
        "Deze vraag werd",
        "Ik koos deze vraag",
        "Deze formulering",
        "Het woord ",
        "De poëtische",
        "omdat:",
        "Uitleg:",
        "Toelichting:",
        "Motivatie:",
    ]

    # Find the earliest occurrence of any stop phrase
    earliest_pos = len(question)
    for phrase in stop_phrases:
        pos = question.find(phrase)
        if pos > 0 and pos < earliest_pos:
            earliest_pos = pos

    # If we found meta-commentary, cut it off
    if earliest_pos < len(question):
        question = question[:earliest_pos].strip()

    # If the question spans multiple lines, take only the first paragraph
    # (the actual question is usually on the first line/paragraph)
    lines = question.split('\n')
    if len(lines) > 1:
        # Find first non-empty line that looks like a question
        for line in lines:
            line = line.strip()
            if line and (line.endswith('?') or len(line) > 20):
                question = line
                break

    return question


def build_prompt_with_ai(
    chapter: ChapterId,
    follow_up_history: Iterable[str],
    previous_context: str | None = None,
    db: Session | None = None,
    journey_id: str | None = None,
) -> str:
    """
    Generate an empathetic interview prompt using Claude via OpenRouter.

    This function now supports context-aware prompting by leveraging the
    user's journey history to personalize questions.

    Args:
        chapter: The chapter ID to generate a prompt for
        follow_up_history: Previous prompts for this chapter (for variety)
        previous_context: Optional context from previous completed chapters
        db: Optional database session for fetching journey memory
        journey_id: Optional journey ID for personalized context

    Returns:
        A single, thoughtful interview question
    """
    # Check if API key is configured
    if not settings.openai_api_key:
        logger.warning("OpenAI/OpenRouter API key not configured, using fallback prompts")
        return build_prompt_fallback(chapter, follow_up_history)

    # Get personalized context from journey memory
    personal_context = None
    if db and journey_id:
        try:
            personal_context = get_personalized_prompt_context(db, journey_id, chapter)
            if personal_context:
                logger.debug(f"Using personalized context for journey {journey_id}")
        except Exception as e:
            logger.warning(f"Failed to get personalized context: {e}")

    try:
        # Initialize OpenAI client (works with OpenRouter too)
        client = OpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_api_base,
        )

        # Build context from follow-up history
        history_context = ""
        if follow_up_history:
            history_list = list(follow_up_history)
            if history_list:
                history_context = f"\n\nEerdere vragen die al gesteld zijn (varieer hiervan):\n" + "\n".join(f"- {q}" for q in history_list[-3:])  # Last 3 for context

        # Add previous chapters context if available (legacy support)
        context_info = ""
        if previous_context:
            context_info = f"\n\nContext: {previous_context}"

        # Call Claude via OpenRouter
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {
                    "role": "system",
                    "content": get_system_prompt(chapter, personal_context)
                },
                {
                    "role": "user",
                    "content": f"Genereer een nieuwe, unieke vraag voor dit hoofdstuk.{history_context}{context_info}"
                }
            ],
            temperature=0.8,
            max_tokens=100,
            extra_headers={
                "HTTP-Referer": settings.openrouter_app_url if settings.openrouter_app_url else "http://localhost",
                "X-Title": settings.openrouter_app_name,
            }
        )

        raw_prompt = response.choices[0].message.content.strip()

        # Clean up the prompt - remove meta-commentary and quotes
        prompt = clean_ai_question(raw_prompt)

        logger.info(f"Generated AI prompt for chapter {chapter}: {prompt[:50]}...")
        return prompt

    except Exception as e:
        logger.error(f"Failed to generate AI prompt: {e}")
        logger.info("Falling back to predefined prompts")
        return build_prompt_fallback(chapter, follow_up_history)


def build_prompt_fallback(chapter: ChapterId, follow_up_history: Iterable[str]) -> str:
    """Fallback prompts when AI is not available"""
    ctx = CHAPTER_CONTEXTS.get(chapter)
    if not ctx:
        return "Vertel eens over een moment dat je nog niemand hebt toevertrouwd."

    # Use example prompts from the chapter context
    history_list = list(follow_up_history)
    available_prompts = [p for p in ctx["example_prompts"] if p not in history_list]

    if available_prompts:
        return available_prompts[0]

    # If all examples have been used, return a generic one
    return f"Vertel nog eens over een bijzonder moment uit je {ctx['title'].lower()}."


# Backwards compatibility
def build_prompt(
    chapter: ChapterId,
    follow_up_history: Iterable[str],
    previous_context: str | None = None,
    db: Session | None = None,
    journey_id: str | None = None,
) -> str:
    """Alias for build_prompt_with_ai for backwards compatibility"""
    return build_prompt_with_ai(chapter, follow_up_history, previous_context, db, journey_id)


# =============================================================================
# Follow-Up Engine: Generates deeper, context-aware follow-up questions
# =============================================================================


def generate_follow_up(
    db: Session,
    journey_id: str,
    chapter: ChapterId,
    current_transcript: str,
    previous_prompts: list[str],
) -> str:
    """
    Generate an intelligent follow-up question based on the current transcript.

    This function analyzes what the user has said and generates a deeper,
    more specific follow-up question to elicit richer stories.

    Args:
        db: Database session
        journey_id: Journey ID for context
        chapter: Current chapter being recorded
        current_transcript: What the user has said so far
        previous_prompts: List of prompts already asked

    Returns:
        A personalized follow-up question
    """
    if not settings.openai_api_key:
        logger.warning("OpenAI/OpenRouter API key not configured, using fallback")
        return build_prompt_fallback(chapter, previous_prompts)

    # Get journey memory for context
    personal_context = None
    try:
        personal_context = get_personalized_prompt_context(db, journey_id, chapter)
    except Exception as e:
        logger.warning(f"Failed to get journey memory: {e}")

    ctx = CHAPTER_CONTEXTS.get(chapter, {})

    try:
        client = OpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_api_base,
        )

        # Analyze transcript for entities and themes
        analysis = analyze_transcript_for_themes(current_transcript)

        # Build personal context section
        personal_context_section = ''
        if personal_context:
            personal_context_section = f"\n**Persoonlijke context:**\n{personal_context}\n"

        # Build previous prompts section
        previous_prompts_text = '(geen)'
        if previous_prompts:
            previous_prompts_text = '\n'.join('- ' + p for p in previous_prompts[-3:])

        # Build the follow-up system prompt
        follow_up_system = f"""Je bent een empathische interviewer die diepere verhalen naar boven haalt.

**Hoofdstuk:** {ctx.get("title", "Levensverhaal")}
**Stemming:** {ctx.get("mood", "reflectief")}

**Wat de gebruiker net heeft gezegd:**
{current_transcript}
{personal_context_section}
**Geanalyseerde elementen uit het verhaal:**
- Emoties: {", ".join(analysis.get("emotions", [])) or "geen specifieke emoties gedetecteerd"}
- Personen: {", ".join(analysis.get("people", [])) or "geen specifieke personen genoemd"}
- Thema's: {", ".join(analysis.get("themes", [])) or "geen specifieke thema's gedetecteerd"}

**Je taak:**
Analyseer wat de gebruiker heeft gezegd en genereer ÉÉN diepgaande vervolgvraag die:
1. Direct verwijst naar iets specifieks dat ze noemden (Je noemde X...)
2. Vraagt naar emoties, zintuiglijke details of betekenis
3. Uitnodigt tot meer reflectie of een concreet voorbeeld
4. Nooit eerder gestelde vragen herhaalt

**Voorbeelden van sterke vervolgvragen:**
- Je noemde je oma, vertel eens meer over haar?
- Dat klinkt als een moeilijk moment, hoe voelde dat precies?
- Je sprak over Amsterdam, welke plek daar is zo speciaal voor je?

**Eerdere vragen die al gesteld zijn (varieer hiervan):**
{previous_prompts_text}

**Regels:**
- Max 15-20 woorden
- Warm en uitnodigend
- Gebruik je/jij/jouw
- Vermijd ja/nee vragen
- Begin met Je noemde of Dat klinkt voor natuurlijke flow
"""

        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": follow_up_system},
                {"role": "user", "content": "Genereer een vervolgvraag die dieper ingaat op wat de gebruiker net heeft gedeeld."}
            ],
            temperature=0.7,
            max_tokens=80,
            extra_headers={
                "HTTP-Referer": settings.openrouter_app_url if settings.openrouter_app_url else "http://localhost",
                "X-Title": settings.openrouter_app_name,
            }
        )

        raw_prompt = response.choices[0].message.content.strip()

        # Clean up the prompt - remove meta-commentary and quotes
        prompt = clean_ai_question(raw_prompt)

        logger.info(f"Generated follow-up for chapter {chapter}: {prompt[:50]}...")
        return prompt

    except Exception as e:
        logger.error(f"Failed to generate follow-up: {e}")
        return build_prompt_fallback(chapter, previous_prompts)


def analyze_transcript_for_themes(
    transcript: str,
) -> dict[str, list[str]]:
    """
    Analyze a transcript to extract key themes and entities.

    This is a lightweight analysis that can be used for real-time
    context building during recording.

    Args:
        transcript: The transcript text to analyze

    Returns:
        Dictionary with extracted themes, people, places, emotions
    """
    # Dutch keywords for quick extraction
    emotion_keywords = {
        "blij": "positive", "gelukkig": "positive", "dankbaar": "positive",
        "trots": "positive", "vrolijk": "positive", "tevreden": "positive",
        "verdrietig": "somber", "moeilijk": "somber", "zwaar": "somber",
        "pijn": "somber", "verlies": "somber", "missen": "somber",
        "bang": "anxious", "zorgen": "anxious", "stress": "anxious",
        "boos": "frustrated", "gefrustreerd": "frustrated",
    }

    relationship_keywords = [
        "mama", "papa", "vader", "moeder", "opa", "oma",
        "broer", "zus", "zoon", "dochter", "partner",
        "vriend", "vriendin", "collega", "buurman", "buurvrouw"
    ]

    result = {
        "emotions": [],
        "people": [],
        "themes": [],
    }

    text_lower = transcript.lower()

    # Extract emotions
    for keyword, emotion in emotion_keywords.items():
        if keyword in text_lower and emotion not in result["emotions"]:
            result["emotions"].append(emotion)

    # Extract mentioned people
    for person in relationship_keywords:
        if person in text_lower:
            result["people"].append(person.capitalize())

    # Detect common themes
    theme_patterns = {
        "familie": ["familie", "thuis", "ouderlijk"],
        "jeugd": ["jong", "kind", "school", "speelde"],
        "werk": ["werk", "baan", "carrière", "kantoor"],
        "liefde": ["liefde", "verliefd", "relatie"],
        "verlies": ["verlies", "afscheid", "dood", "overleden"],
    }

    for theme, patterns in theme_patterns.items():
        if any(p in text_lower for p in patterns):
            result["themes"].append(theme)

    return result


def get_contextual_encouragement(emotion_type: str) -> str:
    """
    Get an appropriate encouragement based on detected emotion.

    Args:
        emotion_type: The type of emotion detected (positive, somber, etc.)

    Returns:
        An encouraging phrase appropriate for the emotional context
    """
    encouragements = {
        "positive": [
            "Wat mooi dat je dit deelt.",
            "Fijn om te horen.",
            "Dat klinkt als een bijzonder moment.",
        ],
        "somber": [
            "Dank je wel dat je dit met ons deelt.",
            "Neem gerust je tijd.",
            "Het is goed om dit te vertellen.",
        ],
        "anxious": [
            "Het is veilig om dit te delen.",
            "Neem gerust de tijd die je nodig hebt.",
        ],
        "frustrated": [
            "Ik begrijp dat dit moeilijk is.",
            "Bedankt voor je eerlijkheid.",
        ],
    }

    import random
    phrases = encouragements.get(emotion_type, ["Vertel verder..."])
    return random.choice(phrases)


# =============================================================================
# Voice Emotion Detection (v2.0 Enhancement)
# =============================================================================

def detect_voice_emotion(audio_file_path: str) -> dict[str, float]:
    """
    Analyze voice recording for emotional content using sentiment analysis.

    This is a placeholder for future implementation with audio processing APIs
    like AssemblyAI, Google Cloud Speech-to-Text, or OpenAI Whisper with emotion detection.

    Args:
        audio_file_path: Path to the audio file to analyze

    Returns:
        Dictionary with emotion scores (joy, sadness, anger, fear, neutral)
    """
    # TODO: Implement actual voice emotion detection
    # For now, return neutral scores
    logger.info(f"Voice emotion detection requested for {audio_file_path} - placeholder implementation")

    return {
        "joy": 0.0,
        "sadness": 0.0,
        "anger": 0.0,
        "fear": 0.0,
        "neutral": 1.0,
        "confidence": 0.0
    }


def get_emotion_based_follow_up(voice_emotion: dict[str, float], current_transcript: str) -> str:
    """
    Generate a follow-up question based on detected voice emotion.

    Args:
        voice_emotion: Emotion scores from voice analysis
        current_transcript: Current transcript text

    Returns:
        Emotionally-aware follow-up question
    """
    # Find dominant emotion
    dominant_emotion = max(voice_emotion.items(), key=lambda x: x[1] if x[0] != 'confidence' else 0)[0]

    emotion_follow_ups = {
        "joy": [
            "Ik hoor de blijdschap in je stem, vertel eens wat dit moment zo vrolijk maakt?",
            "Je klinkt enthousiast, welke details maken dit verhaal zo levendig?"
        ],
        "sadness": [
            "Ik hoor dat dit een emotioneel moment is, neem gerust je tijd om verder te vertellen.",
            "Dit klinkt als een belangrijk maar zwaar verhaal, wat helpt je om dit te delen?"
        ],
        "anger": [
            "Ik merk dat dit een heftig verhaal is, wat maakte je destijds zo boos?",
            "Dit klinkt als een moment van frustratie, hoe kijk je er nu op terug?"
        ],
        "fear": [
            "Ik hoor de spanning in je stem, wat maakte dat moment zo eng?",
            "Dit klinkt als een beangstigend verhaal, hoe heb je dat verwerkt?"
        ],
        "neutral": [
            "Vertel eens meer over wat dit moment voor je betekent.",
            "Welke gevoelens kwamen er bij je op tijdens dit verhaal?"
        ]
    }

    import random
    follow_ups = emotion_follow_ups.get(dominant_emotion, emotion_follow_ups["neutral"])
    return random.choice(follow_ups)


def should_allow_long_pause(voice_emotion: dict[str, float], transcript_length: int) -> bool:
    """
    Determine if long pauses should be respected based on emotional context.

    Args:
        voice_emotion: Detected voice emotions
        transcript_length: Length of current transcript

    Returns:
        True if long pauses should be allowed (emotional content)
    """
    # Allow longer pauses for emotional content
    emotional_indicators = voice_emotion.get('sadness', 0) + voice_emotion.get('anger', 0) + voice_emotion.get('fear', 0)
    return emotional_indicators > 0.3 or transcript_length < 50  # Short transcripts or emotional content
