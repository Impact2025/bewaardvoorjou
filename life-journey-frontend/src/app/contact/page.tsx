import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-cream py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif font-semibold text-slate-900 mb-4">
            📬 Contact
          </h1>
          <p className="text-xl text-slate-700 max-w-2xl mx-auto">
            Heb je vragen over MyStoryBox? We helpen je graag verder.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <Card className="bg-cream border-neutral-sand">
              <CardHeader>
                <CardTitle className="text-slate-900">Onze gegevens</CardTitle>
                <CardDescription>
                  Neem contact met ons op via een van onderstaande methodes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-warm-amber mr-4 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900">E-mail</h3>
                    <p className="text-slate-700">info@mystorybox.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-6 w-6 text-warm-amber mr-4 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Telefoon</h3>
                    <p className="text-slate-700">+31 (0)85 123 45 67</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-warm-amber mr-4 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Adres</h3>
                    <p className="text-slate-700">
                      MyStoryBox B.V.<br />
                      Herinneringstraat 123<br />
                      1234 AB Amsterdam<br />
                      Nederland
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-cream border-neutral-sand mt-8">
              <CardHeader>
                <CardTitle className="text-slate-900">Veelgestelde vragen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">Hoe lang duurt een verhaalsessie?</h3>
                    <p className="text-slate-700 mt-1">
                      Gemiddeld nemen mensen 20-30 minuten voor een sessie, maar je kunt zo lang doorgaan als je wilt.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Kan ik mijn verhaal bewerken?</h3>
                    <p className="text-slate-700 mt-1">
                      Ja, je kunt je verhalen altijd terugkijken, bewerken en verwijderen in je persoonlijke MyStoryBox.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Is mijn privacy gewaarborgd?</h3>
                    <p className="text-slate-700 mt-1">
                      Absoluut. Alles wat je deelt is volledig privé tenzij jij besluit het te delen.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="bg-cream border-neutral-sand">
              <CardHeader>
                <CardTitle className="text-slate-900">Stuur ons een bericht</CardTitle>
                <CardDescription>
                  Laat je gegevens achter en we nemen zo snel mogelijk contact met je op.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                      Naam
                    </label>
                    <input 
                      id="name" 
                      placeholder="Je volledige naam" 
                      className="flex h-10 w-full rounded-md border border-neutral-sand bg-cream px-3 py-2 text-sm ring-offset-cream placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                      E-mailadres
                    </label>
                    <input 
                      id="email" 
                      type="email" 
                      placeholder="jouw@email.com" 
                      className="flex h-10 w-full rounded-md border border-neutral-sand bg-cream px-3 py-2 text-sm ring-offset-cream placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                      Onderwerp
                    </label>
                    <input 
                      id="subject" 
                      placeholder="Waar kunnen we je mee helpen?" 
                      className="flex h-10 w-full rounded-md border border-neutral-sand bg-cream px-3 py-2 text-sm ring-offset-cream placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                      Bericht
                    </label>
                    <textarea 
                      id="message" 
                      placeholder="Vertel ons hoe we je kunnen helpen..." 
                      rows={5}
                      className="flex min-h-[80px] w-full rounded-md border border-neutral-sand bg-cream px-3 py-2 text-sm ring-offset-cream placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-warm-amber hover:bg-warm-amber/90 text-slate-900"
                  >
                    Verstuur bericht
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}