import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const privacyPrinciples = [
  {
    title: "Dataminimalisatie",
    description:
      "We vragen enkel voornaam/alias, e-mail, land en geboortejaar. Verdere gegevens zijn optioneel en staan standaard uit.",
  },
  {
    title: "Opslag in de EU",
    description:
      "Alle media, transcripties en metadata blijven binnen EU-datacenters met verwerkers die een DPA ondertekenen.",
  },
  {
    title: "Encryptie by design",
    description:
      "TLS 1.3 in transit en AES-256 at rest. Per gebruiker is er een eigen encryptiesleutel via KMS.",
  },
  {
    title: "Eigen regie",
    description:
      "Download, corrigeer of verwijder je gegevens met een key-shred. Je bepaalt wie toegang krijgt en wanneer.",
  },
];

const consentScopes = [
  "Opname & opslag van audio/video",
  "AI-transcriptie en highlight-analyse",
  "Delen met vertrouwde personen",
  "Legacy-vrijgave (optioneel)",
];

export default function PrivacyPage() {
  return (
    <AppShell
      title="Privacy & rechten"
      description="Volledig GDPR-proof en ontworpen voor maximale autonomie."
      activeHref="/privacy"
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-gradient-to-br from-warm-sand/15 via-cream to-warm-sand/10 border-warm-sand/30">
          <CardHeader>
            <CardTitle className="text-slate-800">Onze leidende principes</CardTitle>
            <CardDescription className="text-slate-600">
              Alle beslissingen rondom data en AI volgen deze kaders.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            {privacyPrinciples.map((principle) => (
              <div key={principle.title} className="rounded-2xl border border-warm-sand/40 bg-white/80 p-4">
                <h3 className="text-base font-semibold text-slate-800">
                  {principle.title}
                </h3>
                <p className="mt-2 text-sm text-slate-700">{principle.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-warm-sand/15 via-cream to-warm-sand/10 border-warm-sand/30">
            <CardHeader>
              <CardTitle className="text-slate-800">Toestemmingsregister</CardTitle>
              <CardDescription className="text-slate-600">Elke toestemming is herroepbaar en gelogd met tijdstempel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {consentScopes.map((scope) => (
                <div key={scope} className="flex items-center justify-between rounded-2xl border border-warm-sand/40 bg-white/80 px-4 py-3">
                  <span className="text-slate-700">{scope}</span>
                  <span className="text-xs uppercase tracking-wide text-orange font-medium">
                    Actief
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warm-sand/15 via-cream to-warm-sand/10 border-warm-sand/30">
            <CardHeader>
              <CardTitle className="text-slate-800">Jouw rechten</CardTitle>
              <CardDescription className="text-slate-600">Direct beschikbaar in het account-dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="rounded-2xl border border-warm-sand/40 bg-white/80 px-4 py-3 text-slate-700">
                Inzage & download (JSON, MP4, PDF)
              </div>
              <div className="rounded-2xl border border-warm-sand/40 bg-white/80 px-4 py-3 text-slate-700">
                Correctie van metadata en samenvattingen
              </div>
              <div className="rounded-2xl border border-warm-sand/40 bg-white/80 px-4 py-3 text-slate-700">
                Verwijdering met sleutelvernietiging binnen 30 dagen
              </div>
              <div className="rounded-2xl border border-warm-sand/40 bg-white/80 px-4 py-3 text-slate-700">
                Dataportabiliteit naar andere diensten
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
