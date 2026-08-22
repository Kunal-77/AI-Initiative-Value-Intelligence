"use client";

import React, { useState, Suspense } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button, Input, Label, SkeletonMetricsRow } from "../../../components/ui";
import { ValueIntelligenceAuthShell } from "../../../components/auth/ValueIntelligenceAuthShell";
import { AuthBrand } from "../../../components/auth/AuthBrand";
import { AuthDivider } from "../../../components/auth/AuthDivider";
import { AuthError } from "../../../components/auth/AuthError";

function SignInContent() {
  const { signIn } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirectUrl = searchParams.get("redirect_url") || "/workspace-select";
  const redirectUrl = (rawRedirectUrl.startsWith("/") && !rawRedirectUrl.startsWith("//"))
    ? rawRedirectUrl
    : "/workspace-select";

  const [step, setStep] = useState<"SIGN_IN" | "VERIFY_TRUST">("SIGN_IN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

    setLoading(true);
    setError(null);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (signIn.status === "complete") {
        const finalizeRes = await signIn.finalize();
        if (finalizeRes.error) {
          setError(finalizeRes.error);
        } else {
          router.push(redirectUrl);
        }
      } else if (signIn.status === "needs_client_trust") {
        const factor = signIn.supportedSecondFactors?.find(
          (f: any) => f.strategy === "email_code"
        ) || signIn.supportedSecondFactors?.find(
          (f: any) => f.strategy === "phone_code"
        ) || signIn.supportedSecondFactors?.[0];

        if (!factor) {
          setError("Device verification required, but no supported verification strategies were found.");
          return;
        }

        let prepRes;
        if (factor.strategy === "email_code") {
          prepRes = await signIn.mfa.sendEmailCode();
        } else if (factor.strategy === "phone_code") {
          prepRes = await signIn.mfa.sendPhoneCode();
        } else {
          setError(`Device verification strategy "${factor.strategy}" is not supported by this custom flow.`);
          return;
        }

        if (prepRes?.error) {
          setError(prepRes.error);
          return;
        }

        setStep("VERIFY_TRUST");
      } else {
        console.error("Sign-in did not complete status:", signIn.status);
        setError("Sign-in failed. Please check your credentials or verify your account.");
      }
    } catch (err: any) {
      console.error("Sign-in failed:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTrust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

    if (!verificationCode) {
      setError("Please enter the verification code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const factor = signIn.supportedSecondFactors?.find(
        (f: any) => f.strategy === "email_code"
      ) || signIn.supportedSecondFactors?.find(
        (f: any) => f.strategy === "phone_code"
      ) || signIn.supportedSecondFactors?.[0];

      if (!factor) {
        setError("Device verification strategy missing.");
        return;
      }

      let verifyRes;
      if (factor.strategy === "email_code") {
        verifyRes = await signIn.mfa.verifyEmailCode({ code: verificationCode });
      } else if (factor.strategy === "phone_code") {
        verifyRes = await signIn.mfa.verifyPhoneCode({ code: verificationCode });
      } else {
        setError(`Device verification strategy "${factor.strategy}" is not supported by this custom flow.`);
        return;
      }

      if (verifyRes?.error) {
        setError(verifyRes.error);
        return;
      }

      if (signIn.status === "complete") {
        const finalizeRes = await signIn.finalize();
        if (finalizeRes.error) {
          setError(finalizeRes.error);
        } else {
          router.push(redirectUrl);
        }
      } else {
        console.error("Sign-in verification succeeded, but status is not complete:", signIn.status);
        setError("Unable to complete sign-in. Current status: " + signIn.status);
      }
    } catch (err: any) {
      console.error("Verification failed:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!signIn) return;
    setResendLoading(true);
    setError(null);
    setResendSuccess(false);

    try {
      const factor = signIn.supportedSecondFactors?.find(
        (f: any) => f.strategy === "email_code"
      ) || signIn.supportedSecondFactors?.find(
        (f: any) => f.strategy === "phone_code"
      ) || signIn.supportedSecondFactors?.[0];

      if (!factor) {
        setError("Device verification strategy missing.");
        return;
      }

      let prepRes;
      if (factor.strategy === "email_code") {
        prepRes = await signIn.mfa.sendEmailCode();
      } else if (factor.strategy === "phone_code") {
        prepRes = await signIn.mfa.sendPhoneCode();
      } else {
        setError(`Device verification strategy "${factor.strategy}" is not supported by this custom flow.`);
        return;
      }

      if (prepRes?.error) {
        setError(prepRes.error);
        return;
      }

      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      console.error("Resending verification code failed:", err);
      setError(err);
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!signIn) return;
    setLoadingGoogle(true);
    setError(null);

    try {
      const ssoRes = await signIn.sso({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectCallbackUrl: redirectUrl,
      });
      if (ssoRes.error) {
        setError(ssoRes.error);
        setLoadingGoogle(false);
      }
    } catch (err: any) {
      console.error("Google OAuth initialization failed:", err);
      setError(err);
      setLoadingGoogle(false);
    }
  };

  if (!signIn) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-xs text-muted-foreground font-mono">Initializing secure vault...</span>
      </div>
    );
  }

  const isFormDisabled = loading || loadingGoogle;

  if (step === "VERIFY_TRUST") {
    return (
      <div className="space-y-6">
        <AuthBrand
          title="Verify your account"
          subtitle="A verification code is required to trust this new browser or device."
        />

        <form onSubmit={handleVerifyTrust} className="space-y-4">
          <AuthError error={error} />

          <div className="space-y-1.5">
            <Label htmlFor="verificationCode" required>Verification Code</Label>
            <Input
              id="verificationCode"
              type="text"
              placeholder="••••••"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              disabled={loading}
              maxLength={6}
              required
              className="w-full h-10 px-3 bg-background border border-border text-center font-mono text-lg tracking-widest"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            loadingText="Verifying..."
            disabled={loading}
            className="w-full h-10 shadow-lg shadow-blue-500/15"
          >
            Verify Code
          </Button>

          <div className="flex justify-between items-center text-xs pt-2">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading || resendLoading}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-500 font-semibold focus:outline-none disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : resendSuccess ? "Code sent!" : "Resend code"}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setStep("SIGN_IN");
                setError(null);
              }}
              disabled={loading}
              className="text-muted-foreground hover:text-foreground font-semibold focus:outline-none"
            >
              Back to Sign In
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AuthBrand
        title="Welcome Back"
        subtitle="Sign in to continue to your AI decision intelligence workspace."
      />

      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        <AuthError error={error} />

        <div className="space-y-1.5">
          <Label htmlFor="email" required>Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isFormDisabled}
            required
            autoComplete="off"
            className="w-full h-10 px-3 bg-background border border-border"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" required>Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 font-semibold focus:outline-none focus:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isFormDisabled}
              required
              autoComplete="new-password"
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

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          loadingText="Signing In..."
          disabled={isFormDisabled}
          className="w-full h-10 shadow-lg shadow-blue-500/15"
        >
          Sign In <LogIn className="w-4 h-4" />
        </Button>
      </form>

      <AuthDivider />

      <Button
        type="button"
        variant="secondary"
        onClick={handleGoogleSignIn}
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
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Continue with Google
      </Button>

      <div className="pt-2 text-center text-xs text-muted-foreground">
        Don't have an account?{" "}
        <Link
          href={`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-500 font-semibold focus:outline-none focus:underline"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default function SignInPage() {
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
        <SignInContent />
      </ValueIntelligenceAuthShell>
    </Suspense>
  );
}
