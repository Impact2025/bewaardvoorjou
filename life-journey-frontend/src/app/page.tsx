"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Video,
  Mic,
  FileText,
  Shield,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Clock,
  Lock,
  Menu,
  X,
  MessageCircle,
  Upload,
  Share2
} from "lucide-react";

export default function Home() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && session) {
      router.replace("/dashboard");
    }
  }, [session, isLoading, router]);

  if (isLoading || session) {
    return null;
  }

  const features = [
    {
      icon: <MessageCircle className="h-8 w-8 text-orange" />,
      title: "AI-begeleide interviews",
      description: "Een warme AI-interviewer stelt precies de juiste vragen op het juiste moment"
    },
    {
      icon: <Upload className="h-8 w-8 text-orange" />,
      title: "Jouw manier van vertellen",
      description: "Kies vrijelijk tussen video, audio of tekst per herinnering"
    },
    {
      icon: <Shield className="h-8 w-8 text-orange" />,
      title: "100% veilig & privé",
      description: "Jouw verhalen zijn versleuteld opgeslagen. Alleen jij bepaalt wie toegang krijgt"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Maak een account",
      description: "Gratis registreren duurt minder dan een minuut"
    },
    {
      step: "2",
      title: "Begin met vertellen",
      description: "Onze AI-interviewer begeleidt je door 30 hoofdstukken van je leven"
    },
    {
      step: "3",
      title: "Deel wanneer jij wilt",
      description: "Bewaar voor jezelf of deel met familie. Jij hebt de controle"
    }
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation Header */}
      <header className="border-b border-neutral-sand bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/Logo_Bewaardvoorjou.png"
              alt="BewaardVoorJou.nl Logo"
              width={40}
              height={40}
              className="w-10 h-10"
              priority
            />
            <div className="flex flex-col">
              <span className="text-xl font-serif font-semibold text-slate-900 leading-tight">
                BewaardVoorJou.nl
              </span>
              <span className="text-xs text-slate-600 hidden sm:block">
                Vertel het vandaag, bewaar het voor altijd
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-700">
            <Link href="#features" className="hover:text-orange transition-colors font-medium">
              Hoe werkt het
            </Link>
            <Link href="#trust" className="hover:text-orange transition-colors font-medium">
              Veiligheid
            </Link>
            <Link href="/faq" className="hover:text-orange transition-colors font-medium">
              Veelgestelde vragen
            </Link>
            <Link href="/login" className="hover:text-orange transition-colors font-medium">
              Inloggen
            </Link>
            <Button asChild className="bg-orange hover:bg-orange/90 text-white shadow-md">
              <Link href="/register">Start Gratis</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-700 hover:text-orange transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-sand bg-white">
            <nav className="px-4 py-4 space-y-3">
              <Link
                href="#features"
                className="block px-4 py-2 text-slate-700 hover:bg-orange/5 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Hoe werkt het
              </Link>
              <Link
                href="#trust"
                className="block px-4 py-2 text-slate-700 hover:bg-orange/5 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Veiligheid
              </Link>
              <Link
                href="/faq"
                className="block px-4 py-2 text-slate-700 hover:bg-orange/5 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Veelgestelde vragen
              </Link>
              <Link
                href="/login"
                className="block px-4 py-2 text-slate-700 hover:bg-orange/5 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inloggen
              </Link>
              <Button asChild className="w-full bg-orange hover:bg-orange/90 text-white">
                <Link href="/register">Start Gratis</Link>
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="/Header-Image-min.png"
            alt="BewaardVoorJou.nl - Jouw levensverhaal"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          {/* Sophisticated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/70 to-slate-900/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full py-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/20 backdrop-blur-md border border-orange/30 text-white text-sm font-medium mb-8 shadow-xl">
              <Sparkles className="h-4 w-4 text-orange-light" />
              <span>Nieuw: Bewaar je levensverhaal met AI-hulp</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white leading-tight mb-6 drop-shadow-2xl">
              Vertel het vandaag,
              <span className="text-orange block mt-2">bewaar het</span>
              <span className="block mt-2">voor altijd</span>
            </h1>

            {/* Slogan & Description */}
            <p className="text-xl md:text-2xl text-white/95 leading-relaxed mb-4 drop-shadow-lg font-light">
              Jouw levensverhaal verdient een thuis. Een veilige plek waar herinneringen voor altijd bewaard blijven.
            </p>

            <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-10 drop-shadow-lg">
              BewaardVoorJou.nl helpt je om jouw verhaal vast te leggen met warme AI-begeleiding.
              Voor jezelf, voor je familie, voor de volgende generatie.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                asChild
                size="lg"
                className="bg-orange hover:bg-orange/90 text-white text-lg px-10 py-7 rounded-xl shadow-2xl hover:shadow-orange/50 transition-all duration-300 hover:scale-105 font-semibold"
              >
                <Link href="/register" className="inline-flex items-center">
                  Start gratis <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-lg px-10 py-7 rounded-xl border-2 border-white/40 hover:border-white/60 transition-all duration-300"
              >
                <Link href="#features">
                  Hoe werkt het?
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium drop-shadow text-sm sm:text-base">Gratis starten</span>
              </div>
              <div className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium drop-shadow text-sm sm:text-base">Nederlandse service</span>
              </div>
              <div className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium drop-shadow text-sm sm:text-base">GDPR veilig</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-slate-900 mb-4">
              Jouw verhaal, op jouw manier
            </h2>
            <p className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto">
              BewaardVoorJou.nl maakt het vastleggen van je levensverhaal eenvoudig en persoonlijk
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-cream via-white to-warm-sand/10 border-2 border-neutral-sand hover:border-orange/30 hover:shadow-2xl transition-all duration-300 group"
              >
                <CardContent className="p-8 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange/10 mb-6 group-hover:bg-orange/20 group-hover:scale-110 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Video/Audio/Text Icons */}
          <div className="bg-gradient-to-br from-orange/5 to-gold/5 rounded-2xl p-8 md:p-12 border border-orange/20">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-serif font-semibold text-slate-900 mb-3">
                Kies hoe je vertelt
              </h3>
              <p className="text-slate-700 text-lg">
                Elk moment verdient zijn eigen vorm
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <Video className="h-10 w-10 text-orange mx-auto mb-3" />
                <h4 className="font-semibold text-slate-900 mb-2">Video</h4>
                <p className="text-sm text-slate-600">Perfect voor persoonlijke boodschappen</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <Mic className="h-10 w-10 text-orange mx-auto mb-3" />
                <h4 className="font-semibold text-slate-900 mb-2">Audio</h4>
                <p className="text-sm text-slate-600">Bewaar je stem voor altijd</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <FileText className="h-10 w-10 text-orange mx-auto mb-3" />
                <h4 className="font-semibold text-slate-900 mb-2">Tekst</h4>
                <p className="text-sm text-slate-600">Schrijf je herinneringen op</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-cream via-white to-warm-sand/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-slate-900 mb-4">
              Zo werkt het
            </h2>
            <p className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto">
              In drie eenvoudige stappen bewaar je jouw levensverhaal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                {/* Connecting line (desktop only) */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-orange to-orange/20" />
                )}

                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-neutral-sand">
                  <div className="absolute -top-6 left-8 h-12 w-12 rounded-full bg-gradient-to-br from-orange to-gold flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {item.step}
                  </div>
                  <div className="mt-6">
                    <h3 className="text-xl font-serif font-semibold text-slate-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-orange hover:bg-orange/90 text-white text-lg px-10 py-6">
              <Link href="/register">
                Begin nu gratis <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section id="trust" className="py-20 px-4 sm:px-6 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-slate-900 mb-4">
              Jouw verhaal, veilig bewaard
            </h2>
            <p className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto">
              Privacy en veiligheid staan bij ons centraal
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-neutral-sand hover:border-green-500/30 transition-colors">
              <CardContent className="p-8">
                <Shield className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-serif font-semibold text-slate-900 mb-3">
                  Bank-niveau versleuteling
                </h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Alle verhalen worden versleuteld opgeslagen. Niemand kan ze lezen zonder jouw toestemming.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>End-to-end versleuteling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Veilige Nederlandse servers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>GDPR-compliant</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-neutral-sand hover:border-blue-500/30 transition-colors">
              <CardContent className="p-8">
                <Lock className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-serif font-semibold text-slate-900 mb-3">
                  Jij hebt de controle
                </h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Bepaal zelf wie toegang krijgt tot jouw verhalen en wanneer.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Deel selectief met familie</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Tijdgestuurde vrijgave mogelijk</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Altijd je eigen data exporteren</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <Heart className="h-12 w-12 text-orange mx-auto mb-4" />
              <h3 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
                Gemaakt in Nederland, met zorg
              </h3>
              <p className="text-lg text-white/90 leading-relaxed">
                BewaardVoorJou.nl is ontwikkeld met respect voor jouw privacy en Nederlandse waarden.
                Geen grote tech-bedrijven, geen verrassingen. Gewoon een veilige plek voor jouw verhaal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-orange via-orange-dark to-gold text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 leading-tight">
            Begin vandaag met jouw levensverhaal
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-95 leading-relaxed">
            Elke dag dat je wacht, is een herinnering die vervaagt.
            <span className="block mt-2 font-semibold">Start vandaag, gratis.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              asChild
              size="lg"
              className="bg-white text-orange hover:bg-neutral-light text-lg px-10 py-7 shadow-2xl font-semibold"
            >
              <Link href="/register">
                Start gratis <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <p className="text-sm opacity-90 mb-12">
            Geen creditcard nodig • Altijd opzegbaar • 100% GDPR veilig
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 pt-12 border-t border-white/20">
            <div className="flex items-center gap-2 text-sm opacity-95">
              <Shield className="h-5 w-5" />
              <span>Nederlandse servers</span>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-95">
              <Lock className="h-5 w-5" />
              <span>AVG-compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-95">
              <Heart className="h-5 w-5" />
              <span>Met zorg gemaakt</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-sand bg-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/Logo_Bewaardvoorjou.png"
                  alt="BewaardVoorJou.nl"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <div className="flex flex-col">
                  <span className="font-serif font-semibold text-slate-900">BewaardVoorJou.nl</span>
                  <span className="text-xs text-slate-600">Vertel het vandaag,<br/>bewaar het voor altijd</span>
                </div>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="#features" className="hover:text-orange transition-colors">Hoe werkt het</Link></li>
                <li><Link href="#trust" className="hover:text-orange transition-colors">Veiligheid</Link></li>
                <li><Link href="/register" className="hover:text-orange transition-colors">Gratis starten</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="mailto:info@bewaardvoorjou.nl" className="hover:text-orange transition-colors">Contact</a></li>
                <li><Link href="#features" className="hover:text-orange transition-colors">Veelgestelde vragen</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Juridisch</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/privacy" className="hover:text-orange transition-colors">Privacybeleid</Link></li>
                <li><Link href="/terms" className="hover:text-orange transition-colors">Algemene voorwaarden</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-sand text-center text-sm text-slate-600">
            <p>&copy; {new Date().getFullYear()} BewaardVoorJou.nl. Met liefde gemaakt in Nederland.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
