const fieldInputClass =
  "w-full rounded-lg border border-[#ccc] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-500 focus:border-[#888] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]";

export function Input({
  label,
  name,
  type = "text",
  required = true,
  placeholder,
  hint
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  /** Optional line below the field (e.g. phone format) */
  hint?: string;
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium text-brand-ink-secondary">{label}</span>
      <input name={name} type={type} required={required} placeholder={placeholder} className={fieldInputClass} />
      {hint ? <p className="text-xs leading-relaxed text-brand-subtle">{hint}</p> : null}
    </label>
  );
}

export function TextArea({ label, name }: { label: string; name: string }) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium text-brand-ink-secondary">{label}</span>
      <textarea name={name} rows={4} className={fieldInputClass} />
    </label>
  );
}
