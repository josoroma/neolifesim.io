import Link from "next/link";
import styles from "./page.module.css";

export default function MainMenu() {
  return (
    <main className={styles.page}>
      <h1>NeoLifeSim</h1>
      <p>Snake Survival Game</p>

      <nav className={styles.nav}>
        <Link href="/game/new">New Game</Link>
      </nav>
    </main>
  );
}
