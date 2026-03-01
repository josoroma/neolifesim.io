"use client";

export default function GamePage() {
  return (
    <main
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <div id="game-container">
        <p>Game screen — Phaser will be initialized here.</p>
      </div>
    </main>
  );
}
