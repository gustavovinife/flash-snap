import { Ionicons } from '@expo/vector-icons'
import { type CardLink, linkLabel, normalizeLinkUrl } from '@flash-snap/shared'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, type TextInput, View } from 'react-native'
import { Button, Surface, Text, TextField } from '@/components'
import { useDeck, useDeckMutations } from '@/hooks/useDecks'
import { confirm } from '@/lib/actions'
import { showDialog } from '@/lib/dialogs'
import { centered, contentWidth, radius, spacing, useTheme } from '@/theme'
import { goBack } from '@/navigation'

export default function CardFormScreen(): React.JSX.Element {
  const { t } = useTranslation()
  const colors = useTheme()
  const { deckId, cardId } = useLocalSearchParams<{ deckId: string; cardId?: string }>()
  const { deck } = useDeck(deckId)
  const card = deck?.cards.find((c) => String(c.id) === cardId)
  const { createCard, updateCard, deleteCard } = useDeckMutations()

  const [front, setFront] = useState(card?.front ?? '')
  const [back, setBack] = useState(card?.back ?? '')
  const [context, setContext] = useState(card?.context ?? '')
  const [links, setLinks] = useState<CardLink[]>(card?.links ?? [])
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [linkError, setLinkError] = useState(false)
  const loadedCardId = useRef(card?.id)

  // On a direct URL or refresh the decks query loads after the first render
  useEffect(() => {
    if (!card || loadedCardId.current === card.id) return
    loadedCardId.current = card.id
    setFront(card.front)
    setBack(card.back)
    setContext(card.context ?? '')
    setLinks(card.links ?? [])
  }, [card])
  const frontRef = useRef<TextInput>(null)
  const backRef = useRef<TextInput>(null)
  const contextRef = useRef<TextInput>(null)

  const isEditing = !!card
  const canSave = front.trim().length > 0 && back.trim().length > 0
  const saving = createCard.isPending || updateCard.isPending
  const onError = (error: Error): void => showDialog(t('common.error'), error.message)

  const save = (addAnother = false): void => {
    if (!canSave || !deckId) return
    const input = { front: front.trim(), back: back.trim(), context: context.trim() || null, links }

    if (card) {
      updateCard.mutate({ id: card.id, ...input }, { onSuccess: goBack, onError })
      return
    }

    createCard.mutate(
      { deckId, ...input },
      {
        onSuccess: () => {
          if (!addAnother) {
            goBack()
            return
          }
          setFront('')
          setBack('')
          setContext('')
          setLinks([])
          frontRef.current?.focus()
        },
        onError
      }
    )
  }

  const addLink = (): void => {
    const url = normalizeLinkUrl(linkUrl)
    if (!url) {
      setLinkError(true)
      return
    }
    setLinks((current) => [...current, { url, ...(linkTitle.trim() && { title: linkTitle.trim() }) }])
    setLinkUrl('')
    setLinkTitle('')
    setLinkError(false)
  }

  const remove = (): void => {
    if (!card) return
    confirm(t('cardForm.deleteTitle'), t('cardForm.deleteBody'), t('common.delete'), t('common.cancel'), () =>
      deleteCard.mutate(card, { onSuccess: goBack, onError })
    )
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: isEditing ? t('cardForm.editTitle') : t('cardForm.newTitle') }} />
      <ScrollView contentContainerStyle={[styles.content, centered(contentWidth.narrow)]} keyboardShouldPersistTaps="handled">
        <TextField
          ref={frontRef}
          label={t('cardForm.front')}
          placeholder={t('cardForm.frontPlaceholder')}
          value={front}
          onChangeText={setFront}
          autoFocus={!isEditing}
          returnKeyType="next"
          onSubmitEditing={() => backRef.current?.focus()}
          submitBehavior="submit"
        />
        <TextField
          ref={backRef}
          label={t('cardForm.back')}
          placeholder={t('cardForm.backPlaceholder')}
          value={back}
          onChangeText={setBack}
          returnKeyType="next"
          onSubmitEditing={() => contextRef.current?.focus()}
          submitBehavior="submit"
        />
        <TextField
          ref={contextRef}
          label={t('cardForm.context')}
          placeholder={t('cardForm.contextPlaceholder')}
          value={context}
          onChangeText={setContext}
          multiline
        />

        <View style={styles.links}>
          <View>
            <Text variant="label" tone="muted">
              {t('cardForm.links')}
            </Text>
            <Text variant="small" tone="subtle">
              {t('cardForm.linksHint')}
            </Text>
          </View>
          {links.map((link, index) => (
            <Surface key={`${index}-${link.url}`} style={styles.linkRow}>
              <Ionicons name="link" size={18} color={colors.primary} />
              <View style={styles.flex}>
                <Text variant="label" numberOfLines={1}>
                  {linkLabel(link)}
                </Text>
                <Text variant="caption" tone="subtle" numberOfLines={1}>
                  {link.url}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('cardForm.removeLink')}
                hitSlop={10}
                onPress={() => setLinks((current) => current.filter((_, i) => i !== index))}
              >
                <Ionicons name="close-circle" size={22} color={colors.textSubtle} />
              </Pressable>
            </Surface>
          ))}
          <View style={[styles.linkForm, { borderColor: colors.border }]}>
            <TextField
              placeholder={t('cardForm.linkUrlPlaceholder')}
              value={linkUrl}
              onChangeText={(value) => {
                setLinkUrl(value)
                setLinkError(false)
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="next"
            />
            <TextField
              placeholder={t('cardForm.linkTitlePlaceholder')}
              value={linkTitle}
              onChangeText={setLinkTitle}
              returnKeyType="done"
              onSubmitEditing={addLink}
            />
            {linkError && (
              <Text variant="small" tone="danger">
                {t('cardForm.invalidLink')}
              </Text>
            )}
            <Button title={t('cardForm.addLink')} icon="add" variant="secondary" compact onPress={addLink} disabled={!linkUrl.trim()} />
          </View>
        </View>

        <View style={styles.actions}>
          <Button title={t('common.save')} onPress={() => save()} loading={saving} disabled={!canSave} />
          {!isEditing && (
            <Button
              title={t('cardForm.saveAndAddAnother')}
              variant="secondary"
              onPress={() => save(true)}
              disabled={!canSave || saving}
            />
          )}
          {isEditing && (
            <Button
              title={t('common.delete')}
              icon="trash-outline"
              variant="danger"
              onPress={remove}
              loading={deleteCard.isPending}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  content: { padding: spacing.lg, gap: spacing.lg },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
  links: { gap: spacing.sm },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  linkForm: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed' }
})
