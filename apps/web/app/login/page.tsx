"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { api } from "@/lib/api";
import { adminApi, ApiError } from "@/lib/admin-api";
import type { ApiSuccessResponse } from "@/lib/types";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

interface GoogleLoginResponse {
  verified: boolean;
  alumni: {
    id: number;
    nama_lengkap: string;
    nim: string;
    tahun_lulus: number;
  } | null;
  survey_exists?: boolean;
  google_email?: string;
  message?: string;
}

function LoginContent() {
  const router = useRouter();
  
  // State for manual login (Admin)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  // State for Google login (Alumni)
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // State for Linking/Registering
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [googleCredential, setGoogleCredential] = useState<string>("");
  const [linkNim, setLinkNim] = useState("");

  const [linkLoading, setLinkLoading] = useState(false);

  // --- MANUAL LOGIN HANDLER (ADMIN) ---
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);
    setGoogleError(null);
    setManualLoading(true);
    
    try {
      await adminApi.login(username, password);
      router.push("/admin/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setManualError(err.message || "Username atau password salah");
      } else {
        setManualError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      }
    } finally {
      setManualLoading(false);
    }
  };

  // --- GOOGLE LOGIN HANDLER (ALUMNI) ---
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setGoogleError("Gagal mendapatkan credential dari Google");
      return;
    }

    setGoogleLoading(true);
    setGoogleError(null);
    setManualError(null);
    setSuccess(null);

    try {
      const res = await api.post<ApiSuccessResponse<GoogleLoginResponse>>(
        "/auth/google",
        { credential: credentialResponse.credential }
      );

      // We added needs_registration flag to the response for unknown emails
      const data = res.data as GoogleLoginResponse & { needs_registration?: boolean, google_email?: string };

      if (data.needs_registration) {
        setGoogleCredential(credentialResponse.credential);
        setNeedsRegistration(true);
        setGoogleError(data.message || "Email belum terdaftar. Silakan verifikasi data Anda.");
        return;
      }

      if (data.verified && data.alumni) {
        setSuccess(`Selamat datang, ${data.alumni.nama_lengkap}!`);
        setTimeout(() => {
          router.push(`/survey/${data.alumni!.id}`);
        }, 1000);
      } else {
        setGoogleError(data.message || "Akun Google tidak valid.");
      }
    } catch {
      setGoogleError("Gagal memverifikasi akun Google. Silakan coba lagi.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleError("Login Google gagal. Silakan coba lagi.");
  };

  // --- GOOGLE LINKING HANDLER (ALUMNI) ---
  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleError(null);
    setLinkLoading(true);

    try {
      const res = await api.post<ApiSuccessResponse<GoogleLoginResponse>>(
        "/auth/google/link",
        { 
          credential: googleCredential,
          nim: linkNim,
        }
      );

      if (res.data.verified && res.data.alumni) {
        setNeedsRegistration(false);
        setSuccess(`Berhasil! Selamat datang, ${res.data.alumni.nama_lengkap}!`);
        setTimeout(() => {
          router.push(`/survey/${res.data.alumni!.id}`);
        }, 1000);
      } else {
        setGoogleError(res.data.message || "Gagal memverifikasi data.");
      }
    } catch (err: any) {
      setGoogleError(err?.response?.data?.message || "NIM tidak tepat. Silakan coba lagi.");
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative bg-[#0a192f] overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle at center, #112240 0%, #0a192f 100%)'
      }}
    >
      {/* Decorative background elements to simulate the blurred building look */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[440px] bg-white rounded-[10px] shadow-2xl relative z-10 px-8 py-10">
        
        {/* UMS Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src="/ums-logo.png" 
            alt="Universitas Muhammadiyah Surakarta" 
            className="h-20 object-contain"
          />
        </div>

        {needsRegistration ? (
          <>
            <h2 className="text-[20px] text-center font-medium text-gray-900 mb-2">
              Verifikasi Data Alumni
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              Hubungkan akun Google ini dengan memasukkan data kemahasiswaan Anda.
            </p>

            {/* Error Alerts */}
            {googleError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md flex items-start gap-2">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{googleError}</span>
              </div>
            )}

            <form onSubmit={handleLinkSubmit} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
                <input
                  type="text"
                  value={linkNim}
                  onChange={(e) => setLinkNim(e.target.value)}
                  placeholder="Contoh: A710180052"
                  className="w-full px-4 py-[10px] text-[15px] border border-gray-300 rounded-[5px] text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors uppercase"
                  required
                />
              </div>
              


              <button
                type="submit"
                disabled={linkLoading || !linkNim}
                className="w-full bg-[#2f6ce6] hover:bg-[#2558c4] text-white py-[10px] rounded-[5px] text-[15px] font-medium transition-colors mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {linkLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  "Hubungkan & Lanjutkan"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setNeedsRegistration(false);
                  setGoogleError(null);
                }}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-800 mt-2"
              >
                Kembali ke Login
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Title */}
            <h2 className="text-[22px] text-center font-medium text-gray-900 mb-8">
              Sign in to your account
            </h2>

            {/* Success Alert */}
            {success && (
              <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            {/* Error Alerts */}
            {(manualError || googleError) && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md flex items-start gap-2">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{manualError || googleError}</span>
              </div>
            )}

            {/* Manual Login Form */}
            <form onSubmit={handleManualSubmit} className="space-y-4 mb-6">
              <div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="UniID/NIM (tanpa @ums.ac.id, @student.ums.ac.id)"
                  className="w-full px-4 py-[10px] text-[15px] border border-gray-300 rounded-[5px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                />
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-[10px] text-[15px] border border-gray-300 rounded-[5px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={manualLoading || !username || !password}
                className="w-full bg-[#2f6ce6] hover:bg-[#2558c4] text-white py-[10px] rounded-[5px] text-[15px] font-medium transition-colors mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {manualLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500 font-normal">Or sign in with</span>
              </div>
            </div>

            {/* Google Sign-in */}
            <div className="flex justify-center">
              {googleLoading ? (
                <div className="flex items-center justify-center py-2">
                  <svg className="w-6 h-6 animate-spin text-[#2f6ce6]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="ml-3 text-sm text-gray-600">Memverifikasi akun Google...</span>
                </div>
              ) : GOOGLE_CLIENT_ID ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="signin_with"
                  shape="rectangular"
                  size="large"
                  width="350"
                  theme="outline"
                />
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded px-4 py-3 text-sm text-amber-700 w-full text-center">
                  Google Client ID belum dikonfigurasi.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  if (!GOOGLE_CLIENT_ID) {
    return <LoginContent />;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginContent />
    </GoogleOAuthProvider>
  );
}
