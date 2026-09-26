import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { RondaProvider } from "@/components/ronda-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { ToastProvider } from "@/components/toast";
import "./globals.css";

const display = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sans = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Ronda — reto diario de grupo",
  description:
    "Un minijuego nuevo cada día. Compite con tu grupo y llévate la corona.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ToastProvider>
          <ErrorBoundary>
            <RondaProvider>{children}</RondaProvider>
          </ErrorBoundary>
        </ToastProvider>
      </body>
    </html>
  );
}
