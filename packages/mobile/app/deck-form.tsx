import type { DeckType } from '@flash-snap/shared'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { Button, OptionTiles, Text, TextField } from '@/components'
import { useDeck, useDeckMutations, useDecks } from '@/hooks/useDecks'
import { useSubscription } from '@/hooks/useSubscription'
import { spacing, useTheme } from '@/theme'

export default function DeckFormScreen(): React.JSX.Element {
  const { t } = useTranslation()
  const colors = useTheme()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const { deck } = useDeck(id)
  const { data: decks = [] } = useDecks()
  const { canCreateDeck } = useSubscription()
  const { createDeck, updateDeck } = useDeckMutations()

  const [name, setName] = useState(deck?.name ?? '')
  const [type, setType] = useState<DeckType>(deck?.type ?? 'language')
  const isEditing = !!deck
  const saving = createDeck.isPending || updateDeck.isPending

  const save = (): void => {
    const trimmed = name.trim()
    if (!trimmed) return
    const onError = (error: Error): void => Alert.alert(t('common.error'), error.message)

    if (isEditing) {
      updateDeck.mutate({ id: deck.id, name: trimmed, type }, { onSuccess: () => router.back(), onError })
      return
    }

    if (!canCreateDeck(decks.length)) {
      Alert.alert(t('premium.limitTitle'), t('premium.limitBody'))
      return
    }
    createDeck.mutate(
      { name: trimmed, type },
      { onSuccess: (created) => router.replace(`/deck/${created.id}`), onError }
    )
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: isEditing ? t('deckForm.editTitle') : t('deckForm.newTitle') }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField
          label={t('deckForm.name')}
          placeholder={t('deckForm.namePlaceholder')}
          value={name}
          onChangeText={setName}
          autoFocus={!isEditing}
          returnKeyType="done"
          onSubmitEditing={save}
        />
        <View style={styles.field}>
          <Text variant="label" tone="muted">
            {t('deckForm.type')}
          </Text>
          <OptionTiles<DeckType>
            value={type}
            onChange={setType}
            options={[
              { value: 'language', label: t('deck.types.language'), description: t('deckForm.languageHint'), icon: 'language' },
              { value: 'knowledge', label: t('deck.types.knowledge'), description: t('deckForm.knowledgeHint'), icon: 'bulb-outline' }
            ]}
          />
        </View>
        <Button
          title={isEditing ? t('common.save') : t('deckForm.create')}
          onPress={save}
          loading={saving}
          disabled={!name.trim()}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.xl },
  field: { gap: spacing.sm }
})
