import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { JourneyExperience } from "@/components/journey/journey-experience";
import { ProtectedRoute } from "@/components/protected-route";
import { redirect } from "next/navigation";

// Redirect from /journey to /chapters for a cleaner URL structure
export default function JourneyPage() {
  redirect('/chapters');
}
