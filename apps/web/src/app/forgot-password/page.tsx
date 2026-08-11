"use client";

import React, { useState } from "react";
import { useSignIn, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { Button, Input, Label } from "../../components/ui";
import { ValueIntelligenceAuthShell } from "../../components/auth/ValueIntelligenceAuthShell";
import { AuthBrand } from "../../components/auth/AuthBrand";
import { AuthError } from "../../components/auth/AuthError";

type RecoveryStep = "REQUEST_CODE" | "RESET_PASSWORD" | "SUCCESS";

export default function ForgotPasswordPage() {
  const { signIn } = useSignIn();
  const { signOut, setActive } = useClerk();
  const router = useRouter();

  const [step, setStep] = useState<RecoveryStep>("REQUEST_CODE");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  if (!signIn) {
    return (
      <ValueIntelligenceAuthShell>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs text-muted-foreground font-mono">Loading recovery tools...</span>
        </div>
      </ValueIntelligenceAuthShell>
    );
  }

  // Request code email
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const createRes = await signIn.create({
        identifier: email,
      });

      if (createRes.error) {
        setError(createRes.error);
        return;
      }

      // Verify strategy availability on the reactive signIn object
      const hasResetStrategy = signIn.supportedFirstFactors?.some(
        (factor: any) => factor.strategy === "reset_password_email_code"
      );

      if (!hasResetStrategy) {
        setError(
          "Password reset via email code is not available for this email address. " +
          "Please verify that this account exists and supports password-based authentication."
        );
        return;
      }

      const sendRes = await signIn.resetPasswordEmailCode.sendCode();
      if (sendRes.error) {
        setError(sendRes.error);
        return;
      }

      setStep("RESET_PASSWORD");
    } catch (err: any) {
      console.error("Forgot password request failed:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setError("Please enter the verification code sent to your email.");
      return;
    }
    if (!password) {
      setError("Please enter a new password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const verifyRes = await signIn.resetPasswordEmailCode.verifyCode({
        code,
      });

      if (verifyRes.error) {
        setError(verifyRes.error);
        return;
      }

      const submitRes = await signIn.resetPasswordEmailCode.submitPassword({
        password,
        signOutOfOtherSessions: true,
      });

      if (submitRes.error) {
        setError(submitRes.error);
        return;
      }

      if (signIn.status === "complete") {
        if (setActive) {
          await setActive({ session: signIn.createdSessionId });
        }
        setStep("SUCCESS");
      } else {
        console.error("Password reset completed but status is not complete:", signIn.status);
        setError("Unable to complete password reset. Please try again.");
      }
    } catch (err: any) {
      console.error("Password reset failed:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToSignIn = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (err) {
      console.error("Sign out after reset failed:", err);
    }
    router.push("/sign-in");
  };

  return (
    <ValueIntelligenceAuthShell>
      <div className="space-y-6">
        {step === "REQUEST_CODE" && (
          <>
            <AuthBrand
              title="Forgot Password?"
              subtitle="Enter your email address and we'll send you a verification code to reset your password."
            />

            <form onSubmit={handleRequestCode} className="space-y-4">
              <AuthError error={error} />
              
              <div className="space-y-1.5">
                <Label htmlFor="email" required>Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full h-10 px-3 bg-background border border-border"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                loadingText="Sending Code..."
                disabled={loading}
                className="w-full h-10 shadow-lg shadow-purple-500/10"
              >
                Send Verification Code
              </Button>
            </form>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => router.push("/sign-in")}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium focus:outline-none focus:underline cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </div>
          </>
        )}

        {step === "RESET_PASSWORD" && (
          <>
            <AuthBrand
              title="Reset Your Password"
              subtitle={`We've sent a 6-digit verification code to ${email}. Enter the code and your new password below.`}
            />

            <form onSubmit={handleResetPassword} className="space-y-4">
              <AuthError error={error} />

              <div className="space-y-1.5">
                <Label htmlFor="code" required>Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  disabled={loading}
                  required
                  className="w-full h-10 px-3 text-center tracking-widest font-mono text-sm bg-background border border-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" required>New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full h-10 px-3 bg-background border border-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" required>Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full h-10 px-3 bg-background border border-border"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                loadingText="Resetting..."
                disabled={loading}
                className="w-full h-10 shadow-lg shadow-purple-500/10"
              >
                Reset Password
              </Button>
            </form>

            <div className="pt-2 text-center flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setStep("REQUEST_CODE")}
                disabled={loading}
                className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium focus:outline-none cursor-pointer disabled:opacity-50"
              >
                Change email address
              </button>
            </div>
          </>
        )}

        {step === "SUCCESS" && (
          <div className="text-center space-y-6 py-4">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Password Reset Successfully</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Your credentials have been securely updated. Return to the sign-in screen to authenticate.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              onClick={handleReturnToSignIn}
              loading={loading}
              loadingText="Returning..."
              className="w-full h-10 shadow-lg shadow-purple-500/10"
            >
              Return to Sign In
            </Button>
          </div>
        )}
      </div>
    </ValueIntelligenceAuthShell>
  );
}
