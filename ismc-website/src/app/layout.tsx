import type { Metadata } from "next";
import { gigaSans, poppins } from "./fonts";
import "./globals.css";
import PageTransition from "@/components/PageTransition/PageTransition";

export const metadata: Metadata = {
  title: "ISMC XV",
  description: "Indonesian Students Mining Competition",
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