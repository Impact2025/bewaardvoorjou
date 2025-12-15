import { BookOpen, Video, Mic, FileText, MessageSquare, Lock, CloudUpload, Sparkles } from "lucide-react";

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string[];
  icon: React.ElementType;
  illustration?: string;
  highlight?: string;
  tip?: string;
}

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: "welcome",
    title: "Welkom bij Memories",
    description: [
      "Bewaar je levensverhaal voor toekomstige generaties",
      "Een veilige plek voor je kostbaarste herinneringen"
    ],
    icon: Sparkles,
    highlight: "Laten we beginnen met een snelle rondleiding"
  },
  {
    id: "chapters",
    title: "Kies je eigen avontuur",
    description: [
      "15 hoofdstukken over verschillende levensfases",
      "Van je jeugd tot levenslessen en toekomstdromen",
      "Activeer alleen wat relevant voor jou is"
    ],
    icon: BookOpen,
    highlight: "Begin waar je wilt - elk hoofdstuk staat op zichzelf"
  },
  {
    id: "methods",
    title: "Kies hoe je wilt vastleggen",
    description: [
      "✍️ Schrijf je gedachten uit in de tekst editor",
      "🎥 Neem jezelf op camera op",
      "🎤 Spreek je verhaal in met audio"
    ],
    icon: Video,
    tip: "Tip: Combineer meerdere methoden voor een rijk verhaal!"
  },
  {
    id: "ai-interviewer",
    title: "Nooit meer een blanco pagina",
    description: [
      "Onze AI-interviewer stelt vervolgvragen",
      "Helpt je dieper na te denken over je herinneringen",
      "Perfect als je niet weet waar te beginnen"
    ],
    icon: MessageSquare,
    highlight: "De AI past zich aan jouw verhaal aan"
  },
  {
    id: "privacy",
    title: "Jouw verhaal, jouw keuze",
    description: [
      "Kies precies wie toegang krijgt tot je verhaal",
      "Deel per hoofdstuk met familie en vrienden",
      "100% versleuteld en veilig opgeslagen"
    ],
    icon: Lock,
    highlight: "Privacy staat altijd voorop"
  },
  {
    id: "autosave",
    title: "Nooit meer iets kwijt",
    description: [
      "Alles wordt automatisch opgeslagen",
      "Ook offline beschikbaar op je apparaat",
      "Je kunt altijd terugkomen waar je was"
    ],
    icon: CloudUpload,
    tip: "Neem de tijd - er is geen haast"
  },
  {
    id: "ready",
    title: "Je bent klaar om te beginnen!",
    description: [
      "Begin bij 'Kernwoorden van je leven'",
      "Of kies een ander hoofdstuk dat je aanspreekt",
      "Je kunt deze handleiding altijd opnieuw bekijken"
    ],
    icon: Sparkles,
    highlight: "Veel plezier met het vastleggen van je levensverhaal! 🎉"
  }
];
