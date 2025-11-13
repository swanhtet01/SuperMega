import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

/**
 * Demo Handler - Auto-login for demo mode
 * Triggered when ?demo=true is in URL
 */
export default function DemoHandler() {
  const [, setLocation] = useLocation();
  const demoLogin = trpc.auth.demoLogin.useMutation();

  useEffect(() => {
    // Auto-login as demo user
    demoLogin.mutate(undefined, {
      onSuccess: () => {
        console.log("Demo login successful, redirecting to dashboard...");
        // Wait a bit for cookie to be set before redirecting
        setTimeout(() => {
          setLocation("/dashboard");
        }, 500);
      },
      onError: (error) => {
        console.error("Demo login failed:", error);
        // Fallback to regular login
        setLocation("/login");
      },
    });
  }, []);

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

