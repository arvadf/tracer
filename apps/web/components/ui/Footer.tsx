import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-200 py-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-sm text-neutral-600">
          Copyright &copy; {currentYear}{" "}
          <Link
            href="https://www.ums.ac.id"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#155d9b] hover:underline"
          >
            Universitas Muhammadiyah Surakarta
          </Link>
        </p>
      </div>
    </footer>
  );
}
