interface RadioGroupProps {
  id: string;
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  error?: string;
  required?: boolean;
}

export default function RadioGroup({
  id,
  label,
  value,
  onChange,
  error,
  required = false,
}: RadioGroupProps) {
  return (
    <div>
      <span className="block text-sm font-medium text-neutral-700 mb-2">
        {label}
        {required && <span className="text-danger-500 ml-0.5">*</span>}
      </span>
      <div className="flex gap-6">
        <label
          htmlFor={`${id}-ya`}
          className={`flex items-center gap-2 cursor-pointer text-sm px-4 py-2 rounded-lg border transition-colors
            ${value === true
              ? "border-primary-500 bg-primary-50 text-primary-700 font-medium"
              : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
            }`}
        >
          <input
            type="radio"
            id={`${id}-ya`}
            name={id}
            checked={value === true}
            onChange={() => onChange(true)}
            className="sr-only"
          />
          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
            ${value === true ? "border-primary-500" : "border-neutral-300"}`}>
            {value === true && <span className="w-2 h-2 rounded-full bg-primary-500" />}
          </span>
          Ya
        </label>

        <label
          htmlFor={`${id}-tidak`}
          className={`flex items-center gap-2 cursor-pointer text-sm px-4 py-2 rounded-lg border transition-colors
            ${value === false
              ? "border-primary-500 bg-primary-50 text-primary-700 font-medium"
              : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
            }`}
        >
          <input
            type="radio"
            id={`${id}-tidak`}
            name={id}
            checked={value === false}
            onChange={() => onChange(false)}
            className="sr-only"
          />
          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
            ${value === false ? "border-primary-500" : "border-neutral-300"}`}>
            {value === false && <span className="w-2 h-2 rounded-full bg-primary-500" />}
          </span>
          Tidak
        </label>
      </div>
      {error && (
        <p className="mt-1 text-xs text-danger-500">{error}</p>
      )}
    </div>
  );
}
