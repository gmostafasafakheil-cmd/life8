import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import PWAInstall from "@/components/PWAInstall";
import "./globals.css";

export const metadata: Metadata = {
  title: "لایف استایل | مدیریت زندگی",
  description: "لایف استایل — سیستم مدیریت وظایف حرفه‌ای فارسی",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "لایف استایل",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#4F46E5",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="لایف استایل" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__pwaPrompt=null;window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__pwaPrompt=e;});`,
          }}
        />
      </head>
      <body className="bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 text-slate-900 antialiased min-h-screen overscroll-none">
        {children}
        <PWAInstall />
      </body>
    </html>
  );
}
