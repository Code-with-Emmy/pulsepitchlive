import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";

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
      <body className={`${manrope.variable} ${plexMono.variable} min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
