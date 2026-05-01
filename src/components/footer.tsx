export function Footer() {
  const orderUrl = "https://sake-vienna.at/order-online";
  return (
    <footer className="border-t border-brand-line bg-brand-card py-12 text-center text-sm text-brand-body shadow-[0_-1px_0_rgba(31,35,38,0.04)]">
      <p className="font-serif text-base tracking-[0.2em] text-brand-ink">SAKE Vienna</p>
      <p className="mt-5 text-sm text-brand-body">Kaiserstraße 81 1070 Wien · +4315223551</p>
      <div className="mt-5 flex flex-col items-center gap-2">
        <a href={orderUrl} className="text-xs text-brand-subtle hover:underline">{orderUrl}</a>
      </div>
    </footer>
  );
}
