import { Ionicons } from '@expo/vector-icons'
import { type Card, type Deck, type DueCard, getDueCards, linkLabel, sm2 } from '@flash-snap/shared'
import * as Haptics from 'expo-haptics'
import { router, useLocalSearchParams } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, EmptyState, IconButton, LoadingView, ProgressBar, Text } from '@/components'
import { useDeckMutations, useDecks } from '@/hooks/useDecks'
import { useReviewSounds } from '@/hooks/useReviewSounds'
import { showDialog } from '@/lib/dialogs'
import { speak } from '@/lib/speech'
import { radius, spacing, useTheme } from '@/theme'

type GradeKey = 'again' | 'hard' | 'good' | 'easy'
// SM-2 recall grades (0-5); below 3 counts as forgotten
type Grade = 1 | 3 | 4 | 5

const GRADES: { key: GradeKey; grade: Grade }[] = [
  { key: 'again', grade: 1 },
  { key: 'hard', grade: 3 },
  { key: 'good', grade: 4 },
  { key: 'easy', grade: 5 }
]

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

  // The queue is fixed when the session starts, so graded cards don't reshuffle it
  const [queue, setQueue] = useState<DueCard<Card, Deck>[] | null>(null)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const flip = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (decks && queue === null) setQueue(getDueCards(decks, id === 'all' ? undefined : id))
  }, [decks, id, queue])

  const gradeColors: Record<GradeKey, { bg: string; fg: string }> = {
    again: { bg: colors.dangerSoft, fg: colors.danger },
    hard: { bg: colors.warningSoft, fg: colors.warning },
    good: { bg: colors.primarySoft, fg: colors.primary },
    easy: { bg: colors.successSoft, fg: colors.success }
  }

  if (isLoading || queue === null) return <LoadingView />

  const close = (): void => router.back()
  const current = queue[index]
  const finished = index >= queue.length

  const reveal = (): void => {
    if (revealed) return
    Animated.timing(flip, { toValue: 1, duration: 140, useNativeDriver: true }).start(() => {
      setRevealed(true)
      Animated.timing(flip, { toValue: 0, duration: 140, useNativeDriver: true }).start()
    })
  }

  const grade = (value: Grade): void => {
    if (!current) return
    haptic(value)
    playGradeSound(value)
    reviewCard.mutate(
      { card: current.card, grade: value },
      { onError: () => showDialog(t('common.error'), t('review.saveError')) }
    )
    setRevealed(false)
    setIndex((i) => i + 1)
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
      <View style={styles.topBar}>
        <IconButton icon="close" label={t('common.cancel')} onPress={close} />
        <View style={styles.progress}>
          <ProgressBar value={(index / queue.length) * 100} />
        </View>
        <Text variant="label" tone="muted">
          {t('review.progress', { current: index + 1, total: queue.length })}
        </Text>
      </View>

      <Pressable style={styles.cardArea} onPress={reveal} accessibilityRole="button" accessibilityHint={t('review.tapToReveal')}>
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border, transform: [{ perspective: 1000 }, { rotateY: rotate }] }
          ]}
        >
          <View style={styles.cardHeader}>
            <Text variant="caption" tone="subtle" numberOfLines={1} style={styles.flex}>
              {deck.name.toUpperCase()}
            </Text>
            {deck.type === 'language' && (
              <IconButton icon="volume-high" label={t('review.playPronunciation')} onPress={() => speak(card.front)} />
            )}
          </View>

          <View style={styles.cardBody}>
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
                          onPress={() => void WebBrowser.openBrowserAsync(link.url)}
                          style={({ pressed }) => [
                            styles.linkChip,
                            { backgroundColor: pressed ? colors.primarySoft : colors.surfaceMuted }
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
                  {t('review.tapToReveal')}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </Pressable>

      <View style={styles.footer}>
        {revealed ? (
          <>
            <Text variant="small" tone="muted" center>
              {t('review.howWell')}
            </Text>
            <View style={styles.grades}>
              {GRADES.map(({ key, grade: value }) => (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  onPress={() => grade(value)}
                  style={({ pressed }) => [
                    styles.gradeButton,
                    { backgroundColor: gradeColors[key].bg, transform: [{ scale: pressed ? 0.96 : 1 }] }
                  ]}
                >
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
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  card: {
    flex: 1,
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
  cardBody: { flex: 1, justifyContent: 'center', gap: spacing.lg },
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
  gradeButton: {
    flex: 1,
    minHeight: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2
  }
})
