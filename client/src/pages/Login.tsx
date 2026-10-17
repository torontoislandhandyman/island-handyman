import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { PASSWORD_MIN_LENGTH } from "@shared/const";

type PageMode = "login" | "forgot" | "reset";

const PROTECTED_PATHS = new Set(["/customer", "/vip", "/admin", "/admin/settings"]);

function returnPath(search: string, role?: string): string {
  const requested = new URLSearchParams(search).get("next");
  if (requested && PROTECTED_PATHS.has(requested)) return requested;
  return role === "admin" ? "/admin" : "/customer";
}

function readableError(error: unknown, fallback: string): string {
  if (error instanceof Error && ["The email address or password", "Please wait a few minutes", "Choose a password", "This password link"].some((prefix) => error.message.startsWith(prefix))) return error.message;
  return fallback;
}

function BrandHeader() {
  return (
    <header className="ih-auth-header">
      <Link href="/" className="ih-brand" aria-label="Island Handyman home">
        <span className="ih-mark" aria-hidden="true">IH</span>
        <span>ISLAND HANDYMAN</span>
      </Link>
      <span className="ih-auth-private"><ShieldCheck size={17} /> Private client access</span>
    </header>
  );
}

function AuthPage({ mode }: { mode: PageMode }) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(() => new URLSearchParams(window.location.search).get("token") ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const nextPath = returnPath(window.location.search, user?.role);

  const login = trpc.auth.login.useMutation({
    onSuccess: (signedInUser) => {
      utils.auth.me.setData(undefined, signedInUser);
      setLocation(returnPath(window.location.search, signedInUser.role));
    },
    onError: (reason) => setError(readableError(reason, "We couldn’t sign you in. Please try again.")),
  });
  const requestLink = trpc.auth.requestPasswordSetup.useMutation({
    onSuccess: () => {
      setError("");
      setNotice("If this email is approved for a private Island Handyman account, password setup instructions will be sent shortly.");
    },
    onError: (reason) => setError(readableError(reason, "We couldn’t send a password link right now. Please try again in a few minutes.")),
  });
  const complete = trpc.auth.completePasswordSetup.useMutation({
    onSuccess: (signedInUser) => {
      utils.auth.me.setData(undefined, signedInUser);
      setLocation(returnPath(window.location.search, signedInUser.role));
    },
    onError: (reason) => setError(readableError(reason, "This password link is invalid or has expired. Please request a new one.")),
  });

  useEffect(() => {
    if (mode === "login" && user) setLocation(returnPath(window.location.search, user.role));
  }, [mode, user, setLocation]);

  useEffect(() => {
    if (mode === "reset" && token) {
      window.history.replaceState(window.history.state, "", "/reset-password");
      setToken(token);
    }
  }, [mode, token]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (mode === "login") {
      login.mutate({ email: email.trim(), password });
      return;
    }
    if (mode === "forgot") {
      requestLink.mutate({ email: email.trim() });
      return;
    }
    if (!token) {
      setError("This password link is missing or incomplete. Request a new one to continue.");
      return;
    }
    complete.mutate({ token, password });
  };

  const busy = login.isPending || requestLink.isPending || complete.isPending;
  const title = mode === "login" ? "Sign in to your private workspace." : mode === "forgot" ? "Set up or reset your password." : "Choose a new password.";
  const description = mode === "login"
    ? "Your project details and messages stay in one private place."
    : mode === "forgot"
      ? "Enter the email address approved for your account. We’ll send a secure link to your inbox."
      : "Choose a password you can remember. This secure link works once and expires after one hour.";

  return (
    <main className="ih-auth-page">
      <BrandHeader />
      <section className="ih-auth-card" aria-labelledby="ih-auth-title">
        <div className="ih-auth-icon" aria-hidden="true">
          {mode === "forgot" ? <Mail size={25} /> : mode === "reset" ? <KeyRound size={25} /> : <LockKeyhole size={25} />}
        </div>
        <p className="ih-eyebrow">{mode === "login" ? "Welcome back" : mode === "forgot" ? "Account help" : "Secure password update"}</p>
        <h1 id="ih-auth-title">{title}</h1>
        <p className="ih-auth-description">{description}</p>

        {notice ? (
          <div className="ih-auth-success" role="status">
            <strong>Check your email.</strong>
            <p>{notice}</p>
            <Link href="/login" className="ih-button ih-button-primary">Return to sign in</Link>
          </div>
        ) : (
          <form className="ih-auth-form" onSubmit={submit}>
            {mode !== "reset" && (
              <label className="ih-auth-field">
                <span>Email Address</span>
                <input type="email" autoComplete="email" inputMode="email" required maxLength={320} value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
            )}
            {mode !== "forgot" && (
              <label className="ih-auth-field">
                <span>{mode === "reset" ? "New Password" : "Password"}</span>
                <div className="ih-auth-password-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "reset" ? "new-password" : "current-password"}
                    required
                    minLength={mode === "reset" ? PASSWORD_MIN_LENGTH : 1}
                    maxLength={128}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    aria-describedby={mode === "reset" ? "ih-password-help" : undefined}
                  />
                  <button className="ih-auth-show-password" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-pressed={showPassword}>
                    {showPassword ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
                    <span>{showPassword ? "Hide password" : "Show password"}</span>
                  </button>
                </div>
                {mode === "reset" && <small id="ih-password-help">Use at least {PASSWORD_MIN_LENGTH} characters. A memorable phrase works well.</small>}
              </label>
            )}
            {error && <p className="ih-auth-error" role="alert">{error}</p>}
            {mode === "reset" && !token && !error && <p className="ih-auth-error" role="alert">This password link is missing or incomplete. Request a new one to continue.</p>}
            <button className="ih-button ih-button-primary ih-auth-submit" type="submit" disabled={busy || (mode === "reset" && !token)}>
              {busy ? <><Loader2 size={18} className="ih-auth-spinner" /> Please wait…</> : mode === "login" ? "Sign in" : mode === "forgot" ? "Email me a password link" : "Save new password"}
            </button>
          </form>
        )}

        <nav className="ih-auth-links" aria-label="Account navigation">
          {mode !== "login" ? <Link href={`/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}><ArrowLeft size={16} /> Back to sign in</Link> : <Link href={`/forgot-password${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}>Forgot Password?</Link>}
          <p>Private account access is available after Island Handyman approves your request.</p>
        </nav>
      </section>
      <footer className="ih-auth-footer"><span className="ih-mark" aria-hidden="true">IH</span><span>Good work, close to home.</span></footer>
    </main>
  );
}

export function LoginPage() {
  return <AuthPage mode="login" />;
}

export function ForgotPasswordPage() {
  return <AuthPage mode="forgot" />;
}

export function ResetPasswordPage() {
  return <AuthPage mode="reset" />;
}
