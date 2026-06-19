import { Suspense } from "react";
import { BabyThemeProvider } from "@/components/baby/BabyThemeContext";
import CheckoutContent from "./CheckoutContent";

export const metadata = {
  title: "Bestellen — Bewaardvoorjou",
  description: "Bestel jouw pakket en begin vandaag met het vastleggen van je levensverhaal.",
};

export default function CheckoutPage() {
  return (
    <BabyThemeProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#f8f6f2] flex items-center justify-center">
            <p className="text-[#888]">Laden...</p>
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
    </BabyThemeProvider>
  );
}
