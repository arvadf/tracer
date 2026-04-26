interface TextAreaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  rows?: number;
  hint?: string;
}

export default function TextArea({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  rows = 4,
  hint,
}: TextAreaProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1">
        {label}
        {required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-2.5 text-sm border rounded-lg transition-colors resize-y
          ${error
            ? "border-danger-500 focus:border-danger-500"
            : "border-neutral-300 focus:border-primary-500"
          }
          bg-white focus:outline-none focus:ring-0
          placeholder:text-neutral-400`}
      />
      {hint && !error && (
        <p className="mt-1 text-xs text-neutral-400">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-danger-500">{error}</p>
      )}
    </div>
  );
}
