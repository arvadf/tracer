interface InputFieldProps {
  id: string;
  label: string;
  type?: "text" | "number" | "tel";
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
}

export default function InputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  hint,
}: InputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1">
        {label}
        {required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2.5 text-sm border rounded-lg transition-colors
          ${error
            ? "border-danger-500 focus:border-danger-500"
            : "border-neutral-300 focus:border-primary-500"
          }
          ${disabled ? "bg-neutral-100 text-neutral-500 cursor-not-allowed" : "bg-white"}
          focus:outline-none focus:ring-0
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
