import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import AuthProvider from "@/components/auth-provider";

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
            <AuthProvider initialUser={null}>{children}</AuthProvider>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
