import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import AdsterraPopunder from "@/components/AdsterraPopunder";
import AdsterraSocialBar from "@/components/AdsterraSocialBar";
import EzoicRouteHandler from "@/components/EzoicRouteHandler";

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
  title: {
    default: "PulsePitch Live | Real-Time Scores & Football Streams",
    template: "%s | PulsePitch Live"
  },
  description: "Experience the pulse of the pitch with real-time scores, live match updates, and high-quality football streams. Powered by SportSRC V2.",
  keywords: ["football live scores", "live soccer streams", "match fixtures", "real-time sports updates", "PulsePitch Live", "premier league scores"],
  authors: [{ name: "PulsePitch Team" }],
  creator: "PulsePitch Live",
  publisher: "PulsePitch Live",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "PulsePitch Live | Real-Time Scores & Football Streams",
    description: "Get real-time scores and live football streams. Never miss a goal with PulsePitch Live.",
    url: "https://pulsepitch.live",
    siteName: "PulsePitch Live",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PulsePitch Live - Live Scores & Streams",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PulsePitch Live | Real-Time Scores & Football Streams",
    description: "Real-time scores and live football streams at your fingertips.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "djd0NiEJZx33oLyKi35vty0_eeWGMiA1DuFkRlJMDvI",
  },
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
        {/* Google AdSense - Top of head for faster verification */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9765234827600801"
          crossOrigin="anonymous"
        />
        <meta name="google-adsense-account" content="ca-pub-9765234827600801" />
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
        {/* Ezoic Scripts */}
        <Script
          id="ezoic-cmp"
          src="https://cmp.gatekeeperconsent.com/min.js"
          strategy="beforeInteractive"
          data-cfasync="false"
        />
        <Script
          id="ezoic-cmp-2"
          src="https://the.gatekeeperconsent.com/cmp.min.js"
          strategy="beforeInteractive"
          data-cfasync="false"
        />
        <Script
          id="ezoic-sa"
          src="//www.ezojs.com/ezoic/sa.min.js"
          strategy="afterInteractive"
        />
        <Script id="ezoic-init" strategy="afterInteractive">
          {`
            window.ezstandalone = window.ezstandalone || {};
            window.ezstandalone.cmd = window.ezstandalone.cmd || [];
          `}
        </Script>
        <Script
          id="ezoic-analytics"
          src="//ezoicanalytics.com/analytics.js"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${manrope.variable} ${plexMono.variable} min-h-screen antialiased`}
      >
        <EzoicRouteHandler />
        {children}
        
        <footer className="mt-12 border-t border-(--ls-border) bg-(--ls-header) py-12">
          <div className="mx-auto max-w-[1500px] px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr]">
              <div>
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="PulsePitch Live" className="h-10 w-auto" />
                  <p className="text-xl font-black uppercase tracking-[0.18em] text-(--ls-text)">
                    PulsePitch Live
                  </p>
                </div>
                <p className="mt-4 max-w-md text-sm leading-7 text-(--ls-muted)">
                  PulsePitch Live is your ultimate destination for real-time football scores, live match updates, and high-quality streaming links. We bring you the pulse of the pitch from leagues all around the world, including the Premier League, La Liga, Serie A, Bundesliga, Ligue 1, and the Champions League. Our mission is to provide football fans with a seamless, fast, and comprehensive viewing experience, ensuring you never miss a moment of the action. Whether you're tracking live scores, checking upcoming fixtures, or looking for reliable match streams, PulsePitch Live has you covered with the latest technology and real-time data.
                </p>
                <div className="mt-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-(--ls-text)">Why Choose PulsePitch?</h4>
                  <p className="mt-2 text-xs leading-5 text-(--ls-muted)">
                    Our platform is optimized for speed and reliability. We aggregate data from multiple premium sources to provide the most accurate live scores and match statistics. Our stream selection algorithm prioritizes high-definition sources with low latency, giving you the best seat in the stadium from the comfort of your home.
                  </p>
                </div>
                <div className="mt-6 flex gap-4">
                  {/* Social placeholders could go here */}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-(--ls-text)">Quick Links</h3>
                <ul className="mt-4 space-y-3 text-sm font-semibold text-(--ls-muted)">
                  <li><Link href="/" className="transition hover:text-(--ls-accent)">Live Scores</Link></li>
                  <li><Link href="/" className="transition hover:text-(--ls-accent)">Upcoming Fixtures</Link></li>
                  <li><Link href="/" className="transition hover:text-(--ls-accent)">Finished Results</Link></li>
                  <li><Link href="/" className="transition hover:text-(--ls-accent)">Pinned Leagues</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-(--ls-text)">SEO Keywords</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Live Football", "Soccer Scores", "Real-time Updates", "Match Streams", "Premier League", "Live Sports", "Goal Alerts"].map(kw => (
                    <span key={kw} className="rounded-full border border-(--ls-border) bg-(--ls-panel-alt) px-3 py-1 text-[11px] font-bold text-(--ls-muted)">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-(--ls-border) pt-8 md:flex-row">
              <p className="text-xs font-semibold text-(--ls-muted)">
                &copy; {new Date().getFullYear()} PulsePitch Live. All rights reserved. Powered by SportSRC V2.
              </p>
              <div className="flex gap-6 text-xs font-bold text-(--ls-muted)">
                <Link href="/" className="hover:text-(--ls-text)">Privacy Policy</Link>
                <Link href="/" className="hover:text-(--ls-text)">Terms of Service</Link>
                <Link href="/" className="hover:text-(--ls-text)">Contact Us</Link>
              </div>
            </div>
          </div>
        </footer>

        {process.env.NEXT_PUBLIC_DISABLE_POPUNDERS !== "true" && (
          <AdsterraSocialBar
            code={ADSTERRA_SOCIAL_BAR_CODE}
            delayMs={
              Number.isFinite(ADSTERRA_SOCIAL_BAR_DELAY_MS)
                ? ADSTERRA_SOCIAL_BAR_DELAY_MS
                : 8000
            }
          />
        )}
        {process.env.NEXT_PUBLIC_DISABLE_POPUNDERS !== "true" && (
          <AdsterraPopunder
            code={ADSTERRA_POPUNDER_CODE}
            cooldownMs={
              Number.isFinite(ADSTERRA_POPUNDER_COOLDOWN_MS)
                ? ADSTERRA_POPUNDER_COOLDOWN_MS
                : 86400000
            }
          />
        )}
      </body>
      <Analytics />
    </html>
  );
}
