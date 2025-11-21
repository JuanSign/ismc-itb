import type { Metadata } from "next";
import { gigaSans, poppins } from "./fonts";
import "./globals.css";
import PageTransition from "@/components/PageTransition/PageTransition";

export const metadata: Metadata = {
  title: "ISMC XV",
  description: "Indonesian Students Mining Competition",
  icons: {
    icon: "/icon.png?v=2",          
    shortcut: "/favicon.ico?v=2",
    apple: "/apple-touch-icon.png?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${gigaSans.variable} ${poppins.variable} antialiased dark`}
      >
        <PageTransition>
        {children}
        </PageTransition>
      </body>
    </html>
  );
}