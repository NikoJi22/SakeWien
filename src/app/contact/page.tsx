"use client";

import { ContactForm } from "@/components/contact-form";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { useLanguage } from "@/context/language-context";

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <div>
      <PageHeader title={t.page.contactTitle} subtitle={t.page.contactText} />
      <PageShell>
        <ContactForm />
      </PageShell>
    </div>
  );
}
