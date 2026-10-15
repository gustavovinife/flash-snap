import { Ionicons } from '@expo/vector-icons'
import { AI_MAX_PROMPT_LENGTH, AI_MIN_PROMPT_LENGTH, AI_PRESET_PROMPTS, type GenerationResult } from '@flash-snap/shared'
import { router, Stack } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Button, Pill, Surface, Text, TextField } from '@/components'
import { useDeckLimit } from '@/hooks/useDeckLimit'
import { useDeckMutations } from '@/hooks/useDecks'
import { generateDeck } from '@/lib/ai'
import { showDialog } from '@/lib/dialogs'
import { centered, contentWidth, radius, spacing, useTheme } from '@/theme'

export default function AIGenerateScreen(): React.JSX.Element {
  const { t } = useTranslation()
  const colors = useTheme()
  const guardDeckCreation = useDeckLimit()
  const { createDeckWithCards } = useDeckMutations()

  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [deckName, setDeckName] = useState('')

  const trimmedPrompt = prompt.trim()
  const promptTooShort = trimmedPrompt.length > 0 && trimmedPrompt.length < AI_MIN_PROMPT_LENGTH

  const generate = async (): Promise<void> => {
    if (trimmedPrompt.length < AI_MIN_PROMPT_LENGTH) return
    setGenerating(true)
    setError(null)
    try {
      const generated = await generateDeck(trimmedPrompt)
      setResult(generated)
      setDeckName(generated.deckName)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'))
    } finally {
      setGenerating(false)
    }
  }

  const removeCard = (index: number): void =>
    setResult((current) => current && { ...current, cards: current.cards.filter((_, i) => i !== index) })

  const save = (): void => {
    if (!result || !deckName.trim() || result.cards.length === 0) return
    guardDeckCreation(() =>
      createDeckWithCards.mutate(
        {
          name: deckName.trim(),
          type: result.deckType,
          cards: result.cards.map((card) => ({ front: card.front, back: card.back, context: card.context ?? null }))
        },
        {
          onSuccess: (deck) => router.replace(`/deck/${deck.id}`),
          onError: (e) => showDialog(t('common.error'), e.message)
        }
      )
    )
  }

  const startOver = (): void => {
    setResult(null)
    setDeckName('')
    setError(null)
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: t('aiGeneration.title') }} />
      <ScrollView contentContainerStyle={[styles.content, centered(contentWidth.narrow)]} keyboardShouldPersistTaps="handled">
        {!result ? (
          <>
            <View style={styles.intro}>
              <View style={[styles.introIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="sparkles" size={26} color={colors.primary} />
              </View>
              <Text variant="headline">{t('aiGeneration.heading')}</Text>
              <Text tone="muted">{t('aiGeneration.subtitle')}</Text>
            </View>

            <TextField
              value={prompt}
              onChangeText={setPrompt}
              placeholder={t('aiGeneration.promptPlaceholder')}
              multiline
              maxLength={AI_MAX_PROMPT_LENGTH}
              editable={!generating}
            />
            {promptTooShort && (
              <Text variant="small" tone="muted">
                {t('aiGeneration.minLength')}
              </Text>
            )}

            <View style={styles.ideas}>
              <Text variant="label" tone="muted">
                {t('aiGeneration.ideas')}
              </Text>
              <View style={styles.pills}>
                {AI_PRESET_PROMPTS.map((preset) => {
                  const selected = prompt === preset.prompt
                  return (
                    <Pressable
                      key={preset.id}
                      disabled={generating}
                      onPress={() => setPrompt(preset.prompt)}
                      style={[
                        styles.idea,
                        {
                          backgroundColor: selected ? colors.primarySoft : colors.surface,
                          borderColor: selected ? colors.primary : colors.border
                        }
                      ]}
                    >
                      <Ionicons
                        name={preset.category === 'language' ? 'language' : 'bulb-outline'}
                        size={14}
                        color={selected ? colors.primary : colors.textMuted}
                      />
                      <Text variant="small" tone={selected ? 'primary' : 'default'} weight="500">
                        {t(`aiGeneration.presets.${preset.labelKey}`)}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>

            {error && (
              <View style={[styles.error, { backgroundColor: colors.dangerSoft }]}>
                <Text variant="small" tone="danger">
                  {error}
                </Text>
              </View>
            )}

            <Button
              title={generating ? t('aiGeneration.generating') : t('aiGeneration.generate')}
              icon="sparkles"
              onPress={generate}
              loading={generating}
              disabled={trimmedPrompt.length < AI_MIN_PROMPT_LENGTH}
            />
            {generating && (
              <Text variant="small" tone="muted" center>
                {t('aiGeneration.generatingHint')}
              </Text>
            )}
          </>
        ) : (
          <>
            <TextField label={t('aiGeneration.deckName')} value={deckName} onChangeText={setDeckName} />
            <View style={styles.resultHeader}>
              <Text variant="title">{t('aiGeneration.cardsTitle', { count: result.cards.length })}</Text>
              <Pill label={t(`deck.types.${result.deckType}`)} tone="primary" />
            </View>

            {result.cards.map((card, index) => (
              <Surface key={`${index}-${card.front}`} style={styles.card}>
                <View style={styles.flex}>
                  <Text variant="label" style={styles.cardFront}>
                    {card.front}
                  </Text>
                  <Text variant="small" tone="muted">
                    {card.back}
                  </Text>
                  {card.context ? (
                    <Text variant="caption" tone="subtle" style={styles.context}>
                      {card.context}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('aiGeneration.removeCard')}
                  hitSlop={10}
                  onPress={() => removeCard(index)}
                >
                  <Ionicons name="close-circle" size={22} color={colors.textSubtle} />
                </Pressable>
              </Surface>
            ))}

            <View style={styles.actions}>
              <Button
                title={t('aiGeneration.save', { count: result.cards.length })}
                icon="checkmark"
                onPress={save}
                loading={createDeckWithCards.isPending}
                disabled={!deckName.trim() || result.cards.length === 0}
              />
              <Button title={t('aiGeneration.regenerate')} variant="ghost" onPress={startOver} />
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  intro: { gap: spacing.sm },
  introIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs
  },
  ideas: { gap: spacing.sm },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  idea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  error: { borderRadius: radius.sm, padding: spacing.md },
  resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardFront: { fontSize: 16 },
  context: { fontStyle: 'italic', fontWeight: '400', marginTop: spacing.xs },
  actions: { gap: spacing.sm, marginTop: spacing.sm }
})
