"use client";

import { useEffect, useRef } from "react";

export default function GamePage() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let cancelled = false;

    import("phaser").then((Phaser) => {
      if (cancelled) return;

      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: "game-container",
        width: 800,
        height: 600,
        backgroundColor: "#1a1a2e",
        scene: {
          create() {
            this.add
              .text(400, 300, "Phaser Loaded ✓", {
                fontSize: "24px",
                color: "#e0e0e0",
              })
              .setOrigin(0.5);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <main
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <div id="game-container" />
    </main>
  );
}
