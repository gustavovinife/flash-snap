import { AI_PRESET_PROMPTS } from '@flash-snap/shared'
import { useTranslation } from 'react-i18next'

interface PromptPillsProps {
  onSelect: (prompt: string) => void
  selectedPrompt: string | null
}

export default function PromptPills({
  onSelect,
  selectedPrompt
}: PromptPillsProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">{t('aiGeneration.presets.title')}</h3>
      <div className="flex flex-wrap gap-2">
        {AI_PRESET_PROMPTS.map((preset) => {
          const isSelected = selectedPrompt === preset.prompt
          return (
            <button
              key={preset.id}
              onClick={() => onSelect(preset.prompt)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all duration-200 ${
                isSelected
                  ? 'bg-purple-100 border-purple-300 text-purple-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
              }`}
            >
              {t(`aiGeneration.presets.${preset.labelKey}`)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
