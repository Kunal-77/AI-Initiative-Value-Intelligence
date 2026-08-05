import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignIn path="/sign-in" fallbackRedirectUrl="/workspace-select" signUpFallbackRedirectUrl="/workspace-select" />
    </div>
  );
}
