import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Sake Vienna",
  robots: { index: false, follow: false }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#060606] text-white antialiased">{children}</div>;
}
