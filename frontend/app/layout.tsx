import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import AuthProvider from "@/components/auth-provider";
import { ToastProvider } from "@/components/ui/toast-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider initialUser={null}>
              <ToastProvider>{children}</ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
