"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 px-4 py-8">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="text-center space-y-3 sm:space-y-4 px-4 sm:px-6">
          <div className="flex justify-center items-center gap-3">
            <Image
              src="/inf-logo.png"
              alt="Inflectiv"
              width={48}
              height={48}
              className="object-contain"
            />
            <span className="text-2xl sm:text-3xl font-bold text-slate-800">inflectiv</span>
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold">Admin Login</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Sign in to connect Google Analytics (Admin only)
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full text-sm sm:text-base"
            size="lg"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>
          <p className="text-[10px] sm:text-xs text-center text-muted-foreground mt-3 sm:mt-4">
            This will request access to your Google Analytics data
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
