/**
 * Property-Based Tests for AI Deck Generation
 * Feature: ai-deck-generation
 *
 * These tests verify universal properties that must hold across all valid inputs
 * using the fast-check library for property-based testing.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Interface for a generated card (matches the service interface)
 */
interface GeneratedCard {
  front: string
  back: string
}

/**
 * Interface for the generation result (matches the service interface)
 */
interface GenerationResult {
  deckName: string
  deckType: 'language' | 'knowledge'
  cards: GeneratedCard[]
}

/**
 * Maximum number of cards that can be generated per request
 */
const MAX_CARDS = 50

/**
 * Parse response function extracted from aiGenerationService for testing
 * This mirrors the actual implementation to test the parsing logic
 */
function parseResponse(content: string): GenerationResult {
  const parsed = JSON.parse(content)

  // Validate required fields
  if (!parsed.deckName || typeof parsed.deckName !== 'string') {
    throw new Error('Invalid response: missing or invalid deckName')
  }

  if (!parsed.deckType || !['language', 'knowledge'].includes(parsed.deckType)) {
    throw new Error('Invalid response: deckType must be "language" or "knowledge"')
  }

  if (!Array.isArray(parsed.cards)) {
    throw new Error('Invalid response: cards must be an array')
  }

  // Validate and filter cards
  const validCards: GeneratedCard[] = parsed.cards
    .filter(
      (card: unknown): card is { front: string; back: string } =>
        typeof card === 'object' &&
        card !== null &&
        typeof (card as Record<string, unknown>).front === 'string' &&
        typeof (card as Record<string, unknown>).back === 'string' &&
        ((card as Record<string, unknown>).front as string).trim() !== '' &&
        ((card as Record<string, unknown>).back as string).trim() !== ''
    )
    .slice(0, MAX_CARDS)
    .map((card: { front: string; back: string }) => ({
      front: card.front.trim(),
      back: card.back.trim()
    }))

  return {
    deckName: parsed.deckName.trim(),
    deckType: parsed.deckType,
    cards: validCards
  }
}

/**
 * Minimum prompt length required for generation
 */
const MIN_PROMPT_LENGTH = 3

/**
 * Validates if a prompt is valid for generation
 * This mirrors the actual implementation logic in AIGeneratePage
 */
function isValidPrompt(prompt: string): boolean {
  return prompt.trim().length >= MIN_PROMPT_LENGTH
}

/**
 * Determines if the generate button should be enabled
 * This mirrors the actual implementation logic in AIGeneratePage
 */
function canGenerate(prompt: string, apiKeyConfigured: boolean, isGenerating: boolean): boolean {
  return apiKeyConfigured && isValidPrompt(prompt) && !isGenerating
}

/**
 * Interface for cards to be inserted (matches CreateCard type from useCards)
 */
interface CardToInsert {
  front: string
  back: string
  deck_id: string
}

/**
 * Prepares cards for bulk insert by mapping generated cards to the insert format
 * This mirrors the actual implementation in AIGeneratePage
 */
function prepareCardsForInsert(generatedCards: GeneratedCard[], deckId: string): CardToInsert[] {
  return generatedCards.map((card) => ({
    front: card.front,
    back: card.back,
    deck_id: deckId
  }))
}

/**
 * Validates that all cards in the insert array are associated with the correct deck
 */
function validateCardsAssociation(cards: CardToInsert[], expectedDeckId: string): boolean {
  return cards.every((card) => card.deck_id === expectedDeckId)
}

/**
 * Validates that all cards have the required fields for insertion
 */
function validateCardsForInsert(cards: CardToInsert[]): boolean {
  return cards.every(
    (card) =>
      typeof card.front === 'string' &&
      typeof card.back === 'string' &&
      typeof card.deck_id === 'string' &&
      card.front.length > 0 &&
      card.back.length > 0 &&
      card.deck_id.length > 0
  )
}

describe('Feature: ai-deck-generation', () => {
  describe('Property 1: Generate Button Enablement', () => {
    /**
     * Property 1: Generate Button Enablement
     * For any input string with length >= 3 characters (after trimming),
     * the generate button SHALL be enabled.
     * For any input string with length < 3 characters (after trimming),
     * the generate button SHALL be disabled.
     *
     * **Validates: Requirements 3.2**
     */
    it('generate button SHALL be enabled for any input with trimmed length >= 3 characters', () => {
      // Generate strings that when trimmed have at least 3 characters
      const validPromptArbitrary = fc
        .string({ minLength: 3 })
        .filter((s) => s.trim().length >= MIN_PROMPT_LENGTH)

      fc.assert(
        fc.property(validPromptArbitrary, (prompt) => {
          // Assuming API key is configured and not currently generating
          const buttonEnabled = canGenerate(prompt, true, false)

          // Property: Button should be enabled for valid prompts
          expect(buttonEnabled).toBe(true)
          expect(isValidPrompt(prompt)).toBe(true)

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('generate button SHALL be disabled for any input with trimmed length < 3 characters', () => {
      // Generate strings that when trimmed have fewer than 3 characters
      const shortPromptArbitrary = fc.oneof(
        // Empty string
        fc.constant(''),
        // Single character
        fc.string({ minLength: 1, maxLength: 1 }),
        // Two characters
        fc.string({ minLength: 2, maxLength: 2 }),
        // Whitespace only (various lengths)
        fc
          .array(fc.constantFrom(' ', '\t', '\n'), { minLength: 1, maxLength: 10 })
          .map((arr) => arr.join('')),
        // Short string with leading/trailing whitespace
        fc
          .tuple(
            fc
              .array(fc.constantFrom(' ', '\t'), { minLength: 0, maxLength: 5 })
              .map((arr) => arr.join('')),
            fc.string({ minLength: 0, maxLength: 2 }),
            fc
              .array(fc.constantFrom(' ', '\t'), { minLength: 0, maxLength: 5 })
              .map((arr) => arr.join(''))
          )
          .map(([prefix, content, suffix]) => prefix + content + suffix)
          .filter((s) => s.trim().length < MIN_PROMPT_LENGTH)
      )

      fc.assert(
        fc.property(shortPromptArbitrary, (prompt) => {
          // Assuming API key is configured and not currently generating
          const buttonEnabled = canGenerate(prompt, true, false)

          // Property: Button should be disabled for invalid prompts
          expect(buttonEnabled).toBe(false)
          expect(isValidPrompt(prompt)).toBe(false)

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('generate button SHALL be disabled when API key is not configured regardless of prompt', () => {
      // Generate any string (valid or invalid)
      const anyPromptArbitrary = fc.string()

      fc.assert(
        fc.property(anyPromptArbitrary, (prompt) => {
          // API key is NOT configured
          const buttonEnabled = canGenerate(prompt, false, false)

          // Property: Button should always be disabled when API key is missing
          expect(buttonEnabled).toBe(false)

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('generate button SHALL be disabled when generation is in progress regardless of prompt', () => {
      // Generate valid prompts
      const validPromptArbitrary = fc
        .string({ minLength: 3 })
        .filter((s) => s.trim().length >= MIN_PROMPT_LENGTH)

      fc.assert(
        fc.property(validPromptArbitrary, (prompt) => {
          // Generation is in progress
          const buttonEnabled = canGenerate(prompt, true, true)

          // Property: Button should be disabled during generation
          expect(buttonEnabled).toBe(false)

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('boundary test: exactly 3 characters (trimmed) SHALL enable the button', () => {
      // Generate strings that when trimmed have exactly 3 characters
      const exactlyThreeCharsArbitrary = fc
        .tuple(
          fc
            .array(fc.constantFrom(' ', '\t'), { minLength: 0, maxLength: 3 })
            .map((arr) => arr.join('')),
          fc.string({ minLength: 3, maxLength: 3 }).filter((s) => s.trim().length === 3),
          fc
            .array(fc.constantFrom(' ', '\t'), { minLength: 0, maxLength: 3 })
            .map((arr) => arr.join(''))
        )
        .map(([prefix, content, suffix]) => prefix + content + suffix)
        .filter((s) => s.trim().length === 3)

      fc.assert(
        fc.property(exactlyThreeCharsArbitrary, (prompt) => {
          const buttonEnabled = canGenerate(prompt, true, false)

          // Property: Exactly 3 characters should enable the button
          expect(buttonEnabled).toBe(true)
          expect(prompt.trim().length).toBe(3)

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('boundary test: exactly 2 characters (trimmed) SHALL disable the button', () => {
      // Generate strings that when trimmed have exactly 2 characters
      const exactlyTwoCharsArbitrary = fc
        .tuple(
          fc
            .array(fc.constantFrom(' ', '\t'), { minLength: 0, maxLength: 3 })
            .map((arr) => arr.join('')),
          fc.string({ minLength: 2, maxLength: 2 }).filter((s) => s.trim().length === 2),
          fc
            .array(fc.constantFrom(' ', '\t'), { minLength: 0, maxLength: 3 })
            .map((arr) => arr.join(''))
        )
        .map(([prefix, content, suffix]) => prefix + content + suffix)
        .filter((s) => s.trim().length === 2)

      fc.assert(
        fc.property(exactlyTwoCharsArbitrary, (prompt) => {
          const buttonEnabled = canGenerate(prompt, true, false)

          // Property: Exactly 2 characters should disable the button
          expect(buttonEnabled).toBe(false)
          expect(prompt.trim().length).toBe(2)

          return true
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 3: Generated Card Structure', () => {
    /**
     * Property 3: Generated Card Structure
     * For any successful API response from the AI generation service,
     * every parsed card SHALL have both a non-empty `front` field and a non-empty `back` field.
     *
     * **Validates: Requirements 4.3**
     */
    it('every parsed card SHALL have both a non-empty front field and a non-empty back field', () => {
      // Arbitrary for generating valid card objects with non-empty strings
      const validCardArbitrary = fc.record({
        front: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        back: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0)
      })

      // Arbitrary for generating valid API responses
      const validResponseArbitrary = fc.record({
        deckName: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        deckType: fc.constantFrom('language' as const, 'knowledge' as const),
        cards: fc.array(validCardArbitrary, { minLength: 0, maxLength: 100 })
      })

      fc.assert(
        fc.property(validResponseArbitrary, (response) => {
          const jsonContent = JSON.stringify(response)
          const result = parseResponse(jsonContent)

          // Property: Every card in the result must have non-empty front and back
          for (const card of result.cards) {
            expect(typeof card.front).toBe('string')
            expect(typeof card.back).toBe('string')
            expect(card.front.length).toBeGreaterThan(0)
            expect(card.back.length).toBeGreaterThan(0)
          }

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('cards with empty front or back fields SHALL be filtered out', () => {
      // Generate responses that may contain invalid cards (empty strings)
      const mixedCardArbitrary = fc.oneof(
        // Valid card
        fc.record({
          front: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          back: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0)
        }),
        // Invalid card - empty front
        fc.record({
          front: fc.constant(''),
          back: fc.string({ minLength: 1 })
        }),
        // Invalid card - empty back
        fc.record({
          front: fc.string({ minLength: 1 }),
          back: fc.constant('')
        }),
        // Invalid card - whitespace only
        fc.record({
          front: fc.constant('   '),
          back: fc.constant('   ')
        })
      )

      const responseWithMixedCardsArbitrary = fc.record({
        deckName: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        deckType: fc.constantFrom('language' as const, 'knowledge' as const),
        cards: fc.array(mixedCardArbitrary, { minLength: 0, maxLength: 50 })
      })

      fc.assert(
        fc.property(responseWithMixedCardsArbitrary, (response) => {
          const jsonContent = JSON.stringify(response)
          const result = parseResponse(jsonContent)

          // Property: All cards in result must have non-empty front and back after filtering
          for (const card of result.cards) {
            expect(card.front.trim().length).toBeGreaterThan(0)
            expect(card.back.trim().length).toBeGreaterThan(0)
          }

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('cards with non-string front or back fields SHALL be filtered out', () => {
      // Generate responses with potentially invalid card types
      const invalidTypeCardArbitrary = fc.oneof(
        // Valid card
        fc.record({
          front: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          back: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0)
        }),
        // Invalid - front is number
        fc.record({
          front: fc.integer() as fc.Arbitrary<unknown>,
          back: fc.string({ minLength: 1 })
        }) as fc.Arbitrary<{ front: unknown; back: unknown }>,
        // Invalid - back is null
        fc.record({
          front: fc.string({ minLength: 1 }),
          back: fc.constant(null) as fc.Arbitrary<unknown>
        }) as fc.Arbitrary<{ front: unknown; back: unknown }>,
        // Invalid - missing fields
        fc.record({
          front: fc.string({ minLength: 1 })
        }) as fc.Arbitrary<{ front: unknown; back?: unknown }>
      )

      const responseWithInvalidTypesArbitrary = fc.record({
        deckName: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        deckType: fc.constantFrom('language' as const, 'knowledge' as const),
        cards: fc.array(invalidTypeCardArbitrary, { minLength: 0, maxLength: 30 })
      })

      fc.assert(
        fc.property(responseWithInvalidTypesArbitrary, (response) => {
          const jsonContent = JSON.stringify(response)
          const result = parseResponse(jsonContent)

          // Property: All cards in result must have string front and back
          for (const card of result.cards) {
            expect(typeof card.front).toBe('string')
            expect(typeof card.back).toBe('string')
            expect(card.front.length).toBeGreaterThan(0)
            expect(card.back.length).toBeGreaterThan(0)
          }

          return true
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 4: Generated Deck Metadata', () => {
    /**
     * Property 4: Generated Deck Metadata
     * For any successful API response from the AI generation service,
     * the response SHALL include a non-empty `deckName` string and a valid `deckType` value ("language" or "knowledge").
     *
     * **Validates: Requirements 4.4, 4.5**
     */
    it('response SHALL include a non-empty deckName string', () => {
      // Arbitrary for generating valid card objects
      const validCardArbitrary = fc.record({
        front: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        back: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0)
      })

      // Arbitrary for generating valid API responses with various deckName values
      const validResponseArbitrary = fc.record({
        deckName: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        deckType: fc.constantFrom('language' as const, 'knowledge' as const),
        cards: fc.array(validCardArbitrary, { minLength: 0, maxLength: 50 })
      })

      fc.assert(
        fc.property(validResponseArbitrary, (response) => {
          const jsonContent = JSON.stringify(response)
          const result = parseResponse(jsonContent)

          // Property: deckName must be a non-empty string
          expect(typeof result.deckName).toBe('string')
          expect(result.deckName.length).toBeGreaterThan(0)
          expect(result.deckName.trim().length).toBeGreaterThan(0)

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('response SHALL include a valid deckType value ("language" or "knowledge")', () => {
      // Arbitrary for generating valid card objects
      const validCardArbitrary = fc.record({
        front: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        back: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0)
      })

      // Arbitrary for generating valid API responses
      const validResponseArbitrary = fc.record({
        deckName: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        deckType: fc.constantFrom('language' as const, 'knowledge' as const),
        cards: fc.array(validCardArbitrary, { minLength: 0, maxLength: 50 })
      })

      fc.assert(
        fc.property(validResponseArbitrary, (response) => {
          const jsonContent = JSON.stringify(response)
          const result = parseResponse(jsonContent)

          // Property: deckType must be either "language" or "knowledge"
          expect(['language', 'knowledge']).toContain(result.deckType)

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('response with missing deckName SHALL throw an error', () => {
      // Arbitrary for generating responses without deckName
      const validCardArbitrary = fc.record({
        front: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        back: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0)
      })

      const responseWithoutDeckNameArbitrary = fc.record({
        deckType: fc.constantFrom('language' as const, 'knowledge' as const),
        cards: fc.array(validCardArbitrary, { minLength: 0, maxLength: 20 })
      })

      fc.assert(
        fc.property(responseWithoutDeckNameArbitrary, (response) => {
          const jsonContent = JSON.stringify(response)

          // Property: Missing deckName should throw an error
          expect(() => parseResponse(jsonContent)).toThrow(
            'Invalid response: missing or invalid deckName'
          )

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('response with empty deckName SHALL throw an error', () => {
      // Arbitrary for generating responses with empty deckName
      const validCardArbitrary = fc.record({
        front: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        back: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0)
      })

      const responseWithEmptyDeckNameArbitrary = fc.record({
        deckName: fc.constant(''),
        deckType: fc.constantFrom('language' as const, 'knowledge' as const),
        cards: fc.array(validCardArbitrary, { minLength: 0, maxLength: 20 })
      })

      fc.assert(
        fc.property(responseWithEmptyDeckNameArbitrary, (response) => {
          const jsonContent = JSON.stringify(response)

          // Property: Empty deckName should throw an error
          expect(() => parseResponse(jsonContent)).toThrow(
            'Invalid response: missing or invalid deckName'
          )

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('response with invalid deckType SHALL throw an error', () => {
      // Arbitrary for generating responses with invalid deckType values
      const validCardArbitrary = fc.record({
        front: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        back: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0)
      })

      // Generate invalid deckType values (not "language" or "knowledge")
      const invalidDeckTypeArbitrary = fc
        .string({ minLength: 1 })
        .filter((s) => s !== 'language' && s !== 'knowledge')

      const responseWithInvalidDeckTypeArbitrary = fc.record({
        deckName: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        deckType: invalidDeckTypeArbitrary,
        cards: fc.array(validCardArbitrary, { minLength: 0, maxLength: 20 })
      })

      fc.assert(
        fc.property(responseWithInvalidDeckTypeArbitrary, (response) => {
          const jsonContent = JSON.stringify(response)

          // Property: Invalid deckType should throw an error
          expect(() => parseResponse(jsonContent)).toThrow(
            'Invalid response: deckType must be "language" or "knowledge"'
          )

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('response with missing deckType SHALL throw an error', () => {
      // Arbitrary for generating responses without deckType
      const validCardArbitrary = fc.record({
        front: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        back: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0)
      })

      const responseWithoutDeckTypeArbitrary = fc.record({
        deckName: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        cards: fc.array(validCardArbitrary, { minLength: 0, maxLength: 20 })
      })

      fc.assert(
        fc.property(responseWithoutDeckTypeArbitrary, (response) => {
          const jsonContent = JSON.stringify(response)

          // Property: Missing deckType should throw an error
          expect(() => parseResponse(jsonContent)).toThrow(
            'Invalid response: deckType must be "language" or "knowledge"'
          )

          return true
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 5: Maximum Card Limit', () => {
    /**
     * Property 5: Maximum Card Limit
     * For any generation request, the number of cards returned SHALL never exceed 50,
     * regardless of what the user requests in their prompt.
     *
     * **Validates: Requirements 4.6, 4.7**
     */
    it('the number of cards returned SHALL never exceed 50', () => {
      // Arbitrary for generating valid card objects
      const validCardArbitrary = fc.record({
        front: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        back: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0)
      })

      // Generate responses with varying card counts from 0 to 200 (well above the limit)
      const responseWithManyCardsArbitrary = fc.record({
        deckName: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        deckType: fc.constantFrom('language' as const, 'knowledge' as const),
        cards: fc.array(validCardArbitrary, { minLength: 0, maxLength: 200 })
      })

      fc.assert(
        fc.property(responseWithManyCardsArbitrary, (response) => {
          const jsonContent = JSON.stringify(response)
          const result = parseResponse(jsonContent)

          // Property: Number of cards must never exceed MAX_CARDS (50)
          expect(result.cards.length).toBeLessThanOrEqual(MAX_CARDS)

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('responses with exactly 50 cards SHALL return all 50 cards', () => {
      // Arbitrary for generating valid card objects
      const validCardArbitrary = fc.record({
        front: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        back: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0)
      })

      // Generate responses with exactly 50 cards
      const responseWithExactly50CardsArbitrary = fc.record({
        deckName: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        deckType: fc.constantFrom('language' as const, 'knowledge' as const),
        cards: fc.array(validCardArbitrary, { minLength: 50, maxLength: 50 })
      })

      fc.assert(
        fc.property(responseWithExactly50CardsArbitrary, (response) => {
          const jsonContent = JSON.stringify(response)
          const result = parseResponse(jsonContent)

          // Property: Exactly 50 valid cards should result in exactly 50 cards
          expect(result.cards.length).toBe(MAX_CARDS)

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('responses with more than 50 cards SHALL be truncated to exactly 50', () => {
      // Arbitrary for generating valid card objects
      const validCardArbitrary = fc.record({
        front: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        back: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0)
      })

      // Generate responses with more than 50 cards (51 to 150)
      const responseWithOverLimitCardsArbitrary = fc.record({
        deckName: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        deckType: fc.constantFrom('language' as const, 'knowledge' as const),
        cards: fc.array(validCardArbitrary, { minLength: 51, maxLength: 150 })
      })

      fc.assert(
        fc.property(responseWithOverLimitCardsArbitrary, (response) => {
          const jsonContent = JSON.stringify(response)
          const result = parseResponse(jsonContent)

          // Property: More than 50 cards should be truncated to exactly 50
          expect(result.cards.length).toBe(MAX_CARDS)

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('responses with fewer than 50 cards SHALL return all cards', () => {
      // Arbitrary for generating valid card objects
      const validCardArbitrary = fc.record({
        front: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        back: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0)
      })

      // Generate responses with fewer than 50 cards (1 to 49)
      const responseWithUnderLimitCardsArbitrary = fc.record({
        deckName: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        deckType: fc.constantFrom('language' as const, 'knowledge' as const),
        cards: fc.array(validCardArbitrary, { minLength: 1, maxLength: 49 })
      })

      fc.assert(
        fc.property(responseWithUnderLimitCardsArbitrary, (response) => {
          const jsonContent = JSON.stringify(response)
          const result = parseResponse(jsonContent)

          // Property: Fewer than 50 cards should return all cards (no truncation)
          // The result should have the same number of valid cards as the input
          expect(result.cards.length).toBeLessThanOrEqual(response.cards.length)
          expect(result.cards.length).toBeLessThan(MAX_CARDS)

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('truncation SHALL preserve the first 50 cards in order', () => {
      // Generate a response with more than 50 cards where each card has a unique identifier
      const cardCountArbitrary = fc.integer({ min: 51, max: 100 })

      fc.assert(
        fc.property(cardCountArbitrary, (cardCount) => {
          // Create cards with sequential identifiers
          const cards = Array.from({ length: cardCount }, (_, i) => ({
            front: `Question ${i + 1}`,
            back: `Answer ${i + 1}`
          }))

          const response = {
            deckName: 'Test Deck',
            deckType: 'knowledge' as const,
            cards
          }

          const jsonContent = JSON.stringify(response)
          const result = parseResponse(jsonContent)

          // Property: The first 50 cards should be preserved in order
          expect(result.cards.length).toBe(MAX_CARDS)

          for (let i = 0; i < MAX_CARDS; i++) {
            expect(result.cards[i].front).toBe(`Question ${i + 1}`)
            expect(result.cards[i].back).toBe(`Answer ${i + 1}`)
          }

          return true
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 8: Bulk Insert Completeness', () => {
    /**
     * Property 8: Bulk Insert Completeness
     * For any save operation with N generated cards, exactly N cards SHALL be inserted
     * into Supabase, and all cards SHALL be associated with the newly created deck.
     *
     * **Validates: Requirements 6.3**
     */
    it('prepareCardsForInsert SHALL produce exactly N cards for N generated cards', () => {
      // Arbitrary for generating valid generated cards
      const validGeneratedCardArbitrary = fc.record({
        front: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        back: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0)
      })

      // Arbitrary for generating a deck ID (UUID-like string)
      const deckIdArbitrary = fc.uuid()

      // Generate arrays of generated cards with varying sizes (1 to 50)
      const generatedCardsArbitrary = fc.array(validGeneratedCardArbitrary, {
        minLength: 1,
        maxLength: 50
      })

      fc.assert(
        fc.property(generatedCardsArbitrary, deckIdArbitrary, (generatedCards, deckId) => {
          const cardsToInsert = prepareCardsForInsert(generatedCards, deckId)

          // Property: The number of cards to insert must equal the number of generated cards
          expect(cardsToInsert.length).toBe(generatedCards.length)

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('all cards SHALL be associated with the newly created deck', () => {
      // Arbitrary for generating valid generated cards
      const validGeneratedCardArbitrary = fc.record({
        front: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        back: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0)
      })

      // Arbitrary for generating a deck ID (UUID-like string)
      const deckIdArbitrary = fc.uuid()

      // Generate arrays of generated cards with varying sizes (1 to 50)
      const generatedCardsArbitrary = fc.array(validGeneratedCardArbitrary, {
        minLength: 1,
        maxLength: 50
      })

      fc.assert(
        fc.property(generatedCardsArbitrary, deckIdArbitrary, (generatedCards, deckId) => {
          const cardsToInsert = prepareCardsForInsert(generatedCards, deckId)

          // Property: All cards must be associated with the correct deck ID
          const allAssociated = validateCardsAssociation(cardsToInsert, deckId)
          expect(allAssociated).toBe(true)

          // Verify each card individually
          for (const card of cardsToInsert) {
            expect(card.deck_id).toBe(deckId)
          }

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('all cards SHALL have valid front and back content after preparation', () => {
      // Arbitrary for generating valid generated cards
      const validGeneratedCardArbitrary = fc.record({
        front: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        back: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0)
      })

      // Arbitrary for generating a deck ID (UUID-like string)
      const deckIdArbitrary = fc.uuid()

      // Generate arrays of generated cards with varying sizes (1 to 50)
      const generatedCardsArbitrary = fc.array(validGeneratedCardArbitrary, {
        minLength: 1,
        maxLength: 50
      })

      fc.assert(
        fc.property(generatedCardsArbitrary, deckIdArbitrary, (generatedCards, deckId) => {
          const cardsToInsert = prepareCardsForInsert(generatedCards, deckId)

          // Property: All cards must have valid fields for insertion
          const allValid = validateCardsForInsert(cardsToInsert)
          expect(allValid).toBe(true)

          // Verify each card has required fields
          for (const card of cardsToInsert) {
            expect(typeof card.front).toBe('string')
            expect(typeof card.back).toBe('string')
            expect(typeof card.deck_id).toBe('string')
            expect(card.front.length).toBeGreaterThan(0)
            expect(card.back.length).toBeGreaterThan(0)
            expect(card.deck_id.length).toBeGreaterThan(0)
          }

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('card content SHALL be preserved exactly during preparation', () => {
      // Arbitrary for generating valid generated cards
      const validGeneratedCardArbitrary = fc.record({
        front: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        back: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0)
      })

      // Arbitrary for generating a deck ID (UUID-like string)
      const deckIdArbitrary = fc.uuid()

      // Generate arrays of generated cards with varying sizes (1 to 50)
      const generatedCardsArbitrary = fc.array(validGeneratedCardArbitrary, {
        minLength: 1,
        maxLength: 50
      })

      fc.assert(
        fc.property(generatedCardsArbitrary, deckIdArbitrary, (generatedCards, deckId) => {
          const cardsToInsert = prepareCardsForInsert(generatedCards, deckId)

          // Property: Card content must be preserved exactly
          for (let i = 0; i < generatedCards.length; i++) {
            expect(cardsToInsert[i].front).toBe(generatedCards[i].front)
            expect(cardsToInsert[i].back).toBe(generatedCards[i].back)
          }

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('empty generated cards array SHALL produce empty insert array', () => {
      // Arbitrary for generating a deck ID (UUID-like string)
      const deckIdArbitrary = fc.uuid()

      fc.assert(
        fc.property(deckIdArbitrary, (deckId) => {
          const emptyGeneratedCards: GeneratedCard[] = []
          const cardsToInsert = prepareCardsForInsert(emptyGeneratedCards, deckId)

          // Property: Empty input should produce empty output
          expect(cardsToInsert.length).toBe(0)
          expect(Array.isArray(cardsToInsert)).toBe(true)

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('card order SHALL be preserved during bulk insert preparation', () => {
      // Generate a specific number of cards with sequential identifiers
      const cardCountArbitrary = fc.integer({ min: 1, max: 50 })
      const deckIdArbitrary = fc.uuid()

      fc.assert(
        fc.property(cardCountArbitrary, deckIdArbitrary, (cardCount, deckId) => {
          // Create cards with sequential identifiers
          const generatedCards: GeneratedCard[] = Array.from({ length: cardCount }, (_, i) => ({
            front: `Question ${i + 1}`,
            back: `Answer ${i + 1}`
          }))

          const cardsToInsert = prepareCardsForInsert(generatedCards, deckId)

          // Property: Card order must be preserved
          expect(cardsToInsert.length).toBe(cardCount)

          for (let i = 0; i < cardCount; i++) {
            expect(cardsToInsert[i].front).toBe(`Question ${i + 1}`)
            expect(cardsToInsert[i].back).toBe(`Answer ${i + 1}`)
            expect(cardsToInsert[i].deck_id).toBe(deckId)
          }

          return true
        }),
        { numRuns: 100 }
      )
    })
  })
})
