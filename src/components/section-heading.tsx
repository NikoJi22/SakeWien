export function SectionHeading({ title, text, className = "" }: { title: string; text: string; className?: string }) {
  return (
    <div className={`mb-10 space-y-4 ${className}`}>
      <h2 className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] font-light tracking-[0.06em] text-brand-ink">{title}</h2>
      <p className="max-w-2xl text-sm leading-relaxed text-brand-body sm:text-base">{text}</p>
    </div>
  );
}
