import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function SurveySelesaiPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 sm:py-24">
        <div className="max-w-md mx-auto px-4 text-center">
          {/* Success icon */}
          <div className="w-16 h-16 rounded-full bg-secondary-50 border-2 border-secondary-200 flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-8 h-8 text-secondary-600" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 mb-2">
            Survey Berhasil Dikirim
          </h1>

          <p className="text-sm text-neutral-500 leading-relaxed mb-6">
            Terima kasih telah mengisi survey tracer study PTI UMS.
            Jawaban Anda sangat berharga untuk pengembangan program studi.
          </p>

          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-neutral-600 leading-relaxed">
              <strong>Info:</strong> Anda dapat mengubah jawaban kapan saja
              dengan kembali ke halaman utama, mencari nama Anda kembali, lalu
              memilih &ldquo;Edit Jawaban&rdquo;.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
