"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
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
  Lock
} from "lucide-react";

export default function Home() {
  const { session, isLoading } = useAuth();
  const router = useRouter();

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
      icon: <Heart className="h-8 w-8 text-orange" />,
      title: "Jouw verhaal, bewaard",
      description: "Deel je herinneringen via video, audio of tekst met AI-begeleiding"
    },
    {
      icon: <Shield className="h-8 w-8 text-orange" />,
      title: "100% privé & veilig",
      description: "Versleutelde opslag, jij bepaalt wie toegang krijgt"
    },
    {
      icon: <Sparkles className="h-8 w-8 text-orange" />,
      title: "AI-interviewer",
      description: "Warme vragen die je helpen herinneringen tot leven te brengen"
    }
  ];

  const benefits = [
    "Onbeperkt video, audio en tekst opnemen",
    "Persoonlijke AI-interviewer die warme vragen stelt",
    "18 levensfases om jouw verhaal te structureren",
    "Veilige, versleutelde opslag van al je herinneringen",
    "Deel met familie wanneer jij het wilt",
    "Download je verhaal als digitaal erfstuk"
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation Header */}
      <header className="border-b border-neutral-sand bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/heart-logo.svg"
              alt="Bewaard voor jou Logo"
              width={40}
              height={40}
              className="w-10 h-10"
              priority
            />
            <span className="text-xl font-serif font-semibold text-slate-900">
              Bewaard voor jou
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-700">
            <Link href="/about" className="hover:text-orange transition-colors">
              Over ons
            </Link>
            <Link href="/security" className="hover:text-orange transition-colors">
              Veiligheid
            </Link>
            <Link href="/login" className="hover:text-orange transition-colors">
              Inloggen
            </Link>
            <Button asChild className="btn-primary">
              <Link href="/register">Start Gratis</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="/Header-Image-min.png"
            alt="Life Journey - Bewaar je herinneringen"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          {/* Gradient Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8 shadow-lg">
              <Sparkles className="h-4 w-4 text-orange" />
              <span>Jouw levensverhaal verdient een thuis</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight mb-6 drop-shadow-2xl">
              Bewaar je
              <span className="text-orange block mt-2">herinneringen</span>
              <span className="block mt-2">voor altijd</span>
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-10 drop-shadow-lg">
              Bewaard voor jou helpt je om jouw levensverhaal vast te leggen met video, audio of tekst.
              Een AI-interviewer begeleidt je met warme vragen.
              Jouw verhaal, veilig bewaard voor de volgende generatie.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                asChild
                className="bg-orange hover:bg-orange/90 text-white text-lg px-10 py-7 rounded-xl shadow-2xl hover:shadow-orange/50 transition-all duration-300 border-2 border-orange hover:scale-105"
              >
                <Link href="/register" className="inline-flex items-center">
                  Start gratis <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
              <Button
                asChild
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-lg px-10 py-7 rounded-xl border-2 border-white/30 hover:border-white/50 transition-all duration-300"
              >
                <Link href="/about">
                  Lees meer
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium drop-shadow">Gratis starten</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium drop-shadow">Altijd opzegbaar</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium drop-shadow">GDPR-compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4">
              Waarom Bewaard voor jou?
            </h2>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto">
              Bewaar je levensverhaal op jouw manier, met de hulp van AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-cream via-white to-warm-sand/10 border border-neutral-sand hover:shadow-xl transition-all duration-300 group"
              >
                <CardContent className="p-8 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange/10 mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-700">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-cream via-white to-warm-sand/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Benefits list */}
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-6">
                Alles wat je nodig hebt om jouw verhaal te vertellen
              </h2>
              <p className="text-lg text-slate-700 mb-8">
                Met MyStoryBox krijg je alle tools om jouw levensverhaal te bewaren, van jeugdherinneringen tot levenswijsheden.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-orange flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Button asChild className="btn-primary text-lg px-8 py-6">
                  <Link href="/register">
                    Begin nu gratis <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right side - Stats cards */}
            <div className="space-y-6">
              <Card className="bg-white border border-neutral-sand shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-orange/10 flex items-center justify-center">
                      <Users className="h-7 w-7 text-orange" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">500+</p>
                      <p className="text-sm text-slate-600">Verhalen bewaard</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-neutral-sand shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-gold/10 flex items-center justify-center">
                      <Clock className="h-7 w-7 text-gold" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">10.000+</p>
                      <p className="text-sm text-slate-600">Uur aan herinneringen</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-neutral-sand shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-success-green/10 flex items-center justify-center">
                      <Star className="h-7 w-7 text-success-green" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">4.9/5</p>
                      <p className="text-sm text-slate-600">Gemiddelde waardering</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-orange via-orange-dark to-gold text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
            Begin vandaag met jouw levensverhaal
          </h2>
          <p className="text-xl mb-8 opacity-95">
            Gratis starten. Geen creditcard nodig. Altijd opzegbaar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-white text-orange hover:bg-neutral-light text-lg px-8 py-6 shadow-xl"
            >
              <Link href="/register">
                Start gratis <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
            >
              <Link href="/about">
                Leer meer
              </Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 pt-12 border-t border-white/20">
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Shield className="h-5 w-5" />
              <span>Bank-niveau versleuteling</span>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Lock className="h-5 w-5" />
              <span>GDPR compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Heart className="h-5 w-5" />
              <span>Gemaakt in Nederland</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-sand bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange to-gold flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="font-serif font-semibold text-slate-900">MyStoryBox</span>
              </div>
              <p className="text-sm text-slate-600">
                Jouw levensverhaal verdient een thuis
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/about" className="hover:text-orange transition-colors">Over ons</Link></li>
                <li><Link href="/security" className="hover:text-orange transition-colors">Veiligheid</Link></li>
                <li><Link href="/about#pricing" className="hover:text-orange transition-colors">Prijzen</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/about#contact" className="hover:text-orange transition-colors">Contact</Link></li>
                <li><Link href="/about#faq" className="hover:text-orange transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/privacy" className="hover:text-orange transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-orange transition-colors">Voorwaarden</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-sand text-center text-sm text-slate-600">
            <p>&copy; 2024 MyStoryBox. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
