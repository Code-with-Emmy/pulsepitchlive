import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import AdsterraPopunder from "@/components/AdsterraPopunder";
import AdsterraSocialBar from "@/components/AdsterraSocialBar";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "PulsePitch Live",
  description: "PulsePitch Live scores and streams powered by SportSRC V2",
};

const ADSTERRA_SOCIAL_BAR_CODE =
  process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_CODE;
const ADSTERRA_SOCIAL_BAR_DELAY_MS = Number.parseInt(
  process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_DELAY_MS ?? "8000",
  10,
);
const ADSTERRA_POPUNDER_CODE =
  process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_CODE;
const ADSTERRA_POPUNDER_COOLDOWN_MS = Number.parseInt(
  process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_COOLDOWN_MS ?? "86400000",
  10,
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const stored = localStorage.getItem("theme");
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                const theme = stored === "dark" || stored === "light" ? stored : (prefersDark ? "dark" : "light");
                document.documentElement.classList.toggle("dark", theme === "dark");
              } catch {}
            })();`,
          }}
        />
      </head>
      <body
        className={`${manrope.variable} ${plexMono.variable} min-h-screen antialiased`}
      >
        {children}
        <AdsterraSocialBar
          code={ADSTERRA_SOCIAL_BAR_CODE}
          delayMs={
            Number.isFinite(ADSTERRA_SOCIAL_BAR_DELAY_MS)
              ? ADSTERRA_SOCIAL_BAR_DELAY_MS
              : 8000
          }
        />
        <AdsterraPopunder
          code={ADSTERRA_POPUNDER_CODE}
          cooldownMs={
            Number.isFinite(ADSTERRA_POPUNDER_COOLDOWN_MS)
              ? ADSTERRA_POPUNDER_COOLDOWN_MS
              : 86400000
          }
        />
      </body>
      <Analytics />
    </html>
  );
}
