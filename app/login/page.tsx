import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams: { error },
}: {
  searchParams: { error?: string };
}) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return (
    <div className="container max-w-lg mx-auto px-4 py-20">
      <div className="rounded-xl border bg-card p-8 shadow-sm">
        <div className="space-y-2 mb-8 text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        {error && (
          <div className="text-red-500 mb-4">
            {error === "OAuthCallback"
              ? "There was a problem signing you in. Please try again."
              : "An error occurred during sign in."}
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
