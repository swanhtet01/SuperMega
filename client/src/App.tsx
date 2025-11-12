import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import QualityInspection from "./pages/QualityInspection";
import ProductionEntry from "./pages/ProductionEntry";
import InventoryManagement from "./pages/InventoryManagement";
import SalesManagement from "./pages/SalesManagement";
import FinancialManagement from "./pages/FinancialManagement";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path={"/"} component={Dashboard} />
        <Route path={"/inspection"} component={QualityInspection} />
        <Route path={"/production"} component={ProductionEntry} />
        <Route path={"/inventory"} component={InventoryManagement} />
        <Route path={"/sales"} component={SalesManagement} />
        <Route path={"/financial"} component={FinancialManagement} />
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
