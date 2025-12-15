import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const legacyModes = [
  {
    title: "Klassiek",
    description:
      "Vrijgave na overlijden met verificatie door een trustee en ons support-team. Documenten en 2-factor bevestiging vereist.",
  },
  {
    title: "Dead-man’s switch",
    description:
      "Je kiest een periode van inactiviteit (bijv. 90 dagen). Na herinneringen aan jou en trustees volgt automatische vrijgave.",
  },
  {
    title: "Datumcapsule",
    description:
      "Een specifieke datum waarop je verhaal open gaat, handig voor verjaardagen of jubilea.",
  },
];

const unlockSteps = [
  "Trustees ontvangen een verificatiemail",
  "Minimaal 2 van de 3 trustees bevestigen binnen 14 dagen",
  "Wij controleren overlap met jouw ingestelde policy",
  "De geselecteerde hoofdstukken worden vrijgegeven via secure download",
];

export default function LegacyPage() {
  return (
    <AppShell
      title="Legacy-kluis"
      description="Grace-periods, trustees en granulair delen. Jij houdt de regie."
      activeHref="/legacy"
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-slate-900/60">
          <CardHeader>
            <CardTitle>Beschikbare modi</CardTitle>
            <CardDescription>Kies per hoofdstuk welke modus geldt.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            {legacyModes.map((mode) => (
              <div key={mode.title} className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
                <h3 className="text-base font-semibold text-slate-100">{mode.title}</h3>
                <p className="mt-2 text-slate-400">{mode.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-slate-900/60">
            <CardHeader>
              <CardTitle>Ontgrendelingsflow</CardTitle>
              <CardDescription>Elke stap is zichtbaar in de audit-log.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal space-y-3 pl-5 text-sm text-slate-300">
                {unlockSteps.map((step) => (
                  <li key={step} className="rounded-2xl border border-slate-800/70 bg-slate-950/70 px-4 py-3">
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60">
            <CardHeader>
              <CardTitle>Granulaire keuzes</CardTitle>
              <CardDescription>Stel per hoofdstuk in of het direct, vertraagd of alleen via trustees beschikbaar wordt.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 px-4 py-3">
                Roots · Direct beschikbaar voor dochters
              </div>
              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 px-4 py-3">
                Mijlpalen · Alleen na unlock door trustees
              </div>
              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 px-4 py-3">
                Vrije boodschap · Datumcapsule op 01-01-2030
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
