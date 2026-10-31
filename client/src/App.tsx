import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Admin from "@/pages/Admin";
import Customer from "@/pages/Customer";
import { ForgotPasswordPage, LoginPage, ResetPasswordPage } from "@/pages/Login";
import Home from "@/pages/Home";
import Request from "@/pages/Request";
import SiteSettings from "@/pages/SiteSettings";
import { useEffect, type ReactNode } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import TermsOfService from "@/components/TermsOfService";
function ProtectedRoute({ children, ownerOnly = false }: { children: ReactNode; ownerOnly?: boolean }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading || user) return;
    const currentPath = window.location.pathname;
    const next = ["/customer", "/vip", "/admin", "/admin/settings"].includes(currentPath) ? currentPath : "/customer";
    setLocation(`/login?next=${encodeURIComponent(next)}`);
  }, [loading, user, setLocation]);

  if (loading || !user) {
    return <div className="ih-admin-loading" role="status">Checking your private access…</div>;
  }
  if (ownerOnly && user.role !== "admin") {
    return (
      <div className="ih-admin-denied">
        <h1>Owner access required</h1>
        <p>This sign-in does not have permission to manage the Island Handyman workspace.</p>
        <Link className="ih-text-link" href="/customer">Go to customer access</Link>
      </div>
    );
  }
  return <>{children}</>;
}

function SiteThemeBridge() {
  const { data } = trpc.site.publicSiteData.useQuery(undefined, { staleTime: 60_000 });
  const preset = data?.siteContent.appearancePreset ?? "evergreen";
  useEffect(() => {
    document.documentElement.dataset.sitePreset = preset;
  }, [preset]);
  return null;
}

function CustomerRoute() {
  return <ProtectedRoute><Customer /></ProtectedRoute>;
}

function AdminRoute() {
  return <ProtectedRoute ownerOnly><Admin /></ProtectedRoute>;
}

function SiteSettingsRoute() {
  return <ProtectedRoute ownerOnly><SiteSettings /></ProtectedRoute>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/request" component={Request} />
      <Route path="/login" component={LoginPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/customer" component={CustomerRoute} />
      <Route path="/vip" component={CustomerRoute} />
      <Route path="/admin/settings" component={SiteSettingsRoute} />
      <Route path="/admin" component={AdminRoute} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <SiteThemeBridge />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
