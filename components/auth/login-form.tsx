"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  return (
    <div className="space-y-4">
      <Button
        className="w-full"
        variant="outline"
        onClick={() => signIn("github", { callbackUrl: "/" })}
      >
        Continue with GitHub
      </Button>
      <Button
        className="w-full"
        variant="outline"
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        Continue with Google
      </Button>
    </div>
  );
}
