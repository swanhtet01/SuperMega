import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import QualityInspection from "./pages/QualityInspection";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path={"/"} component={Dashboard} />
        <Route path={"/inspection"} component={QualityInspection} />
        <Route path={"/production"} component={() => <div className="text-2xl font-bold">Production Module - Coming Soon</div>} />
        <Route path={"/inventory"} component={() => <div className="text-2xl font-bold">Inventory Module - Coming Soon</div>} />
        <Route path={"/sales"} component={() => <div className="text-2xl font-bold">Sales Module - Coming Soon</div>} />
        <Route path={"/financial"} component={() => <div className="text-2xl font-bold">Financial Module - Coming Soon</div>} />
        <Route path={"/alerts"} component={() => <div className="text-2xl font-bold">Alerts Module - Coming Soon</div>} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
