import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Habit to Health - Small habits. Real health.",
  description:
    "A gentle habit-building companion. Track what matters, without pressure.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
