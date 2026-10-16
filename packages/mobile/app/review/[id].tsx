import { Ionicons } from '@expo/vector-icons'
import { type Card, type Deck, type DueCard, getDueCards, linkLabel, sm2 } from '@flash-snap/shared'
import * as Haptics from 'expo-haptics'
import { useLocalSearchParams } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, EmptyState, IconButton, LoadingView, ProgressBar, StreakBadge, Text } from '@/components'
import { useDeckMutations, useDecks } from '@/hooks/useDecks'
import { useLayout } from '@/hooks/useLayout'
import { useReviewSounds } from '@/hooks/useReviewSounds'
import { useStreak } from '@/hooks/useStreak'
import { track } from '@/lib/analytics'
import { showDialog } from '@/lib/dialogs'
import { speak } from '@/lib/speech'
import { centered, contentWidth, isHovered, radius, spacing, useTheme } from '@/theme'
import { goBack } from '@/navigation'

type GradeKey = 'again' | 'hard' | 'good' | 'easy'
// SM-2 recall grades (0-5); below 3 counts as forgotten
type Grade = 1 | 3 | 4 | 5

const GRADES: { key: GradeKey; grade: Grade }[] = [
  { key: 'again', grade: 1 },
  { key: 'hard', grade: 3 },
  { key: 'good', grade: 4 },
  { key: 'easy', grade: 5 }
]

function linkDomain(url: string): string | null {
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

function haptic(grade: Grade): void {
  if (Platform.OS === 'web') return
  if (grade < 3) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  else void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
}

export default function ReviewScreen(): React.JSX.Element {
  const { t } = useTranslation()
  const colors = useTheme()
  // SafeAreaView doesn't get insets reliably inside a fullScreenModal, so pad explicitly
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: decks, isLoading } = useDecks()
  const { reviewCard } = useDeckMutations()
  const playGradeSound = useReviewSounds()
  const streak = useStreak()

  // The queue is fixed when the session starts, so graded cards don't reshuffle it
  const [queue, setQueue] = useState<DueCard<Card, Deck>[] | null>(null)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const flip = useRef(new Animated.Value(0)).current
  const { isDesktop } = useLayout()
  const showShortcuts = Platform.OS === 'web' && isDesktop

  // Registered once; always calls the latest handler so shortcuts see the current card
  const keyHandler = useRef<(event: KeyboardEvent) => void>(() => {})
  useEffect(() => {
    if (Platform.OS !== 'web') return
    const onKeyDown = (event: KeyboardEvent): void => keyHandler.current(event)
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Per-session numbers for the study_session_completed event
  const stats = useRef({ startedAt: 0, keyboardGrades: 0, grades: { again: 0, hard: 0, good: 0, easy: 0 } })

  useEffect(() => {
    if (!decks || queue !== null) return
    const due: DueCard<Card, Deck>[] = getDueCards(decks, id === 'all' ? undefined : id)
    setQueue(due)
    stats.current.startedAt = Date.now()
    if (due.length > 0) track('review_started', { deck_id: id, due_count: due.length })
  }, [decks, id, queue])

  const gradeColors: Record<GradeKey, { bg: string; fg: string }> = {
    again: { bg: colors.dangerSoft, fg: colors.danger },
    hard: { bg: colors.warningSoft, fg: colors.warning },
    good: { bg: colors.primarySoft, fg: colors.primary },
    easy: { bg: colors.successSoft, fg: colors.success }
  }

  if (isLoading || queue === null) return <LoadingView />

  const current = queue[index]
  const finished = index >= queue.length
  const deckName = id === 'all' ? undefined : decks?.find((deck) => deck.id === id)?.name

  const close = (): void => {
    if (!finished && queue.length > 0) {
      track('review_exited', { deck_id: id, cards_reviewed: index, cards_total: queue.length })
    }
    goBack()
  }

  const reveal = (): void => {
    if (revealed) return
    Animated.timing(flip, { toValue: 1, duration: 140, useNativeDriver: true }).start(() => {
      setRevealed(true)
      Animated.timing(flip, { toValue: 0, duration: 140, useNativeDriver: true }).start()
    })
  }

  const grade = (value: Grade, input: 'pointer' | 'keyboard' = 'pointer'): void => {
    if (!current) return
    const session = stats.current
    session.grades[GRADES.find((g) => g.grade === value)!.key] += 1
    if (input === 'keyboard') session.keyboardGrades += 1
    if (index + 1 === queue.length) {
      track('study_session_completed', {
        cards_reviewed: queue.length,
        deck_id: id,
        deck_name: deckName,
        duration_seconds: Math.round((Date.now() - session.startedAt) / 1000),
        ...session.grades,
        keyboard_grades: session.keyboardGrades,
        // This session counts for today even if the streak data hasn't caught up yet
        streak_days: streak.reviewedToday ? streak.current : streak.current + 1
      })
    }
    haptic(value)
    playGradeSound(value)
    reviewCard.mutate(
      { card: current.card, grade: value },
      { onError: () => showDialog(t('common.error'), t('review.saveError')) }
    )
    setRevealed(false)
    setIndex((i) => i + 1)
  }

  keyHandler.current = (event) => {
    if (event.key === 'Escape') {
      close()
      return
    }
    if (!current || finished) return
    if (!revealed && (event.key === ' ' || event.key === 'Enter')) {
      event.preventDefault()
      reveal()
      return
    }
    const choice = revealed ? GRADES[Number(event.key) - 1] : undefined
    if (choice) grade(choice.grade, 'keyboard')
  }

  if (queue.length === 0 || finished) {
    const reviewed = queue.length
    return (
      <View
        style={[
          styles.flex,
          styles.centered,
          { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }
        ]}
      >
        <EmptyState
          icon={reviewed > 0 ? 'trophy-outline' : 'checkmark-done-outline'}
          title={reviewed > 0 ? t('review.doneTitle') : t('review.nothingDueTitle')}
          body={reviewed > 0 ? t('review.doneBody', { count: reviewed }) : t('review.nothingDueBody')}
        >
          {reviewed > 0 && <StreakBadge showLabel style={styles.streak} />}
          <Button title={t('review.backToDecks')} onPress={close} />
        </EmptyState>
      </View>
    )
  }

  const { card, deck } = current
  const rotate = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] })

  return (
    <View
      style={[
        styles.flex,
        {
          backgroundColor: colors.background,
          paddingTop: Math.max(insets.top, spacing.lg),
          paddingBottom: Math.max(insets.bottom, spacing.sm)
        }
      ]}
    >
      <View style={[styles.flex, centered(contentWidth.narrow)]}>
      <View style={styles.topBar}>
        <IconButton icon="close" label={t('common.cancel')} onPress={close} />
        <View style={styles.progress}>
          <ProgressBar value={(index / queue.length) * 100} />
        </View>
        <Text variant="label" tone="muted">
          {t('review.progress', { current: index + 1, total: queue.length })}
        </Text>
      </View>

      <Pressable
        style={[styles.cardArea, isDesktop && styles.cardAreaDesktop]}
        onPress={reveal}
        // On web a role="button" renders a <button>, which can't contain the link and audio buttons inside the card
        accessibilityRole={Platform.OS === 'web' ? undefined : 'button'}
        accessibilityHint={t('review.tapToReveal')}
      >
        <Animated.View
          style={[
            styles.card,
            isDesktop ? styles.cardDesktop : styles.flex,
            { backgroundColor: colors.surface, borderColor: colors.border, transform: [{ perspective: 1000 }, { rotateY: rotate }] }
          ]}
        >
          <View style={styles.cardHeader}>
            <Text variant="caption" tone="subtle" numberOfLines={1} style={styles.flex}>
              {deck.name.toUpperCase()}
            </Text>
            {deck.type === 'language' && (
              <IconButton icon="volume-high" label={t('review.playPronunciation')} onPress={() => {
                  track('pronunciation_played', { deck_id: card.deck_id })
                  speak(card.front)
                }} />
            )}
          </View>

          <ScrollView style={styles.cardScroll} contentContainerStyle={styles.cardBody}>
            <Text variant="headline" center>
              {card.front}
            </Text>

            {revealed ? (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Text variant="title" tone="primary" center>
                  {card.back}
                </Text>
                {card.context ? (
                  <Text tone="muted" center style={styles.context}>
                    {card.context}
                  </Text>
                ) : null}
                {card.links && card.links.length > 0 && (
                  <View style={styles.links}>
                    <Text variant="caption" tone="subtle" center>
                      {t('review.learnMore').toUpperCase()}
                    </Text>
                    <View style={styles.linkChips}>
                      {card.links.map((link, linkIndex) => (
                        <Pressable
                          key={`${linkIndex}-${link.url}`}
                          accessibilityRole="link"
                          onPress={() => {
                            track('reference_link_opened', { deck_id: card.deck_id, card_id: card.id, domain: linkDomain(link.url) })
                            void WebBrowser.openBrowserAsync(link.url)
                          }}
                          style={(state) => [
                            styles.linkChip,
                            {
                              backgroundColor:
                                state.pressed || isHovered(state) ? colors.primarySoft : colors.surfaceMuted
                            }
                          ]}
                        >
                          <Ionicons name="open-outline" size={14} color={colors.primary} />
                          <Text variant="small" tone="primary" weight="600" numberOfLines={1} style={styles.linkText}>
                            {linkLabel(link)}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.hint}>
                <Ionicons name="hand-left-outline" size={18} color={colors.textSubtle} />
                <Text variant="small" tone="subtle">
                  {showShortcuts ? t('review.clickToReveal') : t('review.tapToReveal')}
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </Pressable>

      <View style={styles.footer}>
        {revealed ? (
          <>
            <Text variant="small" tone="muted" center>
              {t('review.howWell')}
            </Text>
            <View style={styles.grades}>
              {GRADES.map(({ key, grade: value }, gradeIndex) => (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  onPress={() => grade(value)}
                  style={(state) => [
                    styles.gradeButton,
                    {
                      backgroundColor: gradeColors[key].bg,
                      borderColor: isHovered(state) ? gradeColors[key].fg : 'transparent',
                      transform: [{ scale: state.pressed ? 0.96 : 1 }]
                    }
                  ]}
                >
                  {showShortcuts && (
                    <Text variant="caption" style={[styles.keyBadge, { color: gradeColors[key].fg }]}>
                      {gradeIndex + 1}
                    </Text>
                  )}
                  <Text variant="label" style={{ color: gradeColors[key].fg }}>
                    {t(`review.${key}`)}
                  </Text>
                  <Text variant="caption" style={{ color: gradeColors[key].fg, opacity: 0.8 }}>
                    {t('review.inDays', { count: sm2(card, value).interval })}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <Button title={t('review.tapToReveal')} icon="eye-outline" onPress={reveal} />
        )}
        {showShortcuts && (
          <Text variant="caption" tone="subtle" center>
            {t('review.shortcuts')}
          </Text>
        )}
      </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  streak: { alignSelf: 'center' },
  centered: { justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  progress: { flex: 1 },
  cardArea: { flex: 1, padding: spacing.lg },
  cardAreaDesktop: { justifyContent: 'center' },
  cardDesktop: { flexShrink: 1, minHeight: 380, maxHeight: 620 },
  card: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', minHeight: 40 },
  // Long answers scroll inside the card instead of overflowing it
  cardScroll: { flexGrow: 1, flexShrink: 1 },
  cardBody: { flexGrow: 1, justifyContent: 'center', gap: spacing.lg, paddingVertical: spacing.sm },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: spacing.xl },
  context: { fontStyle: 'italic' },
  links: { gap: spacing.sm, marginTop: spacing.xs },
  linkChips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  linkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    maxWidth: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill
  },
  linkText: { flexShrink: 1 },
  hint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md, minHeight: 110 },
  grades: { flexDirection: 'row', gap: spacing.sm },
  keyBadge: { position: 'absolute', top: 6, right: 8, opacity: 0.6 },
  gradeButton: {
    flex: 1,
    borderWidth: 1.5,
    minHeight: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2
  }
})
