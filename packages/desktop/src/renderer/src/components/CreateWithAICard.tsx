import { useTranslation } from 'react-i18next'
import { usePostHog } from 'posthog-js/react'
import { Sparkles } from 'lucide-react'

interface CreateWithAICardProps {
  onClick: () => void
}

export default function CreateWithAICard({ onClick }: CreateWithAICardProps): React.JSX.Element {
  const { t } = useTranslation()
  const posthog = usePostHog()

  const handleClick = (): void => {
    posthog.capture('ai_generate_button_clicked')
    onClick()
  }

  return (
    <button
      onClick={handleClick}
      className="w-full p-4 rounded-lg border-2 border-purple-400 bg-white text-purple-600 hover:bg-purple-50 hover:border-purple-500 transition-all duration-300 relative overflow-hidden group"
    >
      {/* Subtle shiny effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

      <div className="flex items-center gap-3 relative z-10">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Sparkles className="h-5 w-5 text-purple-500" />
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-base">{t('aiGeneration.createWithAI')}</h3>
          <p className="text-xs text-purple-400 mt-0.5">
            {t('aiGeneration.createWithAIDescription')}
          </p>
        </div>
      </div>
    </button>
  )
}
