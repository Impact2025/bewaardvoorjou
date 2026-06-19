import { BabyThemeProvider } from "@/components/baby/BabyThemeContext";

export default function BabyLayout({ children }: { children: React.ReactNode }) {
  return <BabyThemeProvider>{children}</BabyThemeProvider>;
}
