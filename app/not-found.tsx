import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-20">
      <div className="rounded-xl border bg-gradient-to-b from-card to-card/50 p-8 shadow-lg text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
            404
          </h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
          <Link href="/">
            <Button
              variant="outline"
              className="hover:bg-primary/10 hover:text-primary"
            >
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
