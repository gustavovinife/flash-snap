import { isTemplateInstalled, type Template, templates } from '@flash-snap/shared'
import { router } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Button, Surface, Text } from '@/components'
import { useDeckLimit } from '@/hooks/useDeckLimit'
import { useDeckMutations, useDecks } from '@/hooks/useDecks'
import { useLayout } from '@/hooks/useLayout'
import { showDialog } from '@/lib/dialogs'
import { centered, contentWidth, radius, spacing, useTheme } from '@/theme'

export default function ExploreScreen(): React.JSX.Element {
  const { t } = useTranslation()
  const colors = useTheme()
  const insets = useSafeAreaInsets()
  const { data: decks = [] } = useDecks()
  const { installTemplate } = useDeckMutations()
  const guardDeckCreation = useDeckLimit()
  const [installingId, setInstallingId] = useState<string | null>(null)
  const { isDesktop } = useLayout()
  const columns = isDesktop ? 2 : 1

  const install = (template: Template): void =>
    guardDeckCreation(() => {
      setInstallingId(template.id)
      installTemplate(template, {
        onSuccess: (deck) =>
          showDialog(t('explore.addedTitle'), t('explore.addedBody', { name: template.name }), [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('explore.openDeck'), onPress: () => router.push(`/deck/${deck.id}`) }
          ]),
        onError: (error) => showDialog(t('common.error'), error.message),
        onSettled: () => setInstallingId(null)
      })
    })

  return (
    <FlatList
      key={`columns-${columns}`}
      data={templates}
      numColumns={columns}
      columnWrapperStyle={columns > 1 ? styles.row : undefined}
      keyExtractor={(template) => template.id}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.list,
        centered(contentWidth.wide),
        isDesktop
          ? { paddingTop: spacing.xxl, paddingHorizontal: spacing.xxl }
          : { paddingTop: insets.top + spacing.lg }
      ]}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text variant="headline">{t('explore.title')}</Text>
          <Text tone="muted">{t('explore.subtitle')}</Text>
          <Surface
            onPress={() => guardDeckCreation(() => router.push('/ai-generate'))}
            style={[styles.aiBanner, { backgroundColor: colors.primary, borderColor: colors.primary }]}
          >
            <View style={styles.aiIcon}>
              <Ionicons name="sparkles" size={22} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text variant="label" tone="inverse" style={styles.name}>
                {t('aiGeneration.title')}
              </Text>
              <Text variant="small" tone="inverse" style={styles.aiBody}>
                {t('aiGeneration.banner')}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={colors.onPrimary} />
          </Surface>
        </View>
      }
      renderItem={({ item }) => {
        const installed = isTemplateInstalled(item, decks)
        return (
          <Surface style={[styles.item, columns > 1 && styles.cell]}>
            <View style={[styles.emoji, { backgroundColor: colors.primarySoft }]}>
              <Text style={styles.emojiText}>{item.emoji ?? '📚'}</Text>
            </View>
            <View style={styles.flex}>
              <Text variant="label" style={styles.name}>
                {item.name}
              </Text>
              <Text variant="small" tone="muted" numberOfLines={2}>
                {item.description}
              </Text>
              <Text variant="caption" tone="subtle" style={styles.count}>
                {t('common.cardCount', { count: item.cards.length })}
              </Text>
            </View>
            <Button
              compact
              title={installed ? t('explore.added') : t('explore.add')}
              icon={installed ? 'checkmark' : 'add'}
              variant={installed ? 'ghost' : 'secondary'}
              disabled={installed || installingId !== null}
              loading={installingId === item.id}
              onPress={() => install(item)}
            />
          </Surface>
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  row: { gap: spacing.md },
  cell: { flex: 1 },
  header: { gap: spacing.xs, marginBottom: spacing.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  emoji: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  emojiText: { fontSize: 24 },
  name: { fontSize: 16 },
  count: { marginTop: spacing.xs },
  aiBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md },
  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  aiBody: { opacity: 0.9 }
})
