import type { Metadata } from "next";
import { gigaSans, poppins } from "./fonts";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}