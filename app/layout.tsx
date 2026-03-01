import type { Metadata } from "next";
import { GameStateProvider } from "@/game/state";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeoLifeSim — Snake Survival Game",
  description:
    "A snake survival simulation set in a tropical coastal forest ecosystem with a dynamic day/night cycle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <GameStateProvider>{children}</GameStateProvider>
      </body>
    </html>
  );
}
