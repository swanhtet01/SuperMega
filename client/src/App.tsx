import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import ProductionEntry from "@/pages/ProductionEntry";
import SimpleLogin from "@/pages/SimpleLogin";
import { Route, Switch, Link, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import SuperMegaHome from "./pages/SuperMegaHome";
import DemoHandler from "./pages/DemoHandler";
import { Factory, LayoutDashboard, LogOut, Languages } from "lucide-react";

function AppContent() {
  const [location] = useLocation();
  const { language, setLanguage, t } = useLanguage();
  
  // Check for demo mode and public routes
  const isDemoMode = typeof window !== 'undefined' && window.location.search.includes('demo=true');
  const isPublicRoute = location === "/" || isDemoMode || location === "/demo";

  // MUST call useAuth unconditionally (React hooks rule)
  // But disable the query for public routes to avoid OAuth redirect
  const { user, loading, isAuthenticated, logout } = useAuth({ enabled: !isPublicRoute });

  // Public showcase route - ALWAYS show at root
  if (location === "/") {
    return <SuperMegaHome />;
  }

  // Demo mode - auto-login
  if (isDemoMode || location === "/demo") {
    return <DemoHandler />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // All other routes require authentication
  if (!isAuthenticated) {
    return <SimpleLogin />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/">
                <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Factory className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg">{t("app.title")}</h1>
                    <p className="text-xs text-muted-foreground">{t("app.subtitle")}</p>
                  </div>
                </a>
              </Link>

              <nav className="hidden md:flex items-center gap-4">
                <Link href="/dashboard">
                  <a
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      location === "/dashboard"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {t("nav.dashboard")}
                  </a>
                </Link>
                <Link href="/production">
                  <a
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      location === "/production"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    <Factory className="w-4 h-4" />
                    {t("nav.production")}
                  </a>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === "en" ? "my" : "en")}
                className="gap-2"
              >
                <Languages className="w-4 h-4" />
                {language === "en" ? "မြန်မာ" : "English"}
              </Button>
              
              <div className="text-sm text-muted-foreground hidden md:block">
                {user?.name}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                {t("nav.logout")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Switch>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/production" component={ProductionEntry} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <AppContent />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
