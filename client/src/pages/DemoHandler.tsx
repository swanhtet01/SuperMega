import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

/**
 * Demo Handler - Auto-login for demo mode
 * Triggered when ?demo=true is in URL
 * Uses localStorage to persist demo session across page reloads
 */
export default function DemoHandler() {
  const [, setLocation] = useLocation();
  const demoLogin = trpc.auth.demoLogin.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    // Auto-login as demo user
    demoLogin.mutate(undefined, {
      onSuccess: (data) => {
        console.log("Demo login successful:", data);
        // Store demo flag and user in localStorage
        localStorage.setItem("demo_mode", "true");
        localStorage.setItem("demo_user", JSON.stringify(data.user));
        
        // Invalidate auth cache to force refetch with new session
        utils.auth.me.invalidate();
        
        // Redirect to dashboard after cache invalidation
        setTimeout(() => {
          setLocation("/dashboard");
        }, 300);
      },
      onError: (error) => {
        console.error("Demo login failed:", error);
        // Fallback to regular login
        setLocation("/login");
      },
    });
  }, [utils, setLocation, demoLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-400 mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-white mb-2">Loading Demo...</h2>
        <p className="text-slate-400">Preparing your FlowCore experience</p>
      </div>
    </div>
  );
}

