import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  Video, 
  Type, 
  Users, 
  Lock, 
  Heart, 
  Star,
  BookOpen,
  Share2,
  Gift,
  CheckCircle,
  ArrowRight,
  Mail,
  Globe,
  MapPin,
  Instagram,
  Linkedin,
  Facebook,
  Mic
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const features = [
    {
      icon: <Heart className="h-8 w-8 text-warm-amber" />,
      title: "Herinneringen die blijven leven",
      description: "Vertel over je jeugd, liefde, werk en dromen. Je AI-interviewer helpt je stap voor stap."
    },
    {
      icon: <Lock className="h-8 w-8 text-warm-amber" />,
      title: "Volledig privé en veilig",
      description: "Jij bepaalt wie je verhaal mag zien. Alles wordt versleuteld en veilig opgeslagen."
    },
    {
      icon: <Video className="h-8 w-8 text-warm-amber" />,
      title: "In eigen woorden, stem en beeld",
      description: "Kies of je je verhaal schrijft, inspreekt of filmt. Alles wordt bewaard in jouw persoonlijke tijdscapsule."
    },
    {
      icon: <Gift className="h-8 w-8 text-warm-amber" />,
      title: "Een cadeau voor later",
      description: "Je levensverhaal wordt een erfstuk — een schatkist vol herinneringen voor je nabestaanden."
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Schrijf je in",
      description: "Maak een account aan en kies hoe je jouw verhaal wilt vertellen: tekst, audio of video."
    },
    {
      step: "2",
      title: "Vertel aan je AI-interviewer",
      description: "Je persoonlijke AI-assistent stelt vragen over jouw leven — alsof je in een interview zit."
    },
    {
      step: "3",
      title: "Bewaar & deel",
      description: "Kijk terug, bewerk, en deel jouw MyStoryBox met wie je wilt. Nu of later."
    }
  ];

  const testimonials = [
    {
      quote: "Alsof ik een gesprek had met mezelf, maar dan door mijn ogen van nu. Mijn kleinkinderen zullen me echt leren kennen.",
      author: "Annie, 72 jaar"
    },
    {
      quote: "Het voelde veilig, warm en waardevol. Ik wist niet dat ik zóveel herinneringen had.",
      author: "Sander, 46 jaar"
    }
  ];

  const missionPoints = [
    "We geloven dat ieders verhaal het waard is om verteld te worden.",
    "MyStoryBox is ontstaan uit de wens om herinneringen te bewaren — niet alleen in foto's, maar in woorden, stemmen en emoties.",
    "Iedereen heeft een uniek levensverhaal. Maar te vaak verdwijnt dat verhaal met de tijd.",
    "Met MyStoryBox maak je jouw herinneringen tastbaar — voor jezelf, en voor de mensen die na je komen."
  ];

  const experiencePoints = [
    "Alsof je in een tv-interview zit, tegenover iemand die écht luistert.",
    "Je AI-interviewer stelt warme, natuurlijke vragen, die helpen herinneringen tot leven te brengen."
  ];

  const steps = [
    {
      title: "Vertel",
      description: "Je logt in op MyStoryBox en wordt ontvangen door jouw persoonlijke AI-interviewer. Hij/zij stelt vragen zoals: Waar ben je geboren? Wat zijn je drie favoriete nummers — en waarom? Wat is het grappigste moment in je leven geweest? Welke levensles wil je doorgeven?",
      subPoints: [
        "🎙️ Audio",
        "🎥 Video", 
        "✍️ Tekst"
      ]
    },
    {
      title: "Beleef",
      description: "Het voelt alsof je in je eigen tv-studio zit. Je ziet jezelf in beeld, praat met je interviewer en bouwt stukje bij beetje jouw digitale biografie op."
    },
    {
      title: "Bewaar",
      description: "Alle sessies worden veilig opgeslagen in jouw persoonlijke MyStoryBox. Je kunt alles terugkijken, bewerken of downloaden."
    },
    {
      title: "Deel",
      description: "Bepaal zelf wie toegang krijgt:",
      subPoints: [
        "Alleen jij",
        "Familie of vrienden",
        "Of automatisch na jouw overlijden (via 'Erfgoedmodus')"
      ]
    }
  ];

  const securityFeatures = [
    "Gegevens worden versleuteld (AES-256) opgeslagen.",
    "Wij verkopen geen data, nooit.",
    "Je bepaalt zelf wat er bewaard, gedeeld of verwijderd wordt.",
    "AVG / GDPR-proof - MyStoryBox voldoet aan alle Europese privacywetgeving.",
    "Je kunt op elk moment je gegevens downloaden of verwijderen.",
    "Wil je dat je verhalen pas na je overlijden worden vrijgegeven? Kies voor de Erfgoedmodus: je aangewezen contactpersoon krijgt toegang als jij er niet meer bent."
  ];

  const pricingPlans = [
    {
      name: "Gratis account",
      price: "€0 / maand",
      features: [
        "5 verhalensessies",
        "Tekst of audio",
        "Onbeperkt terugkijken"
      ],
      popular: false
    },
    {
      name: "Premium",
      price: "€9,99 / maand",
      features: [
        "Onbeperkt sessies",
        "Video-opnames",
        "Persoonlijke AI-interviewer (stem & avatar)",
        "Download als boek of film"
      ],
      popular: true
    },
    {
      name: "Family Box",
      price: "€14,99 / maand",
      features: [
        "Tot 5 familieleden",
        "Gezamenlijke herinneringsruimte",
        "Toegang na overlijden"
      ],
      popular: false
    }
  ];

  const organizationBenefits = [
    "Professionele beheleiding via AI-interviewer",
    "Volledig veilig en AVG-conform",
    "Eenvoudig beheer via organisatieportaal"
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-slate-900 mb-6">
            Waarom MyStoryBox?
          </h1>
          <p className="text-xl text-slate-700 mb-12 max-w-3xl mx-auto">
            Jouw leven. Jouw verhaal. Voor altijd. ✨
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="bg-cream border-neutral-sand text-center h-full">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-700 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Button asChild className="bg-warm-amber hover:bg-warm-amber/90 text-slate-900 px-8 py-3 text-lg">
            <Link href="/register">
              Vertel jouw eerste verhaal <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-cream border-t border-neutral-sand">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-serif font-semibold text-center text-slate-900 mb-12">
            Zo werkt het
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-warm-amber/10 flex items-center justify-center text-warm-amber font-bold text-xl mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-serif font-semibold text-slate-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-700">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-cream">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-serif font-semibold text-center text-slate-900 mb-12">
            Wat mensen zeggen
          </h2>
          
          <div className="space-y-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-cream border-neutral-sand">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <Star className="h-5 w-5 text-amber-400 fill-current" />
                    <Star className="h-5 w-5 text-amber-400 fill-current" />
                    <Star className="h-5 w-5 text-amber-400 fill-current" />
                    <Star className="h-5 w-5 text-amber-400 fill-current" />
                    <Star className="h-5 w-5 text-amber-400 fill-current" />
                  </div>
                  <p className="text-lg text-slate-700 italic mb-4">
                    "{testimonial.quote}"
                  </p>
                  <p className="text-slate-600 font-medium">
                    — {testimonial.author}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Card className="bg-cream border-neutral-sand max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-2xl font-serif font-semibold text-slate-900 mb-3">
                  Laat jouw verhaal niet verloren gaan.
                </h3>
                <p className="text-slate-700 mb-6">
                  Start vandaag en geef je levensverhaal een thuis.
                </p>
                <Button asChild className="bg-warm-amber hover:bg-warm-amber/90 text-slate-900">
                  <Link href="/register">
                    Begin gratis
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-cream border-t border-neutral-sand">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-serif font-semibold text-slate-900 mb-6">
                📖 Over MyStoryBox
              </h2>
              <h3 className="text-xl font-serif font-semibold text-slate-900 mb-4">
                Onze missie
              </h3>
              <ul className="space-y-3 mb-8">
                {missionPoints.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-warm-amber mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{point}</span>
                  </li>
                ))}
              </ul>
              
              <h3 className="text-xl font-serif font-semibold text-slate-900 mb-4">
                Het gevoel
              </h3>
              <ul className="space-y-3">
                {experiencePoints.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-warm-amber mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{point}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 p-4 bg-warm-amber/10 rounded-lg border border-warm-amber/20">
                <p className="text-lg font-serif font-semibold text-slate-900 text-center">
                  ✨ Jouw leven. Jouw verhaal. Voor altijd.
                </p>
              </div>
            </div>
            
            <div className="bg-cream border border-neutral-sand rounded-2xl p-8">
              <div className="aspect-video bg-neutral-sand rounded-xl flex items-center justify-center mb-6">
                <div className="text-center">
                  <Video className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500">MyStoryBox Demo</p>
                </div>
              </div>
              <h3 className="text-xl font-serif font-semibold text-slate-900 mb-4">
                🧠 Hoe het werkt
              </h3>
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={index} className="flex">
                    <div className="mr-4">
                      <div className="w-8 h-8 rounded-full bg-warm-amber/10 flex items-center justify-center text-warm-amber font-bold text-sm">
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">{step.title}</h4>
                      <p className="text-slate-700 text-sm mb-2">{step.description}</p>
                      {step.subPoints && (
                        <ul className="text-slate-600 text-sm space-y-1">
                          {step.subPoints.map((subPoint, subIndex) => (
                            <li key={subIndex} className="flex items-center">
                              <span className="mr-2">•</span>
                              {subPoint}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Button asChild className="w-full bg-warm-amber hover:bg-warm-amber/90 text-slate-900">
                  <Link href="/register">
                    Maak jouw Box aan
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Privacy */}
      <section className="py-16 bg-cream border-t border-neutral-sand">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-serif font-semibold text-center text-slate-900 mb-12">
            🔒 Veiligheid & Privacy
          </h2>
          
          <Card className="bg-cream border-neutral-sand">
            <CardHeader>
              <CardTitle className="text-slate-900">Jouw verhaal is van jou</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {securityFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Shield className="h-5 w-5 text-warm-amber mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-cream">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-serif font-semibold text-center text-slate-900 mb-4">
            💰 Prijzen
          </h2>
          <p className="text-center text-slate-700 mb-12">
            Kies het plan dat bij jouw verhaal past
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`bg-cream border-neutral-sand relative ${
                  plan.popular ? "border-2 border-warm-amber ring-2 ring-warm-amber/20" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-warm-amber text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                      POPULAIR
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-slate-900">{plan.name}</CardTitle>
                  <CardDescription className="text-2xl font-bold text-slate-900">
                    {plan.price}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-warm-amber mr-2 flex-shrink-0" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    asChild 
                    className={`w-full ${
                      plan.popular 
                        ? "bg-warm-amber hover:bg-warm-amber/90 text-slate-900" 
                        : "bg-soft-blue hover:bg-soft-blue/90 text-slate-900"
                    }`}
                  >
                    <Link href="/register">
                      {index === 0 ? "Start gratis" : "Kies dit plan"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Organizations */}
      <section className="py-16 bg-cream border-t border-neutral-sand">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-serif font-semibold text-center text-slate-900 mb-4">
            📦 MyStoryBox voor organisaties
          </h2>
          <p className="text-center text-slate-700 mb-12">
            Voor zorginstellingen, uitvaartondernemers en erfgoedprojecten
          </p>
          
          <Card className="bg-cream border-neutral-sand">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Voordelen:</h3>
              <ul className="space-y-3 mb-8">
                {organizationBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Users className="h-5 w-5 text-warm-amber mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <div className="text-center">
                <Button asChild className="bg-warm-amber hover:bg-warm-amber/90 text-slate-900">
                  <Link href="/contact">
                    Ontvang partnerinformatie
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-cream border-t border-neutral-sand">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-serif font-semibold text-slate-900 mb-4">
            📬 Contact
          </h2>
          <p className="text-slate-700 mb-2">
            Vragen of ideeën?
          </p>
          <p className="text-slate-700 mb-6">
            We horen graag van je.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-warm-amber mr-2" />
              <span className="text-slate-700">info@mystorybox.com</span>
            </div>
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-warm-amber mr-2" />
              <span className="text-slate-700">www.mystorybox.com</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-warm-amber mr-2" />
              <span className="text-slate-700">Nederland</span>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button variant="secondary" className="bg-soft-blue hover:bg-soft-blue/90 text-slate-900">
              <Instagram className="h-5 w-5" />
            </Button>
            <Button variant="secondary" className="bg-soft-blue hover:bg-soft-blue/90 text-slate-900">
              <Linkedin className="h-5 w-5" />
            </Button>
            <Button variant="secondary" className="bg-soft-blue hover:bg-soft-blue/90 text-slate-900">
              <Facebook className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}