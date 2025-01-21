import Link from "next/link";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Nav() {
  return (
    <nav className="flex items-center gap-4 px-4 py-2">
      <Link href="/calendar">
        <Button variant="ghost" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          Calendar View
        </Button>
      </Link>
    </nav>
  );
}
