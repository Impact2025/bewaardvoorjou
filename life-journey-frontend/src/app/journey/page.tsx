import { permanentRedirect } from "next/navigation";

// Permanente redirect van /journey naar /chapters voor een schonere URL-structuur.
// Bewust 308 en geen 307: het is een blijvende verhuizing, zodat Google de oude
// URL laat vallen in plaats van hem te blijven crawlen.
export default function JourneyPage() {
  permanentRedirect("/chapters");
}
