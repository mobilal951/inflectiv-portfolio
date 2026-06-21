"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart3, Unlink, Loader2, CheckCircle2, Wifi, WifiOff, Save, Copy, Check } from "lucide-react";
import { useDashboard } from "./dashboard-context";

// Admin emails - must match ga-credentials.ts
const ADMIN_EMAILS = [
  "admin@bigimmersive.com",
];

interface SaveResponse {
  success: boolean;
  message: string;
  refreshToken?: string;
  instructions?: string[];
  error?: string;
}

export function GAConnectDialog() {
  const { data: session, status } = useSession();
  const { isGAConnected, refresh } = useDashboard();
  const [open, setOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [tokenInfo, setTokenInfo] = useState<{ token: string; instructions: string[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

  // Clear save message and token info when dialog closes
  useEffect(() => {
    if (!open) {
      setSaveMessage(null);
      setTokenInfo(null);
      setCopied(false);
    }
  }, [open]);

  const handleCopyToken = async () => {
    if (tokenInfo?.token) {
      await navigator.clipboard.writeText(tokenInfo.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = async () => {
    // Portfolio demo: skip real Google OAuth. Just close the dialog and
    // pretend the admin connected — the dashboard's GA-connected state is
    // already driven by /api/ga/properties returning a synthetic property.
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setSaveMessage({
        type: "success",
        text: "Demo mode: Google auth bypassed. Synthetic data shown below.",
      });
      setTimeout(() => {
        setOpen(false);
        refresh();
      }, 1200);
    }, 600);
  };

  const handleDisconnect = async () => {
    await signOut({ redirect: false });
    setOpen(false);
    refresh();
  };

  const handleSaveCredentials = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    setTokenInfo(null);

    try {
      const response = await fetch("/api/ga/save-credentials", {
        method: "POST",
      });

      const data: SaveResponse = await response.json();

      if (response.ok) {
        // Check if this is a Vercel response with refresh token
        if (data.refreshToken && data.instructions) {
          setTokenInfo({ token: data.refreshToken, instructions: data.instructions });
          setSaveMessage({ type: "success", text: data.message });
        } else {
          setSaveMessage({ type: "success", text: data.message || "GA connection saved! All visitors can now see analytics." });
          refresh();
        }
      } else {
        setSaveMessage({ type: "error", text: data.error || "Failed to save credentials" });
      }
    } catch (error) {
      setSaveMessage({ type: "error", text: "Failed to save credentials" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 bg-amber-50 text-amber-700 hover:bg-amber-100 ring-1 ring-amber-200">
          <div className="p-1.5 bg-amber-100 rounded-lg">
            <WifiOff className="h-4 w-4" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs font-semibold">Demo data</p>
            <p className="text-[10px] opacity-70">Synthetic — not live GA</p>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-4 rounded-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 bg-gradient-to-br from-blue-500 via-purple-500 to-orange-400 rounded-xl">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            Google Analytics
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {isGAConnected
              ? "Analytics data is connected and visible to all visitors."
              : "Admin needs to connect their Google account to enable analytics."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isGAConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-800">Connected</p>
                  <p className="text-xs text-emerald-600">All visitors can see analytics data</p>
                </div>
              </div>

              {isAuthenticated && isAdmin && (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={handleSaveCredentials}
                    disabled={isSaving}
                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 rounded-xl h-11"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSaving ? "Saving..." : "Re-save Connection"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDisconnect}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 rounded-xl h-11"
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    Disconnect Account
                  </Button>
                </div>
              )}

              {saveMessage && (
                <div className={`p-3 rounded-xl text-sm ${
                  saveMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {saveMessage.text}
                </div>
              )}

              {tokenInfo && (
                <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-blue-800">Refresh Token (copy this):</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-white p-2 rounded border border-blue-200 break-all max-h-20 overflow-y-auto">
                        {tokenInfo.token}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyToken}
                        className="shrink-0"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-blue-800">Instructions:</p>
                    <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                      {tokenInfo.instructions.map((instruction, i) => (
                        <li key={i}>{instruction.replace(/^\d+\.\s*/, '')}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          ) : isAuthenticated && isAdmin ? (
            // Admin is signed in but hasn't saved credentials yet
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <p className="text-sm text-gray-700 leading-relaxed">
                  You're signed in as admin. Click below to save your GA connection so all visitors can view analytics.
                </p>
              </div>
              <Button
                onClick={handleSaveCredentials}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 hover:opacity-90 text-white font-semibold rounded-xl h-11 shadow-lg shadow-purple-500/20"
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                {isSaving ? "Saving..." : "Save GA Connection"}
              </Button>

              {saveMessage && (
                <div className={`p-3 rounded-xl text-sm ${
                  saveMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {saveMessage.text}
                </div>
              )}

              {tokenInfo && (
                <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-blue-800">Refresh Token (copy this):</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-white p-2 rounded border border-blue-200 break-all max-h-20 overflow-y-auto">
                        {tokenInfo.token}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyToken}
                        className="shrink-0"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-blue-800">Instructions:</p>
                    <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                      {tokenInfo.instructions.map((instruction, i) => (
                        <li key={i}>{instruction.replace(/^\d+\.\s*/, '')}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Not authenticated - need to sign in
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Admin needs to sign in with Google to connect Analytics and make data visible to all visitors.
                </p>
              </div>
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 hover:opacity-90 text-white font-semibold rounded-xl h-11 shadow-lg shadow-purple-500/20"
              >
                {isConnecting ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
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
                )}
                Sign in with Google (Admin)
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
