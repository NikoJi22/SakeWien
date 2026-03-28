type PageHeaderProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
};

export function PageHeader({ title, subtitle, eyebrow = "SAKE · Vienna" }: PageHeaderProps) {
  return (
    <header className="border-b border-white/[0.06] bg-gradient-to-b from-black/40 to-transparent">
      <div className="mx-auto max-w-[min(100%,1200px)] px-4 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-gold/90">{eyebrow}</p>
        <h1 className="font-serif text-[clamp(1.75rem,4vw,2.75rem)] font-light leading-tight tracking-[0.06em] text-[#ebe3d6]">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">{subtitle}</p>
      </div>
    </header>
  );
}
