import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ZEN | Creative Marketing Agency",
  description:
    "ZEN Agency creates a clear direction for brands, strong digital positioning, and a growth strategy that unites idea, system, and result.",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className={`${outfit.className} min-h-full flex flex-col`}>
        <ThemeProvider>
          <div
            id="zen-root"
            className="flex min-h-full flex-1 flex-col"
            suppressHydrationWarning
          >
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
