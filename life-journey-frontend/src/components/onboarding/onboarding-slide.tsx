import type { OnboardingSlide } from "./onboarding-data";

interface OnboardingSlideProps {
  slide: OnboardingSlide;
  isActive: boolean;
}

export function OnboardingSlideComponent({ slide, isActive }: OnboardingSlideProps) {
  const Icon = slide.icon;

  return (
    <div className="flex min-w-0 flex-[0_0_100%] flex-col items-center justify-center px-8 py-12">
      {/* Icon */}
      <div className={`mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-orange/10 transition-all duration-300 ${isActive ? "scale-100 opacity-100" : "scale-90 opacity-50"}`}>
        <Icon className="h-10 w-10 text-orange" />
      </div>

      {/* Title */}
      <h2 className={`mb-4 text-center text-3xl font-serif font-semibold text-slate-900 transition-all duration-500 ${isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
        {slide.title}
      </h2>

      {/* Description */}
      <div className={`mb-6 max-w-md space-y-2 transition-all duration-500 delay-100 ${isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
        {slide.description.map((line, index) => (
          <p key={index} className="text-center text-lg text-slate-700 leading-relaxed">
            {line}
          </p>
        ))}
      </div>

      {/* Highlight */}
      {slide.highlight && (
        <div className={`rounded-xl bg-orange/10 px-6 py-3 mb-4 transition-all duration-500 delay-200 ${isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          <p className="text-center text-sm font-medium text-orange">
            {slide.highlight}
          </p>
        </div>
      )}

      {/* Tip */}
      {slide.tip && (
        <div className={`rounded-xl border border-slate-200 bg-slate-50 px-6 py-3 transition-all duration-500 delay-200 ${isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          <p className="text-center text-sm text-slate-600">
            💡 {slide.tip}
          </p>
        </div>
      )}
    </div>
  );
}
