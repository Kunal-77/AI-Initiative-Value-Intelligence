"use client";

import React, { useState, Suspense } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, ArrowLeft } from "lucide-react";
import { Button, Input, Label, SkeletonMetricsRow } from "../../../components/ui";
import { ValueIntelligenceAuthShell } from "../../../components/auth/ValueIntelligenceAuthShell";
import { AuthBrand } from "../../../components/auth/AuthBrand";
import { AuthDivider } from "../../../components/auth/AuthDivider";
import { AuthError } from "../../../components/auth/AuthError";

function SignUpContent() {
  const { signUp } = useSignUp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirectUrl = searchParams.get("redirect_url") || "/workspace-select";
  const redirectUrl = (rawRedirectUrl.startsWith("/") && !rawRedirectUrl.startsWith("//"))
    ? rawRedirectUrl
    : "/workspace-select";

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const createRes = await signUp.create({
        emailAddress,
        password,
      });

      if (createRes.error) {
        setError(createRes.error);
        return;
      }

      // Prepare email verification code
      const sendRes = await signUp.verifications.sendEmailCode();
      if (sendRes.error) {
        setError(sendRes.error);
        return;
      }

      setPendingVerification(true);
    } catch (err: any) {
      console.error("Sign-up creation failed:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;

    if (!verificationCode) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const verifyRes = await signUp.verifications.verifyEmailCode({
        code: verificationCode,
      });

      if (verifyRes.error) {
        setError(verifyRes.error);
        return;
      }

      if (signUp.status === "complete") {
        const finalizeRes = await signUp.finalize();
        if (finalizeRes.error) {
          setError(finalizeRes.error);
        } else {
          router.push(redirectUrl);
        }
      } else {
        console.error("Sign-up complete but status is not complete:", signUp.status);
        setError("Sign-up verification succeeded, but session completion is pending. Please log in.");
      }
    } catch (err: any) {
      console.error("Verification failed:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!signUp) return;
    setLoading(true);
    setError(null);
    setResendSuccess(false);

    try {
      const sendRes = await signUp.verifications.sendEmailCode();
      if (sendRes.error) {
        setError(sendRes.error);
      } else {
        setResendSuccess(true);
      }
    } catch (err: any) {
      console.error("Resending verification code failed:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!signUp) return;
    setLoadingGoogle(true);
    setError(null);

    try {
      const ssoRes = await signUp.sso({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectCallbackUrl: redirectUrl,
      });
      if (ssoRes.error) {
        setError(ssoRes.error);
        setLoadingGoogle(false);
      }
    } catch (err: any) {
      console.error("Google OAuth registration failed:", err);
      setError(err);
      setLoadingGoogle(false);
    }
  };

  if (!signUp) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-xs text-muted-foreground font-mono">Initializing setup console...</span>
      </div>
    );
  }

  const isFormDisabled = loading || loadingGoogle;

  if (pendingVerification) {
    return (
      <div className="space-y-6">
        <AuthBrand
          title="Verify Your Email"
          subtitle={`We've sent a 6-digit activation code to ${emailAddress}. Enter the code below to complete registration.`}
        />

        <form onSubmit={handleVerify} className="space-y-4">
          <AuthError error={error} />

          {resendSuccess && (
            <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex gap-2 items-center animate-in fade-in duration-200">
              Verification code resent successfully.
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="verificationCode" required>Activation Code</Label>
            <Input
              id="verificationCode"
              type="text"
              placeholder="123456"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
              disabled={loading}
              required
              className="w-full h-10 px-3 text-center tracking-widest font-mono text-sm bg-background border border-border"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            loadingText="Verifying..."
            disabled={loading}
            className="w-full h-10 shadow-lg shadow-purple-500/10"
          >
            Verify Code
          </Button>
        </form>

        <div className="pt-2 text-center flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={loading}
            className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-500 font-semibold focus:outline-none cursor-pointer disabled:opacity-50"
          >
            Resend activation code
          </button>
          
          <button
            type="button"
            onClick={() => setPendingVerification(false)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium focus:outline-none cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Account Creation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AuthBrand
        title="Create Account"
        subtitle="Start free to manage strategic portfolios and track real-world ROIs."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthError error={error} />

        <div className="space-y-1.5">
          <Label htmlFor="email" required>Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            disabled={isFormDisabled}
            required
            className="w-full h-10 px-3 bg-background border border-border"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" required>Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isFormDisabled}
              required
              className="w-full h-10 pl-3 pr-10 bg-background border border-border"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isFormDisabled}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" required>Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isFormDisabled}
            required
            className="w-full h-10 px-3 bg-background border border-border"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          loadingText="Creating..."
          disabled={isFormDisabled}
          className="w-full h-10 shadow-lg shadow-purple-500/10"
        >
          Create Account <UserPlus className="w-4 h-4" />
        </Button>
      </form>

      <AuthDivider />

      <Button
        type="button"
        variant="secondary"
        onClick={handleGoogleSignUp}
        disabled={isFormDisabled}
        loading={loadingGoogle}
        loadingText="Connecting..."
        className="w-full h-10 gap-2 border border-border bg-card hover:bg-secondary text-xs font-semibold"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Continue with Google
      </Button>

      <div className="pt-2 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`}
          className="text-purple-600 dark:text-purple-400 hover:text-purple-500 font-semibold focus:outline-none focus:underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md space-y-6">
            <SkeletonMetricsRow />
          </div>
        </div>
      }
    >
      <ValueIntelligenceAuthShell>
        <SignUpContent />
      </ValueIntelligenceAuthShell>
    </Suspense>
  );
}
