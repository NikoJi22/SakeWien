type PageHeaderProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  variant?: "dark" | "light";
};

export function PageHeader({ title, subtitle, eyebrow = "SAKE · Vienna", variant = "light" }: PageHeaderProps) {
  const isLight = variant === "light";
  return (
    <header
      className={
        isLight
          ? "border-b border-brand-primary/15 bg-brand-card shadow-[0_1px_0_rgba(70,95,107,0.06)]"
          : "border-b border-white/[0.06] bg-gradient-to-b from-black/40 to-transparent"
      }
    >
      <div className="mx-auto max-w-[min(100%,1520px)] px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <p
          className={`mb-3 text-[10px] font-semibold uppercase tracking-[0.35em] ${isLight ? "text-brand-accent" : "text-gold/90"}`}
        >
          {eyebrow}
        </p>
        <h1
          className={`font-serif text-[clamp(1.75rem,4vw,2.75rem)] font-light leading-tight tracking-[0.06em] ${isLight ? "text-brand-ink" : "text-[#ebe3d6]"}`}
        >
          {title}
        </h1>
        <p
          className={`mt-5 max-w-2xl text-sm leading-relaxed sm:text-base ${isLight ? "text-brand-body" : "text-white/55"}`}
        >
          {subtitle}
        </p>
      </div>
    </header>
  );
}
