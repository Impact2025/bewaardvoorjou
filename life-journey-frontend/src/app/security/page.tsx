import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const safeguards = [
  {
    title: "Encryptie & sleutelbeheer",
    items: [
      "TLS 1.3 tussen client en server",
      "AES-256 opslag met per-gebruiker sleutel",
      "KMS + hardware-security-modules voor sleutelrotatie",
      "Optionele client-side E2EE voor gevoelige hoofdstukken",
    ],
  },
  {
    title: "Toegangscontrole",
    items: [
      "Role-based access control (owner, trustee, viewer)",
      "Magic link + passkey (WebAuthn) ondersteuning",
      "Device binding en short-lived tokens",
      "Audit-log van logins en exports",
    ],
  },
  {
    title: "Beveiligingsprocessen",
    items: [
      "Threat modelling op elke release",
      "Pen-tests en verwerkerscontracten jaarlijks",
      "Rate limiting en misbruikdetectie",
      "Automatische logging van delen en nalatenschapsacties",
    ],
  },
];

export default function SecurityPage() {
  return (
    <AppShell
      title="Veiligheidsmaatregelen"
      description="Je verhaal verdient klasse-best beveiliging: dit is onze stack."
      activeHref="/security"
    >
      <div className="space-y-8">
        {safeguards.map((section) => (
          <Card key={section.title} className="bg-gradient-to-br from-warm-sand/15 via-cream to-warm-sand/10 border-warm-sand/30">
            <CardHeader>
              <CardTitle className="text-slate-800">{section.title}</CardTitle>
              <CardDescription className="text-slate-600">
                {section.title === "Encryptie & sleutelbeheer"
                  ? "We scheiden encryptiesleutels van contentopslag en bieden optionele E2EE."
                  : section.title === "Toegangscontrole"
                    ? "Alle acties zijn gekoppeld aan identiteit en apparaatautorisatie."
                    : "Procesmatig geborgd met onafhankelijke audits en logging."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-warm-sand/40 bg-white/80 px-4 py-3 text-slate-700"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
