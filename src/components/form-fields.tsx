export function Input({
  label,
  name,
  type = "text",
  required = true
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="text-white/80">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl border border-white/20 bg-black/50 px-4 py-3 outline-none transition focus:border-gold"
      />
    </label>
  );
}

export function TextArea({ label, name }: { label: string; name: string }) {
  return (
    <label className="space-y-2 text-sm">
      <span className="text-white/80">{label}</span>
      <textarea
        name={name}
        rows={4}
        className="w-full rounded-xl border border-white/20 bg-black/50 px-4 py-3 outline-none transition focus:border-gold"
      />
    </label>
  );
}
