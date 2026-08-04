"use client";

import { useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { AppHeader, Button, SkeletonMetricsRow, SkeletonCard } from "../../components/ui";

export default function PersonalWorkspacePage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBackend = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    setApiResponse(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available. Please sign in.");
      }

      const response = await fetch(`http://127.0.0.1:8000/api/v1/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.detail || `API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setApiResponse(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred contacting the backend.");
    } finally {
      setLoading(false);
    }
  };

  if (!userLoaded) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <AppHeader badge="Personal Workspace" />
        <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col gap-8">
          <SkeletonMetricsRow />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors">
      <AppHeader
        showLink={true}
        badge="Personal Workspace"
        showOrgSwitcher={true}
        showUserButton={true}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col gap-8">
        <section className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Personal Workspace Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</span>. Manage your personal subscriptions, AI tool usage, and individual projects.
          </p>
        </section>

        <section className="p-6 bg-card text-card-foreground border border-border rounded-xl shadow-2xs flex flex-col gap-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Backend API Health & Authentication Check
          </h2>
          <p className="text-xs text-muted-foreground">
            Test backend connectivity and verify your Clerk authentication context.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => fetchBackend("health")}
              loading={loading}
              variant="secondary"
            >
              Check Health
            </Button>
            <Button
              onClick={() => fetchBackend("me")}
              loading={loading}
              variant="primary"
            >
              Verify Auth Context (/me)
            </Button>
          </div>

          {loading ? (
            <SkeletonCard className="mt-4" />
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-mono">
              {error}
            </div>
          ) : apiResponse ? (
            <div className="mt-2 p-4 bg-secondary text-secondary-foreground rounded-lg border border-border">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Response Payload:
              </h4>
              <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
