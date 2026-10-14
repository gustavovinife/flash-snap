import { Ionicons } from '@expo/vector-icons'
import { calculateDeckProgress, countDueCards, type Deck } from '@flash-snap/shared'
import { router } from 'expo-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, EmptyState, IconButton, LoadingView, Pill, ProgressBar, Surface, Text } from '@/components'
import { useAuth } from '@/context/AuthContext'
import { useDeckLimit } from '@/hooks/useDeckLimit'
import { useDecks } from '@/hooks/useDecks'
import { showActions } from '@/lib/actions'
import { radius, spacing, useTheme } from '@/theme'

function firstName(fullName: unknown, email: string | undefined): string | null {
  if (typeof fullName === 'string' && fullName.trim()) return fullName.trim().split(' ')[0]
  return email?.split('@')[0] ?? null
}

function DeckRow({ deck }: { deck: Deck }): React.JSX.Element {
  const { t } = useTranslation()
  const colors = useTheme()
  const due = countDueCards(deck.cards)
  const progress = calculateDeckProgress(deck)

  return (
    <Surface onPress={() => router.push(`/deck/${deck.id}`)} style={styles.deck}>
      <View style={styles.deckHeader}>
        <View style={[styles.deckIcon, { backgroundColor: colors.primarySoft }]}>
          <Ionicons
            name={deck.type === 'language' ? 'language' : 'bulb-outline'}
            size={20}
            color={colors.primary}
          />
        </View>
        <View style={styles.deckTitle}>
          <Text variant="label" numberOfLines={1} style={styles.deckName}>
            {deck.name}
          </Text>
          <Text variant="small" tone="muted">
            {t('common.cardCount', { count: deck.cards.length })}
          </Text>
        </View>
        {due > 0 ? <Pill label={t('home.dueBadge', { count: due })} tone="primary" /> : <Ionicons name="checkmark-circle" size={22} color={colors.success} />}
      </View>
      <View style={styles.deckProgress}>
        <View style={styles.flex}>
          <ProgressBar value={progress} color={colors.success} />
        </View>
        <Text variant="caption" tone="muted">
          {progress}%
        </Text>
      </View>
    </Surface>
  )
}

export default function DecksScreen(): React.JSX.Element {
  const { t } = useTranslation()
  const colors = useTheme()
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { data: decks = [], isLoading, isRefetching, refetch, error } = useDecks()
  const guardDeckCreation = useDeckLimit()

  const totalDue = useMemo(() => decks.reduce((sum, deck) => sum + countDueCards(deck.cards), 0), [decks])
  const name = firstName(user?.user_metadata?.full_name, user?.email)

  const newDeck = (): void => guardDeckCreation(() => router.push('/deck-form'))
  const createWithAI = (): void => guardDeckCreation(() => router.push('/ai-generate'))
  const openCreateMenu = (): void =>
    showActions(
      undefined,
      [
        { label: t('home.createWithAI'), onPress: createWithAI },
        { label: t('home.newDeck'), onPress: newDeck }
      ],
      t('common.cancel')
    )

  if (isLoading) return <LoadingView />

  const header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.flex}>
          <Text variant="small" tone="muted">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
          <Text variant="headline">{name ? t('home.greeting', { name }) : t('home.greetingNoName')}</Text>
        </View>
        <IconButton icon="add" label={t('home.newDeck')} onPress={openCreateMenu} tone="primary" />
      </View>

      {decks.length > 0 && (
        <View style={[styles.hero, { backgroundColor: totalDue > 0 ? colors.primary : colors.surface, borderColor: colors.border }]}>
          {totalDue > 0 ? (
            <>
              <View style={styles.heroBadge}>
                <Ionicons name="flash" size={18} color={colors.primary} />
              </View>
              <Text variant="title" tone="inverse">
                {t('home.dueTitle', { count: totalDue })}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/review/all')}
                style={({ pressed }) => [styles.heroButton, { opacity: pressed ? 0.85 : 1 }]}
              >
                <Text variant="label" tone="primary">
                  {t('home.startReview')}
                </Text>
                <Ionicons name="arrow-forward" size={18} color={colors.primary} />
              </Pressable>
            </>
          ) : (
            <View style={styles.caughtUp}>
              <View style={[styles.caughtUpIcon, { backgroundColor: colors.successSoft }]}>
                <Ionicons name="sparkles" size={22} color={colors.success} />
              </View>
              <View style={styles.flex}>
                <Text variant="label">{t('home.caughtUpTitle')}</Text>
                <Text variant="small" tone="muted">
                  {t('home.caughtUpBody')}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {decks.length > 0 && (
        <Text variant="title" style={styles.sectionTitle}>
          {t('home.myDecks')}
        </Text>
      )}
    </View>
  )

  return (
    <FlatList
      data={decks}
      keyExtractor={(deck) => deck.id}
      renderItem={({ item }) => <DeckRow deck={item} />}
      ListHeaderComponent={header}
      ListEmptyComponent={
        error ? (
          <EmptyState icon="cloud-offline-outline" title={t('common.error')} body={error.message}>
            <Button title={t('common.retry')} onPress={() => refetch()} variant="secondary" />
          </EmptyState>
        ) : (
          <EmptyState icon="albums-outline" title={t('home.emptyTitle')} body={t('home.emptyBody')}>
            <Button title={t('home.createWithAI')} icon="sparkles" onPress={createWithAI} />
            <Button title={t('home.newDeck')} icon="add" variant="secondary" onPress={newDeck} />
            <Button title={t('home.browseTemplates')} icon="compass-outline" variant="secondary" onPress={() => router.push('/explore')} />
          </EmptyState>
        )
      }
      contentContainerStyle={[styles.list, { paddingTop: insets.top + spacing.lg }]}
      style={{ backgroundColor: colors.background }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
    />
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  header: { gap: spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  hero: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth
  },
  heroBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#ffffff',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.xs
  },
  caughtUp: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  caughtUpIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionTitle: { marginTop: spacing.sm },
  deck: { gap: spacing.md },
  deckHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  deckIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  deckTitle: { flex: 1, gap: 2 },
  deckName: { fontSize: 16 },
  deckProgress: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }
})
