import { Ionicons } from '@expo/vector-icons'
import { type Card, getDeckReport, isCardDue } from '@flash-snap/shared'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, EmptyState, IconButton, LoadingView, Pill, ProgressBar, Surface, Text, TextField } from '@/components'
import { useDeck, useDeckMutations } from '@/hooks/useDecks'
import { confirm, showActions } from '@/lib/actions'
import { radius, spacing, useTheme } from '@/theme'

function Stat({ value, label }: { value: string; label: string }): React.JSX.Element {
  return (
    <View style={styles.stat}>
      <Text variant="title">{value}</Text>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </View>
  )
}

function CardRow({ card, onPress }: { card: Card; onPress: () => void }): React.JSX.Element {
  const colors = useTheme()
  const due = isCardDue(card)
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardRow,
        { backgroundColor: pressed ? colors.surfaceMuted : colors.surface, borderColor: colors.border }
      ]}
    >
      <View style={styles.flex}>
        <Text variant="label" numberOfLines={1} style={styles.cardFront}>
          {card.front}
        </Text>
        <Text variant="small" tone="muted" numberOfLines={1}>
          {card.back}
        </Text>
      </View>
      {card.links && card.links.length > 0 && <Ionicons name="link" size={16} color={colors.textSubtle} />}
      {due && <View style={[styles.dueDot, { backgroundColor: colors.primary }]} />}
      <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
    </Pressable>
  )
}

export default function DeckScreen(): React.JSX.Element {
  const { t } = useTranslation()
  const colors = useTheme()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { deck, isLoading } = useDeck(id)
  const { deleteDeck } = useDeckMutations()
  const [query, setQuery] = useState('')

  const report = useMemo(() => (deck ? getDeckReport(deck.cards) : null), [deck])
  const filteredCards = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const cards = deck?.cards ?? []
    if (!normalized) return cards
    return cards.filter(
      (card) => card.front.toLowerCase().includes(normalized) || card.back.toLowerCase().includes(normalized)
    )
  }, [deck, query])

  if (isLoading) return <LoadingView />

  if (!deck || !report) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <EmptyState icon="albums-outline" title={t('deck.notFound')}>
          <Button title={t('review.backToDecks')} onPress={() => router.back()} variant="secondary" />
        </EmptyState>
      </View>
    )
  }

  const openMenu = (): void =>
    showActions(
      deck.name,
      [
        { label: t('deck.editDeck'), onPress: () => router.push({ pathname: '/deck-form', params: { id: deck.id } }) },
        {
          label: t('deck.deleteDeck'),
          destructive: true,
          onPress: () =>
            confirm(t('deck.deleteTitle'), t('deck.deleteBody'), t('common.delete'), t('common.cancel'), () => {
              deleteDeck.mutate(deck.id, { onSuccess: () => router.back() })
            })
        }
      ],
      t('common.cancel')
    )

  const openCard = (card?: Card): void =>
    router.push({ pathname: '/card-form', params: { deckId: deck.id, ...(card && { cardId: String(card.id) }) } })

  const header = (
    <View style={styles.header}>
      <Surface style={styles.summary}>
        <View style={styles.summaryTop}>
          <Pill label={t(`deck.types.${deck.type}`)} tone="primary" />
        </View>
        <Text variant="headline">{deck.name}</Text>
        <View style={styles.stats}>
          <Stat value={String(report.cardStats.dueToday)} label={t('deck.dueToday')} />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <Stat value={String(report.cardStats.total)} label={t('deck.total')} />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <Stat value={`${report.masteredPercent}%`} label={t('deck.mastered')} />
        </View>
        <ProgressBar value={report.masteredPercent} color={colors.success} />
        <View style={styles.actions}>
          <Button
            title={report.cardStats.dueToday > 0 ? t('deck.review', { count: report.cardStats.dueToday }) : t('deck.caughtUp')}
            icon={report.cardStats.dueToday > 0 ? 'play' : 'checkmark-circle'}
            onPress={() => router.push(`/review/${deck.id}`)}
            disabled={report.cardStats.dueToday === 0}
            style={styles.flex}
          />
          <IconButton icon="stats-chart" label={t('deck.stats')} onPress={() => router.push(`/deck/${deck.id}/stats`)} />
        </View>
      </Surface>

      <View style={styles.cardsHeader}>
        <Text variant="title">{t('deck.cards')}</Text>
        <Text variant="small" tone="muted">
          {t('common.cardCount', { count: deck.cards.length })}
        </Text>
      </View>
      {deck.cards.length > 0 && (
        <TextField
          placeholder={t('deck.searchCards')}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      )}
    </View>
  )

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => <IconButton icon="ellipsis-horizontal" label={t('deck.editDeck')} onPress={openMenu} />
        }}
      />
      <FlatList
        data={filteredCards}
        keyExtractor={(card) => String(card.id)}
        renderItem={({ item }) => <CardRow card={item} onPress={() => openCard(item)} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          deck.cards.length === 0 ? (
            <EmptyState icon="documents-outline" title={t('deck.noCardsTitle')} body={t('deck.noCardsBody')}>
              <Button title={t('deck.addCard')} icon="add" onPress={() => openCard()} />
            </EmptyState>
          ) : (
            <Text tone="muted" center style={styles.noMatches}>
              {t('deck.noMatches')}
            </Text>
          )
        }
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 96 }]}
        keyboardShouldPersistTaps="handled"
      />
      {deck.cards.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('deck.addCard')}
          onPress={() => openCard()}
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: pressed ? colors.primaryPressed : colors.primary, bottom: insets.bottom + spacing.lg }
          ]}
        >
          <Ionicons name="add" size={28} color={colors.onPrimary} />
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  header: { gap: spacing.lg, marginBottom: spacing.xs },
  summary: { gap: spacing.md, padding: spacing.xl },
  summaryTop: { flexDirection: 'row' },
  stats: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xs },
  stat: { flex: 1, gap: 2 },
  statDivider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', marginHorizontal: spacing.md },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs },
  cardsHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth
  },
  cardFront: { fontSize: 16 },
  dueDot: { width: 8, height: 8, borderRadius: 4 },
  noMatches: { paddingVertical: spacing.xl },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  }
})
