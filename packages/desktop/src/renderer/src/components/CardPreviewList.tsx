import { useTranslation } from 'react-i18next'
import { Layers, Sparkles } from 'lucide-react'

export interface GeneratedCard {
  front: string
  back: string
}

interface CardPreviewListProps {
  cards: GeneratedCard[]
  isLoading: boolean
}

export default function CardPreviewList({
  cards,
  isLoading
}: CardPreviewListProps): React.JSX.Element {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <div className="animate-spin">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-sm">{t('aiGeneration.generating')}</span>
        </div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full bg-gray-100">
          <Layers className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm">{t('aiGeneration.preview.emptyState')}</p>
        <p className="text-gray-400 text-xs mt-1">{t('aiGeneration.preview.emptyStateHint')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">{t('aiGeneration.preview.title')}</h3>
        <span className="text-xs text-gray-500">
          {t('aiGeneration.preview.cardCount', { count: cards.length })}
        </span>
      </div>
      <div className="max-h-80 overflow-y-auto space-y-2 p-3 bg-gray-100 rounded-lg">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors shadow-sm"
          >
            <div className="flex gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-1">{t('deckView.front')}</p>
                <p className="text-sm text-gray-800 truncate">{card.front}</p>
              </div>
              <div className="w-px bg-gray-200" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-1">{t('deckView.back')}</p>
                <p className="text-sm text-gray-600 truncate">{card.back}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
