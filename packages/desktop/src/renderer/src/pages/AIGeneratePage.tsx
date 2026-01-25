import React, { useState, useCallback ,useEffect} from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Sparkles, AlertCircle, ArrowLeft, Crown } from 'lucide-react'
import { generateDeck, isConfigured, GeneratedCard } from '../services/aiGenerationService'
import { useDecks } from '../hooks/useDecks'
import { useCards } from '../hooks/useCards'
import { useSession } from '../context/SessionContext'
import { useSubscription } from '../hooks/useSubscription'
import PromptPills from '../components/PromptPills'
import CardPreviewList from '../components/CardPreviewList'
import Button from '../ui/common/Button/Button'
import Input from '../ui/common/Input/Input'
import { usePostHog } from 'posthog-js/react'
interface AIGeneratePageState {
  prompt: string
  isGenerating: boolean
  generatedCards: GeneratedCard[]
  generatedDeckName: string
  generatedDeckType: 'language' | 'knowledge'
  error: string | null
  isSaving: boolean
  showUpgradePrompt: boolean
}

const MIN_PROMPT_LENGTH = 3

const AIGeneratePage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useSession()
  const { decks, createDeck, isLoading: decksLoading } = useDecks()
  const { createManyCards } = useCards()
  const { canCreateDeck, isLoading: subscriptionLoading, openCheckout } = useSubscription()
  const posthog = usePostHog()

  const [state, setState] = useState<AIGeneratePageState>({
    prompt: '',
    isGenerating: false,
    generatedCards: [],
    generatedDeckName: '',
    generatedDeckType: 'knowledge',
    error: null,
    isSaving: false,
    showUpgradePrompt: false
  })

  const apiKeyConfigured = isConfigured()
  const isValidPrompt = state.prompt.trim().length >= MIN_PROMPT_LENGTH
  const canGenerate = apiKeyConfigured && isValidPrompt && !state.isGenerating
  const hasGeneratedCards = state.generatedCards.length > 0

  useEffect(() => {
    posthog.capture('page_viewed', { page: 'ai_generate' })
  }, [])

  const handleUpgrade = async (): Promise<void> => {
    try {
      await openCheckout()
    } catch (error) {
      console.error('Failed to open checkout:', error)
    }
  }

  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({
      ...prev,
      prompt: e.target.value,
      error: null
    }))
  }, [])

  const handlePresetSelect = useCallback((prompt: string) => {
    setState((prev) => ({
      ...prev,
      prompt,
      error: null
    }))
  }, [])

  const handleDeckNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({
      ...prev,
      generatedDeckName: e.target.value
    }))
  }, [])

  const handleGenerate = useCallback(async () => {
    posthog.capture('ai_prompt_submitted', { prompt: state.prompt })
    const trimmedPrompt = state.prompt.trim()

    if (!trimmedPrompt) {
      setState((prev) => ({
        ...prev,
        error: t('aiGeneration.errors.emptyPrompt')
      }))
      return
    }

    if (trimmedPrompt.length < MIN_PROMPT_LENGTH) {
      setState((prev) => ({
        ...prev,
        error: t('aiGeneration.errors.invalidPrompt')
      }))
      return
    }

    setState((prev) => ({
      ...prev,
      isGenerating: true,
      error: null,
      generatedCards: [],
      generatedDeckName: '',
      generatedDeckType: 'knowledge'
    }))

    try {
      const result = await generateDeck(trimmedPrompt)
      setState((prev) => ({
        ...prev,
        prompt: '', // Clear prompt after successful generation
        isGenerating: false,
        generatedCards: result.cards,
        generatedDeckName: result.deckName,
        generatedDeckType: result.deckType
      }))
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('aiGeneration.errors.generationFailed')
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        error: errorMessage
      }))
    }
  }, [state.prompt, t])

  const handleSaveDeck = useCallback(async () => {
    if (!user?.id || !hasGeneratedCards) return

    // Check if user can create a new deck (free users limited to 1 deck)
    if (!canCreateDeck(decks.length)) {
      setState((prev) => ({
        ...prev,
        showUpgradePrompt: true
      }))
      return
    }

    const deckName = state.generatedDeckName.trim()
    if (!deckName) {
      setState((prev) => ({
        ...prev,
        error: t('aiGeneration.errors.invalidPrompt')
      }))
      return
    }

    setState((prev) => ({ ...prev, isSaving: true, error: null }))

    try {
      // Create the deck first
      const newDeck = await createDeck.mutateAsync({
        name: deckName,
        type: state.generatedDeckType,
        user_id: user.id
      })

      // Bulk insert all cards
      const cardsToInsert = state.generatedCards.map((card) => ({
        front: card.front,
        back: card.back,
        deck_id: newDeck.id
      }))

      await createManyCards.mutateAsync(cardsToInsert)

      posthog.capture('ai_deck_created', {
        deck_id: newDeck.id,
        deck_name: deckName,
        deck_type: state.generatedDeckType,
        cards_count: state.generatedCards.length
      })

      // Navigate to the new deck
      navigate(`/deck/${newDeck.id}`)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('aiGeneration.errors.saveFailed')
      setState((prev) => ({
        ...prev,
        isSaving: false,
        error: errorMessage
      }))
    }
  }, [
    user?.id,
    hasGeneratedCards,
    state.generatedDeckName,
    state.generatedDeckType,
    state.generatedCards,
    createDeck,
    createManyCards,
    navigate,
    t,
    canCreateDeck,
    decks.length
  ])

  const handleRetry = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  const handleBack = useCallback(() => {
    navigate('/')
  }, [navigate])

  const handleCloseUpgradePrompt = useCallback(() => {
    setState((prev) => ({ ...prev, showUpgradePrompt: false }))
  }, [])

  // Show loading state while checking subscription or decks
  if (subscriptionLoading || decksLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            {t('aiGeneration.title')}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('aiGeneration.description')}</p>
        </div>
      </div>

      {/* Upgrade Prompt Modal */}
      {state.showUpgradePrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {t('aiGeneration.deckLimitReached.title')}
              </h2>
              <p className="text-gray-600 mb-6">{t('aiGeneration.deckLimitReached.description')}</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleCloseUpgradePrompt}>
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUpgrade}
                  leftIcon={<Crown className="h-4 w-4" />}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                >
                  {t('aiGeneration.deckLimitReached.upgradeButton')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Key Missing Error */}
      {!apiKeyConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-medium">
              {t('aiGeneration.errors.apiKeyMissing')}
            </p>
          </div>
        </div>
      )}

      {/* Preset Prompts */}
      <PromptPills onSelect={handlePresetSelect} selectedPrompt={state.prompt || null} />

      {/* Custom Prompt Input */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              value={state.prompt}
              onChange={handlePromptChange}
              placeholder={
                hasGeneratedCards
                  ? t('aiGeneration.modifyPromptPlaceholder')
                  : t('aiGeneration.promptPlaceholder')
              }
              disabled={!apiKeyConfigured || state.isGenerating}
            />
          </div>
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={!canGenerate}
            isLoading={state.isGenerating}
            leftIcon={!state.isGenerating ? <Sparkles className="h-4 w-4" /> : undefined}
          >
            {state.isGenerating ? t('aiGeneration.generating') : t('aiGeneration.generateButton')}
          </Button>
        </div>
        {state.prompt.length > 0 && state.prompt.trim().length < MIN_PROMPT_LENGTH && (
          <p className="text-xs text-gray-500">{t('aiGeneration.minCharacters')}</p>
        )}
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{state.error}</p>
          </div>
          <Button variant="outline" size="xs" onClick={handleRetry}>
            {t('aiGeneration.retry')}
          </Button>
        </div>
      )}

      {/* Card Preview */}
      <CardPreviewList cards={state.generatedCards} isLoading={state.isGenerating} />

      {/* Save Section */}
      {hasGeneratedCards && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('aiGeneration.deckName')}
            </label>
            <Input
              value={state.generatedDeckName}
              onChange={handleDeckNameChange}
              placeholder={t('aiGeneration.deckNamePlaceholder')}
              disabled={state.isSaving}
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={handleSaveDeck}
              disabled={!state.generatedDeckName.trim() || state.isSaving}
              isLoading={state.isSaving}
            >
              {state.isSaving ? t('aiGeneration.saving') : t('aiGeneration.saveDeck')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIGeneratePage
