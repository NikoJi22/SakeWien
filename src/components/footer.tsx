import Image from "next/image";

export function Footer() {
  const orderUrl = "https://sake-vienna.at/order-online";
  return (
    <footer className="border-t border-[#eeeeee] bg-white py-12 text-center text-sm text-brand-body shadow-[0_-1px_0_rgba(0,0,0,0.03)]">
      <p className="font-serif text-base tracking-[0.2em] text-brand-ink">SAKE Vienna</p>
      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-brand-subtle">Premium Japanese Restaurant</p>
      <p className="mt-5 text-sm text-brand-body">Kärntner Ring 24, 1010 Wien · +43 1 234 56 78</p>
      <div className="mt-5 flex justify-center gap-4 text-sm">
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Instagram</a>
        <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:underline">TikTok</a>
        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Facebook</a>
      </div>
      <div className="mt-5 flex flex-col items-center gap-2">
        <Image src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(orderUrl)}`} alt="QR Code Bestellseite" width={120} height={120} className="rounded-md border border-[#eee]" />
        <a href={orderUrl} className="text-xs text-brand-subtle hover:underline">{orderUrl}</a>
      </div>
    </footer>
  );
}
