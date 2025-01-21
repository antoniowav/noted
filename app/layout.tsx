import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata = {
  title: "noted.",
  description: "A simple and efficient note-taking application",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Providers>
              <div className="flex min-h-screen flex-col">
                <main className="min-h-screen bg-background">{children}</main>
              </div>
            </Providers>
          </AuthProvider>
          <Toaster position="top-right" expand={false} richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
