interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export default function SectionHeading({
  title,
  subtitle,
  centered = false,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`mb-6 sm:mb-8 ${centered ? "text-center" : ""} ${className}`}>
      <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1.5 text-sm sm:text-base text-neutral-500 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
