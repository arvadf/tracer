import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title = "Data tidak ditemukan",
  message = "Coba gunakan kata kunci yang berbeda.",
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      {icon || (
        <MagnifyingGlassIcon className="w-10 h-10 text-neutral-300 mb-3" />
      )}
      <p className="text-sm font-medium text-neutral-600">{title}</p>
      <p className="text-xs text-neutral-400 mt-1">{message}</p>
    </div>
  );
}
