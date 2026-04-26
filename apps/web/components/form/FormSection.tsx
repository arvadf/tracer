interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <fieldset className="border border-neutral-200 rounded-xl p-4 sm:p-6 bg-white">
      <legend className="text-sm font-bold text-primary-600 uppercase tracking-wider px-2">
        {title}
      </legend>
      {description && (
        <p className="text-xs text-neutral-500 mb-4 -mt-1">{description}</p>
      )}
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}
