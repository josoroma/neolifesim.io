// @vitest-environment jsdom
/**
 * UI component tests for the Character Creation page (US-2.2).
 *
 * Covers both Gherkin acceptance scenarios:
 *   SC-2.2.1 — Navigate to character creation screen
 *   SC-2.2.2 — Complete character creation and start the game
 */

import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks — must be declared before the component import
// ---------------------------------------------------------------------------

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// CSS modules are automatically stubbed by vitest config (classNameStrategy: non-scoped).
// We do NOT need to mock them explicitly.

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import CharacterCreationPage from '../page';
import { SnakeSpecies, SPECIES_STATS } from '@/game/engine/types';
import { playerAtom } from '@/game/state';
import { createStore, Provider } from 'jotai';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Render the page inside a fresh Jotai provider. */
function renderPage(store?: ReturnType<typeof createStore>): ReturnType<typeof render> {
  if (store) {
    return render(
      <Provider store={store}>
        <CharacterCreationPage />
      </Provider>,
    );
  }
  // jotai v2 works provider-less in tests — atoms are scoped to default store.
  return render(<CharacterCreationPage />);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CharacterCreationPage', () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  // -----------------------------------------------------------------------
  // SC-2.2.1 — Navigate to character creation screen
  // -----------------------------------------------------------------------

  describe('SC-2.2.1: Renders creation screen with all options', () => {
    it('renders the page heading', () => {
      renderPage();
      expect(
        screen.getByRole('heading', { name: /create your snake/i }),
      ).toBeDefined();
    });

    it('shows all three species cards', () => {
      renderPage();
      const speciesGroup = screen.getByRole('radiogroup', {
        name: /snake species/i,
      });
      const cards = within(speciesGroup).getAllByRole('radio');
      expect(cards).toHaveLength(3);

      // Verify each species name is present
      expect(screen.getByText(SnakeSpecies.BocaracaAmarilla)).toBeDefined();
      expect(screen.getByText(SnakeSpecies.Terciopelo)).toBeDefined();
      expect(screen.getByText(SnakeSpecies.SerpienteLora)).toBeDefined();
    });

    it('shows gender selector with Male and Female options', () => {
      renderPage();
      const genderGroup = screen.getByRole('radiogroup', {
        name: /character gender/i,
      });
      const options = within(genderGroup).getAllByRole('radio');
      expect(options).toHaveLength(2);
      expect(screen.getByText(/♂ Male/)).toBeDefined();
      expect(screen.getByText(/♀ Female/)).toBeDefined();
    });

    it('shows the name input with label', () => {
      renderPage();
      const input = screen.getByLabelText(/name your snake/i);
      expect(input).toBeDefined();
      expect((input as HTMLInputElement).maxLength).toBe(20);
    });

    it('shows the start button', () => {
      renderPage();
      expect(
        screen.getByRole('button', { name: /start game/i }),
      ).toBeDefined();
    });

    it('shows stat bars for each species card', () => {
      renderPage();
      // Each of the 3 species should have 4 stats shown: Speed, Stealth, Venom, Health
      const speedLabels = screen.getAllByText('Speed');
      const stealthLabels = screen.getAllByText('Stealth');
      const venomLabels = screen.getAllByText('Venom');
      const healthLabels = screen.getAllByText('Health');

      expect(speedLabels).toHaveLength(3);
      expect(stealthLabels).toHaveLength(3);
      expect(venomLabels).toHaveLength(3);
      expect(healthLabels).toHaveLength(3);
    });

    it('shows a back link to main menu', () => {
      renderPage();
      const backLink = screen.getByRole('link', { name: /back to menu/i });
      expect(backLink).toBeDefined();
      expect((backLink as HTMLAnchorElement).getAttribute('href')).toBe('/');
    });
  });

  // -----------------------------------------------------------------------
  // SC-2.2.2 — Complete character creation and start the game
  // -----------------------------------------------------------------------

  describe('SC-2.2.2: Full creation flow', () => {
    it('selects species, gender, enters name, and navigates to /game', async () => {
      const user = userEvent.setup();
      renderPage();

      // 1. Select species — click the Terciopelo card
      const speciesGroup = screen.getByRole('radiogroup', {
        name: /snake species/i,
      });
      const speciesCards = within(speciesGroup).getAllByRole('radio');
      // Terciopelo is the second card (index 1)
      await user.click(speciesCards[1]!);
      expect(speciesCards[1]!.getAttribute('aria-checked')).toBe('true');

      // 2. Select gender — click Female
      const genderGroup = screen.getByRole('radiogroup', {
        name: /character gender/i,
      });
      const genderOptions = within(genderGroup).getAllByRole('radio');
      // Female is second (index 1)
      await user.click(genderOptions[1]!);
      expect(genderOptions[1]!.getAttribute('aria-checked')).toBe('true');

      // 3. Type a name
      const nameInput = screen.getByLabelText(/name your snake/i);
      await user.type(nameInput, 'Viper');
      expect((nameInput as HTMLInputElement).value).toBe('Viper');

      // 4. Click Start
      const startBtn = screen.getByRole('button', { name: /start game/i });
      await user.click(startBtn);

      // 5. Verify navigation to /game
      expect(pushMock).toHaveBeenCalledWith('/game');
    });

    it('shows validation error when Start is clicked without selecting species', async () => {
      const user = userEvent.setup();
      renderPage();

      // Only enter a name, skip species & gender
      const nameInput = screen.getByLabelText(/name your snake/i);
      await user.type(nameInput, 'Test');

      const startBtn = screen.getByRole('button', { name: /start game/i });
      await user.click(startBtn);

      // Should show species error
      expect(screen.getByText(/please select a species/i)).toBeDefined();
      expect(pushMock).not.toHaveBeenCalled();
    });

    it('shows validation error when Start is clicked without selecting gender', async () => {
      const user = userEvent.setup();
      renderPage();

      // Select species but skip gender
      const speciesGroup = screen.getByRole('radiogroup', {
        name: /snake species/i,
      });
      const speciesCards = within(speciesGroup).getAllByRole('radio');
      await user.click(speciesCards[0]!);

      const nameInput = screen.getByLabelText(/name your snake/i);
      await user.type(nameInput, 'Test');

      const startBtn = screen.getByRole('button', { name: /start game/i });
      await user.click(startBtn);

      // Should show gender error
      expect(screen.getByText(/please select a gender/i)).toBeDefined();
      expect(pushMock).not.toHaveBeenCalled();
    });

    it('shows validation error when Start is clicked with an empty name', async () => {
      const user = userEvent.setup();
      renderPage();

      // Select species and gender but leave name empty
      const speciesGroup = screen.getByRole('radiogroup', {
        name: /snake species/i,
      });
      const speciesCards = within(speciesGroup).getAllByRole('radio');
      await user.click(speciesCards[0]!);

      const genderGroup = screen.getByRole('radiogroup', {
        name: /character gender/i,
      });
      const genderOptions = within(genderGroup).getAllByRole('radio');
      await user.click(genderOptions[0]!);

      const startBtn = screen.getByRole('button', { name: /start game/i });
      await user.click(startBtn);

      // Should show name required error (may appear in both inline + form-level alerts)
      const nameErrors = screen.getAllByText(/name is required/i);
      expect(nameErrors.length).toBeGreaterThanOrEqual(1);
      expect(pushMock).not.toHaveBeenCalled();
    });

    it('correctly renders stat values from SPECIES_STATS', () => {
      renderPage();
      // Terciopelo has venom=75 — should appear as text
      const venomValue = SPECIES_STATS[SnakeSpecies.Terciopelo].venom;
      expect(screen.getByText(String(venomValue))).toBeDefined();

      // Serpiente lora has speed=70
      const speedValue = SPECIES_STATS[SnakeSpecies.SerpienteLora].speed;
      expect(screen.getByText(String(speedValue))).toBeDefined();
    });

    it('toggles species selection — only one is selected at a time', async () => {
      const user = userEvent.setup();
      renderPage();

      const speciesGroup = screen.getByRole('radiogroup', {
        name: /snake species/i,
      });
      const cards = within(speciesGroup).getAllByRole('radio');

      // Select first
      await user.click(cards[0]!);
      expect(cards[0]!.getAttribute('aria-checked')).toBe('true');
      expect(cards[1]!.getAttribute('aria-checked')).toBe('false');

      // Switch to second
      await user.click(cards[1]!);
      expect(cards[0]!.getAttribute('aria-checked')).toBe('false');
      expect(cards[1]!.getAttribute('aria-checked')).toBe('true');
    });

    it('writes the correct PlayerCharacter to playerAtom on Start', async () => {
      const store = createStore();
      const user = userEvent.setup();
      renderPage(store);

      // Select Terciopelo (index 1)
      const speciesGroup = screen.getByRole('radiogroup', {
        name: /snake species/i,
      });
      const speciesCards = within(speciesGroup).getAllByRole('radio');
      await user.click(speciesCards[1]!);

      // Select Female (index 1)
      const genderGroup = screen.getByRole('radiogroup', {
        name: /character gender/i,
      });
      const genderOptions = within(genderGroup).getAllByRole('radio');
      await user.click(genderOptions[1]!);

      // Enter name
      const nameInput = screen.getByLabelText(/name your snake/i);
      await user.type(nameInput, 'Naga');

      // Click Start
      const startBtn = screen.getByRole('button', { name: /start game/i });
      await user.click(startBtn);

      // Verify the atom was written with the expected character
      const player = store.get(playerAtom);
      expect(player).not.toBeNull();
      expect(player!.name).toBe('Naga');
      expect(player!.species).toBe('Terciopelo');
      expect(player!.gender).toBe('Female');
      expect(player!.level).toBe(1);
      expect(player!.xp).toBe(0);
      expect(player!.stats).toEqual(SPECIES_STATS[SnakeSpecies.Terciopelo]);
    });
  });
});
