import { describe, it, expect } from 'vitest';
import {
  createCharacter,
  validateName,
  MAX_NAME_LENGTH,
} from '../character';
import {
  SnakeSpecies,
  Gender,
  SPECIES_STATS,
} from '../types';

// ---------------------------------------------------------------------------
// validateName
// ---------------------------------------------------------------------------

describe('validateName', () => {
  it('accepts a valid name', () => {
    const result = validateName('Naga');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('rejects an empty string', () => {
    const result = validateName('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Name is required');
  });

  it('rejects a whitespace-only string', () => {
    const result = validateName('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Name is required');
  });

  it(`rejects a name longer than ${MAX_NAME_LENGTH} characters`, () => {
    const longName = 'A'.repeat(MAX_NAME_LENGTH + 1);
    const result = validateName(longName);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(
      `Name must be ${MAX_NAME_LENGTH} characters or less`,
    );
  });

  it(`accepts a name exactly ${MAX_NAME_LENGTH} characters long`, () => {
    const exactName = 'A'.repeat(MAX_NAME_LENGTH);
    const result = validateName(exactName);
    expect(result.valid).toBe(true);
  });

  it('accepts a name with unicode characters', () => {
    const result = validateName('Ñandú');
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// createCharacter
// ---------------------------------------------------------------------------

describe('createCharacter', () => {
  it('creates a character with correct defaults', () => {
    const character = createCharacter(
      SnakeSpecies.Terciopelo,
      Gender.Female,
      'Naga',
    );

    expect(character.name).toBe('Naga');
    expect(character.species).toBe(SnakeSpecies.Terciopelo);
    expect(character.gender).toBe(Gender.Female);
    expect(character.level).toBe(1);
    expect(character.xp).toBe(0);
  });

  it('trims whitespace from the name', () => {
    const character = createCharacter(
      SnakeSpecies.BocaracaAmarilla,
      Gender.Male,
      '  Slither  ',
    );
    expect(character.name).toBe('Slither');
  });

  it('loads species-specific stats for Bocaracá amarilla', () => {
    const character = createCharacter(
      SnakeSpecies.BocaracaAmarilla,
      Gender.Male,
      'Boca',
    );
    expect(character.stats).toEqual(SPECIES_STATS[SnakeSpecies.BocaracaAmarilla]);
  });

  it('loads species-specific stats for Terciopelo', () => {
    const character = createCharacter(
      SnakeSpecies.Terciopelo,
      Gender.Female,
      'Viper',
    );
    expect(character.stats).toEqual(SPECIES_STATS[SnakeSpecies.Terciopelo]);
  });

  it('loads species-specific stats for Serpiente lora', () => {
    const character = createCharacter(
      SnakeSpecies.SerpienteLora,
      Gender.Male,
      'Lora',
    );
    expect(character.stats).toEqual(SPECIES_STATS[SnakeSpecies.SerpienteLora]);
  });

  it('throws on empty name', () => {
    expect(() =>
      createCharacter(SnakeSpecies.Terciopelo, Gender.Male, ''),
    ).toThrow('Name is required');
  });

  it('throws on whitespace-only name', () => {
    expect(() =>
      createCharacter(SnakeSpecies.Terciopelo, Gender.Female, '   '),
    ).toThrow('Name is required');
  });

  it(`throws on name exceeding ${MAX_NAME_LENGTH} characters`, () => {
    const longName = 'X'.repeat(MAX_NAME_LENGTH + 1);
    expect(() =>
      createCharacter(SnakeSpecies.SerpienteLora, Gender.Male, longName),
    ).toThrow(`Name must be ${MAX_NAME_LENGTH} characters or less`);
  });
});

// ---------------------------------------------------------------------------
// SnakeSpecies enum
// ---------------------------------------------------------------------------

describe('SnakeSpecies enum', () => {
  it('contains exactly 3 species', () => {
    const speciesValues = Object.values(SnakeSpecies);
    expect(speciesValues).toHaveLength(3);
  });

  it.each([
    ['Bocaracá amarilla', SnakeSpecies.BocaracaAmarilla],
    ['Terciopelo', SnakeSpecies.Terciopelo],
    ['Serpiente lora', SnakeSpecies.SerpienteLora],
  ])('includes %s', (displayName, enumValue) => {
    expect(enumValue).toBe(displayName);
  });
});

// ---------------------------------------------------------------------------
// SPECIES_STATS completeness
// ---------------------------------------------------------------------------

describe('SPECIES_STATS', () => {
  it('has stats defined for every species', () => {
    for (const species of Object.values(SnakeSpecies)) {
      const stats = SPECIES_STATS[species];
      expect(stats).toBeDefined();
      expect(stats.speed).toBeGreaterThan(0);
      expect(stats.stealth).toBeGreaterThan(0);
      expect(stats.venom).toBeGreaterThan(0);
      expect(stats.maxHealth).toBeGreaterThan(0);
    }
  });

  it('returns different stats for different species', () => {
    const boca = SPECIES_STATS[SnakeSpecies.BocaracaAmarilla];
    const terc = SPECIES_STATS[SnakeSpecies.Terciopelo];
    const lora = SPECIES_STATS[SnakeSpecies.SerpienteLora];

    // At least one stat should differ between each pair
    expect(boca).not.toEqual(terc);
    expect(boca).not.toEqual(lora);
    expect(terc).not.toEqual(lora);
  });
});
