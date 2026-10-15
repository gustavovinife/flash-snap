import { Stack, useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { getDeckReport } from '@flash-snap/shared'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import { EmptyState, LoadingView, ProgressBar, Surface, Text } from '@/components'
import { useDeck } from '@/hooks/useDecks'
import { useLayout } from '@/hooks/useLayout'
import { centered, contentWidth, radius, spacing, useTheme } from '@/theme'

function Tile({ label, value }: { label: string; value: string }): React.JSX.Element {
  const { isDesktop } = useLayout()
  return (
    <Surface style={[styles.tile, isDesktop && styles.tileDesktop]}>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="headline">{value}</Text>
    </Surface>
  )
}

function StatusBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }): React.JSX.Element {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <View style={styles.statusRow}>
      <View style={styles.statusLabel}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text variant="label" style={styles.flex}>
          {label}
        </Text>
        <Text variant="small" tone="muted">
          {count} · {percent}%
        </Text>
      </View>
      <ProgressBar value={percent} color={color} />
    </View>
  )
}

export default function StatsScreen(): React.JSX.Element {
  const { t } = useTranslation()
  const colors = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { deck, isLoading } = useDeck(id)
  const report = useMemo(() => (deck ? getDeckReport(deck.cards) : null), [deck])

  if (isLoading) return <LoadingView />
  if (!deck || !report) return <EmptyState icon="albums-outline" title={t('deck.notFound')} />

  const difficulty = [
    { label: t('stats.easy'), count: report.cardsByDifficulty.easy.length, color: colors.success, bg: colors.successSoft },
    { label: t('stats.medium'), count: report.cardsByDifficulty.medium.length, color: colors.warning, bg: colors.warningSoft },
    { label: t('stats.hard'), count: report.cardsByDifficulty.hard.length, color: colors.danger, bg: colors.dangerSoft }
  ]

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, centered(contentWidth.medium)]}
    >
      <Stack.Screen options={{ title: t('stats.title') }} />
      <Text variant="headline">{deck.name}</Text>

      <View style={styles.grid}>
        <Tile label={t('stats.dueToday')} value={String(report.cardStats.dueToday)} />
        <Tile label={t('stats.dueThisWeek')} value={String(report.cardStats.dueThisWeek)} />
        <Tile label={t('stats.retention')} value={`${report.retentionRate}%`} />
        <Tile label={t('stats.avgInterval')} value={t('stats.days', { count: report.averageInterval })} />
      </View>

      <Surface style={styles.section}>
        <Text variant="title">{t('stats.cardStatus')}</Text>
        <StatusBar label={t('stats.new')} count={report.cardStats.new} total={report.cardStats.total} color={colors.info} />
        <StatusBar label={t('stats.learning')} count={report.cardStats.learning} total={report.cardStats.total} color={colors.warning} />
        <StatusBar label={t('stats.reviewing')} count={report.cardStats.review} total={report.cardStats.total} color={colors.primary} />
        <StatusBar label={t('stats.mastered')} count={report.cardStats.mastered} total={report.cardStats.total} color={colors.success} />
        <Text variant="small" tone="muted">
          {t('stats.masteredExplanation')}
        </Text>
      </Surface>

      <Surface style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="title">{t('stats.difficulty')}</Text>
          <Text variant="small" tone="muted">
            {t('stats.avgEase')} {report.averageEaseFactor}
          </Text>
        </View>
        <View style={styles.difficulty}>
          {difficulty.map((item) => (
            <View key={item.label} style={[styles.difficultyTile, { backgroundColor: item.bg }]}>
              <Text variant="headline" style={{ color: item.color }}>
                {item.count}
              </Text>
              <Text variant="caption" style={{ color: item.color }}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </Surface>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: { flexBasis: '47%', flexGrow: 1, gap: spacing.xs },
  tileDesktop: { flexBasis: '22%' },
  section: { gap: spacing.lg, padding: spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  statusRow: { gap: spacing.sm },
  statusLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  difficulty: { flexDirection: 'row', gap: spacing.sm },
  difficultyTile: { flex: 1, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', gap: 2 }
})
