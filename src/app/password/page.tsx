"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Lock, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function PasswordPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.error || "Invalid password");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 via-purple-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Portfolio demo: floating password hint bubble */}
      <button
        type="button"
        onClick={() => {
          setPassword("inflectiv_stats26");
        }}
        className="hidden md:block absolute top-10 right-10 z-20 cursor-pointer group"
        title="Click to fill the password"
      >
        <div className="relative w-44 h-44 animate-[float_4s_ease-in-out_infinite]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-orange-400 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
          <div className="absolute inset-3 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 rounded-full shadow-2xl flex flex-col items-center justify-center text-white text-center p-4 ring-4 ring-white/30">
            <span className="text-[10px] uppercase tracking-widest opacity-80">Demo password</span>
            <span className="font-mono text-sm font-bold mt-1 break-all leading-tight">inflectiv_stats26</span>
            <span className="text-[10px] opacity-80 mt-1">tap to fill ↓</span>
          </div>
        </div>
      </button>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-14px) rotate(2deg); }
        }
      `}</style>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 px-8 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <Image
                  src="/inf-logo.png"
                  alt="Inflectiv"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">inflectiv</h1>
            <p className="text-white/80 text-sm">Analytics Dashboard</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 text-sm mt-1">Enter your password to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 hover:opacity-90 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Access Dashboard"
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          Protected by password authentication
        </p>
      </div>
    </div>
  );
}
