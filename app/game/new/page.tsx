'use client';

import type { JSX } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSetAtom } from 'jotai';
import {
  SnakeSpecies,
  Gender,
  SPECIES_STATS,
  type SpeciesStats,
} from '@/game/engine/types';
import { createCharacter, validateName } from '@/game/engine/character';
import { playerAtom } from '@/game/state';
import styles from './page.module.css';

// ---------------------------------------------------------------------------
// Species metadata for UI cards
// TODO(S5): Move commonName / description into engine types when entity
//           metadata grows (E5+) so this stays in sync automatically.
// ---------------------------------------------------------------------------

interface SpeciesCard {
  readonly species: SnakeSpecies;
  readonly commonName: string;
  readonly description: string;
  readonly emoji: string;
  readonly stats: SpeciesStats;
}

const SPECIES_CARDS: readonly SpeciesCard[] = [
  {
    species: SnakeSpecies.BocaracaAmarilla,
    commonName: 'Yellow Bocaracá',
    description: 'Balanced — moderate stats across the board.',
    emoji: '🐍',
    stats: SPECIES_STATS[SnakeSpecies.BocaracaAmarilla],
  },
  {
    species: SnakeSpecies.Terciopelo,
    commonName: 'Fer-de-lance',
    description: 'Powerful venom and high health, but slower.',
    emoji: '🐉',
    stats: SPECIES_STATS[SnakeSpecies.Terciopelo],
  },
  {
    species: SnakeSpecies.SerpienteLora,
    commonName: 'Parrot Snake',
    description: 'Fast and stealthy, but fragile with weaker venom.',
    emoji: '🌿',
    stats: SPECIES_STATS[SnakeSpecies.SerpienteLora],
  },
] as const;

// ---------------------------------------------------------------------------
// Stat bar helper
// ---------------------------------------------------------------------------

function statFillLevel(pct: number): 'high' | 'mid' | 'low' {
  if (pct > 60) return 'high';
  if (pct > 35) return 'mid';
  return 'low';
}

function StatBar({ label, value, max = 120 }: { label: string; value: number; max?: number }): JSX.Element {
  const pct = Math.round((value / max) * 100);
  return (
    <div className={styles.statRow}>
      <span className={styles.statLabel}>{label}</span>
      <div className={styles.statTrack}>
        <div
          className={styles.statFill}
          data-level={statFillLevel(pct)}
          style={{ '--fill-pct': `${pct}%` } as React.CSSProperties}
        />
      </div>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Character Creation Page
// ---------------------------------------------------------------------------

export default function CharacterCreationPage(): JSX.Element {
  const router = useRouter();
  const setPlayer = useSetAtom(playerAtom);

  const [selectedSpecies, setSelectedSpecies] = useState<SnakeSpecies | null>(null);
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Refs for roving tabindex focus management
  const speciesRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const genderRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Live validation — computed on every render
  const nameValidation = useMemo(() => validateName(name), [name]);

  const canStart = selectedSpecies !== null && selectedGender !== null && nameValidation.valid;

  // Show validation feedback after first submit attempt or after typing
  const showNameError = (!nameValidation.valid && name.length > 0) || (submitted && !nameValidation.valid);

  const handleStart = useCallback((): void => {
    setSubmitted(true);

    if (!selectedSpecies || !selectedGender) {
      setError(
        !selectedSpecies
          ? 'Please select a species'
          : 'Please select a gender',
      );
      return;
    }

    if (!nameValidation.valid) {
      setError(nameValidation.error ?? 'Invalid name');
      return;
    }

    try {
      const character = createCharacter(selectedSpecies, selectedGender, name);
      setPlayer(character);
      router.push('/game');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create character');
    }
  }, [selectedSpecies, selectedGender, name, nameValidation, setPlayer, router]);

  /** Handle arrow-key navigation within a radiogroup (WAI-ARIA pattern). */
  const handleRadioKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLButtonElement>,
      refs: React.RefObject<(HTMLButtonElement | null)[]>,
      index: number,
    ): void => {
      const items = refs.current;
      if (!items) return;
      let next = -1;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        next = (index + 1) % items.length;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        next = (index - 1 + items.length) % items.length;
      }
      if (next >= 0) {
        e.preventDefault();
        items[next]?.focus();
        items[next]?.click();
      }
    },
    [],
  );

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Create Your Snake</h1>

      {/* ---- Species Selector (T-2.2.2) ---- */}
      <fieldset className={`${styles.section} ${styles.fieldset}`}>
        <legend className={styles.legend}>Choose Species</legend>
        <div className={styles.speciesGrid} role="radiogroup" aria-label="Snake species">
          {SPECIES_CARDS.map((card, idx) => {
            const isSelected = selectedSpecies === card.species;
            return (
              <button
                key={card.species}
                ref={(el) => { speciesRefs.current[idx] = el; }}
                type="button"
                role="radio"
                aria-checked={isSelected ? 'true' : 'false'}
                tabIndex={isSelected || (selectedSpecies === null && idx === 0) ? 0 : -1}
                onClick={() => setSelectedSpecies(card.species)}
                onKeyDown={(e) => handleRadioKeyDown(e, speciesRefs, idx)}
                data-selected={isSelected}
                className={styles.speciesCard}
              >
                <div className={styles.speciesEmoji}>{card.emoji}</div>
                <div className={styles.speciesName}>{card.species}</div>
                <div className={styles.speciesCommon}>{card.commonName}</div>
                <div className={styles.speciesDesc}>{card.description}</div>
                <StatBar label="Speed" value={card.stats.speed} max={100} />
                <StatBar label="Stealth" value={card.stats.stealth} max={100} />
                <StatBar label="Venom" value={card.stats.venom} max={100} />
                <StatBar label="Health" value={card.stats.maxHealth} />
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* ---- Gender Selector (T-2.2.3) ---- */}
      <fieldset className={`${styles.section} ${styles.fieldset}`}>
        <legend className={styles.legend}>Choose Gender</legend>
        <div className={styles.genderRow} role="radiogroup" aria-label="Character gender">
          {([Gender.Male, Gender.Female] as const).map((g, idx) => {
            const isSelected = selectedGender === g;
            return (
              <button
                key={g}
                ref={(el) => { genderRefs.current[idx] = el; }}
                type="button"
                role="radio"
                aria-checked={isSelected ? 'true' : 'false'}
                tabIndex={isSelected || (selectedGender === null && idx === 0) ? 0 : -1}
                onClick={() => setSelectedGender(g)}
                onKeyDown={(e) => handleRadioKeyDown(e, genderRefs, idx)}
                data-selected={isSelected}
                className={styles.genderBtn}
              >
                {g === Gender.Male ? '♂' : '♀'} {g}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* ---- Name Input (T-2.2.4) ---- */}
      <div className={styles.section}>
        <label htmlFor="snake-name" className={styles.nameLabel}>
          Name Your Snake
        </label>
        <input
          id="snake-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          placeholder="Enter a name…"
          maxLength={20}
          aria-invalid={showNameError ? 'true' : undefined}
          aria-describedby={showNameError ? 'name-error' : undefined}
          data-invalid={showNameError}
          className={styles.nameInput}
        />
        {showNameError && (
          <p id="name-error" role="alert" className={styles.validationError}>
            {nameValidation.error}
          </p>
        )}
      </div>

      {/* ---- Error display ---- */}
      {error && (
        <p role="alert" className={styles.formError}>
          {error}
        </p>
      )}

      {/* ---- Start Button (T-2.2.5) ---- */}
      <button
        type="button"
        onClick={handleStart}
        className={styles.startBtn}
        disabled={submitted && !canStart}
      >
        Start Game
      </button>

      {/* ---- Back link ---- */}
      <Link href="/" className={styles.backLink}>
        ← Back to Menu
      </Link>
    </main>
  );
}
