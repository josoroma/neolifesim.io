import Link from "next/link";

export default function MainMenu() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "1.5rem",
      }}
    >
      <h1>NeoLifeSim</h1>
      <p>Snake Survival Game</p>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          marginTop: "2rem",
        }}
      >
        <Link href="/game">New Game</Link>
      </nav>
    </main>
  );
}
