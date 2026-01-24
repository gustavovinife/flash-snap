import { useTranslation } from 'react-i18next'

export interface PresetPrompt {
  id: string
  labelKey: string
  prompt: string
  category: 'language' | 'knowledge'
}

interface PromptPillsProps {
  onSelect: (prompt: string) => void
  selectedPrompt: string | null
}

const PRESET_PROMPTS: PresetPrompt[] = [
  {
    id: 'js-programming',
    labelKey: 'aiGeneration.presets.jsProgram',
    prompt:
      'Generate 30 flashcards about JavaScript programming fundamentals including variables, functions, arrays, objects, and ES6 features',
    category: 'knowledge'
  },
  {
    id: 'english-travel',
    labelKey: 'aiGeneration.presets.englishTravel',
    prompt:
      'Generate 30 flashcards with essential English phrases and vocabulary for traveling, including airport, hotel, restaurant, and directions',
    category: 'language'
  },
  {
    id: 'english-interviews',
    labelKey: 'aiGeneration.presets.englishInterviews',
    prompt:
      'Generate 30 flashcards with professional English vocabulary and phrases commonly used in job interviews',
    category: 'language'
  },
  {
    id: 'spanish-basics',
    labelKey: 'aiGeneration.presets.spanishBasics',
    prompt: 'Generate 30 flashcards with basic Spanish vocabulary and common phrases for beginners',
    category: 'language'
  },
  {
    id: 'python-programming',
    labelKey: 'aiGeneration.presets.pythonProgram',
    prompt:
      'Generate 30 flashcards about Python programming including syntax, data structures, and common patterns',
    category: 'knowledge'
  }
]

export default function PromptPills({
  onSelect,
  selectedPrompt
}: PromptPillsProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">{t('aiGeneration.presets.title')}</h3>
      <div className="flex flex-wrap gap-2">
        {PRESET_PROMPTS.map((preset) => {
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
              {t(preset.labelKey)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { PRESET_PROMPTS }
