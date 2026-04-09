export function Footer() {
  const orderUrl = "https://sake-vienna.at/order-online";
  return (
    <footer className="border-t border-brand-line bg-brand-card py-12 text-center text-sm text-brand-body shadow-[0_-1px_0_rgba(31,35,38,0.04)]">
      <p className="font-serif text-base tracking-[0.2em] text-brand-ink">SAKE Vienna</p>
      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-brand-subtle">Premium Japanese Restaurant</p>
      <p className="mt-5 text-sm text-brand-body">Kärntner Ring 24, 1010 Wien · +43 1 234 56 78</p>
      <div className="mt-5 flex flex-col items-center gap-2">
        <a href={orderUrl} className="text-xs text-brand-subtle hover:underline">{orderUrl}</a>
      </div>
    </footer>
  );
}
