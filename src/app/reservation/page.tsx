"use client";

import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { ReservationForm } from "@/components/reservation-form";
import { useLanguage } from "@/context/language-context";

export default function ReservationPage() {
  const { t } = useLanguage();

  return (
    <div>
      <PageHeader title={t.page.reservationTitle} subtitle={t.page.reservationText} />
      <PageShell>
        <ReservationForm />
      </PageShell>
    </div>
  );
}
